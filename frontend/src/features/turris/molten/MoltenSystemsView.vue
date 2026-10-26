<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { BATTLE_SYSTEMS, type BattleSystemId, type BattleSystemMetrics, type BattleStatTable } from '@rtl/shared'
import SystemRadar from '../components/SystemRadar.vue'

const ORDER: BattleSystemId[] = ['base', 'lob', 'rhd', 'pkm']
const METRIC_DIMS: Array<{ key: keyof BattleSystemMetrics; label: string }> = [
  { key: 'offense', label: '进攻性' }, { key: 'defense', label: '防守性' }, { key: 'speed', label: '速度线' },
  { key: 'resource', label: '资源循环' }, { key: 'growth', label: '成长上限' }, { key: 'learning', label: '上手门槛' },
]
const selected = ref<BattleSystemId>('base')
const info = computed(() => BATTLE_SYSTEMS[selected.value])
const hasData = computed(() => !!info.value.metrics)
const systems = computed(() => ORDER.map((id, i) => ({ id, info: BATTLE_SYSTEMS[id], index: String(i + 1).padStart(2, '0') })))
const statTables = computed<BattleStatTable[]>(() => info.value.statTables?.length ? info.value.statTables : [{ rows: [
  { label: '起始费用上限', value: `${info.value.costCap} 点${info.value.costLabel}` }, { label: '自动回费量', value: `${info.value.regen} 点/回合` },
  { label: '起始手牌上限', value: `${info.value.handLimit} 张` }, { label: '自动抽牌数', value: `${info.value.draw} 张/回合` },
  { label: '牌组容量', value: `${info.value.deckLimit} 张` }, { label: '手牌保留规则', value: info.value.keepHand ? '不自动弃牌' : '自动弃牌' },
  { label: '额外卡牌区', value: info.value.extraDeckZone ?? '—' }, { label: '起始速度骰子', value: `${info.value.speedDice} 颗` }, { label: '队伍容量', value: info.value.teamCapacity ?? '—' },
] }])
const mechImages = computed(() => (info.value.mechanicsImages ?? []).map((f) => `/art/turris/systems/${f}`))
const failedImages = reactive(new Set<string>())
</script>

<template>
  <div class="molten-page systems">
    <div class="systems__layout">
      <aside class="system-rail" aria-label="战斗系统选择">
        <div class="molten-heading"><div><h2>系统档案</h2><p>SYSTEMA PUGNAE</p></div></div>
        <button v-for="s in systems" :key="s.id" type="button" :class="{ 'is-active': selected === s.id }" @click="selected = s.id">
          <span>{{ s.index }}</span><strong>{{ s.info.code }}</strong><small>{{ s.info.zh }}</small><i>△</i>
        </button>
      </aside>
      <main class="system-content">
        <header class="system-content__header"><div><span>ACTIVE COMBAT PROTOCOL / {{ info.code }}</span><h2>{{ info.zh }}</h2></div><b>{{ info.code }}</b></header>
        <div v-if="!hasData" class="system-empty molten-panel"><h3>《{{ info.zh }}》详细数据整理中</h3><p>该系统的六维评分、优劣势与开局数值尚未录入。</p></div>
        <template v-else>
          <section class="molten-panel system-profile">
            <div class="molten-heading"><div><h2>战斗轮廓</h2><p>六维属性 / 上手门槛 1 最易、5 最高</p></div><span>METRICS / 06</span></div>
            <div class="system-profile__body">
              <div class="system-radar"><SystemRadar :metrics="info.metrics!" :size="340" accent="var(--molten-red-bright)" /></div>
              <ul class="metric-list"><li v-for="dim in METRIC_DIMS" :key="dim.key"><span>{{ dim.label }}</span><div><i v-for="n in 5" :key="n" :class="{ on: n <= (info.metrics![dim.key] ?? 0) }" /></div><b>{{ info.metrics![dim.key] }} / 5</b></li></ul>
            </div>
            <div class="system-verdict"><div><h3>优势 / ADVANTAGE</h3><p>{{ info.pros }}</p></div><div><h3>劣势 / LIMITATION</h3><p>{{ info.cons }}</p></div></div>
          </section>
          <section class="molten-panel system-values">
            <div class="molten-heading"><div><h2>开局数值</h2><p>INITIAL PARAMETERS</p></div><span>{{ statTables.length }} TABLES</span></div>
            <div class="system-tables"><div v-for="(table, ti) in statTables" :key="ti"><h3 v-if="table.title">{{ table.title }}</h3><table><tbody><tr v-for="row in table.rows" :key="row.label"><th>{{ row.label }}</th><td>{{ row.value }}</td></tr></tbody></table></div></div>
          </section>
          <section v-if="info.mechanicsDesc" class="molten-panel system-mechanics">
            <div class="molten-heading"><div><h2>机制说明</h2><p>MECHANICS DOSSIER</p></div></div>
            <p>{{ info.mechanicsDesc }}</p>
            <figure v-for="img in mechImages" :key="img"><div v-if="failedImages.has(img)" class="image-missing">图待补：{{ img.split('/').pop() }}</div><img v-else :src="img" alt="战斗机制表格" loading="lazy" @error="failedImages.add(img)" /></figure>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.systems__layout { display: grid; grid-template-columns: minmax(10rem, 14rem) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
.system-rail { position: sticky; top: calc(var(--header-h) + 1rem); }
.system-rail .molten-heading { margin-bottom: .7rem; }
.system-rail > button { position: relative; display: grid; grid-template-columns: 1.5rem 1fr auto; gap: .3rem .6rem; width: 100%; padding: 1rem; border: 0; border-bottom: 1px solid var(--color-line); color: var(--color-ink); background: transparent; text-align: left; cursor: pointer; }
.system-rail > button > span { grid-row: 1 / 3; color: var(--color-ink-faint); font: .6rem var(--font-display); }
.system-rail > button strong { font: 1rem var(--font-display); letter-spacing: .08em; }
.system-rail > button small { grid-column: 2 / 4; color: var(--color-ink-faint); font-size: .68rem; }
.system-rail > button i { color: var(--color-ink-faint); font-style: normal; font-size: .6rem; }
.system-rail > button.is-active { background: var(--molten-red); color: var(--on-accent); clip-path: polygon(0 0, 100% 0, calc(100% - .7rem) 100%, 0 100%); }
.system-rail > button.is-active span, .system-rail > button.is-active small, .system-rail > button.is-active i { color: inherit; }
.system-content { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
.system-content__header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: clamp(1.25rem, 3vw, 2rem); color: var(--molten-light); background: linear-gradient(115deg, color-mix(in srgb, var(--molten-red) 20%, var(--molten-dark)), var(--molten-dark)); border-left: .2rem solid var(--molten-red); }
.system-content__header span { color: #d7968a; font: .55rem var(--font-display); letter-spacing: .12em; }
.system-content__header h2 { margin: .55rem 0 0; font: 600 clamp(1.5rem, 3vw, 2.25rem) var(--font-serif); }
.system-content__header > b { color: rgba(238, 233, 225, .08); font: clamp(3rem, 8vw, 6rem)/1 var(--font-display); }
.system-profile, .system-values, .system-mechanics { padding: clamp(1rem, 2vw, 1.5rem); }
.system-profile__body { display: grid; grid-template-columns: minmax(15rem, 1fr) minmax(14rem, 1fr); gap: 2rem; align-items: center; padding-block: 1rem; }
.system-radar { width: min(100%, 24rem); margin-inline: auto; }
.system-radar :deep(svg) { width: 100%; height: auto; }
.metric-list { display: flex; flex-direction: column; gap: .85rem; list-style: none; padding: 0; margin: 0; }
.metric-list li { display: grid; grid-template-columns: 4rem 1fr 2.5rem; align-items: center; gap: .8rem; color: var(--color-ink-dim); font-size: .72rem; }
.metric-list li > div { display: flex; gap: .3rem; }
.metric-list i { flex: 1; height: .3rem; background: var(--color-line); transform: skew(-25deg); }
.metric-list i.on { background: var(--molten-red); }
.metric-list b { color: var(--color-ink); font: .65rem var(--font-display); }
.system-verdict { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--molten-line); }
.system-verdict > div { padding: 1rem; }
.system-verdict > div + div { border-left: 1px solid var(--molten-line); }
.system-verdict h3 { margin: 0 0 .6rem; color: var(--molten-red-bright); font: .65rem var(--font-display); letter-spacing: .08em; }
.system-verdict p, .system-mechanics > p { margin: 0; color: var(--color-ink-dim); font-size: .8rem; line-height: 1.9; white-space: pre-line; }
.system-tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: 1rem; margin-top: 1rem; }
.system-tables h3 { text-align: center; font: .85rem var(--font-serif); }
.system-tables table { width: 100%; border-collapse: collapse; font-size: .75rem; }
.system-tables th, .system-tables td { padding: .7rem .8rem; border-bottom: 1px solid var(--color-line); text-align: left; }
.system-tables th { color: var(--color-ink-dim); font-weight: 400; background: color-mix(in srgb, var(--molten-red) 4%, transparent); }
.system-tables td { text-align: right; }
.system-mechanics > p { margin-top: 1rem; }
.system-mechanics figure { margin: 1rem 0 0; border: 1px solid var(--color-line); overflow: hidden; }
.system-mechanics img { display: block; width: 100%; height: auto; }
.image-missing, .system-empty { padding: 2rem; color: var(--color-ink-faint); text-align: center; }
@media (max-width: 56rem) { .systems__layout { grid-template-columns: 1fr; } .system-rail { position: static; display: grid; grid-template-columns: repeat(4, 1fr); } .system-rail .molten-heading { grid-column: 1 / -1; } .system-rail > button { grid-template-columns: 1fr; text-align: center; } .system-rail > button > span, .system-rail > button i { display: none; } .system-rail > button small { grid-column: auto; } }
@media (max-width: 42rem) { .system-profile__body, .system-verdict { grid-template-columns: 1fr; } .system-verdict > div + div { border-left: 0; border-top: 1px solid var(--molten-line); } .system-rail > button { padding: .7rem .35rem; } .system-rail > button strong { font-size: .8rem; } }
</style>
