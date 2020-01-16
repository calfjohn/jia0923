var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        headNode:cc.Node,
        nameLabel:cc.Label,
        numLabel:cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init (idx,data) {
        this.nameLabel.string = data.Name || "";
        this.numLabel.string = data.Amount;
        var headIcon = data.Icon ? data.Icon : 1;
        uiResMgr.loadPlayerHead(headIcon,"",this.headNode);
    },

    // update (dt) {},
});
