/**
 * Input - 输入处理系统
 * 支持方向键、WASD、确认/取消
 */

const Input = {
    // 当前按下的按键
    keys: {},

    // 本帧刚按下的按键（用于菜单选择等一次性输入）
    justPressed: {},

    // 按键映射
    KEY_MAP: {
        // 方向键
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'w': 'up',
        'W': 'up',
        's': 'down',
        'S': 'down',
        'a': 'left',
        'A': 'left',
        'd': 'right',
        'D': 'right',

        // 确认/取消
        'z': 'confirm',
        'Z': 'confirm',
        'Enter': 'confirm',
        ' ': 'confirm',
        'x': 'cancel',
        'X': 'cancel',
        'Escape': 'cancel',

        // 暂停
        'p': 'pause',
        'P': 'pause'
    },

    /**
     * 初始化输入系统
     */
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        console.log('Input initialized');
    },

    /**
     * 按键按下
     */
    onKeyDown(e) {
        const action = this.KEY_MAP[e.key];
        if (action) {
            // 防止方向键滚动页面
            e.preventDefault();

            // 如果之前没按下，记录为"刚按下"
            if (!this.keys[action]) {
                this.justPressed[action] = true;
            }
            this.keys[action] = true;
        }
    },

    /**
     * 按键释放
     */
    onKeyUp(e) {
        const action = this.KEY_MAP[e.key];
        if (action) {
            this.keys[action] = false;
        }
    },

    /**
     * 每帧结束时调用，清除"刚按下"状态
     */
    endFrame() {
        this.justPressed = {};
    },

    /**
     * 检查按键是否正在按下
     */
    isDown(action) {
        return !!this.keys[action];
    },

    /**
     * 检查按键是否本帧刚按下
     */
    isJustPressed(action) {
        return !!this.justPressed[action];
    },

    /**
     * 清除某个动作的输入状态（消费输入）
     */
    clear(action) {
        this.justPressed[action] = false;
        this.keys[action] = false;
    },

    /**
     * 获取方向输入（用于移动）
     * @returns {{x: number, y: number}}
     */
    getDirection() {
        let x = 0;
        let y = 0;

        if (this.isJustPressed('left')) x = -1;
        else if (this.isJustPressed('right')) x = 1;

        if (this.isJustPressed('up')) y = -1;
        else if (this.isJustPressed('down')) y = 1;

        return { x, y };
    }
};
