/**
    张一章 19.1.8
    夺矿情报条目
 */
var panel = require("panel");

cc.Class({
    extends: panel,
    properties: {

    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    //初始化
    init : function (idx,data) {
        this.data = data;
        this.widget("mineInfoItem/win/receiveButton").getComponent(cc.Button).interactable = data.Status === constant.MineInfoStatus.UN_RECEIVE;//判断是否显示领取按钮
        this.widget("mineInfoItem/win/receiveButton/Label").getComponent(cc.Label).string = data.Status === constant.MineInfoStatus.UN_RECEIVE?uiLang.getMessage("actDailyEnergy","receive"):uiLang.getMessage("actDailyEnergy","received");
        // this.widget("mineInfoItem/attackButton").active = data.Status === constant.MineInfoStatus.UN_ATTACK;//是否显示反攻按钮

        this.widget("mineInfoItem/nameLabel").getComponent(cc.Label).string = data.AtkName;//用户名
        this.widget("mineInfoItem/win").active = data.InfoType === constant.MineInfoType.WIN;
        this.widget("mineInfoItem/fail").active = data.InfoType === constant.MineInfoType.FAIL;

        if(this.widget("mineInfoItem/win").active){
            this.refreshContent(data);//刷新奖励列表
        }
    },

    //刷新奖励列表
    refreshContent : function (data) {
        this.widget("mineInfoItem/win/receiveButton").active = data.Gold > 0 || data.Badge > 0;
        this.widget("mineInfoItem/win/rewardContent/goldItem").active = data.Gold > 0;//是否显示金币奖励
        this.widget("mineInfoItem/win/rewardContent/badgeItem").active = data.Badge > 0;//是否显示勋章奖励
        this.widget("mineInfoItem/win/rewardContent/goldItem/number").getComponent(cc.Label).string =
            "x" + NP.dealNum(data.Gold,constant.NumType.TEN);//金币数量
        this.widget("mineInfoItem/win/rewardContent/badgeItem/number").getComponent(cc.Label).string =
            "x" + NP.dealNum(data.Badge,constant.NumType.TEN);//勋章数量
    },

    //领取奖励
    receive : function () {
        this.mineLogic.req_MineInfo_Op(this.data.InfoID);
    },

    // //反击
    // counterAttackMine : function () {
    //     var event = new cc.Event.EventCustom("counterAttackMine",true);
    //     event.setUserData(this.data);
    //     this.node.dispatchEvent(event);//mineInfo接收
    //     uiManager.callUiFunc(uiManager.UIID.MINE_UI,"counterAttackMine",[this.data]);
    // },

});
