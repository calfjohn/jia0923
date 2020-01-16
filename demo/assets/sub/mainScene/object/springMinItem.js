var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        addNode:cc.Node,
        numLabel:cc.Label,
        iconNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init (idx,data,ext) {
        this.addNode.active = idx + 1 !== ext;
        var itemNum = this.userLogic.getItemNumByID(data.BaseID);
        this.numLabel.string = itemNum + "/" + data.Num;
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.ITEM,data.BaseID);
        uiResMgr.loadCommonIcon("activity" + baseData[jsonTables.CONFIG_ITEM.ItemType], this.iconNode);
    },


    // update (dt) {},
});
