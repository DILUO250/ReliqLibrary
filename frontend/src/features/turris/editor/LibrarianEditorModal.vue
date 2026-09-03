<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { Floor, Librarian, LibrarianSheet, BattleSystemId } from '@rtl/shared'
import { BATTLE_SYSTEMS, RARITIES, emptySheet, parseSheet, defaultSpeedPassive } from '@rtl/shared'
import { api } from '@/app/services/api'
import Modal from './Modal.vue'
import LibrarianSheetEditor from './LibrarianSheetEditor.vue'
import PortraitCropModal from './PortraitCropModal.vue'

const props = defineProps<{
  librarian: Librarian | null
  floors: Floor[]
  defaultFloorId: number | null
  defaultSystem: BattleSystemId
  defaultRarity?: string
  roman: string
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: Record<string, unknown>): void
  (e: 'close'): void
}>()

function resolveSystem(
  floorId: number | null,
  fallback: BattleSystemId = 'base',
): BattleSystemId {
  const f = props.floors.find((x) => x.id === floorId)
  return (f?.battleSystem as BattleSystemId) ?? fallback
}

function resolveSheet(librarian: Librarian | null, floorId: number | null): LibrarianSheet {
  if (librarian) {
    const parsed = parseSheet(librarian.sheet)
    if (parsed) {
      parsed.systemData = parsed.systemData ?? {}
      return parsed
    }
  }
  return emptySheet(resolveSystem(floorId, props.defaultSystem))
}

const form = reactive({
  floorId: props.librarian?.floorId ?? props.defaultFloorId,
  name: props.librarian?.name ?? '',
  title: props.librarian?.title ?? '',
  rarity: props.librarian?.rarity ?? props.defaultRarity ?? '',
  affiliation: props.librarian?.affiliation ?? '',
  description: props.librarian?.description ?? '',
  portrait: props.librarian?.portrait ?? '',
  portraitPreview: props.librarian?.portraitPreview ?? '',
  sheet: resolveSheet(props.librarian, props.librarian?.floorId ?? props.defaultFloorId),
})

const saveError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const cropOpen = ref(false)
const cropSource = ref('')

// 待上传文件在本地暂存（objectURL 供预览/裁剪），点「保存」时才真正上传——
// 取消编辑即不留任何服务器文件，杜绝孤儿资源。
interface PendingFile {
  file: File
  objectUrl: string
}
const pendingPortrait = ref<PendingFile | null>(null)
const pendingPreview = ref<PendingFile | null>(null)

// 展示源：本地暂存优先于已落库 URL
const portraitSrc = computed(() => pendingPortrait.value?.objectUrl ?? form.portrait)
const previewSrc = computed(() => pendingPreview.value?.objectUrl ?? form.portraitPreview)

function discardPending(): void {
  if (pendingPortrait.value) {
    URL.revokeObjectURL(pendingPortrait.value.objectUrl)
    pendingPortrait.value = null
  }
  if (pendingPreview.value) {
    URL.revokeObjectURL(pendingPreview.value.objectUrl)
    pendingPreview.value = null
  }
}
onBeforeUnmount(discardPending)

function dataUrlToFile(dataUrl: string): File {
  const [meta = '', b64 = ''] = dataUrl.split(',')
  const mime = /data:(.*?);/.exec(meta)?.[1] ?? 'image/png'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new File([bytes], `portrait-preview-${Date.now()}.png`, { type: mime })
}

/** 裁剪确认：暂存 dataURL 为本地待上传文件，不上传 */
function setPendingPreview(dataUrl: string): void {
  if (pendingPreview.value) URL.revokeObjectURL(pendingPreview.value.objectUrl)
  const file = dataUrlToFile(dataUrl)
  pendingPreview.value = { file, objectUrl: URL.createObjectURL(file) }
}

const floorOptions = computed(() => [...props.floors].sort((a, b) => a.sortOrder - b.sortOrder))
const systemOptions = computed(() =>
  Object.values(BATTLE_SYSTEMS).map((s) => ({ value: s.id, label: `${s.zh}(${s.code})` })),
)
const currentSystem = computed(() => BATTLE_SYSTEMS[form.sheet.battleSystem])

function resetFirstPassive(sys: BattleSystemId): void {
  const p0 = form.sheet.passives?.[0]
  if (p0 && (p0.name || '').startsWith('速战速决')) {
    const d = defaultSpeedPassive(sys)
    p0.name = d.name
    p0.effect = d.effect
  }
}

watch(
  () => form.floorId,
  (id) => {
    const sys = resolveSystem(id)
    if (form.sheet.battleSystem !== sys) {
      form.sheet.battleSystem = sys
      resetFirstPassive(sys)
    }
  },
)

watch(
  () => form.sheet.battleSystem,
  (sys) => resetFirstPassive(sys),
)

async function submit(): Promise<void> {
  if (!form.name.trim()) {
    saveError.value = '司书名称不能为空'
    return
  }
  saveError.value = null
  // 先上传本地暂存的立绘/裁剪图（此刻才落盘），再提交整行
  try {
    if (pendingPortrait.value) {
      const res = await api.uploadImage(pendingPortrait.value.file, 'portrait')
      form.portrait = res.url
    }
    if (pendingPreview.value) {
      const res = await api.uploadImage(pendingPreview.value.file, 'preview')
      form.portraitPreview = res.url
    }
  } catch (e) {
    saveError.value = `立绘上传失败：${e instanceof Error ? e.message : String(e)}`
    return
  }
  form.sheet.name = form.name
  form.sheet.romanNum = ''
  // 关键词（keyword）暂存于 description 字段
  emit('save', {
    name: form.name,
    title: form.title,
    department: 'turris',
    role: 'curator',
    floorId: form.floorId,
    rarity: form.rarity,
    affiliation: form.affiliation,
    description: form.description,
    sheet: JSON.stringify(form.sheet),
    portrait: form.portrait,
    portraitPreview: form.portraitPreview,
  })
  discardPending()
}

function triggerUpload(): void {
  fileInput.value?.click()
}
function onFilePicked(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  saveError.value = null
  // 只暂存到本地，不上传；新立绘使旧的待上传裁剪图失效
  if (pendingPortrait.value) URL.revokeObjectURL(pendingPortrait.value.objectUrl)
  if (pendingPreview.value) {
    URL.revokeObjectURL(pendingPreview.value.objectUrl)
    pendingPreview.value = null
  }
  pendingPortrait.value = { file, objectUrl: URL.createObjectURL(file) }
  cropSource.value = pendingPortrait.value.objectUrl
  cropOpen.value = true
}
async function generatePortrait(): Promise<void> {
  saveError.value = null
  const prompt = `遗迹图书馆迎书楼司书立绘，${form.name}，${form.title}，(${form.affiliation}) 战斗司书，3:4 竖版全身立绘，精美`
  try {
    // AI 生成是服务端行为，产物即时落盘（若最终取消编辑会成为孤儿，
    // 由 audit:art 报告人工处置）；本地暂存的待上传文件随之作废
    if (pendingPortrait.value) URL.revokeObjectURL(pendingPortrait.value.objectUrl)
    pendingPortrait.value = null
    const res = await api.generateArt(prompt, 'portrait')
    form.portrait = res.url
    form.portraitPreview = ''
    cropSource.value = res.url
    cropOpen.value = true
  } catch (e) {
    saveError.value = `生成失败：${e instanceof Error ? e.message : String(e)}`
  }
}
function reopenCrop(): void {
  if (!portraitSrc.value) return
  cropSource.value = portraitSrc.value
  cropOpen.value = true
}
function removePortrait(): void {
  discardPending()
  form.portrait = ''
  form.portraitPreview = ''
}
</script>

<template>
  <Modal :title="librarian ? `编辑司书 · ${librarian.name}` : `新建司书 · ${roman}`" wide @close="emit('close')">
    <div class="grid">
      <label>所属楼层</label>
      <select v-model="form.floorId" :disabled="!!librarian">
        <option :value="null">（无楼层）</option>
        <option v-for="f in floorOptions" :key="f.id" :value="f.id">
          {{ f.code }} · {{ f.designation }}
        </option>
      </select>
      <label>名称</label>
      <input v-model="form.name" placeholder="如：Malkuth" />
      <label>核心书页</label>
      <input v-model="form.title" placeholder="如：光芒照耀的历史层总管之页" />
      <label>稀有度</label>
      <select v-model="form.rarity">
        <option value="">常规司书</option>
        <option v-for="r in RARITIES" :key="r" :value="r">{{ r }} · 附加角色</option>
      </select>
      <label>战斗系统</label>
      <select v-model="form.sheet.battleSystem">
        <option v-for="s in systemOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <label>出身/阵营</label>
      <input v-model="form.affiliation" placeholder="如：脑叶公司 / 六协会" />
      <label>关键词</label>
      <input v-model="form.description" placeholder="如：烧伤，单方面攻击，承伤" />
    </div>

    <div v-if="currentSystem" class="sys">
      <strong>{{ currentSystem.zh }}（{{ currentSystem.code }}）</strong>
      <span>{{ currentSystem.desc }}</span>
    </div>

    <label class="fullline">立绘</label>
    <div class="art">
      <div class="art__preview">
        <img v-if="previewSrc" :src="previewSrc" alt="预览立绘" />
        <img v-else-if="portraitSrc" :src="portraitSrc" alt="立绘" />
        <span v-else class="ph">暂无立绘</span>
        <span v-if="portraitSrc" class="art__badge">{{ previewSrc ? '预览' : '原图' }}</span>
      </div>
      <div class="art__actions">
        <button type="button" class="btn" @click="triggerUpload">上传立绘</button>
        <button type="button" class="btn" @click="generatePortrait">AI 生成</button>
        <button v-if="portraitSrc" type="button" class="btn" @click="reopenCrop">
          {{ previewSrc ? '重新裁剪' : '裁剪预览立绘' }}
        </button>
        <button v-if="portraitSrc" type="button" class="btn btn--danger" @click="removePortrait">移除</button>
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display: none" @change="onFilePicked" />
      </div>
      <div class="art__note">
        <p class="hint">最多 1 张 · 建议 3:4 高清全身立绘。上传/AI 生成后拖动裁剪框，选择一部分作为「预览立绘」用于网页展示；完整立绘在详情页展示。立绘与裁剪图在点击「保存司书」时才会上传。</p>
        <a v-if="portraitSrc" class="art__full" :href="portraitSrc" target="_blank" rel="noopener">查看完整立绘</a>
      </div>
    </div>

    <LibrarianSheetEditor :sheet="form.sheet" />

    <PortraitCropModal
      v-if="cropOpen"
      :image-url="cropSource"
      @confirm="(dataUrl) => { setPendingPreview(dataUrl); cropOpen = false }"
      @cancel="cropOpen = false"
    />

    <template #footer>
      <span v-if="saveError" class="error">{{ saveError }}</span>
      <button type="button" class="btn btn--ghost" @click="emit('close')">取消</button>
      <button type="button" class="btn btn--primary" :disabled="saving" @click="submit">
        {{ saving ? '保存中…' : '保存司书' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 90px 1fr 90px 1fr;
  gap: 12px 16px;
  align-items: center;
  margin-bottom: 16px;
}
.grid label,
.fullline {
  font-size: 13px;
  color: var(--color-ink-dim);
  white-space: nowrap;
}
input,
select {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  color: var(--color-ink);
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
input:focus,
select:focus {
  border-color: var(--accent);
}
.roman {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--accent);
}
.sys {
  padding: 10px 12px;
  border: 1px dashed var(--color-line);
  border-radius: var(--radius);
  background: var(--color-bg);
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--color-ink-dim);
}
.sys strong {
  color: var(--accent);
}
.art {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.art__preview {
  position: relative;
  width: 140px;
  height: 180px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg);
  flex-shrink: 0;
}
.art__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-ink-faint);
  font-size: 12px;
}
.art__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.art__note {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.art__note .hint {
  margin: 0;
}
.art__full {
  font-size: 12px;
  color: var(--accent);
}
.art__badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(16, 13, 9, 0.7);
  color: var(--color-ink);
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
.btn--danger {
  color: #d9766a;
  background: transparent;
  border-color: rgba(217, 118, 106, 0.4);
}
.error {
  color: #e07a6b;
  font-size: 13px;
}
</style>
