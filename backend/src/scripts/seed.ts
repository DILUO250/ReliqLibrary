// 数据库重建脚本（CONVENTIONS §2.3 数据流掉头后）：
//   seed:reset（--reset）= 事务内清空全部表 → 从 db-snapshot.json 无损恢复。
//   快照由 backupScheduler 随每次写操作自动更新，永远与库同步，
//   因此 reset 恢复的是"最后一次保存的状态"，不再是破坏性命令。
// 无 --reset 旗标直接运行 = 拒绝执行（防呆：旧版无旗标会往表里重复灌数据）。
import { existsSync, readFileSync } from 'node:fs'
import { closeDb, getDb } from '../db/index.js'
import { TABLES } from '../db/schema.js'
import { SNAPSHOT_PATH } from '../db/seedExport.js'

type Row = Record<string, unknown>

if (!process.argv.includes('--reset')) {
  console.error('拒绝执行：本脚本仅在 `npm run seed:reset`（--reset）下运行——清库并从 db-snapshot.json 无损恢复。')
  console.error('快照由写后自动备份实时维护；手动取一份新鲜快照请跑 `npm run export:snapshot`。')
  process.exit(2)
}

if (!existsSync(SNAPSHOT_PATH)) {
  console.error(`找不到快照文件：${SNAPSHOT_PATH}`)
  console.error('请先跑 `npm run export:snapshot` 生成一份，再执行 seed:reset。')
  process.exit(1)
}

const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as {
  generatedAt?: string
  version?: number
  tables?: Record<string, Row[]>
}
const snapshotTables = snapshot.tables ?? {}

function insertMany(table: string, rows: Row[]): number {
  if (rows.length === 0) return 0
  // 逐行取列集合：快照行可能缺列（历史列），按各行自己的键插，避免 rows[0] 键不全导致整表错位
  const db = getDb()
  let n = 0
  for (const row of rows) {
    const cols = Object.keys(row)
    if (cols.length === 0) continue
    const placeholders = cols.map(() => '?').join(', ')
    db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`).run(...cols.map((c) => row[c]))
    n++
  }
  return n
}

function main(): void {
  const db = getDb()
  const counts: Array<[string, number]> = []

  const tx = db.transaction(() => {
    // 反序清空（子表先删，规避外键）；TRUNCATE 风格的 DELETE 保留表结构，无需 migrate
    for (const t of [...TABLES].reverse()) {
      db.prepare(`DELETE FROM ${t}`).run()
    }
    for (const table of TABLES) {
      const rows = snapshotTables[table]
      if (!rows) continue
      const n = insertMany(table, rows)
      if (n > 0) counts.push([table, n])
    }
  })
  tx()

  closeDb()

  console.log(`数据库已从快照恢复（snapshot version ${snapshot.version ?? '?'}，generatedAt ${snapshot.generatedAt ?? '?'}）：`)
  if (counts.length > 0) {
    for (const [t, n] of counts) console.log(`  ${t}: ${n} 行`)
  } else {
    console.log('  快照为空，库已清空。')
  }
}

main()
