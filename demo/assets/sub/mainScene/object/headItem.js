var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization

    init:function(idx,data){
        this.ID = data[jsonTables.CONFIG_HEAD.Tid];
        var url = data.url || "";
        uiResMgr.loadPlayerHead(this.ID,url,this.widget('headItem/mask/headIcon'));
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
