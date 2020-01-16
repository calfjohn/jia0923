var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        immGetLabel: [cc.Label],
        dailyLabel: [cc.Label],
        dailyLabel2: [cc.Label],
        priceLabel: [cc.Label],
        leftLabel: [cc.Label],
        noneNode: [cc.Node],
        buyNode: [cc.Node],
        receiveBtn: [cc.Node],
        buyBtn: [cc.Node],
        lightNode: [cc.Node],
        bugMonNode:cc.Node,
        // tipsNode: [cc.Node],
        // weekSpecial:cc.Node,
    },

    onLoad () {
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshShop", this.initCardInfo.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    init (data) {
        this.monthCardData = data;
        this.initCardInfo();
    },

    //设置周卡月卡界面数据
    initCardInfo: function () {
        if(Object.keys(this.shopLogic.shopData).length === 0) return;

        var cardInfo = this.monthCardData.serverData.ActRewards;
        for (var i = 0; i < 2; i++) {
            this.setPriceInfo(i, cardInfo[i]);
        }
    },

    //设置具体周卡或月卡的界面数据
    setPriceInfo: function (idx, data) {
        var monShopData = this.getCardShopData(data.Value);
        var rewardData = idx === 0 ? this.shopLogic.getMonthRewards() : this.shopLogic.getForeverRewards();
        var expiryTime = idx === 0 ? this.monthCardData.userData.monExpiryTime : this.monthCardData.userData.foreverExpiryTime;
        var jackpot = idx === 0 ? this.monthCardData.userData.monJackpot : this.monthCardData.userData.foreverJackpot;
        expiryTime = expiryTime - 0;
        var nowTime = this.timeLogic.now();
        const diamondData = this.activityLogic.getJackpotDiamond(jackpot);
        var canBuy = (expiryTime === 0 || nowTime > expiryTime);
        this.noneNode[idx].active = canBuy;
        this.buyNode[idx].active = !canBuy;
        // this.lightNode[idx].active = !canBuy;
        // if(idx === 0){
        //     this.weekSpecial.active = monShopData.FirstPrice > 0;
        // }
        this.priceLabel[idx].string = uiLang.getCurAreaPrice(monShopData);
        // this.tipsNode[idx].active = jackpot.Num >= jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.TagAppear);
        //this.titleLabel[idx].string = uiLang.getConfigTxt(monShopData.NameID);
        this.receiveBtn[idx].active = !canBuy;
        this.receiveBtn[idx].getComponent(cc.Button).interactable = diamondData && diamondData.Num !== 0;
        this.buyBtn[idx].active = (expiryTime - nowTime) < this.monthCardData.serverData.monCardLimitDay[idx].toNumber();
        if(idx === 0){
            this.bugMonNode.active = !canBuy;
        }
        this.immGetLabel[idx].string = monShopData.Items.Num;
        for (var i = 0 , len = rewardData.length; i < len; i++) {
            var obj = rewardData[i];
            if(obj.Type === constant.ItemType.DIAMOND){
                this.dailyLabel[idx].string = obj.Num;
                this.dailyLabel2[idx].string = obj.Num;
                break;
            }
        }
        if(this.buyNode[idx].active) {
            if(idx === 0){
                var leftTime = expiryTime - nowTime;
                var day = this.timeLogic.getCommonShortDay(leftTime);
                var msg = day[0];
                this.leftLabel[idx].string = msg;
            }
        }
    },

    //获取周卡月卡的闪屏数据
    getCardShopData: function (shopId) {
        var shopMonCardData = this.shopLogic.getShopDataByType(constant.ShopType.MONCARD);
        var monShopData = null;
        for (var i = 0; i < shopMonCardData.length; i++) {
            var obj = shopMonCardData[i];
            if(obj.ShopID !== shopId) continue;
            monShopData = obj;
            break;
        }

        return monShopData
    },

    clickRule: function () {
        uiManager.openUI(uiManager.UIID.ACT_MONTH_CARD_RULE, this.monthCardData);
    },

    clickBuy: function (event, cusData) {
        if(cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem","iosError"));
            return;
        }
        var idx = parseInt(cusData);
        var giftInfo = this.monthCardData.serverData.ActRewards;
        var shopID = giftInfo[idx].Value;
        if (!CC_DEV) {
            var shopData = this.getCardShopData(shopID);
            this.shopLogic.checkBuy(shopData);
        }
        else {
            this.shopLogic.req_Shop_Buy(shopID,1);
        }
    },

    clickReward: function (event, cusData) {
        var idx = parseInt(cusData);

        var jackpot = idx === 0 ? this.monthCardData.userData.monJackpot : this.monthCardData.userData.foreverJackpot;
        const diamondData = this.activityLogic.getJackpotDiamond(jackpot);

        if(diamondData.Num === 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name, "nowReceived"));
            return;
        }
        var actReward = this.monthCardData.serverData.ActRewards;

        this.activityLogic.reqActivityRewardRec(this.monthCardData.serverData.ID, actReward[idx].Value);
    }
});
