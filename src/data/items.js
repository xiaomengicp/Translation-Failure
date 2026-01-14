/**
 * Items - 物品数据
 * 
 * 互动规则（扭曲的）：
 * - 检查 → 动一动就坏掉
 * - 获取 → 一拿起来就跑了
 * - 使用 → 对不上，使用不了
 */

const ITEMS = {
    // ========== 卧室物品 ==========
    bed: {
        id: 'bed',
        name: '床',
        type: 'bed',

        interactions: {
            check: {
                prompt: '检查床',
                result: '你靠近床...\n床突然塌陷了。',
                effect: 'break'
            }
        }
    },

    bed_broken: {
        id: 'bed_broken',
        name: '破床',
        type: 'bed',

        interactions: {
            check: {
                prompt: '检查破床',
                result: '这张床已经坏了。\n床单上有污渍...',
                effect: null
            }
        }
    },

    desk: {
        id: 'desk',
        name: '书桌',
        type: 'desk',

        interactions: {
            check: {
                prompt: '检查书桌',
                result: '你打开抽屉...\n抽屉突然掉下来，东西散落一地。',
                effect: 'break'
            }
        }
    },

    desk_empty: {
        id: 'desk_empty',
        name: '空书桌',
        type: 'desk',

        interactions: {
            check: {
                prompt: '检查书桌',
                result: '书桌是空的。\n什么都没有。',
                effect: null
            }
        }
    },

    // ========== 窗户 ==========
    window: {
        id: 'window',
        name: '窗户',
        type: 'window',

        interactions: {
            check: {
                prompt: '看向窗外',
                result: '你看向窗外...\n外面一片漆黑。\n好像有什么东西在动...',
                effect: 'unease'
            }
        }
    },

    window_gaslight: {
        id: 'window_gaslight',
        name: '窗户',
        type: 'window',

        interactions: {
            check: {
                prompt: '看向窗外',
                result: '你感觉窗外有什么东西在动...',
                gaslight: '【孩子，那只是你的想象】',
                effect: 'gaslight'
            }
        }
    },

    window_dark: {
        id: 'window_dark',
        name: '窗户',
        type: 'window',

        interactions: {
            check: {
                prompt: '看向窗外',
                result: '窗户被涂黑了。\n什么都看不到。',
                effect: null
            }
        }
    },

    // ========== 客厅物品 ==========
    sofa: {
        id: 'sofa',
        name: '沙发',
        type: 'default',

        interactions: {
            check: {
                prompt: '检查沙发',
                result: '你坐下来...\n沙发发出奇怪的声音，弹簧刺入你的腿。',
                effect: 'hurt',
                damage: 5
            }
        }
    },

    tv: {
        id: 'tv',
        name: '电视',
        type: 'default',

        interactions: {
            check: {
                prompt: '检查电视',
                result: '电视突然亮起...\n屏幕上是雪花噪点。\n你听到耳语声。',
                gaslight: '【你总是听到不存在的声音】',
                effect: 'gaslight'
            }
        }
    },

    // ========== 钥匙（特殊物品）==========
    key: {
        id: 'key',
        name: '钥匙',
        type: 'key',

        canFly: true,
        flyAttempts: 0,
        maxFlyAttempts: 3,

        interactions: {
            take: {
                prompt: '拿起钥匙',
                result: '你伸手去拿钥匙...\n钥匙飞走了！',
                resultFinal: '你终于抓住了钥匙。\n但它在你手里变得冰冷。',
                gaslight: '【你还不够快】\n【你为什么这么笨？】',
                effect: 'key_fly'
            }
        }
    },

    // ========== 门 ==========
    mom_door: {
        id: 'mom_door',
        name: '妈妈的门',
        type: 'door',

        locked: true,

        interactions: {
            check: {
                prompt: '检查门',
                result: '门是锁着的。\n你听到里面有声音...',
                momVoice: '【孩子... 快来...】',
                effect: null
            },
            use: {
                prompt: '开门',
                resultLocked: '门锁着。你需要钥匙。',
                resultWithKey: '你用钥匙开门...\n钥匙突然融化了。\n门还是锁着的。',
                gaslight: '【你为什么进不来？】\n【妈妈在等你...】',
                effect: 'trigger_battle'
            }
        }
    },

    // ========== 存档点 ==========
    save_point: {
        id: 'save_point',
        name: '光点',
        type: 'save',

        interactions: {
            check: {
                prompt: '靠近光点',
                result: '温暖的光芒包围了你。\n你感到一丝安慰。\n\n【进度已保存】',
                effect: 'save'
            }
        }
    },

    // ========== 杂物 ==========
    boxes: {
        id: 'boxes',
        name: '箱子',
        type: 'default',

        interactions: {
            check: {
                prompt: '检查箱子',
                result: '你打开箱子...\n里面是你小时候的玩具。\n都已经坏了。',
                effect: null
            }
        }
    },

    junk: {
        id: 'junk',
        name: '杂物',
        type: 'default',

        interactions: {
            check: {
                prompt: '检查杂物',
                result: '一堆杂乱的东西。\n你找不到任何有用的。',
                effect: null
            }
        }
    }
};

// 妈妈的呼唤文字（在不同场景触发）
const MOM_VOICE_LINES = [
    '【孩子... 快来...】',
    '【妈妈在等你...】',
    '【你怎么还不来？】',
    '【妈妈需要你...】',
    '【你让妈妈失望了...】'
];
