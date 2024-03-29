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
    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiResMgr.putInPool(this.node.name,this.node);
    },

    init:function(aniName){
        var state = this.node.getComponent(cc.Animation).play(aniName);
        if(!state) {
            cc.error(this.node.name + "的动画名字没配对")
            uiResMgr.putInPool(this.node.name,this.node);
            return 0;
        }
        return state.duration;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
