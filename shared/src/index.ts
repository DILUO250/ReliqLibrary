/**
 * 遗迹图书馆 · 共享领域类型
 * 前后端共用的一份领域模型定义。
 */

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
  attribute?: string
  energyTypes?: string[]
  summonCapacity?: number
  deploy?: number
  elite?: number
  damageBar?: string
  sanityMin?: number
  sanityMax?: number
  /** 理智值增加条件 */
  sanityGainCond?: string
  /** 理智值减少 */
  sanityLossCond?: string
  panicType?: string
  panicLow?: string
  panicPanic?: string
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
    cards: { combat: [], special: [], ego: [] },
    systemData: {},
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
    s.cards.ego = s.cards.ego ?? []
    for (const list of [s.cards.combat, s.cards.special, s.cards.ego]) {
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

/** 附加角色的稀有度前缀；'' 表示常规司书。 */
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
  /** 附加角色稀有度前缀（'' = 常规司书）。 */
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
  order: number
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
  expeditionId: string
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
    regen: 2,
    speedDice: 0,
    handLimit: 7,
    draw: 2,
    deckLimit: 12,
    keepHand: false,
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
    costCap: 5,
    regen: 1,
    speedDice: 0,
    handLimit: 7,
    draw: 2,
    deckLimit: 12,
    keepHand: false,
  },
  rhd: {
    id: 'rhd',
    zh: '部署点数',
    code: 'RHD',
    desc: '以部署点数限制单位出场与精英化；风险与收益并存的希望/危机书页。',
    costLabel: '技力',
    costCap: 5,
    regen: 1,
    speedDice: 0,
    handLimit: 7,
    draw: 2,
    deckLimit: 12,
    keepHand: false,
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

export const LABELS = {
  department: {
    turris: '迎书楼',
    armarium: '藏书阁',
    collegium: '寻书社',
    director: '馆长层',
  } as Record<DepartmentId, string>,
  librarianRole: {
    curator: '迎书楼司书',
    librarian: '藏书阁司书·书记官',
    seeker: '寻书社司书·求索者',
    chronicler: '寻书社司书·墨工',
    internal: '内务司书',
    director: '馆长',
  } as Record<LibrarianRole, string>,
  librarianRarity: {
    '': '常规司书',
    N: 'N',
    R: 'R',
    SR: 'SR',
    SSR: 'SSR',
    RR: 'RR',
    UR: 'UR',
  } as Record<string, string>,
  coreColor: {
    red: '红',
    blue: '蓝',
    green: '绿',
    gold: '金',
    neutral: '素',
  } as Record<CorePageColor, string>,
  anomalyLevel: {
    safe: 'Safe',
    euclid: 'Euclid',
    keter: 'Keter',
  } as Record<AnomalyLevel, string>,
  anomalyStatus: {
    discovered: '已发现',
    assessing: '评估中',
    contained: '收容中',
    researching: '研究中',
    extracted: '已提取',
    neutralized: '已失效',
    escaped: '出逃',
  } as Record<AnomalyStatus, string>,
  spaceLevel: {
    safe: 'Safe',
    euclid: 'Euclid',
    keter: 'Keter',
  } as Record<SpaceLevel, string>,
  spaceStatus: {
    discovered: '已发现',
    assessing: '评估中',
    controlled: '已控制',
    harvesting: '开采中',
    breached: '突破',
  } as Record<SpaceStatus, string>,
  repositoryType: {
    entity: '实体管理书库',
    life: '生活事务书库',
    nature: '生命自然研究书库',
    page: '书页研发书库',
  } as Record<RepositoryType, string>,
  pageType: {
    combat: '战斗书页',
    abnormality: '异常实体书页',
    ego: 'E.G.O书页',
  } as Record<PageType, string>,
  cardType: {
    tool: '道具卡',
    trinket: '饰品卡',
    consumable: '消耗品卡',
    skill: '技能卡',
    tag: '标签卡',
  } as Record<CardType, string>,
  packType: {
    standard: '标准卡册',
    advanced: '进阶卡册',
    special: '特化卡册',
  } as Record<PackType, string>,
  guestStatus: {
    invited: '受邀',
    receiving: '接待中',
    converted: '已转化',
    survived: '通过试炼',
    withdrawn: '滞留',
  } as Record<GuestStatus, string>,
  factionType: {
    hostile: '敌对',
    neutral: '中立',
    special: '特殊',
  } as Record<FactionType, string>,
  battleSystem: {
    base: '基本系统',
    lob: '情感等级',
    pkm: '奇迹能量',
    rhd: '部署点数',
  } as Record<BattleSystemId, string>,
} as const

export * from './terms/index.js'
