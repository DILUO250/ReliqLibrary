<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { LibrarianSheet, Passive, Mechanism, ResistValue, BattleCard, TermFormat } from '@rtl/shared'
import { BATTLE_SYSTEMS, statusTags, speedPassiveTemplates, defaultSpeedPassive } from '@rtl/shared'
import StsCard from './StsCard.vue'
import CardEditor from './CardEditor.vue'
import TermInserter from './TermInserter.vue'
import FormatEditor from './FormatEditor.vue'
import RenderedText from '@/features/turris/terms/RenderedText.vue'
import type { PrivateTerm } from '@/features/turris/terms/renderer'
import { formatToCss } from '@/features/turris/terms/format'

const props = defineProps<{ sheet: LibrarianSheet; readonly?: boolean }>()

const RESIST_VALUES: Array<{ v: ResistValue; label: string }> = [
  { v: 0.5, label: '耐性' },
  { v: 1.0, label: '一般' },
  { v: 1.5, label: '脆弱' },
]

const system = computed(() => BATTLE_SYSTEMS[props.sheet.battleSystem])
const mechTypes = statusTags.map((t) => t.name)

interface SpeedOption extends Passive {
  custom?: boolean
}
/** 系统固定被动「速战速决」的可选变体；当前值不在模板内时额外追加一个自定义占位。 */
const speedOptions = computed<SpeedOption[]>(() => {
  const tpl = speedPassiveTemplates(props.sheet.battleSystem).map((t) => ({ ...t, custom: false }))
  const cur = props.sheet.passives?.[0]?.name ?? ''
  if (cur && !tpl.some((o) => o.name === cur)) {
    return [{ name: cur, effect: props.sheet.passives[0]?.effect ?? '', custom: true }, ...tpl]
  }
  return tpl
})
function onSpeedSelect(p: Passive): void {
  const opt = speedPassiveTemplates(props.sheet.battleSystem).find((o) => o.name === p.name)
  if (opt) p.effect = opt.effect
}

function addPassive(): void {
  props.sheet.passives.push({ name: '', effect: '' })
}
function removePassive(i: number): void {
  if (i === 0) return
  props.sheet.passives.splice(i, 1)
}
function insertAtPassive(i: number, text: string): void {
  const p = props.sheet.passives[i]
  if (p) p.effect += text
}

function addMechanism(): void {
  props.sheet.mechanisms.push({ name: '', stack: '', type: '', desc: '' })
}
function removeMechanism(i: number): void {
  props.sheet.mechanisms.splice(i, 1)
}
function insertAtMechanism(i: number, text: string): void {
  const m = props.sheet.mechanisms[i]
  if (m) m.desc += text
}

function addCard(list: 'combat' | 'special'): void {
  props.sheet.cards[list].push({
    name: '',
    cost: 0,
    type: '',
    tags: [],
    effects: [''],
    dice: [],
  } as BattleCard)
}
function removeCard(list: 'combat' | 'special', i: number): void {
  props.sheet.cards[list].splice(i, 1)
}
function duplicateCard(list: 'combat' | 'special', i: number): void {
  const clone = JSON.parse(JSON.stringify(props.sheet.cards[list][i])) as BattleCard
  props.sheet.cards[list].splice(i + 1, 0, clone)
}

function autoGrow(e: Event): void {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function sysData(): NonNullable<LibrarianSheet['systemData']> {
  if (!props.sheet.systemData) props.sheet.systemData = {}
  return props.sheet.systemData
}

function hasSanity(): boolean {
  const d = sysData()
  return (
    d.hasSanity ??
    (d.sanityMax != null ||
      d.sanityMin != null ||
      !!d.sanityGainCond ||
      !!d.sanityLossCond ||
      !!d.panicType ||
      !!d.panicLow ||
      !!d.panicPanic)
  )
}
function hasEgo(): boolean {
  const d = sysData()
  return d.hasEgo ?? (!!d.egoManifest || !!d.distortionName)
}
function hasMind(): boolean {
  const d = sysData()
  return d.hasMind ?? (!!d.mind?.name || !!d.mind?.effect)
}
function setToggle(flag: 'hasSanity' | 'hasEgo' | 'hasMind', on: boolean, clear: () => void): void {
  const d = sysData()
  d[flag] = on
  if (!on) clear()
}
function toggleSanity(e: Event): void {
  const on = (e.target as HTMLInputElement).checked
  setToggle('hasSanity', on, () => {
    const d = sysData()
    d.sanityMax = undefined
    d.sanityMin = undefined
    d.sanityGainCond = undefined
    d.sanityLossCond = undefined
    d.panicType = undefined
    d.panicLow = undefined
    d.panicPanic = undefined
  })
}
function toggleEgo(e: Event): void {
  const on = (e.target as HTMLInputElement).checked
  setToggle('hasEgo', on, () => {
    const d = sysData()
    d.egoManifest = undefined
    d.distortionName = undefined
  })
}
function toggleMind(e: Event): void {
  const on = (e.target as HTMLInputElement).checked
  setToggle('hasMind', on, () => {
    sysData().mind = undefined
  })
}

const egoMode = ref<'distortion' | 'ego'>('distortion')
function setEgoMode(mode: 'distortion' | 'ego'): void {
  egoMode.value = mode
}

watch(
  () => hasMind(),
  (on) => {
    if (on) {
      const d = sysData()
      if (!d.mind || typeof d.mind === 'string') {
        d.mind = {
          name: '心-',
          effect: typeof d.mind === 'string' ? d.mind : '',
          format: { color: '#e6c15a', bold: false, italic: false, underline: 'none' },
        }
      }
    }
  },
  { immediate: true },
)

function mindFormat(): TermFormat {
  const d = sysData()
  if (!d.mind) {
    d.mind = {
      name: '心-',
      effect: '',
      format: { color: '#e6c15a', bold: false, italic: false, underline: 'none' },
    }
  }
  if (!d.mind.format) {
    d.mind.format = { color: '#e6c15a', bold: false, italic: false, underline: 'none' }
  }
  return d.mind.format
}

function mechFormat(m: Mechanism): TermFormat {
  if (!m.format) {
    m.format = { color: '#e6c15a', bold: false, italic: false, underline: 'none' }
  }
  return m.format
}

const privateTerms = computed<PrivateTerm[]>(() => {
  const list: PrivateTerm[] = []
  for (const m of props.sheet.mechanisms) {
    if (m.name && m.format) list.push({ name: m.name, format: m.format })
  }
  const mind = props.sheet.systemData?.mind
  if (mind?.name && mind.format) list.push({ name: mind.name, format: mind.format })
  return list
})

function addEgoCard(): void {
  const list = props.sheet.cards.ego ?? (props.sheet.cards.ego = [])
  list.push({
    name: '',
    cost: 0,
    type: '',
    tags: [],
    effects: [''],
    dice: [],
  } as BattleCard)
}
function removeEgoCard(i: number): void {
  props.sheet.cards.ego?.splice(i, 1)
}
function duplicateEgoCard(i: number): void {
  const list = props.sheet.cards.ego ?? []
  const clone = JSON.parse(JSON.stringify(list[i])) as BattleCard
  list.splice(i + 1, 0, clone)
}
</script>

<template>
  <div class="sheet-editor">
    <!-- 基础数值 -->
    <section class="sec">
      <h3>核心书页 · 基础数值</h3>
      <div class="grid">
        <label>体力</label>
        <input v-model.number="sheet.hp" type="number" />
        <label>混乱抗性</label>
        <input v-model.number="sheet.stagger" type="number" />
        <label>速度</label>
        <div class="pair">
          <input v-model.number="sheet.speedMin" type="number" min="1" />
          <span>~</span>
          <input v-model.number="sheet.speedMax" type="number" min="1" />
        </div>
      </div>
    </section>

    <!-- 抗性 -->
    <section class="sec">
      <h3>抗性</h3>
      <div class="resist-block">
        <div class="resist-col">
          <span class="r-title">物理伤害 → 体力条</span>
          <div class="resist-row">
            <span>斩</span>
            <select v-model="sheet.resist.physic.slash">
              <option v-for="o in RESIST_VALUES" :key="o.v" :value="o.v">{{ o.label }}</option>
            </select>
            <span>突</span>
            <select v-model="sheet.resist.physic.pierce">
              <option v-for="o in RESIST_VALUES" :key="o.v" :value="o.v">{{ o.label }}</option>
            </select>
            <span>打</span>
            <select v-model="sheet.resist.physic.strike">
              <option v-for="o in RESIST_VALUES" :key="o.v" :value="o.v">{{ o.label }}</option>
            </select>
          </div>
        </div>
        <div class="resist-col">
          <span class="r-title">混乱伤害 → 混乱条</span>
          <div class="resist-row">
            <span>斩</span>
            <select v-model="sheet.resist.chaos.slash">
              <option v-for="o in RESIST_VALUES" :key="o.v" :value="o.v">{{ o.label }}</option>
            </select>
            <span>突</span>
            <select v-model="sheet.resist.chaos.pierce">
              <option v-for="o in RESIST_VALUES" :key="o.v" :value="o.v">{{ o.label }}</option>
            </select>
            <span>打</span>
            <select v-model="sheet.resist.chaos.strike">
              <option v-for="o in RESIST_VALUES" :key="o.v" :value="o.v">{{ o.label }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- 被动能力 -->
    <section class="sec">
      <h3>被动能力</h3>
      <p class="hint">第 1 条为系统固定被动「速战速决」，从模板下拉中选取（效果由模板决定，不可编辑）；其余可自由增删。</p>
      <div v-for="(p, i) in sheet.passives" :key="i" class="passive-item">
        <span class="idx">{{ i + 1 }}.</span>
        <div class="passive-fields">
          <template v-if="i === 0">
            <select v-model="p.name" class="p-name" @change="onSpeedSelect(p)">
              <option v-for="o in speedOptions" :key="o.name" :value="o.name">
                {{ o.name }}{{ o.custom ? '（自定义）' : '' }}
              </option>
            </select>
            <div class="p-effect p-effect--readonly">
              <RenderedText :text="p.effect" />
            </div>
          </template>
          <template v-else>
            <input v-model="p.name" placeholder="被动名称" class="p-name" />
            <div class="p-effect">
              <textarea
                v-model="p.effect"
                rows="2"
                :style="{ minHeight: '44px' }"
                class="auto-grow"
                placeholder="被动效果（自动换行，可用「插入术语」）"
                @input="autoGrow"
              ></textarea>
              <TermInserter @insert="(t) => insertAtPassive(i, t)" />
            </div>
          </template>
        </div>
        <div class="p-ops">
          <button
            v-if="i === 0"
            type="button"
            class="mini"
            @click="sheet.passives[0] = defaultSpeedPassive(sheet.battleSystem)"
          >
            恢复模板默认
          </button>
          <button v-else type="button" class="x" @click="removePassive(i)">×</button>
        </div>
      </div>
      <button type="button" class="mini" @click="addPassive">+ 添加被动</button>
    </section>

    <!-- 特殊机制 -->
    <section class="sec">
      <h3>特殊机制</h3>
      <div v-for="(m, i) in sheet.mechanisms" :key="i" class="mech">
        <div class="mech-head">
          <span class="idx">{{ i + 1 }}.</span>
          <input v-model="m.name" placeholder="机制名称" />
          <input v-model="m.stack" placeholder="层数" class="mw-sm" />
          <select v-model="m.type" class="mw-lg">
            <option value="">分类</option>
            <option v-for="t in mechTypes" :key="t" :value="t">{{ t }}</option>
          </select>
          <button type="button" class="x" @click="removeMechanism(i)">×</button>
        </div>
        <div class="mech-desc">
          <textarea
            v-model="m.desc"
            rows="2"
            :style="{ minHeight: '44px' }"
            class="auto-grow"
            placeholder="机制描述"
            @input="autoGrow"
          ></textarea>
          <TermInserter @insert="(t) => insertAtMechanism(i, t)" />
        </div>
        <div class="mech-format">
          <span class="mech-preview" :style="formatToCss(mechFormat(m))">{{ m.name || '机制名' }}</span>
          <FormatEditor :format="mechFormat(m)" />
        </div>
      </div>
      <button type="button" class="mini" @click="addMechanism">+ 添加机制</button>
    </section>

    <!-- 系统专属信息（按系统差异化模板） -->
    <section v-if="system && system.id !== 'base'" class="sec">
      <h3>系统信息 · {{ system.zh }}（{{ system.code }}）</h3>
      <p class="hint">{{ system.desc }}</p>

      <div v-if="system.id === 'lob'" class="lob">
        <div class="sys-toggle">
          <label class="toggle-label">
            <input type="checkbox" :checked="hasSanity()" @change="toggleSanity" /> 理智值机制
          </label>
          <p class="hint">理智值介乎 -45 ~ +45，影响骰子数值分布；数值过低时会触发恐慌状态。</p>
          <div v-if="hasSanity()" class="grid lob-grid">
            <label>理智值上限</label>
            <input v-model.number="sheet.systemData!.sanityMax" type="number" placeholder="45" />
            <label>理智值下限</label>
            <input v-model.number="sheet.systemData!.sanityMin" type="number" placeholder="-45" />
          </div>
          <div v-if="hasSanity()" class="lob-block">
            <div class="lob-label">理智值增加条件</div>
            <textarea
              v-model="sheet.systemData!.sanityGainCond"
              rows="2"
              class="auto-grow"
              placeholder="理智值增加的条件描述（可用「插入术语」，如 “理智值”…）"
              @input="autoGrow"
            ></textarea>
            <TermInserter @insert="(t) => (sheet.systemData!.sanityGainCond = (sheet.systemData!.sanityGainCond ?? '') + t)" />
            <div class="lob-label" style="margin-top: 6px">理智值减少</div>
            <textarea
              v-model="sheet.systemData!.sanityLossCond"
              rows="2"
              class="auto-grow"
              placeholder="理智值减少的条件描述（可用「插入术语」，如 “理智值”…）"
              @input="autoGrow"
            ></textarea>
            <TermInserter @insert="(t) => (sheet.systemData!.sanityLossCond = (sheet.systemData!.sanityLossCond ?? '') + t)" />
          </div>
          <div v-if="hasSanity()" class="lob-block">
            <div class="lob-label">恐慌类型</div>
            <input v-model="sheet.systemData!.panicType" placeholder="如：威慑 / 狂乱" />
            <div class="panic-stage">
              <label>士气低落 - [{{ sheet.systemData!.panicType || '恐慌类型' }}]</label>
              <textarea
                v-model="sheet.systemData!.panicLow"
                rows="2"
                class="auto-grow"
                placeholder="士气低落阶段的负面效果描述"
                @input="autoGrow"
              ></textarea>
              <TermInserter @insert="(t) => (sheet.systemData!.panicLow = (sheet.systemData!.panicLow ?? '') + t)" />
            </div>
            <div class="panic-stage">
              <label>陷入恐慌 - [{{ sheet.systemData!.panicType || '恐慌类型' }}]</label>
              <textarea
                v-model="sheet.systemData!.panicPanic"
                rows="2"
                class="auto-grow"
                placeholder="陷入恐慌阶段的负面效果描述"
                @input="autoGrow"
              ></textarea>
              <TermInserter @insert="(t) => (sheet.systemData!.panicPanic = (sheet.systemData!.panicPanic ?? '') + t)" />
            </div>
          </div>
        </div>

        <div class="sys-toggle">
          <label class="toggle-label">
            <input type="checkbox" :checked="hasEgo()" @change="toggleEgo" /> 扭曲 &amp; EGO 展现机制
          </label>
          <p class="hint">情感等级到达上限后触发；EGO 展现与扭曲展现是对立状态。</p>
          <div v-if="hasEgo()" class="lob-block">
            <div class="seg">
              <button
                type="button"
                class="seg-btn"
                :class="{ 'is-on': egoMode === 'distortion' }"
                @click="setEgoMode('distortion')"
              >
                扭曲展现
              </button>
              <button
                type="button"
                class="seg-btn"
                :class="{ 'is-on': egoMode === 'ego' }"
                @click="setEgoMode('ego')"
              >
                EGO 展现
              </button>
            </div>
            <div v-if="egoMode === 'distortion'" class="grid lob-grid">
              <label>扭曲展现</label>
              <input v-model="sheet.systemData!.distortionName" placeholder="扭曲形态名" />
            </div>
            <div v-else class="grid lob-grid">
              <label>EGO 展现</label>
              <input v-model="sheet.systemData!.egoManifest" placeholder="觉醒形态名" />
            </div>
          </div>
        </div>

        <div class="sys-toggle">
          <label class="toggle-label">
            <input type="checkbox" :checked="hasMind()" @change="toggleMind" /> 心 &amp; 望机制
          </label>
          <p class="hint">满足条件后获得的特殊正面状态；必定带有一个分类为「心」的专属 buff。</p>
          <div v-if="hasMind()" class="lob-block">
            <div class="grid lob-grid">
              <label>分类</label>
              <input :value="'心'" disabled />
              <label>Buff 名称</label>
              <input v-model="sheet.systemData!.mind!.name" placeholder="心-xxx" />
            </div>
            <div class="panic-stage">
              <label>效果</label>
              <textarea
                v-model="sheet.systemData!.mind!.effect"
                rows="2"
                class="auto-grow"
                placeholder="Buff 效果描述"
                @input="autoGrow"
              ></textarea>
              <TermInserter @insert="(t) => (sheet.systemData!.mind!.effect = (sheet.systemData!.mind!.effect ?? '') + t)" />
            </div>
            <div class="panic-stage">
              <label>字体格式</label>
              <div class="mech-format">
                <span class="mech-preview" :style="formatToCss(mindFormat())">{{ sheet.systemData!.mind!.name || '心-xxx' }}</span>
                <FormatEditor :format="mindFormat()" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预留其他系统的信息面板位置 -->
      <div v-else class="sys-reserve">
        <span class="tag">预留</span>
        <p class="hint">该系统的专属信息面板将在后续版本补充（已为此处预留位置）。</p>
      </div>
    </section>

    <!-- 战斗卡组 -->
    <section class="sec">
      <h3>战斗卡牌（{{ sheet.cards.combat.length }}）</h3>
      <CardEditor v-for="(c, i) in sheet.cards.combat" :key="'cp'+i" :card="c" render-terms :private-terms="privateTerms" @duplicate="duplicateCard('combat', i)" @remove="removeCard('combat', i)" />
      <button type="button" class="mini" @click="addCard('combat')">+ 添加战斗卡</button>
    </section>

    <section class="sec">
      <h3>特殊卡牌（{{ sheet.cards.special.length }}）</h3>
      <CardEditor v-for="(c, i) in sheet.cards.special" :key="'sp'+i" :card="c" render-terms :private-terms="privateTerms" @duplicate="duplicateCard('special', i)" @remove="removeCard('special', i)" />
      <button type="button" class="mini" @click="addCard('special')">+ 添加特殊卡</button>
    </section>

    <section class="sec">
      <h3>EGO 卡牌（{{ sheet.cards.ego?.length ?? 0 }}）</h3>
      <p v-if="!sheet.cards.ego?.length" class="hint">仅 LOB 系统使用；情感等级达到Ⅲ/Ⅳ/Ⅴ 级时从中抽取。</p>
      <CardEditor v-for="(c, i) in sheet.cards.ego ?? []" :key="'ego'+i" :card="c" render-terms :private-terms="privateTerms" @duplicate="duplicateEgoCard(i)" @remove="removeEgoCard(i)" />
      <button type="button" class="mini" @click="addEgoCard">+ 添加 EGO 卡</button>
    </section>

    <!-- 卡组总览 -->
    <section class="sec">
      <h3>卡组总览</h3>
      <div v-if="sheet.cards.combat.length + sheet.cards.special.length + (sheet.cards.ego?.length ?? 0) === 0" class="hint">
        尚无卡牌，在上方添加。
      </div>
      <div class="deck-grid">
        <StsCard v-for="(c, i) in sheet.cards.combat" :key="'dg'+i" :card="c" :height="260" render-terms :private-terms="privateTerms" />
        <StsCard v-for="(c, i) in sheet.cards.special" :key="'dgs'+i" :card="c" :height="260" render-terms :private-terms="privateTerms" />
        <StsCard v-for="(c, i) in sheet.cards.ego ?? []" :key="'dge'+i" :card="c" :height="260" render-terms :private-terms="privateTerms" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.sheet-editor {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.sec {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: 16px;
  background: rgba(32, 26, 20, 0.3);
}
.sec h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--accent);
  font-weight: 700;
}
.grid {
  display: grid;
  grid-template-columns: 110px 1fr 110px 1fr;
  gap: 12px 16px;
  align-items: center;
}
.grid label {
  font-size: 12px;
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
  padding: 9px 11px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
input:focus,
select:focus,
textarea:focus {
  border-color: var(--accent);
}
.pair {
  display: flex;
  align-items: center;
  gap: 6px;
}
.resist-block {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}
.resist-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.r-title {
  font-size: 12px;
  color: var(--color-ink-dim);
}
.resist-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.resist-row select {
  width: 76px;
}
.idx {
  min-width: 22px;
  color: var(--accent);
  font-weight: 700;
  text-align: right;
  line-height: 1.6;
  padding-top: 0;
}
.passive-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.passive-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.p-name {
  width: 240px;
}
.p-effect {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.p-effect--readonly {
  display: block;
  line-height: 1.8;
  font-size: 14px;
  color: var(--color-ink-dim);
  white-space: pre-wrap;
  padding: 2px 0;
}
.auto-grow {
  flex: 1;
  resize: none;
  overflow-y: hidden;
  line-height: 1.6;
}
.p-ops {
  flex-shrink: 0;
}
.mech-head,
.mech-desc {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.mech {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: 10px;
  margin-bottom: 10px;
}
.mech-head input {
  flex: 2;
  min-width: 150px;
}
.mw-sm {
  width: 70px !important;
}
.mw-lg {
  width: 130px !important;
}
.mech-desc .auto-grow {
  min-width: 0;
}
.mech-format {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-line);
}
.mech-preview {
  font-size: 15px;
  font-weight: 700;
}
.sys-reserve {
  padding: 14px;
  border: 1px dashed var(--color-line);
  border-radius: var(--radius);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  gap: 10px;
}
.tag {
  font-size: 12px;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
  padding: 1px 8px;
  flex-shrink: 0;
}
.lob {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sys-toggle {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: 12px 14px;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-ink);
  cursor: pointer;
  font-weight: 600;
}
.toggle-label input {
  width: auto;
  margin: 0;
  flex-shrink: 0;
}
.lob-grid {
  margin-top: 4px;
}
.lob-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-line);
}
.lob-label {
  font-size: 12px;
  color: var(--color-ink-dim);
  font-weight: 600;
}
.panic-stage {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.panic-stage label {
  font-size: 12px;
  color: var(--accent);
}
.panic-stage .auto-grow {
  resize: none;
  overflow-y: hidden;
  line-height: 1.6;
}
.seg {
  display: inline-flex;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  overflow: hidden;
  align-self: flex-start;
}
.seg-btn {
  background: transparent;
  border: none;
  color: var(--color-ink-dim);
  font-size: 13px;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.seg-btn.is-on {
  background: var(--accent);
  color: #1b1408;
  font-weight: 600;
}
.mini {
  background: transparent;
  border: 1px dashed var(--color-line);
  color: var(--color-ink-dim);
  border-radius: var(--radius);
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
}
.mini:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.x {
  background: none;
  border: none;
  color: var(--color-ink-faint);
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}
.hint {
  font-size: 12px;
  color: var(--color-ink-faint);
  margin: 2px 0 8px;
}
.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
</style>
