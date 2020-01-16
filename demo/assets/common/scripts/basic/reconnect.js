/**
 * Created by john on 2018/01/01.
 * 断线重连逻辑层
 * 如果丢失连接，重连服务器，三次失败之后，不再重连
 * 重连网络，还是重连游戏服务器
 * tips:在游戏中丢失连接时，重连才生效
 */
//TODO setServer setInGame
window.basic = window.basic || {};
basic.reconnect = function() {
    var network = null;
    var clientEvent = null;

    var reconnect = {};
    reconnect.init = function() {
        this.reset();
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");

        network.registerEvent("reconnect timeout", function() {
            this.setLostConnection(true);
        }.bind(this));

        network.registerEvent("network close", function() {
            //网络关闭
            this.setLostConnection(true);
        }.bind(this));
    };

    reconnect.reset = function() {
        this.interval = 5; // 断线检测时间间隔
        this.duration = this.interval; // 断线累计时间
        this.connectInterval = 3; // 尝试重连接服务器次数
        this.connectCount = 0; // 断线重连失败次数
        this.lostConnection = false; // 断线重连状态
    };

    reconnect.connectNetwork = function(dt) {
        if (!this.isInGame() || !this.isLostConnection() || network.isConnecting()) return;

        this.duration += dt;
        var delta = this.duration - this.interval;
        if (delta < 0) return;
        this.duration = delta;

        uiManager.openUI(uiManager.UIID.WAITINGUI);
        this._connect();
    };

    reconnect._connect = function() {
        if (this.connectCount >= this.connectInterval) {//重连失败
            uiManager.closeUI(uiManager.UIID.WAITINGUI);
            this.reset();
            network.dispatch("logout");
            return;
        }

        this.connectCount++;
        network.connect(this.ip, this.port, function() {//重连成功回调
            this.reset();
            network.dispatch("loginserver");
        }.bind(this));
    };

    reconnect.setLostConnection = function(flag) {
        if (flag) {
            if (!this.isInGame()) return;
            // 丢失网络连接
            this.lostConnection = true;
            network.clearCallback();
        } else {
            this.lostConnection = false;
        }
    };

    reconnect.isLostConnection = function() {
        return this.lostConnection;
    };

    reconnect.isInGame = function() {
        return this.inGame;
    };

    reconnect.setInGame = function(flag) {
        this.inGame = flag;
    };

    reconnect.setServer = function(ip, port) {
        this.ip = ip;
        this.port = port;
    };

    return reconnect;
};
