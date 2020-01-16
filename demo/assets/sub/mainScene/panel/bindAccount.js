var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    open:function () {
        this.widget("btnGoogle").active = cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID;
        this.widget("btnGameCenter").active = cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS;
    },

    fbBind:function(){

    },

    gameCenterBind:function(){

    },

    googleBind:function(){

    },
 
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
