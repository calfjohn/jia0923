var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        costIcon: [cc.Node],
        costNum: [cc.Label],
        particalNode: cc.Node,
        particalComp: cc.ParticleSystem,
        particalStartColor: [cc.Color],
        particalEndColor: [cc.Color],
        actBtn:cc.Node,

        scoreShopNode:cc.Node,

        freeBtn:cc.Button,
        freeLabel:cc.Label,

        btnCostNode:cc.Node,
        btnFreeNode:cc.Node,
        btnFreeLabel:cc.Label,
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.anim = this.node.getComponent(cc.Animation);
        this.time = 0;
        this.timeNum = 0;
    },

    registerEvent: function () {
        this.registerClientEvent("refeshDrawFree", this.refeshDrawFree.bind(this));
        this.registerClientEvent("refreshShop", this.initShopDraw.bind(this));
    },


    openActDraw(){
        uiManager.closeUI(uiManager.UIID.DRAW_EQUIP);
        setTimeout(function () {
            uiManager.openUI(uiManager.UIID.DRAW_CARD);
        }.bind(this),50)
    },

    refeshDrawFree(){
        var data = this.shopLogic.getFreeDrawData();
        this.time = 0;
        this.freeBtn.interactable = data.DrawEquipNormalFree > 0;
        if(data.DrawEquipNormalFree > 0){
            var num = data.DrawEquipNormalFreeDailyNum + data.DrawEquipNormalFree;
            this.freeLabel.string = uiLang.getMessage("drawCardPanel","free") +  num + uiLang.getMessage("drawCardPanel","count");
        }else{
            this.time = data.DrawEquipNormalFreeNext - this.timeLogic.now();
            this.freeLabel.string = this.timeLogic.getCommon1CoolTime(this.time);
        }
        if(this.time <= 0 && data.DrawEquipNormalFreeNext === 0){
            this.freeLabel.string = uiLang.getMessage("drawCardPanel","free") +  0 + uiLang.getMessage("drawCardPanel","count");
        }
        this.btnCostNode.active = data.DrawEquipHighFree === 0;
        this.btnFreeNode.active = data.DrawEquipHighFree > 0;
        this.btnFreeLabel.string = uiLang.getMessage("drawCardPanel","free") + data.DrawEquipHighFree + uiLang.getMessage("drawCardPanel","count");
    },
    update:function (dt) {
        if(this.time <= 0)  return;
        this.timeNum += dt;
        if(this.timeNum >= 1){
            this.timeNum -= 1;
            this.time -= 1;
            this.freeLabel.string = this.timeLogic.getCommon1CoolTime(this.time);
        }
    },

    open (isShowAct) {
        this.refeshDrawFree();
        // this.actBtn.active = !!isShowAct;
        if(Object.keys(this.shopLogic.shopData).length === 0) {
            this.shopLogic.req_Shop_Info();
        }
        this.initShopDraw();
        this.scoreShopNode.active = false;
    },

    initShopDraw() {
        this.shopData = this.shopLogic.getShopDataByType(constant.ShopType.EQUIPBOX);
        if(!this.shopData) return;

        for (var i = 0; i < this.shopData.length; i++) {
            var obj = this.shopData[i];
            var price = obj.DiscountPrice?obj.DiscountPrice:obj.Price;
            if(i){
                this.costNum[i].getComponent(cc.Label).string = price/100;
                uiResMgr.loadCommonIcon(uiResMgr.getCurrencyName(obj.CurrencyType),this.costIcon[i]);
            }
        }
    },

    //播放奖励动画
    showDrawCardAnim(rewards) {
        this.userLogic.setCanPlayUpLvAni(true);//不允许弹升级动画
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SUMMON);

        this.particalComp.resetSystem();
        this.particalComp.startColor = this.particalStartColor[this.drawIdx];
        this.particalComp.endColor = this.particalEndColor[this.drawIdx];

        var animName = this.anim.getClips()[this.drawIdx+1].name;
        var state = this.anim.play(animName);
        var callback = function () {
            this.anim.play(this.anim.getClips()[0].name);
            this.mailLogic.setIsInOpenBossBox(false);
        }.bind(this);
        var callback1 = function () {
            uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_REWARD,constant.DrawCardSrcEnum.ShopDrawEquip,rewards,[],callback,this.monQuality);
        };
        state.once(constant.AnimationState.FINISHED, callback1, this);
    },

    //设置抽卡按钮是否可点
    setCannotDraw: function (cannotDraw) {
        this.cannotDraw = cannotDraw;
    },

    openUi:function(_,param){
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },

    clickDraw(event, cusData) {
        if(this.cannotDraw) return;

        this.drawIdx = parseInt(cusData);

        var curDiamond = this.userLogic.getBaseData(this.userLogic.Type.Diamond);
        var shopData = this.shopData[this.drawIdx];
        var price = shopData.DiscountPrice?shopData.DiscountPrice / 100:shopData.Price / 100;
        var data = this.shopLogic.getFreeDrawData();
        if(!(cusData === "1" && data.DrawEquipHighFree > 0) && curDiamond < price) {
            uiManager.tipDiamondLess();
            return;
        }

        this.monQuality = tb.MONSTER_A;
        if(this.drawIdx === 1){
            this.monQuality = tb.MONSTER_S;
        }else if(this.drawIdx === 2){
            this.monQuality = tb.MONSTER_S;
        }

        this.shopLogic.req_Shop_Buy(this.shopData[this.drawIdx].ShopID,1);

        this.setCannotDraw(true);
    },

});
