/**
 * 遗迹图书馆 · 迎书楼战斗模拟器 v1（运行时类型）
 *
 * 这是「接待与战斗第一版」定稿口径下的战斗模拟器运行时数据模型。
 * 与编辑器侧的 `LibrarianSheet` / `BattleCard`（index.ts）不同：
 * 这里描述的是"引擎真正执行"的简化结构——只保留硬数值与五条例外效果，
 * 词条/被动/EGO/理智等第一版整体不做的内容一律不进入本模型。
 *
 * 规则权威依据：《接待与战斗第一版》 + 《接待与战斗第一版-疑难解答》定稿口径。
 */

import type { BattleCard } from '../index.js'

/** 骰子攻击类型（近战三类 + 两类防御）。 */
export type SimDieKind = '斩击' | '突刺' | '打击' | '招架' | '闪避'

/** 一张可执行骰子（已结构化：类型 + min~max 区间）。 */
export interface SimDie {
  kind: SimDieKind
  min: number
  max: number
}

/** 卡牌效果时机（第一版只保留三种触发时机前缀）。 */
export type SimFxTiming = '使用时' | '战斗开始' | '战斗结束'

/** 卡牌效果类型（第一版只保留「抽取 X 张」「恢复 X 点光芒」两类）。 */
export type SimFxKind = 'draw' | 'light'

/** 一条可执行效果。 */
export interface SimFx {
  timing: SimFxTiming
  kind: SimFxKind
  n: number
}

/** 一张可执行战斗卡。 */
export interface SimCard {
  /** 原始展示数据，仅供卡面渲染；战斗执行仍只读取下方的简化字段。 */
  display: BattleCard
  costLabel: string
  name: string
  cost: number
  /** 原始 type（近战/远程/法术/…）仅用于显示，结算一律按近战。 */
  type: string
  dice: SimDie[]
  fx: SimFx[]
  /** [消耗] 标签：结算后进消耗区而非弃牌堆。 */
  exhaust: boolean
  /**
   * 兜底规则标记：原本"无骰子且无可执行效果"的卡被补成
   * 「使用时 恢复 1 点光芒并抽取 1 张卡牌，[消耗]」。
   * 卡面需显示「无骰子 · 不参与拼点」与被补上的效果，让玩家看得出这是兜底。
   */
  autoFx: boolean
}

/** 单颗速度骰（每回合投出的运行时状态）。 */
export interface SpeedDie {
  value: number
  /** 装备的卡牌；null = 未装备（按兵不动）。 */
  card: SimCard | null
  /** 指向的敌方速度骰下标；null = 未指定（按兵不动）。 */
  target: number | null
  /** 本回合已结算（不再参与后续行动）。 */
  consumed: boolean
}

/** 一方战斗单位。 */
export interface SimUnit {
  side: 'ally' | 'enemy'
  id: number
  name: string
  title: string
  /** 立绘路径（/art/... 最终显示路径）。 */
  portrait: string
  /** 所属楼层 id（用于结算页「了解详情」跳转到楼层司书预览）。 */
  floorId: number | null
  hp: number
  hpMax: number
  stagger: number
  staggerMax: number
  resistPhysic: Record<'斩击' | '突刺' | '打击', number>
  resistChaos: Record<'斩击' | '突刺' | '打击', number>
  speedMin: number
  speedMax: number
  deck: SimCard[]
  hand: SimCard[]
  discard: SimCard[]
  exhaust: SimCard[]
  /** 光芒（费用），上限 4，开局满。 */
  light: number
  speedDice: SpeedDie[]
  /** 混乱剩余持续回合数；0 = 未混乱。混乱期间抗性按 1.5、无法行动/装备。 */
  confusedTurns: number
}

/** 事件（引擎输出给视图播放的最小原子）。 */
export type GameEvent =
  | { type: 'log'; text: string; cls?: string }
  | { type: 'damage'; target: 'ally' | 'enemy'; hp: number; stagger: number; dieKind: SimDieKind; roll: number; label: string }
  | { type: 'confusion'; target: 'ally' | 'enemy' }
  | { type: 'light'; target: 'ally' | 'enemy'; n: number; src: 'fx' | 'settle' }
  | { type: 'clashStart'; allyCard: SimCard; enemyCard: SimCard }
  | { type: 'clashBeat'; index: number; ally: { kind: SimDieKind; roll: number } | null; enemy: { kind: SimDieKind; roll: number } | null; winner: 'ally' | 'enemy' | null; note: string }
  | { type: 'clashEnd' }
  | { type: 'soloStart'; side: 'ally' | 'enemy'; card: SimCard; target: 'ally' | 'enemy' }
  | { type: 'soloBeat'; die: SimDie; roll: number }
  | { type: 'soloEnd' }
  | { type: 'turnSplash'; text: string }
  | { type: 'turnStart'; turn: number }
  | { type: 'battleEnd'; winner: 'ally' | 'enemy'; bothDead: boolean; turn: number }

/** 随机源（可注入，测试时注入定值序列）。 */
export interface Rng {
  /** 均匀整数 [min, max]（闭区间）。 */
  int(min: number, max: number): number
  /** 从数组随机取一元素。 */
  pick<T>(arr: readonly T[]): T
  /** 洗牌（原地）。 */
  shuffle<T>(arr: T[]): T[]
}
