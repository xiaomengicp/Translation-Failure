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
        BLACK: '#000000',      // 主要轮廓、阴影
        WHITE: '#FFFFFF',      // 主要高光、背景
        BLUE: '#4A5F7F',       // 环境、氛围（压抑、冷漠）
        RED: '#C85050'         // 强调、危险、情绪
    },

    // 像素块大小
    TILE_SIZE: 16,

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
     * 清空画布
     * @param {string} color - 背景颜色
     */
    clear(color = this.COLORS.BLACK) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    },

    /**
     * 绘制矩形
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    },

    /**
     * 绘制矩形边框
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    },

    /**
     * 绘制文字
     */
    drawText(text, x, y, color = this.COLORS.WHITE, size = 16, align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px "Courier New", monospace`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
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
