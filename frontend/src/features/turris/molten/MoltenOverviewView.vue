<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Floor, Librarian, AnomalyEntity } from '@rtl/shared'
import { api } from '@/app/services/api'
import { useTermsStore } from '@/features/turris/store/terms'

const router = useRouter()
const terms = useTermsStore()
const floors = ref<Floor[]>([])
const librarians = ref<Librarian[]>([])
const anomalyEntities = ref<AnomalyEntity[]>([])
const invitations = ref<unknown[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    ;[floors.value, librarians.value, anomalyEntities.value, invitations.value] = await Promise.all([
      api.list<Floor>('floors'), api.list<Librarian>('librarians'), api.list<AnomalyEntity>('anomaly_entities'), api.list<unknown>('invitations'),
    ])
    void terms.load()
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) } finally { loading.value = false }
}
function refreshIfVisible(): void { if (document.visibilityState === 'visible' && !loading.value) void load() }
onMounted(() => { void load(); document.addEventListener('visibilitychange', refreshIfVisible); window.addEventListener('focus', refreshIfVisible) })
onBeforeUnmount(() => { document.removeEventListener('visibilitychange', refreshIfVisible); window.removeEventListener('focus', refreshIfVisible) })

const librarianCount = computed(() => librarians.value.filter((l) => l.department === 'turris').length)
const termCount = computed(() => terms.visibleSections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.entries.length, 0), 0))
const libCounts = computed(() => { const m = new Map<number, number>(); for (const l of librarians.value) if (l.floorId != null) m.set(l.floorId, (m.get(l.floorId) ?? 0) + 1); return m })
const towerFloors = computed(() => [
  ...floors.value.filter((f) => f.updatedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.sortOrder - b.sortOrder),
  ...floors.value.filter((f) => !f.updatedAt).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
].slice(0, 5))
const restCount = computed(() => floors.value.length - towerFloors.value.length)
function enterFloor(f: Floor): void { void router.push({ path: '/turris/floors', query: { floor: String(f.id) } }) }
</script>

<template>
  <div class="molten-page overview">
    <div v-if="error" class="molten-error">{{ error }}</div>
    <div class="overview__lead">
      <section class="molten-panel cycle-panel">
        <div class="molten-heading"><div><h2>以战养藏</h2><p>EX BELLO LIBERI</p></div><span>● 接待体系待命</span></div>
        <p class="cycle-panel__intro">将每一个挑战图书馆的存在转化为新的书籍。馆藏再经加工提取为核心书页，使战斗与传承形成完整循环。</p>
        <div class="cycle-panel__seal">
          <svg viewBox="0 0 280 220" role="img" aria-label="接待、胜利、成书、馆藏构成的三角循环">
            <path class="seal-outer" d="M140 20 252 190H28Z"/><path class="seal-inner" d="M140 55 216 172H64Z"/>
            <circle cx="140" cy="20" r="3"/><circle cx="28" cy="190" r="3"/><circle cx="252" cy="190" r="3"/>
            <text x="140" y="125" class="seal-title">以战养藏</text><text x="140" y="147" class="seal-sub">EX BELLO LIBERI</text>
            <text x="140" y="210" class="seal-caption">RECEPTIO · VICTORIA · LIBER · COLLECTIO</text>
          </svg>
        </div>
        <div class="overview__stats">
          <div><strong>{{ librarianCount }}<small>人</small></strong><span>迎书楼司书</span></div>
          <div><strong>{{ anomalyEntities.length }}<small>体</small></strong><span>异常实体</span></div>
          <div><strong>{{ floors.length }}<small>层</small></strong><span>战斗楼层</span></div>
        </div>
      </section>

      <section class="molten-panel tower-panel">
        <div class="molten-heading"><div><h2>迎书楼剖面</h2><p>CONTIGNATIONES TURRIS · 最近编辑优先</p></div><span>{{ String(floors.length).padStart(2, '0') }} FLOORS</span></div>
        <div class="tower-list">
          <button v-for="f in towerFloors" :key="f.id" type="button" class="tower-floor" @click="enterFloor(f)">
            <img v-if="f.artwork" :src="f.artwork" alt="" loading="lazy" />
            <span class="tower-floor__shade" />
            <span class="tower-floor__code">{{ f.code }}</span>
            <strong>{{ f.designation || f.name }}</strong>
            <span class="tower-floor__theme">{{ f.theme.replace(/[、，]/g, ' · ') || '主题待补' }}</span>
            <span class="tower-floor__system">{{ f.battleSystem.toUpperCase() }}</span>
            <span class="tower-floor__count"><b>{{ libCounts.get(f.id) ?? 0 }}</b> 司书</span>
            <span class="tower-floor__arrow">›</span>
          </button>
          <div v-if="loading && !floors.length" class="tower-loading">正在读取楼层剖面…</div>
          <RouterLink v-if="restCount > 0" class="tower-rest" to="/turris/floors">其余 {{ restCount }} 层 <span>进入完整楼层档案 ↗</span></RouterLink>
        </div>
      </section>
    </div>

    <div class="overview__lower">
      <section class="molten-panel process-panel">
        <div class="molten-heading"><div><h2>接待流程</h2><p>ORDO RECEPTIONIS</p></div><span>05 STAGES</span></div>
        <ol class="process-list">
          <li v-for="(step, i) in ['寄出邀请函', '签下姓名 · 传送抵达', '选择楼层 · 接受接待', '通过试炼 · 取走奖励', '陨落者化为书籍']" :key="step"><span>{{ String(i + 1).padStart(2, '0') }}</span><b>{{ step }}</b><i>△</i></li>
        </ol>
      </section>
      <section class="molten-panel archive-panel">
        <div class="molten-heading"><div><h2>馆藏终端</h2><p>ARCHIVE STATUS</p></div><RouterLink to="/turris/dictionary">进入词典 ↗</RouterLink></div>
        <RouterLink class="archive-row" to="/turris/dictionary"><strong>{{ termCount }}</strong><span>可见术语词条<small>完整连续编目 · {{ terms.visibleSections.length }} 个分区</small></span><b>↗</b></RouterLink>
        <RouterLink class="archive-row" to="/turris/invitations"><strong>{{ invitations.length }}</strong><span>邀请函与来宾<small>接待档案与来宾记录</small></span><b>↗</b></RouterLink>
        <RouterLink class="archive-row" to="/turris/systems"><strong>04</strong><span>战斗系统档案<small>数值 · 机制 · 六维属性</small></span><b>↗</b></RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.overview__lead { display: grid; grid-template-columns: minmax(17rem, .7fr) minmax(0, 1.7fr); gap: 1.25rem; }
.cycle-panel, .tower-panel, .process-panel, .archive-panel { padding: clamp(1rem, 2vw, 1.5rem); }
.cycle-panel { display: flex; flex-direction: column; }
.cycle-panel__intro { color: var(--color-ink-dim); font-size: .78rem; line-height: 1.9; max-width: 34rem; }
.cycle-panel__seal { width: min(100%, 20rem); margin: auto; align-self: center; }
.cycle-panel__seal svg { display: block; width: 100%; overflow: visible; }
.seal-outer, .seal-inner { fill: color-mix(in srgb, var(--molten-red) 4%, transparent); stroke: var(--molten-red); stroke-width: 1.2; }
.seal-inner { fill: none; stroke-opacity: .45; }
circle { fill: var(--molten-red-bright); }
text { text-anchor: middle; fill: var(--color-ink); }
.seal-title { font: 600 1.2rem var(--font-serif); letter-spacing: .2em; }
.seal-sub { fill: var(--molten-red-bright); font: .55rem var(--font-display); letter-spacing: .2em; }
.seal-caption { fill: var(--color-ink-faint); font: .48rem var(--font-display); letter-spacing: .12em; }
.overview__stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--molten-line); }
.overview__stats div { display: flex; flex-direction: column; gap: .35rem; padding: 1rem .5rem 0; }
.overview__stats strong { font: 1.65rem var(--font-display); }
.overview__stats small { margin-left: .25rem; color: var(--molten-red-bright); font: .6rem var(--font-sans); }
.overview__stats span { color: var(--color-ink-faint); font-size: .65rem; }
.tower-list { display: flex; flex-direction: column; gap: .6rem; margin-top: 1rem; }
.tower-floor { position: relative; isolation: isolate; display: grid; grid-template-columns: 4.5rem minmax(6rem, .7fr) minmax(8rem, 1fr) auto auto 1rem; align-items: center; gap: 1rem; min-height: 4.4rem; padding: .7rem 1rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--molten-red) 32%, transparent); color: var(--molten-light); background: var(--molten-dark); text-align: left; cursor: pointer; clip-path: polygon(.6rem 0, 100% 0, 100% calc(100% - .6rem), calc(100% - .6rem) 100%, 0 100%, 0 .6rem); }
.tower-floor img, .tower-floor__shade { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tower-floor__shade { z-index: -1; background: linear-gradient(90deg, rgba(12, 10, 13, .97), rgba(12, 10, 13, .7) 45%, rgba(12, 10, 13, .45)); }
.tower-floor:hover { border-color: var(--molten-red-bright); transform: translateX(.25rem); }
.tower-floor__code { color: #f09986; font: .7rem var(--font-display); letter-spacing: .08em; }
.tower-floor strong { font: 600 1rem var(--font-serif); }
.tower-floor__theme { color: rgba(238, 233, 225, .7); font-size: .7rem; }
.tower-floor__system { padding: .25rem .45rem; border: 1px solid rgba(240, 153, 134, .35); color: #f09986; font: .55rem var(--font-display); }
.tower-floor__count { color: rgba(238, 233, 225, .75); font-size: .65rem; }
.tower-floor__count b { margin-right: .2rem; color: var(--molten-light); font: 1rem var(--font-display); }
.tower-floor__arrow { color: #f09986; }
.tower-loading { padding: 3rem; color: var(--color-ink-faint); text-align: center; }
.tower-rest { display: flex; justify-content: space-between; padding: .65rem .8rem; border-left: 2px solid var(--molten-red); color: var(--color-ink-dim); background: color-mix(in srgb, var(--molten-red) 5%, transparent); font-size: .7rem; text-decoration: none; }
.tower-rest span { color: var(--molten-red-bright); }
.overview__lower { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem; }
.process-list { display: grid; grid-template-columns: repeat(5, 1fr); gap: .5rem; list-style: none; padding: 0; margin: 1rem 0 0; }
.process-list li { position: relative; display: flex; flex-direction: column; gap: .6rem; min-width: 0; padding: .8rem; background: color-mix(in srgb, var(--molten-red) 4%, var(--color-surface-2)); border-top: 1px solid var(--molten-line); }
.process-list span { color: var(--molten-red-bright); font: .65rem var(--font-display); }
.process-list b { font-size: .72rem; line-height: 1.6; font-weight: 500; }
.process-list i { position: absolute; right: .5rem; top: .55rem; color: var(--color-ink-faint); font-style: normal; font-size: .55rem; }
.archive-panel .molten-heading a { color: var(--molten-red-bright); font-size: .7rem; }
.archive-row { display: flex; align-items: center; gap: 1rem; padding: .9rem .5rem; border-bottom: 1px solid var(--color-line); color: var(--color-ink); text-decoration: none; }
.archive-row strong { min-width: 3.5rem; color: var(--molten-red-bright); font: 1.55rem var(--font-display); }
.archive-row > span { display: flex; flex-direction: column; gap: .25rem; font: .85rem var(--font-serif); }
.archive-row small { color: var(--color-ink-faint); font: .65rem var(--font-sans); }
.archive-row b { margin-left: auto; font-weight: 400; }
.archive-row:hover { background: color-mix(in srgb, var(--molten-red) 6%, transparent); }
@media (max-width: 68rem) { .overview__lead, .overview__lower { grid-template-columns: 1fr; } .cycle-panel__seal { width: min(100%, 16rem); } }
@media (max-width: 46rem) { .tower-floor { grid-template-columns: 3.5rem 1fr auto; gap: .5rem; } .tower-floor__theme { grid-column: 2 / -1; } .tower-floor__system { display: none; } .tower-floor__arrow { display: none; } .process-list { grid-template-columns: 1fr; } .process-list li { flex-direction: row; } }
</style>
