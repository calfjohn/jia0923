cc.Class({
    extends: cc.Component,
    editor: {
        menu:"util/图标按钮Tip",
        disallowMultiple:true,
    },
    properties: {
        isInRight: {
            default: true,
            tooltip: "是否朝右边显示"
        },
        isInUp: {
            default: true,
            tooltip: "是否向上显示"
        },
    },

    onLoad:function(){
        this.node.on(cc.Node.EventType.TOUCH_END,this.onclick.bind(this));
    },

    onclick:function(){
        if(!this.path)  return console.error("未调用parseHint或者没跑脚本导入");
        var ev = new cc.Event.EventCustom('showHintTip', true);
        var data = {
            target:this,
        }
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    setPath:function(nodeName,path){
        this.nodeName = nodeName;
        this.path = path;
    },
    // update (dt) {},
});
