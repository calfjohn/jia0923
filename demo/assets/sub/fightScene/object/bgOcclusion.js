var panel = require("panel");

var bgOcclusion = cc.Class({
    extends: panel,

    properties: {
        bgContentPrefab:cc.Prefab,
        moveTime:0.5,
    },

    // use this for initialization
    onLoad: function () {
        this.list = [];
        this.moveTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BackGroundSpeed);
        this.init();
    },
    init:function(){
        var node = cc.instantiate(this.bgContentPrefab);
        node.parent = this.node;
        this.list.push(node);
        var node = cc.instantiate(this.bgContentPrefab);
        node.parent = this.node;
        this.list.push(node);
        this.resetList();
    },

    _loadBg:function(){// TODO: 加载不同场景背景文件
        var tid = this.fightLogic.getFightSceneBg();
        this._loadBGNow(tid);
    },

    _loadBGNow:function(tid){
        if (!tid) return;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.SCENERESOURCE,tid);
        if (!config) return;
        for (var i = 0 , len = this.list.length; i <  len; i++) {
            var node = this.list[i].getChildByName("occlusion");
            var data = config[jsonTables.CONFIG_SCENERESOURCE.Occlusion];
            if (data === "-") {
                node.getComponent(cc.Sprite).spriteFrame = null;
            }else {
                uiResMgr.loadSceneBg(data,node);
            }
        }
    },

    //重置
    resetList:function(){
        if(!this.list) return;
        this._loadBg();
        var width = this.node.width;
        // cc.size(width,this.node.height)
        this.list[0].setContentSize(this.node.getContentSize());
        this.list[0].setPosition(cc.v2(0,0));
        this.callSelfWidget(this.list[0]);

        this.list[1].setContentSize(this.node.getContentSize());
        this.callSelfWidget(this.list[1]);
        this.scheduleOnce(function(){
            this.list[1].setPosition(cc.v2(this.list[0].width,0));
        },0);
    },

    callSelfWidget:function(node){
        var list = node.children
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var comp = obj.getComponent(cc.Widget)
            if (comp) {
                comp.updateAlignment();
            }
        }
    },

    callSceneMove:function(callBack){
        this.count = 0;
        var actionDone = function () {
            this.count ++;
            if (this.count === this.list.length) {
                if (callBack) {
                    callBack();
                }
            }
        }.bind(this);
        this.doMove(this.list[0],actionDone);
        this.doMove(this.list[1],actionDone);
    },

    doMove:function(node,callBack){
        var x = 0;
        if (node.x < 0) {
            node.x = node.width;
        }else if (node.x > 0) {

        }else {
            x = -node.width;
        }
        var callFunc = cc.callFunc(function(){
            node.position = cc.v2(x,0);
            callBack();
        }.bind(this),this);
        var time = jsonTables.accDuration(this.moveTime);
        var seq = cc.sequence(cc.moveTo(time,cc.v2(x,0)),callFunc);
        node.runAction(seq);
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});

module.exports = bgOcclusion;
