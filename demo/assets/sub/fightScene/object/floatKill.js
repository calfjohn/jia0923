var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        label:cc.Label,
        labelLight:cc.Label
    },


    onLoad () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        var registerHandler = [
            ["callNextWave", this.callNextWave.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    callNextWave:function(){
        this.forcePut();
    },


    init(count,pos,ownerID,isCrit,isHeal){

        var str = count || 0;
        if (isHeal) {
            str = "+"+str;
            this.labelLight.node.color = uiColor.fightColor.healColor;
        }else {
            this.labelLight.node.color = ownerID === this.fightLogic.getMineID() ? uiColor.fightColor.atkEnemy : uiColor.fightColor.beAtk;
        }
        this.label.string = str;
        this.labelLight.string = str;
        if (isCrit) {
            this.labelLight.node.color = uiColor.fightColor.violentAtk;
            pos.y += 100;
        }else {
            pos.y += 50;
        }
        this.node.position = pos;
        this.node.setLocalZOrderEx(pos.y);
        var aniName = isCrit ? this.ani.getClips()[1].name:this.ani.getClips()[0].name;
        this.ani.play(aniName);//TODO 这里有个暴击飘字哦
    },

    initForBoss:function(count,pos){
        this.node.position = pos;
        this.label.string = count || 0;
        this.ani.play(this.ani.getClips()[0].name);
    },

    forcePut(){
        this.ani.stop();
        uiResMgr.putInPool(this.node.name,this.node);
    },

    onFinished (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.forcePut();
    },
    // update (dt) {},
});
