// @ts-nocheck
// 术语导入脚本（非破坏性合并模式）：
// 把前端静态术语种子合并进 SQLite 的 term_sections / term_entries。
//
// ⚠️ 核心安全语义（2026-09 事故后重写，CONVENTIONS §2.3 / §4.3 硬性规范）：
//   1. 导入前自动把库内术语表全量 dump 到 backend/data/term-backup-<时间戳>.json；
//   2. **禁止 DELETE / 禁止覆盖已有数据**——词典页的运营修改（格式/描述/自增词条）永远以库为准；
//   3. 种子有、库没有 → INSERT；库有、种子没有 → 原样保留；两边都有 → 只补 hasParam 标记，不碰 format/desc/name；
//   4. 全量重灌必须显式 `--reset` 旗标 + 强制先自动备份（本次默认不提供 reset，宁可手写 SQL）。
//
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
  /** 是否带参数位（插入面板插入「“词条” X层」）；缺省时按名字后缀/HAS_PARAM_TERMS 按名补齐。 */
  hasParam?: boolean
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

/** 种子命名习惯：参数位词条的名字自带 " X层/点/次…" 后缀（如「易损 X层」）。 */
const PARAM_RE = /\s*X(层|点|次|颗|滴|回合|级|张|时|年|月|日)\s*$/

async function loadFrontendTerms(): Promise<{
  visible: DictSection[]
  hidden: DictSection[]
  overrides: Record<string, Partial<TermFormat>>
  hasParamIndex: Record<string, 1>
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
  const palette = (await dynImport('../../../frontend/src/features/turris/terms/data/paletteTerms.ts')) as {
    paletteSections: DictSection[]
    HAS_PARAM_TERMS: Record<string, 1>
  }
  return {
    visible: [...terms.termDictionary, special.specialDiceSection, ...palette.paletteSections],
    hidden: internal.internalTermSections,
    overrides: ov.ENTRY_OVERRIDES,
    hasParamIndex: palette.HAS_PARAM_TERMS,
  }
}

/** 词条是否带参数位：种子显式标记 > 名字自带 " X层" 后缀 > HAS_PARAM_TERMS 按名索引。 */
function resolveHasParam(entry: DictEntry, hasParamIndex: Record<string, 1>): boolean {
  return entry.hasParam ?? (PARAM_RE.test(entry.name) || hasParamIndex[entry.name.replace(PARAM_RE, '')] === 1)
}

/** 词条级合并：种子有库无 → 插入；两边都有 → 仅按需补 hasParam，绝不碰 format/desc。 */
function mergeSection(
  db: ReturnType<typeof getDb>,
  section: DictSection,
  visible: boolean,
  overrides: Record<string, Partial<TermFormat>>,
  hasParamIndex: Record<string, 1>,
  stats: { sectionsAdded: number; entriesAdded: number; hasParamUpdated: number },
): void {
  const existingSec = db
    .prepare('SELECT id FROM term_sections WHERE slug = ?')
    .get(section.id) as { id: number } | undefined

  let sectionId: number
  if (!existingSec) {
    const maxOrder = (db.prepare('SELECT COALESCE(MAX(sortOrder), -1) AS m FROM term_sections').get() as { m: number }).m
    const info = db
      .prepare('INSERT INTO term_sections (slug, title, visible, sortOrder) VALUES (?, ?, ?, ?)')
      .run(section.id, section.title, visible ? 1 : 0, maxOrder + 1)
    sectionId = info.lastInsertRowid as number
    stats.sectionsAdded++
  } else {
    sectionId = existingSec.id
  }

  const insertStmt = db.prepare(
    'INSERT INTO term_entries (sectionId, groupTitle, name, tags, tagColors, tagFormats, format, description, hasParam, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
  // 已有条目索引：**同分区内同名即视为已存在**（跨组不复制——渲染器按词条名建索引，
  // 重名会导致渲染互相覆盖；用户把词条挪组是运营决定，种子不得复制旧位置回来）。
  const dbEntries = db
    .prepare('SELECT id, name, groupTitle, hasParam FROM term_entries WHERE sectionId = ?')
    .all(sectionId) as Array<{ id: number; name: string; groupTitle: string; hasParam: number }>
  const entryIndex = new Map(dbEntries.map((e) => [e.name, e]))

  // 新词条接在分区末尾：取 MAX(sortOrder)+1 而非条数——reorder 端点会写任意 sortOrder，
  // 删行也会留洞，按条数排会撞号/插队到最前。
  const maxOrder = (
    db.prepare('SELECT COALESCE(MAX(sortOrder), -1) AS m FROM term_entries WHERE sectionId = ?').get(sectionId) as {
      m: number
    }
  ).m
  let entryOrder = maxOrder + 1
  for (const group of section.groups) {
    for (const entry of group.entries) {
      const existing = entryIndex.get(entry.name)
      if (!existing) {
        // 新词条：INSERT（overrides 仅在导入时合并为最终值，符合 §3.4）
        const merged = overrides[entry.name]
          ? { ...entry.format, ...overrides[entry.name] }
          : entry.format
        insertStmt.run(
          sectionId,
          group.title,
          entry.name,
          JSON.stringify(entry.tags ?? []),
          JSON.stringify(entry.tagColors ?? []),
          JSON.stringify(entry.tagFormats ?? []),
          JSON.stringify(merged),
          entry.desc ?? '',
          resolveHasParam(entry, hasParamIndex) ? 1 : 0,
          entryOrder++,
        )
        stats.entriesAdded++
      } else if (existing.hasParam === 0 && resolveHasParam(entry, hasParamIndex)) {
        // 已有词条：只补参数位标记，其余一律不动
        db.prepare('UPDATE term_entries SET hasParam = 1 WHERE id = ?').run(existing.id)
        stats.hasParamUpdated++
      }
    }
  }
}

/** 导入前自动备份：把术语表全量 dump 到 JSON（事故防线第一道）。 */
function backupTerms(db: ReturnType<typeof getDb>): string {
  const sections = db.prepare('SELECT * FROM term_sections ORDER BY sortOrder').all()
  const entries = db.prepare('SELECT * FROM term_entries ORDER BY id').all()
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  // 本脚本位于 backend/src/scripts/ → 库目录在 ../../data/
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'data')
  const file = path.join(dir, `term-backup-${stamp}.json`)
  fs.writeFileSync(file, JSON.stringify({ sections, entries }, null, 2), 'utf8')
  console.log(`已备份库内术语表 → ${file}（sections ${sections.length}，entries ${entries.length}）`)
  return file
}

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

async function main(): Promise<void> {
  const db = getDb()
  const { visible, hidden, overrides, hasParamIndex } = await loadFrontendTerms()

  // 事故防线 1：导入前自动备份
  const backupFile = backupTerms(db)

  const stats = { sectionsAdded: 0, entriesAdded: 0, hasParamUpdated: 0 }
  let formatDrift = 0
  let sectionsNow = 0
  let entriesNow = 0
  try {
    db.transaction(() => {
      for (const sec of visible) mergeSection(db, sec, true, overrides, hasParamIndex, stats)
      for (const sec of hidden) mergeSection(db, sec, false, overrides, hasParamIndex, stats)

      // 事故防线 2（必须在事务内做）：自检——备份中每一条已存在的词条，format/description
      // 必须与导入后完全一致。better-sqlite3 事务函数内 throw 会自动回滚整批写入，
      // 保证「自检失败」与「库被改动」不可能同时成立；放在事务外就只剩事后报警了。
      const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8')) as {
        entries: Array<{ id: number; format: string; description: string }>
      }
      for (const row of backup.entries) {
        const cur = db.prepare('SELECT format, description FROM term_entries WHERE id = ?').get(row.id) as
          | { format: string; description: string }
          | undefined
        if (!cur || cur.format !== row.format || cur.description !== row.description) formatDrift++
      }
      if (formatDrift > 0) {
        throw new Error(`自检失败：${formatDrift} 条已有词条的 format/description 发生漂移，导入事务已回滚`)
      }

      sectionsNow = (db.prepare('SELECT COUNT(*) AS n FROM term_sections').get() as { n: number }).n
      entriesNow = (db.prepare('SELECT COUNT(*) AS n FROM term_entries').get() as { n: number }).n
    })()
  } finally {
    closeDb()
  }

  console.log('术语合并完成（非破坏性）：')
  console.log(`  新增分区 ${stats.sectionsAdded} 个，新增词条 ${stats.entriesAdded} 条，补齐参数位 ${stats.hasParamUpdated} 条`)
  console.log(`  已有词条 format/description 变化：${formatDrift} 处`)
  console.log(`  当前库内：${sectionsNow} 个分区，${entriesNow} 条词条。`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
