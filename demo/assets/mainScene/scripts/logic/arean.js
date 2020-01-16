/**
 * @Author: lich
 * @Date:   2018-07-20T10:22:50+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-07-20T10:23:39+08:00
 */

window["logic"]["arean"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var fightLogic = null;
    var userLogic = null;
    var configuration = null;
    var teasureLogic = null;
    var _EVENT_TYPE = [
        "getAreanInfo",
        "areanMatchSucess",
        "areanScroceChange",
        "areanRankRefresh",
        "areanShopRefresh",
        "buyHonorSuccess",
        "getAreanTimeInfo",
    ];

    module.MATCH_ENUM = {
            CANCLE:0,
            MATCH:1,
    };

    module.RANK_TYPE = {
            WORLD:1,
            FRIEND:2
    };

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
        this.limitRankMax = 100;
    };

    module.reset = function(){
        this.isInRequest = false;
        this.data = null;
        this.fightData = {};
        this.isInArean = false;
        this.maxLift = 3;
        this.mineLifeCount = this.maxLift;
        this.enmeyLifeCount = this.maxLift;
        this.targetSkillList = [];
        this.allWorldRanks = [];
        this.allWorldDoneFlag = false;
        this.areanFriends = [];
        this.friendDoneFlag = false;
        this.otherStep = 10;
        this.winnerID = 0;
        this.newStar = 0;
        this.oldStar = 0;
        // this.reconnHeroes = [];
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        fightLogic = kf.require("logic.fight");
        userLogic = kf.require("logic.user");
        configuration = kf.require("util.configuration");
        teasureLogic = kf.require("logic.treasure");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Arena_Info", this.onResp_Arena_Info.bind(this));//// 响应 响应竞技场信息
        network.registerEvent("Resp_Arena_Match", this.onResp_Arena_Match.bind(this));//// 响应 响应竞技场匹配
        network.registerEvent("Resp_Arena_Start", this.onResp_Arena_Start.bind(this));//// 响应 响应战斗开始
        network.registerEvent("Resp_Arena_Round", this.onResp_Arena_Round.bind(this));//// 响应 响应回合结束
        network.registerEvent("Resp_Arena_End", this.onResp_Arena_End.bind(this));//// 响应 客户端战斗结束
        network.registerEvent("Fw_Arena_GenMonster", this.onFw_Arena_GenMonster.bind(this));//// 响应 战斗消除
        network.registerEvent("Resp_Arena_Round_End", this.onResp_Arena_Round_End.bind(this));//// 响应 战斗结束（客户端表现结束）
        network.registerEvent("Resp_PlayerUpdate_Arena", this.onResp_PlayerUpdate_Arena.bind(this));//// 响应 竞技场数据更新
        network.registerEvent("Resp_Arena_Rank", this.onResp_Arena_Rank.bind(this));//// 响应 排行榜
        network.registerEvent("Resp_Battle_Chat_Info", this.onResp_Battle_Chat_Info.bind(this));////竞技场聊天
        network.registerEvent("Resp_Honor_Shop", this.onResp_Honor_Shop.bind(this));////竞技场商店
        network.registerEvent("Resp_Honor_Buy", this.onResp_Honor_Buy.bind(this));////竞技场商店购买
        network.registerEvent("Resp_Recv_Arena_Box", this.onResp_Recv_Arena_Box.bind(this));////竞技场宝箱领取
        network.registerEvent("Resp_Arena_OpenTime", this.onResp_Arena_OpenTime.bind(this));////竞技场宝箱领取
    };

    //竞技场宝箱领取
    module.req_Recv_Arena_Box = function(){
        var data = {
            "Req_Recv_Arena_Box": {
            }
        };
        network.send(data,true);
    };

    module.onResp_Recv_Arena_Box = function (param) {//// 响应 竞技场宝箱领取
        if (param.ChestRewards.length > 0) {
            uiManager.openUI(uiManager.UIID.OPENBOXANI,param.ChestRewards,param.ChestIcon);
        }
        this.req_Arena_Info(true);
    };

    //竞技场商店
    module.req_Honor_Shop = function(){
        var data = {
            "Req_Honor_Shop": {
            }
        };
        network.send(data,true);
    };

    module.onResp_Honor_Shop = function (param) {//// 响应 竞技场商店
        clientEvent.dispatchEvent("areanShopRefresh",param);
    };

    //竞技场商店购买
    module.req_Honor_Buy = function(itemID,buyType,id){
        var data = {
            "Req_Honor_Buy": {
                "ItemID":itemID,
                "ItemType":buyType,
                "BaseID":id
            }
        };
        network.send(data,true);
    };

    module.onResp_Honor_Buy = function (param,sendData) {//// 响应 竞技场商店购买
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.BUY);
        this.data.Honor =param.Honor;
        if(sendData.ItemType === constant.ItemType.BOX){
            uiManager.openUI(uiManager.UIID.OPENBOXANI,param.Rewards,sendData.BaseID);
        }else{
            uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards);
        }
        clientEvent.dispatchEvent("buyHonorSuccess",param.ItemID,param.BuyTimes);
    };

    //竞技场聊天
    module.req_Battle_Chat_Send = function(content){
        var data = {
            "Req_Battle_Chat_Send": {
                "DecUid":this.enmeyID,// NOTE: 暂时强制目标
                "Content":content
            }
        };
        network.send(data,true);
    };
    module.onResp_Battle_Chat_Info = function (param) {//// 响应 竞技场聊天
        if (!param.ChatInfos || param.ChatInfos.length === 0) {
            return;
        }
        var content = param.ChatInfos[0].Content;
        var id = Number(content);
        fightLogic.showEmoj(id,false);
    };

    //排行榜
    module.req_Arena_Rank = function(beginRank,type){// 1：世界排行 2：好友排行
        if (this.isInRequest) return;
        if (type === this.RANK_TYPE.WORLD && this.allWorldDoneFlag) {
            return;
        }else if (type === this.RANK_TYPE.FRIEND && this.friendDoneFlag) {
            return;
        }
        this.isInRequest = true;
        var data = {
            "Req_Arena_Rank": {
                "BeginRank":beginRank,
                "Type":type
            }
        };
        network.send(data,true);
    };
    module.onResp_Arena_Rank = function (param,sentData) {//// 响应 排行榜
        this.isInRequest = false;
        if (sentData.Type === this.RANK_TYPE.WORLD) {
            this.allWorldDoneFlag = param.Rank.length === 0;
            this.allWorldRanks = this.allWorldRanks.concat(param.Rank);
        }else if (sentData.Type === this.RANK_TYPE.FRIEND) {
            this.friendDoneFlag = true;
            var list = kf.cloneArray(param.Rank);
            list.sort(function (a,b) {
                return -(a.Score - b.Score);
            });
            for (var i = 0 , len = list.length; i <  len; i++) {
                var obj = list[i];
                obj.RankNo = i + 1;
            }
            this.areanFriends = list;
        }
        clientEvent.dispatchEvent("areanRankRefresh");
    };
    //请求竞技场信息
    module.req_Arena_Info = function(sure){
        if (!sure && this.data) {
            return this.onResp_Arena_Info(this.data);
        }
        var data = {
            "Req_Arena_Info": {}
        };
        network.send(data,true);
    };
    module.onResp_Arena_Info = function (obj) {//// 响应 响应竞技场信息
        this.data = obj;
        this.timeData = {
            OpenTime:obj.OpenTime,
            CloseTime:obj.CloseTime
        }
        clientEvent.dispatchEvent('getAreanInfo',obj);
        // uiManager.openUI(uiManager.UIID.AREAN_MAIL,[{"Type":1,"BaseID":0,"Num":50000},{"Type":2,"BaseID":0,"Num":50},{"Type":4,"BaseID":4501,"Num":1}],1000);
        if (this.data.Rewards.length > 0) {
            uiManager.openUI(uiManager.UIID.AREAN_MAIL,this.data.Rewards,this.data.OldScore);
            this.data.Rewards = [];
        }
        // if (this.data.ChestRewards.length > 0) {
        //     uiManager.openUI(uiManager.UIID.AREAN_MAIL,this.data.Rewards,this.data.OldScore);
        //     this.data.ChestRewards = [];
        // }
    };

    module.getNeedVit = function () {
        return  this.data.Vit;
    };

    //请求竞技场信息
    module.req_Arena_OpenTime = function(){
        var data = {
            "Req_Arena_OpenTime": {}
        };
        network.send(data,true);
    };

    module.onResp_Arena_OpenTime = function (obj) {//// 响应 响应竞技场信息
        this.timeData = obj;
        clientEvent.dispatchEvent('getAreanTimeInfo');
    };

    module.getAreanTimeInfo = function () {
        if(!this.timeData){
            this.req_Arena_OpenTime();
            return;
        }
        return  this.timeData;
    };

    //请求竞技场匹配
    module.req_Arena_Match = function(type){
        var data = {
            "Req_Arena_Match": {
                "OpType":type
            }
        };
        network.send(data,true);
    };
    module.onResp_Arena_Match = function (obj) {//// 响应竞技场匹配 只有两边都匹配成功的时候才会 下发
        this.isInArean = true;
        this.roundNum = (obj.RoundNum + 1) / 2;
        this.heros = obj.HeroIDs;
        this.gamers = cc.js.createMap();
        this.enmeyID = userLogic.isMe(obj.PlayerRed.Uid)?obj.PlayerBlud.Uid :  obj.PlayerRed.Uid ;
        this.isplayWithRobot = this.enmeyID.toNumber() < 0;
        this.gamers.PlayerRed = obj.PlayerRed;
        this.gamers.PlayerBlud = obj.PlayerBlud;
        this.maxLift = this.roundNum;//
        this.targetSkillList = userLogic.isMe(obj.PlayerRed.Uid) ? obj.PlayerBlud.Formation :  obj.PlayerRed.Formation ;
        clientEvent.dispatchEvent("areanMatchSucess",obj);
    };

    module.isplayRobot = function () {
        return  this.isplayWithRobot;
    };
    // //竞技场断线重连
    // module.req_Arena_Reconn = function(){
    //     var data = {
    //         "Req_Arena_Reconn": {
    //         }
    //     };
    //     network.send(data,true);
    // };
//
    // //竞技场断线重连开始
    // module.req_Arena_Reconn_Start = function(){
    //     var data = {
    //         "Req_Arena_Reconn_Start": {
    //         }
    //     };
    //     network.send(data,true);
    // };
    //
    // module.onResp_Arena_Reconn = function (obj) {//// 响应 竞技场断线重连
    //     if(obj.RoomID === 0){//竞技场已经结束
    //         configuration.setConfigData("areanTable","");
    //         configuration.save();
    //         return;
    //     };
    //     this.reconnHeroes = obj.Heroes;
    //     this.fightData.TableInfo = JSON.parse(configuration.getConfigData("areanTable"));
    //     this.fightData.Step = obj.Step;
    //     this.reconnStep = obj.RemainStep;
    //     this.roundNum = (obj.Ret.length + 1) / 2;
    //     this.gamers = cc.js.createMap();
    //     var meIsRed = userLogic.isMe(obj.PlayerRed.Uid);
    //     var myData =meIsRed?obj.PlayerRed.Formation:obj.PlayerBlue.Formation;
    //     this.heros = [];
    //     for (var i = 0 , len = myData.length; i < len; i++) {
    //         this.heros.push(myData[i].FamilyID);
    //     }
    //     this.enmeyID = meIsRed?obj.PlayerBlue.Uid :  obj.PlayerRed.Uid ;
    //
    //     this.gamers.PlayerRed = obj.PlayerRed;
    //     this.gamers.PlayerBlud = obj.PlayerBlue;
    //     this.maxLift = this.roundNum;//
    //     this.EndTime = obj.EndTime;
    //     var oneCount = 0;
    //     var twoCount = 0;
    //     for (var i = 0 , len = obj.Ret.length; i < len; i++) {
    //         if(obj.Ret === 1){
    //             oneCount ++;
    //         }else if(obj.Ret[i] === 2){
    //             twoCount ++;
    //         }
    //     }
    //     this.mineLifeCount = meIsRed? this.maxLift - twoCount:this.maxLift - oneCount;
    //     this.enmeyLifeCount = meIsRed?this.maxLift - oneCount:this.maxLift - twoCount;
    //     jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_Max;
    //     fightLogic.setGameType(constant.FightType.PVP_AREAN);
    //     this.isPlayNow = obj.Status === 2;
    //     this.isInArean = true;
    //     clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){
    //         // clientEvent.dispatchEvent("releaseScene",constant.SceneID.LOGIN);
    //         this.req_Arena_Reconn_Start();
    //     }.bind(this));
    // };
    //
    // module.getMyTeam = function () {
    //     var list = this.reconnHeroes;
    //     this.reconnHeroes = [];
    //     return list;
    // };
    //
    // module.getReconnStep = function () {
    //     var num = this.reconnStep?this.reconnStep:this.fightData.Step;
    //     this.reconnStep = 0;
    //     return num;
    // };


    //请求战斗开始
    module.req_Arena_Start = function(){
        var data = {
            "Req_Arena_Start": {}
        };
        network.send(data,true);
    };
    module.onResp_Arena_Start = function (obj) {//// 响应战斗开始
        this.fightData = obj;
        this.EndTime = obj.EndTime;
        this.mineLifeCount = this.maxLift;
        this.enmeyLifeCount = this.maxLift;
        this.lastSpeed = jsonTables.displaySpeed_CurSpeed;
        this.otherStep = obj.Step;
        jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_Max;
        fightLogic.setGameType(constant.FightType.PVP_AREAN);
        clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){
            // clientEvent.dispatchEvent("releaseScene",constant.SceneID.LOGIN);
        }.bind(this));
    };

    //请求战斗开始
    module.req_Arena_Round = function(table,heros,power){
        if (!this.isInArean) return;
        uiManager.openUI(uiManager.UIID.AREAN_WAITE,true);//等待网络返回
        var data = {
            "Req_Arena_Round": {
                "TableInfo":table,
                "HeroInfos":heros,
                "Power":power
            }
        };
        network.send(data,true);
    };
    module.onResp_Arena_Round = function (obj) {//// 响应战斗开始
        if (userLogic.getBaseData(userLogic.Type.UserID).equals(this.gamers.PlayerRed.Uid)) {
            fightLogic.initEnmeyDiff(obj.HeroBlud);
        }else{
            fightLogic.initEnmeyDiff(obj.HeroRed);
        }

        this.winnerID = userLogic.isMe(obj.Victor) ? fightLogic.getMineID() : fightLogic.getEnemyID();

        uiManager.closeUI(uiManager.UIID.AREAN_WAITE);//等待网络返回
        jsonTables.setRandomSeed(obj.RandSed.toNumber());
        fightLogic.displayNow();
    };

    module.req_Arena_GenMonster = function (heros) {//战斗中消除（生成怪）  自己发
        if (!this.isInArean) return;
        var data = {
            "Req_Arena_GenMonster": {
                "UserID":0,
                "Step":fightLogic.getCurStep(),
                "HeroInfos":heros
            }
        };
        network.send(data,true);
    };


    module.onFw_Arena_GenMonster = function (param) {
        this.otherStep = param.Step;
        fightLogic.initEnmeyDiff(param.HeroInfos);
        clientEvent.dispatchEvent("areanScroceChange");
    };

    module.req_Arena_Exit = function () {//战斗中消除（生成怪） 别人收
        var data = {
            "Req_Arena_Exit": {}
        };
        network.send(data,true);
        this.isInArean = false;
        jsonTables.displaySpeed_CurSpeed = this.lastSpeed;
    };

    module.onResp_Arena_End = function (param) {//响应战斗结束
        this.isInArean = false;
        if (userLogic.isMe(param.WinUid)) {
            this.enmeyLifeCount = 3 - param.WinStar;
            this.mineLifeCount = 3 - param.LoseStar;
        }else {
            this.enmeyLifeCount = 3 - param.LoseStar;
            this.mineLifeCount = 3 - param.WinStar;
        }
        clientEvent.dispatchEvent("areanScroceChange");
        jsonTables.displaySpeed_CurSpeed = this.lastSpeed;
        this.winnerID = 0;
        var gameResult = param.WinUid && (param.WinUid.toNumber() === userLogic.getBaseData(userLogic.Type.UserID).toNumber());
        this.newStar = gameResult?param.WinStar:param.LoseStar;
        param.lastScore = this.data.ArenaScore;
        uiManager.openUI(uiManager.UIID.AREAN_SETMENT,param);
        if (fightLogic.isDisplaying()) {
            clientEvent.dispatchEvent("pauseFight",true);
            // this._pauseEvent(true);
        }
        uiManager.closeUI(uiManager.UIID.AREAN_WAITE);//等待网络返回
        if(param.ChestInfo){
            teasureLogic.setShowData(param.ChestInfo);
        }
        // configuration.setConfigData("areanTable","");
        // configuration.save();
    };

    module.getStarPlayInfo = function () {
        var data = {
            oldStar:this.oldStar,
            newStar:this.newStar,
        }
        this.newStar = 0;
        this.oldStar = 0;
        return  data;
    };

    module.req_PlayerInfos = function (uid,type,idx) {//请求玩家信息
        var data = {
            "Req_PlayerInfos": {
                "Type":1,
                "UserID":uid,
                "RankType":type,
                "Idx":idx
            }
        };
        network.send(data,true);
    };

    module.onResp_PlayerInfos = function (param,sendData) {//响应请求玩家信息
        var list;
        switch (sendData.RankType) {
            case this.RANK_TYPE.WORLD:
                list = this.allWorldRanks;
                break;
            case this.RANK_TYPE.FRIEND:
                list = this.areanFriends;
                break;
        }
        list[sendData.Idx].Sex = param.Infos[0].Sex;
        list[sendData.Idx].Job = param.Infos[0].Career;
        list[sendData.Idx].EquipBaseID = param.Infos[0].EquipBaseID;
        clientEvent.dispatchEvent("refreshLeftByData",list[sendData.Idx]);
    };

    module.req_Arena_Round_End = function (ret) {//战斗结束（客户端表现结束）
        if(!this.isInArean) return;
        uiManager.openUI(uiManager.UIID.AREAN_WAITE,false);//等待网络返回
        var data = {
            "Req_Arena_Round_End": {
                "Ret":ret
            }
        };
        network.send(data,true);
    };

    module.onResp_Arena_Round_End = function (param,sentData) {//响应战斗结束 战斗结束（客户端表现结束）
        this.fightData.Step = param.Step;
        this.otherStep = param.Step;
        this.EndTime = param.EndTime;
        this.winnerID = 0;
        fightLogic.resetMaxStepAndCurStep(this.getStep());
        fightLogic.callSandBoxReShow(true);
        uiManager.closeUI(uiManager.UIID.AREAN_WAITE);//等待网络返回
        if (userLogic.isMe(param.RoundVictorUid)) {
            this.enmeyLifeCount--;
        }else {
            this.mineLifeCount--;
        }
        clientEvent.dispatchEvent("areanScroceChange");
    };
    //
    module.getScroce = function () {
        return {mine:this.mineLifeCount,enmey:this.enmeyLifeCount};
    };
    //获取我当前的竞技场积分
    module.getMyAreanScore = function () {
        return  this.data.ArenaScore;
    };
    //获取某个积分对应的ICON
    module.getScoreIcon = function (score) {
        var info = this.getDivInfo(score);
        return  info.DicIcon;
    };
    //获取某个积分对应的名字
    module.getDivName = function (score) {
        var info = this.getDivInfo(score);
        return  info.DivName;
    };
    //获取某个积分对应的上限积分，最高段位为-1
    module.getNextScore = function (score) {
        var info = this.getDivInfo(score,true);
        if(!info){
            return  -1;
        }
        return  info.Score;
    };
    //获取某个积分对应的下限积分
    module.getLimitScore = function (score) {
        var info = this.getDivInfo(score);
        if(!info){
            return  -1;
        }
        return  info.Score;
    };
    //获取某个积分基础Icon
    module.getIconLv = function (score) {
        var info = this.getDivInfo(score);
        return  info.Segment;
    };
    //获取某个积分星星数
    module.getStarNum = function (score) {
        var info = this.getDivInfo(score);
        return  info.StarNum;
    };

    //竞技场数据更新
    module.onResp_PlayerUpdate_Arena = function (param) {
        if (!this.data) return;
        this.data.Honor = param.Honor;
        this.data.DailyHonor = param.DailyHonor;
        this.data.ArenaScore = param.Score;
        this.oldStar = this.data.Star;
        this.data.Star = param.Star;
        var needClearCache = false;
        if ((this.data.Rank < this.limitRankMax && this.data.Rank !== param.Rank)
            || (this.data.Rank > this.limitRankMax && param.Rank < this.limitRankMax)) {
            needClearCache = true;
        }else {
            this._updateSelfScore(this.allWorldRanks,param.Score);
            this._updateSelfScore(this.areanFriends,param.Score);
        }
        this.data.Rank = param.Rank;
        this.data.Vit = param.Vit;
        this.data.GameNum = param.GameNum;
        this.data.GameWin = param.GameWin;
        if (needClearCache) {//清空缓存  然界面打开后继续请求
            this.allWorldRanks.length = 0;
            this.areanFriends.length = 0;
            this.allWorldDoneFlag = false;
            this.friendDoneFlag = false;
        }
        clientEvent.dispatchEvent('getAreanInfo',this.data);
    };

    module._updateSelfScore = function (list,score) {
        if (!list) {
            return;
        }
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (userLogic.isMe(obj.UserID)) {
                obj.Score = score;
                break;
            }
        }
    };

    module.getMyHonor = function () {
        return  this.data.Honor;
    };

    module.getDailyHonor = function () {
        return  this.data.DailyHonor;
    };
    module.getDailyHonorMax = function () {
        return  this.data.DailyHonorMax;
    };

    //////////////////////////////////////////////////////////////////////

    module.isMoreAtk = function (owner) {
        return owner === this.winnerID;
    };

    /** 获取沙盘数据 */
    module.getTableInfo = function () {
        return this.fightData.TableInfo;
    };
    /** 获取步骤 */
    module.getStep = function () {
        return this.fightData.Step;
    };
    /** 获取回合结束时间 */
    module.getEndTime = function () {
        return this.EndTime.toNumber();
    };

    /** 获取指定怪物 */
    module.getLineUpTeam = function () {
        return this.heros;
    };

    /** 获取回合数 */
    module.getRoundNum = function () {
        return this.roundNum || 0;
    };
    /** 获取他人的玩家数据 */
    module.getEnmeyBase = function () {
        if (userLogic.getBaseData(userLogic.Type.UserID).equals(this.gamers.PlayerRed.Uid)) {//
            return this.gamers.PlayerBlud.Role;
        }else{
            return this.gamers.PlayerRed.Role;
        }
    };
    /** 获取他人的玩家个人信息 */
    module.getEnmeyData = function () {
        if (userLogic.getBaseData(userLogic.Type.UserID).equals(this.gamers.PlayerRed.Uid)) {//
            return this.gamers.PlayerBlud;
        }else{
            return this.gamers.PlayerRed;
        }
    };
    //获取敌对家族
    module.getEnmeyFamilys = function () {
        var serverData = this.getEnmeyData();
        var list = [];
        for (var i = 0 , len = serverData.Formation.length; i <  len; i++) {
            var obj = serverData.Formation[i];
            list.push(obj.FamilyID);
        }
        return list;
    };

    module.getMineBase = function () {
        if (userLogic.getBaseData(userLogic.Type.UserID).equals(this.gamers.PlayerRed.Uid)) {//
            return this.gamers.PlayerRed.Role;
        }else{
            return this.gamers.PlayerBlud.Role;
        }
    };
    /** 获取自己的玩家个人信息 */
    module.getMineData = function () {
        if (userLogic.getBaseData(userLogic.Type.UserID).equals(this.gamers.PlayerRed.Uid)) {//
            return this.gamers.PlayerRed;
        }else{
            return this.gamers.PlayerBlud;
        }
    };

    module.getAreanInfo = function () {
        if(!this.data){
            this.req_Arena_Info();
            return null;
        }
        return this.data;
    };

    /** 获取段位 信息 */
    module.getDivInfo = function (div,isNextLv) {
        if (!this.data) return null;
        var idx = -1;
        for (var i = 0 , len = this.data.ArenaRewards.length; i < len; i++) {
            var obj = this.data.ArenaRewards[i];
            if (obj.Score <= div) {
                idx = i;
            }else {
                break;
            }
        }
        if (idx === -1) return null;

        if (isNextLv) {//如果是0积分 默认取当前阶
            return this.data.ArenaRewards[idx + 1];
        }else if(this.data.ArenaRewards[idx + 1]){
            this.data.ArenaRewards[idx].NextScore = this.data.ArenaRewards[idx + 1].Score;
        }
        return this.data.ArenaRewards[idx];
    };

    module.getMyIdx = function () {
        if (!this.data) return 0;
        var idx = -1;
        for (var i = 0 , len = this.data.ArenaRewards.length; i < len; i++) {
            var obj = this.data.ArenaRewards[i];
            if (obj.Score <= this.data.ArenaScore) {
                idx = i;
            }else {
                break;
            }
        }
        if (idx === -1) return 0;

        return idx;
    };

    module.getAllDivInfo = function () {
        return this.data.ArenaRewards;
    };

    module.getSkillList = function (tid) {
        if (this.targetSkillList.length === 0) {
            cc.error("技能队列不存在")
            return [];
        }
        var data = null;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
        for (var i = 0 , len = this.targetSkillList.length; i <  len; i++) {
            var obj = this.targetSkillList[i];
            if (obj.FamilyID === familyID) {
                data = obj;
                break;
            }
        }
        if (!data) {
            return [];
        }

        var lvs = data.SkillLv;
        var list = [];

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
    /**
     * 获取排行榜
     * @param  {[type]} type 类型
     */
    module.getRankByType = function (type) {
        var list = [];
        switch (type) {
            case this.RANK_TYPE.WORLD:
                list = this.allWorldRanks;
                break;
            case this.RANK_TYPE.FRIEND:
                list = this.areanFriends;
                break;
        }
        if (list.length === 0) {
            this.req_Arena_Rank(list.length,type);
        }
        return list;
    };

    module.getRankData = function (type,idx) {
        var list = [];
        switch (type) {
            case this.RANK_TYPE.WORLD:
                list = this.allWorldRanks;
                break;
            case this.RANK_TYPE.FRIEND:
                list = this.areanFriends;
                break;
        }
        var data = list[idx];
        if(!data.Job){
            this.req_PlayerInfos(data.UserID,type,idx);
            return null;
        }else{
            return data;
        }
    };

    module.getOhterStep = function () {
        return this.otherStep;
    };

    return module;
};
