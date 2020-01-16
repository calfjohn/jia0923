var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        mailPrefab:cc.Prefab,
        rewardItem:cc.Prefab,

    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initModule();
        this.registerEvent();
        // var Long = dcodeIO.Long;
        // this.clickMailID = new Long(0,0,false);
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshMail", this.refreshMail.bind(this)],
            ["getMainInfoSuccess", this.refreshContent.bind(this)],
            ["updateListData", this.updateListData.bind(this)],
            ["getRewardSuccess", this.getRewardSuccess.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    initModule:function(){
        this.listViewJS = this.widget("mailPanel/shrink/left/tggleContainer").getComponent("listView");
    },
    open:function(){
        if (!this.mailLogic.getReqHaved()) {//没有请求过邮件
            this.mailLogic.req_Mail_List();
        }else{
            this.mailLogic.sortMailToPanel();
            var data = this.mailLogic.getMailList();
            this.refreshMail(data);
        }
    },
    refreshMail:function(mailList,is2Idx){
        this.widget("mailPanel/shrink/left/noMail").active = mailList.length === 0;
        this.widget("mailPanel/shrink/right/mailContent").active = mailList.length > 0;
        is2Idx = is2Idx === undefined? 0 : is2Idx;
        this.clickMailID = mailList[is2Idx]? mailList[is2Idx].ID:0;
        var viewData = {
            totalCount:mailList.length,
            spacing:10,
            rollNow:false,
            showAni:true
        };
        this.listViewJS.init(this.mailPrefab,viewData,mailList,is2Idx,this.nowChoose.bind(this));
    },
    updateListData:function(mailList){
        this.listViewJS.updateItemData(mailList,true);
    },
    getRewardSuccess:function(){
        var data = this.mailLogic.getMailList();
        this.listViewJS.updateItemData(data,true);
        var mailInfo = this.mailLogic.getMailByID(this.clickMailID);
        this.refreshContent(mailInfo);
    },
    refreshContent:function(data){
        this.widget("mailPanel/shrink/right/mailContent/title/titleLabel1").getComponent(cc.Label).string = data.SrcName === "-1"?uiLang.getConfigTxt(data.Title):data.Title;
        this.widget("mailPanel/shrink/right/mailContent/title/titleLabel").active = true;
        var str = data.SrcName === "-1"?this.getWorldBossContent(data.Content):data.Content;
        this.widget("mailPanel/shrink/right/mailContent/benFrame1/view/letterLabel").getComponent("richTextHander").setString(str);
        var scrolComp = this.widget("mailPanel/shrink/right/mailContent/benFrame1").getComponent(cc.ScrollView);
        if (scrolComp) {
            scrolComp.scrollToTop(0.05);
        }
        this.widget("mailPanel/shrink/right/mailContent/rewardContent").scale = data.Reward.length >=5?0.7:1;
        this.widget("mailPanel/shrink/right/mailContent/name/nameLabel1").getComponent(cc.Label).string = uiLang.getMessage("mail","sys");
        var refreshData = {
            content:this.widget("mailPanel/shrink/right/mailContent/rewardContent"),
            list:data.Reward,
            prefab:this.rewardItem
        }
        uiManager.refreshView(refreshData);
        var isShowReceive = data.Reward.length > 0 && data.Status !== this.mailLogic.ENUM_MAIL_STATE_RECEIVED;
        this.widget("mailPanel/shrink/right/mailContent/button2").active = isShowReceive;//领取奖励按钮
        this.widget("mailPanel/shrink/right/mailContent/button3").active = !isShowReceive;//删除邮件按钮
        this.widget("mailPanel/shrink/right/mailContent/received").active = !isShowReceive;//已领取图标
    },
    //获取世界boss邮件的文本内容 content：10008#1#1
    getWorldBossContent:function (content) {
        var list = content.split("#");
        var str = uiLang.getConfigTxt(Number(list[0]));
        if(list.length > 1){
            var miniStr;
            if(list[1] === list[2]){//相等，前三
                miniStr = uiLang.getMessage("mail","content1").formatArray([list[1]]);
            }else if(Number(list[2]) < 0){//大于多少名
                miniStr = uiLang.getMessage("mail","content3").formatArray([list[1]]);
            }else{//区间
                miniStr = uiLang.getMessage("mail","content2").formatArray([list[2]]);
            }
            miniStr = miniStr?miniStr:"";
            return  str.formatArray([miniStr]);
        }else{
            return  str;
        }

    },
    nowChoose:function(id){
        return this.clickMailID.equals(id);
    },
    clickItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if(data.isAuto){
            this.lastMail = data.node;
            this.showMail(data.id);
        }
        if(this.clickMailID.equals(data.id))    return;
        this.clickMailID = data.id;
        if(this.lastMail && this.lastMail.children && !data.isAuto){
            this.lastMail.getComponent("mailItem").unClick();
        }
        this.lastMail = data.node;
        this.showMail(data.id);
    },
    showMail:function(mailID){
        var mailInfo = this.mailLogic.getMailByID(mailID);
        if(mailInfo){
            if(mailInfo.Reward){//有奖励，说明这是我之前请求过内容了
                this.refreshContent(mailInfo);
            }else{//否则就是我之前没有请求过内容
                this.mailLogic.req_Mail_Read(mailID);
            }
        }
    },
    clickReceive:function() {
        this.mailLogic.req_Mail_Receive([this.clickMailID]);
    },
    clickDelete:function() {
        this.mailLogic.req_Mail_Delete([this.clickMailID]);
    },
    clickDelAll:function(){
        var list = this.mailLogic.getCanDelList();
        if(list.length === 0){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("mail","noDel"));
            return;
        }
        var cb = function(){
            this.mailLogic.req_Mail_Delete(list);
        };
        uiManager.msgDefault(uiLang.getMessage("mail","delAll"),cb.bind(this));
    },
    clickRecAll:function() {
        var list = this.mailLogic.getCanRecList();
        if(list.length === 0){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("mail","noRec"));
            return;
        }
        this.mailLogic.req_Mail_Receive(list);
    },
    // update (dt) {},
});
