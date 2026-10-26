<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTermsStore, type DictEntry, type DictGroup, type DictSection } from '@/features/turris/store/terms'
import { TAG_STYLES } from '@/features/turris/terms/tagStyles'
import { readableColor, formatToCss, mergedFormat } from '@/features/turris/terms/format'
import { ensureTermIndex } from '@/features/turris/terms/renderer'
import TermEditModal from '@/features/turris/terms/TermEditModal.vue'
import RenderedText from '@/features/turris/terms/RenderedText.vue'

interface GroupView { section: DictSection; group: DictGroup; entries: DictEntry[]; id: string; sectionNumber: number; groupNumber: number }
const termsStore = useTermsStore()
const query = ref('')
const sectionFilter = ref('all')
const indexReady = ref(false)
const renderVersion = ref(0)
const editOpen = ref(false)
const editingEntry = ref<DictEntry | null>(null)
const activeId = ref('')
const indexOpen = ref(false)
const onLight = ref(false)
let observer: IntersectionObserver | null = null
let themeObserver: MutationObserver | null = null

const totalCount = computed(() => termsStore.visibleSections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.entries.length, 0), 0))
const groupViews = computed<GroupView[]>(() => {
  const q = query.value.trim().toLocaleLowerCase()
  const result: GroupView[] = []
  termsStore.visibleSections.forEach((section, si) => {
    if (sectionFilter.value !== 'all' && sectionFilter.value !== section.id) return
    section.groups.forEach((group, gi) => {
      const entries = !q ? group.entries : group.entries.filter((e) => [e.name, e.desc, ...e.tags, group.title, section.title].join('\n').toLocaleLowerCase().includes(q))
      if (entries.length) result.push({ section, group, entries, id: `molten-term-${si + 1}-${gi + 1}`, sectionNumber: si + 1, groupNumber: gi + 1 })
    })
  })
  return result
})
const visibleCount = computed(() => groupViews.value.reduce((n, g) => n + g.entries.length, 0))
const sectionCount = computed(() => new Set(groupViews.value.map((g) => g.section.id)).size)

function sectionCountOf(section: DictSection): number { return section.groups.reduce((n, g) => n + g.entries.length, 0) }
function selectSection(id: string): void {
  sectionFilter.value = id
  indexOpen.value = false
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
function groupColor(title: string): string { return readableColor(TAG_STYLES[title]?.color ?? '#c04a32', onLight.value) }
function chipStyle(e: DictEntry, i: number): Record<string, string> {
  const f = e.tagFormats?.[i]
  const color = readableColor(f?.color ?? '#8a8a8a', onLight.value)
  return { ...(f ? formatToCss(f, onLight.value) : {}), color, borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)` }
}
function openEdit(e: DictEntry): void { editingEntry.value = e; editOpen.value = true }
async function onSaved(): Promise<void> {
  await termsStore.reload()
  await ensureTermIndex()
  renderVersion.value++
  await nextTick()
  observeGroups()
}
function scrollToGroup(id: string): void {
  activeId.value = id
  indexOpen.value = false
  // content-visibility:auto 会让未进入视口的分组用估算高度（contain-intrinsic-size）占位，
  // 直接 scrollIntoView 会因中间分区真实高度与估算不符而停偏。这里先临时禁用 content-visibility
  // 让所有分组按真实高度参与布局，等两帧布局稳定后再滚动，滚动后恢复。
  const groups = Array.from(document.querySelectorAll<HTMLElement>('.term-group'))
  groups.forEach((el) => (el.style.contentVisibility = 'visible'))
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      groups.forEach((el) => (el.style.contentVisibility = ''))
    })
  })
}
function backToTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function observeGroups(): void {
  observer?.disconnect()
  const elements = groupViews.value.map((g) => document.getElementById(g.id)).filter((el): el is HTMLElement => !!el)
  if (!elements.length) return
  observer = new IntersectionObserver((records) => {
    const visible = records.filter((r) => r.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]?.target.id) activeId.value = visible[0].target.id
  }, { rootMargin: '-12% 0px -68% 0px', threshold: 0 })
  elements.forEach((el) => observer?.observe(el))
  if (!groupViews.value.some((g) => g.id === activeId.value)) activeId.value = elements[0]!.id
}
function updateSurface(): void {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim()
  const values = raw.match(/[\d.]+/g)?.map(Number) ?? []
  if (raw.startsWith('#') && (raw.length === 7 || raw.length === 4)) {
    const hex = raw.length === 4 ? raw.slice(1).split('').map((c) => c + c).join('') : raw.slice(1)
    onLight.value = (parseInt(hex.slice(0, 2), 16) * .2126 + parseInt(hex.slice(2, 4), 16) * .7152 + parseInt(hex.slice(4, 6), 16) * .0722) > 150
  } else if (values.length >= 3) onLight.value = (values[0]! * .2126 + values[1]! * .7152 + values[2]! * .0722) > 150
}
watch(groupViews, () => void nextTick(observeGroups))
onMounted(async () => {
  updateSurface()
  themeObserver = new MutationObserver(updateSurface)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color', 'data-design'] })
  await ensureTermIndex()
  indexReady.value = true
  await nextTick()
  observeGroups()
})
onBeforeUnmount(() => { observer?.disconnect(); themeObserver?.disconnect() })
</script>

<template>
  <div class="molten-page dictionary">
    <section class="dictionary-command molten-panel">
      <div class="molten-heading"><div><h2>术语连续编目</h2><p>THESAURUS VERBORUM · 全部可见分区动态接入</p></div><span>{{ totalCount }} ENTRIES</span></div>
      <div class="dictionary-tools">
        <label class="dictionary-search"><span>检索</span><input v-model="query" type="search" placeholder="词条、属性、效果或引用术语…" /><b>{{ visibleCount }}</b></label>
        <button type="button" class="index-toggle molten-button" @click="indexOpen = !indexOpen">{{ indexOpen ? '收起子分区' : '子分区索引' }}</button>
      </div>
      <div class="dictionary-status"><span><i />{{ query || sectionFilter !== 'all' ? '筛选结果' : '连续编目中' }}</span><p>{{ sectionCount }} 个分区 · {{ groupViews.length }} 个子分类 · {{ visibleCount }} 条词条</p><button type="button" @click="query = ''; sectionFilter = 'all'">重置视图</button></div>
    </section>

    <div v-if="termsStore.error" class="molten-error">{{ termsStore.error }}</div>
    <div v-else-if="!indexReady" class="dictionary-loading">正在建立术语渲染索引…</div>
    <div v-else class="dictionary-layout">
      <aside class="dictionary-sections" aria-label="术语编目分区">
        <div class="dictionary-index__head"><span>编目分区</span><b>{{ termsStore.visibleSections.length }} / {{ totalCount }}</b></div>
        <nav>
          <button type="button" :class="{ 'is-active': sectionFilter === 'all' }" @click="selectSection('all')"><span>全部分区</span><b>{{ totalCount }}</b></button>
          <button v-for="section in termsStore.visibleSections" :key="section.id" type="button" :class="{ 'is-active': sectionFilter === section.id }" @click="selectSection(section.id)">
            <span>{{ section.title }}</span><b>{{ sectionCountOf(section) }}</b>
          </button>
        </nav>
        <footer><span>DATABASE INDEX</span><b>{{ sectionCount }} / {{ termsStore.visibleSections.length }}</b></footer>
      </aside>
      <main class="dictionary-stream" aria-live="polite">
        <template v-for="(view, index) in groupViews" :key="view.id">
          <h2 v-if="index === 0 || view.section.id !== groupViews[index - 1]?.section.id" class="section-title"><span>{{ String(view.sectionNumber).padStart(2, '0') }}</span>{{ view.section.title }}<small>SECTION</small></h2>
          <section :id="view.id" class="term-group" :aria-label="`${view.section.title} ${view.group.title}`">
            <header class="term-group__header"><span>{{ String(view.sectionNumber).padStart(2, '0') }}.{{ String(view.groupNumber).padStart(2, '0') }}</span><h3 :style="{ color: groupColor(view.group.title) }">{{ view.group.title || '未分组' }}</h3><p>{{ view.section.title }}</p><b>{{ view.entries.length }} 条</b></header>
            <div class="term-list">
              <article v-for="entry in view.entries" :key="`${entry.id}-${renderVersion}`" class="term-row">
                <span class="term-row__id">{{ String(entry.id).padStart(3, '0') }}</span>
                <div class="term-row__name"><h4 :style="formatToCss(mergedFormat(entry), onLight)">{{ entry.name }}</h4><span>{{ view.group.title || view.section.title }}</span></div>
                <div class="term-row__tags"><span v-for="(tag, i) in entry.tags" :key="`${tag}-${i}`" :style="chipStyle(entry, i)">{{ tag }}</span></div>
                <p class="term-row__desc"><RenderedText :text="entry.desc" :on-light="onLight" term-marker unknown-plain /></p>
                <button type="button" class="term-row__edit" :aria-label="`编辑词条 ${entry.name}`" @click="openEdit(entry)">编辑</button>
              </article>
            </div>
          </section>
        </template>
        <div v-if="!groupViews.length" class="dictionary-empty"><strong>没有匹配的词条</strong><p>尝试缩短关键词，或恢复全部分区。</p><button type="button" class="molten-button" @click="query = ''; sectionFilter = 'all'">清除筛选</button></div>
      </main>

      <aside class="dictionary-index" :class="{ 'is-open': indexOpen }" aria-label="连续编目索引">
        <div class="dictionary-index__head"><span>子分区索引</span><button type="button" title="回到顶部" @click="backToTop">↑</button></div>
        <nav>
          <template v-for="(view, index) in groupViews" :key="view.id">
            <p v-if="index === 0 || view.section.id !== groupViews[index - 1]?.section.id">{{ String(view.sectionNumber).padStart(2, '0') }} / {{ view.section.title }}</p>
            <button type="button" :class="{ 'is-active': activeId === view.id }" :aria-current="activeId === view.id ? 'location' : undefined" @click="scrollToGroup(view.id)">
              <span :style="{ background: groupColor(view.group.title) }" />
              <b>{{ String(view.sectionNumber).padStart(2, '0') }}.{{ String(view.groupNumber).padStart(2, '0') }}</b>
              <strong>{{ view.group.title || '未分组' }}</strong><small>{{ view.entries.length }}</small>
            </button>
          </template>
        </nav>
        <footer><span>INDEX DYNAMIC</span><b>{{ visibleCount }} / {{ totalCount }}</b></footer>
      </aside>
    </div>
    <TermEditModal :open="editOpen" :entry="editingEntry" @close="editOpen = false" @saved="onSaved" />
  </div>
</template>

<style scoped>
.dictionary-command { padding: clamp(1rem, 2vw, 1.5rem); }
.dictionary-tools { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .75rem; margin-top: 1rem; }
.dictionary-search { display: flex; align-items: center; min-width: 0; border: 1px solid var(--molten-line); background: var(--color-bg); }
.dictionary-search > span { padding-inline: .8rem; color: var(--molten-red-bright); font-size: .65rem; white-space: nowrap; }
.dictionary-search input { width: 100%; min-width: 0; padding: .7rem; border: 0; outline: 0; color: var(--color-ink); background: transparent; font: .78rem var(--font-sans); }
.dictionary-search input:focus { box-shadow: inset 0 -2px var(--molten-red); }
.dictionary-search b { padding-inline: .8rem; color: var(--color-ink-faint); font: .7rem var(--font-display); }
.dictionary-status { display: flex; align-items: center; gap: 1rem; margin-top: .85rem; color: var(--color-ink-faint); font-size: .65rem; }
.dictionary-status > span { color: var(--molten-red-bright); }
.dictionary-status i { display: inline-block; width: .35rem; height: .35rem; margin-right: .4rem; border-radius: 50%; background: currentColor; }
.dictionary-status p { margin: 0; }
.dictionary-status button { margin-left: auto; padding: 0; border: 0; color: var(--color-ink-dim); background: none; cursor: pointer; }
.index-toggle { display: none; }
.dictionary-loading, .dictionary-empty { padding: 4rem 1rem; color: var(--color-ink-faint); text-align: center; }
.dictionary-layout { display: grid; grid-template-columns: minmax(8.5rem, 11rem) minmax(0, 1fr) minmax(9rem, 11.5rem); gap: 1rem; align-items: start; }
.dictionary-sections, .dictionary-index { position: sticky; top: calc(var(--header-h) + 1rem); max-height: calc(100vh - var(--header-h) - 2rem); display: flex; flex-direction: column; border: 1px solid var(--molten-line); background: var(--color-surface); }
.dictionary-sections nav { min-height: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--molten-red) transparent; }
.dictionary-sections nav button { display: flex; justify-content: space-between; align-items: center; gap: .35rem; width: 100%; padding: .62rem .7rem; border: 0; border-bottom: 1px solid var(--color-line); color: var(--color-ink-dim); background: transparent; text-align: left; cursor: pointer; }
.dictionary-sections nav button span { font-size: .66rem; }
.dictionary-sections nav button b { color: var(--color-ink-faint); font: .5rem var(--font-display); }
.dictionary-sections nav button:hover, .dictionary-sections nav button.is-active { color: var(--color-ink); background: color-mix(in srgb, var(--molten-red) 12%, transparent); }
.dictionary-sections nav button.is-active { box-shadow: inset .16rem 0 var(--molten-red); }
.dictionary-sections footer { display: flex; justify-content: space-between; gap: .4rem; padding: .65rem; border-top: 1px solid var(--molten-line); color: var(--color-ink-faint); font: .45rem var(--font-display); }
.dictionary-stream { min-width: 0; }
.section-title { display: flex; align-items: center; gap: .8rem; margin: 2rem 0 .75rem; font: 600 1.25rem var(--font-serif); }
.section-title:first-child { margin-top: 0; }
.section-title > span { color: var(--molten-red-bright); font: .65rem var(--font-display); }
.section-title small { margin-left: auto; color: var(--color-ink-faint); font: .5rem var(--font-display); letter-spacing: .15em; }
.term-group { scroll-margin-top: calc(var(--header-h) + 1rem); margin-bottom: 1.25rem; content-visibility: auto; contain-intrinsic-size: auto 30rem; }
.term-group__header { display: grid; grid-template-columns: 2.5rem auto 1fr auto; align-items: baseline; gap: .7rem; padding: .7rem .85rem; border-left: .18rem solid var(--molten-red); background: color-mix(in srgb, var(--molten-red) 7%, var(--color-surface)); }
.term-group__header > span { color: var(--color-ink-faint); font: .55rem var(--font-display); }
.term-group__header h3 { margin: 0; font: 600 1rem var(--font-serif); }
.term-group__header p { margin: 0; color: var(--color-ink-faint); font-size: .62rem; }
.term-group__header b { color: var(--color-ink-faint); font-size: .6rem; font-weight: 400; }
.term-list { border-inline: 1px solid var(--color-line); }
.term-row { display: grid; grid-template-columns: 2.8rem minmax(6rem, 10rem) minmax(4.5rem, 8rem) minmax(0, 1fr) 2.5rem; gap: .85rem; align-items: start; padding: .85rem .75rem; border-bottom: 1px solid var(--color-line); background: var(--color-surface); }
.term-row:nth-child(even) { background: color-mix(in srgb, var(--molten-red) 2%, var(--color-surface)); }
.term-row:hover { background: color-mix(in srgb, var(--molten-red) 7%, var(--color-surface)); }
.term-row__id { padding-top: .2rem; color: var(--color-ink-faint); font: .55rem var(--font-display); }
.term-row__name { min-width: 0; }
.term-row__name h4 { margin: 0; font: 600 .88rem/1.5 var(--font-serif); overflow-wrap: anywhere; }
.term-row__name > span { color: var(--color-ink-faint); font-size: .55rem; }
.term-row__tags { display: flex; flex-wrap: wrap; gap: .3rem; }
.term-row__tags span { padding: .12rem .35rem; border: 1px solid; font-size: .58rem; white-space: nowrap; }
.term-row__desc { margin: 0; color: var(--color-ink-dim); font-size: .75rem; line-height: 1.8; white-space: pre-line; overflow-wrap: anywhere; }
.term-row__desc :deep(.rt-term--marker)::before { vertical-align: .12em; }
.term-row__edit { padding: .2rem 0; border: 0; border-bottom: 1px solid transparent; color: var(--color-ink-faint); background: none; font-size: .6rem; cursor: pointer; }
.term-row__edit:hover { color: var(--molten-red-bright); border-color: currentColor; }
.dictionary-index__head { display: flex; justify-content: space-between; padding: .8rem; border-bottom: 1px solid var(--molten-line); color: var(--color-ink-dim); font: .65rem var(--font-serif); }
.dictionary-index__head button { border: 0; color: var(--molten-red-bright); background: none; cursor: pointer; }
.dictionary-index nav { min-height: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--molten-red) transparent; }
.dictionary-index nav p { margin: .8rem .65rem .3rem; color: var(--color-ink-faint); font: .5rem var(--font-display); letter-spacing: .06em; }
.dictionary-index nav button { display: grid; grid-template-columns: .3rem 2.1rem 1fr auto; align-items: center; gap: .45rem; width: 100%; padding: .5rem .65rem; border: 0; color: var(--color-ink-dim); background: transparent; text-align: left; cursor: pointer; }
.dictionary-index nav button > span { width: .25rem; height: .65rem; }
.dictionary-index nav button b { color: var(--color-ink-faint); font: .48rem var(--font-display); }
.dictionary-index nav button strong { font-size: .65rem; font-weight: 400; }
.dictionary-index nav button small { color: var(--color-ink-faint); font-size: .5rem; }
.dictionary-index nav button:hover, .dictionary-index nav button.is-active { color: var(--color-ink); background: color-mix(in srgb, var(--molten-red) 12%, transparent); }
.dictionary-index nav button.is-active { box-shadow: inset .14rem 0 var(--molten-red); }
.dictionary-index footer { display: flex; justify-content: space-between; gap: .4rem; padding: .65rem; border-top: 1px solid var(--molten-line); color: var(--color-ink-faint); font: .45rem var(--font-display); }
@media (max-width: 68rem) { .dictionary-layout { grid-template-columns: minmax(7rem, 9rem) minmax(0, 1fr) minmax(7.5rem, 9rem); gap: .6rem; } .term-row { grid-template-columns: 2.2rem minmax(5rem, 8rem) minmax(0, 1fr) 2rem; } .term-row__tags { grid-column: 2; } .term-row__desc { grid-column: 3; grid-row: 1 / 3; } .term-row__edit { grid-column: 4; grid-row: 1 / 3; } }
@media (max-width: 52rem) { .dictionary-tools { grid-template-columns: 1fr auto; } .index-toggle { display: inline-flex; } .dictionary-layout { grid-template-columns: 1fr; } .dictionary-sections { position: static; max-height: 15rem; } .dictionary-sections nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); } .dictionary-sections nav button { border-right: 1px solid var(--color-line); } .dictionary-index { position: fixed; z-index: 40; inset: var(--header-h) 0 0 auto; display: none; width: min(85vw, 20rem); max-height: none; box-shadow: -1rem 0 3rem rgba(0,0,0,.35); } .dictionary-index.is-open { display: flex; } }
@media (max-width: 40rem) { .dictionary-tools { grid-template-columns: 1fr auto; } .dictionary-search { grid-column: 1 / -1; } .dictionary-status p { display: none; } .term-row { grid-template-columns: 2rem minmax(0, 1fr) 2rem; gap: .45rem .65rem; } .term-row__name { grid-column: 2; } .term-row__tags { grid-column: 2; grid-row: 2; } .term-row__desc { grid-column: 2 / 4; grid-row: 3; } .term-row__edit { grid-column: 3; grid-row: 1; } .term-group__header { grid-template-columns: 2.5rem auto 1fr; } .term-group__header p { display: none; } .term-group__header b { text-align: right; } }
</style>
