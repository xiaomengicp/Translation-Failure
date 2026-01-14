/**
 * Exploration - 探索系统
 * 处理房间切换、玩家移动、物品互动
 */

const Exploration = {
    // 当前房间
    currentRoom: null,

    // 玩家位置（像素坐标）
    playerX: 0,
    playerY: 0,

    // 玩家状态
    playerHp: 100,
    maxHp: 100,

    // 钥匙相关
    hasKey: false,
    keyAttempts: 0,
    keyCurrentRoom: null,  // 钥匙当前所在房间

    // 游戏进度标记
    flags: {
        visited: {},           // 已访问房间
        interacted: {},        // 已互动物品
        gaslightCount: 0,      // 被gaslight次数
        savedGame: false,      // 是否已存档
        doorAttempts: 0        // 尝试开门次数
    },

    // 随机出口的记忆（某些房间固定后不再随机）
    exitMemory: {},

    // 状态
    moveCooldown: 0,
    interactionTarget: null,

    /**
     * 初始化探索系统
     */
    init() {
        this.enterRoom('bedroom_1');
    },

    /**
     * 进入房间
     * @param {string} roomId - 房间ID
     * @param {number} spawnX - 出生点X（可选）
     * @param {number} spawnY - 出生点Y（可选）
     */
    enterRoom(roomId, spawnX = null, spawnY = null) {
        const room = ROOMS[roomId];
        if (!room) {
            console.error('Room not found:', roomId);
            return;
        }

        this.currentRoom = room;

        // 设置玩家位置
        if (spawnX !== null && spawnY !== null) {
            this.playerX = spawnX * Renderer.TILE_SIZE;
            this.playerY = spawnY * Renderer.TILE_SIZE;
        } else {
            this.playerX = room.spawnX * Renderer.TILE_SIZE;
            this.playerY = room.spawnY * Renderer.TILE_SIZE;
        }

        // 标记已访问
        this.flags.visited[roomId] = true;

        // 播放移动音效
        Audio.step();

        console.log('Entered room:', roomId);

        // 首次进入房间的描述
        if (!this.flags['described_' + roomId]) {
            this.flags['described_' + roomId] = true;
            Dialogue.show([room.description]);
        }
    },

    /**
     * 更新探索状态
     */
    update() {
        if (Dialogue.active) return;

        // 移动冷却
        if (this.moveCooldown > 0) {
            this.moveCooldown--;
            return;
        }

        const dir = Input.getDirection();

        // 处理移动
        if (dir.x !== 0 || dir.y !== 0) {
            this.handleMovement(dir);
        }

        // 处理互动（确认键）
        if (Input.isJustPressed('confirm')) {
            this.handleInteraction();
        }
    },

    /**
     * 处理移动
     */
    handleMovement(dir) {
        const room = this.currentRoom;
        const tileSize = Renderer.TILE_SIZE;

        // 计算新位置
        let newX = this.playerX + dir.x * tileSize;
        let newY = this.playerY + dir.y * tileSize;

        // 检查是否到达边缘（触发房间切换）
        let exitDir = null;
        if (newX < 0) exitDir = 'left';
        else if (newX >= room.width * tileSize) exitDir = 'right';
        else if (newY < 0) exitDir = 'up';
        else if (newY >= room.height * tileSize) exitDir = 'down';

        if (exitDir) {
            this.tryExit(exitDir);
            return;
        }

        // 边界检查
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX >= room.width * tileSize) newX = (room.width - 1) * tileSize;
        if (newY >= room.height * tileSize) newY = (room.height - 1) * tileSize;

        // 更新位置
        this.playerX = newX;
        this.playerY = newY;
        this.moveCooldown = 8;  // 移动冷却帧数

        Audio.step();

        // 检查是否踩到物品
        this.checkItemCollision();
    },

    /**
     * 尝试从出口离开
     * 实现非欧几里得空间拓扑：
     * - teleport: 瞬间传送（无过渡）
     * - distorted: 扭曲出口（带权重的随机）
     * - loop: 循环出口（永远回到同一房间）
     * - fixed: 固定出口
     */
    tryExit(direction) {
        const room = this.currentRoom;
        const exit = room.exits[direction];

        if (!exit) {
            // 无出口
            Audio.cancel();
            return;
        }

        let targetRoom, spawnX, spawnY;
        let showMessage = null;

        switch (exit.type) {
            case 'fixed':
                targetRoom = exit.target;
                spawnX = exit.spawnX;
                spawnY = exit.spawnY;
                break;

            case 'teleport':
                // 瞬间传送 - 添加视觉效果
                targetRoom = exit.target;
                spawnX = exit.spawnX;
                spawnY = exit.spawnY;
                Renderer.flicker(4);  // 轻微闪烁表示传送
                if (exit.message) {
                    showMessage = exit.message;
                }
                break;

            case 'distorted':
                // 扭曲出口 - 带权重的随机选择
                const weights = exit.weights || exit.targets.map(() => 1 / exit.targets.length);
                const roll = Math.random();
                let cumulative = 0;
                let selectedIndex = 0;

                for (let i = 0; i < weights.length; i++) {
                    cumulative += weights[i];
                    if (roll < cumulative) {
                        selectedIndex = i;
                        break;
                    }
                }

                targetRoom = exit.targets[selectedIndex];
                spawnX = exit.spawns[selectedIndex].spawnX;
                spawnY = exit.spawns[selectedIndex].spawnY;

                // 如果回到同一个房间，添加扭曲效果
                if (targetRoom === room.id) {
                    Renderer.shake(6);
                }
                break;

            case 'loop':
                // 循环出口 - 永远回到指定位置
                targetRoom = exit.target;
                spawnX = exit.spawnX;
                spawnY = exit.spawnY;
                showMessage = exit.message;
                Renderer.shake(4);
                break;

            case 'random':
                // 保留旧的random类型以保持兼容
                const memoryKey = room.id + '_' + direction;
                if (this.exitMemory[memoryKey]) {
                    const memory = this.exitMemory[memoryKey];
                    targetRoom = memory.target;
                    spawnX = memory.spawnX;
                    spawnY = memory.spawnY;
                } else {
                    const index = Math.floor(Math.random() * exit.targets.length);
                    targetRoom = exit.targets[index];
                    spawnX = exit.spawns[index].spawnX;
                    spawnY = exit.spawns[index].spawnY;
                    if (room.id !== 'bedroom_2') {
                        this.exitMemory[memoryKey] = { target: targetRoom, spawnX, spawnY };
                    }
                }
                break;

            default:
                targetRoom = exit.target;
                spawnX = exit.spawnX;
                spawnY = exit.spawnY;
        }

        // 如果有消息要显示，先显示消息再传送
        if (showMessage) {
            Dialogue.show([showMessage], () => {
                this.enterRoom(targetRoom, spawnX, spawnY);
            });
        } else {
            this.enterRoom(targetRoom, spawnX, spawnY);
        }
    },

    /**
     * 检查物品碰撞
     */
    checkItemCollision() {
        const room = this.currentRoom;
        if (!room.items) return;

        const playerGridX = Math.floor(this.playerX / Renderer.TILE_SIZE);
        const playerGridY = Math.floor(this.playerY / Renderer.TILE_SIZE);

        room.items.forEach(itemPlacement => {
            if (itemPlacement.x === playerGridX && itemPlacement.y === playerGridY) {
                this.interactionTarget = itemPlacement;
            }
        });
    },

    /**
     * 处理互动
     */
    handleInteraction() {
        // 查找附近可互动物品
        const room = this.currentRoom;
        if (!room.items) return;

        const playerGridX = Math.floor(this.playerX / Renderer.TILE_SIZE);
        const playerGridY = Math.floor(this.playerY / Renderer.TILE_SIZE);

        // 查找玩家位置或相邻位置的物品
        let nearbyItem = null;
        for (const itemPlacement of room.items) {
            const dx = Math.abs(itemPlacement.x - playerGridX);
            const dy = Math.abs(itemPlacement.y - playerGridY);
            if (dx <= 1 && dy <= 1) {
                nearbyItem = itemPlacement;
                break;
            }
        }

        if (!nearbyItem) return;

        const itemData = ITEMS[nearbyItem.id];
        if (!itemData) return;

        this.interactWith(itemData, nearbyItem);
    },

    /**
     * 与物品互动
     */
    interactWith(itemData, placement) {
        // 获取可用互动类型
        const interactions = itemData.interactions;
        const interactionTypes = Object.keys(interactions);

        if (interactionTypes.length === 0) return;

        // 如果只有一种互动，直接执行
        if (interactionTypes.length === 1) {
            this.executeInteraction(itemData, interactionTypes[0], placement);
            return;
        }

        // 多种互动，显示选项
        const options = interactionTypes.map(type => interactions[type].prompt);
        Dialogue.showOptions(
            '要做什么？',
            options,
            (index) => {
                this.executeInteraction(itemData, interactionTypes[index], placement);
            }
        );
    },

    /**
     * 执行互动
     * 实现“意图与结果的背离” - UI显示的意图是“查看”，但结果却是“损坏”
     */
    executeInteraction(itemData, interactionType, placement) {
        const interaction = itemData.interactions[interactionType];

        // 标记已互动
        this.flags.interacted[itemData.id] = true;

        // 特殊处理：钥匙
        if (itemData.id === 'key' && interactionType === 'take') {
            this.handleKeyInteraction(interaction, placement);
            return;
        }

        // 特殊处理：妈妈的门
        if (itemData.id === 'mom_door' && interactionType === 'use') {
            this.handleDoorInteraction(interaction);
            return;
        }

        // 特殊处理：存档点
        if (itemData.id === 'save_point') {
            this.saveGame();
            Dialogue.show([interaction.result]);
            return;
        }

        // 先处理效果（在显示对话之前）
        this.applyInteractionEffect(interaction);

        // 显示对话
        let dialogueLines = [interaction.result];

        // 如果有gaslight文字，对话结束后显示
        if (interaction.gaslight) {
            Dialogue.show(dialogueLines, () => {
                Dialogue.showGaslight(interaction.gaslight);
                this.flags.gaslightCount++;
            });
        } else if (interaction.momVoice) {
            Dialogue.show(dialogueLines, () => {
                Dialogue.showMomVoice(interaction.momVoice);
            });
        } else {
            Dialogue.show(dialogueLines);
        }
    },

    /**
     * 应用互动效果
     */
    applyInteractionEffect(interaction) {
        if (!interaction.effect) return;

        switch (interaction.effect) {
            case 'break':
                Audio.itemBreak();
                Renderer.shake(8);
                break;
            case 'hurt':
                this.playerHp -= interaction.damage || 5;
                Audio.hurt();
                Renderer.shake(12);
                Renderer.flicker(6);
                break;
            case 'gaslight':
                Renderer.shake(5);
                break;
            case 'unease':
                Renderer.shake(3);
                break;
        }
    },

    /**
     * 处理钥匙互动（钥匙会飞走）
     */
    handleKeyInteraction(interaction, placement) {
        this.keyAttempts++;

        if (this.keyAttempts >= 3) {
            // 第三次成功拿到
            this.hasKey = true;
            Dialogue.show([interaction.resultFinal]);

            // 从房间移除钥匙
            const room = this.currentRoom;
            room.items = room.items.filter(item => item.id !== 'key');
        } else {
            // 钥匙飞走
            Audio.keyFly();
            Dialogue.show([interaction.result], () => {
                Dialogue.showGaslight(interaction.gaslight);
            });

            // 钥匙飞到另一个房间
            const currentRoomId = this.currentRoom.id;
            const flyRooms = ROOMS['mom_door'].keyFlyRooms.filter(r => r !== currentRoomId);
            const newRoom = flyRooms[Math.floor(Math.random() * flyRooms.length)];

            // 从当前房间移除钥匙
            this.currentRoom.items = this.currentRoom.items.filter(item => item.id !== 'key');

            // 添加到新房间
            const targetRoom = ROOMS[newRoom];
            if (targetRoom) {
                targetRoom.items = targetRoom.items || [];
                targetRoom.items.push({
                    id: 'key',
                    x: Math.floor(targetRoom.width / 2),
                    y: Math.floor(targetRoom.height / 2)
                });
            }

            this.keyCurrentRoom = newRoom;
        }
    },

    /**
     * 处理门互动
     */
    handleDoorInteraction(interaction) {
        this.flags.doorAttempts++;

        if (!this.hasKey) {
            Dialogue.show([interaction.resultLocked]);
            return;
        }

        // 有钥匙但门还是打不开
        Dialogue.show([interaction.resultWithKey], () => {
            Dialogue.showGaslight(interaction.gaslight);

            // 触发战斗
            if (this.flags.doorAttempts >= 2) {
                setTimeout(() => {
                    Game.startBattle('mom_battle_1');
                }, 1500);
            }
        });
    },

    /**
     * 存档
     */
    saveGame() {
        this.flags.savedGame = true;
        const saveData = {
            currentRoom: this.currentRoom.id,
            playerX: this.playerX,
            playerY: this.playerY,
            playerHp: this.playerHp,
            hasKey: this.hasKey,
            keyAttempts: this.keyAttempts,
            flags: this.flags,
            exitMemory: this.exitMemory
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
                this.hasKey = data.hasKey;
                this.keyAttempts = data.keyAttempts;
                this.flags = data.flags;
                this.exitMemory = data.exitMemory || {};
                this.enterRoom(data.currentRoom,
                    Math.floor(data.playerX / Renderer.TILE_SIZE),
                    Math.floor(data.playerY / Renderer.TILE_SIZE)
                );
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

        // 计算房间绘制偏移（居中显示）
        const roomPixelWidth = room.width * Renderer.TILE_SIZE;
        const roomPixelHeight = room.height * Renderer.TILE_SIZE;
        const offsetX = (Renderer.WIDTH - roomPixelWidth) / 2;
        const offsetY = (Renderer.HEIGHT - roomPixelHeight) / 2;

        // 绘制墙壁（先画，作为背景层）
        Draw.roomWalls(offsetX, offsetY, roomPixelWidth, roomPixelHeight);

        // 绘制地板（棋盘格纹理）
        Draw.roomFloor(offsetX, offsetY, roomPixelWidth, roomPixelHeight, Renderer.TILE_SIZE);

        // 绘制房间边框
        Renderer.drawRectOutline(offsetX, offsetY, roomPixelWidth, roomPixelHeight, Renderer.COLORS.WHITE, 2);

        // 绘制网格（可选，用于调试）
        // this.renderGrid(offsetX, offsetY, room);

        // 绘制出口指示
        this.renderExits(offsetX, offsetY, room);

        // 绘制物品
        if (room.items) {
            room.items.forEach(itemPlacement => {
                const itemData = ITEMS[itemPlacement.id];
                if (itemData) {
                    const x = offsetX + itemPlacement.x * Renderer.TILE_SIZE;
                    const y = offsetY + itemPlacement.y * Renderer.TILE_SIZE;
                    Draw.item(x, y, itemData.type);
                }
            });
        }

        // 绘制玩家
        const playerScreenX = offsetX + this.playerX;
        const playerScreenY = offsetY + this.playerY;
        Draw.player(playerScreenX, playerScreenY);

        // 绘制房间名称
        Renderer.drawText(room.name, 16, 16, Renderer.COLORS.WHITE, 14);

        // 绘制HP
        Renderer.drawText('HP', 16, Renderer.HEIGHT - 30, Renderer.COLORS.WHITE, 12);
        Draw.hpBar(40, Renderer.HEIGHT - 32, this.playerHp, this.maxHp, 80, 16);

        // 绘制对话
        Dialogue.render();
    },

    /**
     * 渲染出口指示
     */
    renderExits(offsetX, offsetY, room) {
        const exits = room.exits;
        const w = room.width * Renderer.TILE_SIZE;
        const h = room.height * Renderer.TILE_SIZE;

        // 上
        if (exits.up) {
            Renderer.drawRect(offsetX + w / 2 - 16, offsetY - 4, 32, 4, Renderer.COLORS.WHITE);
        }
        // 下
        if (exits.down) {
            Renderer.drawRect(offsetX + w / 2 - 16, offsetY + h, 32, 4, Renderer.COLORS.WHITE);
        }
        // 左
        if (exits.left) {
            Renderer.drawRect(offsetX - 4, offsetY + h / 2 - 16, 4, 32, Renderer.COLORS.WHITE);
        }
        // 右
        if (exits.right) {
            Renderer.drawRect(offsetX + w, offsetY + h / 2 - 16, 4, 32, Renderer.COLORS.WHITE);
        }
    }
};
