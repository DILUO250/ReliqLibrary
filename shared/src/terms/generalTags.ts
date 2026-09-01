export const generalTags = [
    {
        name: '蓄力',
        desc: '装备蓄力卡牌的这一回合可以选择不使用该卡牌，而是在蓄力完成的那一回合的战斗阶段才使用以获得额外效果',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '连携',
        desc: '必须有满足条件的友方单位在场才能成功发动',
        // hasParam: true,
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '连携-同技',
        desc: '一种连携机制。发起者使用带有 [连携-同技] 标签的卡牌时，可指定一名符合条件的友方单位作为连携者。本次行动中，发起者与连携者将各自独立使用一次该卡牌的全部效果。',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '连携-合击',
        desc: '一种需要条件解锁的连携机制。发起者想要使用卡牌A，需要场上存在一名装备了特定卡牌B的友方单位时，卡牌A才可发动。发动后，发起者使用卡牌A，连携者使用卡牌B。',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '穿刺',
        desc: '穿刺卡牌无视防御型骰子与格挡',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '磨利',
        desc: '磨利装备卡可以对其他手牌使用，使其获得[穿刺]',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '改造',
        desc: '改造装备卡可以对其他手牌使用，使其点数临时+2',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '调和',
        desc: '调和卡牌受到的法术强壮与法术伤害强化效果x5',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '牺牲',
        desc: '牺牲卡牌必须令X名指定类型的友方单位立刻阵亡以发动效果。若场上没有该类型的友方单位，则使用失败',
        hasParam: true,
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '活物',
        desc: '活物卡牌在每回合开始时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '奇巧',
        desc: '奇巧卡牌在被丢弃时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '蚀刻',
        desc: '蚀刻卡牌在持有者消耗卡牌时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '扫击',
        desc: '扫击卡牌在持有者使用群体攻击卡牌时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '咒语',
        desc: '咒语卡牌在持有者使用法术卡牌时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '暴食',
        desc: '暴食卡牌在持有者恢复体力时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '饥饿',
        desc: '饥饿卡牌在持有者的友方单位出场时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '复仇',
        desc: '复仇卡牌在持有者受伤时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '收割',
        desc: '收割卡牌在持有者的友方单位阵亡时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '亡语',
        desc: '亡语卡牌在持有者阵亡时自动使用',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    }
]