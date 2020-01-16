var panel = require("panel");
cc.Class({
    extends: panel,
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function(){
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        this.node.getComponent(cc.Label).string = data.str;
        this.node.color = data.color;
    },
    // update (dt) {},
});
