
var comTalk = cc.Class({
    extends: cc.Component,
    editor: {
        menu:"util/comTalk",
        requireComponent:cc.Label,
        disallowMultiple:true,
    },
    properties: {
        doneNode:cc.Node,//结束标识节点
    },

    // use this for initialization
    onLoad: function () {

        this.interval = 0.12;
        this.content = this.node.getComponent(cc.Label);
        this.node.active = false;
        // this.contentHeight = this.contentNode.height;
    },

    setInterval:function(iter){
        this.interval = iter;
    },

    //弹出对话框
    show: function( content, callback,isAutoDone,isDoneWithoutClose){
        this.callback = callback;
        this.content.string = "";
        this.words = content;
        this.isAutoDone = isAutoDone === undefined ? true :isAutoDone;
        this.isDoneWithoutClose = isDoneWithoutClose;
        // var stringLength = content.replace(/[\u0391-\uFFE5]/g,"aa").length;
        // this.contentNode.height = this.contentHeight + Math.ceil(stringLength / 44) * 30;
        this.node.active = true;
        if (this.doneNode) {
            this.doneNode.active = false;
        }
        //逐个输出文字
        this.index = 0;
        this.unscheduleAllCallbacks();
        this.schedule(function() {
            if (!this.words) {
                this.done(this.isAutoDone);
                return;
            }
            if (this.index > this.words.length) {
                this.done(this.isAutoDone);
                return;
            }
            this.content.string = this.words.substr(0, this.index++);
        }, this.interval);
    },

    //对话快进或者关闭窗口
    nextStep: function() {
        if (!this.node.active) return;
        if (this.words) {
            this.content.string = this.words;
            if (this.doneNode) {
                this.doneNode.active = true;
            }
            this.words = undefined;
        } else {
            this.done(true);
        }
    },

    done:function(isCall){
        this.unscheduleAllCallbacks();
        this.words = undefined;
        if (isCall) {
            if (!this.isDoneWithoutClose) {//是否结束后不隐藏
                this.close();
            }
            var cb = this.callback;
            this.callback = null;
            if (cb) cb();
        }
    },

    close:function(){
        this.node.active = false;
    },
});
module.exports = comTalk;
