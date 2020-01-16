var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function(cb){
        this.cb = cb;
    },
    closeWEvent:function(){
        this.close();
        var cb = this.cb;
        this.cb = null;
        if (cb) {
            cb();
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
