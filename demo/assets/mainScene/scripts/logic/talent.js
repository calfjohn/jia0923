/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-29T13:45:30+08:00
 */

window["logic"]["talent"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var equipLogic = null;
    var cardLogic = null;
    var talentSkillLogic = null;
    var _EVENT_TYPE = [
        "refreshTalent",
        // "changeProSuccess",
        "talentUpSuccess",
        // "talentReset",
        "refreshLine",
        "clickTalent"
    ];

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.talents = [];
        this.havedReq = false;
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
        talentSkillLogic = kf.require("logic.talentSkill");
        equipLogic = kf.require("logic.equip");
        cardLogic = kf.require("logic.card");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Talent_Info", this.onResp_Talent_Info.bind(this));//响应 客户端请求天赋数据
        network.registerEvent("Resp_Talent_LvUp", this.onResp_Talent_LvUp.bind(this));//响应 客户端请求天赋升级
        network.registerEvent("Resp_Change_Career", this.onResp_Change_Career.bind(this));//响应 客户端请求转职
        network.registerEvent("Resp_Talent_Reset", this.onResp_Talent_Reset.bind(this));//响应 客户端请求天赋重置
    };

    module.getHavedReq = function () {
        return  this.havedReq;
    };

    module.reqInit = function () {
        this.havedReq = true;
        var data = {
            "Req_Data_Push":{},
            "Req_Talent_Info": {},
            "Req_Friend_Info": {},
            "Req_Boss_Info": {},
            "Req_Vip_Info":{},
            "Req_Mail_List":{},
            "Req_Arena_Info":{},
            "Req_Data_Activity":{},
            "Req_Achievement_Data": {},
            "Req_Get_RedPacket": {},
            "Req_Chat_Info":{"Type":1}
        };
        var seq = ["Req_Data_Push","Req_Talent_Info","Req_Friend_Info","Req_Boss_Info","Req_Vip_Info","Req_Mail_List","Req_Arena_Info", "Req_Data_Activity","Req_Achievement_Data","Req_Chat_Info","Req_Get_RedPacket"];
        network.sendSeq(data,seq,true);
        cardLogic.initOldExp();//请求老玩家经验值补偿
    };

    /** 客户端请求转职 */
    module.req_Change_Career = function(CareerID){
        var data = {
            "Req_Change_Career": {
                "CareerID":CareerID
            }
        };
        network.send(data);
    };

    module.onResp_Change_Career = function(param,sendData){
        userLogic.setBaseData(userLogic.Type.Career,sendData.CareerID);
        equipLogic.resetInitSpineData();
        clientEvent.dispatchEvent("refreshTalent");
    };
    /** 客户端请求天赋重置 */
    module.req_Talent_Reset = function(){
        var data = {
            "Req_Talent_Reset": {
            }
        };
        network.send(data);
    };

    module.onResp_Talent_Reset = function(param){
        userLogic.setBaseData(userLogic.Type.TalentPoint,param.TalentPoint);
        userLogic.setBaseData(userLogic.Type.Career,1);
        equipLogic.resetInitSpineData();
        this.talents = [];
        talentSkillLogic.setTalents(this.talents);
        clientEvent.dispatchEvent("refreshTalent");
    };
    /** 客户端请求天赋数据 */
    module.req_Talent_Info = function(){
        if(this.talents.length > 0){
            return  this.onResp_Talent_Info();
        }
        var data = {
            "Req_Talent_Info": {
            }
        };
        network.send(data,true);
    };

    module.onResp_Talent_Info = function(param){
        if(param){
            this.talents = param.Talents;
            talentSkillLogic.setTalents(this.talents);
        }
        // clientEvent.dispatchEvent("refreshTalent");
    };

    /** 客户端请求天赋升级 */
    module.req_Talent_LvUp = function(id){
        var data = {
            "Req_Talent_LvUp": {
                 "ID":id//ID
            }
        };
        network.send(data);
    };

    module.onResp_Talent_LvUp = function(param){
        var data = {
            ID:param.ID,
            Lv:param.Lv
        }
        jsonTables.addEleOrUpdate(this.talents,[data],function(srcObj,desObj){
            return srcObj.ID === desObj.ID;
        },true);
        if(param.Lv === 1){//从0升到1说明某条线应该被点亮了
            clientEvent.dispatchEvent("refreshLine",param.ID);
        }
        talentSkillLogic.setTalents(this.talents);
        userLogic.setBaseData(userLogic.Type.TalentPoint,param.TalentPoint);
        clientEvent.dispatchEvent("talentUpSuccess",param);
    };
    //返回某个职业的天赋信息
    module.getConfigByPro = function(profession){
        var config = jsonTables.getJsonTable(jsonTables.TABLE.TALENT);
        var data = [];
        for (var i = 0 , len = config.length; i < len; i++) {
            var obj = config[i];
            if(profession !== obj[jsonTables.CONFIG_TALENT.Profession])    continue;
            data.push(obj);
        }
        return  data;
    };

    module.getTalentLv = function(ID){
        for (var i = 0 , len = this.talents.length; i < len; i++) {
            var obj = this.talents[i];
            if(obj.ID !== ID)   continue;
            return  obj.Lv;
        }
        return  0
    };
    return module;
};
