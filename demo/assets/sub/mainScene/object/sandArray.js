var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        bgAni:cc.Animation,
        lightAni:cc.Animation
    },

    // use this for initialization
    onLoad: function () {
        this.lightAni.on(constant.AnimationState.FINISHED, this.onFinished, this);

    },
    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.lightAni.node.active = false;
        var cb = this.cb;
        this.cb = null;
        if (cb) {
            cb();
        }
    },

    done:function(){

        this.bgAni.playAdditive("sandArrayanimation2").once(constant.AnimationState.FINISHED, function () {
            this.node.removeFromParent();
            this.node.destroy();
            uiManager.setRootBlockActive(false);
        }, this);
    },

    playOne:function(cb){
        this.cb = cb;
        this.lightAni.node.active = true;
        this.lightAni.play();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
