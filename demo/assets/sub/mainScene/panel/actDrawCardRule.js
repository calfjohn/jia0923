var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        upMonSp: sp.Skeleton,
        upMonType: cc.Node,
        upMonQuality: cc.Node,
        upMonBg: cc.Node,
        upMonCost: cc.Label,

        ultimateSkillName: cc.Label,
        ultimateSkillIcon: cc.Node,
        ultimateSkillDesc: cc.Label,
        passiveSkillContent: [cc.Node],

        upMonName: cc.Label,
        ruleString: cc.Label
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        var drawCardData = this.activityLogic.getDrawCardData();
        this.monLength = drawCardData.serverData.FamilyID.length;
    },

    open () {
        this.monIdx = 0;
        this.initMonInfo();
    },

    initMonInfo: function () {
        var drawCardData = this.activityLogic.getDrawCardData();
        this.upMonTid = drawCardData.serverData.FamilyID[this.monIdx];
        this.initFamily();
        this.initSkill();
        this.initDesc();
    },

    //初始化Up怪物家族
    initFamily: function () {
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.upMonTid);
        let tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][4];
        let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        let callback = function (spineData) {
            this.upMonSp.skeletonData  = spineData;
            this.upMonSp.setAnimation(0,'std',true);
        }.bind(this);
        uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callback);
        uiResMgr.loadMonTypeIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type],this.upMonType);

        //品质等级
        uiResMgr.loadQualityLvIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality],this.upMonQuality);

        uiResMgr.loadQualityBg(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality],this.upMonBg);

        this.upMonCost.string = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Leader];
    },

    //初始化技能
    initSkill: function () {
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.upMonTid);
        var monsters = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters];
        var monsterData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsters[monsters.length - 1]);
        var lastSkillID = monsterData[jsonTables.CONFIG_MONSTER.Skill];

        var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.SKILL,lastSkillID);
        var skillIcon = skillConfig[jsonTables.CONFIG_SKILL.Icon];
        uiResMgr.loadSkillIcon(skillIcon,this.ultimateSkillIcon);
        this.ultimateSkillName.string = uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_SKILL.SkillName]);

        var des = uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_SKILL.SkillDes]);
        var num = skillConfig[jsonTables.CONFIG_SKILL.Num];
        var purpleLv = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.PurpleSkillLv];
        var orangeLv = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.OrangeSkillLv];
        var arr1 = num[purpleLv - 1][0]? num[purpleLv - 1][0]:"";
        var arr2 = num[purpleLv - 1][1]? num[purpleLv - 1][1]:"";
        var arr3 = "";
        var arr4 = "";
        var arr5 = num[orangeLv - 1][0]? num[orangeLv - 1][0]:"";
        var arr6 = num[orangeLv - 1][1]? num[orangeLv - 1][1]:"";
        var arr7 = "";
        var arr8 = "";
        var buffID = skillConfig[jsonTables.CONFIG_SKILL.Buff][0];
        if(buffID){
            var buffConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,buffID);
            arr3 = buffConfig[jsonTables.CONFIG_BUFF.Time][purpleLv - 1]?buffConfig[jsonTables.CONFIG_BUFF.Time][purpleLv - 1] / 1000:"";
            arr4 = buffConfig[jsonTables.CONFIG_BUFF.Num][purpleLv - 1]?buffConfig[jsonTables.CONFIG_BUFF.Num][purpleLv - 1]:"";
            arr7 = buffConfig[jsonTables.CONFIG_BUFF.Time][orangeLv - 1]?buffConfig[jsonTables.CONFIG_BUFF.Time][orangeLv - 1] / 1000:"";
            arr8 = buffConfig[jsonTables.CONFIG_BUFF.Num][orangeLv - 1]?buffConfig[jsonTables.CONFIG_BUFF.Num][orangeLv - 1]:"";
        }
        des = des.formatArray([arr1,arr2,arr3,arr4,arr5,arr6,arr7,arr8]);

        this.ultimateSkillDesc.getComponent(cc.Label).string = des;
        
        this.passiveList = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Skill];

        for (var i = 0; i < this.passiveSkillContent.length; i++) {
            var obj = this.passiveSkillContent[i];
            var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,this.passiveList[i]);
            var skillIcon = cc.find("mask/skillIcon", obj);
            var skillName = cc.find("name", obj).getComponent(cc.Label);
            skillName.string = uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_PASSIVESKILL.TxName]);
            uiResMgr.loadSkillIcon(skillConfig[jsonTables.CONFIG_PASSIVESKILL.Icon],skillIcon);
        }
    },

    initDesc: function () {
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.upMonTid);
        var nameString = "(" + constant.QualityEnum[familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality]] + ")" +  uiLang.getConfigTxt(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        this.upMonName.string = nameString;
        // var upPer = this.upMonTid === 402?300:150;
        var ruleString = uiLang.getMessage(this.node.name, "ruleString");
        for (var i = 0; i < nameString.length * 2.5; i++) {
            ruleString = " " + ruleString;
        }
        this.ruleString.string = ruleString;
    },

    clickSkill: function (event,cusData) {
        var skillIndex = parseInt(cusData);
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.upMonTid);

        var data = {
            skillID: this.passiveList[skillIndex],
            maxLv:familyConfig[jsonTables.CONFIG_MONSTERFAMILY.SkillMaxLv][skillIndex],
            skillLv:familyConfig[jsonTables.CONFIG_MONSTERFAMILY.SkillMaxLv][skillIndex]
        }
        uiManager.openUI(uiManager.UIID.AWAKENUPGRADE,this.upMonTid,data);
    },

    clickLeft: function () {
        this.monIdx -- ;
        if(this.monIdx < 0)
            this.monIdx = this.monLength - 1;
        this.initMonInfo();
    },

    clickRight: function () {
        this.monIdx ++ ;
        if(this.monIdx > this.monLength - 1)
            this.monIdx = 0;
        this.initMonInfo();
    }

});
