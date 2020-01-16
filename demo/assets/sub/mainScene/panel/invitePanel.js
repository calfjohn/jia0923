var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        editBox:cc.EditBox,
        floor1:cc.Node,
        listView: cc.Node,
        invitePrefab:cc.Prefab,
        noInviter:cc.Node,
        inviteBtn: cc.Node,
        myInviteLabel: cc.Label,
        myInviterNode: cc.Node,
        myInviterID: cc.Label
    },
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.listViewJS = this.widget("Invite/floor0/inviter/scrollView").getComponent("listView");
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshInv", this.refreshInv.bind(this),true],
            ["refreshIvite",this.refreshItem.bind(this)]
        ]
        this.registerClientEvent(registerHandler);
    },
    open:function () {
        this.editBox.string = "";
        this.noInviter.active = false;
        this.listView.active = false;
        this.inviteBtn.active = false;
        this.friendLogic.req_Friend_Invite_Info();
    },
    refreshInv:function () {
        this.editBox.string = "";
        this.openfloor();
        this.refreshItem();
    },
    refreshItem:function () {
        var uid = this.userLogic.getBaseData(this.userLogic.Type.UserID).toNumber().toString(16);
        var inviteData = this.friendLogic.getInviteData();
        this.noInviter.active = !inviteData || inviteData.length === 0;
        this.listView.active = inviteData && inviteData.length !== 0;
        var myInviter = this.friendLogic.getMyInviter();
        this.inviteBtn.active = !(myInviter - 0);
        this.myInviteLabel.string = uid;
        this.myInviterNode.active = !!(myInviter - 0);
        if(this.myInviterNode.active) {
            this.myInviterID.string = myInviter.toString(16);
        }

        var recMax = this.friendLogic.getRecMax();
        var curRec = this.friendLogic.getInviteRewardRecNum();

        this.widget("Invite/floor0/layout2/amount").getComponent(cc.Label).string = "(" + curRec + "/" + recMax + ")";

        if(!this.listView.active) return;
        var viewData = {
            totalCount:inviteData.length,
        };
        this.listViewJS.init(this.invitePrefab,viewData,inviteData);
    },


    getInv:function () {
        if(!this.editBox.string){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"empty"));
            return;
        }
        this.friendLogic.req_Invite(this.editBox.string);
    },
    //点击输入框，如果不是浏览器平台，则打开横屏输入框
    editBegin:function (event) {
        if(cc.sys.os !== cc.sys.OS_WINDOWS){
            uiManager.openUI(uiManager.UIID.EDIT_PANEL,this.editBox);
        }
    },
    openfloor:function () {//显示邀请码输入
        if(this.floor1.active == false){
            this.floor1.active = true;
        }
        else{
            this.floor1.active = false;
        }
    }
})
