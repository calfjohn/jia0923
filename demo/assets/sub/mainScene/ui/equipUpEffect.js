
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    light:function () {
        this.node.dispatchDiyEvent("light",0);
    },

    // update (dt) {},
});
