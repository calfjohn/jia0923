var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    open:function(boxInfoID,nameID,iconID){
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BOXINFO,boxInfoID);
        this.widget("shopTreasureBox/in/treasureChest1/floor/title").getComponent(cc.Label).string = uiLang.getConfigTxt(nameID);
        uiResMgr.loadLockTreasureBox(iconID, this.widget("box"));
        this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus1").active = config[jsonTables.CONFIG_BOXINFO.Gold].length > 0;
        if (this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus1").active) {
            var pre = NP.dealNum(config[jsonTables.CONFIG_BOXINFO.Gold][0],constant.NumType.TEN);
            var pre1 = NP.dealNum(config[jsonTables.CONFIG_BOXINFO.Gold][1],constant.NumType.TEN);
            this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus1/number").getComponent(cc.Label).string = pre +"-"+pre1;
        }
        this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus2").active = config[jsonTables.CONFIG_BOXINFO.Debris] > 0;
        if (this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus2").active) {
            this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus2/number").getComponent(cc.Label).string = config[jsonTables.CONFIG_BOXINFO.Debris];
        }
        this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus3").active = config[jsonTables.CONFIG_BOXINFO.Reel] > 0;
        if (this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus3").active) {
            this.widget("shopTreasureBox/in/treasureChest1/floor/content/bonus3/number").getComponent(cc.Label).string = config[jsonTables.CONFIG_BOXINFO.Reel];
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
