var panel = require("panel");

cc.Class({
    extends: panel,
    editor: {
        menu:"util/pageView滑动组件",
        requireComponent:cc.PageView,
        disallowMultiple:true,
    },
    properties: {
        interval: {
            default: 0,
            tooltip: "自动翻页间隔时间"
        },

        scrollPageTime: {
            default: 0,
            tooltip: "翻页过程持续时间"
        }
    },

    // use this for initialization
    onLoad: function () {
        this.pageViewComp = this.node.getComponent(cc.PageView);
        this.pageViewComp.content.on("touchstart", this.touchstart.bind(this), this,true);

    },
    touchstart:function(){
        this.unscheduleAllCallbacks();
        this.pageViewComp.stopAutoScroll();
    },
    pageEvent:function(comp,evenType){//在组件上绑定该行为
        if (evenType === 0) {
            this.unscheduleAllCallbacks();
            this.restartScolling();
        }
    },

    restartScolling:function(){

        var maxIdx = this.pageViewComp.getPages().length - 1;

        if (maxIdx === 0) {
            return;
        }
        this.schedule(function() {
            this.autoScrollPage(maxIdx);
        }, 3);
    },

    autoScrollPage: function(maxIdx) {
        var curIdx = this.pageViewComp.getCurrentPageIndex();
        if (curIdx+1 > maxIdx) {
            curIdx = 0;
            this.scrollToPage(curIdx);
        }else {
            this.scrollToPage(curIdx+1);
        }
    },
    scrollToPage: function(idx) {
        
        this.pageViewComp.scrollToPage(idx, this.scrollPageTime);
    },

    /**
     * 初始化pageView
     * @param list      数据列表
     * @param prefab    初始化预制
     * @param needAuto  是否需要自动翻页
     */
    initList:function(list, prefab, needAuto){
        // this.pageViewComp.removeAllPages();
        for(var i = 0; i < list.length; i++) {
            var msgItem = this.pageViewComp.content.children[i] ;
            if(!msgItem) {
                msgItem = cc.instantiate(prefab);
                this.pageViewComp.addPage(msgItem);
            }
            var script = msgItem.getComponent(prefab.name);
            if (script) {
                script.init(i, list[i]);
            }
        }
        this.unscheduleAllCallbacks();
        if(needAuto)
            this.restartScolling();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
