<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { WORLD_BG_MAP } from '@pvzwiki/types/plant'
import { getPlantByCodename } from '@pvzwiki/data/plant-details'
import { getWikiImage } from '@pvzwiki/data/plant-images'
import {
  resolveImageUrl,
  ensureBackup,
  uploadImage,
  resolveBgUrl,
  ensureBgBackup,
  uploadBg,
  setBgFromLibrary,
  restoreBg,
  hasBgBackup,
} from '@pvzwiki/store/plantImage'
import { showToast } from '@/app/stores/toast'
import CardGenerator from '@pvzwiki/components/CardGenerator.vue'

interface BgItem {
  name: string
  url: string
}

const props = defineProps<{ codename: string }>()

const open = ref(false)
const tab = ref<'portrait' | 'bg' | 'card'>('portrait')

const backgrounds = ref<BgItem[]>([])
const portraitPreviewSrc = ref('')
const portraitCurrentName = ref('')
const bgCurrentName = ref('')
const portraitBusy = ref(false)
const bgBusy = ref(false)
const portraitError = ref('')
const bgError = ref('')

const portraitInput = ref<HTMLInputElement | null>(null)
const bgInput = ref<HTMLInputElement | null>(null)

async function loadBackgrounds(): Promise<void> {
    backgrounds.value = await fetch('/api/pvz/backgrounds').then((r) => (r.ok ? r.json() : []))
}

async function refreshCurrent(): Promise<void> {
  const plant = getPlantByCodename(props.codename)
  const customUrl = await resolveImageUrl(props.codename)
  if (customUrl) {
    portraitPreviewSrc.value = customUrl
    portraitCurrentName.value = customUrl.replace('/assets/image/plants/', '')
  } else {
    const wiki = getWikiImage(props.codename)
    const src = wiki?.full ?? wiki?.thumb ?? plant?.image ?? ''
    portraitPreviewSrc.value = src
    portraitCurrentName.value = src.replace('/assets/image/plants/', '') || '—'
  }
  const bgUrl = await resolveBgUrl(props.codename)
  if (bgUrl) {
    bgCurrentName.value = bgUrl.replace('/assets/image/almanac/backgrounds/', '')
  } else {
    const code = WORLD_BG_MAP[plant?.world ?? ''] ?? 'default'
    bgCurrentName.value = `${code}.webp`
  }
}

function openEditor(): void {
  open.value = true
  tab.value = 'portrait'
  portraitError.value = ''
  bgError.value = ''
  void Promise.all([loadBackgrounds(), refreshCurrent()])
}

function closeEditor(): void {
  open.value = false
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function triggerPortraitUpload(): void {
  portraitInput.value?.click()
}

function triggerBgUpload(): void {
  bgInput.value?.click()
}

async function onPortraitFileChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  portraitError.value = ''
  portraitBusy.value = true
  try {
    const dataUrl = await readFileAsDataURL(file)
    await ensureBackup(props.codename)
    await uploadImage(props.codename, dataUrl)
    showToast('立绘已上传')
    window.setTimeout(() => window.location.reload(), 900)
  } catch {
    portraitError.value = '立绘上传失败，请重试'
  } finally {
    portraitBusy.value = false
    input.value = ''
  }
}

async function onBgFileChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  bgError.value = ''
  bgBusy.value = true
  try {
    const dataUrl = await readFileAsDataURL(file)
    await ensureBgBackup(props.codename)
    await uploadBg(props.codename, dataUrl)
    showToast('背景图已上传')
    window.setTimeout(() => window.location.reload(), 900)
  } catch {
    bgError.value = '背景图上传失败，请重试'
  } finally {
    bgBusy.value = false
    input.value = ''
  }
}

async function selectBg(item: BgItem): Promise<void> {
  if (item.name === bgCurrentName.value || bgBusy.value) return
  bgBusy.value = true
  bgError.value = ''
  try {
    await ensureBgBackup(props.codename)
    await setBgFromLibrary(props.codename, item.url)
    showToast('背景图已应用')
    window.setTimeout(() => window.location.reload(), 900)
  } catch {
    bgError.value = '应用背景图失败，请重试'
  } finally {
    bgBusy.value = false
  }
}

const bgRestoring = ref(false)

async function onRestoreBg(): Promise<void> {
  if (bgRestoring.value) return
  bgRestoring.value = true
  bgError.value = ''
  try {
    await restoreBg(props.codename)
    showToast('背景图已恢复')
    window.setTimeout(() => window.location.reload(), 900)
  } catch {
    bgError.value = '恢复背景图失败，请重试'
  } finally {
    bgRestoring.value = false
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    closeEditor()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ openEditor, closeEditor, isOpen: () => open.value })
</script>

<template>
  <button type="button" class="image-editor-trigger" title="贴图编辑器" @click="openEditor">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      />
    </svg>
  </button>

  <Teleport to="body">
  <Transition name="ed">
    <div v-if="open" class="image-editor-overlay" @click.self="closeEditor">
      <div class="image-editor-panel" role="dialog" aria-modal="true" aria-label="贴图编辑器">
        <header class="image-editor-header">
          <h3>贴图编辑器 · {{ codename }}</h3>
          <button type="button" class="image-editor-close" aria-label="关闭" @click="closeEditor">×</button>
        </header>

        <div class="image-editor-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'portrait'"
            :class="{ active: tab === 'portrait' }"
            @click="tab = 'portrait'"
          >
            立绘
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'bg'"
            :class="{ active: tab === 'bg' }"
            @click="tab = 'bg'"
          >
            背景图
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'card'"
            :class="{ active: tab === 'card' }"
            @click="tab = 'card'"
          >
            卡片生成
          </button>
        </div>

        <div class="image-editor-body">
          <template v-if="tab === 'portrait'">
            <div class="portrait-preview">
              <img v-if="portraitPreviewSrc" :src="portraitPreviewSrc" :alt="codename" @error="portraitPreviewSrc = ''" />
              <span v-else>暂无立绘</span>
            </div>
          </template>
          <CardGenerator v-else-if="tab === 'card'" :codename="codename" :default-src="portraitPreviewSrc" />
          <div v-else class="gallery" role="tabpanel">
            <button
              v-for="item in backgrounds"
              :key="item.url"
              type="button"
              class="gallery-item gallery-item--wide"
              :class="{ active: item.name === bgCurrentName }"
              :disabled="bgBusy || item.name === bgCurrentName"
              :title="item.name"
              @click="selectBg(item)"
            >
              <img :src="item.url" :alt="item.name" loading="lazy" />
            </button>
            <p v-if="!backgrounds.length" class="gallery-empty">暂无可用背景图</p>
          </div>

          <aside v-if="tab !== 'card'" class="gallery-side">
            <template v-if="tab === 'portrait'">
              <span class="gallery-side__label">当前文件</span>
              <code class="gallery-side__file">{{ portraitCurrentName }}</code>
              <button
                type="button"
                class="image-editor-btn image-editor-btn--primary"
                :disabled="portraitBusy"
                @click="triggerPortraitUpload"
              >
                {{ portraitBusy ? '处理中…' : '上传 / 替换' }}
              </button>
              <input
                ref="portraitInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="image-editor-file-input"
                @change="onPortraitFileChange"
              />
              <p v-if="portraitError" class="image-editor-hint image-editor-hint--error">
                {{ portraitError }}
              </p>
            </template>
            <template v-else>
              <span class="gallery-side__label">当前文件</span>
              <code class="gallery-side__file">{{ bgCurrentName }}</code>
              <button
                type="button"
                class="image-editor-btn image-editor-btn--primary"
                :disabled="bgBusy"
                @click="triggerBgUpload"
              >
                {{ bgBusy ? '处理中…' : '上传 / 替换' }}
              </button>
              <input
                ref="bgInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="image-editor-file-input"
                @change="onBgFileChange"
              />
              <button
                v-if="hasBgBackup(codename)"
                type="button"
                class="image-editor-btn image-editor-btn--ghost"
                :disabled="bgRestoring"
                @click="onRestoreBg"
              >
                {{ bgRestoring ? '恢复中…' : '恢复默认背景' }}
              </button>
              <p v-if="bgError" class="image-editor-hint image-editor-hint--error">
                {{ bgError }}
              </p>
            </template>
          </aside>
        </div>

        <footer class="image-editor-footer">
          <button type="button" class="image-editor-btn image-editor-btn--ghost" @click="closeEditor">
            关闭
          </button>
        </footer>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<style scoped>
.image-editor-trigger {
  color: #f2e7c4;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  cursor: pointer;
  width: 1.7rem;
  height: 1.7rem;
  align-items: center;
  justify-content: center;
  display: inline-flex;
  margin-top: 0.6rem;
  margin-left: 0.5rem;
  vertical-align: top;
  transition: background-color 0.15s, color 0.15s;
}

.image-editor-trigger:hover {
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
}

.image-editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  display: flex;
}

.image-editor-panel {
  box-sizing: border-box;
  width: min(700px, 100%);
  max-height: 88vh;
  flex-direction: column;
  background: #efe2b9;
  color: #2b241c;
  border: 3px solid #281a11;
  border-radius: 12px;
  box-shadow: 0 9px 0 #281a11;
  overflow: hidden;
  display: flex;
}

[data-theme='dark'] .image-editor-panel {
  background: #342d20;
  color: #f2e5c4;
  border-color: #8a6949;
  box-shadow: 0 9px 0 #281a11;
}

.image-editor-header {
  background: #4b321f;
  color: #fff8dc;
  border-bottom: 3px solid #281a11;
  padding: 0.7rem 1rem;
  align-items: center;
  justify-content: space-between;
  flex: none;
  display: flex;
}

.image-editor-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.image-editor-close {
  background: none;
  border: none;
  color: #fff8dc;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.3rem;
}

.image-editor-tabs {
  border-bottom: 3px solid #281a11;
  gap: 0.3rem;
  padding: 0.45rem 0.9rem 0;
  flex: none;
  display: flex;
}

.image-editor-tabs button {
  color: #6d5a45;
  background: none;
  border: 2px solid transparent;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  padding: 0.45rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 800;
}

.image-editor-tabs button.active {
  color: #2b241c;
  background: #fff9e3;
  border-color: #9a7a4c;
}

[data-theme='dark'] .image-editor-tabs button {
  color: #d4c19c;
}

[data-theme='dark'] .image-editor-tabs button.active {
  color: #f5e9c8;
  background: #211c16;
  border-color: #856747;
}

.image-editor-body {
  min-height: 0;
  flex: 1 1 auto;
  gap: 0.8rem;
  padding: 0.8rem;
  display: flex;
}

.gallery {
  box-sizing: border-box;
  min-width: 0;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  background: #fff9e3;
  align-content: start;
  flex: 1 1 auto;
  gap: 0.4rem;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  padding: 0.5rem;
  display: grid;
  overflow-y: auto;
}

.portrait-preview {
  box-sizing: border-box;
  min-width: 0;
  min-height: 240px;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  background: #fff9e3;
  place-items: center;
  color: #6d5a45;
  flex: 1 1 auto;
  display: grid;
  overflow: hidden;
}

.portrait-preview img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

[data-theme='dark'] .portrait-preview {
  background: #211c16;
  color: #d4c19c;
  border-color: #856747;
}

[data-theme='dark'] .gallery {
  background: #211c16;
  border-color: #856747;
}

.gallery-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  background: #ffffff6b;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  overflow: hidden;
  transition: border-color 0.12s, transform 0.12s;
}

[data-theme='dark'] .gallery-item {
  background: #2c251a;
}

.gallery-item img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.gallery-item:hover:not(:disabled) {
  transform: scale(1.04);
  border-color: #4f8a45;
}

.gallery-item.active {
  border-color: #315a2c;
  box-shadow: 0 0 0 2px #e1a83a inset;
}

[data-theme='dark'] .gallery-item.active {
  border-color: #7cbf6d;
}

.gallery-item:disabled {
  cursor: default;
  opacity: 0.85;
}

.gallery-item--wide {
  aspect-ratio: 16 / 9;
}

.gallery-item--wide img {
  object-fit: cover;
}

.gallery-empty {
  color: #6d5a45;
  grid-column: 1 / -1;
  text-align: center;
  padding: 1.5rem 0;
  font-size: 0.9rem;
}

[data-theme='dark'] .gallery-empty {
  color: #d4c19c;
}

.gallery-side {
  box-sizing: border-box;
  width: 200px;
  flex: none;
  align-content: start;
  gap: 0.6rem;
  display: grid;
}

.gallery-side__label {
  color: #6d5a45;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

[data-theme='dark'] .gallery-side__label {
  color: #d4c19c;
}

.gallery-side__file {
  overflow-wrap: anywhere;
  color: #4a3a26;
  background: #fff9e3;
  border: 1px solid #9a7a4c;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.4;
}

[data-theme='dark'] .gallery-side__file {
  color: #f5e9c8;
  background: #211c16;
  border-color: #856747;
}

.image-editor-file-input {
  display: none;
}

.image-editor-hint {
  font-size: 0.85rem;
  color: #6d5a45;
}

.image-editor-hint--error {
  color: #b23a2f;
}

[data-theme='dark'] .image-editor-hint {
  color: #d4c19c;
}

[data-theme='dark'] .image-editor-hint--error {
  color: #ff8a7a;
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

.image-editor-footer {
  border-top: 3px solid #281a11;
  padding: 0.7rem 1rem;
  justify-content: flex-end;
  gap: 0.6rem;
  flex: none;
  display: flex;
}

@media (max-width: 620px) {
  .image-editor-body {
    flex-direction: column;
  }
  .gallery {
    min-height: 180px;
  }
  .gallery-side {
    width: 100%;
  }
}

.ed-enter-active,
.ed-leave-active {
  transition: opacity 0.16s ease;
}

.ed-enter-from,
.ed-leave-to {
  opacity: 0;
}
</style>
