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
     * 绘制地板（有纹理的黑色）
     */
    floor(x, y, size) {
        const ctx = Renderer.ctx;

        // 基础黑色
        ctx.fillStyle = Renderer.COLORS.BLACK;
        ctx.fillRect(x, y, size, size);

        // 基于位置的伪随机
        const rand = (x * 11 + y * 17) % 100;

        // 角落有一点蓝色暗示
        if (rand < 30) {
            ctx.fillStyle = 'rgba(74, 95, 127, 0.15)';
            ctx.fillRect(x, y, size, 2);
        }

        // 偶尔有一些划痕
        if (rand > 20 && rand < 50) {
            ctx.strokeStyle = 'rgba(74, 95, 127, 0.3)';  // 淡蓝色划痕
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 4, y + 4);
            ctx.lineTo(x + size - 4, y + size - 4);
            ctx.stroke();
        }

        // 偶尔有灰尘点
        if (rand > 60) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x + 10, y + 10, 3, 3);
        }

        // 边缘线
        if (rand > 80) {
            ctx.strokeStyle = 'rgba(74, 95, 127, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        }
    },

    /**
     * 绘制墙壁（蓝色，不规则，有纹理）
     */
    wall(x, y, size) {
        const ctx = Renderer.ctx;

        // 主体 - 稍微深一点的蓝
        this.roughRect(x + 1, y + 1, size - 2, size - 2, Renderer.COLORS.BLUE);

        // 随机添加纹理细节
        const rand = (x * 7 + y * 13) % 100;  // 基于位置的伪随机

        // 边缘高光（白色细线）
        if (rand < 40) {
            this.roughLine(x, y, x + size, y, Renderer.COLORS.WHITE, 1);
        }
        if (rand > 30 && rand < 70) {
            this.roughLine(x, y, x, y + size, Renderer.COLORS.WHITE, 1);
        }

        // 裂纹（黑色细线）
        if (rand > 80) {
            const crackX = x + 4 + (rand % 20);
            const crackY = y + 4 + ((rand * 3) % 20);
            this.roughLine(crackX, crackY, crackX + 8, crackY + 12, Renderer.COLORS.BLACK, 1);
        }

        // 污渍
        if (rand > 60 && rand < 75) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(x + 10 + this.jitter(2), y + 15 + this.jitter(2), 12, 8);
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
        const cx = x + size / 2;
        const cy = y + size / 2;

        switch (itemId) {
            case 'BED':
                // 床 - 床垫 + 枕头 + 被子皱褶
                // 床架
                this.roughRect(x + 2, y + size - 12, size - 4, 10, Renderer.COLORS.BLUE);
                // 床垫
                this.roughRect(x + 4, y + size / 2 - 2, size - 8, size / 2 - 8, Renderer.COLORS.RED);
                // 枕头
                this.roughRect(x + 6, y + size / 2 - 6, 12, 8, Renderer.COLORS.WHITE);
                // 被子皱褶
                this.roughLine(x + 10, y + size / 2, x + 14, y + size - 14, Renderer.COLORS.BLACK, 1);
                this.roughLine(x + 20, y + size / 2 + 2, x + 26, y + size - 12, Renderer.COLORS.BLACK, 1);
                break;

            case 'DESK':
                // 书桌 + 抽屉 + 上面的东西
                // 桌面
                this.roughRect(x + 2, y + size / 2 - 4, size - 4, 6, Renderer.COLORS.BLUE);
                // 桌腿
                this.roughLine(x + 6, y + size / 2, x + 6, y + size - 2, Renderer.COLORS.BLUE, 3);
                this.roughLine(x + size - 6, y + size / 2, x + size - 6, y + size - 2, Renderer.COLORS.BLUE, 3);
                // 抽屉把手
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + size / 2 - 3 + this.jitter(), y + size / 2 + 6 + this.jitter(), 6, 3);
                // 桌上的东西（书/纸）
                this.roughRect(x + 8 + this.jitter(2), y + size / 2 - 10, 8, 6, Renderer.COLORS.WHITE);
                this.roughLine(x + 10, y + size / 2 - 8, x + 14, y + size / 2 - 6, Renderer.COLORS.BLACK, 1);
                break;

            case 'PHOTO':
                // 照片 - 倾斜的相框 + 裂纹 + 模糊的脸
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(0.15 + this.jitter(0.05));
                // 相框
                this.roughRect(-12, -14, 24, 28, Renderer.COLORS.BLUE);
                // 照片本身
                this.roughRect(-10, -12, 20, 24, Renderer.COLORS.WHITE);
                // 人影（模糊）
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.fillRect(-6 + this.jitter(), -4 + this.jitter(), 4, 8);
                ctx.fillRect(2 + this.jitter(), -2 + this.jitter(), 4, 6);
                // 被抹掉的脸
                this.roughLine(-4, -4, 4, 0, Renderer.COLORS.RED, 2);
                ctx.restore();
                break;

            case 'KNIFE':
                // 刀 - 刀刃 + 刀柄 + 反光
                // 刀柄
                this.roughRect(x + 4, y + size - 14, 8, 12, Renderer.COLORS.BLUE);
                // 刀刃
                ctx.fillStyle = Renderer.COLORS.WHITE;
                ctx.beginPath();
                ctx.moveTo(x + 8 + this.jitter(), y + size - 14);
                ctx.lineTo(x + size - 6 + this.jitter(), y + 6 + this.jitter());
                ctx.lineTo(x + 12 + this.jitter(), y + size - 14);
                ctx.closePath();
                ctx.fill();
                // 血迹暗示
                this.roughLine(x + 14, y + 12, x + 18, y + 18, Renderer.COLORS.RED, 1);
                break;

            case 'MIRROR':
                // 镜子 - 镜框 + 反光 + 裂纹 + 模糊影子
                // 镜框
                this.roughRect(x + 4, y + 2, size - 8, size - 4, Renderer.COLORS.BLUE);
                // 镜面
                this.roughRect(x + 6, y + 4, size - 12, size - 8, Renderer.COLORS.WHITE);
                // 裂纹（多条）
                this.roughLine(x + 10, y + 6, x + size - 8, y + size - 10, Renderer.COLORS.BLACK, 1);
                this.roughLine(x + size / 2, y + 8, x + 12, y + size - 8, Renderer.COLORS.BLACK, 1);
                // 影子（模糊的轮廓）
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(cx - 4 + this.jitter(2), cy - 2 + this.jitter(2), 8, 12);
                break;

            case 'KEY':
                // 钥匙 - 圆环 + 齿 + 闪光
                // 圆环
                ctx.strokeStyle = Renderer.COLORS.RED;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx - 6 + this.jitter(), cy - 4 + this.jitter(), 8, 0, Math.PI * 2);
                ctx.stroke();
                // 钥匙身体
                this.roughLine(cx - 2, cy, cx + 12, cy + 2, Renderer.COLORS.RED, 3);
                // 钥匙齿
                this.roughLine(cx + 8, cy, cx + 8, cy + 6, Renderer.COLORS.RED, 2);
                this.roughLine(cx + 12, cy, cx + 12, cy + 4, Renderer.COLORS.RED, 2);
                // 闪光
                ctx.fillStyle = Renderer.COLORS.WHITE;
                ctx.fillRect(cx - 10 + this.jitter(), cy - 8 + this.jitter(), 3, 3);
                break;

            case 'SAVE':
                // 存档点 - 温暖的光 + 脉动效果
                const pulse = Math.sin(Date.now() / 200) * 2;
                // 外圈光晕
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.arc(cx, cy, 18 + pulse, 0, Math.PI * 2);
                ctx.fill();
                // 中圈
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(cx, cy, 12 + pulse / 2, 0, Math.PI * 2);
                ctx.fill();
                // 核心
                ctx.fillStyle = Renderer.COLORS.WHITE;
                ctx.beginPath();
                ctx.arc(cx + this.jitter(1), cy + this.jitter(1), 6, 0, Math.PI * 2);
                ctx.fill();
                break;

            default:
                // 默认 - 问号
                ctx.fillStyle = Renderer.COLORS.RED;
                this.roughRect(cx - 6, cy - 8, 12, 16, Renderer.COLORS.RED);
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.font = '12px monospace';
                ctx.fillText('?', cx - 3, cy + 4);
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
