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
            ["refreshCopyPanel", this.refreshCopyPanel.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickCopyItem", this.clickCopyItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    clickCopyItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        this.miniGameLogic.setFromSource(constant.MiniGameFromSource.Copy);
        this.miniGameLogic.req_MiniGame_Enter(data.type);
    },

    open(){
        this.miniGameLogic.req_MiniGame_Info();//// TODO: 展示放在这里等待界面
    },

    refreshCopyPanel:function(){
        var list = this.miniGameLogic.getList();
        var refreshData = {
            content:this.widget('copyPanel/floor/scrollView/view/conent'),
            list:list,
            prefab:this.itemPrefab,
        }
        uiManager.refreshView(refreshData);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
