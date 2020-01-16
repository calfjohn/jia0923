var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    open:function(){
        var costTime = this.userLogic.getBaseData(this.userLogic.Type.VitCD);
        costTime = this.timeLogic.getCommonStyle(costTime);
        var costStr = uiLang.getMessage(this.node.name,"vitTime");
        this.widget("vitInfo/contentNode/latticeFrame/words/word0/baseLabel3").getComponent(cc.Label).string = costStr.formatArray([costTime]);

        var count = this.userLogic.getBaseData(this.userLogic.Type.VitBuyTimes);//剩余购买次数
        var maxCount  = this.userLogic.getBaseData(this.userLogic.Type.VitBuyTimesLimit);//每日最大购买体力次数上限
        var vitCount = this.userLogic.getBaseData(this.userLogic.Type.BuyGetVit);
        var vitPrice = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.EnergyPrice);
        var havedCount = maxCount - count;//已经购买次数
        this.widget("vitInfo/contentNode/latticeFrame/words/word2/shareLabel5").getComponent(cc.Label).string = "X" + vitCount;
        this.widget("vitInfo/contentNode/latticeFrame/words/word2/shareLabel7").getComponent(cc.Label).string = "(" + count + "/" + maxCount + ")";
        this.widget("vitInfo/contentNode/button6/num").getComponent(cc.Label).string = vitPrice[havedCount];//--
        this.widget("vitInfo/contentNode/button6").getComponent(cc.Button).interactable = count > 0;

        var maxCount  = this.userLogic.getBaseData(this.userLogic.Type.VitShareMax);//每日最大购买体力次数上限
        var vitCount = this.userLogic.getBaseData(this.userLogic.Type.VitShareTimes);
        this.widget("vitInfo/contentNode/latticeFrame/words/word1/shareLabel3").getComponent(cc.Label).string = "(" +  (maxCount - vitCount) + "/" + maxCount + ")";
        var shareGet = this.userLogic.getBaseData(this.userLogic.Type.ShareGetVit);
        this.widget("vitInfo/contentNode/latticeFrame/words/word1/shareLabel1").getComponent(cc.Label).string = "X" + shareGet;
        this.widget("vitInfo/contentNode/button5").getComponent(cc.Button).interactable = this.shareLogic.isCanShare() && ((maxCount - vitCount) > 0 )
        // this.widget("vitInfo/contentNode/button5").getComponent(cc.Button).interactable = false;
    },

    share:function(){
        uiManager.openUI(uiManager.UIID.TIPMSG, "目前不支持此功能");
        return;
        this.shareLogic.share(tb.SHARELINK_ENERGY,0,function (isSucess) {
            if (isSucess) {
                this.shareLogic.req_Share(2);// NOTE: 通知服务器分享了
            }
        }.bind(this));
        this.close();
    },

    buyInfo:function(){
        this.userLogic.req_Vit_Buy();
        this.close();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
