import {
  anomalyFullCode,
  anomalyLevelText,
  anomalyReportTitle,
  type Anomaly,
  type AnomalyReport,
} from '@rtl/shared'

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

function listItems(arr: string[]): string {
  return arr.map((t) => `<li>${esc(t)}</li>`).join('')
}

function entryLine(kindLabel: string, code: string, idxLabel: string, source: string): string {
  return (
    `<p class="r-entry"><strong>${kindLabel}#${esc(code)}-${idxLabel}</strong>` +
    (source ? `：<span class="app-source">&lt;${esc(source)}&gt;</span>` : '：') +
    '</p>'
  )
}

interface ReportBlock {
  key: string
  html: string
}

/**
 * 报告单纸面渲染（格式权威依据：草稿/1.2 §1–§6 Word 版式 + §9 屏幕增强）。
 * 纯函数：同样输入永远输出同样 HTML。
 */
export function renderReportHtml(entity: Anomaly, report: AnomalyReport): string {
  const code = (entity.code || '').replace(/\D/g, '') || 'XXXX'
  const full = anomalyFullCode(entity)
  const na = '<span class="na">N/A</span>'
  const blocks: ReportBlock[] = []

  blocks.push({
    key: 'head',
    html:
      `<h2 class="r-title">${esc(anomalyReportTitle(entity))}</h2>` +
      '<div class="r-meta">' +
      `<p>项目编号：${esc(full)}</p>` +
      `<p>项目等级：<strong>${esc(anomalyLevelText(entity.level, entity.subLevel))}</strong></p>` +
      '</div>',
  })
  blocks.push({
    key: 'desc',
    html:
      '<h3 class="r-h">描述：<span class="r-anno">DESCRIPTION</span></h3>' +
      `<ul class="r-list">${report.description.length ? listItems(report.description) : `<li>${na}</li>`}</ul>`,
  })
  blocks.push({
    key: 'contain',
    html:
      '<h3 class="r-h">特殊收容措施：<span class="r-anno">SPECIAL CONTAINMENT</span></h3>' +
      `<ul class="r-list">${report.containment.length ? listItems(report.containment) : `<li>${na}</li>`}</ul>`,
  })

  const o = report.output
  const pageStr = o.pages.length
    ? o.pages.map((x) => (x && x !== 'N/A' ? `<i class="r-page-name">${esc(x)}</i>` : na)).join(' / ')
    : na
  blocks.push({
    key: 'output',
    html:
      '<h3 class="r-h r-h--out">产出：<span class="r-anno">OUTPUT</span></h3>' +
      '<ul class="r-list">' +
      `<li>1. 薰陆香产能效率：${esc(o.incenseGrade || 'N/A')} ${esc(o.incenseRate || 'X单位/太阳日')}</li>` +
      `<li>2. 异常实体书页：${pageStr}</li>` +
      `<li>3. EGO卡牌：【<span class="r-ego-name">${esc(o.egoCard || 'N/A')}</span>】</li>` +
      `<li>4. 分配地：${esc(o.floorLabel || 'N/A')}</li>` +
      '</ul>',
  })

  if (report.appendices.length) {
    blocks.push({
      key: 'appendix',
      html: report.appendices
        .map(
          (a, i) =>
            entryLine('附录', code, String(i + 1), a.source) +
            `<ul class="r-list">${listItems(a.body)}</ul>`,
        )
        .join(''),
    })
  }

  if (report.files.length) {
    blocks.push({
      key: 'files',
      html: report.files
        .map((f, i) => {
          const inner = `<ul class="r-list">${listItems(f.body)}</ul>`
          return (
            entryLine('文件', code, fileIndexLabel(i), f.source) +
            (f.quoted ? `<div class="file-box">${inner}</div>` : inner)
          )
        })
        .join(''),
    })
  }

  const f0 = report.figures[0]
  if (f0) {
    blocks.push({
      key: 'figure-main',
      html:
        '<h3 class="r-h">实体影像资料：<span class="r-anno">IMAGE</span></h3>' +
        `<figure class="r-fig"><img src="${esc(f0.url)}" alt="" loading="lazy"><figcaption>图片1　${esc(f0.caption || 'N/A')}</figcaption></figure>`,
    })
  }
  if (report.figures.length > 1) {
    blocks.push({
      key: 'figures-rest',
      html: report.figures
        .slice(1)
        .map(
          (f, i) =>
            `<figure class="r-fig"><img src="${esc(f.url)}" alt="" loading="lazy"><figcaption>图片${i + 2}　${esc(f.caption || 'N/A')}</figcaption></figure>`,
        )
        .join(''),
    })
  }

  if (report.attachments.length) {
    blocks.push({
      key: 'attachments',
      html: report.attachments
        .map(
          (a, i) =>
            entryLine('附件', code, String(i + 1), '') +
            `<ul class="r-list">${listItems(a.body)}</ul>`,
        )
        .join(''),
    })
  }

  // 警告线兜底锚定：锚区块未渲染（无图片/无附录等）时，回退到"最近的已渲染前驱块"，
  // 一个都没有则回 head——保证警告线永不静默消失（安全分级不能丢）。
  const renderedKeys = blocks.map((b) => b.key)
  const anchorOf = (key: string): string => {
    if (renderedKeys.includes(key)) return key
    const order = ['head', 'desc', 'contain', 'output', 'appendix', 'files', 'figure-main', 'figures-rest', 'attachments']
    const i = order.indexOf(key)
    for (let k = i - 1; k >= 0; k--) {
      const cand = order[k]
      if (cand && renderedKeys.includes(cand)) return cand
    }
    return renderedKeys[0] ?? 'head'
  }

  const byKey = new Map<string, number[]>()
  for (const w of report.warnings) {
    const anchor = anchorOf(w.after)
    const arr = byKey.get(anchor) ?? []
    arr.push(w.sl)
    byKey.set(anchor, arr)
  }

  let out = ''
  let depth = 0
  for (const b of blocks) {
    const sls = byKey.get(b.key)
    if (sls) {
      for (const sl of sls) {
        out +=
          `<p class="r-warn">-[警告，进一步访问需${esc(slLabel(sl))}或更高等级的安全权限]-</p>` +
          `<div class="r-restricted"><span class="r-seal">以下内容需 ${esc(slLabel(sl))} 权限查阅</span>`
        depth++
      }
    }
    out += b.html
  }
  out += '</div>'.repeat(depth)
  return out
}
