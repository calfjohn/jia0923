/**
 * @Author: lich
 * @Date:   2018-07-19T18:39:54+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-16T10:25:55+08:00
 */

window["ui"]["manager"] = function() {
    var manager = {};
    var clientEvent = null;
    manager.root = undefined;
    manager.rootBlock = undefined;
    manager.rootName = "uiManagerRoot";
    manager.displayUiTime = 0.25;
    var activityLogic = null;
    var _EVENT_TYPE = [
        "openPanel",
        "closePanel"
    ];

    manager.destroyRoot = function () {
        if (this.root && cc.isValid(this.root)) {
            this.root.removeFromParent();
            this.root.destroy();
            this.container = cc.js.createMap();
        }
        this.root = undefined;
    };
    manager.getRoot = function(){
        if (!this.root || !cc.isValid(this.root)) {
            this.container = cc.js.createMap();
            var root = cc.find("Canvas");
            this.root = root.getChildByName(this.rootName);
            if (!this.root) {
                this.root = new cc.Node();
                this.root.addComponent("uiRoot");
                this.root.width = root.width;
                this.root.height = root.height;
                this.root.name = this.rootName;
                root.addChild(this.root,100);
                this.rootBlock = new cc.Node();
                this.rootBlock.addComponent(cc.BlockInputEvents);
                this.rootBlock.width = root.width;
                this.rootBlock.height = root.height;
                this.rootBlock.name = "blockNode";
                this.root.addChild(this.rootBlock,9999);
                this.rootBlock.active = false;
            }
        }
        return this.root;
    };

    manager.UIID = {
        MSG: 1,
        TIPMSG:2,
        WAITINGUI: 3,
        SETTLE:6,
        LINEUP:7,
        MONINFO:9,
        OPENBOXANI:11,//打开宝箱播放动画
        MINE_UI:12,
        MINE_UPGRADE:13,
        MINE_INFO:14,
        EQUIPMENT:15,
        MINE_SETMENT:16,
        RENAME:17,
        REELPANEL:18,
        AREAN_UI:19,
        AREAN_MATCH:20,
        AREAN_LOAD:21,
        AREAN_SETMENT:22,//竞技场升星界面
        ACHIEVE_UI:23,
        EQUIPUP:24,
        NOTICE:25,
        UPGRADE:26,
        GETBOXANI:27,
        STORY_TALK:28,
        SHOPPANEL:29,
        SMELTPANEL:30,
        MAILPANEL:31,
        RANKPANEL:32,
        REWARDMSG:33,
        AREAN_WAITE:34,
        TALENTPANEL:35,
        TOPHEAD:36,
        SAND_OFFICE:38,
        COPYUI:39,
        FRIENDPANEL:40,
        WORLDBOSS:41,
        CHATPANEL:42,
        SETTLE_GOLD:43,
        WORLD_RANK:44,
        SIGNIN:45,
        ADVENTURE_UI:46,
        WORLD_REWARD:47,
        AWAKENUPGRADE:48,
        ROLLPANEL:49,
        SEARCH:50,
        SETTING:51,
        FIGHT_PREVIEW:52,
        TREASURE_BOX:53,
        FIGHT_FAMILY:54,
        FLY_EFFECT:55,
        EXCLAMTORY:56,
        GUIDE_UI:57,
        WEB_UI:58,
        INFO_UI:59,
        FAMILY_EFFECT:60,
        CHAPTER_UI:61,
        SHARE_SETTLE:62,
        VIT_INFO:63,
        SELECT_CHARECTER:64,
        MYSTIC_SHOP:65,
        AREAN_SCORE:66,
        AREAN_SHOP:67,
        MAINSCENE_EFFECT:68,
        SHOP_TREASURE:69,
        BUY_CHECK:70,
        PRIVACY_POLICY:71,
        SMELT_REWARD:72,
        BIND_ACCOUNT: 73,
        AREAN_MAIL:74,
        ACTIVITY:75,
        EXCHANGE:76,
        DAILYACTIVITY:77,
        FIRSTCHARGE:78,
        INVITE:79,
        AREAN_RANK:80,
        ACT_DRAWCARD: 81,
        ACT_DRAWCARD_SCORE: 82,
        ACT_DRAWCARD_REWARD: 83,
        ACT_DRAWCARD_RULE: 84,
        FIVE_STAR: 85,
        ACT_LIMIT_PACK: 86,
        ACT_DRAWCARD_SHOP:87,
        FAMILY_EFFECTEX:88,
        ACT_START_MSG:89,
        SHARE_LEAD:90,
        DRAW_CARD: 91,
        FIRSTPACKPANEL: 92,
        ACT_MONTH_CARD_RULE: 93,
        SCORE_SHOP: 94,
        EDIT_PANEL: 95,
        CUMULATIVE_PANEL: 96,
        DEBRRIS_MSG:97,
        DRAW_EQUIP: 98,
        ACT_SPRING: 99,
        RED_BAG:100
    };

    manager.FIGHT_END_PANEL_UIID = [manager.UIID.SETTLE,manager.UIID.MINE_SETMENT,manager.UIID.AREAN_SETMENT,manager.UIID.SETTLE_GOLD];

    //界面资源映射关系 NOTE 0-->预制体名字 1-->是否全屏 2--->topheadStyle 3 --->是否进行显隐动画  4------>是否需要适配ipad  5----->是否需要适配ipx
    var UI_RES_MAPPING = {};
    UI_RES_MAPPING[manager.UIID.RED_BAG] = ["redBagPanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.ACT_SPRING] = ["springPanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.CUMULATIVE_PANEL] = ["cumulativePanel",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.EDIT_PANEL] = ["editPanel",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SETTLE] = ["settlement",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.LINEUP] = ["lineUp",true,constant.TopHeadStatus.DEBRIS,false,true];
    UI_RES_MAPPING[manager.UIID.DEBRRIS_MSG] = ["debrisMsg",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.MONINFO] = ["monInfo",true,constant.TopHeadStatus.DEBRIS,false,true];
    UI_RES_MAPPING[manager.UIID.CHAPTER_UI] = ["chapterPanel",true,constant.TopHeadStatus.NOEXP,true,true];
    UI_RES_MAPPING[manager.UIID.OPENBOXANI] = ["openBoxAni",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.MINE_UI] = ["minePanel",true,constant.TopHeadStatus.NOVIT,true,true];
    UI_RES_MAPPING[manager.UIID.MINE_UPGRADE] = ["mineUpgrade",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.MINE_INFO] = ["mineInfo",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.EQUIPMENT] = ["equipment",true,constant.TopHeadStatus.NOVIT,true,true];
    UI_RES_MAPPING[manager.UIID.MINE_SETMENT] = ["mineSetMent",false,constant.TopHeadStatus.CLOSE,true,false];
    UI_RES_MAPPING[manager.UIID.RENAME] = ["rename",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.REELPANEL] = ["reelPanel",true,constant.TopHeadStatus.NOVIT,false,true];
    UI_RES_MAPPING[manager.UIID.AREAN_UI] = ["areanPanel",true,constant.TopHeadStatus.NOEXP,true,true];
    UI_RES_MAPPING[manager.UIID.AREAN_MATCH] = ["areanMatch",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.AREAN_LOAD] = ["areanLoading",true,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.AREAN_SETMENT] = ["areanSetMent",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.ACHIEVE_UI] = ["achievementPanel",true,constant.TopHeadStatus.NOEXP,true,true];
    UI_RES_MAPPING[manager.UIID.EQUIPUP] = ["equipUp",true,constant.TopHeadStatus.NOVIT,true,true];
    UI_RES_MAPPING[manager.UIID.NOTICE] = ["noticePanel",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.UPGRADE] = ["upgrade",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.GETBOXANI] = ["getBoxAni",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.STORY_TALK] = ["storyTalk",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SHOPPANEL] = ["shopPanel",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.FIRSTPACKPANEL] = ["firstPackPanel",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.SMELTPANEL] = ["smeltPanel",true,constant.TopHeadStatus.NOVIT,false,true];
    UI_RES_MAPPING[manager.UIID.MAILPANEL] = ["mailPanel",true,constant.TopHeadStatus.NOEXP,true,true];
    UI_RES_MAPPING[manager.UIID.RANKPANEL] = ["rankPanel",true,constant.TopHeadStatus.NOEXP,true,true];
    UI_RES_MAPPING[manager.UIID.REWARDMSG] = ["rewardMsg",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.AREAN_WAITE] = ["areanWait",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.TALENTPANEL] = ["talentPanel",true,constant.TopHeadStatus.NOVIT,true,true];
    UI_RES_MAPPING[manager.UIID.TOPHEAD] = ["topHead",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.SAND_OFFICE] = ["sandOfficePanel",false,constant.TopHeadStatus.CLOSE,true,false];
    UI_RES_MAPPING[manager.UIID.COPYUI] = ["copyPanel",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.WORLDBOSS] = ["worldBossPanel",false,constant.TopHeadStatus.PANEL,true,true,true];
    UI_RES_MAPPING[manager.UIID.FRIENDPANEL] = ["friendPanel",true,constant.TopHeadStatus.PANEL,true];
    UI_RES_MAPPING[manager.UIID.CHATPANEL] = ["chatPanel",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SETTLE_GOLD] = ["settlementGold",false,constant.TopHeadStatus.PANEL,true];
    UI_RES_MAPPING[manager.UIID.WORLD_RANK] = ["worldBossRank",false,constant.TopHeadStatus.PANEL,true];
    UI_RES_MAPPING[manager.UIID.SIGNIN] = ["signIn",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.ADVENTURE_UI] = ["adventurePanel",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.WORLD_REWARD] = ["worldBossReward",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.AWAKENUPGRADE] = ["awakenUpgrade",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.ROLLPANEL] = ["rollPanel",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SEARCH] = ["search",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SETTING] = ["setting",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.FIGHT_PREVIEW] = ["fightPreview",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.TREASURE_BOX] = ["treasureBox",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.FIGHT_FAMILY] = ["fightFamily",false,constant.TopHeadStatus.CLOSE,true,true];
    UI_RES_MAPPING[manager.UIID.FLY_EFFECT] = ["flyEffect",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.EXCLAMTORY] = ["exclamatoryMark",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.GUIDE_UI] = ["guideNode",false,constant.TopHeadStatus.CLOSE,false,true];
    UI_RES_MAPPING[manager.UIID.WEB_UI] = ["webUi",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.INFO_UI] = ["information",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.FAMILY_EFFECT] = ["familyEffect",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.FAMILY_EFFECTEX] = ["familyEffectEx",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SHARE_SETTLE] = ["shareGameSettle",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.VIT_INFO] = ["vitInfo",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.SELECT_CHARECTER] = ["selectCharacter",false,constant.TopHeadStatus.CLOSE,false,true];
    UI_RES_MAPPING[manager.UIID.MYSTIC_SHOP] = ["mysticalProfiteers",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.AREAN_SCORE] = ["areanScorePanel",false,constant.TopHeadStatus.UNCLOSE,false];
    UI_RES_MAPPING[manager.UIID.AREAN_SHOP] = ["areanShop",false,constant.TopHeadStatus.CLOSE,true];
    UI_RES_MAPPING[manager.UIID.MAINSCENE_EFFECT] = ["mainSceneEffect",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.SHOP_TREASURE] = ["shopTreasureBox",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.BUY_CHECK] = ["buyCheck",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.PRIVACY_POLICY] = ["privacyPolicy",false,constant.TopHeadStatus.CLOSE,false,true];
    UI_RES_MAPPING[manager.UIID.SMELT_REWARD] = ["smeltReward",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.BIND_ACCOUNT] = ["bindAccount", false, constant.TopHeadStatus.CLOSE, false];
    UI_RES_MAPPING[manager.UIID.AREAN_MAIL] = ["areanMail", false, constant.TopHeadStatus.CLOSE, false];
    UI_RES_MAPPING[manager.UIID.ACTIVITY] = ["activityPanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.EXCHANGE] = ["exchange", false, constant.TopHeadStatus.CLOSE, false, false];
    UI_RES_MAPPING[manager.UIID.DAILYACTIVITY] = ["dailyActivityPanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.FIRSTCHARGE] = ["firstChargePanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.AREAN_RANK] = ["areanRankPanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.INVITE] = ["invitePanel", false, constant.TopHeadStatus.CLOSE, false, false];
    UI_RES_MAPPING[manager.UIID.ACT_DRAWCARD] = ["actDrawCardPanel", true, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.ACT_DRAWCARD_SCORE] = ["actDrawCardScore", false, constant.TopHeadStatus.CLOSE, false, false];
    UI_RES_MAPPING[manager.UIID.ACT_DRAWCARD_REWARD] = ["actDrawCardReward", false, constant.TopHeadStatus.CLOSE, false, true];
    UI_RES_MAPPING[manager.UIID.ACT_DRAWCARD_RULE] = ["actDrawCardRule", false, constant.TopHeadStatus.CLOSE, false, false];
    UI_RES_MAPPING[manager.UIID.FIVE_STAR] = ["fiveStar", false, constant.TopHeadStatus.CLOSE, false, false];
    UI_RES_MAPPING[manager.UIID.ACT_LIMIT_PACK] = ["actLimitPackPanel", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.ACT_DRAWCARD_SHOP] = ["actDrawCardShop", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.ACT_START_MSG] = ["actStartMsg", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.SHARE_LEAD] = ["shareLead",false,constant.TopHeadStatus.CLOSE,false];
    UI_RES_MAPPING[manager.UIID.DRAW_CARD] = ["drawCardPanel", true, constant.TopHeadStatus.NOVITEXP, true, true];
    UI_RES_MAPPING[manager.UIID.DRAW_EQUIP] = ["drawEquipPanel", true, constant.TopHeadStatus.NOVITEXP, true, true];
    UI_RES_MAPPING[manager.UIID.ACT_MONTH_CARD_RULE] = ["actMonthCardRule", false, constant.TopHeadStatus.CLOSE, true, true];
    UI_RES_MAPPING[manager.UIID.SCORE_SHOP] = ["scoreShopPanel",false,constant.TopHeadStatus.CLOSE,true,true];

    //UI的层级关系
    var UI_ORDER = {};

    UI_ORDER[manager.UIID.DEBRRIS_MSG] = 100;
    UI_ORDER[manager.UIID.EDIT_PANEL] = 1000;
    UI_ORDER[manager.UIID.SHARE_LEAD] = 1000;
    UI_ORDER[manager.UIID.RED_BAG] = 999;
    UI_ORDER[manager.UIID.ACT_START_MSG] = 10;
    UI_ORDER[manager.UIID.CUMULATIVE_PANEL] = 9;
    UI_ORDER[manager.UIID.FIRSTPACKPANEL] = 9;
    UI_ORDER[manager.UIID.SCORE_SHOP] = 5;
    UI_ORDER[manager.UIID.FIVE_STAR] = 10;
    UI_ORDER[manager.UIID.EXCHANGE] = 4;
    UI_ORDER[manager.UIID.INVITE] = 5;
    UI_ORDER[manager.UIID.DRAW_CARD] = 4;
    UI_ORDER[manager.UIID.DRAW_EQUIP] = 5;
    UI_ORDER[manager.UIID.AREAN_MAIL] = 100;
    UI_ORDER[manager.UIID.MAINSCENE_EFFECT] = 100;
    UI_ORDER[manager.UIID.FAMILY_EFFECT] = 60;
    UI_ORDER[manager.UIID.FAMILY_EFFECTEX] = 61;
    UI_ORDER[manager.UIID.LINEUP] = 4;
    UI_ORDER[manager.UIID.CLEARINGUI] = 2;
    UI_ORDER[manager.UIID.MAILPANEL] = 2;
    UI_ORDER[manager.UIID.RANKPANEL] = 3;
    UI_ORDER[manager.UIID.MINE_UPGRADE] = 2;
    UI_ORDER[manager.UIID.MINE_INFO] = 2;
    UI_ORDER[manager.UIID.EQUIPMENT] = 3;
    UI_ORDER[manager.UIID.AREAN_MATCH] = 3;
    UI_ORDER[manager.UIID.EQUIPUP] = 4;
    UI_ORDER[manager.UIID.NOTICE] = 500;
    UI_ORDER[manager.UIID.UPGRADE] = 500;
    UI_ORDER[manager.UIID.GETBOXANI] = 3;
    UI_ORDER[manager.UIID.STORY_TALK] = 3000;
    UI_ORDER[manager.UIID.GUIDE_UI] = 2999;
    UI_ORDER[manager.UIID.SHOPPANEL] = 9;
    UI_ORDER[manager.UIID.OPENBOXANI] = 10;
    UI_ORDER[manager.UIID.MONINFO] = 5;
    UI_ORDER[manager.UIID.AREAN_UI] = 2;
    UI_ORDER[manager.UIID.AREAN_SCORE] = 3;
    UI_ORDER[manager.UIID.AREAN_SHOP] = 3;
    UI_ORDER[manager.UIID.MINE_UI] = 2;
    UI_ORDER[manager.UIID.REELPANEL] = 4;
    UI_ORDER[manager.UIID.SMELTPANEL] = 6;
    UI_ORDER[manager.UIID.SMELT_REWARD] = 7;
    UI_ORDER[manager.UIID.CHAPTER_UI] = 2;
    UI_ORDER[manager.UIID.RENAME] = 5;
    UI_ORDER[manager.UIID.REWARDMSG] = 20;
    UI_ORDER[manager.UIID.AREAN_WAITE] = 15;
    UI_ORDER[manager.UIID.TALENTPANEL] = 4;
    UI_ORDER[manager.UIID.FRIENDPANEL] = 2;
    UI_ORDER[manager.UIID.CHATPANEL] = 3;
    UI_ORDER[manager.UIID.WORLD_RANK] = 3;
    UI_ORDER[manager.UIID.WORLD_REWARD] = 3;
    UI_ORDER[manager.UIID.SIGNIN] = 2;
    UI_ORDER[manager.UIID.ADVENTURE_UI] = 2;
    UI_ORDER[manager.UIID.AWAKENUPGRADE] = 11;
    UI_ORDER[manager.UIID.ROLLPANEL] = 1000;
    UI_ORDER[manager.UIID.SEARCH] = 3;
    UI_ORDER[manager.UIID.SETTING] = 3;
    UI_ORDER[manager.UIID.FIGHT_PREVIEW] = 3;
    UI_ORDER[manager.UIID.FIGHT_FAMILY] = 4;
    UI_ORDER[manager.UIID.FLY_EFFECT] = 50;
    UI_ORDER[manager.UIID.WEB_UI] = 9999;
    UI_ORDER[manager.UIID.INFO_UI] = 4;
    UI_ORDER[manager.UIID.SHARE_SETTLE] = 5;
    UI_ORDER[manager.UIID.VIT_INFO] = 50;
    UI_ORDER[manager.UIID.MYSTIC_SHOP] = 5;
    UI_ORDER[manager.UIID.SHOP_TREASURE] = 10;
    UI_ORDER[manager.UIID.BUY_CHECK] = 10;
    UI_ORDER[manager.UIID.PRIVACY_POLICY] = 10;
    UI_ORDER[manager.UIID.BIND_ACCOUNT] = 10;
    UI_ORDER[manager.UIID.AREAN_RANK] = 3;
    UI_ORDER[manager.UIID.ACTIVITY] = 8;
    UI_ORDER[manager.UIID.ACT_SPRING] = 8;
    UI_ORDER[manager.UIID.DAILYACTIVITY] = 8;
    UI_ORDER[manager.UIID.ACT_DRAWCARD] = 8;
    UI_ORDER[manager.UIID.ACT_DRAWCARD_SCORE] = 10;
    UI_ORDER[manager.UIID.ACT_DRAWCARD_REWARD] = 10;
    UI_ORDER[manager.UIID.ACT_DRAWCARD_RULE] = 10;
    UI_ORDER[manager.UIID.ACT_LIMIT_PACK] = 10;
    UI_ORDER[manager.UIID.ACT_DRAWCARD_SHOP] = 9;
    UI_ORDER[manager.UIID.ACT_MONTH_CARD_RULE] = 9;

    manager.init = function() {
        window.uiManager = this;
        clientEvent = kf.require("basic.clientEvent");
        clientEvent.addEventType(_EVENT_TYPE);
        this.curSceneID = constant.SceneID.NONE;
        this.openedCount = 0;//开启计数
        this.rootContainer = cc.js.createMap();
        this.container = cc.js.createMap();
        this.flyContainer = cc.js.createMap();
        activityLogic = kf.require("logic.activity");
        this.unIncluseList = [manager.UIID.MSG,manager.UIID.TIPMSG,manager.UIID.WAITINGUI,manager.UIID.EDIT_PANEL,manager.UIID.ROLLPANEL,manager.UIID.INFO_UI];//不需要关闭聊天界面的界面ID
    };
    /** 注册飞行结尾节点 */
    manager.regisFlyNode = function (nodes) {
        // this.flyContainer = cc.js.createMap();
        for (var i = 0 , len = nodes.length; i <  len; i++) {
            var obj = nodes[i];
            if (i === 0 || (!obj && this.flyContainer[i])) continue;
            this.flyContainer[i] = obj;
        }
    };

    manager.getFlyNode = function (type) {
        if (!this.flyContainer) return null;
        type = type === constant.ItemType.EXP?6:type;
        return this.flyContainer[type] || null;
    };

    manager.setCurSceneID = function(sceneID){
        this.curSceneID = sceneID;
    };
    manager.getCurSceneID = function(){
        return  this.curSceneID;
    };

    manager.setRootBlockActive = function (visible) {
        if (!this.rootBlock || !cc.isValid(this.rootBlock)) {
            this.getRoot();
        }
        this.rootBlock.active = visible;
    };

    /** 偷偷的加载一个东西 */
    manager.loadAsyncPrefab = function(UIID,callback,isInstant){
        var loadCallback = function(prefab){
            if (isInstant && !this.getUI(UIID)) {
                var root = this.getRoot();
                var node = root.getInstance(prefab,true);
                node.active = false;
                var scriptName = this.splitName(UI_RES_MAPPING[UIID][0]);
                var ui = node.getComponent(scriptName);
                this.registerUI(UIID, ui);
            }
            if (callback) callback(prefab);
        }.bind(this);
        uiResMgr.newPrefabInstance(UI_RES_MAPPING[UIID][0],loadCallback);
    };

    //注册UI
    manager.registerRootUI = function(UIID, instance) {
        this.rootContainer[UIID] = instance;
    };

    manager.getUI_ORDER = function(UIID){
        return UI_ORDER[UIID] || 0;
    };

    manager.getUI_RES_MAPPING = function(UIID){
        return  UI_RES_MAPPING[UIID];
    };

    //注册UI
    manager.registerUI = function(UIID, instance) {
        if (!cc.isValid(instance)) {
            if (CC_DEBUG) {
                debugger
            }
            return;
        }
        if (!this.container[UIID]) {
            var oldFunc = !instance.onDestroy ? function(){}:instance.onDestroy.bind(instance);
            instance.onDestroy = function(){
                uiManager.releaseUI(UIID);
                oldFunc();
            }.bind(instance);

            var oldCloseFunc = !instance.close ? function(){}:instance.close.bind(instance);
            instance.close = function(_,param){//如果传递的参数 被转换为true 标识强制关闭  否则会播放一次动画
                clientEvent.dispatchEvent("closePanel",UIID);
                uiManager._desrFullScreen(UIID);
                if ((typeof param === 'string' && param === 'true') || (typeof param === 'boolean' && param)) {
                    oldCloseFunc();
                    return;
                }
                uiManager.doFadeOut(UIID,this.node,oldCloseFunc);
            }.bind(instance);
        }
        this.container[UIID] = instance;
        //设置显示层级
        var order = UI_ORDER[UIID] * 2;
        if (order) {
            instance.node.setLocalZOrderEx(order);
        }else{
            instance.node.setLocalZOrderEx(0);//没有写层级的默认设为最底层
        }
    };

    manager.isFadeVaild = function (UIID) {
        return UI_RES_MAPPING[UIID] && UI_RES_MAPPING[UIID][3];
    };

    manager.doFadeIn = function (UIID,node,callBack) {
        node.opacity = 255;
        var children = node.children;
        if (children.length === 0 || this.rootContainer[UIID] ||!this.isFadeVaild(UIID)) return callBack();
        uiManager.setRootBlockActive(true);
        node._opacityDiy = node.opacity || 255;
        node.opacity = 0;
        var fadeTo = cc.fadeTo(uiManager.displayUiTime,node._opacityDiy);
        var callFuc = cc.callFunc(function(){
            uiManager.setRootBlockActive(false);
            callBack();
        });
        var seq = cc.sequence(fadeTo,callFuc);
        node.runAction(seq);
    };
    /** 做消失 */
    manager.doFadeOut = function (UIID,node,callBack) {
        var children = node.children;
        if (children.length === 0 || this.rootContainer[UIID] ||!this.isFadeVaild(UIID)) return callBack();
        uiManager.setRootBlockActive(true);
        node.opacity = node._opacityDiy || 255;
        var fadeTo = cc.fadeTo(uiManager.displayUiTime,0);
        var callFuc = cc.callFunc(function(){
            uiManager.setRootBlockActive(false);
            callBack();
        });
        var seq = cc.sequence(fadeTo,callFuc);
        node.runAction(seq);
    };

    //释放UI
    manager.releaseUI = function(UIID, callback) {
        if (this.container[UIID]) {
            this.closeUI(UIID,true);//强制调用一次close 保证界面计数正确性
            if (this.container[UIID].release) {
                this.container[UIID].release(callback);
            }
            delete this.container[UIID];
        }
    };
    /**
     * 调用界面上的方法
     * @param  {int} UIID      [界面唯一id]
     * @param  {string} funcName 方法名
     * @param  {Array} funcParam 透传参数
     * @return true sucess otherwise error Msg
     */
    manager.callUiFunc = function(UIID,funcName,funcParam){
        var ui = this.getUI(UIID);
        if (!ui) return cc.error("call UiFunc  must instance it",UI_RES_MAPPING[UIID][0]);
        var func = ui[funcName];
        if (!func) return cc.warn(UI_RES_MAPPING[UIID][0],"name -" +
            "",funcName,"done't exist!");
        funcParam = funcParam || [];
        func.apply(ui, funcParam);
        return true;
    };

    //获取UI
    manager.getUI = function(UIID) {
        if (this.container[UIID]) {
            return this.container[UIID];
        }
        return this.rootContainer[UIID];
    };
    //获取UIActive
    manager.getUIActive = function(UIID) {
        if (this.container[UIID]) {
            return this.container[UIID].node.active;
        }else if (this.rootContainer[UIID]) {
            return this.rootContainer[UIID].node.active;
        }else if(uiResMgr.containerCache[uiResMgr.RTYPE.PREFAB][UI_RES_MAPPING[UIID][0]]){//正在加载这个界面
            return true;
        }
        return false;
    };

    manager.closeAllUI = function(){
        for (var key in  this.container) {
            if (this.container[key].node && this.container[key].node.active) {
                this.closeUI(key,true);//关闭所有界面  时  标识出现特殊情况 比如切场景  这是直接关闭所有界面不需要动画浪费性能
            }
        }
        this.openedCount = 0;
        uiManager.setRootBlockActive(false);
        clientEvent.dispatchEvent("closePanel",-1);
    };

    //关闭UI isWithOutAni播放淡出标识
    manager.closeUI = function(UIID,isWithOutAni) {
        var ui = this.getUI(UIID);
        if (ui && ui.node && cc.isValid(ui.node) && ui.node.active && ui.close) {
            ui.close(null,isWithOutAni);
        }
    };

    //打开ui
    manager.openUI = function(UIID) {
        if(uiManager.getUIActive(uiManager.UIID.CHATPANEL) && this.unIncluseList.indexOf(UIID) === -1){
            uiManager.closeUI(uiManager.UIID.CHATPANEL);
            setTimeout(function () {
                uiManager.openUI(UIID);
            }.bind(this),200);
            return;
        }
        var ui = this.getUI(UIID);
        // 从第二个参数到最后一个参数
        var args = Array.prototype.slice.call(arguments, 1);
        if (!ui) {
            //UI缓存中如果不存在，从资源中加载
            if (!UI_RES_MAPPING[UIID])  return cc.error("UIID",UIID,"在map表中不存在");
            var prefabName = UI_RES_MAPPING[UIID][0];
            uiManager.openUI(uiManager.UIID.WAITINGUI);
            var root = this.getRoot();
            this.setRootBlockActive(true);
            var instanceCall = function(prefab){
                var node = root.getInstance(prefab,true);
                var scriptName = this.splitName(prefabName);
                node.opacity = 0;
                ui = node.getComponent(scriptName);
                this.registerUI(UIID, ui);
                uiManager.callUiFunc(UIID,"open",args);
                window.adjustUtil.recored(tb.ADJUST_RECORED_UI,UIID);
                UI_RES_MAPPING[UIID][4] && this.fitScreen(node, UI_RES_MAPPING[UIID][5]);
                uiManager.doFadeIn(UIID,node,function(){
                    clientEvent.dispatchEvent("openPanel",UIID);
                    uiManager._addFullScreen(UIID);
                    uiManager.closeUI(uiManager.UIID.WAITINGUI);
                    this.setRootBlockActive(false);
                }.bind(this));
            }.bind(this);
            uiResMgr.newPrefabInstance(prefabName,instanceCall);
        }else {
            ui.node.active = true;
            uiManager.callUiFunc(UIID,"open",args);
            window.adjustUtil.recored(tb.ADJUST_RECORED_UI,UIID);
            uiManager.doFadeIn(UIID,ui.node,function(){
                if(!uiManager.rootContainer[UIID]){
                    clientEvent.dispatchEvent("openPanel",UIID)
                }
                uiManager._addFullScreen(UIID);
            });
        }
        return ui;
    };
    //关闭地上的一个界面
    manager.closeTopPanel = function () {
        var root = this.getRoot();
        if (root.children.length === 0) {
            return false;
        }
        var childs = root.children;
        for(var i = childs.length-1;i > -1;i--){
            var node = childs[i];
            if (node.name === "topHead") continue;
            if (node.active) {
                var UIID = this.getUIIDByPanelName(node.name);
                if (UIID === -1) continue;
                var ui = this.getUI(UIID);
                if (kf.inArray(this.FIGHT_END_PANEL_UIID,Number(UIID)) && ui.backMainScene) {
                    ui.backMainScene();
                }else {
                    uiManager.closeUI(UIID);
                }
                return true;
            }
        }
        return false;
    };

    manager._addFullScreen = function(UIID){
        if (!UI_RES_MAPPING[UIID] || !UI_RES_MAPPING[UIID][1]) return;// NOTE: 不存在或者为false就不要管了
        if (this.openedCount === 0) {
            clientEvent.dispatchEvent('setSceneVisible',false);
        }
        this.openedCount++;
    };

    manager._desrFullScreen = function(UIID){
        if (!UI_RES_MAPPING[UIID] || !UI_RES_MAPPING[UIID][1]) return;// NOTE: 不存在或者为false就不要管了
        this.openedCount--;
        if (this.openedCount <= 0) {
            this.openedCount = 0;
            setTimeout(function(){
                clientEvent.dispatchEvent('setSceneVisible',true);
            },50);
        }
    };

    manager.getUIIDByPanelName = function (panelName) {
        for (var UIID in UI_RES_MAPPING) {
            if (!UI_RES_MAPPING.hasOwnProperty(UIID)) continue;
            if (UI_RES_MAPPING[UIID][0] === panelName) {
                return UIID;
            }
        }
        return -1;
    };

    manager.refreshView = function(data){
        var content = data.content;
        var list = data.list;
        var isFresh = data.isFresh;
        var scrolNode = data.scrolNode;
        var prefab = data.prefab;
        var prefabName = prefab.name;
        var isUsePool = !!data.isUsePool;
        if (isUsePool) {
            prefabName = data.prefab;
        }
        var ext = data.ext;
        var msgItem;
        for(var i = 0; i < list.length; i++) {
            if(content.children[i]) {
                msgItem = content.children[i];
            }
            else {
                msgItem = isUsePool ? uiResMgr.getPrefabEx(prefabName) : cc.instantiate(prefab);
                msgItem.parent = content;
            }
            var script = msgItem.getComponent(prefabName);
            if (script) {
                script.init(i, list[i],ext);
            }
        }
        if (isFresh && scrolNode) {
            scrolNode.getComponent(cc.ScrollView).scrollToTop(0.10);
        }

        if(content.children.length > list.length) {
            for(var j = list.length; j < content.children.length; ) {
                var node = content.children[j];
                if (isUsePool) {
                    uiResMgr.putInPool(prefabName,node);
                }else {
                    node.removeFromParent();
                    node.destroy();
                }
            }
        }
    };

    manager.intervalCall = function(data){
        var node = data.node;
        if (!node) return;
        var interval = data.interval || 1;
        var func = data.callFunc || function(){};
        node.stopAllActions();
        var delay = cc.delayTime(interval);
        var callFunc = cc.callFunc(func);
        var sequence = cc.sequence(callFunc,delay);
        var repeat = cc.repeatForever(sequence)
        node.runAction(repeat);
    };

    manager.isPlayAnim = function(comp,animName){
        if(comp && comp.currentClip
            && comp.currentClip.name === animName
            && comp.getAnimationState(animName)
            && comp.getAnimationState(animName).isPlaying) return true;
        return false;
    };

    manager.splitName = function(name){
        return name;
    };
    /**
     * 做一个抖动行为
     * @param  {ccobj} node [目标节点]
     * @param  {[type]} data [description]
     * @return {boolean}      是否成功
     */
    manager.addShakerEffect = function (node,data) {
        if (node === null || !data) return false;
        var actionName = 'ShakerActionName';
        var shaker = {}
        shaker.init_x = (data && data.init_x) ? data.init_x : 0;       //[[初始位置x]]
        shaker.init_y = (data && data.init_y) ? data.init_y : 0;       //[[初始位置y]]
        shaker.diff_x = (data && data.diff_x) ? data.diff_x : 0;       //[[偏移量x]]
        shaker.diff_y = (data && data.diff_y) ? data.diff_y : 0;       //[[偏移量y]]
        shaker.diff_max = (data && data.diff_max) ? data.diff_max : 10;     //[[最大偏移量]]
        shaker.interval = (data && data.interval) ? data.interval : 0.01;  //[[震动频率]]
        shaker.totalTime = (data && data.totalTime) ? data.totalTime * 1000 : 0;    //[[震动时间]]
        shaker.callBack = (data && data.callBack) ? data.callBack : null;    //[[回调]]

        shaker.time = 0;         //[[计时器]]
        shaker.target = node;
        shaker.init_x = node.x;
        shaker.init_y = node.y;
        shaker.lastTime = new Date().getTime();
        if (shaker.target[actionName]) {//如果存在旧的动作 未完成 强制停止
            shaker.target.stopAction(shaker.target[actionName]);
            shaker.target[actionName] = null;
        }

        var delay = cc.delayTime(shaker.interval);
        var shakerFunc = cc.callFunc(function(){
            if (this.time >= this.totalTime){
                this.target.stopAction(this.target[actionName]);
                this.target[actionName] = null;
                this.target.setPosition(this.init_x, this.init_y);
                this.target = null;
                if (this.callBack) this.callBack();
                return;
            }
            var now = new Date().getTime();
            this.time = this.time + (now - this.lastTime);
            this.lastTime = now;
            this.diff_x = Math.random()*(this.diff_max + this.diff_max+1)-this.diff_max;
            this.diff_y = Math.random()*(this.diff_max + this.diff_max+1)-this.diff_max;
            this.target.setPosition(this.init_x+this.diff_x, this.init_y+this.diff_y);
        }.bind(shaker),shaker);
        var seq = cc.sequence(shakerFunc,delay);
        var repeat = cc.repeatForever(seq);
        shaker.target[actionName] = repeat;
        shaker.target.runAction(repeat);
        return true;
    };
    /** 做全屏抖动  2.0后驱动摄像机节点  暂时不要使用 */
    manager.doScreenShaker = function (data) {
        var node = cc.find("Canvas");
        if (!node) return false;
        return this.addShakerEffect(node,data);
    };
    //最经常使用的msg的通用弹窗，传入message和确认回调
    manager.msgDefault = function(str,cb){
        var message = {
            "message":  str,
            "button1":{
                "name": uiLang.getMessage("b", "MBCANCEL"),
                "callback": function(){}
            },
            "button3":{
                "name": uiLang.getMessage("b", "MBOK"),
                "callback":cb
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    };
    //最经常使用的msg的通用弹窗，只有一个确认按钮
    manager.msgConfirm = function (str,cb) {
        var message = {
            "message":  str,
            "button2":{
                "name": uiLang.getMessage("b", "MBOK"),
                "callback":cb
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    };

    manager.doBezierTo = function (startPos,endPos,time,rotaCount,call) {
        var midX = (startPos.x + endPos.x) *0.75;
        var fPos = (startPos.x + endPos.x) *0.25;
        var bezier = [cc.v2(fPos,370),cc.v2(midX,370),endPos];
        var bezierTo = cc.bezierTo(time, bezier);
        var rotate = cc.rotateTo(time,360 * rotaCount);
        var scale1 = cc.scaleTo(time/2,1.5);
        var scale2 = cc.scaleTo(time/2,1);
        var seq = cc.sequence(scale1,scale2);
        var spawn = cc.spawn(rotate,bezierTo,seq);
        var sequence = cc.sequence(spawn,call);
        return sequence;
    };

    manager.openChapter = function (id,isKeep) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CHAPTERSTYLE,id);
        if (config[jsonTables.CONFIG_CHAPTERSTYLE.Data].isNew) {
            uiManager.openUI(uiManager.UIID.CHAPTER_UI,id,isKeep);
        }else {
            console.log("为什么还存在旧的关卡 引用");
        }
    };

    //钻石不足
    manager.tipDiamondLess = function () {
        var message = {
            "message":  uiLang.getMessage("actDrawCardPanel", "diamondLess"),
            "button1":{
                "name": uiLang.getMessage("b", "MBCANCEL"),
                "callback": function(){}
            },
            "button3":{
                "name": uiLang.getMessage("b", "gotoShop"),
                "callback":function () {
                    if(activityLogic.checkDiamonOpen()){
                        uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
                    }else{
                        uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
                    }
                }.bind(this)
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    };

    manager.fitScreen = function (node, fixIpx) {
        var scaleNode = node.getChildByName("shrink");
        if(!scaleNode) return;
        var winSize = cc.view.getFrameSize();
        var height = Math.max(winSize.height, winSize.width);
        var width = Math.min(winSize.height, winSize.width);
        var rate2 = height/width;
        if(rate2 < 1.58){
            scaleNode.scale = 1 / rate2;
        }

        var ipxNode = scaleNode.getChildByName("ipx");
        if(ipxNode && fixIpx && rate2 > 2) {
            var widget = ipxNode.getComponent(cc.Widget);
            widget && (widget.left = 50);
        }
    };

    return manager;
};
