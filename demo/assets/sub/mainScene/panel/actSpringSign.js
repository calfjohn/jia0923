var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        iconList:[cc.Node],
        numList:[cc.Label],
        prefab:cc.Prefab,
        content:cc.Node,
        timeLabel:cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.actItemID = [tb.ITEM_FIRECRACKER,tb.ITEM_LANTERN,tb.ITEM_RED_ENVELOPES];
        this.posList = [cc.v2(-217.5,60),cc.v2(-72.5,60),cc.v2(72.5,60),cc.v2(217.5,60),cc.v2(-145,-60),cc.v2(0,-60),cc.v2(145,-60)];
    },

    registerEvent () {
        var registerHandler = [
        ]
        this.registerClientEvent(registerHandler);
    },

    init(data){
        this.springData = data;
        this.refreshContent();
        var openTime = this.springData.serverData.OpenTime.toNumber();
        var endTime = this.springData.serverData.EndTime.toNumber();
        this.timeLabel.string = this.timeLogic.getNowFormatDate(endTime);
        
    },

    refreshContent(){
        var list = [];
        for (var i = 0 , len = this.springData.serverData.ActRewards.length; i < len; i++) {
            var obj = this.springData.serverData.ActRewards[i];
            obj.state = this.springData.userData.FixedDateSignState[i];
            obj.pos = this.posList[i];
            list.push(obj);
        }
        var refreshData = {
            content:this.content,
            list:list,
            prefab:this.prefab,
        }
        uiManager.refreshView(refreshData);
    },



    // update (dt) {},
});
