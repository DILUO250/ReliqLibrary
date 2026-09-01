// @ts-nocheck
// 一次性导入脚本：把前端静态术语数据落库为 SQLite。
// 跨 workspace 动态引用前端 .ts 源文件，故关闭类型检查；
// 运行时由 tsx (esbuild) 执行，前端文件中的 `import type` 会被擦除，无需 @/ alias。
import { closeDb, getDb } from '../db/index.js'
import type { TermFormat } from '@rtl/shared'

interface DictEntry {
  name: string
  tags: string[]
  tagColors: string[]
  tagFormats: TermFormat[]
  format: TermFormat
  desc: string
}
interface DictGroup {
  id: string
  title: string
  entries: DictEntry[]
}
interface DictSection {
  id: string
  title: string
  groups: DictGroup[]
}

async function loadFrontendTerms(): Promise<{
  visible: DictSection[]
  hidden: DictSection[]
  overrides: Record<string, Partial<TermFormat>>
}> {
  // 用 new Function 构造 dynamic import，避免 tsc 跟随解析前端文件（其 @/ alias 不在 backend tsconfig）。
  const dynImport = new Function('p', 'return import(p)') as (p: string) => Promise<Record<string, unknown>>
  const terms = (await dynImport('../../../frontend/src/features/turris/terms/data/terms.ts')) as {
    termDictionary: DictSection[]
  }
  const special = (await dynImport('../../../frontend/src/features/turris/terms/data/specialDiceTerms.ts')) as {
    specialDiceSection: DictSection
  }
  const internal = (await dynImport('../../../frontend/src/features/turris/terms/data/internalTerms.ts')) as {
    internalTermSections: DictSection[]
  }
  const ov = (await dynImport('../../../frontend/src/features/turris/terms/data/termOverrides.ts')) as {
    ENTRY_OVERRIDES: Record<string, Partial<TermFormat>>
  }
  return {
    visible: [...terms.termDictionary, special.specialDiceSection],
    hidden: internal.internalTermSections,
    overrides: ov.ENTRY_OVERRIDES,
  }
}

function importSection(
  db: ReturnType<typeof getDb>,
  section: DictSection,
  visible: boolean,
  order: number,
  overrides: Record<string, Partial<TermFormat>>,
): { title: string; entries: number } {
  const info = db
    .prepare('INSERT INTO term_sections (slug, title, visible, sortOrder) VALUES (?, ?, ?, ?)')
    .run(section.id, section.title, visible ? 1 : 0, order)
  const sectionId = info.lastInsertRowid as number

  const stmt = db.prepare(
    'INSERT INTO term_entries (sectionId, groupTitle, name, tags, tagColors, tagFormats, format, description, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
  let entryCount = 0
  let entryOrder = 0
  for (const group of section.groups) {
    for (const entry of group.entries) {
      const merged = overrides[entry.name]
        ? { ...entry.format, ...overrides[entry.name] }
        : entry.format
      stmt.run(
        sectionId,
        group.title ?? '',
        entry.name,
        JSON.stringify(entry.tags ?? []),
        JSON.stringify(entry.tagColors ?? []),
        JSON.stringify(entry.tagFormats ?? []),
        JSON.stringify(merged),
        entry.desc ?? '',
        entryOrder++,
      )
      entryCount++
    }
  }
  return { title: section.title, entries: entryCount }
}

async function main(): Promise<void> {
  const db = getDb()
  const { visible, hidden, overrides } = await loadFrontendTerms()

  // 幂等：先清空旧数据再导入，避免重复运行堆积。
  db.exec('DELETE FROM term_entries')
  db.exec('DELETE FROM term_sections')

  const summary: Array<{ title: string; entries: number; visible: boolean }> = []
  let order = 0
  const tx = db.transaction(() => {
    for (const sec of visible) {
      summary.push({ ...importSection(db, sec, true, order++, overrides), visible: true })
    }
    for (const sec of hidden) {
      summary.push({ ...importSection(db, sec, false, order++, overrides), visible: false })
    }
  })
  tx()

  const totalEntries = summary.reduce((s, x) => s + x.entries, 0)
  closeDb()

  console.log('术语导入完成：')
  for (const s of summary) {
    console.log(`  [${s.visible ? '可见' : '隐藏'}] ${s.title} — ${s.entries} 条`)
  }
  console.log(`共 ${summary.length} 个分区，${totalEntries} 条词条。`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
