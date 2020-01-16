var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        levelGiftItem: cc.Prefab,
        content: cc.Node
    },

    onLoad () {
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["clickReceive", this.clickReceive.bind(this)]
        ]
        this.registerNodeEvent(registerHandler);
    },

    init (data) {
        this.levelGiftData = data;
        this.initLevelGift();
    },

    initLevelGift: function () {
        var list = this.sortRewards();
        var refreshData = {
            content:this.content,
            list:list,
            prefab:this.levelGiftItem
        }
        uiManager.refreshView(refreshData);//
    },

    sortRewards: function () {
        var list = this.levelGiftData.serverData.ActRewards;
        var userData = this.levelGiftData.userData.lvGift;

        var recList = [];
        var unRecList = [];

        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            obj.isReceive = userData.indexOf(obj.Value) !== -1;
            if(obj.isReceive)
                recList.push(obj);
            else
                unRecList.push(obj);
        }

        var itemList = unRecList.concat(recList);
        return itemList;
    },

    clickReceive: function (event) {
        var data = event.getUserData();

        this.activityLogic.reqActivityRewardRec(this.levelGiftData.serverData.ID, data.Value);
    },

});
