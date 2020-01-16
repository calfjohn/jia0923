var panel = require("panel");
var toggleHelper = require('toggleHelper');
cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        labelList:[cc.SpriteFrame],
        labelSprite:cc.Sprite,
        rewardContent:cc.Node,
        rewardPrefab:cc.Prefab,
        doneLabel:cc.Label,
        btn:cc.Button,
        shopBtn:cc.Button,
        buttonLabel:cc.Label,
        toggleList:[cc.Node],
        spine:sp.Skeleton,
        monsterName:cc.Label,
        timeLabel:cc.Label,

        qualityFrame:[cc.SpriteFrame],
        qualitySprite:cc.Sprite,
        bgSprite:cc.Sprite,
        bgFrame:[cc.SpriteFrame]

    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.shopLogic.req_Shop_Info();
        this.updateTime = 0;
        this.needUpdateLeft = false;
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshActData", this.refresh.bind(this)]
        ]
        this.registerClientEvent(registerHandler);
    },

    switchTag(param,idx){
        if(this.openFlag){
            this.openFlag = false;
            if(this.switchIdx !== undefined){
                this.toggleList[this.switchIdx].scale = 0.8;
            }
            this.toggleList[idx].scale = 1;
        }else{
            if(this.switchIdx !== undefined){
                this.toggleList[this.switchIdx].runAction(cc.scaleTo(0.1,0.8));
            }
            this.toggleList[idx].runAction(cc.scaleTo(0.1,1));
        }
        this.switchIdx = Number(idx);
        this.initReward();

    },

    open(){
        this.refresh(true);
        this.openFlag = true;
        var idx = this.firstIdx ? this.firstIdx : 0;
        this.toggleHelperJs.setIdxToggleCheck(idx);
        this.switchIdx = idx;
        this.initReward();
    },

    refresh(isOpen){
        this.cumulativeData = this.activityLogic.getCumulativeData();
        this.initChargeNum();
        if(!isOpen){
            this.initReward();
        }
        this.setActLeftTime();
    },

    //设置活动剩余时间
    setActLeftTime() {
        var endTime = this.cumulativeData.serverData.EndTime.toNumber();
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;
        this.needUpdateLeft = leftTime < 3600 * 24;
        var timeList = "";
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

    //
    initChargeNum () {
        var chargeNum = this.cumulativeData.userData.SumPay;
        this.doneLabel.string = uiLang.getMessage(this.node.name,"haveCu").formatArray([chargeNum]);
        var rewardList = this.cumulativeData.serverData.ActRewards;
        var chargeRewardID = this.cumulativeData.userData.chargeRewardID;
        this.rewardData = rewardList;
        this.firstIdx = undefined;
        for (var i = 0; i < rewardList.length; i++) {
            var obj = rewardList[i];
            var node = this.toggleList[i].getChildByName("redPoint");
            if(obj.Value < chargeNum && chargeRewardID.indexOf(obj.Value) !== -1){
                node.active = false;
                continue;
            }
            node.active = obj.Value <= chargeNum && chargeRewardID.indexOf(obj.Value) === -1;
            if(this.firstIdx === undefined){
                this.firstIdx = i;
            }
        }
    },

    initReward () {
        var rewardData = this.cumulativeData.serverData.ActRewards[this.switchIdx];
        this.refreshReward(rewardData);

    },

    refreshReward(data){
        var chargeNum = this.cumulativeData.userData.SumPay;
        var chargeRewardID = this.cumulativeData.userData.chargeRewardID;
        this.btn.interactable = data.Value <=  chargeNum && chargeRewardID.indexOf(data.Value) === -1;
        this.btn.node.active = data.Value <=  chargeNum;
        this.shopBtn.node.active = data.Value >  chargeNum;
        if(chargeRewardID.indexOf(data.Value) !== -1){
            this.buttonLabel.string = uiLang.getMessage(this.node.name,"geted");
        }else{
            this.buttonLabel.string = chargeNum >= data.Value ? uiLang.getMessage(this.node.name,"get"):uiLang.getMessage(this.node.name,"unDone");
        }
        var listData = {
            content: this.rewardContent,
            list: data.Rewards,
            prefab: this.rewardPrefab
        };
        uiManager.refreshView(listData);
        this.labelSprite.spriteFrame = this.labelList[this.switchIdx];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CUMULATIVE,this.switchIdx + 1);
        var monsterConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,config[jsonTables.CONFIG_CUMULATIVE.MoonsterID]);
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,monsterConfig[jsonTables.CONFIG_MONSTER.FamilyID]);
        var callBack = function(spineData){
            this.spine.skeletonData  = spineData;
            this.spine.setAnimation(0,'std',true);
        }.bind(this);
        var spineName = monsterConfig[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadSpine(spineName,callBack);
        this.monsterName.string = uiLang.getConfigTxt(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        this.spine.node.position = cc.v2(config[jsonTables.CONFIG_CUMULATIVE.Position][0],config[jsonTables.CONFIG_CUMULATIVE.Position][1]);
        this.spine.node.scale = config[jsonTables.CONFIG_CUMULATIVE.Scale];
        this.qualitySprite.spriteFrame = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality] === tb.MONSTER_A ? this.qualityFrame[0] : this.qualityFrame[1];
        this.bgSprite.spriteFrame = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality] === tb.MONSTER_A ? this.bgFrame[0] : this.bgFrame[1];
    },

    clickRec() {
        var actReward = this.cumulativeData.serverData.ActRewards;
        this.activityLogic.reqActivityRewardRec(this.cumulativeData.serverData.ID, actReward[this.switchIdx].Value);
    },

    openShop(){
        this.close();
        uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
    },

    update(dt) {
        this.updateTime+=dt;
        if(this.updateTime<1) return;
        this.updateTime = 0;
        //this.setFreeLeftTime();
        if(this.needUpdateLeft)
            this.setActLeftTime();
    }

});
