var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    backMainScene:function(){
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.MAIN,loadCallBack:function(){
            this.miniGameLogic.checkCallBack();
        }.bind(this),isReleaseLastOne:true});
        this.node.dispatchEvent(ev);
    },

    fightAgain:function(){
        if (this.miniGameLogic.fightAgain()) {
            this.close();
        }
    },

    open:function(param){
        this.widget('settlementGold/frame/gold/numberLabel').getComponent(cc.Label).string = "x"+param.Rewards[0].Num;
        this.widget('settlementGold/frame/button1').getComponent(cc.Button).interactable = this.miniGameLogic.isCountLargeZore();
        this.widget('settlementGold/frame/button1').active = this.miniGameLogic.isFromSourceCopy();
        this.widget('settlementGold/frame/button2').x = this.miniGameLogic.isFromSourceCopy() ? 144 :0;
        var str = this.miniGameLogic.isFromSourceCopy() ? "main" :"chapter";
        this.widget('settlementGold/frame/button2/label2').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,str);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
