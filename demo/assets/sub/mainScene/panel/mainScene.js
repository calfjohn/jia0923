var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        mainSceneUI:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        var prefab = uiResMgr.getResource(uiResMgr.RTYPE.MAIN_PREFAB,"mainSceneUI");
        if (!prefab) {
            prefab = this.mainSceneUI;
        }
        // this.configuration = kf.require("util.configuration");
        this.node.getInstance(prefab,true);
        jsonTables.parsePrefab(this);
        uiManager.fitScreen(this.node);
        this.registerEvent();
        this.gemActive = undefined;//记录boss上一次的Active
        this.areanActive = undefined;//记录竞技场上一次的Active
        this.mineActive = undefined;//记录矿场上一次的Active
        this.initModule();

    },

    initModule:function () {
        this.worldBossLabel = this.widget("mainScene/shrink/gem/worldBossWordCD").getComponent(cc.Label);
        this.areanLabel = this.widget("mainScene/shrink/emptyFloatingIsland/countdown").getComponent(cc.Label);
        this.elfNode = this.widget("mainScene/shrink/elf");
    },

    registerEvent: function () {
        var registerHandler = [
            ["resetSpine", this.setSpine.bind(this),true],
            ["refreshBossPanel", this.refreshBoss.bind(this),true],
            ["refreshMainBtnActive", this.refreshMainBtnActive.bind(this),true],
            ["guideAction", this.guideAction.bind(this),true],
            ["lockAniEnd", this.lockAniEnd.bind(this),true],
            ["getAreanTimeInfo", this.getAreanTimeInfo.bind(this),true],
            ["changeLanguage", this.refreshMainBtnActive.bind(this),true],
            ["refreshActData", this.refreshActData.bind(this),true],
            ["loadScene", this.loadScene.bind(this),true]
        ]
        this.registerClientEvent(registerHandler);
    },

    loadScene:function (SceneID) {
        if(SceneID === constant.SceneID.LOGIN){
            this.guideAction("btnVisible",true);
            this.gemActive = undefined;//记录boss上一次的Active
            this.areanActive = undefined;//记录竞技场上一次的Active
            this.mineActive = undefined;//记录矿场上一次的Active
        }
    },

    clickDraw:function () {
        if(this.inActDraw){
            this.openUi("",uiManager.UIID.ACT_DRAWCARD);
        }else{
            this.openUi("",uiManager.UIID.DRAW_CARD);
        }
    },

    refreshActData:function () {
        var drawData = this.activityLogic.getDrawCardData();
        this.inActDraw = !!drawData;
        this.widget("mainScene/shrink/drawCard1/control/label").getComponent(cc.Label).string = this.inActDraw ? uiLang.getMessage(this.node.name,"actDraw"):uiLang.getMessage(this.node.name,"drawName");
        var endTime = drawData ? drawData.serverData.EndTime.toNumber() : 0;
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;
        // this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDrawCard/redPoint").active = drawData && drawData.userData.freeDraw && leftTime > 0;
        if(drawData && drawData.serverData){
            this.drawTime = drawData.serverData.EndTime.toNumber();
            this.refreshDraw();
        }else{
            this.drawTime = 0;
            this.inActDraw = false;
        }
    },

    refreshDraw:function () {
        var offTime = this.drawTime - this.timeLogic.now();
        var needUpdateLeft = offTime > 3600 * 24;
        var str = "";
        if(needUpdateLeft){
            str = uiLang.getMessage(this.node.name,"actDraw");
        }else if(offTime > 0){
            str = this.timeLogic.getCommonCoolTime(offTime);
        }else{
            str = uiLang.getMessage(this.node.name,"drawName");
            this.inActDraw = false;
        }
        this.widget("mainScene/shrink/drawCard1/control/label").getComponent(cc.Label).string = str;
    },

    refreshMainBtnActive:function(){
        if(this.aniNode){
            this.aniNode.active = true;
            this.aniNode = null;
        }
        this.widget("mainScene/shrink/gem").active = jsonTables.isFunVisible(constant.FunctionTid.WORLD_BOSS);
        if (this.widget("mainScene/shrink/gem").active) {
            var isOpen = jsonTables.funOpenCheck(constant.FunctionTid.WORLD_BOSS);
            this.widget("mainScene/shrink/gem/openlabel").active = !isOpen;
            this.widget("mainScene/shrink/gem/worldBossWord").active = isOpen;
            if (this.widget("mainScene/shrink/gem/openlabel").active) {
                this.widget("mainScene/shrink/gem/openlabel").getComponent(cc.Label).string = jsonTables.getUnOpenFuntionMsg(constant.FunctionTid.WORLD_BOSS);
            }
            this.widget("mainScene/shrink/gem/sp").color = isOpen? uiColor.white:uiColor.black;
            this.widget("mainScene/shrink/gem/stone").color = isOpen? uiColor.white:uiColor.gray;
            this.widget("mainScene/shrink/gem/stone11").color = isOpen? uiColor.white:uiColor.gray;
            this.widget("mainScene/shrink/gem/stone12").color = isOpen? uiColor.white:uiColor.gray;
            this.widget('mainScene/shrink/gem/stonegem1').active = isOpen;
            this.widget("mainScene/shrink/gem/sp").opacity = isOpen?255:222;
            this.widget("mainScene/shrink/gem/gem").color = isOpen? uiColor.white:uiColor.gray;
            if(this.gemActive === false && isOpen){//记录第一次开启
                this.aniNode = this.widget("mainScene/shrink/gem");
                this.aniState = constant.MainEffect.BOSS;
            }
            this.gemActive = isOpen;
        }

        this.widget("mainScene/shrink/emptyFloatingIsland").active = jsonTables.isFunVisible(constant.FunctionTid.AREAN);
        if (this.widget("mainScene/shrink/emptyFloatingIsland").active) {
            var isOpen = jsonTables.funOpenCheck(constant.FunctionTid.AREAN);
            this.widget("mainScene/shrink/emptyFloatingIsland/openlabel").active = !isOpen;
            this.widget("mainScene/shrink/emptyFloatingIsland/label").active = isOpen;
            if (this.widget("mainScene/shrink/emptyFloatingIsland/openlabel").active) {
                this.widget("mainScene/shrink/emptyFloatingIsland/openlabel").getComponent(cc.Label).string = jsonTables.getUnOpenFuntionMsg(constant.FunctionTid.AREAN);
            }
            this.widget("mainScene/shrink/emptyFloatingIsland").color = isOpen? uiColor.white:uiColor.gray;
            if(this.areanActive === false && isOpen){//记录第一次开启
                this.aniNode = this.widget("mainScene/shrink/emptyFloatingIsland");
                this.aniState = constant.MainEffect.ARENA;
            }
            this.areanActive = isOpen;
        }
        this.widget("mainScene/shrink/mine").active = jsonTables.isFunVisible(constant.FunctionTid.MINE);
        if (this.widget("mainScene/shrink/mine").active) {
            var isOpen = jsonTables.funOpenCheck(constant.FunctionTid.MINE);
            this.widget("mainScene/shrink/mine").color = isOpen? uiColor.white:uiColor.gray;
            this.widget("mainScene/shrink/mine/openlabel").active = !isOpen;
            this.widget("mainScene/shrink/mine/mineWord").active = isOpen;
            if (this.widget("mainScene/shrink/mine/openlabel").active) {
                this.widget("mainScene/shrink/mine/openlabel").getComponent(cc.Label).string = jsonTables.getUnOpenFuntionMsg(constant.FunctionTid.MINE);
            }

            if(this.mineActive === false && isOpen){//记录第一次开启
                this.aniNode = this.widget("mainScene/shrink/mine");
                this.aniState = constant.MainEffect.MINE;
            }
            this.mineActive = isOpen;
        }
        // if(this.aniNode){
        //     this.aniNode.active = false;
        // }
    },

    lockAniEnd:function () {
        if(this.aniNode){
            this.aniNode.active = true;
        }
        if (this.treasureLogic.isShowFlag()) {
            uiManager.openUI(uiManager.UIID.GETBOXANI);
        }
        this.aniNode = undefined;
    },

    guideAction:function(type,ext){
        if (type === "btnVisible") {
            if (!ext && !this.guideLogic.isInGuideFlag()) {
                return;
            }
            this.widget("mainScene/shrink/mine").active = ext;
            this.widget("mainScene/shrink/gem").active = ext;
            this.widget("mainScene/shrink/emptyFloatingIsland").active = ext;
            this.widget("mainScene/shrink/prospects/lineUp").active = ext;
            this.elfNode.active = ext;
            if (ext) {
                this.refreshMainBtnActive();
                this.reInitEfl();
            }
        }
    },

    enterScene:function(){
        uiResMgr.limitPoolCount();
        this.clientEvent.dispatchEvent("playBgMusice",constant.AudioID.MAIN_BG);
        // console.log(this.widget("mainScene/shrink/prospects/lineUp/maleWarrior"));
        if (!this.talentLogic.getHavedReq()) {//初始化请求
            this.talentLogic.reqInit();
            // var areanTable = this.configuration.getConfigData("areanTable");
            // if(areanTable){//有数据请求重连3
            //     uiManager.setRootBlockActive(true);
            //     this.scheduleOnce(function () {
            //         uiManager.setRootBlockActive(false);
            //         this.areanLogic.req_Arena_Reconn();
            //     },0.5)
            // }
            this.reInitEfl();
        }
        if (this.guideLogic.isInStage(this.guideLogic.STATE_ENUM.NONE)) {
            this.guideLogic.startGuide();
            this.clientEvent.dispatchEvent("guideAction","btnVisible",false);
        }else{
            this.loginLogic.showNoticeInGame();
            this.refreshMainBtnActive();
        }
        this.setSpine();
        this.show();
    },

    show:function(){
        this.clientEvent.dispatchEvent("showMainScene");
        this.clientEvent.dispatchEvent("elfGuideFunc");
        if(this.aniNode){//先播解锁动画
            this.aniNode.active = false;
            uiManager.openUI(uiManager.UIID.MAINSCENE_EFFECT,this.aniState,this.aniNode.position);
        }else if(this.treasureLogic.isShowFlag()){
            uiManager.openUI(uiManager.UIID.GETBOXANI);
        }
        this.userLogic.setLockStatus(false);//解锁界面刷新,做个保护，暂时找不到哪里 锁了没有解锁
    },

    openUi:function(_,param){
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        if (Number(param) === uiManager.UIID.WORLDBOSS ) {
            if (!jsonTables.funOpenCheck(constant.FunctionTid.WORLD_BOSS)) {
                return jsonTables.tipUnOpenFuntionMsg(constant.FunctionTid.WORLD_BOSS);
            }
            // if (!this.worldBossLogic.isCanAtkBoss()) {
            //     return uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.get("cantHitBoss"));
            // }
        }
        if (Number(param) === uiManager.UIID.AREAN_UI && !jsonTables.funOpenCheck(constant.FunctionTid.AREAN)) {
            return jsonTables.tipUnOpenFuntionMsg(constant.FunctionTid.AREAN);
        }

        if (Number(param) === uiManager.UIID.MINE_UI && !jsonTables.funOpenCheck(constant.FunctionTid.MINE)) {
            return jsonTables.tipUnOpenFuntionMsg(constant.FunctionTid.MINE);
        }

        uiManager.openUI(Number(param));
    },

    refreshBoss:function(){
        var info = this.worldBossLogic.getBossInfo();
        if (!info) return;
        var curHp = info.Bosses.CurHp;
        var inOpen = info.OpenTime.toNumber() <= this.timeLogic.now() && info.EndTime.toNumber() > this.timeLogic.now();
        this.widget('mainScene/shrink/gem/sp').active =inOpen && curHp !== 0;
        if(this.widget('mainScene/shrink/gem/sp').active){
            this.updateBossFlag = false;
            this.widget("mainScene/shrink/gem/worldBossWordCD").active = false;
            var callBack = function(spineData){
                this.widget('mainScene/shrink/gem/sp').getComponent(sp.Skeleton).skeletonData  = spineData;
                this.widget('mainScene/shrink/gem/sp').getComponent(sp.Skeleton).setAnimation(0,'std',true);
            }.bind(this);
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,info.Bosses.ID);
            var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
            uiResMgr.loadSpine(spineName,callBack);
        }else if(curHp === 0){
            this.updateBossFlag = false;
            this.widget("mainScene/shrink/gem/worldBossWordCD").active = true;
            this.worldBossLabel.string = uiLang.getMessage(this.node.name,"worldBossDeal");
        }else{
            this.updateBossFlag = true;
            this.timeCount = 1;
        }
    },

    refreshOpenCd:function(){
        var info = this.worldBossLogic.getBossInfo();
        var isOpen = jsonTables.funOpenCheck(constant.FunctionTid.WORLD_BOSS);
        if (!info || !isOpen) {
            this.updateBossFlag = false;
            this.widget("mainScene/shrink/gem/worldBossWordCD").active = false;
            return;
        }
        var offTime = info.OpenTime.toNumber() - this.timeLogic.now();
        this.widget("mainScene/shrink/gem/worldBossWordCD").active = true;
        this.worldBossLabel.string = this.timeLogic.getCommonCoolTime(offTime);
        if(offTime <= 0){
            this.worldBossLogic.req_Boss_Info(true);
        }
    },

    refreshAreanCd:function(){
        var areanInfo = this.areanLogic.getAreanTimeInfo();
        var isaAreanOpen = jsonTables.funOpenCheck(constant.FunctionTid.AREAN);
        if(!areanInfo || !isaAreanOpen){
            this.updateAreanFlag = false;
            this.widget("mainScene/shrink/emptyFloatingIsland/countdown").active = false;
            return;
        }else{
            if(areanInfo.OpenTime.toNumber() === -1){//全天开放
                this.widget("mainScene/shrink/emptyFloatingIsland/countdown").active = false;
                this.updateAreanFlag = false;
                return;
            }
            this.widget("mainScene/shrink/emptyFloatingIsland/countdown").active = true;
            var areanInOpen = areanInfo.OpenTime.toNumber() === -1 || (areanInfo.OpenTime.toNumber() <= this.timeLogic.now() && areanInfo.CloseTime.toNumber() > this.timeLogic.now());
            var offTime = areanInOpen?areanInfo.CloseTime.toNumber() - this.timeLogic.now() :areanInfo.OpenTime.toNumber() - this.timeLogic.now();
            if(offTime >= 0){
                this.areanLabel.string = this.timeLogic.getCommonCoolTime(offTime);
                this.areanLabel.string += areanInOpen?uiLang.getMessage(this.node.name,"close"):uiLang.getMessage(this.node.name,"open");
            }else{
                this.areanLogic.req_Arena_Info(true);
                this.updateAreanFlag = false;
            }
        }
    },

    getAreanTimeInfo:function () {
        this.updateAreanFlag = true;
    },

    reInitEfl: function () {
        var noticeInfo = this.loginLogic.getNoticeInfo();
        this.elfNode.active = !noticeInfo || noticeInfo.elfOpen;
        if(this.elfNode.active) {
            var elfJs = this.elfNode.getComponent("elf");
            elfJs.init();
        }
    },

    setSpine:function(){
        if(!this.userLogic.getBaseData(this.userLogic.Type.Sex))    return;//没有性别就不用设置Spine
        this.equipLogic.setBaseSpine(this.widget("mainScene/shrink/prospects/lineUp/maleWarrior"));
    },

    update :function(dt) {
        this.timeCount += dt;
        if (this.timeCount < 1) return;
        this.timeCount -= 1;
        if (this.updateBossFlag){
            this.refreshOpenCd();
        }

        if(this.updateAreanFlag){
            this.refreshAreanCd();
        }

        if(this.drawTime){
            this.refreshDraw();
        }
    },
});
