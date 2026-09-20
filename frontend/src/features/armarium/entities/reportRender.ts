import {
  anomalyFileIndexLabel,
  anomalyFullCode,
  anomalyLevelText,
  anomalyReportTitle,
  type Anomaly,
  type AnomalyReport,
  type AnomalyWarningAnchor,
} from '@rtl/shared'
import type { ReportRow } from '@/shared/paper/paginate'

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )
}

function slLabel(sl: number): string {
  // 与 shared 的 parseAnomalyReport 同一 clamp 规则（1~99），保证屏显与回读一致
  return `SL-${String(Math.min(99, Math.max(1, Math.trunc(Number(sl)) || 1))).padStart(2, '0')}`
}

/* ---------- 行模型（分页渲染的原子单位） ----------
 * 类型来自 shared/paper（通用引擎）；此处只负责 SCL 报告单的内容格式：
 * 每行可独立测高、不可跨页拆分；页组装时把连续 item 行重组成 <ul class="r-list">，
 * quoted 文件行按 group 在页内重组 .file-box 边框。
 * 受限区为区间覆盖制（shared 的 AnomalyWarningAnchor 注释）：警告行深度恒 0（区间边界），
 * 区内行深度恒 1、restrictedSls=[governing sl]，永不嵌套。 */

export type ReportRowKind =
  | 'head'
  | 'section'
  | 'item'
  | 'entry'
  | 'figure'
  | 'warn'

function naItem(): string {
  return `<li><span class="na">N/A</span></li>`
}

/**
 * 锚点的文档序 rank：条目区块各占一段连续 rank 段（区块级点占段首）。
 * 用于越界/缺失锚点的统一回退：沿已渲染插入点找文档序最近的前驱。
 * 注意 entry:figure 从 N=2 起（rank 段首对应图片2），与 figure-main 相邻。
 */
function anchorRank(anchor: AnomalyWarningAnchor): number {
  const entry = /^entry:(\w+):(\d+)$/.exec(anchor)
  if (!entry) {
    switch (anchor) {
      case 'block:head': return 0
      case 'block:desc': return 100
      case 'block:contain': return 200
      case 'block:output': return 300
      default: return 2000 // block:figure-main
    }
  }
  const n = Number(entry[2])
  switch (entry[1]) {
    case 'appendix': return 300 + n
    case 'files': return 1000 + n
    case 'figure': return 1999 + n // figure-main=2000，图片2=2001…
    case 'attachment': return 3000 + n
    default: return 9999
  }
}

/**
 * 报告单 → 原子行序列（格式权威依据：草稿/1.2 §1–§6 Word 版式 + §9 屏幕增强）。
 * 行序即渲染序；警告线按 anchor 渲染在插入点行之前（区间覆盖制：最新线 govern 其后区间）。
 */
export function buildReportRows(entity: Anomaly, report: AnomalyReport): ReportRow[] {
  const code = (entity.code || '').replace(/\D/g, '') || 'XXXX'
  const full = anomalyFullCode(entity)
  const na = '<span class="na">N/A</span>'

  const headRow: ReportRow = {
    kind: 'head',
    html:
      `<h2 class="r-title">${esc(anomalyReportTitle(entity))}</h2>` +
      '<div class="r-meta">' +
      `<p>项目编号：${esc(full)}</p>` +
      `<p>项目等级：<strong>${esc(anomalyLevelText(entity.level, entity.subLevel))}</strong></p>` +
      '</div>',
    keepWithNext: false,
    group: null,
    restrictedDepth: 0,
    restrictedSls: [],
  }

  const sectionRow = (label: string, anno: string, cls = ''): ReportRow => ({
    kind: 'section',
    html: `<h3 class="r-h${cls ? ` ${cls}` : ''}">${esc(label)}<span class="r-anno">${esc(anno)}</span></h3>`,
    keepWithNext: true,
    group: null,
    restrictedDepth: 0,
    restrictedSls: [],
  })

  const itemRow = (html: string): ReportRow => ({
    kind: 'item',
    html,
    keepWithNext: false,
    group: null,
    restrictedDepth: 0,
    restrictedSls: [],
  })

  const entryRow = (kindLabel: string, idxLabel: string, source: string, group: string | null): ReportRow => ({
    kind: 'entry',
    html:
      `<p class="r-entry"><strong>${esc(kindLabel)}#${esc(code)}-${esc(idxLabel)}</strong>` +
      (source ? `：<span class="app-source">&lt;${esc(source)}&gt;</span>` : '：') +
      '</p>',
    keepWithNext: true,
    group,
    restrictedDepth: 0,
    restrictedSls: [],
  })

  const figureRow = (fig: { caption: string; url: string }, index: number): ReportRow => ({
    kind: 'figure',
    html:
      `<figure class="r-fig"><img src="${esc(fig.url)}" alt="">` +
      `<figcaption>图片${index + 1}　${esc(fig.caption || 'N/A')}</figcaption></figure>`,
    keepWithNext: false,
    group: null,
    restrictedDepth: 0,
    restrictedSls: [],
    imgUrl: fig.url,
  })

  const warnRow = (sl: number): ReportRow => ({
    kind: 'warn',
    html: `<p class="r-warn">-[警告，进一步访问需${esc(slLabel(sl))}或更高等级的安全权限]-</p>`,
    keepWithNext: true,
    group: null,
    restrictedDepth: 0,
    restrictedSls: [],
    sl,
  })

  // 行序列 + 锚点 landmark 表（anchor → 插入点行号，警告线渲染在该行之前）。
  // 与 shared 的 anomalyWarningAnchors 同一文档序：anchor 列表 = 编辑器下拉 = 回退链。
  const rows: ReportRow[] = []
  const landmarks = new Map<AnomalyWarningAnchor, number>()
  const push = (row: ReportRow, anchor?: AnomalyWarningAnchor): void => {
    if (anchor) landmarks.set(anchor, rows.length)
    rows.push(row)
  }

  push(headRow, 'block:head')

  push(sectionRow('描述：', 'DESCRIPTION'), 'block:desc')
  for (const t of report.description.length
    ? report.description
    : ['']) {
    rows.push(itemRow(t ? `<li>${esc(t)}</li>` : naItem()))
  }

  push(sectionRow('特殊收容措施：', 'SPECIAL CONTAINMENT'), 'block:contain')
  for (const t of report.containment.length
    ? report.containment
    : ['']) {
    rows.push(itemRow(t ? `<li>${esc(t)}</li>` : naItem()))
  }

  const o = report.output
  const pageStr = o.pages.length
    ? o.pages
        .map((x) => (x && x !== 'N/A' ? `<i class="r-page-name">${esc(x)}</i>` : na))
        .join(' / ')
    : na
  push(sectionRow('产出：', 'OUTPUT', 'r-h--out'), 'block:output')
  rows.push(
    itemRow(
      `<li>1. 薰陆香产能效率：${esc(o.incenseGrade || 'N/A')} ${esc(o.incenseRate || 'X单位/太阳日')}</li>`,
    ),
    itemRow(`<li>2. 异常实体书页：${pageStr}</li>`),
    itemRow(`<li>3. EGO卡牌：【<span class="r-ego-name">${esc(o.egoCard || 'N/A')}</span>】</li>`),
    itemRow(`<li>4. 分配地：${esc(o.floorLabel || 'N/A')}</li>`),
  )

  report.appendices.forEach((a, i) => {
    rows.push(entryRow('附录', String(i + 1), a.source, null))
    landmarks.set(`entry:appendix:${i + 1}`, rows.length - 1)
    for (const t of a.body) rows.push(itemRow(`<li>${esc(t)}</li>`))
  })

  report.files.forEach((f, i) => {
    rows.push(entryRow('文件', anomalyFileIndexLabel(i), f.source, null))
    landmarks.set(`entry:files:${i + 1}`, rows.length - 1)
    for (const t of f.body) {
      const item = itemRow(`<li>${esc(t)}</li>`)
      rows.push({ ...item, group: f.quoted ? `file:${i}` : null })
    }
  })

  if (report.figures.length) {
    push(sectionRow('实体影像资料：', 'IMAGE'), 'block:figure-main')
    rows.push(figureRow(report.figures[0] ?? { caption: '', url: '' }, 0))
  }
  report.figures.slice(1).forEach((f, i) => {
    rows.push(figureRow(f, i + 1))
    landmarks.set(`entry:figure:${i + 2}`, rows.length - 1)
  })

  report.attachments.forEach((a, i) => {
    rows.push(entryRow('附件', String(i + 1), '', null))
    landmarks.set(`entry:attachment:${i + 1}`, rows.length - 1)
    for (const t of a.body) rows.push(itemRow(`<li>${esc(t)}</li>`))
  })

  /* ---------- 警告线解析与插入（区间覆盖制） ---------- */

  // 锚点 → 行号：精确命中；条目越界 / 区块为空 → 沿已渲染插入点找文档序最近前驱
  //（与 shared 的 anomalyWarningAnchors 同一顺序，"安全分级不能丢"）。
  const resolveRowIdx = (anchor: AnomalyWarningAnchor): number => {
    const exact = landmarks.get(anchor)
    if (exact !== undefined) return exact
    const target = anchorRank(anchor)
    let best: { rank: number; idx: number } | null = null
    for (const [a, idx] of landmarks) {
      const r = anchorRank(a)
      if (r <= target && (!best || r > best.rank)) best = { rank: r, idx }
    }
    return best?.idx ?? landmarks.get('block:head') ?? 0
  }

  // 按文档位置排序；同点双线按 sl 升序（两线都渲染，较高的最后生效——高级覆盖低级）
  const warnPlan = report.warnings
    .map((w, i) => ({ i, sl: w.sl, anchor: w.anchor, rowIdx: resolveRowIdx(w.anchor) }))
    .sort((a, b) => a.rowIdx - b.rowIdx || a.sl - b.sl || a.i - b.i)

  const warnAt = new Map<number, number[]>() // 行下标 → 警告 sl 列表
  for (const w of warnPlan) {
    const list = warnAt.get(w.rowIdx) ?? []
    list.push(w.sl)
    warnAt.set(w.rowIdx, list)
  }

  // 区间覆盖制记账：警告行自身在区外（深度 0，compose 会在此闭合前一个区），
  // 其后的行 governed sl = 最新警告线（嵌套深度恒 ≤1，印章永不叠压）。
  let activeSl: number | null = null
  const out: ReportRow[] = []
  for (let i = 0; i < rows.length; i++) {
    for (const sl of warnAt.get(i) ?? []) {
      out.push({ ...warnRow(sl), restrictedDepth: 0, restrictedSls: [] })
      activeSl = sl
    }
    const row = rows[i]
    if (!row) continue
    out.push({
      ...row,
      restrictedDepth: activeSl == null ? 0 : 1,
      restrictedSls: activeSl == null ? [] : [activeSl],
    })
  }
  return out
}

/**
 * 把行切片组装为一页的 HTML（页内重组：受限包裹层、<ul> 列表、file-box 边框）。
 * 纯函数：同样输入永远输出同样 HTML。
 *
 * 印章延迟渲染（区间覆盖制配套）：openDiv 只开区并记 pendingSeal，区内出现首个内容
 * emit 时才盖印（top 固定 2pt）；closeDiv 时仍未盖印 = 空区（同点双线之间的空档、
 * 报告末尾的警告线），印章随之丢弃——任何时刻最多一个开启的区，印章永不叠压。
 */
export function composePageHtml(rows: ReportRow[], start: number, end: number): string {
  let html = ''
  let opened = 0
  const openSls: number[] = []
  const pendingSeals: boolean[] = []
  const openDiv = (sl: number): void => {
    html += '<div class="r-restricted">'
    opened++
    openSls.push(sl)
    pendingSeals.push(true)
  }
  const closeDiv = (): void => {
    html += '</div>'
    opened--
    openSls.pop()
    pendingSeals.pop()
  }
  const emit = (s: string): void => {
    // 从外到内盖印：区开启后首个内容行之前盖章；跨页重开区同样在此盖印
    for (let k = 0; k < opened; k++) {
      if (pendingSeals[k]) {
        const sl = openSls[k] ?? 1
        html += `<span class="r-seal">以下内容需 ${esc(slLabel(sl))} 权限查阅</span>`
        pendingSeals[k] = false
      }
    }
    html += s
  }

  let items: string[] = []
  let itemGroup: string | null = null

  const flushItems = (): void => {
    if (!items.length) return
    const ul = `<ul class="r-list">${items.join('')}</ul>`
    emit(itemGroup ? `<div class="file-box">${ul}</div>` : ul)
    items = []
    itemGroup = null
  }

  for (let i = start; i < end; i++) {
    const row = rows[i]
    if (!row) continue
    // 受限区对账：先收敛到本行深度，再重开缺失的外层区。
    // warn 行同样要做（restrictedDepth=0 → 先闭合前一个区，警告线即区间边界）；
    // 页首落在 warn 行/受限行时，靠本对账重开跨页延续的区。
    while (opened > row.restrictedDepth) closeDiv()
    while (opened < row.restrictedDepth) {
      const sl = row.restrictedSls[opened] ?? 1
      openDiv(sl)
    }
    if (row.kind === 'warn') {
      flushItems()
      emit(row.html)
      openDiv(row.sl ?? 1)
      continue
    }
    if (row.kind === 'item') {
      // 组切换（相邻行属于不同组/组→无组）必须先闭合旧框，与分页引擎的
      // "片段 = 页内同组连续行段"开框计费语义严格同构
      if (itemGroup !== row.group) flushItems()
      if (itemGroup === null) itemGroup = row.group
      items.push(row.html)
      continue
    }
    flushItems()
    emit(row.html)
  }
  flushItems()
  html += '</div>'.repeat(opened)
  return html
}
