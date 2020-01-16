var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        maxContentWidth: 430
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function(rewards){
        var content = this.widget('smeltReward/floor/floor/content');
        content.getComponent(cc.Layout).type = rewards.length > 4 ? cc.Layout.Type.GRID : cc.Layout.Type.HORIZONTAL;
        if(content.getComponent(cc.Layout).type === cc.Layout.Type.GRID) {
            content.width = this.maxContentWidth;
        }
        content.removeAllChildren(true);
        var refreshData = {
            content:content,
            list:rewards,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    close:function(){
        this.cardLogic.playFamily();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
