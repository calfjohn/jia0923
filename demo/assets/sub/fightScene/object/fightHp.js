
cc.Class({
    extends: cc.Component,

    properties: {
        progress:cc.ProgressBar,
        progreSp:cc.Node,
        barSprite:cc.Sprite,
        sprites:[cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    initHp:function(width,idx,isWorldBoss){
        this.forActive = true;
        this.progress.progress = 1;
        this.node.active = false;
        this.actionFlag = false;
        this.node.opacity = 255;
        this.node.stopAllActions();
        this.barSprite.spriteFrame = this.sprites[idx];// NOTE: 不要变长了  以后可能会要把？
        this.isWorldBoss = !!isWorldBoss;
        // this.progress.node.width = width;
        // this.progress.totalLength = width-2;
        // this.progreSp.width = width-2;
        // this.progreSp.x = -this.progreSp.width/2;
    },

    setVisible(bShow){
        this.forActive = bShow;
        if (bShow) {

        }else {
            this.node.active = bShow && !this.isWorldBoss;
        }
    },

    setPosition(target,height,yScale,yOff){
        this.node.position = kf.getPositionInNode(target.node,this.node.parent,target.node.getPosition());
        this.node.y += (height* ( yScale /100) + yOff);
    },

    updateHp:function(cur,max){
        if (this.progress.progress < 1 &&  (cur/max) >= 1) {
            if (this.forActive) {
                this.node.stopAllActions();
                this.node.active = this.progress.progress < 1;
                this.node.opacity = 255;
                var delay = cc.delayTime(2);
                var fade = cc.fadeTo(0.5,0);
                var call = cc.callFunc(function () {
                    this.node.active = false;
                    this.node.opacity = 255;
                },this);
                var seq = cc.sequence(delay,fade,call);
                this.node.runAction(seq);
            }
        }
        this.progress.progress = cur/max;
        if (!this.forActive) {
            this.node.active = false;
        }else {
            this.node.active = !this.isWorldBoss;
        }

    },

    addPostion(x){
        this.node.x += x;
    },

    putInPool(){
        uiResMgr.putInPool(this.node.name,this.node);
    },

    // update (dt) {},
});
