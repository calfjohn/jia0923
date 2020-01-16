var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        dayFrame:[cc.SpriteFrame],
        upY: {     //隐藏
           default: 33,
           tooltip: "上方的Y值"
        },
        downY: {
            default: -14,
            tooltip: "下方的Y值"
        },
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["clickSign", this.clickSign.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function(idx,data){
        this.widget("signItem/day").getComponent(cc.Sprite).spriteFrame = this.dayFrame[idx];
        this.idx = idx + 1;
        this.node.y = this.idx % 2 === 1?this.upY:this.downY;
        var statue = this.signLogic.getSignStatus(this.idx);
        this.widget("signItem/seal/wordPrint").active = statue === constant.SignStatus.RECEICED;
        this.widget("signItem/selected").active = statue === constant.SignStatus.GETREWARD;
        this.widget("signItem/black").active = statue === constant.SignStatus.RECEICED;
        var addStr = data.Type ===constant.ItemType.EQUIP?"LV":"x";
        this.widget("signItem/floor4/num").getComponent(cc.Label).string = addStr+data.Num;
        uiResMgr.loadRewardIcon(this.widget("signItem/floor4/icon"),data.Type,data.BaseID,this.widget("signItem/floor4"),this.widget("signItem/floor4/qualityFrame1"));
    },
    clickSign:function(idx){
        if(idx !== this.idx)    return;
        this.widget("signItem/seal").getComponent(cc.Animation).play();
    },
    // update (dt) {},
});
