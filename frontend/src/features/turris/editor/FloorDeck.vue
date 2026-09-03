<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { Floor, Librarian, LibrarianSheet, BattleSystemId } from '@rtl/shared'
import { BATTLE_SYSTEMS, parseSheet, parseEmotionSheet, toRoman } from '@rtl/shared'
import type { EmotionEntity, EmotionSheet, Mechanism } from '@rtl/shared'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import cardIcon from '@/features/turris/assets/cardIcon.png'
import RenderedText from '@/features/turris/terms/RenderedText.vue'
import type { PrivateTerm } from '@/features/turris/terms/renderer'
import { formatToCss } from '@/features/turris/terms/format'
import FloorEditorModal from './FloorEditorModal.vue'
import LibrarianEditorModal from './LibrarianEditorModal.vue'
import EmotionEntityEditorModal from './EmotionEntityEditorModal.vue'
import DeckPreviewModal from './DeckPreviewModal.vue'
import StsCard from './StsCard.vue'

const floors = ref<Floor[]>([])
const librarians = ref<Librarian[]>([])
const emotions = ref<EmotionEntity[]>([])
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
const entityModal = ref<{ open: boolean; entity: EmotionEntity | null; floorId: number | null }>({
  open: false,
  entity: null,
  floorId: null,
})
const preview = ref<{ open: boolean; librarian: Librarian | null }>({ open: false, librarian: null })

const dragFloorId = ref<number | null>(null)
const dragLibId = ref<number | null>(null)

/* 楼层展开区的二级折叠菜单：key 形如 `libs-3` / `extra-3` / `emotion-3`。 */
const openPanels = reactive(new Set<string>())
function togglePanel(key: string): void {
  if (openPanels.has(key)) openPanels.delete(key)
  else openPanels.add(key)
}
/* 展开的情感实体行。 */
const openEntities = reactive(new Set<number>())
function toggleEntity(id: number): void {
  if (openEntities.has(id)) openEntities.delete(id)
  else openEntities.add(id)
}

const floorsSorted = computed(() =>
  [...floors.value].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
)

function libSort<T extends { sortOrder: number; id: number }>(a: T, b: T): number {
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

/** 常规司书（rarity 为空）。 */
const regLibsByFloor = computed<Map<number, Librarian[]>>(() => {
  const map = new Map<number, Librarian[]>()
  for (const [floorId, arr] of libsByFloor.value) {
    const reg = arr.filter((l) => !l.rarity)
    if (reg.length) map.set(floorId, reg)
  }
  return map
})

/** 附加角色（带稀有度前缀）。 */
const extraLibsByFloor = computed<Map<number, Librarian[]>>(() => {
  const map = new Map<number, Librarian[]>()
  for (const [floorId, arr] of libsByFloor.value) {
    const extra = arr.filter((l) => !!l.rarity)
    if (extra.length) map.set(floorId, extra)
  }
  return map
})

const orphanLibs = computed<Librarian[]>(() =>
  librarians.value.filter((l) => l.floorId == null).sort(libSort),
)

const entitiesByFloor = computed<Map<number, EmotionEntity[]>>(() => {
  const map = new Map<number, EmotionEntity[]>()
  for (const e of emotions.value) {
    if (e.floorId == null) continue
    const arr = map.get(e.floorId) ?? []
    arr.push(e)
    map.set(e.floorId, arr)
  }
  for (const arr of map.values()) arr.sort(libSort)
  return map
})

const romanMap = computed<Map<number, string>>(() => {
  const map = new Map<number, string>()
  let n = 0
  const assign = (arr: Librarian[]) => {
    for (const l of arr) {
      // 附加角色不占罗马编号，仅常规司书参与编号
      if (l.rarity) continue
      n += 1
      map.set(l.id, toRoman(n))
    }
  }
  for (const f of floorsSorted.value) assign(libsByFloor.value.get(f.id) ?? [])
  assign(orphanLibs.value)
  return map
})

function sheetOf(row: Librarian): LibrarianSheet | null {
  return parseSheet(row.sheet)
}

function emotionSheetOf(e: EmotionEntity) {
  return parseEmotionSheet(e.sheet)
}

/** 实体私人词典：全部书页的特殊机制名+字体格式（渲染时优先于通用词典）。 */
function privateTermsOf(e: EmotionEntity): PrivateTerm[] {
  const list: PrivateTerm[] = []
  for (const p of emotionSheetOf(e)?.pages ?? []) {
    for (const m of p.mechanisms) {
      if (m.name && m.format) list.push({ name: m.name, format: m.format })
    }
  }
  return list
}

/** 机制名的展示样式（无 format 时回退默认金色）。 */
function mechNameStyle(m: Mechanism): Record<string, string> {
  return formatToCss(m.format ?? { color: '#e6c15a', bold: false, italic: false, underline: 'none' })
}

function floorLabelOf(floorId: number | null): string {
  if (floorId == null) return '（无楼层）'
  const f = floors.value.find((x) => x.id === floorId)
  if (!f) return ''
  return `${f.code ? f.code + ' · ' : ''}${f.designation || f.name}`
}

/** 成本胶囊样式：正面=黄 · 负面=白 · 双极=黄白。 */
function costClass(cost: string): string {
  const hasPos = cost.includes('正面')
  const hasNeg = cost.includes('负面')
  if (hasPos && hasNeg) return 'cost--dual'
  if (hasPos) return 'cost--pos'
  if (hasNeg) return 'cost--neg'
  return 'cost--dual'
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
    const [fl, lib, ent] = await Promise.all([
      api.list<Floor>('floors'),
      api.list<Librarian>('librarians'),
      api.list<EmotionEntity>('emotion_entities'),
    ])
    floors.value = fl
    librarians.value = lib
    emotions.value = ent
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
function openLibCreate(floorId: number | null, rarity = ''): void {
  libModal.value = { open: true, librarian: null, floorId }
  libModalRarity.value = rarity
}
function openLibEdit(l: Librarian): void {
  libModal.value = { open: true, librarian: l, floorId: l.floorId }
  libModalRarity.value = l.rarity
}
/** 新建时给编辑器预选的稀有度。 */
const libModalRarity = ref('')
async function saveLibrarian(payload: Record<string, unknown>): Promise<void> {
  saving.value = true
  saveError.value = null
  try {
    const raw = (payload.sortOrder as number) ?? null
    if (libModal.value.librarian) {
      await api.update('librarians', libModal.value.librarian.id, payload)
    } else {
      const floorId = payload.floorId as number | null
      const group = payload.rarity ? extraLibsByFloor.value : regLibsByFloor.value
      const order = floorId != null ? (group.get(floorId)?.length ?? 0) : orphanLibs.value.length
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

/* ---------- emotion entity CRUD ---------- */
function openEntityCreate(floorId: number | null): void {
  entityModal.value = { open: true, entity: null, floorId }
}
function openEntityEdit(e: EmotionEntity): void {
  entityModal.value = { open: true, entity: e, floorId: e.floorId }
}
async function saveEntity(payload: Record<string, unknown>): Promise<void> {
  saving.value = true
  saveError.value = null
  try {
    if (entityModal.value.entity) {
      await api.update('emotion_entities', entityModal.value.entity.id, payload)
    } else {
      const floorId = payload.floorId as number | null
      const order =
        floorId != null
          ? (entitiesByFloor.value.get(floorId)?.length ?? 0)
          : emotions.value.filter((e) => e.floorId == null).length
      await api.create('emotion_entities', { ...payload, sortOrder: order })
    }
    showToast(entityModal.value.entity ? '情感实体已保存' : '情感实体已创建')
    await load()
    entityModal.value = { open: false, entity: null, floorId: null }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}
async function removeEntity(e: EmotionEntity): Promise<void> {
  if (!window.confirm(`确定删除情感实体「${e.name || '未命名'}」吗？`)) return
  try {
    await api.remove('emotion_entities', e.id)
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
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
  const list = [...(libsByFloor.value.get(srcFloor) ?? [])]
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
              <span class="chip">司书 {{ regLibsByFloor.get(f.id)?.length ?? 0 }}</span>
              <span class="chip">附加角色 {{ extraLibsByFloor.get(f.id)?.length ?? 0 }}</span>
              <span class="chip">情感实体 {{ entitiesByFloor.get(f.id)?.length ?? 0 }}</span>
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
            </div>

            <div class="subnav">
              <!-- ===== 二级菜单 1：司书列表 ===== -->
              <div class="submenu">
                <button type="button" class="submenu__head" @click="togglePanel(`libs-${f.id}`)">
                  <span class="submenu__icon">📖</span>
                  <span class="submenu__title">司书列表</span>
                  <span class="submenu__count">
                    <span class="chip">{{ regLibsByFloor.get(f.id)?.length ?? 0 }}</span>
                    <span class="submenu__arrow">{{ openPanels.has(`libs-${f.id}`) ? '▼' : '▶' }}</span>
                  </span>
                </button>
                <div v-show="openPanels.has(`libs-${f.id}`)" class="submenu__body">
                  <div class="submenu__actions">
                    <button class="btn btn--primary btn--sm" @click="openLibCreate(f.id)">＋ 添加司书</button>
                    <span class="submenu__note">常规司书 · 拖动卡片可调整顺序 · 编号动态生成</span>
                  </div>
                  <div v-if="(regLibsByFloor.get(f.id)?.length ?? 0) === 0" class="empty-state empty-state--sm">
                    <div class="empty-state__title">本楼层暂无司书</div>
                  </div>
                  <div v-else class="lib-grid">
                    <article
                      v-for="l in regLibsByFloor.get(f.id)"
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
                      <div class="lib-top">
                        <div class="lib-portrait">
                          <img v-if="l.portraitPreview" :src="l.portraitPreview" :alt="l.name" />
                          <img v-else-if="l.portrait" :src="l.portrait" :alt="l.name" />
                          <span v-else class="ph">无立绘</span>
                        </div>
                        <div class="lib-head">
                          <div class="lib-chips">
                            <span v-if="systemCode(l)" class="chip chip--accent">{{ systemCode(l) }}</span>
                            <span v-if="sheetOf(l)" class="chip">
                              <img class="chip-icon" :src="cardIcon" alt="卡牌" />
                              卡组容量 {{ deckCount(l) }}
                            </span>
                          </div>
                          <h3 class="lib-name">{{ l.name }}</h3>
                        </div>
                      </div>
                      <div class="lib-bottom">
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
              </div>

              <!-- ===== 二级菜单 2：附加角色 ===== -->
              <div class="submenu submenu--extra">
                <button type="button" class="submenu__head" @click="togglePanel(`extra-${f.id}`)">
                  <span class="submenu__icon">⭐</span>
                  <span class="submenu__title">附加角色</span>
                  <span class="submenu__count">
                    <span class="chip">{{ extraLibsByFloor.get(f.id)?.length ?? 0 }}</span>
                    <span class="submenu__arrow">{{ openPanels.has(`extra-${f.id}`) ? '▼' : '▶' }}</span>
                  </span>
                </button>
                <div v-show="openPanels.has(`extra-${f.id}`)" class="submenu__body">
                  <div class="submenu__actions">
                    <button class="btn btn--primary btn--sm" @click="openLibCreate(f.id, 'RR')">＋ 添加附加角色</button>
                    <span class="submenu__note">带稀有度前缀的司书 · 被动/机制/卡组编辑与常规司书完全一致</span>
                  </div>
                  <div v-if="(extraLibsByFloor.get(f.id)?.length ?? 0) === 0" class="empty-state empty-state--sm">
                    <div class="empty-state__title">本楼层暂无附加角色</div>
                  </div>
                  <div v-else class="lib-grid">
                    <article v-for="l in extraLibsByFloor.get(f.id)" :key="l.id" class="lib-card lib-card--extra">
                      <div class="lib-top">
                        <div class="lib-portrait">
                          <img v-if="l.portraitPreview" :src="l.portraitPreview" :alt="l.name" />
                          <img v-else-if="l.portrait" :src="l.portrait" :alt="l.name" />
                          <span v-else class="ph">无立绘</span>
                        </div>
                        <div class="lib-head">
                          <div class="lib-chips">
                            <span class="rarity-badge" :class="`rarity--${l.rarity}`">{{ l.rarity }}</span>
                            <span v-if="systemCode(l)" class="chip">{{ systemCode(l) }}</span>
                            <span v-if="sheetOf(l)" class="chip">卡组容量 {{ deckCount(l) }}</span>
                          </div>
                          <h3 class="lib-name">{{ l.name }}</h3>
                        </div>
                      </div>
                      <div class="lib-bottom">
                        <p class="lib-core"><em>{{ l.rarity }}</em> {{ coreName(l) }}</p>
                        <div class="lib-actions">
                          <button class="btn btn--sm" @click="openLibEdit(l)">编辑</button>
                          <button class="btn btn--sm" @click="openPreview(l)">预览</button>
                          <button class="btn btn--sm btn--danger" @click="removeLibrarian(l)">删除</button>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <!-- ===== 二级菜单 3：情感书页 ===== -->
              <div class="submenu" :class="{ 'submenu--emotion': f.battleSystem === 'lob' }">
                <button type="button" class="submenu__head" @click="togglePanel(`emotion-${f.id}`)">
                  <span class="submenu__icon">📙</span>
                  <span class="submenu__title">情感书页</span>
                  <span class="submenu__count">
                    <span class="chip">{{ BATTLE_SYSTEMS[f.battleSystem]?.code ?? f.battleSystem }}</span>
                    <span class="chip">{{ entitiesByFloor.get(f.id)?.length ?? 0 }}</span>
                    <span class="submenu__arrow">{{ openPanels.has(`emotion-${f.id}`) ? '▼' : '▶' }}</span>
                  </span>
                </button>
                <div v-show="openPanels.has(`emotion-${f.id}`)" class="submenu__body">
                  <!-- LOB：情感实体列表 -->
                  <template v-if="f.battleSystem === 'lob'">
                    <div class="submenu__actions">
                      <button class="btn btn--primary btn--sm" @click="openEntityCreate(f.id)">＋ 新建情感实体</button>
                      <span class="submenu__note">每个实体 = 异常实体名称 + 1~9 张情感书页 + EGO卡牌（含EGO被动）</span>
                    </div>
                    <div v-if="(entitiesByFloor.get(f.id)?.length ?? 0) === 0" class="empty-state empty-state--sm">
                      <div class="empty-state__title">本楼层暂无情感实体</div>
                    </div>
                    <div v-else class="entity-list">
                      <div v-for="e in entitiesByFloor.get(f.id)" :key="e.id" class="entity-row">
                        <button type="button" class="entity-row__head" @click="toggleEntity(e.id)">
                          <span class="entity-code">{{ e.code || 'SCL-' }}</span>
                          <span class="entity-name">&lt;{{ e.name || '未命名' }}&gt;</span>
                          <span class="entity-summary">
                            <span class="chip">书页 {{ emotionSheetOf(e)?.pages.length ?? 0 }}</span>
                            <span class="chip">EGO {{ emotionSheetOf(e)?.egoCards.length ?? 0 }}</span>
                          </span>
                          <span class="entity-arrow">{{ openEntities.has(e.id) ? '▼' : '▶' }}</span>
                        </button>
                        <div v-if="openEntities.has(e.id)" class="entity-row__body">
                          <div class="entity-col">
                            <p class="entity-col__title">情感书页</p>
                            <div v-for="(p, pi) in emotionSheetOf(e)?.pages ?? []" :key="pi" class="epage">
                              <div class="epage__head">
                                <span class="epage__idx">{{ pi + 1 }}.</span>
                                <span class="epage__name">{{ p.name || '未命名' }}</span>
                                <span class="epage__cost">
                                  <span class="cost-chip" :class="costClass(p.cost)">{{ p.cost || '—' }}</span>
                                </span>
                              </div>
                              <p class="epage__effect"><RenderedText :text="p.effect" :private-terms="privateTermsOf(e)" /></p>
                              <p v-for="(m, mi) in p.mechanisms" :key="mi" class="epage__mech">
                                <span class="sq">▪️</span>
                                <span v-if="m.name" class="mech-name" :style="mechNameStyle(m)">
                                  {{ m.name }}<template v-if="m.stack">&nbsp;{{ m.stack }}层</template>
                                </span>
                                <RenderedText :text="m.desc" :private-terms="privateTermsOf(e)" />
                              </p>
                            </div>
                          </div>
                          <div class="entity-col">
                            <p class="entity-col__title">
                              EGO卡牌
                              <button class="btn btn--sm entity-edit-btn" @click="openEntityEdit(e)">✎ 编辑实体</button>
                            </p>
                            <div v-for="(c, ci) in emotionSheetOf(e)?.egoCards ?? []" :key="ci" class="ego-wrap">
                              <StsCard :card="c" :render-terms="true" :private-terms="privateTermsOf(e)" />
                              <div v-if="c.egoPassive && (c.egoPassive.name || c.egoPassive.effect)" class="ego-passive">
                                <span class="ego-passive__label">EGO被动</span>
                                <span class="ego-passive__name">{{ c.egoPassive.name }}</span>
                                <span class="ego-passive__desc"><RenderedText :text="c.egoPassive.effect" :private-terms="privateTermsOf(e)" /></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 其他系统：占位 -->
                  <div v-else class="sys-placeholder">
                    <div class="sys-placeholder__title">
                      「{{ BATTLE_SYSTEMS[f.battleSystem]?.zh ?? f.battleSystem }}」系统的书页编辑器尚未设计
                    </div>
                    <p>此处将按楼层战斗系统分发到对应的书页编辑器。</p>
                  </div>
                </div>
              </div>
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
                <div class="lib-top">
                  <div class="lib-portrait">
                    <img v-if="l.portraitPreview" :src="l.portraitPreview" :alt="l.name" />
                    <img v-else-if="l.portrait" :src="l.portrait" :alt="l.name" />
                    <span v-else class="ph">无立绘</span>
                  </div>
                  <div class="lib-head">
                    <div class="lib-chips">
                      <span v-if="l.rarity" class="rarity-badge" :class="`rarity--${l.rarity}`">{{ l.rarity }}</span>
                    </div>
                    <h3 class="lib-name">{{ l.name }}</h3>
                  </div>
                </div>
                <div class="lib-bottom">
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
      :default-rarity="libModalRarity"
      :roman="libModal.librarian ? romanMap.get(libModal.librarian.id) ?? '' : nextRoman"
      :saving="saving"
      @save="saveLibrarian"
      @close="libModal = { open: false, librarian: null, floorId: null }"
    />

    <EmotionEntityEditorModal
      v-if="entityModal.open"
      :entity="entityModal.entity"
      :floor-id="entityModal.floorId"
      :floor-label="floorLabelOf(entityModal.floorId)"
      :saving="saving"
      @save="saveEntity"
      @close="entityModal = { open: false, entity: null, floorId: null }"
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

/* ========== 楼层展开区 · 二级折叠菜单 ========== */
.subnav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.submenu {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
  overflow: hidden;
}
.submenu__head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink);
  font-size: 15px;
  font-family: var(--font-serif);
  text-align: left;
}
.submenu__head:hover {
  background: var(--color-surface-2);
}
.submenu__icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
}
.submenu__title {
  font-weight: 600;
}
.submenu__count {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.submenu__arrow {
  color: var(--color-ink-faint);
  font-size: 12px;
}
.submenu__body {
  border-top: 1px solid var(--color-line);
  padding: 14px;
  background: rgba(16, 13, 9, 0.22);
}
.submenu__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.submenu__note {
  color: var(--color-ink-faint);
  font-size: 12px;
  font-family: var(--font-kai);
}

/* --- 附加角色：鲜明血红主题 --- */
.submenu--extra {
  border: 1.5px solid rgba(224, 58, 32, 0.55);
}
.submenu--extra .submenu__head:hover {
  background: rgba(224, 58, 32, 0.16);
}
.submenu--extra .submenu__body {
  background: linear-gradient(180deg, rgba(122, 16, 8, 0.35), rgba(52, 6, 3, 0.5));
}
.lib-card--extra {
  border: 1.5px dashed rgba(240, 72, 42, 0.55);
  background: linear-gradient(160deg, #4a120a, #2a0a05);
}
.lib-card--extra:hover {
  border-color: rgba(255, 90, 55, 0.8);
  box-shadow: 0 0 14px rgba(214, 40, 18, 0.4);
}
.lib-card--extra .lib-core {
  color: #e8a794;
}
.lib-card--extra .lib-core em {
  color: #ff6a42;
  font-style: normal;
  margin-right: 4px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.06em;
}
.lib-card--extra .lib-portrait {
  background: linear-gradient(160deg, #57160c, #331008);
}
.rarity-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  line-height: 18px;
  border-radius: 4px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.06em;
  border: 1px solid;
  white-space: nowrap;
}
.rarity--N {
  color: #a99f8e;
  border-color: rgba(169, 159, 142, 0.4);
  background: rgba(169, 159, 142, 0.08);
}
.rarity--R {
  color: #6fa3e0;
  border-color: rgba(111, 163, 224, 0.4);
  background: rgba(111, 163, 224, 0.08);
}
.rarity--SR {
  color: #b48ae0;
  border-color: rgba(180, 138, 224, 0.4);
  background: rgba(180, 138, 224, 0.08);
}
.rarity--SSR {
  color: var(--color-gold);
  border-color: rgba(224, 181, 100, 0.4);
  background: rgba(224, 181, 100, 0.08);
}
.rarity--RR {
  color: #ff5a35;
  border-color: rgba(255, 90, 53, 0.53);
  background: rgba(255, 90, 53, 0.1);
}
.rarity--UR {
  color: #f3dfa2;
  border-color: rgba(243, 223, 162, 0.67);
  background: linear-gradient(100deg, rgba(224, 181, 100, 0.13), rgba(192, 74, 50, 0.13));
  text-shadow: 0 0 8px rgba(224, 181, 100, 0.53);
}

/* --- 情感书页：黑 / 灰 / 黄 / 白 高对比主题（异常实体警示风） --- */
.submenu--emotion {
  border-color: rgba(233, 221, 198, 0.22);
}
.submenu--emotion .submenu__head:hover {
  background: rgba(224, 181, 100, 0.08);
}
.submenu--emotion .submenu__body {
  background: #0d0c0a;
}
.submenu--emotion .entity-list {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.entity-row {
  border: 2px solid rgba(233, 221, 198, 0.38);
  border-radius: var(--radius);
  background: #14120e;
  overflow: hidden;
}
.entity-row__head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--color-ink);
  font-family: var(--font-serif);
  font-size: 14px;
}
.entity-row__head:hover {
  background: rgba(224, 181, 100, 0.08);
}
.entity-code {
  font-family: var(--font-display);
  font-size: 11px;
  color: #f0c75e;
  letter-spacing: 0.08em;
}
.entity-name {
  font-size: 14.5px;
  color: #f5f1e6;
}
.entity-summary {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}
.entity-arrow {
  margin-left: auto;
  color: var(--color-ink-faint);
  font-size: 11px;
}
.entity-row__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  border-top: 1px dashed rgba(233, 221, 198, 0.3);
  padding: 14px;
  background: rgba(0, 0, 0, 0.35);
}
@media (max-width: 900px) {
  .entity-row__body {
    grid-template-columns: 1fr;
  }
}
.entity-col {
  min-width: 0;
}
.entity-col__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 12px;
  color: #f0c75e;
  font-family: var(--font-kai);
}
.entity-col__title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(233, 221, 198, 0.16);
}
.entity-edit-btn {
  margin-left: auto;
}
.epage {
  border: 1px solid rgba(233, 221, 198, 0.26);
  border-radius: var(--radius);
  background: #1b1a17;
  padding: 9px 12px 10px;
  margin-bottom: 8px;
}
.epage:last-child {
  margin-bottom: 0;
}
.epage__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.epage__idx {
  font-family: var(--font-display);
  font-size: 12px;
  color: #f0c75e;
}
.epage__name {
  font-family: var(--font-serif);
  font-size: 14.5px;
  color: #ffffff;
}
.epage__cost {
  margin-left: auto;
}
.cost-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  line-height: 18px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid;
  white-space: nowrap;
}
.cost--pos {
  color: #f5d87e;
  border-color: rgba(240, 199, 94, 0.53);
  background: rgba(240, 199, 94, 0.1);
}
.cost--neg {
  color: #f2eee2;
  border-color: rgba(242, 238, 226, 0.33);
  background: rgba(242, 238, 226, 0.05);
}
.cost--dual {
  color: #ffffff;
  border-color: rgba(240, 199, 94, 0.53);
  background: linear-gradient(90deg, rgba(240, 199, 94, 0.13), rgba(242, 238, 226, 0.13));
}
.epage__effect {
  margin: 2px 0 0;
  font-size: 13px;
  font-family: var(--font-kai);
  color: #e8e4da;
}
.epage__mech {
  margin: 5px 0 0;
  padding-left: 10px;
  border-left: 2px solid rgba(240, 199, 94, 0.5);
  font-size: 12.5px;
  color: #b8b2a4;
  font-family: var(--font-kai);
}
.epage__mech .sq {
  color: var(--accent);
  margin-right: 4px;
}
.epage__mech .mech-name {
  margin-right: 4px;
}
.ego-wrap {
  margin-bottom: 10px;
}
.ego-passive {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-top: 6px;
  padding: 8px 12px;
  border: 1px solid #f0c75e;
  border-radius: var(--radius);
  background: linear-gradient(90deg, rgba(240, 199, 94, 0.16), rgba(240, 199, 94, 0.04));
  font-size: 13px;
}
.ego-passive__label {
  font-family: var(--font-display);
  font-size: 11px;
  color: #f0c75e;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.ego-passive__name {
  font-family: var(--font-serif);
  font-weight: 600;
  white-space: nowrap;
  color: #ffffff;
}
.ego-passive__desc {
  color: #d8d2c2;
  font-family: var(--font-kai);
}
.sys-placeholder {
  border: 1px dashed var(--color-line);
  border-radius: var(--radius);
  padding: 18px 16px;
  text-align: center;
  color: var(--color-ink-faint);
  background: repeating-linear-gradient(
    -45deg,
    transparent 0 10px,
    rgba(233, 221, 198, 0.02) 10px 20px
  );
}
.sys-placeholder__title {
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--color-ink-dim);
  margin-bottom: 4px;
}
.sys-placeholder p {
  margin: 0;
  font-size: 12.5px;
  font-family: var(--font-kai);
}

/* ========== 司书卡片网格（原有） ========== */
.lib-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
@media (max-width: 1280px) {
  .lib-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 980px) {
  .lib-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .lib-grid {
    grid-template-columns: 1fr;
  }
}
.lib-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-surface);
}
/* 上块：立绘 + （系统/稀有度 chips + 姓名） */
.lib-top {
  display: flex;
  gap: 12px;
}
.lib-head {
  flex: 1;
  min-width: 0;
}
/* 下块：核心书页名 + 操作按钮 */
.lib-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-top: 1px dashed var(--color-line);
  padding-top: 8px;
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
.lib-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 4px;
}
.lib-name {
  margin: 0;
  font-size: 17px;
  overflow-wrap: anywhere;
}
.lib-core {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--color-ink-dim);
  overflow-wrap: anywhere;
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
