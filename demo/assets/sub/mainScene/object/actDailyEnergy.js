var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        leftBtn: cc.Button,
        rightBtn: cc.Button,
        leftTimeLabel: cc.Label,
        rightTimeLabel: cc.Label,
        leftVitLabel: cc.Label,
        rightVitLabel: cc.Label,
        leftRecLabel: cc.Label,
        rightRecLabel: cc.Label,
        leftVitNode: cc.Node,
        rightVitNode: cc.Node,
    },

    onLoad () {
        this.setEatTime();
    },

    setEatTime: function () {
        this.startTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.EatBegin);
        this.endTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.EatEnd);
        this.leftTimeLabel.string = this.timeLogic.getCommon2CoolTime(this.startTime[0]) + " - " + this.timeLogic.getCommon2CoolTime(this.endTime[0]);
        this.rightTimeLabel.string = this.timeLogic.getCommon2CoolTime(this.startTime[1]) + " - " + this.timeLogic.getCommon2CoolTime(this.endTime[1]);
    },

    init (data) {
        this.dailyEnergyData = data;
        this.setEnergyData();
        this.setBtnEnabled();
    },

    setEnergyData: function () {
        var actReward = this.dailyEnergyData.serverData.ActRewards;
        var userData = this.dailyEnergyData.userData;
        this.leftVitLabel.string = actReward[0].Rewards[0].Num;
        this.rightVitLabel.string = actReward[1].Rewards[0].Num;
        this.leftRecLabel.string = userData.lunchRec === 0 ? uiLang.getMessage(this.node.name, "receive") : uiLang.getMessage(this.node.name, "received");
        this.rightRecLabel.string = userData.dinnerRec === 0 ? uiLang.getMessage(this.node.name, "receive") : uiLang.getMessage(this.node.name, "received");
    },

    setBtnEnabled: function () {
        var curTime = this.timeLogic.now();
        var userData = this.dailyEnergyData.userData;
        var zeroTime = new Date(new Date(new Date().toLocaleDateString()).getTime()).getTime() / 1000;
        var leftStartTime = zeroTime + this.startTime[0];
        var leftEndTime = zeroTime + this.endTime[0];
        this.leftBtn.interactable = (curTime >= leftStartTime && curTime <= leftEndTime && userData.lunchRec === 0);
        this.leftVitLabel.node.active = userData.lunchRec === 0;
        this.leftVitNode.active = userData.lunchRec === 0;
        
        var rightStartTime = zeroTime + this.startTime[1];
        var rightEndTime = zeroTime + this.endTime[1];
        this.rightBtn.interactable = (curTime >= rightStartTime && curTime <= rightEndTime && userData.dinnerRec === 0);
        this.rightVitLabel.node.active = userData.dinnerRec === 0;
        this.rightVitNode.active = userData.dinnerRec === 0;
    },
    
    clickEnergy: function (event, cusData) {
        var idx = parseInt(cusData);
        var actReward = this.dailyEnergyData.serverData.ActRewards;
        var offsetTime = new Date().getTimezoneOffset() / 60;

        this.activityLogic.reqActivityRewardRec(this.dailyEnergyData.serverData.ID, actReward[idx].Value, (-offsetTime).toString());
    },
});
