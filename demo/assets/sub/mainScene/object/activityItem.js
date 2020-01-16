var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        labelList: [cc.Label]
    },

    onLoad () {
        jsonTables.parsePrefab(this);
    },

    init (idx, data) {
        for (var i = 0; i < this.labelList.length; i++) {
            var obj = this.labelList[i];
            obj.string = uiLang.getConfigTxt(data.serverData.ActName) ;
        }

        this.widget("activityItem/redPoint").active = !!data.showRedPoint;
    },
});
