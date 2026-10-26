<script setup lang="ts">
import { computed } from 'vue'
import type { SimCard } from '@rtl/shared'
import CardIcon from '@/features/turris/card/CardIcon.vue'
import { cardVisualClass, dieIcon, presentEffect, typeIcon } from '@/features/turris/card/cardPresentation'

const props = defineProps<{ card: SimCard }>()
const visual = computed(() => cardVisualClass(props.card.display.prefix, props.card.type))
const summary = computed(() => {
  const effect = props.card.display.effects?.find((text) => text.trim())
  return effect ? presentEffect(effect).content : ''
})
</script>

<template>
  <div class="battle-card" :class="[visual.special || 'standard', visual.typeClass]">
    <div class="cost"><b>{{ card.cost }}</b><small>{{ card.costLabel }}</small></div>
    <div class="heading">
      <span v-if="card.display.prefix" class="prefix">{{ card.display.prefix }}</span>
      <div class="cname">{{ card.name }}</div>
    </div>
    <div class="type-line"><CardIcon :name="typeIcon(card.type)" /><span>{{ card.type }}</span></div>
    <div class="dice-list">
      <template v-if="card.dice.length">
        <div v-for="(d, i) in card.dice.slice(0, 3)" :key="i" class="die">
          <span class="die-icon"><CardIcon :name="dieIcon(d.kind)" /></span>
          <span class="tp">{{ d.kind }}</span>
          <span class="rng">{{ d.min }}–{{ d.max }}</span>
        </div>
        <div v-if="card.dice.length > 3" class="more">… 共 {{ card.dice.length }} 颗骰子</div>
      </template>
      <div v-else class="die nodice"><span class="tp">无骰子 · 不参与拼点</span></div>
    </div>
    <div v-if="summary" class="fx-line">{{ summary }}</div>
    <div class="badges"><span v-if="card.exhaust">消耗</span><span v-if="card.autoFx">兜底效果</span><span v-if="card.display.hope">望</span></div>
  </div>
</template>

<style scoped>
.battle-card {
  --frame:#756a5c;--body:#f1eee6;--ink:#2f302f;--muted:#6c6b66;--accent:#8a4e3f;--accent2:#b18a69;--panel:rgba(255,255,250,.68);--line:rgba(91,78,63,.26);--range:#8d4338;
  width:124px;height:196px;box-sizing:border-box;border-radius:10px;position:relative;cursor:pointer;flex:0 0 auto;
  color:var(--ink);background:linear-gradient(145deg,#f6f3eb,var(--body));border:2px solid var(--frame);
  box-shadow:0 8px 20px rgba(0,0,0,.45),inset 0 0 0 2px rgba(255,255,255,.2);padding:7px 8px 6px;overflow:hidden;
  font-family:var(--font-sans);
}
.battle-card::before { content:'';position:absolute;inset:3px;border:1px solid var(--line);border-radius:6px;pointer-events:none; }
.cost { position:absolute;top:6px;left:6px;width:31px;height:33px;border-radius:50%;background:linear-gradient(145deg,var(--accent2),var(--accent));color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.5);box-shadow:0 2px 0 var(--frame);z-index:2; }
.cost b { font:700 15px Georgia,serif;line-height:1; }
.cost small { font-size:6px;line-height:1;margin-top:2px;max-width:29px;overflow:hidden;white-space:nowrap; }
.heading { margin:1px 0 3px 35px;height:37px;min-width:0; }
.prefix { display:inline-block;font:700 7px Georgia,serif;letter-spacing:.6px;color:var(--accent);line-height:1; }
.cname { font-size:12px;font-weight:700;color:var(--ink);line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere; }
.type-line { height:18px;display:flex;align-items:center;gap:4px;color:var(--accent);font-size:9px;font-weight:700;border-bottom:1px solid var(--line);padding-bottom:3px;margin-bottom:4px; }
.type-line svg { width:13px;height:13px; }
.dice-list { display:flex;flex-direction:column;gap:3px; }
.die { display:flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:2px 4px;min-height:20px;box-sizing:border-box; }
.die-icon { width:13px;height:13px;color:var(--accent);flex:none; }
.die .tp { white-space:nowrap; }
.die .rng { margin-left:auto;font-family:Georgia,serif;font-weight:700;color:var(--range);white-space:nowrap; }
.die.nodice { justify-content:center;color:var(--muted);border-style:dashed; }
.more { color:var(--muted);font-size:8px;text-align:right; }
.fx-line { margin-top:4px;font-size:8px;line-height:1.35;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
.badges { position:absolute;right:7px;bottom:5px;display:flex;gap:3px;font-size:7px;color:var(--accent); }
.badges span { border:1px solid var(--line);padding:0 3px;border-radius:2px;background:var(--panel); }
.melee { --frame:#794a40;--accent:#a84b3d;--accent2:#d18a69;--range:#9b3f35; }
.ranged { --frame:#406c73;--accent:#2f7583;--accent2:#70a9aa;--range:#286979; }
.spell { --frame:#645677;--accent:#735a9e;--accent2:#aa8fc3;--range:#694d94; }
.preempt { --frame:#6f6259;--accent:#a85338;--accent2:#327d86;--range:#8e4835; }
.ability { --frame:#7f6c3d;--accent:#947326;--accent2:#c5a65d;--range:#80621d; }
.guard { --frame:#4c6470;--accent:#4d6f82;--accent2:#8ca8b3;--range:#3c6378; }
.aoe { --frame:#7d573c;--accent:#aa6235;--accent2:#d29b61;--range:#94502c; }
.equip { --frame:#675f4f;--accent:#71644a;--accent2:#a69670;--range:#66573d; }
.change { --frame:#4e6b59;--accent:#4f7c62;--accent2:#8aad8c;--range:#3f6d54; }
.status { --frame:#6d6961;--accent:#756f62;--accent2:#aaa28e;--range:#655f55; }
.curse { --frame:#4d3c53;--body:#242129;--ink:#e6dee8;--muted:#b3a7b7;--accent:#9a6aa4;--accent2:#66466f;--panel:rgba(242,226,246,.06);--line:rgba(181,139,190,.3);--range:#d39bdc;background:linear-gradient(145deg,#312737,#1b1b22); }
.relic { --frame:#c8a2df;--body:#64358a;--ink:#fff4df;--muted:#dfcde8;--accent:#e7bdf2;--accent2:#f0bf73;--panel:rgba(30,12,43,.38);--line:rgba(238,211,248,.38);--range:#ffd18a;background:linear-gradient(145deg,#7b3fa0,#471e61); }
.ego { --frame:#a8d5b7;--body:#0d6a5c;--ink:#f0f1dc;--muted:#b8d8c9;--accent:#e2c977;--accent2:#a4dbc1;--panel:rgba(4,38,34,.36);--line:rgba(194,222,174,.4);--range:#ffe08a;background:linear-gradient(145deg,#16806d,#08453f); }
.dst { --frame:#f08078;--body:#a91828;--ink:#fff1e7;--muted:#f0c1bc;--accent:#ffd0a4;--accent2:#ffc2a8;--panel:rgba(42,5,14,.34);--line:rgba(255,198,177,.38);--range:#ffe0ad;background:linear-gradient(145deg,#bd2633,#7f111f);border-radius:5px; }
.shm { --frame:#7d5510;--body:#e3aa11;--ink:#362105;--muted:#68430a;--accent:#6f3e08;--accent2:#fff0a0;--panel:rgba(255,229,127,.3);--line:rgba(104,61,3,.4);--range:#6e2d08;background:linear-gradient(145deg,#f3bd22,#bd7900); }
.def { --frame:#8eb4c7;--body:#245d85;--ink:#eff8f5;--muted:#bdd5df;--accent:#c4e2ea;--accent2:#7fb0c4;--panel:rgba(10,43,66,.36);--line:rgba(183,216,229,.38);--range:#d6f0ef;background:linear-gradient(145deg,#2e739c,#164362); }
</style>
