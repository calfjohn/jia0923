var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data,script){
        this.spine.skeletonData  = null;
        var callBack = function(spineData){
            this.spine.skeletonData  = spineData;
            this.spine.setAnimation(0,'walk',true);
        }.bind(this);
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data);
        var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadSpine(spineName,callBack);

        if (script && script.add) {
            script.add(this);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
