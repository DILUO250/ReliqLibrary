export const fireMechanics = [
    {
        name: '烧伤',
        desc: '负面状态 每一回合结束时承受X点伤害，随后将该层数减至2/3',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#FFC000' }
    },
    {
        name: '灼燃',
        desc: '负面状态 受到攻击时追加X点火元素伤害并将该层数减至2/3；元素爆发后受到20点法术伤害，并获得2层法术易损直至元素爆发结束',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#FF6E01' }
    },
    {
        name: '灼燃爆发',
        desc: '反应 元素增幅 灼燃；命中时追加10点火元素伤害',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF6E01' }
    },
    {
        name: '融化',
        desc: '反应 元素反应 霜寒，使本次攻击伤害x2',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#41E6F7' }
    },
    {
        name: '点燃',
        desc: '反应 元素反应 草种，使本次攻击额外施加10层烧伤',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF0605' }
    },
    {
        name: '烈绽放',
        desc: '反应 元素反应 草原核，使本次攻击追加(骰子基础值)点草元素伤害',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF2323' }
    },
    {
        name: '引燃',
        desc: '负面状态 这回合结束时若受到烧伤伤害则追加(烧伤的层数/2)点混乱伤害',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '预燃',
        desc: '负面状态 这一回合命中目标时施加X层烧伤，结束时烧伤额外结算X次',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '星火',
        desc: '负面状态 若在X回合内陷入混乱，则对所有己方单位施加(自身烧伤层数/2)层烧伤',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '灼伤',
        desc: '负面状态 与火属性异常状态共同存在，造成的近战伤害x 0.5',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '火海',
        desc: '[场地] [叠加] 每回合结束时，火属性以外的单位被施加3层烧伤，额外受到体力上限12.5%的火属性伤害，并且烧伤层数不会减少',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '大晴天',
        desc: '[天气] 火属性卡牌造成的伤害x1.5，水属性卡牌造成的伤害x0.5；所有单位被施加的火属性异常状态层数+1，水属性异常状态层数-1，冰属性异常状态层数-2',
        type: '天气',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '欧米伽日照',
        desc: '[天气] 特殊大晴天；火属性卡牌造成的伤害x1.5，水属性卡牌造成的伤害x0；所有单位被施加的火属性异常状态层数+1，水属性异常状态固定为0，冰属性异常状态固定为0',
        type: '天气',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '浸油',
        desc: '负面状态 被施加烧伤时，使所有带有浸油的己方单位消耗自身的浸油层数获得等量的烧伤',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#DCD2A0' }
    },
    {
        name: '助燃火药',
        desc: '负面状态 受到烧伤伤害时，额外受到(X*烧伤层数)点烧伤伤害',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#747474' }
    },
    {
        name: '狂怒',
        desc: '正面状态 X回合内，造成的伤害+X*2',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EE0000' }
    }
]