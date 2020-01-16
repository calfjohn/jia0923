var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        playTime:1,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(delay){
        delay = delay || 0;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(function(){
            this.ani.play();
        },delay);
        this.scheduleOnce(function(){
            this.ani.stop();
            this.node.removeFromParent();
            this.node.destroy();
        }, delay + this.playTime);
        return this.playTime;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
