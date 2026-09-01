<script setup lang="ts">
import { ref } from 'vue'
import { ui } from '@pvzwiki/store/ui'

const props = defineProps<{
  hideTrigger?: boolean
}>()

function show(): void {
  ui.syncOpen = true
  void check()
}

defineExpose({ show })

interface AddedPlant {
  codename: string
  name: string
  englishName: string
  image: string
  world: string
  familyName: string | null
  summary: string | null
}

interface RemovedPlant {
  codename: string
  name: string
}

const loading = ref(false)
const applying = ref(false)
const error = ref<string | null>(null)
const done = ref(false)

const added = ref<AddedPlant[]>([])
const removed = ref<RemovedPlant[]>([])
const selectedAdd = ref<Set<string>>(new Set())
const selectedRemove = ref<Set<string>>(new Set())

async function check(): Promise<void> {
  ui.syncOpen = true
  loading.value = true
  error.value = null
  done.value = false
  added.value = []
  removed.value = []
  selectedAdd.value = new Set()
  selectedRemove.value = new Set()
  try {
    const res = await fetch('/api/pvz/sync/check', { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    added.value = data.added ?? []
    removed.value = data.removed ?? []
    selectedAdd.value = new Set((data.added ?? []).map((p: AddedPlant) => p.codename))
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function toggleAdd(code: string): void {
  const s = new Set(selectedAdd.value)
  if (s.has(code)) s.delete(code)
  else s.add(code)
  selectedAdd.value = s
}

function toggleRemove(code: string): void {
  const s = new Set(selectedRemove.value)
  if (s.has(code)) s.delete(code)
  else s.add(code)
  selectedRemove.value = s
}

async function apply(): Promise<void> {
  applying.value = true
  error.value = null
  try {
    const res = await fetch('/api/pvz/sync/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        add: [...selectedAdd.value],
        remove: [...selectedRemove.value],
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    done.value = true
    void data
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <button v-if="!props.hideTrigger" type="button" class="sync-trigger" title="与云端同步" @click="show">
    <span class="sync-trigger__icon">🔄</span>
    同步
  </button>

  <Transition name="sync">
    <div v-if="ui.syncOpen" class="sync-overlay" @click.self="ui.syncOpen = false">
      <div class="sync-panel" role="dialog" aria-modal="true" aria-label="与云端同步">
        <header class="sync-header">
          <h3>与云端同步</h3>
          <button type="button" class="sync-close" aria-label="关闭" @click="ui.syncOpen = false">×</button>
        </header>

        <div class="sync-body">
          <p v-if="loading" class="sync-hint">正在从云端获取数据…</p>
          <p v-else-if="error" class="sync-error">同步失败：{{ error }}</p>

          <template v-else-if="done">
            <p class="sync-hint sync-ok">同步完成，页面将自动刷新。</p>
          </template>

          <template v-else>
            <p v-if="!added.length && !removed.length" class="sync-hint">
              云端与本地一致，没有变更。
            </p>

            <div v-if="added.length" class="sync-section">
              <div class="sync-section-title">
                新增植物（{{ selectedAdd.size }}/{{ added.length }}）
                <button
                  type="button"
                  class="sync-select-all"
                  @click="selectedAdd = new Set(selectedAdd.size === added.length ? [] : added.map((p) => p.codename))"
                >
                  {{ selectedAdd.size === added.length ? '全不选' : '全选' }}
                </button>
              </div>
              <div class="sync-list">
                <label v-for="p in added" :key="p.codename" class="sync-item" :class="{ checked: selectedAdd.has(p.codename) }">
                  <input
                    type="checkbox"
                    :checked="selectedAdd.has(p.codename)"
                    @change="toggleAdd(p.codename)"
                  />
                  <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" />
                  <span class="sync-item-text">
                    <strong>{{ p.name }}</strong>
                    <small>{{ p.englishName }} · {{ p.familyName ?? p.world }}</small>
                  </span>
                </label>
              </div>
            </div>

            <div v-if="removed.length" class="sync-section">
              <div class="sync-section-title">
                云端已删除（{{ selectedRemove.size }}/{{ removed.length }}）
                <button
                  type="button"
                  class="sync-select-all"
                  @click="selectedRemove = new Set(selectedRemove.size === removed.length ? [] : removed.map((p) => p.codename))"
                >
                  {{ selectedRemove.size === removed.length ? '全不选' : '全选' }}
                </button>
              </div>
              <div class="sync-list">
                <label v-for="p in removed" :key="p.codename" class="sync-item" :class="{ checked: selectedRemove.has(p.codename) }">
                  <input
                    type="checkbox"
                    :checked="selectedRemove.has(p.codename)"
                    @change="toggleRemove(p.codename)"
                  />
                  <span class="sync-item-text">
                    <strong>{{ p.name }}</strong>
                    <small>{{ p.codename }}</small>
                  </span>
                </label>
              </div>
            </div>
          </template>
        </div>

        <footer v-if="!loading && !done" class="sync-footer">
          <button type="button" class="sync-btn sync-btn--ghost" @click="ui.syncOpen = false">关闭</button>
          <button
            type="button"
            class="sync-btn sync-btn--primary"
            :disabled="applying || (!selectedAdd.size && !selectedRemove.size)"
            @click="apply"
          >
            {{ applying ? '应用…' : '应用所选变更' }}
          </button>
        </footer>
        <footer v-else-if="done" class="sync-footer">
          <button type="button" class="sync-btn sync-btn--primary" @click="ui.syncOpen = false">完成</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sync-trigger {
  --wood: #4b321f;
  --wood-dark: #281a11;
  position: fixed;
  top: 1rem;
  right: 6.5rem;
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

.sync-trigger:hover {
  transform: translateY(-1px);
}

.sync-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  display: flex;
}

.sync-panel {
  box-sizing: border-box;
  width: min(560px, 100%);
  max-height: 88vh;
  flex-direction: column;
  background: #efe2b9;
  color: #2b241c;
  border: 3px solid #281a11;
  border-radius: 12px;
  box-shadow: 0 9px 0 #281a11;
  overflow: hidden;
  display: flex;
}

[data-theme='dark'] .sync-panel {
  background: #342d20;
  color: #f2e5c4;
  border-color: #8a6949;
}

.sync-header {
  background: #4b321f;
  color: #fff8dc;
  border-bottom: 3px solid #281a11;
  padding: 0.7rem 1rem;
  align-items: center;
  justify-content: space-between;
  flex: none;
  display: flex;
}

.sync-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.sync-close {
  background: none;
  border: none;
  color: #fff8dc;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.3rem;
}

.sync-body {
  overflow-y: auto;
  padding: 1rem;
  gap: 0.9rem;
  display: grid;
}

.sync-hint {
  margin: 0;
  color: #6d5a45;
  font-size: 0.95rem;
}

[data-theme='dark'] .sync-hint {
  color: #d4c19c;
}

.sync-ok {
  color: #315a2c;
}

.sync-error {
  margin: 0;
  color: #b8272c;
  font-size: 0.9rem;
}

.sync-section {
  gap: 0.5rem;
  display: grid;
}

.sync-section-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #6d5a45;
  align-items: center;
  justify-content: space-between;
  display: flex;
}

[data-theme='dark'] .sync-section-title {
  color: #d4c19c;
}

.sync-select-all {
  background: none;
  border: none;
  color: #4f8a45;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0;
}

.sync-list {
  gap: 0.4rem;
  display: grid;
}

.sync-item {
  background: #fff5d4;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.45rem 0.6rem;
  gap: 0.55rem;
  align-items: center;
  display: flex;
}

.sync-item.checked {
  border-color: #4f8a45;
  background: #e8f2df;
}

.sync-item input {
  flex: none;
  accent-color: #4f8a45;
  width: 1rem;
  height: 1rem;
}

.sync-item img {
  object-fit: contain;
  width: 2.4rem;
  height: 2rem;
  flex: none;
}

.sync-item-text {
  min-width: 0;
  gap: 0.1rem;
  display: grid;
}

.sync-item-text strong {
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-item-text small {
  color: #6d5a45;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-theme='dark'] .sync-item {
  background: #211c16;
  border-color: #856747;
}

[data-theme='dark'] .sync-item.checked {
  border-color: #4f8a45;
  background: #2b3a26;
}

[data-theme='dark'] .sync-item-text small {
  color: #d4c19c;
}

.sync-footer {
  border-top: 3px solid #281a11;
  padding: 0.7rem 1rem;
  justify-content: flex-end;
  gap: 0.6rem;
  flex: none;
  display: flex;
}

.sync-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.5rem 1.2rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
}

.sync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn--primary {
  color: #fff;
  background: #4f8a45;
}

.sync-btn--primary:hover:not(:disabled) {
  background: #315a2c;
}

.sync-btn--ghost {
  color: inherit;
  background: rgba(0, 0, 0, 0.08);
}

.sync-btn--ghost:hover {
  background: rgba(0, 0, 0, 0.16);
}

.sync-enter-active,
.sync-leave-active {
  transition: opacity 0.16s ease;
}

.sync-enter-from,
.sync-leave-to {
  opacity: 0;
}
</style>
