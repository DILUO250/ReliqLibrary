// 植物详情编辑：写入通道已统一为 @pvzwiki/store/plants 的 saveDetail（PUT 落库）。
import { usePvzPlantsStore } from '@pvzwiki/store/plants'

export interface PlantEditData {
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
}

export async function saveEdit(codename: string, data: PlantEditData): Promise<void> {
  await usePvzPlantsStore().saveDetail(codename, data)
}
