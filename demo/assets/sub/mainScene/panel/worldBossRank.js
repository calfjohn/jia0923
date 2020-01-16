var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshBossRank", this.refreshBossRank.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    refreshBossRank:function(serverData){
        var list = [];
        for (var i = 0 , len = serverData.RankNo.length; i <  len; i++) {
            var rank = serverData.RankNo[i];
            list.push({rank:rank,damageInfo:serverData.DamageInfo[i]});
        }
        var refreshData = {
            content:this.widget('worldBossRank/scrollView/view/rangking'),
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    open:function(){
        this.worldBossLogic.req_Get_BossRank();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
