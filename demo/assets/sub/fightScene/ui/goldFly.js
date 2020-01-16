var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        boxSprite:cc.Sprite,
        boxSpriteframes:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {

    },

    init:function(familyID,startPos,endPos){
        this.node.setPosition(startPos);
        this.node.zIndex = -startPos.y;
        this.node.stopAllActions();
        this.node.scale = 0.5;
        var familyIDs = this.miniGameLogic.getLineUpTeam();
        var idx = kf.getArrayIdx(familyIDs,familyID);
        this.boxSprite.spriteFrame = this.boxSpriteframes[idx];

        var time = 0.5;
        var scale2 = cc.scaleTo(0.2,1);
        var scale = cc.scaleTo(time,0.5);
        var move = cc.moveTo(time,endPos);
        var spawn = cc.spawn(move,scale);
        var call = cc.callFunc(function(){
            this.putInPool();
        },this);
        var seq = cc.sequence(scale2,spawn.easing(cc.easeBackIn()),call);
        this.node.runAction(seq);
    },

    putInPool(){
        uiResMgr.putInPool(this.node.name,this.node);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
