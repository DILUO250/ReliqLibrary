<script setup lang="ts">
import { reactive } from 'vue'
import type { EmotionEntity, EmotionSheet, EgoCard, Mechanism, TermFormat } from '@rtl/shared'
import {
  EMOTION_PAGE_MAX,
  emptyEgoCard,
  emptyEmotionPage,
  emptyEmotionSheet,
  normalizeCard,
  parseEmotionSheet,
  statusTags,
} from '@rtl/shared'
import Modal from './Modal.vue'
import CardEditor from './CardEditor.vue'
import FormatEditor from './FormatEditor.vue'
import TermInserter from './TermInserter.vue'
import { formatToCss } from '@/features/turris/terms/format'

const props = defineProps<{
  entity: EmotionEntity | null
  floorId: number | null
  floorLabel?: string
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: Record<string, unknown>): void
  (e: 'close'): void
}>()

function resolveSheet(entity: EmotionEntity | null): EmotionSheet {
  if (entity) {
    const parsed = parseEmotionSheet(entity.sheet)
    if (parsed) return parsed
  }
  return emptyEmotionSheet()
}

const form = reactive({
  code: props.entity?.code ?? '',
  name: props.entity?.name ?? '',
  sheet: resolveSheet(props.entity),
})

const saveError = reactive<{ msg: string | null }>({ msg: null })

/* ---------- 情感书页（1~9 张） ---------- */
function addPage(): void {
  if (form.sheet.pages.length >= EMOTION_PAGE_MAX) return
  form.sheet.pages.push(emptyEmotionPage())
}
function removePage(i: number): void {
  if (form.sheet.pages.length <= 1) return
  form.sheet.pages.splice(i, 1)
}
function duplicatePage(i: number): void {
  if (form.sheet.pages.length >= EMOTION_PAGE_MAX) return
  const clone = JSON.parse(JSON.stringify(form.sheet.pages[i])) as EmotionSheet['pages'][number]
  form.sheet.pages.splice(i + 1, 0, clone)
}
function movePage(i: number, dir: -1 | 1): void {
  const j = i + dir
  if (j < 0 || j >= form.sheet.pages.length) return
  const [p] = form.sheet.pages.splice(i, 1)
  form.sheet.pages.splice(j, 0, p!)
}
/* ---------- 特殊机制（与司书 Mechanism 同构；机制名纳入实体私人词典） ---------- */
const mechTypes = statusTags.map((t) => t.name)

function addMechanism(i: number): void {
  form.sheet.pages[i]?.mechanisms.push({ name: '', stack: '', type: '', desc: '' })
}
function removeMechanism(i: number, mi: number): void {
  form.sheet.pages[i]?.mechanisms.splice(mi, 1)
}
function duplicateMechanism(i: number, mi: number): void {
  const page = form.sheet.pages[i]
  if (!page) return
  const clone = JSON.parse(JSON.stringify(page.mechanisms[mi])) as Mechanism
  page.mechanisms.splice(mi + 1, 0, clone)
}
function insertAtMechanismDesc(i: number, mi: number, text: string): void {
  const m = form.sheet.pages[i]?.mechanisms[mi]
  if (m) m.desc += text
}
function mechFormat(m: Mechanism): TermFormatOf {
  if (!m.format) {
    m.format = { color: '#e6c15a', bold: false, italic: false, underline: 'none' }
  }
  return m.format
}
type TermFormatOf = NonNullable<Mechanism['format']>
function insertAtPageEffect(i: number, text: string): void {
  const p = form.sheet.pages[i]
  if (p) p.effect += text
}

/* ---------- EGO 卡牌 ---------- */
function addEgo(): void {
  form.sheet.egoCards.push(emptyEgoCard())
}
function removeEgo(i: number): void {
  form.sheet.egoCards.splice(i, 1)
}
function duplicateEgo(i: number): void {
  const clone = JSON.parse(JSON.stringify(form.sheet.egoCards[i])) as EgoCard
  form.sheet.egoCards.splice(i + 1, 0, clone)
}
function insertAtEgoPassive(i: number, text: string): void {
  const c = form.sheet.egoCards[i]
  if (!c) return
  c.egoPassive = c.egoPassive ?? { name: '', effect: '' }
  c.egoPassive.effect += text
}
for (const c of form.sheet.egoCards) normalizeCard(c)

function submit(): void {
  if (!form.name.trim()) {
    saveError.msg = '异常实体名称不能为空'
    return
  }
  saveError.msg = null
  emit('save', {
    floorId: props.floorId,
    code: form.code,
    name: form.name,
    sheet: JSON.stringify(form.sheet),
  })
}
</script>

<template>
  <Modal
    :title="entity ? `编辑情感实体 · ${entity.name}` : '新建情感实体'"
    wide
    @close="emit('close')"
  >
    <p v-if="floorLabel" class="floor-label">隶属楼层：{{ floorLabel }}</p>

    <div class="head-grid">
      <label>实体编号</label>
      <input v-model="form.code" placeholder="如：SCL-88892（可留空）" />
      <label>异常实体名称</label>
      <input v-model="form.name" placeholder="如：欢乐泰迪" />
    </div>

    <!-- 情感书页 -->
    <div class="section">
      <div class="section__head">
        <h3>📙 情感书页（1~{{ EMOTION_PAGE_MAX }} 张）</h3>
        <button type="button" class="btn btn--sm" :disabled="form.sheet.pages.length >= EMOTION_PAGE_MAX" @click="addPage">
          ＋ 添加书页
        </button>
      </div>

      <div v-for="(p, i) in form.sheet.pages" :key="i" class="page-block">
        <div class="page-block__head">
          <span class="page-block__no">{{ i + 1 }}.</span>
          <div class="page-block__ops">
            <button type="button" class="mini" :disabled="i === 0" @click="movePage(i, -1)">↑</button>
            <button type="button" class="mini" :disabled="i === form.sheet.pages.length - 1" @click="movePage(i, 1)">↓</button>
            <button type="button" class="mini" @click="duplicatePage(i)">复制</button>
            <button
              type="button"
              class="mini mini--danger"
              :disabled="form.sheet.pages.length <= 1"
              @click="removePage(i)"
            >
              删除
            </button>
          </div>
        </div>
        <div class="page-grid">
          <label>书页名称</label>
          <input v-model="p.name" placeholder="如：思念的拥抱" />
          <label>所需情感点数</label>
          <input v-model="p.cost" placeholder="如：正面Ⅰ / 负面Ⅱ / 正面Ⅱ/负面Ⅱ" />
        </div>
        <div class="effect-field">
          <label>效果</label>
          <textarea v-model="p.effect" rows="2" placeholder="【选择一名司书】…"></textarea>
          <TermInserter @insert="(t: string) => insertAtPageEffect(i, t)" />
        </div>
        <div class="mech-field">
          <div class="mech-field__head">
            <label><span class="sq">▪️</span> 特殊机制（0~n 条 · 机制名纳入私人词典）</label>
            <button type="button" class="mini" @click="addMechanism(i)">＋ 添加机制</button>
          </div>
          <div v-for="(m, mi) in p.mechanisms" :key="mi" class="mech-item">
            <div class="mech-item__head">
              <input v-model="m.name" placeholder="机制名称" class="mech-item__name" />
              <input v-model="m.stack" placeholder="层数" class="mw-sm" />
              <select v-model="m.type" class="mw-lg">
                <option value="">分类</option>
                <option v-for="t in mechTypes" :key="t" :value="t">{{ t }}</option>
              </select>
              <button type="button" class="mini" @click="duplicateMechanism(i, mi)">复制</button>
              <button type="button" class="x" @click="removeMechanism(i, mi)">×</button>
            </div>
            <div class="mech-item__desc">
              <textarea v-model="m.desc" rows="2" placeholder="机制描述（可用「插入术语」）"></textarea>
              <TermInserter @insert="(t: string) => insertAtMechanismDesc(i, mi, t)" />
            </div>
            <div class="mech-item__format">
              <span class="mech-preview" :style="formatToCss(mechFormat(m))">{{ m.name || '机制名' }}</span>
              <FormatEditor :format="mechFormat(m)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EGO 卡牌 -->
    <div class="section section--ego">
      <div class="section__head">
        <h3 class="ego-title">⚔️ EGO卡牌（默认 1 张，可增删）</h3>
        <button type="button" class="btn btn--sm" @click="addEgo">＋ 添加EGO卡牌</button>
      </div>
      <p class="hint">卡牌格式与常规战斗卡牌一致；每张 EGO 卡牌下方各带一条 EGO被动。</p>

      <div v-for="(c, i) in form.sheet.egoCards" :key="i" class="ego-block">
        <div class="ego-block__head">
          <span class="ego-block__no">EGO {{ i + 1 }}</span>
        </div>
        <CardEditor :card="c" @duplicate="duplicateEgo(i)" @remove="removeEgo(i)" />
        <div class="passive-block">
          <div class="passive-grid">
            <label>EGO被动 · 名称</label>
            <input v-model="c.egoPassive!.name" placeholder="如：涌出的爱意" />
            <label>EGO被动 · 描述</label>
            <input v-model="c.egoPassive!.effect" placeholder="如：卡牌降低的费用可以跨舞台继承" />
          </div>
          <TermInserter @insert="(t: string) => insertAtEgoPassive(i, t)" />
        </div>
      </div>
    </div>

    <template #footer>
      <span v-if="saveError.msg" class="error">{{ saveError.msg }}</span>
      <button type="button" class="btn btn--ghost" @click="emit('close')">取消</button>
      <button type="button" class="btn btn--primary" :disabled="saving" @click="submit">
        {{ saving ? '保存中…' : '保存实体' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.floor-label {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--color-ink-faint);
}
.head-grid {
  display: grid;
  grid-template-columns: 110px 1fr 110px 1fr;
  gap: 10px 14px;
  align-items: center;
  margin-bottom: 16px;
}
.head-grid label,
.page-grid label,
.effect-field > label,
.mech-field label,
.passive-grid label {
  font-size: 13px;
  color: var(--color-ink-dim);
  white-space: nowrap;
}
.head-grid input,
.page-grid input,
.effect-field textarea,
.passive-grid input {
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
.head-grid input:focus,
.page-grid input:focus,
.effect-field textarea:focus,
.passive-grid input:focus {
  border-color: var(--accent);
}
.section {
  margin-bottom: 18px;
}
.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.section__head h3 {
  margin: 0;
  font-size: 15px;
  color: var(--color-ink);
}
.ego-title {
  color: #f5d87e;
}
.ego-block {
  border: 1px solid rgba(240, 199, 94, 0.35);
  border-radius: var(--radius);
  background: linear-gradient(150deg, rgba(38, 30, 10, 0.35), rgba(20, 17, 10, 0.5));
  padding: 12px;
  margin-bottom: 14px;
}
.ego-block__head {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.ego-block__no {
  font-family: var(--font-display);
  font-size: 12px;
  color: #f0c75e;
  letter-spacing: 0.08em;
}
.passive-block {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border-top: 1px dashed rgba(240, 199, 94, 0.35);
  padding-top: 10px;
}
.passive-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px 12px;
  align-items: center;
}
.page-block {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-bg);
  padding: 12px;
  margin-bottom: 10px;
}
.page-block__head {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.page-block__no {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--accent);
}
.page-block__ops {
  margin-left: auto;
  display: flex;
  gap: 6px;
}
.page-grid {
  display: grid;
  grid-template-columns: 110px 1fr 110px 1fr;
  gap: 10px 14px;
  align-items: center;
  margin-bottom: 10px;
}
.effect-field {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}
.effect-field textarea {
  flex: 1;
  min-width: 260px;
  resize: vertical;
  line-height: 1.6;
}
.mech-field {
  margin-top: 10px;
  border-left: 3px solid rgba(240, 199, 94, 0.5);
  padding: 6px 10px;
  background: rgba(240, 199, 94, 0.04);
  border-radius: var(--radius);
}
.mech-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mech-field__head label {
  font-size: 12.5px;
}
.sq {
  color: var(--accent);
}
/* 特殊机制编辑块（与司书机制编辑器同构） */
.mech-item {
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.mech-item__head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.mech-item__name {
  flex: 1;
  min-width: 140px;
}
.mw-sm {
  width: 90px;
  flex-shrink: 0;
}
.mw-lg {
  width: 150px;
  flex-shrink: 0;
}
.mech-item__head input,
.mech-item__head select,
.mech-item__desc textarea {
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  color: var(--color-ink);
  padding: 6px 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}
.mech-item__head input:focus,
.mech-item__head select:focus,
.mech-item__desc textarea:focus {
  border-color: var(--accent);
}
.mech-item__desc {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  margin-top: 8px;
}
.mech-item__desc textarea {
  flex: 1;
  min-width: 240px;
  resize: vertical;
  line-height: 1.6;
}
.mech-item__format {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
}
.mech-preview {
  font-size: 14px;
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
.btn--sm {
  padding: 4px 12px;
  font-size: 12px;
}
.btn:hover {
  border-color: var(--accent);
}
.btn:disabled {
  opacity: 0.45;
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
.mini {
  background: transparent;
  border: 1px dashed var(--color-line);
  color: var(--color-ink-dim);
  border-radius: var(--radius);
  padding: 3px 10px;
  font-size: 12px;
  cursor: pointer;
}
.mini:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.mini:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.mini--danger {
  color: #d9766a;
  border-color: rgba(217, 118, 106, 0.4);
}
.x {
  background: none;
  border: none;
  color: var(--color-ink-faint);
  cursor: pointer;
  font-size: 15px;
}
.hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--color-ink-faint);
}
.error {
  color: #e07a6b;
  font-size: 13px;
}
</style>
