var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation
    },

    // use this for initialization
    onLoad: function () {
        // this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    init:function(){
        this.ani.play("arrayAnimation1");
    },

    forcePut(){
        this.ani.stop();
        uiResMgr.putInPool(this.node.name,this.node);
    },

    forceDone:function(){
        this.forcePut();
    },

    // onFinished (event) {
    //     if (event.type !== constant.AnimationState.FINISHED) return;
    //     this.forcePut();
    // },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
