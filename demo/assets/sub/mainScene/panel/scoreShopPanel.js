var panel = require("panel");
var toggleHelper = require("toggleHelper");

cc.Class({
    extends: panel,

    properties: {
        scorePrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        jsonTables.parsePrefab(this);
    },

    open:function(idx) {
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SHOPOPEN);
        this.shopLogic.req_ScoreShop_Update(0);
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshScoreShop", this.refreshScoreShop.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    //刷新积分商店
    refreshScoreShop:function (data) {
        this.scoreTime = data.NextRefreshTime.toNumber();
        this.refreshScoreTime();
        this.widget("scoreShopPanel/shrink/treasureChest1/pointPage/score/number").getComponent(cc.Label).string = data.ShopScore;
        this.freshCost = data.ScoreShopUpPrice;// 积分商店刷新消耗钻石
        var list = [];
        for (var i = 0 , len = data.Price.length; i < len; i++) {
            if(i >= 5){
                cc.error("数量给多了，麻烦检查一下积分商店配置表")
                break;
            }
            var info = {
                Price:data.Price[i],
                Goods:data.Goods[i],
                State:data.State[i],
            }
            list.push(info);
        }
        var refreshData = {
            content:this.widget('scoreShopPanel/shrink/treasureChest1/pointPage/content'),
            list:list,
            prefab:this.scorePrefab
        }
        uiManager.refreshView(refreshData);
    },

    refreshScoreByCost:function () {
        var callback = function () {
            if(this.userLogic.getBaseData(this.userLogic.Type.Diamond) < this.freshCost){
                uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("errorcode","errorcode3"));
                return;
            }
            this.shopLogic.req_ScoreShop_Update(1);
        }.bind(this);
        var str = uiLang.getMessage("shopPanel","refreshCost") + this.freshCost + " " + rText.getMsgCurrency(constant.Currency.DIAMOND);
        uiManager.msgDefault(str,callback.bind(this));
    },

    refreshScoreTime:function () {
        if(!this.scoreTime) return;
        var offTime = this.scoreTime - this.timeLogic.now();
        var str = "";
        if(offTime > 0){
            str = this.timeLogic.getCommonCoolTime(offTime);
        }else{
            this.shopLogic.req_ScoreShop_Update(0);
        }
        this.widget("scoreShopPanel/shrink/treasureChest1/pointPage/bgRemainTime/time").getComponent(cc.Label).string = str;
    },

    update:function (dt) {
        this.time += dt;
        if(this.time < 1)   return;
        this.time --;
        this.refreshScoreTime();
    },
    // update (dt) {},
});
