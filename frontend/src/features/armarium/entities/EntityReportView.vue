<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import ReportPaper from '@/features/armarium/entities/ReportPaper.vue'
import { usePrintPageStyle } from '@/shared/paper/printPageStyle'
import './paper.css'
import {
  anomalyExportFilename,
  parseAnomalyReport,
  type Anomaly,
} from '@rtl/shared'

usePrintPageStyle()

const route = useRoute()
const router = useRouter()

const entity = ref<Anomaly | null>(null)
const loading = ref(true)
const missing = ref(false)

async function load(): Promise<void> {
  loading.value = true
  missing.value = false
  try {
    entity.value = await api.get<Anomaly>('anomalies', String(route.params.id))
  } catch {
    missing.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
  window.addEventListener('message', onMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
})

// 编辑窗口（window.open）保存成功后会广播通知：本页重拉最新数据
function onMessage(event: MessageEvent): void {
  if (event.origin !== window.location.origin) return
  if (event.data === 'rtl:anomalies-updated') void load()
}

const parsedReport = computed(() =>
  entity.value ? parseAnomalyReport(entity.value.report) : null,
)

function goBack(): void {
  // 本页若是编辑窗口保存后转入的（window.open 的独立窗口）：返回 = 直接关窗回原列表
  if (window.opener && !window.opener.closed) {
    window.close()
    return
  }
  // 应用内进入（列表点预览）：back() 触发 popstate，savedPosition 自动恢复列表滚动位置；
  // 直接粘贴 URL 打开（无历史）则兜底 push。
  if (window.history.state?.back) void router.back()
  else void router.push('/armarium/entities')
}

function openEditor(): void {
  if (!entity.value) return
  // 编辑器走独立浏览器窗口（与列表卡片"编辑"按钮同一机制）
  window.open(router.resolve(`/armarium/entities/${entity.value.id}/edit`).href, '_blank')
}

function printReport(): void {
  const prevTitle = document.title
  if (entity.value) document.title = anomalyExportFilename(entity.value)
  // 只靠 afterprint 还原标题：同步还原在 print() 非阻塞的浏览器（Firefox）里会让
  // PDF 文件名失效——宁可在极少数不触发 afterprint 的环境里标题多停留一瞬。
  window.addEventListener('afterprint', () => {
    document.title = prevTitle
  }, { once: true })
  window.print()
}

/* ---------- 服务端 PDF 导出（双段式：①POST 生成 ②GET 原生下载） ---------- */

const exporting = ref(false)

async function exportPdf(): Promise<void> {
  if (!entity.value || exporting.value) return
  exporting.value = true
  // 空白下载页在用户手势的同步栈内先开（浏览器弹窗拦截只放行手势同步链），
  // POST 返回后再让它跳向 GET 文件地址触发原生下载。
  const w = window.open('', '_blank')
  try {
    const { fileUrl } = await api.exportAnomalyReport(entity.value.id)
    if (!w) {
      showToast('弹窗被浏览器拦截，请允许本站弹窗后重试')
      return
    }
    w.location.href = fileUrl
    // 下载发起后关闭空白中转页（浏览器可能拒绝脚本关窗，静默即可）
    setTimeout(() => {
      try {
        w.close()
      } catch {
        /* 关不掉就留着空白页，无碍 */
      }
    }, 2500)
  } catch (e) {
    w?.close()
    showToast(e instanceof Error ? `导出失败：${e.message}` : '导出失败', 4000)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="scl-report">
    <div class="scl-report__toolbar">
      <button type="button" class="scl-report__back" @click="goBack">← 返回异常实体库</button>
      <div class="scl-report__toolbar-side">
        <button
          v-if="entity"
          type="button"
          class="scl-report__print"
          :disabled="exporting"
          @click="exportPdf"
        >{{ exporting ? '生成 PDF 中…' : '导出 PDF' }}</button>
        <button v-if="entity" type="button" class="scl-report__print" @click="printReport">浏览器打印</button>
        <button
          v-if="entity"
          type="button"
          class="scl-report__edit"
          @click="openEditor()"
        >编辑</button>
      </div>
    </div>

    <p v-if="loading" class="scl-report__hint">读取报告单中…</p>
    <p v-else-if="missing" class="scl-report__hint">未找到该异常实体档案，可能已被删除。</p>
    <ReportPaper
      v-else-if="entity && parsedReport"
      :entity="entity"
      :report="parsedReport"
    />
  </div>
</template>
