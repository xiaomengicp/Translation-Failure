/**
 * Rooms - 第一幕房间数据
 * 
 * 非欧几里得空间拓扑 (Non-Euclidean Spatial Topology)：
 * - 房间连接不基于物理位置，而是基于映射字典
 * - 目标：让玩家失去方位感，产生"家是一个无限循环的陷阱"的心理暗示
 * - 空间逻辑是闭环且跳跃的，无法在脑中构建平面图
 */

const ROOMS = {
    // ========== Scene 1: 起始卧室 ==========
    bedroom_1: {
        id: 'bedroom_1',
        name: '卧室',
        description: '你的卧室。一切看起来都很熟悉，但又有些不对劲。',

        // 房间大小（网格单位，16像素为1格）
        width: 12,
        height: 10,

        // 玩家出生点（网格坐标）
        spawnX: 6,
        spawnY: 5,

        // 扭曲等级（影响视觉效果）
        distortionLevel: 1,

        // 物品列表
        items: [
            { id: 'bed', x: 2, y: 2 },
            { id: 'desk', x: 9, y: 2 },
            { id: 'window', x: 5, y: 0 },
        ],

        // 非欧几里得出口配置
        // 关键：向上走进入走廊，向左走可能进入客厅或另一个版本的卧室
        // 向右走回到客厅，向下走却回到卧室起点（被困的感觉）
        exits: {
            up: {
                type: 'teleport',  // 瞬间传送，不是走过去
                target: 'hallway',
                spawnX: 7,
                spawnY: 4,
                message: null  // 无提示，突然就到了
            },
            left: {
                type: 'distorted',  // 扭曲出口 - 每次可能不同
                targets: ['living_room', 'bedroom_2', 'bedroom_1'],  // 包括回到自己
                spawns: [
                    { spawnX: 10, spawnY: 5 },
                    { spawnX: 10, spawnY: 5 },
                    { spawnX: 10, spawnY: 5 }  // 回到自己但从右边出现
                ],
                weights: [0.4, 0.4, 0.2]  // 20%概率走回自己
            },
            right: {
                type: 'fixed',
                target: 'living_room',
                spawnX: 1,
                spawnY: 5
            },
            down: {
                type: 'loop',  // 循环出口 - 永远回到起点
                target: 'bedroom_1',
                spawnX: 6,
                spawnY: 1,
                message: '你绕了一圈，又回到了原点。'
            }
        }
    },

    // ========== Scene 2: 客厅 ==========
    living_room: {
        id: 'living_room',
        name: '客厅',
        description: '客厅。光线有些诡异，物品摆放也不太对劲。',

        width: 14,
        height: 10,
        spawnX: 7,
        spawnY: 5,

        distortionLevel: 2,

        items: [
            { id: 'sofa', x: 3, y: 3 },
            { id: 'tv', x: 10, y: 2 },
            { id: 'window_gaslight', x: 6, y: 0 },
        ],

        exits: {
            // 向上走：应该去走廊，但有时会到卧室
            up: {
                type: 'distorted',
                targets: ['hallway', 'bedroom_2'],
                spawns: [
                    { spawnX: 7, spawnY: 4 },
                    { spawnX: 6, spawnY: 8 }
                ],
                weights: [0.6, 0.4]
            },
            left: {
                type: 'fixed',
                target: 'bedroom_1',
                spawnX: 10,
                spawnY: 5
            },
            // 向右走：逻辑上应该离开房子，但却进入妈妈房间门口
            right: {
                type: 'teleport',
                target: 'mom_door',
                spawnX: 5,
                spawnY: 6,
                message: null
            },
            down: null
        }
    },

    // ========== Scene 3: 卧室另一个版本（搬家后/记忆错乱）==========
    bedroom_2: {
        id: 'bedroom_2',
        name: '卧室...?',
        description: '这是你的卧室吗？看起来不太一样...\n家具的位置好像变了。',

        width: 12,
        height: 10,
        spawnX: 6,
        spawnY: 5,

        distortionLevel: 3,

        items: [
            { id: 'bed_broken', x: 8, y: 7 },  // 床的位置换了
            { id: 'desk_empty', x: 2, y: 7 },  // 书桌空了
            { id: 'window_dark', x: 5, y: 0 },
        ],

        exits: {
            // 这个房间的出口完全混乱
            // 所有方向都可能去任何地方
            up: {
                type: 'distorted',
                targets: ['bedroom_1', 'hallway', 'living_room', 'bedroom_2'],
                spawns: [
                    { spawnX: 6, spawnY: 8 },
                    { spawnX: 7, spawnY: 4 },
                    { spawnX: 7, spawnY: 8 },
                    { spawnX: 6, spawnY: 8 }  // 回到自己
                ],
                weights: [0.3, 0.3, 0.2, 0.2]
            },
            left: {
                type: 'teleport',
                target: 'living_room',
                spawnX: 12,
                spawnY: 5
            },
            right: {
                type: 'teleport',
                target: 'hallway',
                spawnX: 1,
                spawnY: 3
            },
            down: {
                type: 'loop',
                target: 'bedroom_2',
                spawnX: 6,
                spawnY: 1,
                message: '不管怎么走，你都无法离开这个房间。'
            }
        }
    },

    // ========== Scene 4: 走廊 ==========
    hallway: {
        id: 'hallway',
        name: '走廊',
        description: '走廊。尽头有一扇门...\n走廊看起来比你记忆中的要长。',

        width: 16,
        height: 8,
        spawnX: 8,
        spawnY: 4,

        distortionLevel: 2,

        items: [
            { id: 'save_point', x: 3, y: 4 },
        ],

        exits: {
            up: {
                type: 'fixed',
                target: 'mom_door',
                spawnX: 5,
                spawnY: 6
            },
            left: {
                type: 'distorted',
                targets: ['bedroom_1', 'bedroom_2'],
                spawns: [
                    { spawnX: 10, spawnY: 5 },
                    { spawnX: 10, spawnY: 5 }
                ],
                weights: [0.5, 0.5]
            },
            right: {
                type: 'fixed',
                target: 'living_room',
                spawnX: 1,
                spawnY: 5
            },
            down: {
                type: 'distorted',
                targets: ['bedroom_2', 'hallway'],  // 可能回到自己
                spawns: [
                    { spawnX: 6, spawnY: 1 },
                    { spawnX: 8, spawnY: 1 }
                ],
                weights: [0.7, 0.3]
            }
        }
    },

    // ========== Scene 5: 妈妈的房间门口 ==========
    mom_door: {
        id: 'mom_door',
        name: '妈妈的房间',
        description: '妈妈的房间门口。门是锁着的。\n你能听到里面有声音...',

        width: 12,
        height: 10,
        spawnX: 5,
        spawnY: 6,

        distortionLevel: 4,

        items: [
            { id: 'mom_door', x: 5, y: 1 },
            { id: 'key', x: 9, y: 5 },
        ],

        keyFlyRooms: ['key_room_1', 'key_room_2', 'mom_door'],

        exits: {
            up: null,  // 门锁着
            left: {
                type: 'fixed',
                target: 'key_room_1',
                spawnX: 6,
                spawnY: 5
            },
            right: {
                type: 'fixed',
                target: 'key_room_2',
                spawnX: 1,
                spawnY: 5
            },
            down: {
                type: 'teleport',
                target: 'hallway',
                spawnX: 8,
                spawnY: 1
            }
        },

        triggerBattle: true
    },

    // ========== 钥匙追逐房间1 ==========
    key_room_1: {
        id: 'key_room_1',
        name: '储藏室',
        description: '一个黑暗的储藏室。\n里面堆满了你不记得的东西。',

        width: 10,
        height: 10,
        spawnX: 5,
        spawnY: 5,

        distortionLevel: 3,

        items: [
            { id: 'boxes', x: 3, y: 3 },
        ],

        exits: {
            up: {
                type: 'teleport',
                target: 'mom_door',
                spawnX: 2,
                spawnY: 5
            },
            left: null,
            right: {
                type: 'fixed',
                target: 'mom_door',
                spawnX: 2,
                spawnY: 5
            },
            down: {
                type: 'distorted',
                targets: ['key_room_2', 'key_room_1'],
                spawns: [
                    { spawnX: 5, spawnY: 1 },
                    { spawnX: 5, spawnY: 1 }
                ],
                weights: [0.7, 0.3]
            }
        }
    },

    // ========== 钥匙追逐房间2 ==========
    key_room_2: {
        id: 'key_room_2',
        name: '杂物间',
        description: '堆满杂物的房间。\n这些东西你都不认识。',

        width: 10,
        height: 10,
        spawnX: 5,
        spawnY: 5,

        distortionLevel: 3,

        items: [
            { id: 'junk', x: 4, y: 4 },
        ],

        exits: {
            up: {
                type: 'distorted',
                targets: ['key_room_1', 'key_room_2'],
                spawns: [
                    { spawnX: 5, spawnY: 8 },
                    { spawnX: 5, spawnY: 8 }
                ],
                weights: [0.7, 0.3]
            },
            left: {
                type: 'fixed',
                target: 'mom_door',
                spawnX: 10,
                spawnY: 5
            },
            right: null,
            down: {
                type: 'teleport',
                target: 'mom_door',
                spawnX: 5,
                spawnY: 8
            }
        }
    }
};

