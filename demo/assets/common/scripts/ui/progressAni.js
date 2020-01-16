cc.Class({
    extends: cc.Component,

    editor: {
      menu:"util/progress",
      requireComponent:cc.ProgressBar,
      disallowMultiple:true,
    },

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.progressComp = this.node.getComponent(cc.ProgressBar);
    },
    /**
     * 入口函数设置基础数据
     * @param  {int} costTime [花费总时长 必须参数]
     * @param  {int} interval [刷新间隔 选填]缺省为0.1
     * @param  {function} callBack [完成回调 选填] 缺省为空函数
     * @param  {int} curProgress [当前进度 选填] 缺省为0
     * @param  {int} allProgress [总进度 选填] 缺省为1.
     * @param  {function} progressCb [进度跑回调 选填] 缺省为空函数
     * @param  {int} tag [下标] 回传给回调函数，用于区分不同进度条.缺省为0；
     */
    setData:function(data){
        if (this.dataReady === true) {//如果处于播放状态，则只重置播放间隔与回调函数
            this.costTime = data.costTime || 0.3;
            this.interval = data.interval || 0.1;
            this.allProgress = data.allProgress || 0;
            this.tag = data.tag|| 0 ;
            this._resetAddProgress();
            if (data.callBack)
                this.fullCallBack = data.callBack;
            return;
        }

        this.curProgress = data.curProgress || 0;
        this.allProgress = data.allProgress || 0;
        if (this.allProgress > 1)
            this.allProgress = 1;
        if(this.allProgress < 0 ){
            this.allProgress = 0;
        }
        this.costTime = data.costTime || 0.3;
        this.interval = data.interval || 0.1;
        this.tag = data.tag|| 0 ;
        this.fullCallBack = data.callBack || function(){};
        this.progressCb = data.progressCb || function(){};
        this._resetProgress();
        this.dataReady = true;
        this._resetAddProgress();
    },

    _resetAddProgress:function(){
        this.addProgress = (this.allProgress - this.curProgress)/this.costTime * this.interval;
        this.duration = 0;
        if(this.addProgress === 0){//出现错误情况了，防止死循环
            this.dataReady = false;
            if (this.fullCallBack) {
                var cb = this.fullCallBack;
                this.fullCallBack = function(){};
                cb(this.tag);
            }
        }
    },

    setProgress:function (pro) {
        this.progressComp.progress = pro;
    },

    _resetProgress:function(){
        this.progressComp.progress = this.curProgress;
    },
    // called every frame, uncomment this function to activate update callBack
    update: function (dt) {
        if (!this.dataReady) return;
        this.duration += dt;
        if (this.duration < this.interval) return;
        this.duration = 0;
        if(this.addProgress >= 0){
            this.curProgress = this.curProgress + this.addProgress >= this.allProgress?this.allProgress:this.curProgress + this.addProgress;
        }else{
            this.curProgress = this.curProgress + this.addProgress <= this.allProgress?this.allProgress:this.curProgress + this.addProgress;
        }
        this._resetProgress();
        if (this.progressCb) {
            this.progressCb(this.curProgress,this.addProgress);
        }
        if ((this.addProgress < 0 && this.curProgress <= this.allProgress) || (this.addProgress >= 0 && this.curProgress >= this.allProgress)) {
            this.dataReady = false;
            if (this.fullCallBack) {
                var cb = this.fullCallBack;
                this.fullCallBack = function(){};
                cb(this.tag);
            }
        }
    },
});
