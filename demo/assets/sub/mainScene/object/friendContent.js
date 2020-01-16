var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        friendPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data){
        for (var i = 0 , len = data.length; i < len; i++) {
            var obj = data[i];
            obj.Idx = idx;
        }
        var refreshData = {
            content:this.node,
            list:data,
            prefab:this.friendPrefab
        }
        uiManager.refreshView(refreshData);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
