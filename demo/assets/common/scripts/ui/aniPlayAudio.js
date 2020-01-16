cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function () {
        var clips = this.node.getComponent(cc.Animation)._clips;
        for (var i = 0 , len = clips.length; i < len; i++) {//预加载音效
            var obj = clips[i];
            for (var j = 0; j < obj.events.length; j++) {
                var fun = obj.events[j];
                if(fun.func !== "playAudioEffect")  continue;
                uiResMgr.loadAudio(fun.params[0],function(clip){
                }.bind(this));
            }
        }
    },

    playAudioEffect:function (audioID) {
        var ev = new cc.Event.EventCustom('playAudioEffect', true);
        ev.setUserData(audioID);
        this.node.dispatchEvent(ev);
    },

    stopAudioEffect:function (audioID) {
        var ev = new cc.Event.EventCustom('stopAudioEffect', true);
        ev.setUserData(audioID);
        this.node.dispatchEvent(ev);
    },

    // update (dt) {},
});
