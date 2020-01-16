var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rankSprite:[cc.SpriteFrame],
        monIcon:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        this.widget('worldBossRankItem/rankingIcon').active = data.rank <= 3;
        this.widget('worldBossRankItem/rankLabel').active = !this.widget('worldBossRankItem/rankingIcon').active;
        if (this.widget('worldBossRankItem/rankingIcon').active) {
            this.widget('worldBossRankItem/rankingIcon').getComponent(cc.Sprite).spriteFrame = this.rankSprite[data.rank - 1];
        }
        this.widget('worldBossRankItem/rankLabel').getComponent(cc.Label).string = data.rank;

        this.widget('worldBossRankItem/nameLabel').getComponent(cc.Label).string = data.damageInfo.Name;
        this.widget('worldBossRankItem/levelLabel').getComponent(cc.Label).string = data.damageInfo.Lv;
        this.widget('worldBossRankItem/numberLabel').getComponent(cc.Label).string = NP.toThousands(data.damageInfo.Damage.toNumber());

        // var callBack = function(spineData){
        //     this.widget('worldBossRankItem/spine').getComponent(sp.Skeleton).skeletonData  = spineData;
        //     this.widget('worldBossRankItem/spine').getComponent(sp.Skeleton).setAnimation(0,'std',true);
        // }.bind(this);
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.damageInfo.HeroID);
        // var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
        // uiResMgr.loadSpine(spineName,callBack);
        var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
        uiResMgr.loadHeadIcon(iconRes,this.monIcon);

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
