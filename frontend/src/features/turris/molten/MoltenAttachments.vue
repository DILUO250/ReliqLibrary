<script setup lang="ts">
import { computed } from 'vue'
import type { Librarian } from '@rtl/shared'

const props = defineProps<{
  regular: Librarian[]
  extras: Librarian[]
  romanMap: Map<number, string>
  savingHostId?: number | null
}>()
const emit = defineEmits<{
  create: []
  edit: [librarian: Librarian]
  preview: [librarian: Librarian]
  remove: [librarian: Librarian]
  hostChange: [librarian: Librarian, hostId: number | null]
}>()

interface HostGroup { key: string; host: Librarian | null; units: Librarian[] }
const groups = computed<HostGroup[]>(() => {
  const result: HostGroup[] = []
  const unassigned: Librarian[] = []
  for (const host of props.regular) {
    const units = props.extras.filter((unit) => unit.hostLibrarianId === host.id)
    if (units.length) result.push({ key: `host-${host.id}`, host, units })
  }
  for (const unit of props.extras) {
    if (!props.regular.some((host) => host.id === unit.hostLibrarianId)) unassigned.push(unit)
  }
  if (unassigned.length) result.push({ key: 'host-unassigned', host: null, units: unassigned })
  return result
})

function changeHost(unit: Librarian, event: Event): void {
  const raw = (event.target as HTMLSelectElement).value
  emit('hostChange', unit, raw ? Number(raw) : null)
}
</script>

<template>
  <section class="attachments" aria-label="附加单位编制">
    <header class="attachment-head">
      <div><span>SUBORDINATE CORE ASSIGNMENT</span><h3>附属核心书页</h3><p>附属单位不占正式编号，从宿主核心书页向外展开。</p></div>
      <button type="button" @click="emit('create')">＋ 添加附加单位</button>
    </header>
    <div class="binding-note"><i></i><span>空宿主框表示尚未绑定。可在每个单位右侧直接选择同楼层正式单位，也可在编辑弹窗中修改。</span></div>
    <div v-if="!extras.length" class="attachment-empty"><span>∅</span><h3>本楼层暂无附加单位</h3><p>新建后可暂不指定宿主，单位会保留在空宿主框下。</p><button type="button" @click="emit('create')">＋ 添加附加单位</button></div>
    <div v-else class="host-groups">
      <section v-for="group in groups" :key="group.key" class="host-group" :class="{ 'is-unassigned': !group.host }">
        <article v-if="group.host" class="host-core">
          <div class="host-portrait"><img v-if="group.host.portraitPreview || group.host.portrait" :src="group.host.portraitPreview || group.host.portrait" :alt="group.host.name" /><span v-else>{{ group.host.name.slice(0, 1) }}</span></div>
          <div><small>正式单位 / {{ romanMap.get(group.host.id) || '—' }}</small><h4>{{ group.host.name }}</h4><p>{{ group.host.title || '核心书页未填写' }}</p></div>
          <b>宿主核心</b>
        </article>
        <article v-else class="host-core host-core--empty">
          <div class="host-portrait"><span>∅</span></div>
          <div><small>HOST / UNASSIGNED</small><h4>未指定宿主</h4><p>等待手动建立附属关系</p></div>
          <b>空宿主框</b>
        </article>
        <div class="host-branches">
          <article v-for="(unit, index) in group.units" :key="unit.id" class="attachment-card">
            <div class="branch-joint"><i></i><span>{{ String(index + 1).padStart(2, '0') }}</span></div>
            <div class="attachment-portrait">
              <img v-if="unit.portraitPreview || unit.portrait" :src="unit.portraitPreview || unit.portrait" :alt="unit.name" />
              <span v-else>{{ unit.name.slice(0, 1) }}</span><b>{{ unit.rarity }}</b>
            </div>
            <div class="attachment-copy">
              <span>附属单位 · 不占正式编号</span><h4>{{ unit.name }}</h4><p>{{ unit.title || '核心书页未填写' }}</p>
              <label>宿主核心
                <select :value="unit.hostLibrarianId ?? ''" :disabled="savingHostId === unit.id" @change="changeHost(unit, $event)">
                  <option value="">未指定宿主</option>
                  <option v-for="host in regular" :key="host.id" :value="host.id">{{ host.name }} · {{ host.title || '核心书页未填写' }}</option>
                </select>
              </label>
              <small v-if="savingHostId === unit.id">正在保存宿主关系…</small>
            </div>
            <div class="attachment-actions"><button type="button" @click="emit('preview', unit)">卡组 ↗</button><button type="button" @click="emit('edit', unit)">编辑</button><button type="button" class="danger" @click="emit('remove', unit)">删除</button></div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.attachment-head { display: flex; align-items: flex-end; gap: 1rem; padding: 1rem 1.2rem .7rem; }.attachment-head > div { margin-right: auto; }.attachment-head span { color: var(--color-ink-faint); font: .5rem var(--font-display); letter-spacing: .15em; }.attachment-head h3 { margin: .15rem 0; font: 600 1rem var(--font-serif); letter-spacing: .08em; }.attachment-head p { margin: 0; color: var(--color-ink-faint); font-size: .62rem; }
.attachment-head > button, .attachment-empty button { padding: .45rem .65rem; border: 1px solid var(--molten-red); background: color-mix(in srgb, var(--molten-red) 9%, var(--color-surface)); color: var(--molten-red-bright); font-size: .62rem; cursor: pointer; }
.binding-note { display: flex; align-items: center; gap: .5rem; margin: 0 1.2rem .8rem; padding: .45rem .6rem; border-left: 2px solid var(--color-gold); background: color-mix(in srgb, var(--color-gold) 5%, transparent); color: var(--color-ink-faint); font-size: .58rem; line-height: 1.6; }.binding-note i { flex: 0 0 .3rem; height: .3rem; background: var(--color-gold); transform: rotate(45deg); }
.host-groups { display: flex; flex-direction: column; gap: .75rem; padding: 0 1.2rem 1.2rem; }.host-group { display: grid; grid-template-columns: minmax(9rem, 11rem) minmax(0, 1fr); position: relative; border-top: 1px solid var(--molten-line); background: linear-gradient(90deg, color-mix(in srgb, var(--molten-red) 5%, transparent), transparent 45%); }.host-group.is-unassigned { border-top-style: dashed; }
.host-core { position: relative; min-width: 0; display: flex; flex-direction: column; padding: .7rem .8rem; border-right: 1px solid var(--molten-line); background: var(--color-surface-2); }.host-core::after { content: ''; position: absolute; right: -.3rem; top: 50%; width: .55rem; height: .55rem; background: var(--molten-red); transform: translateY(-50%) rotate(45deg); z-index: 2; }.host-core--empty { border: 1px dashed var(--molten-line); background: transparent; }.host-core--empty::after { background: var(--color-ink-faint); }
.host-portrait { height: 5rem; margin-bottom: .5rem; overflow: hidden; background: var(--color-bg); }.host-portrait img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }.host-portrait > span { display: grid; place-items: center; height: 100%; color: var(--color-ink-faint); font: 1.5rem var(--font-serif); }.host-core small { color: var(--molten-red-bright); font: .48rem var(--font-display); letter-spacing: .06em; }.host-core h4 { margin: .15rem 0; font: 600 .82rem var(--font-serif); overflow-wrap: anywhere; }.host-core p { margin: 0; color: var(--color-ink-faint); font-size: .52rem; line-height: 1.5; }.host-core > b { margin-top: auto; padding-top: .45rem; color: var(--color-ink-dim); font-size: .5rem; font-weight: 500; }
.host-branches { min-width: 0; }.attachment-card { display: grid; grid-template-columns: 1.8rem 5rem minmax(0, 1fr) auto; align-items: stretch; min-height: 7rem; border-bottom: 1px solid var(--molten-line); }.attachment-card:last-child { border-bottom: 0; }.branch-joint { position: relative; display: flex; align-items: center; justify-content: center; color: var(--color-ink-faint); font: .45rem var(--font-display); }.branch-joint::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--molten-line); }.branch-joint i { position: absolute; left: 50%; top: 0; bottom: 50%; width: 1px; background: var(--molten-line); }.branch-joint span { position: relative; padding: .15rem; background: var(--color-surface); }
.attachment-portrait { position: relative; margin: .65rem 0; background: var(--color-bg); overflow: hidden; }.attachment-portrait img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }.attachment-portrait > span { display: grid; place-items: center; height: 100%; color: var(--color-ink-faint); font: 1.4rem var(--font-serif); }.attachment-portrait > b { position: absolute; right: .25rem; bottom: .25rem; padding: .1rem .25rem; color: var(--molten-light); background: var(--molten-red); font: .45rem var(--font-display); }
.attachment-copy { min-width: 0; padding: .65rem .8rem; }.attachment-copy > span { color: var(--molten-red-bright); font-size: .48rem; }.attachment-copy h4 { margin: .15rem 0; font: 600 .85rem var(--font-serif); }.attachment-copy > p { margin: 0 0 .45rem; color: var(--color-ink-faint); font-size: .55rem; overflow-wrap: anywhere; }.attachment-copy label { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: .45rem; color: var(--color-ink-dim); font-size: .52rem; }.attachment-copy select { min-width: 0; width: 100%; padding: .3rem .4rem; border: 1px solid var(--molten-line); background: var(--color-bg); color: var(--color-ink); font: .55rem var(--font-sans); }.attachment-copy > small { color: var(--color-gold); font-size: .5rem; }
.attachment-actions { display: flex; flex-direction: column; justify-content: center; gap: .35rem; padding: .5rem; }.attachment-actions button { padding: .35rem .45rem; border: 1px solid var(--molten-line); background: transparent; color: var(--color-ink-dim); font-size: .52rem; white-space: nowrap; cursor: pointer; }.attachment-actions button:hover { border-color: var(--molten-red); color: var(--molten-red-bright); }.attachment-actions .danger:hover { color: var(--error); border-color: var(--error); }
.attachment-empty { margin: 1rem; padding: 3rem 1rem; border: 1px dashed var(--molten-line); text-align: center; color: var(--color-ink-faint); }.attachment-empty > span { font: 2rem var(--font-display); }.attachment-empty h3 { color: var(--color-ink); font: 600 1rem var(--font-serif); }.attachment-empty p { font-size: .65rem; }
@media (max-width: 72rem) { .host-group { grid-template-columns: 8rem minmax(0, 1fr); }.attachment-card { grid-template-columns: 1.4rem 4rem minmax(0, 1fr); }.attachment-actions { grid-column: 3; flex-direction: row; justify-content: flex-start; padding-top: 0; } }
@media (max-width: 42rem) { .attachment-head { align-items: flex-start; padding-inline: .75rem; }.attachment-head p { max-width: 14rem; }.binding-note { margin-inline: .75rem; }.host-groups { padding-inline: .75rem; }.host-group { grid-template-columns: 1fr; }.host-core { display: grid; grid-template-columns: 3.6rem minmax(0, 1fr) auto; align-items: center; gap: .6rem; border-right: 0; border-bottom: 1px solid var(--molten-line); }.host-core::after { right: auto; left: 1.9rem; top: auto; bottom: -.3rem; transform: rotate(45deg); }.host-portrait { height: 3.6rem; margin: 0; }.host-core > b { margin: 0; padding: 0; }.attachment-card { grid-template-columns: 1.2rem 4.2rem minmax(0, 1fr); }.attachment-copy { padding: .55rem; }.attachment-copy label { grid-template-columns: 1fr; }.attachment-actions { grid-column: 2 / -1; padding: 0 .55rem .55rem; } }
</style>
