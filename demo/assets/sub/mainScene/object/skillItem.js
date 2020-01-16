var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spFrame:[cc.SpriteFrame],
        btnFrame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.ani = this.node.getComponent(cc.Animation);
        this.btnAni = this.widget("skillItem/button").getComponent(cc.Animation);
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["updateBtn", this.updateUpBtn.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function(idx,data,info) {
        this.widget("skillItem/rankingIcon").getComponent(cc.Sprite).spriteFrame = this.spFrame[idx];
        this.data = data;
        this.idx = idx;
        this.familyID = info.familyID;
        this.isReel = info.isReel;
        this.quality = info.quality;
        this.skillID = data.skillID;
        this.skillLv = data.skillLv;
        this.widget("skillItem/frame/lock").active = this.skillLv === 0;
        var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,this.skillID);
        var skillLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILLLV,this.skillID,data.skillLv);
        var skillIcon = skillConfig[jsonTables.CONFIG_PASSIVESKILL.Icon];
        uiResMgr.loadSkillIcon(skillIcon,this.widget("skillItem/frame/icon"));
        this.widget("skillItem/skillLabel").getComponent(cc.Label).string =uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_PASSIVESKILL.TxName]);
        var allLv = data.maxLv;
        this.widget("skillItem/skillLabel/label").getComponent(cc.Label).string = this.skillLv + "/" + allLv;
        var btnStr = this.skillLv === 0?"learn":"upLv";
        this.widget("skillItem/button/label").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,btnStr);
        // this.needGold = this.formulaLogic.calcuateGoldForSkillLv(this.skillLv,this.quality,idx + 1);
        this.needGold = data.skillUpGold || 0;
        this.widget("skillItem/button/gold/label").getComponent(cc.Label).string = this.needGold;
        this.widget("skillItem/button").active = !this.isReel && this.skillLv < allLv;
        this.widget("skillItem/iconRise").active = !this.isReel && this.skillLv < allLv;
        if(this.widget("skillItem/button").active){
            this.updateUpBtn();
        }
        this.widget("skillItem/button1").active = this.isReel || this.skillLv >= allLv;
    },
    updateUpBtn:function(){
        var gold = this.userLogic.getBaseData(this.userLogic.Type.Gold);
        // this.widget("skillItem/button/button3").active = gold >= this.needGold && this.skillLv === 0;
        // var aniStr = this.widget("skillItem/button/button3").active ? "play":"stop";
        // this.btnAni[aniStr]();
        this.widget("skillItem/iconRise").active = this.skillLv > 0 && this.skillLv < this.data.maxLv;
        this.widget("skillItem/button").getComponent(cc.Button).interactable = gold >= this.needGold && this.skillLv < this.data.maxLv;
        this.widget("skillItem/button").getComponent(cc.Sprite).spriteFrame = gold >= this.needGold && this.skillLv < this.data.maxLv?this.btnFrame[0]:this.btnFrame[1];
    },
    upEvent:function(event){
        this.widget("skillItem/iconRise").active = true;
        this.ani.play();
        var initPos = this.widget('skillItem/button').convertToWorldSpaceAR(cc.v2(0,0));

        this.cardLogic.req_Hero_Skill_LvUp(this.familyID,this.skillID,initPos);
    },
    clickItem:function(){
        // return;
        uiManager.openUI(uiManager.UIID.AWAKENUPGRADE,this.familyID,this.data,false,this.isReel,this.idx);
    },

    // update (dt) {},
});
