<script setup lang="ts">
import { ref } from 'vue'
import type { TermGroup, TermItem } from '@rtl/shared'
import { baseTermGroups, mechanicGroups } from '@rtl/shared'

const emit = defineEmits<{ (e: 'insert', text: string): void }>()

const showMenu = ref(false)
const showMech = ref(false)

function insert(item: TermItem): void {
  emit('insert', item.hasParam ? `${item.name} X层` : item.name)
  showMenu.value = false
}

function insertMech(item: TermItem): void {
  emit('insert', item.hasParam ? `${item.name} X层` : item.name)
  showMech.value = false
}

function groupLabel(g: TermGroup): string {
  return g.label
}
</script>

<template>
  <div class="term-inserter">
    <button type="button" class="ins-btn" @click="showMenu = !showMenu">📘 插入术语</button>
    <button type="button" class="ins-btn" @click="showMech = true">⚙️ 机制状态</button>

    <div v-if="showMenu" class="term-menu" @mouseleave="showMenu = false">
      <section v-for="g in baseTermGroups" :key="groupLabel(g)" class="term-group">
        <h4>{{ groupLabel(g) }}</h4>
        <div class="term-grid">
          <button
            v-for="item in g.items"
            :key="item.name"
            type="button"
            class="term-item"
            :title="item.desc"
            @click="insert(item)"
          >
            {{ item.name }}
          </button>
        </div>
      </section>
    </div>

    <div v-if="showMech" class="overlay" @click.self="showMech = false">
      <div class="mech-modal">
        <header class="mech-head">
          <h3>机制类状态</h3>
          <button type="button" class="close" @click="showMech = false">✕</button>
        </header>
        <div class="mech-body">
          <section v-for="g in mechanicGroups" :key="groupLabel(g)" class="term-group">
            <h4>{{ groupLabel(g) }}</h4>
            <div class="term-grid">
              <button
                v-for="item in g.items"
                :key="item.name"
                type="button"
                class="term-item"
                :title="item.desc"
                @click="insertMech(item)"
              >
                {{ item.name }}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.term-inserter {
  display: inline-block;
  position: relative;
}
.ins-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  color: var(--color-ink-dim);
  border-radius: var(--radius);
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 6px;
  white-space: nowrap;
}
.ins-btn:hover {
  color: var(--color-ink);
  border-color: var(--accent);
}
.term-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  width: 320px;
  max-height: 340px;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}
.term-group h4 {
  margin: 8px 0 4px;
  font-size: 12px;
  color: var(--accent);
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 2px;
  letter-spacing: 0.04em;
}
.term-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.term-item {
  font-size: 11px;
  color: var(--color-ink);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  white-space: nowrap;
}
.term-item:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 13, 9, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.mech-modal {
  width: 720px;
  max-width: 92vw;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius) * 2);
  padding: 16px;
}
.mech-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.mech-head h3 {
  margin: 0;
  color: var(--accent);
}
.close {
  background: none;
  border: none;
  color: var(--color-ink-dim);
  font-size: 18px;
  cursor: pointer;
}
.mech-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
</style>
