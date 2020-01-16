var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        iconSp:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data,pro){
        switch (data.type) {
            case jsonTables.CONFIG_BOXINFO.Gold:
                this.widget('treasureBoxItem/icon').getComponent(cc.Sprite).spriteFrame = this.iconSp[1];
                this.widget('treasureBoxItem/numLabel').getComponent(cc.Label).string = data.info[0]+"-"+data.info[1];
                break;
            case jsonTables.CONFIG_BOXINFO.Reel:
                this.widget('treasureBoxItem/icon').getComponent(cc.Sprite).spriteFrame = this.iconSp[3];
                this.widget('treasureBoxItem/numLabel').getComponent(cc.Label).string = data.info;
                break;
            case jsonTables.CONFIG_BOXINFO.Debris:
                this.widget('treasureBoxItem/icon').getComponent(cc.Sprite).spriteFrame = this.iconSp[0];
                this.widget('treasureBoxItem/numLabel').getComponent(cc.Label).string = data.info;
                break;
            case jsonTables.CONFIG_BOXINFO.Equip:
                this.widget('treasureBoxItem/icon').getComponent(cc.Sprite).spriteFrame = this.iconSp[2];
                this.widget('treasureBoxItem/numLabel').getComponent(cc.Label).string = data.info/10 + "%";
                break;
        }
    },



    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
