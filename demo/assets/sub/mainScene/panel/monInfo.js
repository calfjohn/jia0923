var panel = require("panel");
var toggleHelper = require('toggleHelper');

cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        switchFace:[cc.Node],
        qualityBgSp:[cc.SpriteFrame],
        btnSp:[cc.SpriteFrame],
        skillPrefab:cc.Prefab,
        talentPrefab:cc.Prefab,
        iconFrame:[cc.SpriteFrame],
        iconSprite:cc.Sprite,
        talentPos:[cc.Vec2],
        profressFrame:[cc.SpriteFrame],
        upAni:cc.Animation,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.spineZOrder = [5,3,4,2,1];//按照spine层级排序，idx表示spine的后缀
        this.showIdx = 1;
        this.upAni.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshHeros", this.refreshHeros.bind(this)],
            ["updateBtn", this.updateUpBtn.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    onFinished:function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.upAni.node.active = false;
    },
    open: function (familyID,panelID) {
        this.isFirstMsg = true;//消耗万能碎片需要提醒
        this.form = 1;
        this.clientEvent.dispatchEvent("setLineUpActive",false);
        this.familyID = familyID;
        this.monsterBaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);//家族配置表基本数据
        this.quality = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        this.initTid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
        this.lastBtnIdx = !panelID?0:panelID;
        this.toggleHelperJs.setIdxToggleCheck(this.lastBtnIdx);
        for (var i = 0 , len = this.switchFace.length; i < len; i++) {
            this.switchFace[i].active = i === this.lastBtnIdx;
        }
        this.refreshHeros();
        for(var i = 0; i < this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters].length ;i ++){
            var tid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][i];
            let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
            let path = 'monInfo/shrink/left/spine/spine'+i;
            this.widget(path).setLocalZOrderEx(this.spineZOrder[i]);
            this.widget(path).active = false;
            let callBack = function(spineData){
                this.widget(path).getComponent(sp.Skeleton).skeletonData  = spineData;
                this.widget(path).getComponent(sp.Skeleton).setAnimation(0,'std',true);
                this.widget(path).active = true;
            }.bind(this);
            uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callBack);
            this.widget(path).x = spineConfig[jsonTables.CONFIG_MONSTER.XOffset];
            this.widget(path).y = spineConfig[jsonTables.CONFIG_MONSTER.YOffset];
            this.widget(path).scale = spineConfig[jsonTables.CONFIG_MONSTER.DateScale] / 100;
            if(i >= this.showIdx &&  this.monsterData.Quality <= i){
                this.widget(path).color = uiColor.black;
            }
        }
    },
    refreshRedDot:function () {
        this.widget("monInfo/shrink/toggleContainer/toggle1/redPoint").active = this.cardLogic.checkMonLvUp(this.familyID);
        this.widget("monInfo/shrink/toggleContainer/toggle3/redPoint").active = this.cardLogic.checkMonSkillUp(this.familyID);
    },
    refreshHeros:function(roll){
        this.initShowData = this.cardLogic.getShowNum(this.initTid);
        this.monsterData = this.cardLogic.getHeroesById(this.familyID);//服务端给过来来的数据

        var tid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
        this.iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid)[jsonTables.CONFIG_MONSTER.Icon];
        // this.needDebris = this.formulaLogic.calcuateDebris(this.monsterData.Lv,this.quality);//升级所需要的碎片数量
        // this.needGold = this.formulaLogic.calcuateGoldForLv(this.monsterData.Lv,this.quality);
        // this.getExp = this.formulaLogic.calcuateExpForLv(this.monsterData.Lv);
        this.needDebris = this.monsterData.Clip;//升级所需要的碎片数量
        this.needGold = this.monsterData.Gold;
        this.getExp = this.monsterData.UpgradeExp;
        this.refreshLeft();
        this.refreshUI(roll);
        this.refreshRedDot();
    },
    refreshUI:function(roll){
        // if(this.lastBtnIdx !== 0){
        //     for (var i = 0 , len = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters].length; i < len; i++) {
        //         this.widget('monInfo/interface/left/spine/spine'+i).color =i >= this.showIdx && this.monsterData.Quality <= i ? uiColor.black : uiColor.monInfo.white;
        //         this.widget('monInfo/interface/left/spine/spine'+i).setLocalZOrderEx(this.spineZOrder[i]);
        //     }
        //     this.refreshShow(this.initShowData);
        // }
        switch (this.lastBtnIdx) {
            case 0:
                this.refreshInfo(this.form,roll);
                break;
            case 1:
                this.reFreshSkill();
                break;
            case 2:
                this.reFreshTalent();
                break;
        }
    },
    refreshLeft:function(){
        //当前等级
        this.widget("monInfo/shrink/left/number").getComponent(cc.Label).string = "LV" + this.monsterData.Lv;
        this.widget("monInfo/shrink/infoInterface/progress/number").getComponent(cc.Label).string = "LV" + this.monsterData.Lv;
        //名字
        jsonTables.loadConfigTxt(this.widget("monInfo/shrink/left/nameLabel"),this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        //品质等级
        uiResMgr.loadQualityLvIcon(this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality],this.widget("monInfo/shrink/left/icon"));
        this.widget("monInfo/shrink/left").getComponent(cc.Sprite).spriteFrame = this.qualityBgSp[this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];
        //怪物种类
        uiResMgr.loadMonTypeIcon(this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("monInfo/shrink/left/family"));
        //领导力
        // this.widget("monInfo/shrink/intoCrown1/numberLabel2").getComponent(cc.Label).string = this.cardLogic.getCurFormationLeader() + "/" + this.userLogic.getBaseData(this.userLogic.Type.Leader);
        //怪物种类
        // var baseData = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
        // this.widget("monInfo/shrink/numberLabel").getComponent(cc.Label).string = this.cardLogic.getMonKinds() + "/" + baseData.length;
        var isUp = this.cardLogic.checkUp(this.familyID);
        this.widget('monInfo/shrink/infoInterface/buttonUp').getComponent(cc.Button).interactable = !isUp;
        this.widget('monInfo/shrink/infoInterface/buttonUp').getComponent(cc.Sprite).spriteFrame = !isUp?this.btnSp[1]:this.btnSp[0];
        this.widget('monInfo/shrink/infoInterface/buttonUp/label').getComponent(cc.Label).string =isUp? uiLang.getMessage(this.node.name,"lineUped"):uiLang.getMessage(this.node.name,"lineUp")
        this.widget("monInfo/shrink/toggleContainer/toggle4/lockEffect").active = this.cardLogic.isMonTalentEnable(this.familyID) !== 0;
    },

    unOpen:function(){
        var re = this.cardLogic.isMonTalentEnable(this.familyID);
        switch (re) {
            case 1://后台
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.get("unOpen"));
                break;
            case 2://章节
                jsonTables.tipUnOpenFuntionMsg(constant.FunctionTid.MON_TALENT);
                break;
            case 3://传说
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"lengen"));
                break;
        }
    },

    clickLineUp:function(){
        this.close();
        this.clientEvent.dispatchEvent("monLineUp",this.familyID);
    },
    clickNext:function(){
        var id = this.cardLogic.getNextMon(this.familyID+"");
        var idx = this.lastBtnIdx;
        if(idx === 2){
            idx = 0;
        }
        this.open(parseInt(id),idx);
    },
    clickLast:function(){
        var id = this.cardLogic.getLastMon(this.familyID+"");
        var idx = this.lastBtnIdx;
        if(idx === 2){
            idx = 0;
        }
        this.open(parseInt(id),idx);
    },
    refreshShow:function(data){
        //战斗力
        this.widget("monInfo/shrink/left/sword/number").getComponent(cc.Label).string = data.sword;
        //防御力
        this.widget("monInfo/shrink/left/shield/number").getComponent(cc.Label).string = data.shield;
    },
    refreshForm:function (form,unRefresh) {
        if(!unRefresh){
            var tid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form-1];
            var showData =tid === this.initTid ? this.initShowData : this.cardLogic.getShowNum(tid);
            this.refreshShow(showData);
        }
        for (var i = 1 , len =  this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters].length + 1; i < len; i++) {
            var color = i === form ? uiColor.monInfo.white:uiColor.monInfo.gray;
            this.widget('monInfo/shrink/left/spine/spine'+(i-1)).color = color;
            var idx = this.showIdx + 1;
            if(i >= idx && this.monsterData.Quality < i){
                this.widget('monInfo/shrink/left/spine/spine'+(i-1)).color = uiColor.black;
            }
            var skeleton = this.widget('monInfo/shrink/left/spine/spine'+(i-1)).getComponent(sp.Skeleton);
            if (i === form) {
                skeleton.setAnimation(0,"atk",false);
                skeleton.addAnimation(0,"std",true);
                this.widget('monInfo/shrink/left/spine/spine'+(i-1)).setLocalZOrderEx(10);//当前选中形态设为最高层级
            }else{
                // skeleton.setAnimation(0,"std",true);
                this.widget('monInfo/shrink/left/spine/spine'+(i-1)).setLocalZOrderEx(this.spineZOrder[i-1]);
            }
            this.widget('monInfo/shrink/left/iconContent/formEffect'+i+"/hookEffect").active = i === form;
            // this.widget('monInfo/shrink/infoInterface/icon/formEffect'+i+"/label").active = i === form;
            this.widget('monInfo/shrink/left/iconContent/formEffect'+i+"/lockEffect").active = i >= idx && this.monsterData.Quality < i;
            this.widget('monInfo/shrink/left/iconContent/formEffect'+i).getComponent(cc.Button).interactable = i < idx || this.monsterData.Quality >= i;
        }
    },

    refreshOneLabel:function (name,roll,value) {
        this.widget("monInfo/shrink/infoInterface/baseInfo/" + name + "/num/number").getComponent("scaleAni").init(value,!roll,5,false,true);
        // if(roll && Number(this.widget("monInfo/shrink/infoInterface/baseInfo/" + name + "/num/number").getComponent(cc.Label).string) !== value){
        //     var aniNode = this.widget("monInfo/shrink/infoInterface/baseInfo/" + name + "/num/arrow1");
        //     aniNode.active = true;
        //     aniNode.getComponent(cc.Animation).play();
        //     if(this[name + "Action"]){
        //         this.unschedule(this[name + "Action"]);
        //     }
        //     this[name + "Action"] = function () {
        //         aniNode.active = false;
        //         this[name + "Action"] = undefined;
        //     }.bind(this);
        //     this.scheduleOnce(this[name + "Action"],0.8);
        // }
    },

    refreshInfo:function(form,roll){
        var tid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form-1];
        var showData =tid === this.initTid ? this.initShowData : this.cardLogic.getShowNum(tid);
        this.refreshShow(showData);
        var formConfig =  jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);

        // this.widget("monInfo/interface/infoInterface/content/frameEffect3/sword/number").getComponent("scaleAni").init(this.initShowData.sword,!roll,5);

        //所需领导力
        this.widget("monInfo/shrink/infoInterface/intoFrame22/intoCrown/label").getComponent(cc.Label).string = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        //血量
        this.refreshOneLabel("blood",roll,showData.HpBase);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/blood/num/number").getComponent("scaleAni").init(showData.HpBase,!roll,5);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/blood/num/number").getComponent(cc.Label).string = showData.HpBase;
        //攻击力
        // this.widget("monInfo/shrink/infoInterface/baseInfo/damage/num/number").getComponent("scaleAni").init(showData.DbBase,!roll,5);//Math.floor((PsBase + MsBase) / 2);
        this.refreshOneLabel("damage",roll,showData.DbBase);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/damage/num/number").getComponent(cc.Label).string = showData.DbBase;//Math.floor((PsBase + MsBase) / 2);
        //射程
        // this.widget("monInfo/shrink/infoInterface/baseInfo/atcLength/num/number").getComponent("scaleAni").init(formConfig[jsonTables.CONFIG_MONSTER.RangeMax],!roll,5);
        this.refreshOneLabel("atcLength",roll,formConfig[jsonTables.CONFIG_MONSTER.RangeMax]);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/atcLength/num/number").getComponent(cc.Label).string = formConfig[jsonTables.CONFIG_MONSTER.RangeMax];
        //物理伤害
        // this.widget("monInfo/shrink/infoInterface/baseInfo/phtDamage/num/number").getComponent("scaleAni").init(showData.PsBase,!roll,5);
        this.refreshOneLabel("phtDamage",roll,showData.PsBase);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/phtDamage/num/number").getComponent(cc.Label).string = showData.PsBase;
        //物理防御
        // this.widget("monInfo/shrink/infoInterface/baseInfo/phyDefense/num/number").getComponent("scaleAni").init(showData.PdBase,!roll,5);
        this.refreshOneLabel("phyDefense",roll,showData.PdBase);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/phyDefense/num/number").getComponent(cc.Label).string = showData.PdBase;
        //魔法伤害
        // this.widget("monInfo/shrink/infoInterface/baseInfo/magicDamage/num/number").getComponent("scaleAni").init(showData.MsBase,!roll,5);
        this.refreshOneLabel("magicDamage",roll,showData.MsBase);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/magicDamage/num/number").getComponent(cc.Label).string = showData.MsBase;
        //魔法防御
        // this.widget("monInfo/shrink/infoInterface/baseInfo/magicDefence/num/number").getComponent("scaleAni").init(showData.MdBase,!roll,5);
        this.refreshOneLabel("magicDefence",roll,showData.MdBase);
        // this.widget("monInfo/shrink/infoInterface/baseInfo/magicDefence/num/number").getComponent(cc.Label).string = showData.MdBase;
        var iconRes = formConfig[jsonTables.CONFIG_MONSTER.Icon];
        uiResMgr.loadRewardIcon(this.widget("monInfo/shrink/infoInterface/intoFrame22/monIcon"),constant.ItemType.CARD,this.familyID,this.widget("monInfo/interface/infoInterface/intoFrame22"),this.widget("monInfo/interface/infoInterface/intoFrame22/headFrame"));
        // uiResMgr.loadHeadIcon(this.iconRes,this.widget("monInfo/shrink/infoInterface/intoFrame22/monIcon"));
        // uiResMgr.loadQualityIcon(this.quality,this.widget("monInfo/shrink/infoInterface/intoFrame22/headFrame"));
        // uiResMgr.loadBaseQualityIcon(this.quality,this.widget("monInfo/shrink/infoInterface/intoFrame22"));
        // uiResMgr.loadRewardIcon(this.widget("monInfo/shrink/infoInterface/intoFrame22/monIcon"],constant.ItemType.HERO,this.familyID,this.widget("monInfo/interface/infoInterface/intoFrame22"),this.widget("monInfo/interface/infoInterface/intoFrame22/headFrame"));
        this.widget("monInfo/shrink/infoInterface/progress/digitalLabel").getComponent(cc.Label).string = this.monsterData.Num + "/" + this.needDebris;
        this.widget("monInfo/shrink/infoInterface/progress/loading3").getComponent(cc.ProgressBar).progress = this.monsterData.Num / this.needDebris;
        this.widget("monInfo/shrink/infoInterface/progress/experience1/numberLabel").getComponent(cc.Label).string = this.getExp;
        this.refreshForm(form,true);
        this.updateUpBtn();
    },
    refreshUpLv:function(roll){
        //TODO 等界面确认后删除代码
        // this.widget("monInfo/shrink/infoInterface/content/frameEffect3/levelFrame/number").getComponent(cc.Label).string =uiLang.getMessage(this.node.name,"lv") + this.monsterData.Lv;
        // this.widget("monInfo/shrink/infoInterface/progress/digitalLabel").getComponent(cc.Label).string = this.monsterData.Num +"/" + this.needDebris;
        // this.widget('monInfo/shrink/infoInterface/progress/loading3').getComponent(cc.ProgressBar).progress = this.monsterData.Num / this.needDebris;
        //
        // //战斗力
        // this.widget("monInfo/shrink/infoInterface/content/frameEffect3/sword/number").getComponent("scaleAni").init(this.initShowData.sword,!roll,5);
        // //防御力
        // this.widget("monInfo/shrink/infoInterface/content/frameEffect3/shield/number").getComponent("scaleAni").init(this.initShowData.shield,!roll,5);
        // if(roll){
        //     for (var i = 0 , len = 4; i < len; i++) {
        //         this.widget("monInfo/shrink/infoInterface/effect" + i).getComponent(cc.Animation).play();
        //     }
        // }
        // this.monsterNextLvData =this.cardLogic.getShowNum(this.initTid,this.monsterData.Lv + 1);;//怪物下一个等级表得基本数据
        // // uiResMgr.loadRewardIcon(this.widget("monInfo/shrink/infoInterface/content/frameEffect3/quality2/head"),constant.ItemType.CARD,this.familyID,this.widget("monInfo/interface/infoInterface/content/frameEffect3/quality2"),this.widget("monInfo/interface/infoInterface/content/frameEffect3/quality2/qualityFrame1"));
        // // uiResMgr.loadRewardIcon(this.widget("monInfo/shrink/infoInterface/content/frameEffect4/quality2/head"),constant.ItemType.CARD,this.familyID,this.widget("monInfo/interface/infoInterface/content/frameEffect4/quality2"),this.widget("monInfo/interface/infoInterface/content/frameEffect4/quality2/qualityFrame1"));
        // if(!this.monsterNextLvData) return;
        // this.widget("monInfo/shrink/infoInterface/content/frameEffect4/levelFrame/number").getComponent(cc.Label).string =uiLang.getMessage(this.node.name,"lv") + (this.monsterData.Lv + 1 );

        // //战斗力
        // this.widget("monInfo/shrink/infoInterface/content/frameEffect4/sword/number").getComponent("scaleAni").init(this.monsterNextLvData.sword,!roll);
        // //防御力
        // this.widget("monInfo/shrink/infoInterface/content/frameEffect4/shield/number").getComponent("scaleAni").init(this.monsterNextLvData.shield,!roll);
        this.updateUpBtn();
    },
    updateUpBtn:function(){
        var canUp = true;
        // this.widget("monInfo/shrink/infoInterface/button2/gold/numberLabel1").getComponent(cc.Label).string = this.needGold;
        // this.iconSprite.spriteFrame = this.iconFrame[1];
        this.widget("monInfo/shrink/infoInterface/gold/numberLabel").color = uiColor.white;
        this.widget("monInfo/shrink/infoInterface/gold/numberLabel").getComponent(cc.Label).string =NP.dealNum(this.needGold,constant.NumType.TEN);
        this.widget("monInfo/shrink/infoInterface/progress/loading3").getComponent(cc.Sprite).spriteFrame = this.monsterData.Num < this.needDebris?this.profressFrame[0]:this.profressFrame[1];
        var addNum = 0;
        if(this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] >= 5){
            addNum = this.cardLogic.getPubHeroClip();
        }
        if(this.needGold > this.userLogic.getBaseData(this.userLogic.Type.Gold)){
            canUp = false;
            // this.widget("monInfo/shrink/infoInterface/button2/gold/numberLabel1").getComponent(cc.Label).string = "/" + this.needGold;
            this.widget("monInfo/shrink/infoInterface/gold/numberLabel").color = uiColor.monInfo.red;
        }else if(this.monsterData.Num + addNum < this.needDebris){
            // this.widget("monInfo/shrink/infoInterface/button2/gold/numberLabel").getComponent(cc.Label).string = this.monsterData.Num;
            // this.widget("monInfo/shrink/infoInterface/button2/gold/numberLabel1").getComponent(cc.Label).string = "/" + this.needDebris;
            canUp = false;
        }
        this.widget('monInfo/shrink/infoInterface/progress/arrowUp').active = canUp;
        this.widget('monInfo/shrink/infoInterface/button2').getComponent(cc.Button).interactable = canUp;
        this.widget('monInfo/shrink/infoInterface/button2').getComponent(cc.Sprite).spriteFrame = canUp?this.btnSp[2]:this.btnSp[0];
        // this.widget("monInfo/shrink/upLvInterface/button2/label").getComponent(cc.Label).fontSize = canUp?30:26;
        // this.widget("monInfo/shrink/upLvInterface/button2/label").y = canUp?17:26;
        // this.widget("monInfo/shrink/infoInterface/button2/gold/numberLabel").active = !canUp;
        // this.widget("monInfo/shrink/upLvInterface/button2/gold").active = !canUp;
        this.refreshRedDot();

    },
    reFreshSkill:function(){
        var monsters = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters];
        var monsterData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsters[monsters.length - 1]);
        var lastSkillID = monsterData[jsonTables.CONFIG_MONSTER.Skill];
        if(!lastSkillID){
            console.error("策划没配怪物"+this.familyID +"第五等级得技能，拉出去毙了");
        }else{
            var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.SKILL,lastSkillID);
            var skillIcon = skillConfig[jsonTables.CONFIG_SKILL.Icon];
            uiResMgr.loadSkillIcon(skillIcon,this.widget("monInfo/shrink/skillInterface/mainSkill/mask/skillIcon"));
            this.widget("monInfo/shrink/skillInterface/mainSkill/skillLabel1").getComponent(cc.Label).string = uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_SKILL.SkillName]);
            var des = uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_SKILL.SkillDes]);
            var num = skillConfig[jsonTables.CONFIG_SKILL.Num];
            var purpleLv = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.PurpleSkillLv];
            var orangeLv = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.OrangeSkillLv];
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
            this.widget("monInfo/shrink/skillInterface/mainSkill/hurtLabel").getComponent(cc.Label).string = des;
        }
        var list = this.monsterData.SkillInfo;
        // for (var i = 0 , len = this.monsterData.SkillLv.length; i < len; i++) {
        //     var obj = this.monsterData.SkillLv[i];
        //     var data = {
        //         familyID:this.familyID,
        //         skillID:obj,
        //         maxLv:this.monsterData.SkillMaxLv[i]
        //     }
        //     list.push(data);
        // }
        var extInfo = {
            familyID:this.familyID,
            quality:this.quality,
            isReel:false
        }
        var refreshData = {
            content:this.widget("monInfo/shrink/skillInterface/content"),
            list:list,
            prefab:this.skillPrefab,
            ext:extInfo
        }
        uiManager.refreshView(refreshData);
    },
    reFreshTalent:function(){
        this.updatePro();
        var list = this.monsterData.TalentInfo;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            obj.pos = this.talentPos[i];
        }
        var refreshData = {
            content:this.widget("monInfo/shrink/awakenInterface/frameEffect3/content"),
            list:list,
            prefab:this.talentPrefab,
            ext:this.familyID
        }
        uiManager.refreshView(refreshData);
    },
    updatePro:function(){
        this.widget("monInfo/shrink/awakenInterface/frame2/numberLabel").getComponent(cc.Label).string = this.cardLogic.getHeroesPro(this.familyID);
        this.widget("monInfo/shrink/awakenInterface/frame3/numberLabel").getComponent(cc.Label).string = this.cardLogic.getPublicHeroesPro();
    },
    clickResetTalent:function(){
        var useStr = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.AwakeResetPrice);
        var arr = useStr.split("#");
        var callback = function(){
            this.cardLogic.Req_Hero_Talent_Reset(this.familyID);
        };
        var str = uiLang.getMessage("talentPanel","reset") + arr[2] + rText.getMsgCurrency(parseInt(arr[0])) + uiLang.getMessage("talentPanel","resetSure");
        uiManager.msgDefault(str,callback.bind(this));
    },
    swichForm:function(event,param) {
        var num = Number(param);
        if(this.form === num){
            var skeleton = this.widget('monInfo/shrink/left/spine/spine'+(num-1)).getComponent(sp.Skeleton);
            if(skeleton.animation === "std"){
                skeleton.setAnimation(0,"atk",false);
                skeleton.addAnimation(0,"std",true);
            }
            return;
        };
        this.form = num;
        if(this.lastBtnIdx === 0){
            this.refreshInfo(this.form);
        }else{
            this.refreshForm(this.form);
        }
    },
    switchBtnEvent:function(event,btnIdx){
        var idx = parseInt(btnIdx);
        if( idx === this.lastBtnIdx)    return;
        if(this.lastBtnIdx !== undefined){
            this.switchFace[this.lastBtnIdx].active = false;
        }
        this.switchFace[idx].active = true;
        this.lastBtnIdx = idx;
        this.refreshUI();
    },
    ///引导专用
    switchBtnEventForGuide:function(_,idx){
        this.toggleHelperJs.setIdxToggleCheck(idx);
        this.switchBtnEvent(null,idx);
    },

    close:function(){
        this.clientEvent.dispatchEvent("setLineUpActive",true);
    },

    upLvEvent:function(event){
        var cb = function () {
            var initPos = this.widget('monInfo/shrink/infoInterface/button2').convertToWorldSpaceAR(cc.v2(0,0));
            this.upAni.node.active = true;
            this.upAni.play();
            this.cardLogic.req_Hero_LvUp(this.familyID,initPos);
        }.bind(this);
        if(this.isFirstMsg && this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] >= 5 && this.monsterData.Num < this.needDebris){
            var str = uiLang.getMessage(this.node.name,"userDebris") + (this.needDebris - this.monsterData.Num) + rText.getMsgCurrency(constant.Currency.PUBLICLIP) + uiLang.getMessage(this.node.name,"userDebris2");
            uiManager.msgDefault(str,cb);
            this.isFirstMsg = false;
        }else{
            cb();
        }
    },
    openUi:function(_,param){
        // if () return;
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },
    // update (dt) {},
});
