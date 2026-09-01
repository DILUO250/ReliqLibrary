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
  // 归一化 WAL：把日志落盘回收（TRUNCATE），清掉上个进程强杀残留的 -wal/-shm 状态。
  // Windows 上残留的共享内存会让后续读取触发恢复，极端时导致原生崩溃（词典页打开即崩的教训）。
  try {
    db.pragma('wal_checkpoint(TRUNCATE)')
  } catch {
    // 被其它进程占用时静默跳过，不影响正常服务
  }
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
