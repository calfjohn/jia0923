var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        qualitFrame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data){
        this.widget("reelPanelBottomItem/reel/mark/number").getComponent(cc.Label).string = idx + 1;
        var active = !!data;
        this.widget("reelPanelBottomItem/reel/equipItem").active = active;
        this.widget("reelPanelBottomItem/reel/number").active = active;
        this.widget("reelPanelBottomItem/reel/scroll").active = active;
        this.node.getComponent(cc.Button).id = data;
        if (active) {
            var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,data);//装备配置表基本数据
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
            var quality = config[jsonTables.CONFIG_MONSTER.Form];
            // uiResMgr.loadBaseQualityIcon(quality,this.widget("reelPanelBottomItem/reel/equipItem/iconFrame"));
            this.widget("reelPanelBottomItem/reel/equipItem/iconFrame").getComponent(cc.Sprite).spriteFrame = this.qualitFrame[quality - 1];

            uiResMgr.loadQualityIcon(quality,this.widget("reelPanelBottomItem/reel/equipItem/qualityFrame1"));

            // uiResMgr.loadReelQualityIcon(quality,this.widget("reelPanelBottomItem/reel/reelFrame/reel0"));
            this.widget("reelPanelBottomItem/reel/number").getComponent(cc.Label).string = "x"+this.cardLogic.getReelCount(data);
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
            var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
            uiResMgr.loadHeadIcon(iconRes,this.widget("reelPanelBottomItem/reel/equipItem/icon"));
        }else {
        }
    },

    clickLineUpReel:function(event){
        var id = event.target.getComponent(cc.Button).id;
        if (id === 0) return;
        this.node.dispatchDiyEvent("clickBottomReel",id);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
