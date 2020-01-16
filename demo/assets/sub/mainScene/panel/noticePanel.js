var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.richTextHandler = this.widget("noticePanel/shrink/scrollView/view/content/label").getComponent("richTextHander");
        jsonTables.parsePrefab(this);
    },

    open:function(msg,callback){
        this.richTextHandler.setString(msg.Message);
        this.callback = callback?callback:function () {};
    },

    close:function(){
        this.callback();
        this.callback = undefined;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
