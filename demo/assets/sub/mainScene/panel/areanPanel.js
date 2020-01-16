var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardItem:cc.Prefab,
        posList:[cc.Vec2],
        zIndexList:[cc.Float],
        monItem:cc.Prefab,
        btnFrame:[cc.SpriteFrame],
        proRunTime:2,
        interval:0.05,
        starAniNode:cc.Node,
        fullAniNode:cc.Node,
        runNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.boxInitPos = this.widget("areanPanel/shrink/treasureBox/boxEffect/box").position;
        jsonTables.parsePrefab(this);
        this.registerEvent();
        uiManager.loadAsyncPrefab(uiManager.UIID.AREAN_LOAD);
        this.timeCount = 5;
        this.progressCom = this.widget("areanPanel/shrink/treasureBox/progressCircle1").getComponent(cc.ProgressBar);
        this.progressLabel = this.widget("areanPanel/shrink/treasureBox/stars/amout").getComponent(cc.Label);
        this.progressjS = this.widget("areanPanel/shrink/treasureBox/progressCircle1").getComponent("progressAni");
    },

    registerEvent: function () {
        var registerHandler = [
            ["getAreanInfo", this.getAreanInfo.bind(this)],
            ["areanMatchSucess", this.areanMatchSucess.bind(this),true],
            ["clickTopHeadShop", this.clickTopHeadShop.bind(this),true],
            ["vitUpdate", this.refreshVit.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["playProgress",this.playProgress.bind(this)],
            ["playAni",this.playAni.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    refreshVit:function () {
        var vit = this.areanLogic.getNeedVit();
        this.widget("areanPanel/shrink/btnSeek/bgVit").active = !!vit;
        if(this.widget("areanPanel/shrink/btnSeek/bgVit").active){
            this.widget("areanPanel/shrink/btnSeek/bgVit/number").getComponent(cc.Label).string = vit;
            var myVit = this.userLogic.getBaseData(this.userLogic.Type.Vit);
            this.widget("areanPanel/shrink/btnSeek/bgVit/number").color = myVit >= vit?uiColor.white:uiColor.red;
        }
    },

    getAreanInfo:function(data){
        this.runNode.active = false;
        this.starAniNode.active = false;
        this.duration = 1;
        this.data = kf.clone(data);
        this.refreshVit();
        if(typeof(this.data.OpenTime) !== "number"){
            this.data.OpenTime = this.data.OpenTime.toNumber();
            this.data.CloseTime = this.data.CloseTime.toNumber();
        }
        this.widget("areanPanel/shrink/rule").active = false;
        // this.widget("areanPanel/shrink/left/integralLabel").getComponent(cc.Label).string = this.data.ArenaScore;
        var str = this.data.Rank === -1 ? "-":this.data.Rank;
        // this.widget("areanPanel/shrink/left/ranklLabel").getComponent(cc.Label).string = str;//
        // this.widget("areanPanel/shrink/left/scenelLabel").getComponent(cc.Label).string = this.data.GameNum;
        // var winPer = this.data.GameNum !== 0 ? parseInt((this.data.GameWin/this.data.GameNum).toFixed(2)*100) + "%" : "0";
        // this.widget("areanPanel/shrink/left/probabilityLabel").getComponent(cc.Label).string = winPer;
        var endTime = this.timeLogic.getCommonShortTime(this.data.EndTime.toNumber() - this.timeLogic.now());
        this.widget("areanPanel/shrink/up/countdown").getComponent(cc.Label).string = endTime[0];
        this.widget("areanPanel/shrink/up/word3").getComponent(cc.Label).string = endTime[1];
        this.widget("areanPanel/shrink/up/word").getComponent(cc.Label).string = this.data.SeasonID;
        var danInfo = this.areanLogic.getDivInfo(this.data.ArenaScore,false);
        if (danInfo) {
            this.widget("areanPanel/shrink/icon/titleLabel").getComponent(cc.Label).string = uiLang.getConfigTxt(danInfo.DivName);
            uiResMgr.loadAreanIcon(danInfo.DicIcon,this.widget("areanPanel/shrink/icon"));
            for (var i = 1 , len = 4; i < len; i++) {
                var node = this.widget("areanPanel/shrink/icon/starBright" + i);
                node.active = i <= danInfo.StarNum;
            }
            var limitScore = this.areanLogic.getLimitScore(this.data.ArenaScore);
            if(danInfo.NextScore){
                this.widget("areanPanel/shrink/integralLabel1/bgProgress").getComponent(cc.ProgressBar).progress = (this.data.ArenaScore - limitScore) / (danInfo.NextScore - limitScore);
                this.widget("areanPanel/shrink/integralLabel1/integralLabel").getComponent(cc.Label).string =  this.data.ArenaScore + "/" + danInfo.NextScore;
            }else{
                this.widget("areanPanel/shrink/integralLabel1/bgProgress").getComponent(cc.ProgressBar).progress = 1;
                this.widget("areanPanel/shrink/integralLabel1/integralLabel").getComponent(cc.Label).string = this.data.ArenaScore;
            }
        }else {
            cc.error("没有段位奖励信息")
        }
        uiResMgr.loadLockTreasureBox(this.data.BoxIcon,this.widget("areanPanel/shrink/treasureBox/boxEffect/box"));
        this.data.Star = this.data.Star > this.data.MaxStar? this.data.MaxStar:this.data.Star;
        var playInfo = this.areanLogic.getStarPlayInfo();
        // playInfo = {
        //     newStar:3,
        //     oldStar:1,
        // }
        if(playInfo && playInfo.newStar && playInfo.oldStar < this.data.MaxStar){
            this.curStar = playInfo.oldStar;
            this.toStar = playInfo.oldStar + playInfo.newStar;
            this.toStar = this.toStar > this.data.MaxStar?this.data.MaxStar:this.toStar;
            this.scheduleOnce(function () {
                this.starAniNode.active = false;
            }.bind(this),1.1);
            this.starAniNode.active = true;
            var aniStr = "bright" + playInfo.newStar + "Animation";
            this.starAniNode.getComponent(cc.Animation).play(aniStr);
            this.widget("areanPanel/shrink/treasureBox/boxEffect/box").getComponent(cc.Button).interactable = false;
        }else{
            this.starAniNode.active = false;
            this.progressCom.getComponent(cc.ProgressBar).progress = this.data.Star / this.data.MaxStar;
            this.progressLabel.getComponent(cc.Label).string =  this.data.Star + "/" + this.data.MaxStar;
            this.widget("areanPanel/shrink/treasureBox/boxEffect/box").getComponent(cc.Button).interactable = this.data.Star >= this.data.MaxStar;
            this.widget("areanPanel/shrink/treasureBox/boxEffect/star").active = this.data.Star >= this.data.MaxStar;
            if(this.data.Star >= this.data.MaxStar){
                this.widget("areanPanel/shrink/treasureBox/boxEffect").getComponent(cc.Animation).play();
                // this.fullAniNode.getComponent(cc.Animation).play();
                // this.fullAniNode.active = true;
            }else{
                this.widget("areanPanel/shrink/treasureBox/boxEffect").getComponent(cc.Animation).stop();
                // this.fullAniNode.getComponent(cc.Animation).stop();
                // this.fullAniNode.active = false;
                this.widget("areanPanel/shrink/treasureBox/boxEffect/box").position = this.boxInitPos;
                this.widget("areanPanel/shrink/treasureBox/boxEffect/box").scale = 0.6;
                this.widget("areanPanel/shrink/treasureBox/boxEffect/box").rotation = 0;
            }
        }
        // this.widget("areanPanel/shrink/banner/ban/label2").getComponent(cc.Label).string = this.areanLogic.getDailyHonor() + "/" + this.areanLogic.getDailyHonorMax();
        // var rewardInfo = this.areanLogic.getDivInfo(this.data.ArenaScore,false);
        // var list = [];
        // if (rewardInfo) {
        //     list = rewardInfo.Rewards;
        //     this.widget("areanPanel/shrink/left/titleLabel1").getComponent(cc.Label).string = uiLang.getConfigTxt(rewardInfo.DivName);
        // }else {
        //     cc.error("没有段位奖励信息")
        // }
        // var refreshData = {
        //     content:this.widget('areanPanel/shrink/left/rewardContent'),
        //     list:list,
        //     prefab:this.rewardItem.name,
        //     isUsePool:true
        // }
        // uiManager.refreshView(refreshData);
    },

    playAni:function (event) {
        event.stopPropagation();
        this.widget("areanPanel/shrink/treasureBox/stars/star").getComponent(cc.Animation).play();
    },

    playProgress:function(event){
        event.stopPropagation();
        this.widget("areanPanel/shrink/treasureBox/stars/star").getComponent(cc.Animation).play();
        var data = {};
        data.callBack = this.progressCb.bind(this);
        data.progressCb = this.updateLabel.bind(this);
        data.curProgress = this.curStar / this.data.MaxStar;
        data.interval = this.interval;
        data.costTime = Math.abs(this.proRunTime * (this.toStar - this.curStar) / this.data.MaxStar);//花费总时间
        data.allProgress = this.toStar / this.data.MaxStar;
        this.progressjS.setData(data);
        this.runNode.active = true;
    },

    updateLabel:function(progress){
        this.runNode.x = 220 * progress;
        this.curStar = Math.floor(this.data.MaxStar * progress);
        this.progressLabel.string = this.curStar + "/" + this.data.MaxStar;
    },
    progressCb:function(){
        this.runNode.active = false;
        this.curStar = this.toStar;
        this.progressCom.progress = this.data.Star / this.data.MaxStar;
        this.progressLabel.string = this.data.Star + "/" + this.data.MaxStar;
        this.widget("areanPanel/shrink/treasureBox/boxEffect/box").getComponent(cc.Button).interactable = this.data.Star >= this.data.MaxStar;
        this.widget("areanPanel/shrink/treasureBox/boxEffect/star").active = this.data.Star >= this.data.MaxStar;
        if(this.data.Star >= this.data.MaxStar){
            this.widget("areanPanel/shrink/treasureBox/boxEffect").getComponent(cc.Animation).play();
            // this.fullAniNode.getComponent(cc.Animation).play();
            // this.fullAniNode.active = true;
        }else{
            // this.fullAniNode.getComponent(cc.Animation).stop();
            // this.fullAniNode.active = false;
            this.widget("areanPanel/shrink/treasureBox/boxEffect").getComponent(cc.Animation).stop();
            this.widget("areanPanel/shrink/treasureBox/boxEffect/box").position = cc.v2(110,-35);
            this.widget("areanPanel/shrink/treasureBox/boxEffect/box").scale = 0.6;
            this.widget("areanPanel/shrink/treasureBox/boxEffect/box").rotation = 0;
        }
    },

    clickBox:function () {
        if(!this.data || this.data.Star < this.data.MaxStar)    return;
        // if(this.treasureLogic.isBoxMax()){
        //     uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"full"));
        //     return;
        // }
        this.cancleMatch();
        this.areanLogic.req_Recv_Arena_Box();
    },

    areanMatchSucess:function(param){//关掉那些多余的界面
        if (param.RoomID === 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"matchFail"));
        }else {
            this.widget('areanPanel/shrink/magnifier').active = false;
            this.sendMatchFlag = false;
            this.close();
            uiManager.openUI(uiManager.UIID.AREAN_LOAD,param);
        }
    },

    open:function(){
        this.lastOpenActive = undefined;
        this.areanLogic.req_Arena_Info();
        var list = [];
        var lines = this.cardLogic.getLineUpTeam();
        for (var i = 0 , len = this.posList.length; i <  len; i++) {
            var obj = this.posList[i];
            var zIndex = this.zIndexList[i];
            if(i === 0){
                var monTid = jsonTables.profession2Monster(this.userLogic.getBaseData(this.userLogic.Type.Career),this.userLogic.getBaseData(this.userLogic.Type.Sex));
                list.push({tid:monTid,pos:obj,zIndex:zIndex,isMe:true});
                continue;
            }
            var familyID = lines[i - 1];
            var quality = this.cardLogic.getHeroMaxQuality(familyID);
            var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
            var monsters = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters];
            var monTid = monsters[0];//quality-1  展示0形态
            if (!monTid) {
                cc.error("为啥那么没有怪物id",quality);
                continue;
            }
            list.push({tid:monTid,pos:obj,zIndex:zIndex});
        }
        var refreshData = {
            content:this.widget('areanPanel/shrink/monster'),
            list:list,
            prefab:this.monItem,
        }
        uiManager.refreshView(refreshData);
        // this.widget("areanPanel/shrink/ranking/toggleContainer/toggle2").active = window && window.FBInstant ? true : false;
    },

    downTime:function () {
        var areanInOpen = this.data.OpenTime === -1 || (this.data.OpenTime <= this.timeLogic.now() && this.data.CloseTime > this.timeLogic.now());
        if(this.lastOpenActive !== areanInOpen){
            // this.widget("areanPanel/shrink/monster").active = areanInOpen;
            this.widget("areanPanel/shrink/black").active = !areanInOpen;
            this.widget("areanPanel/shrink/openDown").active = !areanInOpen;
            this.widget("areanPanel/shrink/closeDown").active = areanInOpen && this.data.OpenTime !== -1;
            this.widget('areanPanel/shrink/btnSeek').getComponent(cc.Button).interactable = areanInOpen;
            this.widget('areanPanel/shrink/btnSeek').getComponent(cc.Sprite).spriteFrame = !areanInOpen?this.btnFrame[0]:this.btnFrame[1];
            this.lastOpenActive = areanInOpen;
        }
        if(!areanInOpen){
            var offTime = this.data.OpenTime - this.timeLogic.now();
            if(offTime <= 0){
                this.areanLogic.req_Arena_Info(true);
            }
            this.widget("areanPanel/shrink/openDown/down/down").getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
        }
        if(this.widget("areanPanel/shrink/closeDown").active){
            var offTime = this.data.CloseTime - this.timeLogic.now();
            this.widget("areanPanel/shrink/closeDown").active = offTime < 3600;//时间小于一小时
            this.widget("areanPanel/shrink/closeDown/down/down").getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
        }
    },

    close:function(){
        this.cancleMatch();
    },

    startMatch:function(){
        var vit = this.areanLogic.getNeedVit();
        var myVit = this.userLogic.getBaseData(this.userLogic.Type.Vit);
        if(myVit >= vit){
            this._startMatch();
        }else{
            this.userLogic.buyVit();
        }
    },

    clickTopHeadShop:function () {
        this.cancleMatch();
    },

    _startMatch:function(){
        if(this.widget("areanPanel/shrink/rule").active){
            this.openRule();
        }
        this.timeCount = 0;
        this.widget('areanPanel/shrink/magnifier/timeLabel/number/numberLabel').getComponent(cc.Label).string = this.timeCount;
        this.setMatchVisible(false);
        this.duration = 1;
        var delay = jsonTables.randomNum(1,3);
        this.scheduleOnce(function () {
            this.sendMatchFlag = true;
            this.areanLogic.req_Arena_Match(this.areanLogic.MATCH_ENUM.MATCH);
        },delay);
    },

    cancleMatch:function(){
        if(this.widget("areanPanel/shrink/rule").active){
            this.openRule();
        }
        this.unscheduleAllCallbacks();
        if (this.sendMatchFlag) {
            this.areanLogic.req_Arena_Match(this.areanLogic.MATCH_ENUM.CANCLE);
            this.sendMatchFlag = false;
        }
        this.setMatchVisible(true);
    },

    setMatchVisible:function(isReadyMatch){
        this.widget('areanPanel/shrink/btnSeek').active = isReadyMatch;//
        this.widget('areanPanel/shrink/magnifier').active = !isReadyMatch;
    },

    openAreanScroe:function(){
        this.cancleMatch();
        uiManager.openUI(uiManager.UIID.AREAN_SCORE);
    },

    openAreanShop:function(){
        this.cancleMatch();
        uiManager.openUI(uiManager.UIID.AREAN_SHOP);
    },
    openRule:function(){
        this.widget("areanPanel/shrink/rule").active = !this.widget("areanPanel/shrink/rule").active;
        this.widget("areanPanel/shrink/ruleClick").active = this.widget("areanPanel/shrink/rule").active;
    },
    openRank:function(){
        this.cancleMatch();
        uiManager.openUI(uiManager.UIID.AREAN_RANK);
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        if (this.widget('areanPanel/shrink/magnifier').active) {
            this.timeCount++;
            this.widget('areanPanel/shrink/magnifier/timeLabel/number/numberLabel').getComponent(cc.Label).string = this.timeCount;
            if (this.timeCount > 15) {
                this.cancleMatch();
            }
        }
        if (!this.data) return;
        this.downTime();
    }
});
