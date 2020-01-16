var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        motionStreak:cc.MotionStreak,
        fingerMoveSpeed: {
            default: 1000,
            tooltip: "手指速度"
        },
        delayTime:0.8,
    },

    // use this for initialization
    onLoad: function () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.aniList = this.ani.getClips();
    },

    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        switch (param.name) {
            case this.aniList[1].name:
                this.ani.play(this.aniList[0].name);
                break;
            case this.aniList[0].name:
                this.startMove(true);
                break;
        }
    },

    startMove:function(isBegin2End){
        var move = cc.moveTo(this.time,this.endPos);
        var call = cc.callFunc(function () {
            this.node.position = this.beginPos;
            this.ani.play(this.aniList[1].name);
            this.motionStreak.reset();
        },this);
        var seq = cc.sequence(move,cc.delayTime(this.delayTime),call);
       this.node.runAction(seq);
    },

    init(data){
        this.motionStreak.reset();
        this.ani.stop();
        this.node.stopAllActions();
        this.beginPos = data.beginPos;
        this.endPos = data.endPos;
        this.time = kf.pDistance(this.beginPos,this.endPos) /this.fingerMoveSpeed;
        this.node.position = this.beginPos;
        this.ani.play(this.aniList[1].name);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
