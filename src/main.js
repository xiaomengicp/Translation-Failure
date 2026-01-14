/**
 * Translation Failure - 心理恐怖RPG
 * 主入口文件
 */

const Game = {
    // 游戏状态
    state: 'title',  // 'title', 'exploration', 'battle', 'transition', 'end'

    // 帧计数
    frameCount: 0,

    // 过渡效果
    transitionAlpha: 0,
    transitionCallback: null,
    transitionCallbackExecuted: false,
    previousState: null,  // 过渡前的状态

    /**
     * 初始化游戏
     */
    init() {
        console.log('Translation Failure - Initializing...');

        // 初始化核心系统
        Renderer.init();
        Input.init();
        Audio.init();

        // 显示标题画面
        this.state = 'title';

        console.log('Game initialized');
    },

    /**
     * 开始新游戏
     */
    startNewGame() {
        this.fadeTransition(() => {
            Exploration.init();
            this.state = 'exploration';
        });
    },

    /**
     * 继续游戏
     */
    continueGame() {
        if (Exploration.loadGame()) {
            this.fadeTransition(() => {
                this.state = 'exploration';
            });
        }
    },

    /**
     * 开始战斗
     */
    startBattle(battleId) {
        this.fadeTransition(() => {
            Battle.start(battleId);
            this.state = 'battle';
        });
    },

    /**
     * 战斗结束回调
     */
    onBattleEnd() {
        this.fadeTransition(() => {
            // TODO: 进入第二幕
            // 现在先显示结束信息
            this.state = 'end';
        });
    },

    /**
     * 淡入淡出过渡
     */
    fadeTransition(callback) {
        this.previousState = this.state;
        this.state = 'transition';
        this.transitionAlpha = 0;
        this.transitionCallbackExecuted = false;
        this.transitionCallback = callback;
    },

    /**
     * 游戏主循环
     */
    loop() {
        this.update();
        this.render();

        Input.endFrame();
        this.frameCount++;

        requestAnimationFrame(() => this.loop());
    },

    /**
     * 更新游戏状态
     */
    update() {
        // 更新渲染器效果（shake, flicker）
        Renderer.update();

        Dialogue.update();

        switch (this.state) {
            case 'title':
                this.updateTitle();
                break;
            case 'exploration':
                Exploration.update();
                break;
            case 'battle':
                Battle.update();
                break;
            case 'transition':
                this.updateTransition();
                break;
        }
    },

    /**
     * 更新标题画面
     */
    updateTitle() {
        if (Input.isJustPressed('confirm')) {
            Audio.confirm();

            // 检查是否有存档
            const hasSave = localStorage.getItem('translation_failure_save');
            if (hasSave) {
                // TODO: 显示"继续/新游戏"选项
                // 现在先直接开始新游戏
                this.startNewGame();
            } else {
                this.startNewGame();
            }
        }
    },

    /**
     * 更新过渡效果
     */
    updateTransition() {
        if (this.transitionAlpha < 1 && !this.transitionCallbackExecuted) {
            // 淡出（变黑）
            this.transitionAlpha += 0.05;
            if (this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                // 执行回调（这会改变内部状态但不改变this.state）
                if (this.transitionCallback) {
                    this.transitionCallback();
                    this.transitionCallbackExecuted = true;
                }
            }
        } else {
            // 淡入（变透明）
            this.transitionAlpha -= 0.05;
            if (this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.transitionCallbackExecuted = false;
                this.transitionCallback = null;
                // 过渡结束 - 但state已经在callback中被设置了
            }
        }
    },

    /**
     * 渲染游戏
     */
    render() {
        switch (this.state) {
            case 'title':
                this.renderTitle();
                break;
            case 'exploration':
                Exploration.render();
                break;
            case 'battle':
                Battle.render();
                break;
            case 'transition':
                this.renderTransition();
                break;
            case 'end':
                this.renderEnd();
                break;
        }
    },

    /**
     * 渲染标题画面
     */
    renderTitle() {
        Renderer.clear(Renderer.COLORS.BLACK);

        // 标题
        Renderer.drawTextCentered('Translation Failure', 100, Renderer.COLORS.WHITE, 32);
        Renderer.drawTextCentered('翻译失败', 140, Renderer.COLORS.BLUE, 20);

        // 内容警告
        Renderer.drawTextCentered('⚠ 内容警告 ⚠', 200, Renderer.COLORS.RED, 14);
        Renderer.drawTextCentered('本游戏涉及家庭创伤、心理虐待、gaslighting等内容', 220, Renderer.COLORS.WHITE, 12);
        Renderer.drawTextCentered('可能触发trauma，请酌情游玩', 240, Renderer.COLORS.WHITE, 12);

        // 开始提示（闪烁）
        if (Math.floor(this.frameCount / 30) % 2 === 0) {
            Renderer.drawTextCentered('按 Z 或 Enter 开始', 300, Renderer.COLORS.WHITE, 16);
        }

        // 版权
        Renderer.drawTextCentered('2025', Renderer.HEIGHT - 30, Renderer.COLORS.BLUE, 12);
    },

    /**
     * 渲染过渡效果
     */
    renderTransition() {
        // 确定要渲染哪个场景
        // 如果callback还没执行，渲染previousState
        // 如果callback已执行，渲染新的state
        const sceneToRender = this.transitionCallbackExecuted ? this.state : this.previousState;

        // 渲染场景
        switch (sceneToRender) {
            case 'exploration':
                Exploration.render();
                break;
            case 'battle':
                Battle.render();
                break;
            case 'title':
                this.renderTitle();
                break;
            case 'end':
                this.renderEnd();
                break;
            default:
                Renderer.clear(Renderer.COLORS.BLACK);
        }

        // 覆盖黑色遮罩
        Renderer.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
        Renderer.ctx.fillRect(0, 0, Renderer.WIDTH, Renderer.HEIGHT);
    },

    /**
     * 渲染结束画面
     */
    renderEnd() {
        Renderer.clear(Renderer.COLORS.BLACK);

        Renderer.drawTextCentered('第一幕结束', 150, Renderer.COLORS.WHITE, 24);
        Renderer.drawTextCentered('To be continued...', 190, Renderer.COLORS.BLUE, 16);

        Renderer.drawTextCentered('感谢游玩', 280, Renderer.COLORS.WHITE, 14);
    }
};

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    Game.init();
    Game.loop();
});
