var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        speed:100
    },

    // use this for initialization
    onLoad: function () {
        this.initModule();
        this.rollList = [];
        this.inRoll = false;

    },
    initModule:function(){
        this.rollLabel = this.widget("rollPanel/notice/mask/noticeText");
        this.initPos = this.rollLabel.position;
        this.showLen = this.widget("rollPanel/notice/mask").width;
    },
    open : function(list){
        if(this.inRoll){
            this.rollList.concatSelf(list);
        }else{
            this.rollList = list;
            this.roll();
        }
    },
    roll:function(){
        if(this.rollList.length === 0)  {
            this.inRoll = false;
            this.close();
            return;
        };
        var data = this.rollList.shift();
        this.inRoll = true;
        this.rollLabel.getComponent(cc.RichText).string = data.Content;
        var moveLen = this.rollLabel.width + this.showLen;
        var moveTime = moveLen / this.speed;
        var movePos = cc.v2(this.initPos.x - moveLen,this.initPos.y);
        // cc.log("1:"+movePos);
        this.rollLabel.position = this.initPos;
        this.rollLabel.stopAllActions();
        var moveAction = cc.moveTo(moveTime,movePos);
        var callback = cc.callFunc(function(){
            this.roll();
            // cc.log("2:" + this.rollLabel.position);
        }.bind(this));
        this.rollLabel.runAction(cc.sequence(moveAction,callback));
    },
    // update (dt) {},
});
