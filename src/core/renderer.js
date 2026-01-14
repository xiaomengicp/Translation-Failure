/**
 * Renderer - Canvas渲染系统
 * 2-bit配色：黑、白、低饱和度蓝、稍亮的红
 */

const Renderer = {
    canvas: null,
    ctx: null,

    // 游戏分辨率
    WIDTH: 640,
    HEIGHT: 360,

    // 2-bit 配色方案
    COLORS: {
        BLACK: '#000000',      // 主要轮廓、阴影、背景
        WHITE: '#FFFFFF',      // 主要高光、玩家、UI
        BLUE: '#4A5F7F',       // 环境、氛围（压抑、冷漠）
        RED: '#C85050'         // 强调、危险、情绪、互动
    },

    // 像素块大小
    TILE_SIZE: 16,

    // 屏幕效果状态
    shakeIntensity: 0,
    shakeDecay: 0.9,
    offsetX: 0,
    offsetY: 0,

    // 闪烁效果
    flickerActive: false,
    flickerTimer: 0,
    flickerDuration: 0,

    // 扭曲等级（影响视觉效果强度）
    distortionLevel: 0,

    /**
     * 初始化渲染器
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 关闭抗锯齿，保持像素清晰
        this.ctx.imageSmoothingEnabled = false;

        console.log('Renderer initialized:', this.WIDTH, 'x', this.HEIGHT);
    },

    /**
     * 更新视觉效果
     */
    update() {
        // 更新shake
        if (this.shakeIntensity > 0.5) {
            this.offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            this.offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }

        // 更新flicker
        if (this.flickerActive) {
            this.flickerTimer--;
            if (this.flickerTimer <= 0) {
                this.flickerActive = false;
            }
        }
    },

    /**
     * 触发屏幕抖动
     * @param {number} intensity - 抖动强度 (推荐 5-20)
     */
    shake(intensity = 10) {
        this.shakeIntensity = intensity;
    },

    /**
     * 触发画面闪烁
     * @param {number} duration - 持续帧数
     */
    flicker(duration = 10) {
        this.flickerActive = true;
        this.flickerTimer = duration;
        this.flickerDuration = duration;
    },

    /**
     * 清空画布
     * @param {string} color - 背景颜色
     */
    clear(color = this.COLORS.BLACK) {
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);

        // 闪烁效果 - 随机反转颜色
        if (this.flickerActive && Math.random() > 0.5) {
            color = this.COLORS.WHITE;
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(-10, -10, this.WIDTH + 20, this.HEIGHT + 20);
        this.ctx.restore();
    },

    /**
     * 绘制矩形
     */
    drawRect(x, y, width, height, color) {
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    },

    /**
     * 绘制矩形边框
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.restore();
    },

    /**
     * 绘制文字
     */
    drawText(text, x, y, color = this.COLORS.WHITE, size = 16, align = 'left') {
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px "Courier New", monospace`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    },

    /**
     * 绘制居中文字
     */
    drawTextCentered(text, y, color = this.COLORS.WHITE, size = 16) {
        this.drawText(text, this.WIDTH / 2, y, color, size, 'center');
    },

    /**
     * 获取网格位置（像素坐标 → 网格坐标）
     */
    toGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.TILE_SIZE),
            y: Math.floor(pixelY / this.TILE_SIZE)
        };
    },

    /**
     * 获取像素位置（网格坐标 → 像素坐标）
     */
    toPixel(gridX, gridY) {
        return {
            x: gridX * this.TILE_SIZE,
            y: gridY * this.TILE_SIZE
        };
    }
};
