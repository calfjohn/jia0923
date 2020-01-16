cc.Class({
    extends: cc.Component,

    properties: {
        icon:cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init:function(idx,data){
        this.icon.spriteFrame = data;
        this.idx = data.name.slice(8);
    },
    clickItem:function(){
        var ev = new cc.Event.EventCustom('clickEmotion', true);
        ev.setUserData(this.idx);
        this.node.dispatchEvent(ev);
    }

    // update (dt) {},
});
