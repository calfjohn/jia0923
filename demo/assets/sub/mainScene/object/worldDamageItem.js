var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rankIcon:[cc.SpriteFrame],
        rewardNode:[cc.Node],
        numLabel:[cc.Label]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        for (var i = 0 , len = this.rewardNode.length; i <  len; i++) {
            var info = data.Rewards[i];
            var node = this.rewardNode[i];
            node.active = !!info;
            this.numLabel[i].node.active = node.active;
            if (!node.active) {
                continue;
            }
            uiResMgr.loadRewardIcon(node,info.Type,info.BaseID);
            this.numLabel[i].string = info.Num;
            this.numLabel[i].node.active = info.Num > 1;
        }


        this.widget('worldDamageItem/rankLabel').active = data.RankRange > 3;
        if (this.widget('worldDamageItem/rankLabel').active) {
            if (data.nextRange === null) {
                this.widget('worldDamageItem/rankLabel').getComponent(cc.Label).string = "≥" + data.RankRange ;
            }else {
                this.widget('worldDamageItem/rankLabel').getComponent(cc.Label).string = data.RankRange + "-" +data.nextRange;
            }
        }
        this.widget('worldDamageItem/rankingIcon').active = data.RankRange <= 3;
        if (this.widget('worldDamageItem/rankingIcon').active) {
            this.widget('worldDamageItem/rankingIcon').getComponent(cc.Sprite).spriteFrame = this.rankIcon[data.RankRange - 1];
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
