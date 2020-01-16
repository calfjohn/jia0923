var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        this.data = data;
        this.widget('copyPanelItem/numberLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"leaveCount").formatArray([data.num]);
    },

    clickBtn:function(){
        this.node.dispatchDiyEvent("clickCopyItem",this.data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
