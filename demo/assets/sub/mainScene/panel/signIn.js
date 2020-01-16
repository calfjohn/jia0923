var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        btnFrame:[cc.SpriteFrame],
        signItem:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        jsonTables.parsePrefab(this);
    },
    open:function() {
        this.signLogic.req_Sign_Info();
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshSign", this.refreshSign.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    refreshSign:function(){
        var todaySign = this.signLogic.getIsToday();
        this.widget("signIn/in/button").getComponent(cc.Button).interactable = !todaySign;
        var idx = todaySign?0:1;
        this.widget("signIn/in/button").getComponent(cc.Sprite).spriteFrame =this.btnFrame[idx];
        this.widget("signIn/in/button/label").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"status" + idx);
        var rewardInfo = this.signLogic.getRewardInfo();
        var refreshData = {
            content:this.widget('signIn/in/reward'),
            list:rewardInfo,
            prefab:this.signItem
        }
        uiManager.refreshView(refreshData);
    },
    clickSign:function(){
        var nextSign = this.signLogic.getSignNum() + 1;
        this.clientEvent.dispatchEvent("clickSign",nextSign);
        setTimeout(function(){
            this.signLogic.req_Sign();
        }.bind(this),100);
    },
    // update (dt) {},
});
