var panel = require("panel");

var moveComp = cc.Class({
    extends: panel,
    editor: {
        menu:"util/差值移动组件",
        disallowMultiple:true,
    },
    properties: {
    },

    // use this for initialization

    isMoveFlag:function(){
        return this.moveFlag;
    },
    /**
     * 外部调用
     * @param  {Objects} pos      移动量
     * @param  {回调} callBack
     * @param  {这次移动耗时} moveTime
     */
    moveNow:function(pos,callBack,moveTime){
        if (this.moveFlag) {//再次调用如果还没走完 就强制消耗
            this.update(this.moveTime);
        }
        this.disPos = pos;
        this.callBack = callBack;
        this.moveFlag = true;
        this.moveTime = moveTime;
        this.needTime = moveTime;//总时长
    },

    moveDt:function(dt){
        this.moveTime -= dt;
        this.node.x += (this.disPos.x*(dt/this.needTime));
        this.node.y += (this.disPos.y*(dt/this.needTime));
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.moveFlag) return;
        if (this.moveTime < dt) {
            this.moveDt(this.moveTime);
            this.moveFlag = false;
            if (this.callBack) {
                var cb = this.callBack;
                this.callBack = null;
                cb();
            }
        }else {
            this.moveDt(dt);
        }
    }
});
module.exports = moveComp;
