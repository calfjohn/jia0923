var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content:cc.Node,
        actContent: [cc.Node],
        toggle1:cc.Toggle,
        toggle2:cc.Toggle,
        redPoint1:cc.Node,
        redPoint2:cc.Node,
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.toggleHelperJs = this.content.getComponent("toggleHelper");
        this.registerEvent();
    },

    start () {
    },

    registerEvent: function () {
        this.registerClientEvent("refreshActData", this.refreshActData.bind(this));
    },

    showLeft: function () {//显示左边活动栏，并且判定是否需要显示红点
        this.redPoint1.active = this.activityLogic.checkSpExchangeRedPoint();
        this.redPoint2.active = this.activityLogic.checkSpSignRedPoint();
    },

    open (openActIdx) {
        this.chargeActList = this.activityLogic.getSpringActList();
        if(this.chargeActList.length === 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name, "noActTip"));
            this.close();
            return;
        }
        if(Object.keys(this.shopLogic.shopData).length === 0) {
            this.shopLogic.req_Shop_Info();
        }
        this.openActIdx = openActIdx ? openActIdx : 0;
        this.openActIdx = this.openActIdx < this.chargeActList.length ? this.openActIdx : this.chargeActList.length - 1;
        this.showLeft();
        this.toggleHelperJs.setIdxToggleCheck(this.openActIdx);
        this.initActivity(this.chargeActList[this.openActIdx]);
    },

    initActivity: function (data) {
        for (var i = 0; i < this.actContent.length; i++) {
            var obj = this.actContent[i];
            obj.active = obj.name === data.serverData.ActResource;
            if(!obj.active) continue;
            var activity = obj.getComponent(obj.name);
            activity.init(data);
        }
    },

    refreshActData: function () {
        this.chargeActList = this.activityLogic.getSpringActList();
        this.initActivity(this.chargeActList[this.openActIdx]);
        this.showLeft();
    },

    switchToggle: function (event, cusData) {
        this.openActIdx = parseInt(cusData);
        this.initActivity(this.chargeActList[this.openActIdx]);
    }
});
