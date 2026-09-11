// CLI：手动执行一次全表快照 + 术语生成种子重写（后台自动化由 db/backupScheduler.ts 负责）。
import { closeDb } from '../db/index.js'
import { exportSnapshot } from '../db/seedExport.js'

const r = exportSnapshot()
closeDb()
console.log(`快照完成：${r.tables} 表 ${r.rows} 行，version ${r.version}，generatedAt ${r.generatedAt}`)
console.log('  全表快照 → backend/data/db-snapshot.json')
console.log('  术语种子 → frontend/src/features/turris/terms/data/termSeed.generated.ts')
