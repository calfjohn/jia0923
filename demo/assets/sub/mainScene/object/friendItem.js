var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        giveFrame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["updateOne", this.updateOne.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    init:function(idx,data){
        this.userID =data.Type === constant.FriendTag.FIND?data.UserID.UserID:data.UserID;
        this.idx = idx;
        this.type = data.Type;
        if(this.type === constant.FriendTag.FRIEND){
            this.friendLogic.checkFriend(this.idx);
            this.info = this.friendLogic.getFriendData(this.userID);
        }else if(this.type === constant.FriendTag.ADDLIST){
            this.friendLogic.checkApplies(this.idx);
            this.info = this.friendLogic.getAppliesData(this.userID);
        }else if(this.type === constant.FriendTag.FIND){
            this.info = data.UserID;
        }
        if(!this.info.UserID){
            this.friendLogic.req_PlayerInfos([this.userID]);
            return;
        }
        this.refreshItem(this.info);
    },
    updateOne:function(param){
        if(this.userID.equals(param.UserID)){
            this.refreshItem(param);
        }
    },
    refreshItem:function(data){
        this.widget("friendItem/btn3").active = this.type === constant.FriendTag.ADDLIST;
        this.widget("friendItem/btn5").active = this.type === constant.FriendTag.ADDLIST;
        // this.widget("friendItem/btn4").active = this.type === constant.FriendTag.FRIEND;
        this.widget("friendItem/btnChat").active = this.type === constant.FriendTag.FRIEND;
        this.widget("friendItem/btnDelete").active = this.type === constant.FriendTag.FRIEND;
        this.widget("friendItem/btn6").getComponent(cc.Sprite).spriteFrame = this.type === constant.FriendTag.FRIEND && !data.GiftSend?this.giveFrame[0]:this.giveFrame[1];
        this.widget("friendItem/btn6").getComponent(cc.Button).interactable = this.type === constant.FriendTag.FRIEND && !data.GiftSend;
        this.widget("friendItem/btn6").active = this.type === constant.FriendTag.FRIEND;
        this.widget("friendItem/btn7").active = this.type === constant.FriendTag.FRIEND && !!data.GiftState;
        this.widget("friendItem/btnAdd").active = this.type === constant.FriendTag.FIND;
        // this.widget("friendItem/vipLabel").getComponent(cc.Label).string = "VIP" + data.Vip;
        this.widget("friendItem/levelLabel").getComponent(cc.Label).string = "LV" + data.Lv;
        this.widget("friendItem/nameLabel").getComponent(cc.Label).string = data.Name;
        this.widget("friendItem/idLabel").getComponent(cc.Label).string = data.UserID;
        uiResMgr.loadPlayerHead(data.IconID,data.IconUrl,this.widget("friendItem/headFrame/mask/headIcon"));
    },

    addEvent:function(event,param){
        this.friendLogic.req_Friend_ApplyRet(this.userID,Number(param));
    },
    deleteFriend:function(event){
        var callBack = function(){
            this.friendLogic.req_Friend_Del(this.userID);
        }.bind(this);
        uiManager.msgDefault(uiLang.getMessage("friend","sureDelete"),callBack);
    },
    applyEvent:function(event){
        if(this.userID.equals(this.userLogic.getBaseData(this.userLogic.Type.UserID))){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("friend","isMe"));
            return;
        }else if(this.friendLogic.isMyFriend(this.userID)){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("friend","isMyFriend"));
            return;
        }
        this.friendLogic.req_Friend_Apply(this.userID);
    },
    giveVit:function(){
        this.friendLogic.req_Friend_GiftSend(this.userID);
    },
    getVit:function(){
        this.friendLogic.req_Friend_GiftRecv([this.userID]);
    },
    copyEvent:function(){
        if (kf.require("util.captureTool").copyBoard(this.userID + "")) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("setting","copy"));
        }
    },
    chatEvent:function(){
        uiManager.openUI(uiManager.UIID.CHATPANEL,constant.ChatInfoType.PRIVATE,this.info);
    },

    // update (dt) {},
});
