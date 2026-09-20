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
// 同号/无编号行按 id 次序稳定排列。缩略图与摘要在此一次性预解析，避免模板里重复 JSON.parse。
// 摘要：运营备注（note）优先，空则回退报告描述首段（方案A · 草稿 2.2）。
const rows = computed(() =>
  store.list
    .map((entity) => {
      const report = parseAnomalyReport(entity.report)
      return {
        entity,
        thumb: report.figures[0]?.url ?? '',
        summary: (entity.note || '').trim() || report.description[0] || '',
      }
    })
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

/* ---------- 列表缩略图（走后端按需小图接口，原图只在报告单/预览用）----------
 * 后端第一次生成后连浏览器缓存一起长缓存；小图生成/加载失败时回退原图，绝不白块。 */
const THUMB_WIDTH = 320

function thumbUrl(url: string): string {
  return `/api/armarium/anomaly-thumb?url=${encodeURIComponent(url)}&w=${THUMB_WIDTH}`
}

const thumbFailed = ref(new Set<number>())

function onThumbError(entityId: number): void {
  thumbFailed.value.add(entityId)
  // Set 原地修改不触发响应式，替换一个新 Set 保证模板重算
  thumbFailed.value = new Set(thumbFailed.value)
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
          <img
            v-if="row.thumb"
            :src="thumbFailed.has(row.entity.id) ? row.thumb : thumbUrl(row.thumb)"
            :alt="row.entity.name"
            width="160"
            height="140"
            loading="lazy"
            decoding="async"
            @error="onThumbError(row.entity.id)"
          />
          <span v-else class="latin">IMG</span>
        </button>
        <div class="entity-card__body">
          <div class="entity-card__top">
            <span class="entity-card__code latin">{{ anomalyFullCode(row.entity) }}</span>
            <span
              class="entity-card__level"
              :style="{ '--lv': levelColor(row.entity.level) }"
            >{{ anomalyLevelText(row.entity.level, row.entity.subLevel) }}</span>
          </div>
          <h3 class="entity-card__name">{{ row.entity.name || '未命名实体' }}</h3>
          <p v-if="row.summary" class="entity-card__desc">{{ row.summary }}</p>
        </div>
        <div class="entity-card__actions">
          <button type="button" class="entity-card__btn" @click="openReport(row.entity.id)">预览</button>
          <button type="button" class="entity-card__btn entity-card__btn--edit" @click="openEditor(row.entity.id)">编辑</button>
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

/* ---------- 方案A · 档案横条（草稿 2.2）----------
 * 单列通栏、行间 1px 分割线、无盒子感；卡片高 164px 恒定（缩略图 140 + 上下 24）；
 * 缩略图 160×140 固定像素 + 恒居左侧 + cover 居中裁切，绝不随影像比例调整；
 * 信息区（编号+徽章 / 名称 / 一行摘要）实测 ~70px < 140，名称/摘要截断保证不破版。 */
.entities__rail {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.entity-card {
  align-items: center;
  border-bottom: 1px solid var(--color-line);
  box-sizing: border-box;
  display: flex;
  gap: 16px;
  height: 164px;
  min-width: 0;
  overflow: hidden;
  padding: 12px 2px;
  transition: background 0.15s ease;
}

.entity-card:last-child {
  border-bottom: none;
}

.entity-card:hover {
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

.entity-card__thumb {
  background: #0d0a07;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  cursor: pointer;
  flex: none;
  height: 140px;
  overflow: hidden;
  padding: 0;
  width: 160px;
}

.entity-card__thumb img {
  display: block;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
  gap: 2px;
  min-width: 0;
}

.entity-card__top {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.entity-card__code {
  color: var(--color-ink-faint);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.entity-card__level {
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--lv) 60%, transparent);
  border-radius: 999px;
  color: var(--lv);
  flex: none;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  padding: 1px 8px;
}

.entity-card__name {
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-card__desc {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  color: var(--color-ink-dim);
  display: -webkit-box;
  font-size: 12px;
  line-height: 1.5;
  margin: 2px 0 0;
  overflow: hidden;
}

.entity-card__actions {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 6px;
  width: 64px;
}

.entity-card__btn {
  background: transparent;
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--accent) 55%, transparent);
  border-radius: var(--radius);
  color: var(--color-ink);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 5px 0;
  transition: background 0.15s ease, color 0.15s ease;
  width: 100%;
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
  /* 卡片转纵向堆叠，但缩略图保持 160×140 固定尺寸不拉伸（草稿要求⑥） */
  .entity-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    height: auto;
  }

  .entity-card__thumb {
    height: 140px;
    width: 160px;
  }

  .entity-card__actions {
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .entity-card__btn {
    flex: 1;
  }
}
</style>
