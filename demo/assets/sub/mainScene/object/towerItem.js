var panel = require("panel");
cc.Class({
    extends: panel,


    properties: {
        btn:cc.Node,
        chapterLabel1:cc.Label,
        // sprite:cc.Sprite,
        finger:cc.Prefab,
        headPrefab:cc.Prefab,
        unLockNode:cc.Node,
        // ringFrame:[cc.SpriteFrame]
    },
    onLoad:function () {
        this.baseChapter = 1;
        this.configuration = kf.require("util.configuration");
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.clientEvent.on("showTowerFight",this.showTowerFight.bind(this));
    },
    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED || param.name !== "towerAnimation") return;
        this.ani.play("towerAnimation1");
    },

    showFinger:function () {
        var node = this.node.getInstance(this.finger,true);
        node.position = this.btn.position;
        node.zIndex = 100;
    },

    hideFiger:function () {
        if(this.node.getChildByName("finger")){
            this.node.getChildByName("finger").active = false;
        }
    },

    init:function(chapter,nowChapter,playAni){
        if((chapter === 1 && nowChapter === 1) || (chapter === 2 && nowChapter === 2 && !this.configuration.getConfigData("clickTwo") && this.configuration.getConfigData("clickBox"))){
            this.showFinger();
        }else{
            this.hideFiger();
        }
        this.ani.stop();
        this.baseChapter = chapter;
        // var idx = chapter === nowChapter?0:1;
        this.chapterLabel1.string = this.baseChapter;
        this.isNow =  this.baseChapter === nowChapter;
        this.btn.active = this.baseChapter <= nowChapter;
        this.unLockNode.active = this.baseChapter > nowChapter;
        if(this.baseChapter < nowChapter){
            if(this.chapterLogic.getChapterState(this.baseChapter)){//未用卷轴
                this.ani.play("towerAnimation2");
            }else{//用卷轴
                this.ani.play("towerAnimation3");
            }
        }else if(this.isNow){
            if(playAni){
                
                this.scheduleOnce(function () {
                    this.ani.play("towerAnimation");
                }.bind(this),0.5);
            }else{
                this.ani.play("towerAnimation1");
            }
        }
        if(this.baseChapter === 1){
            var worldPos = this.btn.parent.convertToWorldSpaceAR(this.btn.position);
            this.guideLogic.setBaseChapterPos(worldPos);
        }
    },

    showTowerFight:function () {
        if(this.baseChapter !== 2)  return;
        if(!this.configuration.getConfigData("clickTwo")){
            this.showFinger();
        }else{
            this.hideFiger();
        }
    },

    refreshHead:function () {

    },

    clickPosStart:function(worldPos){
        if(!this.node.active)   return;
        if(this.checkClickBtn(worldPos)){
            this.btn.scale = 1.2;
        }
    },
    clickPosEnd:function(worldPos){
        if(!this.node.active)   return;
        if(this.checkClickBtn(worldPos)){
            this.btn.scale = 1;
            this.btnEvent();
        }
    },
    clickcancel:function(){
        this.btn.scale = 1;
    },
    //检测是否点击到自身
    checkClickBtn:function(pos){
      var bounding = this.btn.getBoundingBoxToWorld();
      return kf.rectContainsPoint(bounding,pos);
    },
    btnEvent:function() {
        var ev = new cc.Event.EventCustom('clickChapter', true);
        ev.setUserData(this.baseChapter);
        this.node.dispatchEvent(ev);
        if(this.baseChapter === 1 && this.guideLogic.isInGuideFlag()){
            this.clientEvent.dispatchEvent("guideAction","btnVisible",true);
        }
        if(this.baseChapter === 2 && !this.configuration.getConfigData("clickTwo")){
            this.configuration.setConfigData("clickTwo",1);
            this.configuration.save();
        }
    },
    // update (dt) {},
});
