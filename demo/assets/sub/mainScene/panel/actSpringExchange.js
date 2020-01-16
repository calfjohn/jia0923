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
        this.actItemID = [5,4,3];

    },

    registerEvent () {
        var registerHandler = [
        ]
        this.registerClientEvent(registerHandler);
    },

    init(data){
        this.springData = data;
        this.updateNum();
        this.refreshContent();
        var openTime = this.springData.serverData.OpenTime.toNumber();
        var endTime = this.springData.serverData.EndTime.toNumber();
        this.timeLabel.string = uiLang.getMessage(this.node.name,"time1") + this.timeLogic.getNowFormatDate(endTime);
    },

    updateNum(){
        for (var i = 0 , len = this.actItemID.length; i < len; i++) {
            var obj = this.actItemID[i];
            var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.ITEM,obj);
            uiResMgr.loadCommonIcon("activity" + baseData[jsonTables.CONFIG_ITEM.ItemType], this.iconList[i]);
            this.numList[i].string = this.userLogic.getItemNumByID(obj);
        }
    },

    refreshContent(){
        var list = this.activityLogic.getSpringExchangeData();
        var refreshData = {
            content:this.content,
            list:list,
            prefab:this.prefab,
        }
        uiManager.refreshView(refreshData);
    },



    // update (dt) {},
});
