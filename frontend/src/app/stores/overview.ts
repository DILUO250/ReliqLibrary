import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OverviewStats } from '@rtl/shared'
import { api } from '@/app/services/api'

export const useOverviewStore = defineStore('overview', () => {
  const stats = ref<OverviewStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      stats.value = await api.overview()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'unknown error'
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, load }
})
