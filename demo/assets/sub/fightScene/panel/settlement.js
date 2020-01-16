var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        fingerPrefab:cc.Prefab,
        fingerX: 200,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    initWin:function(){
        var info = this.fightLogic.getPveInfo();

        var cn = uiLang.getMessage(this.node.name,'saveCount');
        var saveCount = this.userLogic.getBaseData(this.userLogic.Type.HeroKeep) + this.userLogic.getBaseData(this.userLogic.Type.HeroKeepEx);
        this.widget('settlement/aniNode/victory/label1').getComponent(cc.RichText).string = cn.formatArray([saveCount]);

        var datas = this.chapterLogic.getChapterMineMonsterInfo(info.id);
        var list = [];
        for (var i = 0 , len = datas.length; i < len; i++) {
            var obj = datas[i];
            list.push({id:obj.ID,num:1});
        }
        var midPos = list.length > 0 ? Math.ceil((list.length-1)/2) : 0;
        list.splice(midPos,0,{id:1,num:1});
        var refreshData = {
            content:this.widget('settlement/aniNode/victory/monster'),
            list:list,
            prefab:this.itemPrefab,
            ext:midPos
        }
        uiManager.refreshView(refreshData);
    },
    initFail:function(){
        this.widget('settlement/aniNode/fail/button2').active = !this.guideLogic.isInGuideFlag();
        this.widget('settlement/aniNode/fail/button3').active = !this.guideLogic.isInGuideFlag();
        this.widget('settlement/aniNode/fail/label2').active = this.widget('settlement/aniNode/fail/button2').active;
        this.widget('settlement/aniNode/fail/label3').active = this.widget('settlement/aniNode/fail/button3').active;

        var failFlag = this.userLogic.getFlagInfoOneFlag(this.userLogic.Flag.PveFail);

        var node = this.widget("settlement/aniNode/fail").getInstance(this.fingerPrefab, true);
        node.x = this.fingerX;
        var isLvDone = failFlag === 0;
        var isSkillLvDone = failFlag === 1;
        var isShopDone = failFlag === 2;
        if(isLvDone) {
            node.y = this.widget("settlement/aniNode/fail/button4").y;
        }
        else if(isSkillLvDone) {
            node.y = this.widget("settlement/aniNode/fail/button5").y;
        }
        else if(isShopDone) {
            node.y = this.widget("settlement/aniNode/fail/button6").y;
        }
    },
    //TODO 这里先只要处理pve
    open:function (gameResult) {
        this.isWin = gameResult;
        this.widget('settlement/aniNode/victory').active = gameResult;
        this.widget('settlement/aniNode/fail').active = !gameResult;

        if (this.widget('settlement/aniNode/victory').active) {
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.VICTORY);
            this.initWin();
        }
        if (this.widget('settlement/aniNode/fail').active) {
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.DEFEAT);
            this.initFail();
            this.activityLogic.checkFailActOpen();
        }
    },

    backMainScene:function(){
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.MAIN,loadCallBack:function(){

        }.bind(this)});
        this.node.dispatchEvent(ev);
    },

    backChapterPanel:function(){
        var info = this.fightLogic.getPveInfo();
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.MAIN,loadCallBack:function(){
            uiManager.openChapter(info.id,true);
            this.chapterStoryLogic.checkToggle(this.chapterStoryLogic.TOGGLE_ENUM.FIGHT_END,info.id,info.chapterIdx);
        }.bind(this)});
        this.node.dispatchEvent(ev);
    },

    fightAgain:function(){
        this.clientEvent.dispatchEvent("resetPveFight");
        this.close();
    },
    goMonUp:function(event,panelID){
        panelID = panelID?Number(panelID):1;
        var familyID = 0;
        panelID -= 1;
        if(panelID === 0){
            familyID = this.cardLogic.getCanLvUp();
            this.widget("settlement/aniNode/fail/button4").getInstance(this.fingerPrefab,false);
            this.callServerFlagChange(0,1);
        }else{
            familyID = this.cardLogic.getCanSkillUp();
            this.widget("settlement/aniNode/fail/button5").getInstance(this.fingerPrefab,false);
            this.callServerFlagChange(1,2);
        }
        uiManager.openUI(uiManager.UIID.WAITINGUI);
        uiResMgr.newPrefabInstance("lineUp",function(){
            if(familyID){
                uiResMgr.newPrefabInstance("monInfo",function(){
                    uiManager.openUI(uiManager.UIID.LINEUP);
                    uiManager.openUI(uiManager.UIID.MONINFO,familyID,panelID);
                    uiManager.closeUI(uiManager.UIID.WAITINGUI);
                });
            }else{
                uiManager.openUI(uiManager.UIID.LINEUP);
                uiManager.closeUI(uiManager.UIID.WAITINGUI);
            }
        });
    },

    openShop:function(){
        this.widget("settlement/aniNode/fail/button6").getInstance(this.fingerPrefab,false);

        this.callServerFlagChange(2,-1);

        uiManager.openUI(uiManager.UIID.SHOPPANEL);//由于抽卡不在商店了
    },

    callServerFlagChange:function(beFlag,reFlag){
        var failFlag = this.userLogic.getFlagInfoOneFlag(this.userLogic.Flag.PveFail);
        var isLvDone = failFlag === beFlag;
        if (isLvDone) {
            this.userLogic.setFlagInfo(this.userLogic.Flag.PveFail,[reFlag]);//修改本地缓存
            var key = [this.userLogic.Flag.PveFail];
            this.userLogic.saveFlagInfo2Server(key);//修改远端
        }
    },

    turnToStrategy: function () {
        // var strategyUrl = window["clientConfig"]["strategyUrl"];
        var strategyUrl = this.userLogic.getLinkFromServer(2);
        if(!strategyUrl) return;
        cc.sys.openURL(strategyUrl);
    }


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
