export const groundMechanics = [
    {
        name: '撒菱',
        desc: '[场地] [单向] [常驻] 最多5层；替换出场的单位会受到X*12点伤害',
        type: '场地',
        hasParam: true,
        format: { color: '#990033' }
    },
    {
        name: '缓慢',
        desc: '负面状态 这一回合每被攻击1次则受到的最终伤害+2%',
        type: '负面状态',
        format: { color: '#915121' }
    },
    {
        name: '自然',
        desc: '负面状态 受到攻击时追加Y点地面元素伤害...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#C9E367' }
    },
    {
        name: '腐蚀',
        desc: '负面状态 每一回合开始时承受X点伤害随后将该层数-1...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#3A7C22' }
    }
]