/**
 * Battles - 战斗数据
 * 第一场战斗：妈妈
 */

const BATTLES = {
    mom_battle_1: {
        id: 'mom_battle_1',

        // 敌人信息
        enemy: {
            name: '妈妈',
            hp: 999,
            canBeDamaged: false,  // 无法造成伤害
            approachSpeed: 2     // 每回合靠近的距离
        },

        // 玩家初始状态
        player: {
            maxHp: 100,
            hp: 100
        },

        // 战斗开始对话
        startDialogue: [
            '妈妈出现了。',
            '【这里好可怕，你来妈妈这...】',
            '【妈妈需要你...】'
        ],

        // 战斗结束对话（HP归0）
        defeatDialogue: [
            '...',
            '【你还是一个很糟糕的孩子】',
            '【你要继续救妈妈】'
        ],

        // 玩家行动效果
        actionEffects: {
            punch: {
                dialogue: [
                    '你挥拳出击...',
                    '妈妈没有反应。',
                    '你的手很痛。'
                ],
                momDialogue: ['【你怎么能打妈妈！】', '【你这个不孝的孩子！】'],
                mechanicEffect: {
                    type: 'player_loses_hp',
                    value: 15
                }
            },

            freeze: {
                dialogue: [
                    '你僵住了。',
                    '无法动弹。'
                ],
                momDialogue: ['【你怎么站在那里不动？】', '【你不关心妈妈吗？】'],
                mechanicEffect: {
                    type: 'enemy_attack_stronger',
                    multiplier: 1.5
                }
            },

            wait: {
                dialogue: [
                    '你试图等待...'
                ],
                momDialogue: ['【你不能只是等着！】', '【妈妈需要你现在行动！】'],
                mechanicEffect: {
                    type: 'forced_damage',
                    value: 20
                }
            }
        },

        // Negotiate选项
        negotiateOptions: [
            {
                id: 'defend',
                name: 'Defend',
                playerText: '我其实做得还行...',
                momLabel: '【你从来都不够好】',
                momResponse: '【别给自己找借口了】',
                effects: {
                    resistance: 1,  // 微弱的反抗
                    damage: 10      // 但还是会受伤
                }
            },
            {
                id: 'explain',
                name: 'Explain',
                playerText: '我已经很努力了...',
                momLabel: '【你还不够努力】',
                momResponse: '【如果你真的努力，就不会是这样】',
                effects: {
                    resistance: 1,
                    damage: 10
                }
            },
            {
                id: 'comply',
                name: 'Comply',
                playerText: '对不起，我会改...',
                momLabel: '【你总是这么说】',
                momResponse: '【说完又什么都不做】',
                effects: {
                    conformity: 1,  // 顺从
                    damage: 5       // 伤害较轻但...
                }
            }
        ],

        // 敌人回合：弹幕配置
        bulletPattern: {
            type: 'approach',

            // 弹幕区域（玩家需要在这个区域躲避）
            areaX: 200,
            areaY: 180,
            areaWidth: 240,
            areaHeight: 120,

            // 妈妈的位置（会靠近）
            momStartY: 180,
            momApproachSpeed: 20,  // 每回合靠近的像素

            // 伤害
            contactDamage: 10,     // 接触伤害

            // 持续时间
            duration: 3000,        // 毫秒

            // 躲开后的反应
            dodgeDialogue: ['【你为什么躲开妈妈？】', '【妈妈只是想抱抱你】']
        },

        // freeze后的增强效果
        freezeEnhanced: {
            momApproachSpeed: 30,  // 更快
            contactDamage: 15      // 更高伤害
        }
    }
};
