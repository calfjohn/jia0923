var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        // this.registerEvent();
        jsonTables.parsePrefab(this);
        this.initModule();
    },
    initModule:function(){
        this.shadow = this.node.getChildByName("icon").getComponent(cc.Sprite);
    },
    // registerEvent: function () {
    //     var registerHandler = [
    //         ["updateMonster", this.updateMonster.bind(this),true],
    //     ]
    //     this.registerClientEvent(registerHandler);
    // },
    init:function(idx,data,familyID){
        this.node.position = data.pos;
        this.data = data;
        this.familyID = familyID;
        this.skillID = data.skillID;
        this.skillLv = data.skillLv;
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);
        var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,this.skillID);
        this.maxLv = data.maxLv;
        this.node.getChildByName("numberLabel").getComponent(cc.Label).string  = data.skillLv + "/" + this.maxLv;
        this.node.getChildByName("name").getComponent(cc.Label).string  = uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_PASSIVESKILL.TxName]);
        var skillIcon = skillConfig[jsonTables.CONFIG_PASSIVESKILL.Icon];
        uiResMgr.loadSkillIcon(skillIcon,this.node.getChildByName("icon"));
        var lockInfo = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.PreTalent][idx];
        this.isLock = false;
        this.shadow.setState(cc.Sprite.State.NORMAL);
        this.lockLv = 0;
        this.lockSkill = 0;
        if(lockInfo){
            var arr = lockInfo.split("#");
            this.lockSkill = Number(arr[0]);
            this.lockLv = Number(arr[1]);
            var preLv = this.cardLogic.getTalentLv(this.familyID,this.lockSkill);
            this.isLock = this.lockLv > preLv;
            this.node.getChildByName("lock1").active = preLv === 0;
            if(this.isLock){
                this.shadow.setState(cc.Sprite.State.GRAY);
            }
        }

        this.node.getChildByName("name").active = !this.isLock;
        this.node.getChildByName("numberLabel").active = !this.isLock;
    },
    // updateMonster:function(info,isSkillUp){
    //     if(!isSkillUp || info.FamilyID !== this.familyID)   return;
    //     if(info.SkillID === this.skillID){
    //         this.node.getChildByName("numberLabel").getComponent(cc.Label).string  = info.SkillLv + "/" + this.maxLv;
    //     }else if(this.isLock && info.SkillID === this.lockSkill && info.SkillLv >= this.lockLv){
    //         this.isLock = this.lockLv > info.SkillLv;
    //         this.node.getChildByName("lock1").active = info.SkillLv === 0;
    //         if(!this.isLock){
    //             this.shadow.setState(cc.Sprite.State.NORMAL);
    //         }
    //         this.node.getChildByName("name").active = !this.isLock;
    //         this.node.getChildByName("numberLabel").active = !this.isLock;
    //     }
    // },
    clickItem(event){
        if(this.isLock){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"lock").formatArray([this.lockLv]))
            return;
        };
        uiManager.openUI(uiManager.UIID.AWAKENUPGRADE,this.familyID,this.data,true);
    },
    // update (dt) {},
});
