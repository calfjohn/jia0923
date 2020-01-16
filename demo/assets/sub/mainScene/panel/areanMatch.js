var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        uiManager.loadAsyncPrefab(uiManager.UIID.AREAN_LOAD);
    },

    open:function(){
        this.timeCount = 5;
        this.duration = 1;
        this.areanLogic.req_Arena_Match(this.areanLogic.MATCH_ENUM.MATCH);
    },

    cancle:function(){
        this.areanLogic.req_Arena_Match(this.areanLogic.MATCH_ENUM.CANCLE);
        this.close();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        if (this.timeCount > 0) {
            this.timeCount--;
        }
        this.widget('areanMatch/in/magnifier/timeLabel/numberLabel').getComponent(cc.Label).string = this.timeCount;
    }
});
