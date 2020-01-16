var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        showTipTime:2,
    },

    // use this for initialization
    onLoad: function () {
        this.tag = -1;
        var registerHandler = [
            ["guideFirstExcell", this.showFirstExcellent.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    showFirstExcellent:function (pos) {
        this.node.children[0].active = true;
        this.node.children[0].position = pos;
        this.scheduleOnce(function () {
            this.node.active = false;
        },this.showTipTime);//
    },
    init:function(tag){
        this.unscheduleAllCallbacks();
        if (this.tag === 0) {
            this.node.children[0].active = false;
        }
        this.tag = tag;
        for (var i = 0 , len = this.node.children.length; i <  len; i++) {
            var obj = this.node.children[i];
            obj.active = i === tag;
        }
        if (tag === 0) {
            this.node.children[0].active = false;
        }

    },

    getTag:function(){
        return this.tag
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
