<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import { useShelfStore } from '../store/shelf'
import type { ExternalProject } from '@rtl/shared'
import ProjectEditorModal from './ProjectEditorModal.vue'

/**
 * 域外书架（草稿 4.1）：木架 + 书脊 + 状态书签绳。
 * 状态机：闭馆（灰绳）→ 开馆中（金绳闪烁）→ 在馆（绿绳呼吸）。
 * 只有配置了 url 的项目参与探测；launch 后轮询间隔临时缩到 2 秒。
 * 书脊皮革色是实体材质色（与主题色板解耦）；绳色与纸面 UI 全走 token。
 */
type SpineStatus = 'off' | 'launching' | 'on'

const store = useShelfStore()

const statuses = reactive<Record<number, SpineStatus>>({})
const editorOpen = ref(false)
const editing = ref<ExternalProject | null>(null)

const PRESET_SPINES = ['#6b4432', '#3c4a58', '#4c3f5e', '#55603a', '#5e3f3f']

const books = computed(() =>
  store.list
    .filter((p) => p.enabled === 1)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
)

function spineColor(p: ExternalProject, index: number): string {
  return p.spineColor || PRESET_SPINES[index % PRESET_SPINES.length] || '#6b4432'
}

/* 书脊错落高度（照草稿：高 / 中 / 矮循环），让架子不像尺子裁过 */
function heightClass(index: number): string {
  return ['tall', '', 'short'][index % 3] ?? ''
}

function statusOf(p: ExternalProject): SpineStatus {
  return statuses[p.id] ?? 'off'
}

const STATUS_TEXT: Record<SpineStatus, string> = {
  off: '○ 闭馆',
  launching: '◌ 开馆中',
  on: '● 在馆',
}

function actionHint(p: ExternalProject): string {
  const s = statusOf(p)
  if (s === 'launching') return '已发出开馆请求，等待端口就绪…'
  if (s === 'on') return '点击书脊 → 入馆（新标签页打开）'
  if (p.launchPath) return '点击书脊 → 开馆（拉起启动脚本）'
  return '未配置启动脚本，无法开馆'
}

// ---- 在馆探测 ----
let pollTimer: ReturnType<typeof setInterval> | undefined

async function refreshStatuses(): Promise<void> {
  for (const p of books.value) {
    if (!p.url || statusOf(p) === 'launching') continue
    try {
      const res = await api.launcherStatus(p.id)
      if (res.running != null) statuses[p.id] = res.running ? 'on' : 'off'
    } catch {
      statuses[p.id] = 'off'
    }
  }
}

function startPolling(): void {
  if (pollTimer) return
  pollTimer = setInterval(() => {
    if (document.hidden) return
    void refreshStatuses()
  }, 15000)
}

onMounted(async () => {
  await store.load()
  await refreshStatuses()
  startPolling()
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

// ---- 开馆 / 入馆 ----
async function launch(p: ExternalProject): Promise<void> {
  statuses[p.id] = 'launching'
  try {
    await api.launcherLaunch(p.id)
    showToast(`已为「${p.name}」发出开馆请求`)
  } catch (e) {
    statuses[p.id] = 'off'
    showToast(e instanceof Error ? e.message : '开馆失败')
    return
  }
  // 开馆后 2 秒一轮快速探测，最多等 120 秒（有的项目首次启动要装依赖）。
  const started = Date.now()
  const fastPoll = setInterval(async () => {
    if (p.url) {
      try {
        const res = await api.launcherStatus(p.id)
        if (res.running === true) {
          statuses[p.id] = 'on'
          clearInterval(fastPoll)
          showToast(`「${p.name}」已在馆`)
          return
        }
      } catch {
        /* 探测失败继续等 */
      }
    }
    if (Date.now() - started > 120000) {
      clearInterval(fastPoll)
      statuses[p.id] = 'off'
      showToast(
        p.url ? `「${p.name}」迟迟未应答，先放回闭馆` : `「${p.name}」已发出开馆请求，无法确认在馆状态`,
      )
    }
  }, 2000)
}

function clickBook(p: ExternalProject): void {
  const s = statusOf(p)
  if (s === 'launching') return
  if (s === 'on' && p.url) {
    window.open(p.url, '_blank')
    return
  }
  if (p.launchPath) void launch(p)
}

function openEditor(p: ExternalProject | null): void {
  editing.value = p
  editorOpen.value = true
}

async function onSaved(): Promise<void> {
  await store.reload()
  await refreshStatuses()
}
</script>

<template>
  <div class="shelf">
    <div class="shelf-books">
      <div
        v-for="(p, i) in books"
        :key="p.id"
        class="book"
        :class="heightClass(i)"
        :style="{ background: `linear-gradient(90deg, rgba(0,0,0,0.28), rgba(255,255,255,0.07) 45%, rgba(0,0,0,0.32)), ${spineColor(p, i)}` }"
        @click="clickBook(p)"
      >
        <span class="ribbon" :class="statusOf(p)"></span>
        {{ p.name }}
        <div class="slip" :class="{ 'slip--on': statusOf(p) === 'on' }" @click.stop>
          <button class="slip__edit" @click="openEditor(p)">编辑</button>
          <div class="slip__name">{{ p.name }}</div>
          <div v-if="p.description" class="slip__desc">{{ p.description }}</div>
          <div class="slip__status">{{ STATUS_TEXT[statusOf(p)] }}</div>
          <div class="slip__action">{{ actionHint(p) }}</div>
        </div>
      </div>

      <div class="bookend"></div>
      <button class="add-slot" @click="openEditor(null)">＋ 收录新书</button>
    </div>
    <div class="shelf-board"></div>

    <ProjectEditorModal
      :open="editorOpen"
      :project="editing"
      :next-order="store.list.length"
      @close="editorOpen = false"
      @saved="onSaved"
    />
  </div>
</template>

<style scoped>
.shelf-books {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  flex-wrap: wrap;
  padding: 26px 8px 0;
}
.book {
  position: relative;
  writing-mode: vertical-rl;
  letter-spacing: 0.3em;
  font-size: 13px;
  /* 书脊皮革底是写死的材质色 → 文字跟底色走，固定暖白，不随主题墨色变（StsCard 原则） */
  color: rgba(238, 226, 203, 0.92);
  padding: 16px 0;
  width: 38px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 2px 6px 6px 2px;
  box-shadow: inset 2px 0 3px rgba(255, 255, 255, 0.08), inset -3px 0 5px rgba(0, 0, 0, 0.45);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: transform 0.18s, filter 0.18s;
}
.book:hover {
  transform: translateY(-6px);
  filter: brightness(1.15);
}
.book.tall {
  height: 168px;
}
.book.short {
  height: 132px;
}
/* 书脊烫金细线 */
.book::before,
.book::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
  opacity: 0.55;
}
.book::before {
  top: 7px;
}
.book::after {
  bottom: 7px;
}

/* 状态书签绳 */
.ribbon {
  position: absolute;
  top: -10px;
  right: 7px;
  width: 7px;
  height: 26px;
  border-radius: 0 0 3px 3px;
}
.ribbon.off {
  background: var(--color-ink-faint);
}
.ribbon.on {
  background: var(--collegium);
  animation: ribbon-glow 2.4s ease-in-out infinite;
}
.ribbon.launching {
  background: var(--color-gold);
  animation: ribbon-blink 1s step-end infinite;
}
@keyframes ribbon-glow {
  0%,
  100% {
    box-shadow: 0 0 4px var(--collegium);
  }
  50% {
    box-shadow: 0 0 10px var(--collegium);
  }
}
@keyframes ribbon-blink {
  50% {
    opacity: 0.25;
  }
}

/* 悬停纸条 */
.slip {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  width: 220px;
  writing-mode: horizontal-tb;
  background: var(--color-surface-2);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) * 0.9);
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--color-ink-dim);
  text-align: left;
  letter-spacing: 0.02em;
  text-shadow: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s, transform 0.18s;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.slip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border: 5px solid transparent;
  border-top-color: var(--bd-color);
}
.book:hover .slip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}
.slip__edit {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  font-family: var(--font-kai);
  font-size: 11px;
  color: var(--color-ink-faint);
  cursor: pointer;
}
.slip__edit:hover {
  color: var(--color-gold);
}
.slip__name {
  color: var(--color-ink);
  font-family: var(--font-kai);
  font-size: 13px;
  margin-bottom: 2px;
  padding-right: 34px;
}
.slip__desc {
  font-family: var(--font-kai);
}
.slip__status {
  color: var(--color-ink-faint);
}
.slip--on .slip__status {
  color: var(--collegium);
}
.slip__action {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--bd-color);
  color: var(--color-ink-faint);
  font-size: 11px;
  font-family: var(--font-kai);
}

/* 木架搁板（实体材质色） */
.shelf-board {
  height: 10px;
  background: linear-gradient(180deg, #3a2d1c, #241a0f 70%, #1a1209);
  border-radius: 0 0 3px 3px;
  border-top: 1px solid var(--bd-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}
.bookend {
  align-self: flex-end;
  height: 96px;
  width: 12px;
  margin: 0 4px 0 10px;
  background: linear-gradient(90deg, #55503f, #3b382c);
  border-radius: 2px;
  box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.5);
}
.add-slot {
  align-self: flex-end;
  margin: 0 0 8px 6px;
  background: none;
  border: none;
  font-family: var(--font-kai);
  font-size: 12px;
  color: var(--color-ink-faint);
  cursor: pointer;
  letter-spacing: 0.1em;
  padding: 0;
  transition: color 0.18s;
}
.add-slot:hover {
  color: var(--color-gold);
}
</style>
