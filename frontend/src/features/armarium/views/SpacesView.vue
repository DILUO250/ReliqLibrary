<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSpacesStore } from '@/features/armarium/store/spaces'
import {
  anomalyFullCode,
  parseSpaceReport,
  spaceLevelText,
  type SpaceLevel,
  type SupernaturalSpace,
} from '@rtl/shared'

const router = useRouter()
const store = useSpacesStore()

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
  if (event.data === 'rtl:spaces-updated') {
    void store.reload()
  }
}

// 按 SCL 编号数字升序存放（编号位数不限，纯数字比较才不会 10000 排在 999 前）；
// 同号/无编号行按 id 次序稳定排列。缩略图与摘要在此一次性预解析，避免模板里重复 JSON.parse。
// 摘要：运营备注（note）优先，空则回退报告描述首段（方案A · 草稿 2.2 同款）。
const rows = computed(() =>
  store.list
    .map((space) => {
      const report = parseSpaceReport(space.report)
      return {
        space,
        thumb: report.figures[0]?.url ?? '',
        summary: (space.note || '').trim() || report.description[0] || '',
      }
    })
    .sort((a, b) => {
      const da = Number(a.space.code.replace(/\D/g, '')) || Number.MAX_SAFE_INTEGER
      const db = Number(b.space.code.replace(/\D/g, '')) || Number.MAX_SAFE_INTEGER
      return da - db || a.space.id - b.space.id
    }),
)

const LEVEL_COLORS: Record<SpaceLevel, string> = {
  safe: 'var(--level-safe, #8fc98f)',
  euclid: 'var(--level-euclid, #7b4f9e)',
  keter: 'var(--level-keter, #c0503a)',
}

function levelColor(level: string): string {
  return LEVEL_COLORS[level as SpaceLevel] ?? LEVEL_COLORS.safe
}

/* ---------- 列表缩略图（走后端按需小图接口，原图只在报告单/预览用）----------
 * anomaly-thumb 端点的路径守卫是 /art/armarium/ 全模块级，spaces 图片直接复用；
 * 小图生成/加载失败时回退原图，绝不白块。 */
const THUMB_WIDTH = 320

function thumbUrl(url: string): string {
  return `/api/armarium/anomaly-thumb?url=${encodeURIComponent(url)}&w=${THUMB_WIDTH}`
}

const thumbFailed = ref(new Set<number>())

function onThumbError(spaceId: number): void {
  thumbFailed.value.add(spaceId)
  // Set 原地修改不触发响应式，替换一个新 Set 保证模板重算
  thumbFailed.value = new Set(thumbFailed.value)
}

/* ---------- 搜索筛选（纯客户端过滤：名称模糊 / 编号 / 主等级） ---------- */

const query = ref('')
const levelFilter = ref<'all' | SpaceLevel>('all')

function digitsOf(s: string): string {
  return (s || '').replace(/\D/g, '')
}

const filteredRows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const qd = digitsOf(q)
  const lv = levelFilter.value
  return rows.value.filter(({ space }) => {
    if (lv !== 'all' && space.level !== lv) return false
    if (!q) return true
    // 名称子串匹配；编号输入支持 1000000 / SCL-1000000 / SCL- 三种写法
    const nameHit = (space.name || '').toLowerCase().includes(q)
    const codeHit = qd ? digitsOf(space.code).includes(qd) : anomalyFullCode(space).toLowerCase().includes(q)
    return nameHit || codeHit
  })
})

const isFiltering = computed(() => query.value.trim() !== '' || levelFilter.value !== 'all')

const countText = computed(() =>
  isFiltering.value ? `${filteredRows.value.length}/${rows.value.length} 空间` : `${rows.value.length} 空间`,
)

function resetFilters(): void {
  query.value = ''
  levelFilter.value = 'all'
}

function openReport(id: number): void {
  void router.push(`/armarium/spaces/${id}`)
}

// 编辑器走独立浏览器窗口（window.open）：不受通用容器限制；
// 不加 noopener——编辑器窗口需要 window.opener 回传"已保存"通知。
function openEditor(id: number): void {
  window.open(router.resolve(`/armarium/spaces/${id}/edit`).href, '_blank')
}

function createSpace(): void {
  window.open(router.resolve('/armarium/spaces/new/edit').href, '_blank')
}
</script>

<template>
  <section class="spaces" aria-labelledby="spaces-title">
    <div class="spaces__heading">
      <div>
        <span class="spaces__eyebrow latin">Spatium Supernaturale</span>
        <h2 id="spaces-title">超自然空间库</h2>
      </div>
      <div class="spaces__heading-side">
        <span class="spaces__count">{{ countText }}</span>
        <button type="button" class="spaces__create" @click="createSpace">＋ 新建超自然空间</button>
      </div>
    </div>

    <div v-if="rows.length" class="spaces__filters">
      <input
        v-model="query"
        type="search"
        class="spaces__input"
        placeholder="搜索名称或编号（如：前厅 / 1000000 / SCL-1000000）"
      />
      <select v-model="levelFilter" class="spaces__select" aria-label="按危险等级筛选">
        <option value="all">全部等级</option>
        <option value="safe">SAFE</option>
        <option value="euclid">Euclid</option>
        <option value="keter">Keter</option>
      </select>
      <button v-if="isFiltering" type="button" class="spaces__clear" @click="resetFilters">清空</button>
    </div>

    <p v-if="store.loading && !store.list.length" class="spaces__hint">读取空间档案中…</p>
    <div v-else-if="filteredRows.length" class="spaces__rail">
      <article v-for="row in filteredRows" :key="row.space.id" class="space-card">
        <button
          type="button"
          class="space-card__thumb"
          :class="{ 'space-card__thumb--empty': !row.thumb }"
          @click="openReport(row.space.id)"
        >
          <img
            v-if="row.thumb"
            :src="thumbFailed.has(row.space.id) ? row.thumb : thumbUrl(row.thumb)"
            :alt="row.space.name"
            width="160"
            height="140"
            loading="lazy"
            decoding="async"
            @error="onThumbError(row.space.id)"
          />
          <span v-else class="latin">IMG</span>
        </button>
        <div class="space-card__body">
          <div class="space-card__top">
            <span class="space-card__code latin">{{ anomalyFullCode(row.space) }}</span>
            <span
              class="space-card__level"
              :style="{ '--lv': levelColor(row.space.level) }"
            >{{ spaceLevelText(row.space.level, row.space.subLevel) }}</span>
          </div>
          <h3 class="space-card__name">{{ row.space.name || '未命名空间' }}</h3>
          <p v-if="row.summary" class="space-card__desc">{{ row.summary }}</p>
        </div>
        <div class="space-card__actions">
          <button type="button" class="space-card__btn" @click="openReport(row.space.id)">预览</button>
          <button type="button" class="space-card__btn space-card__btn--edit" @click="openEditor(row.space.id)">编辑</button>
        </div>
      </article>
    </div>
    <div v-else-if="rows.length" class="spaces__empty">
      <p>无匹配的超自然空间，换个关键词试试。</p>
      <button type="button" class="spaces__create" @click="resetFilters">清空筛选</button>
    </div>
    <div v-else class="spaces__empty">
      <p>暂无超自然空间档案。</p>
      <button type="button" class="spaces__create" @click="createSpace">＋ 新建第一份空间报告</button>
    </div>
  </section>
</template>

<style scoped>
.spaces {
  border-top: var(--bd-w) var(--bd-style) var(--bd-color);
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  padding-top: 22px;
}

.spaces__heading {
  align-items: end;
  display: flex;
  justify-content: space-between;
}

.spaces__eyebrow {
  color: var(--accent);
  display: block;
  font-size: 11px;
  letter-spacing: 0.16em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.spaces h2 {
  font-size: 22px;
  margin: 0;
}

.spaces__heading-side {
  align-items: center;
  display: flex;
  gap: 14px;
}

.spaces__count {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.spaces__create {
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

.spaces__create:hover {
  background: var(--accent);
  color: #1b1408;
}

.spaces__hint {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.spaces__filters {
  align-items: center;
  display: flex;
  gap: 10px;
}

.spaces__input {
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

.spaces__input::placeholder {
  color: var(--color-ink-faint);
}

.spaces__input:focus,
.spaces__select:focus {
  border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  outline: none;
}

.spaces__select {
  background: rgba(13, 10, 7, 0.6);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 8px 10px;
}

.spaces__select option {
  background: #1b1408;
  color: var(--color-ink);
}

.spaces__clear {
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

.spaces__clear:hover {
  color: var(--color-ink);
}

/* ---------- 方案A · 档案横条（与实体库同款版式）----------
 * 单列通栏、行间 1px 分割线、无盒子感；卡片高 164px 恒定（缩略图 140 + 上下 24）；
 * 缩略图 160×140 固定像素 + 恒居左侧 + cover 居中裁切，绝不随影像比例调整。 */
.spaces__rail {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.space-card {
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

.space-card:last-child {
  border-bottom: none;
}

.space-card:hover {
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

.space-card__thumb {
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

.space-card__thumb img {
  display: block;
  height: 100%;
  object-fit: cover;
  object-position: center;
  width: 100%;
}

.space-card__thumb--empty {
  align-items: center;
  color: var(--color-ink-faint);
  display: flex;
  justify-content: center;
}

.space-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.space-card__top {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.space-card__code {
  color: var(--color-ink-faint);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.space-card__level {
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--lv) 60%, transparent);
  border-radius: 999px;
  color: var(--lv);
  flex: none;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  padding: 1px 8px;
}

.space-card__name {
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.space-card__desc {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  color: var(--color-ink-dim);
  display: -webkit-box;
  font-size: 12px;
  line-height: 1.5;
  margin: 2px 0 0;
  overflow: hidden;
}

.space-card__actions {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 6px;
  width: 64px;
}

.space-card__btn {
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

.space-card__btn:hover {
  background: var(--accent);
  color: #1b1408;
}

.space-card__btn--edit {
  border-style: dashed;
}

.spaces__empty {
  border: var(--bd-w) dashed var(--bd-color);
  border-radius: calc(var(--radius) + 4px);
  color: var(--color-ink-dim);
  padding: 48px 24px;
  text-align: center;
}

@media (max-width: 640px) {
  /* 卡片转纵向堆叠，但缩略图保持 160×140 固定尺寸不拉伸 */
  .space-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    height: auto;
  }

  .space-card__thumb {
    height: 140px;
    width: 160px;
  }

  .space-card__actions {
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .space-card__btn {
    flex: 1;
  }
}
</style>
