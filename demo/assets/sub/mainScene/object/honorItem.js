var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardItem:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    init:function(idx,data){
        this.data = data;
        this.widget("honorItem/button1").getComponent(cc.Button).interactable = data.BuyTimes > 0;
        this.widget("honorItem/button1/content/label").getComponent(cc.Label).string = NP.dealNum(data.Price,constant.NumType.TEN);//
        this.widget("honorItem/labelContent/label2").getComponent(cc.Label).string = data.BuyTimes+"/"+data.Limit;
        var node = this.widget("honorItem/reelFrame").getInstance(this.rewardItem,true);
        node.getComponent(this.rewardItem.name).init(-1,data.Items);
    },
    registerEvent: function () {
        var registerHandler = [
            ["buyHonorSuccess", this.buyHonorSuccess.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    buyHonorSuccess:function (itemID,buyTimes) {
        if(itemID !== this.data.ShopID) return;
        this.data.BuyTimes = buyTimes;
        this.widget("honorItem/button1").getComponent(cc.Button).interactable = this.data.BuyTimes > 0;
        this.widget("honorItem/labelContent/label2").getComponent(cc.Label).string = this.data.BuyTimes+"/"+this.data.Limit;
    },
    clickEvent:function(){
        var msg;
        if(!this.data.BuyTimes){
            msg = uiLang.getMessage("errorcode","errorcode109");
        }else if(this.data.Price > this.userLogic.getBaseData(this.userLogic.Type.Gold)){
            msg = uiLang.getMessage("areanShop","honorUn");
        }
        if(msg){
            uiManager.openUI(uiManager.UIID.TIPMSG, msg);
            return;
        }
        this.areanLogic.req_Honor_Buy(this.data.ShopID,this.data.Items.Type,this.data.Items.BaseID);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
