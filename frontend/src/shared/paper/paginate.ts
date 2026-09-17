/**
 * 通用分页引擎（shared/paper，前端内跨模块复用，CONVENTIONS §5.1）。
 *
 * 行级原子行 → 固定尺寸纸面页切片：
 * - 行 ReportRow 是纯数据（不含 DOM），行构造器由各模块自己实现（内容格式是模块私有的）；
 * - 本引擎只负责"测量 + 装箱"：离屏度量容器复刻目标纸面盒模型，逐行真实渲染测高，
 *   每行测两遍——屏幕轨与打印轨（经 `${paperClass}--print-metrics` 镜像类复现），
 *   取 max 装箱，同一分页边界对两种媒体都成立；
 * - 相邻行 junction = max(前行 post, 后行 pre)，与 CSS 外边距折叠一致；
 * - keepWithNext 行断页时与其后行捆绑，断页边界回溯整条 keepWithNext 链；
 * - 图片先以游离 Image 预载（绕开 visibility:hidden 容器内 decode() 不决的浏览器怪癖）。
 *
 * ⚠️ 本引擎依赖 DOM 测量，只能跑在浏览器里；服务端出 PDF 走"无头浏览器加载纸面页面
 * → printToPDF"路线（见计划 paper-engine-promote-shared.md §导出请求路径），后端零重复实现。
 */

export type ReportRowKind = string

export interface ReportRow {
  kind: ReportRowKind
  /** 行内容 HTML（不含包裹层；由各模块的 compose 函数负责页内重组）。 */
  html: string
  /** 不得孤立在页尾：放不下时与后一行一起移到下页。 */
  keepWithNext: boolean
  /** 片段组 id：同组行跨页时由模块的 compose 在页内重组容器（如引用框）。 */
  group: string | null
  /** 本行之前已生效的警告线数量（受限区延伸语义由模块定义）。 */
  restrictedDepth: number
  /** 受限片段的参数列表（外层→内层），depth>0 的行由模块 compose 按需使用。 */
  restrictedSls: number[]
  /** 仅 figure 行：图片 URL（分页引擎预载用，游离 Image 预载避开 hidden 容器怪癖）。 */
  imgUrl?: string
  /** 仅警告线行：本行权限等级等模块参数。 */
  sl?: number
}

export interface PaperGeometry {
  /** 页宽（cm），如 21 */
  pageWidthCm: number
  /** 页高（cm），如 29.7 */
  pageHeightCm: number
  /** 纸面单侧垂直内边距（cm），与目标纸面 CSS 的 padding-top/bottom 一致 */
  padVCm: number
}

export interface ReportPage {
  /** 行切片 [start, end) */
  start: number
  end: number
  /** 单行超容量：该页允许增高（min-height 兜底） */
  loose: boolean
}

/** 装箱安全余量（pt）：防亚像素舍入把 descender 裁掉 */
const DEFAULT_SAFETY_PT = 2

export function ptToPx(pt: number): number {
  return (pt * 96) / 72
}

function pxPerCm(): number {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;height:100cm'
  document.body.appendChild(probe)
  const px = probe.offsetHeight / 100
  probe.remove()
  return px
}

interface RowMetrics {
  pre: number
  content: number
  post: number
}

async function waitForImages(holder: HTMLElement): Promise<void> {
  const imgs = Array.from(holder.querySelectorAll('img'))
  if (!imgs.length) return
  await Promise.allSettled(
    imgs.map((img) => {
      // 已 complete：尺寸可读，直接量；否则 decode 与 3s 超时竞速（decode 在
      // visibility:hidden 容器内可能永不 settle，超时后按当前状态测量）
      if (img.complete) return Promise.resolve()
      const decode = img.decode?.().catch(() => undefined) ?? Promise.resolve()
      return Promise.race([decode, new Promise<void>((r) => setTimeout(r, 3000))])
    }),
  )
}

/** 游离 Image 预载 figure URL（detached 上下文 decode 正常，绕开 hidden 容器怪癖）。 */
async function preloadFigureUrls(urls: string[]): Promise<void> {
  if (!urls.length) return
  await Promise.allSettled(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          const done = (): void => resolve()
          img.onload = done
          img.onerror = done
          img.src = url
          setTimeout(done, 8000) // 预载兜底：超时后靠度量时的 complete 检查/降级
        }),
    ),
  )
}

async function measurePass(
  measurer: HTMLElement,
  holder: HTMLElement,
  rows: ReportRow[],
  printMetricsClass: string | null,
  options: PaginateOptions,
): Promise<RowMetrics[]> {
  if (printMetricsClass) measurer.classList.add(printMetricsClass)
  const result: RowMetrics[] = []
  for (const row of rows) {
    // 行按模块给出的度量挂载 HTML（item 行等需要容器语义，裸 <li> 会被解析器丢弃）
    holder.innerHTML = options.measureHtml ? options.measureHtml(row) : row.html
    await waitForImages(holder)
    const holderRect = holder.getBoundingClientRect()
    const first = holder.firstElementChild
    const last = holder.lastElementChild
    if (!first || !last) {
      result.push({ pre: 0, content: 0, post: 0 })
      continue
    }
    const firstRect = first.getBoundingClientRect()
    const lastRect = last.getBoundingClientRect()
    result.push({
      pre: Math.max(0, firstRect.top - holderRect.top),
      content: Math.max(0, lastRect.bottom - firstRect.top),
      post: Math.max(0, holderRect.bottom - lastRect.bottom),
    })
  }
  if (printMetricsClass) measurer.classList.remove(printMetricsClass)
  return result
}

/** 贪心装箱：顺序放置，keepWithNext 行与后行捆绑；断页边界回溯整条 keepWithNext 链。 */
function pack(rows: ReportRow[], metrics: RowMetrics[], capPx: number): ReportPage[] {
  const pages: ReportPage[] = []
  let start = 0
  let y = 0 // 已放置内容的下边缘（含末行 post 的外边距盒底）
  let prevPost = 0
  let loose = false

  const pushPage = (end: number, isLoose: boolean): void => {
    pages.push({ start, end, loose: isLoose })
    start = end
    y = 0
    prevPost = 0
    loose = false
  }

  for (let i = 0; i < rows.length; i++) {
    const m = metrics[i]
    const row = rows[i]
    if (!m || !row) continue
    const junction = Math.max(prevPost, m.pre)
    const tentative = y - prevPost + junction + m.content + m.post

    // keepWithNext 前瞻：标题/编号/警告行不能孤立页尾
    let tentativeNext = tentative
    const next = metrics[i + 1]
    if (row.keepWithNext && next) {
      const junction2 = Math.max(m.post, next.pre)
      tentativeNext = tentative - m.post + junction2 + next.content + next.post
    }

    if (i === start) {
      // 页首行：无条件放下；超容 → loose 页兜底
      if (tentative > capPx) {
        console.warn(`[paper] 单行超出页容量，该页将允许增高（kind=${row.kind}）`)
      }
      loose = tentative > capPx
      y = tentative
      prevPost = m.post
      continue
    }
    if (tentativeNext > capPx) {
      // 断页边界回溯：当前页尾部的 keepWithNext 链（警告行→章节标题…）随断页一起移到新页，
      // 避免"警告行孤立页尾、其内容却在下一页"的断链。
      let end = i
      while (end > start + 1 && rows[end - 1]?.keepWithNext) end--
      pushPage(end, false)
      // 从 end 起重新逐行放置
      i = end - 1
      continue
    }
    y = tentative
    prevPost = m.post
  }
  if (start < rows.length) pages.push({ start, end: rows.length, loose })
  return pages
}

export interface PaginateOptions {
  /** 目标纸面类名（measurer 会挂它以继承盒模型与字体栈） */
  paperClass: string
  geometry: PaperGeometry
  /** 装箱安全余量（pt），默认 2pt */
  safetyPt?: number
  /** 行附加开销（px）：跨页重组的组框（如引用框）按最坏情况逐行预留 */
  rowExtraPx?: (row: ReportRow) => number
  /** 行的度量挂载 HTML（缺省 = row.html 原样挂载）。
   *  item 行等有容器语义的行（裸 <li> 会被 HTML 解析器丢弃/退化）须由模块给出
   *  真实页内使用的容器包装（如 SCL 的 <ul class="r-list">），否则测高失真。 */
  measureHtml?: (row: ReportRow) => string
}

/**
 * 把原子行装箱成固定尺寸纸面页切片。
 * 内部等待 document.fonts.ready；figure 行先游离预载再测高。
 */
export async function paginateReportRows(
  rows: ReportRow[],
  options: PaginateOptions,
): Promise<ReportPage[]> {
  if (!rows.length) return []
  // SSR / 非浏览器环境兜底：全部塞进一页
  if (typeof document === 'undefined') {
    return [{ start: 0, end: rows.length, loose: true }]
  }
  await document.fonts.ready

  const measurerId = `paper-measurer-${options.paperClass}`
  let measurer = document.getElementById(measurerId)
  if (!measurer) {
    measurer = document.createElement('div')
    measurer.id = measurerId
    document.body.appendChild(measurer)
  }
  measurer.className = `${options.paperClass} paper-measure`
  const holder = document.createElement('div')
  holder.style.display = 'flow-root'
  measurer.appendChild(holder)

  try {
    // 先预载全部图片（游离 Image，绕开 hidden 容器内 decode() 不决的怪癖），
    // 否则度量循环里首个含图行的 decode 会永久挂起、整条分页链路卡死。
    const imageUrls = [...new Set(rows.map((r) => r.imgUrl).filter((u): u is string => !!u))]
    await preloadFigureUrls(imageUrls)

    const cmPx = pxPerCm()
    const safetyPx = ptToPx(options.safetyPt ?? DEFAULT_SAFETY_PT)
    const capPx = (options.geometry.pageHeightCm - options.geometry.padVCm * 2) * cmPx - safetyPx

    const printMetricsClass = `${options.paperClass}--print-metrics`
    const screen = await measurePass(measurer, holder, rows, null, options)
    const print = await measurePass(measurer, holder, rows, printMetricsClass, options)

    const combined: RowMetrics[] = rows.map((row, i) => {
      const s = screen[i] ?? { pre: 0, content: 0, post: 0 }
      const p = print[i] ?? { pre: 0, content: 0, post: 0 }
      const merged: RowMetrics = {
        pre: Math.max(s.pre, p.pre),
        content: Math.max(s.content, p.content),
        post: Math.max(s.post, p.post),
      }
      if (options.rowExtraPx) merged.content += options.rowExtraPx(row)
      return merged
    })

    return pack(rows, combined, capPx)
  } finally {
    holder.remove()
  }
}
