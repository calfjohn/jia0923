var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        stone: cc.Node,
        flyTime: 0,
        roundNum: 0
    },

    onLoad () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },
    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiResMgr.putInPool(this.node.name,this.node);
    },

    init (aniName, target) {
        var targetPos = kf.getPositionInNode(target, this.node, target.position);
        this.stone.position = targetPos;
        this.stone.active = true;
        var call = cc.callFunc(function () {
            this.stone.active = false;
            this.playAnim(aniName);
        }, this);
        var seq = uiManager.doBezierTo(targetPos,cc.v2(0,0),this.flyTime,this.roundNum,call);
        var duration = this.node.getComponent(cc.Animation).getAnimationState(aniName).duration;
        this.stone.runAction(seq);
        return this.flyTime + duration;
    },

    playAnim: function (aniName) {
        var state = this.node.getComponent(cc.Animation).play(aniName);
        if(!state) {
            cc.error(this.node.name + "的动画名字没配对")
            uiResMgr.putInPool(this.node.name,this.node);
        }
    }
});
