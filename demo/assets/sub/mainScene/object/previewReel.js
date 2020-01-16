var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,reelID){
        this.reelID = reelID;
        this.widget('previewReel/numberLabel').active = reelID !== 0;
        this.widget("previewReel/mask/icon").active = reelID !== 0;

        if (reelID === 0) {
            uiResMgr.loadReelBaseQualityIcon(0,this.node);
            uiResMgr.loadReelQualityIcon(0,this.widget('previewReel/reel'));
            return;
        }
        // TODO: 0标识占位
        var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,reelID);//装备配置表基本数据

        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
        var quality = config[jsonTables.CONFIG_MONSTER.Form];
        uiResMgr.loadReelBaseQualityIcon(quality,this.node);
        uiResMgr.loadReelQualityIcon(quality,this.widget('previewReel/reel'));

        var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
        uiResMgr.loadHeadIcon(iconRes,this.widget("previewReel/mask/icon"));
        this.widget('previewReel/numberLabel').getComponent(cc.Label).string = "x" + this.cardLogic.getReelCount(reelID);
    },

    clickBtn:function(){
        var ev = new cc.Event.EventCustom('clickReel', true);
        ev.setUserData(this.reelID);
        this.node.dispatchEvent(ev);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
