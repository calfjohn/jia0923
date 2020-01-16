var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        sceneRoot:cc.Node,
        loadingPrefab:cc.Prefab,
        miniBg:cc.Node,
        logoPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.isEditor = false;
        this.registerEvent();
        this.sceneContainer = {};//用于存储所有的场景节点索引
        this.curSceneID = constant.SceneID.NONE;
        this.isInAsync = false;
        this.isInit = true;
        this.loadingScript = null;
    },

    start:function(){
        if(!this.sceneContainer){
            this.onLoad();
        }
        // var node = this.node.getInstance(this.logoPrefab,true);
        this._fadeDone();
        // node.getComponent(this.logoPrefab.name).startFade(this._fadeDone.bind(this));
    },

    _fadeDone:function(){
        if (this.shareLogic.isEnterGameScene()) {//如果是裂变来玩小游戏的
            this.isInit = false;
            this.shareLogic.loginFromShare();
        }else{
            this._loadScene(constant.SceneID.LOGIN);
        }
    },

    registerEvent: function () {

        var registerHandler = [
            ["loadScene", this._loadScene.bind(this)],
            ["releaseScene", this._releaseScene.bind(this)],
            ["setSceneVisible", this.setSceneVisible.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["loadScene", this.loadScene.bind(this)],
            ["showHintTip",this.showHintTip.bind(this)],
            ["closeMiniBg",this.closeMiniBg.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
        // NOTE: 可以使用捕获的机制 来做点击合法判断
    },

    closeMiniBg:function(event){
        event.stopPropagation();
        setTimeout(function () {
            if (cc.isValid(this.miniBg)) {
                this.miniBg.active = false;
            }
        }.bind(this), 10000);
    },

    showHintTip:function(event){
        event.stopPropagation();
        // var data = event.getUserData();
        // if(!this.hintTipJS){
        //     uiResMgr.newPrefabInstance("hintTip",function(prefab){
        //         this.hintTip = this.node.getInstance(prefab,true);
        //         this.hintTip.setLocalZOrderEx(300);
        //         this.hintTipJS = this.hintTip.getComponent(this.hintTip.name);
        //         this._showHintTip(data);
        //     }.bind(this));
        // }
        // this._showHintTip(data);
    },
    _showHintTip:function(data){
        // if (!this.hintTipJS) return;
        // this.hintTipJS.init(data);
        // this.node.once(cc.Node.EventType.TOUCH_END , function(event){
        //        this.hintTip.active = false;
        //  }, this,true);
    },

    setSceneVisible:function(bShow){
        if (this.sceneContainer[this.curSceneID].node && this.sceneContainer[this.curSceneID].node.active !== bShow) {
            this.sceneContainer[this.curSceneID].node.active = bShow;
            var funcName = bShow ? "show":"hide";
            if(this.sceneContainer[this.curSceneID].ctrlScript[funcName]){//场景界面显隐
                 this.sceneContainer[this.curSceneID].ctrlScript[funcName]();
            }
        }
    },

    loadScene:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        this._loadScene(data.sceneID,data.param,data.loadCallBack,data.isReleaseLastOne);
    },
    _loadScene:function(sceneID,param,cb,isReleaseLastOne){
        if (this.curSceneID === sceneID) return;//已在当前场景 不处理
        if (this.isInAsync) return;//已经在异步加载场景 不要重复
        if (!this.isInit && (!this.loadingScript || !this.loadingScript.isValid)) {//初次进来不要加载loading
            var node = this.node.getInstance(this.loadingPrefab,true);
            node.setLocalZOrderEx(200);
            this.loadingScript = node.getComponent(this.loadingPrefab.name);
        }else {
            this.isInit = false;
        }
        if (this.loadingScript) this.loadingScript.show(sceneID);
        this._loadSceneNow(sceneID,param,cb,isReleaseLastOne);
    },

    _loadSceneNow:function(sceneID,param,cb,isReleaseLastOne){
        if (!this.sceneContainer[sceneID]) {
            this._loadScenePrefab(sceneID,param,cb,isReleaseLastOne);
            return;
        }
        if (this.curSceneID === sceneID) return;//同场景切个鬼啊
        if (this.curSceneID !== constant.SceneID.NONE) {
            this.sceneContainer[this.curSceneID].node.active = false;//先把旧的场景关掉
        }
        var lastScene = this.curSceneID;
        this.curSceneID = sceneID;
        uiManager.setCurSceneID(sceneID);
        this.clientEvent.dispatchEvent("updateRedBag");
        uiManager.closeAllUI();//切换场景 默认关闭所有ui界面
        this.sceneContainer[this.curSceneID].node.active = true;//开启新的场景

        var callBack = function(){
            var comp = this.sceneContainer[this.curSceneID].ctrlScript;
            if (comp && comp.enterScene) {
                param = param || [];
                comp.enterScene.apply(comp,param);
            }
            if (cb) {
                cb();
            }
        }.bind(this)
        if (this.loadingScript && !this.isInAsync){
            this.loadingScript.hide(callBack);
        }else {
            callBack();
        }

        if (isReleaseLastOne) {
            this._releaseScene(lastScene);
        }
    },

    _loadScenePrefab:function(sceneID,param,cb,isReleaseLastOne){
        this.isInAsync = true;
        var callFunc = function(prefab){
            var scene = cc.instantiate(prefab);
            scene.parent = this.sceneRoot;
            var comp = scene.getComponent(constant.SceneName[sceneID]);
            this.sceneContainer[sceneID] = {node:scene,ctrlScript:comp};
            this.isInAsync = false;
            this._loadSceneNow(sceneID,param,cb,isReleaseLastOne);
        }.bind(this);
        uiResMgr.loadScenePrefab(constant.SceneName[sceneID],callFunc);
    },

    _releaseScene:function(sceneID){
        if (!this.sceneContainer[sceneID]) return;
        var comp = this.sceneContainer[sceneID].ctrlScript;
        if (comp && comp.release) {
            comp.release();
        }
        this.sceneContainer[sceneID].node.removeFromParent();
        this.sceneContainer[sceneID].node.destroy();
        uiResMgr.releaseScene(constant.SceneName[sceneID]);//暂不释放资源
        delete this.sceneContainer[sceneID];
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
