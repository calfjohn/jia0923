var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    onLoad () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        this.data = data;
        this.widget("shopRechargeItem/diamondNum").getComponent(cc.Label).string = data.Items.Num;
        this.widget("shopRechargeItem/moneyNum").getComponent(cc.Label).string = uiLang.getCurAreaPrice(data);
        uiResMgr.loadShopIcon(this.data.Icon, this.widget("shopRechargeItem/icon"));
        // this.widget("shopRechargeItem/icon").getComponent(cc.Sprite).spriteFrame = this.iconSp[idx];
        this.widget("shopRechargeItem/bgBonus").active = data.ExtraReward.Num > 0;
        if(this.widget("shopRechargeItem/bgBonus").active) {
            this.widget("shopRechargeItem/bgBonus/sandNum").getComponent(cc.Label).string = data.ExtraReward.Num;
            this.widget("shopRechargeItem/bgBonus/label").getComponent(cc.Label).string = data.ExtraTimes > 0 ? uiLang.getMessage("shopPanel","doubleReward") : uiLang.getMessage("shopPanel","extraReward")
        }
    },

    clickItem:function(){
        if(cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem","iosError"));
            return;
        }
        if (!CC_DEV) {
            this.shopLogic.checkBuy(this.data);
        }
        else {
            this.shopLogic.req_Shop_Buy(this.data.ShopID,1);
        }
    },
});
