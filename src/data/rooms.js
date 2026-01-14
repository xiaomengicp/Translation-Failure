/**
 * Rooms - 第一幕房间数据
 * 
 * 房间网络结构：
 * - bedroom_1: 起始卧室
 * - living_room: 客厅（第二个房间）
 * - bedroom_2: 卧室另一个版本（搬家后）
 * - hallway: 走廊
 * - mom_door: 妈妈房间门口
 * - key_room_1/2: 钥匙追逐用的房间
 */

const ROOMS = {
    // ========== Scene 1: 起始卧室 ==========
    bedroom_1: {
        id: 'bedroom_1',
        name: '卧室',
        description: '你的卧室。一切看起来都很熟悉，但又有些不对劲。',

        // 房间大小（网格单位，16像素为1格）
        width: 10,
        height: 8,

        // 玩家出生点（网格坐标）
        spawnX: 5,
        spawnY: 4,

        // 物品列表
        items: [
            { id: 'bed', x: 1, y: 1 },
            { id: 'desk', x: 7, y: 1 },
            { id: 'window', x: 4, y: 0 },
        ],

        // 出口配置
        exits: {
            // 固定出口（永远通向同一个房间）
            up: { type: 'fixed', target: 'hallway', spawnX: 5, spawnY: 6 },

            // 随机出口（每次可能不同）
            left: {
                type: 'random',
                targets: ['living_room', 'bedroom_2'],
                spawns: [
                    { spawnX: 8, spawnY: 4 },
                    { spawnX: 8, spawnY: 4 }
                ]
            },
            right: { type: 'fixed', target: 'living_room', spawnX: 1, spawnY: 4 },
            down: null  // 无出口
        }
    },

    // ========== Scene 2: 客厅 ==========
    living_room: {
        id: 'living_room',
        name: '客厅',
        description: '客厅。光线有些诡异，物品摆放也不太对劲。',

        width: 12,
        height: 8,
        spawnX: 6,
        spawnY: 4,

        items: [
            { id: 'sofa', x: 2, y: 2 },
            { id: 'tv', x: 8, y: 1 },
            { id: 'window_gaslight', x: 5, y: 0 },  // 会触发gaslight
        ],

        exits: {
            up: { type: 'fixed', target: 'hallway', spawnX: 5, spawnY: 6 },
            left: { type: 'fixed', target: 'bedroom_1', spawnX: 8, spawnY: 4 },
            right: {
                type: 'random',
                targets: ['bedroom_2', 'hallway'],
                spawns: [
                    { spawnX: 1, spawnY: 4 },
                    { spawnX: 5, spawnY: 6 }
                ]
            },
            down: null
        }
    },

    // ========== Scene 3: 卧室另一个版本 ==========
    bedroom_2: {
        id: 'bedroom_2',
        name: '卧室...?',
        description: '这是你的卧室吗？看起来不太一样...',

        width: 10,
        height: 8,
        spawnX: 5,
        spawnY: 4,

        items: [
            { id: 'bed_broken', x: 1, y: 1 },
            { id: 'desk_empty', x: 7, y: 1 },
            { id: 'window_dark', x: 4, y: 0 },
        ],

        exits: {
            // 这个房间出口更混乱
            up: {
                type: 'random',
                targets: ['bedroom_1', 'hallway', 'living_room'],
                spawns: [
                    { spawnX: 5, spawnY: 6 },
                    { spawnX: 5, spawnY: 6 },
                    { spawnX: 6, spawnY: 6 }
                ]
            },
            left: { type: 'fixed', target: 'living_room', spawnX: 10, spawnY: 4 },
            right: { type: 'fixed', target: 'hallway', spawnX: 1, spawnY: 4 },
            down: null
        }
    },

    // ========== Scene 4: 走廊 ==========
    hallway: {
        id: 'hallway',
        name: '走廊',
        description: '走廊。尽头有一扇门...',

        width: 14,
        height: 6,
        spawnX: 7,
        spawnY: 3,

        items: [
            { id: 'save_point', x: 2, y: 3 },  // 存档点
        ],

        exits: {
            up: { type: 'fixed', target: 'mom_door', spawnX: 5, spawnY: 6 },
            left: { type: 'fixed', target: 'bedroom_1', spawnX: 8, spawnY: 4 },
            right: { type: 'fixed', target: 'living_room', spawnX: 1, spawnY: 4 },
            down: { type: 'fixed', target: 'bedroom_2', spawnX: 5, spawnY: 1 }
        }
    },

    // ========== Scene 5 & 6: 妈妈的房间门口 ==========
    mom_door: {
        id: 'mom_door',
        name: '妈妈的房间',
        description: '妈妈的房间门口。门是锁着的。',

        width: 10,
        height: 8,
        spawnX: 5,
        spawnY: 6,

        items: [
            { id: 'mom_door', x: 4, y: 0 },
            { id: 'key', x: 7, y: 4 },  // 钥匙（会飞走）
        ],

        // 钥匙会飞到的房间
        keyFlyRooms: ['key_room_1', 'key_room_2', 'mom_door'],

        exits: {
            up: null,  // 门锁着
            left: { type: 'fixed', target: 'key_room_1', spawnX: 8, spawnY: 4 },
            right: { type: 'fixed', target: 'key_room_2', spawnX: 1, spawnY: 4 },
            down: { type: 'fixed', target: 'hallway', spawnX: 7, spawnY: 1 }
        },

        // 特殊标记：这是战斗触发房间
        triggerBattle: true
    },

    // ========== 钥匙追逐房间1 ==========
    key_room_1: {
        id: 'key_room_1',
        name: '储藏室',
        description: '一个黑暗的储藏室。',

        width: 8,
        height: 8,
        spawnX: 4,
        spawnY: 4,

        items: [
            { id: 'boxes', x: 2, y: 2 },
        ],

        exits: {
            up: { type: 'fixed', target: 'mom_door', spawnX: 2, spawnY: 4 },
            left: null,
            right: { type: 'fixed', target: 'mom_door', spawnX: 2, spawnY: 4 },
            down: { type: 'fixed', target: 'key_room_2', spawnX: 4, spawnY: 1 }
        }
    },

    // ========== 钥匙追逐房间2 ==========
    key_room_2: {
        id: 'key_room_2',
        name: '杂物间',
        description: '堆满杂物的房间。',

        width: 8,
        height: 8,
        spawnX: 4,
        spawnY: 4,

        items: [
            { id: 'junk', x: 3, y: 3 },
        ],

        exits: {
            up: { type: 'fixed', target: 'key_room_1', spawnX: 4, spawnY: 6 },
            left: { type: 'fixed', target: 'mom_door', spawnX: 8, spawnY: 4 },
            right: null,
            down: { type: 'fixed', target: 'mom_door', spawnX: 5, spawnY: 6 }
        }
    }
};
