var panel = require("panel");
const listerComp = require('chapterMinLisnter');
cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        listerComp:listerComp,
        flyBindNode:[cc.Node],
        weakerPrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.initNodes();
        this.listerComp.init(this);
        this.itemCells = [];
        // this.refreshMainBtnActive();
        uiManager.regisFlyNode(this.flyBindNode);
        this.cardLogic.checkLineUpRedDot();
    },

    initNodes:function(){
        this.miniMap = this.widget('chapterPanelEx/miniMap');
        this.bg = this.widget('chapterPanelEx/allWorld/sky');
        this.widget('chapterPanelEx/allWorld').zIndex = 1;
        this.widget('chapterPanelEx/miniMap').zIndex = 5000;
        this.widget('chapterPanelEx/shrink').zIndex = 9999;
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshAdventure", this.refreshAdventure.bind(this)],
            ["checkLineUpRedDot", this.checkLineUpRedDot.bind(this),true],
            ["refreshGetNew", this.refreshGetNew.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickMonster", this.clickMonster.bind(this)],//点击关卡
            ["chpaterMove", this.chpaterMove.bind(this)],//关卡
        ]
        this.registerNodeEvent(registerHandler);
    },

    refreshGetNew:function () {
        this.widget("chapterPanel/shrink/down/lineUp/talk").active = this.cardLogic.getIsPlaySpecial();
        this.widget("chapterPanel/shrink/down/lineUp/flashOfLight").active = this.widget("chapterPanel/shrink/down/lineUp/talk").active;
    },

    checkLineUpRedDot:function (state) {
        this.widget("chapterPanel/shrink/down/lineUp/redPoint").active = state;
    },

    // refreshMainBtnActive:function(){
    //     this.setFunVisible("chapterPanelEx/shrink/down/lineUp",constant.FunctionTid.LINEUP);
    //     this.setFunVisible("chapterPanelEx/shrink/down/task",constant.FunctionTid.REEL);
    // },
    // setFunVisible:function(nodePath,tid){
    //     if (this.widget(nodePath).active) {//如果显示标识未被后台控制
    //         this.widget(nodePath).active = jsonTables.isFunVisible(tid);
    //         if (this.widget(nodePath).active) {
    //             this.widget(nodePath).active = jsonTables.funOpenCheck(tid);
    //         }
    //     }
    // },

    refreshAdventure:function(){
        this.initPanel(false);
    },

    chpaterMove:function(event){//
        event.stopPropagation();
        var pos = event.getUserData();
        this.widget("chapterPanel/miniMap/content/landBottom").x += pos.x;
        this.widget("chapterPanel/miniMap/content/landBottom").y += pos.y;
        this.widget("chapterPanel/miniMap/content/bottom").x += pos.x;
        this.widget("chapterPanel/miniMap/content/bottom").y += pos.y;
    },

    clickMonster:function(event){
        event.stopPropagation();
        var script = event.getUserData();
        var id = script.getMonsterID();
        var isLock = this.chapterLogic.isUnlockChapter(this.id,id);
        if (!isLock) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("fightPreview",'lock'));
        this.clientEvent.dispatchEvent("clickOneChapter");
        uiManager.openUI(uiManager.UIID.FIGHT_PREVIEW,this.id,id);
        window.adjustUtil.recored(tb.ADJUST_RECORED_DUNGEON_ENTRANCE, this.id,id);
    },

    initPanel:function(isOpen){

        this.isOpen = isOpen;
        this.itemCells = [];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CHAPTERSTYLE,this.id);
        config = kf.cloneEx(config);
        var configData = config[jsonTables.CONFIG_CHAPTERSTYLE.Data];
        var bg = configData.configData || configData.bg;
        uiResMgr.loadChapterBG(bg,this.bg,function () {
            if (this.guideLogic.isInStage(this.guideLogic.STATE_ENUM.NONE)) {
                this.scheduleOnce(function () {
                    this.guideLogic.setGuideFlag(-1);
                },3.5);
            }
        }.bind(this));
        this.miniMap.getChildByName("content").setContentSize(cc.size(configData.width,configData.height));

        this.widget('chapterPanelEx/shrink/key/label').getComponent(cc.Label).string = this.chapterLogic.getChapterKeyNum(this.id) + "/" + this.chapterLogic.getAllCount(this.id);
        this.maxCount = Object.keys(configData.config.land).length;//

        this.loadNodeByName(this.widget("chapterPanel/miniMap/content/fg"),configData.config.fg,true);
        this.loadNodeByName(this.widget("chapterPanel/miniMap/content/land"),configData.config.land,false);
        this.loadNodeByName(this.widget("chapterPanel/miniMap/content/front"),configData.config.front,true);
        this.listerComp.setMinScroll(configData.miniScale,configData.sliderScale);
        if (this.isNeedSetPos) {
            this.isNeedSetPos = false;
        }
        var resName = config[jsonTables.CONFIG_CHAPTERSTYLE.Re1source];
        this._loadCloud(this.widget("chapterPanel/miniMap/content/bottom"),resName);
        var resName = config[jsonTables.CONFIG_CHAPTERSTYLE.Re2source];
        this._loadCloud(this.widget("chapterPanel/miniMap/content/landBottom"),resName);
        if (!isOpen) return;
        var chapterIdx = this.chapterLogic.getCurUnFightChapterIdx(this.id);
        if (!chapterIdx) {
            if (this.isKeep) {
                this.isKeep = false;
                return true;
            }
            this.miniMap.position = cc.v2(0,0);
            this.widget("chapterPanel/miniMap/content").position = cc.v2(0,0);
        }else {
            this.setfoucs(chapterIdx);
        }
    },

    loadNodeByName:function(parent,data,isDecorate){
        var content = parent;
        var prefab = this.itemPrefab;
        var info = Object.keys(data);
        var list = [];
        for (var i = 0 , len = info.length; i < len; i++) {
            var key = info[i];
            var obj = data[key];
            obj.monsterID = Number(key);
            obj.isDecorate = isDecorate;
            if (!obj.isDecorate) {
                obj.isDecorate = obj.monsterID < 0;
            }
            list.push(obj);
        }
        var refreshData = {
            content:content,
            list:list,
            prefab:prefab,
            ext:this
        }
        uiManager.refreshView(refreshData);
    },


    setfoucs:function(chapterIdx){
        for (var i = 0 , len = this.itemCells.length; i <  len; i++) {
            var obj = this.itemCells[i];
            if (obj.chapterID === chapterIdx) {
                var haveObj = obj;
                break;
            }
        }
        if(haveObj){
            if(this.guideLogic.isNeedFindWeaker(chapterIdx)){
                this.isKeep = false;
                var config = jsonTables.getJsonTable(jsonTables.TABLE.GUIDE);
                var offPos = cc.v2(config[jsonTables.CONFIG_GUIDE.CombatVector][0],config[jsonTables.CONFIG_GUIDE.CombatVector][1]);
                // offPos = cc.v2(200,20);
                this.listerComp.setPropePos(obj,offPos);
                var weakerNode = haveObj.node.getInstance(this.weakerPrefab,true);
                weakerNode.zIndex = 999;
                weakerNode.getComponent("findWeaker").init(config);
                return;
            }else{
                if (this.isKeep) {
                    this.isKeep = false;
                    return true;
                }
                this.listerComp.setPropePos(obj);
                return;
            }
        }
        this.widget("chapterPanel/miniMap/content").position = cc.v2(0,0);
    },

    _loadCloud:function(node,resName){
        var child = node.children[0];
        var toLoad = false;
        if (child) {
            if (child.name !== resName) {
                child.removeFromParent();
                child.destroy();
                toLoad = true;
            }
        }else{
            toLoad = true;
        }
        if (toLoad) {
            if (resName !== "-") {
                uiResMgr.loadChapterCloudPrefab(resName,function(prefab){
                        var cloud = node.getInstance(prefab,true);
                        cloud.position = cc.v2(0,0);
                }.bind(this));
            }
        }
    },

    /** id--》章节id */
    open:function (id,isKeep) {
        this.refreshGetNew();
        id = id || 0
        this.isKeep = isKeep;
        // this.isNeedSetPos = this.id !== id;
        this.id = id;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CHAPTERSTYLE,this.id);
        if (!config) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,"章节未配置");
        }

        if (!this.guideLogic.isInGuideFlag() && config[jsonTables.CONFIG_CHAPTERSTYLE.SunShine] && config[jsonTables.CONFIG_CHAPTERSTYLE.SunShine] !== "-") {
            if (this.lastNode) {
                this.lastNode.active = false;
            }
            var loadCb = function (prefab) {
                this.lastNode = this.node.getInstance(prefab,true);
                this.lastNode.zIndex = config[jsonTables.CONFIG_CHAPTERSTYLE.SunShineClass];
            }.bind(this);
            uiResMgr.loadChapterBgAni(config[jsonTables.CONFIG_CHAPTERSTYLE.SunShine],loadCb);
        }
        this.scheduleOnce(function(){
            this.chapterLogic.req_ChapterInfo(id,this.initPanel.bind(this));
        },0);
        this.chapterStoryLogic.checkToggle(this.chapterStoryLogic.TOGGLE_ENUM.ENTER,this.id);
        this.guideLogic.checkCache();
        this.widget("chapterPanel/shrink/btnReset").active = !(this.chapterLogic.getCurMaxChapterID() === this.id && this.id <= 3);
    },

    add:function(script){
        this.itemCells.push(script);
        if (this.maxCount === this.itemCells.length) {
            this.scheduleOnce(function () {
                this.listerComp.refreshChapterTip();
            },0.1)
        }
    },

    closeMiniMap:function(){
        this.miniMap.active = false;
    },

    closeBtnEvent:function(){
        if (this.guideLogic.isInGuideFlag()) return;
        this.close();
    },

    openUi:function(_,param){
        // if () return;
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },

    resetChapter:function(){
        var callback = function(){
            this.chapterLogic.req_ChapterBattleReset(this.id);
            this.open(this.id);
        };
        uiManager.msgDefault(uiLang.getMessage(this.node.name,"passConfirm"),callback.bind(this));
    },



    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    //
    // }
});
