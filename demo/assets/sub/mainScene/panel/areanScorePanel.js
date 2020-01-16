var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        pageListPrefab:cc.Prefab,
        leftNode:cc.Node,
        rightNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.pageList = this.widget("areanScorePanel/content").getInstance(this.pageListPrefab,true);
    },

    registerEvent: function () {
        var registerHandler = [
            ["clickPageItem", this.clickPageItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    clickPageItem:function (event) {
        event.stopPropagation();
        var data = event.getUserData();
        this.leftNode.active = data.clickIdx !== 0;
        this.rightNode.active = data.clickIdx !== this.list.length - 1;
    },

    open:function(){
        var idx = this.areanLogic.getMyIdx();
        this.list = this.areanLogic.getAllDivInfo();
        this.leftNode.active = idx !== 0;
        this.rightNode.active = idx !== this.list.length - 1;
        var refreshData = {
            prefab:this.itemPrefab,
            list:this.list,
            miniScale:0.4,
            cellSpacing:10,
            viewSize:this.widget("areanScorePanel/content").getContentSize(),
            midIdx:idx,
            ext:idx
        };
        this.pageList.getComponent("pageListEx").init(refreshData);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
