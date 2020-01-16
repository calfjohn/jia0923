var panel = require("panel");
cc.Class({
    extends: panel,
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function(){

    },
    init:function(idx,data){
        this.data = data.data;
        this.type = data.type;
        var posType = this.type === constant.TalentIconType.TREE?jsonTables.CONFIG_TALENT.MainPos:jsonTables.CONFIG_TALENT.MiniPos;
        var scaleType = this.type === constant.TalentIconType.TREE?jsonTables.CONFIG_TALENT.MainScale:jsonTables.CONFIG_TALENT.MiniScale;
        this.node.scale = this.data[scaleType];
        this.node.position =cc.v2(this.data[posType][0],this.data[posType][1]);
    },
});
