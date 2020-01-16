cc.Class({
    extends: cc.Component,

    editor: {
        menu:"util/scaleAni",
        requireComponent:cc.Animation,
        disallowMultiple:true,
    },

    properties: {
        // label:cc.Label,
        curCount: {     //隐藏
           default: 0,
           visible: false
        },
        bombCount: {
            default: 8,
            tooltip: "数值变化的时候 跳跃次数"
        },
        _initFlag:true,
    },
    resetInEditor() {
       this._setDefaultValue();
   },
   _setDefaultValue() {
       Editor.assetdb.queryAssets("db://assets/common/animation/numScale.anim", 'animation-clip', function (error, results) {
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
        this.initFlag = true;
        this.label = this.node.getComponent(cc.Label);
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.realCount = this.bombCount;
    },

    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.curCount += this.addcurCount;
        if ((this.addcurCount >= 0 && this.curCount >= this.targetFaith) || (this.addcurCount <= 0 && this.curCount <= this.targetFaith)) {
            this.curCount = this.targetFaith;
            if(!this.noScale){
                this.node.runAction(cc.scaleTo(0.3,1));
            }
        }else {
            this.ani.play();
        }
        this.label.string = this.noDeal?this.curCount : NP.dealNum(this.curCount,constant.NumType.MILLION);
    },
    //faith 目标量
    init:function(faith,refreshNow,count,noDeal,noScale){
        if (!this.initFlag) {//
            this.onLoad();
        }
        this.noDeal = noDeal;
        this.noScale = noScale;
        var off = faith - this.curCount;
        if (this._initFlag || off === 0 || refreshNow) {//登陆时 不需要表现
            this._initFlag = false;
            this.targetFaith = faith;
            this.curCount = this.targetFaith;
            this.label.string = this.noDeal?this.curCount : NP.dealNum(this.curCount,constant.NumType.MILLION);
            return;
        }
        this.realCount = count? count : this.bombCount;
        this.ani.stop();
        this.curCount = this.targetFaith;
        this.targetFaith = faith;
        this.addcurCount = Math.ceil(Math.abs(off)/this.realCount);
        this.addcurCount = off > 0 ? this.addcurCount:-this.addcurCount;
        this.ani.play();
        this.label.string = this.noDeal?this.curCount : NP.dealNum(this.curCount,constant.NumType.MILLION);
        if(!this.noScale){
            this.node.runAction(cc.scaleTo(0.3,1.5));
        }
    },

});
