/**
* @Author: junwei
* @Date:   2018-08-28T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-09-19T11:12:31+08:00
*/

window["logic"]["chat"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var timeLogic = null;
    var _EVENT_TYPE = [
        "refreshChat",
        "pushChat",
        "refreshSendTime"
    ];

    module.init = function(){
        this.initModule();
        this.maxNum = 50;
        this.updateInterval = 0.5;
        this.updateTimer = 0;
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset(true);//数据重置
        this.registerMsg();
        this.nextChatTime = 0;
        this.cose
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic =kf.require("logic.user");
        timeLogic = kf.require("logic.time");
    };

    module.reset = function(){//TODO
        this.chatInfo = {};//暂存所有聊天数据的地方
        this.chatInfo[constant.ChatInfoType.SYS] = [];
        this.chatInfo[constant.ChatInfoType.WORLD] = [];
        this.chatInfo[constant.ChatInfoType.PRIVATE] = [];
        this.chatList = [];//存放三类聊天信息，给主界面聊天窗口用
        this.addList = [];//新增聊天信息，每隔固定时长发放给UI
        clientEvent.dispatchEvent("refreshChat",this.chatList);
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Chat_Info", this.onResp_Chat_Info.bind(this));//响应 请求聊天数据
        network.registerEvent("Resp_Chat_Send", this.onResp_Chat_Send.bind(this));//响应 发送聊天数据
        network.registerEvent("Resp_Marquee", this.onResp_Marquee.bind(this));//响应 系统公告

        network.registerEvent("Resp_Update_Player_ChatInfo", this.onResp_Update_Player_ChatInfo.bind(this));//响应 系统公告
    };

    module.onResp_Update_Player_ChatInfo = function (param) {
        this.nextChatTime = param.NextChatTime;
        this.cost = param.Cost;
        clientEvent.dispatchEvent("refreshSendTime");
    };
    //系统公告
    module.onResp_Marquee = function(param){
        // var list = [];
        // for (var i = 0 , len = param.MarqueeInfos.length; i < len; i++) {//统一格式
        //     var obj = param.MarqueeInfos[i];
        //     var data = {
        //         Type:constant.ChatInfoType.SYS,
        //         Time:timeLogic.now(),
        //         Uid:0,
        //         Name:uiLang.getMessage("chatPanel","sys"),
        //         Content:obj.Content
        //     }
        //     list.push(data);
        // }
        // this.onResp_Chat_Send({ChatInfos:list});
        if(param.MarqueeInfos.length){
            uiManager.openUI(uiManager.UIID.ROLLPANEL,param.MarqueeInfos);
        }
    };

    /** 请求聊天数据 类型 0:系统信息 1：世界聊天 2:私聊 */
    module.req_Chat_Info = function(type){
        var data = {
            "Req_Chat_Info": {
                "Type":type
            }
        };
        network.send(data,true);
    };

    module.onResp_Chat_Info = function(param){
        this.chatInfo[constant.ChatInfoType.SYS].length = 0;
        this.chatInfo[constant.ChatInfoType.WORLD].length = 0;
        this.chatInfo[constant.ChatInfoType.PRIVATE].length = 0;
        this.chatList.length = 0;
        for (var i = param.ChatInfos.length - 1 ; i >= 0; i--) {
            var obj = param.ChatInfos[i];
            this.chatInfo[obj.Type].push(obj);
            this.chatList.push(obj);
        }
        clientEvent.dispatchEvent("refreshChat");
    };

    /** 请求发送聊天数据 */
    module.req_Chat_Send = function(decUid,content,decName){
        var data = {
            "Req_Chat_Send": {
                "DecUid":decUid,
                "DecName":decName,
                "Content":content,
            }
        };
        network.send(data,true);
    };

    module.checkInfo = function(){
        for (var variable in this.chatInfo) {
            if (this.chatInfo.hasOwnProperty(variable)) {
                if(this.chatInfo[variable].length > this.maxNum){
                    this.chatInfo[variable].splice(this.maxNum,this.chatInfo[variable].length - this.maxNum );//多余的数据丢弃
                }
            }
        }
        if(this.chatList.length > this.maxNum){
            this.chatList.splice(this.maxNum,this.chatList.length - this.maxNum );//多余的数据丢弃
        }
    };

    module.onResp_Chat_Send = function(param,sendData,meSend){
        for (var i = param.ChatInfos.length - 1 ; i >= 0; i--) {
            var obj = param.ChatInfos[i];
            // if(!meSend && userLogic.isMe(obj.Uid)) continue;
            this.chatInfo[obj.Type].unshift(obj);
            this.chatList.unshift(obj);
            this.addList.unshift(obj);
        }
        this.checkInfo();
        if(meSend){//马上刷新
            this.updateTimer = this.updateInterval;
        }
    };

    module.getChatData = function(type){
        return  this.chatInfo[type];
    };

    module.getAllChat = function(){
        return  this.chatList;
    };

    module.update = function(dt){
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;
        if(this.addList.length > 0){
            clientEvent.dispatchEvent("pushChat",this.addList);
            this.addList = [];
        }
    };

    return module;
};
