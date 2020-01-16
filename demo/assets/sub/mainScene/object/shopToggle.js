var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        label:cc.Label,
        choseBG:cc.Node,
        redDot:cc.Node,
    },

    onLoad:function(){
        jsonTables.parsePrefab(this);
        // var registerHandler = [
        //     [this.dataManager.DATA.ROLE_INFO, this.refreshHead.bind(this)],
        // ]
        // this.registerDataEvent(registerHandler);
    },
    // refreshHead:function(){
    //     this.redDot.active = this.userLogic.getRedValue(constant.RedDotEnum.Week) > 0 && this.type === constant.ShopType.MONCARD;
    // },
    init:function(idx,data){
        // cc.log(data);
        this.choseBG.active = false;
        this.type = data.type;
        // this.widget("shopToggle/zhDiamond").active = this.type === constant.ShopType.DIAMOND;
        // this.widget("shopToggle/zhCoin").active = this.type === constant.ShopType.GOLD;
        // this.widget("shopToggle/zhChest").active = this.type === constant.ShopType.BOX;

        this.label.string = uiLang.getMessage("shopPanel","ShopType" + data.type);
        this.redDot.active = false;
        if(data.idx === data.type){
            this.clickItem();
        }
    },
    clickItem:function(){
        this.choseBG.active = true;
        var data = {
            node:this.node,
            type:this.type
        }
        var ev = new cc.Event.EventCustom('clickItem', true);
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    // update (dt) {},
});
