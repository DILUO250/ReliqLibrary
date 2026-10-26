<script setup lang="ts">
import { ref } from 'vue'
import type { Librarian } from '@rtl/shared'
import { BATTLE_SYSTEMS, parseSheet } from '@rtl/shared'

withDefaults(defineProps<{
  librarians: Librarian[]
  romanMap: Map<number, string>
  reorderMode?: boolean
  emptyText?: string
}>(), { reorderMode: false, emptyText: '本楼层暂无正式司书' })

const emit = defineEmits<{
  edit: [librarian: Librarian]
  preview: [librarian: Librarian]
  remove: [librarian: Librarian]
  reorder: [sourceId: number, targetId: number]
}>()
const draggedId = ref<number | null>(null)

function deckCount(row: Librarian): number {
  const sheet = parseSheet(row.sheet)
  if (!sheet) return 0
  const zones = BATTLE_SYSTEMS[sheet.battleSystem]?.deckZones
  if (zones?.length) return zones.reduce((n, zone) => n + (sheet.cards[zone.key]?.length ?? 0), 0)
  return sheet.cards.combat.length + sheet.cards.special.length + (sheet.cards.ego?.length ?? 0)
}
function systemCode(row: Librarian): string {
  const sheet = parseSheet(row.sheet)
  return sheet ? BATTLE_SYSTEMS[sheet.battleSystem]?.code ?? '' : ''
}
</script>

<template>
  <div v-if="!librarians.length" class="molten-empty">
    <span>∅</span><h3>{{ emptyText }}</h3><p>可通过上方的新建入口补充编制。</p>
  </div>
  <div v-else class="librarian-grid" :class="{ 'is-sorting': reorderMode }">
    <article
      v-for="lib in librarians"
      :key="lib.id"
      class="librarian-card"
      :draggable="reorderMode"
      @dragover.prevent
      @drop.prevent="draggedId != null && emit('reorder', draggedId, lib.id); draggedId = null"
      @dragstart="draggedId = lib.id"
      @dragend="draggedId = null"
    >
      <div class="librarian-art">
        <img v-if="lib.portraitPreview || lib.portrait" :src="lib.portraitPreview || lib.portrait" :alt="lib.name" />
        <div v-else class="portrait-fallback"><span>{{ lib.name.slice(0, 1) || '?' }}</span><small>PORTRAIT<br />NOT FILED</small></div>
        <span class="librarian-order">{{ romanMap.get(lib.id) || '—' }}</span>
        <span v-if="lib.rarity" class="librarian-rarity">{{ lib.rarity }}</span>
      </div>
      <div class="librarian-info">
        <div class="librarian-copy">
          <span class="librarian-system">{{ systemCode(lib) || 'CORE PAGE' }} · 卡组 {{ deckCount(lib) }}</span>
          <h3>{{ lib.name }}</h3>
          <p>{{ lib.title || '核心书页未填写' }}</p>
        </div>
        <div class="librarian-actions">
          <button type="button" @click="emit('preview', lib)">卡组 <span>↗</span></button>
          <button type="button" @click="emit('edit', lib)">编辑</button>
          <button type="button" class="danger" @click="emit('remove', lib)">删除</button>
        </div>
      </div>
      <span v-if="reorderMode" class="sort-hint">拖到目标卡片调整顺序</span>
    </article>
  </div>
</template>

<style scoped>
.librarian-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr)); gap: .85rem; padding: clamp(.8rem, 1.5vw, 1.2rem); }
.librarian-card { position: relative; display: grid; grid-template-columns: minmax(7rem, .78fr) minmax(0, 1fr); min-width: 0; border: 1px solid var(--molten-line); background: var(--color-surface-2); overflow: hidden; }
.librarian-card[draggable="true"] { cursor: grab; outline: 1px dashed var(--molten-red); outline-offset: -.25rem; }
.librarian-art { position: relative; min-height: 13rem; background: var(--color-bg); overflow: hidden; }
.librarian-art > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.librarian-order { position: absolute; top: .5rem; left: .55rem; color: var(--molten-light); font: 1.1rem var(--font-display); text-shadow: 0 1px .4rem var(--molten-dark); }
.librarian-rarity { position: absolute; right: .45rem; top: .45rem; padding: .15rem .35rem; color: var(--molten-light); background: var(--molten-red); font: .55rem var(--font-display); }
.portrait-fallback { height: 100%; display: grid; place-content: center; gap: .5rem; text-align: center; color: var(--color-ink-faint); }
.portrait-fallback span { font: 2rem var(--font-serif); }.portrait-fallback small { font: .45rem var(--font-display); letter-spacing: .12em; }
.librarian-info { min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: .75rem; padding: 1rem; border-left: 1px solid var(--molten-line); }
.librarian-system { color: var(--molten-red-bright); font: .5rem var(--font-display); letter-spacing: .06em; }
.librarian-copy h3 { margin: .3rem 0; font: 600 1rem var(--font-serif); overflow-wrap: anywhere; }
.librarian-copy p { margin: 0; color: var(--color-ink-dim); font-size: .65rem; line-height: 1.65; overflow-wrap: anywhere; }
.librarian-actions { display: flex; flex-wrap: wrap; gap: .35rem; }
.librarian-actions button { padding: .35rem .45rem; border: 1px solid var(--molten-line); background: transparent; color: var(--color-ink-dim); font-size: .55rem; cursor: pointer; }
.librarian-actions button:first-child { margin-left: auto; color: var(--molten-red-bright); }
.librarian-actions button:hover { border-color: var(--molten-red); color: var(--color-ink); }.librarian-actions .danger:hover { color: var(--error); border-color: var(--error); }
.sort-hint { position: absolute; inset: auto 0 0; padding: .2rem; text-align: center; color: var(--on-accent); background: var(--molten-red); font-size: .5rem; pointer-events: none; }
.molten-empty { margin: 1rem; padding: 3rem 1rem; text-align: center; border: 1px dashed var(--molten-line); color: var(--color-ink-faint); }
.molten-empty span { font: 2rem var(--font-display); }.molten-empty h3 { color: var(--color-ink); font: 600 1rem var(--font-serif); }.molten-empty p { font-size: .7rem; }
@media (max-width: 72rem) { .librarian-card { grid-template-columns: 1fr; }.librarian-art { min-height: 15rem; }.librarian-info { border-left: 0; border-top: 1px solid var(--molten-line); } }
@media (max-width: 34rem) { .librarian-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; padding: .65rem; }.librarian-art { min-height: 10rem; }.librarian-info { padding: .55rem; }.librarian-copy h3 { font-size: .78rem; }.librarian-copy p { font-size: .52rem; }.librarian-system { font-size: .42rem; }.librarian-actions button { padding: .3rem; font-size: .48rem; }.librarian-actions button:first-child { margin-left: 0; } }
</style>
