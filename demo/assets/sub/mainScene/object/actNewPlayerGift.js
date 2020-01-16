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
        var giftInfo = this.newPlayerGiftData.serverData.ActRewards;
        for (var i = 0; i < giftInfo.length; i++) {
            var obj = giftInfo[i];
            this.setPrice(obj.Value, i);
        }
    },

    init (data) {
        this.newPlayerGiftData = data;
        this.initGiftInfo();
    },

    initGiftInfo() {
        var giftInfo = this.newPlayerGiftData.serverData.ActRewards;
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
        var userData = this.newPlayerGiftData.userData;
        if(!userData) return;
        for (var i = 0; i < userData.newGift.length; i++) {
            var obj = userData.newGift[i];
            if(shopId !== obj) continue;
            this.btnBottom[idx].interactable = false;
            break;
        }
    },

    //设置名字和价钱  只有商城有数据才能设置
    setPrice: function (shopId, idx) {
        var giftShopData = this.activityLogic.getGiftShopData(shopId);

        if(!giftShopData) return;
        this.nameLabel[idx].string = uiLang.getConfigTxt(giftShopData.NameID) ;
        this.priceLabel[idx].string = this.btnBottom[idx].interactable ? uiLang.getCurAreaPrice(giftShopData) : uiLang.getMessage("shopPanel", "buyed");
    },

    clickBuy: function (event, cusData) {
        if(cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem","iosError"));
            return;
        }
        var idx = parseInt(cusData);
        var giftInfo = this.newPlayerGiftData.serverData.ActRewards;
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
