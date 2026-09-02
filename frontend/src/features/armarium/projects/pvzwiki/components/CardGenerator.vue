<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import ImageCropper from '@pvzwiki/components/ImageCropper.vue'
import { uploadCard } from '@pvzwiki/store/plantImage'
import { showToast } from '@/app/stores/toast'

// 植物卡片图生成器：
//   1. 以 220x220 正方形裁剪植物高清图 → 缩略图
//   2. 选择/上传背景图，同样 220x220 正方形裁剪 → 卡片背景
//   3. 选取 12px 内嵌边框颜色 → 合成 240x152 卡片并保存
const props = defineProps<{
  codename: string
  /** 默认源图（当前立绘），可为空 */
  defaultSrc?: string
}>()

const emit = defineEmits<{
  saved: []
}>()

const CARD_W = 240
const CARD_H = 152
const BORDER_W = 12
const EDGE_W = 2
// 裁剪输出尺寸：正方形，用于植物缩略图与背景图
const CROP_W = 220
const CROP_H = 220
// 缩略图在卡片内的最大卡槽尺寸：比卡片一半再宽一些，让植物更饱满
const THUMB_SLOT_W = CARD_W * 0.62
const THUMB_SLOT_H = CARD_H

const step = ref<1 | 2 | 3>(1)
const plantSrc = ref('')
const bgSrc = ref('')
const plantCrop = ref<string | null>(null)
const bgCrop = ref<string | null>(null)
const borderColor = ref('#4b321f')
const busy = ref(false)
const error = ref('')

const plantCropperRef = ref<InstanceType<typeof ImageCropper> | null>(null)
const bgCropperRef = ref<InstanceType<typeof ImageCropper> | null>(null)

const plantFileInput = ref<HTMLInputElement | null>(null)
const bgFileInput = ref<HTMLInputElement | null>(null)

const BORDER_PRESETS = ['#4b321f', '#281a11', '#315a2c', '#b07838', '#9a7a4c', '#e1a83a', '#f2e7c4', '#2c2c2c']

const canFinish = computed(() => !!plantCrop.value && !!bgCrop.value && !busy.value)

watch(
  () => props.defaultSrc,
  (src) => {
    plantSrc.value = src ?? ''
  },
  { immediate: true },
)

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function triggerPlantUpload(): void {
  plantFileInput.value?.click()
}

function triggerBgUpload(): void {
  bgFileInput.value?.click()
}

async function onPlantFileChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    plantSrc.value = await readFileAsDataURL(file)
    plantCrop.value = null
    step.value = 1
  } finally {
    input.value = ''
  }
}

async function onBgFileChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    bgSrc.value = await readFileAsDataURL(file)
    bgCrop.value = null
    step.value = 2
  } finally {
    input.value = ''
  }
}

function useAsPlantSource(src: string): void {
  plantSrc.value = src
  plantCrop.value = null
  step.value = 1
}

async function confirmPlantCrop(): Promise<void> {
  error.value = ''
  const data = await plantCropperRef.value?.crop()
  if (!data) {
    error.value = '源图尚未加载完成，请稍候'
    return
  }
  plantCrop.value = data
  if (!bgSrc.value) {
    // 默认带入植物所在世界的背景由父级画廊选择；这里等待用户在第二步选择
    step.value = 2
    return
  }
  step.value = 2
}

async function confirmBgCrop(): Promise<void> {
  error.value = ''
  const data = await bgCropperRef.value?.crop()
  if (!data) {
    error.value = '背景图尚未加载完成，请稍候'
    return
  }
  bgCrop.value = data
  step.value = 3
}

function goBack(): void {
  error.value = ''
  step.value = step.value === 3 ? 2 : 1
}

// 合成卡片：背景铺满 → 植物缩略图放大容器并平移到偏左区域 → 12px 内嵌边框最上层
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const previewVersion = ref(0)

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

watch([plantCrop, bgCrop, borderColor, previewVersion], async () => {
  if (!plantCrop.value || !bgCrop.value) return
  // 步骤 3 才会渲染 canvas；默认 'pre' flush 的 watcher 可能在 DOM 更新前触发，
  // 因此等一次 nextTick 确保 canvas 已挂载。
  await nextTick()
  const canvas = previewCanvasRef.value
  if (!canvas) return
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  try {
    const [bgImg, plantImg] = await Promise.all([loadImage(bgCrop.value), loadImage(plantCrop.value)])
    ctx.clearRect(0, 0, CARD_W, CARD_H)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bgImg, 0, 0, CARD_W, CARD_H)
    // 植物缩略图：将裁剪后的缩略图等比缩小，完整放入左侧卡槽，
    // 并整体放置在中间偏左的位置；不再裁剪，保证用户裁剪的内容完整可见。
    const srcRatio = plantImg.width / plantImg.height
    let dw = THUMB_SLOT_W
    let dh = dw / srcRatio
    if (dh > THUMB_SLOT_H) {
      dh = THUMB_SLOT_H
      dw = dh * srcRatio
    }
    const dx = Math.round(CARD_W * 0.35 - dw / 2)
    const dy = Math.round((CARD_H - dh) / 2)
    ctx.drawImage(plantImg, 0, 0, plantImg.width, plantImg.height, dx, dy, dw, dh)
    // 边框：12px 主色，外缘与内缘各 2px 黑色描边
    const mainInset = EDGE_W + BORDER_W / 2
    const innerInset = EDGE_W + BORDER_W + EDGE_W / 2
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = EDGE_W
    ctx.strokeRect(EDGE_W / 2, EDGE_W / 2, CARD_W - EDGE_W, CARD_H - EDGE_W)
    ctx.lineWidth = BORDER_W
    ctx.strokeStyle = borderColor.value
    ctx.strokeRect(mainInset, mainInset, CARD_W - 2 * mainInset, CARD_H - 2 * mainInset)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = EDGE_W
    ctx.strokeRect(innerInset, innerInset, CARD_W - 2 * innerInset, CARD_H - 2 * innerInset)
  } catch {
    error.value = '预览合成失败，请重试'
  }
})

watch(step, (s) => {
  if (s === 3) previewVersion.value++
})

async function saveCard(): Promise<void> {
  const canvas = previewCanvasRef.value
  if (!canvas || !canFinish.value) return
  busy.value = true
  error.value = ''
  try {
    await uploadCard(props.codename, canvas.toDataURL('image/png'))
    showToast('卡片图已生成')
    window.setTimeout(() => window.location.reload(), 900)
    emit('saved')
  } catch {
    error.value = '卡片图保存失败，请重试'
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => {
  // no persistent listeners
})

interface BgItem {
  name: string
  url: string
}

const backgrounds = ref<BgItem[]>([])

async function loadBackgrounds(): Promise<void> {
  try {
    const res = await fetch('/api/pvz/backgrounds')
    backgrounds.value = res.ok ? await res.json() : []
  } catch {
    backgrounds.value = []
  }
}

function onStepEnter(): void {
  if (step.value === 2 && backgrounds.value.length === 0) void loadBackgrounds()
}

watch(step, onStepEnter, { immediate: true })

function pickBgFromLibrary(url: string): void {
  bgSrc.value = url
  bgCrop.value = null
}
</script>

<template>
  <div class="cardgen">
    <ol class="cardgen__steps">
      <li :class="{ active: step === 1, done: !!plantCrop }" @click="step = 1">① 裁剪植物</li>
      <li :class="{ active: step === 2, done: !!bgCrop }" @click="bgCrop ? (step = 2) : null">② 裁剪背景</li>
      <li :class="{ active: step === 3 }" @click="plantCrop && bgCrop ? (step = 3) : null">③ 边框与生成</li>
    </ol>

    <div v-if="step === 1" class="cardgen__step-body">
      <ImageCropper ref="plantCropperRef" :src="plantSrc" :aspect="1" :out-width="CROP_W" :out-height="CROP_H" />
      <div class="cardgen__actions">
        <button type="button" class="image-editor-btn image-editor-btn--ghost" :disabled="!plantSrc" @click="triggerPlantUpload">
          上传新源图
        </button>
        <input ref="plantFileInput" type="file" accept="image/png,image/jpeg,image/webp" class="cardgen__file" @change="onPlantFileChange" />
        <button type="button" class="image-editor-btn image-editor-btn--primary" :disabled="!plantSrc" @click="confirmPlantCrop">
          下一步：裁剪背景
        </button>
      </div>
      <p v-if="!plantSrc" class="cardgen__hint">当前植物还没有立绘，请先上传一张作为裁剪源。</p>
    </div>

    <div v-else-if="step === 2" class="cardgen__step-body">
      <div class="cardgen__bg-picker">
        <ImageCropper ref="bgCropperRef" :src="bgSrc" :aspect="1" :out-width="CROP_W" :out-height="CROP_H" />
        <div class="cardgen__gallery">
          <button
            v-for="item in backgrounds"
            :key="item.url"
            type="button"
            class="cardgen__gallery-item"
            :class="{ active: item.url === bgSrc }"
            :title="item.name"
            @click="pickBgFromLibrary(item.url)"
          >
            <img :src="item.url" :alt="item.name" loading="lazy" />
          </button>
          <p v-if="!backgrounds.length" class="cardgen__hint">背景库为空，可直接上传背景图。</p>
        </div>
      </div>
      <div class="cardgen__actions">
        <button type="button" class="image-editor-btn image-editor-btn--ghost" @click="triggerBgUpload">上传背景图</button>
        <input ref="bgFileInput" type="file" accept="image/png,image/jpeg,image/webp" class="cardgen__file" @change="onBgFileChange" />
        <button type="button" class="image-editor-btn image-editor-btn--ghost" @click="goBack">上一步</button>
        <button type="button" class="image-editor-btn image-editor-btn--primary" :disabled="!bgSrc" @click="confirmBgCrop">
          下一步：边框与生成
        </button>
      </div>
    </div>

    <div v-else class="cardgen__step-body cardgen__step-body--compose">
      <div class="cardgen__preview-wrap">
        <canvas ref="previewCanvasRef" class="cardgen__preview" width="240" height="152"></canvas>
        <span class="cardgen__preview-label">240 × 152</span>
      </div>
      <div class="cardgen__side">
        <span class="cardgen__side-label">边框颜色（12px 内嵌）</span>
        <div class="cardgen__colors">
          <button
            v-for="c in BORDER_PRESETS"
            :key="c"
            type="button"
            class="cardgen__color"
            :class="{ active: borderColor === c }"
            :style="{ background: c }"
            :title="c"
            @click="borderColor = c"
          />
          <label class="cardgen__color cardgen__color--custom" title="自定义颜色">
            <input v-model="borderColor" type="color" />
          </label>
        </div>
        <div class="cardgen__actions cardgen__actions--column">
          <button type="button" class="image-editor-btn image-editor-btn--ghost" @click="goBack">上一步</button>
          <button type="button" class="image-editor-btn image-editor-btn--primary" :disabled="!canFinish" @click="saveCard">
            {{ busy ? '生成中…' : '生成并保存卡片' }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="error" class="cardgen__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.cardgen {
  gap: 0.7rem;
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 100%;
}

.cardgen__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.4rem;
  flex-wrap: wrap;
  display: flex;
}

.cardgen__steps li {
  color: #6d5a45;
  background: #fff9e3;
  border: 2px solid #9a7a4c;
  border-radius: 999px;
  cursor: pointer;
  padding: 0.25rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  user-select: none;
}

.cardgen__steps li.active {
  color: #fff;
  background: #4f8a45;
  border-color: #315a2c;
}

.cardgen__steps li.done:not(.active) {
  border-color: #4f8a45;
  color: #315a2c;
}

.cardgen__step-body {
  gap: 0.6rem;
  display: grid;
}

.cardgen__actions {
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  display: flex;
}

.cardgen__actions--column {
  flex-direction: column;
  align-items: stretch;
}

.cardgen__file {
  display: none;
}

.cardgen__hint {
  color: #6d5a45;
  margin: 0;
  font-size: 0.88rem;
}

.cardgen__bg-picker {
  gap: 0.6rem;
  display: grid;
}

.cardgen__gallery {
  gap: 0.4rem;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  max-height: 150px;
  padding: 0.4rem;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  background: #fff9e3;
  overflow-y: auto;
  display: grid;
}

[data-theme='dark'] .cardgen__gallery {
  background: #211c16;
  border-color: #856747;
}

.cardgen__gallery-item {
  position: relative;
  aspect-ratio: 16 / 9;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  background: #ffffff6b;
  transition: border-color 0.12s, transform 0.12s;
}

.cardgen__gallery-item img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.cardgen__gallery-item:hover {
  transform: scale(1.03);
  border-color: #4f8a45;
}

.cardgen__gallery-item.active {
  border-color: #315a2c;
  box-shadow: 0 0 0 2px #e1a83a inset;
}

.cardgen__step-body--compose {
  grid-template-columns: minmax(0, 1fr) 200px;
  align-items: start;
}

.cardgen__preview-wrap {
  justify-self: center;
  gap: 0.3rem;
  display: grid;
  justify-items: center;
}

.cardgen__preview {
  width: min(480px, 100%);
  height: auto;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  box-shadow: 0 4px 0 #4b321f47;
}

[data-theme='dark'] .cardgen__preview {
  border-color: #856747;
}

.cardgen__preview-label {
  color: #6d5a45;
  font-size: 0.75rem;
  font-weight: 700;
}

[data-theme='dark'] .cardgen__preview-label {
  color: #d4c19c;
}

.cardgen__side {
  gap: 0.5rem;
  display: grid;
}

.cardgen__side-label {
  color: #6d5a45;
  font-size: 0.82rem;
  font-weight: 800;
}

[data-theme='dark'] .cardgen__side-label {
  color: #d4c19c;
}

.cardgen__colors {
  flex-wrap: wrap;
  gap: 0.4rem;
  display: flex;
}

.cardgen__color {
  width: 1.8rem;
  height: 1.8rem;
  border: 2px solid #9a7a4c;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.cardgen__color.active {
  border-color: #4f8a45;
  box-shadow: 0 0 0 2px #e1a83a;
}

.cardgen__color--custom input {
  position: absolute;
  inset: -4px;
  opacity: 0;
  cursor: pointer;
}

.cardgen__error {
  color: #b23a2f;
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
}

.image-editor-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
}

.image-editor-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.image-editor-btn--primary {
  color: #fff;
  background: #4f8a45;
}

.image-editor-btn--primary:hover:not(:disabled) {
  background: #315a2c;
}

.image-editor-btn--ghost {
  color: inherit;
  background: rgba(0, 0, 0, 0.08);
}

.image-editor-btn--ghost:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.16);
}

@media (max-width: 620px) {
  .cardgen__step-body--compose {
    grid-template-columns: 1fr;
  }
}
</style>
