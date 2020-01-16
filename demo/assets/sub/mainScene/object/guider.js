var panel = require("panel");
var comTalk = require("comTalk");
cc.Class({
    extends: panel,

    properties: {
        lockAniPrefab:cc.Prefab,
        bornArrayPrefab:cc.Prefab,
        guiderKeyLight:cc.Prefab,
        comTalk:comTalk,
        spine:sp.Skeleton,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.count = 0;
    },

    getBornArrayPrefab:function(){
        return this.bornArrayPrefab;
    },

    getLockAniPrefab:function(){
        return this.lockAniPrefab;
    },

    addBindLight:function(){
        var node = this.node.getInstance(this.guiderKeyLight,true);
        node.y = this.spine.skeletonData.skeletonJson.skeleton.height;
        node.active = false;
    },

    activeBindLight:function(active){
         this.node.getInstance(this.guiderKeyLight,active);
    },

    jump:function(time,endPos,callBack){
        this._move("jump",time,endPos,callBack);
    },

    //带上移动动画
    move:function(time,endPos,callBack,speedMode){
        this._move("walk",time,endPos,callBack,speedMode);
    },

    _move:function(spineAniName,time,endPos,callBack,speedMode){
        var isRight = endPos.x - this.node.x > 0 ? true : false;
        this.setMoveDir(isRight);
        this.spine.setAnimation(0,spineAniName,true);
        var call2 = function(){
            this.spine.setAnimation(0,'std',true);
            callBack();
        }.bind(this)
        this.node.stopAllActions();
        var call = cc.callFunc(function(){
            call2();
        },this)
        var move = null;
        if (spineAniName === "walk") {
            move = cc.moveTo(time,endPos);
            if (speedMode) {
                move = this.guideLogic.speedAction(move,speedMode);
            }
        }else {
            move =cc.jumpTo(time,endPos,100,1);
        }

        var sequence = cc.sequence(move,call);
        this.node.runAction(sequence);
    },

    setDir:function(isRight,isTalkRight){
        this.node.scaleX = isRight ? 1:-1;
        if (isTalkRight !== undefined) {
            this.widget('guider/talk/label').scaleX = isTalkRight ? 1:-1;
        }
    },

    setMoveDir:function(isRight){
        this.setDir(isRight,isRight);
    },

    setTalkFrameVisible:function(visible){
        this.comTalk.node.parent.active = visible;
    },

    swichAction:function(from,to,time){
        this.spine.setAnimation(0,from,true);
        setTimeout(function () {
            this.spine.setAnimation(0,to,true);
        }.bind(this),time*1000);
    },

    /** 人物对话 */
    showTalk:function(content,cb,isAutoClose,delay){
        this.count = 0;
        this.unscheduleAllCallbacks();
        isAutoClose = isAutoClose === undefined ? true:isAutoClose;
        delay = delay || 0.1;
        var call = function(){
            if (isAutoClose) {
                this.scheduleOnce(function(){
                    this.comTalk.node.parent.active = false;
                    cb();
                },delay);
            }else {
                cb();
            }
        }.bind(this)
        this.comTalk.node.parent.active = true;
        this.comTalk.interval = 0.1;
        this.comTalk.show(content,call,true,true);
    },

    touchCount:function(){
        this.count++;
        if (this.comTalk.node.parent.active) return;
        if (this.count > this.guideLogic.config[jsonTables.CONFIG_GUIDE.ClickTime]) {
            var str = uiLang.getConfigTxt(this.guideLogic.config[jsonTables.CONFIG_GUIDE.ClickDialogue]);
            this.showTalk(str,function(){});
            this.count = 0;
        }
    },

    showTalkNow:function(content,time,cb){
        this.unscheduleAllCallbacks();
        this.comTalk.unscheduleAllCallbacks();
        if (time) {
            this.scheduleOnce(function(){
                this.comTalk.node.parent.active = false;
                if (cb) cb();
            },time)
        }
        this.comTalk.node.parent.active = true;
        this.comTalk.node.active = true;
        this.comTalk.content.string = content;
    },

    showNowDelay:function(content,cb,delay){
        this.unscheduleAllCallbacks();
        this.comTalk.unscheduleAllCallbacks();
        this.comTalk.node.parent.active = true;
        this.comTalk.node.active = true;
        this.comTalk.content.string = content;
        if (cb) {
            this.scheduleOnce(function(){
                cb();
            },delay)
        }
    },

    hideComTalk:function(){
        this.comTalk.node.parent.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
