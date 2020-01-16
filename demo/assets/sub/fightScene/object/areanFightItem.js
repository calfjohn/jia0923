var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data){
        this.data = data;
        uiResMgr.loadAreanEmojIcon(this.data[jsonTables.CONFIG_EXPRESSION.ExpressionUiRes],this.widget("areanFightItem/icon"))
    },

    click:function(){
        this.node.dispatchDiyEvent("clickEmj",this.data[jsonTables.CONFIG_EXPRESSION.Tid]);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
