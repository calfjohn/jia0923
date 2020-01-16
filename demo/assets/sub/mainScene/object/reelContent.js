var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,list){
        // this.node.x = -this.node.width/2;
        var refreshData = {
            content:this.widget('reelContent/content'),
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
