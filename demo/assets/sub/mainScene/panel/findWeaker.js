var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        fingerNode:cc.Node,
        labelNode:cc.Node,
        labelCom:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["clickOneChapter", this.clickOneChapter.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function () {
        this.unscheduleAllCallbacks();
        var config = jsonTables.getJsonTable(jsonTables.TABLE.GUIDE);
        this.fingerNode.active = true;
        this.labelNode.active = true;
        this.fingerNode.position = cc.v2(config[jsonTables.CONFIG_GUIDE.CombatFingerPosition][0],config[jsonTables.CONFIG_GUIDE.CombatFingerPosition][1]);
        this.labelNode.position = cc.v2(config[jsonTables.CONFIG_GUIDE.CombatTextPosition][0],config[jsonTables.CONFIG_GUIDE.CombatTextPosition][1]);
        this.labelCom.string = uiLang.getConfigTxt(config[jsonTables.CONFIG_GUIDE.CombatTextID])
        var delay = config[jsonTables.CONFIG_GUIDE.CombatTextTime] / 1000;
        this.scheduleOnce(function () {
            this.labelNode.active = false;
        }.bind(this),delay)
    },
    clickOneChapter:function () {
        this.unscheduleAllCallbacks();
        this.fingerNode.active = false;
        this.labelNode.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
