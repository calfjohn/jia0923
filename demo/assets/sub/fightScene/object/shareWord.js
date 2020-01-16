var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        count:cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiResMgr.putInPool(this.node.name,this.node);
    },


    init:function(data){
        var color = uiColor.shareGmmeWordColor.lv1Color;
        var zIndex = 1;
        switch (data.formIdx) {
            case tb.MONSTER_ORDINARY:
                color = uiColor.shareGmmeWordColor.lv1Color;
                break;
            case tb.MONSTER_GOOD:
                zIndex = 2;
                color = uiColor.shareGmmeWordColor.lv2Color;
                break;
            case tb.MONSTER_EXCELLENT:
                zIndex = 3;
                color = uiColor.shareGmmeWordColor.lv3Color;
                break;
            case tb.MONSTER_EPIC:
                zIndex = 4;
                color = uiColor.shareGmmeWordColor.lv4Color;
                break;
            case tb.MONSTER_LEGEND:
                zIndex = 5;
                color = uiColor.shareGmmeWordColor.lv5Color;
                break;

        }
        this.count.node.color = color;
        this.count.node.zIndex = zIndex;
        this.count.string = "+"+data.addCount;
        this.node.position = data.pos;
        this.ani.play();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
