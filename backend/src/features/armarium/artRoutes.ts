import type { FastifyInstance } from 'fastify'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { ART_DIR } from '../../config/index.js'
import { pvzSyncApply, pvzSyncCheck } from './pvzSync.js'

const pvzArtDir = join(ART_DIR, 'armarium')
const pvzAssetDir = join(ART_DIR, '..', 'features', 'armarium', 'projects', 'pvzwiki', 'assets')
const pvzImageExts = ['png', 'jpg', 'jpeg', 'webp'] as const

function pvzCode(value: unknown): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)
}

function pvzFile(dir: string, code: string): string | null {
  for (const ext of pvzImageExts) {
    const file = join(dir, `${code}.${ext}`)
    if (existsSync(file)) return file
  }
  return null
}

function pvzDataUrl(dataUrl: string): { ext: string; data: Buffer } | null {
  const match = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(dataUrl)
  if (!match?.[1] || !match[2]) return null
  return { ext: match[1] === 'jpeg' ? 'jpg' : match[1], data: Buffer.from(match[2], 'base64') }
}

// 被替换/删除的用户素材不直接销毁，移入 _trash 回收目录（带时间戳前缀防重名），
// 便于手动检查后彻底删除；生成新卡图覆盖旧卡图时同样走这里。
function pvzTrash(file: string): void {
  try {
    const trashDir = join(pvzArtDir, '_trash')
    mkdirSync(trashDir, { recursive: true })
    renameSync(file, join(trashDir, `${Date.now()}_${basename(file)}`))
  } catch {
    // 移动失败时保持原文件不动，避免数据丢失
  }
}

// 统一的"读取 / 写入 / 删除"三件套工厂：立绘、卡图、背景共用同一套逻辑
function registerPvzImageRoutes(
  app: FastifyInstance,
  kind: 'plant-image' | 'plant-card' | 'plant-bg',
  subdir: string,
): void {
  const dir = join(pvzArtDir, subdir)
  const urlPrefix = `/art/armarium/${subdir}`

  app.get(`/api/pvz/${kind}`, async (req) => {
    const code = pvzCode((req.query as { codename?: string }).codename)
    const file = pvzFile(dir, code)
    if (!file) return { url: null, dataUrl: null, ext: null }
    const ext = extname(file).slice(1).toLowerCase()
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
    return { url: `${urlPrefix}/${basename(file)}`, dataUrl: `data:${mime};base64,${readFileSync(file).toString('base64')}`, ext }
  })

  app.post(`/api/pvz/${kind}`, async (req, reply) => {
    const body = req.body as { codename?: string; dataUrl?: string }
    const code = pvzCode(body?.codename)
    const image = pvzDataUrl(String(body?.dataUrl ?? ''))
    if (!code || !image) return reply.code(400).send({ error: `invalid ${kind}` })
    mkdirSync(dir, { recursive: true })
    const old = pvzFile(dir, code)
    if (old) pvzTrash(old)
    writeFileSync(join(dir, `${code}.${image.ext}`), image.data)
    return { url: `${urlPrefix}/${code}.${image.ext}` }
  })

  app.delete(`/api/pvz/${kind}`, async (req) => {
    const code = pvzCode((req.query as { codename?: string }).codename)
    const file = pvzFile(dir, code)
    if (file) pvzTrash(file)
    return { ok: true }
  })
}

export async function registerPvzArtRoutes(app: FastifyInstance): Promise<void> {
  // 词条数据已迁 SQLite：编辑/自建统一走 generic CRUD /api/pvz_plants。
  // 旧 /api/pvz/overrides 与 /api/pvz/custom-plants 已移除。

  // 云端同步（pvzge.com 图鉴快照）：check 只比对差异，apply 按确认清单增删
  app.post('/api/pvz/sync/check', async (_req, reply) => {
    try {
      return await pvzSyncCheck()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return reply.code(502).send({ error: `同步检查失败：${message}` })
    }
  })

  app.post('/api/pvz/sync/apply', async (req, reply) => {
    try {
      const body = req.body as { add?: unknown; remove?: unknown }
      const add = Array.isArray(body?.add) ? body.add.map(pvzCode) : []
      const remove = Array.isArray(body?.remove) ? body.remove.map(pvzCode) : []
      return await pvzSyncApply(add, remove)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return reply.code(502).send({ error: `同步应用失败：${message}` })
    }
  })

  registerPvzImageRoutes(app, 'plant-image', 'plants')
  registerPvzImageRoutes(app, 'plant-card', 'cards')

  // 图鉴背景：读取/写入同上，另有"从内置背景库复制"通道
  registerPvzImageRoutes(app, 'plant-bg', 'backgrounds')

  app.get('/api/pvz/backgrounds', async () => {
    const dir = join(pvzAssetDir, 'image', 'almanac', 'backgrounds')
    const items: Array<{ name: string; url: string }> = []
    if (existsSync(dir)) {
      for (const name of readdirSync(dir)) {
        if (/\.(?:webp|png|jpe?g)$/i.test(name)) {
          items.push({ name, url: `/features/armarium/projects/pvzwiki/assets/image/almanac/backgrounds/${name}` })
        }
      }
    }
    return items
  })

  app.post('/api/pvz/plant-bg/copy', async (req, reply) => {
    const body = req.body as { codename?: string; source?: string }
    const code = pvzCode(body?.codename)
    const source = String(body?.source ?? '')
    const prefix = '/features/armarium/projects/pvzwiki/assets/image/almanac/backgrounds/'
    if (!code || !source.startsWith(prefix)) return reply.code(400).send({ error: 'invalid background source' })
    const sourceFile = join(pvzAssetDir, 'image', 'almanac', 'backgrounds', basename(source))
    if (!existsSync(sourceFile)) return reply.code(404).send({ error: 'background not found' })
    const dir = join(pvzArtDir, 'backgrounds')
    mkdirSync(dir, { recursive: true })
    const old = pvzFile(dir, code)
    if (old) pvzTrash(old)
    const ext = extname(sourceFile).slice(1).toLowerCase()
    writeFileSync(join(dir, `${code}.${ext}`), readFileSync(sourceFile))
    return { ok: true }
  })
}
