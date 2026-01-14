/**
 * Audio - 音效系统
 * 使用Web Audio API生成8-bit风格音效
 */

const Audio = {
    context: null,
    enabled: true,

    /**
     * 初始化音频系统
     */
    init() {
        // 延迟创建AudioContext（需要用户交互后才能播放）
        this.context = null;
        console.log('Audio system ready (will initialize on first interaction)');
    },

    /**
     * 确保AudioContext已创建
     */
    ensureContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.context;
    },

    /**
     * 播放音效
     * @param {number} frequency - 频率(Hz)
     * @param {string} type - 波形类型 ('square', 'sine', 'sawtooth', 'triangle')
     * @param {number} duration - 持续时间(秒)
     * @param {number} volume - 音量(0-1)
     */
    playTone(frequency, type = 'square', duration = 0.1, volume = 0.1) {
        if (!this.enabled) return;

        try {
            const ctx = this.ensureContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.value = frequency;

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    },

    // ========== 游戏音效 ==========

    /**
     * 移动音效
     */
    step() {
        this.playTone(200, 'square', 0.05, 0.08);
    },

    /**
     * 确认音效
     */
    confirm() {
        this.playTone(440, 'square', 0.1, 0.1);
        setTimeout(() => this.playTone(880, 'square', 0.1, 0.1), 50);
    },

    /**
     * 取消音效
     */
    cancel() {
        this.playTone(220, 'square', 0.15, 0.1);
    },

    /**
     * 菜单选择音效
     */
    menuMove() {
        this.playTone(330, 'square', 0.05, 0.08);
    },

    /**
     * 物品坏掉音效
     */
    itemBreak() {
        this.playTone(150, 'sawtooth', 0.2, 0.15);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.3, 0.1), 100);
    },

    /**
     * 受到伤害音效
     */
    hurt() {
        this.playTone(100, 'sawtooth', 0.1, 0.15);
        setTimeout(() => this.playTone(80, 'sawtooth', 0.15, 0.1), 50);
    },

    /**
     * 钥匙飞走音效
     */
    keyFly() {
        this.playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.1, 0.08), 80);
        setTimeout(() => this.playTone(1000, 'sine', 0.15, 0.05), 160);
    },

    /**
     * Gaslight文字出现音效
     */
    gaslight() {
        this.playTone(180, 'triangle', 0.3, 0.12);
    },

    /**
     * 战斗开始音效
     */
    battleStart() {
        this.playTone(220, 'square', 0.15, 0.12);
        setTimeout(() => this.playTone(330, 'square', 0.15, 0.12), 150);
        setTimeout(() => this.playTone(440, 'square', 0.2, 0.12), 300);
    },

    /**
     * 存档音效
     */
    save() {
        this.playTone(523, 'sine', 0.15, 0.1);
        setTimeout(() => this.playTone(659, 'sine', 0.15, 0.1), 100);
        setTimeout(() => this.playTone(784, 'sine', 0.2, 0.1), 200);
    },

    /**
     * 播放背景音乐 (占位符)
     */
    playBgm(trackName) {
        // TODO: Implement simple BGM loop
        console.log('Playing BGM:', trackName);
    },

    /**
     * 闪烁音效
     */
    flicker() {
        this.playTone(50, 'sawtooth', 0.05, 0.05);
        this.playTone(60, 'sawtooth', 0.05, 0.05);
    },

    /**
     * 噪音音效
     */
    noise() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.playTone(100 + Math.random() * 500, 'sawtooth', 0.05, 0.05), i * 20);
        }
    }
};
