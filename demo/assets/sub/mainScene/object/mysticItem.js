var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardItem:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data,selectID){
        this.data = data;
        this.widget("mysticItem/select").active = data.goodID === selectID;

        uiResMgr.loadCurrencyIcon(data.price.Type,this.widget("mysticItem/btn/icon"));
        this.widget("mysticItem/btn/numLabel").getComponent(cc.Label).string = data.price.Num;
        this.widget("mysticItem/reelSelect").active = data.isBuyFlag;
        this.widget("mysticItem/btn").getComponent(cc.Button).interactable =  !data.isBuyFlag;
        var node = this.widget("mysticItem/reelFrame").getInstance(this.rewardItem,true);
        node.getComponent(this.rewardItem.name).init(-1,data.good);
    },


    clickEvent:function(){
        this.node.dispatchDiyEvent("clickShop",this.data);
    },

    buyEvent:function () {
        this.chapterLogic.req_Buy_MysticStore(this.data.goodID);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
