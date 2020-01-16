var panel = require("panel");
// var toggleHelper = require('toggleHelper');
cc.Class({
    extends: panel,

    properties: {
        // toggleHelperJs:toggleHelper,
        friendItem:cc.Prefab,
        // redDot:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.rowNum = 2;
        // this.editbox = this.widget("friendPanel/floor/add/edixBox").getComponent(cc.EditBox);
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshFriend", this.refreshByTag.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    open:function(){
        this.tag = constant.FriendTag.FRIEND;
        // this.toggleHelperJs.setIdxToggleCheck(this.tag);
        this.refreshByTag();
    },

    switchTag:function(param,idx) {
        if(idx === this.tag)    return;
        this.tag = idx;
        this.refreshByTag();
    },
    refreshByTag:function(list){
        // var num = this.friendLogic.getAppliesNum();
        // this.redDot.active = num > 0;
        // this.widget("friendPanel/floor/friendNumber").getComponent(cc.Label).string = this.friendLogic.getFriendNum() +  "/" + this.friendLogic.getFriendMaxNum();
        switch (this.tag) {
            case constant.FriendTag.FRIEND:
                this.refreshFriend();
                break;
            // case constant.FriendTag.FIND:
            //     this.refreshFind(list);
            //     break;
            // case constant.FriendTag.ADDLIST:
            //     this.refreshAddList();
            //     break;
        }
    },
    //刷新我的好友列表
    refreshFriend:function(){
        this.widget("friendPanel/floor/friend").active = true;
        // this.widget("friendPanel/floor/add").active = false;
        // this.widget("friendPanel/floor/apply").active = false;
        // this.widget("friendPanel/floor/delete").active = false;
        this.widget("friendPanel/floor/friend/getLabel").getComponent(cc.Label).string = this.friendLogic.getGiftRecvNum() +  "/" + this.friendLogic.getGiftRecvNumMax();
        var list = this.friendLogic.getFriendList();
        this.sortAndDeal(list,this.tag,this.widget("friendPanel/floor/scrollView"));
    },
    // //刷新申请列表界面
    // refreshAddList:function(){
    //     this.widget("friendPanel/floor/friend").active = false;
    //     this.widget("friendPanel/floor/add").active = false;
    //     this.widget("friendPanel/floor/apply").active = true;
    //     this.widget("friendPanel/floor/delete").active = false;
    //     var list = this.friendLogic.getAppliesList();
    //     this.widget("friendPanel/floor/apply/getLabel").getComponent(cc.Label).string = list.length;
    //     this.sortAndDeal(list,this.tag,this.widget("friendPanel/floor/scrollView"));
    // },
    // refreshFind:function(list){
    //     if(list === undefined){
    //         this.editbox.string = "";
    //         this.widget("friendPanel/floor/add/label1").active = true;
    //         list = [];
    //     }
    //     this.widget("friendPanel/floor/friend").active = false;
    //     this.widget("friendPanel/floor/add").active = true;
    //     this.widget("friendPanel/floor/apply").active = false;
    //     this.widget("friendPanel/floor/delete").active = false;
    //     this.sortAndDeal(list,this.tag,this.widget("friendPanel/floor/scrollView"));
    // },
    //排序并处理成2个一个的数组
    sortAndDeal:function(arr,type,content){
        var num = 0;
        var data = [];
        for (var i = 0 , len = arr.length; i < len; i++) {
            var obj = arr[i];
            var info = {
                UserID:obj,
                Type:type
            }
            data.push(info);
        }
        var viewData = {
            totalCount:data.length,
            spacing:10
        };
        content.getComponent("listView").init(this.friendItem,viewData,data);
    },
    getAll:function(){
        this.friendLogic.getAll();
    },
    clickFind:function(event){
        // var str =
        if(this.editbox.string === ""){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","editEmpty"));
            return;
        }
        var uid = parseInt(this.editbox.string);
        if(!uid){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("friend","editError"));
            this.editbox.string = "";
            return;
        }
        this.friendLogic.req_Friend_Find("",parseInt(this.editbox.string));
    },
    edixBegin:function(){
        this.widget("friendPanel/floor/add/label1").active = false;
    },
    edixEnd:function(){
        if(this.editbox.string === ""){
            this.widget("friendPanel/floor/add/label1").active = true;
        }
    },
    updateCb:function(idx){
        if(this.tag === constant.FriendTag.FRIEND){
            this.friendLogic.checkFriend(idx);
        }else if(this.tag === constant.FriendTag.ADDLIST){
            this.friendLogic.checkApplies(idx);
        }
    },
    openRank:function(){
        uiManager.openUI(uiManager.UIID.RANKPANEL);
        this.close();
    },
});
