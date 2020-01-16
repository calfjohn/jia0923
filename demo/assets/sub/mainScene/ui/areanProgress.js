cc.Class({
    extends: cc.Component,

    properties: {

    },

    playProgress:function () {
        var ev = new cc.Event.EventCustom('playProgress', true);
        this.node.dispatchEvent(ev);
    },
    playAni:function () {
        var ev = new cc.Event.EventCustom('playAni', true);
        this.node.dispatchEvent(ev);
    },
    // update (dt) {},
});
