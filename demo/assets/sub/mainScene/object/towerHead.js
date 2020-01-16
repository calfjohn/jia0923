var panel = require("panel");
cc.Class({
    extends: panel,
    properties: {
    },
    onLoad:function () {
    },
    init:function(idx,data){
        uiResMgr.loadPlayerHead(data[this.userLogic.Type.Icon],data[this.userLogic.Type.IconUrl],this.widget("towerHead/mask/avatar"));
    },
});
