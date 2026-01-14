/**
 * Dialogue - 对话系统
 * 处理对话框显示、选项菜单、gaslight文字
 */

const Dialogue = {
    // 状态
    active: false,
    lines: [],
    currentLine: 0,
    selectedOption: 0,

    // 选项模式（用于negotiate等）
    optionMode: false,
    options: [],
    onOptionSelect: null,

    // Gaslight效果
    gaslightText: null,
    gaslightAlpha: 0,
    gaslightBlocking: false,  // 阻止输入

    // 妈妈声音效果
    momVoice: null,
    momVoiceTimer: 0,

    /**
     * 显示对话
     * @param {string[]} lines - 对话文字数组
     * @param {Function} onComplete - 完成回调
     */
    show(lines, onComplete = null) {
        this.active = true;
        this.lines = lines;
        this.currentLine = 0;
        this.onComplete = onComplete;
        this.optionMode = false;
        this.options = [];

        Audio.confirm();
    },

    /**
     * 显示选项菜单
     * @param {string} prompt - 提示文字
     * @param {string[]} options - 选项列表
     * @param {Function} onSelect - 选择回调 (index) => {}
     */
    showOptions(prompt, options, onSelect) {
        this.active = true;
        this.lines = [prompt];
        this.currentLine = 0;
        this.optionMode = true;
        this.options = options;
        this.selectedOption = 0;
        this.onOptionSelect = onSelect;
    },

    /**
     * 显示Gaslight文字
     * @param {string} text - Gaslight文字
     */
    showGaslight(text) {
        this.gaslightText = text;
        this.gaslightAlpha = 1;
        this.gaslightBlocking = true;  // 短暂阻止输入
        Audio.gaslight();

        // 1秒后取消阻止
        setTimeout(() => {
            this.gaslightBlocking = false;
        }, 1000);
    },

    /**
     * 检查是否阻止输入
     */
    isBlocking() {
        return this.active || this.gaslightBlocking;
    },

    /**
     * 显示妈妈声音
     * @param {string} text - 妈妈的声音
     */
    showMomVoice(text) {
        this.momVoice = text;
        this.momVoiceTimer = 180;  // 3秒
    },

    /**
     * 更新对话状态
     */
    update() {
        // 更新gaslight淡出
        if (this.gaslightAlpha > 0) {
            this.gaslightAlpha -= 0.01;
        }

        // 更新妈妈声音
        if (this.momVoiceTimer > 0) {
            this.momVoiceTimer--;
            if (this.momVoiceTimer <= 0) {
                this.momVoice = null;
            }
        }

        if (!this.active) return;

        // 选项模式
        if (this.optionMode && this.currentLine >= this.lines.length) {
            if (Input.isJustPressed('up')) {
                this.selectedOption = Math.max(0, this.selectedOption - 1);
                Audio.menuMove();
            }
            if (Input.isJustPressed('down')) {
                this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
                Audio.menuMove();
            }
            if (Input.isJustPressed('confirm')) {
                // 消费输入，防止Exploration再次处理
                if (Input.clear) Input.clear('confirm');

                Audio.confirm();
                const callback = this.onOptionSelect;
                const selected = this.selectedOption;
                this.close();
                if (callback) callback(selected);
            }
            return;
        }

        // 普通对话模式：按确认继续
        if (Input.isJustPressed('confirm')) {
            // 消费输入
            if (Input.clear) Input.clear('confirm');

            this.currentLine++;

            if (this.currentLine >= this.lines.length) {
                if (!this.optionMode) {
                    const callback = this.onComplete;
                    this.close();
                    if (callback) callback();
                }
            } else {
                Audio.confirm();
            }
        }
    },

    /**
     * 关闭对话
     */
    close() {
        this.active = false;
        this.lines = [];
        this.currentLine = 0;
        this.optionMode = false;
        this.options = [];
    },

    /**
     * 渲染对话
     */
    render() {
        // 渲染妈妈声音（屏幕上方）
        if (this.momVoice) {
            const alpha = Math.min(1, this.momVoiceTimer / 60);
            Renderer.ctx.globalAlpha = alpha;
            Renderer.drawTextCentered(this.momVoice, 40, Renderer.COLORS.BLUE, 14);
            Renderer.ctx.globalAlpha = 1;
        }

        // 渲染gaslight文字（屏幕中央偏上）
        if (this.gaslightText && this.gaslightAlpha > 0) {
            Renderer.ctx.globalAlpha = this.gaslightAlpha;

            // 分行显示
            const lines = this.gaslightText.split('\n');
            lines.forEach((line, i) => {
                Renderer.drawTextCentered(line, 80 + i * 20, Renderer.COLORS.RED, 16);
            });

            Renderer.ctx.globalAlpha = 1;
        }

        if (!this.active) return;

        // 对话框
        const boxY = Renderer.HEIGHT - 100;
        const boxHeight = 80;
        Draw.dialogBox(boxY, boxHeight);

        // 当前对话文字
        if (this.currentLine < this.lines.length) {
            const text = this.lines[this.currentLine];
            const lines = text.split('\n');
            lines.forEach((line, i) => {
                Renderer.drawText(line, 32, boxY + 16 + i * 20, Renderer.COLORS.WHITE, 14);
            });

            // 继续提示
            const promptY = boxY + boxHeight - 20;
            Renderer.drawText('▼', Renderer.WIDTH - 40, promptY, Renderer.COLORS.WHITE, 12);
        }

        // 选项模式
        if (this.optionMode && this.currentLine >= this.lines.length) {
            // 选项背景
            const optionBoxY = Renderer.HEIGHT - 100;
            Draw.dialogBox(optionBoxY, 80);

            // 显示选项
            Draw.menu(this.options, this.selectedOption, 50, optionBoxY + 16);
        }
    }
};
