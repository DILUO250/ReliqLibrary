<script setup lang="ts">
import type { SimUnit } from '@rtl/shared'
import { roman } from '@rtl/shared'

const props = defineProps<{
  winner: 'ally' | 'enemy'
  bothDead: boolean
  turn: number
  ally: SimUnit
  enemy: SimUnit
}>()

const emit = defineEmits<{
  again: []
  back: []
}>()

/** 打开该司书在楼层中的详细信息（新标签页直达预览弹窗）。 */
function openDetail(u: SimUnit): void {
  const floor = u.floorId != null ? `&floor=${u.floorId}` : ''
  window.open(`/turris/floors?librarian=${u.id}${floor}`, '_blank', 'noopener')
}
</script>

<template>
  <div class="result-overlay">
    <div class="veil"></div>
    <div class="result-card">
      <div class="verdict" :class="{ lose: winner !== 'ally' }">{{ winner === 'ally' ? '胜 利' : '败 北' }}</div>
      <div class="sub">
        {{ bothDead ? '双方体力同时归零，判敌方胜 · ' : '' }}于第 {{ roman(turn) || turn }} 回合决出胜负
      </div>
      <div class="duel">
        <div class="fighter">
          <div class="pbox"><img :src="ally.portrait" :alt="ally.name" /></div>
          <div class="nm">{{ ally.name }}</div>
          <div class="bar-row"><div class="bar hp"><i :style="{ width: (ally.hp / ally.hpMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, ally.hp) }} / {{ ally.hpMax }}</span></div></div>
          <div class="bar-row"><div class="bar stg"><i :style="{ width: (ally.stagger / ally.staggerMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, ally.stagger) }} / {{ ally.staggerMax }}</span></div></div>
          <div class="winner-mark">{{ winner === 'ally' ? '★ 胜者' : '' }}</div>
          <button class="detail-btn" @click="openDetail(ally)">了解详情</button>
        </div>
        <div class="divider">✦</div>
        <div class="fighter">
          <div class="pbox"><img :src="enemy.portrait" :alt="enemy.name" /></div>
          <div class="nm">{{ enemy.name }}</div>
          <div class="bar-row"><div class="bar hp"><i :style="{ width: (enemy.hp / enemy.hpMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, enemy.hp) }} / {{ enemy.hpMax }}</span></div></div>
          <div class="bar-row"><div class="bar stg"><i :style="{ width: (enemy.stagger / enemy.staggerMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, enemy.stagger) }} / {{ enemy.staggerMax }}</span></div></div>
          <div class="winner-mark">{{ winner === 'enemy' ? '★ 胜者' : '' }}</div>
          <button class="detail-btn" @click="openDetail(enemy)">了解详情</button>
        </div>
      </div>
      <div class="actions">
        <button class="btn" @click="emit('again')">再 来 一 局</button>
        <button class="btn ghost" @click="emit('back')">返 回 迎 书 楼</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 换肤铁律：结算卡是写死深色背景层，其上文字写死暖夜配套色，不随主题墨色走。 */
  --color-bg: #17120c;
  --color-surface: #241c12;
  --color-surface-2: #2d2317;
  --color-ink: #eee2cb;
  --color-ink-dim: #b6a687;
  --color-ink-faint: #8d8172;
  --color-line: rgba(233, 221, 198, 0.16);
  --color-gold: #e0b564;
}
.veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(900px 500px at 50% 42%, rgba(60, 42, 16, 0.55), rgba(10, 8, 5, 0.92) 70%);
  backdrop-filter: blur(3px);
}
.result-card {
  position: relative;
  width: 640px;
  border-radius: 16px;
  padding: 44px 48px 38px;
  text-align: center;
  background: linear-gradient(180deg, rgba(45, 35, 23, 0.97), rgba(28, 22, 14, 0.97));
  border: 1px solid rgba(224, 181, 100, 0.5);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7), 0 0 60px rgba(224, 181, 100, 0.12), inset 0 0 80px rgba(224, 181, 100, 0.04);
  animation: resultin 0.5s cubic-bezier(0.2, 0.8, 0.3, 1);
}
@keyframes resultin {
  from { opacity: 0; transform: translateY(26px) scale(0.96); }
  to { opacity: 1; transform: none; }
}
.result-card::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(224, 181, 100, 0.25);
  border-radius: 11px;
  pointer-events: none;
}
.verdict {
  font-size: 56px;
  letter-spacing: 0.7em;
  padding-left: 0.7em;
  color: var(--color-gold);
  text-shadow: 0 0 40px rgba(224, 181, 100, 0.55);
  font-weight: 700;
}
.verdict.lose {
  color: #a8907a;
  text-shadow: 0 0 40px rgba(140, 110, 80, 0.4);
}
.sub {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--color-ink-faint);
  letter-spacing: 0.35em;
}
.duel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 34px;
  margin: 30px 0 8px;
}
.fighter {
  width: 190px;
}
.pbox {
  width: 190px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-line);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.pbox img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
.nm {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-ink);
}
.bar-row {
  margin: 5px 0 0;
}
.bar {
  height: 9px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(233, 221, 198, 0.16);
  overflow: hidden;
  position: relative;
}
.bar i {
  display: block;
  height: 100%;
}
.bar.hp i {
  background: linear-gradient(90deg, #7fae4c, #a3c96a);
}
.bar.stg i {
  background: linear-gradient(90deg, #4d7699, #7fa9cc);
}
.bar .num {
  position: absolute;
  inset: 0;
  font-size: 8px;
  line-height: 9px;
  text-align: center;
  color: rgba(255, 255, 255, 0.94);
}
.winner-mark {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--color-gold);
  min-height: 15px;
}
.detail-btn {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 11px;
  letter-spacing: 0.25em;
  color: var(--color-ink-dim);
  background: rgba(23, 18, 12, 0.5);
  border: 1px solid var(--color-line);
  border-radius: 5px;
  padding: 4px 16px;
  cursor: pointer;
  transition: all 0.15s;
}
.detail-btn:hover {
  color: var(--color-gold);
  border-color: rgba(224, 181, 100, 0.5);
  box-shadow: 0 0 12px rgba(224, 181, 100, 0.2);
}
.divider {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--color-gold);
}
.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 26px;
}
.btn {
  font-family: var(--font-serif);
  cursor: pointer;
  letter-spacing: 0.3em;
  color: var(--color-gold);
  background: linear-gradient(180deg, rgba(224, 181, 100, 0.13), rgba(224, 181, 100, 0.05));
  border: 1px solid rgba(224, 181, 100, 0.45);
  border-radius: 6px;
  padding: 9px 30px;
  font-size: 14px;
  transition: all 0.18s;
}
.btn:hover {
  background: rgba(224, 181, 100, 0.2);
  box-shadow: 0 0 18px rgba(224, 181, 100, 0.2);
}
.btn.ghost {
  border-color: var(--color-line);
  color: var(--color-ink-dim);
}
.btn.ghost:hover {
  color: var(--color-ink);
}
</style>
