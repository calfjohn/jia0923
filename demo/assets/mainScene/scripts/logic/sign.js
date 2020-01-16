/**
 * @Author: junwei
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-12T09:45:29+08:00
 */

window["logic"]["sign"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var timeLogic = null;
    var userLogic = null;
    var _EVENT_TYPE = [
        "refreshSign",
        "clickSign"
    ];
    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.rewardInfo = [];
        this.isToday = false;
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        timeLogic = kf.require("logic.time");
        userLogic = kf.require("logic.user");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Sign_Info", this.onResp_Sign_Info.bind(this));
        network.registerEvent("Resp_Sign", this.onResp_Sign.bind(this));
    };

    //请求签到信息
    module.req_Sign_Info = function(){
        var data = {
            "Req_Sign_Info": {
            }
        };
        network.send(data);
    };
    module.onResp_Sign_Info = function(param){//响应签到信息
        this.signNum = this.dealSignNum(param.Sign);
        this.lastSign = param.SignTime;
        this.isToday = timeLogic.isToday(this.lastSign);
        this.rewardInfo = param.Rewards;
        clientEvent.dispatchEvent("refreshSign");
    };
    //计算已经签到天数
    module.dealSignNum = function(num){
        var result = 0;
        while (num) {
            if(1 & num){
                result ++;
            }
            num = num >> 1;
        }
        return   result;
    };
    module.req_Sign = function(shopID,num){
        userLogic.desrRedDotCount(constant.RedDotEnum.SiginIn,1);
        var data = {
            "Req_Sign": {
            }
        };
        network.send(data);
    };

    module.onResp_Sign = function(param) {
        this.signNum = this.dealSignNum(param.Sign);
        this.lastSign = param.SignTime;
        this.isToday = timeLogic.isToday(this.lastSign);
        // this.rewardInfo = param.Reward;
        uiManager.openUI(uiManager.UIID.REWARDMSG,[param.Reward]);
        clientEvent.dispatchEvent("refreshSign");
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ACHIGET);
    };

    module.getRewardInfo = function(){
        return kf.clone(this.rewardInfo);
    };

    module.getSignNum = function(){
        return  this.signNum;
    };
    module.getIsToday = function(){
        return  this.isToday;
    };

    module.getSignStatus = function(num){
        var status;
        if(num === this.signNum + 1){
            status =this.isToday? constant.SignStatus.UNGET:constant.SignStatus.GETREWARD;
        }else{
            status = num <= this.signNum?constant.SignStatus.RECEICED:constant.SignStatus.UNGET;
        }
        return status;
    };

    return module;
};
