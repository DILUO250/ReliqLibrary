<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AnomalyEntity, BattleSystemId, Floor, Librarian } from '@rtl/shared'
import { BATTLE_SYSTEMS, toRoman } from '@rtl/shared'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import FloorEditorModal from '@/features/turris/editor/FloorEditorModal.vue'
import LibrarianEditorModal from '@/features/turris/editor/LibrarianEditorModal.vue'
import AnomalyEntityEditorModal from '@/features/turris/editor/AnomalyEntityEditorModal.vue'
import DeckPreviewModal from '@/features/turris/editor/DeckPreviewModal.vue'
import DeckPreviewModalV1 from '@/features/turris/editor/DeckPreviewModalV1.vue'
import { loadUiVersion } from '@/app/theme'
import MoltenLibrarianGrid from './MoltenLibrarianGrid.vue'
import MoltenAttachments from './MoltenAttachments.vue'
import MoltenAnomalies from './MoltenAnomalies.vue'

type FloorTab = 'librarians' | 'extras' | 'anomalies'
const route = useRoute()
const router = useRouter()
const floors = ref<Floor[]>([])
const librarians = ref<Librarian[]>([])
const entities = ref<AnomalyEntity[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const selectedFloorId = ref<number | null>(null)
const activeTab = ref<FloorTab>('librarians')
const uiVersion = loadUiVersion()
const reorderMode = ref(false)
const savingHostId = ref<number | null>(null)
const draggedFloorId = ref<number | null>(null)
let handledDirectLink = false

const floorModal = ref<{ open: boolean; floor: Floor | null }>({ open: false, floor: null })
const libModal = ref<{ open: boolean; librarian: Librarian | null; floorId: number | null; rarity: string }>({ open: false, librarian: null, floorId: null, rarity: '' })
const entityModal = ref<{ open: boolean; entity: AnomalyEntity | null; floorId: number | null }>({ open: false, entity: null, floorId: null })
const preview = ref<{ open: boolean; librarian: Librarian | null }>({ open: false, librarian: null })

const floorsSorted = computed(() => [...floors.value].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id))
const stackedFloors = computed(() => [...floorsSorted.value].reverse())
const currentFloor = computed(() => floors.value.find((f) => f.id === selectedFloorId.value) ?? null)
const currentRegular = computed(() => regularOf(selectedFloorId.value))
const currentExtras = computed(() => extrasOf(selectedFloorId.value))
const currentEntities = computed(() => entitiesOf(selectedFloorId.value))
const orphanLibs = computed(() => librarians.value.filter((l) => l.floorId == null).sort(libSort))
const nextRoman = computed(() => toRoman((libModal.value.floorId === selectedFloorId.value ? currentRegular.value.length : orphanLibs.value.length) + 1))
const systemCode = computed(() => currentFloor.value ? BATTLE_SYSTEMS[currentFloor.value.battleSystem]?.code ?? currentFloor.value.battleSystem : '')
const currentFloorLabel = computed(() => currentFloor.value ? `${currentFloor.value.code} / ${floorName(currentFloor.value)}` : '未分配楼层')
const canMoveFloorUp = computed(() => !!selectedFloorId.value && stackedFloors.value[0]?.id !== selectedFloorId.value)
const canMoveFloorDown = computed(() => !!selectedFloorId.value && stackedFloors.value[stackedFloors.value.length - 1]?.id !== selectedFloorId.value)

function libSort<T extends { sortOrder: number; id: number }>(a: T, b: T): number { return a.sortOrder - b.sortOrder || a.id - b.id }
function regularOf(floorId: number | null): Librarian[] { return librarians.value.filter((l) => l.floorId === floorId && !l.rarity).sort(libSort) }
function extrasOf(floorId: number | null): Librarian[] { return librarians.value.filter((l) => l.floorId === floorId && !!l.rarity).sort(libSort) }
function entitiesOf(floorId: number | null): AnomalyEntity[] { return entities.value.filter((e) => e.floorId === floorId).sort(libSort) }
function floorName(floor: Floor): string { return floor.designation || floor.name }
function countOf(floorId: number, tab: FloorTab): number { return tab === 'librarians' ? regularOf(floorId).length : tab === 'extras' ? extrasOf(floorId).length : entitiesOf(floorId).length }
const romanMap = computed(() => {
  const result = new Map<number, string>()
  for (const floor of floorsSorted.value) regularOf(floor.id).forEach((lib, index) => result.set(lib.id, toRoman(index + 1)))
  orphanLibs.value.filter((l) => !l.rarity).forEach((lib, index) => result.set(lib.id, toRoman(index + 1)))
  return result
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [floorRows, librarianRows, entityRows] = await Promise.all([
      api.list<Floor>('floors'), api.list<Librarian>('librarians'), api.list<AnomalyEntity>('anomaly_entities'),
    ])
    floors.value = floorRows
    librarians.value = librarianRows
    entities.value = entityRows
    const requested = Number.parseInt(String(route.query.floor ?? ''), 10)
    const requestedExists = floorRows.some((f) => f.id === requested)
    if (requestedExists) selectedFloorId.value = requested
    if (!floorRows.some((f) => f.id === selectedFloorId.value)) selectedFloorId.value = requestedExists ? requested : floorRows[0]?.id ?? null
    if (!handledDirectLink) {
      handledDirectLink = true
      const librarianId = Number.parseInt(String(route.query.librarian ?? ''), 10)
      const target = librarianRows.find((l) => l.id === librarianId)
      if (target) {
        selectedFloorId.value = target.floorId
        activeTab.value = target.rarity ? 'extras' : 'librarians'
        preview.value = { open: true, librarian: target }
      }
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  } finally {
    loading.value = false
  }
}

function selectFloor(id: number): void {
  selectedFloorId.value = id
  const query = { ...route.query, floor: String(id), librarian: undefined }
  void router.replace({ query })
}
watch(() => route.query.floor, (value) => {
  const id = Number.parseInt(String(value ?? ''), 10)
  if (floors.value.some((f) => f.id === id)) selectedFloorId.value = id
})

function openFloorCreate(): void { floorModal.value = { open: true, floor: null } }
function openFloorEdit(floor: Floor): void { floorModal.value = { open: true, floor } }
async function saveFloor(payload: Record<string, unknown>): Promise<void> {
  saving.value = true; error.value = null
  try {
    if (floorModal.value.floor) await api.update('floors', floorModal.value.floor.id, payload)
    else await api.create('floors', payload)
    showToast(floorModal.value.floor ? '楼层已保存' : '楼层已创建')
    floorModal.value = { open: false, floor: null }
    await load()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) } finally { saving.value = false }
}
async function removeFloor(floor: Floor): Promise<void> {
  if (!window.confirm(`确定删除楼层「${floor.code || floorName(floor)}」吗？所属司书和异常实体会保留为未分配。`)) return
  try { await api.remove('floors', floor.id); showToast('楼层已删除'); await load() } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) }
}

function openLibCreate(floorId: number | null, rarity = ''): void { libModal.value = { open: true, librarian: null, floorId, rarity } }
function openLibEdit(lib: Librarian): void { libModal.value = { open: true, librarian: lib, floorId: lib.floorId, rarity: lib.rarity } }
async function saveLibrarian(payload: Record<string, unknown>): Promise<void> {
  saving.value = true; error.value = null
  try {
    if (libModal.value.librarian) await api.update('librarians', libModal.value.librarian.id, payload)
    else {
      const floorId = payload.floorId as number | null
      const order = payload.rarity ? extrasOf(floorId).length : regularOf(floorId).length
      await api.create('librarians', { ...payload, sortOrder: order })
    }
    showToast(libModal.value.librarian ? '司书已保存' : '司书已创建')
    libModal.value = { open: false, librarian: null, floorId: null, rarity: '' }
    await load()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) } finally { saving.value = false }
}
async function removeLibrarian(lib: Librarian): Promise<void> {
  if (!window.confirm(`确定删除「${lib.name}」吗？其附属单位会保留并解除宿主关系。`)) return
  try { await api.remove('librarians', lib.id); showToast('单位已删除'); await load() } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) }
}
function openPreview(lib: Librarian): void { preview.value = { open: true, librarian: lib } }
async function changeHost(lib: Librarian, hostId: number | null): Promise<void> {
  savingHostId.value = lib.id; error.value = null
  try { await api.update('librarians', lib.id, { hostLibrarianId: hostId }); showToast(hostId == null ? '已解除宿主关系' : '宿主关系已保存'); await load() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) }
  finally { savingHostId.value = null }
}

function openEntityCreate(): void { if (currentFloor.value) entityModal.value = { open: true, entity: null, floorId: currentFloor.value.id } }
function openEntityEdit(entity: AnomalyEntity): void { entityModal.value = { open: true, entity, floorId: entity.floorId } }
async function saveEntity(payload: Record<string, unknown>): Promise<void> {
  saving.value = true; error.value = null
  try {
    if (entityModal.value.entity) await api.update('anomaly_entities', entityModal.value.entity.id, payload)
    else await api.create('anomaly_entities', { ...payload, sortOrder: currentEntities.value.length })
    showToast(entityModal.value.entity ? '异常实体已保存' : '异常实体已创建')
    entityModal.value = { open: false, entity: null, floorId: null }
    await load()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) } finally { saving.value = false }
}

function moveFloor(step: number): void {
  // step = +1 塔楼上移（sortOrder 增大），-1 下移；基于 floorsSorted 升序索引。
  const id = selectedFloorId.value
  if (id == null) return
  const list = [...floorsSorted.value]
  const from = list.findIndex((f) => f.id === id)
  const to = from + step
  if (from < 0 || to < 0 || to >= list.length) return
  const [moved] = list.splice(from, 1); list.splice(to, 0, moved!)
  list.forEach((floor, index) => { floor.sortOrder = index + 1 })
  floors.value = list
  void api.reorder('floors', list.map((f) => ({ id: f.id, sortOrder: f.sortOrder }))).catch(async (reason) => { error.value = String(reason); await load() })
}
function reorderFloors(sourceId: number, targetId: number): void {
  const list = [...floorsSorted.value]
  const from = list.findIndex((f) => f.id === sourceId)
  const to = list.findIndex((f) => f.id === targetId)
  if (from < 0 || to < 0 || from === to) return
  const [moved] = list.splice(from, 1); list.splice(to, 0, moved!)
  list.forEach((floor, index) => { floor.sortOrder = index + 1 })
  floors.value = list
  void api.reorder('floors', list.map((f) => ({ id: f.id, sortOrder: f.sortOrder }))).catch(async (reason) => { error.value = String(reason); await load() })
}
function reorderLibrarians(sourceId: number, targetId: number): void {
  const list = [...currentRegular.value]
  const from = list.findIndex((l) => l.id === sourceId)
  const to = list.findIndex((l) => l.id === targetId)
  if (from < 0 || to < 0 || from === to) return
  const [moved] = list.splice(from, 1); list.splice(to, 0, moved!)
  list.forEach((lib, index) => { lib.sortOrder = index + 1 })
  const changed = new Map(list.map((lib) => [lib.id, lib]))
  librarians.value = librarians.value.map((lib) => changed.get(lib.id) ?? lib)
  void api.reorder('librarians', list.map((l) => ({ id: l.id, sortOrder: l.sortOrder }))).catch(async (reason) => { error.value = String(reason); await load() })
}
function onFloorDrop(targetId: number): void {
  if (reorderMode.value && draggedFloorId.value != null) reorderFloors(draggedFloorId.value, targetId)
  draggedFloorId.value = null
}

onMounted(load)
</script>

<template>
  <div class="molten-page molten-floors">
    <header class="floor-title">
      <div><span>CANTILEVERED STRATA · SUBMODULES</span><h2>楼层与司书</h2><p>正式编制、附属核心与异常档案共用同一座塔楼。</p></div>
      <div class="title-actions"><button type="button" :class="{ active: reorderMode }" @click="reorderMode = !reorderMode">{{ reorderMode ? '完成排序' : '调整排序' }}</button><button type="button" class="primary" @click="openFloorCreate">＋ 新建楼层</button></div>
    </header>
    <p v-if="error" class="molten-error">{{ error }}</p>
    <div v-if="loading && !floors.length" class="floor-loading">正在读取楼层编制…</div>

    <main v-else-if="currentFloor" class="tower-workspace">
      <section class="cantilever-tower" aria-label="交错悬挑塔楼">
        <div class="tower-roof"><span>CANTILEVER / 01</span><b>迎书楼</b><i></i></div>
        <div class="tower-strata">
          <button
            v-for="floor in stackedFloors"
            :key="floor.id"
            type="button"
            class="stratum"
            :class="{ 'is-active': floor.id === selectedFloorId, 'is-sorting': reorderMode }"
            :aria-pressed="floor.id === selectedFloorId"
            :draggable="reorderMode"
            @click="selectFloor(floor.id)"
            @dragstart="draggedFloorId = floor.id"
            @dragend="draggedFloorId = null"
            @dragover.prevent
            @drop.prevent="onFloorDrop(floor.id)"
          >
            <img v-if="floor.artwork" :src="floor.artwork" alt="" /><span class="stratum-shade"></span>
            <span class="stratum-code">{{ floor.code || '—' }}</span><span class="stratum-name">{{ floorName(floor) }}</span><span class="stratum-theme">{{ floor.theme }}</span><span class="stratum-count"><b>{{ regularOf(floor.id).length }}</b> 人</span><span class="stratum-mark">{{ floor.id === selectedFloorId ? '当前接待层' : '进入楼层' }}</span>
          </button>
        </div>
        <div class="tower-base"><span>LIBRARY FOUNDATION</span><div class="tower-sort"><button type="button" :disabled="!canMoveFloorUp" title="上移当前楼层" aria-label="上移当前楼层" @click="moveFloor(1)">▲</button><button type="button" :disabled="!canMoveFloorDown" title="下移当前楼层" aria-label="下移当前楼层" @click="moveFloor(-1)">▼</button></div><b>图书馆基座 · {{ floors.length }} 层</b></div>
      </section>

      <section class="floor-detail">
        <header class="detail-banner">
          <img v-if="currentFloor.artwork" :src="currentFloor.artwork" :alt="floorName(currentFloor)" /><div class="detail-shade"></div>
          <div class="detail-copy"><span>ACTIVE RECEPTION FLOOR / {{ currentFloor.code }}</span><h2>{{ floorName(currentFloor) }}</h2><p>{{ currentFloor.theme || '未填写楼层风格' }}</p></div>
          <div class="detail-tags"><b>{{ currentFloor.code }}</b><b>{{ systemCode }}</b></div>
          <div class="floor-actions"><button type="button" @click="openFloorEdit(currentFloor)">编辑楼层</button><button type="button" class="danger" @click="removeFloor(currentFloor)">删除</button></div>
        </header>
        <div class="detail-status">
          <div class="detail-tabs" role="tablist" aria-label="楼层编制类型">
            <button v-for="tab in ([['librarians', '司书列表'], ['extras', '附加单位'], ['anomalies', '异常实体']] as const)" :key="tab[0]" type="button" role="tab" :aria-selected="activeTab === tab[0]" :class="{ active: activeTab === tab[0] }" @click="activeTab = tab[0]">{{ tab[1] }} <b>{{ countOf(currentFloor.id, tab[0]) }}</b></button>
          </div>
          <span>{{ reorderMode ? '拖动楼层或司书卡调整顺序' : activeTab === 'extras' ? '真实宿主关系 / 可留空' : activeTab === 'anomalies' ? '异常档案 / 完整索引' : '正式核心书页编制' }}</span>
        </div>

        <template v-if="activeTab === 'librarians'">
          <div class="roster-heading"><div><span>CORE PAGE ASSIGNMENT</span><h3>正式核心书页编制</h3></div><button type="button" @click="openLibCreate(currentFloor.id)">＋ 添加司书 <b>{{ currentRegular.length }}</b></button></div>
          <MoltenLibrarianGrid :librarians="currentRegular" :roman-map="romanMap" :reorder-mode="reorderMode" @edit="openLibEdit" @preview="openPreview" @remove="removeLibrarian" @reorder="reorderLibrarians" />
        </template>
        <MoltenAttachments v-else-if="activeTab === 'extras'" :regular="currentRegular" :extras="currentExtras" :roman-map="romanMap" :saving-host-id="savingHostId" @create="openLibCreate(currentFloor.id, 'RR')" @edit="openLibEdit" @preview="openPreview" @remove="removeLibrarian" @host-change="changeHost" />
        <MoltenAnomalies v-else-if="currentFloor.battleSystem === 'lob'" :entities="currentEntities" :floor-label="currentFloorLabel" @create="openEntityCreate" @edit="openEntityEdit" />
        <div v-else class="system-placeholder"><span>Ⅱ</span><h3>该系统暂未配置异常实体档案</h3><p>异常实体页沿用 LOB 情感书页结构，其他战斗系统不在此预建数据。</p></div>
      </section>
    </main>
    <div v-else class="floor-loading">尚无楼层，请先新建楼层。</div>

    <section v-if="orphanLibs.length" class="orphan-roster">
      <header><div><span>UNASSIGNED CORE PAGES</span><h2>未分配楼层</h2></div><button type="button" @click="openLibCreate(null)">＋ 添加司书</button></header>
      <MoltenLibrarianGrid :librarians="orphanLibs" :roman-map="romanMap" empty-text="暂无未分配单位" @edit="openLibEdit" @preview="openPreview" @remove="removeLibrarian" />
    </section>

    <FloorEditorModal v-if="floorModal.open" :floor="floorModal.floor" :saving="saving" @save="saveFloor" @close="floorModal = { open: false, floor: null }" />
    <LibrarianEditorModal v-if="libModal.open" :librarian="libModal.librarian" :librarians="librarians" :floors="floorsSorted" :default-floor-id="libModal.floorId" :default-system="(libModal.floorId != null ? floors.find((f) => f.id === libModal.floorId)?.battleSystem : 'base') as BattleSystemId" :default-rarity="libModal.rarity" :roman="libModal.librarian ? romanMap.get(libModal.librarian.id) ?? '' : nextRoman" :saving="saving" @save="saveLibrarian" @close="libModal = { open: false, librarian: null, floorId: null, rarity: '' }" />
    <AnomalyEntityEditorModal v-if="entityModal.open" :entity="entityModal.entity" :floor-id="entityModal.floorId" :floor-label="currentFloorLabel" :saving="saving" @save="saveEntity" @close="entityModal = { open: false, entity: null, floorId: null }" />
    <DeckPreviewModal v-if="preview.open && preview.librarian && uiVersion === 'modern'" :librarian="preview.librarian" :roman="romanMap.get(preview.librarian.id) ?? ''" @close="preview = { open: false, librarian: null }" />
    <DeckPreviewModalV1 v-else-if="preview.open && preview.librarian" :librarian="preview.librarian" :roman="romanMap.get(preview.librarian.id) ?? ''" @close="preview = { open: false, librarian: null }" />
  </div>
</template>

<style scoped>
.floor-title { display: flex; align-items: flex-end; gap: 1.5rem; padding: .25rem .25rem 1.1rem; border-bottom: 1px solid var(--molten-line); }.floor-title > div:first-child { margin-right: auto; }.floor-title span { color: var(--molten-red-bright); font: .58rem var(--font-display); letter-spacing: .2em; }.floor-title h2 { margin: .25rem 0; font: 600 1.55rem var(--font-serif); letter-spacing: .08em; }.floor-title p { margin: 0; color: var(--color-ink-faint); font-size: .68rem; }.title-actions { display: flex; gap: .6rem; }.title-actions button { padding: .55rem .9rem; border: 1px solid var(--molten-line); background: var(--color-surface); color: var(--color-ink-dim); font-size: .67rem; cursor: pointer; clip-path: polygon(.35rem 0, 100% 0, 100% calc(100% - .35rem), calc(100% - .35rem) 100%, 0 100%, 0 .35rem); }.title-actions button.active { border-color: var(--molten-red); color: var(--molten-red-bright); }.title-actions .primary { background: var(--molten-red); color: var(--on-accent); border-color: var(--molten-red); }
.tower-workspace { display: grid; grid-template-columns: minmax(19rem, 27rem) minmax(0, 1fr); gap: 1.25rem; align-items: start; }.cantilever-tower { position: relative; isolation: isolate; padding: 0 .7rem; }.cantilever-tower::before { content: ''; position: absolute; z-index: -1; left: 50%; top: 4rem; bottom: 1.5rem; width: 2.3rem; transform: translateX(-50%); background: linear-gradient(90deg, var(--color-surface), color-mix(in srgb, var(--molten-red) 7%, var(--color-surface)), var(--color-surface)); border-left: 1px solid var(--molten-red); border-right: 1px solid var(--molten-red); }
.tower-roof { height: 5rem; position: relative; display: flex; align-items: flex-end; justify-content: center; padding-bottom: .65rem; clip-path: polygon(50% 0, 100% 100%, 0 100%); background: linear-gradient(145deg, color-mix(in srgb, var(--molten-red) 30%, var(--color-surface)), var(--color-surface) 65%); border-bottom: 2px solid var(--molten-red); color: var(--color-ink-dim); }.tower-roof::before { content: ''; position: absolute; inset: .6rem 17% 0; clip-path: polygon(50% 0, 100% 100%, 0 100%); background: color-mix(in srgb, var(--molten-red) 7%, transparent); }.tower-roof span { position: absolute; bottom: .5rem; left: 1rem; color: var(--molten-red-bright); font: .46rem var(--font-display); letter-spacing: .13em; }.tower-roof b { position: relative; font: 600 .85rem var(--font-serif); letter-spacing: .18em; }
.tower-strata { display: flex; flex-direction: column; gap: .4rem; }.stratum { position: relative; isolation: isolate; width: calc(100% - 1.6rem); height: 4.15rem; display: grid; grid-template-columns: 3.2rem minmax(4rem, .75fr) minmax(5rem, 1fr) auto; align-items: center; gap: .45rem; margin-bottom: .35rem; padding: 0 .85rem; text-align: left; border: 1px solid var(--molten-line); border-bottom: 1px solid var(--molten-line); background: var(--color-surface); color: var(--color-ink-dim); overflow: hidden; cursor: pointer; box-shadow: 0 .35rem 0 color-mix(in srgb, var(--color-surface-2) 80%, transparent); clip-path: polygon(0 0, 100% 0, calc(100% - .7rem) 100%, 0 100%); transition: transform .2s, background .2s; }.stratum:nth-child(odd) { margin-left: 0; margin-right: auto; }.stratum:nth-child(even) { margin-left: auto; margin-right: 0; grid-template-columns: 3rem minmax(4rem, 1fr) auto; clip-path: polygon(0 0, 100% 0, 100% 100%, .7rem 100%); }.stratum:nth-child(even) .stratum-theme { display: none; }.stratum > img { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; opacity: .12; filter: saturate(.55); }.stratum-shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, var(--color-surface) 15%, color-mix(in srgb, var(--color-surface) 78%, transparent)); }.stratum-code { color: var(--molten-red-bright); font: .63rem var(--font-display); letter-spacing: .08em; }.stratum-name { color: var(--color-ink); font: 600 .85rem var(--font-serif); letter-spacing: .08em; }.stratum-theme { color: var(--color-ink-faint); font-size: .55rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }.stratum-count { color: var(--color-ink-faint); font-size: .55rem; white-space: nowrap; }.stratum-count b { color: var(--color-ink-dim); font: .8rem var(--font-display); }.stratum-mark { display: none; }.stratum:hover { background: var(--color-surface-2); transform: translateX(.2rem); }.stratum.is-active { width: 100%; height: 5rem; background: var(--molten-red); color: var(--on-accent); border-bottom-color: var(--molten-red-bright); box-shadow: 0 .4rem 0 color-mix(in srgb, var(--molten-red) 35%, transparent); transform: none; }.stratum.is-active > img { opacity: .28; }.stratum.is-active .stratum-shade { background: linear-gradient(90deg, color-mix(in srgb, var(--molten-red) 85%, transparent), color-mix(in srgb, var(--molten-red) 50%, transparent)); }.stratum.is-active .stratum-code, .stratum.is-active .stratum-name, .stratum.is-active .stratum-theme, .stratum.is-active .stratum-count, .stratum.is-active .stratum-count b { color: var(--on-accent); }.stratum.is-sorting { outline: 1px dashed var(--molten-red-bright); outline-offset: -.25rem; cursor: grab; }
.tower-base { min-height: 2.6rem; margin: .8rem -.2rem 0; padding: .4rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: .5rem; background: var(--color-surface-2); border: 1px solid var(--molten-line); border-top: 2px solid var(--molten-red); clip-path: polygon(.5rem 0, calc(100% - .5rem) 0, 100% 100%, 0 100%); }.tower-base span { color: var(--color-ink-faint); font: .47rem var(--font-display); letter-spacing: .1em; }.tower-base b { color: var(--color-ink-dim); font-size: .65rem; font-weight: 500; }.tower-sort { display: flex; gap: .3rem; margin-left: auto; }.tower-sort button { width: 1.6rem; height: 1.6rem; display: grid; place-items: center; padding: 0; border: 1px solid var(--molten-line); background: transparent; color: var(--color-ink-dim); font-size: .6rem; line-height: 1; cursor: pointer; clip-path: polygon(.25rem 0, 100% 0, 100% calc(100% - .25rem), calc(100% - .25rem) 100%, 0 100%, 0 .25rem); transition: color .15s, border-color .15s, background .15s; }.tower-sort button:hover:not(:disabled) { color: var(--molten-red-bright); border-color: var(--molten-red); background: color-mix(in srgb, var(--molten-red) 8%, transparent); }.tower-sort button:disabled { opacity: .32; cursor: default; }
.floor-detail { min-width: 0; border: 1px solid var(--molten-line); background: var(--color-surface); clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%); }.detail-banner { height: 10rem; position: relative; isolation: isolate; display: flex; align-items: flex-end; padding: 1.2rem 1.35rem; overflow: hidden; }.detail-banner > img { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; filter: saturate(.7); }.detail-shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, color-mix(in srgb, var(--molten-dark) 93%, transparent), color-mix(in srgb, var(--molten-dark) 55%, transparent) 58%, color-mix(in srgb, var(--molten-dark) 20%, transparent)), linear-gradient(0deg, color-mix(in srgb, var(--molten-dark) 80%, transparent), transparent); }.detail-copy { color: var(--molten-light); }.detail-copy > span { color: var(--molten-red-bright); font: .55rem var(--font-display); letter-spacing: .16em; }.detail-copy h2 { margin: .25rem 0; font: 600 1.65rem var(--font-serif); letter-spacing: .1em; }.detail-copy p { margin: 0; color: var(--molten-muted); font-size: .62rem; }.detail-tags { position: absolute; top: 1rem; right: 1rem; display: flex; gap: .4rem; }.detail-tags b { padding: .15rem .45rem; border: 1px solid color-mix(in srgb, var(--molten-light) 30%, transparent); background: color-mix(in srgb, var(--molten-dark) 60%, transparent); color: var(--molten-light); font: .5rem var(--font-display); letter-spacing: .08em; }.floor-actions { position: absolute; right: 1rem; bottom: 1rem; display: flex; gap: .5rem; }.floor-actions button { border: 0; background: transparent; color: var(--molten-red-bright); font-size: .58rem; cursor: pointer; }.floor-actions .danger { color: var(--molten-muted); }.floor-actions .danger:hover { color: var(--error); }
.detail-status { min-height: 3rem; display: flex; align-items: center; gap: 1rem; padding: 0 1.2rem; border-bottom: 1px solid var(--molten-line); background: var(--color-surface-2); }.detail-tabs { display: flex; align-self: stretch; gap: 1rem; }.detail-tabs button { position: relative; border: 0; background: transparent; color: var(--color-ink-faint); font-size: .62rem; white-space: nowrap; cursor: pointer; }.detail-tabs button b { margin-left: .2rem; font: .55rem var(--font-display); }.detail-tabs button.active { color: var(--molten-red-bright); }.detail-tabs button.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--molten-red); }.detail-status > span { margin-left: auto; color: var(--color-ink-faint); font-size: .5rem; white-space: nowrap; }
.roster-heading { display: flex; align-items: flex-end; gap: 1rem; padding: 1rem 1.2rem .2rem; }.roster-heading > div { margin-right: auto; }.roster-heading span { color: var(--color-ink-faint); font: .46rem var(--font-display); letter-spacing: .15em; }.roster-heading h3 { margin: .15rem 0; font: 600 .95rem var(--font-serif); }.roster-heading button { padding: .45rem .65rem; border: 1px solid var(--molten-red); background: color-mix(in srgb, var(--molten-red) 7%, transparent); color: var(--molten-red-bright); font-size: .58rem; cursor: pointer; }
.floor-loading { padding: 4rem 1rem; border: 1px dashed var(--molten-line); color: var(--color-ink-faint); text-align: center; }.system-placeholder { margin: 1rem; padding: 4rem 1rem; border: 1px dashed var(--molten-line); text-align: center; color: var(--color-ink-faint); }.system-placeholder > span { color: var(--molten-red-bright); font: 2rem var(--font-display); }.system-placeholder h3 { color: var(--color-ink); font: 600 1rem var(--font-serif); }.system-placeholder p { font-size: .65rem; }
.orphan-roster { border: 1px dashed var(--molten-line); background: var(--color-surface); }.orphan-roster > header { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem; border-bottom: 1px solid var(--molten-line); }.orphan-roster > header > div { margin-right: auto; }.orphan-roster > header span { color: var(--color-ink-faint); font: .46rem var(--font-display); letter-spacing: .14em; }.orphan-roster > header h2 { margin: .2rem 0 0; font: 600 1rem var(--font-serif); }.orphan-roster > header button { padding: .45rem .65rem; border: 1px solid var(--molten-line); background: transparent; color: var(--molten-red-bright); cursor: pointer; }
@media (max-width: 72rem) { .tower-workspace { grid-template-columns: minmax(17rem, 20rem) minmax(0, 1fr); }.stratum { grid-template-columns: 3rem minmax(4rem, 1fr) auto; }.stratum-theme { display: none; } }
@media (max-width: 50rem) { .tower-workspace { grid-template-columns: 1fr; }.cantilever-tower { width: 100%; max-width: 34rem; margin-inline: auto; }.floor-detail { clip-path: none; }.detail-status > span { display: none; } }
@media (max-width: 34rem) { .floor-title { align-items: flex-start; flex-wrap: wrap; padding-inline: .1rem; }.title-actions { width: 100%; }.title-actions button { flex: 1; }.tower-workspace { gap: .85rem; }.stratum { height: 3.7rem; }.stratum.is-active { height: 4.3rem; }.tower-base span { display: none; }.tower-base { justify-content: center; }.detail-banner { height: 8.5rem; padding: 1rem; }.detail-copy h2 { font-size: 1.35rem; }.detail-copy p { max-width: 65%; }.floor-actions { bottom: .6rem; }.detail-status { padding-inline: .65rem; overflow-x: auto; }.detail-tabs { gap: .75rem; }.detail-tabs button { font-size: .55rem; }.roster-heading { padding-inline: .75rem; } }
</style>
