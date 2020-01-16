/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-26T17:26:50+08:00
 */

window["logic"]["achievement"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var _EVENT_TYPE = [
        "refreshAchievementPanel",
        "getAchiAction"
    ];

    module.STATE_ENUM = {
            CANT_TOOK:0,//不可领取
            CAN_TOOK:1,//可领取
            DONE_TOKEN:2,//已领取
            ALL_DONE:3//全部领取
    };

    module.init = function(){
        this.maxLv = 3;
        this.initModule();
        this.reset();//数据重置
        clientEvent.addEventType(_EVENT_TYPE);
        this.registerMsg();

    };

    module.initConfig = function () {
        var config = jsonTables.getJsonTable(jsonTables.TABLE.ACHIEVEMENTGOOGLE);
        this.googleAchiData = {};
        for (var i = 0 , len = config.length; i < len; i++) {
            var obj = config[i];
            this.googleAchiData[obj.Type] = obj;
        }
    };
    module.reset = function(){
        this.list = [];//成就列表
        this.sandGotList = cc.js.createMap();//沙盘合成计数列表
    };

    module.initModule = function(){
        userLogic = kf.require("logic.user");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_PlayerUpdate_Achieve", this.onResp_PlayerUpdate_Achieve.bind(this));//响应 用户的成就数据
        network.registerEvent("Resp_Achievement_Receive", this.onResp_Achievement_Receive.bind(this));//响应  客户端成就领取
        network.registerEvent("Resp_Achievement_Data", this.onResp_Achievement_Data.bind(this));//响应  客户端请求成就数据
    };

    module.newFormCreator = function (form) {
        switch (form) {
            case tb.MONSTER_GOOD:
                this.recordAchi(constant.AchievementType.OUT_B_MON,1,true);
                break;
            case tb.MONSTER_EXCELLENT:
                this.recordAchi(constant.AchievementType.OUT_A_MON,1,true);
                break;
            case tb.MONSTER_EPIC:
                this.recordAchi(constant.AchievementType.OUT_S_MON,1,true);
                break;
            case tb.MONSTER_LEGEND:
                this.recordAchi(constant.AchievementType.OUT_SS_MON,1,true);
                break;
        }
    };

    //记录成就
    module.recordAchi = function (type,value,isAdd) {
        this.sandGotList[type] = this.sandGotList[type] || 0;
        if (isAdd) {
            this.sandGotList[type] += value;
        }else {
            if (type === constant.AchievementType.FIGHT_POWER) {
                this.sandGotList[type] = this.sandGotList[type] > value ? this.sandGotList[type] : value;
            }else {
                this.sandGotList[type] = value;
            }
        }
    };

    /** 客户端请求成就数据 */
    module.req_Set_Achieve = function(){
        var keys = Object.keys(this.sandGotList);
        if (keys.length === 0) return;
        var ids = [];
        var values = [];
        for (var id in this.sandGotList) {
            var value = this.sandGotList[id] || 0;

            if (id === constant.AchievementType.OUT_B_MON || id === constant.AchievementType.OUT_A_MON) {
                value = Math.floor(value/3)
            }
            if (value === 0) {
                continue;
            }
            ids.push(Number(id));
            values.push(Number(value));
        }
        var data = {
            "Req_Set_Achieve": {
                "ID":ids,
                "Value":values
            }
        };
        network.send(data,true);
        this.sandGotList = cc.js.createMap();//沙盘合成计数列表
    };

    module.onResp_PlayerUpdate_Achieve = function(param){//响应 用户的成就数据 推送数据
        var isDir = false;
        for (var i = 0 , len = this.list.length; i < len; i++) {
            var obj = this.list[i];
            var idx = kf.getArrayIdx(param.IDs,obj.ID);
            if (idx !== -1) {
                this.list[i].Cur = param.Values[idx];
                isDir = true;
                if(this.list[i].Lv === 1 ){
                    this.checkGoogleAchi(param.IDs[idx],param.Values[idx])
                }
            }
        }
        if (isDir) {
            this.onResp_Achievement_Data();
        }
    };

    module.checkGoogleAchi = function (ID,value) {
        if(!this.googleAchiData){
            this.initConfig();
        }
        if(!this.googleAchiData[ID] || cc.sys.os !== cc.sys.OS_ANDROID)    return;
        if(this.googleAchiData[ID][jsonTables.CONFIG_ACHIEVEMENTGOOGLE.Require] <= value){
            cc.log("google成就達成"+ID);
        }
    };
    /** 客户端请求成就数据 */
    module.req_Achievement_Data = function(){
        if (this.list.length > 0) {
            return true;
        }
        var data = {
            "Req_Achievement_Data": {}
        };
        network.send(data,true);
    };

    module.onResp_Achievement_Data = function(param){//客户端请求成就数据
        var noFresh = this.list.length > 0;
        if (param) {
            this.list = (param.Infos);
        }
        clientEvent.dispatchEvent("refreshAchievementPanel",3,noFresh);
    };
    /** 客户端成就领取 */
    module.req_Achievement_Receive = function(id){
        userLogic.desrRedDotCount(constant.RedDotEnum.Achi,1);
        var data = {
            "Req_Achievement_Receive": {
                 "ID":id//成就ID
            }
        };
        network.send(data);
    };

    module.onResp_Achievement_Receive = function(param,sentData){
        for (var i = 0 , len = this.list.length; i < len; i++) {
            var obj = this.list[i];
            if (obj.ID !== param.Info.ID) continue;
            this.list[i] = param.Info;
            break;
        }
        this.onResp_Achievement_Data();
        clientEvent.dispatchEvent("getAchiAction",3,sentData.ID);
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ACHIGET);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("achievement","getSuccess"));
    };
    /** 获取服务端数据 */
    module.getOneInfo = function (id) {
        if (!this.list) return null;

        for (var i = 0 , len = this.list.length; i < len; i++) {
            var obj = this.list[i];
            if (obj.ID !== id) continue;
            return obj;
        }
        return null;
    };

    module.sortList = function(){
        var canTook = [];
        var cantTook = [];
        var doneTook = [];
        for (var i = 0 , len = this.list.length; i <  len; i++) {
            var obj = this.list[i];
            var aState = this._getInfoState(obj);
            switch (aState) {
                case this.STATE_ENUM.CAN_TOOK:
                    canTook.push(obj);
                    break;
                case this.STATE_ENUM.CANT_TOOK:
                    cantTook.push(obj);
                    break;
                case this.STATE_ENUM.DONE_TOKEN:
                case this.STATE_ENUM.ALL_DONE:
                    doneTook.push(obj);
                    break;

            }
        }
        canTook.sort(function (a,b) {
            return a.ID - b.ID;
        });
        cantTook.sort(function (a,b) {
            return a.ID - b.ID;
        });
        doneTook.sort(function (a,b) {
            return a.ID - b.ID;
        });
        this.list = canTook.concat(cantTook,doneTook);
    };

    module.getList = function (isFresh) {
        this.sortList();
        var list = kf.cloneArray(this.list);
        return list;
    };

    module._getInfoState = function (info) {
        if (info.Received && info.Lv === this.maxLv) {
            return this.STATE_ENUM.ALL_DONE;
        }
        if (info.Cur < info.Max) {
            return this.STATE_ENUM.CANT_TOOK;
        }else {
            if (!info.Received) {
                return this.STATE_ENUM.CAN_TOOK;
            }else {
                return this.STATE_ENUM.DONE_TOKEN;
            }
        }
    };

    /** 获取成就状态 */
    module.getOneState = function (id) {
        var info = this.getOneInfo(id);
        if (!info) return this.STATE_ENUM.CANT_TOOK;
        return this._getInfoState(info);
    };
    /** 获取当前成就星级 */
    module.getStarCount = function (id) {
        var info = this.getOneInfo(id);
        if (!info) return 0;
        var state = this.getOneState(id);
        var count = info.Lv;
        if (state === this.STATE_ENUM.CAN_TOOK || state === this.STATE_ENUM.CANT_TOOK) {
            count--;
        }
        return count;
    };

    return module;
};
