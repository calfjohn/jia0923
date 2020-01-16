cc.Class({
    extends: cc.Component,

    reigeisterFunc:function(i){
        var self = this;
        (function(i){
            self["rTextFunc" + i] = function(){
                var ev = new cc.Event.EventCustom('clickItem', true);
                ev.setUserData(i);
                self.node.dispatchEvent(ev);
                // self.clickLabel(i);
            }.bind(self);
        })(i);
    },
});
