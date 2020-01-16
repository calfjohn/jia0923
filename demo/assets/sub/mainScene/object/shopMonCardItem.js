var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        iconSp:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        this.data = data;
        this.widget("shopMonCardItem/day").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"day"+idx);
        this.widget("shopMonCardItem/bonus").getComponent(cc.Label).string = "x" + data.rewardItem.Num;
        this.widget("shopMonCardItem/icon").getComponent(cc.Sprite).spriteFrame = this.iconSp[idx];
        this.widget("shopMonCardItem/check").active = data.state === constant.weekState.DONE;
        this.widget("shopMonCardItem/unOpen").active = data.state === constant.weekState.CANT;
        this.widget("shopMonCardItem/mask").active = data.state === constant.weekState.DONE || data.state === constant.weekState.TIME_OUT || data.state === constant.weekState.CANT;
    },

    clickItem:function(){
        if (this.data.state !== constant.weekState.CAN) {
            return;
        }
        this.shopLogic.req_Receive_ChargeReward(2,this.data.idx);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
