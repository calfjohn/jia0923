
cc.Class({
    extends: cc.Component,

    properties: {
    },

    close: function() {
        this.node.active = false;
        this.aniNode.active = false;
        this.unscheduleAllCallbacks();
    },

    open: function() {
        this.node.active = true;
        this.scheduleOnce(function(){
            this.aniNode.active = true;
        }.bind(this),0.5);
    },

    // use this for initialization
    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        this.aniNode = this.node.getChildByName("loadChange");
        this.node.active = false;
        this.aniNode.active = false;
        uiManager.registerRootUI(uiManager.UIID.WAITINGUI, this);
    },
});
