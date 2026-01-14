/**
 * Draw - 绘图工具函数
 * 2-bit像素风格的角色和物品绘制
 */

const Draw = {
    /**
     * 绘制玩家角色（16x16像素小孩）
     */
    player(x, y, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;
        ctx.fillStyle = color;

        // 头部 (圆形区域)
        ctx.fillRect(x + 5, y + 1, 6, 5);
        ctx.fillRect(x + 4, y + 2, 8, 3);

        // 身体
        ctx.fillRect(x + 5, y + 6, 6, 5);

        // 手臂
        ctx.fillRect(x + 3, y + 7, 2, 3);
        ctx.fillRect(x + 11, y + 7, 2, 3);

        // 腿
        ctx.fillRect(x + 5, y + 11, 2, 4);
        ctx.fillRect(x + 9, y + 11, 2, 4);
    },

    /**
     * 绘制妈妈角色（16x16像素，更高大）
     */
    mom(x, y, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;
        ctx.fillStyle = color;

        // 头部
        ctx.fillRect(x + 4, y + 0, 8, 6);
        ctx.fillRect(x + 3, y + 1, 10, 4);

        // 头发（稍暗）
        ctx.fillStyle = Renderer.COLORS.BLUE;
        ctx.fillRect(x + 3, y + 0, 10, 2);

        // 身体（裙子形状）
        ctx.fillStyle = color;
        ctx.fillRect(x + 4, y + 6, 8, 4);
        ctx.fillRect(x + 3, y + 10, 10, 4);

        // 手臂
        ctx.fillRect(x + 1, y + 7, 2, 4);
        ctx.fillRect(x + 13, y + 7, 2, 4);

        // 腿
        ctx.fillRect(x + 4, y + 14, 3, 2);
        ctx.fillRect(x + 9, y + 14, 3, 2);
    },

    /**
     * 绘制物品图标
     */
    item(x, y, type, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;
        ctx.fillStyle = color;

        switch (type) {
            case 'bed':
                // 床（侧视图）
                ctx.fillRect(x + 1, y + 8, 14, 6);
                ctx.fillRect(x + 1, y + 6, 4, 2);  // 枕头
                ctx.fillRect(x + 0, y + 14, 2, 2); // 床脚
                ctx.fillRect(x + 14, y + 14, 2, 2);
                break;

            case 'desk':
                // 书桌
                ctx.fillRect(x + 1, y + 6, 14, 2);  // 桌面
                ctx.fillRect(x + 2, y + 8, 2, 8);   // 左腿
                ctx.fillRect(x + 12, y + 8, 2, 8);  // 右腿
                ctx.fillRect(x + 5, y + 8, 6, 4);   // 抽屉
                break;

            case 'window':
                // 窗户
                ctx.fillRect(x + 2, y + 2, 12, 12);
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 3, y + 3, 4, 4);
                ctx.fillRect(x + 9, y + 3, 4, 4);
                ctx.fillRect(x + 3, y + 9, 4, 4);
                ctx.fillRect(x + 9, y + 9, 4, 4);
                break;

            case 'door':
                // 门
                ctx.fillRect(x + 3, y + 0, 10, 16);
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.fillRect(x + 4, y + 1, 8, 14);
                ctx.fillStyle = color;
                ctx.fillRect(x + 10, y + 7, 2, 2); // 门把手
                break;

            case 'key':
                // 钥匙
                ctx.fillRect(x + 6, y + 4, 4, 4);  // 钥匙头（圆形）
                ctx.fillRect(x + 8, y + 8, 2, 6);  // 钥匙身
                ctx.fillRect(x + 6, y + 12, 2, 2); // 钥匙齿
                break;

            case 'save':
                // 存档点（星形/光点）
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + 7, y + 2, 2, 4);
                ctx.fillRect(x + 5, y + 5, 6, 2);
                ctx.fillRect(x + 3, y + 7, 10, 2);
                ctx.fillRect(x + 5, y + 9, 6, 2);
                ctx.fillRect(x + 7, y + 10, 2, 4);
                break;

            default:
                // 默认方块
                ctx.fillRect(x + 2, y + 2, 12, 12);
        }
    },

    /**
     * 绘制对话框
     */
    dialogBox(y, height, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;
        const padding = 16;

        // 背景
        ctx.fillStyle = Renderer.COLORS.BLACK;
        ctx.fillRect(padding, y, Renderer.WIDTH - padding * 2, height);

        // 边框
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, y, Renderer.WIDTH - padding * 2, height);
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

        // HP（根据剩余比例变色）
        if (ratio > 0.5) {
            ctx.fillStyle = Renderer.COLORS.WHITE;
        } else if (ratio > 0.25) {
            ctx.fillStyle = Renderer.COLORS.BLUE;
        } else {
            ctx.fillStyle = Renderer.COLORS.RED;
        }
        ctx.fillRect(x + 1, y + 1, (width - 2) * ratio, height - 2);

        // 边框
        ctx.strokeStyle = Renderer.COLORS.WHITE;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    },

    /**
     * 绘制选项菜单
     */
    menu(options, selectedIndex, x, y, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;
        const lineHeight = 24;

        options.forEach((option, i) => {
            const isSelected = i === selectedIndex;
            const textColor = isSelected ? Renderer.COLORS.RED : color;

            // 选中指示器
            if (isSelected) {
                Renderer.drawText('>', x - 16, y + i * lineHeight, Renderer.COLORS.RED, 16);
            }

            Renderer.drawText(option, x, y + i * lineHeight, textColor, 16);
        });
    }
};
