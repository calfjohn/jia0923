/**
* @Author: lich
* @Date:   2018-06-12T15:04:24+08:00
* @Last modified by:
* @Last modified time: 2018-09-21T20:34:50+08:00
*/

window["logic"]["equip"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var talentSkillLogic = null;
    var specialList = [11,12,13,14,15,16,23,24];
    var _EVENT_TYPE = [
        "refreshEquip",
        "resetSpine",
        "downEquip",
        "refreshNextArrt",
    ];
    module.init = function(){
        this.initModule();
        this.name = "equip";//用于uilang关联界面
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.UPDATE_ENUM = {
        DELETE:0,
        UPDATE_ADD:1,
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
        talentSkillLogic = kf.require("logic.talentSkill");
    };

    module.reset = function(){
        this.allEquips =[];
        this.bagInfo = [];
        this.sortArr = [];
        this.curEquips = [];//位置索引加+1为对应位置装备id 这个id是唯一id
        this.notRefresh = false;
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_PlayerData_Equip", this.onResp_PlayerData_Equip.bind(this));//响应 用户的装备数据信息
        network.registerEvent("Resp_PlayerUpdate_Equip", this.onResp_PlayerUpdate_Equip.bind(this));//响应 装备更新

        network.registerEvent("Resp_Equip_LvUp", this.onResp_Equip_LvUp.bind(this));//响应 客户端请求装备强化
        network.registerEvent("Resp_Equip_Wear", this.onResp_Equip_Wear.bind(this));//响应 客户端请求穿装备
        network.registerEvent("Resp_Equip_Del", this.onResp_Equip_Del.bind(this));//响应 客户端请求装备丢弃
        network.registerEvent("Resp_Equip_Sell", this.onResp_Equip_Sell.bind(this));//响应 客户端请求装备出售
        network.registerEvent("Resp_Equip_UnWear", this.onResp_Equip_UnWear.bind(this));//响应 客户端请求脱装备
        network.registerEvent("Resp_Equip_LvAttr", this.onResp_Equip_LvAttr.bind(this));//请求下一个等级属性
    };

    module.req_Equip_Sort = function () {
        var data = {
            "Req_Equip_Sort": {}
        };
        network.send(data);
    };
    //请求下一个等级属性
    module.req_Equip_LvAttr = function (ID,exp) {
        // this.notRefresh = true;//不需要刷新界面
        var data = {
            "Req_Equip_LvAttr": {
                'ID':ID,
                'Exp':exp
            }
        };
        network.send(data);
    };
    //请求下一个等级属性
    module.onResp_Equip_LvAttr = function(param,sendData){
        this.nextData = param.Equip;
        this.nextData.ID = sendData.ID;
        this.nextData.exp = sendData.Exp;
        clientEvent.dispatchEvent("refreshNextArrt",this.nextData);
    };

    module.req_Equip_Lock = function (baseID,isLock) {
        this.notRefresh = true;//不需要刷新界面
        var data = {
            "Req_Equip_Lock": {
                'ID':baseID,
                'Lock':isLock
            }
        };
        network.send(data);
    };

    module.onResp_PlayerData_Equip = function(param){//响应 用户的装备数据信息
        this.allEquips = param.Bag;
        this.bagMax = param.BagMax;
        this.sortArr = param.Sort;
        if(!this.spineInitData){
            this.resetInitSpineData();
        }
        this.refreshCurEquip(param.Equips);
        talentSkillLogic.setEquipAddList(this.getAttrMap());
    };

    module.onResp_PlayerUpdate_Equip = function(param){//响应 装备更新
        this.sortArr = param.Sort;
        for (var i = 0 , len = param.Type.length; i < len; i++) {
            if (param.Type[i] === this.UPDATE_ENUM.DELETE) {
                jsonTables.removeByKey(this.allEquips,[param.Equip[i]],function(srcObj,desObj){
                    return srcObj.ID === desObj.ID;
                })
                jsonTables.removeByKey(this.curEquips,[param.Equip[i]],function(srcObj,desObj){//删除 可能把身上穿着的一起删除了
                    return srcObj.ID === desObj.ID;
                })
                jsonTables.removeByKey(this.bagInfo,[param.Equip[i]],function(srcObj,desObj){
                    return srcObj.ID === desObj.ID;
                })
            }else if (param.Type[i] === this.UPDATE_ENUM.UPDATE_ADD) {
                jsonTables.addEleOrUpdate(this.allEquips,[param.Equip[i]],function(srcObj,desObj){
                    return srcObj.ID === desObj.ID;
                },true);
                if(!this.checkInCur(param.Equip[i].ID)){//不是身上装备的，才去更新或者新增背包数据
                    jsonTables.addEleOrUpdate(this.bagInfo,[param.Equip[i]],function(srcObj,desObj){
                        return srcObj.ID === desObj.ID;
                    },true);
                }else{
                    jsonTables.addEleOrUpdate(this.curEquips,[param.Equip[i]],function(srcObj,desObj){
                        return srcObj.ID === desObj.ID;
                    },false);
                }
            }
        }
        clientEvent.dispatchEvent("refreshEquip",false,this.notRefresh);
        if(this.notRefresh){//只有点击新装备才会进入到这里
            this.notRefresh = false;
        }else{
            talentSkillLogic.setEquipAddList(this.getAttrMap());
        }
    };
    //刷新自己身上的时装信息
    module.refreshSpine = function(){
        var equipIDs = [];
        for (var i = 0 , len = this.curEquips.length; i < len; i++) {
            var obj = this.curEquips[i];
            equipIDs.push(obj.BaseID);
        }
        this.spineData = this._refreshSpine(this.spineInitData,equipIDs,userLogic.getBaseData(userLogic.Type.Sex),userLogic.getBaseData(userLogic.Type.Career));
        clientEvent.dispatchEvent("resetSpine");
    };
    //根据装备，获取时装信息
    module._refreshSpine = function(spineInitData,equipData,sex,profession){
        sex = sex ? sex:1;
        var spineData = kf.clone(spineInitData);
        var deelResouce = function(type,obj){
            var modelData = undefined;
            var resource;
            var equipResource = jsonTables.strToObject(obj[jsonTables.CONFIG_EQUIP.Resource]);
            if(equipResource[0]){
                resource = equipResource[0];
            }else{
                resource = equipResource[sex];
            }
            if(resource.length === 1){//所有职业通用
                modelData = resource[0].model;
            }else{//根据职业不同需要不同的spine
                for (var i = 0 , len = resource.length; i < len; i++) {
                    var objext = resource[i];
                    if(objext.limit.indexOf(profession) === -1)   continue;
                    modelData = objext.model;
                    break;
                }
                if(modelData === undefined){
                    modelData = resource[0].model;
                    console.error("职业" + profession + "没有该时装的配置表信息");
                }
            }
            spineData[type] = modelData;
        };
        for (var i = 0 , len = equipData.length; i < len; i++) {
            if(!equipData[i])   continue;
            var obj =jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,equipData[i]);//装备配置表基本数据;
            if(obj[jsonTables.CONFIG_EQUIP.Resource]){
                switch (obj[jsonTables.CONFIG_EQUIP.Type]) {
                    case constant.EquipType.MODEL:
                    deelResouce("base",obj);
                    break;
                    case constant.EquipType.MODEL_WEAPON:
                    deelResouce("weapon",obj);
                    break;
                    case constant.EquipType.HEAD:
                    deelResouce("head",obj);
                    break;
                }
            }

        }
        return  spineData;
    };
    /**
    * 设置主角的spine
    * @param  {[node]}   spineNode [description]
    * @param  {Function} callback  [description]
    */
    module.setBaseSpine = function(spineNode,callback){
        uiResMgr.getSpineByData(this.spineData,spineNode,callback);
    };
    /**
    * 根据spine信息刷新对方节点的spine
    * @param  {int}   sex [对方性别]
    * @param  {int}   profession [对方职业]
    * @param  {[object]}   equipIDs [对方身上的装备]
    * @param  {[node]}   spineNode [对方的spineNode]
    * @param  {Function} callback  [回调]
    */
    module.setBaseSpineForOther = function(sex,profession,equipIDs,spineNode,callback){
        sex = sex?sex:1;
        profession = profession?profession:1;
        var spineInitData = this.getBaseSpineData(sex,profession);
        var spineData = this._refreshSpine(spineInitData,equipIDs,sex,profession);
        uiResMgr.getSpineByData(spineData,spineNode,callback);
    };
    //重置职业基础spine数据
    module.resetInitSpineData = function(){
        this.spineInitData = this.getBaseSpineData(userLogic.getBaseData(userLogic.Type.Sex),userLogic.getBaseData(userLogic.Type.Career));
        this.refreshSpine();
    };
    //获取职业基础spine数据作为模板
    module.getBaseSpineData = function(sex,profession) {
        sex = sex === 0?1:sex;
        var spineInitData = {
            // base:{"1":[{"limit":[0],"model":"maleWarrior"}],"2":[{"limit":[0],"model":"maleWarrior1"}]},
            // weapon:[{'limit':[0],'model':{'arms':{desSlot:'jian',skinName:'default',srcSlot:'jian',srcName:'jian'}}},],
            base:"maleWarrior",
            weapon:"",
            head:"",
        };
        var configData = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,profession);//职业数据
        if(configData){
            spineInitData.base = jsonTables.strToObject(configData[jsonTables.CONFIG_PROFESSION.BaseSpine])[sex];
        }else{
            cc.error("职业" + profession + "在职业表中没有配基础spine信息")
        }
        return spineInitData;
    };
    /** 请求装备强化 */
    module.req_Equip_LvUp = function(id,useID){
        this.notRefresh = false;
        var data = {
            "Req_Equip_LvUp": {
                'ID':id,
                'StuffIDs':useID
            }
        };
        network.send(data);
    };

    module.onResp_Equip_LvUp = function(param){
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.EQUIPUP);
        uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("equipUp","success"));
    };

    /** 请求穿装备 */
    module.req_Equip_Wear = function(id){
        var data = {
            "Req_Equip_Wear": {
                'ID':id
            }
        };
        network.send(data);
    };

    module.onResp_Equip_Wear = function(param){
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.EQUIPWEAR);
        this.refreshCurEquip(param.Equips);
    };

    /** 请求装备丢弃 */
    module.req_Equip_Del = function(id){
        var data = {
            "Req_Equip_Del": {
                'ID':id
            }
        };
        network.send(data);
    };

    module.onResp_Equip_Del = function(param){

    };

    /** 请求点击新装备 */
    module.req_Click_Equip = function(id){
        this.notRefresh = true;//不需要刷新界面
        var data = {
            "Req_Click_Equip": {
                'ID':id
            }
        };
        network.send(data);
    };

    /** 请求装备出售 */
    module.req_Equip_Sell = function(id){
        var data = {
            "Req_Equip_Sell": {
                'IDs':[id]
            }
        };
        network.send(data);
    };

    module.onResp_Equip_Sell = function(param){
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.name,"sellEquip"));
    };
    /** 请求装备脱下 */
    module.req_Equip_UnWear = function(id){
        var data = {
            "Req_Equip_UnWear": {
                'ID':id
            }
        };
        network.send(data);
    };

    module.onResp_Equip_UnWear = function(param){
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.EQUIPWEAR);
        this.refreshCurEquip(param.Equips);
    };
    //检查是否有当前部位的装备
    module.checkHaveEquip = function (idx) {
        for (var i = 0 , len = this.bagInfo.length; i < len; i++) {
            var obj = this.bagInfo[i].BaseID;
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,obj);
            if(config[jsonTables.CONFIG_EQUIP.Type] === idx)    return  true;
        }
        return  false;
    };

    module.refreshCurEquip = function(curIDs){
        this.curEquips = [];
        this.bagInfo = [];
        for (var i = 0 , len = this.allEquips.length; i < len; i++) {
            var obj = this.allEquips[i];
            if(curIDs.indexOf(obj.ID) !== -1){
                this.curEquips.push(obj);
            }else{
                this.bagInfo.push(obj);
            }
        }
        this.refreshSpine();
        clientEvent.dispatchEvent("refreshEquip");
    };

    module.getSortArr = function () {
        return  this.sortArr;
    };

    module.getBagData = function(){
        return kf.clone(this.bagInfo);
    };

    module.getBagMax = function(){
        return this.bagMax;
    };

    module.getCurEquips = function(){
        return kf.clone(this.curEquips);
    };

    module.checkInCur = function(id){
        for (var i = 0 , len = this.curEquips.length; i < len; i++) {
            var obj = this.curEquips[i];
            if(obj.ID !== id)   continue;
            return  true;
        }
        return  false;
    };

    module.getDataByID = function(id){
        for (var i = 0 , len = this.allEquips.length; i < len; i++) {
            var obj = this.allEquips[i];
            if(obj.ID !== id)   continue;
            return obj;
        }
        cc.error("未找到ID为" + id +"的装备");
        return  undefined;
    };

    module.getMonStr = function(id){
        var str = "";
        switch (id) {
            case constant.MonsterType.PLAYER:
            str = uiLang.getMessage("equip","player");
            break;
            case constant.MonsterType.WARRIOR:
            str = uiLang.getMessage("equip","warrior");
            break;
            case constant.MonsterType.TANK:
            str = uiLang.getMessage("equip","tank");
            break;
            case constant.MonsterType.SHOOTER:
            str = uiLang.getMessage("equip","shooter");
            break;
            case constant.MonsterType.ALL:
            str = uiLang.getMessage("equip","all");
            break;
            default:
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,id);//家族配置表基本数据
            var str =uiLang.getConfigTxt(config[jsonTables.CONFIG_MONSTERFAMILY.NameID]) + uiLang.getMessage("equip","family");
        }
        return  str;
    };

    //获取属性描述
    module.getDataStr = function(obj){
        var str = "";
        var mon = this.getMonStr(obj.ID);//作用对象
        var value;
        if(specialList.indexOf(obj.Type) !== -1){
            value = obj.Value / 10;
        }else{
            value = obj.Value;
        }
        var msg = uiLang.getMessage(this.name,"attr" + obj.Type);
        if(msg === "")  return "";
        str += msg.formatArray([mon,value]);//千分比，除于10
        return str;
    };
    //获取属性增加描述
    module.getDataStrEx = function(obj){
        var str;
        // var mon = this.getMonStr(obj.ID);//作用对象
        var value;
        if(specialList.indexOf(obj.Type) !== -1){
            value = obj.Value / 10;
        }else{
            value = obj.Value;
        }
        var msg = uiLang.getMessage(this.name,"attrEx" + obj.Type);
        str = obj.Value + msg;
        return str;
    };

    //获取我当前身上装备的所有属性的map，同作用对象和同类型的value自动相加
    module.getAttrMap = function(){
        var info = {};
        for (var i = 0 , len = this.curEquips.length; i < len; i++) {
            var obj = this.curEquips[i].AttrInfos;
            for (var j = 0 , lens = obj.length; j < lens; j++) {
                var attr = obj[j];
                info[attr.ID] = info[attr.ID]?info[attr.ID]:{};
                info[attr.ID][attr.Type] = info[attr.ID][attr.Type]?info[attr.ID][attr.Type] + attr.Value:attr.Value;
            }
        }
        var list = {};
        for (var ID in info) {
            if (info.hasOwnProperty(ID)) {
                var obj = info[ID];
                list[ID] = [];
                for (var type in obj) {
                    if (obj.hasOwnProperty(type)) {
                        list[ID].push({Type:Number(type),Value:obj[type]})
                    }
                }
            }
        }
        return  list;
    };
    module.equipGetPosData = function (type) {
        for (var i = 0 , len = this.curEquips.length; i < len; i++) {
            var obj = this.curEquips[i];
            var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,obj.BaseID);//装备配置表基本数据
            if(baseData[jsonTables.CONFIG_EQUIP.Type] === type){
                var data = kf.clone(obj);
                data.BaseData = baseData;
                return  data;
            }
        }
        return null;
    };
    //获取我当前身上装备的所有属性
    module.getAllAttr = function(){
        var map = this.getAttrMap();
        var list = [];
        for (var ID in map) {
            if (map.hasOwnProperty(ID)) {
                var obj = map[ID];
                for (var i = 0 , len = obj.length; i < len; i++) {
                    list.push({Type:obj[i]["Type"],ID:Number(ID),Value:obj[i]["Value"]});
                }
            }
        }
        return  list;
    };
    //获取我当前身上装备的所有属性描述
    module.getCurAttr = function(){
        return  this.getDataStr(this.getAllAttr());
    };
    return module;
};
