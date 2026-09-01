<script setup lang="ts">
import { computed } from 'vue'
import type { BattleCard } from '@rtl/shared'
import { diceEffects, diceRangeLabel } from '@rtl/shared'
import RenderedText from '@/features/turris/terms/RenderedText.vue'
import type { PrivateTerm } from '@/features/turris/terms/renderer'

const props = defineProps<{
  card: BattleCard
  height?: number
  renderTerms?: boolean
  privateTerms?: PrivateTerm[]
}>()

const TYPE_COLOR: Record<string, string> = {
  近战: 'var(--turris)',
  远程: 'var(--armarium)',
  法术: 'var(--collegium)',
  先制近战: 'var(--turris)',
  能力: 'var(--color-gold)',
  守备: 'var(--color-gold)',
  群体攻击: 'var(--turris)',
  装备: 'var(--color-gold)',
  变化: 'var(--color-gold)',
  状态: 'var(--color-ink-faint)',
  诅咒: 'var(--color-ink-faint)',
}

const accent = computed(() => TYPE_COLOR[props.card.type] ?? 'var(--color-gold)')

// 特殊卡牌前缀 → 卡面主题（普通/未注明的前缀沿用默认）
const PREFIX_THEME: Record<
  string,
  { from: string; to: string; border: string; glow: string; tint: string; light?: boolean }
> = {
  'V.': {
    from: '#1E1826',
    to: '#7B4B9A',
    border: 'rgba(184,138,255,0.42)',
    glow: '#B88AFF',
    tint: 'rgba(184,138,255,0.14)',
  },
  'EGO.': {
    from: '#0e3b34',
    to: '#1d6b5a',
    border: '#12466b',
    glow: '#4fd1c5',
    tint: 'rgba(79,209,197,0.14)',
  },
  'DST.': {
    from: '#4A0E0E',
    to: '#B91C1C',
    border: '#5a2a2a',
    glow: '#ef4444',
    tint: 'rgba(185,28,28,0.18)',
  },
  'SHM.': {
    from: '#8B7500',
    to: '#FBBF24',
    border: '#a8801f',
    glow: '#FBBF24',
    tint: 'rgba(251,191,36,0.16)',
    light: true,
  },
}
const prefix = computed(() => props.card.prefix?.trim() ?? '')
const theme = computed(() => PREFIX_THEME[prefix.value] ?? null)
const isLight = computed(() => !!theme.value?.light)

const fullName = computed(
  () => `${props.card.prefix ? props.card.prefix + ' ' : ''}${props.card.name}`,
)

const hasDice = computed(() => props.card.dice && props.card.dice.length > 0)
const hasEffects = computed(
  () => props.card.effects && props.card.effects.some((e) => e.trim()),
)
</script>

<template>
  <article
    class="sts-card"
    :class="{ 'is-light-theme': isLight }"
    :style="{
      '--acc': accent,
      '--glow': theme ? theme.glow : accent,
      '--bg-from': theme ? theme.from : 'var(--color-surface-2)',
      '--bg-to': theme ? theme.to : 'var(--color-surface)',
      '--card-border': theme ? theme.border : 'var(--color-line)',
      '--frame-tint': theme ? theme.tint : 'rgba(201, 165, 60, 0.08)',
      '--card-h': height ? `${height}px` : 'auto',
    }"
  >
    <div class="sts-card__frame">
      <div class="sts-card__cost">{{ card.cost }}</div>

      <div class="sts-card__name">
        <span v-if="card.prefix" class="sts-card__prefix">{{ card.prefix }}</span>
        <span class="sts-card__name-text">{{ card.name || '未命名' }}</span>
      </div>

      <div class="sts-card__art">
        <span class="sts-card__art-type">{{ card.type || '—' }}</span>
        <span v-if="card.tags && card.tags.length" class="sts-card__art-tags">
          <i v-for="t in card.tags" :key="t" class="tag-chip">{{ t }}</i>
        </span>
      </div>

      <div class="sts-card__body">
        <ul v-if="hasEffects" class="sts-card__effects">
          <li v-for="(eff, i) in card.effects" :key="i">
            <RenderedText v-if="renderTerms" :text="eff" :private-terms="privateTerms" :on-light="isLight" />
            <template v-else>{{ eff }}</template>
          </li>
        </ul>

        <div v-if="card.hope" class="shi-hop">
          <span class="shi-hop__val">【望】：{{ card.hope.count }}层</span>
          <span class="shi-hop__sep">|</span>
          <span class="shi-hop__val">{{ card.hope.cost }}</span>
          <span class="shi-hop__sep">|</span>
          <span class="shi-hop__val">{{ card.hope.effect }}</span>
        </div>

        <div v-if="hasDice" class="sts-card__dice">
          <div v-for="(d, i) in card.dice" :key="i" class="dice-item">
            <div class="dice-row">
              <span class="dice-base">{{ d.baseType }}</span>
              <span v-if="d.specialType" class="dice-special">{{ d.specialType }}</span>
              <span v-if="diceRangeLabel(d)" class="dice-range">{{ diceRangeLabel(d) }}</span>
            </div>
            <div v-if="diceEffects(d).length" class="dice-effects">
              <div v-for="(eff, j) in diceEffects(d)" :key="j" class="dice-tail">
                <span v-if="eff.trim()" class="dice-effect">
                  <RenderedText v-if="renderTerms" :text="eff" :private-terms="privateTerms" :on-light="isLight" />
                  <template v-else>{{ eff }}</template>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sts-card__footer">
        <span class="sts-card__footer-type">{{ card.type }}</span>
        <span class="sts-card__footer-cost">{{ card.cost }} 点</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.sts-card {
  --acc: var(--color-gold);
  --glow: var(--acc);
  --bg-from: var(--color-surface-2);
  --bg-to: var(--color-surface);
  --card-border: var(--color-line);
  --frame-tint: rgba(201, 165, 60, 0.08);
  --card-h: auto;
  width: 200px;
  box-sizing: border-box;
}
.sts-card__frame {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: var(--card-h);
  border-radius: 10px;
  border: 1px solid var(--card-border);
  background:
    linear-gradient(160deg, var(--frame-tint), transparent 55%),
    linear-gradient(180deg, var(--bg-from), var(--bg-to));
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35),
    0 8px 22px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  padding: 34px 12px 10px;
}
.sts-card__cost {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: #1b1408;
  background: radial-gradient(circle at 35% 30%, #ffe9a8, var(--color-gold) 60%, #8a6d1e);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
.sts-card__name {
  position: absolute;
  top: 10px;
  left: 40px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 18px;
}
.sts-card__prefix {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--glow);
  letter-spacing: 0.05em;
}
.sts-card__name-text {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-ink);
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.sts-card__art {
  height: 92px;
  margin: 4px 0 10px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background:
    radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--glow) 40%, transparent), transparent 70%),
    var(--color-bg);
  border: 1px solid var(--color-line);
}
.sts-card__art-type {
  font-family: var(--font-kai);
  font-size: 20px;
  color: var(--glow);
  font-weight: 600;
}
.sts-card__art-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  max-width: 90%;
}
.tag-chip {
  font-style: normal;
  font-size: 10px;
  color: var(--color-ink-dim);
  border: 1px solid var(--color-line);
  border-radius: 999px;
  padding: 1px 6px;
  white-space: nowrap;
}
.sts-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-ink-dim);
}
.sts-card__effects {
  margin: 0;
  padding: 0 2px 0 14px;
}
.sts-card__effects li {
  white-space: pre-wrap;
}
.sts-card__effects li::marker {
  color: var(--glow);
}
.shi-hop {
  display: block;
  background: rgba(20, 14, 6, 0.85);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 6px;
  padding: 6px 8px;
  margin: 2px 0;
  color: var(--glow);
  font-size: 10.5px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.shi-hop__sep {
  margin: 0 4px;
  opacity: 0.7;
}
.sts-card__dice {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dice-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px dashed var(--color-line);
  border-radius: 6px;
  padding: 4px 6px;
}
.dice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.dice-base {
  font-weight: 700;
  color: var(--color-ink);
}
.dice-special {
  color: var(--glow);
  text-decoration: underline;
  text-decoration-style: dotted;
}
.dice-range {
  font-family: var(--font-display);
  color: var(--color-ink);
}
.dice-effects {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.dice-tail {
  display: block;
}
.dice-effect {
  color: var(--color-ink-faint);
}
.sts-card__footer {
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px solid var(--color-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: var(--color-ink-faint);
}
.sts-card__footer-type {
  color: var(--glow);
  font-weight: 600;
}

/* 浅底主题（SHM 金黄卡面）：正文/骰子文字改为深色以保证可读（词条字色由 onLight 处理）。 */
.is-light-theme .sts-card__body {
  color: #3d2c12;
}
.is-light-theme .tag-chip {
  color: #4a3818;
  border-color: rgba(74, 56, 24, 0.35);
}
.is-light-theme .dice-base,
.is-light-theme .dice-range {
  color: #3d2c12;
}
.is-light-theme .dice-special {
  color: #6b4c1a;
  text-decoration-color: #6b4c1a;
}
.is-light-theme .dice-effect {
  color: #5a441d;
}
.is-light-theme .sts-card__effects li::marker {
  color: #7a5a1f;
}
</style>
