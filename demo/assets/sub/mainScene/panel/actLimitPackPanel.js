var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        leftBtn: cc.Button,
        rightBtn: cc.Button,
        content: cc.Node,
        page: cc.PageView,
        pageItem: cc.Prefab
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.index = 0;
        this.tempIndex = 0;
        this.registerEvent();
        this.first = true;
    },

    open(isBig,callback){
        this.callback = callback?callback:function () {};
        this.limitPackData = this.activityLogic.getLimitPackData();
        if(Object.keys(this.shopLogic.shopData).length === 0) {
            this.shopLogic.req_Shop_Info();
        }
        this.initReward();

        if(isBig){
            this.widget("actLimitPackPanel/shrink/pack").setScale(0);
            this.leftBtn.node.active = false;
            this.rightBtn.node.active = false;
            var toBig = cc.scaleTo(0.2,1);
            var fun = cc.callFunc(function(){
                this.page.enabled = this.limitPackData.userData.LimitGiftTimes.length > 1;
            },this);
            var squ = cc.sequence(toBig,fun);
            this.widget("actLimitPackPanel/shrink/pack").runAction(squ);
        }

        this.scheduleOnce(function() {
            // var maxFrequency = this.limitPackData.serverData.BuyLimit;
            for(let i = 0; i < this.limitPackData.userData.LimitGiftTimes.length; i++){
                if(this.limitPackData.userData.LimitGiftTimes[i] < this.limitPackData.serverData.ActRewards[i].BuyLimit){
                    this.first = false
                    this.index = i;
                    this.content.getComponent("pageScroll").scrollToPage(this.index);
                    break;
                }
            }
            this.initBtn();
            if(this.first) this.randomPage();
        }, 0)
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshActData", this.refreshState.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    initBtn:function (){
        this.leftBtn.node.active = this.index > 0;
        this.rightBtn.node.active = this.index < this.limitPackData.userData.LimitGiftTimes.length - 1;
    },

    //第一次进入界面，随机选一个界面给他看
    randomPage:function(){
        this.first = false;
        var randPage = Math.floor(Math.random() * this.limitPackData.userData.LimitGiftTimes.length);
        this.index = randPage;
        this.content.getComponent("pageScroll").scrollToPage(1);
    },


    clickLeft:function(){
        this.index --;
        // if(this.index < 0)
        //     this.index = this.limitPackData.userData.LimitGiftTimes.length - 1;
        this.content.getComponent("pageScroll").scrollToPage(this.index);
    },

    clickRight:function(){
        this.index ++;
        // if(this.index > this.limitPackData.userData.LimitGiftTimes.length - 1)
        //     this.index = 0;
        this.content.getComponent("pageScroll").scrollToPage(this.index);
    },

    refreshState:function(){
        this.initReward();
        this.refreshBtn();
    },

    //刷新item
    initReward(){
        var rewardList = this.limitPackData.serverData.ActRewards;
        this.content.getComponent("pageScroll").initList(rewardList, this.pageItem);
    },


    //刷新按钮状态以及
    refreshBtn:function(){
        this.index = this.page.getCurrentPageIndex();
        this.leftBtn.node.active = this.index > 0;
        this.rightBtn.node.active = this.index < this.limitPackData.userData.LimitGiftTimes.length - 1;
    },

    closeTest:function(){
        uiManager.closeUI(uiManager.UIID.ACT_LIMIT_PACK);
    },

    closeEvent:function () {
        if(this.callback){
            this.callback();
        }
        this.close();
    },

});
