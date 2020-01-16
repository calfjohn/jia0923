var panel = require("panel");
var toggleHelper = require("toggleHelper");

cc.Class({
    extends: panel,

    properties: {
        toggleItem:cc.Prefab,
        miniContent:cc.Prefab,
        shopRechargePrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        jsonTables.parsePrefab(this);
        this.rowNum = 3;
        this.pageScollScript = this.widget('shopPanel/shrink/treasureChest1/floor8/pageView').getComponent("pageScroll");
    },

    open:function(idx) {
        this.updateEnable = false;
        this.time = 0;
        var showList = [
            constant.ShopType.DIAMOND,
            constant.ShopType.GOLD
        ]
        this.refreshPageView = true;
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SHOPOPEN);
        if(!idx && !this.activityLogic.checkDiamonOpen()){
            this.swichIdx = constant.ShopType.DIAMOND;
        }else{
            this.swichIdx = (idx && kf.inArray(showList, idx)) ? idx : constant.ShopType.GOLD;
        }
        this.lastToggle = undefined;
        if(!this.shopLogic.getShopDataByType(this.swichIdx)){
            this.resetBannarList();
            this.refreshPageView = true;
            this.shopLogic.req_Shop_Info();
        }else{
            this.refreshShop();
        }
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshShop", this.refreshDiamond.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    refreshDiamond: function () {
        this.refreshShop();
        this.refreshContent();
    },

    refreshShop:function(){
        var data = this.shopLogic.getShopData();
        var keys = Object.keys(data);
        keys.sort(this._sort);
        var list = [];
        for (var i = 0 , len = keys.length; i < len; i++) {
            if(Number(keys[i]) === constant.ShopType.MONCARD || Number(keys[i]) === constant.ShopType.ACTIVITY || Number(keys[i]) === constant.ShopType.BOX || Number(keys[i]) === constant.ShopType.NEWBOX || Number(keys[i]) === constant.ShopType.EQUIPBOX)   continue;//屏蔽月卡和活动相关购买
            var info = {
                type:Number(keys[i]),
                idx:this.swichIdx
            }
            if (info.type === constant.ShopType.DIAMOND) {
                list.unshift(info);
            }else {
                list.push(info);
            }
        }
        // if(this.userLogic.isScoreShopOpen()){
        //     list.push({
        //         type:constant.ShopType.SCORE,
        //         idx:this.swichIdx
        //     });
        // }
        var refreshData = {
               content:this.widget('shopPanel/shrink/treasureChest1/toggleContent'),
               list:list,
               prefab:this.toggleItem
        }
        uiManager.refreshView(refreshData);
        this.resetBannarList();
    },

    resetBannarList:function(){
        if (!this.refreshPageView) return;
        this.refreshPageView = false;

        var bannarList = this.shopLogic.getBannarList();
        //this.pageScollScript.initList(bannarList);
    },

    _sort:function(a,b){
        return  a.ShopType - b.ShopType;
    },

    refreshContent:function(){
        if(this.swichIdx === constant.ShopType.DIAMOND && this.activityLogic.checkDiamonOpen()){
            this.close();
            uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
            return;
        }
        this.widget("shopPanel/shrink/treasureChest1/frame2").active = this.swichIdx === constant.ShopType.DIAMOND;
        this.widget("shopPanel/shrink/treasureChest1/scrollView").active = this.swichIdx === constant.ShopType.GOLD || this.swichIdx === constant.ShopType.BOX;
        // this.widget("shopPanel/shrink/treasureChest1/pointPage").active = this.swichIdx === constant.ShopType.SCORE;
        var data =  this.shopLogic.getShopDataByType(this.swichIdx);
        if (this.widget("shopPanel/shrink/treasureChest1/scrollView").active) {
            this.sortAndDeal(data);
        }else if(this.widget("shopPanel/shrink/treasureChest1/frame2").active){
            this.refreshDiamondList(data);
        }
    },

    refreshDiamondList:function(data){
        if(!this.userLogic.isSingularUid()){
            data.sort(function (a,b) {
                if(b.ExtraReward.Num === b.Items.Num)   return 1;
                if(a.ExtraReward.Num === a.Items.Num)   return -1;
                return a.ShopID - b.ShopID;
            })
        }
        var refreshData = {
            content:this.widget('shopPanel/shrink/treasureChest1/frame2/scrollView/view/content'),
            list:data,
            prefab:this.shopRechargePrefab
        }
        uiManager.refreshView(refreshData);
    },

    //排序并处理成3个一个的数组
    sortAndDeal:function(arr){
        var num = 0;
        var data = [];
        var dataChild = [];
        for (var i = 0 , len = arr.length; i < len; i++) {
            var obj = arr[i];
            dataChild.push(obj);
            num ++;
            if(num === this.rowNum || i === len - 1){
                num = 0;
                data.push(dataChild);
                dataChild = [];
            }
        }
        var viewData = {
            totalCount:data.length,
            spacing:0
        };
        var prefab = this.miniContent;
        this.widget("shopPanel/shrink/treasureChest1/scrollView").getComponent("listView").init(prefab,viewData,data);
    },
    clickItem:function(event){
        event.stopPropagation()
        var data = event.getUserData();
        if(data.type === this.swichIdx && this.lastToggle) return;
        if(this.lastToggle){
            this.lastToggle.getChildByName("checkmark").active = false;
        }
        this.lastToggle = data.node;
        this.swichIdx = data.type;
        this.refreshContent();
    },


    openUi:function(_,param){
        if(!uiManager.getUIActive(uiManager.UIID.DRAW_CARD)){
            uiManager.openUI(Number(param));
        }
        this.close();
    },
    // update (dt) {},
});
