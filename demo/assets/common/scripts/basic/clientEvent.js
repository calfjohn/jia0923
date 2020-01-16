window["basic"] = window["basic"] || {};
window["basic"]["clientEvent"] = function() {

    var eventListener = kf.require("basic.eventListener");

    var clientEvent = {};

    var _EVENT_TYPE = [
        "loadScene",//加载场景
        "loadSceneProgress",//加载场景进度
        "releaseScene",//释放场景
        "setSceneVisible",//切换场景显隐
        "playBgMusice",
        "parseMusic",
        "playAudioEffect",
        "updateVolume",
        "refreshMainBtnActive",
        "changeLanguage",
        "showMainScene",
        "showLoginState",
        "clickTopHeadShop",
        "showTowerFight",
    ];

    clientEvent.addEventType = function(list){
        var len = this.len;
        for (var i = 0; i < list.length; i++) {
            var v = list[i];
            this.EVENT_TYPE[v] = i + len;
            this.len++;
        }
    };

    clientEvent.init = function() {

        this.eventListener = eventListener.create("multi");
        this.EVENT_TYPE = {};
        this.len = 1;
        this.addEventType(_EVENT_TYPE);
        window.clientEvent = this;
    };

    clientEvent.registerEvent = function(eventName, handler) {
        if (typeof eventName !== "string") {
            return;
        }

        eventName = clientEvent.EVENT_TYPE[eventName];

        this.eventListener.register(eventName, handler);
    };

    clientEvent.on = clientEvent.registerEvent;//兼容老客户端写法

    clientEvent.unregisterEvent = function(eventName, handler) {
        if (typeof eventName !== "string") {
            return;
        }

        eventName = clientEvent.EVENT_TYPE[eventName];

        this.eventListener.unregister(eventName, handler);
    };

    clientEvent.off = clientEvent.unregisterEvent;//兼容老客户端写法

    clientEvent.dispatchEvent = function(eventName /*arguments*/) {

        if (typeof eventName !== "string") {
            return;
        }
        var eventIndex = clientEvent.EVENT_TYPE[eventName];

        if (!eventIndex) {
            cc.error("please add the event into clientEvent.js");
            return;
        }

        var newArgs = Array.prototype.slice.call(arguments);
        newArgs[0] = eventIndex;

        this.eventListener.dispatch.apply(this.eventListener, newArgs);
    };

    clientEvent.bindEventListener = function(name) {
        this.eventListener = eventListener.create("multi");
    };

    return clientEvent;
};
