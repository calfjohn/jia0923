/**
 * @Author: lich
 * @Date:   2018-07-07T14:40:58+08:00
 * @Last modified by:
 * @Last modified time: 2018-08-18T16:34:03+08:00
 */

window["logic"]["treasure"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var shareLogic = null;
    var timeLogic = null;
    var userLogic = null;

    var Long = dcodeIO.Long;
    var _EVENT_TYPE = [
        "refreshTreasure",//宝箱刷新
        "refreshFreeChest",//免费宝箱刷新
        "refreshGift"
    ];
    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.maxNum = 4;//最大宝箱个数
        this.reset();//数据重置
        this.registerMsg();
    };

    module.OPTYPE_ENUM = {
        UNLOCK:1,   //  去解锁，--》开始倒计时
        OPEN_NOW:2,//立即打开,用钻石加速
        TOOKEN:3//时间到了 去领取
    };

    module.initCose = function () {
        this.cosePrice = [];//开锁匠价格
        var config = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.UnlockLimitPrice);
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i];
            var strs = obj.split("#");
            var reward = {Type:Number(strs[0]),BaseID:Number(strs[1]),Num:Number(strs[2])}
            this.cosePrice.push(reward);
        }
    };

    module.reset = function(){
        this.chestInfos = [];
        this.chestFreeNum = 0;//免费宝箱可领取次数
        this.chestFreeTime = new Long(0,0,false);//免费宝箱下一次的时间【0 或者 小于 当前服务器时间 就 设置为不显示】
        this.showAniData = undefined;
        // this.showAniData = {"Icon":1001,"Idx":1,"MaxTime":10,"Name":2001,"Time":-1,"Type":1};
    };

    module.setChestInfo = function (list,freeNum,freeTime) {
        this.chestInfos = list;
        this.chestFreeNum = freeNum;
        this.chestFreeTime = freeTime;
        clientEvent.dispatchEvent("refreshTreasure");
    };

    module.initModule = function(){
        timeLogic = kf.require("logic.time");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        shareLogic = kf.require("logic.share");
        userLogic = kf.require("logic.user");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Chest_Op", this.onResp_Chest_Op.bind(this));
        network.registerEvent("Resp_PlayerUpdate_ChestFree", this.onResp_PlayerUpdate_ChestFree.bind(this));//免费宝箱更新
        network.registerEvent("Resp_Chest_Free", this.onResp_Chest_Free.bind(this));//免费宝箱更新
        network.registerEvent("Resp_Chest_Help", this.onResp_Chest_Help.bind(this));//宝箱助力
        network.registerEvent("Resp_Chest_Upgrade", this.onResp_Chest_Upgrade.bind(this));//升级开锁匠
        network.registerEvent("Resp_Gift", this.onResp_Gift.bind(this));//兑换码
    };

    /** 升级开锁匠 */
    module.req_Chest_Upgrade = function(idx){
        var data = {
            "Req_Chest_Upgrade": 0
        };
        network.send(data);
    };

    module.onResp_Chest_Upgrade = function(param){//升级开锁匠
        userLogic.setBaseData(userLogic.Type.ChestUnlockNum,param.ChestUnlockNum);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("treasureBox","upgrade"));
        clientEvent.dispatchEvent('refreshTreasure');
    };

    /** 请求兑换码兑换 */
    module.req_Gift = function(str){
        var data = {
            "Req_Gift": {
                "Code":str
            }
        };
        network.send(data);
    };

    module.onResp_Gift = function(param){//兑换码
        if(param.Err === 0){
            uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards);
            clientEvent.dispatchEvent("refreshGift");
        }else{
            var str = uiLang.getMessage("gift","error" + param.Err);
            str = str?str:uiLang.getMessage("gift","error");
            uiManager.openUI(uiManager.UIID.TIPMSG,str);
        }
    };


    /** 宝箱助力 */
    module.req_Chest_Help = function(idx){
        var data = {
            "Req_Chest_Help": {
                "Idx": idx
            }
        };
        network.send(data);
    };

    module.onResp_Chest_Help = function(param){//宝箱助力
        jsonTables.addEleOrUpdate(this.chestInfos,[param.ChestInfo],function(srcObj,desObj){
            return srcObj.Idx === desObj.Idx;
        },true);
        clientEvent.dispatchEvent('refreshTreasure');
        if (window && window.FBInstant && !cc.sys.isNative) {//如果是fbh5 环境 没有分享回掉
            setTimeout(function () {//保证屏蔽层正常显示
                shareLogic.share(tb.SHARELINK_BOX,param.Timestemp);
            }.bind(this), 50);
        }
    };


    /** 客户端请求宝箱操作 */
    module.req_Chest_Op = function(idx,opType){
        var data = {
            "Req_Chest_Op": {
                "Idx": idx,
                "OpType": opType
            }
        };
        network.send(data);
    };

    module.onResp_Chest_Op = function(param){
        var info = this.getChestInfo(param.ChestInfo.Idx);
        if(!info)   return;
        var icon = info.Icon;
        if (param.ChestInfo.Type == 0){//表示这个宝箱被消耗掉了
            jsonTables.removeByKey(this.chestInfos,[param.ChestInfo],function(src,des){
                return src.Idx === des.Idx;
            })
        }else{//宝箱没有被消耗掉 那表示是状态更新
            jsonTables.addEleOrUpdate(this.chestInfos,[param.ChestInfo],function(srcObj,desObj){
                return srcObj.Idx === desObj.Idx;
            },true);
        }
        clientEvent.dispatchEvent('refreshTreasure');
        if(param.Rewards.length > 0){
            uiManager.openUI(uiManager.UIID.OPENBOXANI,param.Rewards,icon);
        }
    };

    /** 客户端请求领取免费宝箱 */
    module.req_Chest_Free = function(){
        var data = {
            "Req_Chest_Free": {
            }
        };
        network.send(data);
    };

    module.onResp_Chest_Free =function(param){
        this.chestFreeNum = param.ReceiveNum;
        this.chestFreeTime = param.Time;
        if(param.Rewards.length > 0){
            uiManager.openUI(uiManager.UIID.OPENBOXANI,param.Rewards);
        }
        clientEvent.dispatchEvent("refreshFreeChest");
    };

    module.onResp_PlayerUpdate_ChestFree =function(param){
        this.chestFreeNum = param.ReceiveNum;
        this.chestFreeTime = param.Time;
        clientEvent.dispatchEvent("refreshFreeChest");
    };

    module.pushTreasure = function(data){
        if(!data)   return;
        this.chestInfos.push(data);
        clientEvent.dispatchEvent("refreshTreasure");
    };

    module.pushShowData = function () {
        if(this.showAniData){
            this.pushTreasure(this.showAniData);
            this.showAniData = undefined;
        }
    };

    module.setShowData = function(data){
        if(this.showAniData){
            this.pushTreasure(this.showAniData);
            this.showAniData = undefined;
        }
        this.showAniData = data;
    };

    module.getShowData = function(){
        return this.showAniData;
    };

    module.getFreeNum = function(){
        return this.chestFreeNum;
    };

    module.getFreeTime = function(){
        return this.chestFreeTime;
    };

    module.isShowFlag = function () {
        return !!this.showAniData;
    };

    /** 获取正在开的箱子 */
    module.getCurOpening = function () {
        var timeNow = timeLogic.now64();
        var count = 0;
        for (var i = 0 , len = this.chestInfos.length; i <  len; i++) {
            var obj = this.chestInfos[i];
            if (obj.Time.toNumber() !== -1 && !timeNow.greaterThanOrEqual(obj.Time)) {
                count++;
            }
        }
        return count;
    };

    module.getChestInfo = function (idx) {
        for (var i = 0 , len = this.chestInfos.length; i < len; i++) {
            var obj = this.chestInfos[i];
            if (obj.Idx === idx) {
                return obj
            }
        }
        return null;
    };

    module.getChestInfos = function(){
        var list = [];
        for (var i = 0 , len = this.chestInfos.length; i < len; i++) {
            var obj = this.chestInfos[i];
            list.push(obj);
        }
        return list;
    };

    module.isBoxMax = function () {
        return this.chestInfos.length === this.maxNum;
    };

    module.getExclamaInfo = function (idx) {
        if(!this.cosePrice){
            this.initCose();
        }
        return this.cosePrice[idx] || null;
    };

    module.getMaxExclamCount = function () {
        if(!this.cosePrice){
            this.initCose();
        }
        return this.cosePrice.length;
    };

    ///////////////////////////////for guide////////////////////////////
    module.isGuideBoxStateOpen = function () {
        var data =  this.chestInfos[0];
        if (!data) return cc.errorr("为什么没有宝箱")

        if (data.Time.toNumber() !== -1 && timeLogic.now64().greaterThanOrEqual(data.Time)) {//去打开
            return true;
        }else{
            return false;
        }
    };

    return module;
};
