import { closeDb, getDb } from '../db/index.js'
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ART_DIR, DATA_DIR } from '../config/index.js'
import { IMAGE_COLUMNS } from '../routes/index.js'

const ART_PREFIX = '/art/'
const PVZ_PROJECT_REL = 'armarium/projects/pvz'

// 审计专用引用列：值计入"被引用"，但**不**进 routes 的删除回收钩子。
// 用于"DB 里存了地址、但删除时不能回收"的共享资源——
// 家族图标一个最多被 22 株植物共用，回收会让删一株株连整族图标。
// 与 IMAGE_COLUMNS（routes/index.ts）严格区分：那边管回收，这边只管户口。
const REFERENCE_ONLY_COLUMNS: Record<string, string[]> = {
  pvz_plants: ['familyIcon'],
}

// PVZ 用户素材通道的"结构引用"：立绘/卡面/自定义背景每株植物至多一份，
// 文件名恒等于植物代号（地址由代号推算，不入库——消灭双写，见
// features/armarium/artRoutes.ts 的 registerPvzImageRoutes）。审计按此约定
// 对照库内 codename 反推引用者。
function structuralMatch(rel: string, codenames: Set<string>): boolean {
  if (!rel.startsWith(`${PVZ_PROJECT_REL}/`)) return false
  const rest = rel.slice(PVZ_PROJECT_REL.length + 1)
  const parts = rest.split('/')
  // 允许：plants/<code>.<ext>（用户立绘）、plants/full/<code>.*、plants/card/<code>.*
  // （云端卡图）、cards/<code>.*（卡面生成）、backgrounds/custom/<code>.*（自定义背景）
  let stem: string | null = null
  if (parts.length === 2 && parts[0] === 'plants') stem = parts[1]
  else if (parts.length === 3 && (parts[0] === 'plants' && (parts[1] === 'full' || parts[1] === 'card'))) stem = parts[2]
  else if (parts.length === 2 && parts[0] === 'cards') stem = parts[1]
  else if (parts.length === 3 && parts[0] === 'backgrounds' && parts[1] === 'custom') stem = parts[2]
  if (!stem) return false
  const code = stem.replace(/\.[^.]+$/, '').toLowerCase()
  return codenames.has(code)
}

// 代码常量引用的静态资源豁免清单（同 art/turris/systems 待遇，CONVENTIONS §4.5）。
// 每项必须写明引用位置与理由；只收窄到具体目录/文件名，禁止整树一豁了之。
const EXEMPT_RULES: Array<{ match: (rel: string) => boolean; reason: string }> = [
  {
    match: (rel) => rel.startsWith('turris/systems/'),
    reason: '战斗系统页机制说明表格图——由 shared/src/battleMechanics.ts 的 MECHANICS_IMAGES 代码引用（§4.5），不回收',
  },
  {
    match: (rel) => rel.startsWith(`${PVZ_PROJECT_REL}/backgrounds/`) && rel.split('/').length === 5,
    reason: '内置背景库——由 pvzwiki WORLD_BG_MAP 等代码常量引用，不回收',
  },
  {
    match: (rel) =>
      rel.startsWith(`${PVZ_PROJECT_REL}/plants/icon/`) &&
      ['All.webp', 'Damage2I.webp', 'Family2I.webp', 'Range2I.webp', 'Recharge2I.webp', 'Sun_Cost2I.webp', 'Toughness2I.webp'].includes(
        rel.split('/').pop() ?? '',
      ),
    reason: '详情页属性条目小图标——PlantDetailPage stats 代码常量引用（icon()），不回收',
  },
]

// 真孤儿的处置建议（只出建议，脚本绝不移动/删除文件——§3.2 人工处置）。
function suggestDisposition(rel: string): { action: string; reason: string } {
  if (rel.startsWith(`${PVZ_PROJECT_REL}/plants/card/`) || rel.startsWith(`${PVZ_PROJECT_REL}/cards/`)) {
    return { action: '建议入回收站', reason: '云端同步遗留的变体/未入库实体卡图，前端与数据库均无引用' }
  }
  if (rel.startsWith('turris/librarian-portraits/') || rel.startsWith('turris/librarian-previews/')) {
    return { action: '建议入回收站', reason: '司书立绘/缩略图替换遗留（回收站机制建立前的旧文件）' }
  }
  if (rel.startsWith('armarium/entities/')) {
    return { action: '人工核对', reason: '异常实体库 UI 未建（anomalies 表当前无行）；若为未来 UI 备用素材请保留' }
  }
  return { action: '人工核对', reason: '无自动识别规则' }
}

function isImageFile(name: string): boolean {
  return /\.(?:png|jpe?g|webp|gif|avif)$/i.test(name)
}

function collectReferencedUrls(): Map<string, Array<{ table: string; id: number | string; refOnly: boolean }>> {
  const db = getDb()
  const map = new Map<string, Array<{ table: string; id: number | string; refOnly: boolean }>>()
  const registries: Array<{ cols: Record<string, string[]>; refOnly: boolean }> = [
    { cols: IMAGE_COLUMNS, refOnly: false },
    { cols: REFERENCE_ONLY_COLUMNS, refOnly: true },
  ]
  for (const { cols, refOnly } of registries) {
    for (const [table, colList] of Object.entries(cols)) {
      const rows = db.prepare(`SELECT id, ${colList.join(', ')} FROM ${table}`).all() as Array<
        Record<string, unknown>
      >
      for (const row of rows) {
        for (const col of colList) {
          const url = row[col]
          if (typeof url === 'string' && url.startsWith(ART_PREFIX)) {
            const rel = url.slice(ART_PREFIX.length).replace(/\\/g, '/')
            const arr = map.get(rel) ?? []
            arr.push({ table, id: row.id as number | string, refOnly })
            map.set(rel, arr)
          }
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

interface Bucket {
  rel: string
  size: number
  mtimeMs: number
  refs?: Array<{ table: string; id: number | string; refOnly: boolean }>
  reason?: string
  suggestion?: { action: string; reason: string }
}

function main(): void {
  const referenced = collectReferencedUrls()
  const codenames = new Set(
    (getDb().prepare('SELECT codename FROM pvz_plants').all() as Array<{ codename: string }>).map(
      (r) => r.codename.toLowerCase(),
    ),
  )
  const files = collectDiskFiles(ART_DIR)

  const dbUsed: Bucket[] = []
  const structural: Bucket[] = []
  const exempt: Bucket[] = []
  const orphans: Bucket[] = []

  for (const f of files) {
    const refs = referenced.get(f.rel)
    if (refs) {
      dbUsed.push({ ...f, refs })
      continue
    }
    if (structuralMatch(f.rel, codenames)) {
      structural.push({ ...f, reason: '用户素材通道：地址由植物代号推算（文件名 = codename），不入库' })
      continue
    }
    const rule = EXEMPT_RULES.find((r) => r.match(f.rel))
    if (rule) {
      exempt.push({ ...f, reason: rule.reason })
      continue
    }
    orphans.push({ ...f, suggestion: suggestDisposition(f.rel) })
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outFile = join(DATA_DIR, `art-audit-${ts}.md`)

  const lines: string[] = []
  lines.push(`# 素材审计报告 · ${new Date().toLocaleString()}`)
  lines.push('')
  lines.push(`目录：\`${ART_DIR}\`（已跳过 \`_trash\` 回收站）`)
  lines.push('')
  lines.push(
    `总计 ${files.length} = DB 引用 ${dbUsed.length} + 结构引用 ${structural.length} + 豁免 ${exempt.length} + 真孤儿 ${orphans.length}`,
  )
  lines.push('')
  lines.push('> 分类语义：DB 引用 = 图片列登记表（含 familyIcon 这类只查户口不回收的列）；')
  lines.push('> 结构引用 = 用户素材通道按植物代号推算（地址有意不入库，防双写）；')
  lines.push('> 豁免 = 代码常量引用的静态资源（每项附理由）；真孤儿 = 无任何引用，人工处置。')
  lines.push('')

  const usedSection = (title: string, list: Bucket[], note?: string): void => {
    lines.push(`## ${title}（${list.length}）`)
    lines.push('')
    if (note) lines.push(`> ${note}`)
    lines.push('')
    lines.push('| 文件 | 引用者 |')
    lines.push('|---|---|')
    for (const f of list.sort((a, b) => a.rel.localeCompare(b.rel))) {
      const refs = f.refs ?? []
      lines.push(
        `| \`${f.rel}\` | ${refs
          .map((r) => `${r.table}#${r.id}${r.refOnly ? '（仅引用·不回收）' : ''}`)
          .join(', ')} |`,
      )
    }
    lines.push('')
  }

  usedSection('被引用文件（DB 图片列）', dbUsed)

  lines.push(`## 结构引用 · 按植物代号推算（${structural.length}）`)
  lines.push('')
  for (const f of structural.sort((a, b) => a.rel.localeCompare(b.rel))) {
    lines.push(`- \`${f.rel}\` — ${f.reason}`)
  }
  lines.push('')

  lines.push(`## 豁免文件 · 代码引用（${exempt.length}）`)
  lines.push('')
  for (const f of exempt.sort((a, b) => a.rel.localeCompare(b.rel))) {
    lines.push(`- \`${f.rel}\` — ${f.reason}`)
  }
  lines.push('')

  lines.push(`## 真孤儿 · 无任何引用（${orphans.length}）`)
  lines.push('')
  lines.push('> 本报告仅为只读清单，未移动或删除任何文件。按下表建议逐个人工处置（保留 / 移入 `_trash`）。')
  lines.push('')
  lines.push('| 文件 | 大小 | 修改时间 | 建议 | 理由 |')
  lines.push('|---|---|---|---|---|')
  for (const f of orphans.sort((a, b) => b.mtimeMs - a.mtimeMs)) {
    lines.push(
      `| \`${f.rel}\` | ${fmtSize(f.size)} | ${new Date(f.mtimeMs).toLocaleString()} | ${f.suggestion?.action ?? '人工核对'} | ${f.suggestion?.reason ?? ''} |`,
    )
  }
  lines.push('')

  writeFileSync(outFile, lines.join('\n'), 'utf8')
  closeDb()

  console.log(`审计完成：DB 引用 ${dbUsed.length} · 结构引用 ${structural.length} · 豁免 ${exempt.length} · 真孤儿 ${orphans.length}`)
  console.log(`报告已写入：${outFile}`)
}

main()
