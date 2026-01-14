/**
 * Draw - 绘图工具函数
 * 2-bit像素风格的角色和物品绘制
 * 使用四色：黑、白、蓝（环境）、红（危险/互动）
 */

const Draw = {
    /**
     * 绘制房间地板（棋盘格纹理）
     */
    roomFloor(x, y, width, height, tileSize) {
        const ctx = Renderer.ctx;
        const tilesX = Math.ceil(width / tileSize);
        const tilesY = Math.ceil(height / tileSize);

        for (let ty = 0; ty < tilesY; ty++) {
            for (let tx = 0; tx < tilesX; tx++) {
                const isEven = (tx + ty) % 2 === 0;
                ctx.fillStyle = isEven ? Renderer.COLORS.BLUE : '#3D4F6B';
                ctx.fillRect(
                    x + tx * tileSize,
                    y + ty * tileSize,
                    tileSize,
                    tileSize
                );
            }
        }
    },

    /**
     * 绘制房间墙壁（带纹理）
     */
    roomWalls(x, y, width, height, wallThickness = 4) {
        const ctx = Renderer.ctx;

        // 墙壁主体 - 深色
        ctx.fillStyle = '#1A1A2E';

        // 上墙
        ctx.fillRect(x - wallThickness, y - wallThickness, width + wallThickness * 2, wallThickness);
        // 下墙
        ctx.fillRect(x - wallThickness, y + height, width + wallThickness * 2, wallThickness);
        // 左墙
        ctx.fillRect(x - wallThickness, y, wallThickness, height);
        // 右墙
        ctx.fillRect(x + width, y, wallThickness, height);

        // 墙壁高光线
        ctx.fillStyle = Renderer.COLORS.WHITE;
        ctx.fillRect(x, y, width, 1);
        ctx.fillRect(x, y, 1, height);

        // 墙角装饰
        ctx.fillStyle = Renderer.COLORS.WHITE;
        ctx.fillRect(x - 2, y - 2, 4, 4);
        ctx.fillRect(x + width - 2, y - 2, 4, 4);
        ctx.fillRect(x - 2, y + height - 2, 4, 4);
        ctx.fillRect(x + width - 2, y + height - 2, 4, 4);
    },

    /**
     * 绘制阴影
     */
    shadow(x, y, width, height) {
        const ctx = Renderer.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 2, y + 2, width, height);
    },

    /**
     * 绘制玩家角色（16x16像素小孩）
     */
    player(x, y, color = Renderer.COLORS.WHITE) {
        const ctx = Renderer.ctx;

        // 阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + 3, y + 14, 10, 3);

        ctx.fillStyle = color;

        // 头部 (圆形区域)
        ctx.fillRect(x + 5, y + 1, 6, 5);
        ctx.fillRect(x + 4, y + 2, 8, 3);

        // 眼睛（小孩的眼神）
        ctx.fillStyle = Renderer.COLORS.BLACK;
        ctx.fillRect(x + 5, y + 3, 2, 2);
        ctx.fillRect(x + 9, y + 3, 2, 2);

        ctx.fillStyle = color;
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

        switch (type) {
            case 'bed':
                // 床架 - 用蓝色
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 0, y + 10, 16, 6);
                // 床垫 - 白色
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 8, 14, 4);
                // 枕头
                ctx.fillRect(x + 1, y + 6, 4, 3);
                // 床脚
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.fillRect(x + 0, y + 14, 2, 2);
                ctx.fillRect(x + 14, y + 14, 2, 2);
                // 褶皱细节
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 6, y + 9, 1, 2);
                ctx.fillRect(x + 10, y + 9, 1, 2);
                break;

            case 'desk':
                // 阴影
                this.shadow(x + 1, y + 6, 14, 10);
                // 书桌面
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 4, 14, 3);
                // 桌腿
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 2, y + 7, 2, 9);
                ctx.fillRect(x + 12, y + 7, 2, 9);
                // 抽屉
                ctx.fillStyle = color;
                ctx.fillRect(x + 5, y + 7, 6, 5);
                // 抽屉把手 - 红色（可互动）
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + 7, y + 9, 2, 1);
                break;

            case 'window':
                // 窗框
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 1, 14, 14);
                // 玻璃 - 蓝色（外面的天空/黑暗）
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 2, y + 2, 5, 5);
                ctx.fillRect(x + 9, y + 2, 5, 5);
                ctx.fillRect(x + 2, y + 9, 5, 5);
                ctx.fillRect(x + 9, y + 9, 5, 5);
                // 窗格
                ctx.fillStyle = color;
                ctx.fillRect(x + 7, y + 2, 2, 12);
                ctx.fillRect(x + 2, y + 7, 12, 2);
                break;

            case 'door':
                // 门框
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 2, y + 0, 12, 16);
                // 门板
                ctx.fillStyle = color;
                ctx.fillRect(x + 3, y + 1, 10, 14);
                // 门的装饰线
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 5, y + 3, 6, 4);
                ctx.fillRect(x + 5, y + 9, 6, 4);
                // 门把手 - 红色（可互动）
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + 10, y + 7, 2, 3);
                break;

            case 'key':
                // 钥匙 - 红色（重要物品）
                ctx.fillStyle = Renderer.COLORS.RED;
                // 钥匙头
                ctx.fillRect(x + 5, y + 3, 6, 6);
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.fillRect(x + 7, y + 5, 2, 2);
                // 钥匙身
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + 7, y + 9, 2, 5);
                // 钥匙齿
                ctx.fillRect(x + 5, y + 12, 2, 2);
                ctx.fillRect(x + 9, y + 11, 2, 2);
                break;

            case 'save':
                // 存档点 - 发光效果
                // 光晕
                ctx.fillStyle = 'rgba(200, 80, 80, 0.3)';
                ctx.fillRect(x + 2, y + 2, 12, 12);
                // 星形
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + 7, y + 1, 2, 4);
                ctx.fillRect(x + 5, y + 4, 6, 2);
                ctx.fillRect(x + 3, y + 6, 10, 3);
                ctx.fillRect(x + 5, y + 9, 6, 2);
                ctx.fillRect(x + 7, y + 10, 2, 4);
                // 中心高光
                ctx.fillStyle = Renderer.COLORS.WHITE;
                ctx.fillRect(x + 7, y + 7, 2, 2);
                break;

            case 'sofa':
                // 沙发底座
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 0, y + 8, 16, 6);
                // 坐垫
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 6, 14, 4);
                // 靠背
                ctx.fillRect(x + 0, y + 2, 3, 8);
                ctx.fillRect(x + 13, y + 2, 3, 8);
                // 阴影
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.fillRect(x + 0, y + 14, 16, 2);
                break;

            case 'tv':
                // 电视机身
                ctx.fillStyle = Renderer.COLORS.BLACK;
                ctx.fillRect(x + 1, y + 2, 14, 10);
                // 屏幕 - 蓝色静电
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 2, y + 3, 12, 8);
                // 静电噪点
                ctx.fillStyle = Renderer.COLORS.WHITE;
                ctx.fillRect(x + 4, y + 5, 2, 1);
                ctx.fillRect(x + 8, y + 7, 3, 1);
                ctx.fillRect(x + 5, y + 9, 2, 1);
                ctx.fillRect(x + 11, y + 4, 1, 2);
                // 电视脚
                ctx.fillStyle = color;
                ctx.fillRect(x + 3, y + 12, 4, 3);
                ctx.fillRect(x + 9, y + 12, 4, 3);
                // 电源灯 - 红色
                ctx.fillStyle = Renderer.COLORS.RED;
                ctx.fillRect(x + 7, y + 10, 2, 1);
                break;

            default:
                // 默认方块
                ctx.fillStyle = color;
                ctx.fillRect(x + 2, y + 2, 12, 12);
                ctx.fillStyle = Renderer.COLORS.BLUE;
                ctx.fillRect(x + 4, y + 4, 8, 8);
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

        // 边框 - 双线
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, y, Renderer.WIDTH - padding * 2, height);
        ctx.strokeStyle = Renderer.COLORS.BLUE;
        ctx.lineWidth = 1;
        ctx.strokeRect(padding + 3, y + 3, Renderer.WIDTH - padding * 2 - 6, height - 6);
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

