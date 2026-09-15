/**
 * 词条名归一与查表工具（纯函数，不依赖 Pinia/网络，可独立单测）。
 *
 * 两级键的设计：
 * - exactKey（无损）：仅去参数位后缀与空白，保留【】（）与连字符——
 *   "咒杀【迅捷】 X层" 与 "咒杀【破】 X层" 必须是两个不同的键，分支词条各归各格式。
 * - baseKey（有损宽容）：沿用历史行为，去【】（）内容、参数位、连字符与全部空白——
 *   让写法有出入的引号词（如 "“易损”" vs 词条 "易损 X层"）也能命中。
 *
 * 查表优先级：exact → loose → （调用方的）组合解析。
 * loose 槽位规则：独立词条（exactKey === looseKey）优先占槽，独立词条之间后写覆盖；
 * 非（带【】的分支）词条只在槽位为空时占位——保证裸 "咒杀" 永远命中独立词条而非最新分支。
 */

/** 参数位后缀：X层/X点/X次/X颗/X滴/X回合/X级/X张/X时/X年/X月/X日。 */
export const PARAM_SUFFIX = /\s*X(层|点|次|颗|滴|回合|级|张|时|年|月|日)\s*$/

/** 宽松键：历史 baseKey 行为原样保留。 */
export function baseKey(name: string): string {
  return name
    .trim()
    .replace(/【[^】]*】/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/^\d+(层|点|次|颗|滴|回合|级|张|时|年|月|日)?/, '')
    .replace(PARAM_SUFFIX, '')
    .replace(/[—_]/g, '')
    .replace(/\s+/g, '')
}

/** 精确键：去参数位后缀与全部空白，保留【】（）与连字符。 */
export function exactKey(name: string): string {
  return name.trim().replace(PARAM_SUFFIX, '').replace(/\s+/g, '')
}

const BASE_CACHE = new Map<string, string>()
export function baseKeyCached(name: string): string {
  const hit = BASE_CACHE.get(name)
  if (hit !== undefined) return hit
  const key = baseKey(name)
  if (BASE_CACHE.size > 5000) BASE_CACHE.clear()
  BASE_CACHE.set(name, key)
  return key
}

const EXACT_CACHE = new Map<string, string>()
export function exactKeyCached(name: string): string {
  const hit = EXACT_CACHE.get(name)
  if (hit !== undefined) return hit
  const key = exactKey(name)
  if (EXACT_CACHE.size > 5000) EXACT_CACHE.clear()
  EXACT_CACHE.set(name, key)
  return key
}

export interface LookupMaps<T> {
  exact: Map<string, T>
  loose: Map<string, T>
}

/** 由词条列表建两级查表（规则见文件头注释）。 */
export function buildLookupMaps<T extends { name: string }>(entries: readonly T[]): LookupMaps<T> {
  const exact = new Map<string, T>()
  const loose = new Map<string, T>()
  for (const e of entries) {
    const ek = exactKeyCached(e.name)
    if (ek) exact.set(ek, e)
    const lk = baseKeyCached(e.name)
    if (!lk) continue
    const cur = loose.get(lk)
    if (!cur) {
      loose.set(lk, e)
      continue
    }
    const curStandalone = exactKeyCached(cur.name) === lk
    const eStandalone = ek === lk
    // 独立词条覆盖一切；非独立只在槽位同为非独立（或为空）时后写覆盖
    if (eStandalone || !curStandalone) loose.set(lk, e)
  }
  return { exact, loose }
}

/**
 * 私人词条匹配：
 * 1) 全等；
 * 2) exactKey 相等（保留【】分支名，忽略参数位/空白）；
 * 3) 宽松兜底——仅适用于「私有名不含【/（」的词条（私有名的括号决定作用域：
 *    带【】 = "只指定该分支"，不得染到同族其他写法；引号词带不带括号均放行）。
 */
export function matchPrivateTerm<T extends { name: string }>(q: string, terms: readonly T[]): T | undefined {
  const qt = q.trim()
  for (const p of terms) {
    if (p.name.trim() === qt) return p
  }
  const qExact = exactKeyCached(q)
  for (const p of terms) {
    if (exactKeyCached(p.name) === qExact) return p
  }
  const qLoose = baseKeyCached(q)
  for (const p of terms) {
    if (/[【（]/.test(p.name)) continue
    if (baseKeyCached(p.name) === qLoose) return p
  }
  return undefined
}
