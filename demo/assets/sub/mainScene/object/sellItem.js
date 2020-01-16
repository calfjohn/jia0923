var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        bgSprite:[cc.SpriteFrame],
        qualitySp:[cc.SpriteFrame]
    },

    onLoad:function(){
        jsonTables.parsePrefab(this);
    },
    init:function(idx,data){
        this.data = data;
        var quality = data.Quality;
        var spriteIdx = 0;
        this.widget("sellItem/icon").getComponent(cc.Button).interactable = data.ShopType === constant.ShopType.BOX;
        this.widget("sellItem/words").active = data.ShopType === constant.ShopType.BOX;
        if (this.widget("sellItem/words").active) {
            this.widget("sellItem/words/letterForm3").getComponent(cc.Sprite).spriteFrame = this.qualitySp[idx];
        }
        switch (data.ShopType) {
            case constant.ShopType.BOX:
                spriteIdx = idx;
                uiResMgr.loadLockTreasureBox(data.Icon, this.widget("sellItem/icon"));
                this.widget("sellItem/numberLabel").active = false;
                break;
            case constant.ShopType.EQUIP:
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,data.Items.BaseID);//装备配置表基本数据
                uiResMgr.loadEquipIcon(baseData[jsonTables.CONFIG_EQUIP.Icon], this.widget("sellItem/icon"));
                quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];

                // this.widget("sellItem/frame1").active = true;
                this.widget("sellItem/numberLabel").active = false;
                break;
            default:
                this.widget("sellItem/numberLabel").active = true;
                if(data.Items.Num > 10000)
                    this.widget("sellItem/numberLabel").getComponent(cc.Label).string = "x" + NP.dealNum(data.Items.Num,constant.NumType.TEN);
                else
                    this.widget("sellItem/numberLabel").getComponent(cc.Label).string = "x" + data.Items.Num;
                uiResMgr.loadShopIcon(data.Icon, this.widget("sellItem/icon"));
        }
        spriteIdx = spriteIdx >= this.bgSprite.length ? this.bgSprite.length -1:spriteIdx;
        if (data.ShopType === constant.ShopType.GOLD) {
            spriteIdx = this.bgSprite.length -1;
        }
        this.widget("sellItem/floor9").getComponent(cc.Sprite).spriteFrame = this.bgSprite[spriteIdx];

        uiResMgr.loadBaseQualityIcon(quality,this.widget("sellItem/frame"));
        uiResMgr.loadQualityIcon(quality,this.widget("sellItem/frame1"));
        this.widget("sellItem/label").getComponent(cc.Label).string =  uiLang.getConfigTxt(data.NameID);
        var price = data.DiscountPrice?data.DiscountPrice:data.Price;
        this.widget("sellItem/button1/content/label").getComponent(cc.Label).string = price/100;
        uiResMgr.loadCommonIcon(uiResMgr.getCurrencyName(data.CurrencyType),this.widget("sellItem/button1/content/icon"));
        // this.widget("sellItem/frame1").setContentSize(cc.size(100,100));
        // this.widget("sellItem/frame1").setContentSize(this.frameSize);
    },
    clickItem:function(){
        switch (this.data.ShopType) {
            case constant.ShopType.DIAMOND:
                if(cc.sys.isBrowser && window.FBInstant) {
                    uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"iosError"));
                    return;
                }
                if (!CC_DEV) {
                    this.shopLogic.req_PayOrder(this.data.ShopID,uiLang.getConfigTxt(this.data.NameID),this.data.RMB);
                    break;
                }
            default:
                this.shopLogic.req_Shop_Buy(this.data.ShopID,1);
        }
    },

    clickBox:function(){
        // uiManager.openUI(uiManager.UIID.SHOP_TREASURE,this.data.Items.BaseID,this.data.NameID,this.data.Icon);
    },

    // update (dt) {},
});
