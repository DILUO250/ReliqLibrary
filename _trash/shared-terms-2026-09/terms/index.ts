import { cardTypes } from './cardTypes.js'
import { baseTags } from './baseTags.js'
import { generalTags } from './generalTags.js'
import { cardPrefixes } from './cardPrefixes.js'
import { baseDice } from './baseDice.js'
import { specialDice } from './specialDice.js'
import { statusTags } from './statusTags.js'
import { basicStatuses } from './basicStatuses.js'
import { universalStatuses } from './universalStatuses.js'
import { normalMechanics } from './mechanism/01_normal.js'
import { fightingMechanics } from './mechanism/02_fighting.js'
import { flyingMechanics } from './mechanism/03_flying.js'
import { poisonMechanics } from './mechanism/04_poison.js'
import { groundMechanics } from './mechanism/05_ground.js'
import { rockMechanics } from './mechanism/06_rock.js'
import { bugMechanics } from './mechanism/07_bug.js'
import { ghostMechanics } from './mechanism/08_ghost.js'
import { steelMechanics } from './mechanism/09_steel.js'
import { fireMechanics } from './mechanism/10_fire.js'
import { waterMechanics } from './mechanism/11_water.js'
import { grassMechanics } from './mechanism/12_grass.js'
import { electricMechanics } from './mechanism/13_electric.js'
import { psychicMechanics } from './mechanism/14_psychic.js'
import { iceMechanics } from './mechanism/15_ice.js'
import { dragonMechanics } from './mechanism/16_dragon.js'
import { darkMechanics } from './mechanism/17_dark.js'
import { fairyMechanics } from './mechanism/18_fairy.js'

export interface TermItem {
  name: string
  desc?: string
  type?: string
  hasParam?: boolean
  format?: Record<string, unknown>
}

export interface TermGroup {
  label: string
  items: TermItem[]
}

export {
  cardTypes,
  baseTags,
  generalTags,
  cardPrefixes,
  baseDice,
  specialDice,
  statusTags,
  basicStatuses,
  universalStatuses,
}

export const mechanicGroups: TermGroup[] = [
  { label: '一般', items: normalMechanics },
  { label: '格斗', items: fightingMechanics },
  { label: '飞行', items: flyingMechanics },
  { label: '毒', items: poisonMechanics },
  { label: '地面', items: groundMechanics },
  { label: '岩石', items: rockMechanics },
  { label: '虫', items: bugMechanics },
  { label: '幽灵', items: ghostMechanics },
  { label: '钢', items: steelMechanics },
  { label: '火', items: fireMechanics },
  { label: '水', items: waterMechanics },
  { label: '草', items: grassMechanics },
  { label: '电', items: electricMechanics },
  { label: '超能', items: psychicMechanics },
  { label: '冰', items: iceMechanics },
  { label: '龙', items: dragonMechanics },
  { label: '恶', items: darkMechanics },
  { label: '妖精', items: fairyMechanics },
]

export const allMechanics: TermItem[] = mechanicGroups.flatMap((g) => g.items)

export const baseTermGroups: TermGroup[] = [
  { label: '卡牌分类', items: cardTypes },
  { label: '基础标签', items: baseTags },
  { label: '泛用标签', items: generalTags },
  { label: '卡牌前缀', items: cardPrefixes },
  { label: '基础骰子', items: baseDice },
  { label: '特殊骰子', items: specialDice },
  { label: '状态标签', items: statusTags },
  { label: '基础状态', items: basicStatuses },
  { label: '通用状态', items: universalStatuses },
]
