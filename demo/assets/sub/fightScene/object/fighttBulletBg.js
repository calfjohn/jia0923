var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        speed:100,
        tail:cc.Node,//拖尾子彈的尾巴
        bezierData: [cc.Vec2]
    },

    // use this for initialization
    onLoad: function () {
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiResMgr.putInPool(this.node.name,this.node);
    },

    init:function(target){
        this.node.position = kf.getPositionInNode(target.node,this.node.parent,target.node.getPosition());
        this.ani.play();
    },

});
