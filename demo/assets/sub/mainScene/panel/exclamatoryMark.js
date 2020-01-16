var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function(){
        var idx =this.userLogic.getBaseData(this.userLogic.Type.ChestUnlockNum) || 0;
        var data = this.treasureLogic.getExclamaInfo(idx-1);
        if (!data) return cc.error("找不到数据");
        this.widget('exclamatoryMark/layout/numLabel').getComponent(cc.Label).string = data.Num;
        uiResMgr.loadRewardIcon(this.widget("exclamatoryMark/layout/diamond"),data.Type,data.BaseID);
    },

    confirem:function(){
        this.close();
        this.treasureLogic.req_Chest_Upgrade();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
