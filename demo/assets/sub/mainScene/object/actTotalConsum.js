var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        consumProgressBar: cc.ProgressBar,
        consumNum: cc.Label,
        rewardContent: cc.Node,
        leftBtn: cc.Node,
        rightBtn: cc.Node,
        recBtn: cc.Button,
        recLbel: cc.Label,
        consumLevelLabel: cc.Label,
        btnShopLabel: cc.Label,
        tipsLabel: cc.Label,
        rewardItem: cc.Prefab,
        receivedLabel: cc.Node
    },

    onLoad () {},

    init (data) {
        this.consumData = data;

        this.initConsumNum();

        this.initReward();
    },

    initConsumNum(){//初始化数据
        var consumNum = this.userLogic.getBaseData(this.userLogic.Type.SpendDiamond);//获得玩家消费数据

        var rewardList = this.consumData.serverData.ActRewards;

        var SpendRewardID = this.consumData.userData.SpendRewardID;

        this.rewardData = null;

        for(var i = 0; i < rewardList.length; i++){
            var obj = rewardList[i];
            if(obj.Value <= consumNum && SpendRewardID.indexOf(obj.Value) !== -1) continue;
            this.rewardData = obj;
            break;
        }

        if(!this.rewardData) return;

        this.refresConsumNum(this.rewardData);
    },

    initReward(){
        if(!this.rewardData) return;

        var rewardList = this.consumData.serverData.ActRewards;

        this.curIdx = rewardList.indexOf(this.rewardData);//设置页面计数

        this.refresBtnActive(this.curIdx);

        this.refreshReward(this.rewardData);
    },

    refresConsumNum(data){
        var consumLimitNum = data.Value;//得到消费数据进行进度条设置
        var consumNum = this.userLogic.getBaseData(this.userLogic.Type.SpendDiamond);
        var consumProgress = consumNum / consumLimitNum;
        this.consumProgressBar.progress = consumProgress;
        this.consumNum.string = consumNum + "/" + consumLimitNum;
    },

    refreshReward(data){
        this.receivedLabel.active = false;
        this.recBtn.node.active = true;

        var consumNum = this.userLogic.getBaseData(this.userLogic.Type.SpendDiamond);//重新得到服务端的数据进行设置.parent.getChildByName("actTotalCharge")

        var conssumRewardID = this.consumData.userData.SpendRewardID;

        this.consumLevelLabel.string = uiLang.getMessage(this.node.name, "spendLevel").formatArray([this.curIdx + 1]);//设置奖励等级字符串

        var rewardList = this.consumData.serverData.ActRewards;

        var rewardData = rewardList[this.curIdx];

        var listData = {//数据储存建立奖励预制时使用
            content:this.rewardContent,
            list:rewardData.Rewards,
            prefab: this.rewardItem
        };
        uiManager.refreshView(listData);

        this.recBtn.interactable = consumNum >= data.Value;//判断领取按钮状态
        this.recBtn.node.active = conssumRewardID.indexOf(data.Value) === -1;
        this.receivedLabel.active = !this.recBtn.node.active;
        this.recLbel.string = this.recBtn.interactable ? uiLang.getMessage("actDailyEnergy","receive"):uiLang.getMessage("actLevelGiftItem","condition");
    },

    refresBtnActive(idx){//刷新按钮状态
        this.leftBtn.active = idx > 0;
        this.rightBtn.active = idx < this.consumData.serverData.ActRewards.length - 1;//通过服务器传来的玩家消费等级
    },

    clickLeft(){
        this.curIdx --;

        var rewardList = this.consumData.serverData.ActRewards;

        var data = rewardList[this.curIdx];

        this.refreshReward(data);

        this.refresConsumNum(data);

        this.refresBtnActive(this.curIdx);
    },

    clickRight(){
        this.curIdx ++;

        var rewardList = this.consumData.serverData.ActRewards;

        var data = rewardList[this.curIdx];

        this.refreshReward(data);

        this.refresConsumNum(data);

        this.refresBtnActive(this.curIdx);
    },

    clickShop(){//点击跳转到商店
        uiManager.openUI(uiManager.UIID.DRAW_CARD);
        uiManager.closeUI(uiManager.UIID.ACTIVITY);
    },

    clickRec: function(){//点击领取
        var rewardList = this.consumData.serverData.ActRewards;
        var data = rewardList[this.curIdx];
        this.refreshReward(data);
        this.refresBtnActive(this.curIdx);
        var actReward = this.consumData.serverData.ActRewards;
        this.activityLogic.reqActivityRewardRec(this.consumData.serverData.ID, actReward[this.curIdx].Value);//上传服务器领取
    },
});
