<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Floor, Librarian, LibrarianSheet, BattleSystemId } from '@rtl/shared'
import { BATTLE_SYSTEMS, emptySheet, parseSheet, defaultSpeedPassive } from '@rtl/shared'
import { api } from '@/app/services/api'
import Modal from './Modal.vue'
import LibrarianSheetEditor from './LibrarianSheetEditor.vue'
import PortraitCropModal from './PortraitCropModal.vue'

const props = defineProps<{
  librarian: Librarian | null
  floors: Floor[]
  defaultFloorId: number | null
  defaultSystem: BattleSystemId
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

function submit(): void {
  if (!form.name.trim()) {
    saveError.value = '司书名称不能为空'
    return
  }
  saveError.value = null
  form.sheet.name = form.name
  form.sheet.romanNum = ''
  // 关键词（keyword）暂存于 description 字段
  emit('save', {
    name: form.name,
    title: form.title,
    department: 'turris',
    role: 'curator',
    floorId: form.floorId,
    affiliation: form.affiliation,
    description: form.description,
    sheet: JSON.stringify(form.sheet),
    portrait: form.portrait,
    portraitPreview: form.portraitPreview,
  })
}

function triggerUpload(): void {
  fileInput.value?.click()
}
async function onFilePicked(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  saveError.value = null
  try {
    const res = await api.uploadImage(file)
    form.portrait = res.url
    form.portraitPreview = ''
    cropSource.value = res.url
    cropOpen.value = true
  } catch (e) {
    saveError.value = `上传失败：${e instanceof Error ? e.message : String(e)}`
  }
}
async function generatePortrait(): Promise<void> {
  saveError.value = null
  const prompt = `遗迹图书馆迎书楼司书立绘，${form.name}，${form.title}，(${form.affiliation}) 战斗司书，3:4 竖版全身立绘，精美`
  try {
    const res = await api.generateArt(prompt)
    form.portrait = res.url
    form.portraitPreview = ''
    cropSource.value = res.url
    cropOpen.value = true
  } catch (e) {
    saveError.value = `生成失败：${e instanceof Error ? e.message : String(e)}`
  }
}
function reopenCrop(): void {
  if (!form.portrait) return
  cropSource.value = form.portrait
  cropOpen.value = true
}
function removePortrait(): void {
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
        <img v-if="form.portraitPreview" :src="form.portraitPreview" alt="预览立绘" />
        <img v-else-if="form.portrait" :src="form.portrait" alt="立绘" />
        <span v-else class="ph">暂无立绘</span>
        <span v-if="form.portrait" class="art__badge">{{ form.portraitPreview ? '预览' : '原图' }}</span>
      </div>
      <div class="art__actions">
        <button type="button" class="btn" @click="triggerUpload">上传立绘</button>
        <button type="button" class="btn" @click="generatePortrait">AI 生成</button>
        <button v-if="form.portrait" type="button" class="btn" @click="reopenCrop">
          {{ form.portraitPreview ? '重新裁剪' : '裁剪预览立绘' }}
        </button>
        <button v-if="form.portrait" type="button" class="btn btn--danger" @click="removePortrait">移除</button>
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display: none" @change="onFilePicked" />
      </div>
      <div class="art__note">
        <p class="hint">最多 1 张 · 建议 3:4 高清全身立绘。上传/AI 生成后拖动裁剪框，选择一部分作为「预览立绘」用于网页展示；完整立绘在详情页展示。</p>
        <a v-if="form.portrait" class="art__full" :href="form.portrait" target="_blank" rel="noopener">查看完整立绘</a>
      </div>
    </div>

    <LibrarianSheetEditor :sheet="form.sheet" />

    <PortraitCropModal
      v-if="cropOpen"
      :image-url="cropSource"
      @confirm="(url) => { form.portraitPreview = url; cropOpen = false }"
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
