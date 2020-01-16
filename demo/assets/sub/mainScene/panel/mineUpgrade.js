var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    open:function(){
        this.data = this.mineLogic.getMineData();
        var nextStr = "";
        this.widget('mineUpgrade/shrink/maxLabel').active = !!!this.data.NextLvOutput;
        this.widget('mineUpgrade/shrink/content1').active = !this.widget('mineUpgrade/shrink/maxLabel').active;

        if (this.widget('mineUpgrade/shrink/content1').active) {
            this.widget("mineUpgrade/shrink/content1/numberLabel").getComponent(cc.Label).string = this.data.UpgradeBadge;
            this.widget('mineUpgrade/shrink/content1/numberLabel').color = this.userLogic.getBaseData(this.userLogic.Type.Badge) < this.data.UpgradeBadge ? uiColor.red : uiColor.white;
        }

        this.widget('mineUpgrade/shrink/content/contentLabel1').getComponent(cc.Label).string = this.data.CurOutput ;

        this.widget('mineUpgrade/shrink/content/contentLabelto').active = !this.widget('mineUpgrade/shrink/maxLabel').active;
        if (this.widget('mineUpgrade/shrink/content/contentLabelto').active) {
            var conentLabel = this.widget('mineUpgrade/shrink/content/contentLabelto/contentLabel2').getComponent(cc.Label);
            conentLabel.string =  "+"+(this.data.NextLvOutput - this.data.CurOutput);
        }

    },

    confirm:function(){
        if (this.widget('mineUpgrade/shrink/maxLabel').active) {
            var errorcode = uiLang.getMessage("errorcode", "errorcode104");
            uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
            return;
        }
        if (this.data.UpgradeBadge > this.userLogic.getBaseData(this.userLogic.Type.Badge) ) {
            var errorcode = uiLang.getMessage("errorcode", "errorcode13");
            uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
            return;
        }
        this.mineLogic.req_Mine_Upgrade(this.data.CurLv + 1);
        this.close();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
