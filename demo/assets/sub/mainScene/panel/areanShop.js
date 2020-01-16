var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        itemContent:cc.Node,
        itemPrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        jsonTables.parsePrefab(this);
        this.dayLabel = this.widget("areanShop/in/ui/refreshTimer/label1").getComponent(cc.Label);
        this.hourLabel = this.widget("areanShop/in/ui/refreshTimer/label2").getComponent(cc.Label);
        this.minLabel = this.widget("areanShop/in/ui/refreshTimer/label3").getComponent(cc.Label);
        this.secondLabel = this.widget("areanShop/in/ui/refreshTimer/label5/label5").getComponent(cc.Label);
    },
    open:function(idx) {
        this.countDown = 0;
        this.areanLogic.req_Honor_Shop();
    },
    registerEvent: function () {
        var registerHandler = [
            ["areanShopRefresh", this.areanShopRefresh.bind(this)],
            ["buyHonorSuccess", this.refreshMyHonor.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    areanShopRefresh:function(data){
        // this.widget("areanShop/in/ui/currentlyOwned/label5").getComponent(cc.Label).string = this.areanLogic.getMyHonor();
        // this.widget("areanShop/in/ui/shopToggle/label7").getComponent(cc.Label).string = this.areanLogic.getDailyHonor() + "/" + this.areanLogic.getDailyHonorMax();
        this.countDown = data.NextRefreshTime - this.timeLogic.now();
        this.min = -1;
        this.time = 0;
        this.refreshTime();
        var shopData = [];
        for (var i = 0 , len = data.ItemID.length; i < len; i++) {
            var obj = data.ItemID[i];
            var info = {};
            info.ShopID = obj;
            info.Price = data.Price[i];
            info.BuyTimes = data.BuyTimes[i];
            info.Limit = data.Limit[i];
            info.Items = data.Items[i];
            shopData.push(info);
        }
        var refreshData = {
            content:this.itemContent,
            list:shopData,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },
    refreshMyHonor:function () {
        // this.widget("areanShop/in/ui/currentlyOwned/label5").getComponent(cc.Label).string = this.areanLogic.getMyHonor();
    },
    //刷新时间文本
    refreshTime:function () {
        if(this.countDown < 0)  return;
        var day = Math.floor(this.countDown / 86400);
        var hour = Math.floor((this.countDown - day * 86400) / 3600);
        var min = Math.ceil((this.countDown - day*86400 - hour*3600)/60);
        var sencond = Math.floor(this.countDown % 60);
        if(day !== Number(this.dayLabel.string)){
            this.dayLabel.string = day;
        }
        if(hour !== Number(this.hourLabel.string)){
            this.hourLabel.string = hour;
        }
        if(min !== Number(this.minLabel.string)){
            this.minLabel.string = min;
        }
        this.secondLabel.string = sencond;
        this.widget("areanShop/in/ui/refreshTimer/label1").active = day > 0;
        this.widget("areanShop/in/ui/refreshTimer/dayLabel").active = day > 0;
        this.widget("areanShop/in/ui/refreshTimer/label2").active = hour > 0;
        this.widget("areanShop/in/ui/refreshTimer/hourLabel").active = hour > 0;
        this.widget("areanShop/in/ui/refreshTimer/label3").active = day === 0 && min > 0;
        this.widget("areanShop/in/ui/refreshTimer/minuteLabel").active = day === 0 && min > 0;
        this.widget("areanShop/in/ui/refreshTimer/label5").active = day === 0 && hour === 0;
        this.widget("areanShop/in/ui/refreshTimer/secondLabel").active = day === 0 && hour === 0;
    },

    update:function (dt) {
        if(this.countDown <= 0) return;
        this.time -= dt;
        if(this.time > 0)   return;
        this.time ++;
        this.countDown --;
        this.refreshTime();
    },

});
