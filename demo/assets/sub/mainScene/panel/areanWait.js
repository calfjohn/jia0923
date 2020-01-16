var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open: function(isShowOther){
        for (var i = 0 , len = this.node.children.length; i <  len; i++) {
            var obj = this.node.children[i];
            obj.active = isShowOther;
        }
        this.duration = 1;
        this.isShowOther = isShowOther;
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.isShowOther) return;
        var nextTime = this.areanLogic.getEndTime();
        var offTime = nextTime - this.timeLogic.now();
        offTime = parseInt(offTime);
        if (offTime <= 0) {
            offTime = 0;
            this.isShowOther = false;
        }
        this.widget("areanWait/timeLabel").getComponent(cc.Label).string = offTime;
    }
});
