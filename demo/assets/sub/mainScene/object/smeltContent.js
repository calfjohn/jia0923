var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        smeltPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data,ext){
        var refreshData = {
            content:this.node,
            list:data,
            prefab:this.smeltPrefab,
            ext:ext
        }
        uiManager.refreshView(refreshData);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
