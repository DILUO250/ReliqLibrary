<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Floor, Librarian, LibrarianSheet, BattleSystemId } from '@rtl/shared'
import { BATTLE_SYSTEMS, parseSheet, toRoman } from '@rtl/shared'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import cardIcon from '@/features/turris/assets/cardIcon.png'
import FloorEditorModal from './FloorEditorModal.vue'
import LibrarianEditorModal from './LibrarianEditorModal.vue'
import DeckPreviewModal from './DeckPreviewModal.vue'

const floors = ref<Floor[]>([])
const librarians = ref<Librarian[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const expandedId = ref<number | null>(null)

const saving = ref(false)
const saveError = ref<string | null>(null)

const floorModal = ref<{ open: boolean; floor: Floor | null }>({ open: false, floor: null })
const libModal = ref<{ open: boolean; librarian: Librarian | null; floorId: number | null }>({
  open: false,
  librarian: null,
  floorId: null,
})
const preview = ref<{ open: boolean; librarian: Librarian | null }>({ open: false, librarian: null })

const dragFloorId = ref<number | null>(null)
const dragLibId = ref<number | null>(null)

const floorsSorted = computed(() =>
  [...floors.value].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
)

function libSort(a: Librarian, b: Librarian): number {
  return a.sortOrder - b.sortOrder || a.id - b.id
}

const libsByFloor = computed<Map<number, Librarian[]>>(() => {
  const map = new Map<number, Librarian[]>()
  for (const l of librarians.value) {
    if (l.floorId == null) continue
    const arr = map.get(l.floorId) ?? []
    arr.push(l)
    map.set(l.floorId, arr)
  }
  for (const arr of map.values()) arr.sort(libSort)
  return map
})

const orphanLibs = computed<Librarian[]>(() =>
  librarians.value.filter((l) => l.floorId == null).sort(libSort),
)

const romanMap = computed<Map<number, string>>(() => {
  const map = new Map<number, string>()
  let n = 0
  const assign = (arr: Librarian[]) => {
    for (const l of arr) {
      n += 1
      map.set(l.id, toRoman(n))
    }
  }
  for (const f of floorsSorted.value) assign(libsByFloor.value.get(f.id) ?? [])
  assign(orphanLibs.value)
  return map
})

const flLibsByFloor = computed(() => {
  const m = new Map<number, Librarian[]>()
  for (const f of floorsSorted.value) m.set(f.id, libsByFloor.value.get(f.id) ?? [])
  return m
})

function sheetOf(row: Librarian): LibrarianSheet | null {
  return parseSheet(row.sheet)
}

function coreName(row: Librarian): string {
  return row.title?.trim() || '核心书页未填写'
}

function deckCount(row: Librarian): number {
  const s = sheetOf(row)
  if (!s) return 0
  return s.cards.combat.length + s.cards.special.length + (s.cards.ego?.length ?? 0)
}

function systemCode(row: Librarian): string {
  const s = sheetOf(row)
  return s ? BATTLE_SYSTEMS[s.battleSystem]?.code ?? '' : ''
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [fl, lib] = await Promise.all([api.list<Floor>('floors'), api.list<Librarian>('librarians')])
    floors.value = fl
    librarians.value = lib
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function toggleFloor(id: number): void {
  expandedId.value = expandedId.value === id ? null : id
}

/* ---------- floor CRUD ---------- */
function openFloorCreate(): void {
  floorModal.value = { open: true, floor: null }
}
function openFloorEdit(f: Floor): void {
  floorModal.value = { open: true, floor: f }
}
async function saveFloor(payload: Record<string, unknown>): Promise<void> {
  saving.value = true
  saveError.value = null
  try {
    if (floorModal.value.floor) {
      await api.update('floors', floorModal.value.floor.id, payload)
    } else {
      await api.create('floors', payload)
    }
    showToast(floorModal.value.floor ? '楼层已保存' : '楼层已创建')
    await load()
    floorModal.value = { open: false, floor: null }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}
async function removeFloor(f: Floor): Promise<void> {
  if (!window.confirm(`确定删除楼层「${f.code || f.name}」及其司书吗？`)) return
  try {
    await api.remove('floors', f.id)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

/* ---------- librarian CRUD ---------- */
function openLibCreate(floorId: number | null): void {
  libModal.value = { open: true, librarian: null, floorId }
}
function openLibEdit(l: Librarian): void {
  libModal.value = { open: true, librarian: l, floorId: l.floorId }
}
async function saveLibrarian(payload: Record<string, unknown>): Promise<void> {
  saving.value = true
  saveError.value = null
  try {
    const raw = (payload.sortOrder as number) ?? null
    if (libModal.value.librarian) {
      await api.update('librarians', libModal.value.librarian.id, payload)
    } else {
      const floorId = payload.floorId as number | null
      const order = floorId != null ? (flLibsByFloor.value.get(floorId)?.length ?? 0) : orphanLibs.value.length
      const withOrder = { ...payload, sortOrder: raw ?? order }
      await api.create('librarians', withOrder)
    }
    showToast(libModal.value.librarian ? '司书已保存' : '司书已创建')
    await load()
    libModal.value = { open: false, librarian: null, floorId: null }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}
async function removeLibrarian(l: Librarian): Promise<void> {
  if (!window.confirm(`确定删除司书「${l.name}」吗？`)) return
  try {
    await api.remove('librarians', l.id)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

function openPreview(l: Librarian): void {
  preview.value = { open: true, librarian: l }
}

/* ---------- drag reorder ---------- */
function reorderFloors(srcId: number, targetId: number): void {
  const list = [...floorsSorted.value]
  const from = list.findIndex((f) => f.id === srcId)
  const to = list.findIndex((f) => f.id === targetId)
  if (from < 0 || to < 0 || from === to) return
  const [moved] = list.splice(from, 1)
  list.splice(to, 0, moved!)
  list.forEach((f, i) => (f.sortOrder = i + 1))
  floors.value = list
  persistFloorsOrder(list)
}

async function persistFloorsOrder(list: Floor[]): Promise<void> {
  for (const f of list) {
    await api.update('floors', f.id, { sortOrder: f.sortOrder })
  }
}

function reorderLibs(srcId: number, targetId: number): void {
  const srcFloor = librarians.value.find((l) => l.id === srcId)?.floorId ?? null
  const tgtFloor = librarians.value.find((l) => l.id === targetId)?.floorId ?? null
  if (srcFloor == null || srcFloor !== tgtFloor) return
  const list = [...(flLibsByFloor.value.get(srcFloor) ?? [])]
  const from = list.findIndex((l) => l.id === srcId)
  const to = list.findIndex((l) => l.id === targetId)
  if (from < 0 || to < 0 || from === to) return
  const [moved] = list.splice(from, 1)
  list.splice(to, 0, moved!)
  list.forEach((l, i) => (l.sortOrder = i + 1))
  // mutate main array to reflect new order for that floor
  const others = librarians.value.filter((l) => l.floorId !== srcFloor || !list.some((x) => x.id === l.id))
  librarians.value = [...others, ...list.map((l) => ({ ...l }))]
  persistLibsOrder(list)
}

async function persistLibsOrder(list: Librarian[]): Promise<void> {
  for (const l of list) {
    await api.update('librarians', l.id, { sortOrder: l.sortOrder })
  }
}

function onFloorDrop(id: number): void {
  if (dragFloorId.value != null && dragFloorId.value !== id) {
    reorderFloors(dragFloorId.value, id)
  }
  dragFloorId.value = null
}

function onLibDrop(id: number): void {
  if (dragLibId.value != null && dragLibId.value !== id) {
    reorderLibs(dragLibId.value, id)
  }
  dragLibId.value = null
}

const nextRoman = computed(() => toRoman(librarians.value.length + 1))

/* ---------- 展开动画（height + opacity） ---------- */
function finishOnTransition(el: HTMLElement, done: () => void): void {
  let ended = false
  let timer = 0
  const end = () => {
    if (ended) return
    ended = true
    clearTimeout(timer)
    el.removeEventListener('transitionend', end)
    done()
  }
  el.addEventListener('transitionend', end)
  timer = window.setTimeout(end, 380)
}
function slideEnter(el: Element, done: () => void): void {
  const e = el as HTMLElement
  e.style.overflow = 'hidden'
  e.style.height = '0px'
  e.style.opacity = '0'
  e.style.transition = 'height 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease'
  requestAnimationFrame(() => {
    e.style.height = `${e.scrollHeight}px`
    e.style.opacity = '1'
  })
  finishOnTransition(e, done)
}
function slideAfterEnter(el: Element): void {
  const e = el as HTMLElement
  e.style.height = ''
  e.style.opacity = ''
  e.style.overflow = ''
  e.style.transition = ''
}
function slideLeave(el: Element, done: () => void): void {
  const e = el as HTMLElement
  e.style.overflow = 'hidden'
  e.style.height = `${e.scrollHeight}px`
  e.style.opacity = '1'
  e.offsetHeight
  e.style.transition = 'height 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease'
  e.style.height = '0px'
  e.style.opacity = '0'
  finishOnTransition(e, done)
}

onMounted(load)
</script>

<template>
  <div>
    <header class="page-header">
      <div class="page-header__eyebrow latin">Contignationes &amp; Curatores</div>
      <h1 class="page-header__title">楼层 · 司书</h1>
      <p class="page-header__desc">
        点击楼层卡片展开该楼层司书，拖动卡片角落的小三角可调整排序，编号会随展示顺序动态变化。
      </p>
    </header>

    <div class="toolbar">
      <button class="btn btn--primary" @click="openFloorCreate">＋ 新建楼层</button>
      <span v-if="loading" class="hint">加载中…</span>
      <span v-if="error" class="error">{{ error }}</span>
    </div>

    <div v-if="saveError" class="error banner">{{ saveError }}</div>

    <div v-if="!loading && floors.length === 0 && librarians.length === 0" class="empty-state">
      <div class="empty-state__title">还没有楼层</div>
      <p class="kai" style="font-size: 13px">点击「新建楼层」开始录入。</p>
    </div>

    <div class="floors">
      <section v-for="f in floorsSorted" :key="f.id" class="floor" :class="{ 'is-open': expandedId === f.id }">
        <article
          class="floor-card"
          @click="toggleFloor(f.id)"
          @dragover.prevent
          @drop.prevent="onFloorDrop(f.id)"
        >
          <button
            type="button"
            class="drag-handle"
            draggable="true"
            title="按住拖动调整楼层顺序"
            @click.stop
            @dragstart.prevent="dragFloorId = f.id"
            @dragend="dragFloorId = null"
          ></button>
          <div class="floor-card__art">
            <img v-if="f.artwork" :src="f.artwork" :alt="f.designation || f.name" />
            <div v-else class="art-ph">无背景图</div>
            <div class="art-shade"></div>
          </div>
          <div class="floor-card__body">
            <div class="floor-card__meta">
              <span class="chip chip--accent">{{ f.code || '未编号' }}</span>
              <span class="chip">{{ BATTLE_SYSTEMS[f.battleSystem]?.code ?? f.battleSystem }}</span>
              <span class="chip">司书 {{ flLibsByFloor.get(f.id)?.length ?? 0 }}</span>
            </div>
            <h2 class="floor-card__name">{{ f.designation || f.name }}</h2>
            <p class="floor-card__theme">{{ f.theme || '（未填写风格）' }}</p>
          </div>
          <button type="button" class="chevron" @click.stop="toggleFloor(f.id)">
            {{ expandedId === f.id ? '▲' : '▼' }}
          </button>
        </article>

        <Transition
          :css="false"
          @enter="slideEnter"
          @after-enter="slideAfterEnter"
          @leave="slideLeave"
        >
          <div
            v-if="expandedId === f.id"
            class="floor-detail"
            @dragover.prevent
            @drop.prevent="onFloorDrop(f.id)"
          >
            <div class="floor-actions">
              <button class="btn" @click="openFloorEdit(f)">编辑楼层</button>
              <button class="btn btn--danger" @click="removeFloor(f)">删除楼层</button>
              <button class="btn btn--primary" @click="openLibCreate(f.id)">＋ 添加司书</button>
            </div>

            <div v-if="(flLibsByFloor.get(f.id)?.length ?? 0) === 0" class="empty-state empty-state--sm">
              <div class="empty-state__title">本楼层暂无司书</div>
            </div>

            <div v-else class="lib-grid">
              <article
                v-for="l in flLibsByFloor.get(f.id)"
                :key="l.id"
                class="lib-card"
                @dragover.prevent
                @drop.prevent="onLibDrop(l.id)"
              >
                <button
                  type="button"
                  class="drag-handle drag-handle--sm"
                  draggable="true"
                  title="按住拖动调整司书顺序"
                  @click.stop
                  @dragstart.prevent="dragLibId = l.id"
                  @dragend="dragLibId = null"
                ></button>
                <div class="lib-roman">{{ romanMap.get(l.id) }}</div>
                <div class="lib-portrait">
                  <img v-if="l.portraitPreview" :src="l.portraitPreview" :alt="l.name" />
                  <img v-else-if="l.portrait" :src="l.portrait" :alt="l.name" />
                  <span v-else class="ph">无立绘</span>
                </div>
                <div class="lib-body">
                  <div class="lib-chips">
                    <span v-if="systemCode(l)" class="chip chip--accent">{{ systemCode(l) }}</span>
                    <span v-if="sheetOf(l)" class="chip">
                      <img class="chip-icon" :src="cardIcon" alt="卡牌" />
                      卡组容量 {{ deckCount(l) }}
                    </span>
                  </div>
                  <h3 class="lib-name">{{ l.name }}</h3>
                  <p class="lib-core">{{ coreName(l) }}</p>
                  <div class="lib-actions">
                    <button class="btn btn--sm" @click="openLibEdit(l)">编辑</button>
                    <button class="btn btn--sm" @click="openPreview(l)">预览</button>
                    <button class="btn btn--sm btn--danger" @click="removeLibrarian(l)">删除</button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </Transition>
      </section>

      <section v-if="orphanLibs.length" class="floor">
        <article class="floor-card floor-card--orphan" @click="toggleFloor(-1)">
          <div class="floor-card__art art-ph md">未分配楼层</div>
          <div class="floor-card__body">
            <div class="floor-card__meta">
              <span class="chip chip--accent">未分配</span>
              <span class="chip">司书 {{ orphanLibs.length }}</span>
            </div>
            <h2 class="floor-card__name">未分配楼层</h2>
          </div>
          <button type="button" class="chevron" @click.stop="toggleFloor(-1)">
            {{ expandedId === -1 ? '▲' : '▼' }}
          </button>
        </article>
        <Transition
          :css="false"
          @enter="slideEnter"
          @after-enter="slideAfterEnter"
          @leave="slideLeave"
        >
          <div v-if="expandedId === -1" class="floor-detail">
            <div class="floor-actions">
              <button class="btn btn--primary" @click="openLibCreate(null)">＋ 添加司书</button>
            </div>
            <div class="lib-grid">
              <article v-for="l in orphanLibs" :key="l.id" class="lib-card">
                <div class="lib-roman">{{ romanMap.get(l.id) }}</div>
                <div class="lib-portrait">
                  <img v-if="l.portraitPreview" :src="l.portraitPreview" :alt="l.name" />
                  <img v-else-if="l.portrait" :src="l.portrait" :alt="l.name" />
                  <span v-else class="ph">无立绘</span>
                </div>
                <div class="lib-body">
                  <h3 class="lib-name">{{ l.name }}</h3>
                  <p class="lib-core">{{ coreName(l) }}</p>
                  <div class="lib-actions">
                    <button class="btn btn--sm" @click="openLibEdit(l)">编辑</button>
                    <button class="btn btn--sm" @click="openPreview(l)">预览</button>
                    <button class="btn btn--sm btn--danger" @click="removeLibrarian(l)">删除</button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </Transition>
      </section>
    </div>

    <FloorEditorModal
      v-if="floorModal.open"
      :floor="floorModal.floor"
      :saving="saving"
      @save="saveFloor"
      @close="floorModal = { open: false, floor: null }"
    />

    <LibrarianEditorModal
      v-if="libModal.open"
      :librarian="libModal.librarian"
      :floors="floorsSorted"
      :default-floor-id="libModal.floorId"
      :default-system="(libModal.floorId != null ? floors.find((f) => f.id === libModal.floorId)?.battleSystem : 'base') as BattleSystemId"
      :roman="libModal.librarian ? romanMap.get(libModal.librarian.id) ?? '' : nextRoman"
      :saving="saving"
      @save="saveLibrarian"
      @close="libModal = { open: false, librarian: null, floorId: null }"
    />

    <DeckPreviewModal
      v-if="preview.open && preview.librarian"
      :librarian="preview.librarian"
      :roman="romanMap.get(preview.librarian.id) ?? ''"
      @close="preview = { open: false, librarian: null }"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:hover {
  border-color: var(--accent);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn--sm {
  padding: 4px 12px;
  font-size: 12px;
}
.btn--primary {
  background: var(--accent);
  color: #1b1408;
  border-color: var(--accent);
  font-weight: 600;
}
.btn--danger {
  color: #d9766a;
  background: transparent;
  border-color: rgba(217, 118, 106, 0.4);
}
.floors {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.floor {
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius) + 4px);
  background: var(--color-surface);
  overflow: hidden;
}
.floor-card {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 16px;
  min-height: 130px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.floor-card:hover {
  background: rgba(233, 221, 198, 0.05);
}
.floor-card__art {
  position: relative;
  width: 240px;
  flex-shrink: 0;
  min-height: 130px;
  overflow: hidden;
  background: var(--color-surface-2);
}
.floor-card__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.art-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 40%, var(--color-surface));
}
.art-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-ink-faint);
  font-size: 13px;
}
.art-ph.md {
  min-height: 130px;
}
.floor-card__body {
  flex: 1;
  min-width: 0;
  padding: 18px 12px 18px 0;
  align-self: center;
}
.floor-card__meta {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.chip {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  color: var(--color-ink-dim);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.chip-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  display: block;
}
.chip--accent {
  color: var(--accent);
  border-color: var(--accent);
}
.floor-card__name {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}
.floor-card__theme {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-dim);
}
.chevron {
  align-self: center;
  margin-right: 16px;
  background: none;
  border: none;
  color: var(--color-ink-dim);
  font-size: 16px;
  cursor: pointer;
}
.drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
  width: 0;
  height: 0;
  border-top: 14px solid var(--color-gold);
  border-right: 14px solid transparent;
  border-left: 14px solid transparent;
  cursor: grab;
  opacity: 0.65;
  background: transparent;
  padding: 0;
}
.drag-handle:hover {
  opacity: 1;
}
.drag-handle--sm {
  border-top: 11px solid var(--color-gold);
  border-right: 11px solid var(--color-gold);
  border-bottom: 11px solid transparent;
  border-left: 11px solid transparent;
  top: 0;
  left: auto;
  right: 0;
}
.floor-detail {
  border-top: 1px solid var(--color-line);
  padding: 16px 18px 20px;
  background: rgba(16, 13, 9, 0.3);
}
.floor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.lib-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.lib-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.lib-roman {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 1;
  font-family: var(--font-display);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 1px 5px 2px;
  border-radius: 4px;
  background: rgba(16, 13, 9, 0.62);
}
.lib-portrait {
  width: 70px;
  height: 88px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-surface-2);
  flex-shrink: 0;
}
.lib-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-ink-faint);
  font-size: 12px;
}
.lib-body {
  flex: 1;
  min-width: 0;
}
.lib-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 4px;
}
.lib-name {
  margin: 0 0 4px;
  font-size: 17px;
}
.lib-core {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--color-ink-dim);
}
.lib-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.empty-state--sm {
  padding: 18px;
  font-size: 13px;
  margin-bottom: 4px;
}
.banner {
  display: block;
  margin-bottom: 14px;
}
.hint {
  font-size: 12px;
  color: var(--color-ink-faint);
}
.error {
  color: #e07a6b;
  font-size: 13px;
}
</style>
