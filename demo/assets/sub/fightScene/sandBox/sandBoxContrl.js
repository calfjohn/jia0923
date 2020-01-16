var panel = require("panel");

var sandPanel = cc.Class({
    extends: panel,

    properties: {
        isUseConfig:{
            default: true,
            tooltip: "areaSize属性是否读取配置表，默认true"
        },
        areaSize: {
            default: cc.size(0,0),
            tooltip: "单个节点大小现在是读取SandGridPixel配置"
        },
        maskAddSize: {
            default: cc.size(0,0),
            tooltip: "mask左右扩边量"
        },
        _widthCount:0,
        _heightCount:0,
        maskNode:cc.Node,
        leftCount:cc.Label,
        leftAni:cc.Animation,
        leftConent:cc.Node,
        itemPrefab:cc.Prefab,
        itemParent:cc.Node,
        stoneParent:cc.Node,

        itemBgPrefab:cc.Prefab,
        itemBgParent:cc.Node,

        itemLockPrefab:cc.Prefab,
        itemLockParent:cc.Node,

        guideMask:cc.Node,

        addStepLabel:cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.copyMoveNode = null;//拷贝节点用于  展示拖动
        this.duration = 0;
        if (this.isUseConfig) {
            var width = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.SandGridPixel);
            this.constantCellSize = cc.size(width,width);
        }else {
            this.constantCellSize = kf.clone(this.areaSize);
        }

        this.tipInterval = 10;
        this.tipFlag = true;
        this.registerEvent();
    },

    onDisable: function() {
        this.tipFlag = false;
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshStep", this.refreshStep.bind(this)],
            ["guideAction", this.guideAction.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchcancel.bind(this)],
            ["stoneBreak", this.stoneBreak.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    guideAction:function(type,active){
        if (type === "showFirstExcellent") {
            if (active) {
                this.resetFightFlag();
                this.showTipNow();
            }
            this.showGuideTip = active;
        }
    },

    reShowBox:function(){
        this.refreshStep(true);
        var num = this.fightLogic.getCurStep();
        this.switchColor(num);
        if (this.copyMoveNode) {
            this.copyMoveNode.setVisible(false);
        }
        if (this.curClickCard) {
            this.curClickCard.setSpineVisible(true);
            this.curClickCard = null;
        }
        this._resetLastClick();
    },

    init:function(list){
        this.fightLogic.setSandBoxLen(list.length);
        this.tipInterval = this.guideLogic.isInGuideFlag() ? this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.GuideCD)/1000 : 10;

        if (!this.copyMoveNode) {
            var node = cc.instantiate(this.itemPrefab);
            node.setLocalZOrderEx(100);
            node.parent = this.node;
            this.copyMoveNode = node.getComponent(this.itemPrefab.name)
            this.copyMoveNode.setVisible(false);
        }

        this.unscheduleAllCallbacks();

        this.refreshStep(true);
        var num = this.fightLogic.getCurStep();
        this.switchColor(num);
        if (this._widthCount && this._widthCount !== list.length) {
            this.itemBgParent.removeAllChildren();
            this.itemLockParent.removeAllChildren();
            this.itemParent.removeAllChildren();
        }

        this.stoneParent.removeAllChildren();

        this._widthCount = list.length;
        this._heightCount = list[0].length;

        this.scaleSize = 4 / this._widthCount;
        this.areaSize.width = this.constantCellSize.width * this.scaleSize;
        this.areaSize.height = this.constantCellSize.height * this.scaleSize;

        this.node.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.itemParent.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.itemParent.setAnchorPoint(cc.v2(0,0));
        this.itemParent.setPosition(-this.itemParent.width/2,-this.itemParent.height/2);
        this.stoneParent.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.stoneParent.setAnchorPoint(cc.v2(0,0));
        this.stoneParent.setPosition(-this.itemParent.width/2,-this.itemParent.height/2);
        this.itemBgParent.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.itemBgParent.setAnchorPoint(cc.v2(0,0));
        this.itemBgParent.setPosition(-this.itemParent.width/2,-this.itemParent.height/2);
        this.itemLockParent.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.itemLockParent.setAnchorPoint(cc.v2(0,0));
        this.itemLockParent.setPosition(-this.itemParent.width/2,-this.itemParent.height/2);

        this.maskNode.setContentSize(this.itemParent.width+this.maskAddSize.width*2,this.itemParent.height+this.maskAddSize.height*2);

        this.sandTableLogic.initTable(this);

        this.rowCount = list.length;
        this.colCount = list[0].length;
        var content = this.itemParent;
        var idx = 0,msgItem,msgBgItem,msgBgScript,msgLockItem,msgLockScript;
        var vaildSandCount = 0;
        for (var i = 0; i < list.length; i++) {
            var data = list[i];
            for (var j = 0; j < data.length; j++) {
                idx = i*this.rowCount + j;
                if(this.itemBgParent.children[idx]) {
                    msgBgItem = this.itemBgParent.children[idx];
                }
                else {
                    msgBgItem = cc.instantiate(this.itemBgPrefab);
                    msgBgItem.parent = this.itemBgParent;
                }
                msgBgItem.setContentSize(this.areaSize);
                msgBgScript = msgBgItem.getComponent(this.itemBgPrefab.name);

                if(this.itemLockParent.children[idx]) {
                    msgLockItem = this.itemLockParent.children[idx];
                }
                else {
                    msgLockItem = cc.instantiate(this.itemLockPrefab);
                    msgLockItem.parent = this.itemLockParent;
                }
                msgLockItem.setContentSize(this.areaSize);
                msgLockScript = msgLockItem.getComponent(this.itemLockPrefab.name);


                if(content.children[idx - this.stoneParent.children.length]) {
                    msgItem = content.children[idx - this.stoneParent.children.length];
                }
                else {
                    msgItem = cc.instantiate(this.itemPrefab);
                }
                var type = Math.floor(data[j].id /jsonTables.TYPE_BASE_COUNT);
                msgItem.parent = type === constant.Id_Type.STONE ?this.stoneParent:content;
                msgItem.setContentSize(this.areaSize);
                var script = msgItem.getComponent(this.itemPrefab.name);
                script.init(data[j].id,i,j,msgBgScript,data[j].lv,data[j].idx,data[j].chapterId,msgLockScript,this.scaleSize,-1,true);
                this.sandTableLogic.addCell(i,j,{node:msgItem,bindJs:script,rect:msgItem.getBoundingBox()});
                if (data[j].id) {//排除空的格子
                    vaildSandCount++;
                }
            }
        }
        var allItemCount = this.rowCount * this.colCount - this.stoneParent.children.length;
        if(content.children.length > allItemCount) {
            for(var j = allItemCount; j < content.children.length; ) {
                var node = content.children[j];
                node.removeFromParent();
                node.destroy();
            }
        }
        this.sandTableLogic.setVaildSandCount(vaildSandCount);
        this.curClickCard = null;//bindJs对象
        this.resetFightFlag();
        this.sandTableLogic.resetSandPool();//
        this.talentSkillLogic.checkSandTime(tb.Talent_BEGIN);
        this.guideMask.active = false;
        // if (this.guideLogic.isInGuideFlag()) {
        //     this.guideMask.active = true;
        //     this.enableList = [cc.v2(0,1),cc.v2(1,0),cc.v2(1,1),cc.v2(1,2),cc.v2(1,3),cc.v2(2,1),cc.v2(3,1)];
        // }
    },
    touchstart:function(event){
        if (!this.sandTableLogic.isTouchEnable()) return;
        event.stopPropagation();
        if (this.curClickCard) return cc.error("一个个来 手贱点那么多玩蛇");
        var pos = event.getLocation();
        var itemCell = this.transformPos(pos);
        if (!itemCell) return cc.error("没有选中啊  ")

        // if(this.enableList && this.enableList.length){
        //     var enable = false;
        //     for (var i = 0 , len = this.enableList.length; i < len; i++) {
        //         var obj = this.enableList[i];
        //         if(itemCell.row === obj.x && itemCell.col === obj.y){
        //             enable = true;
        //             break;
        //         }
        //     }
        //     if(!enable){
        //         return cc.log("此处不允许操作");
        //     }
        // }
        this.curClickCard = itemCell;
        if (!this.curClickCard.isCanTouch()) return;
        this.lastClickCard = itemCell;
        this.curClickCard.setSpineVisible(false);
        itemCell.setLightActive(true);
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SELECTED);
        this.copyMoveNode.init(this.curClickCard.getData());
        this.copyMoveNode.setVisible(true);
        var nodePos = this.node.convertToNodeSpaceAR(pos)
        this.copyMoveNode.setPosition(nodePos);
        this.copyMoveNode.node.stopAllActions();
        // this.copyMoveNode.node.scale = this.copyMoveNode.scaleSize;
        this.copyMoveNode.node.scale = 0.5;
        this.copyMoveNode.node.runAction(cc.scaleTo(0.2,this.copyMoveNode.getMoveScale()))
        this.resetFightFlag();
    },
    touchmove:function(event){
        if (!this.sandTableLogic.isTouchEnable() || !this.curClickCard) return;
        event.stopPropagation();
        if (!this.curClickCard.isCanTouch()) return;

        var pos = event.getLocation();
        var nodePos = this.node.convertToNodeSpaceAR(pos)
        this.copyMoveNode.moveCard(nodePos);
        var itemCell = this.transformPos(pos);
        this._resetLastClick();
        if (itemCell) {
            this.lastClickCard = itemCell;
            itemCell.setLightActive(true);
        }
    },
    touchend:function(event){
        if (!this.sandTableLogic.isTouchEnable() || !this.curClickCard) return;
        event.stopPropagation();
        var pos = event.getLocation();
        var itemCell = this.transformPos(pos);
        if (!itemCell) cc.error("没有选中啊  ")
        this.copyMoveNode.setVisible(false);
        if (this.curClickCard.isCanTouch()) {
            this.curClickCard.setSpineVisible(true);
        }
        this._resetLastClick();
        // if(this.enableList && this.enableList.length){
        //     var enable = false;
        //     for (var i = 0 , len = this.enableList.length; i < len; i++) {
        //         var obj = this.enableList[i];
        //         if(itemCell.row === obj.x && itemCell.col === obj.y){
        //             enable = true;
        //             break;
        //         }
        //     }
        //     if(!enable){
        //         this.curClickCard = null;
        //         return;
        //     }
        // }

        if (this.curClickCard.isTheSameScript(itemCell)) {
            if (this.curClickCard.isSpecailMonster()) {//暂时废弃
                var tid = itemCell.getSpecialMonsterID();
                var hpCount = itemCell.getHpCount();
                var count = itemCell.getCount();
                uiManager.openUI(uiManager.UIID.SAND_OFFICE,tid,this.scaleSize,hpCount,count);
            }else if (this.curClickCard.isClickMonster()) {
                this.curClickCard.doClickEffect();
            }
        }else {
            if (this.curClickCard.isCanTouch()) {
                if (itemCell.isCanTouch()) {
                    if(!this.sandTableLogic.doCheckTouchMove(this.curClickCard,itemCell)){
                        this.guideLogic.firstFingerFlag = true;
                    }else{
                        if (this.guideLogic.isInGuideFlag()) {
                            // this.showGuideTip = true;
                            this.guideLogic.showFirstGuideAction(true);
                        }
                        // this.enableList = null;
                        // this.guideMask.active = false;
                    }
                    if (this.guideLogic.isInGuideFlag()) {
                        this.tipInterval = this.guideLogic.isInGuideFlag() ? this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.GuideCD)/1000 : 10;
                        this.clientEvent.dispatchEvent("guideAction","showSandLight",{posList:[],worldTip:-1})
                        if(this.curClickCard.getConfigTid() !== itemCell.getConfigTid()){
                            this.node.dispatchDiyEvent("showFingerTip",{show:false});
                            this.tipFlag = true;
                        }
                        if (this.guideLogic.inSenconFlag) {
                            this.guideLogic.inSenconFlag = false;
                        }
                        this.recordGuideStep(itemCell);
                    } else {
                        this.recordStep();
                    }
                    this.checkIsSameTouch(itemCell);
                }else {
                    if (itemCell.isSpecailMonster()) {//特殊怪物吞噬处理
                        this.sandTableLogic.doCheckTouchSpecail(this.curClickCard,itemCell);
                    }
                }
            }
        }
        this.curClickCard = null;
        this.resetFightFlag();
    },
    touchcancel:function(event){
        if (!this.sandTableLogic.isTouchEnable() || !this.curClickCard) return;
        event.stopPropagation();
        this._resetLastClick();
        // if(this.enableList && this.enableList.length){
        //     this.curClickCard.setSpineVisible(true);
        //     this.copyMoveNode.setVisible(false);
        //     this.curClickCard = null;
        //     return;
        // }
        if (this.curClickCard.isCanTouch()) {
            this.curClickCard.setSpineVisible(true);
            this.copyMoveNode.setVisible(false);
            var form = this.curClickCard.getForm();
            var info = this.fightLogic.getPveInfo();
            if(info && form >= 3 && this.curClickCard.tid && this.curClickCard.tid === 1023 && info && info.chapterIdx === 102 && !this.userLogic.getFlagInfo(this.userLogic.Flag.FightTask)[0]){
                this.clientEvent.dispatchEvent("fightTaskOver");
                this.userLogic.req_Cli_Reward_Receive(this.userLogic.Flag.FightTask);
                this.userLogic.setFlagInfo(this.userLogic.Flag.FightTask,[1]);
                this.userLogic.saveFlagInfo2Server([this.userLogic.Flag.FightTask]);//修改远端
            }
            var inTimeTypes = this.talentSkillLogic.getForm2Tablent(form);
            if (inTimeTypes) {
                for (var i = 0 , len = inTimeTypes.length; i <  len; i++) {
                    var inTimeType = inTimeTypes[i];
                    this.talentSkillLogic.checkSandTime(inTimeType,this.curClickCard);
                }
            }
            this.sandTableLogic.doCheckTouchOut(this.curClickCard);
            if (form >= tb.MONSTER_EPIC && !this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
                uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"addStep"));
            }
            this.resetFightFlag();
            if (this.guideLogic.isInGuideFlag()) {
                this.recordGuideStep();
            } else {
                this.recordStep();
            }
        }
        this.curClickCard = null;
    },

    recordStep: function (){
        const curStep = this.fightLogic.getCurStep();
        const maxStep = this.fightLogic.getMaxStep();
        const id = maxStep - curStep + 1;
        const chapterInfo = this.fightLogic.getPveInfo();
        if(chapterInfo){
            window.adjustUtil.recored(tb.ADJUST_RECORED_FIRST_TABLE, chapterInfo.chapterIdx, id);
        }
    },

    recordGuideStep: function(){
        const curStep = this.fightLogic.getCurStep();
        const maxStep = this.fightLogic.getMaxStep();
        const id = maxStep - curStep + 1;
        window.adjustUtil.recored(tb.ADJUST_RECORED_SAND_TABLE, id);
    },

    checkIsSameTouch: function(itemCell){
        if(this.curClickCard.getConfigTid() !== itemCell.getConfigTid()) return;
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"sameTip"));
        itemCell.relativeBg.setEffectActive();
        this.curClickCard.relativeBg.setEffectActive();
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SAND_SAME_TIP);
    },

    _resetLastClick:function(){
        if (this.lastClickCard) {
            this.lastClickCard.setLightActive(false);
            this.lastClickCard = null;
        }
    },

    refreshStep:function(isForce){
        if (!isForce) {
            if (!this.leftConent.active) return;
        }
        var num = this.fightLogic.getCurStep();
        if (this.fightLogic.isGameType(constant.FightType.PVE)) {
            var maxCount = this.fightLogic.getMaxStep();
            var addStep = this.chapterLogic.getPrivilegesStep() - (maxCount - num);
            this.addStepLabel.node.active = addStep > 0;
            this.addStepLabel.string = "+" + addStep;
            this.leftCount.string = addStep > 0 ? num - addStep : num;
        }else{
            this.leftCount.string = num;
        }

        // this.switchColor(num);
    },

    showNextSTep:function(){
        if (!this.leftConent.active) return;
        var num = this.fightLogic.getCurStep() - 1;
        if (this.fightLogic.isGameType(constant.FightType.PVE)) {
            var maxCount = this.fightLogic.getMaxStep();
            var addStep = this.chapterLogic.getPrivilegesStep() - (maxCount - num);
            this.addStepLabel.node.active = addStep > 0;
            this.addStepLabel.string = "+" +  addStep;
            this.leftCount.string = addStep > 0 ? num - addStep : num;
        }else{
            this.leftCount.string = num;
        }

        this.switchColor(num);
    },

    switchColor:function(num){
        this.leftCount.node.color = num <= 3 ? uiColor.fightColor.sandBoxColor.numColorlimit : uiColor.fightColor.sandBoxColor.numColorNormal;
        if (this.fightLogic.getMaxStep() !== num) {//
            this.leftAni.play();
        }
    },

    /** 减少步骤 */
    _desrStep:function(){
    },

    transformPos:function(worldPos){
        var nodePos = this.itemParent.convertToNodeSpaceAR(worldPos)
        var nearMaxRow = Math.ceil(nodePos.y / this.areaSize.width);
        nearMaxRow = nearMaxRow >= this.rowCount ?  (this.rowCount-1):nearMaxRow;
        var nearMinRow = nearMaxRow - 1;
        nearMinRow = nearMinRow < 0 ? 0 :nearMinRow;

        var nearMaxCol = Math.ceil(nodePos.x / this.areaSize.height);
        nearMaxCol = nearMaxCol >= this.colCount ?  (this.colCount-1):nearMaxCol;
        var nearMinCol = nearMaxCol - 1;
        nearMinCol = nearMinCol < 0 ? 0 :nearMinCol;
        var itemCells = this.sandTableLogic.getItemCell();
        for (var i = nearMinRow; i <= nearMaxRow; i++) {
            var list = itemCells[i];
            for (var j = nearMinCol; j <= nearMaxCol; j++) {
                if (!kf.rectContainsPoint(list[j].rect,nodePos)) continue;
                return list[j].bindJs;
            }
        }
        return null;
    },

    /** 发送 音乐消息  */
    _dispatchAudioEvent:function(isAdd){
        if (!this.composIdx) {
            this.composIdx = 1;
        }
        if (isAdd) {
            this.composIdx++;
            this.composIdx = this.composIdx > 5 ? 5:this.composIdx;
        }else {
            this.composIdx = 1;
        }
        var id = constant.AudioID.COMPOSE_DEFAULT + this.composIdx;
        this.clientEvent.dispatchEvent("playAudioEffect",id);
    },

    /** 发送 事件告知上层生成对象 */
    _dispatchEvent:function(param){
        this.node.dispatchDiyEvent("newCreator",param);
    },
    /** 发送 事件告知上层生成对象 并且这是这个特殊来源 */
    _dispatchEventFromSpecail:function(param){
        this.node.dispatchDiyEvent("newCreatorFromSpecail",param);
    },

    /** 重置手指指向变量 */
    resetFightFlag:function(){
        if (this.guideLogic.isTipLine || this.guideLogic.inSenconFlag) {
            return;
        }
        this.duration = 0;
        if (!this.tipFlag) {
            this.node.dispatchDiyEvent("showFingerTip",{show:false});
        }
        this.tipFlag = true;
    },

    _getMaxFormPos:function(){
        var toggeNode = this.sandTableLogic.getAnyCanMoveMonster();
        if (!toggeNode) return null;
        return {beginPos:kf.getPositionInNode(toggeNode.node,this.node),endPos:cc.v2(-430,-200)};
    },

    /** 做一次手指提示 */
    _doFightMoveAction:function(){

        var re = this.sandTableLogic.getTogglePos(this.node);
        if (re === null || this.showGuideTip) {
            re = this._getMaxFormPos();
            this.showGuideTip = false;
            this.clientEvent.dispatchEvent("guideFirstExcell",re.beginPos);
            if (re === null) return;
        }

        if (this.guideLogic.isInGuideFlag()) {
            if (this.guideLogic.firstFingerFlag) {
                // var posList = [{row:0,col:2},{row:1,col:2},{row:2,col:2}]
                // this.clientEvent.dispatchEvent("guideAction","showSandLight",{posList:posList,worldTip:1})

                var cell = this.sandTableLogic.getItemOneCell(1,0);
                var cell2 =  this.sandTableLogic.getItemOneCell(0,2);
                re = {beginPos:kf.getPositionInNode(cell.bindJs.node,this.node),endPos:kf.getPositionInNode(cell2.bindJs.node,this.node)};
                this.guideLogic.firstFingerFlag = false;
                this.guideLogic.isTipLine = true;
                this.tipInterval = 1000000;
            }else if (this.guideLogic.sencondFingerFlag) {
                var posList = re.posList
                if (posList) {
                    this.guideLogic.inSenconFlag = true;
                    this.clientEvent.dispatchEvent("guideAction","showSandLight",{posList:posList,worldTip:2})
                    this.guideLogic.sencondFingerFlag = false;
                }
            }
        }
        this.node.dispatchDiyEvent("showFingerTip",{show:true,data:re});
    },

    showTipNow:function(){
        if (jsonTables.showTip) {
            this.duration = this.tipInterval;
            this.tipFlag = true;
        }else {
            this.tipFlag = false;
        }
    },
    //石头破碎了，快给它换个爸爸
    stoneBreak:function (event) {
        event.stopPropagation();
        var node = event.getUserData();
        node.parent = this.itemParent;
    },


    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.fightLogic.isSandBox()) return;
        if (!this.tipFlag) return;
        if (!this.sandTableLogic.isTouchEnable()) return;
        if (!jsonTables.showTip) return;
        this.duration += dt;
        if (this.duration < this.tipInterval) return;
        this.duration -= this.tipInterval;
        this.tipFlag = false;
        this._doFightMoveAction();
    }
});
module.exports = sandPanel;
