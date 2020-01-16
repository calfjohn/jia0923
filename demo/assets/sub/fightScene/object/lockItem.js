var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
    },

    init:function(data,row,col,lockIdx,chapterId){
        this.Idx = lockIdx;
        this.type = constant.TableSpecialInfo.LOCK;
        this.node.setContentSize(this.node.width,this.node.height);
        this.node.setPosition(this.node.width*(col + 0.5),this.node.height*( row + 0.5));
        this.chapterId = chapterId;
        this.lockIdx = lockIdx;
        this.count = this.chapterLogic.getLockNum(chapterId,lockIdx);
        this.node.active = this.count > 0 && this.fightLogic.isGameType(constant.FightType.PVE);
    },

    getSpeData:function(){
        if (this.count === 0) return;
        return {Idx:this.Idx,Type:this.type,Num:this.count};
    },

    isCanTouch:function(){
        return !this.node.active;
    },

    desrLock:function(){
        if (!this.node.active) return;
        this.count--;
        this.node.active = this.count > 0;
    },

    // update (dt) {},
});
