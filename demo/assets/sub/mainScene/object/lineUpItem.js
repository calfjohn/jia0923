var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        qualitySp:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.showIdx = 1;
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },
    registerEvent: function () {
        var registerHandler = [
            ["updateMonster", this.updateMonster.bind(this)],
            ["showReplace", this.showReplace.bind(this)],
            ["checkLineUpRedDot", this.checkRedDot.bind(this)],
            ["leaderWeek", this.leaderWeek.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    onFinished:function(event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.aniCb();
    },
    init:function(idx,data){
        this.widget("lineUpItem/replace").active = false;
        this.idx = idx;
        this.familyID = data;
        // this.widget("lineUpItem/btnContent/upButton").active = data !== 0;
        // this.widget("lineUpItem/msg").active = data !== 0;
        // this.widget("lineUpItem/empty").active = data === 0;
        if(data === 0){
            console.error("默认阵容家族不全");
            return;
        }
        this.monsterBaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);//家族配置表基本数据
        this.monsterData = this.cardLogic.getHeroesById(this.familyID);//服务端给过来来的数据
        this.tid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
        this.quality = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        this.leader = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        // this.lvData = {};
        // for (var i = 0 , len = this.monsterData.SkillLv.length; i < len; i++) {
        //     var obj = this.monsterData.SkillLv[i];
        //     var skillId = Math.floor(obj/1000);
        //     var lv = obj % 1000;
        //     this.lvData[skillId] = {};
        //     this.lvData[skillId].lv = lv;
        //     this.lvData[skillId].maxLv = this.monsterData.SkillMaxLv[i];
        // }
        // var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data + 1)[jsonTables.CONFIG_MONSTER.Icon];
        // uiResMgr.loadHeadIcon(iconRes,this.widget("lineUpItem/msg/monterSp"));
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);
        for(var i = 0; i < familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters].length ;i ++){
            var tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][i];
            let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
            let path = 'lineUpItem/spine/sp'+i;
            let callBack = function(spineData){
                this.widget(path).getComponent(sp.Skeleton).skeletonData  = spineData;
                this.widget(path).getComponent(sp.Skeleton).setAnimation(0,'std',true);
            }.bind(this);
            uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callBack);
            this.widget(path).x = spineConfig[jsonTables.CONFIG_MONSTER.XPosition];
            this.widget(path).y = spineConfig[jsonTables.CONFIG_MONSTER.YPosition];
            this.widget(path).scale = spineConfig[jsonTables.CONFIG_MONSTER.Scale] / 100;
            if(i >= this.showIdx){
                var color = this.monsterData.Quality > i?uiColor.white:uiColor.black;
                this.widget(path).color = color;
            }
        }
        //名字
        // jsonTables.loadConfigTxt(this.widget("lineUpItem/msg/bottom/nameLabel"),this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        //品质等级
        this.widget("lineUpItem/intoFrame5").getComponent(cc.Sprite).spriteFrame = this.qualitySp[this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];
        //所需领导力
        this.widget("lineUpItem/label/crownLabel").getComponent(cc.Label).string = this.leader;
        //怪物种类
        uiResMgr.loadMonTypeIcon(this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("lineUpItem/intoIcon4"));
        // this.widget("lineUpItem/msg/family").getComponent(cc.Sprite).spriteFrame = this.familySp[this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Type] - 1];
        // var list = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Skill];
        // for(var i = 0; i < list.length ;i ++){//3个被动技能
        //     var obj = list[i];
        //     var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,obj);
        //     var path = 'lineUpItem/msg/skill'+i;
        //     uiResMgr.loadSkillIcon(skillConfig[jsonTables.CONFIG_PASSIVESKILL.Icon],this.widget(path));
        //     var data = this.lvData[obj];
        //     if (!data) {
        //         cc.error("服务端与客户端被动技能不匹配，客户端id--->",obj);
        //         continue;
        //     }
        //     this.widget[path + "/number"].getComponent(cc.Label).string = data.lv + "/" + data.maxLv;
        //
        // }
        this.reset();
    },

    reset:function(){
        this.needDebris = this.monsterData.Clip;//升级所需要的碎片数量
        //等级
        this.widget("lineUpItem/label/lvLabel").getComponent(cc.Label).string = "LV" + this.monsterData.Lv;
        //碎片数量
        this.widget("lineUpItem/intoIcon9/numberLabel2").getComponent(cc.Label).string = this.monsterData.Num  +"/"+ this.needDebris;
        var showData = this.cardLogic.getShowNum(this.tid);
        //战斗力
        this.widget("lineUpItem/label/swordLabel").getComponent(cc.Label).string = showData.sword;
        //防御力
        this.widget("lineUpItem/label/shieldLabel").getComponent(cc.Label).string = showData.shield;

        this.checkRedDot();
    },

    checkRedDot:function () {
        // this.widget("lineUpItem/redDot").active = this.cardLogic.checkMonLvUp(this.familyID) ||  this.cardLogic.checkMonSkillUp(this.familyID);
        this.widget("levelUp").active = this.cardLogic.checkMonLvUp(this.familyID) ||  this.cardLogic.checkMonSkillUp(this.familyID);
    },

    playLineUp:function(cb){
        this.aniCb = cb;
        this.ani.play();
    },

    updateMonster:function(info,isSkillUp){
        if(info.FamilyID !== this.familyID || isSkillUp) return;
        this.monsterData = info;
        this.reset();
    },
    leaderWeek:function (isOpen) {
        if(isOpen){
            if(this.inReplace &&  !this.canReplace){
                this.widget("lineUpItem/label/crownLabel").getComponent(cc.Animation).play();
            }
        }else{
            this.widget("lineUpItem/label/crownLabel").getComponent(cc.Animation).stop();
            this.closeTime = 0;
            this.widget("lineUpItem/label/crownLabel").color = uiColor.white;
            this.widget("lineUpItem/label/crownLabel").scale = 1;
        }
    },
    clickItem:function(event){
        if(!this.familyID)  return;
        var canNotReplace = false;
        if(this.inReplace &&  !this.canReplace){
            this.closeTime = 3;
            // return;
            canNotReplace = true;
        }
        var ev = new cc.Event.EventCustom('clicklineUpItem', true);
        var data = {
            familyID:this.familyID,
            node:this.node,
            idx:this.idx,
            js:this,
            canNotReplace: canNotReplace
        }
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    showReplace:function(leader){
        this.inReplace = !!leader;
        this.widget("lineUpItem/replace").active = false;
        this.widget("lineUpItem/replace1").active = false;
        if(!this.inReplace) return;
        this.canReplace = this.inReplace?(this.cardLogic.getCurFormationLeader() - this.leader + leader) <= this.userLogic.getMyLeader():false;
        this.widget("lineUpItem/replace").active = this.canReplace;
        this.widget("lineUpItem/replace1").active = !this.canReplace;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!this.closeTime) return;
        this.closeTime -= dt;
        if(this.closeTime <= 0){
            this.clientEvent.dispatchEvent("leaderWeek",false);
        }
    }
});
