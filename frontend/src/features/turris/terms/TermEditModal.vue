<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { TermFormat } from '@rtl/shared'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import Modal from '@/features/turris/editor/Modal.vue'
import FormatEditor from '@/features/turris/editor/FormatEditor.vue'
import type { DictEntry } from '@/features/turris/store/terms'

const props = defineProps<{ open: boolean; entry: DictEntry | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const DEFAULT_TAG_COLOR = '#8a8a8a'
const DEFAULT_TAG_FORMAT: TermFormat = { color: '#8a8a8a', bold: false, italic: false, underline: 'none' }

const form = reactive({
  name: '',
  desc: '',
  tags: [] as string[],
  tagColors: [] as string[],
  tagFormats: [] as TermFormat[],
  format: { color: '#eee2cb', bold: false, italic: false, underline: 'none' } as TermFormat,
})

watch(
  () => [props.open, props.entry] as const,
  ([open, entry]) => {
    if (!open || !entry) return
    form.name = entry.name
    form.desc = entry.desc
    form.tags = [...entry.tags]
    form.tagColors = [...entry.tagColors]
    form.tagFormats = entry.tagFormats.map((f) => ({ ...f }))
    form.format = { ...entry.format }
  },
  { immediate: true },
)

function addTag(): void {
  form.tags.push('')
  form.tagColors.push(DEFAULT_TAG_COLOR)
  form.tagFormats.push({ ...DEFAULT_TAG_FORMAT })
}
function removeTag(i: number): void {
  form.tags.splice(i, 1)
  form.tagColors.splice(i, 1)
  form.tagFormats.splice(i, 1)
}
function setTagColor(i: number, e: Event): void {
  form.tagColors[i] = (e.target as HTMLInputElement).value
}

const saving = ref(false)
const saveError = ref<string | null>(null)

async function save(): Promise<void> {
  if (!props.entry) return
  if (!form.name.trim()) {
    saveError.value = '词条名称不能为空'
    return
  }
  saveError.value = null
  saving.value = true
  try {
    await api.update('term_entries', props.entry.id, {
      name: form.name.trim(),
      description: form.desc,
      tags: JSON.stringify(form.tags),
      tagColors: JSON.stringify(form.tagColors),
      tagFormats: JSON.stringify(form.tagFormats),
      format: JSON.stringify(form.format),
    })
    showToast('词条已保存')
    emit('saved')
    emit('close')
  } catch (e) {
    saveError.value = `保存失败：${e instanceof Error ? e.message : String(e)}`
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal v-if="open && entry" :title="`编辑词条 · ${entry.name}`" wide @close="emit('close')">
    <div class="term-edit">
      <div class="field">
        <label>名称</label>
        <input v-model="form.name" />
      </div>

      <div class="field">
        <label>字体格式（作用于词典页词条名与渲染器命中样式）</label>
        <FormatEditor :format="form.format" />
      </div>

      <div class="field">
        <label>属性标签</label>
        <div class="tags">
          <div v-for="(tag, i) in form.tags" :key="i" class="tag-row">
            <input v-model="form.tags[i]" class="tag-text" :placeholder="`标签 ${i + 1}`" />
            <input type="color" class="tag-color" :value="form.tagColors[i]" @input="setTagColor(i, $event)" />
            <button type="button" class="tag-remove" @click="removeTag(i)">×</button>
          </div>
          <button type="button" class="tag-add" @click="addTag">+ 添加标签</button>
        </div>
      </div>

      <div class="field">
        <label>效果描述</label>
        <textarea v-model="form.desc" rows="5"></textarea>
      </div>

      <p v-if="saveError" class="error">{{ saveError }}</p>
    </div>

    <template #footer>
      <button type="button" class="btn" @click="emit('close')">取消</button>
      <button type="button" class="btn btn--primary" :disabled="saving" @click="save">
        {{ saving ? '保存中…' : '保存' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.term-edit {
  display: grid;
  gap: 18px;
}
.field {
  display: grid;
  gap: 8px;
}
.field > label {
  font-size: 12px;
  color: var(--color-ink-dim);
  letter-spacing: 0.04em;
}
.field input[type='text'],
.field input:not([type]),
.field textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  color: var(--color-ink);
  padding: 8px 10px;
  font-family: inherit;
  font-size: 14px;
}
.field textarea {
  resize: vertical;
  line-height: 1.8;
}
.tags {
  display: grid;
  gap: 8px;
}
.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tag-text {
  flex: 1;
}
.tag-color {
  width: 36px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: none;
  cursor: pointer;
}
.tag-remove {
  background: none;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  color: var(--color-ink-dim);
  width: 26px;
  height: 26px;
  cursor: pointer;
}
.tag-remove:hover {
  color: var(--danger);
  border-color: var(--danger);
}
.tag-add {
  justify-self: start;
  background: none;
  border: 1px dashed var(--color-line);
  border-radius: 999px;
  color: var(--color-ink-dim);
  padding: 4px 14px;
  font-size: 12px;
  cursor: pointer;
}
.tag-add:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.btn {
  background: none;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  color: var(--color-ink);
  padding: 7px 16px;
  font-size: 13px;
  cursor: pointer;
}
.btn--primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #1b1408;
  font-weight: 600;
}
.btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.error {
  margin: 0;
  color: var(--danger);
  font-size: 13px;
}
</style>
