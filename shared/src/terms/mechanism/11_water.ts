export const waterMechanics = [
    {
        name: '彩虹',
        desc: '[场地] [单向] [叠加] 所有卡牌的增伤词条与威力词条必取到最大值',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00B0F0' }
    },
    {
        name: '下雨天',
        desc: '[天气] 水属性卡牌造成的伤害x1.5，火属性卡牌造成的伤害x0.5；所有单位被施加的水属性异常状态层数+1，火属性异常状态层数-1',
        type: '天气',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00B0F0' }
    },
    {
        name: '阿尔法暴雨',
        desc: '[天气] 特殊下雨天；水属性卡牌造成的伤害x1.5，火属性卡牌造成的伤害x0；所有单位被施加的水属性异常状态层数+2，火属性异常状态固定为0',
        type: '天气',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00B0F0' }
    },
    {
        name: '沉沦',
        desc: '负面状态 受到攻击时额外受到X点理智伤害并将该层数减至2/3；若自身没有理智槽或理智值已达到-45，则改为受到X/2点伤害',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#00B0F0' }
    },
    {
        name: '沉沦泛滥',
        desc: '立刻触发所有沉沦效果直至层数归零',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00B0F0' }
    },
    {
        name: '水蚀',
        desc: '负面状态 受到攻击时追加X点水元素伤害并将该层数减至2/3；元素爆发后受到30点物理伤害，并获得3层易损直至元素爆发结束',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#00B0F0' }
    },
    {
        name: '蒸发',
        desc: '反应 元素反应 灼燃，使本次攻击伤害x2',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FE9E59' }
    },
    {
        name: '感电',
        desc: '反应 元素反应 电磁，使所有带有电磁的敌方单位受到相同的伤害',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#C216FA' }
    },
    {
        name: '绽放',
        desc: '反应 元素增幅 草原核',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00AF0D' }
    }
]