var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function (){

    },
    confirm:function () {
        var idx = 3;
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            idx = 3;
        }else if(cc.sys.os === cc.sys.OS_IOS) {
            idx = 4;
        }
        var url = this.userLogic.getLinkFromServer(idx);
        if (!url) {
            url = "https://play.google.com/store/apps/details?id=com.hiho.google.pm";
        }
        cc.sys.openURL(url);
        this.close();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
