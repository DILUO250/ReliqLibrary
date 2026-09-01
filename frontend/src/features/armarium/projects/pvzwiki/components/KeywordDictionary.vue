<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { keywords } from '@pvzwiki/data/keywords'
import { ui } from '@pvzwiki/store/ui'
import { isEditableTarget } from '@pvzwiki/utils/keyboard'

const props = defineProps<{
  hideTrigger?: boolean
}>()

const open = computed({
  get: () => ui.dictionaryOpen,
  set: (v: boolean) => {
    ui.dictionaryOpen = v
  },
})

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    if (ui.dictionaryOpen) {
      e.preventDefault()
      ui.dictionaryOpen = false
    }
    return
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key.toLowerCase() === 'f' && !isEditableTarget(e.target) && !ui.dictionaryOpen) {
    e.preventDefault()
    ui.dictionaryOpen = true
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <button v-if="!props.hideTrigger" type="button" class="kd-trigger" title="词条字典 (F)" @click="open = true">
    <span class="kd-trigger__icon">📖</span>
    词典
  </button>

  <Transition name="kd">
    <div v-if="open" class="kd-overlay" @click.self="open = false">
      <div class="kd-panel" role="dialog" aria-modal="true" aria-label="词条字典">
        <header class="kd-header">
          <h2>词条字典</h2>
          <button type="button" class="kd-close" aria-label="关闭" @click="open = false">
            ×
          </button>
        </header>
        <div class="kd-body">
          <div v-for="k in keywords" :key="k.id" class="kd-item">
            <strong>{{ k.name }}</strong>
            <p>{{ k.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.kd-trigger {
  --wood: #4b321f;
  --wood-dark: #281a11;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 900;
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
}

.kd-trigger:hover {
  transform: translateY(-1px);
}

.kd-trigger__icon {
  font-size: 1rem;
}

.kd-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  display: flex;
}

.kd-panel {
  --wood: #4b321f;
  --wood-dark: #281a11;
  --paper: #efe2b9;
  --ink: #2b241c;
  --muted: #6d5a45;
  box-sizing: border-box;
  width: min(680px, 100%);
  max-height: 82vh;
  flex-direction: column;
  color: var(--ink);
  background: var(--paper);
  border: 3px solid var(--wood-dark);
  border-radius: 12px;
  box-shadow: 0 9px 0 var(--wood-dark);
  overflow: hidden;
  display: flex;
}

.kd-header {
  background: var(--wood);
  color: #fff8dc;
  border-bottom: 3px solid var(--wood-dark);
  padding: 0.8rem 1rem;
  align-items: center;
  justify-content: space-between;
  flex: none;
  display: flex;
  box-shadow: inset 0 2px 0 #ffffff1f;
}

.kd-header h2 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
}

.kd-close {
  background: none;
  border: none;
  color: #fff8dc;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.35rem;
}

.kd-close:hover {
  color: #fff;
}

.kd-body {
  overflow-y: auto;
  padding: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  display: grid;
}

.kd-item {
  background: #fff5d4;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
}

.kd-item strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.kd-item p {
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* dark theme */
[data-theme='dark'] .kd-panel {
  --paper: #342d20;
  --ink: #f2e5c4;
  --muted: #d4c19c;
}

[data-theme='dark'] .kd-item {
  background: #211c16;
  border-color: #856747;
}

@media (max-width: 600px) {
  .kd-body {
    grid-template-columns: 1fr;
  }
  .kd-overlay {
    padding: 1rem;
  }
}

/* transition */
.kd-enter-active,
.kd-leave-active {
  transition: opacity 0.18s ease;
}

.kd-enter-from,
.kd-leave-to {
  opacity: 0;
}
</style>
