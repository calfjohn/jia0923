var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        formSps:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        if (this.inited) return;
        this.inited = true;
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data,ext){//data ->NodeMonsterInfo_
        this.onLoad();
        this.isMine = ext.isMine;
        this.monsterID = data.ID;
        this.lv = data.Lvl;
        var list = undefined;
        if (!ext.isMine) {
            list = this.chapterLogic.getSkillList(ext.id,ext.chapterID,this.monsterID,ext.wave);
        }
        var fightpower = this.cardLogic.getShowNum(data.ID,data.Lvl,list);
        fightpower = fightpower.sword + fightpower.shield;
        this.widget('previewFrame/specialLabel').active = (ext.chapterID && ext.chapterID === 302 && this.chapterLogic.getMaxMiniChapter() === 301);
        this.widget('previewFrame/powerLabel').active = !this.widget('previewFrame/specialLabel').active;//策划要求先写死第三章第二关卡得怪物名字
        this.widget('previewFrame/powerLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"power") + fightpower;
        ext.fightPower += (fightpower * data.Num);
        this.widget('previewFrame/levelLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"level") + data.Lvl;
        this.widget('previewFrame/numberLabel').getComponent(cc.Label).string = "x" + data.Num;
        this.widget('previewFrame/numberLabel').active = !(ext && ext.isMine && ext.isFirst);

        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.ID);
        jsonTables.loadSpineCommonAction(this.spine,config[jsonTables.CONFIG_MONSTER.Resource]);
        this.spine.node.scale = config[jsonTables.CONFIG_MONSTER.PreviewScale] / 100;
        this.widget('previewFrame/rarity').getComponent(cc.Sprite).spriteFrame = this.formSps[config[jsonTables.CONFIG_MONSTER.Form]-1];

        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,config[jsonTables.CONFIG_MONSTER.FamilyID]);
        uiResMgr.loadQualityLvIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality],this.widget('previewFrame/letterForm'));

        uiResMgr.loadMonTypeIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("previewFrame/raceEffect"));

        this.widget('previewFrame/label2').getComponent(cc.Label).string = uiLang.getMessage("fightFamily","raity"+config[jsonTables.CONFIG_MONSTER.Form]);
        this.widget('previewFrame/label2').color = uiColor.previewFrame["form"+config[jsonTables.CONFIG_MONSTER.Form]+"Color"] || uiColor.previewFrame.form1Color;
    },

    clickFun:function(){
        var ev = new cc.Event.EventCustom('clickFrame', true);
        ev.setUserData({tid:this.monsterID,isMine:this.isMine,lv:this.lv});
        this.node.dispatchEvent(ev);
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
