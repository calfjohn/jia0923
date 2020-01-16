var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        effectNode:cc.Node,
        effectFrame:[cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function () {
        jsonTables.parsePrefab(this);
        this.effectAni = this.effectNode.getComponent(cc.Animation);
        this.effectAni.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.clickEnable = true;
    },
    //播放竞技场等解锁动画
    open:function (idx,position) {
        this.preloadLogic.changeListenReturn(false);
        this.backPos = position;
        this.effectNode.position = position;
        this.clickEnable = false;
        this.widget("mainSceneEffect/effect/words/functionopen").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"unLock" + idx);
        this.effectNode.stopAllActions();
        this.widget("mainSceneEffect/effect/building/emptyFloatingIsland").getComponent(cc.Sprite).spriteFrame = this.effectFrame[idx];
        var move = cc.moveTo(0.8,cc.v2(0,0));
        this.effectNode.runAction(move);
        this.effectNode.getComponent(cc.Animation).play("unlockAnimation");
    },
    back:function () {
        this.node.dispatchDiyEvent("aniBack",1);
    },
    aniBack:function () {
        if(!this.clickEnable)   return;
        this.effectNode.stopAllActions();
        var move = cc.moveTo(0.4,this.backPos);
        this.effectNode.runAction(move);
        this.clickEnable = false;
        this.effectNode.getComponent(cc.Animation).play("unlockAnimation2");
    },

    onFinished:function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if(param.name === "unlockAnimation"){
            this.clickEnable = true;
            this.effectNode.getComponent(cc.Animation).play("unlockAnimation1");
        }else if(param.name === "unlockAnimation2"){
            this.clientEvent.dispatchEvent("lockAniEnd");
            this.close();
        }
    },
    close:function () {
        this.node.active = false;
        this.preloadLogic.changeListenReturn(true);
    },


    // update (dt) {},
});
