

//管理所有的游戏数据和数据通知
window["manager"]["data"] = function() {
    var eventListener = kf.require("basic.eventListener");

    var dataManager = {};

    dataManager.inputContainer = {}

    //数据消息类型
    dataManager.DATA = {
        ROLE_INFO : 0,
    }

    //------------------------------------------
    var DataInput = {};

    DataInput.init = function(name, data) {
        this.name = name;
        this.data = data;
        this.isLock = false;//是否处于锁定状态，先不刷新界面。等到解锁的时候刷新
    };

    DataInput.setLock = function(status) {
        this.isLock = status;
        if(!this.isLock){
            this.refresh();
        }
    };

    DataInput.refresh = function(data) {
        if (data) {
            this.data = data
        }
        if(this.isLock) return;
        dataManager.dispatchEvent(this.name, this.data);
    };

    dataManager.resetData = function(name,data){
        var instance = {};
        if(dataManager.inputContainer[name]){
            instance = dataManager.inputContainer[name];
            instance.init(name,data);
        }else{
            instance = this.setDataInput(name,data);
        }
        return  instance;
    };

    dataManager.setDataInput = function(name, data) {
        var instance = {};
        DataInput = Object.create(DataInput);
        instance = { __proto__: DataInput };
        instance.init(name, data);
        dataManager.inputContainer[name] = instance;
        return instance;
    };

    dataManager.getDataInput = function(name) {
        return dataManager.inputContainer[name]
    }

    dataManager.EVENT_TYPE = {};
    for (var key in dataManager.DATA) {
        dataManager.EVENT_TYPE[dataManager.DATA[key]] = key;
    }

    dataManager.init = function() {
        this.eventListener = eventListener.create("multi");
    };

    dataManager.registerEvent = function(eventName, handler) {
        if (!handler || typeof handler != 'function') {
            return;
        }
        var dataInput = this.getDataInput(eventName)

        eventName = dataManager.EVENT_TYPE[eventName];
        this.eventListener.register(eventName, handler);

        //有注册数据源，需要通知
        if (dataInput) {
            handler(dataInput.data);
        }
    };

    dataManager.unregisterEvent = function(eventName, handler) {
        eventName = dataManager.EVENT_TYPE[eventName];
        this.eventListener.unregister(eventName, handler);
    };

    dataManager.dispatchEvent = function(eventName /*arguments*/) {
        var eventIndex = dataManager.EVENT_TYPE[eventName];
        if (!eventIndex) {
            cc.error("please add the event into dataManager.js");
            return;
        }
        var newArgs = Array.prototype.slice.call(arguments);
        newArgs[0] = eventIndex;
        this.eventListener.dispatch.apply(this.eventListener, newArgs);
    };

    return dataManager;
};
