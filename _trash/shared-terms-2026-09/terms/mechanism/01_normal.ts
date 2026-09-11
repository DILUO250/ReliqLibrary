export const normalMechanics = [
    {
        name: '缓冲',
        desc: '正面状态 抵御下X次受到的伤害',
        type: '正面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '活力',
        desc: '正面状态 下1张卡牌的进攻型骰子追加X点伤害',
        type: '正面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '精准',
        desc: '正面状态 费用为0的卡牌造成的伤害+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '封印',
        desc: '负面状态 这一回合封印至多X颗速度骰子',
        type: '负面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '合体',
        desc: '能力 通过某种手段使得2名司书单位合二为一的机制...',
        type: '能力',
        format: { color: '#000000' }
    },
    {
        name: '同化',
        desc: '能力 获得某个存在的部分力量；战斗卡组被替换为指定卡组',
        type: '能力',
        format: { color: '#000000' }
    },
    {
        name: '侵蚀',
        desc: '能力 被强制同化为某个存在；战斗卡组被替换为指定卡组，攻击不受控制',
        type: '能力',
        format: { color: '#000000' }
    },
    {
        name: '超频',
        desc: '能力 主动被强制同化为某个存在；战斗卡组被替换为指定卡组',
        type: '能力',
        format: { color: '#000000' }
    },
    {
        name: '混淆',
        desc: '负面状态 抽取费用为0~3的卡牌时使其费用在0~3内随机改变',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#000000' }
    },
    {
        name: '致盲',
        desc: '负面状态 抽取卡牌时无法看见其卡面、名称、骰子效果',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#000000' }
    },
    {
        name: '失控',
        desc: '负面状态 所有骰子类型随机变化',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#EE0000' }
    },
    {
        name: '随机攻击',
        desc: '负面状态 该回合自身所有进攻型骰子类型随机变化',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#EE0000' }
    }
]