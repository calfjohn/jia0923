var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        dayLabel: cc.Node,
        hourLabel: cc.Node,
        upMonNode: [cc.Node],
        upMonster: [sp.Skeleton]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this)
        this.updateTime = 0;;
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

    setActLeftTime: function () {
        var endTime = this.drawData.serverData.EndTime.toNumber();
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;
        this.limitUpdateLeft = leftTime < 3600 * 24;
        var timeList = "";
        if(leftTime>0) {
            if(this.limitUpdateLeft) {
                timeList = this.timeLogic.getCommonCoolTime(endTime - nowTime);
            }
            else {
                timeList = this.timeLogic.getCommonShortTime(endTime - nowTime);
                timeList = timeList.join("");
            }
        }
        else {
            this.actEnd = true;
            this.widget("actStartMsg/shrink/actLimitItem/btn1").getComponent(cc.Button).interactable = false;
            timeList = uiLang.getMessage("mainSceneUI","out");
        }
        this.dayLabel.active = !this.limitUpdateLeft;
        this.hourLabel.parent.active = this.limitUpdateLeft;
        this.dayLabel.getComponent(cc.Label).string = timeList;
        this.hourLabel.getComponent(cc.Label).string = timeList;
    },

    open:function (cb) {
        this.cb = cb;
        this.widget("actStartMsg/shrink/actLimitItem/btn1").getComponent(cc.Button).interactable = true;
        this.drawData = this.activityLogic.getDrawCardData();
        this.initUpMonster();
        this.setActLeftTime();
    },

    initUpMonster: function () {
        var upMonsterTid = this.drawData.serverData.FamilyID;
        for (let i = 0; i < this.upMonNode.length; i++) {
            var obj = this.upMonNode[i];
            obj.active = !!upMonsterTid[i];
            if(obj.active) {
                let familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,upMonsterTid[i]);
                let tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
                let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
                this.upMonster[i].skeletonData = null;
                let callback = function (spineData) {
                    this.upMonster[i].skeletonData  = spineData;
                    this.upMonster[i].setAnimation(0,'std',true);
                }.bind(this);
                uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callback);
            }
        }
    },

    btnEnent:function () {
        if(this.actEnd)  return;
        uiManager.openUI(uiManager.UIID.ACT_DRAWCARD);
        this.close();
    },
    closeClick() {
        if(this.cb) {
            this.cb();
            this.cb = undefined;
        }
        this.close();
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!this.limitUpdateLeft) return;
        this.updateTime += dt;
        if(this.updateTime < 0) return;
        this.updateTime = 0;
        this.setActLeftTime();
    }
});
