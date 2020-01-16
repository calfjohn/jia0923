var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        chargeBtn: cc.Node,
        gift: [cc.Node],
        bgFrame: [cc.SpriteFrame],
        showFormIdx: [cc.Integer],
        spineScale: [cc.Float]
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent () {
        this.registerClientEvent("refreshActData", this.refreshActData.bind(this));
    },

    //领到了首充奖励
    refreshActData: function () {
        var firstChargeData = this.activityLogic.getFirstChargeData();
        if(firstChargeData.userData.firstChargeTag === constant.RecState.DONE)
            this.close();
    },

    open () {
        this.firstChargeData = this.activityLogic.getFirstChargeData();
        this.initBtn();
        this.clientEvent.dispatchEvent("refreshFirstChargePoint");
    },

    //初始化数据
    initBtn: function () {
        var firstChargeTag = this.firstChargeData.userData.firstChargeTag;
        this.chargeBtn.active = firstChargeTag === constant.RecState.CANT;
        for (var i = 0; i < this.gift.length; i++) {
            var obj = this.gift[i];
            this.setRewardInfo(obj, this.firstChargeData.serverData.ActRewards[i],i);
        }
    },

    //设置具体奖励
    setRewardInfo: function (node, data,idx) {
        var firstChargeTag = this.firstChargeData.userData.firstChargeTag;
        var btn = cc.find("plate/btnChoose", node).getComponent(cc.Button);
        btn.interactable = firstChargeTag === constant.RecState.CAN;
        var goldNum = cc.find("plate/reward1/number", node).getComponent(cc.Label);
        var goldIcon = cc.find("plate/reward1/gold", node);
        var diamondNum = cc.find("plate/reward2/number", node).getComponent(cc.Label);
        var diamondIcon = cc.find("plate/reward2/diamond", node);
        var expNum = cc.find("plate/reward3/number", node).getComponent(cc.Label);
        var expIcon = cc.find("plate/reward2/exp", node);
        var monsterSpine = cc.find("plate/monster", node).getComponent(sp.Skeleton);
        var monsterName = cc.find("plate/title", node);
        var monsterIcon = cc.find("plate/iconArcher", node);
        var bgSprite = cc.find("plate", node).getComponent(cc.Sprite);

        var rewards = data.Rewards;
        for (var i = 0; i < rewards.length; i++) {
            var obj = rewards[i];
            switch (obj.Type) {
                case constant.ItemType.GOLD:
                    goldNum.string = NP.dealNum(obj.Num,constant.NumType.TEN);
                    uiResMgr.loadCurrencyIcon(obj.type, goldIcon);
                    break;
                case constant.ItemType.DIAMOND:
                    diamondNum.string = NP.dealNum(obj.Num,constant.NumType.TEN);
                    uiResMgr.loadCurrencyIcon(obj.type, diamondIcon);
                    break;
                case constant.ItemType.HERO:
                    var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj.BaseID);
                    var tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][this.showFormIdx[idx]];
                    let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
                    jsonTables.loadConfigTxt(monsterName,familyConfig[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
                    uiResMgr.loadMonTypeIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type],monsterIcon,"monType");
                    monsterSpine.node.scale = this.spineScale[idx] * spineConfig.CombatScale / 100;
                    this.setBgFrame(bgSprite, familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type]);
                    var callback = function (spineData) {
                        monsterSpine.skeletonData  = spineData;
                        monsterSpine.setAnimation(0,'std',true);
                    }.bind(this);
                    uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callback);
                    break;
                case constant.ItemType.EXP:
                    expNum.string = NP.dealNum(obj.Num, constant.NumType.TEN);
                    uiResMgr.loadCurrencyIcon(obj.type, expIcon);
                    break;
            }
        }
    },

    //背景设置,根据不同职业设置不同颜色
    setBgFrame: function (sprite, type) {
        switch (type) {
            case tb.MONSTER_WARRIOR:
                sprite.spriteFrame = this.bgFrame[0];
                break;
            case tb.MONSTER_TANK:
                sprite.spriteFrame = this.bgFrame[1];
                break;
            case tb.MONSTER_SHOOTER:
                sprite.spriteFrame = this.bgFrame[2];
                break;
        }
    },

    clickCharge: function () {
        uiManager.openUI(uiManager.UIID.SHOPPANEL);
        this.close();
    },

    clickReceive: function (event, cusData) {
        var idx = parseInt(cusData);
        var value = this.firstChargeData.serverData.ActRewards[idx].Value;
        this.activityLogic.reqActivityRewardRec(this.firstChargeData.serverData.ID, value);
    },
});
