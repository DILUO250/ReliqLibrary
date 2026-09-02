<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { PlantEntity } from '@pvzwiki/types/plant'
import { WORLD_NAMES } from '@pvzwiki/types/plant'
import { plants, getFamilies } from '@pvzwiki/data/plants'
import {
  addCustomPlant,
  updateCustomPlant,
  isCodenameTaken,
  nextNumericId,
} from '@pvzwiki/store/customPlants'
import { showToast } from '@/app/stores/toast'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  /** edit 模式下传入要修改的自定义植物 */
  plant?: PlantEntity | null
}>()

const emit = defineEmits<{
  close: []
  saved: [entity: PlantEntity]
}>()

const form = reactive({
  codename: '',
  name: '',
  englishName: '',
  world: 'frontyard',
  familyCode: '',
  summary: '',
})

const error = ref('')
const codenameTouched = ref(false)

const codenamePattern = /^[a-zA-Z0-9_-]+$/

const worldOptions = Object.entries(WORLD_NAMES).map(([code, name]) => ({ code, name }))

const familyOptions = computed(() => getFamilies(plants))

const codenameValid = computed(() => {
  const code = form.codename.trim()
  if (!code) return false
  if (!codenamePattern.test(code)) return false
  if (props.mode === 'edit') return true
  return !isCodenameTaken(
    code,
    plants.map((p) => p.codename),
  )
})

const nameValid = computed(() => form.name.trim().length > 0)

const canSave = computed(() => codenameValid.value && nameValid.value)

// create 模式：英文名未手动改过代号时，自动用英文名生成代号建议
watch(
  () => form.englishName,
  (value) => {
    if (props.mode !== 'create' || codenameTouched.value) return
    const slug = value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
    form.codename = slug
  },
)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    error.value = ''
    if (props.mode === 'edit' && props.plant) {
      form.codename = props.plant.codename
      form.name = props.plant.name
      form.englishName = props.plant.englishName
      form.world = props.plant.world || 'frontyard'
      form.familyCode = props.plant.family?.code ?? ''
      form.summary = props.plant.summary
    } else {
      form.codename = ''
      form.name = ''
      form.englishName = ''
      form.world = 'frontyard'
      form.familyCode = ''
      form.summary = ''
      codenameTouched.value = false
    }
  },
)

function close(): void {
  emit('close')
}

function save(): void {
  if (!canSave.value) {
    if (!nameValid.value) error.value = '请填写植物名称'
    else if (!form.codename.trim()) error.value = '请填写植物代号'
    else if (!codenamePattern.test(form.codename.trim()))
      error.value = '代号只能包含英文字母、数字、下划线与连字符'
    else error.value = '该代号已被占用，请换一个'
    return
  }
  const family = familyOptions.value.find((f) => f.code === form.familyCode) ?? null
  try {
    if (props.mode === 'edit' && props.plant) {
      updateCustomPlant(props.plant.codename, {
        name: form.name.trim(),
        englishName: form.englishName.trim(),
        world: form.world,
        family: family ? { code: family.code, name: family.name, icon: family.icon } : null,
        summary: form.summary.trim(),
      })
      showToast('基础信息已保存')
      emit('saved', { ...props.plant })
    } else {
      const entity: PlantEntity = {
        codename: form.codename.trim(),
        numericId: nextNumericId(plants),
        name: form.name.trim(),
        englishName: form.englishName.trim(),
        image: '',
        world: form.world,
        family: family ? { code: family.code, name: family.name, icon: family.icon } : null,
        summary: form.summary.trim(),
        path: '',
      }
      addCustomPlant(entity)
      showToast('植物已建立档案')
      emit('saved', entity)
    }
  } catch {
    error.value = '保存失败，请重试'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="ed">
    <div v-if="open" class="creator-overlay" @click.self="close">
      <div class="creator-panel" role="dialog" aria-modal="true" aria-label="新建植物">
        <header class="creator-header">
          <h3>{{ mode === 'create' ? '新建植物档案' : '编辑基础信息' }}</h3>
          <button type="button" class="creator-close" aria-label="关闭" @click="close">×</button>
        </header>

        <div class="creator-body">
          <p class="creator-hint">
            {{
              mode === 'create'
                ? '建立档案后，可在详情页用「属性编辑器」与「立绘编辑器」继续完善图鉴内容。'
                : '代号建立后不可修改；名称、世界、家族与简介可随时调整。'
            }}
          </p>

          <div class="creator-grid">
            <label class="creator-field">
              <span>植物代号 *</span>
              <input
                v-model="form.codename"
                type="text"
                :disabled="mode === 'edit'"
                placeholder="如: winter_melon"
                spellcheck="false"
                @blur="codenameTouched = true"
              />
              <em v-if="mode === 'create' && form.codename && !codenameValid" class="creator-warn">
                {{ form.codename && !codenamePattern.test(form.codename) ? '仅限字母/数字/_/-' : '该代号已被占用' }}
              </em>
            </label>

            <label class="creator-field">
              <span>植物名称 *</span>
              <input v-model="form.name" type="text" placeholder="如: 冰西瓜" />
            </label>

            <label class="creator-field">
              <span>英文名</span>
              <input v-model="form.englishName" type="text" placeholder="Winter Melon" spellcheck="false" />
            </label>

            <label class="creator-field">
              <span>所属世界</span>
              <select v-model="form.world">
                <option v-for="w in worldOptions" :key="w.code" :value="w.code">{{ w.name }}</option>
              </select>
            </label>

            <label class="creator-field">
              <span>家族</span>
              <select v-model="form.familyCode">
                <option value="">无家族</option>
                <option v-for="f in familyOptions" :key="f.code" :value="f.code">{{ f.name }}</option>
              </select>
            </label>

            <label class="creator-field creator-field--wide">
              <span>一句话简介</span>
              <input v-model="form.summary" type="text" placeholder="图鉴卡片上的简短描述" />
            </label>
          </div>

          <p v-if="error" class="creator-error">{{ error }}</p>
        </div>

        <footer class="creator-footer">
          <button type="button" class="creator-btn creator-btn--ghost" @click="close">取消</button>
          <button
            type="button"
            class="creator-btn creator-btn--primary"
            :disabled="!canSave"
            @click="save"
          >
            {{ mode === 'create' ? '建立档案' : '保存修改' }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<style scoped>
.creator-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  display: flex;
}

.creator-panel {
  box-sizing: border-box;
  width: min(560px, 100%);
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

[data-theme='dark'] .creator-panel {
  background: #342d20;
  color: #f2e5c4;
  border-color: #8a6949;
}

.creator-header {
  background: #4b321f;
  color: #fff8dc;
  border-bottom: 3px solid #281a11;
  padding: 0.7rem 1rem;
  align-items: center;
  justify-content: space-between;
  flex: none;
  display: flex;
}

.creator-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.creator-close {
  background: none;
  border: none;
  color: #fff8dc;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.3rem;
}

.creator-body {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0.9rem;
  gap: 0.7rem;
  display: grid;
}

.creator-hint {
  color: #6d5a45;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

[data-theme='dark'] .creator-hint {
  color: #d4c19c;
}

.creator-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  display: grid;
}

.creator-field {
  gap: 0.3rem;
  display: grid;
}

.creator-field--wide {
  grid-column: 1 / -1;
}

.creator-field > span {
  font-size: 0.95rem;
  font-weight: 700;
  color: #6d5a45;
}

[data-theme='dark'] .creator-field > span {
  color: #d4c19c;
}

.creator-field input,
.creator-field select {
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

.creator-field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

[data-theme='dark'] .creator-field input,
[data-theme='dark'] .creator-field select {
  background: #211c16;
  border-color: #856747;
  color: #f5e9c8;
}

.creator-warn {
  color: #a34b2a;
  font-size: 0.78rem;
  font-style: normal;
}

.creator-error {
  color: #a34b2a;
  background: #a34b2a1a;
  border-radius: 6px;
  margin: 0;
  padding: 0.5rem 0.7rem;
  font-size: 0.9rem;
  font-weight: 700;
}

.creator-footer {
  border-top: 3px solid #281a11;
  padding: 0.7rem 1rem;
  justify-content: flex-end;
  gap: 0.6rem;
  flex: none;
  display: flex;
}

[data-theme='dark'] .creator-footer {
  border-top-color: #8a6949;
}

.creator-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.5rem 1.2rem;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
}

.creator-btn--primary {
  color: #fff;
  background: #4f8a45;
}

.creator-btn--primary:hover:enabled {
  background: #315a2c;
}

.creator-btn--primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.creator-btn--ghost {
  color: inherit;
  background: rgba(0, 0, 0, 0.08);
}

.creator-btn--ghost:hover {
  background: rgba(0, 0, 0, 0.16);
}

.ed-enter-active,
.ed-leave-active {
  transition: opacity 0.16s ease;
}

.ed-enter-from,
.ed-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .creator-grid {
    grid-template-columns: 1fr;
  }
}
</style>
