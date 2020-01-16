var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization

    init:function(idx,data){
        this.node.x = data[0] * 45;
        this.node.y = data[1] * 45;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
