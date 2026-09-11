/**
 * 库 → 备份 导出（数据流唯一方向：SQLite → 备份产物，CONVENTIONS §4.3）。
 *
 * SQLite 是全项目唯一权威数据源，此前的手写种子是一份 Word 文档迁移时的
 * 一次性硬编码产物，早已随 §4.3 术语源合并退役。本模块产出两种备份形态：
 *   1. 全表 JSON 快照 `backend/data/db-snapshot.json`——所有 TABLES 实时镜像
 *     （写操作后由 backupScheduler 防抖触发，原子写盘），本地实时备份；
 *   2. 术语生成种子 `frontend/src/features/turris/terms/data/termSeed.generated.ts`
 *     ——库内术语表的 git 提交级备份 + `import:terms` 恢复源，禁止手改。
 */
import { writeFileSync, renameSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import * as path from 'node:path'
import { DATA_DIR } from '../config/index.js'
import { TABLES } from './schema.js'
import { getDb } from './index.js'

export const SNAPSHOT_PATH = path.join(DATA_DIR, 'db-snapshot.json')
export const GENERATED_SEED_PATH = new URL(
  '../../../frontend/src/features/turris/terms/data/termSeed.generated.ts',
  import.meta.url,
)

export interface SnapshotResult {
  generatedAt: string
  version: number
  tables: number
  rows: number
}

interface TermSectionRow {
  id: number
  slug: string
  title: string
  visible: number | null
  sortOrder: number | null
}

interface TermEntryRow {
  id: number
  sectionId: number
  groupTitle: string | null
  name: string
  tags: string | null
  tagColors: string | null
  tagFormats: string | null
  format: string | null
  description: string | null
  sortOrder: number | null
  hasParam: number | null
}

/** 宽松解析 JSON 列：库内个别行可能有历史脏值，快照/种子生成绝不能因此中断。 */
function parseJsonColumn<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === '') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** 全表 JSON 快照：TABLES 全部表 → db-snapshot.json（临时文件 + rename 原子落盘）。 */
export function exportSnapshot(): SnapshotResult {
  const db = getDb()
  const tables: Record<string, unknown[]> = {}
  let rows = 0
  for (const table of TABLES) {
    const data = db.prepare(`SELECT * FROM ${table}`).all() as unknown[]
    tables[table] = data
    rows += data.length
  }
  const generatedAt = new Date().toISOString()
  const version = Date.now()
  mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${SNAPSHOT_PATH}.tmp`
  writeFileSync(tmp, JSON.stringify({ generatedAt, version, tables }, null, 2), 'utf8')
  renameSync(tmp, SNAPSHOT_PATH)
  regenerateTermSeed(db)
  return { generatedAt, version, tables: TABLES.length, rows }
}

/** 读取磁盘上最近一次快照的元信息（进程重启后恢复 status 用）。 */
export function readSnapshotMeta(): { generatedAt: string | null; version: number } {
  if (!existsSync(SNAPSHOT_PATH)) return { generatedAt: null, version: 0 }
  try {
    const meta = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as { generatedAt?: string; version?: number }
    return { generatedAt: meta.generatedAt ?? null, version: meta.version ?? 0 }
  } catch {
    return { generatedAt: null, version: 0 }
  }
}

/** 术语表 → termSeed.generated.ts（git 提交级备份，import:terms 的恢复源）。 */
function regenerateTermSeed(db: ReturnType<typeof getDb>): void {
  const sections = db.prepare('SELECT * FROM term_sections ORDER BY sortOrder, id').all() as TermSectionRow[]
  const entries = db.prepare('SELECT * FROM term_entries ORDER BY sortOrder, id').all() as TermEntryRow[]

  const bySection = new Map<number, TermEntryRow[]>()
  for (const e of entries) {
    const list = bySection.get(e.sectionId)
    if (list) list.push(e)
    else bySection.set(e.sectionId, [e])
  }

  const visible: DictSection[] = []
  const hidden: DictSection[] = []
  const hasParamTerms: Record<string, 1> = {}

  for (const sec of sections) {
    const groups: DictGroup[] = []
    const groupIndex = new Map<string, DictGroup>()
    for (const e of bySection.get(sec.id) ?? []) {
      const title = e.groupTitle ?? ''
      let group = groupIndex.get(title)
      if (!group) {
        group = { id: `g-${sec.slug}-${groups.length}`, title, entries: [] }
        groups.push(group)
        groupIndex.set(title, group)
      }
      group.entries.push({
        name: e.name,
        tags: parseJsonColumn<unknown[]>(e.tags, []),
        tagColors: parseJsonColumn<unknown[]>(e.tagColors, []),
        tagFormats: parseJsonColumn<unknown[]>(e.tagFormats, []),
        format: parseJsonColumn<Record<string, unknown>>(e.format, {}),
        desc: e.description ?? '',
      })
      if (e.hasParam === 1) hasParamTerms[e.name] = 1
    }
    const shape: DictSection = { id: sec.slug, title: sec.title, groups }
    ;(sec.visible === 0 ? hidden : visible).push(shape)
  }

  const header =
    `// ⚠️ 自动生成文件，禁止手动编辑——任何手改都会被下一次备份覆盖。\n` +
    `// 数据唯一权威源是 SQLite（CONVENTIONS §4.3）；本文件由 backend/src/db/seedExport.ts\n` +
    `// 从库内 term_sections / term_entries 重生成，是库的 git 提交级备份 + import:terms 恢复源。\n`
  const body =
    `export const generatedVisibleSections = ${JSON.stringify(visible, null, 2)}\n\n` +
    `export const generatedHiddenSections = ${JSON.stringify(hidden, null, 2)}\n\n` +
    `export const generatedHasParamTerms = ${JSON.stringify(hasParamTerms, null, 2)}\n`
  writeFileSync(GENERATED_SEED_PATH, header + body, 'utf8')
}

interface DictSection {
  id: string
  title: string
  groups: DictGroup[]
}

interface DictGroup {
  id: string
  title: string
  entries: DictEntry[]
}

interface DictEntry {
  name: string
  tags: unknown[]
  tagColors: unknown[]
  tagFormats: unknown[]
  format: Record<string, unknown>
  desc: string
}
