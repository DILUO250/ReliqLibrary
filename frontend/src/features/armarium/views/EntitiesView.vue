<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnomaliesStore } from '@/features/armarium/store/anomalies'
import {
  anomalyFullCode,
  anomalyLevelText,
  parseAnomalyReport,
  type Anomaly,
  type AnomalyLevel,
} from '@rtl/shared'

const router = useRouter()
const store = useAnomaliesStore()

onMounted(() => {
  // 每次进入都强制刷新（编辑器保存/返回后保证列表最新；loaded 缓存短路会漏掉跨页修改）
  void store.reload()
  window.addEventListener('message', onMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
})

// 编辑器是独立窗口（window.open）：保存成功后 postMessage 通知本页刷新，
// 列表窗口从未离开 → 浏览位置天然不动，只更新数据。
function onMessage(event: MessageEvent): void {
  if (event.origin !== window.location.origin) return
  if (event.data === 'rtl:anomalies-updated') {
    void store.reload()
  }
}

// 按 SCL 编号数字升序存放（编号位数不限，纯数字比较才不会 10000 排在 999 前）；
// 同号/无编号行按 id 次序稳定排列。缩略图在此一次性预解析，避免模板里重复 JSON.parse。
const rows = computed(() =>
  store.list
    .map((entity) => ({
      entity,
      thumb: parseAnomalyReport(entity.report).figures[0]?.url ?? '',
    }))
    .sort((a, b) => {
      const da = Number(a.entity.code.replace(/\D/g, '')) || Number.MAX_SAFE_INTEGER
      const db = Number(b.entity.code.replace(/\D/g, '')) || Number.MAX_SAFE_INTEGER
      return da - db || a.entity.id - b.entity.id
    }),
)

const LEVEL_COLORS: Record<AnomalyLevel, string> = {
  safe: 'var(--level-safe, #8fc98f)',
  euclid: 'var(--level-euclid, #7b4f9e)',
  keter: 'var(--level-keter, #c0503a)',
}

function levelColor(level: string): string {
  return LEVEL_COLORS[level as AnomalyLevel] ?? LEVEL_COLORS.safe
}

/* ---------- 搜索筛选（纯客户端过滤：名称模糊 / 编号 / 主等级） ---------- */

const query = ref('')
const levelFilter = ref<'all' | AnomalyLevel>('all')

function digitsOf(s: string): string {
  return (s || '').replace(/\D/g, '')
}

const filteredRows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const qd = digitsOf(q)
  const lv = levelFilter.value
  return rows.value.filter(({ entity }) => {
    if (lv !== 'all' && entity.level !== lv) return false
    if (!q) return true
    // 名称子串匹配；编号输入支持 88889 / SCL-88889 / SCL- 三种写法
    const nameHit = (entity.name || '').toLowerCase().includes(q)
    const codeHit = qd ? digitsOf(entity.code).includes(qd) : anomalyFullCode(entity).toLowerCase().includes(q)
    return nameHit || codeHit
  })
})

const isFiltering = computed(() => query.value.trim() !== '' || levelFilter.value !== 'all')

const countText = computed(() =>
  isFiltering.value ? `${filteredRows.value.length}/${rows.value.length} 实体` : `${rows.value.length} 实体`,
)

function resetFilters(): void {
  query.value = ''
  levelFilter.value = 'all'
}

function openReport(id: number): void {
  void router.push(`/armarium/entities/${id}`)
}

// 编辑器走独立浏览器窗口（window.open）：不受通用容器限制；
// 不加 noopener——编辑器窗口需要 window.opener 回传"已保存"通知。
function openEditor(id: number): void {
  window.open(router.resolve(`/armarium/entities/${id}/edit`).href, '_blank')
}

function createEntity(): void {
  window.open(router.resolve('/armarium/entities/new/edit').href, '_blank')
}
</script>

<template>
  <section class="entities" aria-labelledby="entities-title">
    <div class="entities__heading">
      <div>
        <span class="entities__eyebrow latin">Entitas Anomala</span>
        <h2 id="entities-title">异常实体库</h2>
      </div>
      <div class="entities__heading-side">
        <span class="entities__count">{{ countText }}</span>
        <button type="button" class="entities__create" @click="createEntity">＋ 新建异常实体</button>
      </div>
    </div>

    <div v-if="rows.length" class="entities__filters">
      <input
        v-model="query"
        type="search"
        class="entities__input"
        placeholder="搜索名称或编号（如：焦化 / 88889 / SCL-88889）"
      />
      <select v-model="levelFilter" class="entities__select" aria-label="按危险等级筛选">
        <option value="all">全部等级</option>
        <option value="safe">SAFE</option>
        <option value="euclid">Euclid</option>
        <option value="keter">Keter</option>
      </select>
      <button v-if="isFiltering" type="button" class="entities__clear" @click="resetFilters">清空</button>
    </div>

    <p v-if="store.loading && !store.list.length" class="entities__hint">读取实体档案中…</p>
    <div v-else-if="filteredRows.length" class="entities__rail">
      <article v-for="row in filteredRows" :key="row.entity.id" class="entity-card">
        <button
          type="button"
          class="entity-card__thumb"
          :class="{ 'entity-card__thumb--empty': !row.thumb }"
          @click="openReport(row.entity.id)"
        >
          <img v-if="row.thumb" :src="row.thumb" :alt="row.entity.name" />
          <span v-else class="latin">IMG</span>
        </button>
        <div class="entity-card__body">
          <span class="entity-card__code latin">{{ anomalyFullCode(row.entity) }}</span>
          <h3 class="entity-card__name">{{ row.entity.name || '未命名实体' }}</h3>
          <div class="entity-card__meta">
            <span
              class="entity-card__level"
              :style="{ '--lv': levelColor(row.entity.level) }"
            >{{ anomalyLevelText(row.entity.level, row.entity.subLevel) }}</span>
          </div>
          <div class="entity-card__actions">
            <button type="button" class="entity-card__btn" @click="openReport(row.entity.id)">预览</button>
            <button type="button" class="entity-card__btn entity-card__btn--edit" @click="openEditor(row.entity.id)">编辑</button>
          </div>
        </div>
      </article>
    </div>
    <div v-else-if="rows.length" class="entities__empty">
      <p>无匹配的异常实体，换个关键词试试。</p>
      <button type="button" class="entities__create" @click="resetFilters">清空筛选</button>
    </div>
    <div v-else class="entities__empty">
      <p>暂无异常实体档案。</p>
      <button type="button" class="entities__create" @click="createEntity">＋ 新建第一份异常实体报告</button>
    </div>
  </section>
</template>

<style scoped>
.entities {
  border-top: var(--bd-w) var(--bd-style) var(--bd-color);
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  padding-top: 22px;
}

.entities__heading {
  align-items: end;
  display: flex;
  justify-content: space-between;
}

.entities__eyebrow {
  color: var(--accent);
  display: block;
  font-size: 11px;
  letter-spacing: 0.16em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.entities h2 {
  font-size: 22px;
  margin: 0;
}

.entities__heading-side {
  align-items: center;
  display: flex;
  gap: 14px;
}

.entities__count {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.entities__create {
  background: transparent;
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--accent) 65%, transparent);
  border-radius: var(--radius);
  color: var(--color-ink);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 8px 14px;
  transition: background 0.2s ease, color 0.2s ease;
}

.entities__create:hover {
  background: var(--accent);
  color: #1b1408;
}

.entities__hint {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.entities__filters {
  align-items: center;
  display: flex;
  gap: 10px;
}

.entities__input {
  background: rgba(13, 10, 7, 0.6);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink);
  flex: 1;
  font-family: var(--font-sans);
  font-size: 13px;
  max-width: 360px;
  padding: 8px 12px;
}

.entities__input::placeholder {
  color: var(--color-ink-faint);
}

.entities__input:focus,
.entities__select:focus {
  border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  outline: none;
}

.entities__select {
  background: rgba(13, 10, 7, 0.6);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 8px 10px;
}

.entities__select option {
  background: #1b1408;
  color: var(--color-ink);
}

.entities__clear {
  background: transparent;
  border: none;
  color: var(--color-ink-faint);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 4px 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.entities__clear:hover {
  color: var(--color-ink);
}

.entities__rail {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
}

.entity-card {
  align-items: stretch;
  background: linear-gradient(135deg, rgba(55, 45, 32, 0.9), rgba(34, 27, 20, 0.92));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) * 2);
  display: flex;
  gap: 16px;
  overflow: hidden;
  padding: 16px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.entity-card:hover {
  border-color: color-mix(in srgb, var(--accent) 70%, var(--color-line));
  transform: translateY(-2px);
}

.entity-card__thumb {
  background: #0d0a07;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  cursor: pointer;
  flex: none;
  height: 118px;
  object-fit: cover;
  overflow: hidden;
  padding: 0;
  width: 160px;
}

.entity-card__thumb img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.entity-card__thumb--empty {
  align-items: center;
  color: var(--color-ink-faint);
  display: flex;
  justify-content: center;
}

.entity-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.entity-card__code {
  color: var(--color-ink-faint);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.entity-card__name {
  color: var(--color-ink);
  font-size: 19px;
  margin: 4px 0 8px;
}

.entity-card__meta {
  align-items: center;
  display: flex;
  font-size: 12px;
  gap: 10px;
}

.entity-card__level {
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--lv) 60%, transparent);
  border-radius: 999px;
  color: var(--lv);
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 2px 10px;
}

.entity-card__actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
}

.entity-card__btn {
  background: transparent;
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--accent) 55%, transparent);
  border-radius: var(--radius);
  color: var(--color-ink);
  cursor: pointer;
  flex: 1;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 7px 0;
  transition: background 0.2s ease, color 0.2s ease;
}

.entity-card__btn:hover {
  background: var(--accent);
  color: #1b1408;
}

.entity-card__btn--edit {
  border-style: dashed;
}

.entities__empty {
  border: var(--bd-w) dashed var(--bd-color);
  border-radius: calc(var(--radius) + 4px);
  color: var(--color-ink-dim);
  padding: 48px 24px;
  text-align: center;
}

@media (max-width: 640px) {
  .entity-card {
    flex-direction: column;
  }

  .entity-card__thumb {
    width: 100%;
  }
}
</style>
