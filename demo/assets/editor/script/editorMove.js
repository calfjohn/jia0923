var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
    },

    registerEvent: function () {
        this.lastTouch = false;
        this.touchEnble(true);
    },

    touchEnble:function(enble){

        if (enble) {
            if (!this.lastTouch) {
                this.node.on("touchstart", this.touchstart,this);
                this.node.on("touchmove", this.touchmove,this);
                this.node.on("touchend", this.touchend,this);
                this.node.on("touchcancel", this.touchcancel,this);
            }
        }else {
            this.node.off("touchstart", this.touchstart,this);
            this.node.off("touchmove", this.touchmove,this);
            this.node.off("touchend", this.touchend,this);
            this.node.off("touchcancel", this.touchcancel,this);
        }
        this.lastTouch = enble;
    },

    setBindComp:function(script){
        this.script = script;
    },

    touchstart:function(event){
        event.stopPropagation();
    },
    touchmove:function(event){
        event.stopPropagation();
        var pos = event.getLocation();
        var prePos = event.getPreviousLocation();
        this.node.x += (pos.x - prePos.x);
        this.node.y += (pos.y - prePos.y);
        if (this.script) {
            this.script.moveing();
        }
    },

    touchend:function(event){
        event.stopPropagation();
        if (this.ctrl) {
            this.ctrl.data.mapPos = this.node.position;
        }
    },
    touchcancel:function(event){
        event.stopPropagation();
    },

    setContentSize:function(size){
        this.node.setContentSize(size)
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
