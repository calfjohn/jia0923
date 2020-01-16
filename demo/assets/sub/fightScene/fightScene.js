var panel = require("panel");
var fightBgNodeComp = require('fightBgNode');
var bgOcclusionComp = require('bgOcclusion');
var bgEffectNodeComp = require('bgEffectNode');


var monMoveNode = require('monMoveNode');
cc.Class({
    extends: panel,

    properties: {
        fightBgNodeComp:fightBgNodeComp,
        bgOcclusionComp:bgOcclusionComp,
        bgEffectNodeComp:bgEffectNodeComp,
        shareUi:cc.Prefab,
        sandBox:cc.Prefab,
        skillPrefab:cc.Prefab,
        speedSprite:cc.Sprite,
        speedSpriteframes:[cc.SpriteFrame],
        stopSprite:cc.Sprite,
        stopSpriteframes:[cc.SpriteFrame],
        tipSprite:cc.Sprite,
        tipSpriteframes:[cc.SpriteFrame],
        reelPrefab:cc.Prefab,
        reelParent:cc.Node,
        waveCountLabel:cc.Label,
        fightPowerLabels:[cc.Label],
        retainLabel:cc.Label,
        fighterPrefab:cc.Prefab,
        monMoveNodeComp:monMoveNode,
        fightCombatPrefab:cc.Prefab,//战斗里特效预制体
        areanUiPrefab:cc.Prefab,
        worldBossUiPrefab:cc.Prefab,
        bossTurnTip: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.stepDis = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.StepDis);
        this.bornFix = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BornFix);

        this.registerEvent();
        this.initNodes();
        jsonTables.parsePrefab(this);
        uiManager.fitScreen(this.node);
        this.monsterExParents = [];
        this.skillInstance = this.skillNode.getInstance(this.skillPrefab,true).getComponent(this.skillPrefab.name);
        this.skillInstance.setRoot(this.node);
        this.skillInstance.node.active = false;
        this.fightPowerMap = {"0":0,"1":0};
        this.initFlag = false;
    },

    start:function(){
        this.node.dispatchDiyEvent("closeMiniBg",{});
    },

    initNodes:function(){
        this.bgNode = this.widget('fightScene/bgNode');
        this.bgEffectNode = this.widget('fightScene/bgEffectNode');
        this.fightNode = this.widget('fightScene/fightNode');
        this.sandNode = this.widget('fightScene/sandNode');
        this.shadowNode = this.widget('fightScene/shadowNode');
        this.hpNode = this.widget('fightScene/hpNode');
        this.floatNode = this.widget('fightScene/floatNode');
        this.skillNode = this.widget('fightScene/skillNode');
        this.skillIconNode = this.widget('fightScene/skillIconNode');
        this.tipNode = this.widget('fightScene/tipNode');
        this.uiNode = this.widget('fightScene/shrink');

        this.combatPowerNode = this.widget("fightScene/shrink/combatLeft");
    },

    resetZore:function(){//重设当前节点层级
        const list = this.node.children;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            obj.setLocalZOrderEx(i+1)
        }
        this.widget('fightScene/shrink').setLocalZOrderEx(999);
    },

    registerEvent: function () {

        var registerHandler = [
            ["resetPveFight", this.resetPveFight.bind(this)],
            ["guideAction", this.guideAction.bind(this)],
            ["pauseFight", this._pauseEvent.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["newCreatorForSure", this.newCreatorForSure.bind(this)],
            ["newCreator", this.newCreator.bind(this)],
            ["newCreatorFromSpecail", this.newCreatorFromSpecail.bind(this)],
            ["fightPowerChange", this.fightPowerChange.bind(this)],
            ["showSkill", this.showSkill.bind(this)],
            ["clickReel", this.clickReel.bind(this)],
            ["showTomb", this.showTomb.bind(this)],
            ["showFingerTip", this.showFingerTip.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    guideAction:function(type,ext,closeSand){
        if (type === "showFirstExcellent") {
            if (!ext && !closeSand) {
                this.combatPowerNode.getInstance(this.fightCombatPrefab,true);
            }
        }
    },

    getUiNode:function(){
        return this.uiNode;
    },

    getSkillRoot:function(){
        return this.fightNode;
    },
    //来一个技能icon
    newSkillIcon:function(){
        var node = uiResMgr.getPrefabEx("monsterSkillIcon")
        node.parent = this.skillIconNode;
        return node.getComponent("monsterSkillIcon");
    },

    resetPveFight:function(){
        this.enterScene();
    },

    updateRetainLabel:function(){
        this.retainLabel.node.active = this.fightLogic.isGameType(constant.FightType.PVE) || this.fightLogic.isGameType(constant.FightType.MINE_READY)|| this.fightLogic.isGameType(constant.FightType.MINE_FIGHT);// NOTE: 暂时不是pve模式的不显示
        if (this.retainLabel.node.active) {
            this.retainLabel.string = this.fightLogic.getMonsterNum(true) + "/"+this.fightLogic.getRetainMax();
        }

        if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
            var areanUi = this.widget('fightScene/shrink/rankNode').getChildByName(this.areanUiPrefab.name);
            if (areanUi) {
                areanUi.getComponent(this.areanUiPrefab.name).updateRetainLabel();
            }
        }
    },

    showBullet:function(startPos,endPos,cb,bulletID,isBezier){
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletID);
        if (!bulletID) return cc.error("子弹配置不存在");
        var pos = cc.v2(startPos.x - this.node.width/2,startPos.y - this.node.height/2);
        var node = uiResMgr.getPrefabEx(config[jsonTables.CONFIG_BULLET.Resource])
        node.parent = this.floatNode;
        node.getComponent("fighttBullet").setMoveAction(pos,endPos,cb,bulletID,isBezier);
    },

    /** 手指一下 */
    showFingerTip:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        var node = this.tipNode.getInstance(this.fighterPrefab,data.show);
        if (data.show && node.active) {
            node.getComponent(node.name).init(data.data);
        }
        this.clientEvent.dispatchEvent('showFinger');
    },
    /** 来个坟头 */
    showTomb:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        var node = uiResMgr.getPrefabEx("fightTomb");
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.tid);
        var name = config[jsonTables.CONFIG_MONSTER.Resource];
        var isMine = data.owner === this.fightLogic.getMineID();
        var re = this.fightLogic.getMonsMapPos(data.tid,isMine,data.isPlayer);
        var zore = re.zIndex;

        var parent = this.getMonsterExParent(name + "Tomb",zore - 1,isMine)
        node.parent = parent;
        node.getComponent('fightTomb').init(data);
    },

    /** 点击卷轴 */
    clickReel:function(event){
        event.stopPropagation();
        if (!this.fightLogic.isDisplaying()) return;
        var data = event.getUserData();
        var reelID = data.reelID;
        this.usedReelMap[reelID] = this.usedReelMap[reelID] || 0;
        // if (this.usedReelMap[reelID] > 0) {
        //     return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"reel"));
        // }
        this.usedReelMap[reelID]++;

        // var bornPos = this.node.convertToNodeSpaceAR(data.pos);
        this.cardLogic.desrReel(reelID,1);

        var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,reelID);//装备配置表基本数据
        this._newReelmonster(reelData[jsonTables.CONFIG_REEL.MonsterID]);
        this._refreshReels(false);
    },
    /** 展示技能背景 */
    showSkill:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        this.reelParent.active = false;
        this.skillInstance.open(data);
    },

    reShowReelContent:function(){
        this.reelParent.active = !this.guideLogic.isInGuideFlag() && this.fightLogic.isGameType(constant.FightType.PVE) && this.chapterLogic.getMaxMiniChapter() >= 301;//策划需求要大于第三章第二关卡才开放战斗中使用卷轴//// TODO: 别的模式能用在放出来
    },

    /** 修改战力 */
    fightPowerChange:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        var idx = data.owner === this.fightLogic.getMineID() ? 0:1;//// NOTE: 默认我方为右边
        if(!data.power) {
            data.power = 0;
        }
        if (data.isAdd) {
            this.fightPowerMap[idx] += data.power;
        }else {
            var re = this.fightPowerMap[idx] - data.power;
            this.fightPowerMap[idx] = re < 0 ? 0: re;
        }
        this.fightPowerLabels[idx].node.active = !(this.fightLogic.isGameType(constant.FightType.PVP_AREAN) && this.fightLogic.isSandBox());
        if (this.fightLogic.isGameType(constant.FightType.WORLD_BOSS) && idx === 1) {
            this.fightPowerLabels[idx].node.active = false;
        }
        else if (this.fightPowerLabels[idx].node.active) {
            this.fightPowerLabels[idx].node.getComponent("scaleAni").init(this.fightPowerMap[idx],this.initFlag,5,true);//第一次进游戏得时候不要跳动；
        }
        var re = data.isAdd ? data.power : -1 * data.power;
        this.fightLogic.setFightPower(data.owner,re);
    },
    /** 关闭沙盘  准备开始了 */
    closeSandBox:function(event){
        this.refreshShowAdBtn(false);
        this.guideLogic.closeFirstGuideAction(true);
        this.combatPowerNode.getInstance(this.fightCombatPrefab,false);
        var delay = 0;
        if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
            var sandBox = this.sandNode.getInstance(this.sandBox,true);
            var sandBoxJs = sandBox.getComponent(this.sandBox.name);
            sandBoxJs.closeForPvp();
            this.tipNode.getInstance(this.fighterPrefab,false);
        }else {
            this.sandNode.stopAllActions();
            var fade = cc.fadeTo(0.25,0);
            this.tipNode.getInstance(this.fighterPrefab,false);
            this.sandTableLogic.setTouchEnable(false);
            jsonTables.displayingSkill = true;
            var call = cc.callFunc(function(){
                jsonTables.displayingSkill = false;
                this.sandTableLogic.setTouchEnable(true);
                this.sandNode.active = false;
            },this);
            var seq = cc.sequence(fade,call);
            this.sandNode.runAction(seq);
        }
        return delay;
    },
    /** 根据id分类索引 保持dc */
    _getMonsterParent:function(cardID,isMine){
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,cardID);
        var name = config[jsonTables.CONFIG_MONSTER.Resource];
        var nodeName = isMine ? name+"mine" : name+"enemy";
        var node = this.fightNode.getChildByName(nodeName);
        var re = this.fightLogic.getMonsMapPos(cardID,isMine,false);
        if (!node) {
            node = new cc.Node();
            node.name = nodeName;
            this.fightNode.addChild(node);//NOTE 这里可以设置所有的层级
            node.zIndex = (re.zIndex);
        }else {
            if (node.zIndex !== (re.zIndex)) {
                node.zIndex = (re.zIndex)
            }
        }
        return node;
    },
    /** getBuletParent */
    getMonsterExParent:function(name,zore,isMine){
        var nodeName = isMine ? name+"mine" : name+"enemy";
        var node = this.fightNode.getChildByName(nodeName);
        if (!node) {
            node = new cc.Node();
            node.name = nodeName;
            this.fightNode.addChild(node);//// NOTE:  这里可以设置所有的层级
            node.zIndex = (zore);
            this.monsterExParents.push(node);
        }else {
            if (node.zIndex !== (zore)) {
                node.zIndex = (zore);
            }
        }
        return node;
    },
    /** getBuletBgParent */
    getBuletBgParent:function(){
        var node = this.node.getChildByName("bulletBgNode");
        return node;
    },
    /**
     * 来一个变身怪物怪物
     * @param  {int}  perHp                [血量百分比]
     * @param  {int}  configTid            怪物id
     * @param  {ccoBj}  pos                  [初始位置]
     * @param  {int}  owner                [拥有者]
     * @param  {int}  damageHp             [伤害百分比]
     * @param  {Boolean} isRemoveAllPassvieSkill [是否移除所有被动]
     * @return {[type]}                       [description]
     */
    newUnNormalmonster:function(perHp,configTid,pos,owner,damageHp,isRemoveAllPassvieSkill){
        if (!configTid) return cc.error("随机不到同品质啊")
        // var node = uiResMgr.getPrefabEx("monsterItem")
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,configTid);
        var isEnmey = owner === this.fightLogic.getEnemyID();
        var script = this._newAmonsterNow(configTid,0,0,undefined,isEnmey);//TODO 设置技能次数
        var startPos = cc.v2(pos.x,pos.y);
        script.setPosition(cc.v2(startPos.x,script.node.y));
        script.setPerDamageBase(damageHp);
        script.setPerHp(perHp);
        script.setMonsterFrom(constant.FightMonsterFrom.PASSIVESKILL);
        if (isRemoveAllPassvieSkill) {
            script.releasePassiveSkill();
        }
        script.startReelActio();//
        var fixY = script.getSpineHeight()/2;
        var node = uiResMgr.getPrefabEx("fightTomb");
        var name = config[jsonTables.CONFIG_MONSTER.Resource];
        var re = this.fightLogic.getMonsMapPos(configTid,!isEnmey,false);
        var zore = re.zIndex;
        var parent = this.getMonsterExParent(name + "CopyTomb",zore + 1,!isEnmey)
        node.parent = parent;
        node.getComponent('fightTomb').initForCopy(cc.v2(startPos.x,startPos.y - fixY));

        return script;
    },

    /**
     * 来一个变身怪物怪物
     * @param  {int}  perHp                [血量百分比]
     * @param  {int}  configTid            怪物id
     * @param  {ccoBj}  pos                  [初始位置]
     * @param  {int}  owner                [拥有者]
     * @param  {Boolean} isResetBorad         [是否重置到边界]// NOTE: 修改为是否需要烟雾
     * @param  {int}  damageHp             [伤害百分比]
     * @param  {int}  fromSkillID          [来源技能]
     * @param  {Boolean} isCanBindFromSkillID [是否需要排除来源技能]
     * @return {[type]}                       [description]
     */
    newCopymonster:function(perHp,configTid,pos,owner,isResetBorad,damageHp,fromSkillID,isCanBindFromSkillID){
        if (!configTid) return cc.error("随机不到同品质啊")
        // var node = uiResMgr.getPrefabEx("monsterItem")
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,configTid);
        var isEnmey = owner === this.fightLogic.getEnemyID();
        var script = this._newAmonsterNow(configTid,0,0,undefined,isEnmey);//TODO 设置技能次数
        var startPos = cc.v2(pos.x,pos.y);
        if (isResetBorad) {
            startPos.x = isEnmey ? (startPos.x + 200):(startPos.x - 200);
        }
        if (startPos.x > this.node.width/2) {
            startPos.x = this.node.width/2 - 50;
        }else if (startPos.x < -this.node.width/2) {
            startPos.x = -this.node.width/2 + 50;
        }
        script.setPosition(cc.v2(startPos.x,script.node.y));
        script.setPerDamageBase(damageHp);
        script.setPerHp(perHp);
        script.setMonsterFrom(constant.FightMonsterFrom.PASSIVESKILL);
        if (isCanBindFromSkillID) {
            script.removeSkill(fromSkillID);
        }
        script.startReelActio();//

        var fixY = script.getSpineHeight()/2;
        var node = uiResMgr.getPrefabEx("fightTomb");
        var name = config[jsonTables.CONFIG_MONSTER.Resource];
        var re = this.fightLogic.getMonsMapPos(configTid,!isEnmey,false);
        var zore = re.zIndex;
        var parent = this.getMonsterExParent(name + "CopyTomb",zore + 1,!isEnmey)
        node.parent = parent;
        node.getComponent('fightTomb').initForCopy(cc.v2(startPos.x,startPos.y - fixY));

        return script;
    },

    /** 来一个卷轴怪物怪物 */
    _newReelmonster:function(tid){
        var node = uiResMgr.getPrefabEx("monsterItem")
        var configTid = tid;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var callBack = function(spineData){
            if (!this.fightLogic.isDisplaying()) return;
            var script = this._newAmonsterNow(configTid,0,0,undefined);//9/29号  杨果粒说不要卷轴放技能  金龙测试技能
            script.setMonsterFrom(constant.FightMonsterFrom.REEL);
            var endPos = cc.v2(-this.node.width/2 + this.bornFix,script.node.y);
            endPos.x += jsonTables.randomNum(-this.stepDis,this.stepDis);
            var startDisplay = function () {
                script.startReelActio();
            }.bind(this);
            script.setReelction(endPos,startDisplay);
        }.bind(this);
        var delayFun = function() {
            this.scheduleOnce(callBack,0);
        }.bind(this);
        var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadSpine(spineName,delayFun);
    },
    /** 生成一个指定怪物 */
    newCreatorForSure:function(event){
        event.stopPropagation();
        var data = event.getUserData()
        var configTid = data.tid;
        var script = this._newAmonsterNow(configTid,0,1,undefined,false);
        var startPos = kf.getPositionInNode(data.card.node,this.floatNode,data.pos);
        var endPos = script.node.position;
        this._doNewBornAction(configTid,script,startPos,endPos);
    },
    //获得指定的我方怪物
    _getMonScritpByTid:function(tid,isEnmey){
        var parent = this._getMonsterParent(tid,!isEnmey);
        if (!parent) return null;
        for (var i = 0 , len = parent.children.length; i <  len; i++) {
            var obj = parent.children[i].getComponent("monsterItem");
            return obj
        }
        return null;
    },
    //是否超出了最大限制
    _isOverLimit:function(card,isSpecail,data){
        var configTid = card.getConfigTid();
        // var parent = this._getMonsterParent(configTid,true);
        var fromPos = data ? data.startPos : card.node.getPosition();
        var startPos = kf.getPositionInNode(card.node,this.floatNode,fromPos);

        var minieObj = this._getMonScritpByTid(configTid,false);

        if (minieObj && this.fightLogic.isSpineOverLimit(minieObj)) {
            var cb =  function(){
                cc.log("超过最大限制拉");
                this.sandTableLogic.desrInCreatingCount();
                var maxFormObj = this.fightLogic.findMaxOur(minieObj);
                maxFormObj.addHpForPassive(minieObj.getNumConfig(jsonTables.CONFIG_MONSTERLV.HpBase),true);
            }.bind(this);
            if (!minieObj) {
                return cb();
            }
            if (isSpecail) {
                this.monMoveNodeComp.initSpecail(configTid,data.type,startPos,minieObj.node.position,cb);
            }else {
                this.monMoveNodeComp.init(configTid,startPos,minieObj.node.position,cb,true);
            }
            return true;
        }
        return false;
    },

    _isEnemyOver:function (configTid) {
        var minieObj = this._getMonScritpByTid(configTid,true);
        if (minieObj && !this.fightLogic.isGameType(constant.FightType.PVE) &&this.fightLogic.isSpineOverLimit(minieObj)) {
            cc.log("超过最大限制拉");
            var maxFormObj = this.fightLogic.findMaxOur(minieObj);
            maxFormObj.addHpForPassive(minieObj.getNumConfig(jsonTables.CONFIG_MONSTERLV.HpBase),true);
            return minieObj;
        }
        return null;
    },
    /** 生成一些引导用的怪物 */
    newCreatorForGuide:function(list,cb){
        var count = 0;
        var allCount = list.length;
        var allMoveDone = function (script) {
            count++;
            script._onMessageStart_Display();
            if (count === allCount) {
                cb();
            }
        }.bind(this)
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var script = this._newAmonsterNow(obj.ID,0,0,obj.Lvl);
            var endPos = script.node.position;
            var bornPos = cc.v2( -this.node.width/2 - 100 , endPos.y);
            script.setBornMoveSpineAction(bornPos,endPos,allMoveDone);
        }
    },

    /** 来一打我发怪物 */
    newCreator:function(event){
        event.stopPropagation();
        var card = event.getUserData()
        if (Object.prototype.toString.call(card)==='[object Array]') {
            for (var i = 0; i < card.length; i++) {
                this._newAmonster(card[i]);
            }
        }else {
            this._newAmonster(card);
        }
    },
    newCreatorFromSpecail:function(event){
        event.stopPropagation();
        var list = event.getUserData();
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            this._newAmonsterFromSpecail(obj);
        }
    },
    /** 生成来自特殊怪物生的对象 */
    _newAmonsterFromSpecail:function(data){
        if (this._isOverLimit(data.script,true,data)) return;
        var card = data.script;
        var configTid = card.getConfigTid();
        var startPos = kf.getPositionInNode(card.node,this.floatNode,data.startPos);
        var node = uiResMgr.getPrefabEx("monsterItem")
        var script = this._newAmonsterNow(configTid,card.getLv()-1,1);//TODO 设置技能次数
        var endPos = script.node.position;
        script.setPosition(endPos);
        script.setAllVisible(false);
        var cb =  function(){
            script.setAllVisible(true);
            this.sandTableLogic.desrInCreatingCount();
        }.bind(this);
        this.monMoveNodeComp.initSpecail(configTid,data.type,startPos,endPos,cb);
    },

    /** 来一个我方怪物 */
    _newAmonster:function(card){
        this.fightTalkLogic.addSandContainr(card.getForm());
        if (this.fightLogic.isGameType(constant.FightType.SHARE_FIGHT)) {
            this.shareLogic.addScroe(card.getForm());
        }else if (this.fightLogic.isGameType(constant.FightType.PVE)) {
            this.achievementLogic.newFormCreator(card.getForm());
        }
        if (this._isOverLimit(card,false,null)) return;
        var configTid = card.getConfigTid();
        var startPos = kf.getPositionInNode(card.node,this.floatNode,card.node.getPosition());
        var script = this._newAmonsterNow(configTid,card.getLv()-1,1);//TODO 设置技能次数
        var endPos = script.node.position;
        this._doNewBornAction(configTid,script,startPos,endPos);
    },
    /** 做一下我方初始动画 */
    _doNewBornAction:function(configTid,script,startPos,endPos){
        script.setPosition(endPos);
        script.setAllVisible(false);
        var cb =  function(){
            script.setAllVisible(true);
            this.sandTableLogic.desrInCreatingCount();
        }.bind(this);
        this.monMoveNodeComp.init(configTid,startPos,endPos,cb,true);
    },

    /**configTid 配置id  addLV加成等级 skillCount技能设置次数  */
    /**
     * 来一个怪物
     * @param  {int}  configTid  配置id
     * @param  {int}  addLv      额外加成等级
     * @param  {int}  skillCount 技能使用次数
     * @param  {int}  baseLv     基础等级
     * @param  {bool} isEnemy    是否是敌人
     * @return {ccObj}             monsteritem脚本
     */
    _newAmonsterNow:function(configTid,addLv,skillCount,baseLv,isEnemy){
        var node = uiResMgr.getPrefabEx("monsterItem")
        var endPos = isEnemy ? cc.v2(this.node.width/2 - this.bornFix,0):cc.v2(-this.node.width/2 + this.bornFix,0);
        endPos.x += jsonTables.randomNum(-this.stepDis,this.stepDis);
        node.position = endPos;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,configTid);
        if (baseLv === undefined) {
            baseLv = this.cardLogic.getHeroesLv(config[jsonTables.CONFIG_MONSTER.FamilyID]);
            baseLv = baseLv || 1;
        }
        var info = {id:configTid,lv:baseLv};
        node.parent = this._getMonsterParent(configTid,!isEnemy);
        var shadow = this.newShadow();
        var hpItem = this.newHpNode();
        var script = node.getComponent("monsterItem");
        var owenerID = isEnemy ? this.fightLogic.getEnemyID() :this.fightLogic.getMineID();
        if (!this.fightLogic.isGameType(constant.FightType.PVE)) {
            skillCount = 0;
        }
        script.init(owenerID,info,shadow,hpItem,skillCount,addLv);
        script.setPosition(script.node.position);
        script.setBornPos(script.node.position);
        return script;
    },

    /**configTid 配置id  addLV加成等级 skillCount技能设置次数  */
    /**
     * 来一个竞技场对手怪物
     * @param  {int}  configTid  配置id
     * @param  {int}  addLv      额外加成等级
     * @param  {int}  skillCount 技能使用次数
     * @param  {int}  baseLv     基础等级
     * @param  {bool} isEnemy    是否是敌人
     * @return {ccObj}             monsteritem脚本
     */
    _newAmonsterNowForEnemy:function(configTid,addLv,skillCount,baseLv,isEnemy){
        var limitMonster = this._isEnemyOver(configTid);
        var endPos = cc.v2(this.node.width/2 - this.bornFix,0);
        endPos.x += jsonTables.randomNum(-this.stepDis,this.stepDis);
        if(limitMonster){
            limitMonster.position = endPos;
            return limitMonster;
        }
        var node = uiResMgr.getPrefabEx("monsterItem")
        node.position = endPos;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,configTid);
        if (baseLv === undefined) {
            baseLv = this.cardLogic.getHeroesLv(config[jsonTables.CONFIG_MONSTER.FamilyID]);
            baseLv = baseLv || 1;
        }
        var info = {id:configTid,lv:baseLv};
        node.parent = this._getMonsterParent(configTid,!isEnemy);
        var shadow = this.newShadow();
        var hpItem = this.newHpNode();
        var script = node.getComponent("monsterItem");
        var owenerID = isEnemy ? this.fightLogic.getEnemyID() :this.fightLogic.getMineID();
        if (!this.fightLogic.isGameType(constant.FightType.PVE)) {
            skillCount = 0;
        }
        script.init(owenerID,info,shadow,hpItem,skillCount,addLv);
        script.setPosition(script.node.position);
        script.setBornPos(script.node.position);
        return script;
    },

    /** 生成一堆我方上局留存怪物 */// NOTE: 将消息包数据重组
    newMineCreators:function(list){
        for (var i = 0 , len = list.length; i < len; i++) {
            const obj = list[i];
            var callBack = function(spineData){
                var script = this._newAmonsterNow(obj.ID,0,obj.Skill,obj.Lvl);
                var endPos = script.node.position;
                var bornPos = cc.v2( -this.node.width/2 - 100 , endPos.y);
                script.setBornMoveSpineAction(bornPos,endPos,function(){});
            }.bind(this);
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,obj.ID);
            var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
            uiResMgr.loadSpine(spineName,callBack);
        }
    },

    /** 来一个敌对怪物 */
    newNemeyCreator:function(listIDs){
        for (var i = 0; i < listIDs.length; i++) {
            const node = uiResMgr.getPrefabEx("monsterItem")
            const data = listIDs[i];
            var callBack = function(spineData){
                var script = this._newAmonsterNowForEnemy(data.id,0,0,data.lv,true);
                var endPos = script.node.position;
                var bornPos = cc.v2( this.node.width/2 + 100 , endPos.y);
                script.setBornMoveSpineAction(bornPos,endPos,function(){});
            }.bind(this);
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.id);
            var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
            uiResMgr.loadSpine(spineName,callBack);
        }
    },
    /** 票一个字 */
    newFloatNum:function(count,targetNode,ownerID,isCrit,isHeal){
        var node = uiResMgr.getPrefabEx("floatKill")
        node.parent = this.floatNode;
        var addLen = jsonTables.random(50,200);
        var topPos = cc.v2(targetNode.x,(targetNode.y + addLen));
        var pos = kf.getPositionInNode(targetNode,this.floatNode,topPos);
        count = parseInt(count);
        node.getComponent("floatKill").init(count,pos,ownerID,isCrit,isHeal);
    },
    /** 来一个血量预制体 */
    newHpNode:function(){
        var node = uiResMgr.getPrefabEx("fightHp")
        node.parent = this.hpNode;
        var script = node.getComponent("fightHp");
        return script;
    },
    /** 来一个影子 */
    newShadow:function(){
        var node = uiResMgr.getPrefabEx("fightShadow")
        node.parent = this.shadowNode;
        var script = node.getComponent("fightShadow");
        return script;
    },
    /** 获取用掉的卷轴 通知服务器  本地也修改一下缓存 */
    getUsedReelList:function(){
        var list = [];
        for (var reelId in  this.usedReelMap) {
            list.push({ID:Number(reelId),Num:this.usedReelMap[reelId]});
        }
        this.usedReelMap = cc.js.createMap();
        return list;
    },
    /** 更新界面数值 */
    updateDisplay:function(){
        this.waveCountLabel.string = (this.fightLogic.curWaves + 1) +"/" + (this.fightLogic.maxWaves + 1);
    },
    /** 清理场景  把那些多余的节点回收了 */
    clearScene:function(isInit){
        var list = this.floatNode.children;
        this._clearChild(list);
        var list = this.monMoveNodeComp.node.children;
        this._clearChild(list);
        for (var i = 0 , len = this.monsterExParents.length; i < len; i++) {
            var obj = this.monsterExParents[i];
            if (cc.isValid(obj) && obj.children.length > 0) {
                list = obj.children;
                this._clearChild(list);
            }
        }
        if (isInit) {
            var arr = this.fightNode.children;
            for(var i = arr.length-1;i > -1;i--){
              var obj = arr[i];
              if (obj && obj.name === "monsterItem") {
                  obj.getComponent("monsterItem").putInPool();
              }
            }
        }
    },
    /** 逆序回收子节点 */
    _clearChild:function(list){
        if (!list) return;
        var arr = kf.cloneArray(list);
        for(var i = arr.length-1;i > -1;i--){
          var obj = arr[i].getComponent(arr[i].name);
          if (obj && obj.forcePut) {
              obj.forcePut(true);
          }
        }
    },

    callSandShowForGuide:function(){
        this.sandNode.active = true;
        this.uiNode.active = true;
        this.sandNode.opacity = 0;
        this.sandNode.stopAllActions();
        this.sandNode.runAction(cc.fadeTo(0.5,255));
        this.sandTableLogic.setTouchEnable(true);
        var sandBox = this.sandNode.getInstance(this.sandBox,true);
        var sandBoxJs = sandBox.getComponent(this.sandBox.name);
        sandBoxJs.reShowBox();
    },

    //重现沙盘
    callSandBoxReShow:function (callBack) {
        this._pauseEvent(false);//修復BOSS關卡在馬上通關第一关卡的时候点暂停卡死
        this.msgHanderLogic.newAllMsg(null,0.1,constant.MsgHanderType.WAITE_WAVE);
        if (this.tipNode.children.length > 0){
            this.tipNode.children[0].active = false;
        }
        this.clearScene(false);
        var delayFunc = function(){
            this.setUiBtnVisible(true);
            this.sandNode.active = true;
            this.uiNode.active = true;
            this.sandNode.opacity = 0;
            this.sandNode.runAction(cc.fadeTo(0.5,255));
            var sandBox = this.sandNode.getInstance(this.sandBox,true);
            var sandBoxJs = sandBox.getComponent(this.sandBox.name);
            sandBoxJs.reShowBox();
            this.refreshShowAdBtn();
            if (callBack) callBack();
        }.bind(this);
        if (!this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {//// NOTE: 暂时特殊处理下
            this.uiNode.active = false;
            this.scheduleOnce(function(){
                this.fightBgNodeComp.callSceneMove(delayFunc);
                this.bgOcclusionComp.callSceneMove();
                if (this.fightLogic.isGameType(constant.FightType.PVE)) {
                    this.widget('fightScene/shrink/iconBoss').active = true;
                    if (this.fightLogic.isPveLastWave()) {
                       var node = this.node.getInstance(this.bossTurnTip, true);
                       node.zIndex = 1000;
                       node.getComponent(this.bossTurnTip.name).init(0.2);
                    }
                }
            },0.1);
        }else {
            var areanUi = this.widget('fightScene/shrink/rankNode').getChildByName(this.areanUiPrefab.name);
            if (areanUi) {
                areanUi.getComponent(this.areanUiPrefab.name).setStepVisibl(true);
            }
            delayFunc();
        }
    },
    //初始化沙盘
    callSandBox:function(){
        this.sandNode.active = true;
        var sandBox = this.sandNode.getInstance(this.sandBox,true);
        var sandBoxJs = sandBox.getComponent(this.sandBox.name);
        sandBoxJs.init();
    },
    //初始化场景
    callFightScene:function(){
        jsonTables.displaySpeed_Stop = false;
        this.initFlag = true;
        this.clearScene(true);
        this.fightLogic.initFight();
        this.callInitGamer();
        this.initFlag = false;
    },
    callInitGamer:function(){
        this.callInitPlayer();
        if (this.fightLogic.isShowEnmeyPlayer()) {
            this.callInitEnemy();
        }
    },
    /** 初始化角色 */
    callInitPlayer:function(){
        if (this.fightLogic.isGameType(constant.FightType.SHARE_FIGHT)) return;
        var node = uiResMgr.getPrefabEx("monsterItem")
        node.parent = this.fightNode;
        var endPos = cc.v2(-this.node.width/2+this.bornFix,0);
        node.position = endPos;
        var shadow = this.newShadow();
        var hpItem = this.newHpNode();
        var sex = this.userLogic.getBaseData(this.userLogic.Type.Sex);
        var profession = this.userLogic.getBaseData(this.userLogic.Type.Career);
        var tid = jsonTables.profession2Monster(profession,sex);
        var info = {id:tid,lv:1};//TODO 获取怪物自身的等级传递进去的等级
        var script = node.getComponent("monsterItem");
        script.init(this.fightLogic.getMineID(),info,shadow,hpItem,0,0,true);
        script.setPosition(script.node.position);
        script.setBornPos(script.node.position);
    },
    /** 初始化敌对角色角色 */
    callInitEnemy:function(){
        var node = uiResMgr.getPrefabEx("monsterItem")
        node.parent = this.fightNode;
        var endPos = cc.v2(this.node.width/2 - this.bornFix,0);
        node.position = endPos;
        var shadow = this.newShadow();
        var hpItem = this.newHpNode();
        var tid = this.fightLogic.getEnmeyTid();
        if (!tid) return cc.error("``````hi man")
        var info = {id:tid,lv:1};//TODO 获取怪物自身的等级传递进去的等级
        var script = node.getComponent("monsterItem");
        script.init(this.fightLogic.getEnemyID(),info,shadow,hpItem,0,0,true);
        script.setPosition(script.node.position);
        script.setBornPos(script.node.position);
    },
    /** 初始化ui */
    callUiInit:function () {
        this.uiNode.active = !this.fightLogic.isGameType(constant.FightType.SHARE_FIGHT);
        var node = this.node.getInstance(this.shareUi,!this.uiNode.active);
        if (node) {
            node.zIndex = 9999;
        }
        this.waveCountLabel.node.parent.active = this.fightLogic.isGameType(constant.FightType.PVE);
        this.fightPowerMap = {"0":0,"1":0};
        this.fightPowerLabels[0].string = 0;
        this.fightPowerLabels[1].string = 0;
        this.sandNode.opacity = 255;
        this.sandNode.stopAllActions();
        this._refreshReels(true);
        if (this.skillInstance) {
            this.skillInstance.init();
            this.skillInstance.node.active = false;
        }
        this.usedReelMap= cc.js.createMap();
        this.resetZore();
        this.bgEffectNodeComp.init();
        this.fightBgNodeComp.resetList();
        this.bgOcclusionComp.resetList();
        this.updateRetainLabel();
        if (this.tipNode.children.length > 0){
            this.tipNode.children[0].active = false;
        }
        var isArean = this.fightLogic.isGameType(constant.FightType.PVP_AREAN);
        this.tipEvent(null,true);
        this.setDisplaySpeed(isArean);
        this.speedEvent(null,true);
        this.widget('fightScene/shrink/iconBoss').active = false;
        this.widget('fightScene/shrink/retain').active = !this.guideLogic.isInGuideFlag() && !isArean;//
        this.widget('fightScene/shrink/backButton').active = !this.guideLogic.isInGuideFlag();//
        this.widget('fightScene/shrink/speedButton').active = !this.guideLogic.isInGuideFlag() && !this.fightLogic.isGameType(constant.FightType.PVP_AREAN);
        this.widget('fightScene/shrink/backButton').active = !this.guideLogic.isInGuideFlag();//
        this.combatPowerNode.active = !this.guideLogic.isInGuideFlag();
        var areanUi = this.widget('fightScene/shrink/rankNode').getInstance(this.areanUiPrefab,isArean);
        if (isArean) {
            areanUi.getComponent(this.areanUiPrefab.name).refreshAreanStar();
        }
        var isWorldBoss = this.fightLogic.isGameType(constant.FightType.WORLD_BOSS);
        this.widget('fightScene/shrink/combatRight').active = !isWorldBoss && !this.guideLogic.isInGuideFlag();
        var worldBossUi = this.widget('fightScene/shrink/rankNode').getInstance(this.worldBossUiPrefab,isWorldBoss);
        if(isWorldBoss){
            worldBossUi.getComponent(this.worldBossUiPrefab.name).init();
        }
        // this.stopEvent(null,true);
        this.setUiBtnVisible(true);
        // this.node.getInstance(this.bossTurnTip, false);//
        this.combatPowerNode.getInstance(this.fightCombatPrefab,false);

        this.refreshShowAdBtn();
    },

    refreshShowAdBtn:function (isForceClose) {
        if (isForceClose === false) {
            this.widget("btnShowAd").active = false;
        }else {
            this.widget("btnShowAd").active = this.fightLogic.isGameType(constant.FightType.PVE) && this.adHelperLogic.isCanShowAd() && this.shareLogic.isStepShareCount();
        }
        //this.widget("btnShowAd").active = false;
    },


    /** 刷新卷轴 */
    _refreshReels:function(needLoadIcon){
        this.reShowReelContent();
        if (this.reelParent.active) {
            this.cardLogic.copyReelInfoForPve();//拷贝一份  为了 失败重置
            var list = this.cardLogic.getReelsLineUp();
            var refreshData = {
                content:this.reelParent,
                list:list,
                prefab:this.reelPrefab,
                ext:{needLoadIcon:needLoadIcon,map:this.usedReelMap}
            }
            uiManager.refreshView(refreshData);
        }
    },
    //进入场景 开始初始化
    enterScene:function(){
        this.fightLogic.sceneRoot = this;
        this.callUiInit();
        this.callFightScene();
        this.callSandBox();
        this.clientEvent.dispatchEvent("playBgMusice",constant.AudioID.BATTLE_BG);
        this.fightLogic.initDone();
    },
    /** 开打了 */
    displayNow:function(){
        this.setUiBtnVisible(false);
        if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {//// NOTE: 暂时特殊处理下
            if (this.sandNode.active) {
                this.sandNode.active = false;
            }
            var areanUi = this.widget('fightScene/shrink/rankNode').getChildByName(this.areanUiPrefab.name);
            if (areanUi) {
                areanUi.getComponent(this.areanUiPrefab.name).setStepVisibl(false);
            }
        }else if(this.fightLogic.isGameType(constant.FightType.WORLD_BOSS)){
            var worldBossUi = this.widget('fightScene/shrink/rankNode').getChildByName(this.worldBossUiPrefab.name);
            if(worldBossUi){
                worldBossUi.getComponent(this.worldBossUiPrefab.name).show();
            }
        }
        this.reelParent.active = !this.guideLogic.isInGuideFlag() && this.fightLogic.isGameType(constant.FightType.PVE) && this.chapterLogic.getMaxMiniChapter() >= 301;//策划需求要大于第三章第二关卡才开放战斗中使用卷轴
    },

    setUiBtnVisible:function(active){
        this.reelParent.active = !this.guideLogic.isInGuideFlag() && !active && this.fightLogic.isGameType(constant.FightType.PVE) && this.chapterLogic.getMaxMiniChapter() >= 301;//策划需求要大于第三章第二关卡才开放战斗中使用卷轴

        this.widget('fightScene/shrink/tipsButton').active = !this.guideLogic.isInGuideFlag() && active;
        // this.widget('fightScene/shrink/stopButton').active = active;
    },

    //设置当前
    setDisplaySpeed: function (isArean) {
        //引导需要强制2倍速
        if(this.guideLogic.isInGuideFlag())
            jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_Max;
        else if(isArean)  //竞技场在其他地方已经设置过了
            jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_CurSpeed;
        else {//正常情况取本地缓存  如果没有则默认一倍速
            var curSpeed = kf.require("util.configuration").getConfigData("actionSpeed");
            jsonTables.displaySpeed_CurSpeed = curSpeed || jsonTables.displaySpeed_Max;
            this.widget("speedHint").active = !curSpeed;
            if(this.widget("speedHint").active) {
                this.scheduleOnce(function () {
                    this.widget("speedHint").active = false;
                }, 3);
            }
        }
    },

    //返回按钮
    backEvent:function(){
        var callBack = function(){
            if (this.fightLogic.ctrlExitGame()) {//
                var ev = new cc.Event.EventCustom('loadScene', true);
                ev.setUserData({sceneID:constant.SceneID.MAIN,param:[],loadCallBack:function(){
                    if (this.fightLogic.isGameType(constant.FightType.PVE)) {
                        var info = this.fightLogic.getPveInfo();
                        uiManager.openChapter(info.id,false);
                    }
                }.bind(this)});
                this.node.dispatchEvent(ev);
            }
        }.bind(this);
        if (this.fightLogic.isDisplaying()) {
            this._pauseEvent(true);
        }
        var str = this.fightLogic.isGameType(constant.FightType.PVE) ?"pve":"other";
        str = uiLang.getMessage(this.node.name,str);
        if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
            str = str + uiLang.getMessage(this.node.name,"arean");
        }
        var message = {
            "message":  str,
            "button1":{
                "name": uiLang.getMessage("b", "MBCANCEL"),
                "callback": function(){
                    if (this.fightLogic.isDisplaying()) {
                        this._pauseEvent(false);
                    }
                }.bind(this)
            },
            "button3":{
                "name": uiLang.getMessage("b", "MBOK"),
                "callback":callBack
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    },
    //加速按钮
    speedEvent:function(_,doNotRest){
        if (!doNotRest) {
            jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_CurSpeed === jsonTables.displaySpeed_Noraml ? jsonTables.displaySpeed_Max:jsonTables.displaySpeed_Noraml;
            this.msgHanderLogic.newAllMsg(null,0,constant.MsgHanderType.DISPLAY_SPEED);
            kf.require("util.configuration").setConfigData("actionSpeed",jsonTables.displaySpeed_CurSpeed);
            kf.require("util.configuration").save();
            if(this.widget("speedHint").active)
                this.widget("speedHint").active = false;
        }
        this.widget('fightScene/shrink/speedButton/nameLabel').getComponent(cc.Label).string = jsonTables.displaySpeed_CurSpeed === jsonTables.displaySpeed_Noraml ? "x1" :"x2";
        var idx = jsonTables.displaySpeed_CurSpeed !== 1 ? 1:0
        this.speedSprite.spriteFrame = this.speedSpriteframes[idx];
    },

    _pauseEvent:function(isPause){
        if (!isPause) {
            jsonTables.displaySpeed_Stop = isPause;
        }// NOTE: 这个写法以后优化一下
        this.msgHanderLogic.newAllMsg(null,0,constant.MsgHanderType.DISPLAY_STOP_RESUME,isPause);
    },

    //暂停按钮
    stopEvent:function(_,doNotRest){
        var re = !jsonTables.displaySpeed_Stop;
        var str = !re ? "auto":"stop";
        if (doNotRest) {
            str = "auto";
        }
        this.widget('fightScene/shrink/stopButton/nameLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,str);
        if (!doNotRest) {
            if (!re) {
                jsonTables.displaySpeed_Stop = re;
            }// NOTE: 这个写法以后优化一下
            this.msgHanderLogic.newAllMsg(null,0,constant.MsgHanderType.DISPLAY_STOP_RESUME,re);
        }
        var idx = !re ? 1 : 0;
        if (doNotRest) {
            idx = 1;
        }
        this.stopSprite.spriteFrame =  this.stopSpriteframes[idx];
    },

    tipEvent:function(_,doNotRest){
        if (!doNotRest) {
            jsonTables.showTip = !jsonTables.showTip;
            var fingerStatus = jsonTables.showTip?constant.SettingStatus.OPEN:constant.SettingStatus.CLOSE;
            kf.require("util.configuration").setConfigData("finger",fingerStatus);
            kf.require("util.configuration").save();
        }
        var idx = jsonTables.showTip ? 0:1;
        this.tipSprite.spriteFrame = this.tipSpriteframes[idx];

        var str = jsonTables.showTip ? "open":"close";
        this.widget('fightScene/shrink/tipsButton/nameLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,str);
        if (!doNotRest && jsonTables.showTip) {
            this.tipNode.getInstance(this.fighterPrefab,true);
            var sandBox = this.sandNode.getInstance(this.sandBox,true);
            var sandBoxJs = sandBox.getComponent(this.sandBox.name);
            sandBoxJs.showTipNow();
        }else {
            if (!jsonTables.showTip) {
                this.tipNode.getInstance(this.fighterPrefab,false);
            }
        }
    },

    btnShowAd:function () {
        uiManager.openUI(uiManager.UIID.TIPMSG, "目前不支持此功能");
        return;
        if(window.FBInstant || window.sdw) {   //fb版本分享
            this.shareLogic.share(tb.SHARELINK_STEP,0,function (isSucess) {
                if (isSucess) {
                    var cur = this.userLogic.getBaseData(this.userLogic.Type.ChapterShareTimes);
                    cur++;
                    this.userLogic.setBaseData(this.userLogic.Type.ChapterShareTimes,cur);//NOTE 需要客户端先自身 累计 不然要等服务器回复
                    this.shareLogic.req_Share(1);// NOTE: 通知服务器分享了
                    var steps = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ShareGetStep);
                    var step = jsonTables.random(steps);
                    this.fightLogic.addStepNum(step);
                    this.refreshShowAdBtn();
                }
            }.bind(this));
        }
        else {      //其他版本看广告
            this.adHelperLogic.showAd(function (result) {
                if (result === true) {
                    var cur = this.userLogic.getBaseData(this.userLogic.Type.ChapterShareTimes);
                    cur++;
                    this.userLogic.setBaseData(this.userLogic.Type.ChapterShareTimes,cur);//NOTE 需要客户端先自身 累计 不然要等服务器回复
                    this.adHelperLogic.req_Watch_Adv(constant.AdvType.GAME);// NOTE: 通知服务器分享了
                    var steps = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ShareGetStep);
                    var step = jsonTables.random(steps);
                    this.fightLogic.addStepNum(step);
                    this.refreshShowAdBtn();
                }
            }.bind(this));
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.msgHanderLogic.kfUpdate(dt);
        this.fightTalkLogic.kfUpdate(dt);
    }
});
