var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        defaultSp:cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data){
        this.data = data;
        if (this.data.picUrl) {
            var nodeUrl = data.picUrl;
            if (!cc.sys.isNative) {
                nodeUrl = window["clientConfig"]["h5PhotoUrl"];
                nodeUrl = nodeUrl + "/requestTexture?" + data.picUrl;
            }
            uiResMgr.loadPlayerHead(-1,nodeUrl,this.node);
        }else {
            this.node.getComponent(cc.Sprite).spriteFrame = this.defaultSp;
        }
    },

    click:function(){
        if (this.data.url) {
            cc.sys.openURL(this.data.url);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
