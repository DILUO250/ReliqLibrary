<script setup lang="ts">
import { computed } from 'vue'
import type { BattleCard } from '@rtl/shared'
import { diceEffects, diceRangeLabel, pkmTypeColor } from '@rtl/shared'
import RenderedText from '@/features/turris/terms/RenderedText.vue'
import { readableColor } from '@/features/turris/terms/format'
import type { PrivateTerm } from '@/features/turris/terms/renderer'
import CardArtwork from './CardArtwork.vue'
import CardIcon from './CardIcon.vue'
import { cardVisualClass, dieIcon, presentEffect, typeIcon } from './cardPresentation'

const props = withDefaults(defineProps<{
  card: BattleCard
  costLabel?: string
  width?: number
  minHeight?: number
  renderTerms?: boolean
  privateTerms?: PrivateTerm[]
}>(), { costLabel: '费用', width: 300, minHeight: 510, renderTerms: false })

const visual = computed(() => cardVisualClass(props.card.prefix, props.card.type))
// 卡面整体自适应：根元素宽度 = 传入的 width；内部字号用 1em = width/300*12px 作为基准，
// 所有内边距、字号、图标、插图高度都改用 em 单位随卡宽等比缩放，不再用 zoom 写死 300px。
const rootStyle = computed(() => ({
  width: `${props.width}px`,
  minHeight: `${props.minHeight}px`,
  fontSize: `${(props.width / 300) * 12}px`,
  '--c-ink': visual.value.light ? '#302a22' : '#fff4df',
  '--c-ink-dim': visual.value.light ? '#5f5547' : '#dfcde8',
  '--c-ink-faint': visual.value.light ? '#6f6557' : '#c4b6c9',
  '--c-line': visual.value.light ? 'rgba(91,78,63,.26)' : 'rgba(238,211,248,.32)',
}))
const hasEffects = computed(() => props.card.effects?.some((effect) => effect.trim()))
const visibleDiceEffects = (index: number) => diceEffects(props.card.dice[index] ?? { baseType: '', specialType: '', effects: [] }).filter((effect) => effect.trim())
// 属性标签颜色：命中 18 属性词典则上色（过暗自动提亮保证可读），否则沿用默认 --muted。
const attrColor = computed(() => {
  const c = pkmTypeColor(props.card.attr ?? '')
  return c ? readableColor(c, visual.value.light) : undefined
})
</script>

<template>
  <article class="visual-card" :class="[visual.special || 'standard', visual.typeClass]" :style="rootStyle">
    <header class="vc-top">
      <div class="vc-cost"><b>{{ card.cost }}</b><small>{{ costLabel }}</small></div>
      <div class="vc-title">
        <span v-if="card.prefix" class="vc-prefix">{{ card.prefix }}</span>
        <span v-else class="vc-kicker">常规类型 / 无前缀</span>
        <div class="vc-name">{{ card.name || '未命名' }}</div>
      </div>
    </header>

    <div class="vc-meta">
      <span class="vc-type">{{ card.type || '未分类' }}</span>
      <span v-if="card.attr" class="vc-tag" :class="{ 'vc-tag--attr': attrColor }" :style="attrColor ? { color: attrColor, borderColor: attrColor } : {}">{{ card.attr }}</span>
      <span v-for="tag in card.tags" :key="tag" class="vc-tag">{{ tag }}</span>
    </div>

    <div class="vc-art"><CardArtwork :special="visual.special" :type-class="typeIcon(card.type)" /></div>

    <template v-if="hasEffects">
      <div class="vc-label">卡牌效果</div>
      <div class="vc-effects">
        <div v-for="(effect, index) in card.effects" :key="index" class="vc-effect" :class="presentEffect(effect).kind">
          <template v-if="effect.trim()">
            <span class="vc-trigger">{{ presentEffect(effect).trigger }}</span>
            <span class="vc-effect-text">
              <RenderedText v-if="renderTerms" :text="presentEffect(effect).content" :private-terms="privateTerms" :on-light="visual.light" term-marker />
              <template v-else>{{ presentEffect(effect).content }}</template>
            </span>
          </template>
        </div>
      </div>
    </template>

    <div class="vc-label">{{ card.type === '守备' ? '守备骰序列' : '骰子序列' }}</div>
    <div v-if="card.dice?.length" class="vc-dice">
      <div v-for="(die, index) in card.dice" :key="index" class="vc-die">
        <span class="vc-die-icon"><CardIcon :name="dieIcon(die.baseType)" /></span>
        <div class="vc-die-copy">
          <div class="vc-die-name">{{ die.baseType || '未设骰子' }} <span v-if="die.specialType" class="vc-special">{{ die.specialType }}</span></div>
          <div v-if="visibleDiceEffects(index).length" class="vc-die-effects">
            <div v-for="(effect, effectIndex) in visibleDiceEffects(index)" :key="effectIndex" class="vc-die-effect">
              <RenderedText v-if="renderTerms" :text="effect" :private-terms="privateTerms" :on-light="visual.light" term-marker />
              <template v-else>{{ effect }}</template>
            </div>
          </div>
          <div v-else class="vc-empty">无附加效果</div>
        </div>
        <div class="vc-range">{{ diceRangeLabel(die) || '—' }}<small>点数</small></div>
      </div>
    </div>
    <div v-else class="vc-no-dice">此卡无数值骰 · 以卡牌效果结算</div>

    <div v-if="card.hope" class="vc-hope">
      <div class="vc-hope-title"><span>望 · 自动强化</span><span>SHM 独立模块</span></div>
      <div class="vc-hope-grid">
        <div><small>生成上限</small><b>{{ card.hope.count }} 层</b></div>
        <div><small>每层消耗</small><b>{{ card.hope.cost }}</b></div>
        <div><small>每层增益</small><b><RenderedText v-if="renderTerms" :text="card.hope.effect" :private-terms="privateTerms" :on-light="true" term-marker /><template v-else>{{ card.hope.effect }}</template></b></div>
      </div>
    </div>

    <footer class="vc-foot"><span>{{ visual.special ? card.prefix + ' · 特殊机制' : '常规分类' }}</span><span>{{ card.type || '未分类' }}</span></footer>
  </article>
</template>

<style scoped>
.visual-card {
  --frame:#756a5c; --body:#f1eee6; --ink:#2f302f; --muted:#6c6b66; --accent:#8a4e3f; --accent2:#b18a69;
  --panel:rgba(255,255,250,.65); --line:rgba(91,78,63,.26); --range:#8d4338; --art-bg:#ded6ca;
  position:relative; display:flex; flex-direction:column; max-width:100%; padding:1em; box-sizing:border-box;
  color:var(--ink); background:linear-gradient(145deg,#f6f3eb,var(--body)); border:2px solid var(--frame); border-radius:1.1em;
  box-shadow:0 .9em 2em rgba(43,39,34,.14),inset 0 0 0 .25em rgba(255,255,255,.25); overflow:hidden; isolation:isolate;
  font-family:var(--font-sans); font-size:1em; line-height:1.5;
}
.visual-card::before { content:""; position:absolute; inset:.4em; border:1px solid var(--line); border-radius:.75em; pointer-events:none; z-index:5; }
.visual-card::after { content:""; position:absolute; left:1.5em; right:1.5em; top:0; height:.33em; background:var(--accent); border-radius:0 0 .33em .33em; z-index:6; }
.vc-top { display:flex; align-items:center; gap:.8em; position:relative; z-index:6; min-height:4.8em; padding-top:.25em; }
.vc-cost { flex:0 0 4.6em; height:4.8em; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; background:linear-gradient(145deg,var(--accent2),var(--accent)); border:2px solid rgba(255,255,255,.55); border-radius:50%; box-shadow:0 .25em 0 var(--frame); }
.vc-cost b { font:600 2.25em Georgia,serif; line-height:1; }
.vc-cost small { max-width:4.25em; font-size:.75em; letter-spacing:1px; margin-top:.33em; opacity:.9; overflow:hidden; white-space:nowrap; }
.vc-title { min-width:0; flex:1; }
.vc-prefix { display:inline-flex; padding:.17em .58em; margin-bottom:.33em; color:#f4e9ff; background:#704487; border:1px solid #b68ac8; border-radius:.25em; font:600 .83em Georgia,serif; letter-spacing:1px; }
.vc-kicker { display:block; font-size:.75em; letter-spacing:2px; color:var(--muted); margin-bottom:.42em; }
.vc-name { font-family:var(--font-serif); font-size:1.58em; font-weight:600; line-height:1.3; letter-spacing:1px; overflow-wrap:anywhere; }
.vc-meta { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:.42em; padding:.75em .33em .58em; position:relative; z-index:4; font-size:.92em; }
.vc-type { margin-right:auto; font-weight:600; letter-spacing:1px; }
.vc-tag { padding:.17em .5em; border:1px solid var(--line); border-radius:.25em; color:var(--muted); background:rgba(255,255,255,.12); }
.vc-tag--attr { font-weight:700; }
.vc-art { position:relative; height:12.5em; flex:none; margin:0 .08em .83em; border:1px solid var(--line); border-radius:.67em; overflow:hidden; background:var(--art-bg); }
.vc-art::after { content:""; position:absolute; inset:0; box-shadow:inset 0 0 1.8em rgba(38,35,32,.13); pointer-events:none; }
.vc-label { display:flex; align-items:center; gap:.58em; margin:.58em .25em .5em; font-size:.83em; font-weight:600; letter-spacing:2px; color:var(--muted); }
.vc-label::after { content:""; height:1px; flex:1; background:var(--line); }
.vc-effects { display:grid; gap:.5em; margin-bottom:.67em; }
.vc-effect { display:grid; grid-template-columns:auto minmax(0,1fr); gap:.58em; padding:.67em .75em; background:var(--panel); border-left:2px solid var(--accent); border-radius:.25em; font-size:1em; line-height:1.65; }
.vc-effect:empty { display:none; }
.vc-trigger { font-weight:600; color:var(--accent); white-space:nowrap; }
.vc-trigger:empty { display:none; }
.vc-effect.threshold { border-left-style:double; border-left-width:4px; }
.vc-effect.stack { background:color-mix(in srgb,var(--panel) 86%,var(--accent)); }
.vc-effect-text { min-width:0; white-space:pre-wrap; overflow-wrap:anywhere; }
.vc-dice { display:grid; gap:.58em; }
.vc-die { display:grid; grid-template-columns:2.1em minmax(0,1fr) auto; gap:.42em; align-items:start; padding:.5em .5em .5em .42em; background:var(--panel); border:1px solid var(--line); border-radius:.5em; }
.vc-die-icon { width:2.2em; height:2.2em; padding:.4em; box-sizing:border-box; display:flex; color:var(--accent); border:1px solid var(--line); border-radius:.42em; background:rgba(255,255,255,.13); }
.vc-die-name { font-size:1.08em; font-weight:600; line-height:1.35; }
.vc-special { color:var(--accent); font-size:.92em; font-weight:600; }
.vc-die-effects { display:grid; gap:.25em; margin-top:.33em; }
.vc-die-effect { font-size:.88em; line-height:1.55; color:var(--muted); white-space:pre-wrap; overflow-wrap:anywhere; }
.vc-empty { font-size:.83em; color:var(--muted); margin-top:.33em; }
.vc-range { min-width:3.4em; text-align:right; font:600 1.5em Georgia,serif; line-height:1.15; color:var(--range); white-space:nowrap; font-variant-numeric:tabular-nums; }
.vc-range small { display:block; font:.75em var(--font-sans); letter-spacing:1px; color:var(--muted); margin-top:.42em; }
.vc-no-dice { padding:1em .83em; border:1px dashed var(--line); border-radius:.5em; color:var(--muted); font-size:.92em; text-align:center; }
.vc-hope { margin-top:.83em; padding:.83em; background:#f5d97f; border:1px solid #b88a2d; border-radius:.67em; color:#3a2703; }
.vc-hope-title { display:flex; justify-content:space-between; font-size:1em; font-weight:600; color:#3a2703; margin-bottom:.67em; }
.vc-hope-title span:last-child { font-size:.75em; font-weight:400; letter-spacing:1px; }
.vc-hope-grid { display:grid; grid-template-columns:1fr 1fr 1.35fr; gap:.5em; }
.vc-hope-grid > div { padding:.5em .42em; border-left:1px solid rgba(90, 60, 8, 0.28); }
.vc-hope-grid > div:first-child { border-left:0; padding-left:0; }
.vc-hope-grid small { display:block; font-size:.75em; color:#5d4310; margin-bottom:.25em; }
.vc-hope-grid b { font-size:.92em; font-weight:600; line-height:1.45; }
.vc-foot { display:flex; justify-content:space-between; gap:.67em; margin-top:auto; padding:1em .33em .08em; font-size:.75em; letter-spacing:1px; color:var(--muted); }

.melee { --frame:#794a40;--accent:#a84b3d;--accent2:#d18a69;--range:#9b3f35;--art-bg:#e4d4c9; }
.ranged { --frame:#406c73;--accent:#2f7583;--accent2:#70a9aa;--range:#286979;--art-bg:#d2e1df; }
.spell { --frame:#645677;--accent:#735a9e;--accent2:#aa8fc3;--range:#694d94;--art-bg:#ddd5e7; }
.preempt { --frame:#6f6259;--accent:#a85338;--accent2:#327d86;--range:#8e4835;--art-bg:#dedbd4; }
.ability { --frame:#7f6c3d;--accent:#947326;--accent2:#c5a65d;--range:#80621d;--art-bg:#e8dfc5; }
.guard { --frame:#4c6470;--accent:#4d6f82;--accent2:#8ca8b3;--range:#3c6378;--art-bg:#d3dfe2; }
.aoe { --frame:#7d573c;--accent:#aa6235;--accent2:#d29b61;--range:#94502c;--art-bg:#e7d9c8; }
.equip { --frame:#675f4f;--accent:#71644a;--accent2:#a69670;--range:#66573d;--art-bg:#dfdbcf; }
.change { --frame:#4e6b59;--accent:#4f7c62;--accent2:#8aad8c;--range:#3f6d54;--art-bg:#d6e1d5; }
.status { --frame:#6d6961;--accent:#756f62;--accent2:#aaa28e;--range:#655f55;--art-bg:#dfddd6; }
.curse { --frame:#4d3c53;--body:#242129;--ink:#e6dee8;--muted:#b3a7b7;--accent:#9a6aa4;--accent2:#66466f;--panel:rgba(242,226,246,.06);--line:rgba(181,139,190,.3);--range:#d39bdc;--art-bg:#2d2633;background:linear-gradient(145deg,#312737,#1b1b22); }

.relic,.ego,.dst,.shm,.def { min-height:48em; }
.relic::after,.ego::after,.dst::after,.shm::after,.def::after { display:none; }
.relic { --frame:#c8a2df;--body:#64358a;--ink:#fff4df;--muted:#dfcde8;--accent:#e7bdf2;--accent2:#f0bf73;--panel:rgba(30,12,43,.38);--line:rgba(238,211,248,.38);--range:#ffd18a;background:linear-gradient(145deg,#7b3fa0,#5c2b7b 62%,#471e61);border-color:#a77ac0;border-radius:1.67em; }
.relic .vc-art { height:15.3em;border-radius:6.67em 6.67em .83em .83em;border-color:#a3844f; }
.ego { --frame:#a8d5b7;--body:#0d6a5c;--ink:#f0f1dc;--muted:#b8d8c9;--accent:#e2c977;--accent2:#a4dbc1;--panel:rgba(4,38,34,.36);--line:rgba(194,222,174,.4);--range:#ffe08a;background:linear-gradient(145deg,#16806d,#0c5c53 58%,#08453f);border-color:#83bda4;border-radius:1.67em; }
.ego .vc-cost { background:radial-gradient(circle at 35% 25%,#e7ddc3,#a59470 45%,#4f4850);color:#252630; }
.ego .vc-prefix { background:#174d46;color:#fff4d6;border-color:#d7c888; }
.ego .vc-art { height:15.3em;border-radius:50% 50% .83em .83em/28% 28% .83em .83em; }
.dst { --frame:#f08078;--body:#a91828;--ink:#fff1e7;--muted:#f0c1bc;--accent:#ffd0a4;--accent2:#ffc2a8;--panel:rgba(42,5,14,.34);--line:rgba(255,198,177,.38);--range:#ffe0ad;background:linear-gradient(145deg,#bd2633,#9d1828 58%,#7f111f);border-color:#dc6964;border-radius:.58em; }
.dst .vc-prefix { background:#57101c;color:#fff1e7;border-color:#ffb39e; }
.dst .vc-art { height:15.3em;border-radius:.25em;clip-path:polygon(0 0,100% 0,100% 89%,93% 100%,0 100%); }
.dst .vc-die { border-radius:.25em;border-left:3px solid var(--accent); }
.shm { --frame:#7d5510;--body:#e3aa11;--ink:#362105;--muted:#68430a;--accent:#6f3e08;--accent2:#fff0a0;--panel:rgba(255,229,127,.3);--line:rgba(104,61,3,.4);--range:#6e2d08;background:linear-gradient(145deg,#f3bd22,#d99a08 62%,#bd7900);border-color:#8d610b;border-radius:1.67em; }
.shm .vc-cost { background:radial-gradient(circle at 35% 28%,#fff8bf,#e4b743 48%,#9c6a18);color:#4d3615; }
.shm .vc-prefix { background:#573307;color:#fff3ba;border-color:#7a4a08; }
.shm .vc-art { height:15.3em;border-radius:.75em .75em 5.83em .75em; }
.shm .vc-die-icon { transform:rotate(45deg); }
.shm .vc-die-icon > :deep(svg) { transform:rotate(-45deg); }
/* SHM 信息框：奶白底（#F8E29A），文字回深棕系，不碰渲染器词条逻辑 */
.shm .vc-effect,
.shm .vc-die {
  background: #f8e29a;
  border-color: rgba(104, 61, 3, 0.35);
}
.shm .vc-effect.stack {
  background: #efd688;
}
.shm .vc-die-icon {
  background: rgba(104, 61, 3, 0.08);
}
.def { --frame:#8eb4c7;--body:#245d85;--ink:#eff8f5;--muted:#bdd5df;--accent:#c4e2ea;--accent2:#7fb0c4;--panel:rgba(10,43,66,.36);--line:rgba(183,216,229,.38);--range:#d6f0ef;background:linear-gradient(145deg,#2e739c,#1e567d 58%,#164362);border:3px solid #82aabd;border-radius:1.17em 1.17em 2.33em 2.33em; }
.def .vc-cost { background:linear-gradient(145deg,#6f93a3,#385b6d);clip-path:polygon(25% 0,75% 0,100% 25%,100% 75%,75% 100%,25% 100%,0 75%,0 25%);border-radius:0;box-shadow:none; }
.def .vc-prefix { background:#123c58;color:#eff8f5;border-color:#b7d9e6; }
.def .vc-art { height:15.3em;border-radius:.5em .5em 2.92em 2.92em; }
.def .vc-die { border-radius:.42em .42em 1.17em 1.17em;border-bottom:3px solid var(--accent); }

@media (max-width:420px) {
  .visual-card { padding:.83em; }
  .vc-cost { flex-basis:4em;height:4.33em; }
  .vc-cost b { font-size:2em; }
  .vc-name { font-size:1.42em; }
  .vc-die { grid-template-columns:2em minmax(0,1fr) auto;gap:.42em;padding:.5em .42em; }
  .vc-die-icon { width:2em;height:2em;padding:.33em; }
  .vc-range { min-width:2.9em;font-size:1.25em; }
}
</style>
