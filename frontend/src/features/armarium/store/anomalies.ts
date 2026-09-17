import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/app/services/api'
import type { Anomaly } from '@rtl/shared'

export const useAnomaliesStore = defineStore('armarium-anomalies', () => {
  const list = ref<Anomaly[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load(): Promise<void> {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      list.value = await api.list<Anomaly>('anomalies')
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
