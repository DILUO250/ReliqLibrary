import { parse } from '@babel/parser'
import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb } from '../../db/index.js'

const CLOUD_BASE = 'https://pvzge.com'
// 云端植物图落地到 card/ 子目录 —— 必须与前端 pvzImagePath 的映射
// （/assets/image/plants/<file> → assets/image/plants/card/<file>）保持一致，
// 否则同步进来的植物在图鉴网格中会 404。
const IMAGE_DIR = fileURLToPath(
  new URL('../../../frontend/public/features/armarium/projects/pvzwiki/assets/image/plants/card', import.meta.url),
)

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
  family: string | null
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

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`fetch ${url} failed: ${response.status}`)
  return response.text()
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
    family: entity.family?.name ?? null,
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
export async function pvzSyncApply(add: string[], remove: string[]): Promise<{ added: number; removed: number }> {
  const cloud = await collectCloud()
  const db = getDb()

  const insertStmt = db.prepare(`
    INSERT INTO pvz_plants (
      codename, numericId, name, englishName, image, world,
      familyCode, familyName, familyIcon, summary, path, isCustom,
      sunCost, recharge, toughness, damage, range, family, introduction, chat,
      ability, traits, wikiFull, wikiThumb, sortOrder
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)
  `)

  const localCodes = localOfficialCodes()
  const maxOrder = (
    db.prepare('SELECT COALESCE(MAX(sortOrder), 0) AS m FROM pvz_plants').get() as { m: number }
  ).m

  let added = 0
  let nextOrder = maxOrder + 1
  for (const code of add) {
    if (localCodes.has(code)) continue
    const entity = cloud.entities.find((item) => item.codename === code)
    if (!entity) continue
    const detail = buildDetail(entity, cloud.almanac[code], cloud.props[code])
    insertStmt.run(
      code,
      entity.numericId ?? 0,
      entity.name ?? '',
      entity.englishName ?? '',
      entity.image ?? '',
      entity.world ?? '',
      entity.family?.code ?? '',
      entity.family?.name ?? '',
      entity.family?.icon ?? '',
      entity.summary ?? '',
      entity.path ?? '',
      detail.sunCost,
      detail.recharge,
      detail.toughness,
      detail.damage,
      detail.range,
      detail.family,
      detail.introduction,
      detail.chat,
      JSON.stringify(detail.ability ?? []),
      JSON.stringify(detail.traits ?? []),
      nextOrder++,
    )
    if (entity.image) {
      try {
        const response = await fetch(`${CLOUD_BASE}${entity.image}`)
        if (response.ok) {
          mkdirSync(IMAGE_DIR, { recursive: true })
          writeFileSync(join(IMAGE_DIR, basename(entity.image)), Buffer.from(await response.arrayBuffer()))
        }
      } catch {
        // Image download failure does not invalidate the data update.
      }
    }
    added++
  }

  let removed = 0
  if (remove.length > 0) {
    const delStmt = db.prepare('DELETE FROM pvz_plants WHERE codename = ? AND isCustom = 0')
    for (const code of remove) {
      const info = delStmt.run(code)
      removed += info.changes
    }
  }
  return { added, removed }
}
