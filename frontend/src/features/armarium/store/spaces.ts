import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/app/services/api'
import type { SupernaturalSpace } from '@rtl/shared'

export const useSpacesStore = defineStore('armarium-spaces', () => {
  const list = ref<SupernaturalSpace[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load(): Promise<void> {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      list.value = await api.list<SupernaturalSpace>('supernatural_spaces')
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
