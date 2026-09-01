import { closeDb, getDb } from '../db/index.js'
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ART_DIR, DATA_DIR } from '../config/index.js'

const ART_PREFIX = '/art/'

// 各表可能存放 /art/ 图片 URL 的列（与 routes/index.ts 中 IMAGE_COLUMNS 对齐）。
const IMAGE_COLUMNS: Record<string, string[]> = {
  floors: ['artwork'],
  librarians: ['portrait', 'portraitPreview'],
}

function isImageFile(name: string): boolean {
  return /\.(?:png|jpe?g|webp|gif|avif)$/i.test(name)
}

function collectReferencedUrls(): Map<string, Array<{ table: string; id: number | string }>> {
  const db = getDb()
  const map = new Map<string, Array<{ table: string; id: number | string }>>()
  for (const [table, cols] of Object.entries(IMAGE_COLUMNS)) {
    const rows = db.prepare(`SELECT id, ${cols.join(', ')} FROM ${table}`).all() as Array<
      Record<string, unknown>
    >
    for (const row of rows) {
      for (const col of cols) {
        const url = row[col]
        if (typeof url === 'string' && url.startsWith(ART_PREFIX)) {
          const rel = url.slice(ART_PREFIX.length).replace(/\\/g, '/')
          const arr = map.get(rel) ?? []
          arr.push({ table, id: row.id as number | string })
          map.set(rel, arr)
        }
      }
    }
  }
  return map
}

function collectDiskFiles(dir: string, base = dir): Array<{ rel: string; size: number; mtimeMs: number }> {
  const out: Array<{ rel: string; size: number; mtimeMs: number }> = []
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (name === '_trash') continue
    const abs = join(dir, name)
    const st = statSync(abs)
    if (st.isDirectory()) {
      out.push(...collectDiskFiles(abs, base))
    } else if (isImageFile(name)) {
      out.push({ rel: relative(base, abs).replace(/\\/g, '/'), size: st.size, mtimeMs: st.mtimeMs })
    }
  }
  return out
}

function fmtSize(n: number): string {
  if (n < 1024) return `${n}B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`
  return `${(n / 1024 / 1024).toFixed(2)}MB`
}

function main(): void {
  const referenced = collectReferencedUrls()
  const files = collectDiskFiles(ART_DIR)

  const orphans = files.filter((f) => !referenced.has(f.rel))
  const used = files.filter((f) => referenced.has(f.rel))

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outFile = join(DATA_DIR, `art-audit-${ts}.md`)

  const lines: string[] = []
  lines.push(`# 素材审计报告 · ${new Date().toLocaleString()}`)
  lines.push('')
  lines.push(`目录：\`${ART_DIR}\`（已跳过 \`_trash\` 回收站）`)
  lines.push(`被引用文件：${used.length}  ·  孤儿文件：${orphans.length}  ·  总计：${files.length}`)
  lines.push('')
  lines.push('## 被引用文件')
  lines.push('')
  lines.push('| 文件 | 引用者 |')
  lines.push('|---|---|')
  for (const f of used) {
    const refs = referenced.get(f.rel) ?? []
    lines.push(`| \`${f.rel}\` | ${refs.map((r) => `${r.table}#${r.id}`).join(', ')} |`)
  }
  lines.push('')
  lines.push('## 孤儿文件（未被任何数据行引用）')
  lines.push('')
  lines.push('> 本报告仅为只读清单，未移动或删除任何文件。请逐个核对后手动处置：保留 / 删除 / 移入 `_trash`。')
  lines.push('')
  lines.push('| 文件 | 大小 | 修改时间 |')
  lines.push('|---|---|---|')
  for (const f of orphans.sort((a, b) => b.mtimeMs - a.mtimeMs)) {
    lines.push(`| \`${f.rel}\` | ${fmtSize(f.size)} | ${new Date(f.mtimeMs).toLocaleString()} |`)
  }
  lines.push('')

  writeFileSync(outFile, lines.join('\n'), 'utf8')
  closeDb()

  console.log(`审计完成：被引用 ${used.length}，孤儿 ${orphans.length}`)
  console.log(`报告已写入：${outFile}`)
}

main()
