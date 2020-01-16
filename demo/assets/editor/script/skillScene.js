var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        labelItemPrefab:cc.Prefab,

    },

    // use this for initialization
    onLoad: function () {
        jsonTables.isEditor = true;
        this.registerEvent();
        uiResMgr.startLoadingRes();
        this.spine = this.widget('Canvas/bgNode/spineNode/curSpine').getComponent(sp.Skeleton);
        this.spine.setEventListener(this.eventListener.bind(this));
        this.init();
        this.fightLogic.isDisplaying = function () {
            return true;
        }
        this.rootNode = this.widget('Canvas/bgNode')
    },

    registerEvent: function () {

        var registerHandler = [
            ["clickLabel", this.clickLabel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    eventListener:function(trackEntry,event){
        if (event.data.name === "effect") {
            uiManager.openUI(uiManager.UIID.TIPMSG,"触发特战斗")
            jsonTables.displaySkill = true;
            this.showAni();
        }else if (event.data.name === "attack") {
            this.doAttack();
        }
    },

    doAttack:function(){
        var bulletID = this.monsterConfig[jsonTables.CONFIG_MONSTER.Bullet];
        if (bulletID) {//tod生成不一样的预制体
            var fixPosList = this.monsterConfig[jsonTables.CONFIG_MONSTER.BulletDrift];
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletID);
            var node = uiResMgr.getPrefabEx(config[jsonTables.CONFIG_BULLET.Resource]);
            node.parent = this.rootNode;
            var target = this.widget('Canvas/bgNode/enemy').getComponent("skillTarget");
            node.getComponent("fighttBullet").init(bulletID,this.spine.node.parent.getComponent("skillTarget"),target,this.damageBase,null,null,null,null,fixPosList,0,0);
        }
    },

    doAudio:function(audioID){
        if (!audioID) return;
        this.clientEvent.dispatchEvent("playAudioEffect",audioID);
    },
    showAni:function(){
        this.widget('Canvas/bgNode/bg').active = this.skillConfig[jsonTables.CONFIG_SKILL.IsShowBg];
        this.setBgLightFalse();
        if (!jsonTables.displaySkill) return;

        cc.log("开始播放技能-------------------------->")
        cc.log("配置是否展示背景",this.skillConfig[jsonTables.CONFIG_SKILL.IsShowBg])
        cc.log("配置生效延迟为",this.skillConfig[jsonTables.CONFIG_SKILL.CastingTime])
        cc.log("配置生效音效为",this.skillConfig[jsonTables.CONFIG_SKILL.ResultSound])
        var effectID = this.skillConfig[jsonTables.CONFIG_SKILL.EffectID];
        this.effectConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EFFECT,effectID);
        uiResMgr.loadSkillDisplayPrefab(this.skillConfig[jsonTables.CONFIG_SKILL.MaskLayerRes],function(prefab){
            if (prefab) {
                var node = this.widget('skillPanel/bgNode/bg').getInstance(prefab,true);
                var ani = node.getComponent(cc.Animation);
                if (ani) {
                    ani.play();
                }else {
                    cc.error("动画机都没有啊")
                }
                this.prefabName = prefab.name;
            }
        }.bind(this));
        if (this.effectConfig[jsonTables.CONFIG_EFFECT.Resource] === "-") {
            this.aniDone();
            this.skillEffect();
        }else {
            this.destoryDisPlayNode();

            uiResMgr.loadSkillPrefab(this.effectConfig[jsonTables.CONFIG_EFFECT.Resource],function(prefab){
                this.displayNode = this.node.getChildByName("ui").getInstance(prefab,true);
                this.displayNode.active = true;
                this.displayNode.position = this.spine.node.parent.position;
                this.displayNode.x += this.effectConfig[jsonTables.CONFIG_EFFECT.OffXset];
                this.displayNode.y += this.effectConfig[jsonTables.CONFIG_EFFECT.OffYset];
                this.displayNode.setLocalZOrderEx(-1);
                this.displayNode.scale = this.effectConfig[jsonTables.CONFIG_EFFECT.Scale] || 0.1;

                this.displayNode.scaleX =  -1 * Math.abs(this.displayNode.scaleX);//// TODO: 约定预制体方向
                this.displayNode.getComponent(cc.Animation).playAdditive(this.effectConfig[jsonTables.CONFIG_EFFECT.ClipName]).once(constant.AnimationState.FINISHED, this.aniDone, this);
                this.doAudio(this.skillConfig[jsonTables.CONFIG_SKILL.ResultSound]);
                if (this.widget('Canvas/ui/shakToggle').getComponent(cc.Toggle).isChecked && this.skillConfig[jsonTables.CONFIG_SKILL.IsShake] && this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude].length === 5 && this.rootNode) {
                    var data = {
                        diff_x:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][0],
                        diff_y:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][1],
                        diff_max:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][2],
                        interval:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][3]/1000,
                        totalTime:this.skillConfig[jsonTables.CONFIG_SKILL.Amplitude][4]/1000,
                        };
                    uiManager.addShakerEffect(this.rootNode,data);
                }

                this.scheduleOnce(function(){
                    this.skillEffect();
                }.bind(this),this.skillConfig[jsonTables.CONFIG_SKILL.CastingTime]/1000);
            }.bind(this));
        }
    },
    setBgLightFalse:function () {
        if (this.prefabName) {
            var node = this.widget('skillPanel/bgNode/bg').getChildByName(this.prefabName);
            if (node) {
                node.active = false;
            }
            this.prefabName = null;
        }
    },

    skillEffect:function(){
        this.widget('Canvas/bgNode/bg').active = false;
        this.setBgLightFalse();
        jsonTables.displaySkill = false;//技能播放结束 开始行动
        cc.log("播放技能结束-------------------------->")
    },
    aniDone:function(){
        this.destoryDisPlayNode();
    },

    destoryDisPlayNode:function(){
        if (this.displayNode) {
            this.displayNode.removeFromParent();
            this.displayNode.destroy();
            this.displayNode = null;
        }
    },

    clickLabel:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        switch (data.type) {
            case "spine":
                this.curSpineName = data.name;
                this.skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.SKILL,data.config.Skill);
                this.monsterConfig = data.config;
                this.spine.node.scale = data.config[jsonTables.CONFIG_MONSTER.CombatScale]/100;

                this.loadSpine();
                break;
            case "ani":
                this.spine.setAnimation(0,data.name,this.widget('Canvas/ui/New Toggle').getComponent(cc.Toggle).isChecked);
                break;
        }
    },

    loadSpine:function(){
        uiResMgr.loadSpine(this.curSpineName,function(spineData){
            this.spine.skeletonData  = spineData;
            this.spine.setAnimation(0,'std',true);
            this.initAnimation(spineData._skeletonJson.animations);
        }.bind(this))
    },

    init(){
        this.config = jsonTables.getJsonTable(jsonTables.TABLE.MONSTER);
        var list = this.config;
        var info = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var key = list[i][jsonTables.CONFIG_MONSTER.Resource];
            var obj = {name:key,type:"spine",config:list[i]}
            info.push(obj)
        }
        var refreshData = {
            content:this.widget('Canvas/ui/tipWorldScrollView/view/content'),
            list:info,
            prefab:this.labelItemPrefab,
            ext:this
        }
        uiManager.refreshView(refreshData);
    },

    initAnimation:function(animations){
        var list = Object.keys(animations);
        var info = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var key = list[i];
            var obj = {name:key,type:"ani"}
            info.push(obj)
        }
        var refreshData = {
            content:this.widget('Canvas/ui/tipAniScrollView/view/content'),
            list:info,
            prefab:this.labelItemPrefab,
            ext:this
        }
        uiManager.refreshView(refreshData);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
