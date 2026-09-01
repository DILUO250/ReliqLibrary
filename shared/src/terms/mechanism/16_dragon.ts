export const dragonMechanics = [
    {
        name: '坚不可摧',
        desc: '正面状态 这一回合中受到的伤害不会高于X',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#002060' }
    },
    {
        name: '光之种',
        desc: '正面状态 获得的情感点数翻倍',
        type: '正面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#5060E1' }
    },
    {
        name: '烟气',
        desc: '负面状态 至多10层；被击中时所受伤害+X*3%；若烟气层数不低于9则所有骰子威力+1，每回合结束时层数-1',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#767171' }
    },
    {
        name: '二噁英',
        desc: '正面状态 至多10层，特殊烟气；击中目标时伤害+X*3%；若二噁英层数不低于9则所有骰子威力+1，每回合结束时层数-1',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#747474' }
    },
    {
        name: '尼古丁',
        desc: '负面状态 受到烟气卡牌的攻击时转化为1层麻痹/虚弱/易损',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#747474' }
    },
    {
        name: '源石刺激',
        desc: '中立状态 造成的所有伤害x2.5，每回合结束受到体力上限12.5%的真实伤害',
        type: '中立状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#C00000' }
    }
]