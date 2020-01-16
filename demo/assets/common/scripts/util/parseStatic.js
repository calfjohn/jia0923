var panel = require("panel");

cc.Class({
    editor: {
        menu:"util/替换静态文字",
        disallowMultiple:true,
    },
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
});
