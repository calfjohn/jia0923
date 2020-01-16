var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        equipPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data,extFun){
        var refreshData = {
            content:this.node,
            list:data,
            prefab:this.equipPrefab,
            ext:extFun
        }
        uiManager.refreshView(refreshData);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
