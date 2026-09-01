export const iceMechanics = [
    {
        name: '白雾',
        desc: '[场地] [单向] [叠加] 不会被施加负面基础异常',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#0070C0' }
    },
    {
        name: '极光回合',
        desc: '[场地] [单向] [叠加] 所有单位受到的伤害x0.5',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#0070C0' }
    },
    {
        name: '下雪天',
        desc: '[天气] 所有单位被施加的冰属性异常状态层数+1；冰属性的单位受到的攻击伤害x0.5',
        type: '天气',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#0070C0' }
    },
    {
        name: '冰雹天',
        desc: '[天气] 所有单位被施加的冰属性异常状态层数+1；每回合结束时，冰属性以外的单位受到体力上限6.25%的真实伤害',
        type: '天气',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#0070C0' }
    },
    {
        name: '寒冷',
        desc: '负面状态 每一回合开始时速度骰子数值-X(不小于1) 并将该层数减至2/3，若已达到1则受到X/2点伤害；层数达到24层时转化为冰冻',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#0070C0' }
    },
    {
        name: '冰冻',
        desc: '负面状态 2~4回合内无法行动，所有伤害抗性-0.5',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#0070C0' }
    },
    {
        name: '霜寒',
        desc: '负面状态 受到攻击时追加X点冰元素伤害并将该层数减至2/3；元素爆发后受到25点物理伤害，并使所有速度值固定为1直至元素爆发结束',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#1AC7CC' }
    },
    {
        name: '霜寒爆发',
        desc: '反应 元素增幅 霜寒；命中时追加10点冰属性伤害',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#1AC7CC' }
    },
    {
        name: '超导',
        desc: '反应 元素反应 电磁，使本次攻击容量+2',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#B657FE' }
    },
    {
        name: '碎冰',
        desc: '反应 元素反应 冰冻，使本次攻击伤害x3',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#41E6F7' }
    }
]