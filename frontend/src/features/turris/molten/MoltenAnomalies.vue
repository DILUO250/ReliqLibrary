<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AnomalyEntity, Mechanism } from '@rtl/shared'
import { parseAnomalySheet } from '@rtl/shared'
import RenderedText from '@/features/turris/terms/RenderedText.vue'
import type { PrivateTerm } from '@/features/turris/terms/renderer'
import { formatToCss } from '@/features/turris/terms/format'
import ResponsiveVisualCard from './ResponsiveVisualCard.vue'
import { useSurfaceLight } from './useSurfaceLight'

const props = defineProps<{ entities: AnomalyEntity[]; floorLabel: string }>()
const emit = defineEmits<{ create: []; edit: [entity: AnomalyEntity] }>()
const query = ref('')
const selectedId = ref<number | null>(null)
const { onLight } = useSurfaceLight()

const filtered = computed(() => {
  const q = query.value.trim().toLocaleLowerCase()
  return !q ? props.entities : props.entities.filter((e) => `${e.code} ${e.name}`.toLocaleLowerCase().includes(q))
})
const current = computed(() => props.entities.find((e) => e.id === selectedId.value) ?? props.entities[0] ?? null)
const currentSheet = computed(() => current.value ? parseAnomalySheet(current.value.sheet) : null)
const privateTerms = computed<PrivateTerm[]>(() => {
  const terms: PrivateTerm[] = []
  for (const page of currentSheet.value?.pages ?? []) {
    for (const mechanism of page.mechanisms) {
      if (mechanism.name && mechanism.format) terms.push({ name: mechanism.name, format: mechanism.format })
    }
  }
  return terms
})
watch(() => props.entities, (entities) => {
  if (!entities.some((e) => e.id === selectedId.value)) selectedId.value = entities[0]?.id ?? null
}, { immediate: true })

function mechNameStyle(mechanism: Mechanism): Record<string, string> {
  return formatToCss(mechanism.format ?? { color: '#e6c15a', bold: false, italic: false, underline: 'none' }, onLight.value)
}
function costClass(cost: string): string {
  const positive = cost.includes('正面')
  const negative = cost.includes('负面')
  return positive && negative ? 'dual' : negative ? 'negative' : 'positive'
}
function pageCount(entity: AnomalyEntity): number {
  return parseAnomalySheet(entity.sheet)?.pages.length ?? 0
}
function glyphRadius(entity: AnomalyEntity): number {
  return 10 + entity.id % 4 * 2
}
</script>

<template>
  <div class="anomaly-browser">
    <aside class="anomaly-rail" aria-label="异常实体索引">
      <div class="anomaly-rail-head"><span>SCL / CONTAINMENT</span><b>异常编目 <i>{{ entities.length }}</i></b></div>
      <label class="anomaly-search"><span>⌕</span><input v-model="query" type="search" placeholder="检索编号或名称" /></label>
      <nav>
        <button v-for="entity in filtered" :key="entity.id" type="button" :class="{ active: current?.id === entity.id }" :aria-pressed="current?.id === entity.id" @click="selectedId = entity.id">
          <span>{{ entity.code || 'SCL-未编号' }}</span><b>&lt;{{ entity.name || '未命名' }}&gt;</b><i>{{ String(pageCount(entity)).padStart(2, '0') }}</i>
        </button>
        <p v-if="!filtered.length" class="entity-no-result">没有匹配的异常档案</p>
      </nav>
      <button type="button" class="entity-create" @click="emit('create')">＋ 新建异常档案</button>
    </aside>

    <div v-if="current" class="anomaly-file">
      <header class="anomaly-file-head">
        <div class="observation-window">
          <svg viewBox="0 0 120 120" aria-hidden="true"><path class="glyph-frame" d="M60 4 113 96 7 96Z" /><path class="glyph-line" d="M60 19v79M24 88h72M38 66l22-28 22 28M45 82l15-18 15 18" /><circle class="glyph-eye" cx="60" cy="66" :r="glyphRadius(current)" /><circle class="glyph-core" cx="60" cy="66" r="3" /><path class="glyph-tear" d="M13 102h30m34 0h30M60 4v13" /></svg>
          <span>OBSERVATION / 图像未归档</span>
        </div>
        <div class="anomaly-title"><span>{{ current.code || 'SCL-未编号' }} · ANOMALOUS ENTITY</span><h2>&lt;{{ current.name || '未命名' }}&gt;</h2><p>{{ floorLabel }} · 情感书页与异想体 EGO 档案</p><div><b>情感书页 {{ currentSheet?.pages.length ?? 0 }}</b><b>EGO {{ currentSheet?.egoCards.length ?? 0 }}</b><button type="button" @click="emit('edit', current)">编辑实体</button></div></div>
      </header>
      <div class="anomaly-warning"><span>档案阅读协议</span><i></i><p>书页效果保留原始编目文本；私人机制随所属实体一同阅读。</p></div>
      <div class="anomaly-columns">
        <section class="emotion-pages">
          <div class="anomaly-section-title"><span>Ⅰ</span><h3>情感书页</h3><b>EMOTION PAGES</b></div>
          <article v-for="(page, index) in currentSheet?.pages ?? []" :key="`${current.id}-page-${index}`" class="emotion-page">
            <header><span>{{ String(index + 1).padStart(2, '0') }}</span><h4>{{ page.name || '未命名书页' }}</h4><b :class="costClass(page.cost)">{{ page.cost || '—' }}</b></header>
            <p class="emotion-effect"><RenderedText :text="page.effect" :private-terms="privateTerms" :on-light="onLight" term-marker /></p>
            <div v-for="(mechanism, mechanismIndex) in page.mechanisms" :key="mechanismIndex" class="private-mechanism">
              <b class="private-mechanism__head">▪ <span :style="mechNameStyle(mechanism)">{{ mechanism.name }}</span><template v-if="mechanism.stack"><i class="private-mechanism__stack">{{ mechanism.stack }}层</i></template></b>
              <p><RenderedText :text="mechanism.desc" :private-terms="privateTerms" :on-light="onLight" term-marker /></p>
            </div>
          </article>
          <div v-if="!currentSheet?.pages.length" class="anomaly-empty">尚未收录情感书页</div>
        </section>
        <section class="ego-files">
          <div class="anomaly-section-title"><span>Ⅱ</span><h3>EGO 档案</h3><b>STANDARD CARD RENDERER</b></div>
          <article v-for="(card, index) in currentSheet?.egoCards ?? []" :key="`${current.id}-ego-${index}`" class="ego-file">
            <ResponsiveVisualCard :card="card" :private-terms="privateTerms" />
            <footer v-if="card.egoPassive && (card.egoPassive.name || card.egoPassive.effect)"><span>EGO 被动</span><b>{{ card.egoPassive.name }}</b><p><RenderedText :text="card.egoPassive.effect" :private-terms="privateTerms" :on-light="onLight" term-marker /></p></footer>
          </article>
          <div v-if="!currentSheet?.egoCards.length" class="anomaly-empty">尚未收录 EGO 卡牌</div>
        </section>
      </div>
    </div>
    <div v-else class="anomaly-file anomaly-file--empty"><span>∅</span><h2>本楼层暂无异常档案</h2><p>新建异常实体后，可在这里查阅情感书页与 EGO。</p><button type="button" @click="emit('create')">＋ 新建异常档案</button></div>
  </div>
</template>

<style scoped>
.anomaly-browser { --gold: var(--color-gold); display: grid; grid-template-columns: minmax(10rem, 12rem) minmax(0, 1fr); min-height: 42rem; background: var(--color-bg); }
.anomaly-rail { min-width: 0; display: flex; flex-direction: column; border-right: 1px solid var(--molten-line); background: linear-gradient(180deg, var(--color-surface-2), var(--color-bg)); }.anomaly-rail-head { padding: .9rem .8rem .7rem; border-bottom: 1px solid var(--molten-line); }.anomaly-rail-head > span { color: var(--molten-red-bright); font: .46rem var(--font-display); letter-spacing: .12em; }.anomaly-rail-head > b { display: flex; justify-content: space-between; margin-top: .25rem; font: 600 .78rem var(--font-serif); }.anomaly-rail-head i { color: var(--color-ink-faint); font: .6rem var(--font-display); font-style: normal; }
.anomaly-search { display: flex; align-items: center; margin: .65rem .65rem .45rem; border: 1px solid var(--molten-line); background: var(--color-surface); color: var(--color-ink-faint); }.anomaly-search span { padding-left: .45rem; }.anomaly-search input { width: 100%; min-width: 0; padding: .45rem; border: 0; outline: 0; background: transparent; color: var(--color-ink); font-size: .58rem; }.anomaly-search input:focus { box-shadow: inset 0 -1px var(--molten-red); }
.anomaly-rail nav { max-height: 39rem; overflow: auto; scrollbar-width: thin; scrollbar-color: var(--molten-red) var(--color-bg); }.anomaly-rail nav button { position: relative; width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .1rem .4rem; padding: .6rem .7rem; text-align: left; border: 0; border-bottom: 1px solid var(--molten-line); background: transparent; color: var(--color-ink-dim); cursor: pointer; }.anomaly-rail nav button > span { grid-column: 1 / -1; color: var(--color-ink-faint); font: .45rem var(--font-display); letter-spacing: .05em; overflow-wrap: anywhere; }.anomaly-rail nav button > b { min-width: 0; font: 500 .65rem var(--font-serif); overflow-wrap: anywhere; }.anomaly-rail nav button > i { color: var(--color-ink-faint); font: .48rem var(--font-display); font-style: normal; }.anomaly-rail nav button:hover { background: color-mix(in srgb, var(--molten-red) 8%, transparent); color: var(--color-ink); }.anomaly-rail nav button.active { background: var(--molten-red); color: var(--on-accent); clip-path: polygon(0 0, 100% 0, calc(100% - .5rem) 100%, 0 100%); }.anomaly-rail nav button.active > span, .anomaly-rail nav button.active > i { color: var(--on-accent); }
.entity-create { margin: auto .65rem .65rem; padding: .5rem; border: 1px solid var(--molten-line); background: transparent; color: var(--molten-red-bright); font-size: .58rem; cursor: pointer; }.entity-no-result { padding: 1rem; color: var(--color-ink-faint); font-size: .58rem; }
.anomaly-file { position: relative; min-width: 0; background: var(--color-surface); }.anomaly-file::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(112deg, transparent 0 5rem, color-mix(in srgb, var(--molten-red) 2%, transparent) 5rem 5.05rem); }
.anomaly-file-head { position: relative; display: grid; grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr); min-height: 11rem; border-bottom: 1px solid var(--molten-line); background: linear-gradient(105deg, color-mix(in srgb, var(--molten-red) 8%, var(--color-surface-2)), var(--color-surface) 60%); }.observation-window { display: grid; place-items: center; align-content: center; gap: .4rem; margin: 1rem; border: 1px solid var(--molten-line); background: var(--molten-dark); color: var(--molten-red-bright); clip-path: polygon(0 0, 100% 0, 100% calc(100% - .8rem), calc(100% - .8rem) 100%, 0 100%); }.observation-window svg { width: min(7rem, 80%); height: auto; }.observation-window > span { color: var(--molten-muted); font: .38rem var(--font-display); letter-spacing: .06em; }.glyph-frame, .glyph-line, .glyph-tear { fill: none; stroke: currentColor; stroke-width: 1; }.glyph-line { opacity: .4; }.glyph-eye { fill: none; stroke: currentColor; stroke-width: 1.4; }.glyph-core { fill: currentColor; }.glyph-tear { opacity: .6; }
.anomaly-title { align-self: center; min-width: 0; padding: 1rem 1rem 1rem 0; }.anomaly-title > span { color: var(--molten-red-bright); font: .5rem var(--font-display); letter-spacing: .1em; }.anomaly-title h2 { margin: .35rem 0; font: 600 clamp(1.3rem, 2.3vw, 1.9rem) var(--font-serif); letter-spacing: .06em; overflow-wrap: anywhere; }.anomaly-title > p { margin: 0; color: var(--color-ink-faint); font-size: .7rem; }.anomaly-title > div { display: flex; align-items: center; gap: .45rem; margin-top: .9rem; }.anomaly-title > div > b { padding: .2rem .4rem; border: 1px solid var(--molten-line); color: var(--color-ink-dim); font-size: .6rem; font-weight: 500; }.anomaly-title > div > button { margin-left: auto; padding: .35rem .5rem; border: 1px solid var(--molten-red); background: transparent; color: var(--molten-red-bright); font-size: .62rem; cursor: pointer; }
.anomaly-warning { position: relative; display: flex; align-items: center; gap: .7rem; padding: .55rem .9rem; border-bottom: 1px solid var(--molten-line); color: var(--color-ink-faint); }.anomaly-warning > span { color: var(--gold); font-size: .6rem; white-space: nowrap; }.anomaly-warning i { width: 1px; height: .8rem; background: var(--molten-line); }.anomaly-warning p { margin: 0; font-size: .62rem; }
.anomaly-columns { position: relative; display: grid; grid-template-columns: minmax(0, 3fr) minmax(13rem, 2fr); gap: 1.25rem; align-items: start; padding: 1.25rem; }.anomaly-section-title { display: flex; align-items: baseline; gap: .5rem; margin-bottom: .8rem; padding-bottom: .45rem; border-bottom: 1px solid var(--molten-line); }.anomaly-section-title > span { color: var(--molten-red-bright); font: .78rem var(--font-display); }.anomaly-section-title h3 { margin: 0; font: 600 .95rem var(--font-serif); }.anomaly-section-title > b { margin-left: auto; color: var(--color-ink-faint); font: .42rem var(--font-display); letter-spacing: .08em; }
.emotion-page { margin-bottom: .8rem; border: 1px solid var(--molten-line); background: var(--color-surface-2); }.emotion-page:nth-child(odd) { transform: translateX(.3rem); }.emotion-page > header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .5rem; padding: .55rem .65rem; border-bottom: 1px solid var(--molten-line); }.emotion-page > header > span { color: var(--molten-red-bright); font: .55rem var(--font-display); }.emotion-page h4 { margin: 0; font: 600 .85rem var(--font-serif); overflow-wrap: anywhere; }.emotion-page > header > b { padding: .15rem .35rem; border: 1px solid currentColor; font-size: .58rem; font-weight: 500; }.emotion-page > header > b.positive { color: var(--gold); }.emotion-page > header > b.negative { color: var(--color-ink-dim); }.emotion-page > header > b.dual { color: var(--molten-red-bright); }.emotion-effect { margin: 0; padding: .75rem .85rem; color: var(--color-ink); font-size: .82rem; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; }
.private-mechanism { margin: .55rem; padding: .35rem .8rem .65rem; border-left: 3px solid var(--gold); background: color-mix(in srgb, var(--gold) 5%, transparent); }.private-mechanism__head { display: flex; align-items: baseline; flex-wrap: wrap; gap: .15rem .55rem; color: var(--gold); font-size: .75rem; font-weight: 600; }.private-mechanism__stack { color: var(--color-ink-dim); font: .62rem var(--font-display); font-style: normal; font-weight: 500; white-space: nowrap; }.private-mechanism > p { margin: .35rem 0 0; color: var(--color-ink-dim); font-size: .76rem; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; }
.ego-file { margin-bottom: 1.2rem; }.ego-file > footer { margin-top: .55rem; padding: .7rem .8rem; border-left: 3px solid var(--gold); background: color-mix(in srgb, var(--gold) 5%, transparent); }.ego-file > footer > span { display: block; color: var(--gold); font: .48rem var(--font-display); letter-spacing: .1em; }.ego-file > footer > b { display: block; margin: .2rem 0; font: 600 .85rem var(--font-serif); }.ego-file > footer > p { margin: 0; color: var(--color-ink-dim); font-size: .76rem; line-height: 1.8; }
.anomaly-empty { padding: 2rem 1rem; border: 1px dashed var(--molten-line); color: var(--color-ink-faint); text-align: center; font-size: .65rem; }.anomaly-file--empty { display: grid; place-content: center; justify-items: center; min-height: 32rem; padding: 2rem; text-align: center; color: var(--color-ink-faint); }.anomaly-file--empty > span { font: 2rem var(--font-display); }.anomaly-file--empty h2 { color: var(--color-ink); font: 600 1.1rem var(--font-serif); }.anomaly-file--empty p { font-size: .65rem; }.anomaly-file--empty button { padding: .5rem .7rem; border: 1px solid var(--molten-red); background: transparent; color: var(--molten-red-bright); cursor: pointer; }
@media (max-width: 78rem) { .anomaly-columns { grid-template-columns: 1fr; }.anomaly-file-head { grid-template-columns: 8.5rem minmax(0, 1fr); } }
@media (max-width: 50rem) { .anomaly-browser { grid-template-columns: 1fr; }.anomaly-rail { border-right: 0; border-bottom: 1px solid var(--molten-line); }.anomaly-rail nav { display: flex; max-height: none; overflow: auto; padding-bottom: .35rem; }.anomaly-rail nav button { flex: 0 0 10rem; border-right: 1px solid var(--molten-line); }.entity-create { margin-top: .4rem; }.anomaly-columns { padding: .75rem; }.emotion-page:nth-child(odd) { transform: none; } }
@media (max-width: 34rem) { .anomaly-file-head { grid-template-columns: 6.5rem minmax(0, 1fr); min-height: 9rem; }.observation-window { margin: .65rem; }.observation-window > span { display: none; }.anomaly-title { padding-right: .6rem; }.anomaly-title h2 { font-size: 1rem; }.anomaly-title > div { flex-wrap: wrap; }.anomaly-title > div > button { margin-left: 0; }.anomaly-warning p { font-size: .48rem; }.anomaly-section-title > b { display: none; }.private-mechanism { padding-right: .7rem; } }
</style>
