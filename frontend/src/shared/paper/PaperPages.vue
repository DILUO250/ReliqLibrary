<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { paginateReportRows, type PaperGeometry, type ReportRow } from './paginate'
import './paper-base.css'

/**
 * 通用多页纸面组件（shared/paper）：把原子行切成固定尺寸的多个纸面页。
 * 每页背景完整不拉伸；屏幕多页竖排（窄屏等比缩放）；打印每页天然一张。
 * 各模块传自己的 paperClass（纸面皮肤类）+ geometry（几何参数）+ compose（页内重组），
 * 详见计划 paper-engine-promote-shared.md。预览页与编辑器实时预览共用（同一分页边界 = 同一套 PDF）。
 */
const props = defineProps({
  /** 已由模块行构造器产出的原子行序列 */
  rows: { type: Array as PropType<ReportRow[]>, required: true },
  /** 目标纸面类名（如 'scl-paper'；measure/print-metrics 按同一 BEM 约定派生） */
  paperClass: { type: String, required: true },
  /** 纸面几何（须与 paperClass 的 CSS 保持一致） */
  geometry: { type: Object as PropType<PaperGeometry>, required: true },
  /** 装箱安全余量（pt），默认 2pt */
  safetyPt: { type: Number, default: 2 },
  /** 行附加开销（px）：跨页重组的组框按最坏情况预留（如 SCL 的 file-box 22pt） */
  rowExtraPx: { type: Function as PropType<(row: ReportRow) => number> },
  /** 页内重组函数（受限包裹/列表重组/组框；缺省 = 行 HTML 直接拼接） */
  compose: { type: Function as PropType<(rows: ReportRow[], start: number, end: number) => string> },
  /** 行的度量挂载 HTML（缺省 = row.html；item 等容器语义行由模块提供包装） */
  measureHtml: { type: Function as PropType<(row: ReportRow) => string> },
  /** 数据变化后的重排防抖（ms） */
  debounceMs: { type: Number, default: 150 },
  hint: { type: String, default: '' },
})

const emit = defineEmits<{ paginated: [pageCount: number] }>()

/** 每页的 HTML 片段；null = 首次排版中 */
const pageHtmls = ref<string[] | null>(null)
/** loose 页（单行超容量的兜底增高页） */
const looseFlags = ref<boolean[]>([])

const pageList = computed(() => pageHtmls.value ?? [])

function isLoose(i: number): boolean {
  return looseFlags.value[i] ?? false
}

let seq = 0
let timer: ReturnType<typeof setTimeout> | null = null

async function repaginate(): Promise<void> {
  const mySeq = ++seq
  const slices = await paginateReportRows(props.rows, {
    paperClass: props.paperClass,
    geometry: props.geometry,
    safetyPt: props.safetyPt ?? undefined,
    rowExtraPx: props.rowExtraPx,
    measureHtml: props.measureHtml,
  })
  if (mySeq !== seq) return // 过期结果丢弃（数据已再变）
  const rows = props.rows
  pageHtmls.value = slices.map((p) =>
    props.compose
      ? props.compose(rows, p.start, p.end)
      : rows.slice(p.start, p.end).map((r) => r.html).join(''),
  )
  looseFlags.value = slices.map((p) => p.loose)
  emit('paginated', slices.length)
}

function schedule(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void repaginate()
  }, props.debounceMs)
}

watch(
  () => props.rows,
  () => schedule(),
  { deep: true },
)

/* ---------- 窄屏等比缩放（PDF 阅读器式：页面保持固定版式整体缩小） ---------- */

const PAGE_W_PX = computed(() => (props.geometry.pageWidthCm * 96) / 2.54)
const wrapEl = ref<HTMLElement | null>(null)

function updateZoom(): void {
  const wrap = wrapEl.value
  if (!wrap) return
  // 用父容器可用宽计算（对 wrap 本身做 zoom 会影响其 clientWidth，形成反馈回路）
  const host = wrap.parentElement
  const avail = host?.clientWidth || window.innerWidth
  const scale = Math.min(1, avail / (PAGE_W_PX.value + 1))
  if (scale < 1) wrap.style.zoom = String(scale)
  else wrap.style.removeProperty('zoom')
}

let ro: ResizeObserver | null = null

onMounted(() => {
  void repaginate()
  const host = wrapEl.value?.parentElement
  if (host) {
    ro = new ResizeObserver(() => updateZoom())
    ro.observe(host)
  }
  updateZoom()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  timer = null
  ro?.disconnect()
  ro = null
})
</script>

<template>
  <div ref="wrapEl" class="paper-pages">
    <p v-if="!pageHtmls" class="paper-pages__hint">{{ hint ?? '内容排版中…' }}</p>
    <template v-else>
      <article
        v-for="(html, i) in pageList"
        :key="i"
        :class="[paperClass, 'paper-doc', { 'paper-loose': isLoose(i) }]"
        v-html="html"
      ></article>
    </template>
  </div>
</template>
