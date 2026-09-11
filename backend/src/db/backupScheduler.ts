/**
 * 写后自动备份调度器：任何 /api/* 写操作成功后 scheduleBackup()，
 * 防抖 DEBOUNCE_MS 后在后台执行 exportSnapshot()（含术语生成种子重写）。
 * 失败静默重试（RETRY_MS 间隔）+ console 日志，绝不影响请求路径。
 * 状态经 GET /api/backup/status 暴露给前端做"数据已备份"提示。
 */
import { exportSnapshot, readSnapshotMeta } from './seedExport.js'
import type { SnapshotResult } from './seedExport.js'

const DEBOUNCE_MS = 2000
const RETRY_MS = 5000

let timer: NodeJS.Timeout | null = null
let running = false
let dirty = false
let lastBackupAt: string | null = readSnapshotMeta().generatedAt
let version = readSnapshotMeta().version

export function scheduleBackup(): void {
  dirty = true
  if (timer) return
  timer = setTimeout(fire, DEBOUNCE_MS)
}

function fire(): void {
  timer = null
  if (running) return
  running = true
  try {
    const result: SnapshotResult = exportSnapshot()
    lastBackupAt = result.generatedAt
    version = result.version
    dirty = false
    console.log(`[backup] 数据已备份 → db-snapshot.json（version ${result.version}，${result.tables} 表 ${result.rows} 行）`)
  } catch (e) {
    console.error('[backup] 数据备份失败，将在下次触发或重试后恢复：', e)
  } finally {
    running = false
  }
  if (dirty && !timer) {
    timer = setTimeout(fire, RETRY_MS)
  }
}

export function backupStatus(): { lastBackupAt: string | null; version: number; dirty: boolean } {
  return { lastBackupAt, version, dirty }
}
