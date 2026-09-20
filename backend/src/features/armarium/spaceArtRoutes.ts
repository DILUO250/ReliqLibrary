import type { FastifyInstance } from 'fastify'
import { createWriteStream, mkdirSync } from 'node:fs'
import { extname, basename, join } from 'node:path'
import { ART_DIR } from '../../config/index.js'
import { trashArt } from '../../routes/artTrash.js'

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

// 超自然空间报告插图目录：art/armarium/spaces/<SCL编号>/（armarium 分家目录，
// 与 entities/ 的报告插图平行；删除走 armarium/_trash/）。
const SPACES_URL_PREFIX = '/art/armarium/spaces/'

// 编号收敛：只保留数字段并强制 SCL- 前缀，位数不限——目录名永远不可注入。
function spaceCode(input: unknown): string {
  const digits = String(input ?? '').replace(/^scl-/i, '').replace(/\D/g, '')
  return digits ? `SCL-${digits}` : ''
}

/**
 * 超自然空间报告插图通道（镜像 anomalyArtRoutes：上传/删除两件套）。
 * 列表缩略图不在此实现——GET /api/armarium/anomaly-thumb 的路径守卫是
 * /art/armarium/ 全模块级，spaces 的 /art/... 图片 URL 直接复用它。
 */
export async function registerSpaceArtRoutes(app: FastifyInstance): Promise<void> {
  // 报告插图上传：?code=SCL-1000000 → art/armarium/spaces/SCL-1000000/<时间戳>-<slug>.<ext>
  // 返回的 url 即最终显示路径（DB 直存，零翻译层）。替换/删除旧图由前端调 DELETE 回收。
  app.post('/api/armarium/space-image', async (req, reply) => {
    const code = spaceCode((req.query as { code?: string }).code)
    if (!code) return reply.code(400).send({ error: 'query 参数 code 必须为 SCL-<数字编号>' })
    const dir = join(ART_DIR, 'armarium', 'spaces', code)
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
      return { url: `${SPACES_URL_PREFIX}${code}/${name}` }
    }
    return reply.code(400).send({ error: 'no file uploaded' })
  })

  // 报告插图删除（替换/移除时前端调用）：前缀守卫只放行本功能目录，防任意路径回收。
  app.delete('/api/armarium/space-image', async (req, reply) => {
    const url = String((req.query as { url?: string }).url ?? '')
    if (!url.startsWith(SPACES_URL_PREFIX)) {
      return reply.code(400).send({ error: 'url 必须位于 /art/armarium/spaces/ 下' })
    }
    trashArt(url)
    return { ok: true }
  })
}
