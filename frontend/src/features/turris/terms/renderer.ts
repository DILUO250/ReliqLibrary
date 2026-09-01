import { useTermsStore, type DictEntry } from '@/features/turris/store/terms'
import { mergedFormat } from './format'
import type { TermFormat } from '@rtl/shared'

/** 司书私人词典词条：机制名 → 字体格式。渲染时优先于通用词典。 */
export interface PrivateTerm {
  name: string
  format: TermFormat
}

export type Seg =
  | { type: 'text'; text: string }
  | { type: 'term'; text: string; format: TermFormat }
  | { type: 'unknown'; text: string }

/** 归一词条名：去掉【】（）及数量/层数后缀，缩成可匹配的短键。 */
function baseKey(name: string): string {
  return name
    .trim()
    .replace(/【[^】]*】/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/^\d+(层|点|次|颗|滴|回合|级|张|时|年|月|日)?/, '')
    .replace(/\s*X(层|点|次|颗|滴|回合|级|张|时|年|月|日)\s*$/g, '')
    .replace(/[—_]/g, '')
    .replace(/\s+/g, '')
}

interface IndexedEntry {
  key: string
  entry: DictEntry
}

let INDEX: IndexedEntry[] = []

function rebuildIndex(): void {
  const store = useTermsStore()
  INDEX = []
  for (const sec of store.sections) {
    for (const g of sec.groups) {
      for (const e of g.entries) INDEX.push({ key: baseKey(e.name), entry: e })
    }
  }
}

/** 预热术语索引：从后端拉取 term_sections / term_entries 并建立查询索引。
 *  调用方（如 RenderedText.vue）必须在 onMounted 调用本函数。 */
export async function ensureTermIndex(): Promise<void> {
  const store = useTermsStore()
  await store.load()
  rebuildIndex()
}

/** 索引是否就绪。未就绪时 renderTermText 全部降级为未收录样式。 */
export function termIndexReady(): boolean {
  const store = useTermsStore()
  if (!store.loaded) return false
  if (INDEX.length === 0) rebuildIndex()
  return INDEX.length > 0
}

/** 解析某个被引号包裹的词条 → 字体格式。私人词典优先，随后通用词典。 */
function resolveFormat(q: string, privateTerms: PrivateTerm[]): TermFormat | undefined {
  for (const p of privateTerms) {
    if (p.name.trim() === q.trim() || baseKey(p.name) === baseKey(q)) return p.format
  }
  const g = INDEX.find((x) => x.key === baseKey(q))
  if (g) return mergedFormat(g.entry)
  return undefined
}

/**
 * 渲染文本：把「被引号包裹的词条」解析为格式化片段。
 * 命中 → 去掉引号并按格式渲染；未命中 → 保留引号并标记「未收录」。
 * 注意：依赖模块级 INDEX（非响应式），调用方必须配合 termIndexReady() 做双态渲染。
 */
export function renderTermText(text: string, privateTerms: PrivateTerm[] = []): Seg[] {
  const segs: Seg[] = []
  const re = /[\u201C"]([^"\u201C\u201D]*?)[\u201D"]/g
  let last = 0
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0
    if (idx > last) segs.push({ type: 'text', text: text.slice(last, idx) })
    const inner = m[1] ?? ''
    const format = resolveFormat(inner, privateTerms)
    if (format) {
      segs.push({ type: 'term', text: inner, format })
    } else {
      segs.push({ type: 'unknown', text: `“${inner}”` })
    }
    last = idx + m[0].length
  }
  if (last < text.length) segs.push({ type: 'text', text: text.slice(last) })
  return segs
}
