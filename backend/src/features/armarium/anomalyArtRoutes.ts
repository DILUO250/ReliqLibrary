import type { FastifyInstance } from 'fastify'
import { createWriteStream, mkdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { ART_DIR } from '../../config/index.js'
import { trashArt } from '../../routes/artTrash.js'

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

// 异常实体报告插图目录：art/armarium/entities/<SCL编号>/（armarium 分家目录，
// 与 PVZ 的 projects/ 平行；删除走 armarium/_trash/）。
const ENTITIES_URL_PREFIX = '/art/armarium/entities/'

// 编号收敛：只保留数字段并强制 SCL- 前缀，位数不限——目录名永远不可注入。
function entityCode(input: unknown): string {
  const digits = String(input ?? '').replace(/^scl-/i, '').replace(/\D/g, '')
  return digits ? `SCL-${digits}` : ''
}

export async function registerAnomalyArtRoutes(app: FastifyInstance): Promise<void> {
  // 报告插图上传：?code=SCL-88889 → art/armarium/entities/SCL-88889/<时间戳>-<slug>.<ext>
  // 返回的 url 即最终显示路径（DB 直存，零翻译层）。替换/删除旧图由前端调 DELETE 回收。
  app.post('/api/armarium/anomaly-image', async (req, reply) => {
    const code = entityCode((req.query as { code?: string }).code)
    if (!code) return reply.code(400).send({ error: 'query 参数 code 必须为 SCL-<数字编号>' })
    const dir = join(ART_DIR, 'armarium', 'entities', code)
    mkdirSync(dir, { recursive: true })
    const parts = req.parts()
    for await (const part of parts) {
      if (part.type !== 'file') continue
      const ext = extname(part.filename ?? '').toLowerCase()
      if (!IMAGE_EXT.has(ext)) {
        return reply.code(400).send({ error: `unsupported image type ${ext || '(none)'}` })
      }
      const slug =
        basename(part.filename ?? '', ext)
          .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 40) || 'asset'
      const name = `${Date.now()}-${slug}${ext}`
      const dest = join(dir, name)
      await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(dest)
        part.file.on('error', reject)
        ws.on('error', reject)
        ws.on('finish', resolve)
        part.file.pipe(ws)
      })
      return { url: `${ENTITIES_URL_PREFIX}${code}/${name}` }
    }
    return reply.code(400).send({ error: 'no file uploaded' })
  })

  // 报告插图删除（替换/移除时前端调用）：前缀守卫只放行本功能目录，防任意路径回收。
  app.delete('/api/armarium/anomaly-image', async (req, reply) => {
    const url = String((req.query as { url?: string }).url ?? '')
    if (!url.startsWith(ENTITIES_URL_PREFIX)) {
      return reply.code(400).send({ error: 'url 必须位于 /art/armarium/entities/ 下' })
    }
    trashArt(url)
    return { ok: true }
  })
}
