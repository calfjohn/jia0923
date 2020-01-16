var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        tombAni:cc.Animation,
        smokeAni:cc.Animation
    },

    // use this for initialization
    onLoad: function () {
        this.tombAni.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.smokeAni.on(constant.AnimationState.FINISHED, this.onFinished, this);
        var registerHandler = [
            ["callNextWave", this.callNextWave.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    callNextWave:function(){
        this.forcePut(true);
    },

    init:function(data){
        if (this.playing === true) {
            return this.forcePut(true);
        }
        this.playing = true;
        this.node.scaleX = data.owner  === this.fightLogic.getMineID() ? -1 :1;
        this.node.position = data.pos;
        this.tombAni.node.active = true;
        this.tombAni.play();
        this.tombAni.setCurrentTime(0);
        this.smokeAni.play();
        this.smokeAni.setCurrentTime(0);
    },

    initForCopy:function (pos) {
        if (this.playing === true) {
            return this.forcePut(true);
        }
        this.playing = true;
        this.node.position = pos;
        this.tombAni.node.active = false;
        this.smokeAni.play();
        this.smokeAni.setCurrentTime(0);
    },

    forcePut(isForce){
        if (!isForce) {
            if (!this.playing) return;
        }
        this.playing = false;
        this.tombAni.stop();
        this.smokeAni.stop();
        this.unscheduleAllCallbacks();
        if (isForce) {
            uiResMgr.putInPool(this.node.name,this.node);
        }else {
            this.scheduleOnce(function(){
                uiResMgr.putInPool(this.node.name,this.node);
            },0.5);
        }
    },

    onFinished (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if (this.tombAni.node.active) {
            if (param.name === this.tombAni.getClips()[0].name) {
                this.forcePut(false);
            }
        }else {
            this.forcePut(false);
        }

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
