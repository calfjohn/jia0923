var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
    },

    registerEvent: function () {

        var registerHandler = [
            // ["buildingRelicChange", this.buildingRelicChange.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            // ["clickScroll", this.clickScroll.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    open:function () {

    },

    closeEvent:function () {
        this.shareLogic.clearSdwCb();
        this.close();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
