var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },
    onLoad: function () {
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED,this.onFinished.bind(this));
        this.startPos = cc.v2(-535,154);
        this.itemHeight = 135;
        this.aniStartPos = cc.v2(0,0);
    },
    open:function() {
        this.data = this.treasureLogic.getShowData();
        uiResMgr.loadLockTreasureBox(this.data.Icon, this.widget("getBoxAni/box"));
        this.widget("getBoxAni/box").position = this.aniStartPos;
        this.ani.play("getBox1");
    },
    onFinished:function(event,param){
        if (event !== constant.AnimationState.FINISHED || param.name !== "getBox1") return;
        var cb = cc.callFunc(function(){
            this.widget("getBoxAni/box").stopAllActions();
            this.close();
            this.treasureLogic.pushShowData();
        }.bind(this),this);
        var movePos = this.getPosByIdx(this.data.Idx);
        this.widget("getBoxAni/box").runAction(cc.sequence(cc.moveTo(1,movePos),cb));
    },
    //获取自己需要飞向得位置
    getPosByIdx:function(idx){
        var pos = cc.v2(this.startPos.x,this.startPos.y - (idx - 1) * this.itemHeight);
        return jsonTables.getPosInWorld(pos);
    },

    // update (dt) {},
});
