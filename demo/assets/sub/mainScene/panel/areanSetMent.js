var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        starAni:cc.Animation,
        star1:cc.Node,
        star2:cc.Node,
        star3:cc.Node,
        upAniNode:cc.Node,
        upNewSpite:cc.Node,
        upNewSpite1:cc.Node,
        upOldSpite:cc.Node,
        proRunTime:2,
        interval:0.05,
        blackNode:cc.Node,
        winAni:cc.Animation,
        loseAni:cc.Animation,
        scoreDelay:1,
        parentAni:cc.Animation,
        delay:1,
        runDelay:2,
        continuNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.upAni = this.upAniNode.getComponent(cc.Animation);
        this.upAni.on(constant.AnimationState.FINISHED, this.onFinished, this);
        // this.downAni = this.downAniNode.getComponent(cc.Animation);
        this.progressCom = this.widget("areanSetMent/parent/showNode/bgProgressBar").getComponent(cc.ProgressBar);
        this.progressLabel = this.widget("areanSetMent/parent/showNode/bgProgressBar/amount").getComponent(cc.Label);
        this.progressjS = this.widget("areanSetMent/parent/showNode/bgProgressBar").getComponent("progressAni");
        this.winAni.on(constant.AnimationState.FINISHED, this.onWinAniFinished, this);
        this.loseAni.on(constant.AnimationState.FINISHED, this.onLoseAniFinished, this);
        this.parentAni.on(constant.AnimationState.FINISHED, this.onShowAniFinished, this);
    },

    onShowAniFinished:function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.playShow();
    },

    onLoseAniFinished:function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.widget('areanSetMent/parent').active = true;
        this.widget('areanSetMent/parent').scale = 0.1;
        this.parentAni.play();
        this.resultAniFinish(this.param);
    },

    onWinAniFinished:function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if(param.name === "areanVictoryAnimationClip"){
            this.winAni.play("areanVictoryAnimationClip1");
            this.widget('areanSetMent/parent').active = true;
            this.widget('areanSetMent/parent').scale = 0.1;
            this.parentAni.play();
            this.resultAniFinish(this.param);
        }
    },

    onFinished: function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.clickEnable = true;
        this.continuNode.active =!this.blackNode.active;
    },

    initWin:function(div,gold){
        this.widget('areanSetMent/parent/aniNode/victory/badgelabel/numberLabel').getComponent("scaleAni").init(div);
        this.scheduleOnce(function () {
            this.widget('areanSetMent/parent/aniNode/victory/honorlabel/numberLabel').getComponent("scaleAni").init(gold);
        },this.delay);
        // this.widget('areanSetMent/parent/aniNode/victory/label').getComponent(cc.Label).string = uiLang.getConfigTxt(desID);
    },
    initFail:function(div,gold){
        this.widget('areanSetMent/parent/aniNode/fail/badgelabel/numberLabel').getComponent("scaleAni").init(div);
        this.scheduleOnce(function () {
            this.widget('areanSetMent/parent/aniNode/fail/honorlabel/numberLabel').getComponent("scaleAni").init(gold);
        },this.delay);
        // this.widget('areanSetMent/parent/aniNode/fail/label').getComponent(cc.Label).string = uiLang.getConfigTxt(desID);
    },

    resultAniFinish(param){
        this.param = param;
        this.widget('areanSetMent/parent/showNode').active = true;
        this.widget('areanSetMent/parent/aniNode/victory').active = this.isWin;
        this.widget('areanSetMent/parent/aniNode/fail').active = !this.isWin;
        this.clientEvent.dispatchEvent("parseMusic");//停止背景音乐
        if (this.widget('areanSetMent/parent/aniNode/victory').active) {
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ARENA_VICTORY);
            this.widget('areanSetMent/parent/aniNode/victory/badgelabel/numberLabel').getComponent("scaleAni").init(0,true);
            this.widget('areanSetMent/parent/aniNode/victory/honorlabel/numberLabel').getComponent("scaleAni").init(0,true);
            // this.initWin(param.WinHonor,param.WinScore,param.WinGold,param.DescID);
        }
        if (this.widget('areanSetMent/parent/aniNode/fail').active) {
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ARENA_DEFEAT);
            this.widget('areanSetMent/parent/aniNode/fail/badgelabel/numberLabel').getComponent("scaleAni").init(0,true);
            this.widget('areanSetMent/parent/aniNode/fail/honorlabel/numberLabel').getComponent("scaleAni").init(0,true);
            // this.initFail(param.LoseHonor,param.LoseScore,param.LoseGold,param.DescID);
        }
        // this.getStar = this.isWin ? param.WinStar:param.LoseStar;
        // this.starAni.node.active = this.getStar > 0;
        // this.star1.active = this.getStar >= 1;
        // this.star2.active = this.getStar >= 2;
        // this.star3.active = this.getStar >= 3;
        // this.upAniNode.active = false;
        this.curScore = param.lastScore;
        this.toScore = this.isWin ? this.curScore + param.WinScore:this.curScore - param.LoseScore;
        this.toScore = this.toScore < 0?0:this.toScore;
        this.curMax = this.areanLogic.getNextScore(this.curScore);
        this.toMax = this.areanLogic.getNextScore(this.toScore);
        this.curLimit = this.areanLogic.getLimitScore(this.curScore);
        this.toLimit = this.areanLogic.getLimitScore(this.toScore);
        this.curIconLv = this.areanLogic.getIconLv(this.curScore);
        this.curStarNum = this.areanLogic.getStarNum(this.curScore);
        this.toIconLv = this.areanLogic.getIconLv(this.toScore);
        this.toStarNum = this.areanLogic.getStarNum(this.toScore);
        this.refreshUpAni();
        if(this.curMax !== -1){//当前不是在最高段位
            this.progressLabel.string = this.curScore + "/" + this.curMax;
            this.progressCom.progress =  (this.curScore - this.curLimit) / (this.curMax - this.curLimit);
            // this.blackNode.active = true;
        }else{//当前在最高段位
            this.blackNode.active = false;
            this.continuNode.active = this.clickEnable;
            if(this.toMax !== -1){//我掉段了
                this.progressLabel.string = this.toScore + "/" + this.toMax;
                this.progressCom.progress =  (this.toScore - this.toLimit) / (this.toMax - this.toLimit);
                // var delay = this.getStar?2.5:1.5;//因为有一个出现动画，所以需要延时
                this.scheduleOnce(function () {
                    if(this.curIconLv !== this.toIconLv){
                        this.playUpAni();
                    }else{
                        this.playUpStarAni();
                    }
                }.bind(this),1.5);
            }else{//我还在最高段位
                this.progressLabel.string = this.toScore;
                this.progressCom.progress =  1;
            }
            return;
        }
        // if(this.getStar){
        //     this.scheduleOnce(function () {
        //         this.playProgress();
        //     }.bind(this),0.7);
        // }else{
        //     this.playProgress();
        // }
    },

    playShow:function () {
        // if(this.getStar){
        //     this.starAni.play();
        //     this.scheduleOnce(function () {
        //         if((this.toMax === -1 && this.curMax !== -1) || (this.toMax !== -1 && this.curMax !== -1)){
        //             this.playProgress();
        //         }else{
        //             this.clickEnable = true;
        //         }
        //     }.bind(this),this.scoreDelay);
        // }else{
        //     if((this.toMax === -1 && this.curMax !== -1) || (this.toMax !== -1 && this.curMax !== -1)){
        //         this.playProgress();
        //     }else{
        //         this.clickEnable = true;
        //     }
        // }
        if (this.widget('areanSetMent/parent/aniNode/victory').active) {
            this.initWin(this.param.WinScore,this.param.WinGold);
        }
        if (this.widget('areanSetMent/parent/aniNode/fail').active) {
            this.initFail(this.param.LoseScore,this.param.LoseGold);
        }
        this.scheduleOnce(function () {
            if((this.toMax === -1 && this.curMax !== -1) || (this.toMax !== -1 && this.curMax !== -1)){
                this.playProgress();
            }else{
                this.clickEnable = true;
                this.continuNode.active =!this.blackNode.active;
            }
        },this.runDelay);
    },

    open:function (param) {
        this.isWin = param.WinUid && (param.WinUid.toNumber() === this.userLogic.getBaseData(this.userLogic.Type.UserID).toNumber());

        // this.isWin = false;
        // var param = {};
        // param.WinScore = 150;
        // param.LoseScore = 100;
        // param.WinStar = 2;
        // param.LoseStar = 3;
        // param.lastScore = 250;
        // param.WinGold = 150;
        // param.LoseGold = 100;

        this.param = param;
        this.continuNode.active = false;
        this.widget('areanSetMent/parent').active = false;
        this.widget('areanSetMent/aniNode1/victoryAni').active = this.isWin;
        this.widget('areanSetMent/aniNode1/failAni').active = !this.isWin;
        uiManager.closeUI(uiManager.UIID.AREAN_WAITE);//关闭竞技场等待界面
        if(this.isWin){
            this.winAni.play("areanVictoryAnimationClip");
        }else{
            this.loseAni.play("failAnimation");
        }
        this.blackNode.active = true;
        this.clickEnable = false;
    },

    refreshUpAni:function () {
        uiResMgr.loadAreanIcon(this.areanLogic.getScoreIcon(this.curScore),this.upOldSpite);
        this.upOldSpite.opacity = 255;
        this.upOldSpite.scale = 1;
        this.upNewSpite.active = false;
        this.upNewSpite1.active = false;
        this.widget("areanSetMent/parent/showNode/ascending/ascendingSegment1").active = false;
        this.widget("areanSetMent/parent/showNode/ascending/descendingSection1").active = false;
        this.widget("areanSetMent/parent/showNode/ascending/star_new").active = false;
        this.widget("areanSetMent/parent/showNode/ascending/star_used").opacity = 255;
        this.widget("areanSetMent/parent/showNode/ascending/star_used").scale = 1;
        this.refreshOneStar("areanSetMent/parent/showNode/ascending/star_used",this.curStarNum);
        if(this.curIconLv !== this.toIconLv){
            this.newIcon = this.areanLogic.getScoreIcon(this.toScore);
            uiResMgr.loadAreanIcon(this.newIcon,this.upNewSpite);
            uiResMgr.loadAreanIcon(this.newIcon,this.upNewSpite1);
            this.refreshOneStar("areanSetMent/parent/showNode/ascending/star_new",this.toStarNum)
        }
    },

    playUpStarAni:function () {
        if(this.curStarNum <= this.toStarNum){//升星
            var str = "areanSetMent/parent/showNode/ascending/star_used/bright" + this.toStarNum;
            this.widget(str).active = true;
            this.widget(str).getComponent(cc.Animation).play("bright1Animation1");
        }else{
            var str = "areanSetMent/parent/showNode/ascending/star_used/bright" + this.curStarNum;
            this.widget(str).getComponent(cc.Animation).play("bright1Animation2");
        }
        this.scheduleOnce(function () {
            this.clickEnable = true;
            this.continuNode.active =!this.blackNode.active;
        },0.5)
    },

    playUpAni:function () {
        this.upNewSpite.active = true;
        this.upNewSpite1.active = true;
        this.widget("areanSetMent/parent/showNode/ascending/ascendingSegment1").active = true;
        this.widget("areanSetMent/parent/showNode/ascending/descendingSection1").active = true;
        this.widget("areanSetMent/parent/showNode/ascending/star_new").active = true;
        if(this.curIconLv <= this.toIconLv){//升段
            cc.log("升段了");
            // this.widget("areanSetMent/parent/showNode/ascending/arena_font").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"duanUp") + uiLang.getConfigTxt(this.areanLogic.getDivName(this.toScore));
            this.upAni.play("duanAnimation")
            this.clickEnable = false;
        }else{
            cc.log("降段了");
            // this.widget("areanSetMent/parent/showNode/ascending/arena_font").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"duanDown");
            this.upAni.play("duan1Animation")
            this.clickEnable = false;
        }
    },

    refreshOneStar:function (str,num) {
        for (var i = 1 , len = 4 ; i < len; i++) {
            var node = this.widget(str+"/bright"+i);
            node.active = i <= num;
            node.getChildByName("bright1").scale = 1;
            node.getChildByName("bright1").opacity = 255;
        }
    },

    playProgress:function(){
        var data = {};
        data.callBack = this.progressCb.bind(this);
        data.progressCb = this.updateLabel.bind(this);
        data.curProgress = (this.curScore - this.curLimit) / (this.curMax - this.curLimit);
        data.interval = this.interval;
        if(this.curMax === this.toMax){//没有升级
            data.costTime = Math.abs(this.proRunTime * (this.toScore - this.curScore) / (this.curMax - this.curLimit));//花费总时间
            data.allProgress = (this.toScore - this.curLimit) / (this.curMax - this.curLimit);
        }else{//升级了
            if(this.isWin){
                data.costTime = Math.abs(this.proRunTime * (this.curMax - this.curScore) / (this.curMax - this.curLimit));//花费总时间
            }else{
                data.costTime = Math.abs(this.proRunTime * (this.curScore - this.curLimit) / (this.curMax - this.curLimit));//花费总时间
            }
            data.allProgress = this.isWin?1:0;
        }
        this.progressjS.setData(data);
    },

    updateLabel:function(progress){
        this.curScore = Math.floor((this.curMax - this.curLimit) * progress + this.curLimit);
        this.progressLabel.string = this.curScore + "/" + this.curMax;
    },
    progressCb:function(){
        if(this.curMax === this.toMax){//进度结束
            this.curScore = this.toScore;
            this.progressLabel.string = this.curScore + "/" + this.curMax;
            this.blackNode.active = false;
            this.clickEnable = true;
            this.continuNode.active = true;
        }else{//上一级跑满了
            if(this.curIconLv !== this.toIconLv){
                this.playUpAni();
            }else{
                this.playUpStarAni();
            }
            this.upAniNode.active = true;
            if(this.toMax === -1){//升到最高段位了
                this.progressLabel.string = this.toScore;
                this.progressCom.progress = 1;
                this.blackNode.active = false;
                this.continuNode.active = this.clickEnable;
                return;
            }
            this.curMax = this.toMax;
            this.curLimit = this.toLimit;
            this.curScore = this.isWin?0:this.curMax;
            if(this.isWin && this.toScore === this.curLimit){//刚刚好，结束了
                this.progressLabel.string = this.curScore + "/" + this.curMax;
                this.progressCom.progress = 0;
                this.blackNode.active = false;
                this.continuNode.active = this.clickEnable;
                return;
            }
            var data = {};
            data.callBack = this.progressCb.bind(this);
            data.progressCb = this.updateLabel.bind(this);
            data.curProgress = this.curScore / this.curMax;
            data.costTime = Math.abs(this.proRunTime * ((this.toScore - this.curScore) - this.curLimit) / (this.curMax - this.curLimit));//花费总时间
            data.allProgress = (this.toScore - this.curLimit) / (this.curMax- this.curLimit);
            this.progressjS.setData(data);
        }
    },

    backMainScene:function(){
        if(!this.clickEnable)   return;
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.MAIN,loadCallBack:function(){
            uiManager.openUI(uiManager.UIID.AREAN_UI);
        }});
        this.node.dispatchEvent(ev);
        this.close();
    },
    openUi:function(_,param){
        if(!this.clickEnable)   return;
        uiManager.openUI(Number(param));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
