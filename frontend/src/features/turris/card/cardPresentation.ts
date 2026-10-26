export type EffectPresentation = {
  kind: 'standard' | 'threshold' | 'stack'
  trigger: string
  content: string
}

/** 已知的使用时机词（来自全库效果首段统计）。时机词是有限集合，只按白名单精确匹配，
 *  绝不做“第一个空格前”的猜测式切分——否则正文中嵌套效果里的空格（如
 *  “获得‘使用时 恢复2点光芒’”）会把长句切进时机栏，撑坏卡面并吞掉后半段。 */
const TRIGGER_WORDS = new Set([
  '命中时',
  '使用时',
  '使用前',
  '使用后',
  '首次使用后',
  '装备时',
  '装备后',
  '丢弃时',
  '入手时',
  '抽取时',
  '拼点时',
  '拼点胜利',
  '拼点成功',
  '拼点失败',
  '战斗开始',
  '战斗结束',
  '每回合结束时',
  '暴击命中时',
  '最大值命中时',
  '最小值命中时',
  '单方面攻击-命中时',
  '单方面攻击',
  '斩杀时',
  '斩杀时/击晕时',
  '击晕时/斩杀时',
  '使用时/丢弃时',
  '投出最大值',
  '光芒恢复至上限',
  '被使用',
  '未被使用',
  '未被摧毁',
  '能力',
  '多重攻击1',
  '多重攻击2',
  '多重攻击3',
])

/** 只拆分展示，不回写文本，也不参与战斗语义。 */
export function presentEffect(source: string): EffectPresentation {
  const text = source.trim()
  if (text.startsWith('-')) {
    const content = text.replace(/^-\s*/, '')
    return {
      kind: text.startsWith('- 若') ? 'threshold' : 'stack',
      trigger: text.startsWith('- 若') ? '阈值增幅' : '层数增幅',
      content,
    }
  }
  const match = text.match(/^(\S+)[ \u3000]+([\s\S]+)$/)
  const trigger = match?.[1] ?? ''
  if (!match || !TRIGGER_WORDS.has(trigger)) {
    // 不在白名单里就不拆：正文完整保留（时机栏留空），词条渲染不受影响。
    return { kind: 'standard', trigger: '', content: text }
  }
  return { kind: 'standard', trigger, content: match[2] ?? '' }
}

const SPECIAL_PREFIXES: Record<string, string> = {
  'V.': 'relic',
  'EGO.': 'ego',
  'DST.': 'dst',
  'SHM.': 'shm',
  'DEF.': 'def',
}

const TYPE_CLASSES: Record<string, string> = {
  近战: 'melee',
  远程: 'ranged',
  法术: 'spell',
  先制近战: 'preempt',
  能力: 'ability',
  守备: 'guard',
  群体攻击: 'aoe',
  装备: 'equip',
  变化: 'change',
  状态: 'status',
  诅咒: 'curse',
}

export function cardVisualClass(prefix: string | undefined, type: string): { special: string; typeClass: string; light: boolean } {
  const special = SPECIAL_PREFIXES[prefix?.trim() ?? ''] ?? ''
  const typeClass = TYPE_CLASSES[type] ?? 'melee'
  return { special, typeClass, light: special === 'shm' || (!special && typeClass !== 'curse') }
}

export function typeIcon(type: string): string {
  return TYPE_CLASSES[type] ?? 'melee'
}

export function dieIcon(baseType: string): string {
  return ({ 斩击: 'slash', 突刺: 'pierce', 打击: 'blunt', 招架: 'block', 闪避: 'evade' } as Record<string, string>)[baseType] ?? 'slash'
}
