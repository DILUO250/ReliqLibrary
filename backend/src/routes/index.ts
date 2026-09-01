import type { FastifyInstance } from 'fastify'
import { execFile } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { promisify } from 'node:util'
import { getDb } from '../db/index.js'
import { ART_DIR } from '../config/index.js'
import { TABLES, type TableName } from '../db/schema.js'
import { trashArt } from './artTrash.js'
import { registerPvzArtRoutes } from '../features/armarium/artRoutes.js'

const execFileP = promisify(execFile)

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

type IdParams = { id: string }

function columnsOf(table: string): string[] {
  // 白名单断言：禁止任何不在 TABLES 中的表名进入 SQL 拼接（SQL 注入防线，必须保持）
  if (!TABLES.includes(table as TableName)) {
    throw new Error(`unknown table: ${table}`)
  }
  const db = getDb()
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return rows.map((r) => r.name)
}

function insertColumns(body: Record<string, unknown>, cols: string[]): string[] {
  return cols.filter((c) => c !== 'id' && c in body)
}

// 各表可能存放 /art/ 图片 URL 的列。PUT 更新 / DELETE 整行时，
// 旧文件将被移入 _trash（而不是永久删除），供人工复核后决定去留。
// 新表若含图片列，必须在此登记 —— 替换即回收，禁止让旧图变成孤儿资源。
const IMAGE_COLUMNS: Record<string, string[]> = {
  floors: ['artwork'],
  librarians: ['portrait', 'portraitPreview'],
}

function imageColumnsOf(table: string): string[] {
  return IMAGE_COLUMNS[table] ?? []
}

// 更新（PUT）时：对比旧行与请求体，凡图片列被清空或换成新值时，回收旧文件。
function trashReplacedImages(table: string, id: number | string, body: Record<string, unknown>): void {
  const cols = imageColumnsOf(table)
  if (cols.length === 0) return
  const old = getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  if (!old) return
  for (const col of cols) {
    const oldUrl = old[col]
    if (typeof oldUrl !== 'string' || !oldUrl) continue
    if (col in body && body[col] !== oldUrl) trashArt(oldUrl)
  }
}

// 删除（DELETE）时：回收整行所有图片列指向的文件。
function trashRowImages(table: string, id: number | string): void {
  const cols = imageColumnsOf(table)
  if (cols.length === 0) return
  const old = getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  if (!old) return
  for (const col of cols) {
    const url = old[col]
    if (typeof url === 'string' && url) trashArt(url)
  }
}

// DELETE 级联置空钩子表：删除上级记录时，将子表外键置空（保留子数据，归入"未分配"区）。
// 需要"连带删除子数据"的场景应当改用 DB 外键 ON DELETE CASCADE，并在提交说明中明确理由。
const DELETE_NULLIFY_HOOKS: Record<string, { table: string; fk: string }> = {
  floors: { table: 'librarians', fk: 'floorId' },
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/health', async () => ({ ok: true }))

  await registerArtRoutes(app)
  await registerPvzArtRoutes(app)

  for (const table of TABLES) {
    const route = `/api/${table}`

    app.get(route, async () => {
      const db = getDb()
      return db.prepare(`SELECT * FROM ${table}`).all()
    })

    app.get(`${route}/:id`, async (req, reply) => {
      const { id } = req.params as IdParams
      const row = getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id)
      if (!row) return reply.code(404).send({ error: 'not found' })
      return row
    })

    app.post(route, async (req, reply) => {
      const body = (req.body ?? {}) as Record<string, unknown>
      const cols = columnsOf(table)
      const pick = insertColumns(body, cols)
      if (pick.length === 0) return reply.code(400).send({ error: 'no valid fields' })
      const placeholders = pick.map(() => '?').join(', ')
      const info = getDb()
        .prepare(`INSERT INTO ${table} (${pick.join(', ')}) VALUES (${placeholders})`)
        .run(...pick.map((c) => body[c]))
      return reply.code(201).send({ id: info.lastInsertRowid })
    })

    app.put(`${route}/:id`, async (req, reply) => {
      const { id } = req.params as IdParams
      const body = (req.body ?? {}) as Record<string, unknown>
      const cols = columnsOf(table)
      const pick = insertColumns(body, cols)
      if (pick.length === 0) return reply.code(400).send({ error: 'no valid fields' })
      const set = pick.map((c) => `${c} = ?`).join(', ')
      const info = getDb()
        .prepare(`UPDATE ${table} SET ${set} WHERE id = ?`)
        .run(...pick.map((c) => body[c]), id)
      if (info.changes === 0) return reply.code(404).send({ error: 'not found' })
      trashReplacedImages(table, id, body)
      return { updated: info.changes }
    })

    app.delete(`${route}/:id`, async (req, reply) => {
      const { id } = req.params as IdParams
      const hook = DELETE_NULLIFY_HOOKS[table]
      if (hook) {
        getDb().prepare(`UPDATE ${hook.table} SET ${hook.fk} = NULL WHERE ${hook.fk} = ?`).run(id)
      }
      trashRowImages(table, id)
      const info = getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id)
      if (info.changes === 0) return reply.code(404).send({ error: 'not found' })
      return { deleted: info.changes }
    })
  }

  // 批量重排序：单事务内更新一批行的 sortOrder，避免前端 N 次串行 PUT。
  for (const table of ['floors', 'librarians'] as const) {
    app.post(`/api/${table}/reorder`, async (req, reply) => {
      const body = req.body as Array<{ id: number | string; sortOrder: number }>
      if (!Array.isArray(body)) return reply.code(400).send({ error: 'expected an array' })
      const db = getDb()
      const stmt = db.prepare(`UPDATE ${table} SET sortOrder = ? WHERE id = ?`)
      const tx = db.transaction(() => {
        for (const item of body) {
          if (item == null || typeof item !== 'object') continue
          const id = (item as Record<string, unknown>).id
          const order = (item as Record<string, unknown>).sortOrder
          if (id == null || order == null) continue
          stmt.run(order, id)
        }
      })
      tx()
      return { ok: true, count: body.length }
    })
  }

  app.get('/api/overview', async () => {
    const db = getDb()
    const count = (t: TableName) =>
      (db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get() as { c: number }).c
    const energy = db
      .prepare('SELECT COALESCE(SUM(amount), 0) AS s FROM energy_records')
      .get() as { s: number }

    return {
      floors: count('floors'),
      librarians: count('librarians'),
      anomalies: count('anomalies'),
      spaces: count('supernatural_spaces'),
      books: count('books'),
      repositories: count('repositories'),
      guests: count('guests'),
      stations: count('rail_stations'),
      energyTotal: energy.s,
      entries: count('pvz_plants'),
    }
  })
}

function ensureArtDir(): void {
  if (!existsSync(ART_DIR)) mkdirSync(ART_DIR, { recursive: true })
}

function slugify(input: string): string {
  return (
    input
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'asset'
  )
}

function runArk(args: string[]): Promise<string> {
  return execFileP('arkcli', args, {
    shell: 'powershell.exe',
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  }).then((r) => r.stdout)
}

async function registerArtRoutes(app: FastifyInstance): Promise<void> {
  // 通用图片上传：写入 ART_DIR 顶层，返回 /art/<name> URL
  app.post('/api/upload', async (req, reply) => {
    ensureArtDir()
    const parts = req.parts()
    for await (const part of parts) {
      if (part.type !== 'file') continue
      const ext = extname(part.filename ?? '').toLowerCase()
      if (!IMAGE_EXT.has(ext)) {
        return reply.code(400).send({ error: `unsupported image type ${ext || '(none)'}` })
      }
      const name = `${Date.now()}-${slugify(basename(part.filename ?? '', ext))}${ext}`
      const dest = join(ART_DIR, name)
      await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(dest)
        part.file.on('error', reject)
        ws.on('error', reject)
        ws.on('finish', resolve)
        part.file.pipe(ws)
      })
      return { url: `/art/${name}` }
    }
    return reply.code(400).send({ error: 'no file uploaded' })
  })

  // AI 生成图：调用 arkcli 选默认图片模型，产出落盘 ART_DIR
  app.post('/api/art/generate', async (req, reply) => {
    const body = (req.body ?? {}) as { prompt?: string }
    const prompt = body.prompt?.trim()
    if (!prompt) return reply.code(400).send({ error: 'prompt is required' })
    ensureArtDir()
    try {
      const listRaw = await runArk(['resources', 'list', '--modality', 'image'])
      const list = JSON.parse(listRaw) as {
        items?: Array<{ id: string; is_default?: boolean }>
      }
      const model =
        list.items?.find((i) => i.is_default)?.id ?? list.items?.[0]?.id
      if (!model) {
        return reply.code(502).send({ error: 'no image model available from arkcli' })
      }
      const out = await runArk([
        '+gen',
        '--model',
        model,
        '--save-to',
        ART_DIR,
        prompt,
      ])
      const gen = JSON.parse(out) as { local_path?: string; output_url?: string }
      const file = gen.local_path ?? gen.output_url
      if (!file) return reply.code(502).send({ error: 'arkcli returned no asset' })
      const name = basename(file)
      return {
        url: `/art/${name}`,
        raw: file,
        model,
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return reply.code(500).send({ error: `ark generation failed: ${msg}` })
    }
  })
}
