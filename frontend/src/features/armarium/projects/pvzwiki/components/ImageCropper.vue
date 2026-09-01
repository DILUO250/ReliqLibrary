<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// 固定比例的图片裁剪器：拖动裁剪框移动、拖动右下角手柄等比缩放，
// 输出为 outW x outH 的 dataUrl。用于植物卡片图生成（240x152）。
const props = withDefaults(
  defineProps<{
    src: string
    aspect?: number
    outWidth?: number
    outHeight?: number
  }>(),
  {
    aspect: 240 / 152,
    outWidth: 240,
    outHeight: 152,
  },
)

const containerRef = ref<HTMLDivElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const imgLoaded = ref(false)

// 图片以 object-fit:contain 呈现的显示矩形（相对容器）
const disp = ref({ x: 0, y: 0, w: 0, h: 0 })
// 裁剪框（显示坐标；h 由 w 与比例决定）
const box = ref({ x: 0, y: 0, w: 0 })

const boxH = computed(() => box.value.w / props.aspect)
const MIN_BOX_W = 48

type DragMode = 'idle' | 'move' | 'resize'
let mode: DragMode = 'idle'
let startPointer = { x: 0, y: 0 }
let startBox = { x: 0, y: 0, w: 0 }

function clampBox(): void {
  const b = box.value
  const d = disp.value
  b.w = Math.min(Math.max(b.w, MIN_BOX_W), d.w)
  const h = b.w / props.aspect
  b.x = Math.min(Math.max(b.x, d.x), d.x + d.w - b.w)
  b.y = Math.min(Math.max(b.y, d.y), d.y + d.h - h)
}

function layoutImage(): void {
  const img = imgRef.value
  const container = containerRef.value
  if (!img || !container || !img.naturalWidth) return
  const cw = container.clientWidth
  const ch = container.clientHeight
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  disp.value = { x: (cw - w) / 2, y: (ch - h) / 2, w, h }
  // 重置为最大内接框（居中）
  let bw: number
  if (w / h > props.aspect) {
    const bh = h
    bw = bh * props.aspect
  } else {
    bw = w
  }
  box.value = {
    x: disp.value.x + (disp.value.w - bw) / 2,
    y: disp.value.y + (disp.value.h - bw / props.aspect) / 2,
    w: bw,
  }
  clampBox()
}

function onImageLoad(): void {
  imgLoaded.value = true
  layoutImage()
}

watch(
  () => props.src,
  () => {
    imgLoaded.value = false
  },
)

function localPoint(e: PointerEvent | MouseEvent): { x: number; y: number } {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onWindowPointerMove(e: PointerEvent): void {
  if (mode === 'idle') return
  const point = localPoint(e)
  const dx = point.x - startPointer.x
  const dy = point.y - startPointer.y
  const b = box.value
  const d = disp.value
  if (mode === 'move') {
    b.x = startBox.x + dx
    b.y = startBox.y + dy
    clampBox()
  } else if (mode === 'resize') {
    // 等比缩放：以横向、纵向两个方向推算宽度，取较大的一个
    const wByX = point.x - b.x
    const wByY = (point.y - b.y) * props.aspect
    let w = Math.max(wByX, wByY)
    // 边界约束：不超过显示区右/下边界
    w = Math.min(w, d.x + d.w - b.x, (d.y + d.h - b.y) * props.aspect)
    b.w = Math.max(MIN_BOX_W, w)
    clampBox()
  }
}

function onWindowPointerUp(): void {
  if (mode === 'idle') return
  mode = 'idle'
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerUp)
}

// 拖拽入口绑定在裁剪框/手柄自身；move/up 挂到 window，确保移出元素后仍能跟踪
function beginDrag(e: PointerEvent, dragMode: DragMode): void {
  if (!imgLoaded.value) return
  mode = dragMode
  startPointer = localPoint(e)
  startBox = { ...box.value }
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerUp)
  e.preventDefault()
}

function onBoxPointerDown(e: PointerEvent): void {
  beginDrag(e, 'move')
}

function onHandlePointerDown(e: PointerEvent): void {
  e.stopPropagation()
  beginDrag(e, 'resize')
}

onBeforeUnmount(() => {
  onWindowPointerUp()
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const container = containerRef.value
  if (container && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (imgLoaded.value) layoutImage()
    })
    resizeObserver.observe(container)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

// 输出 outWidth x outHeight 的裁剪结果 dataUrl；未加载完成时返回 null
function crop(): Promise<string | null> {
  const img = imgRef.value
  if (!img || !img.naturalWidth || !imgLoaded.value) return Promise.resolve(null)
  const d = disp.value
  const b = box.value
  const scale = img.naturalWidth / d.w
  const sx = (b.x - d.x) * scale
  const sy = (b.y - d.y) * scale
  const sw = b.w * scale
  const sh = (b.w / props.aspect) * scale
  const canvas = document.createElement('canvas')
  canvas.width = props.outWidth
  canvas.height = props.outHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, props.outWidth, props.outHeight)
  return Promise.resolve(canvas.toDataURL('image/png'))
}

defineExpose({ crop })
</script>

<template>
  <div ref="containerRef" class="cropper">
    <img
      ref="imgRef"
      class="cropper__img"
      :src="src"
      alt=""
      draggable="false"
      :style="{ left: `${disp.x}px`, top: `${disp.y}px`, width: `${disp.w}px`, height: `${disp.h}px` }"
      @load="onImageLoad"
    />
    <template v-if="imgLoaded">
      <div
        class="cropper__dim cropper__dim--left"
        :style="{ left: 0, top: `${disp.y}px`, width: `${Math.max(box.x - disp.x, 0)}px`, height: `${disp.h}px` }"
      />
      <div
        class="cropper__dim cropper__dim--right"
        :style="{ left: `${box.x + box.w}px`, top: `${disp.y}px`, width: `${Math.max(disp.x + disp.w - box.x - box.w, 0)}px`, height: `${disp.h}px` }"
      />
      <div
        class="cropper__dim cropper__dim--top"
        :style="{ left: `${box.x}px`, top: `${disp.y}px`, width: `${box.w}px`, height: `${Math.max(box.y - disp.y, 0)}px` }"
      />
      <div
        class="cropper__dim cropper__dim--bottom"
        :style="{ left: `${box.x}px`, top: `${box.y + boxH}px`, width: `${box.w}px`, height: `${Math.max(disp.y + disp.h - box.y - boxH, 0)}px` }"
      />
      <div
        class="cropper__box"
        :style="{ left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${boxH}px` }"
        @pointerdown="onBoxPointerDown"
      >
        <span class="cropper__handle" @pointerdown="onHandlePointerDown" />
      </div>
    </template>
    <span v-else class="cropper__loading">图片加载中…</span>
  </div>
</template>

<style scoped>
.cropper {
  position: relative;
  width: 100%;
  height: 300px;
  background:
    conic-gradient(#d8cfb8 0 25%, #efe9d6 0 50%, #d8cfb8 0 75%, #efe9d6 0) 0 0 / 16px 16px;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

[data-theme='dark'] .cropper {
  background:
    conic-gradient(#2a241a 0 25%, #211c16 0 50%, #2a241a 0 75%, #211c16 0) 0 0 / 16px 16px;
  border-color: #856747;
}

.cropper__img {
  position: absolute;
  object-fit: fill;
  pointer-events: none;
  max-width: none;
}

.cropper__dim {
  position: absolute;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.cropper__box {
  position: absolute;
  border: 2px solid #4f8a45;
  outline: 1px solid #ffffffb0;
  cursor: move;
  box-sizing: border-box;
  touch-action: none;
}

.cropper__handle {
  position: absolute;
  right: -7px;
  bottom: -7px;
  width: 14px;
  height: 14px;
  background: #4f8a45;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: nwse-resize;
  box-shadow: 0 1px 3px #00000066;
  touch-action: none;
}

.cropper__loading {
  position: absolute;
  inset: 0;
  color: #6d5a45;
  display: grid;
  place-items: center;
  font-size: 0.9rem;
}

[data-theme='dark'] .cropper__loading {
  color: #d4c19c;
}
</style>
