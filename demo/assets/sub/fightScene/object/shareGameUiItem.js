var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    init:function(idx,data){

        this.widget("shareGameUiItem/ranking/numberLabel").getComponent(cc.Label).string = data.Rank;
        this.widget("shareGameUiItem/nameLabel").getComponent(cc.Label).string = data.Name;
        this.widget("shareGameUiItem/integral/numberLabel1").getComponent(cc.Label).string = data.Score;
        uiResMgr.loadPlayerHead(-1,data.Photo,this.widget("shareGameUiItem/headBottom/mask/head"));
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
