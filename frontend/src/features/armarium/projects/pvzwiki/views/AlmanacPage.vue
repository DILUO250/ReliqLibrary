<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlmanacHero from '@pvzwiki/components/AlmanacHero.vue'
import FilterBoard from '@pvzwiki/components/FilterBoard.vue'
import PlantCard from '@pvzwiki/components/PlantCard.vue'
import PlantCreateDialog from '@pvzwiki/components/PlantCreateDialog.vue'
import Toolbar from '@pvzwiki/components/Toolbar.vue'
import type { WorldInfo, FamilyInfo, PlantEntity } from '@pvzwiki/types/plant'
import { plants, getWorlds, getFamilies, filterPlants } from '@pvzwiki/data/plants'

const route = useRoute()
const router = useRouter()
const kind = computed<'plant' | 'zombie'>(() => (route.path.includes('zombies') ? 'zombie' : 'plant'))

const searchQuery = ref('')
const familyCode = ref('')
const worldCode = ref('')

const createOpen = ref(false)

const currentPlants = computed(() => (kind.value === 'plant' ? plants : []))

const worlds = computed<WorldInfo[]>(() => getWorlds(currentPlants.value))
const families = computed<FamilyInfo[]>(() => getFamilies(currentPlants.value))

const filteredPlants = computed<PlantEntity[]>(() =>
  filterPlants(currentPlants.value, searchQuery.value, familyCode.value, worldCode.value),
)

function onPlantCreated(entity: PlantEntity): void {
  createOpen.value = false
  void router.push(`/armarium/project/pvz/plants/${entity.codename}`)
}

watch(kind, () => {
  searchQuery.value = ''
  familyCode.value = ''
  worldCode.value = ''
})
</script>

<template>
  <div class="almanac-shell almanac-shell--plant">
    <AlmanacHero :kind="kind" />

    <FilterBoard
      v-model:search-query="searchQuery"
      v-model:world-code="worldCode"
      v-model:family-code="familyCode"
      :worlds="worlds"
      :families="families"
      :result-count="filteredPlants.length"
      :kind="kind"
    />

    <div v-if="filteredPlants.length" class="packet-grid">
      <PlantCard
        v-for="p in filteredPlants"
        :key="p.codename"
        :plant="p"
      />
    </div>
    <p v-else class="empty-state">没有找到符合条件的条目。</p>

    <PlantCreateDialog
      :open="createOpen"
      mode="create"
      @close="createOpen = false"
      @saved="onPlantCreated"
    />

    <Toolbar v-if="kind === 'plant'" @create="createOpen = true" />
  </div>
</template>

<style scoped>
.almanac-shell {
  --almanac-wood: #4b321f;
  --almanac-wood-dark: #2b1c13;
  --almanac-paper: #efe2b9;
  --almanac-paper-deep: #dbc58f;
  --almanac-ink: #2b241c;
  --almanac-accent: #4f8a45;
  --almanac-accent-dark: #315a2c;
  box-sizing: border-box;
  width: min(944px, 100vw - 2rem);
  color: var(--almanac-ink);
  margin-top: 0.75rem;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.packet-grid {
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1.1rem;
  display: grid;
}

.empty-state {
  color: #6d5a45;
  background: var(--almanac-paper);
  text-align: center;
  border: 3px dashed #a9895c;
  border-radius: 12px;
  padding: 3rem 1rem;
  font-weight: 700;
}

[data-theme='dark'] .almanac-shell {
  --almanac-paper: #342d20;
  --almanac-paper-deep: #463a29;
  --almanac-ink: #f2e5c4;
}

[data-theme='dark'] .empty-state {
  border-color: #8a6949;
}

@media (max-width: 560px) {
  .almanac-shell {
    width: calc(100vw - 1rem);
  }
  .packet-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }
}
</style>
