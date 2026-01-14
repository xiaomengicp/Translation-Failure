/**
 * Exploration - 探索系统
 * 
 * 核心逻辑：
 * 1. 网格移动 - 玩家在10x10网格中移动
 * 2. 门传送 - 踩到门格子时，根据doorLinks传送到错误的房间
 * 3. 意图颠倒 - 物品交互结果与UI提示相反
 * 4. 动态物品 - 钥匙位置动态变化
 */

const Exploration = {
    // 当前房间
    currentRoomKey: 'BEDROOM_1',
    currentRoom: null,

    // 玩家网格位置
    playerX: 5,
    playerY: 5,

    // 玩家状态
    playerHp: 100,
    maxHp: 100,

    // 钥匙生成位置字典
    KEY_POSITIONS: {
        'BEDROOM_1': { x: 5, y: 5 },
        'LIVING_ROOM': { x: 6, y: 5 },
        'BEDROOM_2': { x: 5, y: 5 },
        'HALLWAY': { x: 7, y: 4 },
        'MOM_DOOR': { x: 7, y: 3 },
        'KEY_ROOM_1': { x: 4, y: 4 },
        'KEY_ROOM_2': { x: 4, y: 4 }
    },

    // 游戏进度
    flags: {
        gaslightCount: 0,
        keyFlyCount: 0,
        hasKey: false,
        savedGame: false,
        battleTriggered: false,
        keyJustFlew: false,
        currentKeyRoom: 'KEY_ROOM_1' // 初始位置在储藏室，增加寻找难度
    },

    // 当前靠近的物品
    nearbyItem: null,

    // 移动冷却
    moveCooldown: 0,

    /**
     * 初始化探索系统
     */
    init() {
        // 重置状态
        this.flags = {
            gaslightCount: 0,
            keyFlyCount: 0,
            hasKey: false,
            savedGame: false,
            battleTriggered: false,
            keyJustFlew: false,
            currentKeyRoom: 'KEY_ROOM_1'
        };
        this.playerHp = 100;

        this.enterRoom('BEDROOM_1');
        Audio.playBgm('exploration');
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

        // 重置钥匙飞走状态（进入新房间，钥匙重新出现）
        this.flags.keyJustFlew = false;

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
            { x: this.playerX, y: this.playerY },     // 当前位置
            { x: this.playerX, y: this.playerY - 1 }, // 上
            { x: this.playerX, y: this.playerY + 1 }, // 下
            { x: this.playerX - 1, y: this.playerY }, // 左
            { x: this.playerX + 1, y: this.playerY }  // 右
        ];

        this.nearbyItem = null;

        for (const n of neighbors) {
            if (n.x >= 0 && n.x < roomWidth && n.y >= 0 && n.y < roomHeight) {
                const tile = this.currentRoom.layout[n.y][n.x];

                // 检查普通物品
                if (typeof tile === 'string' && ITEMS[tile] && !tile.startsWith('DOOR')) {
                    // 如果已经拿到钥匙，且该格子是旧钥匙(如果有的话)，跳过
                    if (tile === 'KEY' && this.flags.hasKey) {
                        continue;
                    }
                    this.nearbyItem = tile;
                    break;
                }

                // 检查动态钥匙
                if (!this.flags.hasKey &&
                    this.flags.currentKeyRoom === this.currentRoom.id &&
                    !this.flags.keyJustFlew) {

                    const keyPos = this.KEY_POSITIONS[this.currentRoom.id];
                    if (keyPos && n.x === keyPos.x && n.y === keyPos.y) {
                        this.nearbyItem = 'KEY';
                        break;
                    }
                }
            }
        }
    },

    /**
     * 处理物品互动
     */
    handleInteraction() {
        const itemId = this.nearbyItem;
        // 特殊：动态钥匙不在ITEMS表中可能有问题？暂时认为KEY在
        let item = ITEMS[itemId];

        // 如果是动态钥匙，手动构造item
        if (itemId === 'KEY' && !item) {
            item = ITEMS['KEY'];
        }

        if (!item) return;

        // 特殊处理：钥匙
        if (itemId === 'KEY') {
            this.handleKeyInteraction(item);
            return;
        }

        // 特殊处理：存档点
        if (itemId === 'SAVE') {
            this.saveGame();
            Audio.save();
            Dialogue.show([item.result]);
            return;
        }

        // 多选项互动支持
        if (item.options && item.options.length > 0) {
            const optionLabels = item.options.map(o => o.label);
            Dialogue.showOptions(optionLabels, (selectedIndex) => {
                const selectedOption = item.options[selectedIndex];
                this.applyOptionEffect(selectedOption, item);
            });
            return;
        }

        // 旧的单一互动逻辑
        this.applyItemEffect(item);

        // 显示结果
        Dialogue.show([item.result], () => {
            if (item.gaslight) {
                Dialogue.showGaslight(item.gaslight);
                this.flags.gaslightCount++;
            }
        });
    },

    /**
     * 应用选项效果
     */
    applyOptionEffect(option, parentItem) {
        // 播放动作音效
        if (option.actionSfx) Audio[option.actionSfx]();

        // 如果有破坏效果
        if (option.effect === 'break') {
            Audio.itemBreak();
            Renderer.shake(8);
        } else if (option.effect === 'hurt') {
            this.playerHp -= option.damage || 5;
            Audio.hurt();
            Renderer.shake(12);
            Renderer.flicker(6);
        }

        // 显示结果文本
        Dialogue.show([option.result], () => {
            if (option.gaslight) {
                Dialogue.showGaslight(option.gaslight);
                this.flags.gaslightCount++;
            }
        });
    },

    /**
     * 应用物品效果 (Legacy)
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
                Renderer.shake(4);
                break;
        }
    },

    /**
     * 处理钥匙互动（动态、随机飞行）
     */
    handleKeyInteraction(item) {
        if (this.flags.hasKey) return;
        if (this.flags.keyJustFlew) return;

        this.flags.keyFlyCount++;

        // 追逐5次后获得
        if (this.flags.keyFlyCount >= 5) {
            this.flags.hasKey = true;
            this.nearbyItem = null;
            Audio.confirm();
            Renderer.shake(4);
            Dialogue.show([item.resultFinal]);
        } else {
            // 钥匙飞走 -> 随机飞到另一个房间
            this.flags.keyJustFlew = true;
            this.nearbyItem = null;
            Audio.itemBreak(); // 飞走音效
            Renderer.shake(8);
            Renderer.flicker(4);

            Dialogue.show([item.result], () => {
                // 移动钥匙到随机房间 (排除当前房间)
                const rooms = Object.keys(this.KEY_POSITIONS);
                const otherRooms = rooms.filter(r => r !== this.currentRoom.id);
                const randomRoom = otherRooms[Math.floor(Math.random() * otherRooms.length)];

                this.flags.currentKeyRoom = randomRoom;
                console.log('Key flew to:', randomRoom);

                if (item.gaslight) {
                    Dialogue.showGaslight(item.gaslight);
                }
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
            localStorage.setItem('translation_failure_safe_save', JSON.stringify(saveData));
            console.log('Game saved successfully');
        } catch (e) {
            console.error('Save failed:', e);
        }
    },

    /**
     * 读档
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('translation_failure_safe_save');
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

        // 渲染地面
        Draw.roomFloor(offsetX, offsetY, roomWidth, roomHeight, GRID.TILE_SIZE);

        // 渲染内容
        for (let y = 0; y < roomHeight; y++) {
            for (let x = 0; x < roomWidth; x++) {
                const tile = room.layout[y][x];
                const px = offsetX + x * GRID.TILE_SIZE;
                const py = offsetY + y * GRID.TILE_SIZE;

                if (tile === 1) {
                    // 绘制墙壁
                    Draw.wall(px, py, GRID.TILE_SIZE);
                } else if (tile === 2) {
                    // 预留：其他障碍
                } else if (typeof tile === 'string') {
                    // 如果已经拿到钥匙，跳过普通钥匙tile
                    if (tile === 'KEY' && (this.flags.hasKey || this.flags.keyJustFlew)) {
                        continue;
                    }

                    if (tile.startsWith('DOOR')) {
                        Draw.door(px, py, GRID.TILE_SIZE);
                    } else if (ITEMS[tile]) {
                        Draw.item(px, py, GRID.TILE_SIZE, tile);
                    }
                }
            }
        }

        // 渲染动态钥匙
        if (!this.flags.hasKey &&
            this.flags.currentKeyRoom === this.currentRoom.id &&
            !this.flags.keyJustFlew) {

            const pos = this.KEY_POSITIONS[this.currentRoom.id];
            if (pos) {
                const px = offsetX + pos.x * GRID.TILE_SIZE;
                const py = offsetY + pos.y * GRID.TILE_SIZE;
                Draw.item(px, py, GRID.TILE_SIZE, 'KEY');
            }
        }

        // 渲染玩家
        const playerPx = offsetX + this.playerX * GRID.TILE_SIZE;
        const playerPy = offsetY + this.playerY * GRID.TILE_SIZE;
        Draw.player(playerPx, playerPy, GRID.TILE_SIZE);

        // 渲染UI
        this.renderUI(offsetX, offsetY);

        // 渲染对话
        Dialogue.render();
    },

    /**
     * 渲染UI
     */
    renderUI(offsetX, offsetY) {
        const room = this.currentRoom;

        // 房间标题 (随震动偏移)
        Renderer.drawText(room.title, 16 + Renderer.offsetX, 16 + Renderer.offsetY, Renderer.COLORS.WHITE, 14);

        // HP
        Renderer.drawText('HP', 16, Renderer.HEIGHT - 30, Renderer.COLORS.WHITE, 12);
        Draw.hpBar(40, Renderer.HEIGHT - 32, this.playerHp, this.maxHp, 80, 16);

        // 交互提示
        if (this.nearbyItem) {
            const item = ITEMS[this.nearbyItem];
            // 对于KEY，特殊提示
            let action = item ? item.action : '查看';
            let name = item ? item.name : '???';

            if (this.nearbyItem === 'KEY') {
                name = '钥匙';
                action = '拾取';
            }

            const promptText = `[Z] ${action} ${name}`;
            Renderer.drawTextCentered(promptText, Renderer.HEIGHT - 40, Renderer.COLORS.RED, 14);
        }
    }
};
