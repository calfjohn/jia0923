cc.Class({
    extends: cc.Component,

    editor: {
        menu:"util/选中红点位置",//.....
        disallowMultiple:true,//
    },

    properties: {
        // label:cc.Label,

        selectPos: {
            default: cc.v2(0,0),
            tooltip: "选中时的位置"
        },
        unselectPos: {
            default: cc.v2(0,0),
            tooltip: "未选中的位置"
        },
        redNode: {
            default: null,
            type:cc.Node,
            tooltip: "红点节点"
        },
        dependNode:{
            default: null,
            type:cc.Node,
            tooltip: "依赖节点"
        },
    },
    // use this for initialization
    onLoad: function () {
        if (this.dependNode) {
            this.dependNode.on('active-in-hierarchy-changed', this.toggle.bind(this), this);
        }
    },

    toggle:function (event) {
        if (this.redNode) {
            this.redNode.position = this.dependNode.active ? this.selectPos:this.unselectPos;
        }
    },

});
