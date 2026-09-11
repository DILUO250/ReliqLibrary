export const basicStatuses = [
    {
        name: '易损',
        desc: '这一回合中被击中时所受伤害+X*10%',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '守护',
        desc: '这一回合中被击中时所受伤害-X*10%',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '易伤',
        desc: '这一回合中被击中时所受伤害+X',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '坚硬',
        desc: '这一回合中被击中时所受伤害-X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '脆弱',
        desc: '这一回合中被击中时所受混乱伤害+X*10%',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '振奋',
        desc: '这一回合中被击中时所受混乱伤害-X*10%',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '拼点虚弱',
        desc: '计算拼点点数时-X，不影响攻击伤害',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '拼点强壮',
        desc: '计算拼点点数时+X，不影响攻击伤害',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '伤害弱化',
        desc: '这一回合中"进攻型"骰子伤害-X*10%',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '伤害强化',
        desc: '这一回合中"进攻型"骰子伤害+X*10%',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '爆伤弱化',
        desc: '这一回合中暴击造成的伤害-X*12.5%',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '爆伤强化',
        desc: '这一回合中暴击造成的伤害+X*12.5%',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '无力',
        desc: '这一回合中"进攻型"骰子伤害-X',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '力量',
        desc: '这一回合中"进攻型"骰子伤害+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '虚弱',
        desc: '这一回合中"进攻型"骰子威力-X',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '强壮',
        desc: '这一回合中"进攻型"骰子威力+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '破绽',
        desc: '这一回合中"防御型"骰子威力-X',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '忍耐',
        desc: '这一回合中"防御型"骰子威力+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '束缚',
        desc: '这一回合中速度-X',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '迅捷',
        desc: '这一回合中速度+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '状态虚弱',
        desc: '这一回合施加的异常状态层数-X',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '状态增强',
        desc: '这一回合施加的异常状态层数+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '抽牌减少',
        desc: '下X次抽牌失效',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '抽牌增加',
        desc: '下X次抽牌额外抽1张',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '费用流失',
        desc: '该回合结束时失去X点费用',
        type: '负面状态',
        hasParam: true,
        format: { color: '#EE0000' }
    },
    {
        name: '费用充盈',
        desc: '该回合结束时获得X点费用',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    }
]