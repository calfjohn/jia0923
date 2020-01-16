var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        tipNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,worldPos){
        this.node.active = true;
        var nodePos = this.node.parent.convertToNodeSpaceAR(worldPos);
        nodePos = cc.v2(nodePos.x,nodePos.y);
        var k = nodePos.y/nodePos.x;
        var pos = cc.v2(0,0);
        if (nodePos.x > 0 && nodePos.y > 0) {
            var x = this.node.parent.width/2;
            var y = x * k;
            if (y < this.node.parent.height/2) {
            }else {
                y = this.node.parent.height/2;
                x = y/k;
            }
            pos.x = x;
            pos.y = y;
        }else if (nodePos.x > 0 && nodePos.y < 0) {
            var x = this.node.parent.width/2;
            var y = x * k;
            if (y > -this.node.parent.height/2) {
            }else {
                y = -this.node.parent.height/2;
                x = y/k;
            }
            pos.x = x;
            pos.y = y;
        }else if (nodePos.x < 0 && nodePos.y < 0) {
            var x = -this.node.parent.width/2;
            var y = x * k;
            if (y > -this.node.parent.height/2) {
            }else {
                y = -this.node.parent.height/2;
                x = y/k;
            }
            pos.x = x;
            pos.y = y;
        }else if (nodePos.x < 0 && nodePos.y > 0) {
            var x = -this.node.parent.width/2;
            var y = x * k;
            if (y < this.node.parent.height/2) {
            }else {
                y = this.node.parent.height/2;
                x = y/k;
            }
            pos.x = x;
            pos.y = y;
        }
        this.tipNode.rotation = kf.calculateAngleTwoPointRotation(nodePos,cc.v2(0,0));
        nodePos.normalizeSelf().mulSelf( this.node.width/2)
        pos = kf.pAdd(pos,nodePos.negSelf())
        this.node.position = pos;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
