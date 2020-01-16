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
            // ["buildingRelicChange", this.buildingRelicChange.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            // ["clickScroll", this.clickScroll.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    open:function(){
        this.widget("shareGameSettle/content/integration/numberLabel").getComponent(cc.Label).string = this.shareLogic.gotScore;

        var list = [];// TODO: 获取好友分数
        var refreshData = {
            content:this.widget('shareGameSettle/content/scrollView/view/content'),
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);

        var data = null;// TODO: 获取我自己排行
        if (data) {
            var node = this.widget("shareGameSettle/content/mineCard").getInstance(this.itemPrefab,true);
            node.getComponent(this.itemPrefab.name).init(-1,data);
        }
    },

    showUp:function(){
        if (this.shareLogic.isCanShare()) {
            this.shareLogic.share(tb.SHARELINK_MINIGAME,this.shareLogic.gotScore,function () {

            }.bind(this));
        }
    },

    playGame:function(){
        this.clientEvent.dispatchEvent("loadScene",constant.SceneID.LOGIN,[],function(){
        }.bind(this),true);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
