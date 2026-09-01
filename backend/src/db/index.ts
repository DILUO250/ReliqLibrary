import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { DB_PATH, DATA_DIR } from '../config/index.js'
import { migrate, TABLES } from './schema.js'
import type { TableName } from './schema.js'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db
  mkdirSync(DATA_DIR, { recursive: true })
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}

export function isSeeded(): boolean {
  const d = getDb()
  const row = d.prepare(`SELECT COUNT(*) AS c FROM ${TABLES[0]}`).get() as { c: number }
  return row.c > 0
}

export function countRows(table: TableName): number {
  const d = getDb()
  const row = d.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }
  return row.c
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
