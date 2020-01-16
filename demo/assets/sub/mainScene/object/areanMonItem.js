var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        shadows:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data,ext){
        if (this.shadows && ext) {
            this.shadows.active = false;
        }
        if (data.pos) {
            this.node.position = data.pos;
        }
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.tid);
        var callBack = function(spineData){
            if (spineData) {
                this.spine.skeletonData = spineData;
            }
            this.spine.setAnimation(0,'std',true);
        }.bind(this);
        if (data && data.isMe) {
            this.equipLogic.setBaseSpine(this.spine.node);
        }else if (data && data.roleInfo) {
            var roleInfo = data.roleInfo;
            this.equipLogic.setBaseSpineForOther(roleInfo.Sex,roleInfo.Occupation,roleInfo.EquipBaseID,this.spine.node,callBack);
        }else {
            var spineName = this.config[jsonTables.CONFIG_MONSTER.Resource];
            uiResMgr.loadSpine(spineName,callBack);
        }
        this.spine.node.scale = (this.config[jsonTables.CONFIG_MONSTER.ArenaScale])/100;
        if (this.shadows) {
            this.shadows.scale = this.config[jsonTables.CONFIG_MONSTER.CombatScale]/this.config[jsonTables.CONFIG_MONSTER.ArenaScale] * this.config[jsonTables.CONFIG_MONSTER.Shadow]/100;
        }
        this.node.scaleX = ext && idx >= 3 && idx !== 6 ? -1 :1;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
