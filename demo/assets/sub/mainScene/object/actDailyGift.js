var panel = require("panel");
var rewardItem = require("rewardItem");

cc.Class({
    extends: panel,

    properties: {
        goldNum: [cc.Label],
        diamondNum: [cc.Label],
        btnBottom: [cc.Button],
        nameLabel: [cc.Label],
        priceLabel: [cc.Label],
        limitLabel: [cc.Label],
        hotNode:[cc.Node],
        packRewardPrefab:cc.Prefab,
        layoutList:[cc.Node]
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshShop", this.refreshPrice.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    refreshPrice () {
        var giftInfo = this.dailyGiftData.serverData.ActRewards;
        for (var i = 0; i < giftInfo.length; i++) {
            var obj = giftInfo[i];
            this.setPrice(obj.Value, i);
        }
    },

    init (data) {
        this.dailyGiftData = data;
        this.initGiftInfo();
    },

    initGiftInfo() {
        var giftInfo = this.dailyGiftData.serverData.ActRewards;
        for (var i = 0; i < giftInfo.length; i++) {
            var obj = giftInfo[i];
            this.setGiftInfo(i, obj);
        }
    },

    setGiftInfo (idx, data) {
        var rewards = kf.clone(data.Rewards);
        this.goldNum[idx].node.parent.active = false;
        this.diamondNum[idx].node.parent.active = false;
        var itemIdx = rewards.length === 3 ? 1 : 4;
        var equipIdx = 1;
        for (var i = rewards.length - 1; i >= 0; i--) {
            var obj = rewards[i];
            switch (obj.Type) {
                case constant.ItemType.GOLD:
                    this.goldNum[idx].string = "x" + NP.dealNum(obj.Num, constant.NumType.TEN);
                    this.goldNum[idx].node.parent.active = true;
                    rewards.splice(i,1);
                    break;
                case constant.ItemType.DIAMOND:
                    this.diamondNum[idx].string = "x" + NP.dealNum(obj.Num, constant.NumType.TEN);
                    this.diamondNum[idx].node.parent.active = true;
                    rewards.splice(i,1);
                    break;
            }
        }
        this.layoutList[idx].scale = rewards.length === 1 ? 1 : 0.75;
        var refreshData = {
            content:this.layoutList[idx],
            list:rewards,
            prefab:this.packRewardPrefab
        }
        uiManager.refreshView(refreshData);
        this.checkBtnEnable(idx,data.Value);
        if (Object.keys(this.shopLogic.shopData).length === 0) return;
        this.setPrice(data.Value, idx);
    },

    //设置按钮可点
    checkBtnEnable: function (idx, shopId) {
        this.btnBottom[idx].interactable = true;
        var userData = this.dailyGiftData.userData;
        if(!userData) return;
        var limitTimes = 1;
        var canBuyTimes = limitTimes;
        for (var i = 0; i < userData.dailyGift.length; i++) {
            var obj = userData.dailyGift[i];
            if(shopId !== obj) continue;
            canBuyTimes --;
            this.btnBottom[idx].interactable = canBuyTimes > 0;
        }
        this.limitLabel[idx].string = uiLang.getMessage(this.node.name, "buyLimit").formatArray([canBuyTimes, limitTimes]);
    },

    //设置名字和价钱  只有商城有数据才能设置
    setPrice: function (shopId, idx) {
        var giftShopData = this.activityLogic.getGiftShopData(shopId);

        if(!giftShopData) return;
        this.nameLabel[idx].string = uiLang.getConfigTxt(giftShopData.NameID) ;
        if(giftShopData.DiscountPrice && giftShopData.RMB !== giftShopData.DiscountPrice){
            this.hotNode[idx].active = true;
            this.hotNode[idx].getComponent(cc.Label).string = uiLang.getMessage(this.node.name, "price") + (giftShopData.RMB / 100);
            this.priceLabel[idx].string = this.btnBottom[idx].interactable ? "#" +  (giftShopData.DiscountPrice / 100): uiLang.getMessage("shopPanel", "buyed");
        }else{
            this.hotNode[idx].active = false;
            this.priceLabel[idx].string = this.btnBottom[idx].interactable ? uiLang.getCurAreaPrice(giftShopData) : uiLang.getMessage("shopPanel", "buyed");
        }

    },

    clickBuy: function (event, cusData) {
        if(cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem","iosError"));
            return;
        }
        var idx = parseInt(cusData);
        var giftInfo = this.dailyGiftData.serverData.ActRewards;
        var shopID = giftInfo[idx].Value;
        if (!CC_DEV) {
            var shopData = this.activityLogic.getGiftShopData(shopID);
            this.shopLogic.checkBuy(shopData);
        }
        else {
            this.shopLogic.req_Shop_Buy(shopID,1);
        }
    },
});
