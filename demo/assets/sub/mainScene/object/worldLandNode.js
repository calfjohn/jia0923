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
        this.node.getComponent(cc.Sprite).spriteFrame = uiResMgr.getResource(uiResMgr.RTYPE.LANGWORLD,data.res);
        if (data.pos) {
            this.node.position = jsonTables.strToObject(data.pos);
        }
        this.node.getComponent(cc.Button).interactable = !jsonTables.isEditor;
    },

    clickBtn:function(){
        this.node.dispatchDiyEvent("clickWorldLand",this.data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
