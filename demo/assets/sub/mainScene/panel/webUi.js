
cc.Class({
    extends: cc.Component,

    properties: {
        webComp:cc.WebView
    },

    // use this for initialization
    onLoad: function () {
    },

    open:function(url){
        if (!url) {
            return uiManager.closeUI(uiManager.UIID.WEB_UI);
        }
        if (this.webComp.url !== url) {
            this.webComp.url = url;
        }
    },

    close:function(){
        this.node.active = false;
    },

    closeBtn:function(){
        uiManager.closeUI(uiManager.UIID.WEB_UI);
    },

    loadEvent:function(target,eventCode){
        if (eventCode === 2) {//出错了
            uiManager.closeUI(uiManager.UIID.WEB_UI);
        }else {

        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
