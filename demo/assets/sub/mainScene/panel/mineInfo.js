/**
 张一章 19.1.8
 夺矿情报
 */

var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        mineInfoItemPrefab : cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initModule();
        this.registerEvent();
    },

    //初始化模块
    initModule : function(){
        this.listViewJS = this.widget("mineInfo/floor1/ScrollView").getComponent("listView");
    },

    //注册事件
    registerEvent : function(){
        var eventHandle = [
            ["refreshMineInfo",this.refreshMineInfo.bind(this)],//刷新战报
        ];
        this.registerClientEvent(eventHandle);
    },

    //打开UI接口
    open : function () {
        this.refreshMineInfo(this.mineLogic.getMineInfo());
    },

    //刷新战报 isRefresh为true时不更改滚动界面位置
    refreshMineInfo : function (data,isRefresh) {
        this.widget("mineInfo/floor1/label2").active = data.length === 0;//是否显示无情报文本
        var viewData = {
            totalCount : data.length,
            spacing : 10,
            showAni : true,
            noOpen : !!isRefresh,
            rollNow: !isRefresh
        };
        this.listViewJS.init(this.mineInfoItemPrefab,viewData,data);
    },
});
