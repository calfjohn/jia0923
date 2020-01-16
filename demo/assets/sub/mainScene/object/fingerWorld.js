var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        fingerPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(contentID){
        this.widget("fingerWorld/bg").active = !!contentID;
        if (this.widget("fingerWorld/bg").active) {
            this.widget("fingerWorld/bg").zIndex = 10;
            this.widget("fingerWorld/bg/label").getComponent(cc.Label).string = uiLang.getConfigTxt(contentID);
        }
        this.node.getInstance(this.fingerPrefab,true);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
