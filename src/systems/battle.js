/**
 * Battle - 战斗系统
 * 回合制战斗，类Undertale弹幕躲避
 */

const Battle = {
    // 状态
    active: false,
    battleData: null,

    // 回合状态
    phase: 'start',  // 'start', 'player_turn', 'enemy_turn', 'bullet', 'end'
    turnCount: 0,

    // 玩家状态
    playerHp: 100,
    maxHp: 100,

    // 敌人状态
    enemyY: 0,

    // 弹幕相关
    bulletPlayerX: 0,
    bulletPlayerY: 0,
    bulletTimer: 0,
    dodged: false,

    // freeze增强标记
    freezeEnhanced: false,

    // 菜单
    menuOptions: ['Punch', 'Freeze', 'Negotiate', 'Wait'],
    selectedOption: 0,

    // negotiate子菜单
    negotiateMode: false,
    negotiateOptions: [],
    selectedNegotiate: 0,

    // 对话队列
    dialogueQueue: [],
    showingDialogue: false,

    /**
     * 开始战斗
     * @param {string} battleId - 战斗ID
     */
    start(battleId) {
        const data = BATTLES[battleId];
        if (!data) {
            console.error('Battle not found:', battleId);
            return;
        }

        this.active = true;
        this.battleData = data;
        this.phase = 'start';
        this.turnCount = 0;

        // 初始化玩家HP（从探索系统继承，或使用战斗数据）
        this.maxHp = data.player.maxHp;
        this.playerHp = Exploration.playerHp || data.player.hp;

        // 初始化敌人位置
        this.enemyY = data.bulletPattern.momStartY;

        // 初始化弹幕玩家位置
        const pattern = data.bulletPattern;
        this.bulletPlayerX = pattern.areaX + pattern.areaWidth / 2;
        this.bulletPlayerY = pattern.areaY + pattern.areaHeight / 2;

        // 重置状态
        this.selectedOption = 0;
        this.negotiateMode = false;
        this.freezeEnhanced = false;
        this.dialogueQueue = [];
        this.showingDialogue = false;

        // negotiate选项
        this.negotiateOptions = data.negotiateOptions.map(opt => opt.name);

        Audio.battleStart();

        // 显示开始对话
        this.showDialogueSequence(data.startDialogue, () => {
            this.phase = 'player_turn';
        });
    },

    /**
     * 显示对话序列
     */
    showDialogueSequence(lines, onComplete) {
        this.showingDialogue = true;
        Dialogue.show(lines, () => {
            this.showingDialogue = false;
            if (onComplete) onComplete();
        });
    },

    /**
     * 更新战斗
     */
    update() {
        if (!this.active) return;

        // 对话优先
        if (Dialogue.active) {
            Dialogue.update();
            return;
        }

        switch (this.phase) {
            case 'player_turn':
                this.updatePlayerTurn();
                break;
            case 'enemy_turn':
                this.updateEnemyTurn();
                break;
            case 'bullet':
                this.updateBullet();
                break;
            case 'end':
                this.updateEnd();
                break;
        }
    },

    /**
     * 玩家回合
     */
    updatePlayerTurn() {
        if (this.negotiateMode) {
            // negotiate子菜单
            if (Input.isJustPressed('up')) {
                this.selectedNegotiate = Math.max(0, this.selectedNegotiate - 1);
                Audio.menuMove();
            }
            if (Input.isJustPressed('down')) {
                this.selectedNegotiate = Math.min(this.negotiateOptions.length - 1, this.selectedNegotiate + 1);
                Audio.menuMove();
            }
            if (Input.isJustPressed('cancel')) {
                this.negotiateMode = false;
                Audio.cancel();
            }
            if (Input.isJustPressed('confirm')) {
                this.executeNegotiate(this.selectedNegotiate);
            }
        } else {
            // 主菜单
            if (Input.isJustPressed('up')) {
                this.selectedOption = Math.max(0, this.selectedOption - 1);
                Audio.menuMove();
            }
            if (Input.isJustPressed('down')) {
                this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
                Audio.menuMove();
            }
            if (Input.isJustPressed('confirm')) {
                this.executeAction(this.menuOptions[this.selectedOption].toLowerCase());
            }
        }
    },

    /**
     * 执行玩家行动
     */
    executeAction(action) {
        const data = this.battleData;

        switch (action) {
            case 'punch':
                this.executePunch();
                break;
            case 'freeze':
                this.executeFreeze();
                break;
            case 'negotiate':
                this.negotiateMode = true;
                this.selectedNegotiate = 0;
                Audio.confirm();
                break;
            case 'wait':
                this.executeWait();
                break;
        }
    },

    /**
     * 执行Punch
     */
    executePunch() {
        const effect = this.battleData.actionEffects.punch;

        // 玩家受伤
        this.playerHp -= effect.mechanicEffect.value;
        Audio.hurt();

        // 显示对话
        const allDialogue = [...effect.dialogue, ...effect.momDialogue];
        this.showDialogueSequence(allDialogue, () => {
            this.startEnemyTurn();
        });
    },

    /**
     * 执行Freeze
     */
    executeFreeze() {
        const effect = this.battleData.actionEffects.freeze;

        // 标记下回合增强
        this.freezeEnhanced = true;

        // 显示对话
        const allDialogue = [...effect.dialogue, ...effect.momDialogue];
        this.showDialogueSequence(allDialogue, () => {
            this.startEnemyTurn();
        });
    },

    /**
     * 执行Wait
     */
    executeWait() {
        const effect = this.battleData.actionEffects.wait;

        // 强制受伤
        this.playerHp -= effect.mechanicEffect.value;
        Audio.hurt();

        // 显示对话
        const allDialogue = [...effect.dialogue, ...effect.momDialogue];
        this.showDialogueSequence(allDialogue, () => {
            this.startEnemyTurn();
        });
    },

    /**
     * 执行Negotiate
     */
    executeNegotiate(index) {
        const option = this.battleData.negotiateOptions[index];

        this.negotiateMode = false;
        Audio.confirm();

        // 玩家受伤（negotiate也会受伤）
        if (option.effects.damage) {
            this.playerHp -= option.effects.damage;
            Audio.hurt();
        }

        // 显示对话序列
        const dialogue = [
            option.playerText,
            option.momLabel,
            option.momResponse
        ];

        this.showDialogueSequence(dialogue, () => {
            this.startEnemyTurn();
        });
    },

    /**
     * 开始敌人回合
     */
    startEnemyTurn() {
        // 检查HP
        if (this.playerHp <= 0) {
            this.phase = 'end';
            return;
        }

        this.phase = 'bullet';
        this.bulletTimer = this.battleData.bulletPattern.duration;
        this.dodged = false;

        // 重置弹幕玩家位置到中心
        const pattern = this.battleData.bulletPattern;
        this.bulletPlayerX = pattern.areaX + pattern.areaWidth / 2;
        this.bulletPlayerY = pattern.areaY + pattern.areaHeight / 2;
    },

    /**
     * 更新弹幕阶段
     */
    updateBullet() {
        const pattern = this.battleData.bulletPattern;
        const enhanced = this.freezeEnhanced ? this.battleData.freezeEnhanced : pattern;

        // 玩家移动（持续按住可以移动）
        const moveSpeed = 3;
        if (Input.isDown('left')) {
            this.bulletPlayerX = Math.max(pattern.areaX, this.bulletPlayerX - moveSpeed);
        }
        if (Input.isDown('right')) {
            this.bulletPlayerX = Math.min(pattern.areaX + pattern.areaWidth - 16, this.bulletPlayerX + moveSpeed);
        }
        if (Input.isDown('up')) {
            this.bulletPlayerY = Math.max(pattern.areaY, this.bulletPlayerY - moveSpeed);
        }
        if (Input.isDown('down')) {
            this.bulletPlayerY = Math.min(pattern.areaY + pattern.areaHeight - 16, this.bulletPlayerY + moveSpeed);
        }

        // 妈妈靠近
        const approachSpeed = enhanced.momApproachSpeed || pattern.momApproachSpeed;
        this.enemyY += approachSpeed / 60;  // 每帧移动量

        // 检查碰撞（妈妈接触到玩家）
        const momY = this.enemyY;
        const playerY = this.bulletPlayerY;

        if (momY >= playerY - 20 && momY <= playerY + 20) {
            // 接触！
            const damage = enhanced.contactDamage || pattern.contactDamage;
            this.playerHp -= damage;
            Audio.hurt();

            // 结束弹幕阶段
            this.endBulletPhase(false);
            return;
        }

        // 计时结束
        this.bulletTimer -= 16;  // 假设60fps，每帧约16ms
        if (this.bulletTimer <= 0) {
            // 成功躲避
            this.dodged = true;
            this.endBulletPhase(true);
        }
    },

    /**
     * 结束弹幕阶段
     */
    endBulletPhase(dodged) {
        // 重置freeze增强
        this.freezeEnhanced = false;

        // 重置妈妈位置
        this.enemyY = this.battleData.bulletPattern.momStartY;

        // 检查HP
        if (this.playerHp <= 0) {
            this.phase = 'end';
            return;
        }

        this.turnCount++;

        // 如果躲开了，显示妈妈的反应
        if (dodged) {
            const dodgeDialogue = this.battleData.bulletPattern.dodgeDialogue;
            this.showDialogueSequence(dodgeDialogue, () => {
                this.phase = 'player_turn';
            });
        } else {
            this.phase = 'player_turn';
        }
    },

    /**
     * 更新结束阶段
     */
    updateEnd() {
        if (!this.showingDialogue) {
            this.showDialogueSequence(this.battleData.defeatDialogue, () => {
                // 战斗结束，过渡到第二幕
                this.active = false;
                Game.onBattleEnd();
            });
        }
    },

    /**
     * 渲染战斗
     */
    render() {
        if (!this.active) return;

        // 清屏
        Renderer.clear(Renderer.COLORS.BLACK);

        // 绘制战斗界面
        this.renderBattleArea();

        // 绘制UI
        this.renderUI();

        // 绘制对话
        Dialogue.render();
    },

    /**
     * 渲染战斗区域
     */
    renderBattleArea() {
        const pattern = this.battleData.bulletPattern;

        // 弹幕区域边框
        Renderer.drawRectOutline(
            pattern.areaX, pattern.areaY,
            pattern.areaWidth, pattern.areaHeight,
            Renderer.COLORS.WHITE, 2
        );

        // 弹幕阶段：绘制妈妈和玩家
        if (this.phase === 'bullet') {
            // 妈妈（从上往下靠近）
            const momX = pattern.areaX + pattern.areaWidth / 2 - 8;
            Draw.mom(momX, this.enemyY, Renderer.COLORS.RED);

            // 玩家（小心形？或者用小人）
            Draw.player(this.bulletPlayerX, this.bulletPlayerY, Renderer.COLORS.WHITE);
        } else {
            // 非弹幕阶段：静态显示妈妈
            const momX = pattern.areaX + pattern.areaWidth / 2 - 8;
            Draw.mom(momX, pattern.momStartY, Renderer.COLORS.WHITE);
        }
    },

    /**
     * 渲染UI
     */
    renderUI() {
        // 敌人名字
        Renderer.drawTextCentered(this.battleData.enemy.name, 20, Renderer.COLORS.WHITE, 20);

        // 玩家HP
        Renderer.drawText('HP', 20, Renderer.HEIGHT - 140, Renderer.COLORS.WHITE, 14);
        Draw.hpBar(50, Renderer.HEIGHT - 142, this.playerHp, this.maxHp, 120, 16);

        // 回合数
        Renderer.drawText('Turn: ' + this.turnCount, Renderer.WIDTH - 80, 20, Renderer.COLORS.BLUE, 12);

        // 玩家回合菜单
        if (this.phase === 'player_turn' && !Dialogue.active) {
            this.renderMenu();
        }

        // 弹幕阶段提示
        if (this.phase === 'bullet') {
            Renderer.drawTextCentered('躲避！', Renderer.HEIGHT - 30, Renderer.COLORS.RED, 14);
        }
    },

    /**
     * 渲染菜单
     */
    renderMenu() {
        const menuY = Renderer.HEIGHT - 100;

        // 菜单背景
        Draw.dialogBox(menuY, 80);

        if (this.negotiateMode) {
            // Negotiate子菜单
            Renderer.drawText('说什么？', 32, menuY + 8, Renderer.COLORS.WHITE, 12);
            Draw.menu(this.negotiateOptions, this.selectedNegotiate, 50, menuY + 28);
        } else {
            // 主菜单
            Draw.menu(this.menuOptions, this.selectedOption, 50, menuY + 16);
        }
    }
};
