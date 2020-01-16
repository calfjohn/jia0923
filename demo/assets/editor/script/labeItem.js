var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(idx,data){
        this.data = data;
        this.node.getComponent(cc.Label).string = data.name;
        this.node.color = data.name === "tipNode" ? uiColor.red : uiColor.white;
        this.node.scale = data.name === "tipNode" ? 5 : 1
        if (data.name === "tipNode") {
            this.node.position = data.pos;
            this.node.getComponent(cc.Label).string = data.keyName;
        }
    },

    btnNode:function(){
        var ev = new cc.Event.EventCustom('clickLabel', true);
        ev.setUserData(this.data);
        this.node.dispatchEvent(ev);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
