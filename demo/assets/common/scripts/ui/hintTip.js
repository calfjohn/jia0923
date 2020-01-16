cc.Class({
    extends: cc.Component,

    properties: {
        label:cc.Node
    },
    onLoad:function(){
        this.scene = cc.find("Canvas");
        this.node.active = false;
        this.left = this.node.getComponent(cc.Layout).paddingLeft;
        this.right = this.node.getComponent(cc.Layout).paddingRight;
        this.top = this.node.getComponent(cc.Layout).paddingTop;
        this.bottom = this.node.getComponent(cc.Layout).paddingBottom;
    },

    init:function(data){
        var target = data.target;
        this.label.getComponent(cc.Label).string = uiLang.getHintMsg(target.nodeName,target.path);
        var targetPos = kf.getPositionInNode(target.node,this.scene);
        this.node.active = true;
        this.node.x = target.isInRight?targetPos.x + (target.node.width + this.label.width) * 0.5 + this.right: targetPos.x - (target.node.width + this.label.width) * 0.5 - this.left;
        this.node.y = target.isInUp?targetPos.y + (target.node.height + this.label.height) * 0.5 + this.top: targetPos.x - (target.node.height + this.label.height) * 0.5 - this.bottom;
    },
    // update (dt) {},
});
