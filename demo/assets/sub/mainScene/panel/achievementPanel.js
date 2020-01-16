var panel = require("panel");
var toggleHelper = require('toggleHelper');
cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        scrollComp:cc.ScrollView,
        itemPrefab:[cc.Prefab],
        redDot:[cc.Node],//与constant得RedDot下标对应
    },

    // use this for initialization
    onLoad: function () {
        this.prefabName = {
            "0":"mopUpItem",
            "3":"achievementItem",
            "4":"dailyItem",
        }
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.duration = 0;
        this.isInitFlag = true;
        this.refreshMainBtnActive();
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshMainBtnActive", this.refreshMainBtnActive.bind(this),true],
            ["refreshAchievementPanel", this.refreshAchievementPanel.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickAchieve", this.clickAchieve.bind(this)],
            ["clickMopUp", this.clickMopUp.bind(this)],
            ["clickDaily", this.clickDaily.bind(this)],
            ["clickDailyReward", this.clickDailyReward.bind(this)],
            ["clickWeekReward", this.clickWeekReward.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.refreshHead.bind(this)],
        ]
        this.registerDataEvent(registerHandler);
    },

    refreshMainBtnActive:function(){
        // this.widget("achievementPanel/floor/toggleContainer/sweeping").active = jsonTables.isFunVisible(constant.FunctionTid.MOP_UP);
        // this.widget("achievementPanel/floor/toggleContainer/sweeping/lock").active = !jsonTables.funOpenCheck(constant.FunctionTid.MOP_UP);//
        // this.widget("achievementPanel/floor/toggleContainer/sweeping/labelMask").active = this.widget("achievementPanel/floor/toggleContainer/sweeping/lock").active;
    },

    refreshHead:function(){
        this.redDot[constant.RedDotEnum.DailyTask].active = this.userLogic.getRedValue(constant.RedDotEnum.DailyTask) > 0;
        this.redDot[constant.RedDotEnum.Achi].active = this.userLogic.getRedValue(constant.RedDotEnum.Achi) > 0;
    },

    clickDaily:function(event){
        event.stopPropagation();
        var data = event.getUserData();


        if (data.Status === this.taskLogic.STATE_ENUM.CAN_REWARD) {
            this.taskLogic.req_Task_Receive(1,data.ID);
        }else {
            if (data.Jump !== 0) {
                this.close();
                if (data.Jump !== -1) {
                    uiManager.openUI(data.Jump);
                }
            }
        }
    },

    clickDailyReward:function(event){
        event.stopPropagation();
        var data = event.getUserData();


        if (data.Status === this.taskLogic.STATE_ENUM.CAN_REWARD) {
            this.taskLogic.req_Task_ScoreReward_Receive(0,data.Score);
        }else {
            uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_SCORE, "",data.ChestRewards);
        }
    },

    clickWeekReward:function(event){
        event.stopPropagation();
        var data = event.getUserData();

        if (data === this.taskLogic.STATE_ENUM.CAN_REWARD) {
            this.taskLogic.req_Task_ScoreReward_Receive(1,null);
        }
    },
    clickAchieve:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        var state = this.achievementLogic.getOneState(data.ID);
        switch (state) {
            case this.achievementLogic.STATE_ENUM.CAN_TOOK:
                this.achievementLogic.req_Achievement_Receive(data.ID);
                break;
            default:

        }
    },

    clickMopUp:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if (data.MopUpVit !== 0) {
            if (data.MopUpVit > this.userLogic.getBaseData(this.userLogic.Type.Vit)) {
                var errorcode = uiLang.getMessage("errorcode","errorcode2");
                uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
                return;
            }
            if (this.treasureLogic.isBoxMax()) {
                var errorcode = uiLang.getMessage("errorcode","errorcode105");
                uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
                return;
            }
            this.mopUpLogic.req_ChapterMopUp(data.ID);
        }else {
            var chapter = data.ID;
            var maxID = this.chapterLogic.getCurMaxChapterID();
            if (chapter !== maxID && maxID !== 0) {
                var list = this.chapterLogic.getCurChapterId();
                var extID = 0;
                for (var i = 0 , len = list.length; i < len; i++) {
                    var obj = list[i];
                    if (obj !== maxID) {
                        extID = obj;
                        break;
                    }
                }
                if (extID !== 0 && chapter !== extID) {
                    var msg = uiLang.getMessage(this.node.name,"reset");
                    var callback = function(){
                        this.close();
                        this.chapterLogic.req_ChapterBattleReset(extID);
                        uiManager.openChapter(chapter,false);
                    };
                    uiManager.msgDefault(msg.formatArray([extID]),callback.bind(this));
                    return;
                }
            }
            this.close();
            uiManager.openChapter(chapter,false);
        }
    },

    switchTag:function(event,tag,noFresh){
        tag = Number(tag);
        if (tag === 0 && !jsonTables.funOpenCheck(constant.FunctionTid.MOP_UP)) {
            this.toggleHelperJs.setIdxToggleCheck(this.tag);
            return jsonTables.tipUnOpenFuntionMsg(constant.FunctionTid.MOP_UP);
        }
        this.duration = 1;
        var prefab = this.itemPrefab[tag];
        this.widget('achievementPanel/shrink/floor/label').active = !!prefab;
        if (!prefab) return;

        var list = [];
        var weekendData = {};
        var isFresh =this.isRefresh||tag !== this.tag;

        switch ((tag)) {
            case 0://扫荡
                list = this.mopUpLogic.getMopUpList();
                break;
            case 3://成就
                list = this.achievementLogic.getList(true);
                break;
            case 4://每日
                list = this.taskLogic.getList(isFresh);
                weekendData = this.taskLogic.getWeekendData(isFresh);
                break;
            default:
        }

        this.widget('achievementPanel/shrink/floor/mopcrollView').active = tag === 0;
        this.widget('achievementPanel/shrink/floor/achivscrollView').active = tag === 3;
        this.widget('achievementPanel/shrink/floor/scrollView').active = tag === 4;

        // this.widget('achievementPanel/shrink/floor/label/countdown/countdownLabel').active = tag === 4;
        // this.widget('achievementPanel/shrink/floor/label/countdown/countdownLabel1/countdownLabel1').active = tag === 4;
        this.widget('achievementPanel/shrink/floor/textBottom2').active = tag === 4;
        this.widget('achievementPanel/shrink/floor/label/tipsLabel').active = tag === 0;
        this.widget('achievementPanel/shrink/floor/weekendItem').active = tag === 4;
        this.widget('achievementPanel/shrink/floor/textBox5').active = this.widget('achievementPanel/shrink/floor/weekendItem').active;
        this.widget('achievementPanel/shrink/floor/weekendItem').getInstance(this.itemPrefab[5],tag === 4);
        this.widget('achievementPanel/shrink/floor/textBox6').active = tag === 4;
        this.widget('achievementPanel/shrink/floor/label/feame5').active = this.widget('achievementPanel/shrink/floor/textBox6').active;
        this.widget('achievementPanel/shrink/floor/label/feame6').active = this.widget('achievementPanel/shrink/floor/textBox6').active;
        this.tag = tag;

        if (this.widget('achievementPanel/shrink/floor/weekendItem').active) {
            if (!!weekendData) {
                var node = this.widget('achievementPanel/shrink/floor/weekendItem').getInstance(this.itemPrefab[5],true);
                node.getComponent(this.itemPrefab[5].name).init(-1,weekendData);
            }
        }else{
            for (var i = 0 , len = list.length; i <  len; i++) {
                var obj = list[i];
                if (obj.ID === 52 && !obj.Received) {// NOTE: 这里约定了ID为1
                    var info = list.splice(i,1)[0];
                    list.unshift(info);
                    break;
                }
            }
        }

        if (tag === 3 || tag === 0) {
            var viewData = {
                totalCount:list.length,
                spacing:0,
                rollNow:this.isRefresh,
                showAni:true,
                noOpen:noFresh
            };
            if (this.isRefresh) {
                this.isRefresh = false;
            }
            var scroliew = tag === 3 ? 'achievementPanel/shrink/floor/achivscrollView':'achievementPanel/shrink/floor/mopcrollView';
            this.widget(scroliew).getComponent("listView").init(prefab,viewData,list);
        }else {
            this.unscheduleAllCallbacks();
            var lockList= [];
            var maxID = this.chapterLogic.getCurMaxChapterID();
            for(var i = 0;i<list.length - 1;i++){
                if(list[i].Chapter < maxID ){
                    lockList.push(list[i])
                }
            }
            var refreshData = {
                content:this.scrollComp.content,
                list:lockList,
                prefab:prefab,
                isFresh:this.isShowDaily,
                scrolNode:this.scrollComp.node,
                ext:this
            }
            this.isShowDaily = false;
            uiManager.refreshView(refreshData);
        }
    },

    refreshAchievementPanel:function(idx,noFresh){
        if (this.tag !== idx) return;
        this.toggleHelperJs.setIdxToggleCheck(idx);
        this.switchTag(undefined,idx,noFresh);
    },

    open:function(){
        this.tag = 4;
        this.taskLogic.req_Get_DailyTask();
        this.toggleHelperJs.setIdxToggleCheck(this.tag);
        this.isRefresh = true;
        this.isShowDaily = true;
        if(this.achievementLogic.req_Achievement_Data()){
            this.switchTag(undefined,this.tag);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    //     if (!this.widget('achievementPanel/shrink/floor/label/countdown/countdownLabel1/countdownLabel1').active) return;
    //     this.duration += dt;
    //     if (this.duration < 1) return;
    //     this.duration -= 1;
    //     var offTime = this.taskLogic.getRefreshTime() - this.timeLogic.now();
    //     this.widget('achievementPanel/shrink/floor/label/countdown/countdownLabel1/countdownLabel1').getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
    // }
});
