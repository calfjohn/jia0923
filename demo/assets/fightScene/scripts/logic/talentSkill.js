/**
 * @Author: lich
 * @Date:   2018-08-08T10:53:05+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-08-08T10:53:59+08:00
 */

window["logic"]["talentSkill"] = function() {

    var clientEvent = null;
    var msgHander = null;
    var fightLogic = null;
    var msgHanderLogic = null;
    var sandTableLogic = null;
    var formulaLogic = null;
    var userLogic = null;
    var module = {};

    module.init = function(){
        this.initModue();
        this.reset();
    };

    module.initModue = function(){
        clientEvent = kf.require("basic.clientEvent");
        msgHander = kf.require("logic.msgHander");
        fightLogic = kf.require("logic.fight");
        msgHanderLogic = kf.require("logic.msgHander");
        sandTableLogic = kf.require("logic.sandTable");
        formulaLogic  = kf.require("logic.formula");
        userLogic = kf.require("logic.user");
    };

    module.reset = function(isCtol){
        this.skillList = [];
        this.sandList = cc.js.createMap();
        if (!isCtol) {
            this.equipAddMap = null;
        }
    };
    /** 外部调用设置装备加成 */
    module.setEquipAddList = function (map) {
        this.equipAddMap = map;
    };

    /** 外部调用设置天赋id   serverData*/
    module.setTalents = function (talents) {
        this.reset(true);
        talents = talents || [];
        for (var i = 0 , len = talents.length; i <  len; i++) {
            var obj = talents[i];
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENT,obj.ID);
            var skillID = config[jsonTables.CONFIG_TALENT.TalentSkill];
            if (skillID) {
                var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENTSKILL,skillID);
                var objectType = skillConfig[jsonTables.CONFIG_TALENTSKILL.Object];
                if (objectType.indexOf(0) !== -1 && skillConfig[jsonTables.CONFIG_TALENTSKILL.Type] !== tb.TALENT_PASSIVESKILL ) continue;//作用于玩家的加成由服务端计算
                for (var j = 0; j < objectType.length; j++) {
                    var obj1 = objectType[j];
                    this.skillList[obj1] = this.skillList[obj1] || []
                    this.skillList[obj1].push({config:skillConfig,lv:obj.Lv});
                }
            }
            var sandID = config[jsonTables.CONFIG_TALENT.TalentSand];
            if (sandID) {
                var sandConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENTSAND,sandID);
                var inTime = sandConfig[jsonTables.CONFIG_TALENTSAND.InTime];
                this.sandList[inTime] = this.sandList[inTime] || []
                this.sandList[inTime].push({config:sandConfig,lv:obj.Lv});
            }
        }
    };
    ////////////////////////////////////////天赋效果  start/////////////////////////////////////////////////////////////
    module.checkTalentEffect = function (ccObj) {
        if (!fightLogic.isPassiveSkillVaild()) return [];//// NOTE: 不在可运行的模式
        if (fightLogic.getMineID() !== ccObj.getOwner()) return [];//只作用于我方
        if (ccObj.isPlayerFlag()) return;//主角就不管了
        if (fightLogic.isGameType(constant.FightType.PVP_AREAN) || fightLogic.isGameType(constant.FightType.WORLD_BOSS)) return [];//竞技场主角都没被动
        var familyID = ccObj.getFamilyID();
        var objectType = ccObj.getType();
        this._checkTalentEffect(constant.MonsterType.ALL,ccObj);
        this._checkTalentEffect(familyID,ccObj);
        this._checkTalentEffect(objectType,ccObj);
    };
    module._checkTalentEffect = function (type,ccObj) {
        if (!this.skillList[type] || this.skillList[type].length === 0 ) return;
        for (var i = 0 , len = this.skillList[type].length; i <  len; i++) {
            var obj = this.skillList[type][i];
            this._doTalentEffect(obj,ccObj);
        }
    };
    module._doTalentEffect = function (obj,ccObj) {
        var config = obj.config;
        var lv = obj.lv;
        var base = config[jsonTables.CONFIG_TALENTSKILL.Lv] ?config[jsonTables.CONFIG_TALENTSKILL.Lv][lv-1] : 0;
        var base2 = config[jsonTables.CONFIG_TALENTSKILL.LvParam] ?config[jsonTables.CONFIG_TALENTSKILL.LvParam][lv-1] : 0;
        // cc.log("base          ",base,"       type  ",ccObj.getType(), "          familyID  ",ccObj.getFamilyID())
        this._doSwichAddEffect(config[jsonTables.CONFIG_TALENTSKILL.Type],ccObj,base,base2);
    };

    //增加数值影响
    module._doSwichAddEffect = function (type,ccObj,base,base2) {
        base = base || 0;
        base2 = base2 || 0;
        switch (type) {
            case tb.TALENT_HP_VALUE://血量数值
                ccObj.addMaxHp(base);
                break;
            case tb.TALENT_DEMAGE_VALUE://伤害数值
                ccObj.addDamgeBase(base);
                break;
            case tb.TALENT_PS_VALUE://物理强度数值
                ccObj.addPsBase(base);
                break;
            case tb.TALENT_MS_VALUE://魔法强度数值
                ccObj.addMsBase(base);
                break;
            case tb.TALENT_PD_VALUE://物理防御数值
                ccObj.addPdBase(base);
                break;
            case tb.TALENT_MD_VALUE://魔法防御数值
                ccObj.addMdBase(base);
                break;
            case tb.TALENT_CRIT_VALUE://暴击率数值
                ccObj.addCrit(base);
                break;
            case tb.TALENT_HP_PERCENT: //血量千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.HpBase,"addMaxHp");
                break;
            case tb.TALENT_DEMAGE_PERCENT://伤害千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.DamageBase,"addDamgeBase");
                break;
            case tb.TALENT_PS_PERCENT: //物理强度千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.PsBase,"addPsBase");
                break;
            case tb.TALENT_MS_PERCENT: //魔法强度千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.MsBase,"addMsBase");
                break;
            case tb.TALENT_PD_PERCENT://物理防御千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.PdBase,"addPdBase");
                break;
            case tb.TALENT_MD_PERCENT://魔法防御千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.MdBase,"addMdBase");
                break;
            case tb.TALENT_PS_PD_VALUE://物理强度物理防御数值
                ccObj.addPsBase(base);
                ccObj.addPdBase(base2);
                break;
            case tb.TALENT_MS_MD_VALUE://魔法强度魔法防御数值
                ccObj.addMsBase(base);
                ccObj.addMdBase(base2);
                break;
            case tb.TALENT_PS_MS_PERCENT://增加双攻千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.PsBase,"addPsBase");
                this._addKeyPer(ccObj,base2,jsonTables.CONFIG_MONSTERLV.MsBase,"addMsBase");
                break;
            case tb.TALENT_PD_MD_PERCENT://增加双防千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.PdBase,"addPdBase");
                this._addKeyPer(ccObj,base2,jsonTables.CONFIG_MONSTERLV.MdBase,"addMdBase");
                break;
            case tb.TALENT_ALL_PERCENT://增加所有属性千分比
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.HpBase,"addMaxHp");
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.DamageBase,"addDamgeBase");
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.PsBase,"addPsBase");
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.MsBase,"addMsBase");
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.PdBase,"addPdBase");
                this._addKeyPer(ccObj,base,jsonTables.CONFIG_MONSTERLV.MdBase,"addMdBase");
                break;
            case tb.TALENT_ATK_SPEED_PERCENT://增加攻速千分比
                ccObj.addActionSpeed(base);
                break;
            case tb.TALENT_PD_MD_VALUE://增加双防数值
                ccObj.addPdBase(base);
                ccObj.addMdBase(base2);
                break;
            case tb.TALENT_PS_MS_VALUE://增加双攻数值
                ccObj.addPsBase(base);
                ccObj.addMsBase(base2);
                break;
            case tb.TALENT_MOSTR_LV://增加家族等级
                var tid = ccObj.getTid();
                if (!base) return;
                var lv = ccObj.getLv();
                var addLv = base + lv;
                var hp = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.Hp,addLv) - formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.Hp,lv)
                var damage = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.Damage,addLv) - formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.Damage,lv)
                var pdBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.PdBase,addLv) - formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.PdBase,lv)
                var mdBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.MdBase,addLv) - formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.MdBase,lv)
                var psBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.PbBase,addLv) - formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.PbBase,lv)
                var msBase = formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.MbBase,addLv) - formulaLogic.calcuateBaseCount(tid,constant.FormmulaBaseKey.MbBase,lv)
                ccObj.addMaxHp(hp);
                ccObj.addDamgeBase(damage);
                ccObj.addPsBase(psBase);
                ccObj.addMsBase(msBase);
                ccObj.addPdBase(pdBase);
                ccObj.addMdBase(mdBase);
                break;
            case tb.TALENT_HP_TRANSFORM://英雄血量千分比转换
                var playerBase = userLogic.getBaseData(userLogic.Type.Hp);
                var add = base/1000 * playerBase;
                ccObj.addMaxHp(add);
                break;
            case tb.TALENT_DEMAGE_TRANSFORM://英雄伤害千分比转换
                var playerBase = userLogic.getBaseData(userLogic.Type.Damage);
                var add = base/1000 * playerBase;
                ccObj.addDamgeBase(add);
                break;
            case tb.TALENT_PS_TRANSFORM://英雄物理强度千分比转换
                var playerBase = userLogic.getBaseData(userLogic.Type.PhyAtk);
                var add = base/1000 * playerBase;
                ccObj.addPsBase(add);
                break;
            case tb.TALENT_MS_TRANSFORM://英雄魔法强度千分比转换
                var playerBase = userLogic.getBaseData(userLogic.Type.MagAtk);
                var add = base/1000 * playerBase;
                ccObj.addMsBase(add);
                break;
            case tb.TALENT_PD_TRANSFORM://英雄物理防御千分比转换
                var playerBase = userLogic.getBaseData(userLogic.Type.PhyDef);
                var add = base/1000 * playerBase;
                ccObj.addPdBase(add);
                break;
            case tb.TALENT_MD_TRANSFORM://英雄魔法防御千分比转换
                var playerBase = userLogic.getBaseData(userLogic.Type.MagDef);
                var add = base/1000 * playerBase;
                ccObj.addMdBase(add);
                break;
        }
    }

    module._addKeyPer = function (ccObj,base,key,funcName) {
        var configBase = ccObj.getNumConfig(key);
        var add = Math.ceil(base /1000 * configBase);
        ccObj[funcName](add);
    };

    /** 获取天赋产生的基础技能 */
    module.getTalent2Skill = function (ccObj) {
        if (!fightLogic.isPassiveSkillVaild()) return [];//// NOTE: 不在可运行的模式
        if (fightLogic.getMineID() !== ccObj.getOwner()) return[];//只作用于我方
        if (fightLogic.isGameType(constant.FightType.PVP_AREAN)  || fightLogic.isGameType(constant.FightType.WORLD_BOSS)) return [];//竞技场主角都没被动
        var familyID = ccObj.getFamilyID();
        var objectType = ccObj.getType();
        var list1 = this._getTalent2Skill(constant.MonsterType.ALL);
        var list = this._getTalent2Skill(familyID);
        var list2 = this._getTalent2Skill(objectType);
        return list.concat(list2,list1);
    };
    module._getTalent2Skill = function (type) {
        var skillList = this.skillList[type];
        if (!skillList || skillList.length === 0 ) return[];
        var list = [];
        for (var i = 0 , len = skillList.length; i <  len; i++) {
            var obj = skillList[i];
            if (obj.config[jsonTables.CONFIG_TALENTSKILL.Type] !== tb.TALENT_PASSIVESKILL) continue;
            var lv = obj.config[jsonTables.CONFIG_TALENTSKILL.Lv] ?obj.config[jsonTables.CONFIG_TALENTSKILL.Lv][obj.lv-1] : 0;
            lv = lv || 0;
            list.push({skillID:obj.config[jsonTables.CONFIG_TALENTSKILL.PassiveSkill],skillLv:lv});
        }
        return list;
    };


    ////////////////////////////////////////天赋效果  end/////////////////////////////////////////////////////////////
    ////////////////////////////////////////装备对家族的影响  start//////////////////////////////////////////////////////////////
    module.checkEquipEffect = function (ccObj) {
        if (!fightLogic.isPassiveSkillVaild()) return;//// NOTE: 不在可运行的模式
        if (fightLogic.getMineID() !== ccObj.getOwner()) return;//只作用于我方
        if (ccObj.isPlayerFlag()) return;//主角就不管了
        if (fightLogic.isGameType(constant.FightType.PVP_AREAN)) return [];//竞技场主角都没装备
        if (!this.equipAddMap) return;
        var familyID = ccObj.getFamilyID();
        var objectType = ccObj.getType();
        this._checkEquipEffect(constant.MonsterType.ALL,ccObj);
        this._checkEquipEffect(familyID,ccObj);
        this._checkEquipEffect(objectType,ccObj);
    };
    //增加数值
    module._checkEquipEffect = function (type,ccObj) {
        if (!this.equipAddMap[type] || this.equipAddMap[type].length === 0 ) return;
        for (var i = 0 , len = this.equipAddMap[type].length; i <  len; i++) {
            var obj = this.equipAddMap[type][i];
            this._doSwichAddEffect(obj.Type,ccObj,obj.Value,0);
        }
    };


    ////////////////////////////////////////装备对家族的影响  end/////////////////////////////////////////////////////////////
    ////////////////////////////////////////沙盘操作  start//////////////////////////////////////////////////////////////
    /** 检测沙盘效果 inTime触发类型  ccObj的脚本对象    */
    module.checkSandTime = function (inTime,ccObj) {
        if (!fightLogic.isPassiveSkillVaild()) return;//// NOTE: 不在可运行的模式
        if (fightLogic.isGameType(constant.FightType.PVP_AREAN) || fightLogic.isGameType(constant.FightType.WORLD_BOSS)) return [];//竞技场主角都没被动
        if (!this.sandList[inTime] || this.sandList[inTime].length === 0 ) return;
        for (var i = 0 , len = this.sandList[inTime].length; i <  len; i++) {
            var obj = this.sandList[inTime][i];
            this.doSwitchEffect(obj,ccObj);
        }
    };
    /** 使沙盘效果生效 */
    module.doSwitchEffect = function (obj,ccObj) {
        var config = obj.config;
        var lv = obj.lv;
        var per = config[jsonTables.CONFIG_TALENTSAND.Probability] ? config[jsonTables.CONFIG_TALENTSAND.Probability][lv-1] : 0;
        per = per || 0;
        if (per && !jsonTables.random100Num(per)) {
            return;
        }

        switch (config[jsonTables.CONFIG_TALENTSAND.Effect]) {
            case tb.EFFECT_STEP://概率增加步数
                var step = config[jsonTables.CONFIG_TALENTSAND.Step] ?config[jsonTables.CONFIG_TALENTSAND.Step][lv-1] : 0;
                step = step || 0;
                sandTableLogic.addStep(step);
                break;
            case tb.EFFECT_DRAGLV://增加拖出怪物等级
            case tb.EFFECT_COMPOUNDLV://增加合成怪物等级
                var addLv = config[jsonTables.CONFIG_TALENTSAND.Lv] ?config[jsonTables.CONFIG_TALENTSAND.Lv][lv-1] : 0;
                addLv = addLv || 0;
                if (ccObj) {
                    ccObj.lvUp(addLv);
                }
                break;
            case tb.EFFECT_GREEN: //怪物补充为绿色
                var num = config[jsonTables.CONFIG_TALENTSAND.Num] ?config[jsonTables.CONFIG_TALENTSAND.Num][lv-1] : 0;
                num = num || 0;
                sandTableLogic.addNextForm(num);
                break;
            case tb.EFFECT_PR_COMPOUNDLV: //概率增加怪物等级
                var prob = config[jsonTables.CONFIG_TALENTSAND.Probability][lv-1];
                if(!jsonTables.random100Num(prob)) break;
                var addLv = config[jsonTables.CONFIG_TALENTSAND.Lv] ?config[jsonTables.CONFIG_TALENTSAND.Lv][lv-1] : 0;
                addLv = addLv || 0;
                if (ccObj) {
                    ccObj.lv += 1;
                }
                break;
        }
    };
    /** 将类型转换为天赋枚举 */
    module.getForm2Tablent = function (form) {
        if (form < tb.MONSTER_EXCELLENT ) return 0;
        switch (form) {
            case tb.MONSTER_EXCELLENT:
                return [tb.Talent_DRAGBLUE];
            case tb.MONSTER_EPIC:
                return [tb.Talent_DRAGBLUE,tb.Talent_DRAGPURPLE];
            case tb.MONSTER_LEGEND:
                return [tb.Talent_DRAGBLUE,tb.Talent_DRAGPURPLE,tb.Talent_DRAGORANGE];
        }
    };
    /** 将消除为天赋枚举 */
    module.getDestory2Tablent = function (list) {// list 触发对象不存在自己
        if (!list || !list.length) return 0;
        if (list.length === 3) {
            return [tb.Talent_FOUR];
        }else if (list.length === 4) {
            return [tb.Talent_FOUR,tb.Talent_FIVE];
        }else if (list.length >= 5) {
            return [tb.Talent_FOUR,tb.Talent_FIVE,tb.Talent_SIX];
        }else {
            return [];
        }
    };

    ////////////////////////////////////////沙盘操作  end//////////////////////////////////////////////////////////////
    return module;
};
