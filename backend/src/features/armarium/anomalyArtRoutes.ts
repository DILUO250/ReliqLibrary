import type { FastifyInstance, FastifyReply } from 'fastify'
import { createHash } from 'node:crypto'
import { createWriteStream, mkdirSync } from 'node:fs'
import { mkdir, readFile, rename, rm, stat } from 'node:fs/promises'
import { basename, extname, join, resolve, sep } from 'node:path'
import sharp from 'sharp'
import { ART_DIR, THUMB_CACHE_DIR } from '../../config/index.js'
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

/* ---------- 列表缩略图（按需生成 + 磁盘缓存）----------
 * GET /api/armarium/anomaly-thumb?url=/art/armarium/...&w=320
 * 痛点：卡片列表的 160×140 小框一直在加载原图（单张可达 MB 级，局域网跨设备加载以分钟计）。
 * 方案：第一次请求时用 sharp 现场压一张窄边 ~320px 的 WebP 存进 backend/data/thumb-cache/，
 * 之后同键直接回缓存；缓存键含源图 mtime → 源图被替换后旧小图自动失效重生成，零人工维护。
 * 缓存是纯派生数据：不进 art/（不触碰素材治理/回收站规则），整个目录可随时整删重建。 */

const THUMB_URL_PREFIX = '/art/armarium/'
const THUMB_WIDTH_DEFAULT = 320
const THUMB_WIDTH_MIN = 64
const THUMB_WIDTH_MAX = 640
const THUMB_QUALITY = 78

// 键 = 相对路径|宽度|源图mtime：同图同宽永远同键（浏览器可长缓存），换图即换键。
function thumbKey(rel: string, width: number, mtimeMs: number): string {
  return createHash('sha1').update(`${rel}|${width}|${mtimeMs}`).digest('hex')
}

function thumbReply(reply: FastifyReply, buf: Buffer): void {
  reply
    .code(200)
    .header('Content-Type', 'image/webp')
    .header('Cache-Control', 'public, max-age=31536000, immutable')
    .send(buf)
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

  // 列表缩略图：?url=/art/armarium/...（&w=宽度，缺省 320）。
  // 只读接口不设 token 门（GET 本就放行）；路径守卫与删除通道同风格——前缀 + 解析后回穿断言。
  app.get('/api/armarium/anomaly-thumb', async (req, reply) => {
    const q = req.query as { url?: string; w?: string }
    const url = String(q.url ?? '')
    if (!url.startsWith(THUMB_URL_PREFIX)) {
      return reply.code(400).send({ error: 'url 必须位于 /art/armarium/ 下' })
    }
    const rel = url.slice('/art/'.length)
    const abs = resolve(ART_DIR, rel)
    if (abs !== ART_DIR && !abs.startsWith(ART_DIR + sep)) {
      return reply.code(400).send({ error: '非法的图片路径' })
    }
    const ext = extname(abs).toLowerCase()
    if (!IMAGE_EXT.has(ext)) {
      return reply.code(400).send({ error: `unsupported image type ${ext || '(none)'}` })
    }
    const width = Math.min(THUMB_WIDTH_MAX, Math.max(THUMB_WIDTH_MIN, Number(q.w) || THUMB_WIDTH_DEFAULT))
    const source = await stat(abs).catch(() => null)
    if (!source?.isFile()) return reply.code(404).send({ error: '原图不存在' })

    const key = thumbKey(rel, width, source.mtimeMs)
    const cached = join(THUMB_CACHE_DIR, `${key}.webp`)
    const cachedBuf = await readFile(cached).catch(() => null)
    if (cachedBuf) return thumbReply(reply, cachedBuf)

    await mkdir(THUMB_CACHE_DIR, { recursive: true })
    // 先写临时文件再改名：并发请求打到同一键时，rename 失败即说明赢家已就位，直接读它。
    const tmp = join(THUMB_CACHE_DIR, `${key}.${process.pid}-${Date.now()}.tmp`)
    try {
      await sharp(abs)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toFile(tmp)
      await rename(tmp, cached).catch(() => undefined)
      const buf = await readFile(cached)
      return thumbReply(reply, buf)
    } catch (err) {
      return reply.code(500).send({
        error: `缩略图生成失败：${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      await rm(tmp, { force: true }).catch(() => {})
    }
  })
}
