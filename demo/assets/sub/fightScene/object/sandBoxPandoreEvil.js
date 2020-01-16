var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
    },

    onLoad () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiResMgr.putInPool(this.node.name,this.node);
    },

    init (aniName, dir) {
        var state = this.node.getComponent(cc.Animation).play(aniName);
        if(!state) {
            cc.error(this.node.name + "的动画名字没配对")
            uiResMgr.putInPool(this.node.name,this.node);
            return 0;
        }

        for (var i = 0; i < this.node.children.length; i++) {
            var obj = this.node.children[i];
            obj.active = dir === (i+1);
        }
        return state.duration;
    },
});
