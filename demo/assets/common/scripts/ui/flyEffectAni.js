var panel = require("panel");

cc.Class({
    extends: panel,
    editor: {
        menu:"util/flyEffectAni",
        requireComponent:cc.Animation,
        disallowMultiple:true,
    },

    properties: {
        // label:cc.Label,
        type:0,
    },
    resetInEditor() {
       this._setDefaultValue();
   },
   _setDefaultValue() {
       Editor.assetdb.queryAssets("db://assets/common/animation/iconEffect.anim", 'animation-clip', function (error, results) {
           if (!error) {
               if (results.length > 0) {
                   let uuid = results[0].uuid;
                   cc.AssetLibrary.loadAsset(uuid, function (error, asset) {
                       if (!error) {
                           this.node.getComponent(cc.Animation).defaultClip = asset;
                       }
                   }.bind(this));
               }
           }
       }.bind(this));
   },


    // use this for initialization
    onLoad: function () {
        if (this.initFlag) return;
        this.ani = this.node.getComponent(cc.Animation);
        // this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);.
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["showFlyEffectAni", this.showFlyEffectAni.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    //物品类型
    showFlyEffectAni:function(type){
        if(this.type !== type)  return;
        this.ani.play();
    },
    // onFinished: function (event) {
    //     if (event.type !== constant.AnimationState.FINISHED) return;
    //
    // },
    //faith 目标量


});
