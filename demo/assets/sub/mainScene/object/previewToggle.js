var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,reelID){
        var info = (idx + 1);
        this.widget('previewToggle/label').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"previewToggle").formatArray([info]);
        // this.widget('previewToggle/checkmark/label').getComponent(cc.Label).string = this.widget('previewToggle/label').getComponent(cc.Label).string;
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
