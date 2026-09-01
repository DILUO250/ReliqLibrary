import { closeDb, getDb } from '../db/index.js'
import { migrate, TABLES } from '../db/schema.js'
import { seedData } from '../seed/data.js'

type Row = Record<string, unknown>

function insertMany(table: string, rows: Row[]): number {
  if (rows.length === 0) return 0
  const cols = Object.keys(rows[0]!)
  const placeholders = cols.map(() => '?').join(', ')
  const stmt = getDb().prepare(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
  )
  const tx = getDb().transaction(() => {
    for (const row of rows) stmt.run(...cols.map((c) => row[c]))
  })
  tx()
  return rows.length
}

function main(): void {
  const db = getDb()

  if (process.argv.includes('--reset')) {
    db.exec([...TABLES].reverse().map((t) => `DROP TABLE IF EXISTS ${t}`).join(';'))
    migrate(db)
    console.log('Database reset.')
  }

  const counts: Array<[string, number]> = []
  for (const [table, rows] of Object.entries(seedData)) {
    const n = insertMany(table, rows as Row[])
    if (n > 0) counts.push([table, n])
  }

  closeDb()

  if (counts.length > 0) {
    console.log(`Seeded: ${counts.map(([t, n]) => `${t}(${n})`).join(', ')}`)
  } else {
    console.log('Seed data is empty — nothing to insert.')
  }
}

main()
