<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { BATTLE_SYSTEMS, type BattleSystemId, type BattleSystemMetrics, type BattleStatTable } from '@rtl/shared'
import SystemRadar from '../components/SystemRadar.vue'

/** 展示顺序：BASE 默认，随后 LOB、RHD、PKM。 */
const ORDER: BattleSystemId[] = ['base', 'lob', 'rhd', 'pkm']

/** 六维图例的固定顺序与中文标签（与雷达轴一致）。 */
const METRIC_DIMS: Array<{ key: keyof BattleSystemMetrics; label: string }> = [
  { key: 'offense', label: '进攻性' },
  { key: 'defense', label: '防守性' },
  { key: 'speed', label: '速度线' },
  { key: 'resource', label: '资源循环' },
  { key: 'growth', label: '成长上限' },
  { key: 'learning', label: '上手门槛' },
]

const selected = ref<BattleSystemId>('base')

const info = computed(() => BATTLE_SYSTEMS[selected.value])

const hasData = computed(() => !!info.value.metrics)

const readySystems = computed(() =>
  ORDER.map((id) => ({ id, info: BATTLE_SYSTEMS[id], ready: !!BATTLE_SYSTEMS[id].metrics })),
)

/** 基础数值表（多模板系统为多张表；无 statTables 时由扁平字段拼单表兜底）。 */
const statTables = computed<BattleStatTable[]>(() => {
  const s = info.value
  if (s.statTables?.length) return s.statTables
  return [
    {
      rows: [
        { label: '起始费用上限', value: `${s.costCap} 点${s.costLabel}` },
        { label: '自动回费量', value: `${s.regen} 点/回合` },
        { label: '起始手牌上限', value: `${s.handLimit} 张` },
        { label: '自动抽牌数', value: `${s.draw} 张/回合` },
        { label: '牌组容量', value: `${s.deckLimit} 张` },
        { label: '手牌保留规则', value: s.keepHand ? '不自动弃牌' : '自动弃牌' },
        { label: '额外卡牌区', value: s.extraDeckZone ?? '—' },
        { label: '起始速度骰子', value: `${s.speedDice} 颗` },
        { label: '队伍容量', value: s.teamCapacity ?? '—' },
      ],
    },
  ]
})

/** 机制说明图片的完整路径（frontend/public/art/turris/systems/）。 */
const mechImages = computed(() => (info.value.mechanicsImages ?? []).map((f) => `/art/turris/systems/${f}`))

// 图片缺失占位降级：404 的表格图不再渲染破图，改为显示"图待补"提示框。
// 文件补进 public/art/turris/systems/ 后刷新即自动恢复。
const failedImages = reactive(new Set<string>())
function markImageFailed(img: string): void {
  failedImages.add(img)
}
</script>

<template>
  <div class="sys">
    <header class="page-header">
      <div class="page-header__eyebrow latin">Systema Pugnae</div>
      <h1 class="page-header__title">战斗系统</h1>
      <p class="page-header__desc">
        迎书楼各楼层采用的战斗体系总览。选择一个系统查看六维属性、优势劣势、开局数值与机制说明。
      </p>
    </header>

    <!-- 系统切换 -->
    <nav class="sys-switch">
      <button
        v-for="s in readySystems"
        :key="s.id"
        type="button"
        class="sys-switch__btn"
        :class="{ 'is-active': selected === s.id }"
        @click="selected = s.id"
      >
        <span class="sys-switch__code">{{ s.info.code }}</span>
        <span class="sys-switch__zh">{{ s.info.zh }}</span>
        <span v-if="!s.ready" class="sys-switch__soon">整理中</span>
      </button>
    </nav>

    <!-- 数据整理中占位 -->
    <div v-if="!hasData" class="sys-empty">
      <p class="sys-empty__title">《{{ info.zh }}》详细数据整理中</p>
      <p class="sys-empty__desc">该系统的六维评分、优劣势与开局数值尚未录入，敬请期待。</p>
    </div>

    <template v-else>
      <!-- 六维雷达 -->
      <section class="sys-block">
        <h2 class="sys-block__title">六维属性</h2>
        <div class="sys-radar-wrap">
          <SystemRadar :metrics="info.metrics!" :size="340" />
          <ul class="sys-legend">
            <li v-for="dim in METRIC_DIMS" :key="dim.key" class="sys-legend__item">
              <span class="sys-legend__label">{{ dim.label }}</span>
              <span class="sys-legend__dots"><i v-for="n in 5" :key="n" :class="{ on: n <= (info.metrics![dim.key] ?? 0) }" /></span>
              <span class="sys-legend__val">{{ info.metrics![dim.key] }} / 5</span>
            </li>
          </ul>
        </div>
        <p class="sys-note">上手门槛：1 分最易上手，5 分门槛最高。</p>
      </section>

      <!-- 优势 / 劣势 -->
      <section class="sys-block">
        <h2 class="sys-block__title">优势与劣势</h2>
        <div class="sys-pc">
          <div class="sys-pc__card sys-pc__card--pro">
            <h3>优势</h3>
            <p>{{ info.pros }}</p>
          </div>
          <div class="sys-pc__card sys-pc__card--con">
            <h3>劣势</h3>
            <p>{{ info.cons }}</p>
          </div>
        </div>
      </section>

      <!-- 开局数值（多表响应式：1 表居中，2 表左右，3 表横排） -->
      <section class="sys-block">
        <h2 class="sys-block__title">开局数值</h2>
        <div class="sys-tables" :class="`sys-tables--${Math.min(statTables.length, 3)}`">
          <div v-for="(table, ti) in statTables" :key="ti" class="sys-table-wrap">
            <div v-if="table.title" class="sys-table-title">{{ table.title }}</div>
            <table class="sys-table">
              <tbody>
                <tr v-for="row in table.rows" :key="row.label">
                  <th>{{ row.label }}</th>
                  <td>{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 机制说明 -->
      <section v-if="info.mechanicsDesc" class="sys-block">
        <h2 class="sys-block__title">机制说明</h2>
        <div class="sys-mech">
          <p class="sys-mech__text">{{ info.mechanicsDesc }}</p>
          <figure v-for="img in mechImages" :key="img" class="sys-mech__figure">
            <div v-if="failedImages.has(img)" class="sys-mech__missing">图待补：{{ img.split('/').pop() }}（放 art/turris/systems/ 后自动显示）</div>
            <img v-else :src="img" alt="机制表格" loading="lazy" @error="markImageFailed(img)" />
          </figure>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.sys {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sys-switch {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.sys-switch__btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 96px;
  padding: 10px 16px;
  border-radius: var(--radius);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  background: var(--color-surface);
  color: var(--color-ink);
  cursor: pointer;
  transition: all 0.15s ease;
}
.sys-switch__btn:hover {
  border-color: var(--accent);
}
.sys-switch__btn.is-active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--color-surface));
  box-shadow: inset 0 0 0 1px var(--accent);
}
.sys-switch__code {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.1em;
  color: var(--accent);
}
.sys-switch__zh {
  font-size: 12px;
  color: var(--color-ink-dim);
}
.sys-switch__soon {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 10px;
  color: var(--color-ink-faint);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 999px;
  padding: 0 5px;
}
.sys-empty {
  border: var(--bd-w) dashed var(--bd-color);
  border-radius: calc(var(--radius) + 4px);
  padding: 48px 24px;
  text-align: center;
}
.sys-empty__title {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--color-ink);
}
.sys-empty__desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-faint);
}
.sys-block {
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) + 4px);
  background: var(--color-surface);
  padding: 18px;
}
.sys-block__title {
  margin: 0 0 14px;
  font-size: 16px;
  color: var(--accent);
  border-left: 3px solid var(--accent);
  padding-left: 10px;
}
.sys-radar-wrap {
  display: flex;
  gap: 28px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.sys-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}
.sys-legend__item {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--color-ink-dim);
}
.sys-legend__label {
  color: var(--color-ink-dim);
}
.sys-legend__dots {
  display: inline-flex;
  gap: 3px;
}
.sys-legend__dots i {
  width: 14px;
  height: 5px;
  border-radius: 3px;
  background: var(--color-line);
}
.sys-legend__dots i.on {
  background: var(--accent);
}
.sys-legend__val {
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}
.sys-note {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--color-ink-faint);
}
.sys-pc {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.sys-pc__card {
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.sys-pc__card h3 {
  margin: 0 0 8px;
  font-size: 14px;
}
.sys-pc__card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: var(--color-ink-dim);
}
.sys-pc__card--pro h3 {
  color: #e0b564;
}
.sys-pc__card--pro {
  border-color: rgba(224, 181, 100, 0.35);
}
.sys-pc__card--con h3 {
  color: #d9766a;
}
.sys-pc__card--con {
  border-color: rgba(217, 118, 106, 0.35);
}
.sys-tables {
  display: grid;
  gap: 14px;
  justify-content: center;
}
/* 1 表：居中限宽；2 表：左右并排；3 表：横向排布。 */
.sys-tables--1 {
  grid-template-columns: minmax(0, 620px);
}
.sys-tables--2 {
  grid-template-columns: repeat(2, minmax(0, 340px));
}
.sys-tables--3 {
  grid-template-columns: repeat(3, minmax(0, 320px));
}
.sys-table-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sys-table-title {
  margin: 0 0 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink-dim);
  letter-spacing: 0.08em;
}
.sys-table {
  width: 100%;
  margin: 0 auto;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  font-size: 14px;
}
.sys-table th,
.sys-table td {
  border-bottom: var(--bd-w) var(--bd-style) var(--bd-color);
  padding: 10px 16px;
  text-align: left;
}
.sys-table tr:last-child th,
.sys-table tr:last-child td {
  border-bottom: none;
}
.sys-table th {
  width: 46%;
  font-weight: 600;
  color: var(--color-ink-dim);
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}
.sys-table td {
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}
.sys-mech {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sys-mech__text {
  margin: 0;
  font-size: 14px;
  line-height: 2;
  color: var(--color-ink-dim);
  white-space: pre-line;
}
.sys-mech__figure {
  margin: 0;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg);
}
.sys-mech__figure img {
  display: block;
  width: 100%;
  height: auto;
}
.sys-mech__missing {
  padding: 26px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-ink-dim);
  font-family: var(--font-mono, monospace);
}
@media (max-width: 960px) {
  .sys-tables--2,
  .sys-tables--3 {
    grid-template-columns: minmax(0, 620px);
  }
}
@media (max-width: 720px) {
  .sys-pc {
    grid-template-columns: 1fr;
  }
}
</style>
