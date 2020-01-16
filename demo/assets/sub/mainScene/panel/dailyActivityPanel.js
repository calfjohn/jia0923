var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content: cc.Node,
        actContent: [cc.Node],
        activityItem: cc.Prefab
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

    showLeft: function () {
        if(!this.dailyActList) this.dailyActList = this.activityLogic.getDailyActList();
        var list = kf.clone(this.dailyActList);
        for (var i = 0; i < list.length; i++) {
            var obj = list[i].userData;
            if(obj.newSign) {
                list[i].showRedPoint = this.activityLogic.getNewSignRedPoint(obj);
            }
            if(obj.lvGift) {
                list[i].showRedPoint = this.activityLogic.getLevelGiftRedPoint(list[i]);
            }
            if(obj.hasOwnProperty("dinnerRec")) {
                list[i].showRedPoint = this.activityLogic.getDinnerRedPoint(obj);
            }
            if(obj.NewContinueChargeState){
                list[i].showRedPoint = this.activityLogic.getNewSignPoint();
            }
        }
        var refreshData = {
            content:this.content,
            list:list,
            prefab:this.activityItem,
        }
        uiManager.refreshView(refreshData);
        this.toggleHelperJs.resetChild();
    },

    open (cb) {
        this.cb = cb;
        this.dailyActList = this.activityLogic.getDailyActList();
        if(this.dailyActList.length === 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name, "noActTip"));
            this.close();
            return;
        }

        this.openActIdx = 0;
        this.showLeft();
        this.toggleHelperJs.setIdxToggleCheck(this.openActIdx);
        this.initActivity(this.dailyActList[this.openActIdx]);
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
        this.dailyActList = this.activityLogic.getDailyActList();
        this.initActivity(this.dailyActList[this.openActIdx]);
        this.showLeft();
    },

    close:function () {
        this.cb && this.cb();
        this.node.active = false;
    },

    switchToggle: function (event, cusData) {
        this.openActIdx = parseInt(cusData);
        this.initActivity(this.dailyActList[this.openActIdx]);
    }
});
