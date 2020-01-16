var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        qualitySp:[cc.SpriteFrame],
        qualityBgSp:[cc.SpriteFrame],
        typeSp:[cc.SpriteFrame],
        skillPrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.showIdx = 4;
    },
    //这里暂时只处理pve情况  其他情况要调用这个界面 要重写获取技能的方式
    open: function (monsterID,lv,id,chapterID,curWaves) {//id 章节id,chapterID关卡 curWaves波次
        this.id = id;
        this.chapterID = chapterID;
        this.curWaves = curWaves;
        this.isMine = lv === undefined;
        this.lv = lv;
        this.monsterID = monsterID;//卷轴配置表基本数据
        this.monsterConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,this.monsterID);
        this.familyID = this.monsterConfig[jsonTables.CONFIG_MONSTER.FamilyID];
        this.monsterBaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);//家族配置表基本数据
        this.quality = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        this.initTid = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
        this.refreshHeros();
        let path = 'fightFamily/shrink/left/spine/spine2';
        let callBack = function(spineData){
            this.widget(path).getComponent(sp.Skeleton).skeletonData  = spineData;
            this.widget(path).getComponent(sp.Skeleton).setAnimation(0,'std',true);
        }.bind(this);
        uiResMgr.loadSpine(this.monsterConfig[jsonTables.CONFIG_MONSTER.Resource],callBack);
        // this.widget(path).x = this.monsterConfig[jsonTables.CONFIG_MONSTER.XOffset];
        // this.widget(path).y = this.monsterConfig[jsonTables.CONFIG_MONSTER.YOffset];
        this.widget(path).scale = this.monsterConfig[jsonTables.CONFIG_MONSTER.DateScale] / 100;
    },
    refreshHeros:function(){
        this.monsterData = this.cardLogic.getHeroesById(this.familyID);//服务端给过来来的数据
        var skillList = undefined;
        if (this.isMine) {
            this.lv = this.monsterData?this.monsterData.Lv:1;
        }else {
            skillList = this.chapterLogic.getSkillList(this.id,this.chapterID,this.monsterID,this.curWaves);
        }
        this.initShowData = this.cardLogic.getShowNum(this.monsterID,this.lv,skillList);
        this.refreshLeft();
        this.refreshInfo();
        this.reFreshSkill();
    },
    refreshLeft:function(){
        //攻击值
        this.widget("fightFamily/shrink/left/sword/number").getComponent(cc.Label).string = this.initShowData.sword;
        //防御值
        this.widget("fightFamily/shrink/left/shield/number").getComponent(cc.Label).string = this.initShowData.shield;
        //当前等级
        this.widget("fightFamily/shrink/left/number").getComponent(cc.Label).string = "LV" + this.lv;
        //名字
        jsonTables.loadConfigTxt(this.widget("fightFamily/shrink/nameLabel"),this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        //品质等级
        this.widget("fightFamily/shrink/left/icon").getComponent(cc.Sprite).spriteFrame = this.qualitySp[this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];
        this.widget("fightFamily/shrink/left").getComponent(cc.Sprite).spriteFrame = this.qualityBgSp[this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];
        //怪物种类
        uiResMgr.loadMonTypeIcon(this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("fightFamily/shrink/left/family"));
    },
    refreshInfo:function(){
        var showData = this.initShowData;
        //血量
        this.widget("fightFamily/shrink/baseInfo/blood/number").getComponent(cc.Label).string = showData.HpBase;
        //攻击力
        this.widget("fightFamily/shrink/baseInfo/damage/number").getComponent(cc.Label).string = showData.DbBase;//Math.floor((PsBase + MsBase) / 2);
        //射程
        this.widget("fightFamily/shrink/baseInfo/atcLength/number").getComponent(cc.Label).string = this.monsterConfig[jsonTables.CONFIG_MONSTER.RangeMax];
        //物理伤害
        this.widget("fightFamily/shrink/baseInfo/phtDamage/number").getComponent(cc.Label).string = showData.PsBase;
        //物理防御
        this.widget("fightFamily/shrink/baseInfo/phyDefense/number").getComponent(cc.Label).string = showData.PdBase;
        //魔法伤害
        this.widget("fightFamily/shrink/baseInfo/magicDamage/number").getComponent(cc.Label).string = showData.MsBase;
        //魔法防御
        this.widget("fightFamily/shrink/baseInfo/magicDefence/number").getComponent(cc.Label).string = showData.MdBase;
        var form = this.monsterConfig[jsonTables.CONFIG_MONSTER.Form];
        this.widget("fightFamily/shrink/baseInfo/rarity").getComponent(cc.Sprite).spriteFrame = this.typeSp[form - 1];
        this.widget("fightFamily/shrink/baseInfo/label").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"raity" + form);
    },
    reFreshSkill:function(){
        var list = [];
        if (this.isMine) {
            if(this.monsterData){
                list = this.monsterData.SkillInfo;
            }else{
                for (var i = 0 , len = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Skill].length; i < len; i++) {
                    var obj = this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.Skill][i];
                    var info ={
                        skillID:obj,
                        skillLv:0,
                        maxLv:this.monsterBaseData[jsonTables.CONFIG_MONSTERFAMILY.SkillMaxLv][i]
                    }
                    list.push(info);
                }
            }
        }else {
            list = this.chapterLogic.getSkillList(this.id,this.chapterID,this.monsterID,this.curWaves);
        }
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
            isReel:true
        }
        var refreshData = {
            content:this.widget("fightFamily/shrink/content"),
            list:list,
            prefab:this.skillPrefab,
            ext:extInfo
        }
        uiManager.refreshView(refreshData);
    },
    // update (dt) {},
});
