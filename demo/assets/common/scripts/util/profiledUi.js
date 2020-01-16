
cc.Class({
    extends: cc.Component,
    editor: {
        menu:"util/用于异形屏时偏移",
        disallowMultiple:true,
    },
    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },
    start:function(){
        if (jsonTables.isProfiledScreen()) {
            this.scheduleOnce(function () {
                this.node.x += (cc.view.getFrameSize().width * (44/812))
            },0);
        }

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
