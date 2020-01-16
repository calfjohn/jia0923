var panel = require("panel");
var touchPanel = cc.Class({
    extends: panel,

    editor: {
        menu:"util/不规则按钮组件",
        requireComponent:cc.PolygonCollider,
        disallowMultiple:true,
    },

    properties: {
        isTouchEnable: {
            default: true,
            tooltip: "是否启动点击，是调用监听函数，否则不做任何反馈 \n不过可以调用hitTest来获取点击结果"
        },
        clickEvent: {
          default:null,
          type:cc.Component.EventHandler,
          tooltip: "按钮监听监听函数",
        },
    },

    // use this for initialization
    onLoad: function () {
        this.polyBox = this.node.getComponent(cc.PolygonCollider);
        this.clickEventJs = this.clickEvent.target.getComponent(this.clickEvent.component);
        this.registerEvent();
    },
    registerEvent: function () {

        if (!this.isTouchEnable) return;//编辑器不要注册点击
        var registerHandler = [
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchcancel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    hitTest:function(pos){
        var posInNode = this.node.convertToNodeSpaceAR(pos);
        return cc.Intersection.pointInPolygon(posInNode,this.polyBox.points);
    },

    touchstart:function(event){
        event.stopPropagation();
    },
    touchmove:function(event){
        event.stopPropagation();
    },
    touchend:function(event){
        event.stopPropagation();
        var pos = event.getLocation();
        if (this.hitTest(pos)) {
            var param = [];
            this.clickEventJs[this.clickEvent.handler].apply(this.clickEventJs,param);
        }
    },
    touchcancel:function(event){
        event.stopPropagation();
    },

});
module.exports = touchPanel;
