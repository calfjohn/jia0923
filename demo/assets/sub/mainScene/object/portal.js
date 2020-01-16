
cc.Class({
    extends: cc.Component,

    properties: {
        animation:cc.Animation
    },

    // use this for initialization
    onLoad: function () {
        this.animation.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if (param.name === "portalAnimation1") {
            this.animation.play("portalAnimation");
        }
    },

    init:function(isLoop){
        var aniName = isLoop ? "portalAnimation" : "portalAnimation1";
        this.animation.play(aniName);
        if (!isLoop) {
            kf.require("basic.clientEvent").dispatchEvent("playAudioEffect",constant.AudioID.PORTAL);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
