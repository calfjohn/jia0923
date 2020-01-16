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
            ["guideAction", this.guideAction.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    guideAction:function(type){
        if (type === "clickFightReel" && this.idx === this.guideLogic.reelIdx) {
            this.clickBtn();
        }
    },

    init:function(idx,reelID,ext){
        this.idx = idx
        this.reelID = reelID;
        this.widget('fightReel/shaderNode/numLabel').active = reelID !== 0;
        this.widget("fightReel/shaderNode/mask/icon").active = reelID !== 0;
        if (reelID === 0) {
            uiResMgr.loadReelBaseQualityIcon(0,this.widget('fightReel/shaderNode/reelFrame'));
            uiResMgr.loadReelQualityIcon(0,this.widget('fightReel/shaderNode/reel'));
            this.widget('fightReel/shaderNode/reel').getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL);
            this.widget('fightReel/shaderNode/reelFrame').getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL);
            this.widget('fightReel/shaderNode/mask/icon').getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL);
            this.widget("fightReel/shaderNode/fightReelUp").active = false;
            this.widget("fightReel/fightFiger").active = false;
            return;
        }
        this.widget('fightReel/shaderNode/numLabel').getComponent(cc.Label).string = "x" + this.cardLogic.getReelCount(reelID);
        // var funName = this.cardLogic.getReelCount(this.reelID) === 0 ? "grayShader" : "resetShader";
        if(this.cardLogic.getReelCount(this.reelID) === 0){
            this.widget('fightReel/shaderNode/reel').getComponent(cc.Sprite).setState(cc.Sprite.State.GRAY);
            this.widget('fightReel/shaderNode/reelFrame').getComponent(cc.Sprite).setState(cc.Sprite.State.GRAY);
            this.widget('fightReel/shaderNode/mask/icon').getComponent(cc.Sprite).setState(cc.Sprite.State.GRAY);
        }else{
            this.widget('fightReel/shaderNode/reel').getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL);
            this.widget('fightReel/shaderNode/reelFrame').getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL);
            this.widget('fightReel/shaderNode/mask/icon').getComponent(cc.Sprite).setState(cc.Sprite.State.NORMAL);
        }
        // this.widget("fightReel/shaderNode").getComponent(cc.Sprite)[funName]();//隐藏置灰

        this.widget("fightReel/fightFiger").color = this.cardLogic.getReelCount(this.reelID) === 0 ? uiColor.fightReel.lessGray : uiColor.fightReel.normalGreen;

        if (!ext.needLoadIcon) return;// NOTE: 不需要加载icon  就刷新数量就好
        // TODO: 0标识占位
        var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,reelID);//装备配置表基本数据

        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
        var quality = config[jsonTables.CONFIG_MONSTER.Form];
        uiResMgr.loadReelBaseQualityIcon(quality,this.widget('fightReel/shaderNode/reelFrame'));
        uiResMgr.loadReelQualityIcon(quality,this.widget('fightReel/shaderNode/reel'));

        var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
        uiResMgr.loadHeadIcon(iconRes,this.widget("fightReel/shaderNode/mask/icon"));

        this.scheduleOnce(function () {//异步延迟加载对象
            if (cc.isValid(this)) {
                var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
                uiResMgr.loadSpine(spineName,function () {});
            }
        },(idx * 0.5 + 1));

        var fightpower = this.cardLogic.getShowNum(reelData[jsonTables.CONFIG_REEL.MonsterID]);
        fightpower = fightpower.sword + fightpower.shield;

        this.widget("fightReel/shaderNode/fightReelUp").active = true;
        this.widget("fightReel/fightFiger").active = true;

        this.widget("fightReel/fightFiger").getComponent(cc.Label).string = fightpower;
    },

    clickBtn:function(){
        if(this.fightLogic.isGameOver() || !this.fightLogic.getCanUseReel())    return cc.warn("游戏结束了，别点了")
        var count = this.cardLogic.getReelCount(this.reelID);
        if (count === 0) return cc.warn("没东西  用个蛇皮啊")

        var ev = new cc.Event.EventCustom('clickReel', true);
        ev.setUserData({reelID:this.reelID,pos:this.node.convertToWorldSpaceAR(cc.v2(0,0))});
        this.node.dispatchEvent(ev);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
