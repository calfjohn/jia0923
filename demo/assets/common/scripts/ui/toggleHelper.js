cc.Class({
    extends: cc.Component,

    editor: {
        menu:"util/toggleHelper",
        requireComponent:cc.ToggleContainer,
        disallowMultiple:true,
    },

    properties: {
        labelName: {
            default: "label",
            tooltip: "子节点中，文本节点的名字"
        },
        clickColor: {
            default: cc.color("#FFFAEE"),
            tooltip: "选中颜色"
        },
        unClickColor: {
            default: cc.color("#6472A7"),
            tooltip: "未选择颜色"
        },
        clickOutLineColor: {
            default: cc.color("#FFFAEE"),
            tooltip: "选中描边颜色颜色"
        },
        unClickOutLineColor: {
            default: cc.color("#6472A7"),
            tooltip: "未选择描边颜色"
        },
        clickPos: {
            default: cc.v2(0,0),
            tooltip: "选中时文本的位置"
        },
        unClickPos: {
            default: cc.v2(0,0),
            tooltip: "未选中时文本的位置"
        },
        isOnEnbleReset: {
            default: true,
            tooltip: "是否重置"
        },
        toggleFunc: {
          default:null,
          type:cc.Component.EventHandler,
          tooltip: "按钮函数,函数接收的customEventData会根据顺序依次传递0-max",
        },
    },

    // use this for initialization
    onLoad: function () {
        this.resetChild();
    },

    resetChild:function(){
        this.containerComp = this.node.getComponent(cc.ToggleContainer);

        // var self = this;
        // this.containerComp.updateToggles = function (toggle) {
        //     this.toggleItems.forEach(function (item) {
        //         var labels = item.node.getComponentsInChildren(cc.Label);
        //         for (var i = 0; i < labels.length; i++) {
        //             if (labels[i].node.name !== self.labelName) continue;
        //             labels[i].node.color = item !== toggle ? self.unClickColor:self.clickColor;
        //             labels[i].node.position = item !== toggle ?self.unClickPos:self.clickPos;
        //             var outLineComp = labels[i].node.getComponent(cc.LabelOutline);
        //             if (outLineComp) {
        //                 outLineComp.color = item !== toggle ? self.unClickOutLineColor:self.clickOutLineColor;
        //             }
        //         }
        //         if (toggle.isChecked && item !== toggle) {
        //             // item.isChecked = false;
        //         }
        //     });
        // }.bind(this.containerComp);
        var startNum = 0;
        try {
            startNum = Number(this.toggleFunc.customEventData);
        } catch (e) {
            cc.error(e);
            startNum = 0;
        }
        for (var i = 0; i < this.containerComp.toggleItems.length; i++) {
            this.containerComp.toggleItems[i].checkEvents = [];
            var clickHadnder = new cc.Component.EventHandler();
             clickHadnder.target = this.toggleFunc.target; //这个 node 节点是你的事件处理代码组件所属的节点
             clickHadnder.component = this.toggleFunc.component || this.toggleFunc._componentName;//这个是代码文件名
             clickHadnder.handler = this.toggleFunc.handler;//接收时间处理的方法
             clickHadnder.customEventData = startNum + i;
             this.containerComp.toggleItems[i].checkEvents.push(clickHadnder);
        }
    },

    onEnable: function () {
        if (!this.isOnEnbleReset) return;
        this.setIdxToggleCheck(0);
    },
    /**
     * 设置某一个子组件被选中
     * @param  {int} idx 在toggleitems排序下标
     */
    setIdxToggleCheck:function(idx){
        if (!this.containerComp || !this.containerComp.toggleItems[idx]) return;
        this.containerComp.toggleItems[idx].isChecked = true;
        this.containerComp.updateToggles(this.containerComp.toggleItems[idx]);
    },

    cancleClick:function(){
        for (var i = 0; i < this.containerComp.toggleItems.length; i++) {
            this.containerComp.toggleItems[i].isChecked = false;
        }
    },

});
