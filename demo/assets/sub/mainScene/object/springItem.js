var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        limitLabel:cc.Label,

        btn:cc.Button,
        btnLabel:cc.Label,
        rewardNode:cc.Node,
        content:cc.Node,
        prefab:cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init (idx,data) {
        this.data = data;
        var exchangeNum =this.data.Limit - this.activityLogic.getExchangeNum(data.ExchangeID);//剩几次兑换机会
        this.limitLabel.string = exchangeNum + "/" + this.data.Limit;
        var canExchange = true;
        for (var j = 0 , len = data.Cost.length; j < len; j++) {
            var obj = data.Cost[j];
            var haveNum = this.userLogic.getItemNumByID(obj.BaseID);
            if(haveNum < obj.Num){
                canExchange = false;
                break;
            }
        }
        this.btn.interactable = exchangeNum > 0 && canExchange;
        this.btnLabel.string = exchangeNum > 0 ? uiLang.getMessage("actSpringExchange","exchange") : uiLang.getMessage("actSpringExchange","exchanged");
        this.rewardNode.getComponent("rewardItem").init(0,data.Reward);
        var refreshData = {
            content:this.content,
            list:data.Cost,
            prefab:this.prefab,
            ext:data.Cost.length
        }
        uiManager.refreshView(refreshData);
    },

    clickExchange(){
        this.activityLogic.req_Exchange_Item(this.data.ExchangeID);
    },
    // update (dt) {},
});
