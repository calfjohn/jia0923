var panel = require("panel");

var moveNode = cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
    },

    registerEvent: function () {

        var registerHandler = [
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchcancel.bind(this)],

        ]
        this.registerNodeEvent(registerHandler);

    },

    init:function(){
        if (this.list) {
            for (var i = 0 , len = this.list.length; i < len; i++) {
                var obj = this.list[i];
                obj.putInPool();
            }
            this.list = [];
        }
    },

    /** 初始化岛屿信息 */
    initPrefabInfo:function (info) {
        this.list = info;
        this.clickTarget = null;
    },

    hitTest:function(touchPos){
        for (var i = 0 , len = this.list.length; i < len; i++) {
            var obj = this.list[i];
            if (obj.hitTest(touchPos)) {
                return obj;
            }
        }
        return null;
    },

    touchstart:function(event){
        if (this.clickTarget) return;//屏蔽多次点击
        event.stopPropagation();
        var pos = event.getLocation();
        this.clickTarget = this.hitTest(pos);
        if (this.clickTarget) {
            this.clickTarget.touchColor();
        }
    },
    touchmove:function(event){
        event.stopPropagation();
        if (this.clickTarget) {

        }else {
            var pos = event.getLocation();
            var prePos = event.getPreviousLocation();

            var oldX = this.node.x + (pos.x - prePos.x);
            var oldY = this.node.y + (pos.y - prePos.y);
            if (Math.abs(oldX) < this.widthLimit) {
                this.node.x = oldX;
            }
            if (Math.abs(oldY) < this.heightLimit) {
                this.node.y = oldY;
            }
        }
    },
    touchend:function(event){
        event.stopPropagation();
        var pos = event.getLocation();
        var clickTarget = this.hitTest(pos);
        if (this.clickTarget) {
            this.clickTarget.touchUnColor();
            if (clickTarget === this.clickTarget) {
                clickTarget.touchend();
            }
        }
        this.clickTarget = null;
    },
    touchcancel:function(event){
        event.stopPropagation();
        if (this.clickTarget) {
            this.clickTarget.touchUnColor();
        }
        this.clickTarget = null;
    },

    setContentSize(size){
        this.node.position = cc.v2(0,0);
        this.node.setContentSize(size);
        this.widthLimit = (size.width-cc.winSize.width)/2;
        this.heightLimit =( size.height-cc.winSize.height)/2;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
module.exports = moveNode;
