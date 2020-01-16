var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        aniStartPos:cc.Vec2,
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
    },
    start:function(){
        setTimeout(function(){
            this.refresh();
        }.bind(this),100);
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshTreasure", this.refresh.bind(this),true],
            ["changeLanguage", this.refresh.bind(this),true],
            ["closePanel",this.closePanel.bind(this)]
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickTreasure", this.clickTreasure.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    closePanel:function(UIID){
        if(UIID === uiManager.UIID.TREASURE_BOX && this.lastTreasure){
            this.lastTreasure.getChildByName("openFrame").active = false;
        }
    },

    refresh:function(){
        var list = this.treasureLogic.getChestInfos();
        var haveArr = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(!obj)    continue;
            haveArr.push(obj.Idx);
        }
        for (var i = 1 , len = 5; i < len; i++) {
            if(haveArr.indexOf(i) === -1){
                var data = {
                    Idx:i
                }
                list.push(data);
            }
        }
        var refreshData = {
               content:this.widget('treasure/content'),
               list:list,
               prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    clickTreasure:function(event){
        event.stopPropagation()
        var data = event.getUserData()
        this.lastTreasure = data.node;
        if (data.data.Time.toNumber() !== -1 && this.timeLogic.now64().greaterThanOrEqual(data.data.Time)) {//去打开
            var type = this.treasureLogic.OPTYPE_ENUM.TOOKEN;
            this.treasureLogic.req_Chest_Op(data.data.Idx,type);
        }else{
            uiManager.openUI(uiManager.UIID.TREASURE_BOX,data.data);
            window.adjustUtil.recored(tb.ADJUST_RECORED_BOX,data.data.ChestID);
        }
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
