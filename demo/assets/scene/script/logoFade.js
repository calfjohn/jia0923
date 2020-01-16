var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        fadeOutTime:0.5,
        delayTime:1
    },

    // use this for initialization
    onLoad: function () {
        this.node.opacity = 255;
    },

    startFade:function(doneCb){
        this.node.stopAllActions();
        this.node.opacity = 255;
        var fadeOut = cc.fadeTo(this.fadeOutTime,0);
        var delay = cc.delayTime(this.delayTime);
        var call = cc.callFunc(function () {
            this.node.active = false;
            if (doneCb) {
                doneCb()
            }
        },this);
        var seq = cc.sequence(delay,fadeOut,call);
        this.node.runAction(seq);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
