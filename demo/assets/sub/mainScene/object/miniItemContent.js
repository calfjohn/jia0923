var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        miniItemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data,cb,isBottom,bottom){
        this.node.zIndex = 100 - idx;//上面的层级高
        var extData = {
            cb:cb,
            isBottom:isBottom,
            bottom:bottom
        }
        var refreshData = {
            content:this.node,
            list:data,
            prefab:this.miniItemPrefab,
            ext:extData
        }
        uiManager.refreshView(refreshData);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
