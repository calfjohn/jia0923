/**
 * Created by john on 2018/01/08.
 * 心跳包逻辑层
 * 启动后生效，关闭或者丢失连接时无效
 */
//TODO 调用  start 与stop
 window.basic = window.basic || {};

basic.heartbeat =  function() {
    var heartbeat = {};

    var clientEvent = null;
    var network = null;
    var reconnet = null;

    heartbeat.init = function() {
        this.reset();
        clientEvent = kf.require("basic.clientEvent");
        network = kf.require("util.network");
        reconnet = kf.require("basic.reconnect");
        network.registerEvent("Resp_HeartBeat", function() {
            //心跳成功重置心跳
            this.heartBeatDuration = 0;
        }.bind(this));
        network.registerEvent("network close", function() { // NOTE: 额外监听网络断开
            //网络关闭
            this.stop();
        }.bind(this));
    };

    heartbeat.reset = function() {
        this.heartBeatDuration = 0; // 心跳包未响应累计时间，单位秒
        this.heartBeatTimeout = 60; // 心跳包未响应超时时间，单位秒
        this.interval = 5; // 心跳检测时间间隔
        this.duration = this.interval; // 心跳检测累计时间
    };

    heartbeat.start = function() {
        this.check = true;
    };

    heartbeat.stop = function() {
        this.check = false;
    };

    heartbeat.checkNetwork = function(dt) {
        if (!this.check ) return;//|| reconnet.isLostConnection() // NOTE: 暂时屏蔽重连行为

        this.duration += dt;
        var delta = this.duration - this.interval;
        if (delta < 0) return;
        this.duration = delta;
        this.heartBeatDuration += this.interval;
        if (this.heartBeatDuration >= this.heartBeatTimeout + 1) {
            this.heartBeatDuration = 0;
            // 向reconnect发送心跳超时消息
            // network.dispatch("reconnect timeout");
            network.disconnect();
        } else {
            var ret = network.send({ "Req_HeartBeat": {} }, true);
            // if (!ret) {}
        }
    };

    return heartbeat;
};
