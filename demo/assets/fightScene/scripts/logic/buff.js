/**
 * @Author: lich
 * @Date:   2018-08-08T10:53:05+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-08-08T10:53:59+08:00
 */

window["logic"]["buff"] = function() {

    var clientEvent = null;
    var msgHander = null;
    var fightLogic = null;

    var module = {};

    module.init = function(){
        this.initModue();
        this.reset();
        this.buffZnum = 1000;
    };

    module.initModue = function(){
        clientEvent = kf.require("basic.clientEvent");
        msgHander = kf.require("logic.msgHander");
        fightLogic = kf.require("logic.fight");
    };

    module.reset = function(){
        this.container = cc.js.createMap();
    };
    /** 添加buff表现 */
    module.addBuffEffect = function (ccObj,buffID,ele) {
        var buffConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,buffID);
        var resource = buffConfig[jsonTables.CONFIG_BUFF.Resource];
        if (resource === "-") {
            cc.warn("buffID:",buffID,"特效为空跳过展示·······");
            return;
        }else if (!resource) {
            cc.error("buffID：",buffID,"特效未配置·······");
            return;
        }
        this.removeBuffEffect(ele);//保证旧对象移除
        uiResMgr.loadBuffEffectPrefab(resource,function(prefab){
            if (!cc.isValid(ccObj) || !ccObj.getIsLife() || !ccObj.node.parent) return;//特么加载回来 这货挂了
            var buffConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,buffID);
            var buffType = buffConfig[jsonTables.CONFIG_BUFF.Type];
            var id = ccObj.getID();
            if (!this.container[id] || !this.container[id].isKindBuff(buffType)) return;

            ele.buffEffect = ccObj.node.getInstance(prefab,true);
            ele.buffEffect.name = "buffEffect233"+prefab.name;
            ele.buffEffect.scale = buffConfig[jsonTables.CONFIG_BUFF.BuffScale];
            var width = ccObj.getSpineWidth();
            var height = ccObj.getSpineHeight();
            var tid = ccObj.getTid();
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
            var x = buffConfig[jsonTables.CONFIG_BUFF.XScale]/100 *width;
            var y = config[jsonTables.CONFIG_MONSTER.MonsterYScale]/100 *height + config[jsonTables.CONFIG_MONSTER.MonsterYOffset] + buffConfig[jsonTables.CONFIG_BUFF.BuffYOffset];
            ele.buffEffect.position = cc.v2(x,y);
            ele.buffEffect.zIndex = buffConfig[jsonTables.CONFIG_BUFF.BuffZnum] > 0 ? (buffConfig[jsonTables.CONFIG_BUFF.BuffZnum] + this.buffZnum):((buffConfig[jsonTables.CONFIG_BUFF.BuffZnum] + this.buffZnum)*-1)
            var ani = ele.buffEffect.getComponent(cc.Animation);
            ani.play(buffConfig[jsonTables.CONFIG_BUFF.ClipName])
        }.bind(this));
    };

    /** 移除buff表现 */
    module.removeBuffEffect = function (ele) {
        if (ele && ele.buffEffect && cc.isValid(ele.buffEffect)) {
            ele.buffEffect.removeFromParent();
            ele.buffEffect.destroy();
            ele.buffEffect = null;
        }
    };
    /** 添加buff */
    module.addBuff = function (ccObj,buffID,buffNum,msgKey,buffFromer,buffExt) {
        var id = ccObj.getID();
        this.container[id] = this.container[id] || window.newStruct.newBuffMap();
        var buffConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,buffID);
        var buffType = buffConfig[jsonTables.CONFIG_BUFF.Type];
        if (this.isProtectFromDesr(ccObj)) {//是否存在免疫技能
            if (!buffConfig[jsonTables.CONFIG_BUFF.IsActive]) {
                return;//免疫减buff
            }
        }

        var oldEle = this.container[id].getElement(buffType);
        if (oldEle) {// NOTE: 如果存在同类的buff且同类buff值比当前值低 就强制去掉了旧的buff 否则维持原样
            if(buffNum > oldEle.buffNum) {
                msgHander.removeMsgByMapKey(oldEle.msgKey);
                if(oldEle.dotMsgKey)
                    msgHander.removeMsgByMapKey(oldEle.dotMsgKey);
                oldEle.buffNum = buffNum;
                oldEle.msgKey = msgKey;
                oldEle.buffFromer = buffFromer;
                oldEle.buffExt = buffExt;
            }
            else {
                //不替换  意味着当前buff不需要生效
                msgHander.removeMsgByMapKey(msgKey);
                return;
            }
        }else {
            var ele = this.container[id].addElement(buffType,{buffNum:buffNum,buffConfig:buffConfig,msgKey:msgKey,buffFromer:buffFromer,buffExt:buffExt});
            this.addBuffEffect(ccObj,buffID,ele);//添加特效
        }
        this.doBuffEffect(ccObj,buffID,buffNum);
    };

    /** 让buff生效 */
    module.doBuffEffect = function(ccObj,buffID,buffNum){
        if (!ccObj.getIsLife()) return;
        var id = ccObj.getID();
        var buffConfig =  jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,buffID);
        var ele = this.container[id].getElement(buffConfig[jsonTables.CONFIG_BUFF.Type]);
        if (!ele) return;
        switch (buffConfig[jsonTables.CONFIG_BUFF.Type]) {
            case tb.BUFF_AVATAR://分身术
                this.clearAvatar(ele.ext);
                ele.ext = fightLogic.skill_avatar(ccObj,buffNum,ele.buffExt);//将分身保存起来时间到了就消除
                break;
            case tb.BUFF_DIZZY://眩晕
                if (ccObj.machine && !ccObj.machine.isCurStateID(constant.StateEnum.DIZZY)) {
                    ccObj.changeMachineState(constant.StateEnum.DIZZY);
                }
                break;
            case tb.BUFF_DEAD_IMMUNO://死亡免疫
                break;
            case tb.BUFF_HOLY_SPRIT://圣灵召唤
                ccObj.setShadow();//变灰
                break;
            case tb.BUFF_ADD_BASEDAMAGE_SPEED://增强基础伤害和攻速
                var configBase = ccObj.getNumConfig(jsonTables.CONFIG_MONSTERLV.DamageBase);
                var add = Math.ceil(buffNum /100 * configBase);
                ccObj.addDamgeBase(add);
                ccObj.addActionSpeed(buffNum);
                break;
            case tb.BUFF_HEGEMOR_ARMOR://伤害减免加不被击退
                break;
            case tb.BUFF_DAMAGE_LOW://伤害减免
                break;
            case tb.BUFF_DAMAGE_UP_CRIT://伤害提升且必爆
                break;
            case tb.BUFF_HEAL_DOT://持续回血
                ccObj.addPerHp(buffNum/100,true);
                var curMsgKey = this.doDot(ccObj,buffID,buffNum);
                ele.dotMsgKey = curMsgKey;
                break;
            case tb.BUFF_DAMAGE_DOT://持续百分比掉血
                ccObj.desrHp(buffNum,ccObj,false,constant.DamageType.BUFF,false);
                var curMsgKey = this.doDot(ccObj,buffID,buffNum);
                ele.dotMsgKey = curMsgKey;
                break;
            case tb.BUFF_HEAL_IMMUNO://免疫伤害并转为血量
                ele.lastState = ccObj.getMonAbnoramlState();
                ccObj.setMonAbnoramlState(constant.MonState.Heal_Immuno);
                break;
            case tb.BUFF_END_DAMAGE://持续一段时间造成伤害
                ccObj.addTempShiled(buffNum);
                break;
        }
    };

    module.doDot = function (ccObj,buffID,buffNum) {
        return msgHander.newMsg(ccObj.getID(),ccObj.getID(),1,constant.MsgHanderType.BUFF_DOT,{ccObj:ccObj,buffID:buffID,buffNum:buffNum});
    };

    module.desrBuff = function (ccObj,buffID,buffNum) {
        var id = ccObj.getID();
        if (!this.container[id]) return;
        var buffConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.BUFF,buffID);
        var ele = this.container[id].desrElement(buffConfig[jsonTables.CONFIG_BUFF.Type]);
        this.removeBuffEffect(ele);
        if (!ele) return;
        if(ele.dotMsgKey)
            msgHander.removeMsgByMapKey(ele.dotMsgKey);
        switch (buffConfig[jsonTables.CONFIG_BUFF.Type]) {
            case tb.BUFF_AVATAR:
                this.clearAvatar(ele.ext);
                break;
            case tb.BUFF_DIZZY:
                if (ccObj.machine && ccObj.machine.isCurStateID(constant.StateEnum.DIZZY)) {
                    ccObj.changeMachineState(constant.StateEnum.FIND);
                }
                break;
            case tb.BUFF_DEAD_IMMUNO://死亡免疫
            case tb.BUFF_HOLY_SPRIT://圣灵召唤
                ccObj.machine.changeState(constant.StateEnum.DEAD);
                ccObj.putInPool(ccObj.isPlayer);
                fightLogic.checkGameResult(ccObj.getOwner());
                break;
            case tb.BUFF_ADD_BASEDAMAGE_SPEED://增强基础伤害和攻速
                var configBase = ccObj.getNumConfig(jsonTables.CONFIG_MONSTERLV.DamageBase);
                var add = Math.ceil(buffNum /100 * configBase);
                ccObj.addDamgeBase(-add);
                ccObj.addActionSpeed(-buffNum);
                break;
            case tb.BUFF_HEGEMOR_ARMOR://伤害减免加不被击退
                break;
            case tb.BUFF_DAMAGE_LOW://伤害减免
                break;
            case tb.BUFF_DAMAGE_UP_CRIT://伤害提升且必爆
                break;
            case tb.BUFF_HEAL_DOT://持续回血
                break;
            case tb.BUFF_HEAL_IMMUNO://免疫伤害并转为血量
                if (ele.lastState) {
                    ccObj.setMonAbnoramlState(ele.lastState);
                }
                break;
            case tb.BUFF_END_DAMAGE://持续一段时间造成伤害
                ccObj.removeTempShiled(buffNum);
                break;
        }
    };
    /** 清楚分身术对象 */
    module.clearAvatar = function (copys) {
        if (!copys.length) return;
        for (var i = 0 , len = copys.length; i < len; i++) {
            var obj = copys[i];
            if (!obj.getIsLife()) continue;
            obj.putInPool();
        }
    };

    module.clearAllBuff = function (ccObj) {
        var id = ccObj.getID();
        if (!this.container[id]) return;

        this.container[id].forEach(function(obj,type){
            if (type === tb.BUFF_AVATAR) {
                this.clearAvatar(obj.ext);
            }else if (type === tb.BUFF_END_DAMAGE) {
                ccObj.removeTempShiled(obj.buffNum);
            }
            this.removeBuffEffect(obj);
        }.bind(this))
        this.container[id].clear();
    };

    /** 进行buff增益或减 */
    module.addBuffCount = function (ccObj,baseCount) {
        var id = ccObj.getID();
        if (!this.container[id]) return baseCount;
        baseCount = this._addBuffPer(id,tb.BUFF_DAMAGE_UP,baseCount);
        baseCount = this._addBuffPer(id,tb.BUFF_DAMAGE_UP_CRIT,baseCount);
        baseCount = this._desrBuffPer(id,tb.BUFF_CHARM,baseCount);
        return baseCount;
    };
    /** 百分比加成 */
    module._addBuffPer = function (id,type,baseCount) {
        var ele = this.container[id].getElement(type);
        if (ele) {
            var addCount = 0;
            addCount += ele.buffNum/100;
            baseCount = Math.floor(baseCount * (1+ addCount));
        }
        return baseCount;
    }

    /** 减免 */
    module.desrBuffCount = function (ccObj,baseCount,damgeType) {
        var id = ccObj.getID();
        if (!this.container[id]) return baseCount;
        baseCount = this._desrBuffPer(id,tb.BUFF_HEGEMOR_ARMOR,baseCount);
        baseCount = this._desrBuffPer(id,tb.BUFF_DAMAGE_LOW,baseCount);

        if (damgeType === constant.DamageType.FAR) {
            baseCount = this._desrBuffPer(id,tb.BUFF_DAMAGE_LOW_FAR,baseCount);
        }else if (damgeType === constant.DamageType.NEAR) {

        }

        return baseCount;
    };
    /** 百分比减免 */
    module._desrBuffPer = function (id,type,baseCount) {
        var ele = this.container[id].getElement(type);
        if (ele) {
            var addCount = 0;
            addCount += ele.buffNum/100;
            baseCount = Math.floor(baseCount * (1- addCount));
        }
        return baseCount;
    }

    module.isKindBuffExit = function (ccObj,buffEnum) {
        var id = ccObj.getID();
        if (!this.container[id]) return false;
        var ele = this.container[id].getElement(buffEnum);
        if (ele) {
            return true;
        }
        return false;
    };

    /** 是否可被击飞 */
    module.isCanHitBack = function (ccObj) {
        return !this.isKindBuffExit(ccObj,tb.BUFF_HEGEMOR_ARMOR);
    };
    //是否必定暴击
    module.isCritEnable = function (ccObj) {
        return this.isKindBuffExit(ccObj,tb.BUFF_DAMAGE_UP_CRIT);
    };
    /** 是否处于沉默 */
    module.isInSilent = function (ccObj) {
        return this.isKindBuffExit(ccObj,tb.BUFF_SILENT);
    };
    /** 是否可使用被动技能 */
    module.isPassSkillEnable = function (ccObj) {
        return !this.isInSilent(ccObj);
    };
    //是否免疫技能
    module.isProtectFromDesr = function (ccObj) {
        return this.isKindBuffExit(ccObj,tb.BUFF_IMMUNITYACITIVE);
    };

    return module;
};
