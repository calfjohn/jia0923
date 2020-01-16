var panel = require("subPanel");

cc.Class({
    extends: panel,

    properties: {
        qualitFrame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["guideAction", this.guideAction.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    guideAction:function(type){
        if (type === "reelUp" && this.idx === 0) {
            this.clickEvent();
        }
    },

    init:function(idx,data){
        this.idx = idx;
        this.setData(data);
    },

    show:function(){
        var data = this.getData();
        this.data = data;
        this.widget("reelPanelitem/words").active = !this.data.empty;
        this.widget("reelPanelitem/raceEffect1").active = !this.data.empty;
        this.widget("reelPanelitem/card").active = !this.data.empty;//

        if (this.data.empty) {

        }else {
            this.widget('reelPanelitem/words/amount').getComponent(cc.Label).string = this.cardLogic.getReelCount(data.ID);

            var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,data.ID);//装备配置表基本数据
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
            var quality = config[jsonTables.CONFIG_MONSTER.Form];
            this.widget("reelPanelitem/card/equipItem/iconFrame").getComponent(cc.Sprite).spriteFrame = this.qualitFrame[quality - 1];
            // uiResMgr.loadBaseQualityIcon(quality,this.widget("reelPanelitem/card/equipItem/iconFrame"));
            uiResMgr.loadQualityIcon(quality,this.widget("reelPanelitem/card/equipItem/qualityFrame1"));

            var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
            uiResMgr.loadHeadIcon(iconRes,this.widget('reelPanelitem/card/equipItem/icon'));

            var fightpower = this.cardLogic.getShowNum(reelData[jsonTables.CONFIG_REEL.MonsterID]);
            fightpower = fightpower.sword + fightpower.shield;
            this.widget('reelPanelitem/words/abilityNumber').getComponent(cc.Label).string = fightpower;
            this.widget('reelPanelitem/words/levelNumber').getComponent(cc.Label).string = this.cardLogic.getHeroesLv(config[jsonTables.CONFIG_MONSTER.FamilyID]) || 1;

            var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,config[jsonTables.CONFIG_MONSTER.FamilyID]);
            uiResMgr.loadMonTypeIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget('reelPanelitem/raceEffect1'));
            this.widget('reelPanelitem/card/reelSelectUp').active = this.cardLogic.isInReelsLineUpCopys(data.ID);
            this.widget('reelPanelitem/card/reelSelect').active = this.widget('reelPanelitem/card/reelSelectUp').active;

        }

    },

    clickEvent:function(){
        if (this.data.empty) {
            return;
        }
        var ev = new cc.Event.EventCustom('clickReelItem', true);
        ev.setUserData(this.data);
        this.node.dispatchEvent(ev);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
