/**
 * 遗迹图书馆 · 迎书楼战斗模拟器 v1（战斗引擎）
 *
 * 纯函数状态机：给定状态与玩家输入，同步计算出终态与一串按顺序播放的事件。
 * 引擎不碰 DOM、不 await 动画、不依赖定时器；随机数全部来自注入的 Rng。
 * 演出由视图按事件序列回放（引擎已把终态算好，回放只读不改状态）。
 *
 * 定稿口径（《疑难解答》A1/A2 全部拍板项）：
 *   - 混乱抗性 1.5（混乱期间物理/混乱抗性一律按 1.5）；
 *   - 混乱持续：被击入混乱本回合 + 下一回合无法行动，第三回合恢复；
 *     混乱条在「混乱的第二回合结束」时回满；
 *   - 速度骰写死双方各 2 颗，第 8 回合进入赛点各 +1 颗（我方加在左侧、敌方加在右侧）；掷点 speedMin~speedMax 均匀随机；
 *   - 开局满费用 4，每回合自然 +1（不超上限）；进入赛点后每回合回费 +2、自然抽牌 +1（平衡性调整）；
 *   - 起手 6 张，每回合抽 1 张，手牌上限 8，超上限抽到即弃；
 *   - 行动顺序按速度值从高到低，同值我方优先、同侧从左到右；
 *   - 拼点：进攻 vs 进攻比大小赢家全额伤害；进攻 vs 防御比大小差值伤害；
 *     防御 vs 防御互相抵消；一方骰更多时剩余的进攻型骰继续单方面命中；
 *   - 无骰卡不参与拼点，被指向只算对方单方面攻击；
 *   - [消耗] 卡结算后进消耗区，不回抽牌堆；
 *   - 胜负：一方体力归零即结束；同时归零判敌方胜；
 *   - 投降：我方直接判负（视图层触发）。
 */

import type { GameEvent, Rng, SimCard, SimDie, SimDieKind, SimUnit, SpeedDie } from './types.js'
import { defaultRng } from './rng.js'

export const LIGHT_MAX = 4
export const HAND_CAP = 8
export const START_HAND = 6
export const BASE_SPEED_DICE = 2
export const MATCH_POINT_TURN = 8

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']

/** 进攻型骰子类型。 */
const ATTACK_KINDS: ReadonlySet<SimDieKind> = new Set(['斩击', '突刺', '打击'])

export function isAttackDie(d: SimDie): boolean {
  return ATTACK_KINDS.has(d.kind)
}

export function roman(n: number): string {
  return ROMAN[n - 1] ?? String(n)
}

/* ---------- 单位构造 ---------- */

export interface UnitSeed {
  id: number
  name: string
  title: string
  portrait: string
  floorId: number | null
  hp: number
  stagger: number
  speedMin: number
  speedMax: number
  resistPhysic: Record<'斩击' | '突刺' | '打击', number>
  resistChaos: Record<'斩击' | '突刺' | '打击', number>
  cards: SimCard[]
}

function mkUnit(side: 'ally' | 'enemy', seed: UnitSeed, rng: Rng): SimUnit {
  const deck: SimCard[] = rng.shuffle(seed.cards.map((c) => ({ ...c })))
  return {
    side,
    id: seed.id,
    name: seed.name,
    title: seed.title,
    portrait: seed.portrait,
    floorId: seed.floorId,
    hp: seed.hp,
    hpMax: seed.hp,
    stagger: seed.stagger,
    staggerMax: seed.stagger,
    resistPhysic: { ...seed.resistPhysic },
    resistChaos: { ...seed.resistChaos },
    speedMin: seed.speedMin,
    speedMax: seed.speedMax,
    deck,
    hand: [],
    discard: [],
    exhaust: [],
    light: LIGHT_MAX,
    speedDice: [],
    confusedTurns: 0,
  }
}

/* ---------- 战斗状态 ---------- */

export interface BattleState {
  ally: SimUnit
  enemy: SimUnit
  turn: number
  /** 是否已进入赛点（速度骰 +1）。 */
  matchPoint: boolean
  /** 本回合是否已投骰（进入装备阶段）。 */
  rolled: boolean
  /** 已结束：null = 进行中，否则为胜方。 */
  winner: 'ally' | 'enemy' | null
  bothDead: boolean
  rng: Rng
}

/** 新建一场对局（洗牌 + 起手抽牌 + 初始速度骰）。 */
export function createBattle(allySeed: UnitSeed, enemySeed: UnitSeed, rng: Rng = defaultRng): BattleState {
  const ally = mkUnit('ally', allySeed, rng)
  const enemy = mkUnit('enemy', enemySeed, rng)
  ally.speedDice = emptyDice(BASE_SPEED_DICE)
  enemy.speedDice = emptyDice(BASE_SPEED_DICE)
  return {
    ally,
    enemy,
    turn: 1,
    matchPoint: false,
    rolled: false,
    winner: null,
    bothDead: false,
    rng,
  }
}

function emptyDice(n: number): SpeedDie[] {
  return Array.from({ length: n }, () => ({ value: 0, card: null, target: null, consumed: false }))
}

function drawCards(u: SimUnit, n: number, rng: Rng, events: GameEvent[]): void {
  for (let k = 0; k < n; k++) {
    if (u.deck.length === 0) {
      if (u.discard.length === 0) break
      u.deck = rng.shuffle(u.discard.splice(0))
      events.push({ type: 'log', text: `${u.name} 洗切弃牌堆，重整抽牌堆` })
    }
    const c = u.deck.pop() as SimCard
    if (u.hand.length >= HAND_CAP) {
      u.discard.push(c)
      events.push({ type: 'log', text: `${u.name} 手牌已满，「${c.name}」直接弃置` })
    } else {
      u.hand.push(c)
    }
  }
}

/** 开局起手抽牌（无日志）。 */
export function initialDraw(state: BattleState): void {
  drawCards(state.ally, START_HAND, state.rng, [])
  drawCards(state.enemy, START_HAND, state.rng, [])
}

/* ---------- 回合开始 ---------- */

/** 开始新回合：赛点加骰、清骰、投骰、AI 装备。返回本回合事件。 */
export function startTurn(state: BattleState): GameEvent[] {
  const events: GameEvent[] = []
  const { ally, enemy, rng } = state

  // 赛点：第 8 回合起双方 +1 颗速度骰（我方加在最左，敌方加在最右）。
  if (state.turn >= MATCH_POINT_TURN && !state.matchPoint) {
    state.matchPoint = true
    ally.speedDice.unshift({ value: 0, card: null, target: null, consumed: false })
    enemy.speedDice.push({ value: 0, card: null, target: null, consumed: false })
    events.push({ type: 'log', text: '战斗已持续 8 回合，双方各获得 1 颗额外速度骰', cls: 'g' })
    events.push({ type: 'turnSplash', text: '赛 点 阶 段 · 速 度 骰 +1' })
  }

  for (const u of [ally, enemy]) {
    for (const d of u.speedDice) {
      d.card = null
      d.consumed = false
      d.target = null
    }
  }

  // 投骰。
  for (const u of [ally, enemy]) {
    for (const d of u.speedDice) d.value = rng.int(u.speedMin, u.speedMax)
  }
  state.rolled = true

  events.push({ type: 'turnStart', turn: state.turn })
  events.push({ type: 'turnSplash', text: `第 ${roman(state.turn)} 回合` })

  // AI 装备。
  aiEquip(state, events)

  return events
}

/* ---------- 敌方 AI ---------- */

/** 敌方策略（第一版）：费用从高到低随机装备 + 骰子随机指向。 */
export function aiEquip(state: BattleState, events: GameEvent[]): void {
  const e = state.enemy
  if (e.confusedTurns > 0) {
    events.push({ type: 'log', text: `${e.name} 处于混乱，本回合无法装备卡牌` })
    return
  }
  for (const die of e.speedDice) {
    const affordable = e.hand.filter((c) => c.cost <= e.light)
    if (affordable.length === 0) break
    const maxCost = Math.max(...affordable.map((c) => c.cost))
    const c = state.rng.pick(affordable.filter((x) => x.cost === maxCost))
    e.hand.splice(e.hand.indexOf(c), 1)
    e.light -= c.cost
    die.card = c
    die.target = state.rng.int(0, state.ally.speedDice.length - 1)
  }
}

/* ---------- 玩家装备操作（返回事件，供视图即时反馈） ---------- */

/** 玩家把手牌第 handIdx 张装备到我方第 dieIdx 颗骰。 */
export function equipCard(state: BattleState, dieIdx: number, handIdx: number): GameEvent[] {
  const a = state.ally
  if (a.confusedTurns > 0) return []
  const die = a.speedDice[dieIdx]
  if (!die || die.card || die.consumed) return []
  const c = a.hand[handIdx]
  if (!c || c.cost > a.light) return []
  a.hand.splice(handIdx, 1)
  a.light -= c.cost
  die.card = c
  die.target = die.target ?? 0
  return [{ type: 'log', text: `${a.name} 装备「${c.name}」` }]
}

/** 玩家指定我方第 dieIdx 颗骰指向敌方第 enemyIdx 颗骰。 */
export function setTarget(state: BattleState, dieIdx: number, enemyIdx: number): GameEvent[] {
  const die = state.ally.speedDice[dieIdx]
  if (!die || !die.card) return []
  die.target = enemyIdx
  return []
}

/** 玩家撤回我方第 dieIdx 颗骰的卡牌。 */
export function unequip(state: BattleState, dieIdx: number): GameEvent[] {
  const a = state.ally
  if (a.confusedTurns > 0) return []
  const die = a.speedDice[dieIdx]
  if (!die || !die.card) return []
  a.light += die.card.cost
  a.hand.push(die.card)
  die.card = null
  die.target = null
  return []
}

/* ---------- 战斗阶段结算 ---------- */

/** 触发某单位已装备卡牌中指定时机的效果。 */
function triggerFx(u: SimUnit, timing: '使用时' | '战斗开始' | '战斗结束', state: BattleState, events: GameEvent[], onlyCard?: SimCard): void {
  for (const d of u.speedDice) {
    if (!d.card || (onlyCard && d.card !== onlyCard)) continue
    for (const fx of d.card.fx) {
      if (fx.timing !== timing) continue
      if (fx.kind === 'draw') {
        events.push({ type: 'log', text: `${u.name} 触发「${d.card.name}」：抽取 ${fx.n} 张卡牌`, cls: 'g' })
        drawCards(u, fx.n, state.rng, events)
      } else if (fx.kind === 'light') {
        u.light = Math.min(LIGHT_MAX, u.light + fx.n)
        events.push({ type: 'log', text: `${u.name} 触发「${d.card.name}」：恢复 ${fx.n} 点光芒`, cls: 'g' })
        events.push({ type: 'light', target: u.side, n: fx.n, src: 'fx' })
      }
    }
  }
}

/** 伤害结算（同步修改状态并产出事件）。 */
function dealDamage(src: SimUnit, dst: SimUnit, die: SimDie, roll: number, label: string, events: GameEvent[]): void {
  if (roll <= 0) return
  if (!isAttackDie(die)) return
  const kind = die.kind as '斩击' | '突刺' | '打击'
  const confused = dst.confusedTurns > 0
  const rPhys = confused ? 1.5 : dst.resistPhysic[kind]
  const rChaos = confused ? 1.5 : dst.resistChaos[kind]
  const hpDmg = Math.round(roll * rPhys)
  const stgDmg = Math.round(roll * rChaos)
  dst.hp = Math.max(0, dst.hp - hpDmg)
  dst.stagger = Math.max(0, dst.stagger - stgDmg)
  events.push({
    type: 'log',
    text: `${src.name} 的 ${die.kind}（${roll}）${label} —— 体力 -${hpDmg} 混乱 -${stgDmg}${confused ? '（混乱状态，抗性按 1.5 计）' : ''}`,
    cls: '',
  })
  events.push({ type: 'damage', target: dst.side, hp: hpDmg, stagger: stgDmg, dieKind: die.kind, roll, label })
  if (dst.stagger <= 0 && dst.confusedTurns === 0) {
    dst.confusedTurns = 2
    events.push({ type: 'log', text: `${dst.name} 的混乱条见底，陷入混乱！`, cls: 'clash' })
    events.push({ type: 'confusion', target: dst.side })
  }
}

/** 拼点：双方骰子按位置依次对拼。 */
function resolveClash(atkU: SimUnit, atkDie: SpeedDie, defU: SimUnit, defDie: SpeedDie, state: BattleState, events: GameEvent[]): void {
  const aC = atkDie.card as SimCard
  const dC = defDie.card as SimCard
  events.push({ type: 'log', text: `拼点 —— ${atkU.name}「${aC.name}」 对上 ${defU.name}「${dC.name}」`, cls: 'clash' })
  const allyU = atkU.side === 'ally' ? atkU : defU
  const enemyU = atkU.side === 'ally' ? defU : atkU
  const allyC = atkU.side === 'ally' ? aC : dC
  const enemyC = atkU.side === 'ally' ? dC : aC
  events.push({ type: 'clashStart', allyCard: allyC, enemyCard: enemyC })

  const pairs = Math.min(allyC.dice.length, enemyC.dice.length)
  for (let i = 0; i < pairs; i++) {
    // 任一方在拼点中被击入混乱，本卡剩余骰子立即停止使用。
    if (allyU.confusedTurns > 0 || enemyU.confusedTurns > 0) {
      const who = allyU.confusedTurns > 0 ? allyU : enemyU
      events.push({ type: 'log', text: `　${who.name} 陷入混乱，「${allyU.confusedTurns > 0 ? allyC.name : enemyC.name}」剩余骰子停止使用` })
      break
    }
    const ad = allyC.dice[i] as SimDie
    const ed = enemyC.dice[i] as SimDie
    const ar = state.rng.int(ad.min, ad.max)
    const er = state.rng.int(ed.min, ed.max)
    const aAtk = isAttackDie(ad)
    const eAtk = isAttackDie(ed)
    let winner: 'ally' | 'enemy' | null = null
    let dmgA = 0
    let dmgE = 0
    let note = ''
    if (aAtk && eAtk) {
      if (ar > er) { winner = 'ally'; dmgA = ar; note = '拼点胜利' }
      else if (er > ar) { winner = 'enemy'; dmgE = er; note = '拼点胜利' }
      else note = '势均力敌'
    } else if (aAtk && !eAtk) {
      if (ar > er) { dmgA = ar - er; note = '突破防御' } else note = '被挡下'
    } else if (!aAtk && eAtk) {
      if (er > ar) { dmgE = er - ar; note = '突破防御' } else note = '被挡下'
    } else {
      note = '互相抵消'
    }
    events.push({
      type: 'clashBeat',
      index: i,
      ally: { kind: ad.kind, roll: ar },
      enemy: { kind: ed.kind, roll: er },
      winner,
      note,
    })
    events.push({ type: 'log', text: `　${ad.kind} ${ar} 对 ${ed.kind} ${er}${note ? ' —— ' + note : ''}` })
    if (dmgA > 0) dealDamage(allyU, enemyU, ad, dmgA, note, events)
    if (dmgE > 0) dealDamage(enemyU, allyU, ed, dmgE, note, events)
    if (allyU.hp <= 0 || enemyU.hp <= 0) break
  }
  events.push({ type: 'clashEnd' })

  // 剩余骰子：多的一方的进攻型骰继续单方面命中。
  // 但若行动方此时已陷入混乱（拼点中被反击破防），剩余骰子不得再使用。
  if (allyU.hp > 0 && enemyU.hp > 0 && allyC.dice.length !== enemyC.dice.length) {
    const longer = allyC.dice.length > enemyC.dice.length ? { u: allyU, c: allyC } : { u: enemyU, c: enemyC }
    const rest = longer.c.dice.slice(pairs).filter(isAttackDie)
    if (rest.length && longer.u.confusedTurns === 0) {
      const foe = longer.u === state.ally ? state.enemy : state.ally
      events.push({ type: 'log', text: `　「${longer.c.name}」剩余的进攻型骰子继续命中` })
      events.push({ type: 'soloStart', side: longer.u.side, card: longer.c, target: foe.side })
      for (const x of rest) {
        if (longer.u.confusedTurns > 0) {
          events.push({ type: 'log', text: `　${longer.u.name} 陷入混乱，剩余骰子停止使用` })
          break
        }
        const r = state.rng.int(x.min, x.max)
        events.push({ type: 'soloBeat', die: x, roll: r })
        dealDamage(longer.u, foe, x, r, '剩余骰子', events)
        if (foe.hp <= 0) break
      }
      events.push({ type: 'soloEnd' })
    } else if (rest.length && longer.u.confusedTurns > 0) {
      events.push({ type: 'log', text: `　${longer.u.name} 陷入混乱，「${longer.c.name}」剩余骰子停止使用` })
    }
  }
}

/** 单方面攻击。 */
function oneSided(u: SimUnit, card: SimCard, foe: SimUnit, state: BattleState, events: GameEvent[]): void {
  const atk = card.dice.filter(isAttackDie)
  events.push({ type: 'log', text: `${u.name} 发动「${card.name}」—— 单方面攻击` })
  if (atk.length === 0) {
    events.push({ type: 'log', text: `　「${card.name}」没有任何进攻型骰子，未造成伤害` })
    return
  }
  events.push({ type: 'soloStart', side: u.side, card, target: foe.side })
  for (const x of atk) {
    // 攻击方若在过程中陷入混乱，剩余骰子立即停止。
    if (u.confusedTurns > 0) {
      events.push({ type: 'log', text: `　${u.name} 陷入混乱，剩余骰子停止使用` })
      break
    }
    const r = state.rng.int(x.min, x.max)
    events.push({ type: 'soloBeat', die: x, roll: r })
    dealDamage(u, foe, x, r, '单方面攻击', events)
    if (foe.hp <= 0) break
  }
  events.push({ type: 'soloEnd' })
}

/** 单颗骰子的行动。 */
function performAction(state: BattleState, unit: SimUnit, die: SpeedDie, idx: number, events: GameEvent[]): void {
  if (die.consumed) return
  const foe = unit.side === 'ally' ? state.enemy : state.ally
  if (unit.confusedTurns > 0) {
    events.push({ type: 'log', text: `${unit.name} 陷入混乱，无法行动` })
    die.consumed = true
    return
  }
  if (!die.card) {
    events.push({ type: 'log', text: `${unit.name} 的速度骰未装备卡牌，按兵不动` })
    die.consumed = true
    return
  }
  triggerFx(unit, '使用时', state, events, die.card)
  const tDie = foe.speedDice[die.target ?? 0]
  const canClash =
    foe.confusedTurns === 0 &&
    !!tDie &&
    !!tDie.card &&
    !tDie.consumed &&
    tDie.target === idx &&
    die.card.dice.length > 0 &&
    tDie.card.dice.length > 0
  if (canClash) {
    resolveClash(unit, die, foe, tDie as SpeedDie, state, events)
    ;(tDie as SpeedDie).consumed = true
  } else {
    oneSided(unit, die.card, foe, state, events)
  }
  die.consumed = true
}

/** 回合结算：战斗结束效果、卡进弃牌/消耗、回费、抽牌、混乱计时。 */
function settle(state: BattleState, events: GameEvent[]): void {
  for (const u of [state.ally, state.enemy]) {
    triggerFx(u, '战斗结束', state, events)
    for (const d of u.speedDice) {
      if (!d.card) continue
      if (d.card.exhaust) {
        u.exhaust.push(d.card)
        events.push({ type: 'log', text: `${u.name} 的「${d.card.name}」被消耗，移入消耗区` })
      } else {
        u.discard.push(d.card)
      }
      d.card = null
      d.target = null
    }
    // 回费与自然抽牌：常规每回合 +1 费 / 抽 1 张；进入赛点后抽牌 +1、回费 +2（平衡性调整）。
    const lightGain = state.matchPoint ? 3 : 1
    const drawN = state.matchPoint ? 2 : 1
    u.light = Math.min(LIGHT_MAX, u.light + lightGain)
    events.push({ type: 'log', text: `${u.name} 回合结算：光芒 +${lightGain}${state.matchPoint ? '（赛点回费 +2）' : ''}，抽牌 ${drawN} 张${state.matchPoint ? '（赛点抽牌 +1）' : ''}`, cls: 'g' })
    events.push({ type: 'light', target: u.side, n: lightGain, src: 'settle' })
    drawCards(u, drawN, state.rng, events)
    if (u.confusedTurns > 0) {
      u.confusedTurns--
      if (u.confusedTurns === 0) {
        u.stagger = u.staggerMax
        events.push({ type: 'log', text: `${u.name} 从混乱中恢复，混乱条回满`, cls: 'g' })
      }
    }
  }
}

/**
 * 执行整个战斗阶段：按速度值从高到低依次行动，然后结算。
 * 同步计算终态，返回完整事件序列（含战败判定）。
 */
export function resolveBattle(state: BattleState): GameEvent[] {
  const events: GameEvent[] = []
  if (state.winner) return events

  triggerFx(state.ally, '战斗开始', state, events)
  triggerFx(state.enemy, '战斗开始', state, events)

  const acts: Array<{ unit: SimUnit; die: SpeedDie; idx: number; side: 'ally' | 'enemy' }> = []
  for (const side of ['ally', 'enemy'] as const) {
    const u = side === 'ally' ? state.ally : state.enemy
    u.speedDice.forEach((die, idx) => acts.push({ unit: u, die, idx, side }))
  }
  acts.sort((a, b) => b.die.value - a.die.value || (a.side === 'ally' ? -1 : 1) || a.idx - b.idx)

  for (const act of acts) {
    if (state.ally.hp <= 0 || state.enemy.hp <= 0) break
    performAction(state, act.unit, act.die, act.idx, events)
  }

  if (state.ally.hp <= 0 || state.enemy.hp <= 0) {
    state.bothDead = state.ally.hp <= 0 && state.enemy.hp <= 0
    state.winner = state.bothDead ? 'enemy' : state.enemy.hp <= 0 ? 'ally' : 'enemy'
    events.push({ type: 'battleEnd', winner: state.winner, bothDead: state.bothDead, turn: state.turn })
    return events
  }

  settle(state, events)
  state.turn++
  state.rolled = false
  return events
}
