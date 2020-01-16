var panel = require("panel");

var monMoveNode = cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    init:function(tid,pos,endPos,cb,isDo){
        var node = uiResMgr.getPrefabEx("monsterActionItem");
        node.parent = this.node;
        var configTid = tid;
        var script = node.getComponent('monsterActionItem');
        script.init(configTid)
        if (isDo) {
            script.setBornMoveAction(pos,endPos,cb);
        }
        return script;
    },

    initSpecail:function(tid,type,pos,endPos,cb){
        var script = this.init(tid,pos,endPos,cb,false);
        script.bornForSpecailPath(type,pos,endPos,cb)
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
module.exports = monMoveNode;
