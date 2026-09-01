<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { OverviewStats } from '@rtl/shared'
import { useOverviewStore } from '@/app/stores/overview'
import silhouette from '@/shared/assets/tree-silhouette.jpeg'

const router = useRouter()
const overview = useOverviewStore()

type StatKey = keyof OverviewStats

interface Zone {
  id: string
  to: string
  zh: string
  latin: string
  desc: string
  stats: Array<{ key: StatKey; label: string }>
}

const zones: Zone[] = [
  {
    id: 'crown',
    to: '/director',
    zh: '馆长层',
    latin: 'Director Floor',
    desc: '申瑟 · 白石庄园 · 内务司书 · 属兽',
    stats: [{ key: 'librarians', label: '司书总数' }],
  },
  {
    id: 'trunk-left',
    to: '/turris',
    zh: '迎书楼',
    latin: 'Turris Librorum Adventantium',
    desc: '战斗司书 · 以战养藏 · 楼层试炼',
    stats: [
      { key: 'floors', label: '楼层' },
      { key: 'guests', label: '来宾' },
    ],
  },
  {
    id: 'trunk-right',
    to: '/armarium',
    zh: '藏书阁',
    latin: 'Armarium Absconditorum',
    desc: '研究司书 · SCL 协议 · 书库体系',
    stats: [
      { key: 'books', label: '馆藏' },
      { key: 'anomalies', label: '异常实体' },
      { key: 'spaces', label: '超自然空间' },
      { key: 'repositories', label: '书库' },
    ],
  },
  {
    id: 'roots',
    to: '/collegium',
    zh: '寻书社',
    latin: 'Collegium Quaerendorum Librorum',
    desc: '探索司书 · 折射轨道 · 生木髓',
    stats: [
      { key: 'stations', label: '轨道站点' },
      { key: 'energyTotal', label: '生木髓总量' },
    ],
  },
]

// 视图空间：920x956（近方，适应约一半宽度的导览区），树剪影按 0.6 比例置于中央，信息框骑树边四角铺开
const VBW = 920
const VBH = 956
const TREE_X = 173
const TREE_W = 574
const TREE_H = 956
const PW = 260
const EDGE = 8
const LEFT_X = EDGE
const RIGHT_X = VBW - EDGE - PW
const BASE_H = 160
const ROW_STEP = 38
const PAD_GAP = 26

// 树在 920x956 中的四个区域（依据剪影实测：冠部上 37.5%，枝干中 32.5%，根系下 30%）
const regions: Record<string, { x: number; y: number; w: number; h: number }> = {
  crown: { x: TREE_X, y: 0, w: TREE_W, h: 358 },
  'trunk-left': { x: TREE_X, y: 358, w: 287, h: 311 },
  'trunk-right': { x: TREE_X + 287, y: 358, w: 287, h: 311 },
  roots: { x: TREE_X, y: 669, w: TREE_W, h: 287 },
}

interface PanelGeo {
  x: number
  y: number
  w: number
  h: number
  dot: { x: number; y: number }
  line: Array<{ x: number; y: number }>
}

// 每条折线严格按导览稿各自形状：馆长层=斜抬折入右上、迎书楼/藏书阁=横出拐折、寻书社=水平-台阶-落折
function geoFor(id: string, h: number): PanelGeo {
  switch (id) {
    // 馆长层 → 右上：从树冠锚点斜抬约 40° 再折成水平进框
    case 'crown':
      return {
        x: RIGHT_X,
        y: 40,
        w: PW,
        h,
        dot: { x: 450, y: 250 },
        line: [
          { x: 450, y: 250 },
          { x: 690, y: 110 },
          { x: RIGHT_X, y: 110 },
        ],
      }
    // 迎书楼 → 左中：从左侧枝干长水平横出，近框缘短拐折
    case 'trunk-left':
      return {
        x: LEFT_X,
        y: 400,
        w: PW,
        h,
        dot: { x: 400, y: 520 },
        line: [
          { x: 400, y: 520 },
          { x: LEFT_X + PW, y: 520 },
          { x: LEFT_X + PW, y: 510 },
        ],
      }
    // 藏书阁 → 右中：从右侧枝干长水平横出，近框缘短拐折
    case 'trunk-right':
      return {
        x: RIGHT_X,
        y: 360,
        w: PW,
        h,
        dot: { x: 540, y: 520 },
        line: [
          { x: 540, y: 520 },
          { x: RIGHT_X, y: 520 },
          { x: RIGHT_X, y: 510 },
        ],
      }
    // 寻书社 → 左下：水平 → 上抬台阶 → 水平 → 落折进框
    case 'roots':
      return {
        x: LEFT_X,
        y: 640,
        w: PW,
        h,
        dot: { x: 480, y: 830 },
        line: [
          { x: 480, y: 830 },
          { x: 400, y: 830 },
          { x: 400, y: 790 },
          { x: LEFT_X + PW, y: 790 },
          { x: LEFT_X + PW, y: 770 },
        ],
      }
    default:
      return { x: 0, y: 0, w: PW, h, dot: { x: 0, y: 0 }, line: [] }
  }
}

const geo = computed<Record<string, PanelGeo>>(() => {
  const m: Record<string, PanelGeo> = {}
  for (const z of zones) {
    const h = BASE_H + z.stats.length * ROW_STEP
    m[z.id] = geoFor(z.id, h)
  }
  return m
})

const panels = computed(() =>
  zones.map((z) => {
    const g = geo.value[z.id]!
    const pad = PAD_GAP
    const rows = z.stats.map((s, i) => ({
      label: s.label,
      value: overview.stats ? formatValue(overview.stats[s.key]) : '—',
      labelX: g.x + pad,
      valueX: g.x + g.w - pad,
      y: g.y + 116 + i * ROW_STEP,
    }))
    return {
      zone: z,
      ...g,
      rows,
      pad,
      titleY: g.y + 44,
      latinY: g.y + 70,
      ruleY: g.y + 86,
      descY: g.y + g.h - 26,
    }
  }),
)

const leaders = computed(() =>
  zones.map((z) => {
    const g = geo.value[z.id]!
    return {
      id: z.id,
      dot: g.dot,
      points: g.line.map((p) => `${p.x},${p.y}`).join(' '),
    }
  }),
)

const activeId = ref<string | null>(null)

function go(zone: Zone): void {
  void router.push(zone.to)
}

function formatValue(v: number | undefined): string {
  if (v === undefined || Number.isNaN(v)) return '—'
  return v.toLocaleString('zh-CN')
}

onMounted(() => {
  void overview.load()
})
</script>

<template>
  <div class="tree-stage">
    <div class="tree-glow" aria-hidden="true"></div>

    <svg
      class="tree-svg"
      viewBox="0 0 920 956"
      role="img"
      aria-label="遗迹图书馆 · 黑色巨树剪影"
    >
      <defs>
        <filter id="rtl-mask" x="0" y="0" width="100%" height="100%">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.3333 -0.3333 -0.3333 0 1"
          />
        </filter>
        <mask id="rtl-tree" maskUnits="userSpaceOnUse" x="173" y="0" width="574" height="956">
          <image
            :href="silhouette"
            x="173"
            y="0"
            width="574"
            height="956"
            filter="url(#rtl-mask)"
          />
        </mask>
        <clipPath id="rr-crown"><rect x="173" y="0" width="574" height="358" /></clipPath>
        <clipPath id="rr-trunk-left"><rect x="173" y="358" width="287" height="311" /></clipPath>
        <clipPath id="rr-trunk-right"><rect x="460" y="358" width="287" height="311" /></clipPath>
        <clipPath id="rr-roots"><rect x="173" y="669" width="574" height="287" /></clipPath>
      </defs>

      <!-- 可见树剪影：与高亮遮罩同坐标系，用 feColorMatrix 把白底变透明、黑树保留为纯色剪影 -->
      <image
        class="tree-silhouette"
        :href="silhouette"
        x="173"
        y="0"
        width="574"
        height="956"
        preserveAspectRatio="xMidYMid meet"
        filter="url(#rtl-mask)"
        aria-hidden="true"
      />

      <!-- 命中区（透明，捕捉悬停/点击） -->
      <g
        v-for="zone in zones"
        :key="'z-' + zone.id"
        class="tree-zone"
        :class="{ 'is-active': activeId === zone.id }"
        :data-zone="zone.id"
        tabindex="0"
        role="button"
        :aria-label="`${zone.zh} · 点击前往`"
        @mouseenter="activeId = zone.id"
        @mouseleave="activeId = null"
        @focus="activeId = zone.id"
        @blur="activeId = null"
        @click="go(zone)"
        @keydown.enter="go(zone)"
        @keydown.space.prevent="go(zone)"
      >
        <rect
          v-if="regions[zone.id]"
          :x="regions[zone.id]!.x"
          :y="regions[zone.id]!.y"
          :width="regions[zone.id]!.w"
          :height="regions[zone.id]!.h"
          class="zone-hit"
          rx="14"
        />
      </g>

      <!-- 高亮（贴合树的实际像素形状：区域内 + 用剪影做遮罩） -->
      <g
        v-for="zone in zones"
        :key="'hl-' + zone.id"
        class="zone-hl"
        :class="{ 'is-active': activeId === zone.id }"
        :data-zone="zone.id"
        :clip-path="`url(#rr-${zone.id})`"
      >
        <rect x="173" y="0" width="574" height="956" class="zone-hl-bg" />
        <rect x="173" y="0" width="574" height="956" class="zone-hl-tree" mask="url(#rtl-tree)" />
      </g>

      <g
        v-for="l in leaders"
        :key="'lead-' + l.id"
        class="tree-leader"
        :class="{ 'is-active': activeId === l.id }"
        :data-zone="l.id"
      >
        <polyline :points="l.points" class="leader-line" />
        <circle :cx="l.dot.x" :cy="l.dot.y" r="4.4" class="leader-dot-halo" />
        <circle :cx="l.dot.x" :cy="l.dot.y" r="4.4" class="leader-dot" />
      </g>

      <g
        v-for="p in panels"
        :key="'p-' + p.zone.id"
        class="tree-panel"
        :class="{ 'is-active': activeId === p.zone.id }"
        :data-zone="p.zone.id"
        tabindex="0"
        role="button"
        :aria-label="`${p.zone.zh} · 点击前往`"
        @mouseenter="activeId = p.zone.id"
        @mouseleave="activeId = null"
        @focus="activeId = p.zone.id"
        @blur="activeId = null"
        @click="go(p.zone)"
        @keydown.enter="go(p.zone)"
        @keydown.space.prevent="go(p.zone)"
      >
        <rect :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="0" class="panel-rect" />
        <text :x="p.x + p.pad" :y="p.titleY" class="panel-title">{{ p.zone.zh }}</text>
        <text :x="p.x + p.pad" :y="p.latinY" class="panel-latin">{{ p.zone.latin }}</text>
        <line
          :x1="p.x + p.pad"
          :y1="p.ruleY"
          :x2="p.x + p.w - p.pad"
          :y2="p.ruleY"
          class="panel-rule"
        />
        <template v-for="r in p.rows" :key="r.label">
          <text :x="r.labelX" :y="r.y" class="panel-label">{{ r.label }}</text>
          <text :x="r.valueX" :y="r.y" class="panel-value" text-anchor="end">{{ r.value }}</text>
        </template>
        <text :x="p.x + p.pad" :y="p.descY" class="panel-desc">{{ p.zone.desc }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.tree-stage {
  position: relative;
  height: clamp(600px, 78vh, 940px);
  max-width: 100%;
  aspect-ratio: 920 / 956;
  margin: 0 auto;
}

.tree-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(closest-side at 50% 40%, rgba(186, 201, 172, 0.16) 0%, rgba(140, 156, 124, 0.11) 48%, transparent 74%),
    radial-gradient(closest-side at 50% 84%, rgba(120, 138, 104, 0.1), transparent 70%);
  filter: blur(5px);
}

.tree-silhouette {
  display: block;
  pointer-events: none;
}

.tree-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.tree-zone {
  cursor: pointer;
}

.zone-hit {
  fill: transparent;
  pointer-events: fill;
  stroke: transparent;
  stroke-width: 2;
  transition: stroke 0.2s ease;
}

.zone-hl {
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.zone-hl-bg {
  fill: var(--zone-accent);
  opacity: 0.04;
}

.zone-hl-tree {
  fill: var(--zone-accent);
  opacity: 0.45;
}

.tree-zone[data-zone='crown'],
.tree-panel[data-zone='crown'],
.tree-leader[data-zone='crown'],
.zone-hl[data-zone='crown'] {
  --zone-accent: var(--director);
}

.tree-zone[data-zone='trunk-left'],
.tree-panel[data-zone='trunk-left'],
.tree-leader[data-zone='trunk-left'],
.zone-hl[data-zone='trunk-left'] {
  --zone-accent: var(--turris);
}

.tree-zone[data-zone='trunk-right'],
.tree-panel[data-zone='trunk-right'],
.tree-leader[data-zone='trunk-right'],
.zone-hl[data-zone='trunk-right'] {
  --zone-accent: var(--armarium);
}

.tree-zone[data-zone='roots'],
.tree-panel[data-zone='roots'],
.tree-leader[data-zone='roots'],
.zone-hl[data-zone='roots'] {
  --zone-accent: var(--collegium);
}

.tree-zone:hover .zone-hit,
.tree-zone:focus-visible .zone-hit,
.tree-zone.is-active .zone-hit {
  stroke: color-mix(in srgb, var(--zone-accent) 60%, transparent);
  filter: none;
}

.zone-hl.is-active {
  opacity: 1;
}

.tree-leader {
  pointer-events: none;
}

.leader-line {
  fill: none;
  stroke: var(--zone-accent);
  stroke-width: 2;
}

.leader-dot {
  fill: #fff;
}

.leader-dot-halo {
  fill: rgba(255, 255, 255, 0.22);
}

.tree-leader.is-active .leader-line {
  stroke: var(--zone-accent);
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--zone-accent) 70%, transparent));
}

.tree-leader.is-active .leader-dot {
  filter: drop-shadow(0 0 4px #fff);
}

.tree-panel {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.panel-rect {
  fill: rgba(24, 19, 13, 0.94);
  stroke: var(--zone-accent);
  stroke-width: 2;
  transition:
    stroke 0.2s ease,
    fill 0.2s ease;
}

.panel-title {
  fill: var(--color-ink);
  font-size: 32px;
  font-weight: 700;
  font-family: var(--font-serif);
}

.panel-latin {
  fill: var(--color-ink-faint);
  font-size: 13px;
  font-family: var(--font-display);
  letter-spacing: 0.07em;
}

.panel-rule {
  stroke: var(--color-line);
  stroke-width: 1;
}

.panel-label {
  fill: var(--color-ink-dim);
  font-size: 18px;
  font-family: var(--font-sans);
}

.panel-value {
  fill: var(--zone-accent);
  font-size: 30px;
  font-weight: 700;
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
}

.panel-desc {
  fill: var(--color-ink-faint);
  font-size: 15px;
  font-family: var(--font-kai);
}

.tree-panel:hover .panel-rect,
.tree-panel:focus-visible .panel-rect,
.tree-panel.is-active .panel-rect {
  stroke: var(--zone-accent);
}

@media (max-width: 720px) {
  .tree-stage {
    height: auto;
    width: 92vw;
  }
}
</style>
