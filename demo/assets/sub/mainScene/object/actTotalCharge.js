var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        chargeProgress: cc.ProgressBar,
        chargeNum: cc.Label,
        rewardContent: cc.Node,
        leftBtn: cc.Node,
        rightBtn: cc.Node,
        recBtn: cc.Button,
        recLabel: cc.Label,
        chargeLevelLabel: cc.Label,
        rewardItem: cc.Prefab,
        receivedLabel: cc.Node
    },

    onLoad () {},

    init (data) {
        this.totalChargeData = data;

        this.initChargeNum();

        this.initReward();
    },

    //
    initChargeNum () {
        var chargeNum = this.userLogic.getBaseData(this.userLogic.Type.ChargeDiamond);

        var rewardList = this.totalChargeData.serverData.ActRewards;

        var chargeRewardID = this.totalChargeData.userData.chargeRewardID;

        this.rewardData = null;

        for (var i = 0; i < rewardList.length; i++) {
            var obj = rewardList[i];
            if(obj.Value <= chargeNum && chargeRewardID.indexOf(obj.Value) !== -1) continue;

            this.rewardData = obj;
            break;
        }

        if(!this.rewardData) return;

        this.refreshChargeNum(this.rewardData);
    },

    refreshChargeNum (data) {
        var chargeLimitNum = data.Value;
        var chargeNum = this.userLogic.getBaseData(this.userLogic.Type.ChargeDiamond);;

        var chargeProgress = chargeNum / chargeLimitNum;
        this.chargeProgress.progress = chargeProgress;
        this.chargeNum.string = chargeNum + "/" + chargeLimitNum;
    },

    initReward () {
        if(!this.rewardData) return;

        var rewardList = this.totalChargeData.serverData.ActRewards;

        this.curIdx = rewardList.indexOf(this.rewardData);

        this.refreshBtnActive(this.curIdx);

        this.refreshReward(this.rewardData);
    },

    refreshReward (data) {
        this.receivedLabel.active = false;
        this.recBtn.node.active = true;

        var chargeNum = this.userLogic.getBaseData(this.userLogic.Type.ChargeDiamond);;

        var chargeRewardID = this.totalChargeData.userData.chargeRewardID;

        this.chargeLevelLabel.string = uiLang.getMessage(this.node.name, "chargeLevel").formatArray([this.curIdx + 1]);

        var rewardList = this.totalChargeData.serverData.ActRewards;

        var rewardData = rewardList[this.curIdx];

        var listData = {
            content: this.rewardContent,
            list: rewardData.Rewards,
            prefab: this.rewardItem
        };
        uiManager.refreshView(listData);

        this.recBtn.interactable = chargeNum >= data.Value;

        this.recBtn.node.active = chargeRewardID.indexOf(data.Value) === -1;
        this.receivedLabel.active = !this.recBtn.node.active;
        this.recLabel.string = this.recBtn.interactable ? uiLang.getMessage("actDailyEnergy","receive"):uiLang.getMessage("actLevelGiftItem","condition");
    },

    refreshBtnActive (idx) {
        this.leftBtn.active = idx > 0;
        this.rightBtn.active = idx < this.totalChargeData.serverData.ActRewards.length - 1;
    },

    clickLeft () {
        this.curIdx --;

        var rewardList = this.totalChargeData.serverData.ActRewards;

        var data = rewardList[this.curIdx];

        this.refreshReward(data);

        this.refreshChargeNum(data);

        this.refreshBtnActive(this.curIdx);
    },

    clickRight () {
        this.curIdx ++;

        var rewardList = this.totalChargeData.serverData.ActRewards;

        var data = rewardList[this.curIdx];

        this.refreshReward(data);

        this.refreshChargeNum(data);

        this.refreshBtnActive(this.curIdx);
    },

    clickShop () {
        if(this.activityLogic.checkDiamonOpen()){
            uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
        }else{
            uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
        }
        uiManager.closeUI(uiManager.UIID.ACTIVITY);
    },

    clickRec: function () {
        var rewardList = this.totalChargeData.serverData.ActRewards;
        var data = rewardList[this.curIdx];
        this.refreshReward(data);
        this.refreshBtnActive(this.curIdx);
        var actReward = this.totalChargeData.serverData.ActRewards;
        this.activityLogic.reqActivityRewardRec(this.totalChargeData.serverData.ID, actReward[this.curIdx].Value);
    },
});
