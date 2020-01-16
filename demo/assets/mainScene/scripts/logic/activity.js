/**
 * @Author: jyf
 * @Date: 1/3/19
 */

window["logic"]["activity"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var cardLogic = null;
    var mailLogic = null;
    var shopLogic = null;
    var timeLogic = null;
    var _EVENT_TYPE = [
        "refreshActData",
        "refreshFirstChargePoint",
        "resetActName",
        "setDrawCardCanTouch",
        "refreshStepPrivileges",
        "refreshRedBag",
        "updateRedBag"
    ];

    module.init = function(){
        this.initModule();
        this.reset();//数据重置
        clientEvent.addEventType(_EVENT_TYPE);
        this.registerMsg();
    };

    module.reset = function(){
        this.userActInfo = null;  //用户活动数据
        this.dailyActList = [];   //每日活动列表
        this.chargeActList = [];  //充值活动列表
        this.springActList = [];  //春节活动列表
        this.cumulativeData = null;//累计充值活动
        this.firstChargeAct = null; //首充活动数据
        this.firstChargeList = [];
        this.drawCardAct = null;    //限时抽卡活动数据
        this.limitPackAct = null;   //限时礼包活动数据
        this.continueCharge = [];// 连续充值
        this.chargeReward = []; // 连续充值达成奖励
        this.newContinueCharge = [];// 新手7日充值
        this.newChargeReward = []; // 新手7日充值达成奖励

        this.redBagState = constant.RedBagState.OUTTIME;//红包状态
        this.redBagCreator = false;//是否创建过红包
    };

    module.initModule = function(){
        userLogic = kf.require("logic.user");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        cardLogic = kf.require("logic.card");
        mailLogic = kf.require("logic.mail");
        timeLogic = kf.require("logic.time");
        shopLogic = kf.require("logic.shop");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_PlayerData_Activity", this.onResp_PlayerData_Activity.bind(this));//响应 用户的活动数据

        network.registerEvent("Resp_Data_Activity", this.onResp_Data_Activity.bind(this));//响应 基础的活动数据

        network.registerEvent("Resp_Activity_Reward_Rec", this.onResp_Activity_Reward_Rec.bind(this));//响应 活动奖励领取

        network.registerEvent("Resp_PlayerUpdate_Activity", this.onResp_PlayerUpdate_Activity.bind(this));  //更新 玩家活动数据

        network.registerEvent("Resp_Limit_Draw", this.onResp_Limit_Draw.bind(this));  //响应  抽卡活动数据

        network.registerEvent("Resp_Draw", this.onResp_Draw.bind(this));  //响应  抽卡

        network.registerEvent("Resp_Rec_Draw", this.onResp_Rec_Draw.bind(this));  //响应  领取积分奖励

        network.registerEvent("Resp_Data_Activity_Update", this.onResp_Data_Activity_Update.bind(this));  // 更新活动静态数据

        network.registerEvent("Resp_Update_Player_Privileges", this.onResp_Update_Player_Privileges.bind(this));  // 月卡权限数据推送

        network.registerEvent("Resp_Continue_Charge", this.onResp_Continue_Charge.bind(this));  // 连续充值奖励信息

        network.registerEvent("Resp_New_Continue_Charge_", this.onResp_New_Continue_Charge.bind(this));  // 新手7日充值奖励信息

        network.registerEvent("Resp_Continue_Charge_Rec", this.onResp_Continue_Charge_Rec.bind(this));  // 连续充值奖励领取

        network.registerEvent("Resp_Exchange_Item_Data", this.onResp_Exchange_Item_Data.bind(this));  //新春道具兑换

        network.registerEvent("Resp_Exchange_Item", this.onResp_Exchange_Item.bind(this));  //兑换道具

        network.registerEvent("Resp_Receive_RedPacket", this.onResp_Receive_RedPacket.bind(this));  //红包领取

        network.registerEvent("Resp_Get_RedPacket", this.onResp_Get_RedPacket.bind(this));  //请求是否有红包

    };

    module.getRedBagState = function () {
        return  this.redBagState;
    };

    //红包领取
    module.req_Receive_RedPacket = function () {
        var data = {
            "Req_Receive_RedPacket": {
            }
        };
        network.send(data,true);
    };

    //红包领取
    module.onResp_Receive_RedPacket = function (param) {
        cc.log(param);
        if(param.Result === 0){//抢到了
            uiManager.openUI(uiManager.UIID.RED_BAG,param);
        }else{
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("redBagPanel","unget"));
            if(param.Result === 2){//没有次数了
                this.redBagState = constant.RedBagState.NONUM;
                clientEvent.dispatchEvent("refreshRedBag",this.redBagState);
            }else{
                this.req_Get_RedPacket();
            }
        }
    };
    //是否有红包
    module.req_Get_RedPacket = function () {
        var data = {
            "Req_Get_RedPacket": {
            }
        };
        network.send(data,true);
    };
     //回复是否有红包
    module.onResp_Get_RedPacket = function (param) {
        this.redBagState = param.Result;
        if(param.Result === constant.RedBagState.HAVE || param.Result === constant.RedBagState.NONE){
            if(!this.redBagCreator){
                var cb = function (prefab) {
                    var parent = cc.find("Canvas");
                    var node = cc.instantiate(prefab);
                    node.parent = parent;
                    node.zIndex = 300;
                    node.active = true;
                    this.redBagCreator = true;
                    clientEvent.dispatchEvent("refreshRedBag",this.redBagState);
                }.bind(this);
                uiResMgr.loadRedBag(cb)
            }
        }else{
            this.redBagCreator = false;
        }
        clientEvent.dispatchEvent("refreshRedBag",this.redBagState);
    };
    //兑换道具
    module.req_Exchange_Item = function (id) {
        var data = {
            "Req_Exchange_Item": {
                "ExchangeID":id,
                "Num":1
            }
        };
        network.send(data,true);
    };

    //兑换道具
    module.onResp_Exchange_Item = function (param) {
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards);
    };

     // 连续充值奖励信息
    module.onResp_Continue_Charge = function (param) {
        this.continueCharge = param.ContinueCharge;// 连续充值
        this.chargeReward = param.ChargeReward; // 连续充值达成奖励
    };
    // 新手7日充值奖励信息
    module.onResp_New_Continue_Charge = function (param) {
        this.newContinueCharge = param.NewContinueCharge;// 新手7日充值
        this.newChargeReward = param.NewChargeReward; // 新手7日充值达成奖励
    };
    module.getSignPoint = function () {
        for (var i = 0 , len = this.userActInfo.ContinueChargeState.length; i < len; i++) {
            var obj = this.userActInfo.ContinueChargeState[i];
            if(obj === constant.SignState.CANGET)   return true;
        }
        if(this.getContinueChargeRewardState() === constant.SignState.CANGET) return true;
        return  false;
    };

    module.getNewSignPoint = function () {
        for (var i = 0 , len = this.userActInfo.NewContinueChargeState.length; i < len; i++) {
            var obj = this.userActInfo.NewContinueChargeState[i];
            if(obj === constant.SignState.CANGET)   return true;
        }
        if(this.getNewContinueChargeRewardState() === constant.SignState.CANGET) return true;
        return  false;
    };

    module.getContinueCharge = function () {
        return this.continueCharge;
    };

    module.getChargeReward = function () {
        return this.chargeReward;
    };

    //获取豪华签到签到状态
    module.getRechargeSignState = function (idx) {
        return this.userActInfo.ContinueChargeState[idx];
    };

    //获取豪华签到奖励状态
    module.getContinueChargeRewardState = function () {
        return this.userActInfo.ContinueChargeReward[0];
    };

    //新手七日
    module.getNewContinueCharge = function () {
        return this.newContinueCharge;
    };
    //新手七日
    module.getNewChargeReward = function () {
        return  this.newChargeReward;
    };

    //新手七日
    module.getNewRechargeSignState = function (idx) {
        return this.userActInfo.NewContinueChargeState[idx];
    };

    //春节签到
    module.getSpringSignState = function (idx) {
        return this.userActInfo.FixedDateSignState[idx];
    };

    //新手七日
    module.getNewContinueChargeRewardState = function () {
        return this.userActInfo.NewContinueChargeReward[0];
    };
    //获取新春兑换次数
    module.getExchangeNum = function (exchangeID) {
        for (var i = 0 , len = this.userActInfo.ExchangeItem.length; i < len; i++) {
            var obj = this.userActInfo.ExchangeItem[i];
            if(Math.floor(obj / 1000) === exchangeID){
                return obj % 1000;
            }
        }
        return 0;
    };

    //检查新春活动是否开启
    module.checkSpringActive = function () {
        return !!this.springActList.length;
    };


    //检查新春活动红点
    module.checkSpringRedPoint = function () {
        return this.checkSpSignRedPoint() || this.checkSpExchangeRedPoint();
    };

    //检查春节签到活动红点
    module.checkSpSignRedPoint = function () {
        if(!this.userActInfo.FixedDateSignState)    return;
        for (var i = 0 , len = this.userActInfo.FixedDateSignState.length; i < len; i++) {
            var obj = this.userActInfo.FixedDateSignState[i];
            if(obj === constant.SignState.CANGET && !this.getSpringSignTimeOut(obj)){
                return true;
            }
        }
        return false;
    };
    //检查新春兑换活动红点
    module.checkSpExchangeRedPoint = function () {
        if(!this.springExchangeData)    return false;
        for (var i = 0 , len = 2; i < len; i++) {
            var data = this.springExchangeData[i];
            var isLimit = data.Limit > this.getExchangeNum(data.ExchangeID);
            if(!isLimit) continue;
            var canExchange = true;
            for (var j = 0 , len = data.Cost.length; j < len; j++) {
                var obj = data.Cost[j];
                var haveNum = userLogic.getItemNumByID(obj.BaseID);
                if(haveNum < obj.Num){
                    canExchange = false;
                    break;
                }
            }
            if(canExchange){
                return true;
            }
        }
        return false;
    };

    module.req_Continue_Charge_Rec = function (type,id,flag) {
        var data = {
            "Req_Continue_Charge_Rec": {
                "Type":type,
                "ID":id,
                "IsNewCharge":flag,
            }
        };
        network.send(data,true);
    };

    module.onResp_Continue_Charge_Rec = function (param) {
        this.onResp_Activity_Reward_Rec(param);
    };

    module.onResp_Data_Activity_Update = function (param) {
        var data = {};
        data.IDList = [param.ActID];
        data.Activities = [param.Activity];
        this.onResp_Data_Activity(data);
    };

    /**
     * 用户的活动数据
     */
    module.onResp_PlayerData_Activity = function (param) {
        this.userActInfo = param;
    };

    module.getUserActInfo = function () {
        return this.userActInfo;
    };
    //获取累充数据
    module.getCumulativeData = function () {
        return this.cumulativeData;
    };

    module.checkCumulativeActive = function () {
        if(!this.cumulativeData)    return false;
        return this.cumulativeData.serverData.EndTime > timeLogic.now() && this.cumulativeData.serverData.OpenTime < timeLogic.now();
    };

    module.checkCumulativeRedDot = function () {
        var redAct = false;
        for (var i = 0 , len = this.cumulativeData.serverData.ActRewards.length; i < len; i++) {
            var obj = this.cumulativeData.serverData.ActRewards[i];
            if(obj.Value <= this.cumulativeData.userData.SumPay && this.cumulativeData.userData.chargeRewardID.indexOf(obj.Value) === -1){
                redAct = true;
                break;
            }
        }
        return redAct;
    };

    /**
     * 更新 玩家活动数据
     */
    module.onResp_PlayerUpdate_Activity = function (param) {
        this.userActInfo = param;
        for (var i = 0; i < this.dailyActList.length; i++) {
            var obj = this.dailyActList[i];
            this.setActUserInfo(obj);
        }
        for (var i = 0; i < this.chargeActList.length; i++) {
            var obj1 = this.chargeActList[i];
            this.setActUserInfo(obj1);
        }
        for (var i = 0 , len = this.springActList.length; i < len; i++) {
            var obj2 = this.springActList[i];
            this.setActUserInfo(obj2);
        }
        if(this.cumulativeData){
            this.setActUserInfo(this.cumulativeData);
        }
        if(this.firstChargeAct)
            this.setActUserInfo(this.firstChargeAct);
        if(this.drawCardAct)
            this.setActUserInfo(this.drawCardAct);
        if(this.limitPackAct)
            this.setActUserInfo(this.limitPackAct);
        clientEvent.dispatchEvent("refreshActData");
    };

    /**
     * 请求活动数据
     */
    module.req_Data_Activity = function () {
        var data = {
            "Req_Data_Activity": {
            }
        };
        network.send(data,true);
    };

    /**
     * 响应活动数据
     * @param param
     */
    module.onResp_Data_Activity = function (param) {
        this.monCardLimitDay = param.MonCardLimitDay ? param.MonCardLimitDay:this.monCardLimitDay;
        for (var i = 0; i < param["IDList"].length; i++) {
            var actData = {
                serverData: param["Activities"][i]
            }
            if(!actData.serverData) continue;
            this.setActUserInfo(actData);
            switch (actData.serverData.ActType) {
                case tb.ACT_TYPE_DAILY:
                    this.dailyActList.push(actData);
                    break;
                case tb.ACT_TYPE_CHARGE:
                    if(actData.serverData.Type === tb.ACT_TOTAL_CHARGE){
                        this.cumulativeData = actData;
                    }else{
                        this.chargeActList.push(actData);
                    }
                    break;
                case tb.ACT_TYPE_FIRST_CHARGE:
                    // this.firstChargeAct = actData;
                    this.firstChargeList.push(actData);
                    break;
                case tb.ACT_TYPE_CARD:
                    this.drawCardAct = actData;
                    break;
                case tb.ACT_TYPE_LIMITED_GIFT:
                    this.limitPackAct = actData;
                    break;
                case tb.ACT_FESTIVAL:
                    this.springActList.push(actData);
                    break;
            }
        }
        this.dailyActList.sort(this.sortForPriority);
        this.chargeActList.sort(this.sortForPriorityDown);
        this.springActList.sort(this.sortForPriorityDown);
        if(param.SupplySignCost){
            this.SupplySignCost = param.SupplySignCost.Num;
        }
        clientEvent.dispatchEvent("refreshActData");
    };

    /**
     * 请求 活动奖励领取
     */
    module.reqActivityRewardRec = function (id, value, args) {
        var data = {
            "Req_Activity_Reward_Rec": {
                ID: id,
                Value: value,
                Args: args || ""
            }
        };
        network.send(data);
    };

    /**
     * 响应 活动奖励领取
     * @param param
     */
    module.onResp_Activity_Reward_Rec = function (param) {
        if (param.ChestRewards.length > 0) {
            mailLogic.setIsInOpenBossBox(true);
        }
        var isNeedCreateHero = false;
        var expNum = 0;
        for (var i = 0; i < param.Rewards.length; i++) {
            var reward = param.Rewards[i];
            if(reward.Type === constant.ItemType.HERO) {
                var heroes = cardLogic.getHeroesById(reward.BaseID);
                if(!heroes || heroes.Lv === 0) {
                    var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,reward.BaseID);//家族配置表基本数据
                    var needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];//解锁需要的碎片数
                    var curNum = heroes ? heroes.Num + reward.Num : reward.Num;
                    if(curNum >= needDebris){
                        isNeedCreateHero = true;
                    }
                }
            }
            else if(reward.Type === constant.ItemType.EXP) {
                expNum = reward.Num;
            }
        }

        if(isNeedCreateHero && expNum !== 0 && userLogic.getCanUpLv(expNum)) {
            userLogic.setCanPlayUpLvAni(true);
        }

        var callback = function () {
            if (param.ChestRewards.length > 0) {
                var cb = function () {
                    mailLogic.setIsInOpenBossBox(false);
                }
                uiManager.openUI(uiManager.UIID.OPENBOXANI,param.ChestRewards,param.ChestIcon,cb);
            }
        }
        if(param.ChestIcon) {
            var data = {
                "Type":constant.ItemType.BOX,
                "BaseID":param.ChestIcon,
                "Num":1,
                "Equip":null
            }
            param.Rewards.push(data);
        }
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards,callback,undefined);
    };

    /**
     * 请求 礼包领取
     */
    module.req_Gift = function (code) {
        var data = {
            "Req_Gift": {
                UserID: userLogic.getUid(),
                Code: code
            }
        };
        network.send(data,true);
    };

    /**
     * 响应 礼包领取
     * @param param
     */
    module.onResp_Gift = function (param) {

    };

    /**
     * 响应 新春道具兑换信息
     * @param param
     */
    module.onResp_Exchange_Item_Data = function (param) {
        this.springExchangeData = param.ExchangeData;
        clientEvent.dispatchEvent("refreshActData");
    };

    module.getSpringExchangeData = function () {
        return  this.springExchangeData;
    };

    /**
     * 响应  抽卡活动数据
     */
    module.onResp_Limit_Draw = function (param) {
        if(!this.drawCardAct) {
            this.drawCardAct = {};
            this.drawCardAct.serverData = {};
            this.setActUserInfo(this.drawCardAct);
        }
        kf.convertData(param, this.drawCardAct.serverData);
        clientEvent.dispatchEvent("refreshActData");
    };

    /**
     * 请求 抽卡
     */
    module.req_Draw = function (num) {
        var data = {
            "Req_Draw": {
                Num: num,
            }
        };
        network.send(data);
    };

    /**
     * 响应 抽卡
     * @param param
     */
    module.onResp_Draw = function (param) {
        var isNeedCreateHero = false;
        for (var i = 0; i < param.Rewards.length; i++) {
            var reward = param.Rewards[i];
            if(reward.Type === constant.ItemType.HERO) {
                var heroes = cardLogic.getHeroesById(reward.BaseID);
                if(!heroes || heroes.Lv === 0) {
                    var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,reward.BaseID);//家族配置表基本数据
                    var needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];//解锁需要的碎片数
                    var curNum = heroes ? heroes.Num + reward.Num : reward.Num;
                    if(curNum >= needDebris){
                        isNeedCreateHero = true;
                    }
                }
            }
        }

        if(isNeedCreateHero) {
            mailLogic.setIsInOpenBossBox(true);
        }

        uiManager.callUiFunc(uiManager.UIID.ACT_DRAWCARD, "showDrawCardAnim", [param.Rewards, param.ExtraReward]);
    };

    /**
     * 请求 领取积分奖励
     */
    module.req_Rec_Draw = function (score) {
        var data = {
            "Req_Rec_Draw": {
                Score: score,
            }
        };
        network.send(data);
    };

    /**
     * 响应 领取积分奖励
     * @param param
     */
    module.onResp_Rec_Draw = function (param) {
        setTimeout(function () {
            uiManager.callUiFunc(uiManager.UIID.ACT_DRAWCARD, "getDrawScoreBox", [param.Rewards]);
        },100);
    };

    /**
     * 推送 月卡权限推送
     */
    module.onResp_Update_Player_Privileges = function (param) {
        kf.require("logic.chapter").setPrivilegesStep(param.Step);
        shopLogic.updateFreeDraw(param.DrawHighFree,param.DrawEquipHighFree);
        // 更新体力购买次数数据
        userLogic.setBaseData(userLogic.Type.VitBuyTimes, param.VitBuyTimes || userLogic.getBaseData(userLogic.Type.VitBuyTimes));
        userLogic.setBaseData(userLogic.Type.VitBuyTimesLimit, param.VitBuyTimesLimit || userLogic.getBaseData(userLogic.Type.VitBuyTimesLimit));
        clientEvent.dispatchEvent("refreshStepPrivileges");
    };

    //把基础活动数据和用户活动数据关联起来
    module.setActUserInfo = function (actData) {
        actData.userData = actData.userData || {};
        switch (actData.serverData.Type) {
            case tb.ACT_LEVEL_GIFT: //等级礼包
                actData.userData.lvGift = this.userActInfo.LvGift;
                break;
            case tb.ACT_DAILY_ENERGY:  //每日体力
                var dinnerData = this.userActInfo.Dinner;
                actData.userData.lunchRec = Math.floor(dinnerData % 2);
                actData.userData.dinnerRec = Math.floor(dinnerData / 2);
                break;
            case tb.ACT_FIRST_CHARGE:  //首充
                actData.userData.firstChargeTag = this.userActInfo.FirstChargeTag;
                break;
            case tb.ACT_MONTH_CARD:  //月卡
                actData.userData.weekJackpot = this.userActInfo.WeekJackpot;
                actData.userData.monJackpot = this.userActInfo.MonJackpot;
                actData.userData.monExpiryTime = this.userActInfo.MonExpiryTime;
                actData.userData.weekExpiryTime = this.userActInfo.WeekExpiryTime;
                actData.userData.foreverExpiryTime = this.userActInfo.ForeverExpiryTime;
                actData.userData.foreverJackpot = this.userActInfo.ForeverJackpot;
                actData.serverData.monCardLimitDay = this.monCardLimitDay;
                break;
            case tb.ACT_NEW_PLAYER_GIFT: //新手特惠礼包
                actData.userData.newGift = this.userActInfo.NewGift;
                break;
            case tb.ACT_DAILY_GIFT: //每日礼包
                actData.userData.dailyGift = this.userActInfo.DailyGift;
                break;
            case tb.ACT_DRAW_CARD: //限时抽卡
                actData.userData.freeDraw = this.userActInfo.FreeDraw;
                actData.userData.freeNext = this.userActInfo.FreeNext;
                actData.userData.drawScore = this.userActInfo.DrawScore;
                actData.userData.scoreRewardState = this.userActInfo.ScoreRewardState;
                actData.userData.limitDrawShopTimes = this.userActInfo.LimitDrawShopTimes;
                actData.userData.limitDrawMustBe = this.userActInfo.LimitDrawMustBe;
                break;
            case tb.ACT_TOTAL_CHARGE: //累计充值
                actData.userData.chargeRewardID = this.userActInfo.ChargeRewardID;
                actData.userData.SumPay =  this.userActInfo.SumPay;
                break;
            case tb.ACT_TOTAL_CONSUM: // 累计消费
                // actData.userData.SpendDiamond = userLogic.getBaseData(SpendDiamond);
                actData.userData.SpendRewardID = this.userActInfo.SpendRewardID;
                break;
            case tb.ACT_GROWTH_FUND: //成长基金
                break;
            case tb.ACT_HOLIDAY_EXCHANGE: //节日兑换
                break;
            case tb.ACT_SIGN_SEVEN: //新手七日签到
                actData.userData.newSign = this.userActInfo.NewSign;
                break;
            case tb.ACT_LIMITED_GIFT://限时礼包
                actData.userData.LimitGiftTimes = this.userActInfo.LimitGiftTimes;
                break;
            case tb.ACT_NEW_FIRST_CHARGE1: //新首充
                actData.userData.NewSingleChargeState = this.userActInfo.NewSingleChargeState;
                break;
            case tb.ACT_NEW_FIRST_CHARGE2: //冲刺礼包
                actData.userData.NewSingleChargeState = this.userActInfo.NewSingleChargeState;
                break;
            case tb.ACT_NEW_FIRST_CHARGE3://豪华礼包
                actData.userData.NewSingleChargeState = this.userActInfo.NewSingleChargeState;
                break;
            case tb.ACT_CONTINUE_CHARGE://连续充值活动
                actData.userData.ContinueChargeState = this.userActInfo.ContinueChargeState;
                actData.userData.ContinueChargeNum = this.userActInfo.ContinueChargeNum;
                actData.userData.ContinueChargeReward = this.userActInfo.ContinueChargeReward;
                break;
            case tb.ACT_NEW_CHARGE_SEVEN://新手7日充值活动
                actData.userData.NewContinueChargeState = this.userActInfo.NewContinueChargeState;
                actData.userData.NewContinueChargeNum = this.userActInfo.NewContinueChargeNum;
                actData.userData.NewContinueChargeReward = this.userActInfo.NewContinueChargeReward;
                break;
            case tb.ACT_SPRING_EXCHANGE://春节兑换
                actData.userData.ExchangeItem = this.userActInfo.ExchangeItem;
                break;
            case tb.ACT_SPRING_SIGN://春节签到
                actData.userData.FixedDateSignState = this.userActInfo.FixedDateSignState;
                break;
        }
    };

    //获取新春活动数据
    module.getSpringActList = function () {
        return kf.clone(this.springActList);
    };

    //获取充值活动数据
    module.getChargeActList = function () {
        return kf.clone(this.chargeActList);
    };

    //获取每日活动数据
    module.getDailyActList = function () {
        return kf.clone(this.dailyActList);
    };

    module.getChargeActById = function (id) {
        const chargeActList = this.getChargeActList();
        let chargeActData = null;
        for (let i = 0; i < chargeActList.length; i++) {
            const obj = chargeActList[i];
            if (obj.serverData.Type !== id) continue;
            chargeActData = obj;
            break;
        }
        return chargeActData;
    };

    module.getDailyActById = function (id) {
        const chargeActList = this.getDailyActList();
        let chargeActData = null;
        for (let i = 0; i < chargeActList.length; i++) {
            const obj = chargeActList[i];
            if (obj.serverData.Type !== id) continue;
            chargeActData = obj;
            break;
        }
        return chargeActData;
    };

    module.getSpringActById = function (id) {
        const chargeActList = this.getSpringActList();
        let chargeActData = null;
        for (let i = 0; i < chargeActList.length; i++) {
            const obj = chargeActList[i];
            if (obj.serverData.Type !== id) continue;
            chargeActData = obj;
            break;
        }
        return chargeActData;
    };

    //获取首充活动数据
    module.getFirstChargeData = function () {
        var data = null;
        for (var i = 0 , len = this.firstChargeList.length; i < len; i++) {
            var obj = this.firstChargeList[i];
            if(!data){
                data = obj;
            }else if(obj.serverData.Type > data.serverData.Type){
                data = obj;
            }
        }
        return kf.clone(data);
    };

    //获取首充活动数据
    module.getFirstChargeDataByType = function (type) {
        return kf.clone(this.firstChargeList[type]);
    };

    //获取限时抽卡数据
    module.getDrawCardData = function () {
        return kf.clone(this.drawCardAct);
    };

    //获取限时礼包数据
    module.getLimitPackData = function(){
        return kf.clone(this.limitPackAct);
    };

    //获取商品数据
    module.getGiftShopData = function (shopId) {
        var shopActivityData = kf.require('logic.shop').getShopDataByType(constant.ShopType.ACTIVITY);
        if(!shopActivityData) return null;
        var giftShopData = null;
        for (var i = 0; i < shopActivityData.length; i++) {
            var obj = shopActivityData[i];
            if (obj.ShopID !== shopId) continue;
            giftShopData = obj;
            break;
        }

        return giftShopData;
    };

    //按字段排序
    module.sortForPriorityDown = function (a, b) {
        return b.serverData.Priority - a.serverData.Priority;
    };

    //按字段排序
    module.sortForPriority = function (a, b) {
        return a.serverData.Priority - b.serverData.Priority;
    };

    //获取是否显示充值活动红点
    module.getRechargeActRedPoint = function () {
        var chargeActData = this.getChargeActList();
        var chargeNum = userLogic.getBaseData(userLogic.Type.ChargeDiamond);
        var consumNum = userLogic.getBaseData(userLogic.Type.SpendDiamond);

        var showRedPoint = false;
        for (var i = 0; i < chargeActData.length; i++) {
            var obj = chargeActData[i].userData;

            if(obj.monJackpot || obj.weekJackpot) showRedPoint = this.getMonCardRedPoint(obj);
            if(showRedPoint) break;//这里判断到是否有周卡月卡红点

            if(obj.chargeRewardID) showRedPoint = this.getDiamondRedPoint(chargeNum,obj.chargeRewardID.length,chargeActData[i].serverData.ActRewards);
            if(showRedPoint) break;//判断累计充值红点

            if(obj.SpendRewardID) showRedPoint = this.getDiamondRedPoint(consumNum,obj.SpendRewardID.length,chargeActData[i].serverData.ActRewards);
            if(showRedPoint) break;//判断累计消费红点
            if(obj.ContinueChargeState){
                showRedPoint = this.getSignPoint()
                if(showRedPoint) break;//判断累计消费红点
            }
        }
        return showRedPoint;
    };

    //累充累消红点
    module.getDiamondRedPoint = function (diamondNum,cur,rewardList){
        return diamondNum >= rewardList[cur].Value;
    };

    //周月卡红点
    module.getMonCardRedPoint = function (data) {
        var showRedPoint = false;
        if(data.monJackpot.length !== 0 || data.foreverJackpot.length !== 0) {
            showRedPoint = true;
        }
        return showRedPoint;
    };

    //获取是否显示每日活动红点
    module.getDailyActRedPoint = function () {
        var dailyActData = this.getDailyActList();
        var showRedPoint = false;
        for (var i = 0; i < dailyActData.length; i++) {
            var obj = dailyActData[i].userData;
            if(obj.newSign) {
                showRedPoint = this.getNewSignRedPoint(obj);
                if(showRedPoint) break;
            }
            if(obj.lvGift) {
                showRedPoint = this.getLevelGiftRedPoint(dailyActData[i]);
                if(showRedPoint) break;
            }
            if(obj.hasOwnProperty("dinnerRec")) {
                showRedPoint = this.getDinnerRedPoint(obj);
                if(showRedPoint) break;
            }
            if(obj.NewContinueChargeState) {
                showRedPoint = this.getNewSignPoint();
                if(showRedPoint) break;
            }
        }
        return showRedPoint;
    };

    //7日签到红点
    module.getNewSignRedPoint = function (data) {
        var showRedPoint = false;
        for (var j = 0; j < data.newSign.length; j++) {
            var obj1 = data.newSign[j];
            if(obj1 !== constant.RecState.CAN) continue;
            showRedPoint = true;
            break;
        }

        return showRedPoint;
    };

    //等级礼包红点
    module.getLevelGiftRedPoint = function (dailyActData) {
        var showRedPoint = false;
        var curLv = userLogic.getBaseData(userLogic.Type.Lv);
        for (var j = 0; j < dailyActData.serverData.ActRewards.length; j++) {
            var obj2 = dailyActData.serverData.ActRewards[j];
            var lv = obj2.Value;
            if(curLv < lv) continue;
            if(dailyActData.userData.lvGift.indexOf(lv) !== -1) continue;
            showRedPoint = true;
            break;
        }

        return showRedPoint;
    };

    //午晚餐红点
    module.getDinnerRedPoint = function (data) {
        var showRedPoint = false;
        if(data.dinnerRec && data.dinnerRec === constant.RecState.DONE || data.lunchRec && data.lunchRec === constant.RecState.DONE) return showRedPoint;
        var curTime = timeLogic.now();
        var startTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.EatBegin);
        var endTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.EatEnd);
        var zeroTime = new Date(new Date(new Date().toLocaleDateString()).getTime()).getTime() / 1000;
        var leftStartTime = zeroTime + startTime[0];
        var leftEndTime = zeroTime + endTime[0];

        if(curTime >= leftStartTime && curTime <= leftEndTime && data.lunchRec === 0) {
            showRedPoint = true;
        }

        if(showRedPoint) return showRedPoint;

        var rightStartTime = zeroTime + startTime[1];
        var rightEndTime = zeroTime + endTime[1];

        if(curTime >= rightStartTime && curTime <= rightEndTime && data.dinnerRec === 0) {
            showRedPoint = true;
        }

        return showRedPoint;
    };

    //首充红点
    module.getFirstChargeRedPoint = function () {
        var firstChargeData = this.getFirstChargeData();
        return firstChargeData && this.userActInfo.NewSingleChargeState === constant.RecState.CAN;
    };

    //判断是否有首充
    module.checkFirstChargeActive = function() {
        var firstChargeData = this.getFirstChargeData();
        return firstChargeData && this.userActInfo.NewSingleChargeState !== constant.RecState.DONE;
    };

    //判断是否有首充
    module.checkDiamonOpen = function() {
        var firstChargeData = this.getFirstChargeData();
        return firstChargeData && firstChargeData.serverData.Type === tb.ACT_NEW_FIRST_CHARGE1;
    };

    //判断限时特惠礼包是否开启
    module.checkLimitGiftActive = function() {
        var limitPackData = this.getLimitPackData();
        if(!limitPackData || !limitPackData.serverData) return false;
        var now = timeLogic.now();
        var limitTime = limitPackData.serverData.ShowEndTime.toNumber();
        var delta = limitTime - now;
        return delta > 0;
    };

    //判断是否需要弹出限时特惠礼包
    module.checkHasLimitCanBuy = function() {
        var limitPackData = this.getLimitPackData();
        if(!limitPackData || !limitPackData.serverData) return false;
        var maxFrequency = limitPackData.serverData.BuyLimit;
        var hasCanBuy = false;
        for(let i = 0; i < limitPackData.serverData.ActRewards.length; i++){
            if(limitPackData.userData.LimitGiftTimes[i] >= maxFrequency) continue;
            hasCanBuy = true;
            break;
        }
        return hasCanBuy;
    };

    //检查是否要弹七日签到
    module.checkNeedSignSeven = function() {
        var dailyActData = this.getDailyActList();
        let need = false;
        for (var i = 0; i < dailyActData.length; i++) {
            var obj = dailyActData[i].userData;
            if(obj.newSign) {
                need = true;
                break;
            }
        }
        return need;
    };

    // 获取奖池里的钻石数据
    module.getJackpotDiamond = function (jackpot) {
        let data = null;
        for (let i = 0; i < jackpot.length; i++) {
            const obj = jackpot[i];
            if (obj.Type !== constant.ItemType.DIAMOND) continue;
            data = obj;
            break;
        }
        return data;
    };
    //战斗失败检查需要弹出什么界面
    module.checkFailActOpen = function () {
        if(this.isFailFirst) return;
        this.isFailFirst = true;
        var time = timeLogic.now();
        if(time > this.userActInfo.MonExpiryTime || time > this.userActInfo.ForeverExpiryTime){
            uiManager.openUI(uiManager.UIID.ACTIVITY);
            return;
        }
        if(this.userActInfo.DailyGift.length < 3){
            uiManager.openUI(uiManager.UIID.ACTIVITY,1);
            return;
        }
        uiManager.openUI(uiManager.UIID.DRAW_CARD);
    };

    //登陆检查需要弹出什么界面
    module.checkLoginActOpen = function () {
        var time = timeLogic.now();
        var isOpenFirstCharge = this.checkFirstChargeActive();
        if(isOpenFirstCharge){
            uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
            return;
        }
        if(this.userActInfo.NewGift.length < 3){
            uiManager.openUI(uiManager.UIID.ACTIVITY,2);
            return;
        }
    };

    // 豪华登录过期判定
    module.getRechargeSignTimeOut = function(idx) {
        const state = this.getRechargeSignState(idx);
        if (state !== constant.SignState.NONE) return false;
        const signData = this.getChargeActById(tb.ACT_CONTINUE_CHARGE);
        var startTime = signData.serverData.OpenTime.toNumber();
        var endTime = signData.serverData.EndTime.toNumber();
        var nowTime = timeLogic.now();
        var zeroTime = timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        return curIdx > idx;
    };

    // 豪华签到判断是否是今天
    module.isRechargeToday = function(idx) {
        const signData = this.getChargeActById(tb.ACT_CONTINUE_CHARGE);
        var startTime = signData.serverData.OpenTime.toNumber();
        var endTime = signData.serverData.EndTime.toNumber();
        var nowTime = timeLogic.now();
        var zeroTime = timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        return curIdx === idx;
    };

    // 七日充值过期判定
    module.getNewRechargeSignTimeOut = function(idx) {
        const state = this.getNewRechargeSignState(idx);
        if (state !== constant.SignState.NONE) return false;
        const signData = this.getDailyActById(tb.ACT_NEW_CHARGE_SEVEN);
        var startTime = signData.serverData.OpenTime.toNumber();
        var endTime = signData.serverData.EndTime.toNumber();
        var nowTime = timeLogic.now();
        var zeroTime = timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        return curIdx > idx;
    };

    // 七日充值判断是否是今天
    module.isNewRechargeToday = function(idx) {
        const signData = this.getDailyActById(tb.ACT_NEW_CHARGE_SEVEN);
        var startTime = signData.serverData.OpenTime.toNumber();
        var endTime = signData.serverData.EndTime.toNumber();
        var nowTime = timeLogic.now();
        var zeroTime = timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        return curIdx === idx;
    };

    // 春节签到过期判定
    module.getSpringSignTimeOut = function(idx) {
        // const state = this.getSpringSignState(idx);
        // if (state !== constant.SignState.NONE) return false;
        const signData = this.getSpringActById(tb.ACT_SPRING_SIGN);
        var startTime = signData.serverData.OpenTime.toNumber();
        var endTime = signData.serverData.EndTime.toNumber();
        var nowTime = timeLogic.now();
        var zeroTime = timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        return curIdx > idx;
    };

    // 春节签到判断是否是今天
    module.isSpringToday = function(idx) {
        const signData = this.getSpringActById(tb.ACT_SPRING_SIGN);
        var startTime = signData.serverData.OpenTime.toNumber();
        var endTime = signData.serverData.EndTime.toNumber();
        var nowTime = timeLogic.now();
        var zeroTime = timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        return curIdx === idx;
    };

    module.getSpringSignID = function () {
        const signData = this.getSpringActById(tb.ACT_SPRING_SIGN);
        return signData.serverData.ID;
    };
    return module;
};
