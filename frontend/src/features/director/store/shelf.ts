import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/app/services/api'
import type { ExternalProject } from '@rtl/shared'

/**
 * 域外书架（馆长层 / 主页面板）：external_projects 的缓存。
 * 与各模块 store 同惯例：load 幂等（loaded 守卫），编辑后 reload。
 */
export const useShelfStore = defineStore('director-shelf', () => {
  const list = ref<ExternalProject[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load(): Promise<void> {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      list.value = await api.list<ExternalProject>('external_projects')
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function reload(): Promise<void> {
    loaded.value = false
    await load()
  }

  return { list, loaded, loading, load, reload }
})
