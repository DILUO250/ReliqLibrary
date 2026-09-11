<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ensureTermIndex } from '@/features/turris/terms/renderer'
import { useTermsStore } from '@/features/turris/store/terms'

const emit = defineEmits<{ (e: 'insert', text: string): void }>()

// 数据源 = SQLite（term_sections / term_entries）经 store 的内存缓存：
// 与渲染器共用同一份索引，全局只拉取一次（ensureTermIndex 幂等）。
const store = useTermsStore()
const ready = computed(() => store.loaded)
onMounted(() => {
  void ensureTermIndex()
})

const showMenu = ref(false)
const showMech = ref(false)

/** 词典页可见分区（与 TermsView 同一判定：visible === true）。 */
const sections = computed(() => store.visibleSections)
/** 机制类状态分区（18 属性分组弹窗）。 */
const mechSection = computed(
  () => store.sections.find((s) => s.id === '机制类状态' && s.visible) ?? null,
)

/** 新版插入：带引号（渲染器立即可识别）；带参数位的词条追加 X层 参数位。 */
function insertText(name: string, hasParam: boolean): string {
  return hasParam ? `“${name}” X层` : `“${name}”`
}
function insert(name: string, hasParam: boolean): void {
  emit('insert', insertText(name, hasParam))
  showMenu.value = false
}
function insertMech(name: string, hasParam: boolean): void {
  emit('insert', insertText(name, hasParam))
  showMech.value = false
}
</script>

<template>
  <div class="term-inserter">
    <button
      type="button"
      class="ins-btn"
      :class="{ 'is-loading': !ready }"
      :title="ready ? '' : '术语词典加载中…'"
      @click="ready && (showMenu = !showMenu)"
    >
      📘 插入术语
    </button>
    <button
      type="button"
      class="ins-btn"
      :class="{ 'is-loading': !ready }"
      :title="ready ? '' : '术语词典加载中…'"
      @click="ready && (showMech = true)"
    >
      ⚙️ 机制状态
    </button>

    <div v-if="showMenu" class="term-menu" @mouseleave="showMenu = false">
      <p v-if="!ready" class="term-loading">术语词典加载中…</p>
      <template v-else>
        <section v-for="sec in sections" :key="sec.id" class="term-group">
          <h4>{{ sec.title }}</h4>
          <div v-for="g in sec.groups" :key="g.id">
            <div v-if="g.title" class="term-subgroup">{{ g.title }}</div>
            <div class="term-grid">
              <button
                v-for="item in g.entries"
                :key="item.id"
                type="button"
                class="term-item"
                :title="item.desc"
                @click="insert(item.name, item.hasParam)"
              >
                {{ item.name }}
              </button>
            </div>
          </div>
        </section>
      </template>
    </div>

    <div v-if="showMech" class="overlay" @click.self="showMech = false">
      <div class="mech-modal">
        <header class="mech-head">
          <h3>机制类状态</h3>
          <button type="button" class="close" @click="showMech = false">✕</button>
        </header>
        <div class="mech-body">
          <p v-if="!ready" class="term-loading">术语词典加载中…</p>
          <template v-else-if="mechSection">
            <section v-for="g in mechSection.groups" :key="g.id" class="term-group">
              <h4>{{ g.title }}</h4>
              <div class="term-grid">
                <button
                  v-for="item in g.entries"
                  :key="item.id"
                  type="button"
                  class="term-item"
                  :title="item.desc"
                  @click="insertMech(item.name, item.hasParam)"
                >
                  {{ item.name }}
                </button>
              </div>
            </section>
          </template>
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
.ins-btn.is-loading {
  opacity: 0.55;
  cursor: wait;
}
.term-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  width: 340px;
  max-height: 380px;
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
.term-subgroup {
  font-size: 11px;
  color: var(--color-ink-faint);
  margin: 6px 0 2px;
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
.term-loading {
  margin: 8px 0;
  font-size: 12px;
  color: var(--color-ink-faint);
  text-align: center;
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
