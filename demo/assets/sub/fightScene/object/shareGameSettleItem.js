var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rankSp:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data){
        var spIdx = data.Rank > this.rankSp.length ? this.rankSp.length : data.Rank;
        this.widget("shareGameSettleItem/integration3").getComponent(cc.Sprite).spriteFrame = this.rankSp[spIdx-1];
        this.widget("shareGameSettleItem/selected").active = idx === -1;
        this.widget("shareGameSettleItem/integration3/numberLabel").getComponent(cc.Label).string = data.Rank;
        this.widget("shareGameSettleItem/nameLabel").getComponent(cc.Label).string = data.Name;
        this.widget("shareGameSettleItem/numberabel").getComponent(cc.Label).string = data.Score;
        uiResMgr.loadPlayerHead(-1,data.Photo,this.widget("shareGameSettleItem/headBottom/headmask/head"));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
