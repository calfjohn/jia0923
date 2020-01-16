var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        titleAni:cc.Animation,
        labelSprite:cc.Sprite,
        labelFrame:[cc.SpriteFrame],
        btnContent:[cc.Node],
        diamondHot:cc.Node,
        diamondNum:cc.Label,
        itemPrefab:cc.Prefab,
        itemContent:cc.Node,
        spine:sp.Skeleton,
        receiveNode:cc.Node,
        firstTip:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.spine.setAnimation(0,'std',true);
        this.registerEvent();
        this.shopLogic.req_Shop_Info();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshActData", this.open.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    open:function (closeCb) {
        this.closeCb = closeCb;
        this.data = this.activityLogic.getFirstChargeData();
        if(!this.data || this.activityLogic.getUserActInfo().NewSingleChargeState === constant.RecState.DONE){
            this.close();
            return;
        }
        this.type = this.getType(this.data);
        this.diamondNum.node.active = this.type !== constant.FirsType.First;
        this.diamondHot.active = this.type === constant.FirsType.First;
        this.receiveNode.active = this.activityLogic.getUserActInfo().NewSingleChargeState === constant.RecState.CAN;
        this.btnContent[0].active = this.type === constant.FirsType.First;
        this.firstTip.active = this.type === constant.FirsType.First;
        this.btnContent[1].active = this.type === constant.FirsType.Sprint && !this.receiveNode.active;
        this.btnContent[2].active = this.type === constant.FirsType.Luxuy && !this.receiveNode.active;
        var aniName = "text" + this.type;
        this.titleAni.play(aniName);
        this.labelSprite.spriteFrame = this.labelFrame[this.type];
        this.refreshReward(this.data.serverData.ActRewards[0].Rewards);
    },

    getType:function (data) {
        switch (data.serverData.Type) {
            case tb.ACT_NEW_FIRST_CHARGE1:
                return constant.FirsType.First
                break;
            case tb.ACT_NEW_FIRST_CHARGE2:
                return constant.FirsType.Sprint
                break;
            case tb.ACT_NEW_FIRST_CHARGE3:
                return constant.FirsType.Luxuy
                break;
            default:
                return constant.FirsType.First
        }
    },

    refreshReward:function (list) {
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(obj.Type === constant.ItemType.DIAMOND){
                var data = list.splice(i,1);
                this.diamondNum.string = NP.dealNum(data[0].Num,constant.NumType.TEN);
                break;
            }
        }
        var refreshData = {
            content:this.itemContent,
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    openShop:function(_,param){
        this.closeCb = undefined;
        this.close();
        uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
    },

    clickBuy: function clickBuy(event, cusData) {
        if (cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem", "iosError"));
            return;
        }
        var idx = parseInt(cusData);
        var giftInfo = this.data.serverData.ActRewards;
        var shopID = giftInfo[idx].Value;
        if (!CC_DEV) {
            var shopData = this.activityLogic.getGiftShopData(shopID);
            this.shopLogic.checkBuy(shopData);
        } else {
            this.shopLogic.req_Shop_Buy(shopID, 1);
        }
    },

    receive:function () {
        this.activityLogic.reqActivityRewardRec(this.data.serverData.ID, this.data.serverData.ActRewards[0].Value);
    },

    close:function () {
        this.closeCb && this.closeCb();
        this.node.active = false;
    }
});
