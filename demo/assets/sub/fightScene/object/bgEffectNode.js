var panel = require("panel");

var bgEffectNode = cc.Class({
    extends: panel,

    properties: {
        minePrefab:cc.Prefab
    },

    // use this for initialization

    init:function(){
        var mine = this.fightLogic.isGameType(constant.FightType.MINE_FIGHT) || this.fightLogic.isGameType(constant.FightType.MINE_READY)
        this.node.getInstance(this.minePrefab,mine);
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
module.exports = bgEffectNode;
