var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(active,data,target){
        this.node.active = active;
        this.unscheduleAllCallbacks();
        if (active) {
            this.node.getComponent(cc.Animation).play();
            this.scheduleOnce(function () {
                this.node.active = false;
            },data[jsonTables.CONFIG_EXPRESSION.ExpressionTime]/1000)
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
