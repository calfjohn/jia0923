var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        miniItemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data){
        var refreshData = {
            content:this.node,
            list:data,
            prefab:this.miniItemPrefab
        }
        uiManager.refreshView(refreshData);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
