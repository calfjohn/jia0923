//这个脚本用来保证关联节点不被切换场景时销毁
cc.Class({
    extends: cc.Component,

    properties: {
        audioSource:cc.AudioSource,
        messagePrefab:cc.Prefab,
        tipMessagePrefab:cc.Prefab,
        waitingPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        cc.game.addPersistRootNode(this.node);

        // 开启帧率限制和显示
        cc.game.setFrameRate(60);
        cc.debug.setDisplayStats( false );
        //启动预加载
        this.preloadLogic = kf.require("logic.preload");
        this.preloadLogic.fitScreen();
        this.timeLogic = kf.require("logic.time");
        this.configuration = kf.require("util.configuration");
        this.guide = kf.require("logic.guide");
        //特别注意通用预制件的加载顺序，和显示层级相关
        var item;
        var firstScene = cc.director.getScene();
        item = cc.instantiate(this.messagePrefab);
        firstScene.addChild(item);
        item = cc.instantiate(this.tipMessagePrefab);
        firstScene.addChild(item);
        item = cc.instantiate(this.waitingPrefab);
        firstScene.addChild(item);

        this.audioEffects = cc.js.createMap();
        this.maxSimpleAudio = 5;
        this.registerModule();
    },

    onDestroy:function(){
        uiResMgr.releasePool();
    },

    registerModule:function(){
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);//添加键盘监听
        //hackBtn
        window["basic"]["overWrite"].hackButton(function(){
            this.playAudioEffect(constant.AudioID.BTNCLICK);
        }.bind(this));
        this.registerEvent();
        this._resetVoide();
        this.playBgMusice(constant.AudioID.MAIN_BG);

        var self = this;
        if (cc.sys.isNative) {
            let __handler
            if (window['__errorHandler']) {
                __handler = window['__errorHandler']
            }
            window['__errorHandler'] = function (...args) {
                console.log('游戏报错,原生系统',arguments[0]+"->",arguments[1]+"->",arguments[2])
                self.handleError("native",arguments[0],arguments[1],arguments[2],arguments[3])
                if (__handler) {
                    __handler(...args)
                }
            }
        }

        if (cc.sys.isBrowser) {
            let __handler;
            if (window.onerror) {
                __handler = window.onerror
            }
            window.onerror = function (...args) {
                console.log('游戏报错,浏览器',arguments[0]+"->",arguments[1]+"->",arguments[2])
                self.handleError("browser",arguments[0],arguments[1],arguments[2],arguments[3])
                if (__handler) {
                    __handler(...args)
                }
            }
        }
    },

    _resetVoide:function(){
        this.bgVolume = this.configuration.getConfigData("bgVolume");
        if (!this.bgVolume && this.bgVolume !== constant.SettingStatus.CLOSE) {
            this.bgVolume = constant.SettingStatus.OPEN;
        }
        this.effecVolume =  this.configuration.getConfigData("effectVolume");
        if (!this.effecVolume && this.effecVolume !== constant.SettingStatus.CLOSE) {
            this.effecVolume = constant.SettingStatus.OPEN;
        }
    },

    resetVoide:function(){
        this._resetVoide();
        this.updateVolume(this.bgVolume,this.effecVolume);
    },

    handleError:function(platform,reason,filePath,row,col){
        var info = "platform:"+platform+"|reason:"+reason+"|filePath:"+filePath+"|row:"+row +"|col:"+col;
        kf.require("logic.user").feedBackServer(info,1);
    },

    registerEvent: function () {
        this.clientEvent = kf.require("basic.clientEvent");
        this.registerHandler = [
            ["resetVoide", this.resetVoide.bind(this)],
            ["playBgMusice", this.playBgMusice.bind(this)],
            ["parseMusic", this.parseMusic.bind(this)],
            ["playAudioEffect", this.playAudioEffect.bind(this)],
            ["updateVolume", this.updateVolume.bind(this)],
        ];

        for(var i = 0; i < this.registerHandler.length; i++){
            var handler = this.registerHandler[i];
            this.clientEvent.registerEvent(handler[0], handler[1]);
        }
    },
    unregisterEvent: function () {
        for(var i = 0; i < this.registerHandler.length; i++){
            var handler = this.registerHandler[i];
            this.clientEvent.unregisterEvent(handler[0], handler[1]);
        }
    },
    onDestroy: function () {
        this.unregisterEvent();
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    playBgMusice:function(audioID){
        if (!this.audioSource) return;
        if (this.curMusicID === audioID) return;
        this.curMusicID = audioID;

        if(!jsonTables.TABLE){//未加载子包
            uiResMgr._loadAudio(uiResMgr.RTYPE.AUDIO,"bg",function(clip){
                var audio = cc.audioEngine.play(clip, false, this.effecVolume);
                this.audioEffects[audioID]++;
                cc.audioEngine.setFinishCallback(audio, function () {
                    this.audioEffects[audioID]--;
                }.bind(this));
            }.bind(this));
        }else{
            uiResMgr.loadAudio(audioID,function(clip){
                if (!cc.isValid(this.audioSource)) return;
                if (this.audioSource.isPlaying) {
                    this.audioSource.stop();
                }
                this.audioSource.clip = clip;
                this.audioSource.loop = true;
                this.audioSource.volume = this.bgVolume;
                if (this.bgVolume !== constant.SettingStatus.OPEN) {
                    this.audioSource.pause();
                }else {
                    this.audioSource.play();
                }
            }.bind(this));
        }
    },

    playAudioEffect:function(audioID){
        if (this.effecVolume === constant.SettingStatus.CLOSE) return;
        this.audioEffects[audioID] = this.audioEffects[audioID] || 0;
        if (this.audioEffects[audioID] > this.maxSimpleAudio) return //cc.log("audio max");
        if(!jsonTables.TABLE)   return;//未加载子包{
        uiResMgr.loadAudio(audioID,function(clip){
            var audio = cc.audioEngine.play(clip, false, this.effecVolume);
            this.audioEffects[audioID]++;
            cc.audioEngine.setFinishCallback(audio, function () {
                this.audioEffects[audioID]--;
            }.bind(this));
        }.bind(this));

    },
    updateVolume: function (bgVolume, effectVolume) {
        if (bgVolume !== undefined) {
          this.bgVolume =  bgVolume;
        }
        if (effectVolume !== undefined) {
          this.effecVolume =  effectVolume;
        }
        if (this.bgVolume !== constant.SettingStatus.OPEN && this.audioSource.isPlaying) {
          this.audioSource.pause();
      }else if(this.bgVolume === constant.SettingStatus.OPEN &&!this.audioSource.isPlaying) {
          this.audioSource.resume();
          this.audioSource.volume = this.bgVolume;
      }else{
          this.audioSource.volume = this.bgVolume;
      }
        // cc.log("music:"+ this.bgVolume +" effect:"+ this.effecVolume);
        this.configuration.setConfigData("bgVolume", this.bgVolume);
        this.configuration.setConfigData("effectVolume", this.effecVolume);
        this.configuration.save();
    },
    parseMusic: function () {
        this.audioSource.pause();
    },
    onKeyDown: function (event) {
        if (event.keyCode !== cc.KEY.back) return;//只监听 返回键//
        if(this.guide.isInGuideFlag()){//处在新手引导中
            return;
        }
        if(!this.preloadLogic.getListenReturn()){
            return;
        }
        if (uiManager.getUIActive(uiManager.UIID.MSG)) {
            uiManager.callUiFunc(uiManager.UIID.MSG,"closeForExitBtn");
            return;
        }
        if (uiManager.closeTopPanel()) {
            return;
        }
        if (uiManager.getCurSceneID() === constant.SceneID.FIGHT) {
            var node = cc.find("Canvas/sceneRoot/fightScene");
            if (node) {
                var script = node.getComponent("fightScene");
                script.backEvent();
                return;
            }
        }
        var msg = uiLang.get("exitGameWarnTip");
        var callBack = function () {
            kf.require("logic.login").exitGame();
            cc.audioEngine.stopAll();
            if (cc.sys.isNative) {
                cc.director.pause();
                cc.director.end();
            }else {
                cc.game.end();
            }
        }.bind(this);
        var message = {
            "message":  msg,
            "button1":{
                "name": uiLang.getMessage("b", "MBCANCEL"),
                "callback": function(){}
            },
            "button3":{
                "name": uiLang.getMessage("b", "MBOK"),
                "callback":callBack
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.heartbeatUtil) {
          this.heartbeatUtil = kf.require("basic.heartbeat");
        }
        this.heartbeatUtil.checkNetwork(dt);
    }
});
