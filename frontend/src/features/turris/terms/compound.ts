/**
 * 专项基础状态（合成词条）设定层。
 *
 * 合成词 = 词缀 + 词根：
 * - 词缀：库内「机制类状态」「基础骰子」分区的全部词条（运行时动态取，本文件不持有名单）；
 * - 词根：库内「基础状态」分区的词条；
 * - 渲染格式一律取词根词条的 format（词根改格式，所有合成词自动跟随）。
 *
 * 本文件只持有轴清单与说明文案模板，属展示层常量（同 BATTLE_SYSTEMS 先例）。
 * 合成词不落库、不出现在词典页与卡牌编辑器下拉；库内显式词条永远优先于组合解析。
 */

export type AffixKind = 'mech' | 'dice'

export interface AffixCandidate {
  /** baseKey 归一后的词缀键（去参数后缀/连字符/空白）。 */
  key: string
  kind: AffixKind
}

/** 机制类词缀可组合的基础轴（10 对，对照「烧伤」示例）。 */
export const MECH_AXES: string[] = [
  '易损',
  '守护',
  '易伤',
  '坚硬',
  '脆弱',
  '振奋',
  '拼点虚弱',
  '拼点强壮',
  '伤害弱化',
  '伤害强化',
  '爆伤弱化',
  '爆伤强化',
  '无力',
  '力量',
  '虚弱',
  '强壮',
  '破绽',
  '忍耐',
  '状态虚弱',
  '状态增强',
]

/** 骰子类词缀可组合的基础轴（8 对，对照「斩击」示例；所有骰子统一占位）。 */
export const DICE_AXES: string[] = [
  '易损',
  '守护',
  '易伤',
  '坚硬',
  '脆弱',
  '振奋',
  '拼点虚弱',
  '拼点强壮',
  '伤害弱化',
  '伤害强化',
  '爆伤弱化',
  '爆伤强化',
  '无力',
  '力量',
  '虚弱',
  '强壮',
]

const PARAM_SUFFIX = /\s*X(层|点|次|颗|滴|回合|级|张|时|年|月|日)\s*$/

/** 词条名去掉参数后缀 → 词缀显示名（保留连字符与空格原貌，如「震颤-崩坏」「凋亡」）。 */
export function affixDisplayName(name: string): string {
  return name.trim().replace(PARAM_SUFFIX, '')
}

/** 合成词显示名（含参数位），用于插入面板按钮文案。 */
export function compoundName(affix: string, root: string): string {
  return `${affix}${root} X层`
}

/** 插入文本：引号内为词缀+词根本体，参数位在引号外（与实卡文案「施加3层“易损”」的写法一致）。 */
export function compoundInsertText(affix: string, root: string): string {
  return `“${affix}${root}” X层`
}

/** 机制类说明模板：{A} = 词缀。 */
const MECH_TEMPLATES: Record<string, string> = {
  易损: '这一回合受到的“{A}”伤害+X*10%',
  守护: '这一回合受到的“{A}”伤害-X*10%',
  易伤: '这一回合受到的“{A}”伤害+X',
  坚硬: '这一回合受到的“{A}”伤害-X',
  脆弱: '这一回合受到的“{A}”混乱伤害+X*10%',
  振奋: '这一回合受到的“{A}”混乱伤害-X*10%',
  拼点虚弱: '“{A}”卡牌计算拼点点数时-X，不影响攻击伤害',
  拼点强壮: '“{A}”卡牌计算拼点点数时+X，不影响攻击伤害',
  伤害弱化: '这一回合中“{A}”卡牌的“进攻型”骰子伤害-X*10%',
  伤害强化: '这一回合中“{A}”卡牌的“进攻型”骰子伤害+X*10%',
  爆伤弱化: '这一回合中“{A}”卡牌暴击造成的伤害-X*12.5%',
  爆伤强化: '这一回合中“{A}”卡牌暴击造成的伤害+X*12.5%',
  无力: '这一回合中“{A}”卡牌的“进攻型”骰子伤害-X',
  力量: '这一回合中“{A}”卡牌的“进攻型”骰子伤害+X',
  虚弱: '这一回合中“{A}”卡牌的“进攻型”骰子威力-X',
  强壮: '这一回合中“{A}”卡牌的“进攻型”骰子威力+X',
  破绽: '这一回合中“{A}”卡牌的“防御型”骰子威力-X',
  忍耐: '这一回合中“{A}”卡牌的“防御型”骰子威力+X',
  状态虚弱: '这一回合施加的“{A}”层数-X',
  状态增强: '这一回合施加的“{A}”层数+X',
}

/** 骰子类说明模板：{A} = 词缀。 */
const DICE_TEMPLATES: Record<string, string> = {
  易损: '这一回合受到的{A}伤害+X*10%',
  守护: '这一回合受到的{A}伤害-X*10%',
  易伤: '这一回合受到的{A}伤害+X',
  坚硬: '这一回合受到的{A}伤害-X',
  脆弱: '这一回合受到的{A}混乱伤害+X*10%',
  振奋: '这一回合受到的{A}混乱伤害-X*10%',
  拼点虚弱: '{A}骰子计算拼点点数时-X，不影响攻击伤害',
  拼点强壮: '{A}骰子计算拼点点数时+X，不影响攻击伤害',
  伤害弱化: '这一回合中{A}型骰子伤害-X*10%',
  伤害强化: '这一回合中{A}型骰子伤害+X*10%',
  爆伤弱化: '这一回合中{A}骰子暴击造成的伤害-X*12.5%',
  爆伤强化: '这一回合中{A}骰子暴击造成的伤害+X*12.5%',
  无力: '这一回合中{A}骰子的伤害-X',
  力量: '这一回合中{A}骰子的伤害+X',
  虚弱: '这一回合中{A}骰子的威力-X',
  强壮: '这一回合中{A}骰子的威力+X',
}

/** 合成词说明文案：机制类用「“词缀”」措辞，骰子类用「词缀骰子」措辞。 */
export function compoundDesc(kind: AffixKind, affix: string, root: string): string {
  const tpl = (kind === 'mech' ? MECH_TEMPLATES : DICE_TEMPLATES)[root]
  return tpl ? tpl.split('{A}').join(affix) : ''
}

/**
 * 组合匹配：从归一键中按最长词缀前缀拆出词根。
 * 词根须在该词缀类型的轴清单内、且存在于词根表（rootExists）；两词缀互为前缀时长键优先。
 */
export function matchCompound(
  key: string,
  affixes: readonly AffixCandidate[],
  rootExists: (root: string) => boolean,
): { kind: AffixKind; root: string } | undefined {
  for (const a of affixes) {
    if (!a.key || key.length <= a.key.length || !key.startsWith(a.key)) continue
    const rest = key.slice(a.key.length)
    const axes = a.kind === 'mech' ? MECH_AXES : DICE_AXES
    if (axes.includes(rest) && rootExists(rest)) {
      return { kind: a.kind, root: rest }
    }
  }
  return undefined
}
