/**
* @Author: lich
* @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-19T16:20:45+08:00
*/

window["logic"]["rank"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var _EVENT_TYPE = [
        "refreshRank",
        "refreshHead",
        "refreshLeftByData"
    ];

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
    };

    module.reset = function(){
        this.rankData = [];//存儲排行榜内容
        this.pageNow = 0;
        this.type = constant.RankType.GROW;
        this.myTowerRank = 0;
        this.towerRank = [];
    };

    module.setTowerWorld = function(list){

    };

    module.setMyTowerRank = function (rank) {

    };

    //设置塔的排行榜
    module.setMyTowerScore = function (score) {

    };

    module.getMyTowerData = function () {
        return  {};
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_UserRank", this.onResp_UserRank.bind(this));//响应 请求邮件列表
    };

    /** 请求排行榜列表 */
    module.req_UserRank = function(page,pageNum,type){
        type = type === undefined?this.type:type;
        if(this.type !== type){
            this.type = type;
            this.rankData = [];//存儲排行榜内容
        }
        if(page === 0){
            this.pageNow = 0;
        }
        var data = {
            "Req_UserRank": {
                "Page":page,
                "PageNum":pageNum,
                "Type":type
            }
        };
        network.send(data,true);
    };

    module.onResp_UserRank = function(param,sendData){
        if(param.Type !== this.type)    return;
        for (var i = 0 , len = param.RankNo.length; i < len; i++) {
            this.rankData[param.RankNo[i] - 1] = param.PlayerInfo[i];
        }
        this.myRank = param.MyRank;
        this.myScore = param.Score;
        this.pageNow = param.Page > this.pageNow?param.Page:this.pageNow+1;
        clientEvent.dispatchEvent("refreshRank",sendData.Page,this.rankData);
    };
    module.getPageNow = function() {
        return  this.pageNow;
    };
    module.getMyRank = function() {
        var str = this.myRank > 0?this.myRank:"--";
        return  str;
    };
    module.getRankType = function(){
        return this.type;
    };
    module.getMyScore = function() {
        return  kf.clone(this.myScore);
    };
    module.getRankByIdx = function(idx) {
        if(this.rankData[idx]){
            return  kf.clone(this.rankData[idx]);
        }else{
            console.error("rank" + idx +"数据不存在");
            return  kf.clone(this.rankData[0]);
        }
    };
    return module;
};
