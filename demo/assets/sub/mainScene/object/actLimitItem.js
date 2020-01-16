var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardItem: cc.Prefab,
        content: cc.Node,
        allCharacter: [cc.SpriteFrame],
        allBg: [cc.SpriteFrame],
        title: [cc.SpriteFrame],
        btnBg: [cc.SpriteFrame],
        dayLabel: cc.Node,
        hourLabel: cc.Node
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.updateTime = 0;
        this.actEnd = false;
        this.registerEvent();
    },

    init(idx){
        this.limitPackData = this.activityLogic.getLimitPackData();
        var listData = {
            content: this.content,
            list: this.limitPackData.serverData.ActRewards[idx].Rewards,
            prefab: this.rewardItem
        }
        this.curLimitGiftIndex = idx;
        uiManager.refreshView(listData);
        this.refreshBtn();
        this.setActLeftTime();
        this.initBg();
        this.widget("actLimitItem/timedSaleCn").getComponent(cc.Sprite).spriteFrame = uiLang.language === constant.LanguageType.CN?this.title[0]:this.title[1];
        if(this.limitPackData.serverData.ActRewards[idx].Desc){
            this.widget("actLimitItem/slogan").getComponent(cc.RichText).string = this.limitPackData.serverData.ActRewards[idx].Desc;
        }else{
            this.widget("actLimitItem/slogan").getComponent(cc.RichText).string = idx > 0?uiLang.getMessage("actLimitGift","sloganTwo"):uiLang.getMessage("actLimitGift","sloganOne");
        }
        if(Object.keys(this.shopLogic.shopData).length !== 0) this.initPrice();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshShop", this.initPrice.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    //根据后续上传图片资源，动态更换背景图,人物头像图
    initBg(){
        if(this.curLimitGiftIndex > this.allCharacter.length - 1) return;//超出已有资源，直接返回使用现有
        this.widget("actLimitItem/bg").getComponent(cc.Sprite).spriteFrame = this.allBg[0];
        this.widget("actLimitItem/character").getComponent(cc.Sprite).spriteFrame = this.allCharacter[this.curLimitGiftIndex];
    },

    initPrice:function(){
        var giftShopData = this.activityLogic.getGiftShopData(this.limitPackData.serverData.ActRewards[this.curLimitGiftIndex].Value);

        if(!giftShopData) return;
        this.widget("actLimitItem/btn1/label1").getComponent(cc.Label).string = uiLang.getCurAreaPrice(giftShopData);
    },

    refreshBtn:function(){
        this.widget("actLimitItem/btn1").getComponent(cc.Sprite).spriteFrame = this.limitPackData.userData.LimitGiftTimes[this.curLimitGiftIndex] < this.limitPackData.serverData.ActRewards[this.curLimitGiftIndex].BuyLimit ? this.btnBg[0]:this.btnBg[1];
        var num = this.limitPackData.serverData.ActRewards[this.curLimitGiftIndex].BuyLimit - this.limitPackData.userData.LimitGiftTimes[this.curLimitGiftIndex];
        num = num < 0?0:num;
        this.widget("actLimitItem/frequency").getComponent(cc.Label).string =  uiLang.getMessage("actLimitGift", "frequency").formatArray([num, this.limitPackData.serverData.ActRewards[this.curLimitGiftIndex].BuyLimit]);
    },

    setActLeftTime: function () {
        var endTime = this.limitPackData.serverData.EndTime.toNumber();
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
            this.widget("actLimitItem/btn1").getComponent(cc.Sprite).spriteFrame = this.btnBg[1];
            timeList = uiLang.getMessage("mainSceneUI","out");
        }
        this.dayLabel.active = !this.limitUpdateLeft;
        this.hourLabel.parent.active = this.limitUpdateLeft;
        this.dayLabel.getComponent(cc.Label).string = timeList;
        this.hourLabel.getComponent(cc.Label).string = timeList;
    },

    closeParent:function(){
        uiManager.closeUI(uiManager.UIID.ACT_LIMIT_PACK);
        uiManager.callUiFunc(uiManager.UIID.ACT_LIMIT_PACK, "closeEvent", []);
    },

    clickBuy: function(){
        if(this.actEnd){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("actLimitGift","endTip"));
            return;
        }
        if(this.limitPackData.userData.LimitGiftTimes[this.curLimitGiftIndex] >= this.limitPackData.serverData.ActRewards[this.curLimitGiftIndex].BuyLimit){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("actLimitGift","tip"));
            return;
        }
        if(cc.sys.isBrowser && window.FBInstant) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("sellItem","iosError"));
            return;
        }
        var giftInfo = this.limitPackData.serverData.ActRewards;
        var shopID = giftInfo[this.curLimitGiftIndex].Value;
        if (!CC_DEV) {
            var shopData = this.activityLogic.getGiftShopData(shopID);
            this.shopLogic.checkBuy(shopData);
        }
        else {
            this.shopLogic.req_Shop_Buy(shopID,1);
        }
    },

    update:function(dt){
        if(!this.limitUpdateLeft) return;
        this.updateTime += dt;
        if(this.updateTime < 0) return;
        this.updateTime = 0;
        this.setActLeftTime();
    }

});
