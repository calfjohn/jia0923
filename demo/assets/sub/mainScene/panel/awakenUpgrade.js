var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {

    },

    onLoad:function(){
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["updateMonster", this.updateMonster.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    open:function(familyID,data,isTalent,isShow){
        this.isTalent = isTalent;
        this.familyID = familyID;
        this.skillID = data.skillID;
        this.maxLv = data.maxLv;
        this.lv = data.skillLv;
        this.monsterConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);
        this.quality = this.monsterConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        this.skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,this.skillID);
        var skillLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILLLV,this.skillID,data.skillLv);
        var skillNextLvConfig;
        if(data.skillLv === 0){
             skillNextLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILLLV,this.skillID,data.skillLv +1);
        }
        var skillIcon = this.skillConfig[jsonTables.CONFIG_PASSIVESKILL.Icon];
        uiResMgr.loadSkillIcon(skillIcon,this.widget("awakenUpgrade/condition1/awaken1/icon"));
        this.name = uiLang.getConfigTxt(this.skillConfig[jsonTables.CONFIG_PASSIVESKILL.TxName]);
        this.widget("awakenUpgrade/titleLabel").getComponent(cc.Label).string = this.name;
        var config = data.skillLv === 0?skillNextLvConfig:skillLvConfig;
        this.refresh(config);
        this.widget("awakenUpgrade/condition1/maxLabel").active = data.skillLv === data.maxLv;
        this.widget("awakenUpgrade/condition1/next").active = data.skillLv !== data.maxLv && !isShow;
        var btnStr = data.skillLv === 0?"learn":"up";
        this.widget("awakenUpgrade/condition1/next/button2/label").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,btnStr);
        if(this.widget("awakenUpgrade/condition1/next").active){
            this.refreshNextInfo(skillLvConfig);
        }
        this.needHint = true;
    },
    refresh:function(config){
        this.widget("awakenUpgrade/condition1/awaken1/numberLabel").active = this.isTalent;
        this.widget("awakenUpgrade/condition1/awaken1/lvLabel").active = !this.isTalent;
        this.widget("awakenUpgrade/condition1/awaken1/maxlvLabel").active = !this.isTalent;
        if(this.isTalent){
            this.widget("awakenUpgrade/condition1/awaken1/numberLabel").getComponent(cc.Label).string = this.lv + "/" + this.maxLv;
        }else{
            this.widget("awakenUpgrade/condition1/awaken1/lvLabel").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"curLv") + this.lv;
            this.widget("awakenUpgrade/condition1/awaken1/maxlvLabel").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"maxLv") + this.maxLv;
        }
        var lv = this.lv === 0?1:this.lv;
        // this.widget("awakenUpgrade/condition1/frameEffect/label1").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"lv") + lv + this.name;
        var msgStr =uiLang.getConfigTxt(this.skillConfig[jsonTables.CONFIG_PASSIVESKILL.Des]);
        var numData = {};
        numData.str0Num = config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam]:"";
        numData.str1Num = config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionExtParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionExtParam]:"";
        numData.str2Num = config[jsonTables.CONFIG_PASSIVESKILLLV.SkillParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.SkillParam]:"";
        numData.str3Num = config[jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam]:"";
        numData.str4Num = config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterTime]?config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterTime]/1000:"";
        numData.str5Num = config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterNum]?config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterNum]:"";
        for (var i = 0 , len = 6; i < len; i++) {
            if(numData["str" + i + "Num"] && config[jsonTables.CONFIG_PASSIVESKILLLV.Remark].indexOf(i) !== -1){
                numData["str" + i + "Num"] = numData["str" + i + "Num"] / 10;
            }
        }
        this.widget("awakenUpgrade/condition1/frameEffect/label2").getComponent(cc.Label).string = msgStr.formatArray([numData.str0Num,numData.str1Num,numData.str2Num,numData.str3Num,numData.str4Num,numData.str5Num]);
    },
    refreshNextInfo:function(config){
        this.widget("awakenUpgrade/condition1/next/progressBar").active =  this.isTalent;
        var n = this.isTalent ? this.cardLogic.getTalentN(this.familyID) : this.lv;
        if(this.isTalent){
            var pro = this.cardLogic.getHeroesPro(this.familyID);
            var costPro = this.cardLogic.getTalentUpProb(this.familyID);
            this.widget("awakenUpgrade/condition1/next/progressBar/digitalLabel2").getComponent(cc.Label).string = pro + "/" + costPro;
            this.widget("awakenUpgrade/condition1/next/progressBar/loading").getComponent(cc.ProgressBar).progress =pro/costPro;
        }
        var costGold = this.isTalent?this.cardLogic.getTalentUpGold(this.familyID):this.cardLogic.getSkillUpGold(this.familyID,this.skillID);
        this.widget("awakenUpgrade/condition1/next/button2/gold/numberLabel").getComponent(cc.Label).string = costGold;
        var getExp = this.isTalent?this.cardLogic.getTalentUpExp(this.familyID):this.cardLogic.getSkillUpExp(this.familyID,this.skillID);
        this.widget("awakenUpgrade/condition1/next/experience1/numberLabel").getComponent(cc.Label).string = getExp;
        this.widget("awakenUpgrade/condition1/next/experience1").active = !this.isTalent || this.cardLogic.canGetExp(this.familyID,n);
    },
    clickUp:function(event){
        var initPos = this.widget('awakenUpgrade/condition1/next/button2').convertToWorldSpaceAR(cc.v2(0,0));
        if(this.isTalent){
            var pro = this.cardLogic.getHeroesPro(this.familyID);
            var publicPro = this.cardLogic.getPublicHeroesPro();
            var costPro = this.cardLogic.getTalentUpProb(this.familyID);
            if(pro >= costPro){
                this.cardLogic.Req_Hero_Talent_Upgrade(this.familyID,this.skillID);
            }else{
                if(pro + publicPro >= costPro){
                    if(this.needHint){
                        this.needHint = false;
                        var cb = function () {
                            this.cardLogic.Req_Hero_Talent_Upgrade(this.familyID,this.skillID);
                        }.bind(this);
                        uiManager.msgDefault(uiLang.getMessage(this.node.name,"proWeekSure"),cb);
                    }else{
                        this.cardLogic.Req_Hero_Talent_Upgrade(this.familyID,this.skillID);
                    }
                }else{
                    uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"proWeek"));
                }
            }
        }else{
            this.cardLogic.req_Hero_Skill_LvUp(this.familyID,this.skillID,initPos);
        }
    },
    updateMonster:function(info,isSkillUp){
        if(!isSkillUp || info.FamilyID !== this.familyID || info.SkillID !== this.skillID)  return;
        this.lv = info.SkillLv;
        if(this.lv === 1){//0升1
            this.widget("awakenUpgrade/condition1/next/button2/label").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"up");
        }
        var skillLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILLLV,this.skillID,this.lv);
        this.refresh(skillLvConfig);
        this.widget("awakenUpgrade/condition1/maxLabel").active = this.lv === this.maxLv;
        this.widget("awakenUpgrade/condition1/next").active = this.lv !== this.maxLv;
        if(this.widget("awakenUpgrade/condition1/next").active){
            this.refreshNextInfo(skillLvConfig);
        }
    },

});
