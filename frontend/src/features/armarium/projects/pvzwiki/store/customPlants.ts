// 自建植物 CRUD：已并入 @pvzwiki/store/plants（走 pvz_plants 表 isCustom=1）。
// 本模块仅适配旧调用形态（同步签名 / 传参差异），不再有 localStorage 层。
import type { PlantEntity, PlantFamily } from '@pvzwiki/types/plant'
import { usePvzPlantsStore, PLANT_PLACEHOLDER_IMAGE } from '@pvzwiki/store/plants'

export { PLANT_PLACEHOLDER_IMAGE }

export function isCodenameTaken(codename: string, list?: string[]): boolean {
  if (list) return list.some((c) => c.toLowerCase() === codename.toLowerCase())
  return usePvzPlantsStore().isCodenameTaken(codename)
}

export function nextNumericId(list?: PlantEntity[]): number {
  if (list) return list.reduce((m, p) => Math.max(m, Number(p.numericId) || 0), 0) + 1
  return usePvzPlantsStore().nextNumericId()
}

/** 新建自建植物。**失败会 throw**——调用方必须 catch 并提示，禁止静默吞错
 * （旧版 `.catch(() => {})` 导致写库失败时 UI 谎报"已建立档案"）。 */
export async function addCustomPlant(entity: PlantEntity): Promise<PlantEntity> {
  await usePvzPlantsStore().createCustomPlant({
    codename: entity.codename,
    name: entity.name,
    englishName: entity.englishName,
    world: entity.world,
    family: entity.family,
    summary: entity.summary,
  })
  return entity
}

export async function updateCustomPlant(
  codename: string,
  patch: {
    name?: string
    englishName?: string
    world?: string
    family?: PlantFamily | null
    summary?: string
  },
): Promise<void> {
  await usePvzPlantsStore().updateCustomPlant(codename, patch)
}

export async function removeCustomPlant(codename: string): Promise<void> {
  await usePvzPlantsStore().removeCustomPlant(codename)
}
