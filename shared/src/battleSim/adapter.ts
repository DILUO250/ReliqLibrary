/**
 * 遗迹图书馆 · 迎书楼战斗模拟器 v1（卡牌适配器）
 *
 * 把编辑器侧的 `LibrarianSheet.cards.combat`（自由文本效果）转成引擎可执行的
 * `SimCard`。第一版定稿口径（《疑难解答》第 20 条）：
 *   - 只提取硬数值（name / cost / dice 的 min~max）；
 *   - 效果只保留三类触发时机前缀 + 两条动作正则，其余全部忽略；
 *   - 无骰子且无可执行效果的卡补兜底效果（autoFx）。
 *
 * 兜底规则（《疑难解答》A1/A2）：
 *   - 战斗卡超过 9 张截前 9 张；0 张不可选入。
 */

import type { BattleCard, Dice, Librarian, LibrarianSheet } from '../index.js'
import { parseSheet } from '../index.js'
import type { SimCard, SimDie, SimDieKind, SimFx, SimFxTiming } from './types.js'

/** 战斗卡牌数量上限（LOB 牌组容量口径；超出截前 9 张）。 */
export const SIM_DECK_LIMIT = 9

/* ---------- 骰子类型归一 ---------- */

const DIE_KINDS: ReadonlySet<string> = new Set(['斩击', '突刺', '打击', '招架', '闪避'])

function toDieKind(t: string): SimDieKind | null {
  // 第一版：近战/远程/法术不区分，一律按近战结算；specialType 不处理（按基础类型）。
  return DIE_KINDS.has(t) ? (t as SimDieKind) : null
}

function toSimDie(d: Dice): SimDie | null {
  const kind = toDieKind(d.baseType)
  if (!kind) return null
  const min = Number(d.rangeMin)
  const max = Number(d.rangeMax)
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  // 防御性兜底：区间倒挂时交换，保证 min<=max。
  return { kind, min: Math.min(min, max), max: Math.max(min, max) }
}

/* ---------- 效果白名单 ---------- */

const TIMING_RE = /^(使用时|战斗开始|战斗结束)/
const DRAW_RE = /抽(?:取)?\s*(\d+)\s*张(?:卡牌|书页)/
const LIGHT_RE = /恢复\s*(\d+)\s*点光芒/

function timingOf(text: string): SimFxTiming | null {
  const m = text.match(TIMING_RE)
  if (!m) return null
  return m[1] as SimFxTiming
}

/** 从一条效果文本提取可执行效果（可 0~2 条）。 */
function fxFromText(text: string): SimFx[] {
  const timing = timingOf(text)
  if (!timing) return []
  const out: SimFx[] = []
  const draw = text.match(DRAW_RE)
  if (draw && draw[1]) {
    const n = Number(draw[1])
    if (Number.isFinite(n) && n > 0) out.push({ timing, kind: 'draw', n })
  }
  const light = text.match(LIGHT_RE)
  if (light && light[1]) {
    const n = Number(light[1])
    if (Number.isFinite(n) && n > 0) out.push({ timing, kind: 'light', n })
  }
  return out
}

/* ---------- 卡牌转换 ---------- */

export interface AdaptedCard extends SimCard {
  /** 被忽略的效果文本条数（用于后续判断哪些卡值得二期补内容）。 */
  ignoredFx: number
}

function adaptCard(c: BattleCard, costLabel: string): AdaptedCard {
  const dice: SimDie[] = []
  for (const d of c.dice ?? []) {
    const sd = toSimDie(d)
    if (sd) dice.push(sd)
  }
  const fx: SimFx[] = []
  let ignoredFx = 0
  for (const text of c.effects ?? []) {
    const got = fxFromText(text)
    if (got.length) fx.push(...got)
    else ignoredFx++
  }
  // [消耗] 标签：自由文本 tags 里含「消耗」即视为消耗卡（结算后进消耗区）。
  const exhaust = (c.tags ?? []).some((t) => t.includes('消耗'))
  let autoFx = false
  // 兜底规则：无骰子且无可执行效果 → 补「使用时 恢复 1 点光芒并抽取 1 张卡牌，[消耗]」。
  if (dice.length === 0 && fx.length === 0) {
    fx.push({ timing: '使用时', kind: 'light', n: 1 })
    fx.push({ timing: '使用时', kind: 'draw', n: 1 })
    autoFx = true
  }
  return {
    display: c,
    costLabel,
    name: c.name ?? '',
    cost: Number(c.cost) || 0,
    type: c.type ?? '',
    dice,
    fx,
    exhaust: exhaust || autoFx,
    autoFx,
    ignoredFx,
  }
}

/** 把整组战斗卡转为可执行卡牌（截前 SIM_DECK_LIMIT 张）。 */
export function adaptDeck(cards: readonly BattleCard[], costLabel = '费用'): SimCard[] {
  return cards.slice(0, SIM_DECK_LIMIT).map((card) => adaptCard(card, costLabel))
}

/* ---------- 入选过滤（filterBattleReady） ---------- */

/** 过滤后可用于对战的司书（含已解析 sheet 的轻量视图）。 */
export interface BattleReadyLibrarian {
  id: number
  name: string
  title: string
  floorId: number | null
  sortOrder: number
  portrait: string
  /** 楼层标签页用的裁剪预览立绘（选人网格用它的上半段，避免原始立绘尺寸不统一）。 */
  portraitPreview: string
  sheet: LibrarianSheet
  /** 战斗卡已截断为上限。 */
  cards: SimCard[]
  hp: number
  stagger: number
  speedMin: number
  speedMax: number
  resistPhysic: Record<'斩击' | '突刺' | '打击', number>
  resistChaos: Record<'斩击' | '突刺' | '打击', number>
}

function resistOf(
  resist: { physic?: { slash?: unknown; pierce?: unknown; strike?: unknown }; chaos?: { slash?: unknown; pierce?: unknown; strike?: unknown } } | undefined,
): { physic: Record<'斩击' | '突刺' | '打击', number>; chaos: Record<'斩击' | '突刺' | '打击', number> } {
  const pick = (r: { slash?: unknown; pierce?: unknown; strike?: unknown } | undefined): Record<'斩击' | '突刺' | '打击', number> => ({
    斩击: Number(r?.slash) || 1,
    突刺: Number(r?.pierce) || 1,
    打击: Number(r?.strike) || 1,
  })
  return { physic: pick(resist?.physic), chaos: pick(resist?.chaos) }
}

/**
 * 入选过滤（纯函数，不读写任何模块级状态）。
 *
 * 口径（与楼层编辑器 FloorDeck.vue 的「常规司书 / 附加单位」分组一致）：
 *   1. department === 'turris'（模拟器只做迎书楼司书）；
 *   2. rarity 为空（带稀有度前缀的是楼层附加单位，不进战斗池）；
 *   3. sheet.battleSystem 为 base 或 lob；
 *   4. cards.combat.length > 0（0 张卡无法对战）；
 *   5. 战斗卡超过 9 张截前 9 张；
 *   6. portrait 非空（战斗画面必须有立绘）；
 *   7. hp > 0（体力为 0 视为不可出战）。
 */
export function filterBattleReady(librarians: readonly Librarian[]): BattleReadyLibrarian[] {
  const out: BattleReadyLibrarian[] = []
  for (const l of librarians) {
    if (l.department !== 'turris') continue
    if (l.rarity) continue
    if (!l.portrait) continue
    const sheet = parseSheet(l.sheet)
    if (!sheet) continue
    if (sheet.battleSystem !== 'base' && sheet.battleSystem !== 'lob') continue
    const combat = sheet.cards?.combat ?? []
    if (combat.length === 0) continue
    if (sheet.hp <= 0) continue
    const resist = resistOf(sheet.resist)
    out.push({
      id: l.id,
      name: l.name,
      title: l.title ?? '',
      floorId: l.floorId,
      sortOrder: l.sortOrder,
      portrait: l.portrait,
      portraitPreview: l.portraitPreview ?? '',
      sheet,
      cards: adaptDeck(combat, sheet.battleSystem === 'lob' ? '光芒' : '费用'),
      hp: sheet.hp,
      stagger: sheet.stagger,
      speedMin: sheet.speedMin,
      speedMax: sheet.speedMax,
      resistPhysic: resist.physic,
      resistChaos: resist.chaos,
    })
  }
  return out
}
