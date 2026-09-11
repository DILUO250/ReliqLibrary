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

    // 云 URL → 本地规范 URL + 落图（失败只降级为空图，不阻断数据更新）
    const img = cloudImageToLocal(String(entity.image ?? ''))
    let imageUrl = ''
    if (img) {
      imageUrl = img.url
      try {
        const response = await fetch(`${CLOUD_BASE}${entity.image}`)
        if (response.ok) {
          mkdirSync(CARD_DIR, { recursive: true })
          writeFileSync(join(CARD_DIR, img.file), Buffer.from(await response.arrayBuffer()))
        } else {
          imageUrl = ''
        }
      } catch {
        // Image download failure does not invalidate the data update.
      }
    }
    let iconUrl = ''
    const icon = cloudIconToLocal(String(entity.family?.icon ?? ''))
    if (icon) {
      iconUrl = icon.url
      try {
        const response = await fetch(`${CLOUD_BASE}${entity.family?.icon}`)
        if (response.ok) {
          mkdirSync(ICON_DIR, { recursive: true })
          writeFileSync(join(ICON_DIR, icon.file), Buffer.from(await response.arrayBuffer()))
        } else {
          iconUrl = ''
        }
      } catch {
        // 同上：图标下载失败不影响数据行
      }
    }

    insertStmt.run(
      code,
      entity.numericId ?? 0,
      entity.name ?? '',
      entity.englishName ?? '',
      imageUrl,
      entity.world ?? '',
      entity.family?.code ?? '',
      entity.family?.name ?? '',
      iconUrl,
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
