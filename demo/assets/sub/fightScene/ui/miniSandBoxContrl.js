var panel = require("panel");

var miniSandBoxContrl = cc.Class({
    extends: panel,

    properties: {
        areaSize: {
            default: cc.size(0,0),
            visible:false,
            tooltip: "单个节点大小"
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

        itemPrefab:cc.Prefab,
        itemParent:cc.Node,

        itemBgPrefab:cc.Prefab,
        itemBgParent:cc.Node,

        itemLockPrefab:cc.Prefab,
        itemLockParent:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.copyMoveNode = null;//拷贝节点用于  展示拖动
        this.duration = 0;
        var width = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.SandGridPixel);
        this.constantCellSize = cc.size(width,width);
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
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchcancel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    init:function(list){
        if (!this.copyMoveNode) {
            var node = cc.instantiate(this.itemPrefab);
            node.setLocalZOrderEx(100);
            node.parent = this.node;
            this.copyMoveNode = node.getComponent(this.itemPrefab.name)
            this.copyMoveNode.setVisible(false);
        }

        this.unscheduleAllCallbacks();

        this.refreshStep();
        if (this._widthCount && this._widthCount !== list.length) {
            this.itemBgParent.removeAllChildren();
            this.itemLockParent.removeAllChildren();
            this.itemParent.removeAllChildren();
        }

        this._widthCount = list.length;
        this._heightCount = list[0].length;

        this.scaleSize = 4 / this._widthCount;
        this.areaSize.width = this.constantCellSize.width * this.scaleSize;
        this.areaSize.height = this.constantCellSize.height * this.scaleSize;

        this.node.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.itemParent.setContentSize(this._widthCount * this.areaSize.width,this._heightCount*this.areaSize.height);
        this.itemParent.setAnchorPoint(cc.v2(0,0));
        this.itemParent.setPosition(-this.itemParent.width/2,-this.itemParent.height/2);
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


                if(content.children[idx]) {
                    msgItem = content.children[idx];
                }
                else {
                    msgItem = cc.instantiate(this.itemPrefab);
                    msgItem.parent = content;
                }
                msgItem.setContentSize(this.areaSize);
                var script = msgItem.getComponent(this.itemPrefab.name);
                script.init(data[j].id,i,j,msgBgScript,data[j].lv,data[j].idx,data[j].chapterId,msgLockScript,this.scaleSize,-1,true);
                this.sandTableLogic.addCell(i,j,{node:msgItem,bindJs:script,rect:msgItem.getBoundingBox()});
                if (data[j].id) {//排除空的格子
                    vaildSandCount++;
                }
            }
        }
        this.sandTableLogic.setVaildSandCount(vaildSandCount);
        this.curClickCard = null;//bindJs对象
        this.resetFightFlag();
        this.sandTableLogic.resetSandPool();//
        this.talentSkillLogic.checkSandTime(tb.Talent_BEGIN);
    },
    touchstart:function(event){
        if (!this.sandTableLogic.isTouchEnable()) return;
        event.stopPropagation();
        if (this.curClickCard) return cc.error("一个个来 手贱点那么多玩蛇");
        var pos = event.getLocation();
        var itemCell = this.transformPos(pos);
        if (!itemCell) return cc.error("没有选中啊  ")
        this.curClickCard = itemCell;
        if (!itemCell.isCanTouch()) return;// TODO: 做点动画表示下
        this.lastClickCard = itemCell;
        this.curClickCard.setSpineVisible(false);
        itemCell.setLightActive(true);
        itemCell.setLightActive(true);//coco内部bug
        this.copyMoveNode.init(this.curClickCard.getData());
        this.copyMoveNode.setVisible(true);
        var nodePos = this.node.convertToNodeSpaceAR(pos)
        this.copyMoveNode.moveCard(nodePos);
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
        this.curClickCard.setSpineVisible(true);
        this._resetLastClick();

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
                    this.sandTableLogic.doCheckTouchMove(this.curClickCard,itemCell);
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
        if (this.curClickCard.isCanTouch()) {
            this.curClickCard.setSpineVisible(true);
            this.copyMoveNode.setVisible(false);
            var form = this.curClickCard.getForm();
            var inTimeTypes = this.talentSkillLogic.getForm2Tablent(form);
            if (inTimeTypes) {
                for (var i = 0 , len = inTimeTypes.length; i <  len; i++) {
                    var inTimeType = inTimeTypes[i];
                    this.talentSkillLogic.checkSandTime(inTimeType,this.curClickCard);
                }
            }
            this.sandTableLogic.doCheckTouchOut(this.curClickCard);
            this.resetFightFlag();
        }
        this.curClickCard = null;
    },

    _resetLastClick:function(){
        if (this.lastClickCard) {
            this.lastClickCard.setLightActive(false);
            this.lastClickCard = null;
        }
    },

    refreshStep:function(){
        var num = this.fightLogic.getCurStep();
        this.leftCount.string = num;
        this.switchColor(num);
    },

    showNextSTep:function(){
        var num = this.fightLogic.getCurStep() - 1;
        this.leftCount.string = num;
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
        this.fightLogic.desrStep();
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
        this.duration = 0;
        this.tipFlag = true;
        this.node.dispatchDiyEvent("showFingerTip",{show:false});
    },
    /** 做一次手指提示 */
    _doFightMoveAction:function(){

        var re = this.sandTableLogic.getTogglePos(this.node);
        if (re === null) {
            var toggeNode = this.sandTableLogic.getAnyCanMoveMonster();
            if (!toggeNode) return;
            re = {beginPos:kf.getPositionInNode(toggeNode.node,this.node),endPos:cc.v2(-430,-200)};
        }

        this.node.dispatchDiyEvent("showFingerTip",{show:true,data:re});
    },


    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // if (!this.fightLogic.isSandBox()) return;
        // if (!this.tipFlag) return;
        // this.duration += dt;
        // if (this.duration < this.tipInterval) return;
        // this.duration -= this.tipInterval;
        // this.tipFlag = false;
        // this._doFightMoveAction();
    }
});
module.exports = miniSandBoxContrl;
