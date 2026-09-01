<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { keywords } from '@pvzwiki/data/keywords'
import { getEffectiveDetail } from '@pvzwiki/data/plant-details'
import { saveEdit, type PlantEditData } from '@pvzwiki/store/plantEditor'
import { isEditableTarget } from '@pvzwiki/utils/keyboard'
import { showToast } from '@pvzwiki/store/toast'
import { plants, getFamilies } from '@pvzwiki/data/plants'

const props = defineProps<{ codename: string }>()

const RANGE_OPTIONS = [
  '极短',
  '短',
  '较短',
  '一般',
  '较长',
  '长',
  '极长',
  '整行',
  '整列',
  '全场',
  '变化',
  '四向',
  '周围',
  '本格',
]

const editorOpen = ref(false)
const pickerOpen = ref(false)
const rangeOpen = ref(false)
const rangeComboRef = ref<HTMLElement | null>(null)

function onDocumentClick(e: MouseEvent): void {
  if (rangeComboRef.value && !rangeComboRef.value.contains(e.target as Node)) {
    rangeOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})

function selectRange(opt: string): void {
  form.range = opt
  rangeOpen.value = false
}

const form = reactive({
  sunCost: '',
  recharge: '',
  toughness: '',
  damage: '',
  range: '',
  family: '',
  abilityText: '',
  introduction: '',
  chat: '',
  traits: [] as string[],
})

const familyOptions = computed(() =>
  getFamilies(plants).map((f) => ({ code: f.code, name: f.name })),
)

function keywordName(id: string): string {
  return keywords.find((k) => k.id === id)?.name ?? id
}

function openEditor(): void {
  const d = getEffectiveDetail(props.codename)
  if (!d) return
  form.sunCost = d.sunCost != null ? String(d.sunCost) : ''
  form.recharge = d.recharge != null ? String(d.recharge) : ''
  form.toughness = d.toughness != null ? String(d.toughness) : ''
  form.damage = d.damage != null ? String(d.damage) : ''
  form.range = d.range ?? ''
  form.family = d.family ?? ''
  form.abilityText = d.ability.join('\n')
  form.introduction = d.introduction ?? ''
  form.chat = d.chat ?? ''
  form.traits = [...d.traits]
  editorOpen.value = true
  const active = document.activeElement as HTMLElement | null
  if (active && active !== document.body) active.blur()
}

async function save(): Promise<void> {
  const data: PlantEditData = {
    sunCost: form.sunCost === '' ? null : Number(form.sunCost),
    recharge: form.recharge === '' ? null : Number(form.recharge),
    toughness: form.toughness === '' ? null : Number(form.toughness),
    damage: form.damage === '' ? null : Number(form.damage),
    range: form.range.trim() || null,
    family: form.family.trim() || null,
    introduction: form.introduction.trim() || null,
    chat: form.chat.trim() || null,
    ability: form.abilityText.split('\n').map((s) => s.trim()).filter(Boolean),
    traits: [...form.traits],
  }
  await saveEdit(props.codename, data)
  editorOpen.value = false
  pickerOpen.value = false
  showToast('编辑已保存')
  window.setTimeout(() => window.location.reload(), 900)
}

function closeEditor(): void {
  editorOpen.value = false
  pickerOpen.value = false
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    if (pickerOpen.value) {
      e.preventDefault()
      pickerOpen.value = false
    } else if (editorOpen.value) {
      e.preventDefault()
      closeEditor()
    }
    return
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (!editorOpen.value || pickerOpen.value) return
  if (e.key.toLowerCase() === 's' && !isEditableTarget(e.target)) {
    e.preventDefault()
    save()
  }
}

function removeTrait(id: string): void {
  const idx = form.traits.indexOf(id)
  if (idx >= 0) form.traits.splice(idx, 1)
}

function toggleKeyword(id: string): void {
  const idx = form.traits.indexOf(id)
  if (idx >= 0) form.traits.splice(idx, 1)
  else form.traits.push(id)
}

defineExpose({ openEditor, closeEditor, isOpen: () => editorOpen.value })
</script>

<template>
  <button type="button" class="editor-trigger" title="编辑器 (E)" @click="openEditor">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      />
    </svg>
  </button>

  <Teleport to="body">
  <Transition name="ed">
    <div v-if="editorOpen" class="editor-overlay">
      <div class="editor-panel" role="dialog" aria-modal="true" aria-label="编辑器">
        <header class="editor-header">
          <h3>编辑器 · {{ codename }}</h3>
          <button type="button" class="editor-close" aria-label="关闭" @click="editorOpen = false">×</button>
        </header>

        <div class="editor-body">
          <div class="editor-grid">
            <label class="editor-field">
              <span>阳光消耗</span>
              <input v-model="form.sunCost" type="number" min="0" />
            </label>
            <label class="editor-field">
              <span>冷却时间</span>
              <input v-model="form.recharge" type="number" min="0" />
            </label>
            <label class="editor-field">
              <span>血量</span>
              <input v-model="form.toughness" type="number" min="0" />
            </label>
            <label class="editor-field">
              <span>伤害</span>
              <input v-model="form.damage" type="number" min="0" />
            </label>
            <label class="editor-field">
              <span>射程</span>
              <div ref="rangeComboRef" class="range-combo">
                <input v-model="form.range" type="text" placeholder="输入或选择" />
                <button
                  type="button"
                  class="range-arrow"
                  :class="{ open: rangeOpen }"
                  aria-label="选择射程"
                  @click="rangeOpen = !rangeOpen"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                  </svg>
                </button>
                <div v-if="rangeOpen" class="range-menu">
                  <button
                    v-for="opt in RANGE_OPTIONS"
                    :key="opt"
                    type="button"
                    class="range-option"
                    :class="{ active: form.range === opt }"
                    @click="selectRange(opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>
            </label>
            <label class="editor-field">
              <span>家族</span>
              <select v-model="form.family">
                <option value="">不设置</option>
                <option v-for="f in familyOptions" :key="f.code" :value="f.name">
                  {{ f.name }}
                </option>
              </select>
            </label>
          </div>

          <div class="editor-field">
            <span>特点</span>
            <div class="editor-traits">
              <span v-for="id in form.traits" :key="id" class="editor-trait">
                {{ keywordName(id) }}
                <button type="button" class="editor-trait-remove" @click="removeTrait(id)">×</button>
              </span>
              <button type="button" class="editor-add" @click="pickerOpen = true">+ 添加词条</button>
            </div>
          </div>

          <label class="editor-field">
            <span>能力</span>
            <textarea v-model="form.abilityText" rows="2" placeholder="每行一条能力"></textarea>
          </label>

          <label class="editor-field">
            <span>图鉴介绍</span>
            <textarea v-model="form.chat" rows="2"></textarea>
          </label>
        </div>

        <footer class="editor-footer">
          <button type="button" class="editor-btn editor-btn--ghost" @click="editorOpen = false">取消</button>
          <button type="button" class="editor-btn editor-btn--primary" @click="save">保存</button>
        </footer>
      </div>
    </div>
  </Transition>
  </Teleport>

  <Teleport to="body">
  <Transition name="ed">
    <div v-if="pickerOpen" class="picker-overlay">
      <div class="picker-panel" role="dialog" aria-modal="true" aria-label="选择词条">
        <header class="editor-header">
          <h3>选择词条</h3>
          <button type="button" class="editor-close" aria-label="关闭" @click="pickerOpen = false">×</button>
        </header>
        <div class="picker-body">
          <button
            v-for="k in keywords"
            :key="k.id"
            type="button"
            class="picker-item"
            :class="{ active: form.traits.includes(k.id) }"
            @click="toggleKeyword(k.id)"
          >
            <strong>{{ k.name }}</strong>
            <span>{{ k.description }}</span>
          </button>
        </div>
          <footer class="editor-footer">
            <button type="button" class="editor-btn editor-btn--primary" @click="pickerOpen = false">完成</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.editor-trigger {
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
  transition: background-color 0.15s, color 0.15s;
}

.editor-trigger:hover {
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
}

.editor-overlay,
.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  display: flex;
}

.picker-overlay {
  z-index: 1200;
}

.editor-panel,
.picker-panel {
  box-sizing: border-box;
  width: min(520px, 100%);
  max-height: 92vh;
  flex-direction: column;
  background: #efe2b9;
  color: #2b241c;
  border: 3px solid #281a11;
  border-radius: 12px;
  box-shadow: 0 9px 0 #281a11;
  overflow: hidden;
  display: flex;
}

[data-theme='dark'] .editor-panel,
[data-theme='dark'] .picker-panel {
  background: #342d20;
  color: #f2e5c4;
  border-color: #8a6949;
  box-shadow: 0 9px 0 #281a11;
}

.editor-header {
  background: #4b321f;
  color: #fff8dc;
  border-bottom: 3px solid #281a11;
  padding: 0.7rem 1rem;
  align-items: center;
  justify-content: space-between;
  flex: none;
  display: flex;
}

.editor-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.editor-close {
  background: none;
  border: none;
  color: #fff8dc;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.3rem;
}

.editor-body {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0.9rem;
  gap: 0.7rem;
  display: grid;
}

.editor-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  display: grid;
}

.editor-field {
  gap: 0.3rem;
  display: grid;
}

.editor-field > span {
  font-size: 0.95rem;
  font-weight: 700;
  color: #6d5a45;
}

[data-theme='dark'] .editor-field > span {
  color: #d4c19c;
}

.editor-field input,
.editor-field textarea,
.editor-field select {
  box-sizing: border-box;
  width: 100%;
  color: inherit;
  background: #fff9e3;
  border: 2px solid #9a7a4c;
  border-radius: 6px;
  padding: 0.55rem 0.7rem;
  font: inherit;
  font-size: 1rem;
}

[data-theme='dark'] .editor-field input,
[data-theme='dark'] .editor-field textarea,
[data-theme='dark'] .editor-field select {
  background: #211c16;
  border-color: #856747;
  color: #f5e9c8;
}

.editor-field textarea {
  resize: vertical;
}

.range-combo {
  position: relative;
}

.range-combo input {
  padding-right: 2.2rem;
}

.range-arrow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2.2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6d5a45;
  align-items: center;
  justify-content: center;
  display: flex;
}

.range-arrow:hover,
.range-arrow.open {
  color: #4f8a45;
}

[data-theme='dark'] .range-arrow {
  color: #d4c19c;
}

[data-theme='dark'] .range-arrow:hover,
[data-theme='dark'] .range-arrow.open {
  color: #7cbf6d;
}

.range-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  background: #fff9e3;
  border: 2px solid #9a7a4c;
  border-radius: 6px;
  padding: 0.25rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.1rem;
  display: grid;
}

[data-theme='dark'] .range-menu {
  background: #211c16;
  border-color: #856747;
}

.range-option {
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font: inherit;
  font-size: 0.85rem;
}

.range-option:hover {
  background: rgba(79, 138, 69, 0.15);
}

.range-option.active {
  color: #fff;
  background: #4f8a45;
}

[data-theme='dark'] .range-option.active {
  color: #fff;
}

.editor-traits {
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  display: flex;
}

.editor-trait {
  color: #fff;
  background: #4f8a45;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.9rem;
  font-weight: 700;
  align-items: center;
  gap: 0.3rem;
  display: inline-flex;
}

.editor-trait-remove {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0;
}

.editor-add {
  color: #4f8a45;
  background: none;
  border: 2px dashed #4f8a45;
  border-radius: 999px;
  cursor: pointer;
  padding: 0.3rem 0.75rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
}

.editor-add:hover {
  background: #4f8a451a;
}

.editor-footer {
  border-top: 3px solid #281a11;
  padding: 0.7rem 1rem;
  justify-content: flex-end;
  gap: 0.6rem;
  flex: none;
  display: flex;
}

.editor-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.5rem 1.2rem;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
}

.editor-btn--primary {
  color: #fff;
  background: #4f8a45;
}

.editor-btn--primary:hover {
  background: #315a2c;
}

.editor-btn--ghost {
  color: inherit;
  background: rgba(0, 0, 0, 0.08);
}

.editor-btn--ghost:hover {
  background: rgba(0, 0, 0, 0.16);
}

.picker-body {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0.8rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  display: grid;
}

.picker-item {
  text-align: left;
  color: inherit;
  background: #fff5d4;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.55rem 0.7rem;
  gap: 0.2rem;
  display: grid;
  font: inherit;
}

.picker-item:hover {
  border-color: #4f8a45;
}

.picker-item.active {
  background: #4f8a45;
  color: #fff;
  border-color: #315a2c;
}

.picker-item strong {
  font-size: 0.95rem;
}

.picker-item span {
  font-size: 0.82rem;
  line-height: 1.35;
  color: #6d5a45;
}

.picker-item.active span {
  color: #eaffea;
}

[data-theme='dark'] .picker-item {
  background: #211c16;
  border-color: #856747;
}

[data-theme='dark'] .picker-item span {
  color: #d4c19c;
}

[data-theme='dark'] .picker-item.active span {
  color: #eaffea;
}

@media (max-width: 600px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
  .picker-body {
    grid-template-columns: 1fr;
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
