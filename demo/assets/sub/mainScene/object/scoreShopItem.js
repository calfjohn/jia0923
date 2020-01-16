var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {

    },

    onLoad:function(){
        jsonTables.parsePrefab(this);
    },
    init:function(idx,data){
        this.idx = idx;
        this.data = data;
        this.widget("scoreShopItem/rewardItem").getComponent("rewardItem").init(0,data.Goods);
        var times = data.State ? 0 : 1;
        this.widget("scoreShopItem/label").getComponent(cc.Label).string = uiLang.getMessage("shopPanel","times") + times;
        this.widget("scoreShopItem/btn").getComponent(cc.Button).interactable = !data.State;
        this.widget("scoreShopItem/btn/label").getComponent(cc.Label).string = data.Price;
    },

    buyEvent:function(){
        if(this.shopLogic.getShopScore() < this.data.Price){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("errorcode","errorcode228"));
            return;
        }
        this.shopLogic.req_ScoreShop_Buy(this.idx);
    },

    // update (dt) {},
});
