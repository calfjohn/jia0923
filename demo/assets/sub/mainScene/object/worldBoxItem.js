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
        this.widget('worldBoxItem/nameLabel').getComponent(cc.Label).string = data.name;
        if (data.hp === 0) {
            this.widget('worldBoxItem/numberLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"min");
        }else {
            this.widget('worldBoxItem/numberLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"lv").formatArray([data.hp]);
        }

        uiResMgr.loadRewardIcon(this.widget('worldBoxItem/box'),data.reward.ID,data.reward.Type);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
