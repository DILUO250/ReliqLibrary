import {
  anomalyFullCode,
  anomalyLevelText,
  anomalyReportTitle,
  type Anomaly,
  type AnomalyReport,
  type AnomalyReportBlockKey,
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

/** 文件条目次标：a..z → aa, ab…（>26 条不越界出怪字符）。 */
function fileIndexLabel(i: number): string {
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
  let label = ''
  let n = i
  do {
    label = LETTERS[n % 26] + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return label
}

/* ---------- 行模型（分页渲染的原子单位） ----------
 * 类型来自 shared/paper（通用引擎）；此处只负责 SCL 报告单的内容格式：
 * 每行可独立测高、不可跨页拆分；页组装时把连续 item 行重组成 <ul class="r-list">，
 * quoted 文件行按 group 在页内重组 .file-box 边框，受限区按 restrictedDepth 包裹。 */

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

/** 警告线兜底锚定：锚区块未渲染时回退到最近的已渲染前驱块（安全分级不能丢）。 */
function resolveAnchors(
  renderedKeys: AnomalyReportBlockKey[],
  warnings: AnomalyReport['warnings'],
): Map<number, AnomalyReportBlockKey> {
  // 返回 Map<警告序号, 锚块 key>——警告行插到锚块首行之前
  const order: AnomalyReportBlockKey[] = [
    'head', 'desc', 'contain', 'output', 'appendix', 'files', 'figure-main', 'figures-rest', 'attachments',
  ]
  const anchorOf = (key: AnomalyReportBlockKey): AnomalyReportBlockKey => {
    if (renderedKeys.includes(key)) return key // 锚块已渲染：命中（原渲染器语义）
    const i = order.indexOf(key)
    for (let k = i - 1; k >= 0; k--) {
      const cand = order[k]
      if (cand && renderedKeys.includes(cand)) return cand
    }
    return renderedKeys[0] ?? 'head'
  }
  const result = new Map<number, AnomalyReportBlockKey>()
  warnings.forEach((w, i) => result.set(i, anchorOf(w.after)))
  return result
}

/**
 * 报告单 → 原子行序列（格式权威依据：草稿/1.2 §1–§6 Word 版式 + §9 屏幕增强）。
 * 行序即渲染序；警告线按现有 anchor 语义插入到锚块首行之前。
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

  // 各区块的行组（与既有渲染顺序一一对应；空区块不产出行）
  const blocks: Array<{ key: AnomalyReportBlockKey; rows: ReportRow[] }> = []
  blocks.push({ key: 'head', rows: [headRow] })

  const descRows: ReportRow[] = [sectionRow('描述：', 'DESCRIPTION')]
  descRows.push(
    ...(report.description.length
      ? report.description.map((t) => itemRow(`<li>${esc(t)}</li>`))
      : [itemRow(naItem())]),
  )
  blocks.push({ key: 'desc', rows: descRows })

  const containRows: ReportRow[] = [sectionRow('特殊收容措施：', 'SPECIAL CONTAINMENT')]
  containRows.push(
    ...(report.containment.length
      ? report.containment.map((t) => itemRow(`<li>${esc(t)}</li>`))
      : [itemRow(naItem())]),
  )
  blocks.push({ key: 'contain', rows: containRows })

  const o = report.output
  const pageStr = o.pages.length
    ? o.pages
        .map((x) => (x && x !== 'N/A' ? `<i class="r-page-name">${esc(x)}</i>` : na))
        .join(' / ')
    : na
  const outputRows: ReportRow[] = [
    sectionRow('产出：', 'OUTPUT', 'r-h--out'),
    itemRow(
      `<li>1. 薰陆香产能效率：${esc(o.incenseGrade || 'N/A')} ${esc(o.incenseRate || 'X单位/太阳日')}</li>`,
    ),
    itemRow(`<li>2. 异常实体书页：${pageStr}</li>`),
    itemRow(`<li>3. EGO卡牌：【<span class="r-ego-name">${esc(o.egoCard || 'N/A')}</span>】</li>`),
    itemRow(`<li>4. 分配地：${esc(o.floorLabel || 'N/A')}</li>`),
  ]
  blocks.push({ key: 'output', rows: outputRows })

  if (report.appendices.length) {
    const rows: ReportRow[] = []
    report.appendices.forEach((a, i) => {
      rows.push(entryRow('附录', String(i + 1), a.source, null))
      for (const t of a.body) rows.push(itemRow(`<li>${esc(t)}</li>`))
    })
    blocks.push({ key: 'appendix', rows })
  }

  if (report.files.length) {
    const rows: ReportRow[] = []
    report.files.forEach((f, i) => {
      rows.push(entryRow('文件', fileIndexLabel(i), f.source, null))
      for (const t of f.body) {
        const item = itemRow(`<li>${esc(t)}</li>`)
        rows.push({ ...item, group: f.quoted ? `file:${i}` : null })
      }
    })
    blocks.push({ key: 'files', rows })
  }

  if (report.figures.length) {
    const rows: ReportRow[] = [sectionRow('实体影像资料：', 'IMAGE')]
    rows.push(figureRow(report.figures[0] ?? { caption: '', url: '' }, 0))
    blocks.push({ key: 'figure-main', rows })
  }
  if (report.figures.length > 1) {
    const rows = report.figures.slice(1).map((f, i) => figureRow(f, i + 1))
    blocks.push({ key: 'figures-rest', rows })
  }

  if (report.attachments.length) {
    const rows: ReportRow[] = []
    report.attachments.forEach((a, i) => {
      rows.push(entryRow('附件', String(i + 1), '', null))
      for (const t of a.body) rows.push(itemRow(`<li>${esc(t)}</li>`))
    })
    blocks.push({ key: 'attachments', rows })
  }

  // 警告线插入（沿用现有 anchor 语义：after:X = 渲染在 X 区块之前）
  const renderedKeys = blocks.map((b) => b.key)
  const anchored = resolveAnchors(renderedKeys, report.warnings)

  const rows: ReportRow[] = []
  const warnInsertion = new Map<number, number[]>() // 行下标 → 警告序号列表
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi]
    if (!block) continue
    const startRow = rows.length
    for (const [warnIdx, anchorKey] of anchored) {
      const anchorIdx = renderedKeys.indexOf(anchorKey)
      if (anchorIdx === bi) {
        const list = warnInsertion.get(startRow) ?? []
        list.push(warnIdx)
        warnInsertion.set(startRow, list)
      }
    }
    rows.push(...block.rows)
  }

  // 按序补 restrictedDepth / restrictedSls
  let depth = 0
  const activeSls: number[] = []
  const out: ReportRow[] = []
  for (let i = 0; i < rows.length; i++) {
    for (const warnIdx of warnInsertion.get(i) ?? []) {
      const sl = report.warnings[warnIdx]?.sl ?? 1
      out.push({ ...warnRow(sl), restrictedDepth: depth, restrictedSls: [...activeSls] })
      depth++
      activeSls.push(sl)
    }
    const row = rows[i]
    if (!row) continue
    out.push({ ...row, restrictedDepth: depth, restrictedSls: [...activeSls] })
  }
  return out
}

/**
 * 把行切片组装为一页的 HTML（页内重组：受限包裹层、<ul> 列表、file-box 边框）。
 * 纯函数：同样输入永远输出同样 HTML。
 */
export function composePageHtml(rows: ReportRow[], start: number, end: number): string {
  let html = ''
  let opened = 0
  const openSls: number[] = []
  const openDiv = (sl: number): void => {
    html += `<div class="r-restricted"><span class="r-seal">以下内容需 ${esc(slLabel(sl))} 权限查阅</span>`
    opened++
    openSls.push(sl)
  }
  const closeDiv = (): void => {
    html += '</div>'
    opened--
    openSls.pop()
  }

  let items: string[] = []
  let itemGroup: string | null = null

  const flushItems = (): void => {
    if (!items.length) return
    const ul = `<ul class="r-list">${items.join('')}</ul>`
    html += itemGroup ? `<div class="file-box">${ul}</div>` : ul
    items = []
    itemGroup = null
  }

  for (let i = start; i < end; i++) {
    const row = rows[i]
    if (!row) continue
    // 收敛受限层到本行之前的深度
    while (opened > row.restrictedDepth) closeDiv()
    if (row.kind === 'warn') {
      flushItems()
      html += row.html
      openDiv(row.sl ?? 1)
      continue
    }
    while (opened < row.restrictedDepth) {
      const sl = row.restrictedSls[opened] ?? 1
      openDiv(sl)
    }
    if (row.kind === 'item') {
      if (itemGroup === null) itemGroup = row.group
      items.push(row.html)
      continue
    }
    flushItems()
    html += row.html
  }
  flushItems()
  html += '</div>'.repeat(opened)
  return html
}
