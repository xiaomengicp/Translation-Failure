/**
 * Items - 物品数据
 * 
 * 意图颠倒逻辑 (Inverted Intentions)：
 * - UI提示显示"查看"、"拾取"、"修好"（假意图）
 * - 实际结果是"破坏"、"消失"、"受伤"（真实结果）
 * - 玩家的行为初衷是善意的，但结果永远是破坏性的
 * 
 * 情绪化感知 (Emotional Investigation)：
 * - 物品描述不关乎物理属性，而关乎情感关系
 * - "这是一把椅子，当你坐在这里时，他会变得很生气"
 */

const ITEMS = {
    // ========== 卧室物品 ==========
    BED: {
        id: 'BED',
        name: '你的床',
        // 情绪化描述，不是物理描述
        examine: '你害怕睡觉。因为睡着了就会做噩梦。',
        // UI显示的意图
        action: '躺下',
        // 实际的结果（与意图相反）
        result: '你刚躺下，床就塌了。\n你总是把东西弄坏。',
        // 效果
        effect: 'break',
        // 是否显示gaslight
        gaslight: '【你太重了】\n【你不配休息】'
    },

    DESK: {
        id: 'DESK',
        name: '书桌',
        examine: '妈妈说你应该好好学习。但你从来都学不好。',
        action: '找作业',
        result: '你打开抽屉，抽屉掉了。\n里面的东西散落一地。\n又是你的错。',
        effect: 'break',
        gaslight: '【你就是做不好任何事情】'
    },

    PHOTO: {
        id: 'PHOTO',
        name: '全家福',
        examine: '爸爸的脸被抹掉了。你不记得他长什么样了。',
        action: '查看',
        result: '当你触碰照片时，它碎裂了。\n你的手在流血。\n你不应该碰它的。',
        effect: 'hurt',
        damage: 10,
        gaslight: '【看看你做了什么】\n【你毁了一切】'
    },

    // ========== 厨房物品 ==========
    KNIFE: {
        id: 'KNIFE',
        name: '餐刀',
        examine: '晚餐从未开始。餐桌上只有这把刀。',
        action: '拾取',
        result: '你把刀拿起来...\n然后你把它弄丢了。\n或者你故意不记得把它放在哪了。',
        effect: 'vanish',  // 物品消失
        gaslight: '【你总是丢三落四】'
    },

    // ========== 浴室物品 ==========
    MIRROR: {
        id: 'MIRROR',
        name: '镜子',
        examine: '镜子里没有人。只有一个影子。',
        action: '凝视',
        result: '你盯着镜子...\n然后你打碎了它。\n这样影子就没法出来了。',
        effect: 'break',
        gaslight: '【那不是影子】\n【那是你看到的幻觉】'
    },

    // ========== 特殊物品 ==========
    KEY: {
        id: 'KEY',
        name: '钥匙',
        examine: '这把钥匙...它好像不想被你拿到。',
        action: '拿起',
        result: '你伸手去拿钥匙...\n钥匙飞走了。\n你永远也拿不到它。',
        effect: 'fly',
        flyCount: 0,
        maxFlyCount: 3,
        resultFinal: '你终于抓住了钥匙。\n但它在你手里变得冰冷。\n你不确定你是否真的想打开那扇门。',
        gaslight: '【你还不够快】\n【你为什么这么笨？】'
    },

    SAVE: {
        id: 'SAVE',
        name: '光点',
        examine: '一束温暖的光。在这个家里，只有这里让你感到安全。',
        action: '靠近',
        result: '温暖的光芒包围了你。\n你感到一丝安慰。\n\n【进度已保存】',
        effect: 'save'
    },

    // ========== 客厅物品 ==========
    SOFA: {
        id: 'SOFA',
        name: '沙发',
        examine: '这是他的位置。你不该坐在这里。',
        action: '坐下',
        result: '你刚坐下，就听到脚步声...\n你赶紧站起来。',
        effect: 'unease',
        gaslight: '【你知道这不是你的位置】'
    },

    TV: {
        id: 'TV',
        name: '电视',
        type: 'scenery',
        action: '看',
        // result: '只有雪花点。声音很大。', (Legacy)
        options: [
            {
                label: '打开',
                result: '屏幕亮起。只有刺耳的雪花点噪音。',
                actionSfx: 'flicker'
            },
            {
                label: '砸烂',
                effect: 'break',
                result: '你砸烂了屏幕。玻璃碎片划伤了你的手。',
                damage: 5,
                gaslight: ['你总是由于无法控制而搞砸一切', '这就是为什么没人喜欢和你在一起'],
                actionSfx: 'itemBreak'
            }
        ]
    },
    WINDOW: {
        id: 'WINDOW',
        name: '窗户',
        type: 'scenery',
        action: '看',
        options: [
            {
                label: '向外看',
                result: '外面漆黑一片，什么也看不见。连星星都没有。'
            },
            {
                label: '打开',
                result: '窗户卡住了。或者被钉死了。',
                actionSfx: 'cancel'
            },
            {
                label: '敲击',
                result: '玻璃发出沉闷的响声。没人回应。',
                actionSfx: 'step'
            }
        ]
    },

    // ========== 卧室2物品 ==========
    BED_BROKEN: {
        id: 'BED_BROKEN',
        name: '破旧的床',
        examine: '这张床看起来很旧了...好像是搬家前的。',
        action: '躺下',
        result: '你试着躺下...\n床架发出吱呀声，然后断裂了。\n这张床早就坏了。',
        effect: 'hurt',
        damage: 5,
        gaslight: '【你不该碰这些旧东西】'
    },

    // ========== 储藏室物品 ==========
    BOXES: {
        id: 'BOXES',
        name: '箱子',
        examine: '一堆落满灰尘的箱子。里面装着什么？',
        action: '打开',
        result: '你打开一个箱子...\n里面空空如也。\n或者，你不记得里面有什么了。',
        effect: 'unease',
        gaslight: '【你在找什么？】\n【这里什么都没有】'
    },

    // ========== 门（通用） ==========
    DOOR_UP: { id: 'DOOR_UP', name: '门', type: 'door' },
    DOOR_DOWN: { id: 'DOOR_DOWN', name: '门', type: 'door' },
    DOOR_LEFT: { id: 'DOOR_LEFT', name: '门', type: 'door' },
    DOOR_RIGHT: { id: 'DOOR_RIGHT', name: '门', type: 'door' },
    DOOR_MOM: { id: 'DOOR_MOM', name: '妈妈的门', type: 'door' },
    DOOR_MOM_LOCK: {
        id: 'DOOR_MOM_LOCK',
        name: '妈妈的门',
        examine: '门是锁着的。你需要钥匙。',
        type: 'door',
        locked: true
    }
};

// 妈妈的声音（在关键时刻触发）
const MOM_VOICE = [
    '【孩子... 快来...】',
    '【妈妈在等你...】',
    '【你怎么还不来？】',
    '【妈妈需要你...】',
    '【你让妈妈失望了...】'
];

// Gaslight触发条件
const GASLIGHT_TRIGGERS = {
    // 达到一定gaslight次数后触发更严重的文字
    3: '【你是不是又在撒谎？】',
    5: '【没有人会相信你】',
    7: '【这都是你的错】'
};
