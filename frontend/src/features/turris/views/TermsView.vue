<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTermsStore } from '@/features/turris/store/terms'
import { TAG_STYLES } from '@/features/turris/terms/tagStyles'
import { readableColor, formatToCss, mergedFormat } from '@/features/turris/terms/format'
import type { DictEntry } from '@/features/turris/store/terms'

const termsStore = useTermsStore()

// 仅展示可见分区（隐藏区如"基础数值"不出现）
const sections = computed(() => termsStore.visibleSections)

onMounted(() => {
  void termsStore.load()
})

function scrollTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function backToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function chipStyle(e: DictEntry, i: number): Record<string, string> {
  const f = e.tagFormats?.[i]
  const raw = f?.color ?? '#8a8a8a'
  const color = readableColor(raw)
  return { ...(f ? formatToCss(f) : {}), color, borderColor: color, background: color + '1f' }
}

function groupColor(title: string): string {
  return readableColor(TAG_STYLES[title]?.color ?? '#eee2cb')
}
</script>

<template>
  <div class="dict">
    <aside class="dict__toc">
      <div class="dict__toc-head">
        <span>目录</span>
        <button type="button" class="toc-top" title="回到顶部" @click="backToTop">置顶</button>
      </div>
      <nav class="dict__toc-nav">
        <p v-if="termsStore.loading && !sections.length" class="dict__desc">术语索引加载中…</p>
        <p v-else-if="termsStore.error" class="dict__desc">术语索引加载失败：{{ termsStore.error }}</p>

        <template v-for="sec in sections" :key="sec.id">
          <a class="toc-sec" @click.prevent="scrollTo(sec.id)">{{ sec.title }}</a>
          <div v-if="sec.title === '机制类状态'" class="toc-sec-sub">
            <a
              v-for="g in sec.groups"
              :key="g.id"
              class="toc-item"
              :style="{ color: groupColor(g.title) }"
              @click.prevent="scrollTo(g.id)"
            >
              {{ g.title }}
            </a>
          </div>
        </template>
      </nav>
    </aside>

    <main class="dict__content">
      <header class="dict__intro">
        <h1 class="dict__title">异常状态术语</h1>
        <p class="dict__desc">
          按《术语解析》分类整理的全部「异常状态」。词条以 名称 → 属性标签 → 效果 的结构展示，点击左侧目录可快速跳转。
        </p>
      </header>

      <template v-for="sec in sections" :key="sec.id">
        <section :id="sec.id" class="dsec">
          <h2 class="dsec__title">{{ sec.title }}</h2>

          <template v-for="g in sec.groups" :key="g.id">
            <div :id="g.id" class="dgroup">
              <h3
                v-if="g.title"
                class="dgroup__title"
                :style="{ color: groupColor(g.title) }"
              >
                {{ g.title }}
              </h3>
              <div class="dict-grid">
                <article v-for="e in g.entries" :key="e.name" class="entry">
                  <div class="entry__head">
                    <h4 class="entry__name" :style="formatToCss(mergedFormat(e))">{{ e.name }}</h4>
                    <div v-if="e.tags.length" class="entry__tags">
                      <span
                        v-for="(t, i) in e.tags"
                        :key="t"
                        class="tag-chip"
                        :style="chipStyle(e, i)"
                      >
                        {{ t }}
                      </span>
                    </div>
                  </div>
                  <p class="entry__desc">{{ e.desc }}</p>
                </article>
              </div>
            </div>
          </template>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* 暖色夜间（纸面偏暗、暖棕），融入全站暗色主题 */
.dict {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: linear-gradient(180deg, #2d2117, #271c14);
  color: #eee2cb;
  border: 1px solid rgba(233, 221, 198, 0.16);
  border-radius: 12px;
  padding: 32px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}
.dict__toc {
  position: sticky;
  top: calc(var(--header-h) + 16px);
  flex-shrink: 0;
  width: 240px;
  max-height: calc(100vh - var(--header-h) - 32px);
  overflow-y: auto;
  padding: 16px;
  border: 1px solid rgba(233, 221, 198, 0.14);
  border-radius: 10px;
  background: #382b1d;
}
.dict__toc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  color: #e0b564;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
.toc-top {
  background: none;
  border: 1px solid rgba(233, 221, 198, 0.18);
  border-radius: 999px;
  color: #e2c88a;
  font-size: 12px;
  line-height: 1;
  padding: 4px 10px;
  cursor: pointer;
}
.toc-top:hover {
  border-color: #e0b564;
  color: #f2e7d2;
}
.dict__toc-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.toc-sec {
  font-size: 15px;
  color: #cbc2b0;
  cursor: pointer;
  padding: 5px 2px;
  border-bottom: 1px solid rgba(233, 221, 198, 0.12);
}
.toc-sec:hover {
  color: #e0b564;
}
.toc-sec-sub {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px 8px;
  padding: 8px 2px 8px 10px;
}
.toc-item {
  font-size: 13px;
  color: #b6a687;
  cursor: pointer;
  white-space: nowrap;
}
.toc-item:hover {
  text-decoration: underline;
}
.dict__content {
  flex: 1;
  min-width: 0;
}
.dict__intro {
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(233, 221, 198, 0.16);
}
.dict__title {
  margin: 0 0 8px;
  font-size: 26px;
  color: #f2e7d2;
}
.dict__desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.9;
  color: #b6a687;
}
.dsec {
  margin-bottom: 44px;
  scroll-margin-top: 14px;
}
.dsec__title {
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 800;
  color: #e0b564;
  border-left: 4px solid #e0b564;
  padding-left: 12px;
  scroll-margin-top: 14px;
}
.dgroup {
  scroll-margin-top: 14px;
}
.dgroup + .dgroup {
  margin-top: 26px;
}
.dgroup__title {
  margin: 0 0 12px;
  font-size: 19px;
  font-weight: 800;
}
.dict-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
.entry {
  border: 1px solid rgba(233, 221, 198, 0.14);
  border-radius: 8px;
  background: #3c2e1e;
  padding: 14px 16px;
}
.entry__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.entry__name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
}
.entry__tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.tag-chip {
  font-size: 13px;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid rgba(233, 221, 198, 0.16);
  color: #c6baa2;
  white-space: nowrap;
}
.entry__desc {
  margin: 0;
  font-size: 15px;
  line-height: 2;
  color: #c4b493;
  white-space: pre-line;
}
@media (max-width: 900px) {
  .dict {
    flex-direction: column;
    padding: 20px;
  }
  .dict__toc {
    position: static;
    width: 100%;
    max-height: none;
  }
  .dict-grid {
    grid-template-columns: 1fr;
  }
}
</style>
