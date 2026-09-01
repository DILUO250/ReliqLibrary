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

/** 新建自建植物。后端写入异步进行；代号同步已知，返回传入实体供调用方立即跳转。 */
export function addCustomPlant(entity: PlantEntity): PlantEntity {
  void usePvzPlantsStore()
    .createCustomPlant({
      codename: entity.codename,
      name: entity.name,
      englishName: entity.englishName,
      world: entity.world,
      family: entity.family,
      summary: entity.summary,
    })
    .catch(() => {
      // 写库失败时由调用方界面的兜底逻辑提示；此处保持静默以免阻断跳转
    })
  return entity
}

export function updateCustomPlant(
  codename: string,
  patch: {
    name?: string
    englishName?: string
    world?: string
    family?: PlantFamily | null
    summary?: string
  },
): void {
  void usePvzPlantsStore()
    .updateCustomPlant(codename, patch)
    .catch(() => {
      // 同上
    })
}

export async function removeCustomPlant(codename: string): Promise<void> {
  await usePvzPlantsStore().removeCustomPlant(codename)
}
