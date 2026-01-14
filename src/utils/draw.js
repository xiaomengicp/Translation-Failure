/**
 * Draw - 绘图工具函数
 * 
 * 视觉风格：手绘涂鸦像素
 * - 线条不规整，边缘抖动
 * - 形状不完美，像是随手画的
 * - 粗糙的像素感，不是精致的像素艺术
 * - 恐怖感来自空间不可信，而不是怪物
 */

const Draw = {
    /**
     * 获取抖动偏移（手绘效果）
     */
    jitter(amount = 2) {
        return (Math.random() - 0.5) * amount;
    },

    /**
     * 绘制不规则矩形（手绘风格）
     */
    roughRect(x, y, w, h, color) {
        const ctx = Renderer.ctx;
        ctx.fillStyle = color;

        // 不完美的边缘 - 每条边都有轻微抖动
        ctx.beginPath();
        ctx.moveTo(x + this.jitter(), y + this.jitter());
        ctx.lineTo(x + w + this.jitter(), y + this.jitter(1));
        ctx.lineTo(x + w + this.jitter(1), y + h + this.jitter());
        ctx.lineTo(x + this.jitter(1), y + h + this.jitter(1));
        ctx.closePath();
        ctx.fill();
    },

    /**
     * 绘制抖动的线条
     */
    roughLine(x1, y1, x2, y2, color, width = 2) {
        const ctx = Renderer.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;

        ctx.beginPath();
        ctx.moveTo(x1 + this.jitter(), y1 + this.jitter());

        // 中间加几个抖动点
        const steps = 3;
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const mx = x1 + (x2 - x1) * t + this.jitter(3);
            const my = y1 + (y2 - y1) * t + this.jitter(3);
            ctx.lineTo(mx, my);
        }

        ctx.lineTo(x2 + this.jitter(), y2 + this.jitter());
        ctx.stroke();
    },

    /**
     * 绘制墙壁（蓝色，不规则）
     */
    wall(x, y, size) {
        const ctx = Renderer.ctx;

        // 主体
        this.roughRect(x + 1, y + 1, size - 2, size - 2, Renderer.COLORS.BLUE);

        // 边缘高光（白色细线，不规则）
        if (Math.random() > 0.3) {
            this.roughLine(x, y, x + size, y, Renderer.COLORS.WHITE, 1);
        }
        if (Math.random() > 0.3) {
            this.roughLine(x, y, x, y + size, Renderer.COLORS.WHITE, 1);
        }
    },

    /**
     * 绘制门（白色，明显）
     */
    door(x, y, size) {
        const ctx = Renderer.ctx;
        const margin = 4;

        // 门框
        this.roughRect(x + margin, y + margin, size - margin * 2, size - margin * 2, Renderer.COLORS.WHITE);

        // 门里面是黑的
        this.roughRect(x + margin + 3, y + margin + 3, size - margin * 2 - 6, size - margin * 2 - 6, Renderer.COLORS.BLACK);

        // 门把手（红点）
        const handleX = x + size - margin - 8;
        const handleY = y + size / 2;
        ctx.fillStyle = Renderer.COLORS.RED;
        ctx.fillRect(handleX + this.jitter(1), handleY + this.jitter(1), 4, 4);
    },

    /**
     * 绘制物品（红色，危险感）
     */
    item(x, y, size, itemId) {
        const ctx = Renderer.ctx;
        const item = ITEMS[itemId];

        // 所有物品都用红色表示危险/可交互
        // 但形状简单粗糙

        const cx = x + size / 2;
        const cy = y + size / 2;

        switch (itemId) {
            case 'BED':
                // 床 - 一个歪歪扭扭的矩形
                this.roughRect(x + 4, y + size / 2, size - 8, size / 2 - 4, Renderer.COLORS.RED);
                break;

            case 'DESK':
                // 书桌 - 一条线加支撑
                this.roughLine(x + 4, y + size / 2, x + size - 4, y + size / 2, Renderer.COLORS.RED, 3);
                this.roughLine(x + 8, y + size / 2, x + 8, y + size - 4, Renderer.COLORS.RED, 2);
                this.roughLine(x + size - 8, y + size / 2, x + size - 8, y + size - 4, Renderer.COLORS.RED, 2);
                break;

            case 'PHOTO':
                // 照片 - 一个倾斜的方框
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(0.1 + this.jitter(0.05));
                this.roughRect(-8, -10, 16, 20, Renderer.COLORS.RED);
                ctx.restore();
                break;

            case 'KNIFE':
                // 刀 - 一条斜线
                this.roughLine(x + 6, y + 6, x + size - 6, y + size - 6, Renderer.COLORS.RED, 3);
                break;

            case 'MIRROR':
                // 镜子 - 一个椭圆形（用矩形近似）
                this.roughRect(x + 6, y + 4, size - 12, size - 8, Renderer.COLORS.RED);
                // 裂纹
                this.roughLine(x + 10, y + 8, x + size - 10, y + size - 8, Renderer.COLORS.BLACK, 1);
                break;

            case 'KEY':
                // 钥匙 - 一个圆加一条线
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.beginPath();
                ctx.arc(cx - 4 + this.jitter(), cy - 4 + this.jitter(), 6, 0, Math.PI * 2);
                ctx.fill();
                this.roughLine(cx, cy, cx + 10, cy + 8, Renderer.COLORS.RED, 2);
                break;

            case 'SAVE':
                // 存档点 - 唯一温暖的光
                // 用白色，不是红色
                ctx.fillStyle = Renderer.COLORS.WHITE;
                ctx.beginPath();
                ctx.arc(cx + this.jitter(), cy + this.jitter(), 8, 0, Math.PI * 2);
                ctx.fill();
                // 光晕
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(cx, cy, 14, 0, Math.PI * 2);
                ctx.fill();
                break;

            default:
                // 默认 - 一个问号形状的点
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(cx - 4 + this.jitter(), cy - 4 + this.jitter(), 8, 8);
        }
    },

    /**
     * 绘制玩家（白色小人，简单）
     */
    player(x, y, size) {
        const ctx = Renderer.ctx;
        const cx = x + size / 2;
        const cy = y + size / 2;

        // 玩家是一个简单的白色形状
        // 头
        ctx.fillStyle = Renderer.COLORS.WHITE;
        ctx.beginPath();
        ctx.arc(cx + this.jitter(1), cy - 6 + this.jitter(1), 6, 0, Math.PI * 2);
        ctx.fill();

        // 身体
        this.roughRect(cx - 4, cy, 8, 12, Renderer.COLORS.WHITE);

        // 眼睛（黑点）
        ctx.fillStyle = Renderer.COLORS.BLACK;
        ctx.fillRect(cx - 3 + this.jitter(0.5), cy - 8 + this.jitter(0.5), 2, 2);
        ctx.fillRect(cx + 1 + this.jitter(0.5), cy - 8 + this.jitter(0.5), 2, 2);
    },

    /**
     * 绘制对话框
     */
    dialogBox(y, height, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;
        const padding = 16;
        const w = Renderer.WIDTH - padding * 2;

        // 背景
        ctx.fillStyle = Renderer.COLORS.BLACK;
        ctx.fillRect(padding, y, w, height);

        // 边框（手绘风格）
        this.roughLine(padding, y, padding + w, y, color, 2);
        this.roughLine(padding, y + height, padding + w, y + height, color, 2);
        this.roughLine(padding, y, padding, y + height, color, 2);
        this.roughLine(padding + w, y, padding + w, y + height, color, 2);
    },

    /**
     * 绘制HP条
     */
    hpBar(x, y, current, max, width = 100, height = 12) {
        const ctx = Renderer.ctx;
        const ratio = current / max;

        // 背景
        ctx.fillStyle = Renderer.COLORS.BLACK;
        ctx.fillRect(x, y, width, height);

        // HP
        let barColor;
        if (ratio > 0.5) {
            barColor = Renderer.COLORS.WHITE;
        } else if (ratio > 0.25) {
            barColor = Renderer.COLORS.BLUE;
        } else {
            barColor = Renderer.COLORS.RED;
        }

        this.roughRect(x + 1, y + 1, (width - 2) * ratio, height - 2, barColor);

        // 边框
        this.roughLine(x, y, x + width, y, Renderer.COLORS.WHITE, 1);
        this.roughLine(x, y + height, x + width, y + height, Renderer.COLORS.WHITE, 1);
        this.roughLine(x, y, x, y + height, Renderer.COLORS.WHITE, 1);
        this.roughLine(x + width, y, x + width, y + height, Renderer.COLORS.WHITE, 1);
    },

    /**
     * 绘制选项菜单
     */
    menu(options, selectedIndex, x, y, color = Renderer.COLORS.WHITE) {
        const lineHeight = 24;

        options.forEach((option, i) => {
            const isSelected = i === selectedIndex;
            const textColor = isSelected ? Renderer.COLORS.RED : color;

            if (isSelected) {
                Renderer.drawText('>', x - 16 + this.jitter(1), y + i * lineHeight + this.jitter(1), Renderer.COLORS.RED, 16);
            }

            Renderer.drawText(option, x + this.jitter(0.5), y + i * lineHeight + this.jitter(0.5), textColor, 16);
        });
    }
};
