// 兼容层：图鉴植物数据已迁后端 SQLite（pvz_plants），经 @pvzwiki/store/plants 纯消费。
// 本模块仅适配旧调用形态（reactive 数组 + 查询函数），不含任何静态领域数据。
import { reactive, watch } from 'vue'
import { usePvzPlantsStore, getWorlds, getFamilies, filterPlants } from '@pvzwiki/store/plants'
import type { PlantEntity } from '@pvzwiki/types/plant'

export const plants = reactive<PlantEntity[]>([])

let initialized = false

function ensureSync(): void {
  if (initialized) return
  initialized = true
  const store = usePvzPlantsStore()
  watch(
    () => store.plants,
    (list) => {
      plants.splice(0, plants.length, ...list)
    },
    { immediate: true },
  )
  void store.load()
}

// 首次被任意组件 import 时（懒加载视图阶段，pinia 已安装）建立同步
ensureSync()

export { getWorlds, getFamilies, filterPlants }
