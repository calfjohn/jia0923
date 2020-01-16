

window["logic"]["msgHander"] = function() {


    var module = {};//简单的消息通知对象
    var timeLogic = null;
    var fightLogic = null;

    module.init = function(){
        timeLogic = kf.require("logic.time");
        fightLogic = kf.require("logic.fight");
        this.allDes = -10086;
        this.duration = 0;
        this.curTimeAtmp = timeLogic.now();
        this.reset();
    };

    module.reset = function(){
        this.clearMsgList();
        this.container = cc.js.createMap();
    };

    module.removeMsgByMapKey = function (mapKey) {
        if (this.msgMap[mapKey]) {
            delete this.msgMap[mapKey];// NOTE: msgList列表就让他自动清空
        }
    };

    module.clearMsgList = function () {
        this.mapKey = 1;
        this.msgMap = cc.js.createMap();
        this.msgList = [];//消息队列 其中存储对象为{delay:时间,mapKey:对象表索引}
    };

    module.register = function(id,ccObj){
        this.container[id] = ccObj;
    };

    module.release = function(id){
        if (this.container[id]) {
            delete this.container[id];
        }
    };
    /**
     * 推入消息
     * @param  {Object} msg 消息结构体 必须包含 src（来源者ID）  des（目标者ID）  delay 延迟 单位为秒 extMsg 额外消息 msgType消息类型
     * @return {[type]}     [description]
     */
    module.addMsg = function(msg){
        msg.delay = msg.delay === undefined ? this.curTimeAtmp:(this.curTimeAtmp + msg.delay);
        this.mapKey++;
        if (this.mapKey > 999999999) {//999999999
            this.mapKey = 1;
        }
        var msgListObj = {delay:msg.delay,mapKey:this.mapKey};
        if (this.msgMap[this.mapKey]) {
            console.error("clearOldData");
        }
        this.msgMap[this.mapKey] = msg;
        this.msgList.push(msgListObj);
        return this.mapKey;
    };

    module.newMsg = function(src,des,delay,msgType,extMsg){
        var data = {src:src,des:des,delay:delay,msgType:msgType,extMsg:extMsg};
        return this.addMsg(data);
    };

    module.newAllMsg = function(src,delay,msgType,extMsg){
        var data = {src:src,des:this.allDes,delay:delay,msgType:msgType,extMsg:extMsg};
        return this.addMsg(data);
    };

    module.dispatchAll = function(msg){
        for (var key in this.container) {
            if (this.container[key]) {
                this.container[key].onMessage(msg,this.container[msg.src]);
            }
        }
    };

    module.forcePolling = function () {
        // this.curTimeAtmp += 1;
        this.polling();
    };

    module.polling = function(){
        if (this.msgList.length === 0) return;
        if (!jsonTables.displaySpeed_Stop && !jsonTables.displaySkill) {
            this.msgList.sort(this.sort);
        }
        var removeCount = 0;
        for (var i = 0,len = this.msgList.length; i < len; i++) {
            if (this.msgList[i].delay > this.curTimeAtmp) break;//后续不在此刻发生
            removeCount++;
            var msgListObj = this.msgList[i];
            var mapData = this.msgMap[msgListObj.mapKey];
            if (!mapData) continue;
            if (mapData.des === this.allDes) {
                // if (mapData.msgType === constant.MsgHanderType.CLEAN_MSGLIST) {
                //     this.clearMsgList();
                //     return;
                // }
                this.dispatchAll(mapData);
            }else if (this.container[mapData.des]) {
                this.container[mapData.des].onMessage(mapData,this.container[mapData.src]);
            }
            delete this.msgMap[msgListObj.mapKey];
            if (jsonTables.displaySkill) {
                break;
            }
        }
        if (removeCount !== 0) {
            this.msgList.splice(0,removeCount);
        }
    };

    module.kfUpdate = function(dt){
        if (fightLogic.isGameOver()) return;

        if (!jsonTables.displaySpeed_Stop && !jsonTables.displaySkill) {
            this.curTimeAtmp += (dt * jsonTables.displaySpeed_CurSpeed);
        }
        this.duration += dt;
        if (this.duration < 0.1) return;
        this.duration -= 0.1;
        this.polling();
    };

    module.sort = function(a,b){
        return a.delay - b.delay
    };

    return module;
};
