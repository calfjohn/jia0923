var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        hpColorArr:[cc.Sprite],
        progressNode:cc.Node,
        tubeLabel:cc.Label,
        timeLabel: cc.Label,
        tube:10000,//一管血是多少血
        proRunTime:0.5,
        interval:0.05,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.tubeLabel.node.zIndex = 3;
        this.progressCom = this.progressNode.getComponent(cc.ProgressBar);
        this.progressjS = this.progressNode.getComponent("progressAni");
        this.duration = 0;
    },

    registerEvent: function () {

        var registerHandler = [
            ["updateBossHp", this.updateBossHp.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    init:function () {
        var bossLv = this.worldBossLogic.getBossLv();
        var tubeArr = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WorldBossTube);
        this.tube = tubeArr[bossLv - 1];
        if(!this.tube){
            cc.error("策划没有配这个等级的bOSS血量"+bossLv);
            this.tube = 50000;
        }
        this.node.active = false;
        this.bossHp = this.worldBossLogic.getHpOffCurHp();//当前boss总血量
        if(this.bossHp.toNumber){
            this.bossHp  = this.bossHp.toNumber();
        }
        this.tubeNum =Math.floor(this.bossHp / this.tube);//多少管血
        this.tubeLabel.string ="X" + this.tubeNum;
        this.toZero = false;
        this.changeColor(this.tubeNum);
        this.progressCom.progress = (this.bossHp % this.tube) / this.tube;
        var info = this.worldBossLogic.getBossInfo();
        this.widget('worldBossFight/worldBossBar/bgWorldBossName/label').getComponent(cc.Label).string = uiLang.getMessage("worldBossPanel","thanReward").formatArray([info.Bosses.DescIDs[0]]) ;
        this.initCountDown();
    },
    show:function () {
        this.node.active = true;
        this.startCountDown = true;
    },
    changeColor:function (tubeNum) {
        var idx = tubeNum % this.hpColorArr.length;
        var nextIdx = idx === 0?this.hpColorArr.length - 1:idx - 1;
        for (var i = 0 , len = this.hpColorArr.length; i < len; i++) {
            var obj = this.hpColorArr[i];
            obj.node.active = i === idx || i === nextIdx;
            obj.fillRange = 1;
        }
        this.hpColorArr[idx].node.zIndex = 2;
        this.hpColorArr[nextIdx].node.zIndex = 1;
        this.progressNode.getComponent(cc.ProgressBar).barSprite = this.hpColorArr[idx];
    },
    updateBossHp:function (hp) {
        this.bossHp = hp;
        this.tubeNumCur = Math.floor(this.bossHp / this.tube);//多少管血
        if(!this.toZero){//这管血还没用完
            var data = {};
            data.callBack = this.progressCb.bind(this);
            data.progressCb = this.updateLabel.bind(this);
            data.curProgress = this.progressCom.progress;
            data.interval = this.interval;
            data.allProgress =this.tubeNumCur === this.tubeNum?((this.bossHp % this.tube) / this.tube):0;
            data.costTime = Math.abs(this.curProgress - this.allProgress) * this.proRunTime;
            this.toZero = data.allProgress === 0;
            this.progressjS.setData(data);
        }else{//这管血用完了

        }

    },
    updateLabel:function(progress){
        // this.curScore = Math.floor((this.curMax - this.curLimit) * progress + this.curLimit);
        // this.progressLabel.string = this.curScore + "/" + this.curMax;
    },
    progressCb:function(){
        if(this.tubeNumCur === this.tubeNum){//进度结束
            this.toZero = false;
        }else{//上一管跑完了
            this.tubeNum --;
            this.tubeLabel.string ="X" + this.tubeNum;
            this.tubeNumCur = this.tubeNumCur >= this.tubeNum?this.tubeNum:this.tubeNumCur;
            this.progressCom.progress = 1;
            this.changeColor(this.tubeNum);
            var data = {};
            data.callBack = this.progressCb.bind(this);
            data.progressCb = this.updateLabel.bind(this);
            data.curProgress = 1;
            data.interval = this.interval;
            data.allProgress =this.tubeNumCur === this.tubeNum?((this.bossHp % this.tube) / this.tube):0;
            // if(data.curProgress < data.allProgress ){
            //     cc.log("youwenti")
            // }
            data.costTime = Math.abs(this.curProgress - this.allProgress) * this.proRunTime;
            this.toZero = data.allProgress === 0;
            this.progressjS.setData(data);
        }
    },

    initCountDown () {
        this.countDownTime = this.worldBossLogic.getBossDuration();
        this.startCountDown = false;
    },

    setCountDown () {
        this.countDownTime -= 1;
        this.timeLabel.string = this.timeLogic.getCommon1CoolTime(this.countDownTime);
        if (this.countDownTime <= 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("worldBoss","timeout"));
            this.startCountDown = false;
            this.fightLogic.cheatGame();
        }
    },

    update (dt) {
        if (!this.startCountDown) return;
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        this.setCountDown();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
