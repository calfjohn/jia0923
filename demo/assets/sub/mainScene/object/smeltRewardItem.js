var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data){
        this.widget("smeltRewardItem/number").getComponent(cc.Label).string = data.Num;
        uiResMgr.loadRewardIcon(this.widget("icon"),data.Type,data.BaseID,this.widget( "iconFrame"),this.widget("qualityFrame1"));
        var aniTime = this.ani.defaultClip.duration;
        var waiteTime = idx * aniTime;
        this.unscheduleAllCallbacks();
        this.node.opacity = 0;
        this.scheduleOnce(function () {
            this.node.opacity = 255;
            this.ani.play();
        },waiteTime)
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
