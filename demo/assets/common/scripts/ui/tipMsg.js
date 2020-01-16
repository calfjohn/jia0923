var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        content :  cc.Label,
        showTime: 0,
    },

    onLoad:function () {
        jsonTables.parsePrefab(this);
        cc.game.addPersistRootNode(this.node);
        uiManager.registerRootUI(uiManager.UIID.TIPMSG, this);
        this.anim = this.node.getComponent(cc.Animation);
        this.lang = kf.require("util.lang");

        this.node.active = false;
    },

    open: function (content) {
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.HINT);
        this.node.stopAllActions();
        this.node.active = true;
        this.content.string = content;
        this.anim.play(this.anim.getClips()[1].name);
        this.anim.setCurrentTime(0);
        var callfunc = cc.callFunc(function(){
            this.anim.play(this.anim.getClips()[0].name);
        }, this);
        var callfunc1 = cc.callFunc(this.close, this)
        this.node.runAction(cc.sequence([cc.delayTime(this.showTime), callfunc, cc.delayTime(this.anim.getClips()[0].duration),callfunc1]));
    },

    close: function () {
        this.node.active = false;
    }
});
