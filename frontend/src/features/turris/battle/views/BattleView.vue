<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import type { BattleState, GameEvent, SimCard, SimUnit, SpeedDie } from '@rtl/shared'
import { startTurn, resolveBattle, equipCard, setTarget, unequip, isAttackDie, roman, LIGHT_MAX, HAND_CAP } from '@rtl/shared'
import CardFace from '../components/CardFace.vue'
import VisualCard from '@/features/turris/card/VisualCard.vue'

const props = defineProps<{
  state: BattleState
}>()

const emit = defineEmits<{
  'battle-end': [winner: 'ally' | 'enemy', bothDead: boolean, turn: number]
}>()

/* ---------- 本地交互状态 ---------- */
const phase = ref<'equip' | 'battle'>('equip')
const selDieIdx = ref(-1)
const selectedHandIdx = ref(-1)
const phaseBanner = ref('准备阶段 · 点击速度骰选择卡牌')
const logItems = ref<Array<{ text: string; cls: string }>>([])
const splash = ref('')
const splashVisible = ref(false)
const playing = ref(false)
const surrendered = ref(false)

/* 演出舞台状态 */
const clashVisible = ref(false)
const clashMode = ref<'clash' | 'solo'>('clash')
const clashAllyName = ref('')
const clashEnemyName = ref('')
const clashAllyCard = ref<SimCard | null>(null)
const clashEnemyCard = ref<SimCard | null>(null)
const clashAllyRoll = ref('—')
const clashEnemyRoll = ref('—')
const clashNote = ref('')
const clashWin = ref<'ally' | 'enemy' | null>(null)
const clashLunge = ref<'ally' | 'enemy' | null>(null)
const clashSpark = ref(false)
const soloSide = ref<'ally' | 'enemy'>('ally')
const soloName = ref('')
const soloCard = ref<SimCard | null>(null)
const soloRoll = ref('—')
const soloTarget = ref('')
const soloLunge = ref(false)

/* 飘字 */
const floats = ref<Array<{ id: number; x: number; y: number; kind: 'hp' | 'st' | 'lt'; text: string }>>([])
let floatId = 0

/* 立绘命中闪烁 */
const allyHit = ref(false)
const enemyHit = ref(false)

const ally = computed(() => props.state.ally)
const enemy = computed(() => props.state.enemy)
const turnNum = computed(() => roman(props.state.turn))

/* ---------- 面板演出快照 ----------
 * 引擎是同步算完整回合终态的（含回合末结算），回放演出时状态早已是终态。
 * 面板/混乱标签若直接绑实时状态，一点「开始战斗」就会看到血条、混乱条、
 * 混乱标签瞬间跳到结算后的样子（典型：敌方混乱瞬间解除）。
 * 因此面板读快照：回放中只按事件推进，回放结束后统一同步回真实状态。 */
const dispAlly = reactive({ hp: props.state.ally.hp, stagger: props.state.ally.stagger, light: props.state.ally.light, confused: false })
const dispEnemy = reactive({ hp: props.state.enemy.hp, stagger: props.state.enemy.stagger, light: props.state.enemy.light, confused: false })
function syncDisp(): void {
  dispAlly.hp = props.state.ally.hp
  dispAlly.stagger = props.state.ally.stagger
  dispAlly.light = props.state.ally.light
  dispAlly.confused = props.state.ally.confusedTurns > 0
  dispEnemy.hp = props.state.enemy.hp
  dispEnemy.stagger = props.state.enemy.stagger
  dispEnemy.light = props.state.enemy.light
  dispEnemy.confused = props.state.enemy.confusedTurns > 0
}
syncDisp()

/* ---------- 工具 ---------- */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
let splashTimer: ReturnType<typeof setTimeout> | null = null
function showSplash(text: string): void {
  splash.value = text
  splashVisible.value = true
  if (splashTimer) clearTimeout(splashTimer)
  splashTimer = setTimeout(() => (splashVisible.value = false), 1000)
}
function pushLog(text: string, cls = ''): void {
  logItems.value.push({ text, cls })
  if (logItems.value.length > 60) logItems.value.shift()
}

const ALLY_CENTER = { x: 290, y: 440 }
const ENEMY_CENTER = { x: 1000, y: 220 }
function floatNum(side: 'ally' | 'enemy', kind: 'hp' | 'st' | 'lt', text: string): void {
  const c = side === 'ally' ? ALLY_CENTER : ENEMY_CENTER
  const id = floatId++
  const dx = kind === 'lt' ? 0 : kind === 'st' ? 34 : -34
  floats.value.push({ id, x: c.x + dx - 20, y: c.y + (kind === 'lt' ? -52 : kind === 'st' ? 34 : 0), kind, text })
  setTimeout(() => {
    floats.value = floats.value.filter((f) => f.id !== id)
  }, 1150)
}

/* ---------- 事件播放器 ---------- */
async function playEvents(events: GameEvent[]): Promise<void> {
  for (const ev of events) {
    await playOne(ev)
  }
}

async function playOne(ev: GameEvent): Promise<void> {
  switch (ev.type) {
    case 'log':
      pushLog(ev.text, ev.cls ?? '')
      break
    case 'turnSplash':
      showSplash(ev.text)
      await sleep(950)
      break
    case 'turnStart':
      break
    case 'damage': {
      const d = ev.target === 'ally' ? dispAlly : dispEnemy
      d.hp = Math.max(0, d.hp - ev.hp)
      d.stagger = Math.max(0, d.stagger - ev.stagger)
      floatNum(ev.target, 'hp', `-${ev.hp}`)
      floatNum(ev.target, 'st', `-${ev.stagger}`)
      if (ev.target === 'ally') triggerHit('ally')
      else triggerHit('enemy')
      await sleep(500)
      break
    }
    case 'confusion':
      if (ev.target === 'ally') dispAlly.confused = true
      else dispEnemy.confused = true
      showSplash(ev.target === 'ally' ? ally.value.name + ' · 陷 入 混 乱' : enemy.value.name + ' · 陷 入 混 乱')
      await sleep(900)
      break
    case 'light': {
      const d = ev.target === 'ally' ? dispAlly : dispEnemy
      d.light = Math.min(LIGHT_MAX, d.light + ev.n)
      floatNum(ev.target, 'lt', `+${ev.n}`)
      await sleep(420)
      break
    }
    case 'clashStart':
      await openClash(ev.allyCard, ev.enemyCard)
      break
    case 'clashBeat':
      await clashBeat(ev.index, ev.ally, ev.enemy, ev.winner, ev.note)
      break
    case 'clashEnd':
      await closeClash()
      break
    case 'soloStart':
      await openSolo(ev.side, ev.card, ev.target)
      break
    case 'soloBeat':
      await soloBeat(ev.die.kind, ev.roll)
      break
    case 'soloEnd':
      await closeSolo()
      break
    case 'battleEnd':
      emit('battle-end', ev.winner, ev.bothDead, ev.turn)
      break
  }
}

function triggerHit(side: 'ally' | 'enemy'): void {
  if (side === 'ally') {
    allyHit.value = true
    setTimeout(() => (allyHit.value = false), 400)
  } else {
    enemyHit.value = true
    setTimeout(() => (enemyHit.value = false), 400)
  }
}

/* ---------- 拼点演出 ---------- */
async function openClash(allyC: SimCard, enemyC: SimCard): Promise<void> {
  clashMode.value = 'clash'
  clashAllyName.value = ally.value.name
  clashEnemyName.value = enemy.value.name
  clashAllyCard.value = allyC
  clashEnemyCard.value = enemyC
  clashAllyRoll.value = '—'
  clashEnemyRoll.value = '—'
  clashNote.value = ''
  clashWin.value = null
  clashLunge.value = null
  clashVisible.value = true
  await sleep(380)
}
async function clashBeat(
  _index: number,
  allyRoll: { kind: string; roll: number } | null,
  enemyRoll: { kind: string; roll: number } | null,
  winner: 'ally' | 'enemy' | null,
  note: string,
): Promise<void> {
  clashAllyRoll.value = allyRoll ? `${allyRoll.kind} ${allyRoll.roll}` : '—'
  clashEnemyRoll.value = enemyRoll ? `${enemyRoll.kind} ${enemyRoll.roll}` : '—'
  clashNote.value = note
  clashWin.value = winner
  if (winner === 'ally') clashLunge.value = 'ally'
  else if (winner === 'enemy') clashLunge.value = 'enemy'
  else clashLunge.value = null
  if (winner) {
    clashSpark.value = false
    void document.body.offsetWidth
    clashSpark.value = true
  }
  await sleep(560)
  clashLunge.value = null
  clashWin.value = null
  await sleep(120)
}
async function closeClash(): Promise<void> {
  await sleep(300)
  clashVisible.value = false
  clashAllyCard.value = null
  clashEnemyCard.value = null
}

/* ---------- 单方面演出 ---------- */
async function openSolo(side: 'ally' | 'enemy', card: SimCard, target: 'ally' | 'enemy'): Promise<void> {
  clashMode.value = 'solo'
  soloSide.value = side
  soloName.value = side === 'ally' ? ally.value.name : enemy.value.name
  soloCard.value = card
  soloTarget.value = target === 'ally' ? ally.value.name : enemy.value.name
  soloRoll.value = '—'
  clashVisible.value = true
  await sleep(300)
}
async function soloBeat(kind: string, roll: number): Promise<void> {
  soloRoll.value = `${kind} ${roll}`
  soloLunge.value = true
  await sleep(420)
  soloLunge.value = false
  await sleep(90)
}
async function closeSolo(): Promise<void> {
  await sleep(180)
  clashVisible.value = false
  soloCard.value = null
}

/* ---------- 玩家交互 ---------- */
function clickAllyDie(i: number): void {
  if (phase.value !== 'equip' || playing.value) return
  if (ally.value.confusedTurns > 0) {
    phaseBanner.value = '混乱中 · 本回合无法装备卡牌'
    return
  }
  const die = ally.value.speedDice[i]
  if (die?.consumed) return
  selDieIdx.value = selDieIdx.value === i ? -1 : i
  selectedHandIdx.value = -1
  updateBanner()
}
function clickHandCard(idx: number): void {
  if (phase.value !== 'equip' || playing.value) return
  if (ally.value.confusedTurns > 0) {
    phaseBanner.value = '混乱中 · 本回合无法装备卡牌'
    return
  }
  const c = ally.value.hand[idx]
  if (!c || c.cost > ally.value.light) return
  // 确定目标骰子：优先当前选中的空骰，否则找第一个空骰
  let di = selDieIdx.value
  const selDie = di >= 0 ? ally.value.speedDice[di] : undefined
  if (di < 0 || !selDie || selDie.card || selDie.consumed) {
    di = ally.value.speedDice.findIndex((d) => !d.card && !d.consumed)
    if (di < 0) return // 没有空骰可装
  }
  equipCard(props.state, di, idx)
  selDieIdx.value = di
  selectedHandIdx.value = -1
  syncDisp()
  updateBanner()
}
function clickEnemyDie(j: number): void {
  if (phase.value !== 'equip' || playing.value) return
  if (selDieIdx.value < 0) return
  const die = ally.value.speedDice[selDieIdx.value]
  if (!die?.card) return
  setTarget(props.state, selDieIdx.value, j)
  selDieIdx.value = -1
  updateBanner()
}
function clickUnequip(i: number): void {
  if (phase.value !== 'equip' || playing.value) return
  unequip(props.state, i)
  selDieIdx.value = i
  selectedHandIdx.value = -1
  syncDisp()
  updateBanner()
}

function updateBanner(): void {
  if (ally.value.confusedTurns > 0) {
    phaseBanner.value = '混乱中 · 本回合无法装备卡牌'
    return
  }
  const d = selDieIdx.value >= 0 ? ally.value.speedDice[selDieIdx.value] : null
  if (!d) phaseBanner.value = '准备阶段 · 点击速度骰选择卡牌'
  else if (!d.card) phaseBanner.value = `准备阶段 · 点击手牌装备到 ${selDieIdx.value + 1} 号骰`
  else phaseBanner.value = '准备阶段 · 点击敌方骰子指定目标'
}

/* ---------- 战斗流程 ---------- */
async function onStartBattle(): Promise<void> {
  if (phase.value !== 'equip' || playing.value) return
  phase.value = 'battle'
  playing.value = true
  selDieIdx.value = -1
  selectedHandIdx.value = -1
  phaseBanner.value = '战斗阶段'
  const events = resolveBattle(props.state)
  await playEvents(events)
  syncDisp()
  playing.value = false
  if (props.state.winner) return // 已 emit battle-end
  // 进入下一回合
  phase.value = 'equip'
  await nextTurn()
}

async function nextTurn(): Promise<void> {
  playing.value = true
  phaseBanner.value = '准备阶段 · 点击速度骰选择卡牌'
  const events = startTurn(props.state)
  await playEvents(events)
  syncDisp()
  playing.value = false
  updateBanner()
}

function onSurrender(): void {
  if (phase.value !== 'equip' || playing.value) return
  surrendered.value = true
  pushLog(`${ally.value.name} 选择投降，本场接待以战败结束`, 'dmg')
  emit('battle-end', 'enemy', false, props.state.turn)
}

/* ---------- 初始化 ---------- */
async function init(): Promise<void> {
  await nextTurn()
}
init()

onBeforeUnmount(() => {
  if (splashTimer) clearTimeout(splashTimer)
})

/* ---------- 骰子渲染辅助 ---------- */
const AROW = { x: 580, y: 345 }
const EROW = { x: 750, y: 118 }
const DIE_STEP = 74
const CUBE = 46

function dieCenter(row: { x: number; y: number }, i: number): { x: number; y: number } {
  return { x: row.x + i * DIE_STEP + CUBE / 2, y: row.y + CUBE / 2 }
}

/* ---------- 骰子悬停检视卡（原型 #inspectCard 同款） ---------- */
const inspect = ref<{ card: SimCard; x: number; y: number } | null>(null)
let inspectTimer: ReturnType<typeof setTimeout> | null = null
function cancelHideInspect(): void {
  if (inspectTimer) clearTimeout(inspectTimer)
  inspectTimer = null
}
function showInspect(card: SimCard | null | undefined, row: { x: number; y: number }, i: number): void {
  cancelHideInspect()
  if (!card) return
  const c = dieCenter(row, i)
  // 完整卡面默认出现在骰子右侧，靠太右就翻到左边。
  let x = c.x + 56
  if (x > 950) x = c.x - 350
  const y = 16
  inspect.value = { card, x, y }
}
function hideInspect(): void {
  cancelHideInspect()
  inspectTimer = setTimeout(() => { inspect.value = null }, 160)
}

/* 指向箭头：SVG 路径计算
   我方=蓝色、敌方=红色；双方互相指向时按原型画「对顶」——两条半箭头在中点前 13px 停住，
   中点是金环菱形碰撞火花 + 对顶字样。 */
interface ArrowPoint {
  x: number
  y: number
}
interface ArrowSeg {
  d: string
  cls: string
}
const arrowSegs = computed<ArrowSeg[]>(() => {
  const segs: ArrowSeg[] = []
  // 混乱方无法行动，不画其指向箭头（视觉上"冻结"）。
  if (dispAlly.confused && dispEnemy.confused) return segs
  const allyFrozen = dispAlly.confused
  const enemyFrozen = dispEnemy.confused
  const mutual = new Set<string>()
  ally.value.speedDice.forEach((d, i) => {
    if (!d.card || d.target == null) return
    const e = enemy.value.speedDice[d.target]
    if (e?.card && e.target === i) mutual.add(`${i}-${d.target}`)
  })
  const arc = (p1: ArrowPoint, p2: ArrowPoint, lift = 36): string => {
    const mx = (p1.x + p2.x) / 2
    const my = (p1.y + p2.y) / 2 - lift
    return `M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`
  }
  ally.value.speedDice.forEach((d, i) => {
    if (allyFrozen || !d.card || d.target == null) return
    const p1 = dieCenter(AROW, i)
    const p2 = dieCenter(EROW, d.target)
    if (mutual.has(`${i}-${d.target}`)) {
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const L = Math.hypot(dx, dy) || 1
      const ux = dx / L
      const uy = dy / L
      const g1 = { x: mx - ux * 13, y: my - uy * 13 }
      const g2 = { x: mx + ux * 13, y: my + uy * 13 }
      segs.push({ d: arc(p1, g1, 14), cls: 'ally-arr' })
      segs.push({ d: arc(p2, g2, 14), cls: 'enemy-arr' })
    } else {
      segs.push({ d: arc(p1, p2), cls: 'ally-arr' })
    }
  })
  enemy.value.speedDice.forEach((d, i) => {
    if (enemyFrozen || !d.card || d.target == null) return
    if (mutual.has(`${d.target}-${i}`)) return
    segs.push({ d: arc(dieCenter(EROW, i), dieCenter(AROW, d.target)), cls: 'enemy-arr' })
  })
  return segs
})
const clashMarks = computed<ArrowPoint[]>(() => {
  const out: ArrowPoint[] = []
  if (dispAlly.confused || dispEnemy.confused) return out
  ally.value.speedDice.forEach((d, i) => {
    if (!d.card || d.target == null) return
    const e = enemy.value.speedDice[d.target]
    if (e?.card && e.target === i) {
      const p1 = dieCenter(AROW, i)
      const p2 = dieCenter(EROW, d.target)
      out.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 })
    }
  })
  return out
})

/* 手牌扇形 */
function handSlotStyle(i: number, n: number): Record<string, string> {
  const off = i - (n - 1) / 2
  return {
    transform: `rotate(${(off * 3).toFixed(1)}deg) translateY(${(off * off * 3.5).toFixed(1)}px)`,
    marginLeft: i > 0 && n > 6 ? `${(6 - n) * 11}px` : '0',
  }
}

/* 舞台缩放 */
const stageScale = ref(1)
function fitStage(): void {
  stageScale.value = Math.min(window.innerWidth / 1280, window.innerHeight / 720)
}
if (typeof window !== 'undefined') {
  fitStage()
  window.addEventListener('resize', fitStage)
}
onBeforeUnmount(() => window.removeEventListener('resize', fitStage))
</script>

<template>
  <div class="battle-view">
    <div class="stage" :style="{ transform: `scale(${stageScale})` }">
      <!-- 场景层 -->
      <div class="scene">
        <div class="backwall"></div>
        <div class="spines"></div>
        <div class="fog"></div>
        <div class="floor"></div>
        <div class="sprite enemy" :class="{ 'is-confused': dispEnemy.confused, hitflash: enemyHit }">
          <img :src="enemy.portrait" alt="" />
          <div class="ground-shadow"></div>
          <div class="confusion-tag">混 乱</div>
        </div>
        <div class="sprite ally" :class="{ 'is-confused': dispAlly.confused, hitflash: allyHit }">
          <img :src="ally.portrait" alt="" />
          <div class="ground-shadow"></div>
          <div class="confusion-tag">混 乱</div>
        </div>
        <div class="vignette"></div>
      </div>

      <!-- 顶部信息 -->
      <div class="turn-num">回合 {{ turnNum }}</div>
      <div class="phase-banner">{{ phaseBanner }}</div>
      <div class="enemy-hand">
        <div v-for="(_, i) in enemy.hand" :key="i" class="cardback"></div>
      </div>
      <div class="enemy-hand-cnt">敌方手牌 {{ enemy.hand.length }} 张</div>

      <!-- 面板（两块结构完全一致：体力 / 混乱 / 物理抗性 / 混乱抗性 / 光芒） -->
      <div class="unit-panel enemy">
        <div class="names"><span class="nm">{{ enemy.name }}</span><span class="core">{{ enemy.title }}</span></div>
        <div class="bar-row"><span class="lbl">体力</span><div class="bar hp"><i :style="{ width: (dispEnemy.hp / enemy.hpMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, dispEnemy.hp) }} / {{ enemy.hpMax }}</span></div></div>
        <div class="bar-row"><span class="lbl">混乱</span><div class="bar stg"><i :style="{ width: (dispEnemy.stagger / enemy.staggerMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, dispEnemy.stagger) }} / {{ enemy.staggerMax }}</span></div></div>
        <div class="resist-line">
          物理抗性 <b>斩 {{ enemy.resistPhysic['斩击'].toFixed(1) }}</b> · <b>突 {{ enemy.resistPhysic['突刺'].toFixed(1) }}</b> · <b>打 {{ enemy.resistPhysic['打击'].toFixed(1) }}</b>
        </div>
        <div class="resist-line">
          混乱抗性 <b>斩 {{ enemy.resistChaos['斩击'].toFixed(1) }}</b> · <b>突 {{ enemy.resistChaos['突刺'].toFixed(1) }}</b> · <b>打 {{ enemy.resistChaos['打击'].toFixed(1) }}</b>
        </div>
        <div class="light-row"><span>光芒</span><i v-for="n in LIGHT_MAX" :key="n" :class="{ on: n <= dispEnemy.light }"></i><span class="conf-flag" :class="{ on: dispEnemy.confused }">混乱</span></div>
      </div>
      <div class="unit-panel ally">
        <div class="names"><span class="nm">{{ ally.name }}</span><span class="core">{{ ally.title }}</span></div>
        <div class="bar-row"><span class="lbl">体力</span><div class="bar hp"><i :style="{ width: (dispAlly.hp / ally.hpMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, dispAlly.hp) }} / {{ ally.hpMax }}</span></div></div>
        <div class="bar-row"><span class="lbl">混乱</span><div class="bar stg"><i :style="{ width: (dispAlly.stagger / ally.staggerMax) * 100 + '%' }"></i><span class="num">{{ Math.max(0, dispAlly.stagger) }} / {{ ally.staggerMax }}</span></div></div>
        <div class="resist-line">
          物理抗性 <b>斩 {{ ally.resistPhysic['斩击'].toFixed(1) }}</b> · <b>突 {{ ally.resistPhysic['突刺'].toFixed(1) }}</b> · <b>打 {{ ally.resistPhysic['打击'].toFixed(1) }}</b>
        </div>
        <div class="resist-line">
          混乱抗性 <b>斩 {{ ally.resistChaos['斩击'].toFixed(1) }}</b> · <b>突 {{ ally.resistChaos['突刺'].toFixed(1) }}</b> · <b>打 {{ ally.resistChaos['打击'].toFixed(1) }}</b>
        </div>
        <div class="light-row"><span>光芒</span><i v-for="n in LIGHT_MAX" :key="n" :class="{ on: n <= dispAlly.light }"></i><span class="conf-flag" :class="{ on: dispAlly.confused }">混乱</span></div>
      </div>

      <!-- 速度骰 -->
      <div class="dice-row ally">
        <div
          v-for="(d, i) in ally.speedDice"
          :key="i"
          class="speed-die"
          :class="{ equipped: !!d.card, used: d.consumed, sel: phase === 'equip' && selDieIdx === i && !d.consumed, acting: false, frozen: dispAlly.confused }"
          @click="clickAllyDie(i)"
          @mouseenter="showInspect(d.card, AROW, i)"
          @mouseleave="hideInspect"
        >
          <div class="cube">{{ d.value }}</div>
          <template v-if="d.card">
            <div class="card-chip">{{ d.card.name }}</div>
            <div class="card-chip dir-chip">→ 敌 {{ (d.target ?? 0) + 1 }} 号骰</div>
            <div class="unequip" @click.stop="clickUnequip(i)">×</div>
          </template>
          <div v-else-if="phase === 'equip' && selDieIdx === i" class="card-chip">选一张手牌装备</div>
        </div>
      </div>
      <div class="dice-row enemy">
        <div
          v-for="(d, i) in enemy.speedDice"
          :key="i"
          class="speed-die enemy-die"
          :class="{ equipped: !!d.card, used: d.consumed, aim: phase === 'equip' && selDieIdx >= 0 && !!ally.speedDice[selDieIdx]?.card && !d.consumed, frozen: dispEnemy.confused }"
          @click="clickEnemyDie(i)"
          @mouseenter="showInspect(d.card, EROW, i)"
          @mouseleave="hideInspect"
        >
          <div class="cube">{{ d.value }}</div>
          <div v-if="d.card" class="card-chip">{{ d.card.name }}</div>
        </div>
      </div>

      <!-- 战报 -->
      <div class="battle-log">
        <div v-for="(l, i) in logItems" :key="i" class="lr" :class="l.cls" v-html="l.text"></div>
      </div>

      <!-- 按钮 -->
      <button v-if="phase === 'equip'" class="btn primary btn-battle" @click="onStartBattle">开 始 战 斗</button>
      <button class="btn ghost btn-surrender" @click="onSurrender">投 降</button>

      <!-- 箭头层 -->
      <svg class="arrow-layer" viewBox="0 0 1280 720">
        <defs>
          <marker id="arrowB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#8fb0d8" /></marker>
          <marker id="arrowR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#c9614a" /></marker>
        </defs>
        <path v-for="(p, i) in arrowSegs" :key="i" :class="p.cls" :d="p.d" :marker-end="p.cls === 'ally-arr' ? 'url(#arrowB)' : 'url(#arrowR)'" />
        <g
          v-for="(m, i) in clashMarks"
          :key="'cm-' + i"
          class="clash-mark"
          :transform="`translate(${m.x},${m.y})`"
        >
          <circle r="19" fill="rgba(224,181,100,.12)" stroke="rgba(224,181,100,.55)" stroke-width="1.4" />
          <path class="clash-spark" d="M0,-12 L9,0 L0,12 L-9,0 Z" fill="rgba(255,240,205,.95)" />
          <text y="33" text-anchor="middle" font-size="11" fill="#e0b564" letter-spacing="3">对 顶</text>
        </g>
      </svg>

      <!-- 骰子悬停检视卡 -->
      <div v-if="inspect" class="inspect-card" :style="{ left: inspect.x + 'px', top: inspect.y + 'px' }" @mouseenter="cancelHideInspect" @mouseleave="hideInspect">
        <VisualCard :card="inspect.card.display" :cost-label="inspect.card.costLabel" :min-height="0" render-terms />
      </div>

      <!-- 飘字 -->
      <div class="float-layer">
        <div v-for="f in floats" :key="f.id" class="float-num" :class="f.kind" :style="{ left: f.x + 'px', top: f.y + 'px' }">{{ f.text }}</div>
      </div>

      <!-- 回合横幅 -->
      <div class="turn-splash" :class="{ show: splashVisible }">{{ splash }}</div>

      <!-- 拼点/单方面演出 -->
      <div class="clash-stage" :class="{ show: clashVisible }">
        <div class="clash-veil"></div>
        <template v-if="clashMode === 'clash'">
          <div class="clash-wrap">
            <div class="cc-side" :class="{ lunge: clashLunge === 'ally', beaten: clashLunge === 'enemy' }">
              <div class="who">{{ clashAllyName }}</div>
              <div class="cc-card"><CardFace v-if="clashAllyCard" :card="clashAllyCard" /></div>
              <div class="cc-roll on" :class="{ win: clashWin === 'ally', lose: clashWin === 'enemy' }">{{ clashAllyRoll }}</div>
            </div>
            <div class="cc-mid">
              <div class="vs">对 顶</div>
              <div class="cc-note">{{ clashNote }}</div>
              <div class="cc-spark" :class="{ burst: clashSpark }"></div>
            </div>
            <div class="cc-side" :class="{ lunge: clashLunge === 'enemy', beaten: clashLunge === 'ally' }">
              <div class="who">{{ clashEnemyName }}</div>
              <div class="cc-card"><CardFace v-if="clashEnemyCard" :card="clashEnemyCard" /></div>
              <div class="cc-roll on" :class="{ win: clashWin === 'enemy', lose: clashWin === 'ally' }">{{ clashEnemyRoll }}</div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="solo-wrap" :class="soloSide === 'ally' ? 'from-ally' : 'from-enemy'">
            <div class="solo-tag">单 方 面 攻 击</div>
            <div class="cc-side" :class="{ lunge: soloLunge }">
              <div class="who">{{ soloName }}</div>
              <div class="cc-card"><CardFace v-if="soloCard" :card="soloCard" /></div>
              <div class="cc-roll on win">{{ soloRoll }}</div>
            </div>
            <div class="solo-target">→ {{ soloTarget }}</div>
          </div>
        </template>
      </div>

      <!-- 底部手牌区 -->
      <div class="hand-bar">
        <div class="pile-box"><div class="stack">{{ ally.deck.length }}</div><div class="cap">抽 牌 堆</div></div>
        <div class="hand-cards">
          <div v-for="(c, i) in ally.hand" :key="i" class="card-slot" :style="handSlotStyle(i, ally.hand.length)">
            <div
              class="card-wrap"
              :class="{ selected: selectedHandIdx === i, unaffordable: phase === 'equip' && c.cost > ally.light, pickable: phase === 'equip' && selDieIdx >= 0 && !ally.speedDice[selDieIdx]?.card && c.cost <= ally.light }"
              @click="clickHandCard(i)"
            >
              <CardFace :card="c" />
            </div>
          </div>
        </div>
        <div class="pile-box"><div class="stack">{{ ally.discard.length }}</div><div class="cap">弃 牌 堆</div></div>
        <div class="consume-box"><div class="stack">{{ ally.exhaust.length }}</div><div class="cap">消 耗 区</div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-view {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #17120c;
  animation: battle-in 0.5s ease-out;
  /* 换肤铁律：战斗场景整体是「背景写死的深色层」（书墙/地板/卡面皮革/面板渐变），
     其上文字与装饰必须写死配套色、不随主题墨色走——这里用局部变量覆盖实现：
     无论全局处于哪个主题，战斗场景内永远使用暖夜配色的墨色/金色/线条。 */
  --color-bg: #17120c;
  --color-surface: #241c12;
  --color-surface-2: #2d2317;
  --color-ink: #eee2cb;
  --color-ink-dim: #b6a687;
  --color-ink-faint: #8d8172;
  --color-line: rgba(233, 221, 198, 0.16);
  --color-gold: #e0b564;
  --color-accent: #e0b564;
  --accent: #e0b564;
  --danger: #c0503a;
  --bd-color: rgba(233, 221, 198, 0.16);
}
@keyframes battle-in {
  from { opacity: 0; transform: scale(1.015); }
  to { opacity: 1; transform: none; }
}
.stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1280px;
  height: 720px;
  margin-left: -640px;
  margin-top: -360px;
  transform-origin: center;
}

/* ---------- 场景 ---------- */
.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(224, 181, 100, 0.28), 0 24px 80px rgba(0, 0, 0, 0.6);
}
.backwall {
  position: absolute;
  inset: 0 0 40% 0;
  filter: blur(2.5px) brightness(0.82);
  background:
    radial-gradient(1000px 340px at 68% 24%, rgba(224, 181, 100, 0.1), transparent 62%),
    radial-gradient(700px 300px at 18% 30%, rgba(140, 90, 40, 0.1), transparent 60%),
    repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.42) 0 8px, transparent 8px 170px),
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 74px, rgba(0, 0, 0, 0.5) 74px 82px),
    linear-gradient(180deg, #0d0906 0%, #221809 78%, #332512 100%);
}
.spines {
  position: absolute;
  inset: 0 0 40% 0;
  filter: blur(2.5px);
  opacity: 0.5;
  background:
    repeating-linear-gradient(90deg, rgba(120, 60, 40, 0.35) 0 10px, transparent 10px 34px, rgba(60, 80, 110, 0.3) 34px 42px, transparent 42px 70px, rgba(150, 120, 50, 0.3) 70px 78px, transparent 78px 112px),
    repeating-linear-gradient(0deg, transparent 0 82px);
}
.floor {
  position: absolute;
  left: -25%;
  right: -25%;
  top: 58%;
  bottom: -14%;
  transform: perspective(620px) rotateX(56deg);
  transform-origin: 50% 0%;
  background:
    repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.28) 0 3px, transparent 3px 130px),
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.22) 0 3px, transparent 3px 95px),
    linear-gradient(180deg, #41311c 0%, #2c2011 55%, #1c130a 100%);
  box-shadow: inset 0 24px 40px rgba(0, 0, 0, 0.55);
}
.fog {
  position: absolute;
  left: 0;
  right: 0;
  top: 44%;
  height: 22%;
  background: linear-gradient(180deg, transparent, rgba(63, 47, 26, 0.5) 45%, rgba(23, 17, 10, 0.9) 100%);
}
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(8, 6, 3, 0.62) 100%);
}
.sprite {
  position: absolute;
  pointer-events: none;
}
.sprite img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  display: block;
}
.sprite.ally {
  /* 我方：左下锚定，占舞台高约 50%，object-fit:contain 不裁切、底部对齐。
     left 压到 8px：人物绘制居中在盒内，头部落在敌方面板（left 360）左侧不互相压。 */
  left: 8px;
  bottom: 158px; /* ≈ 22vh of 720，高于手牌区顶部，避免与卡牌重叠 */
  width: 560px;
  height: 360px; /* ≈ 50vh of 720 */
  z-index: 20;
  filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.55));
}
.sprite.ally::before {
  content: '';
  position: absolute;
  left: -6%;
  right: -2%;
  top: 2%;
  bottom: 0;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(ellipse at 46% 42%, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.28) 45%, transparent 70%);
  filter: blur(6px);
}
.sprite.ally img {
  transform: scaleX(-1);
}
.sprite.enemy {
  /* 敌方：右上锚定，占舞台高约 40%，object-fit:contain 不裁切、底部对齐。 */
  right: 102px; /* ≈ 8% of 1280 */
  top: 108px; /* ≈ 15vh of 720 */
  width: 512px;
  height: 288px; /* ≈ 40vh of 720 */
  z-index: 10;
  filter: brightness(0.97) drop-shadow(0 12px 14px rgba(0, 0, 0, 0.5));
}
.ground-shadow {
  position: absolute;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  filter: blur(7px);
}
.sprite.enemy .ground-shadow {
  left: 20%;
  right: 20%;
  bottom: 2px;
  height: 28px;
}
.sprite.hitflash {
  animation: hitflash 0.4s;
}
.sprite.enemy.hitflash {
  animation: hitflashE 0.4s;
}
@keyframes hitflash {
  0% { filter: drop-shadow(0 0 0 rgba(192, 80, 58, 0)); }
  30% { filter: drop-shadow(0 0 26px rgba(220, 90, 60, 0.9)) brightness(1.5); }
  100% {}
}
@keyframes hitflashE {
  0% {}
  30% { filter: brightness(1.6) drop-shadow(0 0 26px rgba(220, 90, 60, 0.9)); }
  100% { filter: brightness(0.97); }
}
.confusion-tag {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  letter-spacing: 0.3em;
  color: #e2c2f7;
  background: rgba(50, 20, 70, 0.88);
  border: 1px solid rgba(180, 110, 230, 0.55);
  border-radius: 4px;
  padding: 2px 12px;
  display: none;
  white-space: nowrap;
}
.sprite.is-confused .confusion-tag {
  display: block;
}
.sprite.enemy .confusion-tag {
  top: 14px;
}

/* ---------- 顶部信息 ---------- */
.turn-num {
  position: absolute;
  left: 36px;
  top: 14px;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 0.35em;
  color: var(--color-gold);
  z-index: 12;
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.8);
}
.phase-banner {
  position: absolute;
  left: 50%;
  top: 12px;
  transform: translateX(-50%);
  font-size: 12.5px;
  letter-spacing: 0.4em;
  color: var(--color-gold);
  border: 1px solid rgba(224, 181, 100, 0.35);
  border-radius: 999px;
  padding: 5px 30px;
  background: rgba(23, 18, 12, 0.72);
  z-index: 12;
  white-space: nowrap;
}
.enemy-hand {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  z-index: 12;
}
.cardback {
  width: 30px;
  height: 42px;
  margin-left: -9px;
  border-radius: 5px;
  background: linear-gradient(145deg, #3a2d1a, #241c12);
  border: 1px solid rgba(224, 181, 100, 0.4);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}
.cardback:first-child {
  margin-left: 0;
}
.enemy-hand-cnt {
  position: absolute;
  right: 20px;
  top: 70px;
  font-size: 10.5px;
  color: var(--color-ink-faint);
  letter-spacing: 0.2em;
  z-index: 12;
  white-space: nowrap;
}

/* ---------- 面板 ---------- */
.unit-panel {
  position: absolute;
  border-radius: 12px;
  padding: 13px 18px 12px;
  z-index: 30;
  background: linear-gradient(180deg, rgba(42, 33, 21, 0.82), rgba(30, 23, 15, 0.84));
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(224, 181, 100, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(233, 221, 198, 0.08);
}
.unit-panel.enemy {
  left: 360px;
  top: 88px;
  width: 340px;
  transform: scale(0.94);
  transform-origin: top left;
  border-color: rgba(120, 150, 200, 0.38);
}
.unit-panel.ally {
  left: 792px;
  top: 322px;
  width: 340px;
  border-color: rgba(224, 181, 100, 0.5);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(233, 221, 198, 0.1);
}
.names {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.nm {
  font-size: 18px;
  font-weight: 700;
  color: #f0e4c8;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.5);
}
.unit-panel.enemy .nm {
  font-size: 16px;
}
.core {
  font-size: 10.5px;
  color: var(--color-ink-faint);
  max-width: 180px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.unit-panel.ally .core {
  font-size: 11.5px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 6px 0;
}
.bar-row .lbl {
  font-size: 11px;
  color: var(--color-ink-dim);
  letter-spacing: 0.25em;
  flex: 0 0 44px;
}
.bar {
  flex: 1;
  height: 14px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(233, 221, 198, 0.16);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.7), inset 0 -1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  position: relative;
}
.bar i {
  display: block;
  height: 100%;
  border-radius: 6px;
  transition: width 0.45s cubic-bezier(0.2, 0.7, 0.3, 1);
  position: relative;
}
.bar i::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.28), transparent 45%, rgba(0, 0, 0, 0.22));
}
.bar.hp i {
  background: linear-gradient(90deg, #8b0000, #ff0000);
}
.bar.stg i {
  background: linear-gradient(90deg, #4d7699, #7fa9cc);
}
.bar .num {
  position: absolute;
  inset: 0;
  font-size: 9.5px;
  line-height: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
}
.resist-line {
  margin-top: 8px;
  font-size: 10.5px;
  color: var(--color-ink-faint);
  letter-spacing: 0.04em;
}
.resist-line b {
  color: var(--color-ink-dim);
  font-weight: 600;
}
.light-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
  font-size: 10px;
  color: var(--color-ink-faint);
  letter-spacing: 0.2em;
}
.light-row i {
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  border: 1px solid rgba(224, 181, 100, 0.5);
  border-radius: 2px;
  background: rgba(23, 18, 12, 0.6);
}
.light-row i.on {
  background: radial-gradient(circle at 35% 30%, #f4dfa8, #cf9c40);
  box-shadow: 0 0 8px rgba(224, 181, 100, 0.55);
}
.conf-flag {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(226, 194, 247, 0.32);
  border: 1px solid rgba(180, 110, 230, 0.18);
  border-radius: 4px;
  padding: 1px 8px;
  transition: all 0.2s;
}
.conf-flag.on {
  color: #e2c2f7;
  border-color: rgba(180, 110, 230, 0.6);
  background: rgba(50, 20, 70, 0.55);
  box-shadow: 0 0 8px rgba(180, 110, 230, 0.4);
}

/* ---------- 速度骰 ---------- */
.dice-row {
  position: absolute;
  display: flex;
  gap: 18px;
  z-index: 40;
  animation: bob 3.2s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.dice-row.ally {
  left: 580px;
  top: 345px;
}
.dice-row.enemy {
  left: 750px;
  top: 118px;
  animation-delay: -1.6s;
}
.speed-die {
  width: 56px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: transform 0.15s;
}
.cube {
  width: 46px;
  height: 46px;
  margin: 0 auto;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-latin);
  font-size: 23px;
  font-weight: 700;
  color: #1b1408;
  background: linear-gradient(145deg, #f0dca6, #c39549);
  border: 1px solid #f4e3b4;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.5), 0 0 14px rgba(224, 181, 100, 0.25);
}
.speed-die.enemy-die .cube {
  background: linear-gradient(145deg, #aec6e4, #5c7ea8);
  border-color: #d0e0f2;
  color: #101a26;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.55), inset 0 2px 0 rgba(255, 255, 255, 0.45), 0 0 12px rgba(120, 150, 200, 0.3);
}
/* 混乱冻结：骰子变灰、卡牌 chip 淡出，视觉上"无法行动"。 */
.speed-die.frozen {
  pointer-events: none;
  filter: grayscale(0.7) brightness(0.6);
}
.speed-die.frozen .card-chip,
.speed-die.frozen .unequip {
  opacity: 0.25;
}
.card-chip {
  margin-top: 5px;
  font-size: 10px;
  color: var(--color-ink-dim);
  background: rgba(23, 18, 12, 0.85);
  border: 1px solid var(--color-line);
  border-radius: 5px;
  padding: 2px 5px;
  max-width: 82px;
  margin-left: auto;
  margin-right: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 18px;
}
.speed-die.equipped .card-chip:first-of-type {
  color: var(--color-gold);
  border-color: rgba(224, 181, 100, 0.45);
}
.dir-chip {
  font-size: 9.5px;
  color: var(--color-ink-faint);
}
.speed-die.used {
  opacity: 0.3;
  pointer-events: none;
  filter: grayscale(0.85);
}
.speed-die.sel .cube {
  box-shadow: 0 0 0 2px var(--color-gold), 0 0 22px rgba(224, 181, 100, 0.85);
}
.speed-die.aim {
  cursor: crosshair;
  transform: scale(1.1);
}
.speed-die.aim .cube {
  box-shadow: 0 0 0 2px #8fb0d8, 0 0 24px rgba(120, 150, 200, 0.9);
  animation: aimpulse 1.1s ease-in-out infinite;
}
@keyframes aimpulse {
  50% { box-shadow: 0 0 0 3px #c3d9f2, 0 0 30px rgba(150, 190, 235, 1); }
}
.unequip {
  position: absolute;
  top: -7px;
  right: 2px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  line-height: 17px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

/* ---------- 战报 ---------- */
.battle-log {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 46px;
  width: 600px;
  height: 64px;
  overflow: hidden;
  z-index: 11;
  pointer-events: none;
  font-size: 11px;
  line-height: 1.7;
  color: var(--color-ink-dim);
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.7);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 22px);
  mask-image: linear-gradient(180deg, transparent 0, #000 22px);
}
.lr :deep(b) {
  color: var(--color-ink);
}
.lr.g :deep(*) {
  color: var(--color-gold);
}
.lr.clash :deep(*) {
  color: #d9b3f5;
}

/* ---------- 按钮 ---------- */
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
.btn.primary {
  font-size: 13px;
  padding: 8px 26px;
  color: #1b1408;
  background: linear-gradient(180deg, #e6c47e, #c89a4e);
  border-color: #e0b564;
  font-weight: 600;
}
.btn-battle {
  position: absolute;
  right: 40px;
  bottom: 245px;
  z-index: 102;
  letter-spacing: 0.25em;
}
.btn-surrender {
  position: absolute;
  left: 36px;
  top: 52px;
  z-index: 102;
  padding: 5px 14px;
  font-size: 11px;
  letter-spacing: 0.25em;
}
.btn.ghost {
  border-color: var(--color-line);
  color: var(--color-ink-dim);
}

/* ---------- 箭头 ---------- */
.arrow-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 35;
  width: 1280px;
  height: 720px;
}
.arrow-layer path {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
}
.arrow-layer path.ally-arr {
  stroke: #8fb0d8;
  filter: drop-shadow(0 0 5px rgba(120, 150, 200, 0.85));
}
.arrow-layer path.enemy-arr {
  stroke: #c9614a;
  filter: drop-shadow(0 0 5px rgba(200, 90, 60, 0.85));
}
.clash-mark {
  animation: clashpop 0.45s ease-out;
}
/* 动画放在内部元素上，避免 CSS transform 覆盖 <g> 的 translate 定位 */
.clash-spark {
  animation: sparkpop 0.45s ease-out;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes clashpop {
  0% { opacity: 0; }
  60% { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes sparkpop {
  0% { transform: scale(0.4); }
  60% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

/* ---------- 骰子悬停检视卡 ---------- */
.inspect-card {
  position: absolute;
  z-index: 110;
  width: 300px;
  max-height: 688px;
  overflow-y: auto;
  scrollbar-width: thin;
  filter: drop-shadow(0 10px 26px rgba(0, 0, 0, 0.6));
  pointer-events: auto;
}

/* ---------- 飘字 ---------- */
.float-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 60;
}
.float-num {
  position: absolute;
  font-family: var(--font-latin);
  font-weight: 700;
  font-size: 30px;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
  animation: floatup 1.1s ease-out forwards;
}
.float-num.hp { color: #f0715a; }
.float-num.st { color: #9cc4e8; }
.float-num.lt { color: #e8d48a; font-size: 24px; }
@keyframes floatup {
  0% { opacity: 0; transform: translateY(10px) scale(0.7); }
  15% { opacity: 1; transform: translateY(0) scale(1.15); }
  100% { opacity: 0; transform: translateY(-52px) scale(1); }
}

/* ---------- 回合横幅 ---------- */
.turn-splash {
  position: absolute;
  left: 50%;
  top: 300px;
  transform: translate(-50%, -50%) scale(0.92);
  z-index: 70;
  opacity: 0;
  pointer-events: none;
  font-size: 26px;
  letter-spacing: 0.55em;
  color: var(--color-gold);
  text-shadow: 0 0 34px rgba(224, 181, 100, 0.55), 0 2px 10px rgba(0, 0, 0, 0.9);
  transition: opacity 0.3s, transform 0.3s;
  white-space: nowrap;
}
.turn-splash.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* ---------- 拼点/单方面演出 ---------- */
.clash-stage {
  position: absolute;
  inset: 0;
  z-index: 120;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.clash-stage.show {
  display: flex;
}
.clash-veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 48%, rgba(18, 14, 9, 0.62), rgba(10, 8, 5, 0.9));
}
.clash-wrap {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 22px;
}
.cc-side {
  width: 180px;
  text-align: center;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.3, 1.2);
}
.cc-side .who {
  font-size: 12px;
  letter-spacing: 0.3em;
  color: var(--color-ink-dim);
  margin-bottom: 9px;
}
.cc-card {
  height: 262px;
  display: flex;
  justify-content: center;
}
.cc-card :deep(.battle-card) {
  transform: scale(1.32);
  transform-origin: top center;
  pointer-events: none;
}
.cc-roll {
  margin-top: 10px;
  font-family: var(--font-latin);
  font-size: 22px;
  color: var(--color-ink-dim);
  opacity: 0;
  transition: opacity 0.16s;
  letter-spacing: 0.05em;
}
.cc-roll.on {
  opacity: 1;
}
.cc-roll.win {
  color: #ffd98a;
  text-shadow: 0 0 20px rgba(224, 181, 100, 0.9);
}
.cc-roll.lose {
  color: #d4756a;
}
.cc-side.lunge {
  transform: translateX(52px) rotate(2.5deg);
}
.cc-side.beaten .cc-card {
  filter: brightness(0.62) saturate(0.55);
}
.cc-mid {
  position: relative;
  width: 96px;
  padding-top: 96px;
  text-align: center;
}
.cc-mid .vs {
  font-family: var(--font-display);
  font-size: 21px;
  letter-spacing: 0.18em;
  color: var(--color-gold);
  line-height: 1.5;
  text-shadow: 0 0 18px rgba(224, 181, 100, 0.6);
}
.cc-note {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--color-ink-faint);
  letter-spacing: 0.15em;
  min-height: 17px;
}
.cc-spark {
  position: absolute;
  left: 50%;
  top: 120px;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff9e6, #e0b564 45%, transparent 72%);
  opacity: 0;
}
.cc-spark.burst {
  animation: sparkburst 0.55s ease-out;
}
@keyframes sparkburst {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(10); }
}
.solo-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  transition: transform 0.2s;
}
.solo-wrap.from-ally {
  margin-right: 300px;
}
.solo-wrap.from-enemy {
  margin-left: 300px;
}
.solo-tag {
  font-size: 12px;
  letter-spacing: 0.4em;
  color: #eab27c;
  border: 1px solid rgba(224, 181, 100, 0.4);
  border-radius: 999px;
  padding: 3px 16px;
  background: rgba(23, 18, 12, 0.75);
}
.solo-wrap .cc-side.lunge {
  transform: translateX(46px) rotate(2deg);
}
.solo-wrap.from-enemy .cc-side.lunge {
  transform: translateX(-46px) rotate(-2deg);
}
.solo-target {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--color-ink-faint);
}

/* ---------- 手牌区 ---------- */
.hand-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 210px;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  padding: 0 18px 8px;
  background: linear-gradient(180deg, rgba(18, 14, 9, 0), rgba(18, 14, 9, 0.78) 30%, rgba(18, 14, 9, 0.94));
  border-top: 1px solid rgba(224, 181, 100, 0.22);
}
.pile-box {
  flex: 0 0 82px;
  text-align: center;
  position: relative;
  top: -16px;
}
.stack {
  width: 72px;
  height: 98px;
  margin: 0 auto 6px;
  border-radius: 8px;
  border: 1px dashed rgba(233, 221, 198, 0.32);
  background: rgba(36, 28, 18, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-latin);
  font-size: 23px;
  color: var(--color-ink-dim);
}
.cap {
  font-size: 11px;
  color: var(--color-ink-faint);
  letter-spacing: 0.25em;
}
.light-box {
  flex: 0 0 116px;
  text-align: center;
  position: relative;
  top: -14px;
}
.light-pips {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 7px;
}
.light-pip {
  width: 15px;
  height: 15px;
  transform: rotate(45deg);
  border: 1px solid rgba(224, 181, 100, 0.5);
  border-radius: 3px;
  background: rgba(23, 18, 12, 0.6);
}
.light-pip.on {
  background: radial-gradient(circle at 35% 30%, #f4dfa8, #cf9c40);
  box-shadow: 0 0 10px rgba(224, 181, 100, 0.55);
}
.light-box .cap {
  font-size: 10px;
  letter-spacing: 0.35em;
}
.hand-cards {
  display: flex;
  gap: 9px;
  align-items: flex-end;
  padding-bottom: 4px;
}
.card-slot {
  flex: 0 0 auto;
  position: relative;
  transition: transform 0.2s;
}
.card-wrap {
  transition: transform 0.16s, box-shadow 0.16s, border-color 0.16s;
  border-radius: 10px;
}
.card-wrap:hover {
  transform: translateY(-50px) scale(1.2);
  z-index: 6;
}
.card-wrap.selected {
  transform: translateY(-46px) scale(1.12);
  z-index: 6;
}
.card-wrap.unaffordable {
  filter: grayscale(0.65) brightness(0.65);
  cursor: not-allowed;
}
.card-wrap.unaffordable:hover {
  transform: none;
}
.card-wrap.pickable {
  box-shadow: 0 0 0 1px rgba(224, 181, 100, 0.3), 0 10px 24px rgba(0, 0, 0, 0.55);
}
.consume-box {
  flex: 0 0 64px;
  text-align: center;
  position: relative;
  top: -16px;
}
.consume-box .stack {
  width: 58px;
  height: 76px;
  border-radius: 7px;
  border: 1px dashed rgba(233, 221, 198, 0.24);
  background: rgba(18, 14, 9, 0.55);
  font-size: 17px;
  color: var(--color-ink-faint);
}
.consume-box .cap {
  font-size: 10.5px;
  margin-top: 3px;
  letter-spacing: 0.2em;
}
</style>
