export const fightingMechanics = [
    {
        name: '呼吸法',
        desc: '正面状态 下次造成伤害时获得X*2.5%的暴击率...',
        type: '正面状态',
        hasParam: true,
        format: { textDecoration: 'underline', textDecorationStyle: 'thick', color: '#747474' }
    },
    {
        name: '破防',
        desc: '负面状态 受到物理伤害以外的伤害时...（"物理伤害"有单下划线）',
        type: '负面状态',
        hasParam: true,
        format: { color: '#808080' }
    },
    {
        name: '倒地',
        desc: '反应 元素增幅 破防；（"元素增幅"有单下划线）',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#808080' }
    },
    {
        name: '击飞',
        desc: '反应 元素增幅 破防；（"元素增幅"有单下划线）',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#808080' }
    },
    {
        name: '碎甲',
        desc: '反应 元素增幅 破防；（"元素增幅"有单下划线）',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#808080' }
    },
    {
        name: '猛击',
        desc: '反应 元素增幅 破防；（"元素增幅"有单下划线）',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#808080' }
    },
    {
        name: '战栗',
        desc: '负面状态 下X张近战卡牌若速度小于拼点目标则必投出最小值',
        type: '负面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '独一',
        desc: '标记 卡组内所有卡牌互不重名',
        type: '标记',
        format: { color: '#FF0000' }
    },
    {
        name: '剑刃解禁',
        desc: '中立状态 已累计使用X张不同卡牌，达到8层时转化为剑刃解放',
        type: '中立状态',
        hasParam: true,
        format: { color: '#0F4761' }
    },
    {
        name: '剑刃解放',
        desc: '正面状态 所有骰子威力+1',
        type: '正面状态',
        format: { color: '#0F4761' }
    },
    {
        name: '弱点解析',
        desc: '负面状态 该回合使随机1个抗性为0.5~1.0的攻击类型受到的伤害+1',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF8000' }
    },
    {
        name: '弱点攻击',
        desc: '正面状态 该回合自身造成伤害时...',
        type: '正面状态',
        format: { color: '#00B0F0' }
    },
    {
        name: '[追击]',
        desc: '中立状态 满足条件后，使用【特定卡牌】发起单方面攻击...',
        type: '中立状态',
        format: { color: '#000000' }
    },
    {
        name: '[连击]',
        desc: '中立状态 满足条件后，使用【特定卡牌】造成的伤害x1.1...',
        type: '中立状态',
        format: { color: '#000000' }
    },
    {
        name: '援护攻击',
        desc: '中立状态 本回合内X次，选定1个目标...',
        type: '中立状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '援护防御',
        desc: '中立状态 本回合内X次，友方单位受到单方面攻击...',
        type: '中立状态',
        hasParam: true,
        format: { color: '#000000' }
    }
]