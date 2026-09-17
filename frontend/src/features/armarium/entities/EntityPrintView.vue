<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/app/services/api'
import ReportPaper from '@/features/armarium/entities/ReportPaper.vue'
import { usePrintPageStyle } from '@/shared/paper/printPageStyle'
import { parseAnomalyReport, type Anomaly } from '@rtl/shared'
import './paper.css'

/**
 * SCL 报告单无 UI 打印路由（/print/armarium/anomaly/:id）：
 * 服务端 PDF 导出的唯一渲染宿主（plans/paper-engine-promote-shared.md §导出请求路径）。
 * 与预览页共用同一套 ReportPaper（分页/几何/皮肤完全一致 = 所见即所得），
 * 后端无头浏览器加载本页 → 等 window.__PAPER_READY 信号 → printToPDF。
 * 手动在浏览器打开也可看到与预览页相同的纸面（本机调试用）。
 */

usePrintPageStyle()

const route = useRoute()

const entity = ref<Anomaly | null>(null)
const loading = ref(true)
const missing = ref(false)

onMounted(async () => {
  try {
    entity.value = await api.get<Anomaly>('anomalies', String(route.params.id))
  } catch {
    missing.value = true
  } finally {
    loading.value = false
  }
})

const parsedReport = computed(() =>
  entity.value ? parseAnomalyReport(entity.value.report) : null,
)

/** 分页完成 → 双 rAF 等首帧绘制 → 发"就绪"信号（附页数，后端日志用）。 */
function onPaginated(pageCount: number): void {
  const w = window as unknown as {
    __PAPER_READY?: boolean
    __PAPER_META?: { pageCount: number }
  }
  w.__PAPER_META = { pageCount }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      w.__PAPER_READY = true
    })
  })
}
</script>

<template>
  <div class="scl-print">
    <p v-if="loading" class="scl-report__hint">读取报告单中…</p>
    <p v-else-if="missing" class="scl-report__hint">未找到该异常实体档案，可能已被删除。</p>
    <ReportPaper
      v-else-if="entity && parsedReport"
      :entity="entity"
      :report="parsedReport"
      @paginated="onPaginated"
    />
  </div>
</template>

<style scoped>
/* 打印路由本体无任何工具栏/外壳（App.vue chromeless 已去 SiteNav），
   只兜住加载/缺档提示的排版；纸面完全交给 ReportPaper。 */
.scl-print {
  padding: 24px 0;
}
/* 打印轨必须零偏移：任何上下内边距都会把首张纸面顶出页界（每张溢出一页），
   并在尾部多出一页（24px×2 = 恰好 +2 页的实测来源）。 */
@media print {
  .scl-print {
    padding: 0;
  }
}
</style>
