window["logic"]["formula"] = function() {

    var module = {};

    module.init = function(){
        this.familyConfigBaseMap = cc.js.createMap();
        this.familyConfigBaseMap[constant.FormmulaBaseKey.Hp] = {baseKey:jsonTables.CONFIG_MONSTERFAMILY.HpBasic,growKey:jsonTables.CONFIG_MONSTERFAMILY.HpGrowth,formKeyList:jsonTables.CONFIG_MONSTERFAMILY.HpForm};
        this.familyConfigBaseMap[constant.FormmulaBaseKey.Damage] ={baseKey:jsonTables.CONFIG_MONSTERFAMILY.DbBasic,growKey:jsonTables.CONFIG_MONSTERFAMILY.DbGrowth,formKeyList:jsonTables.CONFIG_MONSTERFAMILY.DbForm};
        this.familyConfigBaseMap[constant.FormmulaBaseKey.PbBase]={baseKey:jsonTables.CONFIG_MONSTERFAMILY.PbBasic,growKey:jsonTables.CONFIG_MONSTERFAMILY.PbGrowth,formKeyList:jsonTables.CONFIG_MONSTERFAMILY.PbForm};
        this.familyConfigBaseMap[constant.FormmulaBaseKey.MbBase]={baseKey:jsonTables.CONFIG_MONSTERFAMILY.MbBasic,growKey:jsonTables.CONFIG_MONSTERFAMILY.MbGrowth,formKeyList:jsonTables.CONFIG_MONSTERFAMILY.MbForm};
        this.familyConfigBaseMap[constant.FormmulaBaseKey.PdBase]={baseKey:jsonTables.CONFIG_MONSTERFAMILY.PdBasic,growKey:jsonTables.CONFIG_MONSTERFAMILY.PdGrowth,formKeyList:jsonTables.CONFIG_MONSTERFAMILY.PdForm};
        this.familyConfigBaseMap[constant.FormmulaBaseKey.MdBase]={baseKey:jsonTables.CONFIG_MONSTERFAMILY.MdBasic,growKey:jsonTables.CONFIG_MONSTERFAMILY.MdGrowth,formKeyList:jsonTables.CONFIG_MONSTERFAMILY.MdForm};
    };
    /**
    * 计算装备出售价格
    * @param  {int} base      [装备基础价格]
    * @param  {[int]} lv     [装备等级]
    */
    module.calculateEquipSell = function(base,lv){
        return  Math.floor((base * (lv * 10 + 100) / 100));
    };
    /**
    * 计算伤害
    * @param  {int} a      [来源者伤害系数]
    * @param  {[int]} b     [来源者物理强度]
    * @param  {[int]} c     [来源者魔法强度]
    * @param  {[int]} d    [受伤者物理防御]
    * @param  {[int]} e    [受伤者魔法防御]
    * @param  {[int]} f    [来源者形态]
    * @param  {[int]} g    [受伤者形态]
    * @return {[int]}       [计算结果]
    */
    module.calculateDamage = function(a,b,c,d,e,f,g){
        var f1 = this._getCoefficient(c,e);//计算魔法伤害系数
        var f2 = this._getCoefficient(b,d);//计算物理伤害系数
        var f3 = 1;
        if(g !== tb.MONSTER_ROLE && f !== tb.MONSTER_ROLE && g >= tb.MONSTER_EXCELLENT && g > f){//受伤者形态大于等于第三形态
            f3 = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.Reduction)[g - f - 1] / 100;
        }
        return  Math.floor(a * (f1 + f2) * f3);
    };

    /*
    获取伤害系数
    */
    module._getCoefficient = function(attack,defense){
        if(defense > attack){//防御大于攻击的时候
            return  1 / ((defense - attack) / 150 +1);
        }
        return  this._getMagnification(attack - defense,150,75);
    };
    /*
    攻击大于防御时，获取倍数
    */
    module._getMagnification = function(dValue,num150,num75){
        var i = 1;
        while (true) {
            if(dValue < num150){
                return  i + dValue / num150;
            }
            dValue -= num150;
            i ++;
            num150 += num75;
        }
    };
    /**
    * 计算剑值
    * @param  {int} ps      [物理攻击]
    * @param  {[int]} ms     [魔法攻击]
    * @param  {[int]} db     [伤害值]
    * @param  {[int]} cr    [暴击率]
    * @param  {[int]} y2    [剑值增加倍数]
    * @return {[int]}       [计算结果]
    */
    module.calculateSword = function(ps,ms,db,cr,y2){
        return  Math.floor(((250 + ps + ms) * db / 220) * (1 + cr / 1000) * y2 / 100);
    };
    /**
    * 计算剑值
    * @param  {int} pd      [物理防御]
    * @param  {[int]} md     [魔法防御]
    * @param  {[int]} hp     [当前血量]
    * @param  {[int]} y3    [盾值增加倍数]
    * @return {[int]}       [计算结果]
    */
    module.calculateShield = function(pd,md,hp,y3){
        return  Math.floor(((250 + pd + md) * hp / 2500) * y3 / 100);
    };
    /** 计算战斗 公式假的 */
    module.calculateFightPower = function(lv,quality){
        return lv*quality;
    };
    /** 计算开宝箱钻石消耗 */
    module.calculateTreasureDiamond = function(sec){
        var re = 0;
        var userLogic = kf.require("logic.user");
        var list = userLogic.getBaseData(userLogic.Type.TimeDiamondInfo);
        var min = Math.floor(sec/60);
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (min <= 0) break;
            if ( (i + 1) >= len) {
                re += ((Math.floor(min/30) + 1) * obj.Diamond);
            }else {
                var diff = list[i + 1].Time - obj.Time;
                re += ((Math.floor(Math.min(diff, min) / 30) + 1 ) * obj.Diamond);
                min -= diff;
            }
        }
        return re;
    };
    /**
    * 计算被动技能对剑盾值的增加值
    * @param  {int} a      [被动技能基础数值]
    * @param  {int} b     [家族等级]
    * @param  {int} c     [家族形态]
    * @param  {int} d    [家族品质加成系数]
    * @param  {int} e    [家族形态加成系数]
    * @param  {int} f    [家族等级加成系数]
    * @param  {int} g    [被动技能等级]
    * @return {int}       [计算结果]
    */
    module.calculateSkillAdd = function(a,b,c,d,e,f,g){
        if(!g)  return 0;
        return  Math.floor(a * Math.pow(e,c - 1) * (1 + f * (b - 1))* d * g);
    };
    /**
    * 计算矿山产量
    * @param  {int} nowTime   [当前时间]
    * @param  {[int]} startTime [开始时间]
    * @param  {[int]} endTime   [结束时间]
    * @param  {[int]} baseNum   [基数]
    * @return {[int]}           [description]
    */
    module.calculateMineProduct = function(nowTime,startTime,endTime,baseNum){
        var len = nowTime - startTime;
        var all = endTime - startTime;
        all = all < len ? len:all;
        if (all === 0) return 0;
        return Math.floor(len/all * baseNum);
    };
    /**
    * 计算池子内构成部分
    * @param  {[type]} N 沙盘格子总数
    * @param  {[type]} M 配置表base比例
    * @param  {[type]} a a家族在沙盘内的总数
    * @param  {[type]} b b家族在沙盘内的总数
    * @param  {[type]} c c家族在沙盘内的总数
    *///
    module.calculateGrouop = function (N,M,a,b,c) {
        var S = N*M;//抽取的总数量
        var aPer = 1-(a/(a + b + c));
        var bPer = 1-(b/(a + b + c));
        var cPer = 1-(c/(a + b + c));
        var aCount = Math.round(aPer * S);
        var bCount = Math.round(bPer * S);
        var cCount = Math.round(cPer * S);
        return [aCount,bCount,cCount];
    };
    /**
     * 获取基础数值
     * @param  {int} tid 怪物ID
     * @param  {String} constantKey  constant.FormmulaBaseKey定义相关内容
     * @param  {int} lv       等级
     * @return {int}          结果
     */
    module.calcuateBaseCount = function (tid,constantKey,lv) {
        var monConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        if (!monConfig) return 1;
        var familyID = monConfig[jsonTables.CONFIG_MONSTER.FamilyID];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
        if (!config) return 1;//没找到指定次数
        var cahchMap = this.familyConfigBaseMap[constantKey];
        if (!cahchMap) {
            cc.error("constantKey->",constantKey,"  在familyConfigBaseMap未配置");
            return 1;
        }
        var jsonKey = config[cahchMap.baseKey];
        var jsonValue = config[cahchMap.growKey];
        if (!jsonKey){
            cc.error("配置键值为",cahchMap.baseKey,"不存在于"+familyID+"的家族表--》",jsonKey);
            return 1;//没找到数值
        }
        if (!jsonValue){
            cc.error("配置键值为",cahchMap.growKey,"不存在于"+familyID+"的家族表--》",jsonValue);
            return 1;//没找到数值
        }
        lv = lv || 1;
        var re = Math.floor(jsonKey + (jsonValue/10 * (lv - 1)));//1级等于基础数值就好
        var list = config[cahchMap.formKeyList];
        var idx = monConfig[jsonTables.CONFIG_MONSTER.Form] - 1;
        if (!list[idx]) {
            cc.error("idx->",idx,"  系数未找到  familyID->",familyID," cahchMap.formKeyList->",cahchMap.formKeyList);
            return re;
        }
        return Math.floor( re * list[idx] / 100);

    };

    return module;
};
