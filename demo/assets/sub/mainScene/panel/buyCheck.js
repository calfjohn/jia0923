var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function(cancleCb,confirmCb){
        this.widget("buyCheck/floor1/words/diamond/label").getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.ChangeNameCost);
        this.cancleCb = cancleCb;
        this.confirmCb = confirmCb;
    },

    cancle:function(){
        this.close();
        var cb = this.cancleCb;
        this.cancleCb = null;
        if (cb) {
            cb();
        }
    },

    confirm:function(){
        this.close();
        var cb = this.confirmCb;
        this.confirmCb = null;
        if (cb) {
            cb();
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
