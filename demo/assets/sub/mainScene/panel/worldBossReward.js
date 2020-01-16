var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        damageItem:cc.Prefab,
        boxItem:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshBossReward", this.refreshBossReward.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    refreshBossReward:function(serverData){
        //伤害列表
        var list = [];
        for (var i = 0 , len = serverData.RankRewards.length; i <  len; i++) {
            var obj = serverData.RankRewards[i];
            var data = kf.clone(obj);
            data.nextRange = serverData.RankRewards[i+1] ? serverData.RankRewards[i+1].RankRange-1 : "max";
            list.push(data);
        }
        var refreshData = {
            content:this.widget('worldBossReward/content/left/rangking'),
            list:list,
            prefab:this.damageItem
        }
        uiManager.refreshView(refreshData);

        //特殊奖励列表
        var list = [];
        for (var i = 0 , len = serverData.HpPer.length; i <  len; i++) {
            var obj = serverData.HpPer[i];
            list.push({hp:obj,name:serverData.UserName[i],reward:serverData.SpeRewards[i]})
        }
        var refreshData = {
            content:this.widget('worldBossReward/content/right/reward'),
            list:list,
            prefab:this.boxItem
        }
        uiManager.refreshView(refreshData);
    },

    open:function(){
        this.worldBossLogic.req_Boss_RewardInfo();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
