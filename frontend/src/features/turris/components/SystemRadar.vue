<script setup lang="ts">
import { computed } from 'vue'
import type { BattleSystemMetrics } from '@rtl/shared'

const props = defineProps<{
  metrics: BattleSystemMetrics
  /** 主色（CSS 颜色值，用于多边形与网格强调）。 */
  accent?: string
  size?: number
}>()

const DIMS: Array<{ key: keyof BattleSystemMetrics; label: string }> = [
  { key: 'offense', label: '进攻性' },
  { key: 'defense', label: '防守性' },
  { key: 'speed', label: '速度线' },
  { key: 'resource', label: '资源循环' },
  { key: 'growth', label: '成长上限' },
  { key: 'learning', label: '上手门槛' },
]

const SIZE = computed(() => props.size ?? 320)
const CX = computed(() => SIZE.value / 2)
const CY = computed(() => SIZE.value / 2 + 4)
const R = computed(() => SIZE.value * 0.34)
const MAX = 5

function axisAngle(i: number): number {
  // 从正上方开始，顺时针每 60° 一轴
  return (-90 + i * 60) * (Math.PI / 180)
}
function point(i: number, radius: number): { x: number; y: number } {
  const a = axisAngle(i)
  return { x: CX.value + Math.cos(a) * radius, y: CY.value + Math.sin(a) * radius }
}

/** 5 层同心网格（1~5 环）。 */
const gridPolys = computed(() =>
  Array.from({ length: MAX }, (_, li) =>
    DIMS.map((_, i) => {
      const p = point(i, (R.value * (li + 1)) / MAX)
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' '),
  ),
)

/** 轴线。 */
const axisLines = computed(() =>
  DIMS.map((_, i) => {
    const p = point(i, R.value)
    return { x1: CX.value, y1: CY.value, x2: p.x, y2: p.y }
  }),
)

/** 数据多边形顶点。 */
const dataPoints = computed(() => {
  const vals = DIMS.map((d) => Math.max(0, Math.min(MAX, props.metrics[d.key] ?? 0)))
  return {
    poly: vals
      .map((v, i) => {
        const p = point(i, (R.value * v) / MAX)
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
      })
      .join(' '),
    dots: vals.map((v, i) => ({ ...point(i, (R.value * v) / MAX), v, label: DIMS[i]!.label })),
  }
})

/** 轴标签位置（外圈再往外一点）。 */
const labels = computed(() =>
  DIMS.map((d, i) => {
    const p = point(i, R.value + 20)
    const a = axisAngle(i)
    const deg = (a * 180) / Math.PI
    // 按角度决定文字锚点，避免标签出界
    const anchor = Math.abs(Math.cos(a)) < 0.35 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end'
    return { ...p, label: d.label, anchor, dy: deg > 20 && deg < 160 ? 10 : deg < -20 && deg > -160 ? -4 : 4 }
  }),
)

const accentColor = computed(() => props.accent ?? 'var(--accent)')
</script>

<template>
  <svg :width="SIZE" :height="SIZE + 8" :viewBox="`0 0 ${SIZE} ${SIZE + 8}`" class="radar" role="img" aria-label="系统六维属性雷达图">
    <!-- 同心网格 -->
    <polygon
      v-for="(poly, i) in gridPolys"
      :key="'g' + i"
      :points="poly"
      fill="none"
      stroke="var(--color-line)"
      :stroke-opacity="i === MAX - 1 ? 0.55 : 0.3"
      stroke-width="1"
    />
    <!-- 轴线 -->
    <line v-for="(l, i) in axisLines" :key="'l' + i" v-bind="l" stroke="var(--color-line)" stroke-opacity="0.3" stroke-width="1" />
    <!-- 数据多边形 -->
    <polygon :points="dataPoints.poly" :fill="accentColor" fill-opacity="0.16" :stroke="accentColor" stroke-width="2" stroke-linejoin="round" />
    <circle
      v-for="(d, i) in dataPoints.dots"
      :key="'d' + i"
      :cx="d.x"
      :cy="d.y"
      r="3.5"
      :fill="accentColor"
      stroke="var(--color-surface)"
      stroke-width="1.5"
    >
      <title>{{ `${d.label}：${d.v}` }}</title>
    </circle>
    <!-- 轴标签 -->
    <text
      v-for="(lb, i) in labels"
      :key="'t' + i"
      :x="lb.x"
      :y="lb.y"
      :dy="lb.dy"
      :text-anchor="lb.anchor"
      class="radar__label"
    >
      {{ lb.label }}
    </text>
  </svg>
</template>

<style scoped>
.radar {
  display: block;
  max-width: 100%;
}
.radar__label {
  fill: var(--color-ink-dim);
  font-size: 13px;
  letter-spacing: 0.04em;
}
</style>
