var panel = require("panel");
var rewardItem = require("rewardItem");

cc.Class({
    extends: panel,

    properties: {
        signItem:cc.Prefab,
        pageListPrefab:cc.Prefab,
        content:cc.Node,
        leftBtn:cc.Node,
        rightBtn:cc.Node,

        rewardPrefab:cc.Prefab,
        rewardContent:cc.Node,

        btnLabel:cc.Label,
        btn:cc.Button,

        timeLabel:cc.Label,
        progress:cc.ProgressBar,
        starNode:cc.Node,
        starContent:cc.Node,
        starFrame:[cc.SpriteFrame]
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.pageList = this.content.getInstance(this.pageListPrefab,true);
        this.time = 0;
        this.updateTime = 0;
        this.needUpdateLeft = false;
    },

    registerEvent: function () {
        var registerHandler = [
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickPageItem", this.clickPageItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    clickPageItem:function (event) {
        event.stopPropagation();
        var data = event.getUserData();
        if(data.isTouch){//点击事件，领取奖励
            cc.log("click" +  data.clickIdx);
            var state = this.activityLogic.getNewRechargeSignState(data.clickIdx);
            if(state === constant.SignState.CANGET){//领取奖励
                this.activityLogic.req_Continue_Charge_Rec(1,data.clickIdx + 1,true);
            }
        }else{
            this.clickIdx = data.clickIdx;
            this.leftBtn.active = this.clickIdx > 1;
            this.rightBtn.active = this.clickIdx < this.continueCharge.length - 2;
        }

    },

    init (data) {
        this.signData = data;
        this.continueCharge = this.activityLogic.getNewContinueCharge();
        this.chargeReward = this.activityLogic.getNewChargeReward();
        var startTime = this.signData.serverData.OpenTime.toNumber();
        var nowTime = this.timeLogic.now();
        var zeroTime = this.timeLogic.getCurDayZero(nowTime);
        var curIdx = (zeroTime - startTime) / (3600 * 24);
        this.clickIdx = curIdx;
        if(curIdx <= 1){
            this.clickIdx = 1;
        }else if(curIdx >= this.continueCharge.length - 1){
            this.clickIdx = this.continueCharge.length - 2;
        }
        this.refresh();
    },

    refresh(){
        this.leftBtn.active = this.clickIdx > 1;
        this.rightBtn.active = this.clickIdx < this.continueCharge.length - 2;
        var refreshData = {
            prefab:this.signItem,
            list:this.continueCharge,
            miniScale:1,
            cellSpacing:0,
            unTouchEnable:false,
            viewSize:this.content.getContentSize(),
            midIdx:this.clickIdx,
            ext:true,
            clickNoMove:true,
            maxX:-this.signItem.data.width + 20,
            minX:-(this.continueCharge.length - 2) * this.signItem.data.width - 20
        };
        this.pageList.getComponent("pageListEx").init(refreshData);

        var refreshData = {
            content:this.rewardContent,
            list:this.chargeReward[0].Rewards,
            prefab:this.rewardPrefab
        }
        uiManager.refreshView(refreshData);

        this.state = this.signData.userData.NewContinueChargeReward[0];
        this.btn.interactable = this.state !== constant.SignState.GETED;
        if(this.state === constant.SignState.GETED){
            this.btnLabel.string = uiLang.getMessage("actRechargeSign","received");
        }else if(this.state === constant.SignState.CANGET){
            this.btnLabel.string = uiLang.getMessage("actRechargeSign","receive");
        }else{
            this.btnLabel.string = uiLang.getMessage("actRechargeSign","go");
        }

        this.starContent.getComponent(cc.Layout).spacingX = (570 - 5 * this.starNode.width) / (5 - 1);
        var starList = [];
        var signNum = 0;
        for (var i = 0 , len = 5; i < len; i++) {
            var star = null;
            if(this.starContent.children[i]){
                star = this.starContent.children[i];
            }else{
                star = cc.instantiate(this.starNode);
                star.parent = this.starContent;
            }
            starList.push(star);
        }
        for (var i = 0 , len = this.continueCharge.length; i < len; i++) {
            var obj = this.signData.userData.NewContinueChargeState[i];
            signNum = obj !== constant.SignState.NONE ? signNum + 1 : signNum;
        }
        signNum = signNum > 5 ? 5 : signNum;
        for (var i = 0 , len = starList.length; i < len; i++) {
            var obj = starList[i];
            obj.getComponent(cc.Sprite).spriteFrame = signNum > i ? this.starFrame[1] : this.starFrame[0];
        }
        this.progress.progress = signNum - 1 >= 0 ? (signNum - 1) / (starList.length - 1) : 0;
        this.setActLeftTime();
    },

    leftEvent(event){
        var idx = this.clickIdx -1;
        if(idx < 1 || idx > this.continueCharge.length - 2) return;
        this.pageList.getComponent("pageListEx").doLeftAction();
    },

    rightEvent(event){
        var idx = this.clickIdx + 1;
        if(idx < 1 || idx > this.continueCharge.length - 2) return;
        this.pageList.getComponent("pageListEx").doRightAction();
    },

    //设置活动剩余时间
    setActLeftTime: function () {
        var endTime = this.signData.serverData.EndTime.toNumber();
        var startTime = this.signData.serverData.OpenTime.toNumber();
        var nowTime = this.timeLogic.now();
        var zeroTime = this.timeLogic.getCurDayZero(nowTime);
        var leftTime = endTime - nowTime;
        this.needUpdateLeft = leftTime < 3600 * 24;
        var timeList = "";
        var days = Math.ceil((zeroTime - startTime) / (3600 * 24));
        if(leftTime>0) {
            if(this.needUpdateLeft) {
                timeList = this.timeLogic.getCommonCoolTime(endTime - nowTime);
            }
            else {
                timeList = this.timeLogic.getCommonShortTime(endTime - nowTime);
                timeList = timeList.join("");
            }
        }
        else {
            timeList = uiLang.getMessage("mainSceneUI","out");
            this.needUpdateLeft = false;
        }
        this.timeLabel.string = timeList;
    },

    getEvent:function () {
        if(this.state === constant.SignState.CANGET){//领取奖励
            this.activityLogic.req_Continue_Charge_Rec(2,5,true);
        }else{
            uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
        }
    },

    update:function (dt) {
        this.updateTime+=dt;
        if(this.updateTime<1) return;
        this.updateTime = 0;
        //this.setFreeLeftTime();
        if(this.needUpdateLeft)
            this.setActLeftTime();
    }


});
