<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { BattleCard } from '@rtl/shared'
import type { PrivateTerm } from '@/features/turris/terms/renderer'
import VisualCard from '@/features/turris/card/VisualCard.vue'

defineProps<{ card: BattleCard; privateTerms?: PrivateTerm[] }>()
const host = ref<HTMLElement | null>(null)
const width = ref(300)
let observer: ResizeObserver | null = null

onMounted(() => {
  if (!host.value) return
  observer = new ResizeObserver(([entry]) => {
    const next = Math.round(entry?.contentRect.width ?? 300)
    if (next > 0) width.value = next
  })
  observer.observe(host.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="host" class="responsive-visual-card">
    <VisualCard
      :card="card"
      :width="width"
      :min-height="Math.round(width * 1.7)"
      cost-label="光芒"
      :private-terms="privateTerms"
      render-terms
    />
  </div>
</template>

<style scoped>
.responsive-visual-card { width: 100%; min-width: 0; }
</style>
