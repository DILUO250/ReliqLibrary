export const poisonMechanics = [
    {
        name: '毒液',
        desc: '负面状态 受到 毒液爆发 时受到X点伤害并将该层数减至2/3',
        type: '负面状态',
        hasParam: true,
        format: { color: '#70AD47' }
    },
    {
        name: '毒药瓶',
        desc: '正面状态 获取时，令卡组内至少X张战斗卡牌被附加毒药瓶...',
        type: '正面状态',
        hasParam: true,
        format: { color: '#70AD47' }
    },
    {
        name: '尸爆术',
        desc: '负面状态 若持有者阵亡时带有毒液...',
        type: '负面状态',
        format: { color: '#70AD47' }
    },
    {
        name: '中毒',
        desc: '负面状态 与毒属性异常状态共存；每回合开始时受到7点毒属性伤害',
        type: '负面状态',
        format: { color: '#70AD47' }
    },
    {
        name: '剧毒',
        desc: '负面状态 与毒属性异常状态共存；第1回合开始时受到4点毒属性伤害...',
        type: '负面状态',
        format: { color: '#7030A0' }
    },
    {
        name: '毒菱',
        desc: '[场地] [单向] [常驻] 最多3层；替换出场的单位会被施加4层毒液',
        type: '场地',
        hasParam: true,
        format: { color: '#7030A0' }
    },
    {
        name: '猩红腐败',
        desc: '负面状态 受到攻击时追加Y点毒元素伤害...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#FF0000' }
    }
]