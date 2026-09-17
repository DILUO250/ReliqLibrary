/**
 * 藏书阁异常实体报告单 · 服务端 PDF 导出（双段式接口，plans/paper-engine-promote-shared.md §导出请求路径）：
 *
 * ① POST /api/armarium/export/anomaly/:id（带 x-rtl-key）——同步阻塞：
 *    查库取实体 → 无头浏览器加载前端 /print 无 UI 打印路由 → 等分页完成信号 →
 *    printToPDF 落盘 export-cache/<UUID>.pdf → 返回 { id, filename }。
 * ② GET /api/armarium/export/anomaly/file/:uuid（GET 不设防）——
 *    UUID 随机不可枚举 = "持链接者得"的能力令牌；application/pdf + attachment 原生下载。
 *
 * 暂存语义：TTL 过期即清（内存注册表 + 磁盘 mtime 双保险，覆盖后端重启丢注册表的情形），
 * 防止出现第二个无人认领的 _trash/。
 */
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { getDb } from '../../db/index.js'
import { EXPORT_CACHE_DIR, EXPORT_TTL_MS, FRONTEND_URL } from '../../config/index.js'
import { anomalyExportFilename } from '@rtl/shared'
import { printUrlToPdf } from '../pdf/pdfPrinter.js'

interface CacheEntry {
  filename: string
  createdAt: number
}

// UUID → 元信息（仅进程内；文件本体在盘上，重启后由 mtime 兜底判定）
const registry = new Map<string, CacheEntry>()

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function cacheFile(uuid: string): string {
  return path.join(EXPORT_CACHE_DIR, `${uuid}.pdf`)
}

/** 过期清理：内存注册表 + 目录扫描（后者覆盖"后端重启后注册表丢失"的残留文件）。 */
async function sweepExpired(): Promise<void> {
  const now = Date.now()
  for (const [uuid, entry] of registry) {
    if (now - entry.createdAt > EXPORT_TTL_MS) {
      registry.delete(uuid)
      await fs.unlink(cacheFile(uuid)).catch(() => undefined)
    }
  }
  try {
    const names = await fs.readdir(EXPORT_CACHE_DIR)
    for (const name of names) {
      if (!name.endsWith('.pdf')) continue
      const full = path.join(EXPORT_CACHE_DIR, name)
      const stat = await fs.stat(full).catch(() => null)
      if (stat && now - stat.mtimeMs > EXPORT_TTL_MS) {
        await fs.unlink(full).catch(() => undefined)
      }
    }
  } catch {
    /* 目录不存在等：下次导出前 mkdir，无需处理 */
  }
}

/** 盘上是否仍有未过期文件（重启兜底：注册表丢失但 mtime 在 TTL 内照样可下载）。 */
async function fileAlive(uuid: string): Promise<boolean> {
  const stat = await fs.stat(cacheFile(uuid)).catch(() => null)
  if (!stat || !stat.isFile()) return false
  return Date.now() - stat.mtimeMs <= EXPORT_TTL_MS
}

export async function registerAnomalyExportRoutes(app: FastifyInstance): Promise<void> {
  // ① 触发导出（同步阻塞：生成约 3~5s，前端按钮期间显示"生成中"）
  app.post('/api/armarium/export/anomaly/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = req.params
    const row = getDb().prepare('SELECT code, name FROM anomalies WHERE id = ?').get(id) as
      | { code: string; name: string }
      | undefined
    if (!row) return reply.code(404).send({ error: '未找到该异常实体档案' })

    await fs.mkdir(EXPORT_CACHE_DIR, { recursive: true })
    await sweepExpired()

    const uuid = randomUUID()
    const printUrl = `${FRONTEND_URL}/print/armarium/anomaly/${encodeURIComponent(id)}`
    try {
      const { pageCount } = await printUrlToPdf(printUrl, cacheFile(uuid))
      req.log.info({ id, pageCount, printUrl }, 'anomaly report exported to pdf')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      req.log.error({ id, printUrl, err: msg }, 'anomaly pdf export failed')
      return reply.code(502).send({ error: `PDF 生成失败：${msg}` })
    }

    const filename = anomalyExportFilename(row)
    registry.set(uuid, { filename, createdAt: Date.now() })
    return reply.code(201).send({ id: uuid, filename })
  })

  // ② 取文件（GET 不设防约定；Content-Disposition 触发浏览器原生下载）
  app.get('/api/armarium/export/anomaly/file/:uuid', async (req: FastifyRequest<{ Params: { uuid: string } }>, reply) => {
    const { uuid } = req.params
    if (!UUID_RE.test(uuid)) return reply.code(400).send({ error: '无效的导出 id' })

    const entry = registry.get(uuid)
    const alive = await fileAlive(uuid)
    if (!alive) {
      // 未登记或已过期（过期文件已被清扫或 mtime 判死）
      return reply.code(410).send({ error: '导出文件不存在或已过期，请重新导出' })
    }

    const filename = `${entry?.filename ?? 'SCL报告单'}.pdf`
    reply.type('application/pdf')
    // 中文文件名：RFC 5987 filename* 编码 + ASCII 兜底
    reply.header(
      'Content-Disposition',
      `attachment; filename="SCL-report.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    )
    return reply.send(createReadStream(cacheFile(uuid)))
  })
}
