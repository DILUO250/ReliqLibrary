<script setup lang="ts">
import type { WorldInfo, FamilyInfo } from '@pvzwiki/types/plant'
import { pvzImagePath } from '@pvzwiki/asset'

const allFamilyIcon = pvzImagePath('/assets/wikicon/All_familyicon.webp')

defineProps<{
  searchQuery: string
  worldCode: string
  familyCode: string
  worlds: WorldInfo[]
  families: FamilyInfo[]
  resultCount: number
  kind: 'plant' | 'zombie'
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:worldCode': [value: string]
  'update:familyCode': [value: string]
}>()
</script>

<template>
  <section class="filter-board" aria-label="搜索">
    <label class="search-field">
      <span>搜索</span>
      <input
        type="search"
        :value="searchQuery"
        placeholder="搜索名称、英文名、代号或编号"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label class="select-field">
      <span>世界</span>
      <select
        :value="worldCode"
        @change="emit('update:worldCode', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">全部世界</option>
        <option v-for="w in worlds" :key="w.code" :value="w.code">
          {{ w.name }}
        </option>
      </select>
    </label>

    <output class="result-count" aria-live="polite">{{ resultCount }} 项</output>

    <fieldset v-if="kind === 'plant'" class="family-field">
      <legend>家族</legend>
      <div class="family-picker">
        <button
          type="button"
          class="family-option family-option--all"
          :class="{ active: familyCode === '' }"
          :aria-pressed="familyCode === ''"
          title="全部家族"
          aria-label="全部家族"
          @click="emit('update:familyCode', '')"
        >
          <img
            :src="allFamilyIcon"
            alt=""
            width="42"
            height="42"
          />
        </button>
        <button
          v-for="f in families"
          :key="f.code"
          type="button"
          class="family-option"
          :class="{ active: familyCode === f.code }"
          :aria-pressed="familyCode === f.code"
          :title="f.name"
          :aria-label="f.name"
          @click="emit('update:familyCode', f.code)"
        >
          <img :src="f.icon" alt="" width="42" height="42" />
        </button>
      </div>
    </fieldset>
  </section>
</template>

<style scoped>
.filter-board {
  box-sizing: border-box;
  border: 3px solid var(--almanac-wood);
  background: var(--almanac-paper);
  border-radius: 10px;
  grid-template-columns: minmax(15rem, 2fr) minmax(9rem, 1fr) auto;
  align-items: end;
  gap: 0.85rem;
  margin: 1.3rem 0;
  padding: 1rem;
  display: grid;
  box-shadow: 0 5px #4b321f47;
}

.search-field,
.select-field,
.family-field legend {
  color: #695038;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  gap: 0.35rem;
  min-width: 0;
  font-size: 0.78rem;
  font-weight: 800;
  display: grid;
}

.search-field input,
.select-field select {
  box-sizing: border-box;
  width: 100%;
  height: 2.75rem;
  color: var(--almanac-ink);
  font: inherit;
  letter-spacing: normal;
  text-transform: none;
  background: #fff9e3;
  border: 2px solid #9a7a4c;
  border-radius: 7px;
  outline: none;
  padding: 0 0.8rem;
  font-size: 0.94rem;
  font-weight: 600;
}

.search-field input:focus-visible,
.select-field select:focus-visible,
.family-option:focus-visible {
  outline-offset: 3px;
  outline: 3px solid #e1a83a;
}

.result-count {
  color: #695038;
  text-align: right;
  align-self: center;
  min-width: 4.7rem;
  padding-bottom: 0.55rem;
  font-weight: 800;
}

.family-field {
  grid-column: 1 / -1;
  border: none;
  padding: 0;
  margin: 0;
}

.family-field legend {
  padding: 0 0 0.35rem;
}

.family-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
}

.family-option {
  width: 3.35rem;
  height: 3.35rem;
  box-shadow: none;
  cursor: pointer;
  background: 0 0;
  border: 0;
  border-radius: 50%;
  flex: 0 0 3.35rem;
  place-items: center;
  padding: 0.3rem;
  transition: transform 0.14s;
  display: grid;
  position: relative;
}

.family-option::after {
  content: "";
  pointer-events: none;
  border: 2px solid #0000;
  border-radius: 50%;
  transition: border-color 0.14s, box-shadow 0.14s;
  position: absolute;
  inset: 0.12rem;
}

.family-option img {
  object-fit: contain;
  filter: drop-shadow(0 2px 1px #2b1c1047);
  border-radius: 50%;
  width: 2.75rem;
  height: 2.75rem;
}

.family-option:hover {
  transform: translateY(-1px);
}

.family-option:hover::after {
  border-color: #e1a83ab8;
}

.family-option.active::after {
  border-color: var(--almanac-accent-dark);
  box-shadow: 0 0 0 2px #e1a83a, 0 0 8px #e1a83a75;
}

[data-theme='dark'] .family-option.active::after {
  border-color: var(--almanac-accent);
}

/* dark theme overrides */
[data-theme='dark'] .filter-board {
  border-color: #8a6949;
}

[data-theme='dark'] .search-field,
[data-theme='dark'] .select-field,
[data-theme='dark'] .family-field legend,
[data-theme='dark'] .result-count {
  color: #d4c19c;
}

[data-theme='dark'] .search-field input,
[data-theme='dark'] .select-field select {
  color: #f5e9c8;
  background: #211c16;
  border-color: #8a6949;
}

@media (max-width: 820px) {
  .filter-board {
    grid-template-columns: 1fr 1fr;
  }
  .search-field {
    grid-column: 1 / -1;
  }
  .result-count {
    justify-self: end;
  }
}

@media (max-width: 560px) {
  .filter-board {
    grid-template-columns: 1fr;
  }
  .search-field,
  .result-count {
    grid-column: auto;
  }
  .family-option {
    scroll-snap-align: start;
  }
}
</style>
