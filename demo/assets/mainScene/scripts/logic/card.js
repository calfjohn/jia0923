/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-15T14:01:14+08:00
 */

window["logic"]["card"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var chapterLogic = null;
    var mineLogic = null;
    var formulaLogic = null;
    var guideLogic = null;
    var userLogic = null;
    var treasureLogic = null;
    var mailLogic = null;

    var _EVENT_TYPE = [
        "refreshNewReel",
        "refreshHeros",
        "refreshSmeltCount",
        "refreshSmeltList",
        "updateMonster",
        "lineUpSuccess",
        "monLineUp",
        "showReplace",
        "setLineUpActive",
        "checkLineUpRedDot",
        "leaderWeek",
        "refreshGetNew",
    ];

    module.REEL_FORM_ENUM = {
        ALL:0,
        LEGEND:1,
        EPIC:2,
        EXCELLENT:3,
    };

    module.REEL_UI_2_MNSTER = {
        1:5,
        2:4,
        3:3,
    };

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.publicHeroPro = 0;//通用熟练度
        this.pubHeroClip = 0;//通用SSS碎片
        this.formationsIdx = 0;//当前阵容索引
        this.formations = [];//已经上阵的卡组列表  里面元素为家族数组id
        this.heroes = {};//卡组里面元素为一个结构体对象 Hero_Info
        this.reelIds = [];//卷轴的所有id
        this.reelInfos = [];//对应卷轴信息
        this.smeltRule = null;
        this.playFamilyList = [];
        this.newFamilyList = [];
        this.sortList = [];
        this.playSpecial = false;//前几个新获得家族时，需要提示表现
        this.needRecord = false;//更换家族时是否需要打点
    };

    module.initModule = function(){
        network = kf.require("util.network");
        userLogic = kf.require("logic.user");
        clientEvent = kf.require("basic.clientEvent");
        chapterLogic = kf.require("logic.chapter");
        mineLogic = kf.require("logic.mine");
        formulaLogic = kf.require("logic.formula");
        guideLogic = kf.require("logic.guide");
        treasureLogic = kf.require("logic.treasure");
        mailLogic = kf.require("logic.mail");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_PlayerData_Hero", this.onResp_PlayerData_Hero.bind(this));
        network.registerEvent("Resp_Hero_Formation", this.onResp_Hero_Formation.bind(this));//请求上阵回复
        network.registerEvent("Resp_Hero_Create", this.onResp_Hero_Create.bind(this));//请求怪物创建
        network.registerEvent("Resp_PlayerUpdate_Hero", this.onResp_PlayerUpdate_Hero.bind(this));//刷新怪物数据
        network.registerEvent("Resp_Hero_LvUp", this.onResp_Hero_LvUp.bind(this));//请求怪物升级
        network.registerEvent("Resp_PlayerUpdate_Reel", this.onResp_PlayerUpdate_Reel.bind(this));//卷轴更新
        network.registerEvent("Resp_Reel_Formation", this.onResp_Reel_Formation.bind(this));//卷轴阵容设置
        network.registerEvent("Resp_Hero_Skill_LvUp", this.onResp_Hero_Skill_LvUp.bind(this));//请求怪物技能升级

        network.registerEvent("Resp_Frag_Refine", this.onResp_Frag_Refine.bind(this));//熔炼卡片
        network.registerEvent("Resp_Refine_Rule", this.onResp_Refine_Rule.bind(this));//熔炼规则说明

        network.registerEvent("Resp_Hero_Talent_Upgrade", this.onResp_Hero_Talent_Upgrade.bind(this));//天赋升级成功回复
        network.registerEvent("Resp_Rec_FamilyExp", this.onResp_Rec_FamilyExp.bind(this));//老玩家经验值补偿
    };

    //更新英雄合成标识
    module.req_HeroQuality_Update = function(composeInfo){
        var data = {
            "Req_HeroQuality_Update": {
                "ComposeInfo":composeInfo
            }
        };
        network.send(data,true);
    };

    //熔炼卡片
    module.req_Frag_Refine = function(familyIDs,deepLv,count,isRandom){
        var data = {
            "Req_Frag_Refine": {
                "PosFamilyID":familyIDs,
                "GenLv":deepLv,
                "RefineNum":count,
                "GenFamilyID":isRandom// 指定生成卡片id，随机为 -1
            }
        };
        network.send(data);
    };
    module.onResp_Frag_Refine = function(param){//熔炼卡片
        clientEvent.dispatchEvent("refreshSmeltList",param.Rewards);
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SMELTGET);
    };

    //熔炼规则说明
    module.req_Refine_Rule = function(cb){
        if (this.smeltRule) return cb();
        var data = {
            "Req_Refine_Rule": {}
        };
        network.send(data,true);
    };
    module.onResp_Refine_Rule = function(param){//熔炼规则说明
        this.smeltRule = {};
        for (var i = 0 , len = param.UseFrag.length; i < len; i++) {
            var obj = param.UseFrag[i];
            this.smeltRule.toggleCount = this.smeltRule.toggleCount || [];
            if (!kf.inArray(this.smeltRule.toggleCount,obj)) {
                this.smeltRule.toggleCount.push(obj);
            }
            var isAddQulaity = param.GenLv[i] === 1;
            this.smeltRule[obj] = this.smeltRule[obj] || {};
            this.smeltRule[obj].isAddQulaity = isAddQulaity;
            this.smeltRule[obj].costGold = this.smeltRule[obj].costGold || {};
            this.smeltRule[obj].costGold[param.Design[i]] = param.Cost[i];
        }
        this.smeltRule.DescID = param.DescID;
        this.smeltRule.CostBase = param.CostBase;
        this.smeltRule.DailyMax = param.DailyMax;
        clientEvent.dispatchEvent("refreshSmeltCount",param.RefineNum,this.smeltRule);
    };

    module.onResp_PlayerUpdate_Reel = function (param) {//卷轴更新
        jsonTables.addEleOrUpdate(this.reelInfos,param.Reel,function(srcObj,desObj){
            return srcObj.ID === desObj.ID;
        },true);
        jsonTables.removeByKey(this.reelInfos,param.Reel,function (srcObj,desObj) {
            if (srcObj.ID === desObj.ID) {
                if (desObj.Num === 0) {
                    var idx = this.reelIds.indexOf(desObj.ID);
                    if (idx !== -1) {
                        this.reelIds[idx] = 0;
                        console.log("removeReel",desObj);
                    }
                    return true;
                }
                return false;
            }
        }.bind(this));
        clientEvent.dispatchEvent("refreshNewReel");
    };

    module.onResp_PlayerData_Hero = function (param) {//服务端回复用户整容数据
        this.publicHeroPro = param.PubHeroPro;//通用熟练度
        this.pubHeroClip = param.PubHeroClip;
        this.formationsIdx = param.FormationIdx;
        this.formations = param.Formations;
        for (var i = 0 , len = param.Heroes.length; i < len; i++) {
            var obj = param.Heroes[i];
            this.heroes[obj.FamilyID] = obj;
            this.heroes[obj.FamilyID].SkillInfo = this.dealSkill(obj.SkillLv,obj.SkillMaxLv,obj.SkillUpGold,obj.SkillUpExp);
            this.heroes[obj.FamilyID].TalentInfo = this.dealTalent(obj.Talents);
        }
        this.reelIds = param.ReelsFormation;
        this.reelInfos = param.Reels;
        this.checkLineUpRedDot();
        this.oldExp = param.OldExp;
    };

    module.initOldExp = function () {
        if(!this.oldExp)    return;
        if(this.oldExp){
            var callback = function () {
                this.req_Rec_FamilyExp();
            }.bind(this);
            var list = [{Type:constant.ItemType.EXP,ID:0,Num:this.oldExp}];
            uiManager.openUI(uiManager.UIID.REWARDMSG,list,callback,uiLang.getMessage("rewardMsg","expMsg"));
            this.oldExp = 0;
        }
    };

    //老玩家经验值补偿
    module.req_Rec_FamilyExp = function(){
        var data = {
            "Req_Rec_FamilyExp": {}
        };
        network.send(data,true);
    };
    module.onResp_Rec_FamilyExp = function(param){//响应//老玩家经验值补偿
    };

    //卷轴阵容设置
    module.req_Reel_Formation = function(reelIDs){
        var data = {
            "Req_Reel_Formation": {
                "ReelIDs":reelIDs,
            }
        };
        network.send(data,true);
    };
    module.onResp_Reel_Formation = function(param){//响应卷轴阵容设置
        this.reelIds = param.ReelIDs;
        clientEvent.dispatchEvent("refreshNewReel");
    };

    //请求上阵
    module.reqHeroFormation = function(formationsIdx,idx,familyID){
        if(this.needRecord){
            window.adjustUtil.recored(tb.ADJUST_RECORED_NEWFAMILY_REPLACE);
            this.needRecord = false;
        }
        formationsIdx = formationsIdx || this.formationsIdx;
        var formations = kf.clone(this.formations);
        formations[formationsIdx].FamilyIDs[idx] = familyID;

        var replacePos = [];
        for (var i = 0 , len = this.formations[this.formationsIdx].FamilyIDs.length; i < len; i++) {
            var obj = this.formations[this.formationsIdx].FamilyIDs[i];
            if (obj !== formations[formationsIdx].FamilyIDs[i]) {
                replacePos.push(i);
            }
        }
        var data = {
            "Req_Hero_Formation": {
                "FormationIdx":formationsIdx,//操作阵容的索引 非当前阵容索引
                "Formations":formations[formationsIdx],
                "ReplacePos":replacePos
            }
        };
        network.send(data);
    };

    //请求上阵回复
    module.onResp_Hero_Formation = function(param,sentData){
        var oldFamily = [];
        var newFamily = [];
        for (var i = 0 , len = sentData.ReplacePos.length; i < len; i++) {
            var obj = sentData.ReplacePos[i];
            oldFamily.push(this.formations[param.FormationIdx].FamilyIDs[obj]);
            newFamily.push(param.Formations.FamilyIDs[obj]);
        }
        chapterLogic.resetStaticSandBoxInfo(oldFamily,newFamily);

        // this.formationsIdx = param.FormationIdx; // TODO: 移到操作阵容索引接口
        this.formations[param.FormationIdx] = param.Formations;

        clientEvent.dispatchEvent("lineUpSuccess");
        this.checkLineUpRedDot();
    };
    //请求合成怪物
    module.reqHeroCreate = function(familyID){
        var data = {
            "Req_Hero_Create": {
                "FamilyID":familyID,
            }
        };
        network.send(data,true);
    };
    //
    module.onResp_Hero_Create = function(param,sentData){
        var info = {
            FamilyID:sentData.FamilyID,
            Exp:param.Exp
        };
        this.adjustCreatRecord();
        if(uiManager.getUIActive(uiManager.UIID.OPENBOXANI)
        || uiManager.getUIActive(uiManager.UIID.SMELT_REWARD)
        || mailLogic.isOpenBoxFlag()){//是否正在播放开宝箱动画
            this.newFamilyList.push(info);
            this.playFamilyList.push(info);
        }else{
            uiManager.openUI(uiManager.UIID.FAMILY_EFFECT,info);
        }
        if(this.getMonKinds() <= jsonTables.getJsonTable(jsonTables.TABLE.GUIDE)[jsonTables.CONFIG_GUIDE.NewMonsterNum] + 3){
            this.setPlaySpecial(true);
        }
        // this.heroes = param.Heroes;
        // clientEvent.dispatchEvent("refreshHeros");
    };
    //创建家族时adjust
    module.adjustCreatRecord = function () {
        window.adjustUtil.recored(tb.ADJUST_RECORED_NEWFAMILY_GET,this.getMonKinds() + 1);
        if(this.getMonKinds() === 3){//第四个家族特殊
            this.needRecord = true;
            setTimeout(function () {
                this.needRecord = false;
            }.bind(this),30000);
        }
    },

    module.setPlaySpecial = function (state) {
        this.playSpecial = state;
        clientEvent.dispatchEvent("refreshGetNew");
    };

    module.getIsPlaySpecial = function () {
        return  this.playSpecial;
    };

    module.releaseFamilyList = function () {
        this.playFamilyList = [];
    };

    module.releasenewFamilyList = function () {
        this.newFamilyList = [];
    };

    module.getNewFamilyList = function (id) {
        var info;
        for (var i = 0 , len = this.newFamilyList.length; i < len; i++) {
            var obj = this.newFamilyList[i];
            if(obj.FamilyID === id){
                info = obj;
                this.newFamilyList.splice(i,1);
                break;
            }
        }
        return info;
    };

    //开宝箱动画结束了，判断一下是不是改播放合成家族动画
    module.playFamily = function(cb){
        if(this.playFamilyList.length === 0) {
            if (cb) {
                cb();
            }
            return
        }
        for (var i = 0 , len = this.playFamilyList.length; i < len; i++) {
            var obj = this.playFamilyList[i];
            var endCb = (i === (len - 1)) ? cb:null;
            uiManager.openUI(uiManager.UIID.FAMILY_EFFECT,obj,endCb);
        }
        this.playFamilyList = [];
    };

    module.onResp_PlayerUpdate_Hero = function(param){
        this.publicHeroPro = param.PubHeroPro;
        this.pubHeroClip = param.PubHeroClip;
        userLogic.input.refresh();
        for (var i = 0 , len = param.Heroes.length; i < len; i++) {
            var obj = param.Heroes[i];
            this.heroes[obj.FamilyID] = obj;
            this.heroes[obj.FamilyID].SkillInfo = this.dealSkill(obj.SkillLv,obj.SkillMaxLv,obj.SkillUpGold,obj.SkillUpExp);
            this.heroes[obj.FamilyID].TalentInfo = this.dealTalent(obj.Talents);
            clientEvent.dispatchEvent("updateMonster",this.heroes[obj.FamilyID]);
            //监听碎片变更，触发自动合成
            if(obj.Lv === 0){
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj.FamilyID);//家族配置表基本数据
                var needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];//解锁需要的碎片数
                if(obj.Num >= needDebris){
                    this.reqHeroCreate(obj.FamilyID);
                    userLogic.setCanPlayUpLvAni(true);//不允许弹升级动画
                }
            }

            // if(obj.Lv === 0 && obj.Num >= obj.Clip){
            //     setTimeout(function(){
            //         this.reqHeroCreate(obj.FamilyID);
            //     }.bind(this),50);
            // }
        }
        this.checkLineUpRedDot();
        clientEvent.dispatchEvent("refreshHeros",true);
    };
    module.req_Hero_LvUp = function(familyID,pos){
        clientEvent.dispatchEvent("setLockExp",true);
        this.clickRewardPos = pos;
        var data = {
            "Req_Hero_LvUp": {
                "ID":familyID,
            }
        };
        network.send(data);
    };

    module.onResp_Hero_LvUp = function(param){
        if(this.clickRewardPos){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("monInfo","upLvSuccess"));
            clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.EXPGET);
            uiManager.openUI(uiManager.UIID.FLY_EFFECT,param.Rewards,"",this.clickRewardPos,true);
            this.clickRewardPos = null;
        }
        clientEvent.dispatchEvent("updateMonster",param.Info);
    };

    module.req_Hero_Skill_LvUp = function(familyID,skillID,pos){
        this.clickRewardPos = pos;
        clientEvent.dispatchEvent("setLockExp",true);
        var data = {
            "Req_Hero_Skill_LvUp": {
                "FamilyID":familyID,
                "SkillID":skillID,
            }
        };
        network.send(data);
    };

    module.onResp_Hero_Skill_LvUp = function(param,sentData) {
        if(this.clickRewardPos){
            clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.EXPGET);
            uiManager.openUI(uiManager.UIID.FLY_EFFECT,param.Rewards,"",this.clickRewardPos,true);
            this.clickRewardPos = null;
        }
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("monInfo","skillUpLvSuccess"));
        clientEvent.dispatchEvent("updateMonster",param,true);
    };

    //怪物天赋升级
    module.Req_Hero_Talent_Upgrade = function(familyID,skillID){
        var data = {
            "Req_Hero_Talent_Upgrade": {
                "FamilyID":familyID,
                "TalentID":skillID,
            }
        };
        network.send(data);
    };

    module.onResp_Hero_Talent_Upgrade = function(param,sentData) {
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("monInfo","talentUpLvSuccess"));
        param.SkillID = param.TalentID;
        param.SkillLv = param.TalentLv;
        clientEvent.dispatchEvent("updateMonster",param,true);
    };

    //怪物天赋重置
    module.Req_Hero_Talent_Reset = function(familyID){
        var data = {
            "Req_Hero_Talent_Reset": {
                "FamilyID":familyID,
            }
        };
        network.send(data);
    };
    /** 获取当前阵容 */
    module.getLineUpInfo = function(){
        var info = this.formations[this.formationsIdx] ? this.formations[this.formationsIdx] : this.formations[0];
        return info.FamilyIDs;
    };

    module.checkLineUpRedDot = function () {
        var redDot = !!this.getCanLvUp() || !!this.getCanSkillUp();
        clientEvent.dispatchEvent("checkLineUpRedDot",redDot);
    };

    /** 获取当前阵容可提升怪物等级的家族ID */
    module.getCanLvUp = function(){
        var gold = userLogic.getBaseData(userLogic.Type.Gold)
        for (var i = 0 , len = this.formations[this.formationsIdx].FamilyIDs.length; i < len; i++) {
            var obj = this.formations[this.formationsIdx].FamilyIDs[i];
            if(this.heroes[obj].Gold > gold || this.heroes[obj].Clip > this.heroes[obj].Num)    continue;
            return obj;
        }
        return 0;
    };

    module.checkMonLvUp = function (familyId) {
        var gold = userLogic.getBaseData(userLogic.Type.Gold);
        if(this.heroes[familyId].Gold <= gold && this.heroes[familyId].Clip <= this.heroes[familyId].Num){
            return familyId;
        }else{
            return 0;
        }
    };

    /** 获取当前阵容可提升怪物技能等级的家族ID */
    module.getCanSkillUp = function(){
        var gold = userLogic.getBaseData(userLogic.Type.Gold)
        for (var i = 0 , len = this.formations[this.formationsIdx].FamilyIDs.length; i < len; i++) {
            var obj = this.formations[this.formationsIdx].FamilyIDs[i];
            var idx = this.checkMonSkillUp(obj);
            if(!idx)    continue;
            return idx;
        }
        return 0;
    };

    module.checkMonSkillUp = function (familyId) {
        var gold = userLogic.getBaseData(userLogic.Type.Gold);
        for (var j = 0; j < this.heroes[familyId].SkillUpGold.length; j++) {
            var skillGold = this.heroes[familyId].SkillUpGold[j];
            if((this.heroes[familyId].SkillLv[j] % 1000) >= this.heroes[familyId].SkillMaxLv[j] || skillGold > gold)    continue;
            return familyId;
        }
        return  0;
    };

    /** 获取当前阵容 */
    module.getLineUpTeam = function(){
        var familyIDs = this.getLineUpInfo();
        return familyIDs;
    };
    /** 检查是否在当前阵容 */
    module.checkUp = function(id){
        var idx  = this.formations[this.formationsIdx].FamilyIDs.indexOf(id);
        return idx !== -1;
    };
    /** 检测当前阵容是否合理 */
    module.isLineUpVaild = function(){
        for (var i = 0 , len = this.formations[this.formationsIdx].FamilyIDs.length; i < len; i++) {
            var obj = this.formations[this.formationsIdx].FamilyIDs[i];
            if (obj === 0) {
                return false;
            }
        }
        return true;
    };
    /** id -->家族id */
    module.getHeroesById = function(id){
        return this.heroes[id];
    };

    /** 获取怪物的被动技能包括天赋信息 */
    module.getHeroesSkillInfo = function(id){
        if(this.heroes[id]){
            return kf.clone(this.heroes[id].SkillInfo.concat(this.heroes[id].TalentInfo));
        }
        cc.warn("技能列表为空");
        return [];
    };

    module.getTalentLv = function(familyID,talent){
        for (var i = 0 , len = this.heroes[familyID].TalentInfo.length; i < len; i++) {
            var obj = this.heroes[familyID].TalentInfo[i];
            if(obj.skillID === talent)  return  obj.skillLv;
        }
    };
    module.getTalentN = function(familyID){
        var num = 0;
        for (var i = 0 , len = this.heroes[familyID].TalentInfo.length; i < len; i++) {
            var obj = this.heroes[familyID].TalentInfo[i];
            num += obj.skillLv;
        }
        return num;
    };
    //天赋升级需求熟练度
    module.getTalentUpProb = function(familyID){
        return this.heroes[familyID].TalentUpProb;
    };
    //天赋升级需求金币
    module.getTalentUpGold = function(familyID){
        return this.heroes[familyID].TalentUpGold;
    };
    //天赋升级获得经验
    module.getTalentUpExp = function(familyID){
        return this.heroes[familyID].TalentUpExp;
    };
    module.canGetExp = function(familyID,n){
         return this.heroes[familyID].TalentUpCount <= n;
    };

    module.setSortList = function (list) {
        this.sortList = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(obj.Lv){
                this.sortList.push(obj.Tid);
            }else{
                break;
            }
        }
    };
    /** 获取下一个怪物ID */
    module.getNextMon = function(id){
        var res = 0;
        var idx = this.sortList.indexOf(Number(id));
        if(idx !== this.sortList.length - 1){
            res = idx + 1;
        }
        return this.sortList[res];
    };
    /** 获取上一个怪物ID */
    module.getLastMon = function(id){
        var res = this.sortList.length - 1;
        var idx = this.sortList.indexOf(Number(id));
        if(idx !== 0){
            res = idx - 1;
        }
        return this.sortList[res];
    };
    module.dealSkill = function(list,maxLv,skillUpGold,skillUpExp){
        var info = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var skillID = Math.floor(obj/1000);
            var skillLv = obj % 1000;
            info.push({skillID:skillID,skillLv:skillLv,maxLv:maxLv[i],skillUpGold:skillUpGold[i],skillUpExp:skillUpExp[i]});
        }
        return  info;
    };
    module.dealTalent = function(list){
        var info = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            info.push({skillID:obj.TalentID,skillLv:obj.CurLv,maxLv:obj.MaxLv});
        }
        return  info;
    };

    /** id -->家族id */
    module.getHeroesLv = function(id){
        var data = this.getHeroesById(id);
        if (!data) return 1;
        return data.Lv;
    };

    module.getHeroesPro = function(id){
        var data = this.getHeroesById(id);
        if (!data) return 1;
        return data.ProNum;
    };

    module.getPublicHeroesPro = function(){
        return this.publicHeroPro;
    };

    module.getPubHeroClip = function(){
        return this.pubHeroClip || 0;
    };

    //获取指定家族的最大解锁形态
    module.getHeroMaxQuality = function (familyID) {
        if (!this.heroes[familyID]) {
            cc.error("不存在指定家族服务端数据")
            return 0;
        }
         return this.heroes[familyID].Quality;
    };

    /** 获取当前阵容领导力 */
    module.getCurFormationLeader = function(){
        var lines = this.getLineUpInfo();
        var count = 0;
        for (var i = 0 , len = lines.length; i < len; i++) {
            var obj = lines[i];
            if (obj === 0) continue;
            count += jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj)[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        }
        return count;
    };
    /** 获取当前的卷轴数据 */
    module.getReelsLineUp = function () {
        return this.reelIds || [];
    };
    /** 进入界面copy一份 */
    module.copyReelsLineUp = function () {
        this.reelIdsCopys = !this.reelIds ? []:kf.clone(this.reelIds);
    };
    /** 重置备份数据 */
    module.setReelsLineUpCopys = function (reelIds) {
        this.reelIdsCopys = reelIds;
    };

    /** 获取当前的卷轴数据 */
    module.getReelsLineUpCopys = function () {
        return this.reelIdsCopys || [];
    };

    /** 获取当前的卷轴数据 */
    module.isInReelsLineUpCopys = function (id) {
        if (!this.reelIdsCopys) return false;
        return kf.inArray(this.reelIdsCopys,id);
    };
    /** 检测缓存变更  变更了就去设置 */
    module.checkCopyReel = function () {
        var isSame = true;
        for (var i = 0 , len = this.reelIdsCopys.length; i < len; i++) {
            var obj = this.reelIdsCopys[i];
            var des = this.reelIds[i];
            if (obj !== des) {
                isSame = false;
                break;
            }
        }
        if (!isSame) {
            this.req_Reel_Formation(this.reelIdsCopys);
        }
    };

    /** 获取卷轴数量 */
    module.getReelCount = function (id) {
        for (var i = 0 , len = this.reelInfos.length; i < len; i++) {
            var obj = this.reelInfos[i];
            if (obj.ID !== id) continue;
            return obj.Num;
        }
        return 0;
    };
    /** 获取一份备份 */
    module.copyReelInfoForPve = function () {
        if (!this.reelInfosCopy) {//重复多个波次  只保存刚开始那个回合
            this.reelInfosCopy = kf.clone(this.reelInfos);
        }
    };
    /** 重置卷轴缓存 */
    module.resetCopyReelInfo = function () {
        if (this.reelInfosCopy) {
            this.reelInfos = kf.clone(this.reelInfosCopy);
            this.reelInfosCopy = null;
        }
    };
    //清空拷贝的数据
    module.clearCopyReel = function () {
        this.reelInfosCopy = null;
    };

    module.desrReel = function (id,num) {
        for (var i = 0 , len = this.reelInfos.length; i < len; i++) {
            var obj = this.reelInfos[i];
            if (obj.ID !== id) continue;
            obj.Num -= num;
        }
    };

    /** 获取分组 by品质 */
    module.getReelByForm = function (form) {
        var list = [];
        if (form === this.REEL_FORM_ENUM.ALL) return kf.clone(this.reelInfos);
        var monsterForm = this.REEL_UI_2_MNSTER[form];
        for (var i = 0 , len = this.reelInfos.length; i < len; i++) {
            var obj = this.reelInfos[i];
            var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,obj.ID);//装备配置表基本数据
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
            if (config[jsonTables.CONFIG_MONSTER.Form] !== monsterForm) continue;
            list.push(kf.clone(obj));
        }
        return list;
    };

    module.getSkillUpGold = function(familyID,skillID){
        for (var i = 0 , len = this.heroes[familyID].SkillInfo.length; i < len; i++) {
            var obj = this.heroes[familyID].SkillInfo[i];
            if(obj.skillID !== skillID) continue;
            return  obj.skillUpGold;
        }
        return 0;
    };

    module.getSkillUpExp = function(familyID,skillID){
        for (var i = 0 , len = this.heroes[familyID].SkillInfo.length; i < len; i++) {
            var obj = this.heroes[familyID].SkillInfo[i];
            if(obj.skillID !== skillID) continue;
            return  obj.skillUpExp;
        }
        return 0;
    };

    module.getMonKinds = function(){
        var kindNum = 0;
        var keys = Object.keys(this.heroes)
        for (var i = 0 , len = keys.length; i < len; i++) {
            var obj = this.heroes[keys[i]];
            if(obj.Lv === 0)    continue;
            kindNum ++;
        }
        return  kindNum;
    };
    /** 获取卡牌所有的碎片 */
    module.getCardClips = function (isContainZero) {
        var list = [];
        for (var key in this.heroes) {
            if (this.heroes.hasOwnProperty(key)) {
                if (!isContainZero && this.heroes[key].Num === 0) {
                    continue;
                }
                list.push(this.heroes[key]);
            }
        }
        return kf.clone(list);
    }
    /** 获取某个品质的所哟卡牌 */
    module.getCardsByQuality = function (quality) {
        var config = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
        var list = [];
        for (var i = 0 , len = config.length; i < len; i++) {
            var obj = config[i];
            if (obj[jsonTables.CONFIG_MONSTERFAMILY.Quality] === quality && obj[jsonTables.CONFIG_MONSTERFAMILY.Display]) {
                list.push(kf.clone(obj));
            }
        }
        return list;
    };
    /** 获取重构后的规则数据 */
    module.getSmeltRule = function () {
        return this.smeltRule;
    };
    module.getShowNum = function(tid,Lv,skillList){
        var data ={
            sword:0,
            shield:0,
        }
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
        var myLv = this.heroes[familyID]?this.heroes[familyID].Lv:1;
        var lv = Lv ? Lv : myLv;
        var quality = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        var form = config[jsonTables.CONFIG_MONSTER.Form];
        var idx = form - 1;
        var skillInfo = skillList?skillList:this.getHeroesSkillInfo(familyID);
        var addRes = jsonTables.countSkillAdd(skillInfo,form,lv,quality);
        data.sword += addRes.addSword;
        data.shield += addRes.addShield;
        data.HpBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.Hp,lv);
        data.DbBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.Damage,lv);
        data.PdBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.PdBase,lv);
        data.MdBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.MdBase,lv);
        data.PsBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.PbBase,lv);
        data.MsBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.MbBase,lv);
        data.crit = config[jsonTables.CONFIG_MONSTER.CritAtk];
        data.sword += formulaLogic.calculateSword(data.PsBase,data.MsBase,data.DbBase,data.crit,familyConfig[jsonTables.CONFIG_MONSTERFAMILY.SwordForm][idx]);
        data.shield += formulaLogic.calculateShield(data.PdBase,data.MdBase,data.HpBase,familyConfig[jsonTables.CONFIG_MONSTERFAMILY.ShieldForm][idx]);
        return  data;
    };
    /**
     * 怪物天赋是否开启
     * @return {int} 1 标识后台关闭  2 标识章节未达到 3 加载品质未达到  0标识可以
     */
    module.isMonTalentEnable = function (familyID) {
        // TODO: 获取后台是否开启标识
        if (!userLogic.isMonTalentOpen()) {
            return 1;
        }
        if (jsonTables.funOpenCheck(constant.FunctionTid.MON_TALENT)) {
            var monsterData = this.getHeroesById(familyID);//服务端给过来来的数据
            if (monsterData.Quality < 5) {
                return 3;
            }
            return 0;
        }else {
            return 2;
        }
    };

    return module;
};
