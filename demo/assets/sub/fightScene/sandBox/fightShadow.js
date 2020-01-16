
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    setVisible(bShow){
        this.node.active = bShow;
    },

    setPosition(target){
        this.node.position = kf.getPositionInNode(target.node,this.node.parent,target.node.getPosition());
    },

    setScale:function(scale){
        this.node.scale = scale/100;
    },

    addPostion(x){
        this.node.x += x;
    },

    putInPool(){
        uiResMgr.putInPool(this.node.name,this.node);
    },

    // update (dt) {},
});
