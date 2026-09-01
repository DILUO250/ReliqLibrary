<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PlantEntity } from '@pvzwiki/types/plant'
import { WORLD_BG_MAP } from '@pvzwiki/types/plant'
import { pvzAsset } from '@pvzwiki/asset'
import { resolveCardSrc, resolveImageSrc } from '@pvzwiki/store/plantImage'
import { PLANT_PLACEHOLDER_IMAGE } from '@pvzwiki/store/customPlants'

const props = defineProps<{
  plant: PlantEntity
}>()

function worldBg(world: string): string {
  const bgCode = WORLD_BG_MAP[world] ?? 'default'
  return pvzAsset(`/assets/image/almanac/backgrounds/${bgCode}.webp`)
}

// 自定义植物：优先卡片图（240x152 生成卡）→ 上传立绘 → 占位卡面
const displayImage = ref(props.plant.image || PLANT_PLACEHOLDER_IMAGE)

onMounted(() => {
  if (!props.plant.custom) return
  void resolveCardSrc(props.plant.codename)
    .then((card) => {
      if (card) {
        displayImage.value = card
        return undefined
      }
      return resolveImageSrc(props.plant.codename).then((portrait) => {
        displayImage.value = portrait ?? props.plant.image ?? PLANT_PLACEHOLDER_IMAGE
      })
    })
    .catch(() => {
      // keep current fallback
    })
})
</script>

<template>
  <RouterLink :to="`/armarium/project/pvz/plants/${props.plant.codename}`" class="entity-packet">
    <img
      v-if="props.plant.family"
      class="entity-packet__family-icon"
      :src="props.plant.family.icon"
      :alt="props.plant.family.name"
      :title="props.plant.family.name"
      loading="lazy"
      width="34"
      height="35"
    />

    <span v-if="props.plant.custom" class="entity-packet__custom-badge" title="自制植物档案">自制</span>

    <div class="entity-packet__art">
      <img
        class="entity-packet__background"
        :src="worldBg(props.plant.world)"
        alt=""
        loading="lazy"
        decoding="async"
        width="554"
        height="546"
      />
      <img
        class="entity-packet__entity-image"
        :src="displayImage"
        :alt="props.plant.name"
        loading="lazy"
        width="180"
        height="140"
      />
    </div>

    <div class="entity-packet__body">
      <strong>{{ props.plant.name }}</strong>
      <span class="entity-packet__codename">{{ props.plant.codename }}</span>
      <span v-if="props.plant.summary" class="entity-packet__summary">
        {{ props.plant.summary }}
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.entity-packet {
  min-width: 0;
  color: var(--almanac-ink);
  border: 3px solid var(--almanac-wood);
  background: var(--almanac-paper);
  box-shadow: 0 6px 0 var(--almanac-wood-dark);
  border-radius: 13px 13px 8px 8px;
  flex-direction: column;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  position: relative;
  overflow: hidden;
}

.entity-packet:hover {
  color: var(--almanac-ink);
  box-shadow: 0 9px 0 var(--almanac-wood-dark);
  transform: translateY(-3px);
}

.entity-packet:focus-visible {
  outline-offset: 3px;
  outline: 3px solid #e1a83a;
}

.entity-packet__family-icon {
  z-index: 3;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 2px 1px #2b1c1052);
  width: 2.15rem;
  height: 2.2rem;
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
}

.entity-packet__custom-badge {
  z-index: 3;
  color: #fff8dc;
  background: #b07838;
  border: 2px solid #7a4f1d;
  border-radius: 999px;
  pointer-events: none;
  padding: 0.1rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 800;
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  box-shadow: inset 0 -2px 0 #00000033;
}

.entity-packet__art {
  border-bottom: 3px solid var(--almanac-wood);
  background-color: #8fbd73;
  place-items: center;
  height: 145px;
  display: grid;
  position: relative;
  overflow: hidden;
}

.entity-packet__art::before {
  z-index: 1;
  content: "";
  background: #2b241c24;
  border-top: 0;
  position: absolute;
  inset: 0;
}

.entity-packet__background {
  z-index: 0;
  object-fit: cover;
  pointer-events: none;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.entity-packet__entity-image {
  z-index: 2;
  object-fit: contain;
  filter: drop-shadow(0 6px 3px #1e171157);
  width: min(88%, 180px);
  height: 132px;
}

.entity-packet__body {
  gap: 0.18rem;
  padding: 0.85rem 0.9rem 1rem;
  display: grid;
}

.entity-packet__body strong {
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.18rem;
  line-height: 1.2;
  overflow: hidden;
}

.entity-packet__codename {
  color: #6d5a45;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  overflow: hidden;
}

.entity-packet__summary {
  color: #514332;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.65em;
  margin-top: 0.38rem;
  font-size: 0.83rem;
  line-height: 1.35;
  display: -webkit-box;
  overflow: hidden;
}

[data-theme='dark'] .entity-packet {
  border-color: #8a6949;
}

[data-theme='dark'] .entity-packet__codename,
[data-theme='dark'] .entity-packet__summary {
  color: #d4c19c;
}

@media (max-width: 560px) {
  .entity-packet__art {
    height: 126px;
  }
  .entity-packet__art img {
    height: 116px;
  }
  .entity-packet__body {
    padding: 0.7rem;
  }
  .entity-packet__body strong {
    font-size: 1rem;
  }
  .entity-packet__summary {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .entity-packet {
    transition: none;
  }
  .entity-packet:hover {
    transform: none;
  }
}
</style>
