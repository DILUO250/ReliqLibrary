// 一次性导入脚本：把 PVZ 百科的 7 个数据源展平落库为 SQLite。
// 数据血缘（优先级从低到高）：
//   plants.json（pvzge 上游条目） ← plant-full-images.json（wiki 图路径）
//   ← plant-details.json（pvzge 上游详情） ← overrides.json（手工精修层）
//   ← pvz-user-edits.json（编辑器运行时修改，最高优先）
//   pvz-custom-plants.json（自建植物，isCustom=1）
// 展平落库值 = 当前页面显示值；源 JSON 保留作种子源，三层原值可随时找回。
import { closeDb, getDb } from '../db/index.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const FRONTEND_DATA_DIR = fileURLToPath(
  new URL('../../../frontend/src/features/armarium/projects/pvzwiki/data', import.meta.url),
)

function readJson(dir: string, name: string): any {
  return JSON.parse(readFileSync(join(dir, name), 'utf8'))
}

function pickDefined<T>(...layers: Array<T | undefined | null>): T | null {
  for (const layer of layers) {
    if (layer !== undefined && layer !== null) return layer
  }
  return null
}

function main(): void {
  const plantsRaw = readJson(FRONTEND_DATA_DIR, 'plants.json')
  const details = readJson(FRONTEND_DATA_DIR, 'plant-details.json')
  const overrides = readJson(FRONTEND_DATA_DIR, 'overrides.json')
  const fullImages = readJson(FRONTEND_DATA_DIR, 'plant-full-images.json')
  const keywords = readJson(FRONTEND_DATA_DIR, 'keywords.json')
  const userEdits = readJson(FRONTEND_DATA_DIR, 'pvz-user-edits.json')
  const customPlants = readJson(FRONTEND_DATA_DIR, 'pvz-custom-plants.json')

  const db = getDb()
  db.exec('DELETE FROM pvz_plants')
  db.exec('DELETE FROM pvz_keywords')

  const stmt = db.prepare(`
    INSERT INTO pvz_plants (
      codename, numericId, name, englishName, image, world,
      familyCode, familyName, familyIcon, summary, path, isCustom,
      sunCost, recharge, toughness, damage, range, family, introduction, chat,
      ability, traits, wikiFull, wikiThumb, sortOrder
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let officialCount = 0
  let customCount = 0
  let order = 0

  const tx = db.transaction(() => {
    // 官方条目：plants.json 顺序即 sortOrder
    for (const p of plantsRaw) {
      const code = p.codename
      const detail = details[code] ?? {}
      const refined = overrides[code] ?? {}
      const edit = userEdits[code] ?? {}
      const wiki = fullImages[code] ?? {}

      stmt.run(
        code,
        p.numericId ?? 0,
        p.name ?? '',
        p.englishName ?? '',
        p.image ?? '',
        p.world ?? '',
        p.family?.code ?? '',
        p.family?.name ?? '',
        p.family?.icon ?? '',
        p.summary ?? '',
        p.path ?? '',
        0,
        pickDefined(edit.sunCost, refined.sunCost, detail.sunCost),
        pickDefined(edit.recharge, refined.recharge, detail.recharge),
        pickDefined(edit.toughness, refined.toughness, detail.toughness),
        pickDefined(edit.damage, refined.damage, detail.damage),
        pickDefined(edit.range, refined.range, detail.range),
        pickDefined(edit.family, refined.family, detail.family),
        pickDefined(edit.introduction, refined.introduction, detail.introduction),
        pickDefined(edit.chat, refined.chat, detail.chat),
        JSON.stringify(pickDefined(edit.ability, refined.ability, detail.ability) ?? []),
        JSON.stringify(pickDefined(edit.traits, refined.traits, detail.traits) ?? []),
        wiki.full ?? null,
        wiki.thumb ?? null,
        order++,
      )
      officialCount++
    }

    // 自建条目：排在官方之后；详情取运行时编辑（如有）
    for (const c of customPlants) {
      const detail = userEdits[c.codename] ?? {}
      const wiki = fullImages[c.codename] ?? {}
      stmt.run(
        c.codename,
        c.numericId ?? 0,
        c.name ?? '',
        c.englishName ?? '',
        c.image ?? '',
        c.world ?? '',
        c.family?.code ?? '',
        c.family?.name ?? '',
        c.family?.icon ?? '',
        c.summary ?? '',
        c.path ?? '',
        1,
        detail.sunCost ?? null,
        detail.recharge ?? null,
        detail.toughness ?? null,
        detail.damage ?? null,
        detail.range ?? null,
        detail.family ?? null,
        detail.introduction ?? null,
        detail.chat ?? null,
        JSON.stringify(detail.ability ?? []),
        JSON.stringify(detail.traits ?? []),
        wiki.full ?? null,
        wiki.thumb ?? null,
        order++,
      )
      customCount++
    }

    // 关键词
    const kwStmt = db.prepare('INSERT INTO pvz_keywords (id, name, description) VALUES (?, ?, ?)')
    for (const k of keywords) {
      kwStmt.run(k.id, k.name ?? '', k.description ?? '')
    }
  })
  tx()

  const total = officialCount + customCount
  closeDb()

  console.log(
    `PVZ 导入完成：官方 ${officialCount} 条，自建 ${customCount} 条，共 ${total} 条植物；关键词 ${keywords.length} 条。`,
  )
}

main()
