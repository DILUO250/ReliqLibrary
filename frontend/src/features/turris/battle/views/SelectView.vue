<script setup lang="ts">
import type { BattleReadyLibrarian } from '@rtl/shared'

/** 楼层分组（已排序）。 */
export interface FloorGroup {
  floorId: number
  name: string
  code: string
  members: BattleReadyLibrarian[]
}

const props = defineProps<{
  groups: FloorGroup[]
  allyPick: number | null
  enemyPick: number | null
  allyObj: BattleReadyLibrarian | null
  enemyObj: BattleReadyLibrarian | null
  activeSlot: 'ally' | 'enemy'
  timerLeft: number
}>()

const emit = defineEmits<{
  pick: [id: number]
  random: []
  start: []
}>()

function isPicked(id: number): boolean {
  return props.allyPick === id || props.enemyPick === id
}

/** 选人格子用裁剪预览立绘（楼层标签页同款），没有则退回完整立绘。 */
function thumbSrc(m: BattleReadyLibrarian): string {
  return m.portraitPreview || m.portrait
}
</script>

<template>
  <div class="select-view">
    <div class="top-bar">
      <div class="slot ally" :class="{ 'active-slot': activeSlot === 'ally' }" @click="emit('pick', -1)">
        <div class="slot-tag">我 方</div>
        <div class="portrait-box">
          <img v-if="allyObj" :src="thumbSrc(allyObj)" :alt="allyObj.name" />
          <span v-else class="empty-hint">点击选择</span>
        </div>
        <div class="slot-name">{{ allyObj?.name ?? '未选择' }}</div>
      </div>

      <div class="mid-col">
        <div class="vs-mid">VS</div>
        <div class="timer-bar"><i :style="{ width: (timerLeft / 60) * 100 + '%' }"></i></div>
        <div class="timer-num"><span class="num">{{ timerLeft }}</span> 秒后自动随机选取</div>
        <div class="btn-row">
          <button class="btn ghost" @click="emit('random')">随 机</button>
          <button class="btn primary" :disabled="allyPick == null || enemyPick == null" @click="emit('start')">
            开 始 接 待
          </button>
        </div>
      </div>

      <div class="slot enemy" :class="{ 'active-slot': activeSlot === 'enemy' }" @click="emit('pick', -2)">
        <div class="slot-tag">敌 方</div>
        <div class="portrait-box">
          <img v-if="enemyObj" :src="thumbSrc(enemyObj)" :alt="enemyObj.name" />
          <span v-else class="empty-hint">点击选择</span>
        </div>
        <div class="slot-name">{{ enemyObj?.name ?? '未选择' }}</div>
      </div>
    </div>

    <div class="grid-zone">
      <section v-for="g in groups" :key="g.floorId" class="floor-group">
        <div class="floor-title">
          <span class="floor-name">{{ g.name }}</span>
          <span v-if="g.code" class="floor-code">{{ g.code }}</span>
        </div>
        <div class="char-grid">
          <article
            v-for="m in g.members"
            :key="m.id"
            class="char-tile"
            :class="{ disabled: isPicked(m.id) }"
            :title="`${m.title || '核心书页未填写'} · 体力 ${m.hp} · 混乱 ${m.stagger} · 速度 ${m.speedMin}~${m.speedMax}`"
            @click="emit('pick', m.id)"
          >
            <div class="art">
              <img :src="thumbSrc(m)" :alt="m.name" loading="lazy" />
              <span class="floor-tag">{{ g.name }}</span>
            </div>
            <div class="info">
              <div class="nm">{{ m.name }}</div>
              <div class="stats">
                <span>体 <b>{{ m.hp }}</b></span>
                <span>乱 <b>{{ m.stagger }}</b></span>
                <span>速 <b>{{ m.speedMin }}~{{ m.speedMax }}</b></span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div class="select-hint">
      点击立绘填入选中的槽位 · 再点一次已选中的立绘可撤销 · 点击上方槽位可重新指定替换哪一边
    </div>
  </div>
</template>

<style scoped>
.select-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 顶部 62px 避开全站 SiteNav（simulator 是 fixed inset:0，SiteNav 浮于其上） */
  padding: 62px 24px 14px;
  overflow: hidden;
}

/* ---------- 顶栏：双槽位 + 中间（VS/计时/按钮）压成一行 ---------- */
.top-bar {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 56px;
  flex: none;
}
.slot {
  width: 148px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}
.slot:hover {
  transform: translateY(-2px);
}
.slot-tag {
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--color-ink-dim);
  margin-bottom: 5px;
}
.slot.ally .slot-tag { color: var(--color-gold); }
.slot.enemy .slot-tag { color: #9db8dd; }
.portrait-box {
  width: 148px;
  height: 78px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot.ally .portrait-box {
  border: 1px solid rgba(224, 181, 100, 0.55);
  box-shadow: 0 0 16px rgba(224, 181, 100, 0.12), inset 0 0 28px rgba(224, 181, 100, 0.05);
}
.slot.enemy .portrait-box {
  border: 1px solid rgba(90, 120, 170, 0.55);
  box-shadow: 0 0 16px rgba(90, 120, 170, 0.14), inset 0 0 28px rgba(90, 120, 170, 0.06);
}
.portrait-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
.empty-hint {
  color: var(--color-ink-faint);
  font-size: 12px;
  letter-spacing: 0.25em;
}
.slot-name {
  margin-top: 5px;
  font-size: 13px;
  color: var(--color-ink);
  min-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.slot.active-slot .portrait-box {
  outline: 1.5px dashed rgba(224, 181, 100, 0.55);
  outline-offset: 4px;
}
.mid-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding-top: 8px;
  min-width: 240px;
}
.vs-mid {
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1;
  color: var(--color-gold);
  opacity: 0.85;
}
.timer-bar {
  width: 200px;
  height: 3px;
  border-radius: 2px;
  background: rgba(233, 221, 198, 0.1);
  overflow: hidden;
}
.timer-bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-gold), #e0b564);
  transition: width 1s linear;
}
.timer-num {
  font-size: 10.5px;
  color: var(--color-ink-faint);
  letter-spacing: 0.18em;
}
.timer-num .num {
  color: var(--color-ink);
  font-family: var(--font-latin);
}
.btn-row {
  display: flex;
  gap: 10px;
  margin-top: 2px;
}
.btn {
  font-family: var(--font-serif);
  cursor: pointer;
  letter-spacing: 0.25em;
  color: var(--color-gold);
  background: linear-gradient(180deg, rgba(224, 181, 100, 0.13), rgba(224, 181, 100, 0.05));
  border: 1px solid rgba(224, 181, 100, 0.45);
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 12.5px;
  transition: all 0.18s;
}
.btn:hover {
  background: rgba(224, 181, 100, 0.2);
  box-shadow: 0 0 14px rgba(224, 181, 100, 0.2);
}
.btn.primary {
  padding: 7px 26px;
  color: #1b1408;
  background: linear-gradient(180deg, #e6c47e, #c89a4e);
  border-color: #e0b564;
  font-weight: 600;
}
.btn.primary:hover {
  box-shadow: 0 0 20px rgba(224, 181, 100, 0.45);
}
.btn.primary:disabled {
  filter: grayscale(0.8);
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
.btn.ghost {
  border-color: var(--color-line);
  color: var(--color-ink-dim);
}
.btn.ghost:hover {
  color: var(--color-ink);
}

/* ---------- 网格区 ---------- */
.grid-zone {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 2px 4px;
}
.floor-group {
  margin-bottom: 10px;
}
.floor-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 5px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--color-line);
}
.floor-name {
  font-family: var(--font-serif);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-ink);
}
.floor-code {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-gold);
}
.char-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}
@media (max-width: 1100px) {
  .char-grid { grid-template-columns: repeat(4, 1fr); }
}
.char-tile {
  border-radius: 7px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.16s, box-shadow 0.16s, border-color 0.16s;
}
.char-tile:hover {
  transform: translateY(-3px);
  border-color: rgba(224, 181, 100, 0.5);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45), 0 0 14px rgba(224, 181, 100, 0.12);
  z-index: 2;
}
.char-tile.disabled {
  opacity: 0.35;
  pointer-events: none;
  filter: grayscale(0.7);
}
/* 裁剪预览立绘取上半约 65%（容器 8:7，图 3:4 比容器高，object-position: top 从头露出） */
.art {
  aspect-ratio: 8 / 7;
  overflow: hidden;
  position: relative;
}
.art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.25s;
}
.char-tile:hover .art img {
  transform: scale(1.05);
}
.floor-tag {
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--color-gold);
  background: rgba(23, 18, 12, 0.82);
  border: 1px solid rgba(224, 181, 100, 0.35);
  border-radius: 3px;
  padding: 1px 5px;
}
.info {
  padding: 3px 7px 4px;
  border-top: 1px solid var(--color-line);
  background: var(--color-surface-2);
}
.nm {
  font-size: 12px;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stats {
  display: flex;
  gap: 7px;
  margin-top: 2px;
  font-size: 9.5px;
  color: var(--color-ink-dim);
}
.stats b {
  color: var(--color-ink);
  font-weight: 600;
  font-family: var(--font-latin);
}
.select-hint {
  flex: none;
  text-align: center;
  font-size: 10.5px;
  color: var(--color-ink-faint);
  letter-spacing: 0.12em;
  padding: 5px 0 0;
}
</style>
