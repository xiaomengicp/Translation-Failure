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

        // 总是更新过渡效果，独立于状态
        if (this.state === 'transition' || this.transitionAlpha > 0) {
            this.updateTransition();
        }

        // 如果处于全黑过渡中，且回调已执行（意味着底层状态已变），
        // 或者刚开始过渡，我们要根据current state停止底层逻辑吗？
        // 简单处理：如果alpha >= 1，暂停底层逻辑更新
        if (this.transitionAlpha >= 1) {
            return;
        }

        // 如果state是transition，说明正在淡出，尚未切换，此时仍更新previousState逻辑？
        // 为了简化，我们只在非transition状态下更新底层逻辑
        if (this.state !== 'transition') {
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
                case 'end':
                    // End screen logic if any
                    break;
            }
        } else if (this.previousState) {
            // 如果还在淡出阶段，继续运行上一个状态的逻辑（可选，或者暂停）
            // 暂停比较安全
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
        // 1. 渲染底层游戏画面
        // 如果是在transition状态，我们需要决定渲染哪个底层画面
        // 逻辑：如果callback还没执行（淡出中），渲染previousState
        // 如果callback已执行（淡入中），渲染当前的state

        let renderState = this.state;
        if (this.state === 'transition') {
            renderState = this.transitionCallbackExecuted ? this.state : this.previousState;
            // 注意：如果callback还没执行，this.state是transition，所以需要用previousState
            // 如果callback执行了，callback里面可能会把this.state改成battle
            // 但是 updateTransition 逻辑里面 state 还是 transition 吗？
            // 看 callback 实现：
            // startBattle: this.state = 'battle'
            // 所以一旦callback执行，this.state 变成了 'battle'。
            // 所以如果 this.state === 'transition'，那一定还没切状态，或者是 faded out 状态。

            if (!this.transitionCallbackExecuted) {
                renderState = this.previousState;
            }
        }

        switch (renderState) {
            case 'title':
                this.renderTitle();
                break;
            case 'exploration':
                Exploration.render();
                break;
            case 'battle':
                Battle.render();
                break;
            case 'end':
                this.renderEnd();
                break;
            case 'transition':
                // 如果 somehow 还是 transition 且没找到 previousState...
                Renderer.clear(Renderer.COLORS.BLACK);
                break;
        }

        // 2. 渲染过渡遮罩 (如果在过渡中)
        if (this.state === 'transition' || this.transitionAlpha > 0) {
            Renderer.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            Renderer.ctx.fillRect(0, 0, Renderer.WIDTH, Renderer.HEIGHT);
        }
    },

    /**
     * 渲染过渡效果 (过时，已整合进 render)
     */
    renderTransition() {
        // Deprecated
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
