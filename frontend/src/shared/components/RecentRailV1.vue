<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { recentPages } from '@/app/services/recentPages'
import type { RecentPage } from '@/app/services/recentPages'

/**
 * 最近足迹（旧版 V1，草稿 4.1 早期形态）：目录式点线行——条目名 + 点线 + 相对时间。
 * 数据来自 localStorage（app/services/recentPages.ts 记录）；
 * 足迹为空时回落到一组固定预设入口，右栏不留空。
 * 与新版 RecentRail.vue 并列保留，供界面版本开关切换。
 */
const router = useRouter()

const items = computed<RecentPage[]>(() => recentPages())

const FALLBACKS: Array<{ path: string; title: string }> = [
  { path: '/turris/dictionary', title: '词典' },
  { path: '/armarium/entities', title: '异常实体' },
  { path: '/collegium/explorers', title: '求索者' },
  { path: '/armarium/project/pvz/plants', title: 'PVZ 图鉴' },
]

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day === 1) return '昨天'
  if (day < 30) return `${day} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

function go(path: string): void {
  void router.push(path)
}
</script>

<template>
  <div class="rail">
    <template v-if="items.length > 0">
      <button v-for="item in items" :key="item.path" class="rail-row" @click="go(item.path)">
        <span class="rail-title">{{ item.title }}</span>
        <span class="rail-dots"></span>
        <span class="rail-time">{{ relativeTime(item.time) }}</span>
        <span class="rail-arrow">→</span>
      </button>
    </template>
    <template v-else>
      <p class="rail-empty">还没有翻过什么书页。</p>
      <button v-for="f in FALLBACKS" :key="f.path" class="rail-row" @click="go(f.path)">
        <span class="rail-title">{{ f.title }}</span>
        <span class="rail-dots"></span>
        <span class="rail-time">常去</span>
        <span class="rail-arrow">→</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rail-empty {
  margin: 0 0 6px;
  font-family: var(--font-kai);
  font-size: 12px;
  color: var(--color-ink-faint);
}
.rail-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  padding: 9px 2px;
  cursor: pointer;
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.1em;
  transition: color 0.15s;
}
.rail-title {
  color: var(--color-ink-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rail-row:hover .rail-title {
  color: var(--color-gold);
}
.rail-dots {
  flex: 1;
  min-width: 16px;
  border-bottom: 1px dotted var(--color-ink-faint);
  transform: translateY(-4px);
}
.rail-time {
  font-family: var(--font-kai);
  font-size: 11px;
  color: var(--color-ink-faint);
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.rail-arrow {
  color: var(--color-ink-faint);
  font-size: 12px;
}
</style>
