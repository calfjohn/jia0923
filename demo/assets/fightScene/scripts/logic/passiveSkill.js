cc.Audio.State = {
    ERROR : -1,
    INITIALZING: 0,
    PLAYING: 1,
    PAUSED: 2,
    STOPPED: 3,
};
/**
 * @Author: lich
 * @Date:   2018-08-08T10:53:05+08:00
 * @Last modified by:
 * @Last modified time: 2018-09-13T11:37:27+08:00
 */

window["logic"]["passiveSkill"] = function() {

    var clientEvent = null;
    var msgHander = null;
    var fightLogic = null;
    var cardLogic = null;
    var skillLogic = null;
    var formulaLogic = null;
    var talentSkillLogic = null;
    var buffLogic = null;
    var userLogic = null;

    var module = {};
    const extParam233 = "extParam233";
    const TEST_SKILL_MODE = false;
    const TEST_SKILL_ID = 1072;

    module.init = function(){
        this.initModue();
        this.reset();
    };

    module.initModue = function(){
        clientEvent = kf.require("basic.clientEvent");
        msgHander = kf.require("logic.msgHander");
        fightLogic = kf.require("logic.fight");
        cardLogic = kf.require("logic.card");
        skillLogic = kf.require("logic.skill");
        formulaLogic  = kf.require("logic.formula");
        talentSkillLogic = kf.require("logic.talentSkill");
        buffLogic = kf.require("logic.buff");
        userLogic = kf.require("logic.user");
    };

    module.reset = function(){
        this.removeList = [];
        this.curMap = null;
        this.container = cc.js.createMap();
        this.paramMap = cc.js.createMap();
    };

    module.releaseBaseSkill = function (ccObj) {
        var id = ccObj.getID();
        if (this.container[id]) {// TODO: 那些有附带对象要处理下
            delete this.container[id];
        }
    };

    module.initBaseSkill = function (ccObj) {
        if (!fightLogic.isPassiveSkillVaild()) return [];//// NOTE: 不在可运行的模式
        var id = ccObj.getID();
        var tid = ccObj.getTid();
        var list = [];
        this.container[id] = window.newStruct.newSkillMap();
        if (fightLogic.getMineID() === ccObj.getOwner()){//我方
            list = talentSkillLogic.getTalent2Skill(ccObj);//获取添加加成得到的被动技能
            if (!ccObj.isPlayerFlag()) {//怪物
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
                var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
                var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);//家族配置表基本数据
                var skillData = cardLogic.getHeroesSkillInfo(familyID);//服务端给过来来的数据
                if (skillData&& !TEST_SKILL_MODE) {//存在我技能
                    list.concatSelf(skillData);
                }else {
                    var info = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Skill];
                    for (var i = 0 , len = info.length; i < len; i++) {
                        var obj = info[i];
                        if (TEST_SKILL_MODE) {
                            list.push({skillID:TEST_SKILL_ID,skillLv:1});
                        }else {
                            list.push({skillID:obj,skillLv:1});
                        }
                    }
                }
            }else {//主角的被动已经在天赋里面填充了
                if (!fightLogic.isGameType(constant.FightType.PVP_AREAN) && !fightLogic.isGameType(constant.FightType.MINE_FIGHT)) {//暂时排除觉醒职业被动
                    var professionPassiveSkill = this.getProfessionPassiveSkill();
                    if (professionPassiveSkill) {
                        list.push({skillID:professionPassiveSkill,skillLv:1});
                    }
                }
            }
        }else {//敌方
            if (!ccObj.isPlayerFlag()) {//敌对怪物
                list = fightLogic.getEnemyMonsSkill(ccObj.getTid());
            }else {//敌对玩家
                list = fightLogic.getEnemyPlayerSkill(); //getEnmeyProfession // TODO: 这里要考虑敌方主角是否也要加上职业被动
            }
        }

        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,obj.skillID);
            if (!config) return cc.error("技能id+"+obj.skillID+"配置找不到");
            if (config[jsonTables.CONFIG_PASSIVESKILL.InTime] === tb.PASSIVE_NO)continue;
            if (obj.skillLv === 0) {
                if (CC_DEBUG) {
                    // cc.log("这货:",ccObj.getResource(),"技能ID："+obj.skillID,"0级跳过不生效")
                }
                continue;
            }
            if (this.switchBase(ccObj,obj.skillID,obj.skillLv)) {
                continue;
            }
            this.checkMonSpecialState(ccObj, obj.skillID);
            this.container[id].addElement(config[jsonTables.CONFIG_PASSIVESKILL.InTime],obj.skillID,{skillLv:obj.skillLv,config:config});
        }
        return  list;
    };

    module.getProfessionPassiveSkill = function () {
        var profession = userLogic.getBaseData(userLogic.Type.Career);
        var professionConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,profession);
        var professionPassiveSkill = professionConfig[jsonTables.CONFIG_PROFESSION.ProfessionPassiveSkill];
        return professionPassiveSkill;
    };
    //重写添加那些被移除的被动
    module.reAddRemoveMap = function (ccObj) {
        if (!fightLogic.isPassiveSkillVaild()) return;//// NOTE: 不在可运行的模式
        var id = ccObj.getID();
        var map = this.container[id];
        if (!map) return;
        map.reAddRemoveMap();
    };

    /** 删除特定技能 */
    module.releaseSkill = function (ccObj,skillID) {
        if (!fightLogic.isPassiveSkillVaild()) return;//// NOTE: 不在可运行的模式
        var id = ccObj.getID();
        var map = this.container[id];
        if (!map) return;
        var re = map.desrElementByID(skillID);
        return re;
    };

    module.switchBase = function (ccObj,skillID,skillLv) {
        var isDirectly = true;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,skillID);
        switch (config[jsonTables.CONFIG_PASSIVESKILL.InTime]) {
            case tb.PASSIVE_DIRECTLY_BOTH_D:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.PdBase);
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.MdBase);
                break;
            case tb.PASSIVE_DIRECTLY_PS:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.PsBase);
                break;
            case tb.PASSIVE_DIRECTLY_MS:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.MsBase);
                break;
            case tb.PASSIVE_DIRECTLY_PD:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.PdBase);
                break;
            case tb.PASSIVE_DIRECTLY_MD:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.MdBase);
                break;
            case tb.PASSIVE_DIRCTLY_RANGE:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.Range);
                break;
            case tb.PASSIVE_DIRECTLY_HP_PERCENT:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.HpPer);
                break;
            case tb.PASSIVE_DIRECTLY_CRIT:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.Ctit);
                break;
            case tb.PASSIVE_DIRECTLY_BOTH_S:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.PsBase);
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.MsBase);
                break;
            case tb.PASSIVE_DIRECTLY_DB_PERCENT:
                this.addBaseData(ccObj,skillID,skillLv,constant.AddBaseData.DamagePer);
                break;
            default:
                isDirectly = false;
        }
        return isDirectly;
    };

    /** 增加基础数值 */
    module.addBaseData = function (ccObj,skillID,skillLv,type) {
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        switch (type) {
            case constant.AddBaseData.PdBase:
                ccObj.addPdBase(num);
                break;
            case constant.AddBaseData.MdBase:
                ccObj.addMdBase(num);
                break;
            case constant.AddBaseData.PsBase:
                ccObj.addPsBase(num);
                break;
            case constant.AddBaseData.MsBase:
                ccObj.addMsBase(num);
                break;
            case constant.AddBaseData.Range:
                ccObj.addRange(num);
                break;
            case constant.AddBaseData.Hp:
                ccObj.addHpForPassive(num);
                break;
            case constant.AddBaseData.HpPer:
                ccObj.addPerHpForPassive(num/1000);
                break;
            case constant.AddBaseData.Ctit:
                ccObj.addCrit(num);
                break;
            case constant.AddBaseData.DamagePer:
                var range = ccObj.getAtkMaxRange();
                range = range || 1;
                range = range / 100;
                var configBase = ccObj.getNumConfig(jsonTables.CONFIG_MONSTERLV.DamageBase);
                var add = Math.ceil((num/1000 * range) * configBase);
                ccObj.addDamgeBase(add);
                break;
        }
    };

    //检查是否需要给怪物施加额外状态
    module.checkMonSpecialState = function (ccObj, skillID) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,skillID);
        if(config[jsonTables.CONFIG_PASSIVESKILL.Effect] === tb.PASSIVE_NO_CRIT_REFLEX) {
            ccObj.setMonAbnoramlState(constant.MonState.CritAtk_Immuno);
        }
    };

    module.isToggleVaild = function (skillID,skillLv) {
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam);
        var randNum = jsonTables.randomNum(0,100);
        if (randNum > num) return false;
        return true;
    };

    module.isSkillIDExit = function (ccObj,skillID) {
        var id = ccObj.getID();
        var map = this.container[id];
        if (!map) return false;
        return map.isKindIDEixt(skillID);
    };


    /**
     * 获取ext扩展参数
     * @param  {int} damageNum    伤害数值
     * @param  {int} damgeType   [伤害类型  定义在constan里面]
     * @param  {ccObj} damageToTarget 伤害作用者
     * @param  {ccObj} damageFromTarget 伤害来源者
     * @param  {int} toggleType   [检测类型]
     * @param  {boolean} isCrited   [是否已经暴击]
     */
    module.newExtObject = function (damageNum,damgeType,damageToTarget,damageFromTarget,toggleType,isCrited) {
        this.paramMap[damageFromTarget.getID()] = this.paramMap[damageFromTarget.getID()] || cc.js.createMap();
        var ext = this.paramMap[damageFromTarget.getID()];
        ext.damageNum = damageNum;
        ext.damgeType = damgeType;
        ext.damageToTarget = damageToTarget;
        ext.damageFromTarget = damageFromTarget;
        ext.damageInfo = ext.damageInfo || {};
        if (!damageFromTarget.getIsLife() || !damageToTarget.getIsLife()) return ext;
        ext.curHp = damageToTarget.getCurHp();
        if (toggleType === tb.PASSIVE_ATTACK_PRE) {//只有处于前置攻击时才进行赋值
            ext.critAtk = damageFromTarget.getCrit();//暴击几率
        }else if (toggleType === tb.PASSIVE_ATTACK_BEHIND) {//重置暴击率
            ext.critAtk = damageFromTarget.getCrit();//暴击几率
        }
        ext.isCrited = isCrited;//是否已经暴击
        ext.isDamageContinue = true;//本次伤害是否继续
        ext.damageInfo.damageBase = damageFromTarget.getDamageBase();
        ext.damageInfo.psBase = damageFromTarget.getPsBase();
        ext.damageInfo.msBase = damageFromTarget.getMsBase();
        ext.damageInfo.pdBase = damageToTarget.getPdBase();
        ext.damageInfo.mdBase = damageToTarget.getMdBase();
        return ext;
    };

    /**
     * 触发对象
     * @param  {ccObj} ccObj [怪物对象]
     * @param  {int} type  检测类型
     * @param  {Object} ext  额外扩展参数 使用newExtObject 生成
     */
    module.checkSkillToggle = function (ccObj,type,ext) {
        if (!fightLogic.isPassiveSkillVaild()) return ext;//// NOTE: 不在可运行的模式
        var id = ccObj.getID();
        var map = this.container[id];
        if (!map) return ext;
        if (!buffLogic.isPassSkillEnable(ccObj)) return ext;// NOTE: 检测是否由于2buff导致被动技能失效

        var skills = map.getEleByType(type);
        if (skills) {
            this.curMap = map;
            this.removeList.length = 0;//清空数据
            for (var key in skills) {
                var obj = skills[key];
                var targets = this.getTarget(ccObj,obj.config,ext);
                var skillID = Number(key);
                var result = this.doSkillEffect(obj.config,obj.skillLv,skillID,ccObj,targets,ext,obj);
                if (result === 1 || result === 2 || result === 3) {
                    if (obj.config[jsonTables.CONFIG_PASSIVESKILL.IsActiveOnce]) {
                        this.removeList.push(skillID);
                    }
                    if (result === 3) {
                        break;
                    }
                }
            }
            if (this.removeList.length > 0) {
                for (var i = 0 , len = this.removeList.length; i <  len; i++) {
                    var id = this.removeList[i];
                    map.desrElement(type,id);
                }
            }
        }
        return ext;
    };
    /**
     * 使技能效果生效  ext对应不同效果，需要不同参数，通过引用的方式 保证外部调用数值变更
     * @param  {Object} config  被动技能配置表
     * @param  {int} skillLv 技能等级
     * @param  {int} skillID 技能id
     * @param  {ccObj} ccObj   拥有这个技能的monsteritem对象
     * @param  {array} targets 作用对象数组
     * @param  {Object} ext     额外参数 更据不同类型给定不同参数
     * @param  {Object} obj     当前的技能对象
     * @return {int}         0 标识没有触发  1 标识成功但不加buff  2 标识成就且加buff 3必须停止
     */
    module.doSkillEffect = function (config,skillLv,skillID,ccObj,targets,ext,obj) {//这边只处理直接参数效果的技能 产生对象的技能通过skill处理
        if (!this.checkToggleCondition(config,skillLv,skillID,ccObj,targets,ext,obj)) return 0;
        var isAddBUFF = 0;//switch语句内每个函数必须要有返回值，用于判断是否可添加buff  存在小条件判断  返回0标识 失败， 1 标识成功但不加buff ， 2标识成就且加buff

        switch (config[jsonTables.CONFIG_PASSIVESKILL.Effect]) {
            case tb.CHANGE_FORM://变身术
                this.changeForm(skillLv,skillID,ccObj);
                return 3;
                break;
            case tb.DEFY_PD_DEFEND://无视物理防御
                isAddBUFF = this._defyDefend(config,skillLv,skillID,ccObj,targets,ext,constant.FormmulaBaseKey.PdBase);
                break;
            case tb.DEFY_MD_DEFEND://无视魔法防御
                isAddBUFF = this._defyDefend(config,skillLv,skillID,ccObj,targets,ext,constant.FormmulaBaseKey.MdBase);
                break;
            case tb.DEFENT_DAMAGE://格挡
                isAddBUFF =  this._desrDamge(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DERIVE_DAMAGE://反弹
                isAddBUFF = this._deriveDamge(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DAMAGE_ADD_PER://伤害百分比加成
                isAddBUFF = this._damgage_Add_Per(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.NEW_LOW_FORM://生成低一阶段的怪物
                isAddBUFF = this._new_Low_Form(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.RELIVE://复活
                isAddBUFF = this._relive(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.BLOOD_SUCK://吸血
                isAddBUFF = this._blood_Suck(config,skillLv,skillID,ccObj,targets,ext,obj);
                break;
            case tb.SPEECH://嗜血
                isAddBUFF = this._speech(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.CHASING://追击
                isAddBUFF = this._chasing(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.SPIKE://秒杀
                isAddBUFF = this._spike(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.NEW_MARK_FORM://生成指定阶段的怪物
                isAddBUFF = this._new_Mark_Form(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.ADD_PS_VALUE://增加物理强度
                isAddBUFF = this.add_Ps_Value(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.ADD_MS_VALUE://增加魔法强度
                isAddBUFF = this.add_Ms_Value(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DEAD_IMMUNO://死亡免疫
                isAddBUFF = this.dead_Immuno(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DAMAGE_PER_ENEMY://额外多个敌人伤害百分比
                isAddBUFF = this.damage_Per_Enemy(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.HOLY_SPRIT://圣灵召唤
                isAddBUFF = this.holy_Sprite(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DAMAGE_DOT_HP://血量DOT
                isAddBUFF = this.damage_Dot_Hp(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DAMAGE_DOT_DAMAGE://伤害DOT
                isAddBUFF = this.damage_Dot_Damage(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.IMAGE_SELF://镜像自身
                isAddBUFF = this.imageSelf(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DODGE://本次普通攻击无效
                isAddBUFF = this.dodge(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.HEAL_PER://直接治疗生命值百分比
                isAddBUFF = this.healPer(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.SHORT_CHANGE_REMOTE://近战转远程
                isAddBUFF = this.short_change_remote(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.DAMAGE_OVERLYING_PER://伤害百分比叠加
                isAddBUFF = this.damage_overlying_per(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.BULLET_AMOUNT://发出多个弹道
                isAddBUFF = this.bullet_amount(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.PASSIVE_HP_PERCENT://血量百分比加成
                isAddBUFF = this.passive_hp_percent(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.PASSIVE_DEMAGE_PERCENT://伤害百分比加成
                isAddBUFF = this.passive_damage_percent(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.PASSIVE_GENERATE://生成一个有增幅的虚影对象
                isAddBUFF = this.passive_generate(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.PASSIVE_NO_CRIT_REFLEX://免疫暴击并反伤
                isAddBUFF = this._deriveDamge(config,skillLv,skillID,ccObj,targets,ext);
                break;
            case tb.HEAL_PER_DOT://持续百分比回血
                isAddBUFF = this.healPerDot(config,skillLv,skillID,ccObj,targets,ext);
                break;
            default:
                isAddBUFF = this._doNextTipAction(config,skillLv,skillID,ccObj,targets,ext);
        }
        if (isAddBUFF === 2) {
            this.addSkillBUFF(config,skillLv,skillID,ccObj,targets);
        }
        return isAddBUFF;
    };

    /** 检测技能是否满足条件 */
    module.checkToggleCondition = function (config,skillLv,skillID,ccObj,targets,ext,obj) {
        switch (config[jsonTables.CONFIG_PASSIVESKILL.Condition]) {
            case tb.PASSIVE_CONDITION_FORM://形态压制判断
                if (targets.length === 0 || ccObj.getForm() <= targets[0].getForm()) return false;
                break;
            case tb.PASSIVE_CONDITION_PROBALY://概率判断
                if (!this.isToggleVaild(skillID,skillLv)) return false;
                break;
            case tb.PASSIVE_CONDITION_TANK_FORM://攻击目标为肉盾
                if (targets.length === 0 || targets[0].getType() !== constant.MonsterType.TANK) return false;
                break;
            case tb.PASSIVE_CONDITION_PER://血量低于最大血量baifenbi
            case tb.PASSIVE_CONDITION_LOW_PER://血量百分比降低时
                var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam);
                if (targets.length === 0 || !targets[0].isCurHpLowPerNum(num)) return false;
                break;
            case tb.PASSIVE_CONDITION_PROBALY_FORM://概率触发和形态压制
                if (targets.length === 0 || ccObj.getForm() <= targets[0].getForm() || !this.isToggleVaild(skillID,skillLv)) return false;
                break;
            case tb.PASSIVE_CONDITION_PROBALY_LOW://概率触发和血量低于
                var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.ConditionExtParam);
                if (targets.length === 0 || !targets[0].isCurHpLowPerNum(num) || !this.isToggleVaild(skillID,skillLv)) return false;
                break;
            case tb.PASSIVE_CONDITION_SELF_ALL_DEAD://我方所有家族死亡
                if (fightLogic.getMonCount(ccObj) !== 1) return false;
                break;
            case tb.PASSIVE_CONDITION_CRITS://暴击时触发
                if (!ext.isCrited) return false;
                break;
            case tb.PASSIVE_CONDITION_ATTACK_COUNT://累计普通攻击
                if (!this.isAtkVaild(config,ext.damgeType) || targets.length === 0) return false;
                if (!obj.count) {
                    obj.count = 0;
                }
                obj.count++;
                var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam);
                if (obj.count < num) return false;
                obj.count = 0;
                break;
            case tb.PASSIVE_CONDITION_MONSTER_NO_OUR://我方场上无某类型家族时触发
                var familyType = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam);
                if (!familyType) {
                    return false;
                }
                return fightLogic.isKindEixt(ccObj,familyType);
                break;
        }
        return true;
    };

    //生成一个有增幅的虚影对象
    module.passive_generate = function (config,skillLv,skillID,ccObj,targets,ext) {
        var tid = ccObj.getTid();
        var damge = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var script = fightLogic.callSceneRoot("newUnNormalmonster",[0.01,tid,ccObj.node.position,ccObj.getOwner(),damge/1000,true]);
        script.setShadow();
        script.setMonAbnoramlState(constant.MonState.Dead_Immuno);
        if (script.hpScript) {
            script.hpScript.setVisible(false);
        }
        targets[0] = script;
        return 2;
    };

    //伤害百分比加成
    module.passive_damage_percent = function (config,skillLv,skillID,ccObj,targets,ext) {
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        ccObj.setPerDamageBase((1 + num/1000));
        return 2;
    };

    //血量百分比加成
    module.passive_hp_percent = function (config,skillLv,skillID,ccObj,targets,ext) {
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        ccObj.addPerHpForPassive((1 + num/1000));
        return 2;
    };

    //发出多个弹道
    module.bullet_amount = function (config,skillLv,skillID,ccObj,targets,ext) {
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var max = num - 1;
        if (max <= 0) {
            return 2;
        }
        var damgePer = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        var bulletID = ccObj.getBulletID();
        var targets = fightLogic.findTargetByDis(ccObj,max,true);
        if (!(targets instanceof Array)) {
            var list = [targets];
            targets = list;
        }
        for (var i = 0 , len = targets.length; i < len; i++) {
            var target = targets[i];
            var damageInfo = {
                damageBase:Math.floor(ccObj.damageBase * (damgePer/100)),
                psBase:ccObj.getPsBase(),
                msBase:ccObj.getMsBase(),
                pdBase:target.getPdBase(),
                mdBase:target.getMdBase(),
                mineForm:ccObj.getForm(),
                target:target.getForm()
            }
            ccObj.newBullet(bulletID,damageInfo,target);//
        }
        return 2;
    };

    //镜像自身
    module.imageSelf = function (config,skillLv,skillID,ccObj,targets,ext) {
        var tid = ccObj.getTid();
        var hp = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var damge = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        fightLogic.callSceneRoot("newCopymonster",[hp/100,tid,ccObj.node.position,ccObj.getOwner(),true,damge/100,skillID,true]);
        return 2;
    };

    //直接治疗生命值百分比 使用目标的最大血量
    module.healPer = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!targets || targets.length === 0) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var heal = Math.floor(num/100 * targets[0].getMaxHp());
        var data = {};
        data.effect = tb.HEAL;
        data.skillLv = 1;
        data.fromer = ccObj;
        data.targets = targets;
        data.buffs = [];
        data.skillNum = heal;
        skillLogic.doEffect(data);
        return 2;
    };

    //近战转远程
    module.short_change_remote = function (config,skillLv,skillID,ccObj,targets,ext) {
        targets[0].addRange(1000);//// TODO: 暂时写死增加1000距离
        targets[0].setUseSencondAtk(true);
        targets[0].setMonAbnoramlState(constant.MonState.Role_Immuno);
        msgHander.newAllMsg(null,0.01,constant.MsgHanderType.REMOVE_BULLET,{target:ccObj});
        var time = kf.pDistance(targets[0].endPos,targets[0].node.position) / Math.abs(targets[0].getMoveSpeed());
        time = time /2;
        targets[0].changeMachineState(constant.StateEnum.WAITE);
        targets[0].playEnterAction(constant.StateEnum.RETURN);
        buffLogic.clearAllBuff(targets[0]);
        targets[0].doReturnAction(time,true,function () {
            msgHander.newAllMsg(null,0.01,constant.MsgHanderType.REMOVE_BULLET,{target:ccObj});
            setTimeout(function () {
                targets[0].setMonAbnoramlState(constant.MonState.Normal);
                targets[0].changeMachineState(constant.StateEnum.FIND);
            }.bind(this), 100);
        }.bind(this));
        return 2;
    };


    //本次普通攻击无效
    module.dodge = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType) || targets.length === 0) return 0;
        ext.isDamageContinue = false;
        return 2;
    };

    //血量DOT
    module.damage_Dot_Hp = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!config[jsonTables.CONFIG_PASSIVESKILL.Buff] || targets.length === 0) return 0;
        var data = {};
        data.effect = tb.ADDBUFF;
        data.skillLv = skillLv;
        data.fromer = ccObj;
        data.targets = targets;
        data.buffs = [config[jsonTables.CONFIG_PASSIVESKILL.Buff]];
        this.copyBuffParam(data,skillID,skillLv);
        if (!data.buffNum[0]) return 0;
        data.buffNum[0] = targets[0].getMaxHp() * (data.buffNum[0]/100);
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var damageBase =  ccObj.getDamageBase();
        var limitCount = Math.floor(damageBase * num / 100);
        if (data.buffNum[0] > limitCount) {
            data.buffNum[0] = limitCount;
        }
        data.skillNum = 0;
        skillLogic.doEffect(data);
        return 1;
    };

    //伤害DOT
    module.damage_Dot_Damage = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!config[jsonTables.CONFIG_PASSIVESKILL.Buff] || targets.length === 0) return 0;
        var data = {};
        data.effect = tb.ADDBUFF;
        data.skillLv = skillLv;
        data.fromer = ccObj;
        data.targets = targets;
        data.buffs = [config[jsonTables.CONFIG_PASSIVESKILL.Buff]];
        this.copyBuffParam(data,skillID,skillLv);
        if (!data.buffNum[0]) return 0;
        data.buffNum[0] = ext.damageNum * (data.buffNum[0]/100);
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var damageBase =  ccObj.getDamageBase();
        var limitCount = Math.floor(damageBase * num / 100);
        if (data.buffNum[0] > limitCount) {
            data.buffNum[0] = limitCount;
        }
        data.skillNum = 0;
        skillLogic.doEffect(data);
        return 1;
    };

    //圣灵召唤
    module.holy_Sprite = function (config,skillLv,skillID,ccObj,targets,ext) {
        var tid = ccObj.getTid();
        var newOne = fightLogic.callSceneRoot("newCopymonster",[1,tid,ccObj.node.position,ccObj.getOwner(),true,1,skillID,false]);
        targets[0] = newOne;
        return 2;
    };

    //额外多个敌人伤害百分比
    module.damage_Per_Enemy = function (config,skillLv,skillID,ccObj,targets,ext) {
        var count = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var data = {};
        data.effect = tb.DAMAGE_PER;
        data.skillLv = skillLv;
        data.fromer = ccObj;
        data.targets = fightLogic.findTargetByDis(ccObj,count,true);
        data.buffs = [];
        data.skillNum = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        skillLogic.doEffect(data);
        return 2;
    };

    //死亡免疫
    module.dead_Immuno = function (config,skillLv,skillID,ccObj,targets,ext) {
        ccObj.setMonAbnoramlState(constant.MonState.Dead_Immuno);
        return 2;
    };

    //增加物理强度
    module.add_Ps_Value = function (config,skillLv,skillID,ccObj,targets,ext) {
        var addNum = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        if (!addNum) return 0;
        ccObj.addPsBase(addNum);
        return 2;
    };
    //增加魔法强度
    module.add_Ms_Value = function (config,skillLv,skillID,ccObj,targets,ext) {
        var addNum = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        if (!addNum) return 0;
        ccObj.addMsBase(addNum);
        return 2;
    };

    //生成指定阶段的怪物
    module._new_Mark_Form = function (config,skillLv,skillID,ccObj,targets,ext) {
        var formIdx = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        if (!formIdx || formIdx > 5) {
            cc.error("配置指定阶段 阶段参数有误")
            return 0;
        }
        var tid = ccObj.getTid();
        tid = jsonTables.getMarkFormTid(tid,formIdx-1);
        if (!tid) return 0;
        var hpPer = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        hpPer = hpPer / 100;
        fightLogic.callSceneRoot("newCopymonster",[hpPer,tid,ccObj.node.position,ccObj.getOwner(),true,1,skillID,false]);
        return 2;
    };
    //秒杀
    module._spike = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType) || targets.length === 0) return 0;
        if (targets[0].isBoss()) return 0;//boss不能秒杀
        targets[0].spikeDead();
        return 1;// NOTE: 都tm死了 还上毛buff
    };
    //追击
    module._chasing = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType) || !this.curMap) return 0;
        var addNum = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        if (!addNum) return 0;
        var skillIDs = this.curMap.getEleByType(tb.PASSIVE_ATTACK_MID);
        if (!skillIDs || !skillIDs[constant.PassiveSkill2Born.Chasing_damge]) {
            skillIDs = this._addDerivativeSkill(constant.PassiveSkill2Born.Chasing_damge);
        }
        var limit = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        var cur = skillIDs[constant.PassiveSkill2Born.Chasing_damge].config[extParam233];
        cur += addNum;
        cur = cur > limit ? limit : cur;
        skillIDs[constant.PassiveSkill2Born.Chasing_damge].config[extParam233] = cur;
        return 2;
    };
    //嗜血
    module._speech = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.curMap) return 0;
        var limitNum = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        limitNum = limitNum / 100;
        if (!limitNum) return 0;
        var per = targets[0].getHpOffCurHp();
        var skillIDs = this.curMap.getEleByType(tb.PASSIVE_ATTACK_MID);
        if (!skillIDs || !skillIDs[constant.PassiveSkill2Born.Speech_damge]) {
            skillIDs = this._addDerivativeSkill(constant.PassiveSkill2Born.Speech_damge);
        }
        var extParam = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        var num = Math.floor(per / targets[0].getMaxHp() / limitNum * extParam);
        skillIDs[constant.PassiveSkill2Born.Speech_damge].config[extParam233] = num;
        return 2;
    };
    //吸血
    module._blood_Suck = function (config,skillLv,skillID,ccObj,targets,ext,obj) {
        if (!this.isAtkVaild(config,ext.damgeType)) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var heal = Math.floor(num/100 * ext.damageNum);
        var data = {};
        data.effect = tb.HEAL;
        data.skillLv = 1;
        data.fromer = ccObj;
        data.targets = targets;
        data.buffs = [];
        data.skillNum = heal;
        skillLogic.doEffect(data);
        obj.useCount = obj.useCount || 0;
        obj.useCount++;
        var max = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
        if (obj.useCount >= max) {
            this.removeList.push(skillID);
        }
        return 2;
    };
    //复活
    module._relive = function (config,skillLv,skillID,ccObj,targets,ext) {
        var max = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        ext.curHp = Math.floor(ccObj.getMaxHp() * max/100);//// TODO: 读取参数
        return 2;
    };
    //生成低一阶段的怪物
    module._new_Low_Form = function (config,skillLv,skillID,ccObj,targets,ext) {
        var tid = ccObj.getTid();
        tid = jsonTables.getLowFormTid(tid);
        if (!tid) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        num = num / 100;
        fightLogic.callSceneRoot("newCopymonster",[num,tid,ccObj.node.position,ccObj.getOwner(),true,1,skillID,false]);
        return 2;
    };
    //变身术
    module.changeForm = function (skillLv,skillID,ccObj) {
        var configTid = jsonTables.getEqulQualityTid(ccObj.getTid());
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        num = num / 100;
        fightLogic.callSceneRoot("newCopymonster",[num,configTid,ccObj.node.position,ccObj.getOwner(),false,1,skillID,false]);
        ccObj.putInPool();
    };
    //通用技能处理
    module._doNextTipAction = function (config,skillLv,skillID,ccObj,targets,ext) {
        var data = {};
        data.effect = config[jsonTables.CONFIG_PASSIVESKILL.Effect];
        data.skillLv = skillLv;
        data.fromer = ccObj;
        data.targets = targets;
        data.buffs = config[jsonTables.CONFIG_PASSIVESKILL.Buff] !== 0 ?[config[jsonTables.CONFIG_PASSIVESKILL.Buff]]:[];
        this.copyBuffParam(data,skillID,skillLv);

        data.skillNum = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        skillLogic.doEffect(data);
        return 1;
    };
    //伤害百分比加成
    module._damgage_Add_Per = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType)) return 0;
        var num = 0;
        if (skillID !== constant.PassiveSkill2Born.Speech_damge
            && skillID !== constant.PassiveSkill2Born.Chasing_damge
            && skillID !== constant.PassiveSkill2Born.Overlying_damge
            ) {
            num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
            if (skillID === 1018) {// TODO: 浮动这里特殊处理 以后在考虑把
                var extParam = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam);
                if (num > extParam) {
                    cc.error("配个毛线  下限比上限还大?");
                    return 0;
                }
                num = jsonTables.randomNum(num,extParam);
            }
        }else {// TODO: 嗜血比较特殊
            num = config[extParam233];
        }

        var per = 1 + num/100;
        per = per < 0 ? 0 : per;
        ext.damageNum = Math.floor(per *  ext.damageNum);
        return 2;
    };

    //伤害百分比叠加
    module.damage_overlying_per = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType)) return 0;
        if (!this.curMap) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var skillIDs = this.curMap.getEleByType(tb.PASSIVE_ATTACK_MID);
        if (!skillIDs || !skillIDs[constant.PassiveSkill2Born.Overlying_damge]) {
            skillIDs = this._addDerivativeSkill(constant.PassiveSkill2Born.Overlying_damge);
        }
        if (!skillIDs[constant.PassiveSkill2Born.Overlying_damge].config[extParam233]) {
            skillIDs[constant.PassiveSkill2Born.Overlying_damge].config[extParam233] = 0;
        }
        skillIDs[constant.PassiveSkill2Born.Overlying_damge].config[extParam233] += num;
        return 2;
    };

    /** 反弹伤害 */
    module._deriveDamge = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType)) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var targetNum = Math.floor(num/100 *  ext.damageNum) ;
        var data = {};
        data.effect = config[jsonTables.CONFIG_PASSIVESKILL.Effect];
        data.skillLv = 1;
        data.fromer = ccObj;
        data.targets = targets;
        data.skillNum = targetNum;
        data.buffs = [];

        skillLogic.doEffect(data);
        return 2;
    };
    /** 伤害格挡 */
    module._desrDamge = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!this.isAtkVaild(config,ext.damgeType)) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var per = 1 - num/100;
        per = per < 0 ? 0 : per;
        ext.damageNum = Math.floor(per *  ext.damageNum);
        return 2;
    };

    /** 无视防御 */
    module._defyDefend = function (config,skillLv,skillID,ccObj,targets,ext,constantType) {
        if (!this.isAtkVaild(config,ext.damgeType)) return 0;
        var num = this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.SkillParam);
        var per = 1-num/100;
        if (constantType === constant.FormmulaBaseKey.PdBase) {
            ext.damageInfo.pdBase = Math.floor(ext.damageInfo.pdBase * per);
        }else if (constantType === constant.FormmulaBaseKey.MdBase) {
            ext.damageInfo.mdBase = Math.floor(ext.damageInfo.mdBase * per);
        }
        return 2;
    };

    /** 获取指定目标 */
    module.getTarget = function (ccObj,config,ext) {
        var num = config[jsonTables.CONFIG_PASSIVESKILL.ObjectsNums];
        switch (config[jsonTables.CONFIG_PASSIVESKILL.Objects]) {
            case tb.PASSIVE_SELF:
                return [ccObj];
            case tb.PASSIVE_ATTACKER:
                return [ext.damageFromTarget];
            case tb.PASSIVE_BEATTACKER:
                return [ext.damageToTarget];
            case tb.PASSIVE_SENEMY://// // NOTE: : 获取距离最近的敌对目标
                return fightLogic.findTargetByDis(ccObj,num,true);
            case tb.PASSIVE_ALLY://// NOTE: 随机
                return fightLogic.findTargetByRandom(ccObj,num,false);
        }
        return [];
    };
    /** 拷贝buff参数 */
    module.copyBuffParam = function (data,skillID,skillLv) {
        data.buffTime = [];
        data.buffNum = [];
        for (var i = 0 ;i <   data.buffs.length; i++) {
            var obj = data.buffs[i];
            if (obj === tb.NO){
                data.buffs.splice(i,1);
                i--;
                continue;//不存在效果直接pass
            }
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,obj);
            data.buffTime.push(this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterTime));
            data.buffNum.push(this.getPassiveSkillLvValue(skillID,skillLv,jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterNum));
        }
    };
    /** 添加技能buff */
    module.addSkillBUFF = function (config,skillLv,skillID,ccObj,targets) {
        if (!config[jsonTables.CONFIG_PASSIVESKILL.Buff]) return;
        var data = {};
        data.effect = tb.ADDBUFF;
        data.skillLv = skillLv;
        data.fromer = ccObj;
        data.targets = targets;
        var buffs = config[jsonTables.CONFIG_PASSIVESKILL.Buff];
        if (buffs instanceof Array) {
            data.buffs = buffs;
        }else {
            data.buffs = [buffs];
        }
        this.copyBuffParam(data,skillID,skillLv);
        for(var i = data.buffs.length-1;i > -1;i--){
            if(data.buffs[i] === 0) {
                data.buffs.splice(i, 1);
            }
        }
        data.skillNum = 0;
        skillLogic.doEffect(data);
    };
    /** 判断攻击是否合法 */
    module.isAtkVaild = function (config,damgetType) {
        if (config[jsonTables.CONFIG_PASSIVESKILL.TimeParameter] === 4 //任意攻击
            || (config[jsonTables.CONFIG_PASSIVESKILL.TimeParameter] === 5 && (damgetType === 1 || damgetType === 2))//普通攻击
            || config[jsonTables.CONFIG_PASSIVESKILL.TimeParameter] === damgetType//准确的攻击  远程或近战 或技能
        ) return true;
        return false;
    };
    /** 获取被动技能等级表指定技能指定等级指定字段 */
    module.getPassiveSkillLvValue = function (skillID,skillLv,key) {
        var configLv = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILLLV,skillID,skillLv);
        if (!configLv) return 0;
        var num = configLv[key];
        num = num || 0;
        return num;
    };
    /** 添加一个衍生技能 */
    module._addDerivativeSkill = function (skillID) {
        if (!this.curMap) return null;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,1016);//// NOTE: : 先去找一份基础技能  高贵  拷贝他 修改一下
        config = kf.clone(config);
        config[jsonTables.CONFIG_PASSIVESKILL.InTime] = tb.PASSIVE_BEATTACK_MID;
        config[jsonTables.CONFIG_PASSIVESKILL.Condition] = 0;
        config[jsonTables.CONFIG_PASSIVESKILL.Effect] = tb.DAMAGE_ADD_PER;
        config[jsonTables.CONFIG_PASSIVESKILL.TimeParameter] = 4;
        config[extParam233] = 0;//用于记录一些额外的加成
        this.curMap.addElement(tb.PASSIVE_ATTACK_MID,skillID,{skillLv:1,config:config});
        return this.curMap.getEleByType(tb.PASSIVE_ATTACK_MID);
    };

    /** 持续百分比回血 */
    module.healPerDot = function (config,skillLv,skillID,ccObj,targets,ext) {
        if (!config[jsonTables.CONFIG_PASSIVESKILL.Buff] || targets.length === 0) return 0;
        var data = {};
        data.effect = tb.ADDBUFF;
        data.skillLv = skillLv;
        data.fromer = ccObj;
        data.targets = targets;
        data.buffs = [config[jsonTables.CONFIG_PASSIVESKILL.Buff]];
        this.copyBuffParam(data,skillID,skillLv);
        if (!data.buffNum[0]) return 0;
        data.buffNum[0] = ext.damageNum * (data.buffNum[0]/100);
        data.skillNum = 0;
        skillLogic.doEffect(data);
        return 1;
    };

    return module;
};
