export interface PlantFamily {
  code: string
  name: string
  icon: string
}

export interface PlantEntity {
  codename: string
  numericId: number
  name: string
  englishName: string
  image: string
  world: string
  family: PlantFamily | null
  summary: string
  path: string
  /** 自建（新建植物）条目标记，区别于云端同步的官方条目 */
  custom?: boolean
}

export interface WorldInfo {
  code: string
  name: string
}

export interface FamilyInfo {
  code: string
  name: string
  icon: string
}

export interface PlantDetail {
  codename: string
  sunCost: number | null
  recharge: number | null
  toughness: number | null
  damage: number | null
  range: string | null
  family: string | null
  introduction: string | null
  ability: string[]
  chat: string | null
  traits: string[]
}

export const WORLD_NAMES: Record<string, string> = {
  frontyard: '前院',
  egypt: '埃及',
  pirate: '海盗',
  cowboy: '西部',
  future: '未来',
  dark: '黑暗',
  beach: '海滩',
  ice: '冰窟',
  lostcity: '古城',
  eighties: '炫光魔音',
  dino: '侏罗纪',
  modern: '现代',
  kongfu: '武林',
  sky: '云端',
  water: '水域',
  epic: '史诗关卡',
  market: '商店',
  mint: '薄荷',
}

export const WORLD_BG_MAP: Record<string, string> = {
  beach: 'beach',
  boost: 'boost',
  cowboy: 'cowboy',
  dark: 'dark',
  dino: 'dino',
  egypt: 'egypt',
  eighties: 'eighties',
  epic: 'epic',
  frontyard: 'frontyard',
  future: 'future',
  ice: 'iceage',
  kongfu: 'kongfu',
  lod: 'lod',
  lostcity: 'lostcity',
  market: 'market',
  mint: 'mint',
  modern: 'modern',
  pirate: 'pirate',
  sky: 'sky',
  water: 'beach_watered',
}
