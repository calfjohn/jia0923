/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-08-27T17:19:48+08:00
 */

window["logic"]["miniGame"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var chapterLogic = null;
    var mineLogic = null;
    var fightLogic = null;
    var timeLogic = null;

    var _EVENT_TYPE = [
        "refreshCopyPanel"
    ];

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.curGameType = 0
        this.scoreCount = 0;
        this.goldCount = 0;
        this.goldHightActive = false;
        this.highActiveEndtmp = 0;
        this.endCallBack = null;
        this.fromSource = constant.MiniGameFromSource.None;
        this.serverData = cc.js.createMap();
    };

    module.initModule = function(){
        fightLogic = kf.require("logic.fight");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        chapterLogic = kf.require("logic.chapter");
        mineLogic = kf.require("logic.mine");
        timeLogic = kf.require("logic.time");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_MiniGame_Info", this.onResp_MiniGame_Info.bind(this));//获取小游戏数据
        network.registerEvent("Resp_MiniGame_Enter", this.onResp_MiniGame_Enter.bind(this));//进入小游戏
        network.registerEvent("Resp_MiniGame_Result", this.onResp_MiniGame_Result.bind(this));//上报小游戏结果
        network.registerEvent("Resp_MiniGame_Update", this.onResp_MiniGame_Update.bind(this));
    };

    module.onResp_MiniGame_Update = function (param) {
        if (param.Type) {
            this.onResp_MiniGame_Info(param);
        }
    };

    //获取小游戏数据
    module.req_MiniGame_Info = function(){
        if (Object.keys(this.serverData).length > 0) {
            return clientEvent.dispatchEvent("refreshCopyPanel");
        }
        var data = {
            "Req_MiniGame_Info": {
            }
        };
        network.send(data,true);
    };
    module.onResp_MiniGame_Info = function(param){//获取小游戏数据
        for (var i = 0 , len = param.Type.length; i <  len; i++) {
            var type = param.Type[i];
            if (this.serverData[type]) {
                this.serverData[type].num = param.Num[i];
                this.serverData[type].nextTime = param.NextTime[i];
            }else {
                this.serverData[type] = {num:param.Num[i],nextTime:param.NextTime[i],type:type};
            }
        }
        clientEvent.dispatchEvent("refreshCopyPanel");
    };

    //进入小游戏
    module.req_MiniGame_Enter = function(Type){
        var data = {
            "Req_MiniGame_Enter": {
                "Type":Type
            }
        };
        network.send(data);
    };
    module.onResp_MiniGame_Enter = function(param){//进入小游戏
        // if (!this.serverData[param.Type]) return cc.error("what");
        this.scoreCount = 0;
        this.serverData[param.Type] = this.serverData[param.Type] || {type:param.Type,num:0};
        this.serverData[param.Type].fightData = param;
        this.curGameType = param.Type;
        fightLogic.setGameType(constant.FightType.MINI_GAME);
        if (uiManager.getCurSceneID() === constant.SceneID.MINI_GAME) {
            clientEvent.dispatchEvent("resetPveFight");
        }else {
            clientEvent.dispatchEvent("loadScene",constant.SceneID.MINI_GAME,[],function(){}.bind(this));
        }
    };

    //上报小游戏结果
    module.req_MiniGame_Result = function(Type,Score){
        var data = {
            "Req_MiniGame_Result": {
                "Type":Type,
                "Score":Score
            }
        };
        network.send(data);
    };
    module.onResp_MiniGame_Result = function(param){//上报小游戏结果
        if (this.serverData[param.Type] && this.serverData[param.Type].num === 0) {
            delete this.serverData[param.Type];
        }
        if (uiManager.getCurSceneID() !== constant.SceneID.MINI_GAME) return;
        var type = jsonTables.getJsonTableObj(jsonTables.TABLE.RESCOPY,param.Type)[jsonTables.CONFIG_RESCOPY.Type];
        if (type === tb.RESCOPY_GOLD) {
            uiManager.openUI(uiManager.UIID.SETTLE_GOLD,param);
        }
    };
///////////////////////////////////////////////////////////////////

    module.setEndCallBack = function (cb) {
        this.endCallBack = cb;
    };

    module.checkCallBack = function () {
        if (this.endCallBack) {
            this.endCallBack();
            this.endCallBack = null;
        }
    };

    module.setFromSource = function (from) {
        this.fromSource = from;
    };

    module.addScrore = function (add) {
        this.scoreCount += add;
        this._addHighGold(add);
    };

    module.getScrore = function () {
        return this.scoreCount;
    };

    module._addHighGold = function (add) {
        if (this.goldHightActive) return;
        this.goldCount += add;
        if (this.goldCount >= this.serverData[this.curGameType].fightData.GameInfo.CrazyScore) {
            this.goldCount = 0;
            this.highActiveEndtmp = timeLogic.now() + this.serverData[this.curGameType].fightData.GameInfo.CrazyTime;
            this.goldHightActive = true;
        }
    };

    module.getPerHigh = function () {
        return this.goldCount / this.serverData[this.curGameType].fightData.GameInfo.CrazyScore || 0;
    };

    module.isInGoldHightActive = function () {
        return this.goldHightActive;
    };

    module.getOffEnd = function () {
        if (!this.serverData[this.curGameType] || !this.serverData[this.curGameType].fightData) return 0;
        var off = this.highActiveEndtmp - timeLogic.now();
        off = off < 0 ? 0 : off;
        return off/+ this.serverData[this.curGameType].fightData.GameInfo.CrazyTime || 0;
    };

    module.endGold = function () {
        this.goldHightActive = false;
    };

    module.getCurStep = function(){
        return this.serverData[this.curGameType].fightData.Step || 0;
    };

    module.getTable = function () {
        var table = kf.clone(this.serverData[this.curGameType].fightData);
        for (var i = 0 , len = table.TableInfo.Borken.length; i <  len; i++) {
            var obj = table.TableInfo.Borken[i];
            for (var j = 0 , jLen = obj.Data.length; j <  jLen; j++) {
                var id = obj.Data[j];
                var row = jsonTables.randomNum(0,table.TableInfo.Grid.length-1);
                var rowData = table.TableInfo.Grid[row].Data;
                var col = jsonTables.randomNum(0,rowData.length-1);
                rowData[col] = id;
            }
        }
        jsonTables.initSandBoxTable(table);
        return table.TableInfo;
    };

    module.getLineUpTeam = function () {
        return this.serverData[this.curGameType].fightData.GameInfo.FamilyIDs;
    };

    module.sandBoxEnd = function () {

    };

    module.getList = function () {
        var list = [];
        for (var key in this.serverData) {
            list.push(this.serverData[key]);
        }
        return list;
    };

    module.getCreateScore = function (familyID) {
        var familyIDs = this.getLineUpTeam();
        var idx = kf.getArrayIdx(familyIDs,familyID);
        if (idx === -1) return cc.error("家族未配置");
        return this.serverData[this.curGameType].fightData.GameInfo.GoldScore[idx];
    };

    module.getFlyCount = function (familyID) {
        var familyIDs = this.getLineUpTeam();
        var idx = kf.getArrayIdx(familyIDs,familyID);
        if (idx === -1) return cc.error("家族未配置");
        return this.serverData[this.curGameType].fightData.GameInfo.GoldNum[idx];
    };

    module.getGoldSpIdx = function () {
        var list = this.serverData[this.curGameType].fightData.GameInfo.BoxScore;
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            if (this.scoreCount < obj) {
                return i-1;
            }
        }
        return list.length - 1;
    };

    /** 5连续消除生成 */
    module.get5Creator = function () {
        return 510600;
    };

    module.isCountLargeZore = function () {
        return this.fromSource === constant.MiniGameFromSource.Copy && this.serverData[this.curGameType].num > 0;
    };

    module.isFromSourceCopy = function () {
        return this.fromSource === constant.MiniGameFromSource.Copy;
    };

    module.fightAgain = function () {
        if (this.isCountLargeZore()) {
            this.req_MiniGame_Enter(this.curGameType);
            return true;
        }
        return false;
    };

    module.getSceneBgID = function () {
        return this.serverData[this.curGameType].fightData.SceneID;
    };

    ///////////////////////////////////////////////////////
    module.sandClose = function () {
        this.req_MiniGame_Result(this.curGameType,this.scoreCount);
    };
    return module;
};
