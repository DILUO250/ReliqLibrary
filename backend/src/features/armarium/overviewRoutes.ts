/**
 * 藏书阁总览页 · 轻量计数端点（草稿 2.4 方案 D 落地）：
 * GET /api/armarium/overview/counts —— 返回总览页需要的派生统计。
 *
 * 目前只有 pvz_plants 条目数：研究项目横条 meta 行的「N 株植物」与图鉴实际
 * 条目数动态绑定，而 pvz_plants 是 181+ 行的大表——总览页只需要一个数字，
 * 不值得整表拉取（generic GET /api/pvz_plants 会传输全部行的完整 JSON），
 * 故在后端 COUNT(*) 出数。GET 不设防，与 generic 读通道一致。
 */
import type { FastifyInstance } from 'fastify'
import { getDb } from '../../db/index.js'

export async function registerArmariumOverviewRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/armarium/overview/counts', async () => {
    const db = getDb()
    const plants = db.prepare('SELECT COUNT(*) AS n FROM pvz_plants').get() as { n: number }
    return { plants: plants.n }
  })
}
