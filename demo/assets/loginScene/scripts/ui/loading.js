var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        bgNode:[cc.Node],
        bgSprites:[cc.SpriteFrame],
        progressLabel:cc.Label,
        progress:cc.ProgressBar,
        addCount:5,
        mushRoomNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        jsonTables.parsePrefab(this);
        uiManager.fitScreen(this.node);
        this.accFlag = false;
        this.sceneResDone = true;
        this.sceneID = constant.SceneID.LOGIN;
        this.loadPerPart = {scene:0.5,curScene:0,prefab:0.5,curPrefab:0}
    },

    registerEvent: function () {

        var registerHandler = [
            ["loadSceneProgress", this.loadSceneProgress.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    loadSceneProgress:function(cur,all){
        var per = all === 0 ? 0 : cur/all;
        this.addProgress(per,0);
    },

    loadBgSprite:function(sceneID){
        var spIdx = (sceneID === constant.SceneID.MAIN && this.sceneID === constant.SceneID.LOGIN) || (sceneID === constant.SceneID.LOGIN && this.sceneID === constant.SceneID.MAIN) ? 0 : 1;
        this.widget('loading/logo').active = spIdx === 0;
        this.lastSpriteFrame = this.bgSprites[spIdx];
        this.bgNode[0].active = spIdx === 0;
        this.bgNode[1].active = spIdx === 1;
        if (this.lastSpriteFrame.textureLoaded()) {
            this._loadTexture();
        }
        else {
            this.lastSpriteFrame.once('load', this._loadTexture, this);
            this.lastSpriteFrame.ensureLoadTexture();
        }

    },

    _loadTexture:function(){
        if (this.lastSpriteFrame) {
            var node = this.bgNode[0].active ? this.bgNode[0] : this.bgNode[1];
            node.getComponent(cc.Sprite).spriteFrame = this.lastSpriteFrame;
            this.lastSpriteFrame = null;
        }
    },

    setProgressLabelPer:function(){
        this.progress.progress = this.progress.progress > 1 ? 1: this.progress.progress;
        var num = Number(this.progress.progress);
        this.progressLabel.string = (parseInt(num.toFixed(2) * 100)) + "%";
        this.mushRoomNode.x = this.widget('loading/shrink/progressBar').width * (this.progress.progress - 0.5);
    },

    addProgress:function(addScene,addPrefab,isCheckIn){
        this.loadPerPart.curScene += (addScene * this.loadPerPart.scene);
        if (this.loadPerPart.curScene > this.loadPerPart.scene) {
            this.loadPerPart.curScene = this.loadPerPart.scene;
        }
        this.loadPerPart.curPrefab += (addPrefab * this.loadPerPart.prefab);
        if (this.loadPerPart.curPrefab > this.loadPerPart.prefab) {
            this.loadPerPart.curPrefab = this.loadPerPart.prefab;
        }
        this.progress.progress = this.loadPerPart.curScene  + this.loadPerPart.curPrefab;
        this.setProgressLabelPer();
        if (!uiResMgr.isLoadingResDone() || !this.sceneResDone || !isCheckIn) return;
        if (this.progress.progress >= 1) {
            this.accFlag = false;
            this.scheduleOnce(function(){
                if (this.cb) {
                    var cb = this.cb;
                    this.cb = null;
                    cb();
                }
                this.node.active = false;
            },0)
        }
    },

    show:function(sceneID){
        this.loadPerPart = {scene:0.5,curScene:0,prefab:0.5,curPrefab:0}
        this.accFlag = false;
        this.sceneResDone = true;
        this.loadBgSprite(sceneID);
        this.node.active = true;
        this.progress.progress = 0;
        this.setProgressLabelPer();
        this.sceneID = sceneID;
        this.loadSceneMustRes(sceneID);
    },

    hide:function(cb){
        this.cb = cb;
        this.accFlag = true;
    },
    /** 加载指定场景必须的资源 */
    loadSceneMustRes:function(sceneID){
        if (sceneID === constant.SceneID.FIGHT) {
            uiResMgr.startLoadingRes();
            var lines = this.fightLogic.getBaseFamilyIDs();
            if (!lines || lines.length === 0) return;
            this.sceneResDone = false;
            this.count = 0;
            this.maxCount = 0;
            if (this.guideLogic.isInGuideFlag()) {
                var list = this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.EnemyTeam);
                this.maxCount += list.length;
                for (var i = 0 , len = list.length; i <  len; i++) {
                    var monsterID = list[i].ID;
                    var monConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsterID);
                    var spineName = monConfig[jsonTables.CONFIG_MONSTER.Resource];
                    uiResMgr.loadSpine(spineName,this.loadCountCallBack.bind(this));
                }
                var list = this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.HelpTeam);
                for (var i = 0 , len = list.length; i <  len; i++) {
                    var monsterID = list[i].ID;
                    var monConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsterID);
                    var spineName = monConfig[jsonTables.CONFIG_MONSTER.Resource];
                    uiResMgr.loadSpine(spineName,function () {});
                }

                var sex = this.userLogic.getBaseData(this.userLogic.Type.Sex);
                var profession = this.userLogic.getBaseData(this.userLogic.Type.Career);
                var tid = jsonTables.profession2Monster(profession,sex);
                if (tid) {
                    this.maxCount++;
                    var monConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
                    uiResMgr.loadSpine(monConfig[jsonTables.CONFIG_MONSTER.Resource],this.loadCountCallBack.bind(this));
                }
            }

            this._loadFamilyRes(lines);

            if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
                var familys = this.areanLogic.getEnmeyFamilys();
                this._loadFamilyRes(familys);
            }

            this.maxCount++;
            uiResMgr.loadFightPool(this.loadCountCallBack.bind(this));
            var tid = this.fightLogic.getFightSceneBg();
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.SCENERESOURCE,tid);
            if (!config) return;
            this.maxCount += 3;
            for (var i = 0 , len = 3; i <  len; i++) {
                var data = config["Res"+(i+1)+"ource"];
                if (data !== "-") {
                    uiResMgr.loadSceneBg(data,null,this.loadCountCallBack.bind(this));
                }else {
                    this.maxCount--;
                }
            }

            if (this.fightLogic.isGameType(constant.FightType.MINE_FIGHT)) {
                var enmeyData = this.mineLogic.getEnemyData();
                this.maxCount += enmeyData.Heroes.length;
                for (var i = 0 , len = enmeyData.Heroes.length; i <  len; i++) {
                    var obj = enmeyData.Heroes[i];
                    var monsterID = obj.ID;
                    var monConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsterID);
                    var spineName = monConfig[jsonTables.CONFIG_MONSTER.Resource];
                    uiResMgr.loadSpine(spineName,this.loadCountCallBack.bind(this));
                }
            }
            // if (cc.sys.isNative) {
            //     this.maxCount++;
            //     uiResMgr.loadItemPrefab(constant.ItemPrefabName.SAND_BOX_BG_EFFECT,this.loadCountCallBack.bind(this));
            // }
        }else if (sceneID === constant.SceneID.MAIN) {
            uiResMgr.startLoadingRes();
            this.count = 0;
            this.maxCount = 0;
            this.sceneResDone = false;
            this.maxCount++;
            if (this.guideLogic.isInStage(this.guideLogic.STATE_ENUM.NONE)) {
                this.maxCount++;
                uiManager.loadAsyncPrefab(uiManager.UIID.GUIDE_UI,this.loadCountCallBack.bind(this),true);
            }
            uiResMgr.loadMainScenePrefab(this.loadCountCallBack.bind(this));
        }
    },

    _loadFamilyRes:function(lines){
        var preloadCount = 3;
        if (cc.sys.isNative) {
            preloadCount = 5;
        }
        this.maxCount += (lines.length * preloadCount);
        var bindCb = this.loadCountCallBack.bind(this);
        for (var i = 0 , len = lines.length; i <  len; i++) {
            var obj = lines[i];
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj);
            var list = config[jsonTables.CONFIG_MONSTERFAMILY.Monsters];
            for (var j = 0 , jLen = preloadCount; j <  jLen; j++) {
                var monsterID = list[j];
                var monConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsterID);
                var spineName = monConfig[jsonTables.CONFIG_MONSTER.Resource];
                uiResMgr.loadSpine(spineName,bindCb);
            }
        }
    },

    loadCountCallBack:function(){
        this.count++;
        if (this.maxCount) {
            this.addProgress(0,1/this.maxCount);
        }
        if (this.count === this.maxCount) {
            this.sceneResDone = true;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.node.active || !this.accFlag) return;
        if (this.maxCount && this.count !== this.maxCount) {
            return;
        }
        this.addProgress(this.addCount*dt*1,this.addCount*dt*1,true);
    }
});
