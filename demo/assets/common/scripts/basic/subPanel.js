var panel = require("panel");
var subPanelObj = cc.Class({
    extends: panel,
    properties: {
        _dataReady: false,
        _isShow: false,
    },


    // 避免onEnable不被调用
    start: function() {
        this.onEnable();
    },

    setData: function(data) {
        this._data = data;
        this._dataReady = true;
        if (this._isShow) {
            this.show();
        }
    },

    getData: function() {
        return this._data;
    },

    isDataReady: function() {
        return this._dataReady;
    },

    // 需要子类去实现
    show: function() {

    },

    onDisable: function() {
        this._isShow = false;
    },

    // 负责调用UI界面刷新，在设定数据有效
    onEnable: function() {
        this._isShow = true;

        if (!this.isDataReady()) return;
        this.show();
        this._dataReady = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

module.exports = subPanelObj;
