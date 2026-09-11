export const universalStatuses = [
    {
        name: '眩晕',
        desc: '这一回合无法使用卡牌',
        type: '负面状态',
        format: { color: '#EE0000' }
    },
    {
        name: '混乱',
        desc: '这一回合中所有物理抗性变为1.5，无法行动且无法抽取卡牌与恢复费用',
        type: '负面状态',
        format: { color: '#EE0000' }
    },
    {
        name: '迷彩',
        desc: '这一回合无法被远程战斗卡牌指定为目标',
        type: '正面状态',
        format: { color: '#00B0F0' }
    },
    {
        name: '隐匿',
        desc: '这一回合无法被任何战斗卡牌指定为目标',
        type: '正面状态',
        format: { color: '#00B0F0' }
    },
    {
        name: '威力无效',
        desc: '这一回合中该角色的骰子不受威力增减效果影响',
        type: '中立状态',
        format: { color: '#002060' }
    },
    {
        name: '晕头转向',
        desc: '1~3内速度骰子行动时有33%的概率随机改变攻击目标',
        type: '负面状态',
        format: { color: '#EE0000' }
    },
    {
        name: '再来一次',
        desc: '3回合内必须使用【某张卡牌】',
        type: '负面状态',
        format: { color: '#EE0000' }
    },
    {
        name: '定身法',
        desc: '3回合内无法使用【某张卡牌】',
        type: '负面状态',
        format: { color: '#EE0000' }
    },
    {
        name: '无特性',
        desc: '这一回合被动能力失效，速战速决除外',
        type: '负面状态',
        format: { color: '#EE0000' }
    },
    {
        name: '沉默',
        desc: '这一回合所有骰子的追加效果失效',
        type: '负面状态',
        format: { color: '#EE0000' }
    }
]