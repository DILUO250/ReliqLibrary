/**
 * 遗迹图书馆 · 共享领域类型
 * 前后端共用的一份领域模型定义。
 */

import { MECHANICS_TEXT, MECHANICS_IMAGES } from './battleMechanics.js'

export type DepartmentId = 'turris' | 'armarium' | 'collegium' | 'director'

export type PermissionLevel = 'A' | 'B' | 'C' | 'D'

export type AnomalyLevel = 'safe' | 'euclid' | 'keter'

export type AnomalySubLevel =
  | 'safe-stable'
  | 'safe-neutralized'
  | 'safe-explained'
  | 'euclid-mystery'
  | 'euclid-thaumiel'
  | 'keter-zayin'
  | 'keter-teth'
  | 'keter-he'
  | 'keter-waw'
  | 'keter-aleph'

export type AnomalyStatus =
  | 'discovered'
  | 'assessing'
  | 'contained'
  | 'researching'
  | 'extracted'
  | 'neutralized'
  | 'escaped'

export type SpaceLevel = 'safe' | 'euclid' | 'keter'

export type SpaceSubLevel =
  | 'safe-logos'
  | 'safe-neutralized'
  | 'safe-soma'
  | 'euclid-nexus'
  | 'euclid-thaumiel'
  | 'keter-naama'
  | 'keter-tg'
  | 'keter-golach'
  | 'keter-exe'
  | 'keter-samael'

export type SpaceStatus = 'discovered' | 'assessing' | 'controlled' | 'harvesting' | 'breached'

export type RepositoryType = 'entity' | 'life' | 'nature' | 'page'

export type PageType = 'combat' | 'abnormality' | 'ego'

export type CardType = 'tool' | 'trinket' | 'consumable' | 'skill' | 'tag'

export type PackType = 'standard' | 'advanced' | 'special'

export type GuestStatus = 'invited' | 'receiving' | 'converted' | 'survived' | 'withdrawn'

export type FactionType = 'hostile' | 'neutral' | 'special'

export type CorePageColor = 'red' | 'blue' | 'green' | 'gold' | 'neutral'

export type BattleSystemId = 'base' | 'lob' | 'pkm' | 'rhd'

export type ResistValue = 0.5 | 1.0 | 1.5

export interface ResistProfile {
  slash: ResistValue
  pierce: ResistValue
  strike: ResistValue
}

export interface ResistSet {
  physic: ResistProfile
  chaos: ResistProfile
}

export interface Dice {
  baseType: string
  specialType: string
  rangeMin?: number
  rangeMax?: number
  /** 命中时效果列表（每颗骰子至多 3 条）。 */
  effects: string[]
  /** @deprecated 旧版单条命中效果；加载旧数据时迁移进 `effects`。 */
  effect?: string
  /** @deprecated 旧版合并数值（如 "4-8"）；加载旧数据时迁移进 `rangeMin`/`rangeMax`。 */
  range?: string
}

export interface BattleHope {
  count: number
  cost: string
  effect: string
}

export interface BattleCard {
  prefix?: string
  name: string
  cost: number
  type: string
  tags: string[]
  effects: string[]
  dice: Dice[]
  /** 望机制（SHM 卡牌专属）：最多触发次数 | 每次触发消耗 | 每次触发后效果。 */
  hope?: BattleHope
  /** 卡牌属性（PKM/BASE 模板开放显示）：宝可梦属性名，如「火」。 */
  attr?: string
}

export interface TermFormat {
  color: string
  bold: boolean
  italic: boolean
  underline: 'none' | 'thin' | 'thick' | 'double'
  bgColor?: string
}

export interface Passive {
  name: string
  effect: string
}

export interface Mechanism {
  name: string
  stack: string
  type: string
  desc: string
  format?: TermFormat
}

export interface CardDeck {
  combat: BattleCard[]
  special: BattleCard[]
  ego?: BattleCard[]
  /** RHD 模组区卡牌（定位同 LOB 的 EGO 栏）。 */
  modules?: BattleCard[]
  /** PKM 宝可梦能量区卡牌。 */
  energy?: BattleCard[]
}

export interface MindBuff {
  name: string
  effect: string
  format?: TermFormat
}

/* ============================================================
 * 情感书页（LOB 系统楼层专属，与楼层绑定）
 * 结构：<异常实体> → 1~9 张情感书页 → EGO卡牌（含 EGO被动）
 * 书页/EGO 以 JSON 存于 emotion_entities.sheet 列（见 CONVENTIONS §1.3）。
 * ========================================================== */

/** 一张情感书页。cost 为自由文本（如「正面Ⅰ」「负面Ⅱ」「正面Ⅱ/负面Ⅱ」）。 */
export interface EmotionPage {
  name: string
  cost: string
  effect: string
  /** ▪️ 特殊机制（0~n 条）：与司书 Mechanism 同构，机制名纳入实体私人词典参与渲染。 */
  mechanisms: Mechanism[]
}

/** EGO被动：每张 EGO 卡牌各带一条。 */
export interface EgoPassive {
  name: string
  effect: string
}

/** EGO卡牌：格式与常规战斗卡牌一致，额外补充 EGO被动。 */
export interface EgoCard extends BattleCard {
  egoPassive?: EgoPassive
}

export interface EmotionSheet {
  pages: EmotionPage[]
  egoCards: EgoCard[]
}

export const EMOTION_PAGE_MAX = 9

export function emptyEmotionSheet(): EmotionSheet {
  return {
    pages: [{ name: '', cost: '', effect: '', mechanisms: [] }],
    egoCards: [
      {
        name: '',
        cost: 0,
        type: '',
        tags: [],
        effects: [],
        dice: [],
        egoPassive: { name: '', effect: '' },
      },
    ],
  }
}

export function emptyEmotionPage(): EmotionPage {
  return { name: '', cost: '', effect: '', mechanisms: [] }
}

export function emptyEgoCard(): EgoCard {
  return {
    name: '',
    cost: 0,
    type: '',
    tags: [],
    effects: [],
    dice: [],
    egoPassive: { name: '', effect: '' },
  }
}

/** 容错解析 emotion_entities.sheet JSON；空/坏数据返回 null。 */
export function parseEmotionSheet(raw?: string | null): EmotionSheet | null {
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as Partial<EmotionSheet>
    const pages = (Array.isArray(s.pages) ? s.pages : []).map(
      (p): EmotionPage => ({
        name: p?.name ?? '',
        cost: p?.cost ?? '',
        effect: p?.effect ?? '',
        // 兼容旧版 string[] 机制：迁移为 Mechanism 结构
        mechanisms: (Array.isArray(p?.mechanisms) ? p.mechanisms : []).map((m): Mechanism =>
          typeof m === 'string'
            ? { name: '', stack: '', type: '', desc: m }
            : {
                name: m?.name ?? '',
                stack: m?.stack ?? '',
                type: m?.type ?? '',
                desc: m?.desc ?? '',
                format: m?.format,
              },
        ),
      }),
    )
    const egoCards = (Array.isArray(s.egoCards) ? s.egoCards : []).map((c): EgoCard => ({
      ...c,
      tags: Array.isArray(c?.tags) ? c.tags : [],
      effects: Array.isArray(c?.effects) ? c.effects : [],
      dice: Array.isArray(c?.dice) ? c.dice : [],
      egoPassive: c?.egoPassive ?? { name: '', effect: '' },
    }))
    for (const c of egoCards) normalizeCard(c)
    return { pages, egoCards }
  } catch {
    return null
  }
}

/** 情感书页数量标签（如「书页 3 · EGO 1」用）。 */
export function emotionPageCount(entity: { sheet: string }): number {
  return parseEmotionSheet(entity.sheet)?.pages.length ?? 0
}

export function emotionEgoCount(entity: { sheet: string }): number {
  return parseEmotionSheet(entity.sheet)?.egoCards.length ?? 0
}

export interface LibrarianSystemData {
  hasSanity?: boolean
  hasEgo?: boolean
  hasMind?: boolean
  egoManifest?: string
  distortionName?: string
  mind?: MindBuff
  sanityMin?: number
  sanityMax?: number
  /** 理智值增加条件 */
  sanityGainCond?: string
  /** 理智值减少 */
  sanityLossCond?: string
  panicType?: string
  panicLow?: string
  panicPanic?: string
  /** PKM 单位属性：两个槽位的原始选择（PKM_TYPES 值；'无属性' = 该槽未选；显示时过滤）。 */
  attributes?: string[]
  /** PKM 对战形态：MEGA 进化形态名（如「超级喷火龙X」；留空 = 无 MEGA 形态）。 */
  megaForm?: string
  /** PKM 对战形态：专属 Z 招式名（留空 = 无 Z 招式）。 */
  zMove?: string
  /** PKM 对战形态：超极巨化形态名（留空 = 仅普通极巨化）。 */
  gmaxForm?: string
  /** PKM 对战形态：太晶属性（PKM_TYPES 值；'无属性' = 未太晶化）。 */
  teraType?: string
  /** RHD 职业（RHD_CLASSES 的 name，空串 = 未选择）。 */
  profession?: string
  /** RHD 元素损伤上限（默认 100）。 */
  elementDamage?: number
  /** PKM 奇迹能量种类（预留）。 */
  energyTypes?: string[]
  /** PKM 每名训练师可召唤的宝可梦数量（预留）。 */
  summonCapacity?: number
  /** RHD 已消耗部署点数（预留）。 */
  deploy?: number
  /** RHD 精英化阶段（0~2，预留）。 */
  elite?: number
}

export interface LibrarianSheet {
  battleSystem: BattleSystemId
  romanNum: string
  name: string
  hp: number
  stagger: number
  sanity: number
  speedMin: number
  speedMax: number
  resist: ResistSet
  factions: string[]
  faction: string
  passives: Passive[]
  mechanisms: Mechanism[]
  cards: CardDeck
  systemData?: LibrarianSystemData
}

export function emptySheet(battleSystem: BattleSystemId = 'base'): LibrarianSheet {
  return {
    battleSystem,
    romanNum: 'NaN',
    name: '',
    hp: 50,
    stagger: 30,
    sanity: 0,
    speedMin: 5,
    speedMax: 6,
    resist: {
      physic: { slash: 1.0, pierce: 1.0, strike: 1.0 },
      chaos: { slash: 1.0, pierce: 1.0, strike: 1.0 },
    },
    factions: [],
    faction: '',
    passives: [defaultSpeedPassive(battleSystem)],
    mechanisms: [],
    cards: { combat: [], special: [], ego: [], modules: [], energy: [] },
    systemData:
      battleSystem === 'rhd'
        ? { elementDamage: 100, profession: '' }
        : battleSystem === 'pkm'
          ? { attributes: ['无属性', '无属性'], teraType: '无属性' }
          : {},
  }
}

export function toCode(id: BattleSystemId): string {
  return BATTLE_SYSTEMS[id]?.code ?? id.toUpperCase()
}

/** 骰子命中时效果列表；兼容旧 `effect` 单条字段。 */
export function diceEffects(d: Dice): string[] {
  return Array.isArray(d.effects) ? d.effects : d.effect ? [d.effect] : []
}

/** 骰子数值标签（"min-max"）；兼容旧 `range` 字符串。 */
export function diceRangeLabel(d: Dice): string {
  const mn = Number(d.rangeMin)
  const mx = Number(d.rangeMax)
  const hasMn = d.rangeMin != null && String(d.rangeMin).trim() !== ''
  const hasMx = d.rangeMax != null && String(d.rangeMax).trim() !== ''
  if (hasMn && hasMx && Number.isFinite(mn) && Number.isFinite(mx)) return `${mn}-${mx}`
  if (d.range) return d.range
  return ''
}

/** 归一化骰子数据：把旧 `effect`/`range` 字段迁移进 `effects`/`rangeMin`/`rangeMax`。 */
export function normalizeDice(d: Dice): void {
  if (!Array.isArray(d.effects)) d.effects = d.effect ? [d.effect] : []
  delete d.effect
  if ((d.rangeMin == null || d.rangeMax == null) && d.range) {
    const m = String(d.range).trim().match(/^(\d+)\s*-\s*(\d+)$/)
    if (m && m[1] && m[2]) {
      const mn = Number(m[1])
      const mx = Number(m[2])
      if (Number.isFinite(mn)) d.rangeMin = mn
      if (Number.isFinite(mx)) d.rangeMax = mx
    }
  }
  delete d.range
}

/** 归一化战斗卡牌：把旧 `【望】：a | b | c` 单条字符串迁移进 `hope` 字段，并从效果列表移除。 */
export function normalizeCard(c: BattleCard): void {
  if (!Array.isArray(c.effects)) c.effects = []
  for (const d of c.dice ?? []) normalizeDice(d)
  if (c.hope) return
  const i = c.effects.findIndex((e) => /^【望】：/.test(e))
  if (i < 0) return
  const effStr = c.effects[i]
  if (effStr == null) return
  const m = effStr.match(/^【望】：(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/)
  if (!m) return
  const first = m[1]
  const second = m[2]
  const third = m[3]
  if (first == null || second == null || third == null) return
  const count = parseInt(first, 10)
  c.hope = {
    count: Number.isFinite(count) ? count : 0,
    cost: second.trim(),
    effect: third.trim(),
  }
  c.effects.splice(i, 1)
}

export function parseSheet(raw?: string | null): LibrarianSheet | null {
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as LibrarianSheet
    if (s.passives) {
      s.passives = s.passives.map((p) =>
        typeof p === 'string' ? { name: '', effect: p } : p,
      )
    }
    s.cards = s.cards ?? { combat: [], special: [] }
    s.cards.special = s.cards.special ?? []
    s.cards.ego = s.cards.ego ?? []
    s.cards.modules = s.cards.modules ?? []
    s.cards.energy = s.cards.energy ?? []
    // 五个卡组区全量归一化——modules(RHD 模组)/energy(PKM 能量) 曾被漏掉，
    // 旧格式卡牌（effect 单条、【望】：字符串）在这些区不会被规范化
    for (const list of [s.cards.combat, s.cards.special, s.cards.ego, s.cards.modules, s.cards.energy]) {
      for (const c of list) normalizeCard(c)
    }
    s.systemData = s.systemData ?? {}
    if (s.systemData.mind != null && typeof s.systemData.mind === 'string') {
      s.systemData.mind = { name: '心-[未命名]', effect: s.systemData.mind }
    }
    return s
  } catch {
    return null
  }
}

const ROMAN: Array<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function toRoman(n: number): string {
  let num = Math.floor(n)
  if (!Number.isFinite(num) || num < 1) return ''
  if (num > 3999) num = 3999
  let out = ''
  for (const [v, r] of ROMAN) {
    while (num >= v) {
      out += r
      num -= v
    }
  }
  return out
}

/** 系统六维属性评分（1~5，用于战斗系统页雷达图）。 */
export interface BattleSystemMetrics {
  /** 进攻性 */
  offense: number
  /** 防守性 */
  defense: number
  /** 速度线 */
  speed: number
  /** 资源循环 */
  resource: number
  /** 成长上限 */
  growth: number
  /** 上手门槛（1=极易上手，5=门槛高） */
  learning: number
}

/** 基础数值表的一行。 */
export interface BattleStatRow {
  label: string
  value: string
}

/** 基础数值表：多模板系统（PKM 训练师|宝可梦、RHD 信标|其他单位）为多张表。 */
export interface BattleStatTable {
  /** 表头标题（双列模板如「训练师 | 宝可梦」；可省略）。 */
  title?: string
  rows: BattleStatRow[]
}

/** 卡组区 id：combat/special 为通用模板区，其余为系统专属区。 */
export type DeckZoneId = 'combat' | 'special' | 'ego' | 'modules' | 'energy'

/** 卡组区配置：编辑器与预览按各系统的 deckZones 渲染卡牌区。 */
export interface DeckZoneInfo {
  key: DeckZoneId
  label: string
  hint?: string
}

/** 楼层子模块 id：librarians/extras 为通用区，emotions 为 LOB 专属，reserved 为预留占位。 */
export type FloorTabId = 'librarians' | 'extras' | 'emotions' | 'reserved'

/** 楼层子模块配置：FloorDeck 按各系统的 floorTabs 渲染楼层卡下的二级菜单。 */
export interface FloorTabInfo {
  key: FloorTabId
  label: string
  icon: string
  hint?: string
}

/** RHD 职业定义。 */
export interface BattleProfession {
  emoji: string
  name: string
  desc: string
}

/** RHD 的 10 个职业（每场战斗必须 1 名信标 + 最多 12 名不同职业单位）。 */
export const RHD_CLASSES: BattleProfession[] = [
  { emoji: '☀', name: '信标', desc: '保护目标；拥有独立数值模板、独立卡组容量，信标存活带来正面收益' },
  { emoji: '🚩', name: '先锋', desc: '前期开场单位，能够恢复“部署费用”与卡牌回转' },
  { emoji: '🗡', name: '近卫', desc: '近战输出单位，能够叠加物理异常与法术异常' },
  { emoji: '🪄', name: '术士', desc: '法术远程输出单位，能够叠加法术异常' },
  { emoji: '🏹', name: '狙击', desc: '物理远程输出单位，能够叠加物理异常' },
  { emoji: '🛡', name: '重装', desc: '承伤单位，能够吸引敌方火力并承受大量压力' },
  { emoji: '⚕️', name: '医疗', desc: '治疗单位，能够恢复我方单位体力、技力与卡牌回转' },
  { emoji: '🔩', name: '辅助', desc: '辅助单位，能够恢复我方单位体力并带来拐力' },
  { emoji: '🎾', name: '特种', desc: '特殊单位，技能组不定与攻击方式不定，上下限差距大' },
  { emoji: '🍴', name: '突击', desc: '输出终端单位，能够消耗敌方的物理异常与法术异常造成大量伤害' },
]

/** RHD 职业的展示行（「🗡近卫：近战输出单位，…」）。 */
export function professionLabel(name: string): string {
  const c = RHD_CLASSES.find((p) => p.name === name)
  return c ? `${c.emoji}${c.name}：${c.desc}` : name
}

/** PKM 属性选项：无属性 + 18 种宝可梦属性（与机制词条分组同名）。 */
const PKM_TYPE_GROUPS: string[] = [
  '一般', '格斗', '飞行', '毒', '地面', '岩石', '虫', '幽灵', '钢',
  '火', '水', '草', '电', '超能', '冰', '龙', '恶', '妖精',
]

/** PKM 属性选择器的 19 个选项。 */
export const PKM_TYPES: string[] = ['无属性', ...PKM_TYPE_GROUPS]

/** PKM 单位属性显示规则：全无属性=训练师（隐藏属性栏）；1 有 1 无=单属性；2 有=双属性。 */
export function pkmAttributeDisplay(attributes?: string[]): string[] {
  return (attributes ?? []).filter((t) => t && t !== '无属性')
}

export interface BattleSystemInfo {
  id: BattleSystemId
  zh: string
  code: string
  desc: string
  costLabel: string
  costCap: number
  regen: number
  speedDice: number
  handLimit: number
  draw: number
  deckLimit: number
  keepHand: boolean
  /** 额外卡牌区描述（如 LOB 的 EGO 栏）；缺省表示未录入。 */
  extraDeckZone?: string
  /** 队伍容量（单场接待的常规上阵人数）。 */
  teamCapacity?: string
  /** 卡组区配置：编辑器/预览按此渲染（combat+special 为通用区，其余系统专属）。 */
  deckZones: DeckZoneInfo[]
  /** 楼层子模块配置：楼层卡下的二级菜单按此渲染（librarians/extras 通用，emotions=LOB，其余系统预留）。 */
  floorTabs: FloorTabInfo[]
  /** 卡牌前缀白名单（cardPrefixes 的 name）。 */
  cardPrefixes: string[]
  /** 被动名称可用前缀（如 RHD 的 ELIT1. ELIT2.）。 */
  passivePrefixes?: string[]
  /** 基础数值表（多模板系统为多张表；缺省时由扁平字段拼单表）。 */
  statTables?: BattleStatTable[]
  /** 机制说明（多行文本，战斗系统页展示）。 */
  mechanicsDesc?: string
  /** 机制说明表格图片（/art/turris/systems/ 下文件路径）。 */
  mechanicsImages?: string[]
  /** 六维属性评分（雷达图数据）。 */
  metrics?: BattleSystemMetrics
  /** 系统优势描述。 */
  pros?: string
  /** 系统劣势描述。 */
  cons?: string
  /** 系统固定被动「速战速决」的模板变体（第 1 条被动）。未定义时回退为单条默认。 */
  speedPassives?: Passive[]
}

export type LibrarianRole =
  | 'curator'
  | 'librarian'
  | 'seeker'
  | 'chronicler'
  | 'internal'
  | 'director'

/** 附加单位的稀有度前缀；'' 表示常规司书。 */
export type LibrarianRarity = '' | 'N' | 'R' | 'SR' | 'SSR' | 'RR' | 'UR'

export const RARITIES: ReadonlyArray<Exclude<LibrarianRarity, ''>> = ['N', 'R', 'SR', 'SSR', 'RR', 'UR']

export interface Floor {
  id: number
  name: string
  latinName: string
  code: string
  designation: string
  theme: string
  battleSystem: BattleSystemId
  description: string
  sortOrder: number
  artwork: string
}

/** 情感实体：异常实体名称 + 书页/EGO（JSON）+ 实体编号，隶属楼层。 */
export interface EmotionEntity {
  id: number
  floorId: number | null
  /** 实体编号，如 SCL-88889（可留空）。 */
  code: string
  /** 异常实体名称，如 欢乐泰迪。 */
  name: string
  /** EmotionSheet 的 JSON 字符串。 */
  sheet: string
  sortOrder: number
}

export interface Librarian {
  id: number
  name: string
  title: string
  department: DepartmentId
  role: LibrarianRole
  floorId: number | null
  /** 附加单位稀有度前缀（'' = 常规司书）。 */
  rarity: string
  coreColor: CorePageColor
  affiliation: string
  status: string
  description: string
  sheet: string
  portrait: string
  portraitPreview: string
  sortOrder: number
}

export interface CorePage {
  id: number
  ownerId: number | null
  name: string
  hp: number
  stagger: number
  sanity: number
  passives: string
  mechanics: string
  color: CorePageColor
}

export interface CombatPage {
  id: number
  name: string
  type: PageType
  floorId: number | null
  ownerId: number | null
  cost: number
  power: number
  effect: string
  cooldown: string
}

export interface Book {
  id: number
  title: string
  author: string
  source: string
  type: string
  synopsis: string
  worldId: number | null
}

export interface Anomaly {
  id: number
  code: string
  name: string
  level: AnomalyLevel
  subLevel: AnomalySubLevel
  status: AnomalyStatus
  appearance: string
  containment: string
  appendix: string
  worldId: number | null
  note: string
  /** 异常实体报告单（AnomalyReport 的 JSON 字符串；空串 = 未编辑过）。 */
  report: string
}

/* ---------- 异常实体报告单（SCL 报告单） ----------
 * 格式权威依据：草稿/1.2-藏书阁异常实体报告单/03-异常实体报告单-格式规范.md。
 * 一切列表字段（描述/收容/附录/文件/图片/附件/书页/警告线）条数动态，不设死。 */

/* 警告线锚点（2026-09-18 区间覆盖制改造）：
 * - block:* = 区块级插入点（线渲染在整块之前）；
 * - entry:<区块>:<N> = 条目级插入点（线渲染在该区块第 N 条条目之前，N 从 1 起；
 *   entry:figure 仅 N≥2 有意义——图片1 之前即影像资料标题之后，不单独提供）。
 * - 警告线语义为"区间覆盖制"：每条警告线闭合上一个受限区、开启自己的区，
 *   区间 governed SL = 最新一条警告线；可用插入点由 anomalyWarningAnchors(report)
 *   按文档顺序动态生成（编辑器下拉与渲染器共用同一份）。 */

export type AnomalyWarningBlockKey = 'head' | 'desc' | 'contain' | 'output' | 'figure-main'
export type AnomalyWarningEntryBlockKey = 'appendix' | 'files' | 'figure' | 'attachment'
export type AnomalyWarningAnchor =
  | `block:${AnomalyWarningBlockKey}`
  | `entry:${AnomalyWarningEntryBlockKey}:${number}`

/** 权限警告线：分割线，该线之下直到下一条警告线（或报告结尾）的内容需 sl 等级权限。 */
export interface AnomalyWarning {
  sl: number
  anchor: AnomalyWarningAnchor
}

export interface AnomalyAppendix {
  source: string
  body: string[]
}

/** 引用文件：quoted = 直接引用（渲染为带边框引用框）。 */
export interface AnomalyFile {
  source: string
  body: string[]
  quoted: boolean
}

export interface AnomalyFigure {
  caption: string
  url: string
}

export interface AnomalyAttachment {
  body: string[]
}

export interface AnomalyReportOutput {
  /** 薰陆香产能效率 · 等级词（自由文本，空 = N/A）。 */
  incenseGrade: string
  /** 薰陆香产能效率 · 数值范围（如 "5~12单位/太阳日"）。 */
  incenseRate: string
  /** 异常实体书页 1~9 条（允许 "N/A"）。 */
  pages: string[]
  /** EGO卡牌名（【】内文本，空 = 【N/A】）。 */
  egoCard: string
  /** 分配地：floors 表联动 id；null = 用 floorLabel 快照（楼层被删时"留名不留链"）。 */
  floorId: number | null
  /** 分配地显示快照（"迎书楼 – 历史层"），落库即最终值，零翻译层。 */
  floorLabel: string
}

export interface AnomalyReport {
  warnings: AnomalyWarning[]
  description: string[]
  containment: string[]
  output: AnomalyReportOutput
  appendices: AnomalyAppendix[]
  files: AnomalyFile[]
  figures: AnomalyFigure[]
  attachments: AnomalyAttachment[]
}

export const ANOMALY_PAGE_MAX = 9
export const ANOMALY_WARNING_MAX = 6

const ANOMALY_BLOCK_ANCHORS: ReadonlySet<string> = new Set<string>([
  'head', 'desc', 'contain', 'output', 'figure-main',
])
const ANOMALY_ENTRY_BLOCK_RE = /^entry:(appendix|files|figure|attachment):([1-9]\d*)$/

/** 旧 `after`（区块键，before 语义）→ 新 anchor 的软映射（2026-09-18 前的数据零迁移）。 */
function legacyWarningAnchor(after: unknown): AnomalyWarningAnchor {
  switch (after) {
    case 'head': return 'block:head'
    case 'desc': return 'block:desc'
    case 'contain': return 'block:contain'
    case 'output': return 'block:output'
    case 'appendix': return 'entry:appendix:1'
    case 'files': return 'entry:files:1'
    case 'figure-main': return 'block:figure-main'
    case 'figures-rest': return 'entry:figure:2'
    case 'attachments': return 'entry:attachment:1'
    default: return 'block:figure-main' // 脏数据兜底（模板默认）
  }
}

function parseWarningAnchor(anchor: unknown, legacyAfter: unknown): AnomalyWarningAnchor {
  if (typeof anchor === 'string') {
    if (anchor.startsWith('block:') && ANOMALY_BLOCK_ANCHORS.has(anchor.slice(6))) {
      return anchor as AnomalyWarningAnchor
    }
    if (ANOMALY_ENTRY_BLOCK_RE.test(anchor)) return anchor as AnomalyWarningAnchor
  }
  return legacyWarningAnchor(legacyAfter)
}

function normalizeWarning(w: unknown): AnomalyWarning {
  const w0 = (w ?? {}) as Partial<AnomalyWarning> & { after?: unknown }
  const sl = Math.max(1, Math.min(99, Math.trunc(Number(w0.sl)) || 1))
  return { sl, anchor: parseWarningAnchor(w0.anchor, w0.after) }
}

export function emptyAnomalyReport(): AnomalyReport {
  return {
    warnings: [],
    description: [],
    containment: [],
    output: {
      incenseGrade: '',
      incenseRate: '',
      pages: [],
      egoCard: '',
      floorId: null,
      floorLabel: '',
    },
    appendices: [],
    files: [],
    figures: [],
    attachments: [],
  }
}

/** 容错解析 anomalies.report JSON；空/坏数据返回空报告（永不抛错）。 */
export function parseAnomalyReport(raw?: string | null): AnomalyReport {
  if (!raw) return emptyAnomalyReport()
  try {
    const s = JSON.parse(raw) as Partial<AnomalyReport>
    const strArr = (v: unknown): string[] =>
      (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string')
    const o = s.output
    return {
      warnings: (Array.isArray(s.warnings) ? s.warnings : [])
        .slice(0, ANOMALY_WARNING_MAX)
        .map(normalizeWarning),
      description: strArr(s.description),
      containment: strArr(s.containment),
      output: {
        incenseGrade: o?.incenseGrade ?? '',
        incenseRate: o?.incenseRate ?? '',
        pages: strArr(o?.pages).slice(0, ANOMALY_PAGE_MAX),
        egoCard: o?.egoCard ?? '',
        floorId: typeof o?.floorId === 'number' ? o.floorId : null,
        floorLabel: o?.floorLabel ?? '',
      },
      appendices: (Array.isArray(s.appendices) ? s.appendices : []).map((a): AnomalyAppendix => ({
        source: a?.source ?? '',
        body: strArr(a?.body),
      })),
      files: (Array.isArray(s.files) ? s.files : []).map((f): AnomalyFile => ({
        source: f?.source ?? '',
        body: strArr(f?.body),
        quoted: !!f?.quoted,
      })),
      figures: (Array.isArray(s.figures) ? s.figures : [])
        .filter((f): f is AnomalyFigure => !!f && typeof f?.url === 'string')
        .map((f) => ({ caption: f.caption ?? '', url: f.url })),
      attachments: (Array.isArray(s.attachments) ? s.attachments : []).map((a): AnomalyAttachment => ({
        body: strArr(a?.body),
      })),
    }
  } catch {
    return emptyAnomalyReport()
  }
}

/** 文件条目次标：a..z → aa, ab…（>26 条不越界出怪字符）。编号行与图注同用。 */
export function anomalyFileIndexLabel(i: number): string {
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
  let label = ''
  let n = i
  do {
    label = LETTERS[n % 26] + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return label
}

/**
 * 警告线可用插入点：按文档顺序动态生成（随附录/文件/图片/附件条目增减自动变化）。
 * 编辑器下拉直接消费 {value,label}；渲染器（buildReportRows 的 landmark 表）按同一
 * 文档序建表——两处顺序必须一致（单一权威 = 本函数）。
 * 图片1 之前即影像资料标题之后，不单独提供（entry:figure 仅 N≥2）。
 */
export function anomalyWarningAnchors(report: AnomalyReport): Array<{ value: AnomalyWarningAnchor; label: string }> {
  const list: Array<{ value: AnomalyWarningAnchor; label: string }> = [
    { value: 'block:head', label: '报告最前（标题之前）' },
    { value: 'block:desc', label: '描述区之前' },
    { value: 'block:contain', label: '特殊收容措施之前' },
    { value: 'block:output', label: '产出区之前' },
  ]
  report.appendices.forEach((_, i) => list.push({ value: `entry:appendix:${i + 1}`, label: `附录#${i + 1} 之前` }))
  report.files.forEach((_, i) => list.push({ value: `entry:files:${i + 1}`, label: `文件#${anomalyFileIndexLabel(i)} 之前` }))
  list.push({ value: 'block:figure-main', label: '实体影像资料区之前' })
  report.figures.forEach((_, i) => {
    if (i > 0) list.push({ value: `entry:figure:${i + 1}`, label: `图片${i + 1} 之前` })
  })
  report.attachments.forEach((_, i) => list.push({ value: `entry:attachment:${i + 1}`, label: `附件#${i + 1} 之前` }))
  return list
}

const ANOMALY_LOBOTOMY_SUBS = new Set(['zayin', 'teth', 'he', 'waw', 'aleph'])

/** 主等级 + 子等级拼装显示（"keter" + "keter-teth" → "Keter-TETH"）。 */
export function anomalyLevelText(level: string, subLevel: string): string {
  const main = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Safe'
  const sub = subLevel.split('-').slice(1).join('-')
  if (!sub) return main
  if (ANOMALY_LOBOTOMY_SUBS.has(sub)) return `${main}-${sub.toUpperCase()}`
  return `${main}-${sub.charAt(0).toUpperCase() + sub.slice(1)}`
}

/** 编号全写：SCL- 前缀 + 数字（位数不限，空编号占位 XXXX）。 */
export function anomalyFullCode(a: Pick<Anomaly, 'code'>): string {
  const digits = (a.code || '').replace(/\D/g, '')
  return `SCL-${digits || 'XXXX'}`
}

/** 报告单标题：SCL-XXXX 名称。 */
export function anomalyReportTitle(a: Pick<Anomaly, 'code' | 'name'>): string {
  return `${anomalyFullCode(a)}${a.name ? `　${a.name}` : ''}`
}

/** 导出 PDF 文件名：SCL-XXXX_名称_异常实体报告（清洗 Windows 非法文件名字符）。 */
export function anomalyExportFilename(a: Pick<Anomaly, 'code' | 'name'>): string {
  const safeName = (a.name || '未命名').replace(/[\\/:*?"<>|]/g, '')
  return `${anomalyFullCode(a)}_${safeName}_异常实体报告`
}

export interface LiteraryWorld {
  id: number
  bookId: number | null
  name: string
  rules: string
  holdsEntityId: number | null
  note: string
}

export interface SupernaturalSpace {
  id: number
  code: string
  name: string
  level: SpaceLevel
  subLevel: SpaceSubLevel
  status: SpaceStatus
  rules: string
  resources: string
  anchorStatus: string
  note: string
}

export interface Repository {
  id: number
  name: string
  type: RepositoryType
  permission: PermissionLevel
  parentId: number | null
  functions: string
  description: string
  sortOrder: number
}

/** 藏书阁 Tab4「研究项目」注册表（armarium_projects 表的镜像）。 */
export interface ArmariumProject {
  id: number
  title: string
  latinName: string
  /** 所属书库：自由文本（repositories 表空置期间的临时决定，见 CONVENTIONS §2.3 讨论）。 */
  repository: string
  summary: string
  status: string
  /** tab = 新窗口打开独立应用；spa = 站内路由跳转。 */
  openMode: 'tab' | 'spa'
  path: string
  cover: string
  sortOrder: number
}

export interface Invitation {
  id: number
  receiverName: string
  issuedDate: string
  items: string
  status: string
  note: string
}

export interface Guest {
  id: number
  name: string
  origin: string
  invitationId: number | null
  isUninvited: number
  floorId: number | null
  status: GuestStatus
  result: string
  bookId: number | null
  note: string
}

export interface PagePack {
  id: number
  name: string
  type: PackType
  contents: string
  optimizedFor: string
  description: string
}

export interface Card {
  id: number
  packId: number | null
  name: string
  type: CardType
  effect: string
  slotLimit: string
  description: string
}

export interface RailStation {
  id: number
  name: string
  /** 列名与 SQLite 对齐为 orderNo（`order` 是 SQL 保留字，当年镜像时写错了）。 */
  orderNo: number
  boss: string
  theme: string
  drops: string
  description: string
}

export interface EnergyRecord {
  id: number
  date: string
  amount: number
  source: string
  note: string
}

export interface Faction {
  id: number
  name: string
  type: FactionType
  goal: string
  description: string
  relationship: string
}

export interface DirectorEntry {
  id: number
  name: string
  category: string
  title: string
  content: string
}

export interface LoreEntry {
  id: number
  slug: string
  title: string
  module: DepartmentId | 'world'
  category: string
  content: string
  sortOrder: number
}

/** 术语分区（词典页左侧目录）。 */
export interface TermSection {
  id: number
  slug: string
  title: string
  /** 是否在词典页可见（0/1）。 */
  visible: number
  sortOrder: number
}

/** 术语条目：tags/tagColors/tagFormats/ability 类字段为 JSON 字符串，前端 store 负责往返。 */
export interface TermEntry {
  id: number
  sectionId: number
  groupTitle: string
  name: string
  tags: string
  tagColors: string
  tagFormats: string
  format: string
  description: string
  /** 带参数位词条：插入面板据此生成 `“词条” X层` 形态（0/1）。 */
  hasParam: number
  sortOrder: number
}

/** PVZ 图鉴植物行（pvzwiki 前端另有运行时形态 PlantEntity，此处为 SQLite 行镜像）。 */
export interface PvzPlant {
  id: number
  codename: string
  numericId: number
  name: string
  englishName: string
  image: string
  world: string
  familyCode: string
  familyName: string
  familyIcon: string
  summary: string
  path: string
  isCustom: number
  sunCost: number | null
  recharge: number | null
  toughness: number | null
  damage: number | null
  range: string | null
  introduction: string | null
  chat: string | null
  /** JSON 字符串：string[]。 */
  ability: string
  /** JSON 字符串：string[]，存 pvz_keywords 的代号（slug）。 */
  traits: string
  wikiFull: string | null
  sortOrder: number
}

/**
 * PVZ 关键词。主键是英文代号（slug）且 NOT NULL——pvz_plants.traits JSON
 * 直接存代号引用词条，**禁止**改成数字自增主键（会打断全部 traits 引用）。
 */
export interface PvzKeyword {
  id: string
  name: string
  description: string
}

export interface OverviewStats {
  floors: number
  librarians: number
  anomalies: number
  spaces: number
  books: number
  repositories: number
  guests: number
  stations: number
  energyTotal: number
  entries: number
}

export const BATTLE_SYSTEMS: Record<BattleSystemId, BattleSystemInfo> = {
  base: {
    id: 'base',
    zh: '基本系统',
    code: 'BASE',
    desc: '所有体系中最普通的一个，无特殊形态，无特殊机制；所有无体系的单位都被算作该体系单位。',
    costLabel: '费用',
    costCap: 5,
    regen: 3,
    speedDice: 0,
    handLimit: 7,
    draw: 4,
    deckLimit: 16,
    keepHand: false,
    extraDeckZone: '无',
    teamCapacity: '4',
    deckZones: [
      { key: 'combat', label: '战斗卡牌' },
      { key: 'special', label: '特殊卡牌' },
    ],
    floorTabs: [
      { key: 'librarians', label: '司书列表', icon: '📖' },
      { key: 'extras', label: '附加单位', icon: '⭐' },
    ],
    cardPrefixes: ['V.', 'GX.', 'EX.', 'DEF.'],
    statTables: [
      {
        rows: [
          { label: '起始费用上限', value: '5点' },
          { label: '自动回费量', value: '3点/回合' },
          { label: '起始手牌上限', value: '7张' },
          { label: '自动抽牌数', value: '4张/回合' },
          { label: '牌组容量', value: '16张' },
          { label: '手牌保留规则', value: '自动弃牌' },
          { label: '额外卡牌区', value: '无' },
          { label: '起始速度骰子', value: '0颗' },
          { label: '队伍容量', value: '4人' },
        ],
      },
    ],
    mechanicsDesc: MECHANICS_TEXT.base,
    metrics: { offense: 3, defense: 3, speed: 2, resource: 4, growth: 1, learning: 1 },
    pros: '泛用性强，无特殊机制，任何单位可直接入队；费用充沛、回转快，容错稳定。',
    cons: '上限低，缺乏随机应变能力，没有成长体系与特殊形态。',
    speedPassives: [
      { name: '速战速决BASE', effect: '速度骰子+1' },
      { name: '速战速决BASE2', effect: '速度骰子+2' },
    ],
  },
  lob: {
    id: 'lob',
    zh: '情感等级',
    code: 'LOB',
    desc: '依赖情感等级成长，以强大的力量碾压目标，不擅长持久战。',
    costLabel: '光芒',
    costCap: 4,
    regen: 1,
    speedDice: 1,
    handLimit: 6,
    draw: 1,
    deckLimit: 9,
    keepHand: true,
    extraDeckZone: '1（EGO 栏）',
    teamCapacity: '6',
    deckZones: [
      { key: 'combat', label: '战斗卡牌' },
      { key: 'special', label: '特殊卡牌' },
      { key: 'ego', label: 'EGO 卡牌', hint: '仅 LOB 系统使用；情感等级达到Ⅲ/Ⅳ/Ⅴ级时从中抽取' },
    ],
    floorTabs: [
      { key: 'librarians', label: '司书列表', icon: '📖' },
      { key: 'extras', label: '附加单位', icon: '⭐' },
      { key: 'emotions', label: '情感书页', icon: '📙', hint: 'LOB 专属：情感实体 = 异常实体名称 + 1~9 张情感书页 + EGO卡牌' },
    ],
    cardPrefixes: ['V.', 'GX.', 'DEF.', 'EGO.', 'DST.', 'SHM.'],
    statTables: [
      {
        rows: [
          { label: '起始费用上限', value: '4点' },
          { label: '自动回费量', value: '1点/回合' },
          { label: '起始手牌上限', value: '6张' },
          { label: '自动抽牌数', value: '1张/回合' },
          { label: '牌组容量', value: '9张' },
          { label: '手牌保留规则', value: '不自动弃牌' },
          { label: '额外卡牌区', value: 'EGO栏' },
          { label: '起始速度骰子', value: '1颗' },
          { label: '队伍容量', value: '6人' },
        ],
      },
    ],
    mechanicsDesc: MECHANICS_TEXT.lob,
    mechanicsImages: MECHANICS_IMAGES.lob,
    metrics: { offense: 5, defense: 2, speed: 4, resource: 2, growth: 5, learning: 3 },
    pros: '以强大的力量碾压目标，人均攻击性强；情感等级带来全系统最高的成长上限，EGO 一锤定音。',
    cons: '不擅长持久战，缺乏回转和恢复手段；成长依赖战斗行为，逆风局难以滚雪球。',
    speedPassives: [
      { name: '速战速决LOB', effect: '速度骰子+1' },
      { name: '速战速决LOB2', effect: '速度骰子+2' },
      { name: '速战速决LOB3', effect: '速度骰子+1 “情感等级”达到Ⅲ级后额外+1' },
      { name: '速战速决LOB4', effect: '速度骰子+2 拥有“理智槽”' },
      { name: '速战速决LOB5', effect: '速度骰子+1 “情感等级”达到Ⅲ级后额外+1 拥有“理智槽”' },
    ],
  },
  pkm: {
    id: 'pkm',
    zh: '奇迹能量',
    code: 'PKM',
    desc: '训练师指挥召唤物（宝可梦）战斗，使用奇迹能量发动强大能力。',
    costLabel: 'PP',
    costCap: 3,
    regen: 3,
    speedDice: 1,
    handLimit: 6,
    draw: 2,
    deckLimit: 3,
    keepHand: false,
    extraDeckZone: '无 | 能量区',
    teamCapacity: '3人 | 18只',
    deckZones: [
      { key: 'combat', label: '战斗卡牌' },
      { key: 'special', label: '特殊卡牌' },
      { key: 'energy', label: '能量卡牌', hint: 'PKM 宝可梦的能量区：携带奇迹能量的能量卡牌' },
    ],
    floorTabs: [
      { key: 'librarians', label: '司书列表', icon: '📖' },
      { key: 'extras', label: '附加单位', icon: '⭐' },
      { key: 'reserved', label: '预留', icon: '🗃', hint: '该系统的专属子模块将在后续版本补充' },
    ],
    cardPrefixes: ['V.', 'GX.', 'EX.', 'DEF.'],
    statTables: [
      {
        title: '训练师',
        rows: [
          { label: '起始费用上限', value: '3点' },
          { label: '自动回费量', value: '3点/回合' },
          { label: '起始手牌上限', value: '6张' },
          { label: '自动抽牌数', value: '2张/回合' },
          { label: '牌组容量', value: '3张' },
          { label: '手牌保留规则', value: '不自动弃牌' },
          { label: '额外卡牌区', value: '无' },
          { label: '起始速度骰子', value: '1颗' },
          { label: '队伍容量', value: '3人' },
        ],
      },
      {
        title: '宝可梦',
        rows: [
          { label: '起始费用上限', value: '3点' },
          { label: '自动回费量', value: '0点/回合' },
          { label: '起始手牌上限', value: '4张' },
          { label: '自动抽牌数', value: '0张/回合' },
          { label: '牌组容量', value: '4张' },
          { label: '手牌保留规则', value: '不自动弃牌' },
          { label: '额外卡牌区', value: '能量区' },
          { label: '起始速度骰子', value: '1颗' },
          { label: '队伍容量', value: '18只' },
        ],
      },
    ],
    mechanicsDesc: MECHANICS_TEXT.pkm,
    mechanicsImages: MECHANICS_IMAGES.pkm,
    metrics: { offense: 4, defense: 4, speed: 3, resource: 3, growth: 2, learning: 3 },
    pros: '消耗型系统。开局即全盛，随回合衰减，短线作战极强。',
    cons: '奖励是补给不是成长，长线作战能力弱，资源耗尽后作战能力疲软。',
    speedPassives: [
      { name: '速战速决PKM', effect: '每回合开始时手牌与费用充满' },
      { name: '速战速决PKM2', effect: '速度骰子+1 每回合开始时手牌与费用充满' },
      { name: '速战速决PKM3', effect: '速度骰子+2 每回合开始时手牌与费用充满' },
    ],
  },
  rhd: {
    id: 'rhd',
    zh: '部署点数',
    code: 'RHD',
    desc: '以部署点数限制单位出场与精英化；风险与收益并存的希望/危机书页。',
    costLabel: '技力',
    costCap: 3,
    regen: 1,
    speedDice: 1,
    handLimit: 6,
    draw: 2,
    deckLimit: 6,
    keepHand: false,
    extraDeckZone: '无 | 模组栏',
    teamCapacity: '12人 + 1人',
    deckZones: [
      { key: 'combat', label: '战斗卡牌' },
      { key: 'special', label: '特殊卡牌' },
      { key: 'modules', label: '模组卡牌', hint: 'RHD 专属模组区，定位同 LOB 的 EGO 栏' },
    ],
    floorTabs: [
      { key: 'librarians', label: '司书列表', icon: '📖' },
      { key: 'extras', label: '附加单位', icon: '⭐' },
      { key: 'reserved', label: '预留', icon: '🗃', hint: '该系统的专属子模块将在后续版本补充' },
    ],
    cardPrefixes: ['V.', 'GX.', 'DEF.', 'ELIT1.', 'ELIT2.'],
    passivePrefixes: ['ELIT1.', 'ELIT2.'],
    statTables: [
      {
        title: '信标',
        rows: [
          { label: '起始费用上限', value: '3点' },
          { label: '自动回费量', value: '1点/回合' },
          { label: '起始手牌上限', value: '6张' },
          { label: '自动抽牌数', value: '2张/回合' },
          { label: '牌组容量', value: '3张' },
          { label: '手牌保留规则', value: '不自动弃牌' },
          { label: '额外卡牌区', value: '无' },
          { label: '起始速度骰子', value: '1颗' },
          { label: '队伍容量', value: '12人 + 1人' },
        ],
      },
      {
        title: '其他单位',
        rows: [
          { label: '起始费用上限', value: '3点' },
          { label: '自动回费量', value: '1点/回合' },
          { label: '起始手牌上限', value: '6张' },
          { label: '自动抽牌数', value: '2张/回合' },
          { label: '牌组容量', value: '6张' },
          { label: '手牌保留规则', value: '自动弃牌' },
          { label: '额外卡牌区', value: '模组栏' },
          { label: '起始速度骰子', value: '2颗' },
          { label: '队伍容量', value: '12人 + 1人' },
        ],
      },
    ],
    mechanicsDesc: MECHANICS_TEXT.rhd,
    mechanicsImages: MECHANICS_IMAGES.rhd,
    metrics: { offense: 3, defense: 5, speed: 4, resource: 5, growth: 4, learning: 5 },
    pros: '队伍分工明确，攻守兼备，抗压能力强，能够适应多种场合。',
    cons: '灌伤爆发能力弱，难以短时间内造成大量伤害，且操作依赖运营，上手门槛高。',
    speedPassives: [
      { name: '速战速决RHD', effect: '占用1点部署点数' },
      { name: '速战速决RHD2', effect: '占用2点部署点数' },
      { name: '速战速决RHD3', effect: '占用3点部署点数' },
    ],
  },
} as const

/** 系统固定被动「速战速决」的可选模板变体；无模板的系统回退为单条默认。 */
export function speedPassiveTemplates(sys: BattleSystemId): Passive[] {
  const info = BATTLE_SYSTEMS[sys]
  if (info.speedPassives?.length) return info.speedPassives
  const code = info?.code ?? sys.toUpperCase()
  return [{ name: `速战速决${code}`, effect: '速度骰子+1' }]
}

/** 系统固定被动「速战速决」的默认变体（模板第一条）。 */
export function defaultSpeedPassive(sys: BattleSystemId): Passive {
  const first = speedPassiveTemplates(sys)[0]
  return first ?? { name: `速战速决${BATTLE_SYSTEMS[sys]?.code ?? sys.toUpperCase()}`, effect: '速度骰子+1' }
}

// 术语数据（含曾经的 LABELS 部门名映射，2026-09 判死退役）不再以任何形式存放于
// shared：唯一权威源是 SQLite（term_sections / term_entries 等，经 generic CRUD 消费），
// 备份由写后自动快照维护（CONVENTIONS §2.3）。部门展示名在前端 frontend/src/app/labels.ts。
