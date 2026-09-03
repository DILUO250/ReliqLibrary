import type { FastifyInstance } from 'fastify'
import { getDb } from '../db/index.js'
import { TABLES, type TableName } from '../db/schema.js'
import { trashArt } from './artTrash.js'
import { registerPvzArtRoutes } from '../features/armarium/artRoutes.js'
import { registerTurrisArtRoutes } from '../features/turris/artRoutes.js'

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
const DELETE_NULLIFY_HOOKS: Record<string, Array<{ table: string; fk: string }>> = {
  floors: [
    { table: 'librarians', fk: 'floorId' },
    { table: 'emotion_entities', fk: 'floorId' },
  ],
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/health', async () => ({ ok: true }))

  await registerTurrisArtRoutes(app)
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
      for (const hook of DELETE_NULLIFY_HOOKS[table] ?? []) {
        getDb().prepare(`UPDATE ${hook.table} SET ${hook.fk} = NULL WHERE ${hook.fk} = ?`).run(id)
      }
      trashRowImages(table, id)
      const info = getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id)
      if (info.changes === 0) return reply.code(404).send({ error: 'not found' })
      return { deleted: info.changes }
    })
  }

  // 批量重排序：单事务内更新一批行的 sortOrder，避免前端 N 次串行 PUT。
  for (const table of ['floors', 'librarians', 'emotion_entities'] as const) {
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
      // 馆藏 = 馆藏书目 + PVZ 图鉴植物（每株植物计 1 馆藏）
      books: count('books') + count('pvz_plants'),
      repositories: count('repositories'),
      guests: count('guests'),
      stations: count('rail_stations'),
      energyTotal: energy.s,
      entries: count('pvz_plants'),
    }
  })
}
