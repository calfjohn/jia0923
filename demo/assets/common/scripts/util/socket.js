/**
 * Created by leo on 15/10/10.
 */

window["util"]["socket"] = function(){
    var socket = {
        web_socket:null,
        init: function () {

        },
        send: function(data) {
            if (this.web_socket && this.web_socket.readyState === WebSocket.OPEN) {
                this.web_socket.send(data);
                return null; // no error
            }

            return null; // 错误系统暂时不引入
        },
        connect: function (ip, port, callback) {
            var ws = "ws://"
            if (kf.require("logic.login").isHttpsEnable()) {
                ws = "wss://"
            }
            var socketUrl = port !== 0 ? ws + ip + ":" + port + "/s": ws+ ip + "/s";
            if (this.web_socket) {
                this.clearCallback();
                this.web_socket.close();//
            }
            if (cc.sys.isNative) {
                var pemUrl = cc.url.raw("resources/cacert.pem");
                if (cc.loader.md5Pipe) {//// NOTE:  只有勾选md5才有这个api  神一样的设定
                    pemUrl = cc.loader.md5Pipe.transformURL(pemUrl);
                }
                this.web_socket = new WebSocket(socketUrl,null,pemUrl);
            }else {
                this.web_socket = new WebSocket(socketUrl);
            }
            this.web_socket.binaryType = "arraybuffer";

            cc.log("try to connect ws " ,socketUrl);

            this.web_socket.onmessage = function (event) {
                //var data = event.data;


                callback(socket.eventType.onmessage, event);
            }.bind(this);

            this.web_socket.onopen = function (event) {
                cc.log("onopen------------");

                callback(socket.eventType.onopen, event);
            }.bind(this);

            this.web_socket.onclose = function (event) {
                cc.log("onclose------------",event);
                this.web_socket = null;

                callback(socket.eventType.onclose, event);
            }.bind(this);

            this.web_socket.onerror = function (event) {
                cc.log("onerror------------");

                callback(socket.eventType.onerror, event);
            }.bind(this);

            return this;
        },
        clearCallback: function() {
            if (!this.web_socket) return;
            this.web_socket.onMessage = null;
            this.web_socket.onopen = null;
            this.web_socket.onerror = null;
            this.web_socket.onclose = null;
        },
        close:function () {
            if (!this.web_socket) {
                return;
            }

            this.web_socket.close();
            this.web_socket = null;
        },
        isConnecting: function() {
            return (this.web_socket && this.web_socket.readyState === WebSocket.CONNECTING) || false;
        },

        isOpen: function() {
            return (this.web_socket && this.web_socket.readyState === WebSocket.OPEN) || false;
        },

        isClosed: function() {
            return (this.web_socket && this.web_socket.readyState === WebSocket.CLOSED) || true;
        },

        isClosing: function() {
            return (this.web_socket && this.web_socket.readyState === WebSocket.CLOSING) || true;
        }
    };

    socket.eventType = {
        "onmessage":1,
        "onopen":2,
        "onclose":3,
        "onerror":4
    };

    return socket;

};
