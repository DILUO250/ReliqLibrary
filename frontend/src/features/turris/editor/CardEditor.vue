<script setup lang="ts">
import { computed, watch } from 'vue'
import type { BattleCard } from '@rtl/shared'
import {
  cardTypes,
  cardPrefixes,
  baseDice,
  specialDice,
  baseTags,
  generalTags,
  normalizeCard,
} from '@rtl/shared'
import TermInserter from './TermInserter.vue'
import StsCard from './StsCard.vue'
import type { PrivateTerm } from '@/features/turris/terms/renderer'

const props = defineProps<{ card: BattleCard; renderTerms?: boolean; privateTerms?: PrivateTerm[] }>()
const emit = defineEmits<{ (e: 'duplicate'): void; (e: 'remove'): void }>()

const typeNames = cardTypes.map((t) => t.name)
const prefixNames = cardPrefixes.map((p) => p.name)
const baseDiceNames = baseDice.map((d) => d.name)
const specialDiceNames = specialDice.map((d) => d.name)
const tagNames = [...baseTags, ...generalTags].map((t) => t.name)

const DICE_EFFECT_MAX = 3

const isShm = computed(() => (props.card.prefix || '').trim().startsWith('SHM'))

watch(
  () => props.card.prefix,
  (p) => {
    const shm = (p || '').trim().startsWith('SHM')
    if (shm) {
      if (!props.card.hope) props.card.hope = { count: 1, cost: '', effect: '' }
    } else if (props.card.hope) {
      props.card.hope = undefined
    }
  },
  { immediate: true },
)

function addEffect(): void {
  props.card.effects.push('')
}
function removeEffect(i: number): void {
  if (props.card.effects.length > 1) props.card.effects.splice(i, 1)
}

function addTag(): void {
  props.card.tags.push('')
}
function removeTag(i: number): void {
  props.card.tags.splice(i, 1)
}

function insertAtEffect(i: number, text: string): void {
  props.card.effects[i] += text
}

function addDice(): void {
  props.card.dice.push({ baseType: '', specialType: '', rangeMin: undefined, rangeMax: undefined, effects: [''] })
}
function removeDice(i: number): void {
  props.card.dice.splice(i, 1)
}
function ensureEffects(d: (typeof props.card.dice)[number]): string[] {
  if (!Array.isArray(d.effects)) d.effects = d.effect ? [d.effect] : []
  return d.effects
}
function addDiceEffect(i: number): void {
  const d = props.card.dice[i]
  const effs = d && ensureEffects(d)
  if (effs && effs.length < DICE_EFFECT_MAX) effs.push('')
}
function removeDiceEffect(i: number, j: number): void {
  const d = props.card.dice[i]
  const effs = d && ensureEffects(d)
  if (effs && effs.length > 1) effs.splice(j, 1)
}
function insertAtDiceEffect(i: number, j: number, text: string): void {
  const d = props.card.dice[i]
  const effs = d && ensureEffects(d)
  if (effs) effs[j] = (effs[j] ?? '') + text
}

normalizeCard(props.card)
</script>

<template>
  <div class="card-editor">
    <div class="card-editor__preview">
      <StsCard :card="card" :height="320" :render-terms="renderTerms" :private-terms="privateTerms" />
    </div>

    <div class="card-editor__form">
      <div class="ce-ops">
        <button type="button" class="mini" @click="emit('duplicate')">复制此卡</button>
        <button type="button" class="mini mini--danger" @click="emit('remove')">删除此卡</button>
      </div>
      <div class="row">
        <select v-model="card.prefix" class="mw-sm">
          <option value="">前缀</option>
          <option v-for="p in prefixNames" :key="p" :value="p">{{ p }}</option>
        </select>
        <input v-model="card.name" placeholder="卡牌名称" />
        <input v-model.number="card.cost" type="number" class="mw-sm" placeholder="费用" />
      </div>

      <select v-model="card.type" class="mw-lg">
        <option value="">类型</option>
        <option v-for="t in typeNames" :key="t" :value="t">{{ t }}</option>
      </select>

      <div class="field">
        <label>标签</label>
        <div class="chips">
          <span v-for="(t, i) in card.tags" :key="i" class="chip">
            <input v-model="card.tags[i]" list="tag-options" :placeholder="`标签 ${i + 1}`" />
            <button type="button" class="x" @click="removeTag(i)">×</button>
          </span>
          <button type="button" class="mini" @click="addTag">+</button>
        </div>
        <datalist id="tag-options">
          <option v-for="t in tagNames" :key="t" :value="t" />
        </datalist>
      </div>

      <div class="field field--effect">
        <label class="field__head">📜 效果</label>
        <div v-for="(e, i) in card.effects" :key="i" class="line">
          <textarea v-model="card.effects[i]" rows="2" :placeholder="`效果 ${i + 1}`"></textarea>
          <TermInserter @insert="(t) => insertAtEffect(i, t)" />
          <button
            v-if="card.effects.length > 1"
            type="button"
            class="x"
            @click="removeEffect(i)"
          >
            ×
          </button>
        </div>
        <button type="button" class="mini" @click="addEffect">+ 添加效果</button>

        <div v-if="isShm && card.hope" class="hop-block">
          <label class="field__head">🌟 望</label>
          <div class="hop-grid">
            <label>最多触发次数</label>
            <input v-model.number="card.hope.count" type="number" min="0" />
            <label>每次触发消耗</label>
            <input v-model="card.hope.cost" placeholder="如：2点混乱抗性" />
            <label>每次触发效果</label>
            <input v-model="card.hope.effect" placeholder="如：卡牌造成的伤害+35%" />
          </div>
        </div>
      </div>

      <div class="field field--dice">
        <label class="field__head">🎲 骰子</label>
        <div v-for="(d, i) in card.dice" :key="i" class="dice-line">
          <div class="dice-head">
            <select v-model="d.baseType" class="bw">
              <option value="">基础骰</option>
              <option v-for="n in baseDiceNames" :key="n" :value="n">{{ n }}</option>
            </select>
            <select v-model="d.specialType" class="bw">
              <option value="">特殊</option>
              <option v-for="n in specialDiceNames" :key="n" :value="n">{{ n }}</option>
            </select>
            <div class="rng-wrap">
              <input v-model.number="d.rangeMin" type="number" class="rng" placeholder="最小" />
              <span class="rng-sep">-</span>
              <input v-model.number="d.rangeMax" type="number" class="rng" placeholder="最大" />
            </div>
            <button type="button" class="x" @click="removeDice(i)">×</button>
          </div>
          <div v-for="(eff, j) in d.effects" :key="j" class="dice-eff">
            <input v-model="d.effects[j]" :placeholder="`命中时效果 ${j + 1}`" class="w-full" />
            <TermInserter @insert="(t) => insertAtDiceEffect(i, j, t)" />
            <button
              v-if="d.effects.length > 1"
              type="button"
              class="x"
              @click="removeDiceEffect(i, j)"
            >
              ×
            </button>
          </div>
          <button
            v-if="d.effects.length < DICE_EFFECT_MAX"
            type="button"
            class="mini"
            @click="addDiceEffect(i)"
          >
            + 添加命中效果
          </button>
        </div>
        <button type="button" class="mini" @click="addDice">+ 添加骰子</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-editor {
  display: flex;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  margin-bottom: 14px;
}
.card-editor__preview {
  flex-shrink: 0;
}
.card-editor__form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.row {
  display: flex;
  gap: 10px;
}
.ce-ops {
  display: flex;
  justify-content: flex-end;
}
.mw-sm {
  width: 140px;
  flex-shrink: 0;
}
.mw-lg {
  width: 260px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field > label {
  font-size: 14px;
  color: var(--color-ink-dim);
}
.field__head {
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-ink) !important;
}
.field--effect {
  border-left: 3px solid #7fae6b;
  background: rgba(127, 174, 107, 0.06);
  padding: 10px 12px;
  border-radius: var(--radius);
}
.field--dice {
  border-left: 3px solid #6ba7ae;
  background: rgba(107, 167, 174, 0.06);
  padding: 10px 12px;
  border-radius: var(--radius);
}
.hop-block {
  margin-top: 8px;
  border-left: 3px solid var(--color-gold);
  background: rgba(201, 165, 60, 0.08);
  padding: 10px 12px;
  border-radius: var(--radius);
}
.hop-grid {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px 12px;
  align-items: center;
}
.hop-grid label {
  font-size: 12px;
  color: var(--color-ink-dim);
}
.chips,
.line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.dice-line {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-bg);
  padding: 8px 10px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dice-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.dice-eff {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.dice-eff:first-child {
  margin-top: 2px;
}
.rng-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.rng-sep {
  color: var(--color-ink-dim);
  font-family: var(--font-display);
}
.bw {
  width: 150px;
}
.rng {
  width: 72px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  padding: 3px 5px 3px 10px;
}
.chip input {
  border: none;
  background: transparent;
  color: var(--color-ink);
  font-size: 14px;
  outline: none;
  width: 120px;
}
.line textarea,
.hop-grid input,
.dice-line input,
.row input,
.row select,
.card-editor select {
  border: 1px solid var(--color-line);
  background: var(--color-bg);
  color: var(--color-ink);
  border-radius: var(--radius);
  padding: 9px 11px;
  font-size: 15px;
  font-family: inherit;
}
.card-editor select {
  cursor: pointer;
  min-height: 42px;
}
.card-editor select:focus,
.card-editor input:focus,
.card-editor textarea:focus {
  border-color: var(--accent);
  outline: none;
}
.line textarea {
  flex: 1;
  resize: vertical;
  min-height: 52px;
  line-height: 1.6;
}
.w-full {
  flex: 1;
  min-width: 150px;
  margin-top: 2px;
}
.x {
  background: none;
  border: none;
  color: var(--color-ink-faint);
  cursor: pointer;
  font-size: 16px;
}
.mini {
  background: transparent;
  border: 1px dashed var(--color-line);
  color: var(--color-ink-dim);
  border-radius: var(--radius);
  padding: 4px 14px;
  font-size: 13px;
  cursor: pointer;
}
.mini:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.mini--danger {
  color: #d9766a;
  border-color: rgba(217, 118, 106, 0.4);
}
.mini--danger:hover {
  border-color: #d9766a;
  color: #e28074;
}
</style>
