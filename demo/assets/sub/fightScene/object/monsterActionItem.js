var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        endLightPrefab:cc.Prefab,
        ballNode:cc.Node,
        bornMoveTime: {
            default: 0.5,
            tooltip: "出生时候的移动间隔"
        },
        hitRotaCount: {
            default: 3,
            tooltip: "顶出去转的圈数"
        },
        bezierStarta: {
            default: 0.25,
            tooltip: "曲线起始系数a"
        },
        bezierStartb: {
            default: 0.75,
            tooltip: "曲线起始系数b"
        },
    },

    // use this for initialization
    onLoad: function () {
        this.spineHeight = 0;
    },

    init:function(tid){
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var callBack = function(spineData){
            this.spine.skeletonData  = spineData;
            this.spineHeight = spineData.skeletonJson.skeleton.height;// NOTE: spine动画的高度
            this.ballNode.y = this.spine.node.y + this.spineHeight/2;
            this.ballNode.scale = this.spineHeight / this.ballNode.height * 1.5;
            this.spine.setAnimation(0,'std',true);
        }.bind(this);
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadSpine(spineName,callBack);
        this.spine.node.scale = config[jsonTables.CONFIG_MONSTER.CombatScale]/100;
    },

    /** 从沙盘上下来 */
    setBornMoveAction:function(startPos,endPos,callBack){
        this.node.setPosition(startPos);
        this.node.stopAllActions();
        this.spine.node.opacity = 255;
        this.node.getInstance(this.endLightPrefab,false);
        var call = cc.callFunc(function(){
            callBack();
            this.showStarAni();
        },this)
        var move = cc.moveTo((this.bornMoveTime),endPos);
        var sequence = cc.sequence(move,call);
        this.node.runAction(sequence);
    },

    /** 特殊怪物产生动画 */
    bornForSpecailPath:function(type,startPos,endPos,callBack){
        switch (type) {
            case tb.SAND_MONSTER_ONEEYE://独眼怪
            case tb.SAND_MONSTER_CATAPULT://投石车
                this._doOneEyeBornAction(startPos,endPos,callBack);
                break;
        }
    },

    /** 做一下 被击飞 移动动画 */
    _doOneEyeBornAction:function(startPos,endPos,callBack){
        this.spine.node.opacity = 255;
        this.node.setPosition(startPos);
        this.node.stopAllActions();
        this.node.getInstance(this.endLightPrefab,false);

        this.spine.node.y -= this.spineHeight/2;
        var call = cc.callFunc(function(){
            this.spine.node.y += this.spineHeight/2;
            callBack();
            this.showStarAni();
        },this)
        var sequence = uiManager.doBezierTo(startPos,endPos,this.bornMoveTime,this.hitRotaCount,call);
        this.node.runAction(sequence);
    },

    showStarAni:function(){
        this.spine.node.opacity = 0;
        var node = this.node.getInstance(this.endLightPrefab,true);
        node.y = this.spineHeight / 2;
        var ani = node.getComponent(cc.Animation);
        ani.playAdditive(ani.defaultClip.name).once(constant.AnimationState.FINISHED, function () {
            this.putInPool();
        }.bind(this), this);
    },

    putInPool:function(){
        this.node.stopAllActions();
        uiResMgr.putInPool(this.node.name,this.node);
    },

    forcePut:function(){
        this.putInPool();
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
