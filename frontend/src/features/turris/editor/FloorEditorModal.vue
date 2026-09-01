<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Floor, BattleSystemId } from '@rtl/shared'
import { BATTLE_SYSTEMS } from '@rtl/shared'
import { api } from '@/app/services/api'
import Modal from './Modal.vue'

const props = defineProps<{ floor: Floor | null; saving?: boolean }>()
const emit = defineEmits<{
  (e: 'save', payload: Record<string, unknown>): void
  (e: 'close'): void
}>()

interface Draft {
  name: string
  latinName: string
  code: string
  designation: string
  theme: string
  battleSystem: BattleSystemId
  description: string
  sortOrder: number
  artwork: string
}

const form = reactive<Draft>({
  name: props.floor?.name ?? '',
  latinName: props.floor?.latinName ?? '',
  code: props.floor?.code ?? '',
  designation: props.floor?.designation ?? '',
  theme: props.floor?.theme ?? '',
  battleSystem: props.floor?.battleSystem ?? 'base',
  description: props.floor?.description ?? '',
  sortOrder: props.floor?.sortOrder ?? 0,
  artwork: props.floor?.artwork ?? '',
})

const saveError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const systemOptions = computed(() =>
  Object.values(BATTLE_SYSTEMS).map((s) => ({ value: s.id, label: `${s.zh}(${s.code})` })),
)
const currentSystem = computed(() => BATTLE_SYSTEMS[form.battleSystem])

function submit(): void {
  if (!form.name.trim()) {
    saveError.value = '楼层名称不能为空'
    return
  }
  saveError.value = null
  emit('save', {
    name: form.name,
    latinName: form.latinName,
    code: form.code,
    designation: form.designation,
    theme: form.theme,
    battleSystem: form.battleSystem,
    description: form.description,
    sortOrder: form.sortOrder,
    artwork: form.artwork,
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
    form.artwork = res.url
  } catch (e) {
    saveError.value = `上传失败：${e instanceof Error ? e.message : String(e)}`
  }
}
async function generateArt(): Promise<void> {
  saveError.value = null
  const prompt = `遗迹图书馆迎书楼楼层背景图，${form.name || form.designation || '未命名'}，${form.theme || ''}，${form.description || '宏伟的图书馆内部'}，电影级构图，史诗氛围`.trim()
  try {
    const res = await api.generateArt(prompt)
    form.artwork = res.url
  } catch (e) {
    saveError.value = `生成失败：${e instanceof Error ? e.message : String(e)}`
  }
}
</script>

<template>
  <Modal :title="floor ? '编辑楼层' : '新建楼层'" @close="emit('close')">
    <div class="grid">
      <label>名称</label>
      <input v-model="form.name" placeholder="如：历史层" />
      <label>拉丁名</label>
      <input v-model="form.latinName" placeholder="可选" />
      <label>编号</label>
      <input v-model="form.code" placeholder="如：CT-1" />
      <label>代号</label>
      <input v-model="form.designation" placeholder="如：历史层" />
      <label>风格</label>
      <input v-model="form.theme" placeholder="如：火焰、烧伤" />
      <label>战斗系统</label>
      <select v-model="form.battleSystem">
        <option v-for="s in systemOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <label>排序</label>
      <input v-model.number="form.sortOrder" type="number" />
    </div>

    <div v-if="currentSystem" class="sys">
      <strong>{{ currentSystem.zh }}（{{ currentSystem.code }}）</strong>
      <p>{{ currentSystem.desc }}</p>
      <div class="stats">
        <span>费用上限 {{ currentSystem.costCap }}</span>
        <span>回费 {{ currentSystem.regen }}</span>
        <span>速度骰 {{ currentSystem.speedDice }}</span>
        <span>手牌 {{ currentSystem.handLimit }}</span>
        <span>抽牌 {{ currentSystem.draw }}</span>
        <span>牌组 {{ currentSystem.deckLimit }}</span>
      </div>
    </div>

    <label class="fullline">描述</label>
    <textarea v-model="form.description" rows="4" placeholder="楼层风格描述、场地氛围、司书出身等"></textarea>

    <label class="fullline">背景图</label>
    <div class="art">
      <div class="art__preview">
        <img v-if="form.artwork" :src="form.artwork" alt="背景图" />
        <span v-else class="ph">暂无背景图</span>
      </div>
      <div class="art__actions">
        <button type="button" class="btn" @click="triggerUpload">上传图片</button>
        <button type="button" class="btn" @click="generateArt">AI 生成</button>
        <button v-if="form.artwork" type="button" class="btn btn--danger" @click="form.artwork = ''">移除</button>
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display: none" @change="onFilePicked" />
      </div>
    </div>
    <p class="hint">AI 生成调用本机火山引擎 arkcli，需已登录且可用图片模型。</p>

    <template #footer>
      <span v-if="saveError" class="error">{{ saveError }}</span>
      <button type="button" class="btn btn--ghost" @click="emit('close')">取消</button>
      <button type="button" class="btn btn--primary" :disabled="saving" @click="submit">
        {{ saving ? '保存中…' : '保存楼层' }}
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
select,
textarea {
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
select:focus,
textarea:focus {
  border-color: var(--accent);
}
textarea {
  resize: vertical;
  margin-bottom: 12px;
}
.sys {
  padding: 12px;
  border: 1px dashed var(--color-line);
  border-radius: var(--radius);
  background: var(--color-bg);
  margin-bottom: 14px;
}
.sys strong {
  color: var(--accent);
}
.sys p {
  margin: 4px 0 8px;
  font-size: 13px;
  color: var(--color-ink-dim);
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 12px;
  color: var(--color-ink-faint);
}
.art {
  display: flex;
  gap: 14px;
  margin-bottom: 8px;
}
.art__preview {
  width: 220px;
  height: 132px;
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
.hint {
  font-size: 12px;
  color: var(--color-ink-faint);
}
.error {
  color: #e07a6b;
  font-size: 13px;
}
</style>
