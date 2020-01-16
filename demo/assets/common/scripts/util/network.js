/**
 * Created by zhangwei on 2015/8/26.
 */
window["util"]["network"] = function () {
    var protobuf = {};
    var closeCallback = null;

    var connect_callback = null;
    var network = {};
    var clientEvent = kf.require("basic.clientEvent");
    var cipher = kf.require("util.cipher");

    network.c2gsOffG2cs = 10000;//消息包定义差值

    network.init = function () {
        var eventListener = kf.require("basic.eventListener");
        this.socket = kf.require("util.socket");
        this.event_listener = eventListener.create();
        this.c2gs = null;
        this.gs2c = null;
        this.clear();
        this.registerProto();
    };

    network.registerProto = function () {
        protobuf = require("msgType");
        this.c2gs = protobuf["C2GS"].$type;
        this.gs2c = protobuf["GS2C"].$type;
    };


    network.clear = function () {
        this.session = 1;
        this.internal_session = 1;
        this.callbackObjs = {};
        this.socket.clearCallback();
        this.sessionData = {};//用于存储发送时的参数
    };

    network.getCurMsgName = function() {
        return this.cur_msg_name;
    };

    network.connect = function (ip, port, cb) {
        if (this.isConnecting()) return;
        if(this.isConnected()) {
            if (cb) cb(true);
            return;
        }

        setTimeout(function () {
            try{
                this.socket.connect(ip, port, this.msgCallBack.bind(this));
                connect_callback = cb;
            }
            catch (e){
                // cc.log(e);
            }
        }.bind(this), 0);

    };

    network.isConnecting = function() {
        return this.socket.isConnecting();
    };

    network.isConnected = function() {
        return this.socket.isOpen();
    };

    network.isClosed = function() {
        return this.socket.isClosed();
    };

    network.isClosing = function() {
        return this.socket.isClosing();
    };

    network.clearCallback = function() {
        this.socket.clearCallback();
    };

    network.callConnectCb = function (result) {
        if (connect_callback) {
            connect_callback(result);
            connect_callback = null;
        }
    };

    network.msgCallBack = function (evenType, event) {
        switch (evenType) {
            case this.socket.eventType.onopen:
                this.callConnectCb(true);
                break;

            case this.socket.eventType.onclose:
                this.callConnectCb(false);
                this.clear();
                uiManager.closeUI(uiManager.UIID.WAITINGUI);
                // 通知reconnect，网络断开
                this.dispatch("network close");
                if (closeCallback) {
                    closeCallback();
                    closeCallback = null;
                } else {
                    var loginLogic = kf.require("logic.login");
                    loginLogic.logout(uiLang.get("networkError"));//暂时不处理重连
                    // var reconnectLogic = kf.require("basic.reconnect");
                    // if (reconnectLogic && !reconnectLogic.isInGame()) {
                    //     // clientEvent.dispatchEvent("updateNetworkState", "networkError");
                    // }
                }

                break;

            case this.socket.eventType.onerror:
                this.callConnectCb(false);
                var errorcode = uiLang.get("networkError");
                uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);

                // 如果onerror的调用是在连接过游戏之后，说明玩家丢失了连接
                // 否则仅仅是网络错误而已
                break;

            case this.socket.eventType.onmessage:
                //只要接收到任意消息,发送心跳包时间往后推迟
                var data = event.data;
                data = cipher.DecryptArrayBuffer(data);
                var msg = protobuf["GS2C"]["decode"](data);
                var sequence = msg["sequence"];
                var new_session = msg["session"];
                uiManager.closeUI(uiManager.UIID.WAITINGUI);
                if(new_session < 0){
                    cc.log("Message error:" + msg);
                    return;
                }
                var msg_name, msg_content,sentData;
                this.session = this.internal_session;
                for(var i = 0; i < sequence.length; i++){
                    sentData = this.popSessionData(sequence[i])
                    msg_name = this.getNameByIdEx(sequence[i]);
                    msg_content = msg[msg_name];

                    if(new_session === this.session) {
                        this.session = new_session + 1;
                        this.internal_session = this.session;
                    }
                    var obj = {};
                    msg_content = this.removeProto(msg_content,obj);

                    cc.log("onmessage----" + msg_name + " " + JSON.stringify(msg_content));

                    this.cur_msg_name = msg_name;
                    this.cur_msg_content = msg_content;
                    if(this.exsitCallback() && new_session){
                        this.processCallback(msg_name, msg_content);
                    }
                    else {
                        this.event_listener.dispatch(msg_name, msg_content,sentData);
                    }
                }
                break;
        }

    };

    network.popSessionData = function(sequenceID){
        var msg_name = this.getNameByIdEx(sequenceID);
        var sentData = null;
        if (this.sessionData[msg_name] && this.sessionData[msg_name].length > 0) {
            sentData = this.sessionData[msg_name].shift();
        }
        return sentData;
    };

    network.removeProto = function (src,des) {
        for (var key in src) {
            if (!src.hasOwnProperty(key)) continue;
            if(Object.prototype.toString.call(src[key]) ==='[object Object]' && !(src[key] instanceof dcodeIO.Long)) {
                des[key] = {};
                this.removeProto(src[key],des[key]);
            }else if (src[key] instanceof Array) {
                des[key] = [];
                for (var i = 0 , len = src[key].length; i < len; i++) {
                    var obj = src[key][i];
                    if(Object.prototype.toString.call(src[key][i]) ==='[object Object]' && !(src[key][i] instanceof dcodeIO.Long)) {
                        des[key][i] = {};
                        this.removeProto(obj,des[key][i]);
                    }else {
                        des[key][i] = src[key][i];
                    }
                }
            }else {
                des[key] = src[key];
            }
        }
        return des
    };

    // js can't close twice, so add a paremeter 'force'
    network.disconnect = function (force, cb) {
        if (this.isConnected() || this.isConnecting()) {
            closeCallback = cb;
            this.socket.close();
        } else if (cb) {
            cb();
        }

        this.clear();
    };
    /** 保存对应消息包发送数据 */
    network.saveSessionData = function(id,data){
        var reName = this.getNameByIdEx(id + this.c2gsOffG2cs);
        this.sessionData[reName] = this.sessionData[reName] || [];
        this.sessionData[reName].push(data);
    };
    /** 发送前置 */
    network._preSend = function(ignore_session ){
        if (!this.isConnected()) return false;

        if (!ignore_session && this.session < this.internal_session) {
            cc.log("send fail", this.session, this.internal_session, this.cur_msg_name);
            return false;
        }
        return true;
    };
    /** 开始发送 */
    network._sendNow = function(msg,sequence,ignore_session ){
        cc.log("send-----", JSON.stringify(msg));

        msg["sequence"] = sequence;

        if (!ignore_session) {
            msg["session"] = this.session;
        }
        else{
            msg["session"] = 0;
        }

        var C2GS = protobuf["C2GS"];
        var c2gsMsg = new C2GS(msg);
        var encodeData = c2gsMsg["encode"]();
        var arrayBuffer = encodeData["toArrayBuffer"]();
        arrayBuffer = cipher.EncryptArrayBuffer(arrayBuffer);
        var err = this.socket.send(arrayBuffer);
        if (err) {
            if (err === "closed") {
                this.disconnect();
            }

        }
        else if (!ignore_session) {
            this.internal_session = this.internal_session + 1;
        }
        return err;
    };
    /**
     * 发送消息
     * @param  {Object } msg            消息内容对象
     * @param  {Boolean} ignore_session [是否无视队列]
     * @return {msg}                [发送结果]
     */
    network.send = function (msg, ignore_session) {
        if (!this._preSend(ignore_session )) return;
        var sequence = [];
        for (var key in msg) {
            if(!msg.hasOwnProperty(key)) continue;
            var id = this.getIdByName(key);
            if(id) {
                this.saveSessionData(id,msg[key]);
                sequence.push(id);
            }
        }
        if (!ignore_session) {
            uiManager.openUI(uiManager.UIID.WAITINGUI);
        }
        return this._sendNow(msg,sequence,ignore_session );
    };
    /**
     * 带顺序的消息
     * @param msg //消息包内容
     * @param seq//指定传送顺序
     * @param ignore_session
     * @returns {*}
     */
    network.sendSeq = function (msg, seq, ignore_session) {
        if (!this._preSend(ignore_session )) return;
        var sequence = [];
        for (var i = 0; i < seq.length; i++) {
            var id = this.getIdByName(seq[i]);
            var msgVal = msg[seq[i]];
            if (id && msgVal) {
                this.saveSessionData(id,msgVal);
                sequence.push(id);
            }
        }
        return this._sendNow(msg,sequence,ignore_session );
    };

    network.registerEvent = function (msg_name, handler) {
        this.event_listener.register(msg_name, handler);
    };

    network.dispatch = function (msg_name, msg_content) {
        this.event_listener.dispatch(msg_name, msg_content);
    };

    //存放回调业务
    network.cacheCallback = function(callback) {
        if(typeof callback !== "function") return;
        this.callbackObjs[this.internal_session] = callback;
    };

    //根据sessionId处理对应回调
    network.processCallback = function (msg_name, msg_content) {
        if(!this.callbackObjs[this.session]) return false;

        this.callbackObjs[this.session](msg_name, msg_content);
        delete this.callbackObjs[this.session];
        return true;
    };

    network.exsitCallback = function () {
        return this.callbackObjs[this.session];
    };

    network.resetSession = function () {
        this.session = this.internal_session;
    };

    network.getIdByName = function (name) {
        if(!this.c2gs) return null;

        var child = this.c2gs["getChild"](name);
        if(child) return child.id;
    };

    network.getNameById = function (id) {
        if(!this.c2gs) return null;

        var child = this.c2gs["getChild"](id);
        if(child) return child.name;
    };

    network.getIdByNameEx = function (name) {
        if(!this.gs2c) return null;

        var child = this.gs2c["getChild"](name);
        if(child) return child.id;
    };

    network.getNameByIdEx = function (id) {
        if(!this.gs2c) return null;

        var child = this.gs2c["getChild"](id);
        if(child) return child.name;
    };

    return network;
};
