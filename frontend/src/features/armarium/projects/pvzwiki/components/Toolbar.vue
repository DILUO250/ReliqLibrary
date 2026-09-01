<script setup lang="ts">
import { ui } from '@pvzwiki/store/ui'

const emit = defineEmits<{
  create: []
}>()

function openSync(): void {
  ui.syncOpen = true
}

function openDictionary(): void {
  ui.dictionaryOpen = true
}
</script>

<template>
  <div class="pvz-toolbar" role="toolbar" aria-label="植物百科工具">
    <button type="button" class="pvz-toolbar__btn pvz-toolbar__btn--create" title="新建植物档案" @click="emit('create')">
      <span class="pvz-toolbar__icon" aria-hidden="true">✿</span>
      <span>新建植物</span>
    </button>
    <button type="button" class="pvz-toolbar__btn" title="与云端同步" @click="openSync">
      <span class="pvz-toolbar__icon" aria-hidden="true">🔄</span>
      <span>同步</span>
    </button>
    <button type="button" class="pvz-toolbar__btn" title="词条字典 (F)" @click="openDictionary">
      <span class="pvz-toolbar__icon" aria-hidden="true">📖</span>
      <span>词典</span>
    </button>
  </div>
</template>

<style scoped>
.pvz-toolbar {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pvz-toolbar__btn {
  --wood: #4b321f;
  --wood-dark: #281a11;
  box-sizing: border-box;
  height: 2.4rem;
  color: #fff8dc;
  background: var(--wood);
  border: 2px solid var(--wood-dark);
  border-radius: 999px;
  padding: 0 1rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  display: inline-flex;
  box-shadow: 0 3px 0 var(--wood-dark);
  transition: transform 0.15s;
  white-space: nowrap;
}

.pvz-toolbar__btn--create {
  background: var(--almanac-accent, #4f8a45);
  border-color: #315a2c;
  box-shadow: 0 3px 0 #315a2c;
}

.pvz-toolbar__btn:hover {
  transform: translateY(-1px);
}

.pvz-toolbar__btn:focus-visible {
  outline-offset: 3px;
  outline: 3px solid #e1a83a;
}

.pvz-toolbar__icon {
  font-size: 1rem;
  line-height: 1;
}
</style>
