cc.Class({
    extends: cc.Component,

    editor: {
        menu:"util/listView搭配动画，放在Item上",
        requireComponent:cc.Animation,
        disallowMultiple:true,
    },

    properties: {
        // label:cc.Label,

    },
    resetInEditor() {
       this._setDefaultValue();
   },
   _setDefaultValue() {
       Editor.assetdb.queryAssets("db://assets/common/animation/listItemShow.anim", 'animation-clip', function (error, results) {
           if (!error) {
               if (results.length > 0) {
                   let uuid = results[0].uuid;
                   cc.AssetLibrary.loadAsset(uuid, function (error, asset) {
                       if (!error) {
                           this.node.getComponent(cc.Animation).addClip(asset);
                       }
                   }.bind(this));

               }

           }
       }.bind(this));
       Editor.assetdb.queryAssets("db://assets/common/animation/listItemOpen.anim", 'animation-clip', function (error, results) {
           if (!error) {
               if (results.length > 0) {
                   let uuid = results[0].uuid;
                   cc.AssetLibrary.loadAsset(uuid, function (error, asset) {
                       if (!error) {
                           this.node.getComponent(cc.Animation).addClip(asset);
                       }
                   }.bind(this));

               }

           }
       }.bind(this));
   },


    // use this for initialization
    onLoad: function () {
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.isPlayOpen = false;
    },

    onFinished:function (event,param) {
        if (event !== constant.AnimationState.FINISHED && param.name !== "listItemOpen") return;
        this.isPlayOpen = false;
    },

    //初始化时播放
    open:function () {
        if(this.isPlayOpen) return;
        this.ani.play("listItemOpen");
        this.isPlayOpen = true;
    },
    //滚动生成时播放
    show:function (idx) {
        this.isPlayOpen = false;
        var state = this.ani.getAnimationState("listItemShow");
        state.speed = 1 + idx * 5 / 100;
        state.speed = 1;
        this.ani.play("listItemShow");
    },
});
