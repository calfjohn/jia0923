var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        numLabel:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(i,data,midPos){
        this.numLabel.node.active = false;
        var callBack = function(spineData){
            if (spineData) {
                this.spine.skeletonData = spineData;
            }
            this.node.width = this.spine.skeletonData.skeletonJson.skeleton.width * (1/this.spine.node.scale);// NOTE: spine动画的高度
            this.spine.setAnimation(0,'std',true);
            var than = i-midPos > 0 ? 1 : -1;
            this.node.x = Math.abs(i-midPos) * 50 * than;
        }.bind(this);
        if (data.id === 1) {
            this.equipLogic.setBaseSpine(this.spine.node,callBack);
            this.node.zIndex = 9999;
            var sex = this.userLogic.getBaseData(this.userLogic.Type.Sex);
            var profession = this.userLogic.getBaseData(this.userLogic.Type.Career);
            var tid = jsonTables.profession2Monster(profession,sex);
            this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        }else {
            this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.id);
            var spineName = this.config[jsonTables.CONFIG_MONSTER.Resource];
            uiResMgr.loadSpine(spineName,callBack);
            this.node.zIndex = this.config[jsonTables.CONFIG_MONSTER.Znum];
        }
        this.spine.node.scale = this.config[jsonTables.CONFIG_MONSTER.CombatScale]/100;//

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
