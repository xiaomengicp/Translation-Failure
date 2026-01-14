/**
 * Exploration - 探索系统
 * 
 * 核心逻辑：
 * 1. 网格移动 - 玩家在10x10网格中移动
 * 2. 门传送 - 踩到门格子时，根据doorLinks传送到错误的房间
 * 3. 意图颠倒 - 物品交互结果与UI提示相反
 */

const Exploration = {
    // 当前房间
    currentRoomKey: 'BEDROOM',
    currentRoom: null,

    // 玩家网格位置
    playerX: 5,
    playerY: 5,

    // 玩家状态
    playerHp: 100,
    maxHp: 100,

    // 游戏进度
    flags: {
        gaslightCount: 0,
        keyFlyCount: 0,
        hasKey: false,
        savedGame: false,
        battleTriggered: false
    },

    // 当前靠近的物品
    nearbyItem: null,

    // 移动冷却
    moveCooldown: 0,

    /**
     * 初始化探索系统
     */
    init() {
        this.enterRoom('BEDROOM_1');
    },

    /**
     * 进入房间
     */
    enterRoom(roomKey, spawnX = null, spawnY = null) {
        const room = ROOMS[roomKey];
        if (!room) {
            console.error('Room not found:', roomKey);
            return;
        }

        this.currentRoomKey = roomKey;
        this.currentRoom = room;

        // 设置玩家位置
        this.playerX = spawnX !== null ? spawnX : room.spawnX;
        this.playerY = spawnY !== null ? spawnY : room.spawnY;

        // 播放音效
        Audio.step();

        // 显示房间描述
        Dialogue.show([room.description], () => {
            // 检查是否触发战斗（第一幕结尾）
            if (room.triggerBattle && !this.flags.battleTriggered) {
                this.flags.battleTriggered = true;
                // 显示战斗切入对话
                Dialogue.show([
                    '门后传来声音...',
                    '【孩子... 快来...】',
                    '【妈妈需要你...】'
                ], () => {
                    // 开始战斗
                    Game.startBattle('mom_battle_1');
                });
            }
        });

        console.log('Entered room:', roomKey);
    },

    /**
     * 更新探索状态
     */
    update() {
        // 检查对话/gaslight是否阻止输入
        if (Dialogue.isBlocking()) return;

        // 移动冷却
        if (this.moveCooldown > 0) {
            this.moveCooldown--;
            return;
        }

        const dir = Input.getDirection();

        // 处理移动
        if (dir.x !== 0 || dir.y !== 0) {
            this.handleMovement(dir.x, dir.y);
        }

        // 处理互动
        if (Input.isJustPressed('confirm') && this.nearbyItem) {
            this.handleInteraction();
        }
    },

    /**
     * 处理移动
     */
    handleMovement(dx, dy) {
        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        // 获取房间实际尺寸
        const roomHeight = this.currentRoom.layout.length;
        const roomWidth = this.currentRoom.layout[0].length;

        // 边界检查
        if (newX < 0 || newX >= roomWidth || newY < 0 || newY >= roomHeight) {
            return;
        }

        const tile = this.currentRoom.layout[newY][newX];

        // 墙壁检查
        if (tile === 1) {
            Audio.cancel();
            return;
        }

        // 门检查
        if (typeof tile === 'string' && tile.startsWith('DOOR')) {
            this.handleDoor(tile);
            return;
        }

        // 更新位置
        this.playerX = newX;
        this.playerY = newY;
        this.moveCooldown = 8;

        Audio.step();

        // 检查附近物品
        this.checkNearbyItems();
    },

    /**
     * 处理门传送
     * 核心的非欧几里得逻辑在这里
     */
    handleDoor(doorId) {
        const doorLink = this.currentRoom.doorLinks[doorId];

        if (!doorLink) {
            Audio.cancel();
            return;
        }

        // 检查门是否锁着（从doorLink检查）
        if (doorLink.locked && !this.flags.hasKey) {
            Dialogue.show(['门是锁着的。你需要钥匙。']);
            Audio.cancel();
            return;
        }

        // 传送到目标房间（这里是关键：target可能与label不一致）
        this.enterRoom(doorLink.target, doorLink.spawnX, doorLink.spawnY);

        // 添加视觉效果
        Renderer.flicker(4);
    },

    /**
     * 检查附近物品
     */
    checkNearbyItems() {
        const roomHeight = this.currentRoom.layout.length;
        const roomWidth = this.currentRoom.layout[0].length;

        const neighbors = [
            { x: this.playerX, y: this.playerY - 1 },
            { x: this.playerX, y: this.playerY + 1 },
            { x: this.playerX - 1, y: this.playerY },
            { x: this.playerX + 1, y: this.playerY }
        ];

        this.nearbyItem = null;

        for (const n of neighbors) {
            if (n.x >= 0 && n.x < roomWidth && n.y >= 0 && n.y < roomHeight) {
                const tile = this.currentRoom.layout[n.y][n.x];
                if (typeof tile === 'string' && ITEMS[tile] && !tile.startsWith('DOOR')) {
                    // 如果已经拿到钥匙，跳过钥匙
                    if (tile === 'KEY' && this.flags.hasKey) {
                        continue;
                    }
                    this.nearbyItem = tile;
                    break;
                }
            }
        }
    },

    /**
     * 处理物品互动
     * 意图颠倒：UI显示的action，实际执行的是破坏性result
     */
    handleInteraction() {
        const itemId = this.nearbyItem;
        const item = ITEMS[itemId];

        if (!item) return;

        // 特殊处理：钥匙
        if (itemId === 'KEY') {
            this.handleKeyInteraction(item);
            return;
        }

        // 特殊处理：存档点
        if (itemId === 'SAVE') {
            Audio.save();
            Dialogue.show([item.result], () => {
                this.saveGame();
            });
            return;
        }

        // 先应用效果
        this.applyItemEffect(item);

        // 显示结果（不是action，是破坏性的result）
        Dialogue.show([item.result], () => {
            // 如果有gaslight，显示
            if (item.gaslight) {
                Dialogue.showGaslight(item.gaslight);
                this.flags.gaslightCount++;
            }
        });
    },

    /**
     * 应用物品效果
     */
    applyItemEffect(item) {
        switch (item.effect) {
            case 'break':
                Audio.itemBreak();
                Renderer.shake(8);
                break;
            case 'hurt':
                this.playerHp -= item.damage || 5;
                Audio.hurt();
                Renderer.shake(12);
                Renderer.flicker(6);
                break;
            case 'vanish':
                // 物品从房间消失
                Renderer.shake(4);
                break;
        }
    },

    /**
     * 处理钥匙互动（特殊：会飞走）
     */
    handleKeyInteraction(item) {
        // 如果已经拿到钥匙，不再交互
        if (this.flags.hasKey) {
            Dialogue.show(['你已经有钥匙了。']);
            return;
        }

        this.flags.keyFlyCount++;

        if (this.flags.keyFlyCount >= item.maxFlyCount) {
            // 终于拿到钥匙
            this.flags.hasKey = true;
            this.nearbyItem = null;  // 清除nearby，防止再次交互
            Audio.confirm();
            Dialogue.show([item.resultFinal]);
        } else {
            // 钥匙飞走
            Audio.keyFly();
            Renderer.shake(6);
            Dialogue.show([item.result], () => {
                Dialogue.showGaslight(item.gaslight);
            });
        }
    },

    /**
     * 存档
     */
    saveGame() {
        this.flags.savedGame = true;
        const saveData = {
            currentRoomKey: this.currentRoomKey,
            playerX: this.playerX,
            playerY: this.playerY,
            playerHp: this.playerHp,
            flags: this.flags
        };

        try {
            localStorage.setItem('translation_failure_save', JSON.stringify(saveData));
            Audio.save();
            console.log('Game saved');
        } catch (e) {
            console.error('Save failed:', e);
        }
    },

    /**
     * 读档
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('translation_failure_save');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.playerHp = data.playerHp;
                this.flags = data.flags;
                this.enterRoom(data.currentRoomKey, data.playerX, data.playerY);
                return true;
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
        return false;
    },

    /**
     * 渲染探索场景
     */
    render() {
        const room = this.currentRoom;
        if (!room) return;

        // 清屏
        Renderer.clear(Renderer.COLORS.BLACK);

        // 获取房间实际尺寸（从layout读取）
        const roomHeight = room.layout.length;
        const roomWidth = room.layout[0].length;

        // 计算偏移（居中显示）
        const roomPixelWidth = roomWidth * GRID.TILE_SIZE;
        const roomPixelHeight = roomHeight * GRID.TILE_SIZE;
        const offsetX = (Renderer.WIDTH - roomPixelWidth) / 2;
        const offsetY = (Renderer.HEIGHT - roomPixelHeight) / 2;

        // 渲染网格
        for (let y = 0; y < roomHeight; y++) {
            for (let x = 0; x < roomWidth; x++) {
                const tile = room.layout[y][x];
                const px = offsetX + x * GRID.TILE_SIZE;
                const py = offsetY + y * GRID.TILE_SIZE;

                if (tile === 1) {
                    // 墙壁 - 蓝色
                    Draw.wall(px, py, GRID.TILE_SIZE);
                } else if (tile === 0) {
                    // 地板 - 黑色（不画，用背景）
                } else if (typeof tile === 'string') {
                    // 如果已经拿到钥匙，不绘制钥匙
                    if (tile === 'KEY' && this.flags.hasKey) {
                        continue;
                    }
                    if (tile.startsWith('DOOR')) {
                        // 门 - 白色
                        Draw.door(px, py, GRID.TILE_SIZE);
                    } else if (ITEMS[tile]) {
                        // 物品 - 红色
                        Draw.item(px, py, GRID.TILE_SIZE, tile);
                    }
                }
            }
        }

        // 渲染玩家
        const playerPx = offsetX + this.playerX * GRID.TILE_SIZE;
        const playerPy = offsetY + this.playerY * GRID.TILE_SIZE;
        Draw.player(playerPx, playerPy, GRID.TILE_SIZE);

        // 渲染UI
        this.renderUI(offsetX, offsetY, roomPixelWidth);

        // 渲染对话
        Dialogue.render();
    },

    /**
     * 渲染UI
     */
    renderUI(offsetX, offsetY, roomWidth) {
        const room = this.currentRoom;

        // 房间标题
        Renderer.drawText(room.title, 16, 16, Renderer.COLORS.WHITE, 14);

        // HP
        Renderer.drawText('HP', 16, Renderer.HEIGHT - 30, Renderer.COLORS.WHITE, 12);
        Draw.hpBar(40, Renderer.HEIGHT - 32, this.playerHp, this.maxHp, 80, 16);

        // 交互提示
        if (this.nearbyItem && ITEMS[this.nearbyItem] && !this.nearbyItem.startsWith('DOOR')) {
            const item = ITEMS[this.nearbyItem];
            const promptText = `[Z] ${item.action} ${item.name}`;
            Renderer.drawTextCentered(promptText, Renderer.HEIGHT - 60, Renderer.COLORS.RED, 14);
        }
    }
};
