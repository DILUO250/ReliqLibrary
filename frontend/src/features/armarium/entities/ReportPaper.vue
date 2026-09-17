<script setup lang="ts">
import { computed } from 'vue'
import type { Anomaly, AnomalyReport } from '@rtl/shared'
import { buildReportRows, composePageHtml } from './reportRender'
import PaperPages from '@/shared/paper/PaperPages.vue'
import type { ReportRow } from '@/shared/paper/paginate'

/**
 * SCL 报告单纸面（薄适配壳）：行构造与页内重组是 SCL 专属格式（reportRender.ts），
 * 分页机制全部来自 shared/paper（PaperPages）。几何与组框开销必须与 paper.css
 * 的 .scl-paper 保持一致（padding 2.54cm 上下、file-box 垂直开销 22pt）。
 */
const props = defineProps<{
  entity: Anomaly
  report: AnomalyReport
}>()

const emit = defineEmits<{ paginated: [pageCount: number] }>()

const rows = computed(() => buildReportRows(props.entity, props.report))

// quoted 文件的 body 行跨页时每页各自包一个完整 .file-box，按最坏情况预留边框开销
const rowExtraPx = (row: ReportRow): number =>
  row.group?.startsWith('file:') ? (22 * 96) / 72 : 0

// item 行真实渲染包在 <ul class="r-list"> 里（裸 <li> 无此容器语义），度量须同构
const measureHtml = (row: ReportRow): string =>
  row.kind === 'item' ? `<ul class="r-list">${row.html}</ul>` : row.html
</script>

<template>
  <PaperPages
    :rows="rows"
    paper-class="scl-paper"
    :geometry="{ pageWidthCm: 21, pageHeightCm: 29.7, padVCm: 2.54 }"
    :row-extra-px="rowExtraPx"
    :measure-html="measureHtml"
    :compose="composePageHtml"
    hint="报告排版中…"
    @paginated="emit('paginated', $event)"
  />
</template>
