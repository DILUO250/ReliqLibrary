import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PlantEntity, PlantFamily, WorldInfo, FamilyInfo, PlantDetail } from '@pvzwiki/types/plant'
import { WORLD_NAMES } from '@pvzwiki/types/plant'
import type { Keyword } from '@pvzwiki/types/keyword'
import { pvzImagePath, toRawIcon } from '@pvzwiki/asset'
import { customVersion } from '@pvzwiki/store/plantImage'
import { api } from '@/app/services/api'

// ---------------------------------------------------------------------------
// PVZ 图鉴数据仓库：后端 SQLite（pvz_plants / pvz_keywords）为唯一数据源。
// 展平后的详情（运行时编辑 > 精修 > 上游基底）已落库为行内字段，
// 本仓库纯消费，不再有 overrides / localStorage 多层覆盖。
interface PvzPlantRow {
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
  family: string | null
  introduction: string | null
  chat: string | null
  ability: string
  traits: string
  wikiFull: string | null
  wikiThumb: string | null
  sortOrder: number
}

function parseArr<T>(s: string): T[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? (v as T[]) : []
  } catch {
    return []
  }
}

function decorate(plant: PlantEntity): PlantEntity {
  return {
    ...plant,
    image: plant.image ? pvzImagePath(plant.image) : '',
    family: plant.family ? { ...plant.family, icon: pvzImagePath(plant.family.icon) } : null,
  }
}

export const usePvzPlantsStore = defineStore('pvzPlants', () => {
  const rows = ref<PvzPlantRow[]>([])
  const keywords = ref<Keyword[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  // 行 → 前端 PlantEntity 形态（含 image/icon 的 pvzAsset 装饰与 custom 标记）
  const plants = computed<PlantEntity[]>(() =>
    rows.value
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((r) =>
        decorate({
          codename: r.codename,
          numericId: r.numericId,
          name: r.name,
          englishName: r.englishName,
          image: r.image,
          world: r.world,
          family: r.familyCode
            ? { code: r.familyCode, name: r.familyName, icon: r.familyIcon }
            : null,
          summary: r.summary,
          path: r.path,
          custom: r.isCustom === 1 ? true : undefined,
        }),
      ),
  )

  function findRow(codename: string): PvzPlantRow | undefined {
    return rows.value.find((r) => r.codename === codename)
  }

  async function load(): Promise<void> {
    if (loaded.value) return
    loading.value = true
    error.value = null
    try {
      const [plantRows, kwRows] = await Promise.all([
        api.list<PvzPlantRow>('pvz_plants'),
        api.list<Keyword & { id: string }>('pvz_keywords'),
      ])
      rows.value = plantRows
      keywords.value = kwRows
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'unknown error'
    } finally {
      loading.value = false
    }
  }

  async function reload(): Promise<void> {
    loaded.value = false
    await load()
  }

  // 模块加载即触发首次拉取（视图挂载时数据通常已就绪）
  void load()

  /* ---------------- 详情（展平值，直接读行字段） ---------------- */

  function getEffectiveDetail(codename: string): PlantDetail | undefined {
    const r = findRow(codename)
    if (!r) return undefined
    return {
      codename,
      sunCost: r.sunCost ?? null,
      recharge: r.recharge ?? null,
      toughness: r.toughness ?? null,
      damage: r.damage ?? null,
      range: r.range ?? null,
      family: r.family ?? null,
      introduction: r.introduction ?? null,
      ability: parseArr<string>(r.ability),
      chat: r.chat ?? null,
      traits: parseArr<string>(r.traits),
    }
  }

  /* ---------------- 编辑（PUT 落库，无 localStorage 层） ---------------- */

  async function saveDetail(
    codename: string,
    data: {
      sunCost: number | null
      recharge: number | null
      toughness: number | null
      damage: number | null
      range: string | null
      family: string | null
      introduction: string | null
      chat: string | null
      ability: string[]
      traits: string[]
    },
  ): Promise<void> {
    const r = findRow(codename)
    if (!r) throw new Error(`unknown plant: ${codename}`)
    await api.update('pvz_plants', r.id, {
      sunCost: data.sunCost,
      recharge: data.recharge,
      toughness: data.toughness,
      damage: data.damage,
      range: data.range,
      family: data.family,
      introduction: data.introduction,
      chat: data.chat,
      ability: JSON.stringify(data.ability),
      traits: JSON.stringify(data.traits),
    })
    Object.assign(r, {
      sunCost: data.sunCost,
      recharge: data.recharge,
      toughness: data.toughness,
      damage: data.damage,
      range: data.range,
      family: data.family,
      introduction: data.introduction,
      chat: data.chat,
      ability: JSON.stringify(data.ability),
      traits: JSON.stringify(data.traits),
    })
  }

  /* ---------------- 自建植物 CRUD（isCustom=1，走 pvz_plants 表） ---------------- */

  function isCodenameTaken(codename: string): boolean {
    const target = codename.toLowerCase()
    return rows.value.some((r) => r.codename.toLowerCase() === target)
  }

  function nextNumericId(): number {
    return rows.value.reduce((max, r) => Math.max(max, Number(r.numericId) || 0), 0) + 1
  }

  async function createCustomPlant(input: {
    codename: string
    name: string
    englishName: string
    world: string
    family: PlantFamily | null
    summary: string
  }): Promise<PlantEntity> {
    const maxOrder = rows.value.reduce((m, r) => Math.max(m, r.sortOrder), 0)
    const nid = nextNumericId()
    const created = await api.create<{ id: number }>('pvz_plants', {
      codename: input.codename,
      numericId: nid,
      name: input.name,
      englishName: input.englishName,
      image: '',
      world: input.world,
      familyCode: input.family?.code ?? '',
      familyName: input.family?.name ?? '',
      familyIcon: input.family ? toRawIcon(input.family.icon) : '',
      summary: input.summary,
      path: '',
      isCustom: 1,
      ability: '[]',
      traits: '[]',
      sortOrder: maxOrder + 1,
    })
    rows.value.push({
      id: created.id,
      codename: input.codename,
      numericId: nid,
      name: input.name,
      englishName: input.englishName,
      image: '',
      world: input.world,
      familyCode: input.family?.code ?? '',
      familyName: input.family?.name ?? '',
      familyIcon: input.family ? toRawIcon(input.family.icon) : '',
      summary: input.summary,
      path: '',
      isCustom: 1,
      sunCost: null,
      recharge: null,
      toughness: null,
      damage: null,
      range: null,
      family: null,
      introduction: null,
      chat: null,
      ability: '[]',
      traits: '[]',
      wikiFull: null,
      wikiThumb: null,
      sortOrder: maxOrder + 1,
    })
    return {
      codename: input.codename,
      numericId: nid,
      name: input.name,
      englishName: input.englishName,
      image: '',
      world: input.world,
      family: input.family,
      summary: input.summary,
      path: '',
      custom: true,
    }
  }

  async function updateCustomPlant(
    codename: string,
    patch: {
      name?: string
      englishName?: string
      world?: string
      family?: PlantFamily | null
      summary?: string
    },
  ): Promise<void> {
    const r = findRow(codename)
    if (!r) throw new Error(`unknown plant: ${codename}`)
    const body: Record<string, unknown> = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.englishName !== undefined) body.englishName = patch.englishName
    if (patch.world !== undefined) body.world = patch.world
    if (patch.family !== undefined) {
      body.familyCode = patch.family?.code ?? ''
      body.familyName = patch.family?.name ?? ''
      body.familyIcon = patch.family ? toRawIcon(patch.family.icon) : ''
    }
    if (patch.summary !== undefined) body.summary = patch.summary
    await api.update('pvz_plants', r.id, body)
    Object.assign(r, {
      ...body,
      ...(patch.family !== undefined
        ? {
            familyCode: patch.family?.code ?? '',
            familyName: patch.family?.name ?? '',
            familyIcon: patch.family ? toRawIcon(patch.family.icon) : '',
          }
        : {}),
    })
  }

  async function removeCustomPlant(codename: string): Promise<void> {
    const r = findRow(codename)
    if (!r) return
    await api.remove('pvz_plants', r.id)
    rows.value = rows.value.filter((x) => x.id !== r.id)
  }

  return {
    rows,
    plants,
    keywords,
    loading,
    loaded,
    error,
    load,
    reload,
    findRow,
    getEffectiveDetail,
    saveDetail,
    isCodenameTaken,
    nextNumericId,
    createCustomPlant,
    updateCustomPlant,
    removeCustomPlant,
  }
})

/* ---------------- 模块级查询函数（替代原 data/*.ts 的导出） ---------------- */

function store(): ReturnType<typeof usePvzPlantsStore> {
  return usePvzPlantsStore()
}

export function getWorlds(plantList: PlantEntity[]): WorldInfo[] {
  const codes = [...new Set(plantList.map((p) => p.world))].filter(Boolean)
  return codes
    .map((code) => ({ code, name: WORLD_NAMES[code] ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getFamilies(plantList: PlantEntity[]): FamilyInfo[] {
  const familyMap = new Map<string, FamilyInfo>()
  for (const p of plantList) {
    if (p.family && !familyMap.has(p.family.code)) {
      familyMap.set(p.family.code, p.family)
    }
  }
  return [...familyMap.values()].sort((a, b) =>
    a.code === 'Nope' ? 1 : b.code === 'Nope' ? -1 : a.name.localeCompare(b.name),
  )
}

export function getPlantNumber(plant: PlantEntity, allPlants: PlantEntity[]): number {
  return plant.numericId ?? allPlants.findIndex((p) => p.codename === plant.codename) + 1
}

export function filterPlants(
  plantList: PlantEntity[],
  query: string,
  familyCode: string,
  worldCode: string,
): PlantEntity[] {
  const q = query.toLocaleLowerCase()
  return plantList.filter((p) => {
    const haystack = [p.name, p.englishName, p.codename, String(p.numericId), p.summary, p.family?.name]
      .filter((v) => v != null)
      .join(' ')
      .toLocaleLowerCase()
    const matchesSearch = !q || haystack.includes(q)
    const matchesFamily = !familyCode || p.family?.code === familyCode
    const matchesWorld = !worldCode || p.world === worldCode
    return matchesSearch && matchesFamily && matchesWorld
  })
}

export function getPlantByCodename(codename: string): PlantEntity | undefined {
  return store().plants.find((p) => p.codename === codename)
}

export function getEffectiveDetail(codename: string): PlantDetail | undefined {
  return store().getEffectiveDetail(codename)
}

export async function removeCustomPlant(codename: string): Promise<void> {
  await store().removeCustomPlant(codename)
}

export function getPrevNext(codename: string): { prev?: PlantEntity; next?: PlantEntity } {
  const list = store().plants
  const idx = list.findIndex((p) => p.codename === codename)
  if (idx < 0) return {}
  return {
    prev: idx > 0 ? list[idx - 1] : undefined,
    next: idx < list.length - 1 ? list[idx + 1] : undefined,
  }
}

export function getNeighbors(codename: string, limit = 5): PlantEntity[] {
  const s = store()
  const current = s.getEffectiveDetail(codename)
  if (!current?.family) return []
  return s.plants
    .filter((p) => {
      if (p.codename === codename) return false
      const other = s.getEffectiveDetail(p.codename)
      return !!other?.family && other.family === current.family
    })
    .slice(0, limit)
}

export function getKeyword(id: string): Keyword | undefined {
  return store().keywords.find((k) => k.id === id)
}

export interface PlantImageRef {
  full?: string
  thumb?: string
}

const CUSTOM_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const

export function getWikiImage(codename: string): PlantImageRef | undefined {
  const r = store().findRow(codename)
  if (!r || !r.wikiFull) return undefined
  return { full: pvzImagePath(r.wikiFull) }
}

// 详情页展示图候选，优先级从高到低：高清大图 → 卡片图。
// 高清统一在 /full（原 custom 已并入 /full）；缩略图（thumb）已弃用。
export function getShowcaseCandidates(plant: PlantEntity): string[] {
  const code = plant.codename
  const version = customVersion(code)
  const candidates: string[] = []
  for (const ext of CUSTOM_EXTENSIONS) {
    candidates.push(`${pvzImagePath(`/assets/image/plants/custom/${code}.${ext}`)}?v=${version}`)
  }
  candidates.push(plant.image)
  return candidates
}

// 新植物的默认卡面占位图（内联 SVG，无需素材文件）。
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 140">
  <rect x="6" y="6" width="168" height="128" rx="14" fill="#e8d9a8" stroke="#8a6a42" stroke-width="5"/>
  <rect x="16" y="16" width="148" height="108" rx="9" fill="none" stroke="#c9b27c" stroke-width="3"/>
  <path d="M90 96c-16 0-26-10-26-25 0-13 9-22 17-28 2 6 6 9 9 10-2-10 2-21 10-27 1 12 8 17 12 24 4 7 4 14 4 21 0 15-10 25-26 25z" fill="#9dbb86"/>
  <path d="M90 96V64" stroke="#6d8a58" stroke-width="4" stroke-linecap="round"/>
  <circle cx="90" cy="96" r="3.5" fill="#6d8a58"/>
  <text x="90" y="126" text-anchor="middle" font-family="Georgia, serif" font-size="17" font-style="italic" fill="#8a6a42">?</text>
</svg>`

export const PLANT_PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`
