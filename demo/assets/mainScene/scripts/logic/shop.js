/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-29T17:03:26+08:00
 */

window["logic"]["shop"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var payLoigc = null;
    var userLogic = null;
    var loginLogic = null;
    var timeLogic = null;
    var activityLogic = null;
    var mailLogic = null;
    var _EVENT_TYPE = [
        "refreshShop",
        "vipDayRefresh",
        "refreshScoreShop",
        "refeshDrawFree"
    ];
    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.shopData = {};//map,以商品类型未key
        this.weekRewards = []; //周卡
        this.monthRewards = []; //月卡
        this.foreverRewards = []; // 终身卡
        this.MonCardExpiryTime = 0;//月卡到期時間
        this.canBuy = true;
        this.weekState = [];
        this.barnnerList = [];
    };

    module.initModule = function(){
        activityLogic = kf.require("logic.activity");
        mailLogic = kf.require("logic.mail");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        payLoigc = kf.require("logic.pay");
        timeLogic = kf.require("logic.time");
        userLogic = kf.require("logic.user");
        loginLogic = kf.require("logic.login");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Shop_Info", this.onResp_Shop_Info.bind(this));
        network.registerEvent("Resp_Shop_Buy", this.onResp_Shop_Buy.bind(this));
        network.registerEvent("Resp_PayOrder", this.onResp_PayOrder.bind(this));
        network.registerEvent("Resp_Vip_Info", this.onResp_Vip_Info.bind(this));
        network.registerEvent("Resp_Receive_ChargeReward", this.onResp_Receive_ChargeReward.bind(this));
        network.registerEvent("Resp_PlayerUpdate_Vip", this.onResp_PlayerUpdate_Vip.bind(this));
        network.registerEvent("Resp_ScoreShop_Update", this.onResp_ScoreShop_Update.bind(this));
        network.registerEvent("Resp_ScoreShop_Buy", this.onResp_ScoreShop_Buy.bind(this));
        network.registerEvent("Resp_Update_Player_DrawInfo", this.onResp_Update_Player_DrawInfo.bind(this));
    };

    module.onResp_Update_Player_DrawInfo = function (param) {
        this.freeDrawData = param;
        clientEvent.dispatchEvent("refeshDrawFree");
    };

    module.getFreeDrawData = function () {
        return this.freeDrawData || {};
    };

    module.updateFreeDraw = function (num,num1) {
        this.freeDrawData.DrawHighFree = num;
        this.freeDrawData.DrawEquipHighFree = num1;
    };

    // 响应 玩家 vip 更新
    module.onResp_PlayerUpdate_Vip = function (param) {
        //this.weekState = param.RecMonCard;
        //clientEvent.dispatchEvent("vipDayRefresh");
        //this.checkWeekState();
    };

    //请求领取奖励
    module.req_Receive_ChargeReward = function(type,id){
        var data = {
            "Req_Receive_ChargeReward": {
                Type:type,
                ID:id
            }
        };
        network.send(data);
    };
    module.onResp_Receive_ChargeReward = function(param){//请求领取奖励 回调
        var day = timeLogic.getDayTime(Math.abs(this.MonCardExpiryTime))
        var msg = day > 0 ?uiLang.getMessage("shopPanel","dayReward").formatArray([day]):uiLang.getMessage("shopPanel","dayReward0");
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards,undefined,msg);
    };

    //请求积分商店信息
    module.req_ScoreShop_Update = function(type){
        if(this.scoreShopData && this.scoreShopData.NextRefreshTime.toNumber() > timeLogic.now()){
            this.onResp_ScoreShop_Update(this.scoreShopData);
        }
        var data = {
            "Req_ScoreShop_Update": {
                Type:type
            }
        };
        network.send(data);
    };

    module.onResp_ScoreShop_Update = function(param){//请求积分商店信息
        this.scoreShopData = param;
        clientEvent.dispatchEvent("refreshScoreShop",this.scoreShopData);
    };

    module.getShopScore = function () {
        if(!this.scoreShopData) return 0;
        return this.scoreShopData.ShopScore;
    };

    //请求积分商店购买
    module.req_ScoreShop_Buy = function(idx){
        var data = {
            "Req_ScoreShop_Buy": {
                Idx:idx
            }
        };
        network.send(data);
    };
    module.onResp_ScoreShop_Buy = function(param){//请求积分商店购买
        this.scoreShopData.State = param.State;
        this.scoreShopData.ShopScore = param.ShopScore;
        clientEvent.dispatchEvent("refreshScoreShop",this.scoreShopData);
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Goods);
    };

    //请求商店信息
    module.req_Shop_Info = function(){
        var data = {
            "Req_Shop_Info": {
            }
        };
        network.send(data);
    };
    module.onResp_Shop_Info = function(param){//请求商店信息
        this.shopData = {};
        for (var i = 0 , len = param.ShopID.length; i < len; i++) {
            var info = {};
            for (var obj in param) {
                if (param.hasOwnProperty(obj)) {
                    info[obj] = param[obj][i];
                }
            }
            this.shopData[param.ShopType[i]] =this.shopData[param.ShopType[i]]? this.shopData[param.ShopType[i]]:[];
            this.shopData[param.ShopType[i]].push(info);
            var bannerName = param.BannerName[i];
            if (bannerName) {
                var bannerPicture = param.Picture[i];
                var bannerUrl = param.Url[i];
                this.barnnerList.push({name:bannerName,picUrl:bannerPicture,url:bannerUrl});
            }
        }

        this.weekRewards = param.Week;
        this.monthRewards = param.Month;
        this.foreverRewards = param.Forever;
        clientEvent.dispatchEvent("refreshShop");
    };
    //获取周卡数据
    module.getWeekRewards = function () {
        return  this.weekRewards;
    };
    //获取月卡数据
    module.getMonthRewards = function () {
        return  this.monthRewards;
    };
    //获取终身卡数据
    module.getForeverRewards = function () {
        return this.foreverRewards;
    };

    /** 请求订单号 */
    module.req_PayOrder = function (shopID,ItemName,price) {
        var platform = -1;
        if (window.FBInstant) {// TODO: 以后这里通过购买渠道区分
            platform = constant.Pay_Platform.FB;
        }else if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                platform = constant.Pay_Platform.GOOGLE;
            }else {
                platform = constant.Pay_Platform.IAP;
            }
        }
        if(window.sdw){
            platform = constant.Pay_Platform.SDW;
        }
        if (platform === -1) {
            return cc.error("渠道都没有买什么")
        }
        var data = {
            "Req_PayOrder": {
                UserID:0,
                Price:price,
                ItemName:ItemName,
                ShopID:shopID,
                Platform:platform//0 h5
            }
        };
        network.send(data);
    };

    module.onResp_PayOrder = function (param,sendData) {
        loginLogic.tgaTrack("prepareOrderAction",[sendData.ShopID + "","1",sendData.Price / 100,param.OrderID]);
        var userID = userLogic.getBaseData(userLogic.Type.UserID);
        userID = userID.toNumber();
        payLoigc.pay(param.ItemName,sendData.ItemName,userID,0,param.OrderID,sendData.Price);
    };

    module.getExpiryTime = function () {
        return this.MonCardExpiryTime.toNumber();
    };

    module.req_Vip_Info = function(){
        var data = {
            "Req_Vip_Info": {
            }
        };
        network.send(data);
    };

    module.getCanBuy = function () {
        return this.canBuy;
    };

    module.onResp_Vip_Info = function(param) {
        //this.MonCardExpiryTime = param.MonCardExpiryTime;
        //this.canBuy = param.CanBuy;
        //this.weekState = param.RecMonCard;
        //clientEvent.dispatchEvent("vipDayRefresh");
    };

    module.req_Shop_Buy = function(shopID,num){
        var data = {
            "Req_Shop_Buy": {
                ID:shopID,
                Num:num
            }
        };
        network.send(data);
    };
    module.onResp_Shop_Buy = function(param,sentData) {
        // if(param.PlatformOrderID && window.ta){
        //     loginLogic.tgaTrack("orderCompletedAction",[param.ShopID + "","1",param.PayAmount.toFixed(2),param.PlatformOrderID,null]);
        // }
        if(this.scoreShopData){
            this.scoreShopData.ShopScore = param.ShopScore;
        }
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.BUY);
        if(param.ShopType === constant.ShopType.BOX || param.ShopType === constant.ShopType.NEWBOX || param.ShopType === constant.ShopType.EQUIPBOX){
            // var icon = this.getShopIconByID(sentData.ID);
            // uiManager.openUI(uiManager.UIID.OPENBOXANI,param.Items,icon);
            mailLogic.setIsInOpenBossBox(true);
            if(param.Items[0].Type === constant.ItemType.EQUIP){
                uiManager.callUiFunc(uiManager.UIID.DRAW_EQUIP, "showDrawCardAnim", [param.Items]);
            }else{
                uiManager.callUiFunc(uiManager.UIID.DRAW_CARD, "showDrawCardAnim", [param.Items]);
            }

        }else if(param.ShopType === constant.ShopType.MONCARD){
            var cb = function () {
                this.req_Vip_Info();
            };
            uiManager.openUI(uiManager.UIID.REWARDMSG,param.Items,cb.bind(this),uiLang.getMessage("shopPanel","buyMon"));
        }else if(param.ShopType === constant.ShopType.DIAMOND) {
            clientEvent.dispatchEvent("refreshShop");
            uiManager.openUI(uiManager.UIID.REWARDMSG,param.Items);
        }
        else{
            uiManager.openUI(uiManager.UIID.REWARDMSG,param.Items);
        }
        activityLogic.req_Get_RedPacket();

    };
    module.getShopDataByType = function(type){
        return kf.clone(this.shopData[type]);
    };
    module.getShopData = function(){
        return kf.clone(this.shopData);
    };

    module.getShopIconByID = function(shopID){
        for (var variable in this.shopData) {
            if (this.shopData.hasOwnProperty(variable)) {
                for (var i = 0 , len = this.shopData[variable].length; i < len; i++) {
                    var obj = this.shopData[variable][i];
                    if(obj.ShopID === shopID){
                        return  obj.Icon;
                    }
                }
            }
        }
        return  null;
    };
    //获取购买月卡一共能得到多少钻石
    module.getWeekGotAllDiamond = function () {
        var weeks = this.shopData[constant.ShopType.MONCARD];
        var count = 0;
        for (var i = 0 , len = this.weekRewards.length; i <  len; i++) {
            var obj = this.weekRewards[i];
            count += obj.Num;
        }
        for (var i = 0 , len = weeks.length; i <  len; i++) {
            var obj = weeks[i];
            count += obj.Items.Num;
        }
        return count;
    };
    /** 获取周卡列表 */
    module.getWeekList = function () {
        var list = [];
        for (var i = 0 , len = this.weekRewards.length; i <  len; i++) {
            var obj = this.weekRewards[i];
            var data = {};
            var state = this.weekState[i];
            data.rewardItem = obj;
            data.state = state || 0;
            data.idx = i;
            list.push(data);
        }
        return list;
    };

    /**
     * 获取商城钻石列表
     */
    module.getDiamondList = function () {
        return this.shopData[constant.ShopType.DIAMOND];
    };


    module.getBannarList = function () {
        if (this.barnnerList.length === 0) {
            return [{name:"",picUrl:"",url:""}]
        }
        return this.barnnerList;
    };

    module.getPriceByShopID = function (shopID) {
        for (var variable in this.shopData) {
            if (this.shopData.hasOwnProperty(variable)) {
                for (var i = 0 , len = this.shopData[variable].length; i < len; i++) {
                    var obj = this.shopData[variable][i];
                    if(obj.ShopID === shopID){
                        return  obj.Price/100;
                    }
                }
            }
        }
        return 0;
    };

    //检查周卡是否领取完毕
    module.checkWeekState = function () {
        var isAllReceive = true;
        for (var i = 0; i < this.weekState.length; i++) {
            var obj = this.weekState[i];
            if(obj === constant.weekState.DONE) continue;
            isAllReceive = false;
            break;
        }

        if(isAllReceive) {
            this.req_Vip_Info();
        }
    };

    //判断商品类型
    module.checkBuy = function (shopData) {
        switch (shopData.CurrencyType) {
            case constant.Currency.RMB:
                if(shopData.FirstPrice){
                    var price = shopData.FirstPrice;
                }else{
                    var price = shopData.DiscountPrice ? shopData.DiscountPrice : shopData.RMB;
                }
                this.req_PayOrder(shopData.ShopID, uiLang.getConfigTxt(shopData.NameID),price);
                break;
            case constant.Currency.DIAMOND:
            case constant.Currency.GOLD:
                this.req_Shop_Buy(shopData.ShopID,1);
                break;
        }
    };

    return module;
};
