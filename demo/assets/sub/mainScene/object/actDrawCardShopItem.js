var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardNode: [cc.Node],
        rewardIcon: [cc.Node],
        rewardNum: [cc.Label],
        priceNum: cc.Label,
        limitLabel: cc.Label,
        buyBtn: cc.Button,
        shopIcon: cc.Sprite,
        hotNode: cc.Node,
        btnDiamod: cc.Node,
        shopIconFrame: [cc.SpriteFrame],
        shopPrice: cc.Sprite,
        shopPriceFrame: [cc.SpriteFrame],
    },

    onLoad () {
        jsonTables.parsePrefab(this);
    },

    init (idx, data,ext) {
        this.data = data;
        if(idx === 0 && ext && data.buyTimes <= 0){
            this.node.parent.getComponent(cc.Layout).spacingX = 40;
            this.node.active = false;
            return ;
        }
        this.shopPrice.spriteFrame = this.shopPriceFrame[idx - 1];
        for (var i = 0; i < this.rewardNode.length; i++) {
            this.rewardNode[i].active = !!data.Goods[i];
            if(!this.rewardNode[i].active) continue;
            this.rewardNum[i].string = data.Goods[i].Num;
            uiResMgr.loadCurrencyIcon(data.Goods[i].Type, this.rewardIcon[i], data.Goods[i].BaseID);
        }
        //单独对卡券商店第一个商品进行处理
        this.btnDiamod.active = data.ID === 301;
        this.buyBtn.interactable = data.buyTimes !== 0;
        this.shopIcon.spriteFrame = this.shopIconFrame[idx];
    },

    setPrice: function () {
        var giftShopData = this.activityLogic.getGiftShopData(this.data.ID);

        if(!giftShopData) return;
        this.priceNum.string = uiLang.getCurAreaPrice(giftShopData);

        this.limitLabel.string =  uiLang.getMessage(this.node.name,"limit").formatArray([this.data.buyTimes, this.data.Limit]);

        this.hotNode.active = giftShopData.Hot !== 0;
    },

    clickBuy: function (event, cusData) {
        var data = this.activityLogic.getDrawCardData();
        var endTime = data.serverData.EndTime.toNumber();
        var nowTime = this.timeLogic.now();
        if(endTime <= nowTime){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("actLimitGift","endTip"));
            return;
        }
        if(cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem","iosError"));
            return;
        }
        if (!CC_DEV) {
            var shopData = this.activityLogic.getGiftShopData(this.data.ID);
            this.shopLogic.checkBuy(shopData);
        }
        else {
            this.shopLogic.req_Shop_Buy(this.data.ID,1);
        }
    },
});
