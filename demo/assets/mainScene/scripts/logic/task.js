/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-07-06T17:44:25+08:00
 */

window["logic"]["task"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;

    module.init = function(){
        this.initModule();
        this.reset();//数据重置
        this.registerMsg();
    };

    module.TYPE_ENUM = {
        MAIN:0,//主线
        DAILY:1//每日
    };

    module.STATE_ENUM = {
        ING:0,
        CAN_REWARD:1,
        GOT_REWARD:2
    };

    module.reset = function(){
        this.taskList = [];
        this.refreshTime = 0;
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Get_DailyTask", this.onResp_Get_DailyTask.bind(this));//响应 用户的任务数据信息
        network.registerEvent("Resp_DailyTask_Update", this.onResp_DailyTask_Update.bind(this));//响应 任务更新
        network.registerEvent("Resp_Task_Receive", this.onResp_Task_Receive.bind(this));//响应 客户端请求任务领取
        network.registerEvent("Resp_Task_ScoreReward_Receive", this.onResp_Task_ScoreReward_Receive.bind(this));//响应 客户端请求任务领取
        network.registerEvent("Resp_ChestData", this.onResp_ChestData.bind(this));//响应 接收宝箱静态数据
    };

    module.onResp_DailyTask_Update = function(param){//回复 每日任务
        if (!this.weekendData) return;
        this.weekendData.PlayerDailyScore = param.PlayerDailyScore;
        this.weekendData.PlayerWeekScore = param.PlayerWeekScore;
        this.weekendData.WeekStatus = param.WeekStatus;
        var scoreStatus = param.ScoreStatus;
        for(var n=0;n<this.weekendData.ScoreRewards.length;n++){
            this.weekendData.ScoreRewards[n].Status = scoreStatus[n]
        }
        for (var i = 0 , len = this.taskList.length; i <  len; i++) {
            var obj = this.taskList[i];
            var idx = param.TaskID.indexOf(obj.ID);
            if (idx !== -1) {
                this.taskList[i].Value = param.Progress[idx];
                this.taskList[i].Status = param.Status[idx];
            }
        }
        clientEvent.dispatchEvent("refreshAchievementPanel",4);
    };

    /** 请求宝箱静态数据 */
    module.req_ChestData = function(id){
        var data = {
            "Req_ChestData": {
                "ID":id,
            }
        };
        network.send(data,true);
    };

    /** 接收宝箱静态数据 */
    module.onResp_ChestData = function(param){
        if (param) {
            this.chastData = param.ChestData
        }
    };

    /** 获取每日任务 */
    module.req_Get_DailyTask = function(){
        var data = {
            "Req_Get_DailyTask": {}
        };
        network.send(data,true);
    };

    module.onResp_Get_DailyTask = function(param){//获取每日任务
        if (param) {
            this.taskList = param.Tasks;
            this.refreshTime = param.RefreshTIme.toNumber();
            this.refreshweekEndTime = param.WeekEndTime.toNumber();
            this.weekendData = param;
            // var nowY = this.refreshweekEndTime.getFullYear();//年
            // var nowM = this.refreshweekEndTime.getMonth();//月
            // var nowD = this.refreshweekEndTime.getDate();//日
        }
        clientEvent.dispatchEvent("refreshAchievementPanel",4);
    };

    /** 请求获取任务 */
    module.req_Task_Receive = function(type,id){
        userLogic.desrRedDotCount(constant.RedDotEnum.DailyTask,1);
        var data = {
            "Req_Task_Receive": {
                "Type":type,//类型 0x00:主线任务 0x01:每日任务
                 "ID":id//任务ID
            }
        };
        network.send(data);
    };

    module.onResp_Task_Receive = function(param){
        // uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards);
        uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("achievement","getSuccess"));
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ACHIGET);
    };

    /** 请求获取M每日活跃任务 */
    module.req_Task_ScoreReward_Receive = function(type,id){
        userLogic.desrRedDotCount(constant.RedDotEnum.DailyTask,1);
        var data = {
            "Req_Task_ScoreReward_Receive": {
                "Type":type,//类型 0x00:每日积分 0x01:周积分奖励
                "ID":id//任务ID
            }
        };
        network.send(data);
    };

    module.onResp_Task_ScoreReward_Receive = function(param){
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Rewards);
        // uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("achievement","getSuccess"));
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ACHIGET);
    };

    module.getSortRet = function (a,b,tag) {
        if (a.Status === tag && b.Status !== tag) return -1;
        if (a.Status !== tag && b.Status === tag) return 1;
        if (a.Status === tag && b.Status === tag) {
            return a.ID - b.ID;
        }
        return null;
    };

    module.sortList = function () {
        this.taskList.sort(function(a,b){
            var re = this.getSortRet(a,b,1);
            if (re !== null) return re;
            var re = this.getSortRet(a,b,0);
            if (re !== null) return re;
            var re = this.getSortRet(a,b,2);
            if (re !== null) return re;
        }.bind(this))
    };

    module.getList = function (isFresh) {
        if (isFresh) {
            this.sortList();
        }

        return kf.clone(this.taskList);
    };
    module.getWeekendData = function (isFresh) {

        return this.weekendData;
    };
    module.getRefreshTime = function () {
        return this.refreshTime;
    };
    module.getRefreshWeekendTime = function () {
        return this.refreshweekEndTime;
    };

    return module;
};
