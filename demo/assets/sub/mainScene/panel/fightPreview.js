var panel = require("panel");
var toggleHelper = require('toggleHelper');

cc.Class({
    extends: panel,

    properties: {
        minieHelper:toggleHelper,
        enemyHelper:toggleHelper,
        previewToggle:cc.Prefab,
        previewReel:cc.Prefab,
        previewFrame:cc.Prefab,
        previewSand:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.initNodes();
        this.sandList = null;
    },

    initNodes:function(){
        this.previewReelContent = this.widget('fightPreview/shrink/left/information/bottomFrame/content');
        this.previewFrameMineContent = this.widget('fightPreview/shrink/left/information/content');

        this.sandBoxContent = this.widget('fightPreview/shrink/left/sandbox/content');
        this.sandBox = this.widget('fightPreview/shrink/left/sandbox');
        this.mineTeamNode = this.widget('fightPreview/shrink/left/information');

        this.enmeyTogglerContent = this.widget('fightPreview/shrink/right/toggleContainer');
        this.previewFrameEnemyContent = this.widget('fightPreview/shrink/right/information/scrollView/view/content');
        this.enemyPowerNode = this.widget('fightPreview/shrink/middle/numberLabel1');//
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshStepPrivileges", this.refreshStepPrivileges.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickReel", this.clickReel.bind(this)],
            ["clickFrame", this.clickFrame.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    clickFrame:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        var lv = data.isMine ? undefined : data.lv;
        uiManager.openUI(uiManager.UIID.FIGHT_FAMILY,data.tid,lv,this.id,this.chapterID,this.enmeyTag);
    },

    clickReel:function(event){
        event.stopPropagation();
        var reelID = event.getUserData();
        if (!reelID) return;
        var reelConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,reelID);
        if(!reelConfig) return cc.log("reelID:" + reelID +"未配置");
        uiManager.openUI(uiManager.UIID.FIGHT_FAMILY,reelConfig[jsonTables.CONFIG_REEL.MonsterID],undefined,this.id,this.chapterID,this.enmeyTag);
    },

    open:function(id,chapterID){
        this.id = id;
        this.chapterID = chapterID;
        this.mineTag = 0;
        this.enmeyTag = 0;
        this.initReel();
        this.initMineTeam();
        this.initEnemyTeam();
        this.checkSandPromptGuide();
    },

    swichMineTag:function(event,tag){
        tag = Number(tag);
        this.mineTag = tag;
        this.mineTeamNode.active = this.mineTag === 0;
        this.sandBox.active = this.mineTag === 1;
        if (this.sandBox.active) {
            if (this.sandList) {
                this.initSandBox(this.sandList,this.widthCount);
                this.sandList = null;
                this.widthCount = null;
            }
        }
    },

    swichMineTagForGuide:function(){
        this.minieHelper.setIdxToggleCheck(1);
        this.swichMineTag(null,1);
    },

    swichWaveForGuide:function(){
        this.enemyHelper.setIdxToggleCheck(1);
        this.swichEnemyTag(null,1);
    },

    refreshStepPrivileges:function () {
        this.widget('fightPreview/shrink/middle/step/numberFightLabel').getComponent(cc.Label).string = this.chapterLogic.getPrivilegesStep();
    },

    /** 刷洗波次内容 */
    swichEnemyTag:function(event,tag){
        tag = Number(tag);
        this.enmeyTag = tag;
        var nodeInfo = this.chapterLogic.getChapterInfo(this.id,this.chapterID);
        var config = nodeInfo.MonsterBatch;
        this.widget('fightPreview/shrink/middle/numberLabel12').getComponent(cc.Label).string = config[this.enmeyTag].Step;
        this.widget('fightPreview/shrink/middle/step/numberFightLabel').getComponent(cc.Label).string = this.chapterLogic.getPrivilegesStep();
        this.widget('fightPreview/shrink/middle/numberFightLabel').getComponent(cc.Label).string = config.length +'/'+config.length;
        this.widget('fightPreview/shrink/btnStart/icon/numberLabel').getComponent(cc.Label).string = nodeInfo.Vit;

        var info = kf.clone(config[this.enmeyTag].Monsters);
        var fightList = [];
        for (var i = 0 , len = info.length; i <  len; i++) {
            var obj = info[i];
            var fightpower = this.cardLogic.getShowNum(obj.ID,obj.Lvl,[]);//把敌对战斗里加进去
            fightpower = fightpower.sword + fightpower.shield;
            fightList.push({idx:i,fightPower:fightpower});
        }
        fightList.sort(function(a,b){
            return a.fightPower - b.fightPower > 0 ? -1 : 1;
        });
        var list = [];
        for (var i = 0 , len = fightList.length; i <  len; i++) {
            var obj = fightList[i];
            list.push(info[obj.idx]);
        }
        var fightObj = {fightPower:0,isMine:false,id:this.id,chapterID:this.chapterID,wave:this.enmeyTag}
        var refreshData = {
            content:this.previewFrameEnemyContent,
            list:list,
            prefab:this.previewFrame,
            isFresh:true,
            scrolNode:this.widget('fightPreview/shrink/right/information/scrollView'),
            ext:fightObj
        }
        uiManager.refreshView(refreshData);
        if(fightObj.chapterID === 302 && this.chapterLogic.getMaxMiniChapter() === 301){//只有三章二关卡战力显示？号
            this.enemyPowerNode.getComponent(cc.Label).string = "???";
            return;
        }
        this.enemyPowerNode.getComponent(cc.Label).string = fightObj.fightPower;
    },

    initMineTeam:function(){
        var tables = this.chapterLogic.getChapterTableInfo(this.id);
        var map = {};
        var sandList = [];
        var widthCount = tables.Grid.length;
        for (var i = 0 , len = tables.Grid.length; i < len; i++) {
            var obj = tables.Grid[i];
            for (var j = 0 , jLen = obj.Data.length; j < jLen; j++) {
                var jObj = obj.Data[j];
                sandList.push(jObj);
                var type = Math.floor(jObj /jsonTables.TYPE_BASE_COUNT);
                switch (type) {
                    case constant.Id_Type.MONSTER://// TODO: 以后考录下
                        var ref = jObj - (type*jsonTables.TYPE_BASE_COUNT);
                        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,ref);
                        var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
                        if (!map[familyID]) {
                            map[familyID] = {form:config[jsonTables.CONFIG_MONSTER.Form],num:1,id:ref,lv:this.cardLogic.getHeroesLv(familyID)};
                        }else {
                            if (map[familyID].form < config[jsonTables.CONFIG_MONSTER.Form]) {
                                map[familyID].form = config[jsonTables.CONFIG_MONSTER.Form];
                                map[familyID].num = 1;
                                map[familyID].id = ref;
                            }else if (map[familyID].form === config[jsonTables.CONFIG_MONSTER.Form]) {
                                map[familyID].num++;
                            }
                        }
                        break;
                }
            }
        }
        var list = [];
        for (var familyID in map) {
            if (!map.hasOwnProperty(familyID)) continue;
            list.push({ID:map[familyID].id,Lvl:map[familyID].lv,Num:map[familyID].num});//NodeMonsterInfo_结构
        }
        var fightObj = {fightPower:0,isMine:true,isFirst:this.chapterLogic.isFirstChapter(this.id,this.chapterID)}
        var refreshData = {
            content:this.previewFrameMineContent,
            list:list,
            prefab:this.previewFrame,
            ext:fightObj
        }
        uiManager.refreshView(refreshData);
        this.swichMineTag(null,this.mineTag);
        this.widget('fightPreview/shrink/left/toggleContainer/toggle1').active = !this.chapterLogic.isFirstChapter(this.id,this.chapterID);
        if (this.widget('fightPreview/shrink/left/toggleContainer/toggle1').active) {
            this.sandList = sandList;
            this.widthCount = widthCount;
        }
    },

    initEnemyTeam:function(){
        var config = this.chapterLogic.getChapterInfo(this.id,this.chapterID).MonsterBatch;
        var refreshData = {
            content:this.enmeyTogglerContent,
            list:config,
            prefab:this.previewToggle
        }
        uiManager.refreshView(refreshData);

        this.enemyHelper.resetChild();
        this.enemyHelper.setIdxToggleCheck(this.enmeyTag);
        this.swichEnemyTag(null,this.enmeyTag);
    },

    initSandBox:function(sandList,widthCount){
        var layoutComp = this.sandBoxContent.getComponent(cc.Layout);
        var spaceX = layoutComp.spacingX * (widthCount - 1) + layoutComp.paddingLeft * 2;
        var width = (this.sandBoxContent.width - spaceX) / widthCount;
        var scaleSize = 4 / widthCount;
        var refreshData = {
            content:this.sandBoxContent,
            list:sandList,
            prefab:this.previewSand,
            ext:{scaleSize:scaleSize,width:width}
        }
        uiManager.refreshView(refreshData);
    },

    initReel:function(){
        this.scheduleOnce(function () {
            var list = this.cardLogic.getReelsLineUp();
            var refreshData = {
                content:this.previewReelContent,
                list:list,
                prefab:this.previewReel
            }
            uiManager.refreshView(refreshData);
        },1)
    },

    startFight:function(){
        window.adjustUtil.recored(tb.ADJUST_RECORED_PREVIEW,this.id,this.chapterID);
        var isOnePass = this.chapterLogic.isPassChapterOneIdx(this.id,this.chapterID);
        if (isOnePass) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,'pass'));
        var isLock = this.chapterLogic.isUnlockChapter(this.id,this.chapterID);
        if (!isLock) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,'lock'));
        var isFullVit = this.chapterLogic.isFullVit(this.id,this.chapterID);
        if (!isFullVit) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,'vit'));
        this.fightLogic.setGameType(constant.FightType.PVE);
        this.chapterStoryLogic.checkToggle(this.chapterStoryLogic.TOGGLE_ENUM.CLICK,this.id,this.chapterID,function(){
            var info = {id:this.id,chapterIdx:this.chapterID};//id 大章节索引  chapterIdx小关卡索引
            this.fightLogic.setPveInfo(info);
            var ev = new cc.Event.EventCustom('loadScene', true);
            ev.setUserData({sceneID:constant.SceneID.FIGHT,param:["haha "]});
            this.node.dispatchEvent(ev);
        }.bind(this));
    },

    closeBtnEvent:function(){
        this.close();
    },

    openUi:function(_,param){
        // if () return;
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },

    //检查是否需要引导沙盘继承
    checkSandPromptGuide: function () {
        var flag = this.userLogic.getFlagInfoOneFlag(this.userLogic.Flag.SandPrompt);
        if(flag && flag === -1) return;
        var sandStageID = this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.SandStageID);
        if(this.chapterID !== sandStageID) return;
        this.minieHelper.setIdxToggleCheck(1);
        this.swichMineTag(null, 1);
        this.widget("fightPreview/shrink/hint").active = true;
        setTimeout(() => {
            this.widget("fightPreview/shrink/hint").active = false;
        }, this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.SandPromptTime));
        //同步给远端
        this.userLogic.setFlagInfo(this.userLogic.Flag.SandPrompt,[-1]);//修改本地缓存
        var key = [this.userLogic.Flag.SandPrompt];
        this.userLogic.saveFlagInfo2Server(key);//修改远端
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
