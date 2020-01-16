
var panelObj = cc.Class({
    extends: cc.Component,
    properties: {
        _isReBind:false,
    },

    ctor: function () {

        Object.defineProperty(this,"clientEvent",{
          set:function(newValue){console.error("不允许手动修改clientEvent")},
          get:function(){return this._initEvent();}
        })

        Object.defineProperty(this,"dataManager",{
          set:function(newValue){console.error("不允许手动修改dataManager")},
          get:function(){return this._initDataManager();}
        })

        if (this.close) {//如果存在就重新绑定一下
            window["basic"]["overWrite"].reBindFuc(this,"close",this.closeForBind.bind(this));
        }
        for (var key in window.logic) {
            if (!window.logic.hasOwnProperty(key)) continue;
            Object.defineProperty(this,key+"Logic",{
              set:function(newValue){console.error("不允许手动修改"+key)},
              get:function(){
                  if (!this.obj["_"+this.key+"Logic"]) {
                      this.obj["_"+this.key+"Logic"] = kf.require("logic."+this.key);
                  }
                  return this.obj["_"+this.key+"Logic"];
              }.bind({obj:this,key:key})
            })
        }
	},

    widget:function(path){
        if (!this._widget) {
            this._widget = {};
        }
        if (!this._widget[path]) {
            this._widget[path] = jsonTables.getNodeInLoop(this.node,path);
        }
        return this._widget[path];
    },

    close:function(){//给子界面绑定使用
        this.node.active = false;
    },

    closeForBind:function(){
        if (this.node.active) {
            this.node.active = false;
        }
    },

    getRootNode: function() {
        return this.node;
    },

    setPosition: function(/* arguments */) {
        this.node.setPosition.apply(this.node, arguments);
    },

    getPosition: function() {
        return this.node.getPosition();
    },

    _initEvent:function(){
        if (!this._clientEvent) {
            this._clientEvent = kf.require("basic.clientEvent");
        }
        return this._clientEvent;
    },
    _initDataManager:function(){
        if (!this._dataManager) {
            this._dataManager = kf.require("manager.data");
        }
        return this._dataManager;
    },
    _bindClearFunc:function(){
        if (!this._isReBind) {
            this._isReBind = true;
            window["basic"]["overWrite"].reBindFuc(this,"onDestroy",this.clearAllEvent.bind(this));
        }
    },
    /** 支持数组或单个注册 */
    registerNodeEvent:function(){
        if (arguments[0] instanceof Array) {
            var list = arguments[0];
            for (var i = 0; i < list.length; i++) {
                this._registerNodeEvent.apply(this,list[i]);
            }
        }else {
            this._registerNodeEvent.apply(this,arguments);
        }
    },

    _registerNodeEvent:function(eventName,eventFunc){
        if (typeof eventName !== "string") return;
        if (!this.eventNodeObj) {
            this.eventNodeObj = cc.js.createMap();
        }

        if (this.eventNodeObj[eventName]) {
            console.error("already have the same event in this panel");
            return;
        }
        this.eventNodeObj[eventName] = eventFunc;
        this.node.on(eventName, eventFunc, this);
        this._bindClearFunc();
    },

    unregisterNodeEvent: function(eventName,eventFunc) {
        if (typeof eventName !== "string") {
            return;
        }

        if (!this.eventNodeObj[eventName]) {
            console.error("not found event in this panel");
            return;
        }
        this.node.off(eventName, this.eventNodeObj[eventName], this);
        delete this.eventNodeObj[eventName];
    },
    /** 支持数组或单个注册 */
    registerClientEvent:function(){
        if (arguments[0] instanceof Array) {
            var list = arguments[0];
            for (var i = 0; i < list.length; i++) {
                this._registerClientEvent.apply(this,list[i]);
            }
        }else {
            this._registerClientEvent.apply(this,arguments);
        }
    },

    _registerClientEvent: function(eventName, handler, forceFlag) {
        if (typeof eventName !== "string") return;
        if (!this.eventObj) {
            this.eventObj = cc.js.createMap();
        }

        if (this.eventObj[eventName]) {
            console.error("already have the same event in this panel");
            return;
        }

        this.eventObj[eventName] = function() {
            var rootNode = this.getRootNode();
            if (!forceFlag) {//如果 跟随显影就去迭代父节点判断
                if (!rootNode.getParent()) return;// NOTE: 这里保护一下放在对象池里面的对象  这里有点特殊的是 对象池节点脚本必须在根节点上
                for (var c = rootNode; c.getParent(); c = c.getParent()) {
                    if (!c.active) {
                        return;
                    }
                }
            }
            handler.apply(this, arguments);
        }.bind(this);

        this.clientEvent.on(eventName, this.eventObj[eventName]);
        this._bindClearFunc();
    },

    unregisterClientEvent: function(eventName) {
        if (typeof eventName !== "string") {
            return;
        }

        if (!this.eventObj[eventName]) {
            console.error("not found event in this panel");
            return;
        }

        this.clientEvent.off(eventName, this.eventObj[eventName]);

        delete this.eventObj[eventName];
    },

    /** 支持数组或单个注册 */
    registerDataEvent:function(){
        if (arguments[0] instanceof Array) {
            var list = arguments[0];
            for (var i = 0; i < list.length; i++) {
                this._registerDataEvent.apply(this,list[i]);
            }
        }else {
            this._registerDataEvent.apply(this,arguments);
        }
    },

    _registerDataEvent:function(eventName,eventFunc){
        if (!this.eventDataObj) {
            this.eventDataObj = cc.js.createMap();
        }

        if (this.eventDataObj[eventName]) {
            console.error("already have the same event in this panel");
            return;
        }
        this.eventDataObj[eventName] = eventFunc;
        this.dataManager.registerEvent(eventName, this.eventDataObj[eventName]);
        this._bindClearFunc();
    },

    unregisterDataEvent: function(eventName,eventFunc) {
        if (typeof eventName !== "string") {
            return;
        }

        if (!this.eventDataObj[eventName]) {
            console.error("not found event in this panel");
            return;
        }
        this.dataManager.unregisterEvent(eventName, this.eventDataObj[eventName]);
        delete this.eventDataObj[eventName];
    },

    clearAllEvent: function() {
        if (this.eventObj) {
            for (var eventName in this.eventObj) {
                this.unregisterClientEvent(eventName);
            }
            this.eventObj = cc.js.createMap();
        }
        if (this.eventNodeObj) {
            for (var eventName in this.eventNodeObj) {
                this.unregisterNodeEvent(eventName);
            }
            this.eventNodeObj = cc.js.createMap();
        }
        if (this.eventDataObj) {
            for (var eventName in this.eventDataObj) {
                this.unregisterDataEvent(eventName);
            }
            this.eventDataObj = cc.js.createMap();
        }
    },
});

module.exports = panelObj;
