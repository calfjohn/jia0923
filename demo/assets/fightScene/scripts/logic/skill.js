/**
 * @Author: lich
 * @Date:   2018-08-08T10:53:05+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-08-08T10:53:59+08:00
 */

window["logic"]["skill"] = function() {

    var clientEvent = null;
    var fightLogic = null;
    var msgHanderLogic = null;
    var module = {};

    module.init = function(){
        this.initModue();
        this.reset();
    };

    module.initModue = function(){
        clientEvent = kf.require("basic.clientEvent");
        fightLogic = kf.require("logic.fight");
        msgHanderLogic = kf.require("logic.msgHander");
    };

    module.reset = function(){
        this.container = cc.js.createMap();
    };
    /**
     * 产生技能效果
     * @param  {[type]} skillID 技能id
     * @param  {[type]} skillLv 技能等级
     * @param  {[type]} caster  施法者
     * @param  {[type]} isPassive  是否主动
     */
    module.doEffect = function (data) {
        var effect = data.effect;   //  效果类型
        var skillLv = data.skillLv; //技能等级
        var fromer = data.fromer; //技能来源者
        var targetType = data.targetType; //对象类型枚举
        var targetNum = data.targetNum; //对象数量
        var buffs = data.buffs;//需要被加入的buff
        var buffTimes = data.buffTime;//buff对应持续时间
        var buffNums = data.buffNum;//buff对应数值
        var buffExt = data.buffExt;//buff的额外参数
        var targets = data.targets;//强制指定目标
        var skillNum = data.skillNum;//技能作用数值
        var skillExNum = data.skillExNum;//技能作用的额外数值。目前只用于直接伤害百分比加基础数值类型技能，提供一个最低伤害
        if (effect === tb.NO) return;//不存在效果直接pass
        this._doEffect(effect,skillLv,fromer,targetType,targetNum,buffs,targets,skillNum,buffTimes,buffNums,buffExt,skillExNum);
    };

    module._doEffect = function(effect,skillLv,fromer,targetType,targetNum,buffs,targetsData,skillNum,buffTimes,buffNums,buffExt,skillExNum){
        if (effect === 0) return;
        var targets = targetsData !== undefined ? targetsData: fightLogic.getSkillTarget(targetType,fromer,targetNum);
        for (var i = 0 , len = targets.length; i < len; i++) {
            var obj = targets[i];
            this._doSwich(obj,skillNum,effect,fromer,buffs,skillLv,buffTimes,buffNums,buffExt,skillExNum);
        }
    };

    module._doSwich = function (obj,skillNum,enumType,fromer,buffs,skillLv,buffTimes,buffNums,buffExt,skillExNum){
        switch (enumType) {
            case tb.DAMAGE_PER://直接伤害百分比
            case tb.DERIVE_DAMAGE://反弹伤害 //已经算好了
            case tb.DAMAGE_HP_PER://血量伤害百分比
            case tb.DAMAGE_PER_NUM://直接伤害百分比加基础数值
            case tb.PASSIVE_NO_CRIT_REFLEX: //免暴并反弹  已经算好了
                if (enumType === tb.DAMAGE_PER) {
                    skillNum = Math.floor(fromer.getDamageBase() * skillNum/100);
                }else if (enumType === tb.DAMAGE_HP_PER) {
                    skillNum = Math.floor(fromer.getMaxHp() * ( skillNum/100));
                }else if (enumType === tb.DAMAGE_PER_NUM) {
                    skillNum = Math.floor(fromer.getDamageBase() * skillNum/100);
                    if(skillExNum && skillNum < skillExNum){//如果造成的百分比伤害低于最低伤害，按最低伤害计算
                        skillNum = skillExNum;
                    }

                }
                msgHanderLogic.newMsg(fromer.getID(),obj.getID(),0,constant.MsgHanderType.SKILL_DAMAGE,{damgeFromer:fromer,damageNum:skillNum});//创建攻击行为
                break;
            case tb.ADDBUFF://产生Buff
                this.doBuff(obj,buffs,fromer,buffTimes,buffNums,buffExt);
                break;
            case tb.DAMGEBUFF://伤害加Buff
                msgHanderLogic.newMsg(fromer.getID(),obj.getID(),0,constant.MsgHanderType.SKILL_DAMAGE,{damgeFromer:fromer,damageNum:skillNum});//创建攻击行为
                this.doBuff(obj,buffs,fromer,buffTimes,buffNums,buffExt);
                break;
            case tb.HITBACK:
            case tb.DAMAGE_HITBACK:
                msgHanderLogic.newMsg(fromer.getID(),obj.getID(),0,constant.MsgHanderType.SKILL_HITBACK,{target:obj,buffs:buffs,fromer:fromer,buffTimes:buffTimes,buffNums:buffNums});//击退技能
                if (enumType === tb.DAMAGE_HITBACK) {
                    msgHanderLogic.newMsg(fromer.getID(),obj.getID(),0,constant.MsgHanderType.SKILL_DAMAGE,{damgeFromer:fromer,damageNum:skillNum});//创建攻击行为
                }
                break;
            case tb.HEAL://直接治疗
            case tb.HEAL_PER://直接治疗生命值百分比
                if (enumType === tb.HEAL_PER) {
                    skillNum = Math.floor(obj.getMaxHp() * (skillNum/100));
                }
                msgHanderLogic.newMsg(fromer.getID(),obj.getID(),0,constant.MsgHanderType.SKILL_HEAL,skillNum);//创建攻击行为
                this.doBuff(obj,buffs,fromer,buffTimes,buffNums);
                break;
            default:
                cc.warn('类型',enumType,"暂未实现");
        }
    };
    module.doBuff = function(target,buffs,fromer,buffTimes,buffNums,buffExt){
        for (var i = 0 , len = buffs.length; i < len; i++) {
            var obj = buffs[i];
            var msgKey = msgHanderLogic.newMsg(fromer.getID(),target.getID(),buffTimes[i]/1000,constant.MsgHanderType.BUFF_REMOVE,{buffId:obj,buffNum:buffNums[i]});
            msgHanderLogic.newMsg(fromer.getID(),target.getID(),0,constant.MsgHanderType.BUFF_ADD,{buffId:obj,buffNum:buffNums[i],msgKey:msgKey,buffFromer:fromer,buffExt:buffExt});
        }
    };

    return module;
};
