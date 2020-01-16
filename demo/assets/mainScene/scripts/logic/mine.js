/**
 * @Author: lich
 * @Date:   2018-07-12T14:16:39+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-29T20:18:52+08:00
 */

window["logic"]["mine"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var cardLogic = null;
    var chapterLogic = null;
    var timeLogic = null;
    var fightLogic = null;
    var _EVENT_TYPE = [
        "refrehMinePanel",
        "refreshMineInfo",//刷新战报
        "refreshEnemyPanel",//刷新矿战对手信息
    ];

    module.BATTLE_RESULT = {
        WIN:0,
        FAIL:1
    };

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.data = cc.js.createMap();
        this.enemy = null;
        this._mineInfoMap = cc.js.createMap();//重置战报信息
        this._mineInfo = [];
        this._currentMineInfoID = undefined;
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        cardLogic = kf.require("logic.card");
        chapterLogic = kf.require("logic.chapter");
        timeLogic = kf.require("logic.time");
        fightLogic = kf.require("logic.fight");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Get_MineInfo", this.onResp_Get_MineInfo.bind(this));//// 响应 矿山信息
        network.registerEvent("Resp_Save_MineHeroes", this.onResp_Save_MineHeroes.bind(this));//// 响应 保存守矿阵容（开采）
        network.registerEvent("Resp_Battle_Result", this.onResp_Battle_Result.bind(this));//// 响应 上传矿战结果
        network.registerEvent("Resp_Mine_Upgrade", this.onResp_Mine_Upgrade.bind(this));//// 响应 矿山升级
        network.registerEvent("Resp_Plunder_Mine", this.onResp_Plunder_Mine.bind(this));//// 响应 矿山升级
        network.registerEvent("Resp_Mining", this.onResp_Mining.bind(this));//// 响应 矿山开采
        network.registerEvent("Resp_Mine_Collect", this.onResp_Mine_Collect.bind(this));//// 响应 矿山收集
        network.registerEvent("Resp_Mine_Info",this.onResp_Mine_Info.bind(this));//响应 矿战情报
        network.registerEvent("Resp_MineInfo_Op",this.onResp_MineInfo_Op.bind(this));//响应 反击
    };

    //矿山开采
    module.req_Mining = function(){
        var data = {
            "Req_Mining": 0
        };
        network.send(data,true);
    };
    //矿山开采
    module.onResp_Mining = function (cdTime) {
        if (!this.data) return;
        this.data.MiningCDTime = new dcodeIO.Long(cdTime.low,dcodeIO.Long.high,dcodeIO.Long.unsigned);
    };

    //掠夺矿场 去打人了
    module.req_Plunder_Mine = function(){
        var data = {
            "Req_Plunder_Mine": 0
        };
        network.send(data,true);
    };
    module.onResp_Plunder_Mine = function (obj) {//// 响应 矿山升级
        kf.convertData(obj,this.data);
    };

    //矿山收集 去收钱了
    module.req_Mine_Collect = function(node){
        if (this.data.CollectTime.greaterThanOrEqual(timeLogic.now64())) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage('errorcode','errorcode100'));
        }
        this.collectNode = node;
        var data = {
            "Req_Mine_Collect": {}
        };
        network.send(data);
    };

    module.onResp_Mine_Collect = function (param) {
        this.data.Heroes = [];
        this.data.EndTime = new dcodeIO.Long(0, 0, false);
        clientEvent.dispatchEvent('refrehMinePanel',this.data,false);
        var reward = {};
        reward.Type = constant.ItemType.GOLD;
        reward.Num  = param.Gold;
        reward.BaseID = 0;
        if (this.collectNode) {
            uiManager.openUI(uiManager.UIID.FLY_EFFECT,reward,this.collectNode);
        }
        this.collectNode = null;
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage('minePanel','collect'));
    };

    //请求矿山信息
    module.req_Get_MineInfo = function(){
        if (this.data.CurLv) {
            return clientEvent.dispatchEvent('refrehMinePanel',this.data,false);
        }
        var data = {
            "Req_Get_MineInfo": {}
        };
        network.send(data,true);
    };
    module.onResp_Get_MineInfo = function (obj) {//// 响应 矿山信息

        this.data = obj;
        clientEvent.dispatchEvent('refrehMinePanel',this.data,false);
    };

    //保存守矿阵容（开采）
    module.req_Save_MineHeroes = function(heroes){
        var data = {
            "Req_Save_MineHeroes": {
                "Heroes":heroes
            }
        };
        network.send(data);
    };
    module.onResp_Save_MineHeroes = function (param) {
        kf.convertData(param,this.data);
        uiManager.openUI(uiManager.UIID.MINE_SETMENT,null);
        if(param.Rewards.length > 0){
            uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards);
        }
    };

    //刷新矿战对手
    module.req_Refresh_MineEnemy = function(type,callBack){// 0:默认 1:使用钻石刷新
        if(this.enemy && this.enemy.isCounterAttack){
            this.enemy = this.enemy.backupEnemy;//恢复原先对手
        }
        if (this.enemy && type === 0) {
            return callBack(this.enemy,type);
        }
        if (this.data.PlunderNum === 0 && type === 0) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("errorcode","errorcode103"));
        }
        var data = {
            "Req_Refresh_MineEnemy": {
                "Type":type
            }
        };
        network.send(data);
        network.registerEvent("Resp_Refresh_MineEnemy", function(param){
            this.enemy = param;
            callBack(this.enemy,type);
        }.bind(this));
    };

    //上传矿战结果
    module.req_Battle_Result = function(result){//0：success 1：failed
        if (!this.enemy) {
            return cc.error("没有对手矿山信息");
        }
        var defUserID = this.enemy.DefUserID;
        var data = {
            "Req_Battle_Result": {
                "Result":result,
                "MineLv":this.enemy.MineLv,
                "GetGold":this.enemy.GetGold,
                "GetExp":this.enemy.GetExp,
                "DefUserID":defUserID
            }
        };
        network.send(data);
    };

    //响应矿战战斗结果
    module.onResp_Battle_Result = function (param,sentData) {
        if (this.enemy) {
            if(this.enemy.isCounterAttack){//反击矿战需要恢复原先对手并更新战报
                this.enemy = this.enemy.backupEnemy;
                // this.updateMineInfoByState(sentData.Result);
            }
            else {
                this.enemy = null;//这个人只能打一次  不管胜负
            }
        }
        var re = sentData.Result === this.BATTLE_RESULT.WIN ? true : false;
        uiManager.openUI(uiManager.UIID.MINE_SETMENT,re,param.GetGold,param.GetExp,param.GetBadge,param.Rewards);
    };

    //矿山升级
    module.req_Mine_Upgrade = function(lv){
        var data = {
            "Req_Mine_Upgrade": {
                "TargetLv":lv
            }
        };
        network.send(data,true);
    };
    module.onResp_Mine_Upgrade = function (param) {
        kf.convertData(param,this.data);
        clientEvent.dispatchEvent('playAudioEffect',constant.AudioID.MINE_UP);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("minePanel","upgrade"));
        clientEvent.dispatchEvent('refrehMinePanel',this.data,true);
    };

    module.getBeRod = function () {
        var beRod = this.data.BeRod?this.data.BeRod:0;
        return  beRod;
    }

    module.setTableInfo = function (info) {
        if (!this.data) {
        }
        this.data.TableInfo = info;
    };

    module.getMineData = function(){
        var data = kf.clone(this.data);
        if (!data.TableInfo) {
            return data;
        }
        jsonTables.initSandBoxTable(data);
        return data;
    };

    module.getEnemyData = function(){
        return this.enemy;
    };

    module.getEnmeyBase = function () {
        return this.enemy.Role;
    };

    module.getHasPlunderNum = function () {
        return this.data.PlunderNum;
    };

    module.getSkillList = function (tid) {
        var heroList = this.enemy.Heroes;
        if (!heroList) {
            return [];
        }
        var data = null;
        for (var i = 0 , len = heroList.length; i <  len; i++) {
            var obj = heroList[i];
            if (obj.ID === tid) {
                data = obj;
                break;
            }
        }
        if (!data) {
            return [];
        }
        var lvs = data.SkillLv;
        var list = [];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];

        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);//家族配置表基本数据
        var info = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Skill];
        var skillMaxLvs = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.SkillMaxLv];
        jsonTables.replaceSpellLv(list,info,lvs,skillMaxLvs);
        var lvs = data.TalentLv;
        var info = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Talnet];
        var skillMaxLvs = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.TalnetMaxLv];
        jsonTables.replaceSpellLv(list,info,lvs,skillMaxLvs);

        return list;
    };

    //响应战报推送
    module.onResp_Mine_Info = function (param) {
        var keys = [];//数据重组
        for(var key in param){
            if(key !== "UserID"){
                keys.push(key);
            }
        }
        var data = [];
        var mineInfoMap = cc.js.createMap();//建立map
        for(var i = 0;i < param[keys[0]].length;++i){
            var item = {};
            for(var j = 0;j < keys.length;++j){
                item[keys[j]] = param[keys[j]][i];
            }
            item["UserID"] = param.UserID;
            data.push(item);
            mineInfoMap[item["InfoID"]] = item;
        }
        this._mineInfo = data;//重组后存至_mineInfo
        this._mineInfoMap = mineInfoMap;//以便快速查找
        clientEvent.dispatchEvent("refreshMineInfo",this.getMineInfo(),true);
    };

    //请求进行反击
    module.req_MineInfo_Op = function(InfoID){
        var sendData = {
            Req_MineInfo_Op : {
                InfoID :InfoID
            }
        };
        // this._currentMineInfoID = data.InfoID;//保存反击战报ID，以便更新战报
        network.send(sendData);

    };

    //响应反击
    module.onResp_MineInfo_Op = function(param,sendData){
        if(param.InfoType === constant.MineInfoType.WIN){//勝利
            clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ACHIGET);
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("achievement","getSuccess"));
            if(this._mineInfoMap[sendData.InfoID] === undefined){
                return;
            }
            for (var i = 0 , len = this._mineInfo.length; i < len; i++) {
                var obj = this._mineInfo[i];
                if(obj.InfoID !== sendData.InfoID) continue;
                obj.Status = constant.MineInfoStatus.RECEIVED;//更改战报状态
            }
            this._mineInfoMap[sendData.InfoID].Status = constant.MineInfoStatus.RECEIVED;//更改战报状态
            clientEvent.dispatchEvent("refreshMineInfo",this.getMineInfo(),true);//更新战报
        }else{
            var backupEnemy;
            if(this.enemy != null) {
                backupEnemy = this.enemy.isCounterAttack ? this.enemy.backupEnemy : this.enemy;//获取原先对手
            }
            this.enemy = param;
            this.enemy.isCounterAttack = true;
            this.enemy.backupEnemy = backupEnemy;//备份原先对手信息
            clientEvent.dispatchEvent("refreshEnemyPanel",param);
        }
    };

    //根据反击状态更新战报
    // module.updateMineInfoByState = function(result){
    //     if(this._currentMineInfoID  === undefined || this._mineInfoMap[this._currentMineInfoID] === undefined){
    //         return;
    //     }
    //     this._mineInfoMap[this._currentMineInfoID].Status =
    //         result === this.BATTLE_RESULT.WIN ? constant.MineInfoStatus.WIN_ATTACK : constant.MineInfoStatus.FAIL_ATTACK;//更新战报状态
    //     this._currentMineInfoID  = undefined;
    //     clientEvent.dispatchEvent("refreshMineInfo",this.getMineInfo(),true);//更新战报
    // };

    //获取战报
    module.getMineInfo = function(){
        return kf.clone(this._mineInfo || []);
    };


    //是否有未处理的战报
    module.isHaveUnProcessedMineInfo = function(){
        var mineInfo = this.getMineInfo();
        for(var i = 0;i < mineInfo.length;++i){
            if(mineInfo[i].InfoType === constant.MineInfoType.WIN && mineInfo[i].Status === constant.MineInfoStatus.UN_RECEIVE
                || mineInfo[i].InfoType === constant.MineInfoType.FAIL && mineInfo[i].Status === constant.MineInfoStatus.UN_ATTACK){

                    return true;//有未处理的战报
            }
        }
        return false;
    };

    //判断是否接受过战报信息
    module.isMineInfoReceived = function () {
        return this._mineInfo.length !== 0;
    };
    return module;
};
