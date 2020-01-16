/**
* @Author: lich
* @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-30T13:57:41+08:00
*/

window["logic"]["mail"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var timeLogic = null;
    var _EVENT_TYPE = [
        "refreshMail",
        "getMainInfoSuccess",
        "getRewardSuccess",
        "updateListData",
    ];

    module.MailType = {
        TOP:1,
        COMMON:0
    };

    module.ENUM_MAIL_STATE_UNREAD = 0;//未读
    module.ENUM_MAIL_STATE_READED = 1;//已读
    module.ENUM_MAIL_STATE_RECEIVED = 2;//已领取
    module.ENUM_MAIL_STATE_DELETED = 3;//已删除
    module.ENUM_MAIL_STATE_OVERDUE = 4;//已过期

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
        timeLogic = kf.require("logic.time");
    };

    module.reset = function(){
        this.mailInfo = [];//存儲邮件内容
        this.reqHaved = false;
        this.isInOpenBossBox = false;//是否在开启boss宝箱
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Mail_List", this.onResp_Mail_List.bind(this));//响应 请求邮件列表
        network.registerEvent("Resp_Mail_Read", this.onResp_Mail_Read.bind(this));//响应 邮件读取
        network.registerEvent("Resp_Mail_Receive", this.onResp_Mail_Receive.bind(this));//响应 邮件领取
        network.registerEvent("Push_Mail", this.onPush_Mail.bind(this));//响应 邮件推送
    };

    module.getReqHaved = function(){
        return  this.reqHaved;
    };
    
    module.setIsInOpenBossBox = function (isInOpenBossBox) {
        this.isInOpenBossBox = isInOpenBossBox;
    };

    module.isOpenBoxFlag = function () {
        return this.isInOpenBossBox;
    };

    /** 请求邮件列表 */
    module.req_Mail_List = function(){
        var data = {
            "Req_Mail_List": {
            }
        };
        network.send(data,true);
    };

    module.onResp_Mail_List = function(param){
        this.reqHaved = true;
        this.mailInfo = param.MailInfos;
        this.sortMailToPanel();
        clientEvent.dispatchEvent("refreshMail",this.mailInfo);
    };
    /** 请求邮件读取 */
    module.req_Mail_Read = function(mailID){
        // userLogic.desrRedDotCount(constant.RedDotEnum.Mail,1);
        var data = {
            "Req_Mail_Read": {
                MailID:mailID
            }
        };
        network.send(data);
    };

    module.onResp_Mail_Read = function(param){
        var mailIdx = this.getMailIdx(param.MailID);
        if(this.mailInfo[mailIdx].Status === this.ENUM_MAIL_STATE_UNREAD){
            this.mailInfo[mailIdx].Status = this.ENUM_MAIL_STATE_READED;
            clientEvent.dispatchEvent("updateListData",this.mailInfo);
        }
        this.mailInfo[mailIdx].Content = param.Content;
        this.mailInfo[mailIdx].Reward = param.Reward;
        clientEvent.dispatchEvent("getMainInfoSuccess", this.mailInfo[mailIdx]);
    };
    /** 请求邮件领取 */
    module.req_Mail_Receive = function(mailIDs){
        this.recMailList = mailIDs;
        if(this.recMailList.length === 0)   return;
        var mailID = this.recMailList.shift();
        var data = {
            "Req_Mail_Receive": {
                MailID:[mailID]
            }
        };
        network.send(data);
    };

    module.onResp_Mail_Receive = function(param,sendData){
        this.setMailStatus(sendData.MailID,this.ENUM_MAIL_STATE_RECEIVED);
        clientEvent.dispatchEvent("getRewardSuccess");
        var cb = function(){
            this.isInOpenBossBox = false;
            this.req_Mail_Receive(this.recMailList);
        }.bind(this);
        var notCloseSelf = this.recMailList.length > 0 && param.ChestRewards.length === 0;//当剩余可领取邮件长度为1以上时，点确定不关闭奖励弹窗，防闪屏
        var checkCb = function () {
            if (param.ChestRewards.length > 0) {//
                var boxId = 0;
                for (var i = 0 , len = param.Reward.length; i <  len; i++) {
                    var obj = param.Reward[i];
                    if (obj.Type === constant.ItemType.BOX) {
                        boxId = obj.BaseID;
                        break;
                    }
                }
                uiManager.openUI(uiManager.UIID.OPENBOXANI,param.ChestRewards,boxId,cb);
            }else {
                cb();
            }
        }.bind(this);
        this.isInOpenBossBox = param.ChestRewards.length > 0;
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Reward,checkCb,undefined,notCloseSelf);
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ACHIGET);
        // uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("mail","getReward"));
    };
    /** 请求邮件删除 */
    module.req_Mail_Delete = function(mailIDs){
        this.deleteMail(mailIDs);
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.MAILDELETE);
        var data = {
            "Req_Mail_Delete": {
                MailID:mailIDs
            }
        };
        network.send(data,true);
    };
    module.onPush_Mail = function(param){
        for (var i = 0 , len = param.MailInfos.length; i < len; i++) {
            var obj = param.MailInfos[i];
            this.mailInfo.splice(0,0,obj);
        }
    };
    //批量设置邮件的状态
    module.setMailStatus = function(mailIDs,status){
        for (var i = 0 , len = this.mailInfo.length; i < len; i++) {
            var obj = this.mailInfo[i];
            for (var j = 0; j < mailIDs.length; j++) {
                if(mailIDs[j].equals(obj.ID)){
                    obj.Status = status;
                    break;
                }
            }
        }
    };
    //删除某条邮件
    module.deleteMail = function(mailIDs){
        var firstIdx = 0;
        for (var i = 0 , len = mailIDs.length; i < len; i++) {
            var obj = mailIDs[i];
            var idx = this.getMailIdx(obj);
            this.mailInfo.splice(idx,1);
            if(i === 0){
                firstIdx = idx;
            }
        }
        var nextIdx = 0;//删除多条，自动选中第一条
        if(mailIDs.length === 1){//删除单条，主动选择上一条
            nextIdx = firstIdx >= this.mailInfo.length?this.mailInfo.length - 1:firstIdx;
        }
        clientEvent.dispatchEvent("refreshMail",this.mailInfo,nextIdx);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("mail","delete"));
    };
    //获取某一条邮件的idx
    module.getMailIdx = function(id) {
        for (var i = 0 , len = this.mailInfo.length; i < len; i++) {
            var obj = this.mailInfo[i];
            if(obj.ID.notEquals(id))   continue;
            return  i;
        }
    };
    module.sortMailToPanel = function(){
        this.mailInfo.sort(this._sort.bind(this));
        // this.mailInfo = this.sortMail(this.mailInfo);
    };
    //邮件按发送时间顺序排序
    module._sort = function(a,b) {
        if(a.Type === this.MailType.TOP)  return -1;
        if(b.Type === this.MailType.TOP)  return 1;
        var re = this.getSortRet(a,b,this.ENUM_MAIL_STATE_UNREAD);
        if (re !== null) return re;
        var re = this.getSortRet1(a,b,this.ENUM_MAIL_STATE_READED);
        if (re !== null) return re;
        return b.ID - a.ID;
    };
    module.getSortRet = function (a,b,tag) {
        if (a.Status === tag && b.Status !== tag) return -1;
        if (a.Status !== tag && b.Status === tag) return 1;
        if (a.Status === tag && b.Status === tag) {
            return b.ID - a.ID;
        }
        return null;
    };
    module.getSortRet1 = function (a,b,tag) {
        if ((a.Status === tag && a.Gift) && (b.Status !== tag || !b.Gift)) return -1;
        if ((a.Status !== tag || !a.Gift) && (b.Status === tag && b.Gift)) return 1;
        if ((a.Status === tag && a.Gift) && (b.Status === tag && b.Gift)) {
            return b.ID - a.ID;
        }
        return null;
    };
    //获取邮件列表
    module.getMailList = function(){
        return kf.clone(this.mailInfo);
    };

    module.getMailByID = function(id){
        for (var i = 0 , len = this.mailInfo.length; i < len; i++) {
            var obj = this.mailInfo[i];
            if(obj.ID.notEquals(id))   continue;
            return obj;
        }
        cc.error("id" + id + "邮件不存在");
        return undefined;
    };

    module.getCanRecList = function(){
        var list = [];
        for (var i = 0 , len = this.mailInfo.length; i < len; i++) {
            var obj = this.mailInfo[i];
            if(obj.Gift && obj.Status !== this.ENUM_MAIL_STATE_RECEIVED){
                list.push(obj.ID);
            }
        }
        return list;
    };
    module.getCanDelList  = function(){
        var list = [];
        for (var i = 0 , len = this.mailInfo.length; i < len; i++) {
            var obj = this.mailInfo[i];
            if((!obj.Gift && obj.Status === this.ENUM_MAIL_STATE_READED) || obj.Status === this.ENUM_MAIL_STATE_RECEIVED){
                list.push(obj.ID);
            }
        }
        return list;
    };
    return module;
};
