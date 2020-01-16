var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content: cc.Node,
        activityItem: cc.Prefab,
        mineGetLabel:cc.Label,
        limitLabel:cc.Label,
        srcHead:cc.Node,
        srcName:cc.Label,
        secNumLabel:cc.Label
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.listViewJS = this.content.getComponent("listView");
    },

    open (data) {
        var list = data.Receivers;
        list.sort(function (a,b) {
            return b.Amount - a.Amount;
        })
        var viewData = {
            totalCount:list.length,
            spacing:5,
            rollNow:false
        };
        this.listViewJS.init(this.activityItem,viewData,list,0);
        this.mineGetLabel.string = data.Amount;
        this.limitLabel.string = (data.ReceLimit - data.ReceNum) + "/" + data.ReceLimit;
        var headIcon = data.SourceIcon ? data.SourceIcon : 1;
        uiResMgr.loadPlayerHead(headIcon,"",this.srcHead);
        this.srcName.string = data.SourceName;
        this.secNumLabel.string = list.length + "/" + data.Total;
    },

    closeEvent(){
        this.close();
        this.activityLogic.req_Get_RedPacket();
    },


});
