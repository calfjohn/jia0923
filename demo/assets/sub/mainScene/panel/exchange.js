var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        editBox:cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshGift", this.refreshGift.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
    },
    open:function () {
        this.editBox.string = "";
    },
    refreshGift:function () {
        this.editBox.string = "";
        this.close();
    },
    getGift:function () {
        if(!this.editBox.string){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("gift","empty"));
            return;
        }
        this.treasureLogic.req_Gift(this.editBox.string);
    },

    //点击输入框，如果不是浏览器平台，则打开横屏输入框
    editBegin:function (event) {
        if(cc.sys.os !== cc.sys.OS_WINDOWS){
            uiManager.openUI(uiManager.UIID.EDIT_PANEL,this.editBox);
        }
    },
    // update (dt) {},
});
