var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        contentPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshMystic", this.refreshMysticEx.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickShop", this.clickShop.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    clickShop:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if (data.isBuyFlag) return;
        if (this.shopID === data.goodID) return;
        this.shopID = data.goodID;
        // this.refershBtn(data);
        this.refreshMystic();
        this.refreshDesc(data.good);
    },

    refreshDesc:function (item) {
        var descID = 0;
        if(item.Type === constant.ItemType.HERO){
            descID = jsonTables.getGameBaseValue("MysteryFragment");
        }else if(item.Type === constant.ItemType.REEL){
            var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,item.BaseID);//装备配置表基本数据
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
            var quality = config[jsonTables.CONFIG_MONSTER.Form];
            descID = jsonTables.getGameBaseValue("MysteryReel")[quality - 3];
        }
        this.widget("mysticalProfiteers/shrink/chatBubble").active = true;
        this.widget("mysticalProfiteers/shrink/contentLabel").active = true;
        this.widget("mysticalProfiteers/shrink/contentLabel").getComponent(cc.Label).string = uiLang.getConfigTxt(descID);
    },

    // refershBtn:function(data){
    //     this.widget("mysticalProfiteers/shrink/money").active = !!data;
    //     if (data) {
    //         uiResMgr.loadCurrencyIcon(data.price.Type,this.widget("mysticalProfiteers/shrink/money/iconCoin"));
    //         this.widget("mysticalProfiteers/shrink/money/label").getComponent(cc.Label).string = data.price.Num;
    //     }
    // },

    close:function(){
        this.chapterLogic.req_Leave_MysticStore();
    },

    refreshMysticEx:function () {
        this.shopID = 0;
        this.refreshMystic();
    },

    refreshMystic:function(){
        this.widget("mysticalProfiteers/shrink/chatBubble").active = false;
        this.widget("mysticalProfiteers/shrink/contentLabel").active = false;
        var info = this.chapterLogic.getMysticShop();
        var refreshData = {
            content:this.widget("mysticalProfiteers/shrink/content"),
            list:info,
            prefab:this.contentPrefab,
            ext:this.shopID
        }
        uiManager.refreshView(refreshData);
    },

    buyBtn:function(){
        if (this.shopID === 0) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"noShopID"));
        }
        this.chapterLogic.req_Buy_MysticStore(this.shopID);
        this.shopID = 0;
        this.widget("mysticalProfiteers/shrink/chatBubble").active = false;
        this.widget("mysticalProfiteers/shrink/contentLabel").active = false;
        this.widget("mysticalProfiteers/shrink/contentLabel").getComponent(cc.Label).string = "";
    },

    open:function(id,chapterID,nodeID){
        this.shopID = 0;
        this.chapterLogic.req_MysticStore(id,chapterID,nodeID);
        this.widget("mysticalProfiteers/shrink/chatBubble").active = false;
        this.widget("mysticalProfiteers/shrink/contentLabel").active = false;
        this.widget("mysticalProfiteers/shrink/contentLabel").getComponent(cc.Label).string = "";
        // this.refershBtn();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
