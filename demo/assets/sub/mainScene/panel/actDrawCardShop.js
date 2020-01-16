var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content: cc.Node,
        diamondNum: cc.Label,
        cardNum: cc.Label,
        shopItem: cc.Prefab
    },

    onLoad () {
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshShop", this.initCardPrice.bind(this)],
            ["refreshActData", this.open.bind(this)]
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.initCardNum.bind(this)],
        ]
        this.registerDataEvent(registerHandler);
    },

    open (isOpen) {
        this.drawCardData = this.activityLogic.getDrawCardData();

        if(Object.keys(this.shopLogic.shopData).length === 0) {
            this.shopLogic.req_Shop_Info();
        }
        this.initCardNum();

        this.initCardContent(isOpen);

        this.initCardPrice();
    },

    //初始化货币显示
    initCardNum() {
        var curDiamond = this.userLogic.getBaseData(this.userLogic.Type.Diamond);

        var itemId = uiManager.getUI(uiManager.UIID.ACT_DRAWCARD, "getTicketData").getTicketData();
        var ticket = this.userLogic.getItemByID(itemId);

        this.diamondNum.string = curDiamond;

        this.cardNum.string = ticket ? ticket.num : 0;
    },

    //初始化商品
    initCardContent(isOpen) {
        var shopList = this.drawCardData.serverData.Shop;
        var limitDrawShopTimes  = this.drawCardData.userData.limitDrawShopTimes;
        for (var i = 0; i < shopList.length; i++) {
            let obj = shopList[i];
            let shopId = obj.ID;
            let buyTimes = obj.Limit;
            for (let j = 0; j < limitDrawShopTimes.length; j++) {
                let obj1 = limitDrawShopTimes[j];
                let drawShopId = Math.floor(obj1 / 1000);
                if(shopId !== drawShopId) continue;
                buyTimes = obj.Limit - obj1 % 1000;
                break;
            }
            obj.buyTimes = buyTimes;
        }


        var refreshData = {
            content:this.content,
            list:shopList,
            prefab:this.shopItem,
            ext:isOpen
        }
        uiManager.refreshView(refreshData);

        // for(let i = 0; i < shopList.length; i++){
        //     if(shopList[i].ID === 301 && shopList[i].buyTimes === 0 ){
        //         shopList.splice(i,1);

        //         // this.content.getComponent(cc.Layout).spacingX = 40;
        //         break;
        //     }
        // }
    },

    //初始化商品价格
    initCardPrice() {
        for (var i = 0; i < this.content.children.length; i++) {
            var obj = this.content.children[i];
            if(!obj.active) continue;
            var item = obj.getComponent("actDrawCardShopItem");
            item.setPrice();
        }
    },

    goShop(){
        uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
    }
});
