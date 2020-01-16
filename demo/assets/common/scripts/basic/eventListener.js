/**
 * Created by leo on 15/12/28.
 *
 * 事件处理类
 */

window["basic"]["eventListener"] = function() {

    var oneTooOneListener = {};

    oneTooOneListener.register = function(eventName, handler) {
        this[eventName] = handler;
    };

    oneTooOneListener.dispatch = function(eventName/**/) {
        var handler = this[eventName];
        var args = Array.prototype.slice.call(arguments, 1);
        if (handler) {
            handler.apply(this, args);
        } else {
            // cc.log("not register " + eventName + "    callback func");
        }
    };

    var oneToMultiListener = {};

    oneToMultiListener.register = function(eventName, handler) {
        var handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (var i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = handler;
                return i;
            }
        }

        handlerList.push(handler);

        return handlerList.length;
    };

    oneToMultiListener.dispatch = function(eventName/**/) {
        var handlerList = this.handlers[eventName];

        var args = Array.prototype.slice.call(arguments, 1);

        if (!handlerList) {
            return;
        }

        for (var i = 0; i < handlerList.length; i++) {
            var handler = handlerList[i];
            if (handler) {
                handler.apply(this, args);
            }
        }
    };

    oneToMultiListener.unregister = function(eventName, handler) {
        var handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (var i = 0; i < handlerList.length; i++) {
            var oldHandler = handlerList[i];
            if (oldHandler === handler) {
                handlerList.splice(i, 1);
                break;
            }
        }
    };

    var getmetatable = function(obj) {
        return Object.create(obj);
    };


    var eventListener = {};
    eventListener.create = function(type) {
        var newEventListener = {};

        if (type === "multi") {
            newEventListener = { __proto__: Object.create(oneToMultiListener) };
            newEventListener.handlers = {};
        } else {
            newEventListener = { __proto__: Object.create(oneTooOneListener) };
        }

        return newEventListener;
    };

    return eventListener;
};
