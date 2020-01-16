var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        letterSp:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    init:function(idx,data,cb){
        this.mailID = data.ID;
        this.idx = idx;
        this.widget("mailItem/titleLabel").getComponent(cc.Label).string = data.SrcName === "-1"?uiLang.getConfigTxt(data.Title):data.Title;
        this.widget("mailItem/dateLabel").active = data.ExpiryTime.toNumber() !== 0;
        this.widget("mailItem/dateLabel").getComponent(cc.Label).string =uiLang.getMessage("mail","residue") + this.timeLogic.getMailAllTime(data.ExpiryTime - this.timeLogic.now());
        this.letterIdx = data.Status === this.mailLogic.ENUM_MAIL_STATE_UNREAD?1:0;
        this.widget("mailItem/letter").getComponent(cc.Sprite).spriteFrame = this.letterSp[this.letterIdx];
        this.widget("mailItem/redDot").active = data.Gift && data.Status !== this.mailLogic.ENUM_MAIL_STATE_RECEIVED;
        this.unClick();
        if(cb(data.ID)){
            this.clickItem("",true);
        }
    },
    //isAuto:这是我刷新页面时候调用的，外部不用关闭背景
    clickItem:function(event,isAuto){
        if(this.letterIdx === 1){
            this.letterIdx = 0;
            this.widget("mailItem/letter").getComponent(cc.Sprite).spriteFrame = this.letterSp[this.letterIdx];
        }
        this.widget("mailItem/checkmark").active = true;
        this.widget("mailItem/titleLabel").color = uiColor.white;
        this.widget("mailItem/dateLabel").color = uiColor.white;
        var ev = new cc.Event.EventCustom('clickItem', true);
        var data = {
            node:this.node,
            id:this.mailID,
            idx:this.idx,
            isAuto:isAuto
        };
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    unClick:function () {
        this.widget("mailItem/checkmark").active = false;
        this.widget("mailItem/titleLabel").color = uiColor.white;
        this.widget("mailItem/dateLabel").color = uiColor.white;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
