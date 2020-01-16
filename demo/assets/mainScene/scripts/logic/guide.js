/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-09-21T15:12:36+08:00
 */

window["logic"]["guide"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var chapterLogic = null;
    var userLogic = null;
    var loginLogic = null;
    var fightLogic = null;
    var treasureLogic = null;
    var sandTableLogic = null;
    var cardLogic = null;
    var msgHanderLogic = null;
    var configuration = null;
    var chapterLogic = null;

    var _EVENT_TYPE = [
        "guideAction",
        "guideFirstExcell",
        "fightTaskOver"
    ];

    module.STATE_ENUM = {
            NONE:0,
            FIREST_FAIL:1,
            WAITE_TIME:2,
            FIREST_WIN:3,
    };

    module.TAG_FLAG = {
            CHAPTER:1
    };

    module.REEL_GUIDE = {
            CLICK_FIGHT:1,//点击使用
            OVER:2
    };

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
        if(!window.wx){
            this.initConfig();
        }
    };

    module.initConfig = function () {
        this.tempConfig = jsonTables.getJsonTable(jsonTables.TABLE.GUIDE);
        var list = this.tempConfig[jsonTables.CONFIG_GUIDE.EnemyTeam];
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            obj.Lvl = obj.Lv;
        }
        this.config = kf.clone(this.tempConfig);
    };

    module.reset = function(){
        this.stage = this.STATE_ENUM.NONE;
        this.tagFlag = 0;
        this.isInGuide = false;
        this.reelGuideFlag = false;
        this.reelState = this.REEL_GUIDE.GET_REEL;
        this.reelNode = null;
        this.reelChapterID = 3;
        this.reelNodeID = 301;
        this.reelNextNodeID = 302;
        this.firstFingerFlag = true;//第一次
        this.sencondFingerFlag = false;
        this.isTipLine = false;
        this.inSenconFlag = false;
        this.beseChapterPos = null;
    };

    module.initModule = function(){
        configuration = kf.require("util.configuration")
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        chapterLogic = kf.require("logic.chapter");
        userLogic = kf.require("logic.user");
        fightLogic = kf.require("logic.fight");
        treasureLogic = kf.require("logic.treasure");
        sandTableLogic = kf.require("logic.sandTable");
        cardLogic = kf.require("logic.card");
        chapterLogic = kf.require("logic.chapter");
        msgHanderLogic = kf.require("logic.msgHander");
        loginLogic = kf.require("logic.login");
    };

    module.registerMsg = function() {

    };

    module.setBaseChapterPos = function (worldPos) {
        this.beseChapterPos = worldPos;
    };
    module.getBaseChapterPos = function () {
        return    this.beseChapterPos;
    };
    /** 第一次出现蓝色品质 */
    module.isFirstExcellentForrm = function () {
        if (this.isInGuideFlag() || (fightLogic.isGameType(constant.FightType.PVE) && fightLogic.getPveInfo().id === 1)) {
            return true;
        }
        // var guides = userLogic.getFlagInfo(userLogic.Flag.FirstExcellentForrm);
        // if (!guides || guides.length === 0 || guides[0] !== -1) {//-1用于表示出了
            // return true;
        // }
        return false;
    };

    module.isNeedFindWeaker = function (chapterID) {
        if(chapterID === this.tempConfig[jsonTables.CONFIG_GUIDE.CombatStageID] && !userLogic.getFlagInfoOneFlag(userLogic.Flag.GuideWeaker)){
            userLogic.pushFlagInfo(userLogic.Flag.GuideWeaker,1);
            userLogic.saveFlagInfo2Server([userLogic.Flag.GuideWeaker]);
            return  true;
        }
        return  false;
    };

    module.getGuideLineIDs = function () {
        return this.tempConfig[jsonTables.CONFIG_GUIDE.LineIDs];
    };

    module.showFirstGuideAction = function (active,sandClose) {
        clientEvent.dispatchEvent("guideAction","showFirstExcellent",active,sandClose);
    };

    module.closeFirstGuideAction = function (sandClose) {
        if (!this.isFirstExcellentForrm() ) return;
        // userLogic.setFlagInfo(userLogic.Flag.FirstExcellentForrm,[-1]);//修改本地缓存
        // var key = [userLogic.Flag.FirstExcellentForrm];
        // userLogic.saveFlagInfo2Server(key);//修改远端
        this.showFirstGuideAction(false,sandClose);
    };

    /** 检查是否可以进行引导 */
    module.checkCanGuide = function () {
        var guides = userLogic.getFlagInfo(userLogic.Flag.Guide);
        if (!guides || guides.length === 0 || guides[0] !== -1) {//-1用于表示新手引导完成了
            if (guides && guides.length > 0 && guides[0]) {
                this.tagFlag = guides[0];
                if (guides[0] >= 1) return false;
            }else {
                this.tagFlag = 0;
                jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_Max;
            }
            return true;
        }
        return false;
    };
    /** 是否处于引导之中 */
    module.isInGuideFlag = function () {
        return this.isInGuide;
    };

    /** 获取配置表文字 */
    module.getConfigText = function (key) {
        var tid = this.config[key];
        return uiLang.getConfigTxt(tid);
    };

    module.getConfigValue = function (key) {
        return this.config[key];
    };
    /** 设置开启标识 */
    module.setGuideBaseInfo = function () {
        this.isInGuide = true;
        var str = this.config[jsonTables.CONFIG_GUIDE.Table];
        this.config.TableInfo = {};
        this.config.TableInfo.Grid = [];
        var spliList = str.split("&");
        for (var i = 0 , len = spliList.length; i <  len; i++) {
            this.config.TableInfo.Grid[i] = {};
            this.config.TableInfo.Grid[i].Data = [];
            this.config.TableInfo.Grid[i].Lv = [];
            var obj = spliList[i];
            var objList = obj.split("#");
            for (var j = 0 , jLen = objList.length; j <  jLen; j++) {
                var id = objList[j];
                this.config.TableInfo.Grid[i].Data.push(Number(id));
                this.config.TableInfo.Grid[i].Lv.push(1);
            }
        }
        jsonTables.initSandBoxTable(this.config);
    };

    module.getTableInfo = function () {
        return this.config.TableInfo;
    };

    /** 开始引导 */
    module.startGuide = function () {
        if (this.tagFlag === 0) {
            setTimeout(function () {
                userLogic.req_Set_Name(loginLogic.getRandomName(),1,1,"");
                fightLogic.setGameType(constant.FightType.GUIDE_FIGHT);
                clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){
                    // NOTE: 直接开打了
                }.bind(this));
            }.bind(this), 500);
            // uiManager.openUI(uiManager.UIID.GUIDE_UI,"aniNode");
        }else if (this.tagFlag === this.TAG_FLAG.CHAPTER) {
            console.log("fightEnd");
            uiManager.openUI(uiManager.UIID.GUIDE_UI,"guideFinger");
        }

    };

    /** 设置引导索引 */
    module.setGuideFlag = function (stage) {
        if (stage === -1) {
            //window.adjustUtil.recored(tb.ADJUST_RECORED_START_CHAPTER);
            if(window.FBInstant)    //fb版本打点
                window.fbAnalytics.recored(tb.FACEBOOK_RECORED_COMPLITY_GUIDE);
            this.isInGuide = false;
            this.reset();
            clientEvent.dispatchEvent("guideAction","btnVisible",true);
        }
        userLogic.setFlagInfo(userLogic.Flag.Guide,[stage]);//修改本地缓存
        var key = [userLogic.Flag.Guide];
        userLogic.saveFlagInfo2Server(key);//修改远端
    };

    module.isInStage = function (stage) {
        if (!this.isInGuideFlag()) return false;
        return this.stage === stage;
    };
    /** 检查胜利与否 */
    module.checkGameResult = function (isWin) {
        if (this.isInStage(this.STATE_ENUM.NONE)) {
            if (isWin) {
                this.fightWin();
                cc.error("神他妈的第一波就打赢了")
                return;
            }
            this.stage = this.STATE_ENUM.WAITE_TIME;
            fightLogic.setGameState(constant.FightState.SANDBOX);
            msgHanderLogic.newAllMsg(null,0.1,constant.MsgHanderType.GUIDE_ACTION,"talk");
            this.playerFailTalk();
        }else if (this.stage === this.STATE_ENUM.FIREST_FAIL) {
            this.fightWin();
            console.log("胜利了");
        }
    };

    module.newHelper = function () {
        uiManager.closeUI(uiManager.UIID.GUIDE_UI);
        var list = [];
        var targetID = 0;
        var configMine = this.config[jsonTables.CONFIG_GUIDE.HelpTeam];
        for (var i = 0 , len = configMine.length; i <  len; i++) {
            var obj = configMine[i];
            if (i === 0) {
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,obj.ID);
                targetID = config[jsonTables.CONFIG_MONSTER.FamilyID];
            }
            for (var j = 0 , jLen = obj.Num; j <  jLen; j++) {
                list.push({ID:obj.ID,Lvl:obj.Lv});
            }
        }
        this.targetID = targetID;
        var cb = function () {

        }.bind(this)
        var player = fightLogic.getPlayerCCobj(true);
        if (player) {
            player.addMaxHp(this.config[jsonTables.CONFIG_GUIDE.ProtagonistHp2Buff]);
        }
        setTimeout(function () {
            fightLogic.callSceneRoot("newCreatorForGuide",[list,cb]);
        }.bind(this), this.config[jsonTables.CONFIG_GUIDE.MonsterJoinTime]);
        setTimeout(function () {
            this.showSencondTalk();
        }.bind(this), (this.config[jsonTables.CONFIG_GUIDE.MonsterJoinTime] + 1000));
        fightLogic.displayNow();
    };

    module.fightWin = function () {
        this.tagFlag = this.TAG_FLAG.CHAPTER;
        this.stage = this.STATE_ENUM.NONE;
        this.setGuideFlag(this.TAG_FLAG.CHAPTER);
        uiManager.loadAsyncPrefab(uiManager.UIID.CHAPTER_UI, null, true);
        clientEvent.dispatchEvent("loadScene",constant.SceneID.MAIN,[],function(){
            //uiManager.openUI(uiManager.UIID.GUIDE_UI,"guideFinger");
            uiManager.openChapter(1);
            uiManager.openUI(uiManager.UIID.GUIDE_UI,"victory");
        }.bind(this));
    };

    /** 玩家失败对话 */
    module.playerFailTalk = function () {
        var player = fightLogic.getPlayerCCobj(true);
        if (player) {
            this.forceOneTalk(player,this.config[jsonTables.CONFIG_GUIDE.ProtagonistTalk],function () {
                uiManager.openUI(uiManager.UIID.GUIDE_UI,"partner");
                msgHanderLogic.newAllMsg(null,0.1,constant.MsgHanderType.GUIDE_ACTION,"fade");
            }.bind(this));
        }
    };

    module.callSandBox = function () {
        this.stage = this.STATE_ENUM.FIREST_FAIL;
        fightLogic.sceneRoot.callSandShowForGuide();
        setTimeout(function () {
            uiManager.openUI(uiManager.UIID.GUIDE_UI,"rule");
            jsonTables.showTip = false;
            fightLogic.callSceneRoot("tipEvent",[])
        }.bind(this), 500);
    };

    /** 第一次插话 */
    module.showFirstTalk = function () {
        var player = fightLogic.getPlayerCCobj(true);
        if (player) {
            this.forceOneTalk(player,this.config[jsonTables.CONFIG_GUIDE.Adventure]);
            player.addMaxHp(this.config[jsonTables.CONFIG_GUIDE.ProtagonistHpBuff]);
        }
        var target = fightLogic.getFamilyOne(false,0);
        if (target) {
            this.forceOneTalk(target,this.config[jsonTables.CONFIG_GUIDE.Enemy]);
        }
    };
    /** 第二次说话 */
    module.showSencondTalk = function () {
        var target = fightLogic.getFamilyOne(true,this.targetID);
        if (target) {
            this.forceOneTalk(target,this.config[jsonTables.CONFIG_GUIDE.BeginTalk]);
        }
    };

    module.forceOneTalk = function (target,bubbleID,cb) {
        var node = uiResMgr.getPrefabEx("fightTalkItem");
        var parent = fightLogic.callSceneRoot("getUiNode");
        node.parent = parent;
        node.getComponent("fightTalkItem").show(target,bubbleID,cb);
    };


    //////////////////////////////////////////////////////////////////////////
    /** 检查是否可以进行卷轴引导 */
    module.checkReelGuide = function () {
        var flag = userLogic.getFlagInfoOneFlag(userLogic.Flag.ReelGuide);
        if (flag !== -1 ) {
            this.reelGuideFlag = true;
            this.reelState = this.REEL_GUIDE.CLICK_FIGHT;//flag;
            this.setReelGuideFlag(this.reelState);
            uiManager.loadAsyncPrefab(uiManager.UIID.GUIDE_UI,function () {},true);
            this.reelIdx = -1;
            return;
        }
        this.reelGuideFlag = false;
    };

    module.checkCache = function () {
        var flag = userLogic.getFlagInfoOneFlag(userLogic.Flag.ReelGuide);
        if (flag !== -1 && flag !== 0 ) {
            this.reelGuideFlag = true;
            this.reelState = this.REEL_GUIDE.CLICK_FIGHT;//flag;
            uiManager.loadAsyncPrefab(uiManager.UIID.GUIDE_UI,function () {},true);
            this.reelIdx = -1;
            return;
        }
    };

    module.isInReelStage = function (stage) {
        if (!this.reelGuideFlag ) return false;
        if (this.reelState === stage) {
            for (var i = 0 , len = cardLogic.reelIds.length; i <  len; i++) {
                var obj = cardLogic.reelIds[i];
                if (obj) {
                    this.reelIdx = i;
                    break;
                }
            }
            if (this.reelIdx === -1) {
                return false;
            }
            return true;
        }
        return false;
    };

    /** 设置引导索引 */
    module.setReelGuideFlag = function (stage) {
        userLogic.setFlagInfo(userLogic.Flag.ReelGuide,[stage]);//修改本地缓存
        var key = [userLogic.Flag.ReelGuide];
        userLogic.saveFlagInfo2Server(key);//修改远端
    };

    module.nextReelGuide = function () {
        if (!this.reelGuideFlag) return;
        this.reelState++;
        this.startReelGuide();
    };

    module.startReelGuide = function () {
        if (!this.reelGuideFlag) return;
        if (this.reelState === this.REEL_GUIDE.CLICK_FIGHT) {
            console.log("CLICK_FIGHT");
        }else if (this.reelState === this.REEL_GUIDE.OVER) {
            clientEvent.dispatchEvent("guideAction","clickFightReel")
            this.reelGuideFlag = false;
            this.setReelGuideFlag(-1);
            jsonTables.displaySpeed_Stop = false;
            msgHanderLogic.newAllMsg(null,0.01,constant.MsgHanderType.DISPLAY_STOP_RESUME,false);
        }

    };

    /**
     * 检查第一关的引导
     */
    module.checkFirstChapterGuide = function () {
        var flag = userLogic.getFlagInfoOneFlag(userLogic.Flag.GuideFirstChapter);
        return !!flag;
    };

    module.passFirstChapter = function() {
        userLogic.pushFlagInfo(userLogic.Flag.GuideFirstChapter,1);
        userLogic.saveFlagInfo2Server([userLogic.Flag.GuideFirstChapter]);
    };

    return module;
};
