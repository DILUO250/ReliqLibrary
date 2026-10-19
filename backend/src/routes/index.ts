import type { FastifyInstance, FastifyReply } from 'fastify'
import { getDb } from '../db/index.js'
import { TABLES, type TableName } from '../db/schema.js'
import { RTL_TOKEN } from '../config/index.js'
import { scheduleBackup, backupStatus } from '../db/backupScheduler.js'
import { trashArt } from './artTrash.js'
import { registerPvzArtRoutes } from '../features/armarium/artRoutes.js'
import { registerAnomalyArtRoutes } from '../features/armarium/anomalyArtRoutes.js'
import { registerAnomalyExportRoutes } from '../features/armarium/exportRoutes.js'
import { registerSpaceArtRoutes } from '../features/armarium/spaceArtRoutes.js'
import { registerSpaceExportRoutes } from '../features/armarium/spaceExportRoutes.js'
import { registerArmariumOverviewRoutes } from '../features/armarium/overviewRoutes.js'
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
  // id 默认由 AUTOINCREMENT 生成，**但 body 显式提供非空 id 时照写**——
  // TEXT 主键表（pvz_keywords，代号即身份）必须显式提供 id；POST 侧另有
  // 无 id 拒绝门（见下方 TEXT_PK_TABLES），防止 id=NULL 幽灵行（审计 M5 实锤）。
  return cols.filter((c) => c in body && (c !== 'id' || body.id != null))
}

// TEXT 主键表：代号是身份（植物 traits JSON 直接存关键词代号），POST 不带 id 会
// 插入"无身份"幽灵行——按代号 DELETE/PUT 永远打不中。新建必须显式提供代号。
const TEXT_PK_TABLES: ReadonlySet<string> = new Set(['pvz_keywords'])

// "最近编辑"盖章表：这些表的 PUT/POST 成功后由后端盖 updatedAt 时间戳。
// 时间戳权威源在后端——前端 body 即使带 updatedAt 也会被盖章覆盖。
// 目前仅 floors（迎书楼总览页塔楼剖面的"最近编辑 5 层"排序依据）。
const TOUCH_UPDATED_AT: ReadonlySet<string> = new Set(['floors'])

// 楼层子表 → 归属外键。通用 CRUD 不认识表间业务关系，必须在这里显式登记，
// 才能在子数据增删改时刷新父楼层的 updatedAt（否则改司书/情感实体不会影响
// 主页"最近编辑"排序）。
const FLOOR_CHILD_TABLES: Readonly<Record<string, string>> = {
  librarians: 'floorId',
  emotion_entities: 'floorId',
  combat_pages: 'floorId',
}

// 盖章动作：注意列必须真实存在（schema.ts ensureColumn 已迁移），失败不静默——
// 事务外单跑，失败会顺着错误路径走。
function touchUpdatedAt(
  table: string,
  id: number | string | null | undefined,
  db: ReturnType<typeof getDb>,
): void {
  if (!TOUCH_UPDATED_AT.has(table) || id == null) return
  db.prepare(`UPDATE ${table} SET updatedAt = ? WHERE id = ?`).run(new Date().toISOString(), id)
}

/** 子表写入后刷新父楼层：旧楼层与新楼层都算（司书移动楼层时两层内容都变了）。 */
function touchFloorsForChild(table: string, ...floorIds: unknown[]): void {
  if (!FLOOR_CHILD_TABLES[table]) return
  const db = getDb()
  for (const floorId of floorIds) {
    if (typeof floorId === 'number' || typeof floorId === 'string') {
      touchUpdatedAt('floors', floorId, db)
    }
  }
}

/** 读取子数据当前归属楼层（PUT 处理移动 / DELETE 前取楼层用）。 */
function childFloorId(table: string, id: number | string): unknown {
  const fk = FLOOR_CHILD_TABLES[table]
  if (!fk) return null
  const row = getDb().prepare(`SELECT ${fk} AS floorId FROM ${table} WHERE id = ?`).get(id) as
    | { floorId?: unknown }
    | undefined
  return row?.floorId ?? null
}

/** 把 updatedAt 并入同一条 INSERT/UPDATE（原子盖章，避免二次 UPDATE 的失败点）。 */
function stampUpdatedAt(table: string, body: Record<string, unknown>, pick: string[]): void {
  if (!TOUCH_UPDATED_AT.has(table)) return
  if (!pick.includes('updatedAt')) pick.push('updatedAt')
  body.updatedAt = new Date().toISOString()
}

// 各表可能存放 /art/ 图片 URL 的列。PUT 更新 / DELETE 整行时，
// 旧文件将被移入 _trash（而不是永久删除），供人工复核后决定去留。
// 新表若含图片列，必须在此登记 —— 替换即回收，禁止让旧图变成孤儿资源。
export const IMAGE_COLUMNS: Record<string, string[]> = {
  floors: ['artwork'],
  librarians: ['portrait', 'portraitPreview'],
  armarium_projects: ['cover'],
  // pvz_plants 只登记每株植物独占的两列。豁免项及原因：
  // - familyIcon：共享家族图标（一个图标最多被 22 株植物引用），登记会让
  //   "删一株植物"把共享图标拖进回收站，殃及其余植株；
  // - backgrounds/fonts：引用者是代码/静态文件而非 DB 行，与 art/turris/systems 同类。
  pvz_plants: ['image', 'wikiFull'],
  // anomalies 的报告插图存在 report JSON（figures[].url）内部而非独立图片列，
  // IMAGE_COLUMNS 的"列级对比"机制覆盖不到——由 collectReportArt() 在
  // PUT（trashReplacedImages 同期）/ DELETE 钩子里集中回收，豁免登记。
}
// anomalies.report JSON 内的 /art/ 图片 URL 收集（删行防孤儿）。
// supernatural_spaces 同理（空间报告单 figures 同构）——collectReportJsonArt 按表收集。
function collectReportJsonArt(table: 'anomalies' | 'supernatural_spaces', id: number | string): string[] {
  const row = getDb().prepare(`SELECT report FROM ${table} WHERE id = ?`).get(id) as
    | { report?: string }
    | undefined
  if (!row?.report) return []
  try {
    const r = JSON.parse(row.report) as { figures?: Array<{ url?: unknown }> }
    return (r.figures ?? [])
      .map((f) => f?.url)
      .filter((u): u is string => typeof u === 'string' && u.startsWith('/art/'))
  } catch {
    return []
  }
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
// 金贵数据（司书/书页/卡牌/来宾/书中世界等）一律置空保留，禁止凭空消失。
const DELETE_NULLIFY_HOOKS: Record<string, Array<{ table: string; fk: string }>> = {
  floors: [
    { table: 'librarians', fk: 'floorId' },
    { table: 'emotion_entities', fk: 'floorId' },
    { table: 'combat_pages', fk: 'floorId' },
    { table: 'guests', fk: 'floorId' },
  ],
  librarians: [
    { table: 'core_pages', fk: 'ownerId' },
    { table: 'combat_pages', fk: 'ownerId' },
  ],
  invitations: [{ table: 'guests', fk: 'invitationId' }],
  books: [
    { table: 'literary_worlds', fk: 'bookId' },
    { table: 'guests', fk: 'bookId' },
  ],
  // books.worldId / anomalies.worldId 的目标均为 literary_worlds（书中世界收容
  // 单元：书是世界的外壳、异常住在世界里）。异常实体行同样被 literary_worlds.
  // holdsEntityId 反向指着，属同一段收容关系的两个方向。
  literary_worlds: [
    { table: 'anomalies', fk: 'worldId' },
    { table: 'books', fk: 'worldId' },
  ],
  anomalies: [{ table: 'literary_worlds', fk: 'holdsEntityId' }],
}

// DELETE 连带删除钩子表：仅用于"子数据离开上级就没有意义"的纯从属关系
// （卡包里的卡、书库树的子书库）。删除即丢数据方向，新增条目前必须想清楚。
// recursive = 子表自引用（树形），需先用递归 CTE 收集全部后代再删。
const DELETE_CASCADE_HOOKS: Record<string, Array<{ table: string; fk: string; recursive?: boolean }>> = {
  page_packs: [{ table: 'cards', fk: 'packId' }],
  repositories: [{ table: 'repositories', fk: 'parentId', recursive: true }],
}

// 行内图片 URL 收集（连带删除的子行如果有图片列，也要走回收站防孤儿）。
function rowImageUrls(table: string, id: number | string): string[] {
  const cols = imageColumnsOf(table)
  if (cols.length === 0) return []
  const row = getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  if (!row) return []
  return cols.map((c) => row[c]).filter((v): v is string => typeof v === 'string' && v !== '')
}

// SQLite 错误 → 人话：约束冲突（NOT NULL/UNIQUE/CHECK）是调用方的问题，返回 400；
// 其余按 500 泛化，不把内部错误细节原样泄漏给局域网客户端。
function sqliteErrorReply(e: unknown, reply: FastifyReply): unknown {
  const err = e as { code?: string; message?: string }
  if (typeof err?.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return reply.code(400).send({ error: `数据约束冲突：${err.message?.split(': ').slice(-1)[0] ?? ''}` })
  }
  throw e
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/health', async () => ({ ok: true }))

  app.get('/api/backup/status', async () => backupStatus())

  // 写操作鉴权（局域网多人形态的最小防线）：非 GET /api/* 必须携带
  // `x-rtl-key: <RTL_TOKEN>`（前端 api.ts / pvzwiki 写通道自动附头）。GET 不设门。
  app.addHook('onRequest', async (req, reply) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return
    if (!req.url.startsWith('/api/')) return
    if (req.headers['x-rtl-key'] !== RTL_TOKEN) {
      return reply.code(401).send({ error: 'unauthorized: missing or invalid x-rtl-key header' })
    }
  })

  // 写后自动备份：任何 /api/* 写请求（通用 CRUD / reorder / feature 路由 / 未来新增）
  // 成功响应后调度一次防抖后台快照——单一钩子覆盖全部写路径，响应已发出，零延迟影响。
  app.addHook('onResponse', async (req) => {
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH') && req.url.startsWith('/api/')) {
      scheduleBackup()
    }
  })

  await registerTurrisArtRoutes(app)
  await registerPvzArtRoutes(app)
  await registerAnomalyArtRoutes(app)
  await registerAnomalyExportRoutes(app)
  await registerSpaceArtRoutes(app)
  await registerSpaceExportRoutes(app)
  await registerArmariumOverviewRoutes(app)

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
      if (TEXT_PK_TABLES.has(table) && (typeof body.id !== 'string' || body.id.trim() === '')) {
        return reply.code(400).send({ error: `新建 ${table} 必须显式提供 id（代号）` })
      }
      const cols = columnsOf(table)
      const pick = insertColumns(body, cols)
      if (pick.length === 0) return reply.code(400).send({ error: 'no valid fields' })
      stampUpdatedAt(table, body, pick)
      const placeholders = pick.map(() => '?').join(', ')
      const fk = FLOOR_CHILD_TABLES[table]
      try {
        const info = getDb()
          .prepare(`INSERT INTO ${table} (${pick.join(', ')}) VALUES (${placeholders})`)
          .run(...pick.map((c) => body[c]))
        // 子数据新增 = 所属楼层被编辑（父楼层同样计入主页"最近编辑"）。
        if (fk) touchFloorsForChild(table, body[fk])
        return reply.code(201).send({ id: info.lastInsertRowid })
      } catch (e) {
        return sqliteErrorReply(e, reply)
      }
    })

    app.put(`${route}/:id`, async (req, reply) => {
      const { id } = req.params as IdParams
      const body = (req.body ?? {}) as Record<string, unknown>
      const cols = columnsOf(table)
      const pick = insertColumns(body, cols)
      if (pick.length === 0) return reply.code(400).send({ error: 'no valid fields' })
      const fk = FLOOR_CHILD_TABLES[table]
      // 移动归属时旧楼层也要刷新：先记住更新前的父楼层。
      const oldFloorId = fk ? childFloorId(table, id) : null
      stampUpdatedAt(table, body, pick)
      const set = pick.map((c) => `${c} = ?`).join(', ')
      try {
        const info = getDb()
          .prepare(`UPDATE ${table} SET ${set} WHERE id = ?`)
          .run(...pick.map((c) => body[c]), id)
        if (info.changes === 0) return reply.code(404).send({ error: 'not found' })
        trashReplacedImages(table, id, body)
        if (fk) touchFloorsForChild(table, oldFloorId, fk in body ? body[fk] : oldFloorId)
        return { updated: info.changes }
      } catch (e) {
        return sqliteErrorReply(e, reply)
      }
    })

    app.delete(`${route}/:id`, async (req, reply) => {
      const { id } = req.params as IdParams
      const db = getDb()
      // 先确认行存在再置空子表——旧实现对不存在的 id 也会先改子表，产生无源 nullify
      const exists = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id)
      if (!exists) return reply.code(404).send({ error: 'not found' })
      // 删除子数据也是编辑楼层：先记住归属，删除成功后刷新父楼层。
      const oldFloorId = childFloorId(table, id)
      const reportArt =
        table === 'anomalies' || table === 'supernatural_spaces' ? collectReportJsonArt(table, id) : []
      const cascadeArt: string[] = []
      try {
        const tx = db.transaction(() => {
          for (const hook of DELETE_NULLIFY_HOOKS[table] ?? []) {
            db.prepare(`UPDATE ${hook.table} SET ${hook.fk} = NULL WHERE ${hook.fk} = ?`).run(id)
          }
          for (const hook of DELETE_CASCADE_HOOKS[table] ?? []) {
            const victimIds = hook.recursive
              ? (
                  db
                    .prepare(
                      `WITH RECURSIVE del(id) AS (
                         SELECT id FROM ${hook.table} WHERE ${hook.fk} = ?
                         UNION ALL
                         SELECT c.id FROM ${hook.table} c JOIN del ON c.${hook.fk} = del.id
                       ) SELECT id FROM del`,
                    )
                    .all(id) as Array<{ id: number | string }>
                ).map((r) => r.id)
              : (
                  db.prepare(`SELECT id FROM ${hook.table} WHERE ${hook.fk} = ?`).all(id) as Array<{
                    id: number | string
                  }>
                ).map((r) => r.id)
            const delStmt = db.prepare(`DELETE FROM ${hook.table} WHERE id = ?`)
            for (const vid of victimIds) {
              cascadeArt.push(...rowImageUrls(hook.table, vid))
              delStmt.run(vid)
            }
          }
          db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id)
        })
        tx()
      } catch (e) {
        return sqliteErrorReply(e, reply)
      }
      // 事务提交后才回收文件（回收失败不影响数据一致性）
      for (const url of cascadeArt) trashArt(url)
      for (const url of reportArt) trashArt(url)
      trashRowImages(table, id)
      touchFloorsForChild(table, oldFloorId)
      return { deleted: 1 }
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
          // 排序只改展示顺序，不盖"最近编辑"——否则一次拖拽会把整批楼层
          // 的 updatedAt 一起刷新，主页塔楼的最近编辑顺序就失去意义。
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
      // 馆藏 = 馆藏书目 + PVZ 图鉴植物 + 异常实体（每个实体算 1 件馆藏，2026-09-16 决议）
      books: count('books') + count('pvz_plants') + count('anomalies'),
      repositories: count('repositories'),
      guests: count('guests'),
      stations: count('rail_stations'),
      energyTotal: energy.s,
      entries: count('pvz_plants'),
    }
  })
}
