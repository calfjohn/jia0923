/**
* @Author: junwei
* @Date:   2018-08-28T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-24T15:02:49+08:00
*/

window["logic"]["friend"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var areanLogic = null;
    var _EVENT_TYPE = [
        "refreshFriend",
        "updateOne",
        "refreshFind",
        "refreshRecommend",
        "refreshIvite",
        "refreshGift",
        "refreshInv",
    ];
    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
        this.addPage = 1;//提前请求1页的数据
        this.pageNum = 8;//每页显示多少个好友
    };

    module.UPDATE_ENUM = {
        DELETE:0,
        UPDATE_ADD:1,
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
        areanLogic = kf.require("logic.arean");
    };

    module.reset = function(){
        this.friendData = window.newStruct.newLongMap();//好友列表数据
        this.appliesData = window.newStruct.newLongMap();//申请列表数据
        this.friendIdx = 0;//好友列表信息更新到的Idx
        this.appliesIdx = 0;//好友请求的信息更新Idx
        this.friendNumMax = 0;
        this.giftRecvNum = 0;
        this.giftRecvNumMax = 0;
        this.recMax = 10;
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Friend_Info", this.onResp_Friend_Info.bind(this));//响应 返回好友数据
        network.registerEvent("Resp_Friend_Apply", this.onResp_Friend_Apply.bind(this));//响应请求添加好友
        network.registerEvent("Resp_Friend_ApplyRet", this.onResp_Friend_ApplyRet.bind(this));//响应 客户端好友申请反馈（同意 / 拒绝）
        network.registerEvent("Resp_PlayerUpdate_Friend", this.onResp_PlayerUpdate_Friend.bind(this));//响应 更新好友数据
        network.registerEvent("Resp_PlayerInfos", this.onResp_PlayerInfos.bind(this));//响应 好友详情
        network.registerEvent("Resp_Friend_Del", this.onResp_Friend_Del.bind(this));//响应 好友删除
        network.registerEvent("Resp_Friend_Find", this.onResp_Friend_Find.bind(this));//响应 好友查找
        network.registerEvent("Req_Friend_GiftSend", this.onReq_Friend_GiftSend.bind(this));//响应 体力赠送
        network.registerEvent("Resp_Friend_Invite_Info",this.onResp_Friend_Invite_Info.bind(this));//响应 好友邀请码
        network.registerEvent("Resp_Recv_Invite",this.onResp_Recv_Invite.bind(this));//领取别人输入邀请码奖励
        network.registerEvent("Resp_Invite", this.onResp_Invite.bind(this));//领取输入邀请码奖励
    };
    
    /** 记录渠道好友数据 */
    module.req_Set_Channel_Friends = function(accounts){
        var data = {
            "Req_Set_Channel_Friends": {
                "Account":accounts
            }
        };
        network.send(data,true);
    };

    /** 请求体力赠送 */
    module.req_Friend_GiftSend = function(uid){
        var data = {
            "Req_Friend_GiftSend": {
                "DecUid":uid
            }
        };
        network.send(data);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","giftSend"));
    };
    module.onReq_Friend_GiftSend = function(param){
    };
    /** 请求体力领取 */
    module.req_Friend_GiftRecv = function(uidList){
        if(this.giftRecvNum >= this.giftRecvNumMax){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","recFull"));
            return;
        }
        for (var i = 0 , len = uidList.length; i < len; i++) {
            var obj = uidList[i];
            this.friendData.list[obj].GiftState = 0;
        }
        this.giftRecvNum += len;
        clientEvent.dispatchEvent("refreshFriend");
        var data = {
            "Req_Friend_GiftRecv": {
                "UserID":uidList
            }
        };
        network.send(data,true);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","giftGet"));
    };
    /** 请求好友查找 */
    module.req_Friend_Find = function(name,uid){
        var data = {
            "Req_Friend_Find": {
                "Name":name,
                "Uid":uid
            }
        };
        network.send(data);
    };
    module.onResp_Friend_Find = function(param){
        clientEvent.dispatchEvent("refreshFriend",param.Infos);
    };
    /**请求好友邀请数据 */
    module.req_Friend_Invite_Info = function(){
        var data = {
            "Req_Friend_Invite_Info": {
            }
        };
        network.send(data);
    };
    module.onResp_Friend_Invite_Info = function(param){
        this.inviteUserInfo = [];
        for (let i = 0; i < param.Lv.length; i++) {
            var data = {
                name: param.Name[i],
                lv: param.Lv[i],
                state: param.State[i],
                uid: param.Uid[i],
                rewards: param.Rewards
            }
            this.inviteUserInfo.push(data);
        };
        this.myInviter = param.MyInviter;//我的邀请人
        this.recMax = param.RecMax;//邀请上限
        clientEvent.dispatchEvent("refreshIvite");
    };
    module.req_Recv_Invite = function(uid){//请求邀请码奖励
        var data = {
            "Req_Recv_Invite":{
                "Uid":uid
            }
        };
        network.send(data);
    };
    module.onResp_Recv_Invite = function(param){
        for (let i = 0; i < this.inviteUserInfo.length; i++) {
            if (this.inviteUserInfo[i].uid.toNumber() !== param.Uid.toNumber()) continue;
            this.inviteUserInfo[i].state = param.State;
            break;
        };
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards,undefined,undefined);
        clientEvent.dispatchEvent("refreshIvite");
    };
    //邀請碼
    module.req_Invite = function (code) {
        var data = {
            "Req_Invite":{
                Code:parseInt(code,16)
            }
        };
        network.send(data);
    };

    module.onResp_Invite = function (param,sendData) {
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards,undefined,undefined);
        this.myInviter = sendData.Code;
        clientEvent.dispatchEvent("refreshInv");
    };
    /** 请求好友数据 */
    module.req_Friend_Info = function(){
        var data = {
            "Req_Friend_Info": {
            }
        };
        network.send(data,true);
    };
    module.onResp_Friend_Info = function(param){
        this.friendNumMax = param.FriendNumMax;
        this.giftRecvNum = param.GiftRecvNum;
        this.giftRecvNumMax = param.GiftRecvNumMax;
        this.friendData.reset();//好友列表数据重置
        this.appliesData.reset();//申请列表数据重置
        this.friendIdx = 0;//好友列表信息更新到的Idx
        this.appliesIdx = 0;//好友请求的信息更新Idx
        for (var i = 0 , len = param.Infos.length; i < len; i++) {
            var obj = param.Infos[i];
            this.friendData.addElement(obj.Uid,{GiftSend:obj.GiftSend,GiftState:obj.GiftState});
        }
        for (var i = 0 , len = param.Applies.length; i < len; i++) {
            var obj = param.Applies[i];
            this.appliesData.addElement(obj,{});
        }
        var initNum = (this.addPage + 1) * this.pageNum;//初始加载数据数量
        this.friendIdx = this.friendData.getLen() > initNum?initNum:this.friendData.getLen();
        var arr = this.friendData.getKeys().slice(0,this.friendIdx);//好友列表初始请求列表
        this.appliesIdx = this.appliesData.getLen() > initNum?initNum:this.appliesData.getLen();
        arr = arr.concat(this.appliesData.getKeys().slice(0,this.appliesIdx));//申请添加好友列表初始请求列表
        this.req_PlayerInfos(arr);
        this.isFirst = true;
        this.friendIdxEx = this.friendIdx;//好友列表信息更新到的Idx,用于不重复请求好友信息
        this.appliesIdxEx = this.appliesIdx;//好友请求的信息更新Idx,用于不重复请求好友信息
    };
    /** 请求添加好友 */
    module.req_Friend_Apply = function(decUid){
        if(this.getFriendNum >= this.friendNumMax){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","friendMax"));
            return;
        }
        var data = {
            "Req_Friend_Apply": {
                "DecUid":decUid
            }
        };
        network.send(data,true);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","requireAdd"));
    };
    module.onResp_Friend_Apply = function(param){
    };
    /** 请求好友删除 */
    module.req_Friend_Del = function(decUid){
        var data = {
            "Req_Friend_Del": {
                "DecUid":decUid
            }
        };
        network.send(data,true);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","requireDel"));
    };
    module.onResp_Friend_Del = function(param){
    };
    /** 客户端好友申请反馈（同意 / 拒绝） */
    module.req_Friend_ApplyRet = function(decUid,ret){
        if(ret === 1 && this.getFriendNum >= this.friendNumMax){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","friendMax"));
            return;
        }
        var data = {
            "Req_Friend_ApplyRet": {
                "DecUid":decUid,
                "Ret":ret//操作类型 0:拒绝 1:同意
            }
        };
        network.send(data);
    };

    module.onResp_Friend_ApplyRet = function(param){
        var str = param.SrcName + uiLang.getMessage("friend","passType" + param.Ret) + uiLang.getMessage("friend","friendMsg");
        uiManager.openUI(uiManager.UIID.TIPMSG , str);
    };
    /** 请求好友数据 */
    module.req_PlayerInfos = function(uidArr){
        if(uidArr.length <= 0) return;
        var data = {
            "Req_PlayerInfos": {
                "UserID":uidArr
            }
        };
        network.send(data,true);
    };
    module.onResp_PlayerInfos = function(param,sendData){
        if(sendData.RankType){
            areanLogic.onResp_PlayerInfos(param,sendData);
            return;
        }
        for (var i = 0 , len = param.Infos.length; i < len; i++) {
            var obj = param.Infos[i];
            if(!this.friendData.setValue(obj.UserID,obj)){
                this.appliesData.setValue(obj.UserID,obj);
            }
        }
        if(this.isFirst){
            clientEvent.dispatchEvent("refreshFriend");
            this.isFirst = false;
        }
        if(param.Infos.length === 1){
            if(this.friendData.list[param.Infos[0].UserID]){//好友数据包含状态
                clientEvent.dispatchEvent("updateOne",this.friendData.list[param.Infos[0].UserID]);
            }else{
                clientEvent.dispatchEvent("updateOne",param.Infos[0]);
            }

        }
    };
    module.onResp_PlayerUpdate_Friend = function(param){
        this.giftRecvNum = param.GiftRecvNum;
        var list = [];
        for (var i = 0 , len = param.Infos.length; i < len; i++) {
            var obj = param.Infos[i];
            list.push(obj.Uid);
        }
        this.friendData.updateListSpecial(list,param.Infos);
        this.appliesData.updateList(param.Applies);
        clientEvent.dispatchEvent("refreshFriend");
    };
    module.getFriendList = function(){
        return this.friendData.getKeys();
    };
    module.getAppliesList = function(){
        return this.appliesData.getKeys();
    };
    module.checkFriend = function(idx){
        this.check(idx,this.friendIdx,this.friendIdxEx,this.friendData);
    };
    module.checkApplies = function(idx){
        this.check(idx,this.appliesIdx,this.friendIdxEx,this.appliesData);
    };
    module.check = function(idx,dataIdx,dataIdxEx,data){
        if(dataIdx >= data.getLen() - 1 || idx >= dataIdx - this.pageNum || dataIdxEx > dataIdx) return;
        var beginIdx = dataIdx + 1;
        dataIdxEx = dataIdx + this.pageNum >= data.getLen() - 1 ?  data.getLen() - 1 : dataIdx + this.pageNum;
        this.req_PlayerInfos(data.getKeys().slice(beginIdx,dataIdxEx));
    };
    module.getFriendData = function(uid){
        return this.friendData.list[uid];
    };
    module.getAppliesData = function(uid){
        return this.appliesData.list[uid];
    };
    module.isMyFriend = function(uid){
        return  !!this.friendData.list[uid];
    };
    module.getFriendMaxNum = function(){
        return this.friendNumMax;
    };
    module.getFriendNum = function(){
        return this.friendData.keys.length;
    };
    module.getAppliesNum = function(){
        return this.appliesData.keys.length;
    };
    module.getGiftRecvNum = function(){
        return this.giftRecvNum;
    };
    module.getGiftRecvNumMax = function(){
        return this.giftRecvNumMax;
    };
    module.getInviteData = function(){
        return this.inviteUserInfo;
    };
    module.getRecMax = function(){
        return this.recMax;
    };
    module.getMyInviter = function(){
        return this.myInviter;
    };
    module.getRewards = function(){
        return this.rewards;
    };
    module.getAll = function() {
        var maxGetNum = this.giftRecvNumMax - this.giftRecvNum;
        if(maxGetNum <= 0){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","recFull"));
            return;
        }
        var getList = [];
        for (var i = 0 , len = this.friendData.keys.length; i < len; i++) {
            var uid = this.friendData.keys[i];
            var obj = this.friendData.list[uid];
            if(obj.GiftState){
                getList.push(uid);
            }
            if(getList.length >= maxGetNum) break;
        }
        if(getList.length === 0){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","noRec"));
            return;
        }
        this.req_Friend_GiftRecv(getList);
    };
    //获取当前可领取的邀请奖励数
    module.getInviteRewardRecNum = function () {
        var inviteData = this.getInviteData();
        var curRec = 0;
        if(!inviteData) return curRec;
        for (var i = 0; i < inviteData.length; i++) {
            var obj = inviteData[i];
            if(obj.state !== constant.RecState.DONE) continue;
            curRec ++;
        }
        var recMax = this.getRecMax();
        if(curRec > recMax)
            curRec = recMax;

        return curRec;
    };

    return module;
};
