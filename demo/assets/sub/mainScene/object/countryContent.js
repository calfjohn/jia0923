var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,list,ext){
        var refreshData = {
            content:this.node,
            list:list,
            prefab:this.itemPrefab,
            ext:ext
        }
        uiManager.refreshView(refreshData);//
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
