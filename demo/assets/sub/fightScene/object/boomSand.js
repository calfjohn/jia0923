var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
    },

    // use this for initialization
    onLoad: function () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },
    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiResMgr.putInPool(this.node.name,this.node);
    },

    init:function(scale){
        this.node.scale = scale;
        this.node.getComponent(cc.Animation).play();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
