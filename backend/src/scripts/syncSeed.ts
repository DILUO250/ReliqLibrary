/**
 * 库 → 种子 反向同步（CONVENTIONS §1.1：种子与库不一致时，以库为准重建种子）。
 *
 * 范围（附加单位 + 情感实体，即迎书楼的可精修数据）：
 *  - 5 个附加单位（librarians 中 rarity <> ''）的 sheet 常量 + portrait/portraitPreview
 *  - 2 个情感实体（emotion_entities）的 sheet 常量
 *
 * 说明：只同步 sheet 与立绘路径；条目的 name/title/affiliation/description 等
 * 文本字段假定与种子一致，不做覆盖（如需调整请直接编辑种子）。
 * 幂等：重复运行，内容一致时为 no-op。
 * 原子性：全部替换成功才写盘；任一定位失败则抛错且不写文件。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { getDb, closeDb } from '../db/index.js'

const SEED_PATH = new URL('../seed/data.ts', import.meta.url)

interface Row {
  id: number
  name: string
  rarity: string
  title: string
  affiliation: string
  status: string
  description: string
  sheet: string
  portrait: string
  portraitPreview: string
  sortOrder: number
}

interface EntityRow {
  id: number
  floorId: number | null
  code: string
  name: string
  sheet: string
  sortOrder: number
}

/** 库行 → sheet 常量名 的映射（name|rarity 为键）。 */
const SHEET_CONST_BY_LIBRARIAN: Record<string, string> = {
  '哭泣之子|SR': 'cryingChildSheet',
  '堕落的阿米蕾戴|RR': 'amiradeSheet',
  '红焰蛾|RR': 'redMothSheet',
  '玫瑰猎人|RR': 'roseHunterSheet',
  '焦化少女|RR': 'scorchGirlExtraSheet',
  '同化 - 歌唱机|RR': 'ct2SingerSheet',
  '同化 - 魔弹射手|RR': 'ct2MagicBulletSheet',
  "同化 - 四百朵玫瑰|RR": "ct3RR01Sheet",
  "侵蚀 - 蜘蛛巢|RR": "ct3RR02Sheet",
  "侵蚀 - 陆行珍珠|RR": "ct3RR03Sheet",
  "发芽的花朵|RR": "ct3RR04Sheet",
  "同化 - 受缚之王|RR": "ct4RR01Sheet",
  "侵蚀 - 流浪狐狸|RR": "ct4RR02Sheet",
  "侵蚀 - 面壁女|RR": "ct4RR03Sheet",
  "小王子的朋友|RR": "ct4RR04Sheet",
}
const SHEET_CONST_BY_ENTITY: Record<string, string> = {
  焦化少女: 'scorchGirlSheet',
  欢乐泰迪: 'teddySheet',
  精灵盛宴: 'fairyFeastSheet',
  蜂后: 'beeQueenSheet',
  白雪公主的苹果: 'snowWhiteAppleSheet',
  美女和野兽: 'beautyAndBeastSheet',
  裸巢: 'bareNestSheet',
  炎雀: 'flameSparrowSheet',
  波迪: 'bodySheet',
  黑檀女王的苹果: 'ebonyQueenAppleSheet',
  红焰蛾: 'redMothEmotionSheet',
  绅士精灵: 'gentlemanFairySheet',
  长腿精灵: 'longLegFairySheet',
  精灵提灯: 'fairyLanternSheet',
  媞坦妮娅: 'titaniaSheet',
  涌来的灰: 'comingAshSheet',
  堕落的阿米蕾戴: 'amiradeEmotionSheet',
  玫瑰猎人: 'roseHunterEmotionSheet',
  结婚蜘蛛: 'marriageSpiderSheet',
  被遗弃的杀人魔: 'ct2Entity01Sheet',
  小帮手: 'ct2Entity02Sheet',
  歌唱机: 'ct2Entity03Sheet',
  亡蝶葬仪: 'ct2Entity04Sheet',
  魔弹射手: 'ct2Entity05Sheet',
  我们可以改变一切: 'ct2Entity06Sheet',
  你必须要幸福: 'ct2Entity07Sheet',
  荧光手镯: 'ct2Entity08Sheet',
  次元衍射变体: 'ct2Entity09Sheet',
  '1.76兆赫': 'ct2Entity10Sheet',
  畸形氧化变体: 'ct2Entity11Sheet',
  迷失的乘客: 'ct2Entity12Sheet',
  巷头恶犬: 'ct2Entity13Sheet',
  电击蜈蚣: 'ct2Entity14Sheet',
  梦中的电子羊: 'ct2Entity15Sheet',
  行为矫正仪: 'ct2Entity16Sheet',
  无所不做: 'ct2Entity17Sheet',
  'kqe-1j-23': 'ct2Entity18Sheet',
  次元轨道稳定器: 'ct2Entity19Sheet',
  亡蝶面试者: 'ct2Entity20Sheet',
  "今天也很害羞": "ct3Entity01Sheet",
  "红舞鞋": "ct3Entity02Sheet",
  "蜘蛛巢": "ct3Entity03Sheet",
  "蕾蒂希娅": "ct3Entity04Sheet",
  "黑天鹅之梦": "ct3Entity05Sheet",
  "特蕾西娅": "ct3Entity06Sheet",
  "粉红鞋": "ct3Entity07Sheet",
  "痛苦泰迪": "ct3Entity08Sheet",
  "陆生鮟鱇": "ct3Entity09Sheet",
  "四百朵玫瑰": "ct3Entity10Sheet",
  "陆行珍珠": "ct3Entity11Sheet",
  "浸染棉花": "ct3Entity12Sheet",
  "悔罪少女": "ct3Entity13Sheet",
  "轻蔑螺旋": "ct3Entity14Sheet",
  "明天也很害羞": "ct3Entity15Sheet",
  "陪我玩吧": "ct3Entity16Sheet",
  "断首鱼": "ct3Entity17Sheet",
  "诺里诺里": "ct3Entity18Sheet",
  "点头之交": "ct3Entity19Sheet",
  "冠汤翼蜥": "ct3Entity20Sheet",
  "宇宙碎片": "ct4Entity01Sheet",
  "银河之子": "ct4Entity02Sheet",
  "棘刺公交": "ct4Entity03Sheet",
  "爱娜温": "ct4Entity04Sheet",
  "沉默乐团": "ct4Entity05Sheet",
  "流浪狐狸": "ct4Entity06Sheet",
  "悲泣蟾蜍": "ct4Entity07Sheet",
  "某日的肖像": "ct4Entity08Sheet",
  "噬梦的洋流": "ct4Entity09Sheet",
  "小王子": "ct4Entity10Sheet",
  "无名怪婴": "ct4Entity11Sheet",
  "面壁女": "ct4Entity12Sheet",
  "百足使徒": "ct4Entity13Sheet",
  "皮格马利翁": "ct4Entity14Sheet",
  "晚霞旅客": "ct4Entity15Sheet",
  "让我们一起歌唱": "ct4Entity16Sheet",
  "瓶中孩童": "ct4Entity17Sheet",
  "某人的肖像": "ct4Entity18Sheet",
  "酒鬼": "ct4Entity19Sheet",
  "受缚之王": "ct4Entity20Sheet",
}

function main(): void {
  const db = getDb()
  const extras = db
    .prepare(`SELECT * FROM librarians WHERE rarity <> '' ORDER BY sortOrder`)
    .all() as unknown as Row[]
  const entities = db.prepare(`SELECT * FROM emotion_entities ORDER BY sortOrder`).all() as unknown as EntityRow[]
  closeDb()

  let src = readFileSync(SEED_PATH, 'utf8')
  const changes: string[] = []

  /* ---------- 1. sheet 常量 → 库中 JSON 字符串 ---------- */
  for (const row of [...extras, ...entities.map((e) => ({ ...e, rarity: '' }))]) {
    const cname = row.rarity
      ? SHEET_CONST_BY_LIBRARIAN[`${row.name}|${row.rarity}`]
      : SHEET_CONST_BY_ENTITY[row.name]
    if (!cname) throw new Error(`未映射的库行：${row.name}(${row.rarity})`)
    // 旧形态：多行 JSON.stringify({...}) 对象字面量；新形态：单行字符串字面量（幂等重跑）
    const re = new RegExp(
      `const ${cname} = (?:JSON\\.stringify\\(\\{[\\s\\S]*?\\n\\}\\);?|"(?:[^"\\\\]|\\\\.)*");?`,
    )
    if (!re.test(src)) throw new Error(`种子中未找到常量 ${cname}`)
    const line = `const ${cname} = ${JSON.stringify(row.sheet)};`
    src = src.replace(re, line)
    changes.push(`const ${cname} ← 库(${row.name}${row.rarity ? '|' + row.rarity : ''})`)
  }

  /* ---------- 2. 附加单位条目的立绘路径 ---------- */
  for (const row of extras) {
    const cname = SHEET_CONST_BY_LIBRARIAN[`${row.name}|${row.rarity}`]
    // 行尾兼容 CRLF/LF，替换时沿用文件原有风格
    const anchorRe = new RegExp(
      `sheet: ${cname},(\\r?\\n)      portrait: "([^"]*)",(\\r?\\n)      portraitPreview: "([^"]*)",`,
    )
    const m = anchorRe.exec(src)
    if (!m) throw new Error(`种子中未找到立绘锚点：${row.name}`)
    const nl = m[1] ?? '\n'
    const next = `sheet: ${cname},${nl}      portrait: "${row.portrait}",${nl}      portraitPreview: "${row.portraitPreview}",`
    if (m[0] !== next) {
      src = src.replace(anchorRe, next)
      changes.push(`立绘 ← 库(${row.name})`)
    }
  }

  /* ---------- 3. 附加单位条目的 sortOrder ---------- */
  for (const row of extras) {
    const cname = SHEET_CONST_BY_LIBRARIAN[`${row.name}|${row.rarity}`]
    const sortRe = new RegExp(`(sheet: ${cname},[\\s\\S]*?sortOrder: )(\\d+)(,)`)
    const m = sortRe.exec(src)
    if (!m) throw new Error(`种子中未找到 sortOrder 锚点：${row.name}`)
    if (m[2] !== String(row.sortOrder)) {
      src = src.replace(sortRe, `$1${row.sortOrder}$3`)
      changes.push(`sortOrder ← 库(${row.name})：${m[2]} → ${row.sortOrder}`)
    }
  }

  writeFileSync(SEED_PATH, src, 'utf8')
  console.log(`已回写 ${SEED_PATH.pathname}`)
  for (const c of changes) console.log('  ✓', c)
  console.log(`共 ${changes.length} 处同步。`)
}

main()
