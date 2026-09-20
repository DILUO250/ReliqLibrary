<script setup lang="ts">
import { computed } from 'vue'
import type { SpaceReport, SupernaturalSpace } from '@rtl/shared'
import { buildSpaceRows, composeSpacePageHtml } from './reportRender'
import PaperPages from '@/shared/paper/PaperPages.vue'
import type { ReportRow } from '@/shared/paper/paginate'

/**
 * SCL 空间报告单纸面（薄适配壳）：行构造与页内重组是空间报告单专属格式
 * （spaces/reportRender.ts），分页机制全部来自 shared/paper（PaperPages）。
 * 几何与组框开销必须与 spaces/paper.css 的 .spc-paper 保持一致
 * （padding 2.54cm 上下、file-box 垂直开销 22pt）。
 */
const props = defineProps<{
  space: SupernaturalSpace
  report: SpaceReport
}>()

const emit = defineEmits<{ paginated: [pageCount: number] }>()

const rows = computed(() => buildSpaceRows(props.space, props.report))

// quoted 文件的 body 行跨页时每页各自包一个完整 .file-box。开销按"每个片段一次"
// 计（引擎在页内首次遇到该组行时收取），值为盒的完整垂直开销：
// padding 10pt×2 + margin 0.2cm×2 + border 1pt×2 ≈ 44px（与 paper.css --box-* 一致）。
const FILE_BOX_OVERHEAD_PX = Math.round((10 * 2 * 96) / 72 + (0.2 * 2 * 96) / 2.54 + (1 * 2 * 96) / 72)
const groupExtraPx = (row: ReportRow): number =>
  row.group?.startsWith('file:') ? FILE_BOX_OVERHEAD_PX : 0

// item 行真实渲染包在 <ul class="r-list"> 里（裸 <li> 无此容器语义），度量须同构。
// 组行（引用框内）还须复刻 .file-box 的水平 padding（14pt×2）——否则孤立度量时文本
// 可用宽度偏宽、换行数偏少，真实渲染每多折一行就多 ~28px，累计成页尾溢出。
const FILE_BOX_PAD_X = '14pt'
const measureHtml = (row: ReportRow): string => {
  if (row.kind === 'item' && row.group?.startsWith('file:')) {
    return `<div class="file-box" style="margin:0;border:none;padding:0 ${FILE_BOX_PAD_X}"><ul class="r-list">${row.html}</ul></div>`
  }
  return row.kind === 'item' ? `<ul class="r-list">${row.html}</ul>` : row.html
}
</script>

<template>
  <PaperPages
    :rows="rows"
    paper-class="spc-paper"
    :geometry="{ pageWidthCm: 21, pageHeightCm: 29.7, padVCm: 2.54 }"
    :group-extra-px="groupExtraPx"
    :measure-html="measureHtml"
    :compose="composeSpacePageHtml"
    hint="报告排版中…"
    @paginated="emit('paginated', $event)"
  />
</template>
