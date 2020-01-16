var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        scoreLabels:[cc.Label],
        wordPreafb:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        uiResMgr.createPrefabPool(this.wordPreafb,1);
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.scheduleOnce(function () {
            this.init();
        },0.5);
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshCount", this.refreshCount.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

    },

    refreshCount:function(addCount,formIdx){
        this.widget("shareGameUi/integration/score").getComponent(cc.Label).string = this.shareLogic.gotScore;
        if (addCount) {
            var pos = cc.v2(jsonTables.randomNum(-450,-350),jsonTables.randomNum(-150,-100));
            var node = uiResMgr.getPrefab(this.wordPreafb.name,{pos:pos,addCount:addCount,formIdx:formIdx});
            node.parent = this.node;
            node.zIndex = 999;
        }
    },
    init:function(){
        var ranksList = this.shareLogic.getScore();
        for (var i = 0 , len = this.scoreLabels.length; i <  len; i++) {
            var obj = this.scoreLabels[i];
            var data = ranksList[i] || 0;
            var txt = uiLang.getMessage(this.node.name,("gotSore" + i));
            obj.string = txt.formatArray([data]);
         }
        var list = [];// TODO: 获取好友分数
        var refreshData = {
            content:this.widget('shareGameUi/frame2/content'),
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
        this.widget("shareGameUi/frame2/noLabel1").active = list.length === 0;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
