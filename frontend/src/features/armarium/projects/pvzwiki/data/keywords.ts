// 兼容层：关键词已迁后端 SQLite（pvz_keywords），经 @pvzwiki/store/plants 纯消费。
import { reactive, watch } from 'vue'
import { usePvzPlantsStore, getKeyword } from '@pvzwiki/store/plants'
import type { Keyword } from '@pvzwiki/types/keyword'

export const keywords = reactive<Keyword[]>([])

let initialized = false

function ensureSync(): void {
  if (initialized) return
  initialized = true
  const store = usePvzPlantsStore()
  watch(
    () => store.keywords,
    (list) => {
      keywords.splice(0, keywords.length, ...list)
    },
    { immediate: true },
  )
  void store.load()
}

ensureSync()

export { getKeyword }
