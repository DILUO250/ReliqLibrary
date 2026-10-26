<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { OverviewStats } from '@rtl/shared'
import { useOverviewStore } from '@/app/stores/overview'
import { MODULE_LABELS } from '@/app/labels'
import type { ModuleLabelKey } from '@/app/labels'
import LibraryTree from '@/shared/components/LibraryTree.vue'
import RecentRail from '@/shared/components/RecentRail.vue'
import OuterShelf from '@/features/director/components/OuterShelf.vue'

/** 主页 / 馆务面板：馆树 → 实况指标 → 部门入口 → 工作台。 */
type DeptId = ModuleLabelKey | 'all'
type KpiKey = 'librarians' | 'floors' | 'books' | 'anomalies' | 'spaces'
type Metric = { key?: keyof OverviewStats; value?: string; label: string }
type RouteNode = { dept: ModuleLabelKey; name: string; meta: string; route: string; stat?: KpiKey }
type FlowLink = { dept: ModuleLabelKey; route: string; d: string; delay: string }
type RootLink = { d: string; hub: boolean }

const router = useRouter()
const overview = useOverviewStore()
const stageRef = ref<HTMLElement | null>(null)
const selectedDept = ref<DeptId>('all')
const selectedRoute = ref('/')
const selectedNode = ref<RouteNode | null>(null)
const selectedKpi = ref<KpiKey | null>(null)
const motionOff = ref(false)
const rootLinks = ref<RootLink[]>([])
const flowLinks = ref<FlowLink[]>([])

const DEPTS: Record<DeptId, {
  color: string
  head: string
  title: string
  latin: string
  desc: string
  status: string
  action: string
  route: string
  metrics: Metric[]
}> = {
  all: {
    color: 'var(--color-gold)', head: "DIRECTOR'S DESK · 馆务总览", title: '遗迹图书馆', latin: 'Reliquiarum to Library',
    desc: '馆藏、接待与研究在同一棵馆树上交汇。点击左侧部门或入口，查看它在馆务体系中的位置。',
    status: '化虚为实 · 运转中', action: '查看全馆索引', route: '/',
    metrics: [{ key: 'books', label: '馆藏' }, { key: 'librarians', label: '司书' }, { value: '4', label: '馆树分区' }],
  },
  director: {
    color: 'var(--director)', head: 'DIRECTOR FLOOR · 馆长层', title: MODULE_LABELS.director, latin: 'Director Floor',
    desc: '申瑟的私人领域与最高决策层。白石庄园、内务司书与全馆总务，在树冠处汇入同一张馆务图。',
    status: '馆长层 · 在馆', action: '进入馆长层', route: '/director',
    metrics: [{ key: 'librarians', label: '司书总数' }, { value: '4', label: '馆树分区' }, { value: '01', label: '最高决策层' }],
  },
  turris: {
    color: 'var(--turris)', head: 'TURRIS · 迎书楼', title: MODULE_LABELS.turris, latin: 'Turris Librorum Adventantium',
    desc: '战斗司书驻守前线，以接待与试炼扩充馆藏。楼层、战斗系统、术语词典与邀请函都从这里进入。',
    status: '接待体系 · 待命', action: '进入迎书楼', route: '/turris',
    metrics: [{ key: 'floors', label: '接待楼层' }, { value: '4', label: '战斗系统' }, { key: 'guests', label: '来宾登记' }],
  },
  armarium: {
    color: 'var(--armarium)', head: 'ARMARIUM · 藏书阁', title: MODULE_LABELS.armarium, latin: 'Armarium Absconditorum',
    desc: '研究司书遵循 SCL 协议，解析馆藏、收容异常并维护超自然空间档案。研究成果再回流至整座馆树。',
    status: 'SCL 协议 · 执行中', action: '进入藏书阁', route: '/armarium',
    metrics: [{ key: 'books', label: '馆藏' }, { key: 'anomalies', label: '异常实体' }, { key: 'spaces', label: '超自然空间' }],
  },
  collegium: {
    color: 'var(--collegium)', head: 'COLLEGIUM · 寻书社', title: MODULE_LABELS.collegium, latin: 'Collegium Quaerendorum Librorum',
    desc: '求索者深入泡沫世界收集情报，墨工沿折射轨道获取生木髓。向外探索与向内供能，在根系处相接。',
    status: '探索与供能 · 待派遣', action: '进入寻书社', route: '/collegium',
    metrics: [{ value: '2', label: '司书职能' }, { value: '3', label: '工作入口' }, { key: 'energyTotal', label: '生木髓记录' }],
  },
}

const KPI_META: Record<KpiKey, {
  dept: DeptId
  route: string
  head: string
  title: string
  desc: string
  status: string
  metrics: Metric[]
}> = {
  librarians: {
    dept: 'turris', route: '/turris/floors', head: 'ROSTER · 全馆司书', title: '司书名册',
    desc: '登记在馆的司书与所属部门。点击对应入口查看楼层编制或书库管理员。',
    status: '在馆名册 · 已同步',
    metrics: [{ key: 'librarians', label: '司书' }, { value: '4', label: '馆树分区' }, { value: '3', label: '关联入口' }],
  },
  floors: {
    dept: 'turris', route: '/turris/floors', head: 'TURRIS · 接待楼层', title: '接待楼层',
    desc: '迎书楼接待来宾的楼层剖面。楼层编制与司书配置在这里汇合。',
    status: '接待体系 · 待命',
    metrics: [{ key: 'floors', label: '接待楼层' }, { value: '4', label: '战斗系统' }, { key: 'guests', label: '来宾登记' }],
  },
  books: {
    dept: 'all', route: '/', head: "DIRECTOR'S DESK · 全馆馆藏", title: '全馆馆藏',
    desc: '馆藏是馆树的主索引。接待、研究与探索的成果最终都回流到这里。',
    status: '化虚为实 · 永久入藏', metrics: DEPTS.all.metrics,
  },
  anomalies: {
    dept: 'armarium', route: '/armarium/entities', head: 'ARMARIUM · 收容档案', title: '异常实体库',
    desc: '藏书阁以 SCL 协议管理异常实体。这里汇总收容档案与研究记录。',
    status: 'SCL 协议 · 执行中', metrics: DEPTS.armarium.metrics,
  },
  spaces: {
    dept: 'armarium', route: '/armarium/spaces', head: 'ARMARIUM · 空间档案', title: '超自然空间库',
    desc: '研究与收容延伸出的空间档案。点击进入超自然空间库查看详情。',
    status: '空间档案 · 已编目', metrics: DEPTS.armarium.metrics,
  },
}

const KPI_CARDS: Array<{ key: KpiKey; label: string; latin: string; tag: string; note: string; noteLatin: string; icon: string[] }> = [
  { key: 'librarians', label: '司书', latin: 'LIBRARIANS', tag: '名册', note: '全馆司书名册', noteLatin: 'ROSTER', icon: ['M7 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM14 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM2.5 16c.7-3.5 2.2-5 4.5-5s3.8 1.5 4.5 5M12 12c2.8-.8 4.5.5 5 3.5'] },
  { key: 'floors', label: '接待楼层', latin: 'FLOORS', tag: 'I — VI', note: '迎书楼剖面', noteLatin: 'SECTION', icon: ['M4 17V5l6-3 6 3v12M2 17h16M8 17v-5h4v5M8 7h4'] },
  { key: 'books', label: '馆藏', latin: 'COLLECTION', tag: '全馆', note: '化虚为实 · 永久入藏', noteLatin: 'INDEX', icon: ['M4 16V4.5A1.5 1.5 0 0 1 5.5 3H9v13H5.5A1.5 1.5 0 0 0 4 17.5M16 16V4.5A1.5 1.5 0 0 0 14.5 3H11v13h3.5a1.5 1.5 0 0 1 1.5 1.5M4 16h12'] },
  { key: 'anomalies', label: '异常实体', latin: 'ANOMALIES', tag: 'SCL', note: '收容协议档案', noteLatin: 'CONTAIN', icon: ['M10 2l6 3v5c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V5l6-3ZM7 10h6M10 7v6'] },
  { key: 'spaces', label: '超自然空间', latin: 'SPACES', tag: '异界', note: '折叠空间档案', noteLatin: 'DOMAINS', icon: ['M3 10c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7ZM6 13c2-1 2-5 5-6 2 0 3 2 2 4-1 3-5 3-7 2Z'] },
]

const ROUTES: RouteNode[] = [
  { dept: 'director', name: '馆长层 · 总览', meta: 'DIRECTOR', route: '/director' },
  { dept: 'director', name: '相关势力', meta: 'ARCHIVES', route: '/factions' },
  { dept: 'turris', name: '迎书楼 · 总览', meta: 'TURRIS', route: '/turris' },
  { dept: 'turris', name: '楼层与司书', meta: 'FLOORS', route: '/turris/floors', stat: 'floors' },
  { dept: 'turris', name: '战斗系统', meta: 'SYSTEM V2', route: '/turris/systems' },
  { dept: 'turris', name: '术语词典', meta: 'LEXICON', route: '/turris/dictionary' },
  { dept: 'turris', name: '邀请函', meta: 'INVITATION', route: '/turris/invitations' },
  { dept: 'armarium', name: '藏书阁 · 总览', meta: 'ARMARIUM', route: '/armarium' },
  { dept: 'armarium', name: '异常实体库', meta: 'SCL', route: '/armarium/entities', stat: 'anomalies' },
  { dept: 'armarium', name: '超自然空间库', meta: 'SNS', route: '/armarium/spaces', stat: 'spaces' },
  { dept: 'armarium', name: '研究项目', meta: 'PVZ', route: '/armarium/projects' },
  { dept: 'armarium', name: '书库管理员', meta: 'ROSTER', route: '/armarium/librarians' },
  { dept: 'collegium', name: '寻书社 · 总览', meta: 'COLLEGIUM', route: '/collegium' },
  { dept: 'collegium', name: '求索者', meta: 'EXPLORERS', route: '/collegium/explorers' },
  { dept: 'collegium', name: '书页卡册', meta: 'PAGE PACKS', route: '/collegium/packs' },
  { dept: 'collegium', name: '折射轨道', meta: 'RAW PITH', route: '/collegium/railway' },
]

const syncText = computed(() => {
  if (overview.loading) return '馆藏脉络 · 正在读取本机实况'
  if (overview.error) return '馆藏脉络 · 本机服务未连接'
  if (overview.stats) return '馆藏脉络 · 已读取本机实况'
  return '馆藏脉络 · 等待读取'
})

const detail = computed(() => {
  if (selectedKpi.value) {
    const k = KPI_META[selectedKpi.value]
    return {
      color: DEPTS[k.dept].color,
      head: k.head,
      title: k.title,
      latin: DEPTS[k.dept].latin,
      desc: k.desc,
      status: k.status,
      metrics: k.metrics,
      action: selectedKpi.value === 'books' ? '查看全馆索引' : '打开此入口',
    }
  }
  const d = DEPTS[selectedDept.value]
  const node = selectedNode.value
  const nodeTitle = node ? node.name.replace(/^.*?·\s*/, '') : ''
  return {
    ...d,
    title: nodeTitle ? `${d.title} · ${nodeTitle}` : d.title,
    action: node ? '打开此入口' : d.action,
  }
})

const detailMetrics = computed(() => detail.value.metrics.map((metric) => ({
  label: metric.label,
  value: metric.key ? formatStat(metric.key) : metric.value ?? '—',
})))

function formatStat(key: keyof OverviewStats): string {
  const value = overview.stats?.[key]
  return value === undefined || Number.isNaN(value) ? '—' : value.toLocaleString('zh-CN')
}

function routeMeta(item: RouteNode): string {
  return item.stat ? `${formatStat(item.stat)} ${item.meta}` : item.meta
}

function selectDept(dept: DeptId, route?: string, node: RouteNode | null = null): void {
  selectedKpi.value = null
  selectedDept.value = dept
  selectedRoute.value = route ?? DEPTS[dept].route
  selectedNode.value = node
}

function selectKpi(key: KpiKey): void {
  const k = KPI_META[key]
  selectedKpi.value = key
  selectedDept.value = k.dept
  selectedRoute.value = k.route
  selectedNode.value = null
}

function resetView(): void {
  selectDept('all', '/')
}

function openSelected(): void {
  void router.push(selectedRoute.value)
}

function isRouteActive(item: RouteNode): boolean {
  return selectedNode.value?.route === item.route && selectedDept.value === item.dept
}

function isRouteDim(item: RouteNode): boolean {
  return selectedDept.value !== 'all' && selectedDept.value !== item.dept
}

function flowClass(link: FlowLink): Record<string, boolean> {
  return {
    'is-active': selectedDept.value !== 'all' && selectedDept.value === link.dept,
    'is-dim': selectedDept.value !== 'all' && selectedDept.value !== link.dept,
  }
}

function point(el: Element, side: 'left' | 'right', stageRect: DOMRect): { x: number; y: number } {
  const rect = el.getBoundingClientRect()
  return {
    x: (side === 'right' ? rect.right : rect.left) - stageRect.left,
    y: rect.top + rect.height / 2 - stageRect.top,
  }
}

function drawLinks(): void {
  const stage = stageRef.value
  if (!stage || window.innerWidth <= 1080) {
    rootLinks.value = []
    flowLinks.value = []
    return
  }
  const stageRect = stage.getBoundingClientRect()
  const tree = stage.querySelector('.orb-zone')
  const hub = stage.querySelector('[data-kpi="books"]')
  if (!tree || !hub) return
  const treePoint = point(tree, 'right', stageRect)
  const hubPoint = point(hub, 'right', stageRect)
  rootLinks.value = Array.from(stage.querySelectorAll('.stat')).map((card) => {
    const cardPoint = point(card, 'left', stageRect)
    const dx = Math.max(24, (cardPoint.x - treePoint.x) * 0.55)
    return {
      d: `M ${treePoint.x} ${treePoint.y} C ${treePoint.x + dx} ${treePoint.y}, ${cardPoint.x - dx} ${cardPoint.y}, ${cardPoint.x - 4} ${cardPoint.y}`,
      hub: card.getAttribute('data-kpi') === 'books',
    }
  })
  flowLinks.value = ROUTES.map((item, index) => {
    const row = stage.querySelector(`[data-route="${item.route}"]`)
    if (!row) return null
    const end = point(row, 'left', stageRect)
    const dx = Math.max(56, (end.x - hubPoint.x) * 0.52)
    return {
      dept: item.dept,
      route: item.route,
      d: `M ${hubPoint.x} ${hubPoint.y} C ${hubPoint.x + dx} ${hubPoint.y}, ${end.x - dx} ${end.y}, ${end.x - 7} ${end.y}`,
      delay: `${(-index * 0.37).toFixed(2)}s`,
    }
  }).filter((link): link is FlowLink => link !== null)
}

function queueDrawLinks(): void {
  void nextTick(drawLinks)
}

let drawTimer: number | undefined
onMounted(() => {
  void overview.load()
  queueDrawLinks()
  drawTimer = window.setTimeout(drawLinks, 250)
  window.addEventListener('resize', drawLinks)
})

watch([selectedDept, selectedRoute, selectedKpi], queueDrawLinks)
watch(() => overview.stats, queueDrawLinks)

onBeforeUnmount(() => {
  window.removeEventListener('resize', drawLinks)
  if (drawTimer !== undefined) window.clearTimeout(drawTimer)
})
</script>

<template>
  <main ref="stageRef" class="home" :class="{ 'motion-off': motionOff }" :data-selected="selectedDept">
    <svg class="links" aria-hidden="true">
      <path v-for="(link, index) in rootLinks" :key="`root-${index}`" class="root-link" :class="{ hub: link.hub }" :d="link.d" />
      <g v-for="link in flowLinks" :key="link.route" class="flow" :class="flowClass(link)" :style="{ '--c': `var(--${link.dept})` }">
        <path class="flow-base" :d="link.d" />
        <path class="flow-pulse" :d="link.d" :style="{ animationDelay: link.delay }" />
      </g>
    </svg>

    <header class="stage-head">
      <div class="eyebrow latin">Curia Bibliothecae · 01</div>
      <h1 class="stage-title">馆务面板</h1>
      <p class="stage-caption kai">以馆藏为脉络，查看整座图书馆的入口与近况。</p>
    </header>
    <div class="stage-actions">
      <button class="small-btn" type="button" :aria-pressed="!motionOff" @click="motionOff = !motionOff">
        <svg class="icon" viewBox="0 0 16 16"><path d="M2 8h3l2-4 2 8 2-4h3" /></svg>
        <span>生木髓流光 · {{ motionOff ? '停' : '开' }}</span>
      </button>
      <button class="small-btn" type="button" @click="resetView">
        <svg class="icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1" /></svg>
        全馆视图
      </button>
    </div>
    <div class="sync-pill">
      <i class="live-dot"></i><span>{{ syncText }}</span><span class="latin">LIVE INDEX</span>
    </div>

    <section class="orb-zone" aria-label="可交互馆树">
      <div class="orb-title">遗迹图书馆</div>
      <div class="orb-sub latin">TAURUS · MESH DOMAIN</div>
      <LibraryTree :selected="selectedDept" @select="selectDept" />
      <div class="orb-badges"><span class="pill gold">化虚为实 · 稳定</span><span class="pill">四分区馆树</span></div>
    </section>

    <section class="stats" aria-label="全馆实况指标">
      <button
        v-for="card in KPI_CARDS"
        :key="card.key"
        class="stat"
        :class="[card.key, { hub: card.key === 'books', 'is-active': selectedKpi === card.key }]"
        :data-kpi="card.key"
        type="button"
        :title="`查看${card.label}`"
        @click="selectKpi(card.key)"
      >
        <span class="stat-tag">{{ card.tag }}</span>
        <span class="stat-icon"><svg class="icon" viewBox="0 0 20 20"><path v-for="path in card.icon" :key="path" :d="path" /></svg></span>
        <div><div class="stat-num">{{ formatStat(card.key) }}</div><div class="stat-lab">{{ card.label }}<span class="latin">{{ card.latin }}</span></div></div>
        <span v-if="card.key === 'floors'" class="floor-glyph" aria-hidden="true"><i v-for="n in 6" :key="n"></i></span>
        <div class="stat-note"><span>{{ card.note }}</span><span class="latin">{{ card.noteLatin }}</span></div>
      </button>
    </section>

    <section class="entities" aria-label="部门与页面入口">
      <button
        v-for="item in ROUTES"
        :key="item.route"
        class="entity"
        :class="[{ 'is-active': isRouteActive(item), 'is-dim': isRouteDim(item) }, `entity--${item.dept}`]"
        :data-dept="item.dept"
        :data-route="item.route"
        type="button"
        @click="selectDept(item.dept, item.route, item)"
      >
        <span class="entity-node"></span><span class="entity-name">{{ item.name }}</span><span class="entity-dept">{{ MODULE_LABELS[item.dept] }}</span><span class="entity-meta latin">{{ routeMeta(item) }}</span>
      </button>
    </section>
    <div class="graph-legend kai"><span>曲线</span> = 馆藏脉络　·　<span>光点</span> = 生木髓循环　·　点击节点查看部门</div>

    <aside class="detail" :style="{ '--active': detail.color }" aria-live="polite">
      <div class="detail-head">{{ detail.head }}</div>
      <h2 class="detail-title">{{ detail.title }}</h2>
      <div class="detail-latin latin">{{ detail.latin }}</div>
      <p class="detail-desc kai">{{ detail.desc }}</p>
      <span class="detail-status"><i></i>{{ detail.status }}</span>
      <div class="detail-metrics"><div v-for="metric in detailMetrics" :key="metric.label" class="detail-metric"><b>{{ metric.value }}</b><span>{{ metric.label }}</span></div></div>
      <div class="detail-actions">
        <button class="enter-btn" type="button" @click="openSelected">{{ detail.action }} <span>→</span></button>
        <button v-if="selectedDept !== 'all' || selectedKpi" class="reset-btn" type="button" @click="resetView">返回全馆</button>
      </div>

      <section class="rail-section work-rail">
        <div class="rail-title"><span class="zh">域外书架</span><span class="latin">OUTER SHELF</span><span class="rule"></span></div>
        <OuterShelf compact />
      </section>
      <section class="rail-section recent-rail">
        <div class="rail-title"><span class="zh">最近足迹</span><span class="latin">RECENT PAGES</span><span class="rule"></span></div>
        <RecentRail />
      </section>
    </aside>
  </main>
</template>

<style scoped>
.home {
  --home-surface: color-mix(in srgb, var(--color-surface) 72%, transparent);
  --home-surface-strong: color-mix(in srgb, var(--color-surface-2) 94%, transparent);
  --home-soft: color-mix(in srgb, var(--color-ink) 5%, transparent);
  --home-line-strong: color-mix(in srgb, var(--color-ink) 25%, transparent);
  --home-shadow: rgba(0, 0, 0, 0.38);
  position: relative;
  height: calc(100vh - var(--header-h) - 32px);
  min-height: 680px;
  isolation: isolate;
}
.home::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.18;
  background: repeating-linear-gradient(0deg, transparent 0 3px, color-mix(in srgb, var(--color-ink) 5%, transparent) 3px 4px);
}
.links { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 0; }
.icon { width: 17px; height: 17px; display: block; fill: none; stroke: currentColor; stroke-width: 1.45; stroke-linecap: round; stroke-linejoin: round; }
.stage-head { position: absolute; left: 28px; top: 22px; z-index: 8; }
.eyebrow { color: var(--color-gold); font-size: 10px; line-height: 1.4; letter-spacing: 0.24em; text-transform: uppercase; }
.stage-title { margin: 5px 0 0; color: var(--color-ink); font: 600 22px/1.3 var(--font-serif); letter-spacing: 0.12em; }
.stage-caption { margin: 4px 0 0; color: var(--color-ink-faint); font-size: 11px; line-height: 1.6; letter-spacing: 0.06em; }
.stage-actions { position: absolute; left: 28px; top: 118px; z-index: 9; display: flex; gap: 7px; }
.small-btn { display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; color: var(--color-ink-faint); background: var(--home-soft); border: 1px solid var(--color-line); border-radius: 99px; cursor: pointer; font: 10px var(--font-sans); letter-spacing: 0.06em; }
.small-btn .icon { width: 12px; height: 12px; }
.small-btn:hover { color: var(--color-ink); border-color: var(--home-line-strong); }
.sync-pill { position: absolute; z-index: 12; right: 2%; top: 18px; display: flex; align-items: center; gap: 9px; max-width: 31.5%; padding: 9px 15px; color: var(--color-ink-dim); background: var(--home-surface-strong); border: 1px solid var(--color-line); border-radius: 99px; box-shadow: 0 8px 28px var(--home-shadow); backdrop-filter: blur(12px); font: 11px var(--font-sans); white-space: nowrap; }
.sync-pill .latin { color: var(--color-ink-faint); font-size: 9px; }
.live-dot { width: 6px; height: 6px; flex: none; border-radius: 50%; background: var(--collegium); box-shadow: 0 0 8px var(--collegium); }
.orb-zone { position: absolute; left: 1.8%; top: 53%; transform: translateY(-50%); width: 360px; text-align: center; z-index: 5; }
.orb-title { color: var(--color-ink); font: 600 18px/1.45 var(--font-serif); letter-spacing: 0.14em; }
.orb-sub { margin-top: 3px; color: var(--color-ink-faint); font-size: 9px; line-height: 1.5; letter-spacing: 0.2em; }
.orb-badges { display: flex; justify-content: center; gap: 7px; margin-top: -2px; }
.pill { padding: 4px 9px; color: var(--color-ink-dim); background: var(--home-soft); border: 1px solid var(--color-line); border-radius: 99px; font: 9px var(--font-sans); letter-spacing: 0.06em; }
.pill.gold { color: var(--color-gold); border-color: color-mix(in srgb, var(--color-gold) 30%, transparent); }

/* 五类 KPI：名册、剖面、馆藏主索引、SCL 收容框、空间环。 */
.stats { position: absolute; left: 29.3%; top: 53%; transform: translateY(-50%); width: 190px; display: flex; flex-direction: column; gap: 12px; z-index: 6; }
.stat { --stat-color: var(--collegium); position: relative; display: grid; grid-template-columns: 34px 1fr; align-items: center; gap: 10px; min-height: 82px; padding: 12px 12px 10px; overflow: hidden; text-align: left; color: var(--color-ink); border: 1px solid color-mix(in srgb, var(--stat-color) 27%, var(--color-line)); border-radius: 12px; background: linear-gradient(145deg, color-mix(in srgb, var(--stat-color) 8%, transparent), transparent 65%), var(--home-surface); box-shadow: 0 12px 26px var(--home-shadow), inset 0 1px color-mix(in srgb, var(--color-ink) 4%, transparent); backdrop-filter: blur(9px); transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; cursor: pointer; font-family: var(--font-sans); }
.stat:hover, .stat.is-active { transform: translateX(4px); border-color: color-mix(in srgb, var(--stat-color) 65%, transparent); }
.stat.is-active { box-shadow: 0 0 24px color-mix(in srgb, var(--stat-color) 14%, transparent), 0 14px 30px var(--home-shadow); }
.stat.is-active .stat-num { color: var(--stat-color); }
.stat-icon { width: 32px; height: 32px; display: grid; place-items: center; color: var(--stat-color); border: 1px solid color-mix(in srgb, var(--stat-color) 30%, transparent); border-radius: 8px; }
.stat-icon .icon { width: 19px; height: 19px; }
.stat-num { color: var(--color-ink); font: 600 24px/1 var(--font-display); font-variant-numeric: tabular-nums; }
.stat-lab { margin-top: 5px; color: var(--color-ink-dim); font-size: 11px; white-space: nowrap; }
.stat-lab .latin { display: block; margin: 3px 0 0; color: var(--color-ink-faint); font-size: 7px; letter-spacing: 0.12em; opacity: 0.82; }
.stat-tag { position: absolute; right: 10px; top: 8px; color: var(--stat-color); font: 8px/1 var(--font-sans); letter-spacing: 0.1em; opacity: 0.8; }
.stat-note { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-top: 1px; padding-top: 6px; color: var(--color-ink-faint); border-top: 1px solid var(--color-line); font: 8px/1.2 var(--font-kai); letter-spacing: 0.06em; }
.stat-note .latin { font-size: 7px; }
.stat.librarians { border-radius: 4px 13px 13px 4px; border-left: 2px solid var(--stat-color); }
.stat.librarians::after { content: ''; position: absolute; left: 5px; top: 10px; bottom: 10px; width: 1px; background: color-mix(in srgb, var(--stat-color) 25%, transparent); }
.stat.floors { --stat-color: var(--turris); border-radius: 4px; }
.floor-glyph { position: absolute; right: 11px; bottom: 27px; width: 34px; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 2px; opacity: 0.5; }
.floor-glyph i { display: block; height: 2px; background: var(--stat-color); }
.floor-glyph i:nth-child(1), .floor-glyph i:nth-child(6) { width: 32px; }
.floor-glyph i:nth-child(2), .floor-glyph i:nth-child(5) { width: 26px; }
.floor-glyph i:nth-child(3), .floor-glyph i:nth-child(4) { width: 20px; }
.stat.hub { --stat-color: var(--color-gold); border-color: color-mix(in srgb, var(--color-gold) 60%, transparent); background: linear-gradient(150deg, color-mix(in srgb, var(--color-gold) 14%, transparent), transparent 70%), var(--home-surface); box-shadow: 0 0 28px color-mix(in srgb, var(--color-gold) 13%, transparent), 0 14px 32px var(--home-shadow); }
.stat.hub .stat-num { color: var(--color-gold); }
.stat.anomalies { --stat-color: var(--armarium); border-radius: 3px; background: linear-gradient(135deg, color-mix(in srgb, var(--armarium) 11%, transparent), transparent 58%), var(--home-surface); }
.stat.anomalies::before, .stat.anomalies::after { content: ''; position: absolute; width: 10px; height: 10px; border-color: var(--stat-color); opacity: 0.7; pointer-events: none; }
.stat.anomalies::before { left: 4px; top: 4px; border-left: 1px solid; border-top: 1px solid; }
.stat.anomalies::after { right: 4px; bottom: 4px; border-right: 1px solid; border-bottom: 1px solid; }
.stat.anomalies .stat-icon { border-radius: 2px; transform: rotate(45deg); }
.stat.anomalies .stat-icon .icon { transform: rotate(-45deg); }
.stat.anomalies .stat-tag { padding: 3px 4px; border: 1px solid color-mix(in srgb, var(--stat-color) 35%, transparent); }
.stat.spaces { --stat-color: color-mix(in srgb, var(--armarium) 70%, var(--director) 30%); border-radius: 18px 5px 18px 5px; }
.stat.spaces::before { content: ''; position: absolute; width: 104px; height: 104px; right: 0; top: -34px; border: 1px solid color-mix(in srgb, var(--stat-color) 28%, transparent); border-radius: 50%; box-shadow: 0 0 0 9px color-mix(in srgb, var(--stat-color) 5%, transparent), 0 0 0 19px color-mix(in srgb, var(--stat-color) 4%, transparent); transform: translateX(50%) rotate(-25deg) scaleY(0.42); }
.stat.spaces .stat-icon { border-radius: 50%; box-shadow: inset 0 0 10px color-mix(in srgb, var(--stat-color) 12%, transparent); }

/* 页面入口与贝塞尔脉络 */
.entities { position: absolute; left: 49.5%; top: 82px; bottom: 42px; width: 230px; display: flex; flex-direction: column; justify-content: space-between; z-index: 7; }
.entity { --c: var(--collegium); position: relative; display: flex; align-items: center; width: 100%; min-height: 30px; padding: 4px 0; color: var(--color-ink-dim); border: 0; background: transparent; text-align: left; cursor: pointer; white-space: nowrap; transition: opacity 0.25s, transform 0.2s, color 0.2s; font-family: var(--font-sans); }
.entity--director { --c: var(--director); }
.entity--turris { --c: var(--turris); }
.entity--armarium { --c: var(--armarium); }
.entity--collegium { --c: var(--collegium); }
.entity:hover, .entity.is-active { color: var(--color-ink); transform: translateX(4px); }
.entity.is-dim { opacity: 0.22; }
.entity-node { width: 6px; height: 6px; flex: none; margin-right: 10px; border: 1px solid var(--c); border-radius: 50%; background: color-mix(in srgb, var(--c) 45%, transparent); box-shadow: 0 0 7px color-mix(in srgb, var(--c) 50%, transparent); }
.entity-name { font: 500 12px/1.35 var(--font-serif); letter-spacing: 0.05em; }
.entity-meta { margin-left: auto; padding-left: 12px; color: var(--color-ink-faint); font-size: 8px; line-height: 1; letter-spacing: 0.08em; }
.entity-dept { margin-left: 7px; color: var(--c); font-size: 9px; opacity: 0.8; }
.flow { transition: opacity 0.25s; }
.flow-base { fill: none; stroke: var(--c); stroke-width: 1; opacity: 0.42; }
.flow-pulse { fill: none; stroke: var(--c); stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 3 240; animation: flow 6s linear infinite; opacity: 0.85; }
.flow.is-dim { opacity: 0.08; }
.flow.is-active .flow-base { opacity: 0.9; stroke-width: 1.35; }
.flow.is-active .flow-pulse { stroke-width: 2; opacity: 1; }
.root-link { fill: none; stroke: var(--collegium); stroke-width: 1; stroke-dasharray: 3 6; opacity: 0.26; }
.root-link.hub { stroke: var(--color-gold); stroke-dasharray: none; opacity: 0.48; }
@keyframes flow { to { stroke-dashoffset: -972; } }
.motion-off *, .motion-off *::before, .motion-off *::after { animation-play-state: paused !important; }
.graph-legend { position: absolute; left: 49.5%; bottom: 16px; z-index: 6; color: var(--color-ink-faint); font-size: 9px; line-height: 1; letter-spacing: 0.06em; }
.graph-legend span { color: var(--color-gold); }

/* 右侧馆务工作台：保留正式书架、足迹与编辑能力。 */
.detail { --active: var(--color-gold); position: absolute; right: 2%; top: 66px; bottom: 32px; z-index: 10; width: 31.5%; min-width: 350px; max-width: 460px; padding: 23px 24px 18px; overflow-x: hidden; overflow-y: auto; color: var(--color-ink); border: 1px solid var(--home-line-strong); border-radius: 22px; background: radial-gradient(460px 240px at 5% 0%, color-mix(in srgb, var(--active) 12%, transparent), transparent 66%), linear-gradient(155deg, var(--home-soft), transparent 58%), var(--home-surface); box-shadow: 0 28px 70px var(--home-shadow), inset 0 1px color-mix(in srgb, var(--color-ink) 6%, transparent); backdrop-filter: blur(18px); scrollbar-width: thin; scrollbar-color: var(--home-line-strong) transparent; }
.detail-head { display: flex; align-items: center; gap: 8px; color: var(--active); font: 11px var(--font-sans); letter-spacing: 0.08em; }
.detail-head::before { content: ''; width: 16px; height: 1px; background: currentColor; }
.detail-title { margin: 15px 0 0; color: var(--color-ink); font: 600 27px/1.2 var(--font-serif); letter-spacing: 0.1em; }
.detail-latin { margin-top: 5px; color: var(--color-ink-faint); font-size: 9px; line-height: 1.5; letter-spacing: 0.13em; text-transform: uppercase; }
.detail-desc { margin: 13px 0 0; color: var(--color-ink-dim); font-size: 12px; line-height: 1.85; }
.detail-status { display: inline-flex; align-items: center; gap: 7px; margin-top: 13px; padding: 4px 9px; color: var(--active); border: 1px solid color-mix(in srgb, var(--active) 32%, transparent); border-radius: 7px; background: color-mix(in srgb, var(--active) 7%, transparent); font: 10px var(--font-sans); }
.detail-status i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 6px currentColor; }
.detail-metrics { display: flex; gap: 0; margin-top: 16px; padding: 12px 0; border-top: 1px solid var(--color-line); border-bottom: 1px solid var(--color-line); }
.detail-metric { flex: 1; min-width: 0; }
.detail-metric + .detail-metric { padding-left: 13px; border-left: 1px solid var(--color-line); }
.detail-metric b { display: block; color: var(--color-ink); font: 600 17px/1.2 var(--font-display); font-variant-numeric: tabular-nums; }
.detail-metric span { display: block; margin-top: 3px; color: var(--color-ink-faint); font: 9px var(--font-sans); white-space: nowrap; }
.detail-actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.enter-btn { display: inline-flex; align-items: center; gap: 14px; padding: 8px 13px; color: var(--color-ink); background: var(--home-soft); border: 1px solid var(--home-line-strong); border-radius: 9px; cursor: pointer; font: 11px var(--font-sans); transition: border-color 0.18s, color 0.18s; }
.enter-btn:hover { color: var(--active); border-color: var(--active); }
.reset-btn { border: 0; background: none; color: var(--color-ink-faint); cursor: pointer; font: 10px var(--font-sans); }
.reset-btn:hover { color: var(--color-gold); }
.rail-section { margin-top: 20px; padding-top: 17px; border-top: 1px solid var(--color-line); }
.rail-title { display: flex; align-items: baseline; gap: 9px; margin-bottom: 12px; }
.rail-title .zh { color: var(--color-ink); font: 600 14px/1.3 var(--font-serif); letter-spacing: 0.13em; }
.rail-title .latin { color: var(--color-ink-faint); font-size: 8px; letter-spacing: 0.14em; }
.rail-title .rule { flex: 1; height: 1px; background: var(--color-line); }
.work-rail :deep(.shelf) { min-width: 0; }
.recent-rail :deep(.rail-row) { padding: 6px 0; gap: 8px; font-size: 11px; letter-spacing: 0.04em; }
.recent-rail :deep(.rail-time) { font-size: 9px; }
.recent-rail :deep(.rail-empty) { margin: 0; font-size: 10px; }

@media (max-width: 1320px) {
  .orb-zone { left: 1.2%; width: 315px; }
  .stats { left: 28%; width: 176px; }
  .entities { left: 49%; width: 210px; }
  .detail { min-width: 350px; padding-left: 20px; padding-right: 20px; }
  .entity-meta { font-size: 7px; }
  .graph-legend { left: 49%; }
}
@media (max-height: 790px) and (min-width: 1081px) {
  .orb-zone, .stats { top: 55%; }
  .stats { gap: 9px; }
  .stat { min-height: 70px; padding: 9px 10px 8px; }
  .stat-num { font-size: 21px; }
  .stat-note { padding-top: 4px; }
  .entities { top: 70px; bottom: 32px; }
  .entity { min-height: 26px; padding: 2px 0; }
  .detail { top: 60px; bottom: 20px; padding-top: 19px; }
  .detail-title { font-size: 23px; margin-top: 11px; }
  .detail-latin { display: none; }
  .detail-desc { margin-top: 9px; line-height: 1.65; }
  .detail-metrics { margin-top: 11px; padding: 9px 0; }
  .detail-actions { margin-top: 10px; }
  .rail-section { margin-top: 12px; padding-top: 10px; }
  .rail-title { margin-bottom: 8px; }
  .recent-rail :deep(.rail-row) { padding: 4px 0; }
}
@media (max-width: 1080px) {
  .home { height: auto; min-height: 0; padding: 130px 0 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
  .links { display: none; }
  .stage-head { left: 0; top: 24px; }
  .stage-actions { left: auto; right: 0; top: 28px; }
  .sync-pill { position: relative; right: auto; top: auto; max-width: none; grid-column: 1 / -1; grid-row: 1; justify-self: start; margin-top: -50px; }
  .orb-zone, .stats, .entities, .detail { position: relative; inset: auto; transform: none; width: auto; max-width: none; min-width: 0; }
  .orb-zone { align-self: center; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; align-content: center; }
  .stat.hub { grid-column: 1 / -1; grid-row: 1; }
  .entities { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px 26px; }
  .detail { grid-column: 1 / -1; max-height: none; }
  .graph-legend { display: none; }
}
@media (max-width: 650px) {
  .home { grid-template-columns: 1fr; }
  .stage-actions { position: relative; right: auto; top: auto; grid-column: 1; grid-row: 2; margin-top: -14px; }
  .sync-pill { grid-row: 3; margin-top: -12px; white-space: normal; }
  .orb-zone, .stats, .entities, .detail { grid-column: 1; }
  .entities { grid-template-columns: 1fr; }
  .detail { padding: 21px 18px; border-radius: 16px; }
  .stat { min-width: 0; }
  .stat-lab .latin { display: none; }
  .stat-note .latin { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .home *, .home *::before, .home *::after { animation: none !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
</style>
