var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        content :  {
            default : null,
            type: cc.RichText,
        },
        titleLabel:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        cc.game.addPersistRootNode(this.node);
        uiManager.registerRootUI(uiManager.UIID.MSG, this);

        this.lang = kf.require("util.lang");
        this.contentNode = this.node.getChildByName("contentNode");
        this.messageLabel = this.content.getComponent(cc.RichText);

        this.callback1 = function () {};
        this.callback2 = function () {};
        this.callback3 = function () {};
        this.callback4 = function () {};
        this.callback5 = function () {};
        this.callbackClose = function () {};

        var buttonClose = this.contentNode.getChildByName("buttonClose");
        buttonClose.on('touchend', function () {
            this.closePopUp();
        }.bind(this));

        var button1 = this.contentNode.getChildByName("button1");
        button1.on('touchend', function () {
            this.closePopUp();
            this.callback1();
        }.bind(this));
        var button2 = this.contentNode.getChildByName("button2");
        button2.on('touchend', function () {
            this.closePopUp();
            this.callback2();
        }.bind(this));
        var button3 = this.contentNode.getChildByName("button3");
        button3.on('touchend', function () {
            this.closePopUp();
            this.callback3();
        }.bind(this));

        var button4 = this.contentNode.getChildByName("button4");
        button4.on('touchend', function () {
            this.closePopUp();
            this.callback4();
        }.bind(this));
        var button5 = this.contentNode.getChildByName("button5");
        button5.on('touchend', function () {
            this.closePopUp();
            this.callback5();
        }.bind(this));
        this.node.active = false;
    },

    open:function (data) {
        if(data && data.message) {
            this.showEx(data);
        }
        else {
            this.show(data);
        }
    },

    close:function(){
        this.node.active = false;
    },

    showEx: function(data){
        if(!data) return;
        uiManager.closeUI(uiManager.UIID.WAITINGUI);
        this.node.active = true;
        this.messageLabel.string = data["message"];
        this.titleLabel.node.active = !!data["title"];
        if (this.titleLabel.node.active) {
            this.titleLabel.string = data["title"];
        }
        //设置按钮名称、背景和回调
        for(var i = 1; i <= 5; i++){
            var button = this.contentNode.getChildByName("button"+i);
            var btnData = data["button"+i];
            this["callback"+i] = function(){};
            button.active = !!btnData;
            if (button.active) {
                button.scale = 1;
                if(btnData.name && button.getChildByName("label")) button.getChildByName("label").getComponent(cc.Label).string = btnData.name;
                this["callback"+i] = btnData.callback;
            }
        }
        var buttonClose = this.contentNode.getChildByName("buttonClose");
        buttonClose.active = !!data["buttonClose"]
        if( data["button5"] ){
            uiResMgr.loadCommonIcon(data["button5"].type,this.contentNode.getChildByName("button5").getChildByName("sprite"));
            this.contentNode.getChildByName("button5").getChildByName("num").getComponent(cc.Label).string = data["button5"].count;
        }
    },

    show:function (data) {
        if(!data) return;
        uiManager.closeUI(uiManager.UIID.WAITINGUI);
        this.node.active = true;
        this.messageLabel.string = data;
        this.contentNode.getChildByName("button1").active = false;
        this.contentNode.getChildByName("button3").active = false;
        this.contentNode.getChildByName("button4").active = false;
        this.contentNode.getChildByName("button5").active = false;
        this.contentNode.getChildByName("buttonClose").active = false;
        // this.node.getChildByName("button4").active = false;
        this["callback2"] = function(){};
        this.titleLabel.node.active = false;
        var button = this.contentNode.getChildByName("button2");
        button.active = true;
        button.scale = 1;
        button.getChildByName("label").getComponent(cc.Label).string = kf.require("util.lang").getMessage("b", "MBOK");
    },

    closeForExitBtn:function () {
        if (this["callback1"]) {
            this["callback1"]();
        }
        this.close();
    },

    closePopUp:function(){
        this.node.active = false;
    }
});
