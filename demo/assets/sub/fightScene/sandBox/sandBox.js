var panel = require("panel");
var sandBoxContrl = require("sandBoxContrl");

cc.Class({
    extends: panel,

    properties: {
        sandBoxContrl:sandBoxContrl,
        coolTime:cc.Node,
        coolLabel:cc.Label,
        firstExcellentPrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.constantY = this.sandBoxContrl.node.y;
        var registerHandler = [
            ["guideAction", this.guideAction.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
    },

    guideAction:function(type,ext){
        if (type === "showFirstExcellent") {
            var node = this.node.getInstance(this.firstExcellentPrefab,ext);
            if (node) {
                node.zIndex = 99;
                var script = node.getComponent(this.firstExcellentPrefab.name);
                if (script.getTag() !== -1 ) {
                    return;
                }
                script.init(0);
            }
        }else if (type === "showSandLight") {
            var isShow = false;
            if (ext && ext.worldTip) {
                isShow = true;
            }
            var node = this.node.getInstance(this.firstExcellentPrefab,isShow);
            if (node) {
                node.zIndex = 99;
                node.getComponent(this.firstExcellentPrefab.name).init(ext.worldTip);
            }
        }
    },

    preLoadSetmentUi:function(){
        if (this.fightLogic.isGameType(constant.FightType.PVE)) {
            uiManager.loadAsyncPrefab(uiManager.UIID.SETTLE,function(){},true);
        }else if (this.fightLogic.isGameType(constant.FightType.MINE_READY) || this.fightLogic.isGameType(constant.FightType.MINE_FIGHT)) {
            uiManager.loadAsyncPrefab(uiManager.UIID.MINE_SETMENT,function(){});
        }else if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
            uiManager.loadAsyncPrefab(uiManager.UIID.AREAN_SETMENT,function(){});
        }
    },

    init:function(){
        this.node.active = true;

        this.scheduleOnce(function(){
            this.preLoadSetmentUi();
        },5);

        var list = [];
        this.initFlag = true;
        this.coolTime.active = false;
        if (this.fightLogic.isGameType(constant.FightType.PVE)) {
            var info = this.fightLogic.getPveInfo();
            var tables = this.chapterLogic.getChapterTableInfo(info.id);
            if(info.chapterIdx === 102 && !this.userLogic.getFlagInfo(this.userLogic.Flag.FightTask)[0]){
                uiManager.openUI(uiManager.UIID.GUIDE_UI,"fightTask");
            }
            this._getList(tables,list,info.id);
            this.chapterStoryLogic.checkToggle(this.chapterStoryLogic.TOGGLE_ENUM.SHOWS_SANDBOX,info.id,info.chapterIdx);
        }else if (this.fightLogic.isGameType(constant.FightType.MINE_READY)) {//上报阵容
            list = this._getTableForMine();
        }else if (this.fightLogic.isGameType(constant.FightType.MINE_FIGHT)) {
            var info = this.fightLogic.getMineInfo();
            if (info.type === constant.MINE_FIGHT_TYPE.DIRECT) {
                return;
            }else if (info.type === constant.MINE_FIGHT_TYPE.SANDBOX) {
                list = this._getTableForMine();
            }
        }else if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
            var tables = this.areanLogic.getTableInfo();
            this._getList(tables,list,1);
        }else if (this.fightLogic.isGameType(constant.FightType.WORLD_BOSS)) {
            var tables = this.worldBossLogic.getTableInfo();
            this._getList(tables,list,1);
        }else if (this.fightLogic.isGameType(constant.FightType.GUIDE_FIGHT)) {
            var tables = this.guideLogic.getTableInfo();
            this._getList(tables,list,1);
        }else if (this.fightLogic.isGameType(constant.FightType.SHARE_FIGHT)) {
            var tables = this.shareLogic.getTable();
            this._getList(tables,list,1);
        }
        this.sandBoxContrl.init(list);
        this.sandBoxContrl.node.y = this.node.height;
        this.sandBoxContrl.node.stopAllActions();
        this.sandBoxContrl.node.runAction(cc.moveTo(0.5,cc.v2(0,this.constantY)));
        this.sandBoxContrl.tipFlag = true;
        this.widget("sandBox/sandBoxContrl/mask/bottomFrame").active = true;

    },

    _getTableForMine:function(){
        var list = [];
        var data = this.mineLogic.getMineData();
        this._getList(kf.clone(data.TableInfo),list,1);
        return list;
    },

    _getList:function(tables,list,chapterId){
        var idx = 0;
        for (var i = 0 , len = tables.Grid.length; i < len; i++) {
            var obj = tables.Grid[i];
            list[i] = [];
            for (var j = 0 , jLen = obj.Data.length; j < jLen; j++) {
                var jObj = obj.Data[j];
                var data = {id:jObj,lv:obj.Lv[j],idx:idx,chapterId:chapterId};
                list[i].push(data);
                idx++;
            }
        }
    },

    showTipNow:function(){
        this.sandBoxContrl.showTipNow();
    },

    reShowBox:function(){
        this.initFlag = true;
        this.node.active = true;
        this.sandBoxContrl.tipFlag = true;
        this.widget("sandBox/sandBoxContrl/mask/bottomFrame").active = true;
        this.sandBoxContrl.reShowBox();
        this.sandBoxContrl.node.y = this.node.height;
        this.sandBoxContrl.node.stopAllActions();
        this.sandBoxContrl.duration = 0;
        this.sandBoxContrl.node.runAction(cc.moveTo(0.5,cc.v2(0,this.constantY)));
        var info = this.fightLogic.getPveInfo();
        if(info && info.chapterIdx === 102 && !this.userLogic.getFlagInfo(this.userLogic.Flag.FightTask)[0]){
            uiManager.openUI(uiManager.UIID.GUIDE_UI,"fightTask");
        }
    },

    closeForPvp:function(){
        this.widget("sandBox/sandBoxContrl/mask/bottomFrame").active = false;
        this.sandBoxContrl.tipFlag = false;
        this.initFlag = false;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.initFlag) return;
        if (!this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) return;
        if (!this.fightLogic.isSandBox()) return;
        var nextTime = this.areanLogic.getEndTime();
        var offTime = nextTime - this.timeLogic.now();
        this.coolTime.active = offTime > 0;
        if (this.coolTime.active) {
            this.coolLabel.string = this.timeLogic.getCommonCoolTime(offTime);
        }else {
            if (this.sandTableLogic.isTouchEnable()) {
                this.fightLogic.sandBoxEnd();
                this.initFlag = false;
            }
        }
    }
});
