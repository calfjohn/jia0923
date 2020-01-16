
window["logic"]["fight"] = function() {

    var _EVENT_TYPE = [
        "refreshStep",
        "fightGameState",
        "resetPveFight",//重置pve战斗
        "callNextWave",//进入下一波此
        "waveFightOver",//打完l
        "showAreanEmoj",
        "pauseFight",
        "showFinger",
    ];
    var clientEvent = null;
    var msgHander = null;
    var chapterLogic = null;
    var mineLogic = null;
    var cardLogic = null;
    var areanLogic = null;
    var userLogic = null;
    var sandTableLogic = null;
    var fightTalkLogic = null;
    var miniGameLogic = null;
    var worldBossLogic = null;
    var guideLogic = null;
    var shareLogic = null;
    var achievementLogic = null;
    var configuration = null;

    var module = {};

    module.sceneRoot = null;
    module.getRoot = function(){
        return this.sceneRoot;
    };

    module.callSceneRoot = function (func,arg) {
        arg = arg || [];
        return this.sceneRoot[func].apply(this.sceneRoot, arg);
    };

    module.init = function(){
        this.listLen = 4;//沙盘长度
        this.mineID = 1001;
        this.enemyID = 1002;//TODO 修改为准确的对象id
        this.gameType = constant.FightType.PVE;//游戏模式
        this.initModue();
        clientEvent.addEventType(_EVENT_TYPE);
        var topConfig = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.FightMonTopPos);
        var bottomConfig = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.FightMonBottomPos);

        var playY = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.FightPlayerPos);
        this.templatePosMap = cc.js.createMap();
        var baseZIndex = 500;
        var zIdx = 0;
        var topZIndexs = [];
        var topOwner = [];
        for (var i = 0 , len = topConfig.length; i <  len; i++) {
            var obj = topConfig[i];
            topZIndexs.push(baseZIndex - (i + 1) * 10);
            topOwner.push(-1);
        }
        var bottomZIndexs = [];
        var bottomOwner = [];

        for (var i = 0 , len = bottomConfig.length; i <  len; i++) {
            var obj = bottomConfig[i];
            bottomZIndexs.push(baseZIndex + (i + 1) * 10);
            bottomOwner.push(-1);
        }
        this.templatePosMap.topConfig = topConfig;
        this.templatePosMap.bottomConfig = bottomConfig;
        this.templatePosMap.topZIndexs = topZIndexs;
        this.templatePosMap.topOwner = topOwner;
        this.templatePosMap.topCount = 0;
        this.templatePosMap.bottomZIndexs = bottomZIndexs;
        this.templatePosMap.bottomOwner = bottomOwner;
        this.templatePosMap.bottomCount = 0;
        this.templatePosMap.isBottom = true;
        this.templatePosMap.getIdx = function () {
            var owner = this.isBottom ? this.bottomOwner : this.topOwner;
            for (var i = 0 , len = owner.length; i <  len; i++) {
                var obj = owner[i];
                if (obj === -1) {
                    return i;
                }
            }
            return -1;
        };

        this.templatePosMap.returnData = function (isBottom,idx) {
            if (isBottom) {
                return {zIndex:this.bottomZIndexs[idx],playY:jsonTables.randomNum(this.bottomConfig[idx][0],this.bottomConfig[idx][1])};
            }else {
                return {zIndex:this.topZIndexs[idx],playY:jsonTables.randomNum(this.topConfig[idx][0],this.topConfig[idx][1])};
            }
        };

        this.skillMonNum = 0;//当前正在处于技能状态的怪物

        this.reset();
    };

    module.initModue = function(){
        cardLogic = kf.require("logic.card");
        clientEvent = kf.require("basic.clientEvent");
        msgHander = kf.require("logic.msgHander");
        chapterLogic = kf.require("logic.chapter");
        mineLogic = kf.require("logic.mine");
        areanLogic = kf.require("logic.arean");
        userLogic = kf.require("logic.user");
        sandTableLogic = kf.require("logic.sandTable");
        fightTalkLogic = kf.require("logic.fightTalk");
        miniGameLogic = kf.require("logic.miniGame");
        worldBossLogic = kf.require("logic.worldBoss");
        guideLogic = kf.require("logic.guide");
        shareLogic = kf.require("logic.share");
        achievementLogic = kf.require("logic.achievement");
        configuration = kf.require("util.configuration");
    };

    module.reset = function(){
        this.clearCache(this.mineID);
        this.clearCache(this.enemyID);
        this.minePosMap = kf.clone(this.templatePosMap);// NOTE: 位置标识
        this.enemyPosMap = kf.clone(this.templatePosMap);
        msgHander.reset();//清空消息管道
        jsonTables.enumCount(0)
        this.disMap = cc.js.createMap();//距离存储  各个地方位置
        this.disMap[this.mineID] = window.newStruct.newDisMap(true);
        this.disMap[this.enemyID] = window.newStruct.newDisMap(false);
        this.gameState = constant.FightState.NONE;
        this.fightBaseInfo = {};//存储本次战斗的基础信息  以id为key
        this.fightBaseInfo[this.mineID] = {};
        this.fightBaseInfo[this.enemyID] = {};
        this.template = {
            owners:{}//NOTE 以ID为key的 相应数据
        };//NOTE 角色属性模板
        this.template.owners[constant.MonsterType.WARRIOR] = window.newStruct.newMap();
        this.template.owners[constant.MonsterType.TANK] = window.newStruct.newMap();
        this.template.owners[constant.MonsterType.SHOOTER] = window.newStruct.newMap();
        this.template.owners[constant.MonsterType.PLAYER] = window.newStruct.newMap();

        this.fightBaseInfo[this.mineID] = kf.clone(this.template);
        this.fightBaseInfo[this.enemyID] = kf.clone(this.template);
        this.maxStep = 0;
        this.curStep = 0;
        this.maxWaves = 0;
        this.curWaves = 0;
        this.specailMonsters = [];//特殊怪物存储容器
        this.fightPower = cc.js.createMap();
        fightTalkLogic.reset();
        this.fightShareDone = false;
        jsonTables.displaySkill = false;
        jsonTables.displayingSkill = false;
    };

    module.getMonsMapPos = function (tid,isMine,isPlayer) {
        var useMap = isMine ? this.minePosMap : this.enemyPosMap;
        var playerY = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.FightPlayerPos);
        if (isPlayer) {
            return {zIndex:500,playY:playerY};
        }
        var idx = useMap.topOwner.indexOf(tid);
        if (idx !== -1) {
            return useMap.returnData(false,idx);
        }
        idx = useMap.bottomOwner.indexOf(tid);
        if (idx !== -1) {
            return useMap.returnData(true,idx);
        }

        idx = useMap.getIdx();
        useMap.isBottom = !useMap.isBottom;
        if (idx !== -1) {
            var onwer = !useMap.isBottom ? useMap.bottomOwner : useMap.topOwner;
            onwer[idx] = tid;
            return useMap.returnData(!useMap.isBottom,idx);
        }else {
            idx = useMap.getIdx();
            if (idx !== -1) {
                var onwer = useMap.isBottom ? useMap.bottomOwner : useMap.topOwner;
                onwer[idx] = tid;
                return useMap.returnData(useMap.isBottom,idx);
            }else {
                console.log("nopos");
                idx = useMap.topZIndexs.length - 1;
                return {zIndex:useMap.topZIndexs[idx],playY:jsonTables.randomNum(useMap.topConfig[idx][0],useMap.topConfig[idx][1])};
            }
        }
    };

    //设置战力
    module.setFightPower = function (id,add) {
        if (!this.fightPower[id]) {
            this.fightPower[id] = 0;
        }
        this.fightPower[id] += add;
    };

    module.getMineFihgtPower = function () {
        var mineCount = this.fightPower[this.getMineID()] || 0;
        return mineCount;
    };

    module.setSandBoxLen = function (len) {
        if(!len)    return;
        this.listLen = len;
    };

    module.getSandBoxLen = function () {
        return this.listLen;
    };

    module.minePerEnmey = function (isThan,min,max) {
        var mineCount = this.fightPower[this.getMineID()] || 0;
        var enemyCount = this.fightPower[this.getEnemyID()] || 0;
        if (enemyCount === 0) return false;
        var per = mineCount/(mineCount + enemyCount);
        if (per > (min/100) && per < (max / 100)) {
            return true;
        }
        return false;
    };
    /** 找到指定对象的某个家住 */
    module.getFamilyOne = function (isSelf,familyID) {
        var target = null;
        var ownerID = isSelf ? this.mineID : this.enemyID;
        if (familyID === 0) {
            var list = this._findTarget(ownerID,1);
            if (list.length > 0) {
                target = list[0];
            }
        }else if (familyID === 1) {
            target = this.fightBaseInfo[ownerID].owners[constant.MonsterType.PLAYER].random();
        }else {
            var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
            var map = this.fightBaseInfo[ownerID].owners[familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type]];
            map.forEach(function(ele){
                if (ele.getFamilyID() === familyID) {
                    target = ele;
                    return true;
                }
            })
        }
        return target;
    };

    module.addSkillMonNum = function() {
        this.skillMonNum = 1;
    };

    module.exitSkillMonNum = function(){
        this.skillMonNum = 0;
    };

    module.getSkillMonNum = function(){
        return  this.skillMonNum;
    };

    module.getCanUseReel = function () {
        return  this.canUseReel;
    };

    /** 初始化战斗  清空缓存对象重置数据 */
    module.initFight = function(){
        this.reset();
        this.canUseReel = true;
        this.setGameState(constant.FightState.SANDBOX);//TODO 进入下一波的时候要重新设置一下

        if (this.isGameType(constant.FightType.PVE)) {
            var info = this.getPveInfo();
            if (info.isFirst) {//玩家PVE是否为第一次
                chapterLogic.req_ChapterNodeState(info.id,info.chapterIdx,chapterLogic.STATE_NODE.READY);
                info.isFirst = false;
            }
            this.config = chapterLogic.getChapterInfo(info.id,info.chapterIdx).MonsterBatch;
            this.curWaves = 0;//波次索引
            this.maxWaves = this.config.length-1;
            this.initWaves(this.curWaves);
            var list = chapterLogic.getChapterMineMonsterInfo(info.id);
            this.initMine(list);
            if(info.chapterIdx === 302){
                guideLogic.checkReelGuide();
            }
        }else if (this.isGameType(constant.FightType.MINE_READY)) {//上报阵容
            var mineData = mineLogic.getMineData();
            this.resetMaxStepAndCurStep(mineData.Step);
        }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
            mineLogic.req_Plunder_Mine();//告诉服务器 我去打人了
            var info = this.getMineInfo();
            var enmeyData = mineLogic.getEnemyData();
            var mineData = mineLogic.getMineData();
            if (info.type === constant.MINE_FIGHT_TYPE.DIRECT) {
                this.initMine(mineData.Heroes);
            }else if (info.type === constant.MINE_FIGHT_TYPE.SANDBOX) {
                this.resetMaxStepAndCurStep(mineData.Step);
            }
            this.initEnemy(enmeyData.Heroes);
        }else if (this.isGameType(constant.FightType.PVP_AREAN)){
            this.resetMaxStepAndCurStep(areanLogic.getStep());
            // this.curStep = areanLogic.getReconnStep();
            // var myTeam = areanLogic.getMyTeam();
            this.initMine([]);
            this.initEnemy([]);
        }else if (this.isGameType(constant.FightType.MINI_GAME)){
            this.maxStep = miniGameLogic.getCurStep();
            this.curStep = this.maxStep;
        }else if (this.isGameType(constant.FightType.WORLD_BOSS)){
            this.maxStep = worldBossLogic.getCurStep();
            this.curStep = this.maxStep;
        }else if (this.isGameType(constant.FightType.GUIDE_FIGHT)){
            this.maxStep = guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.Step);
            this.curStep = this.maxStep;
            var list = guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.EnemyTeam);
            this.initEnemy(list);
            window.adjustUtil.recored(tb.ADJUST_RECORED_NAME_LOADING);
        }else if (this.isGameType(constant.FightType.SHARE_FIGHT)) {
            this.maxStep = shareLogic.getStep();
            this.curStep = this.maxStep;
        }
    };

    module.initDone = function () {
        if (this.isGameType(constant.FightType.MINE_FIGHT)) {
            var info = this.getMineInfo();
            if (info.type === constant.MINE_FIGHT_TYPE.DIRECT) {
                this.sandBoxEnd();// NOTE: 直接开始战斗
            }
        }else if (this.isGameType(constant.FightType.GUIDE_FIGHT)){
            this.sceneRoot.sandNode.active = false;
            //setTimeout(function () {
            //    this.sandBoxEnd();// NOTE: 直接开始战斗
            //}.bind(this), 250);
            //setTimeout(function () {
            //    guideLogic.showFirstTalk();
            //}.bind(this), 1000);
            setTimeout(function () {
                guideLogic.callSandBox();
            }, 250);
        }
    };

    module.initWaves = function(wave){
        this.curWaves = wave;
        this.resetMaxStepAndCurStep(this.config[wave].Step + chapterLogic.getPrivilegesStep());
        this.initEnemy(this.config[wave].Monsters);
        this.sceneRoot.updateDisplay();
    };
    /**
     * 是否是pve最后一波此
     */
    module.isPveLastWave = function () {
        if (this.isGameType(constant.FightType.PVE)) {
            return this.curWaves === this.maxWaves && this.maxWaves !== 0;
        }
        return false;
    }

    module.clearCache = function(onwer){
        if (!this.fightBaseInfo || !this.fightBaseInfo[onwer] || !this.fightBaseInfo[onwer].owners) return;
        for (var type in this.fightBaseInfo[onwer].owners) { //  先将场景上旧的对象放回去
            var data = this.fightBaseInfo[onwer].owners[type];
            data.forEach(function(ele,key){
                ele.putInPool();
                msgHander.release(key);
            })
        }
        this.fightBaseInfo[onwer].owners = kf.clone(this.template.owners);
    };
    /** 生成我方怪物 */
    module.initMine = function(list){
        this.sceneRoot.newMineCreators(list);
    };
    /** 生成敌方怪物 */
    module.initEnemy = function(listIDs){
        this.clearCache(this.enemyID);
        var list = [];
        for (var i = 0 , len = listIDs.length; i < len; i++) {
            var obj = listIDs[i];
            if (obj.Num && obj.Num > 1) {
                for (var j = 0 , jLen = obj.Num; j < jLen; j++) {
                    list.push({id:obj.ID,lv:obj.Lvl})
                }
            }else {
                list.push({id:obj.ID,lv:obj.Lvl})
            }
        }
        this.enmeyServerData = kf.clone(list);
        this.sceneRoot.newNemeyCreator(list);
    };
    /** 生成单独的敌方怪物 */
    module.initEnmeyDiff = function (lists) {
        if (!this.sceneRoot) return;
        var info = this.resetListKey(lists);
        if (!this.enmeyServerData) {
            this.enmeyServerData = kf.clone(info);
            this.sceneRoot.newNemeyCreator(info);
            return;
        }
        //走到这里 有旧的缓存  进行差异对比
        var copyList = kf.clone(this.enmeyServerData)
        var unique = [];

        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            var isIn = false;
            for (var j = 0 , jLen = copyList.length; j < jLen; j++) {
                var copyObj = copyList[j];
                if (copyObj.id === obj.id && copyObj.Lvl === obj.Lvl) {
                    copyList.splice(j,1);
                    isIn = true;
                    break;
                }
            }
            if (!isIn) {
                unique.push(obj);
            }
        }
        if (unique.length > 0) {
            this.sceneRoot.newNemeyCreator(unique);
            this.enmeyServerData = this.enmeyServerData.concat(unique)
        }
    };
    /** 将服务器数据结构转换为客户端数据结构 */
    module.resetListKey = function (list) {
        var info = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            info.push({id:obj.ID,lv:obj.Lvl})
        }
        return info;
    };

    /** 添加怪物信息 */
    module.addCreator = function(owner,ccObj,id,type){
        this.fightBaseInfo[owner].owners[type].addElement(id,ccObj);
        this.disMap[owner].addElement(id,ccObj,type);
        this.sceneRoot.updateRetainLabel();
    };

    module.getCcObj = function (owner,id) {
        if (this.disMap[owner]) {
            return this.disMap[owner].getMapObj(id);
        }
        return null;
    };

    module.showLog = function (srcID,desID,str) {
        if (!jsonTables.showFightLog || !srcID || !desID) return;
        var srcObj = this.getCcObj(this.mineID,srcID);
        if (!srcObj) {
            srcObj = this.getCcObj(this.enemyID,srcID);
        }
        var desObj = this.getCcObj(this.mineID,desID);
        if (!desObj) {
            desObj = this.getCcObj(this.enemyID,desID);
        }
        if (!desObj || !srcObj) {
            return;
        }
        var srcInfo = {}
        srcInfo.lv = srcObj.getLv();
        srcInfo.name = srcObj.config[jsonTables.CONFIG_MONSTER.Resource] + "_" + srcID;
        var desInfo = {}
        desInfo.lv = desObj.getLv();
        desInfo.name = desObj.config[jsonTables.CONFIG_MONSTER.Resource] + "_" + desID;
        var strL = str.formatArray([srcInfo.name,desInfo.name])
        cc.log(strL,"发起者基础数据",srcInfo,"接收者基础数据",desInfo);
    };

    module.release = function(owner,id,type){
        this.fightBaseInfo[owner].owners[type].desrElement(id);
        this.disMap[owner].desrElement(id,type);
        this.sceneRoot.updateRetainLabel();
    };
    //获取场上怪物数量
    module.getMonsterNum = function (isMine) {
        var onwer = isMine ? this.getMineID() : this.getEnemyID();
        var num = 0;
        for (var type in this.fightBaseInfo[onwer].owners) { //  先将场景上旧的对象放回去
            var data = this.fightBaseInfo[onwer].owners[type];
            data.forEach(function(ele,key){
                if (ele.isPlayerFlag()) return;
                num++;
            })
        }
        return num;
    };
    //进行胜利表现
    module.doWinAction = function (ownerID) {
        this.canUseReel = false;
        var isMineWin = ownerID === this.getEnemyID();
        var player = this.getPlayerCCobj(isMineWin);
        if (!player) {
            return this.checkGameResult(ownerID);
        }
        if (!player.changeMachineState(constant.StateEnum.WIN)) {
            return this.checkGameResult(ownerID);
        }
    };

    module.isNoneCountByOwner = function (owner) {
        var owners = this.fightBaseInfo[owner].owners;
        var len = 0;
        len += owners[constant.MonsterType.WARRIOR].getLen();
        len += owners[constant.MonsterType.TANK].getLen();
        len += owners[constant.MonsterType.SHOOTER].getLen();
        len += owners[constant.MonsterType.PLAYER].getLen();
        if (owners[constant.MonsterType.PLAYER].getLen() === 1 && len === 1) {
            var isMineWin = owner !== this.getEnemyID();
            var player = this.getPlayerCCobj(isMineWin);
            if (player && player.isMachineState(constant.StateEnum.DEAD)) {
                return true;
            }
        }
        return len === 0;
    };

    module.isCanShowWinAction = function () {
        if (this.isGameType(constant.FightType.PVE) && this.curWaves !== this.maxWaves  ) {
            return false;
        }
        return true;
    };

    module.checkGameResult = function(owner){

        if (!this.isNoneCountByOwner(owner)) {
            return;
        }

        if (this.sceneRoot && cc.isValid(this.sceneRoot)) {
            this.sceneRoot.clearScene(false);
        }
        if (this.isGameOver()) {

            console.log("isOverd  do not check again");
            return;
        }
        this._checkGameResult(owner);
        return true;
    };
    module.cheatGame = function () {
        this._checkGameResult(this.mineID);
    };
    module._checkGameResult = function (owner) {
        if (this.isGameType(constant.FightType.PVE)) {
            if (owner !== this.mineID) {
                this.checkNextWave();
            }else {//我输了
                this.failRecode();//失败打点
                this.getRoot().getUsedReelList();//清空对应使用缓存
                cardLogic.resetCopyReelInfo();//失败了  把卷轴还给他
                this.setGameState(constant.FightState.GAMEOVER);
                achievementLogic.req_Set_Achieve();
                setTimeout(function () {
                    uiManager.openUI(uiManager.UIID.SETTLE,false);
                }, 20);
            }
        }else if (this.isGameType(constant.FightType.MINE_READY)) {//上报阵容
            this.setGameState(constant.FightState.GAMEOVER);
            sandTableLogic.saveSandBox();
        }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
            this.setGameState(constant.FightState.GAMEOVER);
            var re = owner !== this.mineID ? mineLogic.BATTLE_RESULT.WIN:mineLogic.BATTLE_RESULT.FAIL;// 0：success 1：failed
            mineLogic.req_Battle_Result(re);
            if (re === mineLogic.BATTLE_RESULT.WIN) {
                sandTableLogic.callServerQuality();
            }
        }else if (this.isGameType(constant.FightType.PVP_AREAN)) {
            var ret = owner !== this.mineID ? 1 : 0;
            this.setGameState(constant.FightState.GAMEOVER);
            areanLogic.req_Arena_Round_End(ret);
        }else if (this.isGameType(constant.FightType.WORLD_BOSS)){
            this.setGameState(constant.FightState.GAMEOVER);
            var boss = this.getPlayerCCobj(false);
            var damage = 0;
            if (boss) {
                var curHp = boss.getCurHp();
                var maxHp = worldBossLogic.getHpOffCurHp();
                damage = maxHp - curHp;
            }else {
                damage = worldBossLogic.getHpOffCurHp();
            }
            var table = sandTableLogic.getTableNow();
            worldBossLogic.req_Hit_Boss(damage,table);
        }else if (this.isGameType(constant.FightType.GUIDE_FIGHT)){
            // TODO: 区分第几次失败
            setTimeout(function () {
                guideLogic.checkGameResult(owner !== this.mineID);
            }.bind(this), 500);
        }else if (this.isGameType(constant.FightType.SHARE_FIGHT)) {
            uiManager.openUI(uiManager.UIID.SHARE_SETTLE);
        }
    };
    //连败打点
    module.failRecode = function () {
        var failNum = configuration.getConfigData("failNum");
        failNum = failNum?Number(failNum):0;
        failNum ++;
        window.adjustUtil.recored(tb.ADJUST_RECORED_FAIL,failNum);
        configuration.setConfigData("failNum",failNum);
        configuration.save();
    },
    /** 主动退出游戏 */
    module.ctrlExitGame = function () {
        uiResMgr.releaseTypeRes(uiResMgr.RTYPE.FIGHT_AUDIO);
        this.getRoot().getUsedReelList();//清空对应使用缓存
        cardLogic.resetCopyReelInfo();//失败了  把卷轴还给他
        this.setGameState(constant.FightState.GAMEOVER);
        this.clearCache(this.mineID);
        this.clearCache(this.enemyID);
        this.sceneRoot.closeSandBox();// NOTE:关掉界面  暂停定时器
        if (this.isGameType(constant.FightType.PVP_AREAN)) {
            areanLogic.req_Arena_Exit();//竞技场逃跑 要通知服务器
            return false;
        }else if(this.isGameType(constant.FightType.WORLD_BOSS)){
            // worldBossLogic.req_Hit_Boss(0);
        }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
            mineLogic.req_Battle_Result(mineLogic.BATTLE_RESULT.FAIL);
            return false;
        }
        return true;
    };
    /** 沙盘结束 可能要废弃了*/
    module.sandBoxEnd_Bk = function () {
        if (this.isSandShareEnable()) {
            var message = {
                "message":  uiLang.get('shareStep'),
                "button1":{
                    "name": uiLang.getMessage("b", "MBCANCEL"),
                    "callback": function(){
                        this._sandBoxEnd();
                    }.bind(this)
                },
                "button3":{
                    "name": uiLang.getMessage("b", "MBOK"),
                    "callback":function(){
                        shareLogic.share(tb.SHARELINK_STEP,0,function (isSucess) {
                            if (isSucess) {
                                this.fightShareDone = true;
                                shareLogic.req_Share(1);// NOTE: 通知服务器分享了
                                var steps = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ShareGetStep);
                                var step = jsonTables.random(steps);
                                this.addStepNum(step);
                            }else {
                                this._sandBoxEnd();
                            }
                        }.bind(this));
                    }.bind(this),
                },
            };
            uiManager.openUI(uiManager.UIID.MSG, message);
        }else {
            this._sandBoxEnd();
        }
    };
    /** 沙盘结束 */
    module.sandBoxEnd = function () {
        this._sandBoxEnd();
    },
    //检查沙盘是否可以分享
    module.isSandShareEnable = function () {
        var mineCount = this.fightPower[this.getMineID()] || 0;
        var enemyCount = this.fightPower[this.getEnemyID()] || 0;
        if (enemyCount < mineCount) {
            return false;
        }
        if (this.fightShareDone) {
            return false;
        }
        return this.isGameType(constant.FightType.PVE) && shareLogic.isCanShare() && shareLogic.isStepShareCount();
    };

    module._sandBoxEnd = function () {
        uiManager.closeUI(uiManager.UIID.GUIDE_UI);
        var delay = this.sceneRoot.closeSandBox();// NOTE: 直接开始战斗
        if (this.isGameType(constant.FightType.PVP_AREAN)) {
            var list = this.getKeepsListForServer(999999);
            sandTableLogic.saveAreanInfo(list);
        }else if (this.isGameType(constant.FightType.GUIDE_FIGHT) && guideLogic.isInStage(guideLogic.STATE_ENUM.FIREST_FAIL)) {
            guideLogic.newHelper();
            window.adjustUtil.recored(tb.ADJUST_RECORED_GUIDESANDBOX_COMPLITY);
        }else {
            setTimeout(function() {
                this.displayNow();
            }.bind(this), delay*1000);
        }
    };

    /** 通知所有状态机 开始表演了 */
    module.displayNow = function () {
        if (this.isGameType(constant.FightType.WORLD_BOSS)){
            var list = this.getKeepList(1);
            var tid = 0;
            if (list.length > 0) {
                tid = list[0].getTid();
            }
            worldBossLogic.setFightTid(tid);
        }else if (this.isGameType(constant.FightType.PVE)) {
            achievementLogic.recordAchi(constant.AchievementType.FIGHT_POWER,this.fightPower[this.mineID],false);
        }
        this.sceneRoot.displayNow();
        this.setGameState(constant.FightState.DISPLAY);
        msgHander.newAllMsg(null,0.01,constant.MsgHanderType.START_DISPLAY);
        this.checkGameResultForBegin();
    };

    /** 重新召唤沙盘  在pve中 和 竞技场中会出现 */
    module.callSandBoxReShow = function (isClear,callBack) {
        this.enemyPosMap = kf.clone(this.templatePosMap)
        if (isClear) {//如果被强制清空的时候  那么要把主角重新生成
            this.enmeyServerData = [];//这里因为 pvp清空了  要考虑下别情况 // TODO:
            this.clearCache(this.mineID);
            this.clearCache(this.enemyID);
            this.minePosMap = kf.clone(this.templatePosMap);
            this.sceneRoot.callInitGamer();
        }
        this.setGameState(constant.FightState.SANDBOX);
        this.clearBeyondRetain();
        this.sceneRoot.callSandBoxReShow(callBack);
    };
    /** 清理我方多余保留数量的怪物 */
    module.clearBeyondRetain = function () {
        var max = this.getRetainMax();
        this.desrMoreRetain(max);
    };

    module.checkPlayerLife = function (ownerID) {
        var isMine = ownerID === this.mineID;
        var player = this.getPlayerCCobj(isMine);
        if (!player) {//主角死亡了
            if (isMine) {
                this.sceneRoot.callInitPlayer();
            }else {
                // TODO: 待处理
            }
        }
    };

    module.checkNextWave = function(){
        this.curWaves++;
        if (this.curWaves > this.maxWaves) {//所有波次都赢咯
            this.setGameState(constant.FightState.GAMEOVER);
            sandTableLogic.saveSandBox();
            achievementLogic.req_Set_Achieve();
            setTimeout(function () {
                uiManager.openUI(uiManager.UIID.SETTLE,true);
            }, 20);
        }else {
            this.checkPlayerLife(this.mineID);
            this.resetMaxStepAndCurStep(this.config[this.curWaves].Step + chapterLogic.getPrivilegesStep());
            var callFunc = function(){
                this.initWaves(this.curWaves);
            }.bind(this);
            setTimeout(function () {
                clientEvent.dispatchEvent("callNextWave");
                this.callSandBoxReShow(false,callFunc.bind(this));//这里没有清空对象 所以不用重复创建
            }.bind(this), 20);
        }
    };

    module.checkGameResultForBegin = function () {
        if (this.isGameType(constant.FightType.PVE)) {
            if (guideLogic.isInReelStage(guideLogic.REEL_GUIDE.CLICK_FIGHT)) {
                uiManager.openUI(uiManager.UIID.GUIDE_UI,"clickFightReel");
                msgHander.newAllMsg(null,0.1,constant.MsgHanderType.DISPLAY_STOP_RESUME,true);
            }
        }

        if (this.checkGameResult(this.mineID)) return;
        this.checkGameResult(this.enemyID)
    };

    module.setGameState = function(state){
        this.gameState = state;
        if (this.gameState === constant.FightState.GAMEOVER) {
            clientEvent.dispatchEvent("waveFightOver");
        }
    };

    module.isSandBox = function(){
        return this.gameState === constant.FightState.SANDBOX;
    };

    module.isDisplaying = function(){
        return this.gameState === constant.FightState.DISPLAY;
    };

    module.isGameOver = function(){
        return this.gameState === constant.FightState.GAMEOVER;
    };

    module.getMineID = function(){
        return this.mineID;
    };

    module.getEnemyID = function(){
        return this.enemyID;
    };
    /** 获取相对目标id */
    module.getRelativeID = function(id){
        if (id === this.mineID) return this.enemyID;
        return this.mineID;
    };
    /** 重置设置步骤 */
    module.resetMaxStepAndCurStep = function (step) {
        this.maxStep = step;
        this.curStep = this.maxStep;
    };
    /** 获取最大的保留数 */
    module.getRetainMax = function () {
        if (this.isGameType(constant.FightType.PVE)) {
            return userLogic.getBaseData(userLogic.Type.HeroKeep) + userLogic.getBaseData(userLogic.Type.HeroKeepEx);
        }else if (this.isGameType(constant.FightType.MINE_READY)) {//上报阵容
            return 100;
        }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
            return 100;
        }else if (this.isGameType(constant.FightType.PVP_AREAN)){

        }else if (this.isGameType(constant.FightType.GUIDE_FIGHT)){
        }
        return 0;
    };

    module.getCurStep = function(){
        return this.curStep;
    };

    module.getMaxStep = function(){
        return this.maxStep;
    };

    module.addStepNum = function(num){
        this.curStep+= num;
        clientEvent.dispatchEvent("refreshStep");
    };

    module.addStep = function(){
        this.curStep++;
    };

    module.desrStep = function(){
        this.curStep--;
        if (this.curStep < 0) {
            this.curStep = 0;
        }
        clientEvent.dispatchEvent("refreshStep");
    };
    /** 获取一个目标 */
    module.findTarget = function(ccObj){
        var list = this.findTargetByDis(ccObj,1,true);
        if (list.length === 0) {
            return null;
        }
        return list[0];
    };
    /** 获取某方怪物总数 */
    module.getMonCount = function (ccObj) {
        var owner = ccObj.getOwner();
        var count = 0;
        count += this.fightBaseInfo[owner].owners[constant.MonsterType.WARRIOR].getLen();
        count += this.fightBaseInfo[owner].owners[constant.MonsterType.TANK].getLen();
        count += this.fightBaseInfo[owner].owners[constant.MonsterType.SHOOTER].getLen();
        return count;
    };

    /**
     * 获取随机目标
     * @param  {ccObj}  ccObj   来源对象
     * @param  {int}  count   数量
     * @param  {Boolean} isEnmey 是否该来源对象的敌对方
     * @return {Array}          里面保护指定数量的ccObj 如果数量不足 直接给上限
     */
    module.findTargetByRandom = function (ccObj,count,isEnmey) {
        var owner = ccObj.getOwner();
        if (isEnmey) {
            var enmey = this.getRelativeID(owner);
            return this._findTargetRandom(enmey,count);
        }
        return this._findTargetRandom(owner,count);
    };

    module._findTargetRandom = function (owner,count) {
        var list = this.fightBaseInfo[owner].owners[constant.MonsterType.WARRIOR].getAllValue();
        var list1 = this.fightBaseInfo[owner].owners[constant.MonsterType.TANK].getAllValue();
        var list2 = this.fightBaseInfo[owner].owners[constant.MonsterType.SHOOTER].getAllValue();
        var list3 = this.fightBaseInfo[owner].owners[constant.MonsterType.PLAYER].getAllValue();
        var re = list.concat(list1,list2,list3);
        if ( count > re.length) {
            return re;
        }
        re = jsonTables.randonByRand(re);
        return re.slice(0,count);

    };
    //获取指定对象 自身是否存在否写特定类型怪物数量
    module.isKindEixt = function (ccObj,type) {
        var owner = ccObj.getOwner();
        if (!this.fightBaseInfo[owner] || !this.fightBaseInfo[owner].owners || !this.fightBaseInfo[owner].owners[type]) {
            return false;
        }
        var len = this.fightBaseInfo[owner].owners[type].getLen();
        return len === 0;
    };

    /**
     * 获取指定对象距离最近的目标
     * @param  {ccObj}  ccObj   来源对象
     * @param  {int}  count   数量
     * @param  {Boolean} isEnmey 是否该来源对象的敌对方
     * @return {Array}          里面保护指定数量的ccObj 如果数量不足 直接给上限
     */
    module.findTargetByDis = function (ccObj,count,isEnmey) {
        var owner = ccObj.getOwner();
        if (isEnmey) {
            var enmey = this.getRelativeID(owner);
            return this._findTarget(enmey,count);
        }
        return this._findTarget(owner,count);
    };

    module._findTarget = function (owner,count) {
        var playerPos = constant.MonsterType.SHOOTER;
        var playChange = false;
        if (owner === this.mineID) {
            var profession = userLogic.getBaseData(userLogic.Type.Career);
            var professConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,profession);
            playerPos = constant.MonsterType.WARRIOR;
            if (professConfig) {
                playerPos = professConfig[jsonTables.CONFIG_PROFESSION.Type];
            }else {
                cc.error("没找到职业什么鬼")
            }
            var player = this.getPlayerCCobj(true);
            if (player) {
                playChange = player.getUseSencondAtk();
            }
        }

        return this.disMap[owner].getCount(count,playerPos,playChange);
    };

    module.getEnemyAll = function () {
        var list = [];
        var enmeyOwner = this.fightBaseInfo[this.enemyID].owners;
        for (var type in enmeyOwner) { //  先将场景上旧的对象放回去
            var data = enmeyOwner[type];
            data.forEach(function(ele,key){
                list.push(ele);
            })
        }
        return list;
    };

    module.newStateMachine = function(ccObj){
        var obj = new window["fight"].machineClass();
        obj.init(ccObj);
        return obj;
    };

    module.newFloatNum = function(count,target,ownerID,isCrit,isHeal){
        this.sceneRoot.newFloatNum(count,target,ownerID,isCrit,isHeal);
    };

    module.isGameType = function(type){
        return this.gameType === type;
    };

    module.setGameType = function(gameType){
        this.gameType = gameType;
    };
    /** 是否要展示他人玩家 */
    module.isShowEnmeyPlayer = function () {
        return this.isGameType(constant.FightType.PVP_AREAN) || this.isGameType(constant.FightType.MINE_FIGHT) || this.isGameType(constant.FightType.WORLD_BOSS);
    };

    /** {id:this.chapterIdx,chapterIdx:data.id,isFirst:true}; */
    module.setPveInfo = function(data){//调用这个接口默认第一次
        this.pveInfo = data;
        this.pveInfo.isFirst = true;
    };

    module.getPveInfo = function(){
        return this.pveInfo;
    };

    /** {type constant.MINE_FIGHT_TYPE}; */
    module.setMineInfo = function(data){
        this.mineInfo = data;
    };

    module.getMineInfo = function(){
        return this.mineInfo;
    };

    module.getSpecialList = function(type){
        var list = [];
        for (var i = 0 , len = this.specailMonsters.length; i < len; i++) {
            var obj = this.specailMonsters[i];
            list.push(obj);
        }
        return this.specailMonsters;
    };

    module.onSpecialMonster = function(obj){
        this.specailMonsters.push(obj);
    };

    module.offSpecialMonster = function(obj){
        var idx = this.specailMonsters.indexOf(obj);
        if (idx !== -1) {
            this.specailMonsters.splice(idx,1);
        }
    };

    module.getSkillTarget = function(enumType,fromer,ext){
        switch (enumType) {
            case tb.RANDOM_ENEMY://随机敌人
                return this.findTargetByRandom(fromer,ext,true);
            case tb.RANG_ENEMY://射程范围内的敌人
                var list = [];
                var owner = fromer.getOwner();
                var enmey = this.getRelativeID(owner);
                for (var type in this.fightBaseInfo[enmey].owners) { //  先将场景上旧的对象放回去
                    var data = this.fightBaseInfo[enmey].owners[type];
                    data.forEach(function(ele,key){
                        if (fromer.isCanAtk(ele)) {
                            list.push(ele);
                        }
                    })
                }
                return list;
            case tb.SELF://自己
                return [fromer];
            case tb.RANG_OUR://随机己方
                return this.findTargetByRandom(fromer,ext,false);
            // case tb.DOWN_OUR://不高于自身形态的我方怪物
            //     return this.findDownOur(fromer);
            case tb.DISTANCE_ENEMY:
                return this.findTargetByDis(fromer, ext, true);
        }
    };
    /** 不高于自身形态的我方怪物 */
    module.findDownOur = function(fromer){
        var list = [];
        var owner = fromer.getOwner();
        var ownerForm = fromer.getForm();
        var ownerId = fromer.getID();
        for (var type in this.fightBaseInfo[owner].owners) { //  先将场景上旧的对象放回去
            var data = this.fightBaseInfo[owner].owners[type];
            data.forEach(function(ele,key){
                if (ele.getForm() === ownerForm && ele.getID() !== ownerId) {
                    list.push(ele);
                }
            })
        }
        return list;
    };

    /**
     * 获取同类型里最高形态的那一只
     * @param fromer
     * @returns {*}
     */
    module.findMaxOur = function (fromer) {
        var monster = fromer;
        var owner = fromer.getOwner();
        var data = this.fightBaseInfo[owner].owners[fromer.getType()];
        data.forEach(function(ele,key){
            if (ele.getForm() <= monster.getForm()) return;
            monster = ele;
        });
        return monster;
    };

    module.isSpineOverLimit = function(fromer) {
        var list = this.findDownOur(fromer);
        var ownerForm = fromer.getForm();
        return list.length >= jsonTables.spineCouneLimit[ownerForm - 1];

    };

    /** 分身术特殊实现 */
    module.skill_avatar = function(fromer,count,posObj){
        var scripts = [];
        var posList = [];
        if (posObj) {
            for (var key in posObj) {
                if (!posObj.hasOwnProperty(key)) continue;
                posList.push(jsonTables.strToObject(posObj[key]));
            }
        }
        for (var i = 0 , len = count; i < len; i++) {
            var script = this.sceneRoot._newAmonsterNow(fromer.getTid(),0,0,fromer.getLv(),fromer.getOwner() === this.getEnemyID());
            msgHander.newMsg(null,script.getID(),0,constant.MsgHanderType.START_DISPLAY);
            script.node.x = fromer.node.x;
            script.setMonsterFrom(constant.FightMonsterFrom.BUFF);
            if (posList[i]) {
                script.setPosition(cc.v2(script.node.x + posList[i].x , script.node.y + posList[i].y));
            }else {
                script.setPosition(script.node.position);
            }
            scripts.push(script);
        }
        return scripts;
    };

    module.getGamerBaseInfo = function (ownerID) {
        var playerBaseInfo = cc.js.createMap();
        var ccObjInfo = cc.js.createMap();
        if (this.mineID === ownerID) {
            if (this.isGameType(constant.FightType.PVP_AREAN)) {
                serverData = areanLogic.getEnmeyBase();
                playerBaseInfo.psBase = serverData.PhyAtk;
                playerBaseInfo.msBase = serverData.MagAtk;
                playerBaseInfo.pdBase = serverData.PhyDef;
                playerBaseInfo.mdBase = serverData.MagDef;
                playerBaseInfo.critAtk = serverData.CritAtk;

                ccObjInfo.maxHp = serverData.Hp;
                ccObjInfo.damageBase = serverData.Damage;
                ccObjInfo.atkRange = serverData.AtkRang;
                ccObjInfo.atkInterval = serverData.AtkFeq;
                ccObjInfo.moveSpeed = serverData.Speed;
                ccObjInfo.atk = serverData.Atk;//剑值
                ccObjInfo.def = serverData.Def;//盾值
            }else {
                playerBaseInfo.psBase = userLogic.getBaseData(userLogic.Type.PhyAtk);
                playerBaseInfo.msBase = userLogic.getBaseData(userLogic.Type.MagAtk);
                playerBaseInfo.pdBase = userLogic.getBaseData(userLogic.Type.PhyDef);
                playerBaseInfo.mdBase = userLogic.getBaseData(userLogic.Type.MagDef);
                playerBaseInfo.critAtk = userLogic.getBaseData(userLogic.Type.CritAtk);
                playerBaseInfo.atkSpeed = userLogic.getBaseData(userLogic.Type.AtkSpeed);
                playerBaseInfo.critAtkEx = userLogic.getBaseData(userLogic.Type.CritAtkEx);

                ccObjInfo.maxHp = userLogic.getBaseData(userLogic.Type.Hp);
                ccObjInfo.damageBase =userLogic.getBaseData(userLogic.Type.Damage);
                ccObjInfo.atkRange = userLogic.getBaseData(userLogic.Type.AtkRang);
                ccObjInfo.atkInterval = userLogic.getBaseData(userLogic.Type.AtkFeq);
                ccObjInfo.moveSpeed = userLogic.getBaseData(userLogic.Type.Speed);
                ccObjInfo.atk = userLogic.getBaseData(userLogic.Type.Atk);//剑值
                ccObjInfo.def = userLogic.getBaseData(userLogic.Type.Def);//盾值
            }

            if (this.isPassiveSkillVaild() && !this.isGameType(constant.FightType.PVP_AREAN)) {
                playerBaseInfo.psBase += userLogic.getBaseData(userLogic.Type.PhyAtkEx);
                playerBaseInfo.msBase += userLogic.getBaseData(userLogic.Type.MagAtkEx);
                playerBaseInfo.pdBase += userLogic.getBaseData(userLogic.Type.PhyDefEx);
                playerBaseInfo.mdBase += userLogic.getBaseData(userLogic.Type.MagDefEx);
                ccObjInfo.maxHp += userLogic.getBaseData(userLogic.Type.HpEx);
                ccObjInfo.damageBase +=userLogic.getBaseData(userLogic.Type.DamageEx);
            }
            ccObjInfo.curHp = ccObjInfo.maxHp;
            return {playerBaseInfo:playerBaseInfo,ccObjInfo:ccObjInfo};
        }

        if (this.isShowEnmeyPlayer()) {
            var serverData = null;
            playerBaseInfo.critAtk = 0;
            if (this.isGameType(constant.FightType.PVP_AREAN)) {
                serverData = areanLogic.getEnmeyBase();
            }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
                serverData = mineLogic.getEnmeyBase();
            }else if (this.isGameType(constant.FightType.WORLD_BOSS)) {
                serverData = worldBossLogic.getEnmeyBase();
            }

            playerBaseInfo.psBase = serverData.PhyAtk;
            playerBaseInfo.msBase = serverData.MagAtk;
            playerBaseInfo.pdBase = serverData.PhyDef;
            playerBaseInfo.mdBase = serverData.MagDef;
            playerBaseInfo.critAtk = serverData.CritAtk;

            ccObjInfo.maxHp = serverData.Hp;
            ccObjInfo.damageBase = serverData.Damage;
            ccObjInfo.atkRange = serverData.AtkRang;
            ccObjInfo.atkInterval = serverData.AtkFeq;
            ccObjInfo.moveSpeed = serverData.Speed;
            ccObjInfo.atk = serverData.Atk;//剑值
            ccObjInfo.def = serverData.Def;//盾值

            if (this.isGameType(constant.FightType.WORLD_BOSS)) {
                ccObjInfo.curHp = serverData.CurHp;
            }else {
                ccObjInfo.curHp = ccObjInfo.maxHp;
            }

            return {playerBaseInfo:playerBaseInfo,ccObjInfo:ccObjInfo};
        }

        return null;

    };
    /**
     * 获取玩家对象
     * @param  {Boolean} isMine [description]
     */
    module.getPlayerCCobj = function (isMine) {
        var id = isMine ? this.mineID:this.enemyID;
        var owners = this.fightBaseInfo[id].owners;
        var keys = owners[constant.MonsterType.PLAYER].getKeys();
        if (keys.length === 0) return null;
        var boss = owners[constant.MonsterType.PLAYER].getValue(keys[0]);
        return boss;
    };
    /** 获取敌对技能 */
    module.getEnmeyTid = function () {

        if (this.isShowEnmeyPlayer()) {
            var roleInfo = null;
            if (this.isGameType(constant.FightType.PVP_AREAN)) {
                roleInfo = areanLogic.getEnmeyBase();
            }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
                roleInfo = mineLogic.getEnmeyBase();
            }else if (this.isGameType(constant.FightType.WORLD_BOSS)) {
                return worldBossLogic.getMonsterID();
            }
            roleInfo = {profession:roleInfo.Occupation,sex:roleInfo.Sex};
            return jsonTables.profession2Monster(roleInfo.profession,roleInfo.sex);
        }
        return null;;
    };
    /** 获取敌对职业 */
    module.getEnmeyProfession = function () {

        if (this.isShowEnmeyPlayer()) {
            var roleInfo = null;
            if (this.isGameType(constant.FightType.PVP_AREAN)) {
                roleInfo = areanLogic.getEnmeyBase();
            }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
                roleInfo = mineLogic.getEnmeyBase();
            }else if (this.isGameType(constant.FightType.WORLD_BOSS)) {
                return null;
            }
            if (roleInfo) {
                return roleInfo.Occupation;
            }
        }
        return null;
    };

    /** 清空指定数量的我方怪物 */
    module.desrMoreRetain = function (count) {
        var curCount = 0;
        var onwer = this.mineID;
        var list = [];
        for (var type in this.fightBaseInfo[onwer].owners) { //  先将场景上旧的对象放回去
            var data = this.fightBaseInfo[onwer].owners[type];
            data.forEach(function(ele,key){
                if (ele.isPlayerFlag() || !ele.getIsLife() || !ele.isCanKeep()) return;//排除特殊怪物
                list.push(ele);
            });
        }
        list.sort(function(a,b){
            return b.getFightPower() - a.getFightPower();
        })
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (curCount < count) {
                curCount++;
            }else {
                obj.putInPool();
            }
        }
    }

    /** 获取保存列表 */
    module.getKeepList = function(count){
        var list = [];
        var onwer = this.mineID;
        for (var type in this.fightBaseInfo[onwer].owners) { //  先将场景上旧的对象放回去
            var data = this.fightBaseInfo[onwer].owners[type];
            data.forEach(function(ele,key){
                if (ele.isPlayerFlag() || !ele.getIsLife() || !ele.isCanKeep()) return;//排除特殊怪物
                list.push(ele);
            })
        }
        if (list.length <= count) return list;
        list.sort(function(a,b){
            return b.getFightPower() - a.getFightPower();
        })
        list = list.splice(0,count);
        return list;
    };

    /** 获取指定 给服务器的结构 */
    module.getKeepsListForServer = function(count){
        var list = [];
        var keeps = this.getKeepList(count);
        for (var i = 0 , len = keeps.length; i < len; i++) {
            var obj = keeps[i];
            if (obj.isPlayerFlag()) continue;
            list.push({ID:obj.getTid(),Lvl:obj.getLvForServer(),Num:1,Skill:obj.getUseSkillCount(),SkillLv:[],TalentLv:[]})
        }
        return list;
    };

    /** 是否可以使用被动技能 */
    module.isPassiveSkillVaild = function () {
        return this.isGameType(constant.FightType.PVE) || this.isGameType(constant.FightType.MINE_FIGHT) || this.isGameType(constant.FightType.WORLD_BOSS) || this.isGameType(constant.FightType.PVP_AREAN);
    };
    /** 获取敌对玩家技能 */
    module.getEnemyPlayerSkill = function () {
        if ( this.isGameType(constant.FightType.WORLD_BOSS)) {
            return worldBossLogic.getBossSkill();
        }else if (this.isGameType(constant.FightType.PVE)) {

        }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {

        }else if (this.isGameType(constant.FightType.PVP_AREAN)) {
            // return areanLogic.getSkillList(tid);
        }
        return [];
    };
    /** 获取敌对指定怪物的技能 */
    module.getEnemyMonsSkill = function (tid) {
        if ( this.isGameType(constant.FightType.WORLD_BOSS)) {
        }else if (this.isGameType(constant.FightType.PVE)) {
            var id = this.pveInfo.id;
            var chapterID = this.pveInfo.chapterIdx;
            return chapterLogic.getSkillList(id,chapterID,tid,this.curWaves);
        }else if (this.isGameType(constant.FightType.MINE_FIGHT)) {
            return mineLogic.getSkillList(tid);
        }else if (this.isGameType(constant.FightType.PVP_AREAN)) {
            return areanLogic.getSkillList(tid);
        }
        return [];
    };
    /** 获取战斗背景图id */
    module.getFightSceneBg = function () {
        var tid = 0;
        if (this.isGameType(constant.FightType.PVE)) {
            var info = this.getPveInfo();
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CHAPTERSTYLE,info.id);
            tid = config[jsonTables.CONFIG_CHAPTERSTYLE.Scene];
        }else if (this.isGameType(constant.FightType.MINE_READY) || this.isGameType(constant.FightType.MINE_FIGHT)) {
            tid = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.MiningScene);
        }else if (this.isGameType(constant.FightType.PVP_AREAN)) {
            tid = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ArenaScene);
        }else if (this.isGameType(constant.FightType.MINI_GAME)) {
            tid = miniGameLogic.getSceneBgID();
        }else if (this.isGameType(constant.FightType.WORLD_BOSS)) {
            tid = worldBossLogic.getBossSceneBgID();
        }else if (this.isGameType(constant.FightType.GUIDE_FIGHT)){
            tid = guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.Map);
        }else if (this.isGameType(constant.FightType.SHARE_FIGHT)){
            tid = 1;
        }
        return tid;
    };

    module.getBaseFamilyIDs = function(){
        if (this.isGameType(constant.FightType.PVP_AREAN)) {
            return areanLogic.getLineUpTeam();
        }else if (this.isGameType(constant.FightType.MINI_GAME)){
            return miniGameLogic.getLineUpTeam();
        }else if (this.isGameType(constant.FightType.SHARE_FIGHT)) {
            return shareLogic.getLineUp();
        }
        return cardLogic.getLineUpTeam();
    };

    module.showEmoj = function (id,isMine) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.EXPRESSION,id);
        if (!config) {
            return cc.error("配置错误")
        }
        uiResMgr.loadAreanEmojPrefab(config[jsonTables.CONFIG_EXPRESSION.ExpressionRes],function (prefab) {
            // var player = this.getPlayerCCobj(isMine);
            // if (!player) {
            //     return cc.error("没人说个设")
            // }
            // var node = player.node.getInstance(prefab,true);
            // node.zIndex = 100;
            // var script = node.getComponent("areanEmoj");
            clientEvent.dispatchEvent("showAreanEmoj", prefab, config, isMine);
            // player.setAreanEmoj(script,config);
        }.bind(this))
    };

    return module;
};
