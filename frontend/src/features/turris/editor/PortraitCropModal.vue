<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/app/services/api'
import Modal from './Modal.vue'

const props = defineProps<{ imageUrl: string }>()
const emit = defineEmits<{ (e: 'confirm', previewUrl: string): void; (e: 'cancel'): void }>()

const RATIO = 3 / 4 // width : height
const MAX_AREA = { w: 460, h: 580 }
const MIN_W = 140

const status = ref<'ready' | 'busy'>('ready')
const imgEl = ref<HTMLImageElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)

const natW = ref(0)
const natH = ref(0)
const scale = ref(1)
const dispW = ref(0)
const dispH = ref(0)

// crop rect in NATURAL pixel coordinates
const rx = ref(0)
const ry = ref(0)
const rw = ref(0)
const rh = (): number => rw.value / RATIO

const CORNERS = ['nw', 'ne', 'sw', 'se'] as const
type Corner = (typeof CORNERS)[number]

let drag: null | {
  kind: 'move' | 'resize'
  corner: Corner
  startClientX: number
  startClientY: number
  box: { x: number; y: number; w: number }
  rect: DOMRect
} = null

onMounted(() => {
  if (imgEl.value && imgEl.value.complete) setup()
})

function setup(): void {
  const img = imgEl.value
  if (!img) return
  natW.value = img.naturalWidth
  natH.value = img.naturalHeight
  scale.value = Math.min(MAX_AREA.w / natW.value, MAX_AREA.h / natH.value)
  dispW.value = Math.round(natW.value * scale.value)
  dispH.value = Math.round(natH.value * scale.value)

  const maxW = Math.min(natW.value, natH.value * RATIO)
  let w = Math.min(maxW * 0.6, 700)
  w = Math.max(Math.min(MIN_W, maxW), w)
  rw.value = Math.round(w)
  rx.value = Math.round((natW.value - rw.value) / 2)
  ry.value = Math.round((natH.value - rh()) / 2)
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function start(e: MouseEvent, kind: 'move' | 'resize', corner: Corner = 'se'): void {
  const stage = stageEl.value
  if (!stage) return
  e.preventDefault()
  e.stopPropagation()
  drag = {
    kind,
    corner,
    startClientX: e.clientX,
    startClientY: e.clientY,
    box: { x: rx.value, y: ry.value, w: rw.value },
    rect: stage.getBoundingClientRect(),
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function onMove(e: MouseEvent): void {
  if (!drag) return
  const dx = (e.clientX - drag.startClientX) / scale.value
  const dy = (e.clientY - drag.startClientY) / scale.value

  if (drag.kind === 'move') {
    rx.value = clamp(drag.box.x + dx, 0, natW.value - rw.value)
    ry.value = clamp(drag.box.y + dy, 0, natH.value - rh())
    return
  }

  const bx = drag.box.x
  const by = drag.box.y
  const bw = drag.box.w
  const bh = bw / RATIO

  let anchorX: number
  let anchorY: number
  let anchorLeft: boolean
  let anchorTop: boolean

  if (drag.corner === 'se') {
    anchorX = bx
    anchorY = by
    anchorLeft = true
    anchorTop = true
  } else if (drag.corner === 'ne') {
    anchorX = bx
    anchorY = by + bh
    anchorLeft = true
    anchorTop = false
  } else if (drag.corner === 'sw') {
    anchorX = bx + bw
    anchorY = by
    anchorLeft = false
    anchorTop = true
  } else {
    anchorX = bx + bw
    anchorY = by + bh
    anchorLeft = false
    anchorTop = false
  }

  // cursor position in natural image coordinates
  const natX = (e.clientX - drag!.rect.left) / scale.value
  const natY = (e.clientY - drag!.rect.top) / scale.value

  const wByX = Math.abs(natX - anchorX)
  const hByY = Math.abs(natY - anchorY)
  let newW = Math.max(wByX, hByY * RATIO)

  const horizMax = anchorLeft ? natW.value - anchorX : anchorX
  const vertMaxH = anchorTop ? natH.value - anchorY : anchorY
  const vertMaxW = vertMaxH * RATIO
  const maxW = Math.max(MIN_W, Math.min(horizMax, vertMaxW))
  newW = clamp(newW, Math.min(MIN_W, maxW), maxW)

  rw.value = Math.round(newW)
  const newH = rh()
  rx.value = anchorLeft ? Math.round(anchorX) : Math.round(anchorX - rw.value)
  ry.value = anchorTop ? Math.round(anchorY) : Math.round(anchorY - newH)
}

function onUp(): void {
  drag = null
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
}

async function confirm(): Promise<void> {
  status.value = 'busy'
  try {
    const outW = 720
    const outH = Math.round(outW / RATIO)
    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(imgEl.value!, rx.value, ry.value, rw.value, rh(), 0, 0, outW, outH)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('裁剪失败')
    const file = new File([blob], `portrait-preview-${Date.now()}.png`, { type: 'image/png' })
    const res = await api.uploadImage(file, 'preview')
    emit('confirm', res.url)
  } catch (e) {
    status.value = 'ready'
    window.alert(`裁剪失败：${e instanceof Error ? e.message : String(e)}`)
  }
}
</script>

<template>
  <Modal title="裁剪预览立绘" @close="emit('cancel')">
    <p class="hint">拖动虚线框移动位置，拖动四个角缩放（始终保持 3 : 4 比例）。确认后生成「预览立绘」。</p>
    <div
      ref="stageEl"
      class="stage"
      :style="{ width: dispW + 'px', height: dispH + 'px' }"
      @mousedown="start($event, 'move')"
    >
      <img ref="imgEl" :src="imageUrl" :width="dispW" :height="dispH" @load="setup" alt="立绘原图" />
      <div
        class="crop"
        :style="{
          left: rx * scale + 'px',
          top: ry * scale + 'px',
          width: rw * scale + 'px',
          height: rh() * scale + 'px',
        }"
      >
        <span
          v-for="c in CORNERS"
          :key="c"
          class="handle"
          :class="'handle--' + c"
          @mousedown.stop="start($event, 'resize', c)"
        ></span>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('cancel')">取消</button>
      <button type="button" class="btn btn--primary" :disabled="status !== 'ready'" @click="confirm">
        {{ status === 'busy' ? '处理中…' : '确认裁剪' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.hint {
  font-size: 12px;
  color: var(--color-ink-faint);
  margin: 0 0 14px;
}
.stage {
  position: relative;
  margin: 0 auto;
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  user-select: none;
  cursor: crosshair;
}
.stage img {
  display: block;
  pointer-events: none;
}
.crop {
  position: absolute;
  cursor: move;
  outline: 2px dashed var(--accent);
  box-shadow: 0 0 0 9999px rgba(16, 13, 9, 0.55);
}
.handle {
  position: absolute;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border: 2px solid #1b1408;
  border-radius: 3px;
  cursor: nwse-resize;
}
.handle--nw {
  top: -8px;
  left: -8px;
  cursor: nwse-resize;
}
.handle--ne {
  top: -8px;
  right: -8px;
  cursor: nesw-resize;
}
.handle--sw {
  bottom: -8px;
  left: -8px;
  cursor: nesw-resize;
}
.handle--se {
  bottom: -8px;
  right: -8px;
  cursor: nwse-resize;
}
.btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: 14px;
  cursor: pointer;
}
.btn:hover {
  border-color: var(--accent);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn--primary {
  background: var(--accent);
  color: #1b1408;
  border-color: var(--accent);
  font-weight: 600;
}
.btn--ghost {
  background: transparent;
}
</style>
