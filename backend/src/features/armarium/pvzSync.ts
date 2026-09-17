import { parse } from '@babel/parser'
import { mkdirSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { ART_DIR } from '../../config/index.js'
import { getDb } from '../../db/index.js'

const CLOUD_BASE = 'https://pvzge.com'
// PVZ 项目资产分支（CONVENTIONS §5 / 2026-09 资产迁家）：
// 云端快照的图统一下载到 plants/card/，DB 写本地规范 URL（/art/armarium/projects/pvz/...），
// 云端的 /assets/... 旧前缀不再入库——前端没有任何翻译层，库里必须直接存可显示路径。
const PROJECT_DIR = join(ART_DIR, 'armarium', 'projects', 'pvz')
const CARD_DIR = join(PROJECT_DIR, 'plants', 'card')
const ICON_DIR = join(PROJECT_DIR, 'plants', 'icon')

/** 云端 pvzge 图 URL（/assets/image/plants/<file>）→ 本地 { file, url }（plants/card/<名>）。 */
function cloudImageToLocal(url: string): { file: string; url: string } | null {
  if (!url.startsWith('/assets/image/plants/')) return null
  const base = url.slice('/assets/image/plants/'.length)
  const ext = extname(base)
  const stem = base.slice(0, base.length - ext.length)
  // 我们的命名规范：<codename>.<ext>（剥离 pvzge 的 plants_ 前缀与 _c 卡图后缀）
  const code = stem.replace(/^plants_/, '').replace(/_c$/, '')
  const name = `${code || stem}${ext}`
  return { file: name, url: `/art/armarium/projects/pvz/plants/card/${name}` }
}

/** 云端家族图标（/assets/wikicon/<F>_familyicon.webp）→ 本地 { file, url }（plants/icon/<F>.webp）。 */
function cloudIconToLocal(url: string): { file: string; url: string } | null {
  if (!url.startsWith('/assets/wikicon/')) return null
  const base = url.slice('/assets/wikicon/'.length)
  const name = base.replace(/_familyicon(\.[a-z0-9]+)$/i, '$1')
  return { file: name, url: `/art/armarium/projects/pvz/plants/icon/${name}` }
}

interface CloudSnapshot {
  entities: any[]
  almanac: Record<string, any>
  props: Record<string, any>
}

interface PlantEditData {
  sunCost: number | null
  recharge: number | null
  toughness: number | null
  damage: number | null
  range: string | null
  introduction: string | null
  chat: string | null
  ability: string[]
  traits: string[]
}

let cachedCloud: CloudSnapshot | null = null

function toValue(node: any): any {
  if (!node) return undefined
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral' || node.type === 'BooleanLiteral') return node.value
  if (node.type === 'NullLiteral') return null
  if (node.type === 'TemplateLiteral') return node.quasis.map((q: any) => q.value.cooked).join('')
  if (node.type === 'Identifier') return node.name === 'undefined' ? undefined : node.name
  if (node.type === 'ArrayExpression') return node.elements.map((item: any) => toValue(item))
  if (node.type === 'ObjectExpression') {
    const value: Record<string, any> = {}
    for (const prop of node.properties) {
      if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') continue
      const key = prop.key.type === 'Identifier' ? prop.key.name : toValue(prop.key)
      value[key] = toValue(prop.value)
    }
    return value
  }
  return undefined
}

function walk(node: any, visit: (value: any) => void): void {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (node.type) visit(node)
  for (const key of Object.keys(node)) {
    if (['loc', 'start', 'end', 'leadingComments', 'trailingComments', 'extra'].includes(key)) continue
    walk(node[key], visit)
  }
}

function parseEntities(code: string): any[] {
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] })
  let entities: any[] = []
  walk(ast, (node) => {
    if (node.type !== 'CallExpression' || node.callee?.type !== 'MemberExpression') return
    if (node.callee.object?.name !== 'JSON' || node.callee.property?.name !== 'parse') return
    // 上游以 JSON.parse(`模板字符串`) 内联数据：toValue 返回的是原始字符串，
    // 需先 JSON.parse 还原为对象再取 entities，否则永远为空。
    let value = toValue(node.arguments?.[0])
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value)
      } catch {
        value = undefined
      }
    }
    const list = value?.frontmatter?.almanacDirectory?.entities
    if (Array.isArray(list)) entities = list
  })
  return entities
}

function parseDetails(code: string): { almanac: Record<string, any>; props: Record<string, any> } {
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] })
  const almanac: Record<string, any> = {}
  const props: Record<string, any> = {}
  walk(ast, (node) => {
    if (node.type !== 'ObjectExpression') return
    const value = toValue(node)
    if (!value?.objclass || !Array.isArray(value.aliases)) return
    if (value.objclass === 'PlantAlmanacProperties') {
      for (const alias of value.aliases) almanac[alias] = value.objdata || {}
    } else if (value.objclass === 'PlantProperties') {
      for (const alias of value.aliases) props[alias] = value.objdata || {}
    }
  })
  return { almanac, props }
}

function findAsset(code: string, name: string): string | null {
  const match = code.match(new RegExp(`assets/${name}-[A-Za-z0-9_-]+\\.js`))
  return match?.[0] ?? null
}

// 云端访问统一 15s 超时：官网挂了/网络中断时快速失败，同步按钮不会一直转圈。
const FETCH_TIMEOUT_MS = 15_000

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!response.ok) throw new Error(`fetch ${url} failed: ${response.status}`)
  return response.text()
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!response.ok) return null
    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  }
}

async function collectCloud(): Promise<CloudSnapshot> {
  if (cachedCloud) return cachedCloud
  const html = await fetchText(`${CLOUD_BASE}/almanac/plants.html`)
  const listAsset = findAsset(html, 'plants')
  const appAsset = findAsset(html, 'app')
  if (!listAsset || !appAsset) throw new Error('无法在云端页面定位数据文件')
  const [listCode, appCode] = await Promise.all([
    fetchText(`${CLOUD_BASE}/${listAsset}`),
    fetchText(`${CLOUD_BASE}/${appAsset}`),
  ])
  const formatAsset = findAsset(appCode, 'formatPlants')
  if (!formatAsset) throw new Error('无法定位植物详情数据文件')
  const formatCode = await fetchText(`${CLOUD_BASE}/${formatAsset}`)
  const { almanac, props } = parseDetails(formatCode)
  cachedCloud = { entities: parseEntities(listCode), almanac, props }
  return cachedCloud
}

function extractAbility(data: any): string[] {
  const specials = Array.isArray(data?.Special) ? data.Special : []
  return specials
    .filter((item: any) => item?.NAME && ['Special', 'Sun Production'].includes(typeof item.NAME === 'object' ? item.NAME.en || item.NAME.zh : item.NAME))
    .map((item: any) => typeof item.DESCRIPTION === 'object' ? item.DESCRIPTION.zh || item.DESCRIPTION.en : item.DESCRIPTION)
    .filter(Boolean)
}

function extractDamage(almanac: any, props: any): number | null {
  const element = Array.isArray(almanac?.Elements) ? almanac.Elements.find((item: any) => item?.TYPE === 'DAMAGE') : undefined
  return element?.VALUE ?? props?.Damage ?? props?.ProjectileDamage ?? null
}

function buildDetail(entity: any, almanac: any, props: any): PlantEditData {
  const value = (almanac?.Introduction && typeof almanac.Introduction === 'object' ? almanac.Introduction.zh || almanac.Introduction.en : null)
  const chat = almanac?.Chat && typeof almanac.Chat === 'object' ? almanac.Chat.zh || almanac.Chat.en : null
  return {
    sunCost: props?.SunCost ?? null,
    recharge: props?.Cooldown ?? null,
    toughness: props?.Toughness ?? null,
    damage: extractDamage(almanac, props),
    range: null,
    introduction: value,
    chat,
    ability: extractAbility(almanac),
    traits: [],
  }
}

// 本地官方条目（isCustom=0）codename 集合。自建条目永不参与云端增删比对。
function localOfficialCodes(): Set<string> {
  const rows = getDb().prepare('SELECT codename FROM pvz_plants WHERE isCustom = 0').all() as Array<{
    codename: string
  }>
  return new Set(rows.map((r) => r.codename))
}

export async function pvzSyncCheck(): Promise<{ added: any[]; removed: any[] }> {
  const cloud = await collectCloud()
  const localCodes = localOfficialCodes()
  const cloudCodes = new Set(cloud.entities.map((item) => item.codename))
  return {
    added: cloud.entities.filter((item) => item.codename && !localCodes.has(item.codename)).map((item) => ({
      codename: item.codename,
      name: item.name,
      englishName: item.englishName,
      image: item.image,
      world: item.world,
      familyName: item.family?.name ?? null,
      summary: item.summary ?? null,
    })),
    removed: [...localCodes]
      .filter((code) => !cloudCodes.has(code))
      .map((code) => {
        const row = getDb().prepare('SELECT codename, name FROM pvz_plants WHERE codename = ?').get(code) as
          | { codename: string; name: string }
          | undefined
        return { codename: code, name: row?.name ?? code }
      }),
  }
}

// 只增删、不覆盖：新增云端条目插入 pvz_plants；移除只删官方条目（isCustom=0）。
// 已有植物的字段（精修/编辑的最终值）永不被同步触碰。
//
// 可靠性三防线（2026-09 C组）：
// 1. 两阶段执行——先完成全部网络请求与文件落盘，再在单个事务里写库：
//    任一环节失败即整体中止，绝不留"一半新一半旧"的中间态；
// 2. 代号冲突（与本地官方或用户自建条目撞名）一律跳过并在结果中报告，不再报错卡死；
// 3. 全部网络请求带超时（fetchText/fetchBuffer）。
// 文件落盘在事务之前：若写库失败，磁盘可能留下孤儿图片，由 audit:art 报告人工处置。
export async function pvzSyncApply(
  add: string[],
  remove: string[],
): Promise<{ added: number; removed: number; skipped: string[] }> {
  const cloud = await collectCloud()
  const db = getDb()

  const insertStmt = db.prepare(`
    INSERT INTO pvz_plants (
      codename, numericId, name, englishName, image, world,
      familyCode, familyName, familyIcon, summary, path, isCustom,
      sunCost, recharge, toughness, damage, range, introduction, chat,
      ability, traits, wikiFull, sortOrder
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // 撞名对照含全部本地条目（官方 + 自建）：云端代号与任何本地代号撞名都跳过
  const localCodes = localOfficialCodes()
  const allCodes = new Set(
    (db.prepare('SELECT codename FROM pvz_plants').all() as Array<{ codename: string }>).map(
      (r) => r.codename,
    ),
  )
  const maxOrder = (
    db.prepare('SELECT COALESCE(MAX(sortOrder), 0) AS m FROM pvz_plants').get() as { m: number }
  ).m

  // ---- 阶段一：网络与文件（无 DB 写入，失败即整体中止） ----
  interface PendingRow {
    code: string
    entity: any
    detail: PlantEditData
    imageUrl: string
    iconUrl: string
    order: number
  }
  const pending: PendingRow[] = []
  const skipped: string[] = []
  let nextOrder = maxOrder + 1

  for (const code of add) {
    // 已存在的官方条目：正常"无需新增"，静默跳过
    if (localCodes.has(code)) continue
    // 与任何本地条目（含用户自建）撞名：跳过并报告，不再报错卡死
    if (allCodes.has(code)) {
      if (!skipped.includes(code)) skipped.push(code)
      continue
    }
    const entity = cloud.entities.find((item) => item.codename === code)
    if (!entity) continue
    const detail = buildDetail(entity, cloud.almanac[code], cloud.props[code])

    // 云 URL → 本地规范 URL + 落图（失败只降级为空图，不阻断数据更新）
    const img = cloudImageToLocal(String(entity.image ?? ''))
    let imageUrl = ''
    if (img) {
      const buf = await fetchBuffer(`${CLOUD_BASE}${entity.image}`)
      if (buf) {
        mkdirSync(CARD_DIR, { recursive: true })
        writeFileSync(join(CARD_DIR, img.file), buf)
        imageUrl = img.url
      }
    }
    let iconUrl = ''
    const icon = cloudIconToLocal(String(entity.family?.icon ?? ''))
    if (icon) {
      const buf = await fetchBuffer(`${CLOUD_BASE}${entity.family?.icon}`)
      if (buf) {
        mkdirSync(ICON_DIR, { recursive: true })
        writeFileSync(join(ICON_DIR, icon.file), buf)
        iconUrl = icon.url
      }
    }

    pending.push({
      code,
      entity,
      detail,
      imageUrl,
      iconUrl,
      order: nextOrder++,
    })
    // 加入 allCodes：同一次批量里重复出现的代号也会被跳过
    allCodes.add(code)
  }

  // ---- 阶段二：单事务写库（INSERT + DELETE 原子提交，失败整体回滚） ----
  const tx = db.transaction(() => {
    for (const row of pending) {
      insertStmt.run(
        row.code,
        row.entity.numericId ?? 0,
        row.entity.name ?? '',
        row.entity.englishName ?? '',
        row.imageUrl,
        row.entity.world ?? '',
        row.entity.family?.code ?? '',
        row.entity.family?.name ?? '',
        row.iconUrl,
        row.entity.summary ?? '',
        row.entity.path ?? '',
        row.detail.sunCost,
        row.detail.recharge,
        row.detail.toughness,
        row.detail.damage,
        row.detail.range,
        row.detail.introduction,
        row.detail.chat,
        JSON.stringify(row.detail.ability ?? []),
        JSON.stringify(row.detail.traits ?? []),
        // wikiFull：云端条目不走高清立绘通道（用户在界面自行上传后才有值）
        null,
        row.order,
      )
    }
    if (remove.length > 0) {
      const delStmt = db.prepare('DELETE FROM pvz_plants WHERE codename = ? AND isCustom = 0')
      for (const code of remove) delStmt.run(code)
    }
  })
  tx()

  return {
    added: pending.length,
    removed: remove.length,
    skipped,
  }
}
