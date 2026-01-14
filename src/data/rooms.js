/**
 * Rooms - 第一幕房间数据
 * 
 * 非欧几里得空间拓扑 (Non-Euclidean Spatial Topology)：
 * - 房间连接不基于物理位置，而是基于映射字典
 * - 门的标签（应该去哪）与实际目的地（真正去哪）不一致
 * 
 * 房间网络：
 * - BEDROOM_1: 起始卧室
 * - LIVING_ROOM: 客厅
 * - BEDROOM_2: 卧室另一个版本（搬家后？）
 * - HALLWAY: 走廊
 * - MOM_DOOR: 妈妈房间门口（钥匙追逐）
 * - KEY_ROOM_1: 钥匙追逐房间1
 * - KEY_ROOM_2: 钥匙追逐房间2
 */

const ROOMS = {
    // ========== Scene 1: 起始卧室 ==========
    BEDROOM_1: {
        id: 'BEDROOM_1',
        title: '你的卧室',
        description: '你醒了。这里是你家，但感觉...不太对。',

        layout: [
            [1, 1, 1, 1, 'DOOR_UP', 1, 1, 1, 1, 1],
            [1, 0, 'BED', 0, 0, 0, 0, 'DESK', 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            ['DOOR_LEFT', 0, 0, 0, 0, 0, 0, 0, 0, 'DOOR_RIGHT'],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 'PHOTO', 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_UP': {
                label: '走廊',
                target: 'LIVING_ROOM',  // 扭曲：说走廊，去客厅
                spawnX: 5, spawnY: 5
            },
            'DOOR_LEFT': {
                label: '客厅',
                target: 'BEDROOM_2',    // 扭曲：说客厅，去另一个卧室
                spawnX: 8, spawnY: 4
            },
            'DOOR_RIGHT': {
                label: '浴室',
                target: 'LIVING_ROOM',  // 正确
                spawnX: 1, spawnY: 4
            }
        },

        spawnX: 5, spawnY: 5
    },

    // ========== Scene 2: 客厅 ==========
    LIVING_ROOM: {
        id: 'LIVING_ROOM',
        title: '客厅',
        description: '客厅。光线有些诡异，物品摆放也不太对劲。',

        layout: [
            [1, 1, 1, 1, 'DOOR_UP', 1, 1, 1, 1, 1],
            [1, 0, 'SOFA', 0, 0, 0, 0, 'TV', 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            ['DOOR_LEFT', 0, 0, 0, 'WINDOW', 0, 0, 0, 0, 'DOOR_RIGHT'],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_UP': {
                label: '走廊',
                target: 'HALLWAY',      // 正确
                spawnX: 5, spawnY: 8
            },
            'DOOR_LEFT': {
                label: '卧室',
                target: 'BEDROOM_1',    // 正确
                spawnX: 8, spawnY: 4
            },
            'DOOR_RIGHT': {
                label: '储藏室',
                target: 'BEDROOM_2',    // 扭曲：说储藏室，去另一个卧室
                spawnX: 1, spawnY: 4
            }
        },

        spawnX: 5, spawnY: 5
    },

    // ========== Scene 3: 卧室另一个版本 ==========
    BEDROOM_2: {
        id: 'BEDROOM_2',
        title: '卧室...?',
        description: '这是你的卧室吗？看起来不太一样...',

        layout: [
            [1, 1, 1, 1, 'DOOR_UP', 1, 1, 1, 1, 1],
            [1, 0, 'BED_BROKEN', 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            ['DOOR_LEFT', 0, 0, 0, 0, 0, 0, 0, 0, 'DOOR_RIGHT'],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_UP': {
                label: '走廊',
                target: 'BEDROOM_1',    // 扭曲：回到卧室1
                spawnX: 5, spawnY: 5
            },
            'DOOR_LEFT': {
                label: '客厅',
                target: 'LIVING_ROOM',
                spawnX: 8, spawnY: 4
            },
            'DOOR_RIGHT': {
                label: '走廊',
                target: 'HALLWAY',      // 正确
                spawnX: 1, spawnY: 4
            }
        },

        spawnX: 5, spawnY: 5
    },

    // ========== Scene 4: 走廊 ==========
    HALLWAY: {
        id: 'HALLWAY',
        title: '走廊',
        description: '走廊。尽头有一扇门...',

        layout: [
            [1, 1, 1, 1, 'DOOR_MOM', 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 'SAVE', 0, 0, 0, 0, 0, 0, 1],
            ['DOOR_LEFT', 0, 0, 0, 0, 0, 0, 0, 0, 'DOOR_RIGHT'],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 'DOOR_DOWN', 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_MOM': {
                label: '妈妈的房间',
                target: 'MOM_DOOR',
                spawnX: 5, spawnY: 8
            },
            'DOOR_LEFT': {
                label: '卧室',
                target: 'BEDROOM_1',
                spawnX: 8, spawnY: 4
            },
            'DOOR_RIGHT': {
                label: '客厅',
                target: 'LIVING_ROOM',
                spawnX: 1, spawnY: 4
            },
            'DOOR_DOWN': {
                label: '卧室',
                target: 'BEDROOM_2',
                spawnX: 5, spawnY: 1
            }
        },

        spawnX: 5, spawnY: 5
    },

    // ========== Scene 5 & 6: 妈妈的房间门口 ==========
    MOM_DOOR: {
        id: 'MOM_DOOR',
        title: '妈妈的房间',
        description: '妈妈的房间门口。门是锁着的...',

        layout: [
            [1, 1, 1, 1, 'DOOR_MOM_LOCK', 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            ['DOOR_LEFT', 0, 0, 0, 0, 0, 0, 'KEY', 0, 'DOOR_RIGHT'],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 'DOOR_DOWN', 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_MOM_LOCK': {
                label: '妈妈的房间',
                target: 'MOM_ROOM',
                spawnX: 5, spawnY: 5,
                locked: true  // 需要钥匙
            },
            'DOOR_LEFT': {
                label: '储藏室',
                target: 'KEY_ROOM_1',
                spawnX: 8, spawnY: 4
            },
            'DOOR_RIGHT': {
                label: '杂物间',
                target: 'KEY_ROOM_2',
                spawnX: 1, spawnY: 4
            },
            'DOOR_DOWN': {
                label: '走廊',
                target: 'HALLWAY',
                spawnX: 5, spawnY: 1
            }
        },

        // 钥匙会飞到的房间
        keyFlyRooms: ['KEY_ROOM_1', 'KEY_ROOM_2', 'MOM_DOOR'],

        spawnX: 5, spawnY: 5
    },

    // ========== 钥匙追逐房间1 ==========
    KEY_ROOM_1: {
        id: 'KEY_ROOM_1',
        title: '储藏室',
        description: '一个黑暗的储藏室。',

        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 'BOXES', 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 'DOOR_RIGHT'],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 'DOOR_DOWN', 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_RIGHT': {
                label: '妈妈的房间',
                target: 'MOM_DOOR',
                spawnX: 2, spawnY: 4
            },
            'DOOR_DOWN': {
                label: '杂物间',
                target: 'KEY_ROOM_2',
                spawnX: 5, spawnY: 1
            }
        },

        spawnX: 5, spawnY: 5
    },

    // ========== 钥匙追逐房间2 ==========
    KEY_ROOM_2: {
        id: 'KEY_ROOM_2',
        title: '杂物间',
        description: '堆满杂物的房间。',

        layout: [
            [1, 1, 1, 1, 'DOOR_UP', 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            ['DOOR_LEFT', 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        doorLinks: {
            'DOOR_UP': {
                label: '储藏室',
                target: 'KEY_ROOM_1',
                spawnX: 5, spawnY: 8
            },
            'DOOR_LEFT': {
                label: '妈妈的房间',
                target: 'MOM_DOOR',
                spawnX: 8, spawnY: 4
            }
        },

        spawnX: 5, spawnY: 5
    },

    // ========== 妈妈的房间（战斗触发）==========
    MOM_ROOM: {
        id: 'MOM_ROOM',
        title: '妈妈的房间',
        description: '你终于进来了...',

        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        doorLinks: {},

        spawnX: 5, spawnY: 5,
        triggerBattle: true
    }
};

// 网格大小
const GRID = {
    WIDTH: 10,
    HEIGHT: 10,
    TILE_SIZE: 40
};
