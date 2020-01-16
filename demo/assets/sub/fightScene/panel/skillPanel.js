var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false;
        this.spine.setEventListener(this.eventListener.bind(this));
        this.spine.setCompleteListener(this.complete.bind(this));//        this.spine.setEventListener(this.event.bind(this));
        this.aniDoneFlag = true;
        this.spineDoneFlag = true;
        this.skillEffectDoneFlag = true;
        this.list = [];
    },

    setRoot:function(node){
        this.rootNode = node;
    },

    init:function(){
        this.aniDoneFlag = true;
        this.spineDoneFlag = true;
        this.skillEffectDoneFlag = true;
        this.list = [];
    },

    open:function(data){
        if (!data) {
            this.msgHanderLogic.newAllMsg(null,0,constant.MsgHanderType.SKILL_END);//// NOTE: 押后一点 避免排序前置
            this.msgHanderLogic.forcePolling();
            return;
        }
        if (!this.aniDoneFlag || !this.spineDoneFlag || !this.skillEffectDoneFlag) {
            return this.list.push(data);
        }
        this.aniDoneFlag = false;
        this.spineDoneFlag = false;
        this.skillEffectDoneFlag = false;
        this.data = data;
        this.node.active = true;
        jsonTables.displaySkill = true;
        jsonTables.displayingSkill = false;
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.tid);
        this.fromer = data.fromer;
        this.skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.SKILL,this.config[jsonTables.CONFIG_MONSTER.Skill]);
        this.widget('skillPanel/bg').active = this.skillConfig[jsonTables.CONFIG_SKILL.IsShowBg];
        var effectID = this.skillConfig[jsonTables.CONFIG_SKILL.EffectID];
        this.effectConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EFFECT,effectID);
        this.setBgLightFalse();
        uiResMgr.loadSkillDisplayPrefab(this.skillConfig[jsonTables.CONFIG_SKILL.MaskLayerRes],function(prefab){
            if (prefab) {
                var node = this.widget('skillPanel/bg').getInstance(prefab,true);
                var ani = node.getComponent(cc.Animation);
                if (ani) {
                    ani.play();
                }else {
                    cc.error("动画机都没有啊")
                }
                this.prefabName = prefab.name;
            }
        }.bind(this));

        this.spine.skeletonData = null;
        this.spine.node.position = data.pos;
        this.spine.node.scale = this.config[jsonTables.CONFIG_MONSTER.CombatScale]/100;
        var callBack = function(spineData){
            if (!jsonTables.isSpineContainEvent(spineData,'effect'))  {
                this.aniDone();
                this.skillEffect();
                this.complete();
                return cc.error(this.config[jsonTables.CONFIG_MONSTER.Resource],"没有配置effect事件")
            }
            this.spine.skeletonData  = spineData;
            this.spine.setAnimation(0,'spAtk',false);
            this.doAudio(this.skillConfig[jsonTables.CONFIG_SKILL.CastingSound]);
        }.bind(this);
        var spineName = this.config[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadSpine(spineName,callBack);
    },

    setBgLightFalse:function () {
        if (this.prefabName) {
            var node = this.widget('skillPanel/bg').getChildByName(this.prefabName);
            if (node) {
                var ani = node.getComponent(cc.Animation);
                if (ani) ani.stop();
                node.active = false;
            }
            this.prefabName = null;
        }
    },

    eventListener:function(trackEntry,event){
        if (event.data.name === "effect") {
            this.showAni();
        }
    },

    complete:function(){
        this.spineDoneFlag = true;
        if (this.fromer && this.fromer.getIsLife()) {
            this.fromer.setPosition(this.spine.node.position);//反向修正位置
            this.fromer.resumeFromSkill();
        }
        this.spine.skeletonData = null;
        this.closePanel();
    },

    showAni:function(){
        if (!jsonTables.displaySkill) return;
        if (this.effectConfig[jsonTables.CONFIG_EFFECT.Resource] === "-") {
            this.aniDone();
            this.skillEffect();
        }else {
            this.destoryDisPlayNode();
            uiResMgr.loadSkillPrefab(this.effectConfig[jsonTables.CONFIG_EFFECT.Resource],function(prefab){
                var node = this.effectConfig[jsonTables.CONFIG_EFFECT.CastingLayer] ? this.fightLogic.callSceneRoot("getSkillRoot") : this.node;
                this.displayNode = node.getInstance(prefab,true);
                this.displayNode.active = true;
                this.displayNode.position = this.data.pos;
                this.displayNode.x += this.effectConfig[jsonTables.CONFIG_EFFECT.OffXset];
                this.displayNode.y += this.effectConfig[jsonTables.CONFIG_EFFECT.OffYset];

                var zore = this.effectConfig[jsonTables.CONFIG_EFFECT.CastingLayer] ? -1 : 1;
                this.displayNode.setLocalZOrderEx(zore);
                this.displayNode.scale = this.effectConfig[jsonTables.CONFIG_EFFECT.Scale] || 0.1;
                this.displayNode.scaleX = this.fightLogic.getMineID() === this.data.owner ? -1 * Math.abs(this.displayNode.scaleX):1* Math.abs(this.displayNode.scaleX);
                var clip = this.displayNode.getComponent(cc.Animation).playAdditive(this.effectConfig[jsonTables.CONFIG_EFFECT.ClipName]);
                setTimeout(function () {
                     this.aniDone();
                }.bind(this), clip.duration * 1000);
                this.doAudio(this.skillConfig[jsonTables.CONFIG_SKILL.ResultSound]);
                if (this.skillConfig[jsonTables.CONFIG_SKILL.IsShake] && this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude].length === 5 && this.rootNode) {
                    var data = {
                        diff_x:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][0],
                        diff_y:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][1],
                        diff_max:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][2],
                        interval:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][3]/1000,
                        totalTime:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][4]/1000,
                        };
                    uiManager.addShakerEffect(this.rootNode,data);
                }
                setTimeout(function () {
                    this.skillEffect();
                }.bind(this), this.skillConfig[jsonTables.CONFIG_SKILL.CastingTime]);
            }.bind(this));
        }
    },

    destoryDisPlayNode:function(){
        if (this.displayNode) {
            this.displayNode.removeFromParent();
            this.displayNode.destroy();
            this.displayNode = null;
        }
    },

    doAudio:function(audioID){
        if (!audioID) return;
        this.clientEvent.dispatchEvent("playAudioEffect",audioID);
    },

    skillEffect:function(){
        this.widget('skillPanel/bg').active = false;
        this.setBgLightFalse();
        jsonTables.displaySkill = false;//技能播放结束 开始行动
        this.doEffect();
        this.msgHanderLogic.newAllMsg(null,0.01,constant.MsgHanderType.SKILL_END);//// NOTE: 押后一点 避免排序前置
        this.msgHanderLogic.forcePolling();
        this.skillEffectDoneFlag = true;
        this.closePanel();
    },
    aniDone:function(){
        this.aniDoneFlag = true;
        if (this.displayNode) {
            this.displayNode.active = false;
        }
        this.destoryDisPlayNode();
        this.closePanel();
    },

    closePanel:function(){
        if (this.spineDoneFlag && this.aniDoneFlag && this.skillEffectDoneFlag) {
            this.node.active = false;
            if (this.list.length > 0) {
                var data = this.list.shift();
                this.open(data);
            }else {
                this.rootNode.getComponent("fightScene").reShowReelContent();
            }
        }
    },


    doEffect:function(){
        var familyID = this.config[jsonTables.CONFIG_MONSTER.FamilyID];
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);//家族配置表基本数据

        var data = {};
        data.effect = this.skillConfig[jsonTables.CONFIG_SKILL.Effect];
        data.skillLv = this.config[jsonTables.CONFIG_MONSTER.Form] === tb.MONSTER_EPIC ? familyConfig[jsonTables.CONFIG_MONSTERFAMILY.PurpleSkillLv]:familyConfig[jsonTables.CONFIG_MONSTERFAMILY.OrangeSkillLv];
        data.fromer = this.fromer;
        data.targetType = this.skillConfig[jsonTables.CONFIG_SKILL.Objects];
        data.targetNum = this.skillConfig[jsonTables.CONFIG_SKILL.ObjectsNums];
        data.buffs = this.skillConfig[jsonTables.CONFIG_SKILL.Buff];
        data.skillNum = this.skillConfig[jsonTables.CONFIG_SKILL.Num][data.skillLv -1][0];
        if(data.effect === tb.DAMAGE_PER_NUM &&this.skillConfig[jsonTables.CONFIG_SKILL.Num][data.skillLv -1][1]){
            data.skillExNum = this.skillConfig[jsonTables.CONFIG_SKILL.Num][data.skillLv -1][1];
        }
        data.buffTime = [];
        data.buffNum = [];
        data.buffExt = this.effectConfig[jsonTables.CONFIG_EFFECT.EffeceCoord];
        for (var i = 0 ; i <  data.buffs.length; i++) {
            var obj = data.buffs[i];
            if (obj === tb.NO){
                data.buffs.splice(i,1);
                i--;
                continue;//不存在效果直接pass
            }
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,obj);
            data.buffTime.push(config[jsonTables.CONFIG_BUFF.Time][data.skillLv-1]);
            data.buffNum.push(config[jsonTables.CONFIG_BUFF.Num][data.skillLv-1]);
        }
        this.skillLogic.doEffect(data);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
