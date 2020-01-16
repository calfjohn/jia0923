var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {

        upMonSpine: [sp.Skeleton],
        upMonName: cc.Label,
        upMonType: cc.Node,
        actLeftTime: cc.Label,
        // upMonQuality: [cc.Label],

        scoreBox: [cc.Node],
        scoreNum: cc.Label,
        maxLabel:cc.Node,

        singleDrawNode: cc.Node,
        singleDrawPrice: cc.Label,
        singleDrawIcon: cc.Node,
        singleDrawTimesLabel: cc.Label,
        tenDrawPrice: cc.Label,
        tenDrawIcon: cc.Node,
        //freeLeftTime: cc.Label,
        //freeNode: cc.Node,
        btnOne:cc.Button,
        btnTen:cc.Button,

        //diamondNum: cc.Label,
        itemNum: cc.Label,
        flyNode: cc.Node,
        flyInitNodeOne:cc.Node,
        flyInitNodeTen:cc.Node,
        flyToNode:cc.Node,
        breakNode:cc.Node,

        islands: [cc.Node],
        rateNode: [cc.Node],
        leftBtn: cc.Node,
        rightBtn: cc.Node,

        progressAniArr:[cc.Node],
        aniLengthNode:[cc.Node],

        progressNode1:cc.Node,
        progressNode2:cc.Node,
        progressNode3:cc.Node,
        nextGiftLabel1: cc.Label,
        nextGiftLabel2: cc.Label,

        interval:0.05,
        proRunTime:2,//100积分滚动时间
        //不同up怪物时每个岛的位置
        islandsPos1:[cc.Vec2],
        islandsPos2:[cc.Vec2],
        islandsPos3:[cc.Vec2],
        islandsPos4:[cc.Vec2],
        islandsScale1:[cc.Float],
        islandsScale2:[cc.Float],
        islandsScale3:[cc.Float],
        islandsScale4:[cc.Float],
        rateNodeScale:[cc.Float]
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.aniLength = [];
        for (var i = 0 , len = this.aniLengthNode.length; i < len; i++) {
            this.aniLength[i] = this.aniLengthNode[i].height;
        }
        this.updateTime = 0;
        this.needUpdateLeft = false;
        this.shrink = this.node.getChildByName("shrink");
        this.flyInitPosOne = kf.getPositionInNode(this.flyInitNodeOne,this.shrink);
        this.flyInitPosTen = kf.getPositionInNode(this.flyInitNodeTen,this.shrink);
        setTimeout(function () {
            this.flyInitPosOne = kf.getPositionInNode(this.flyInitNodeOne,this.shrink);
            this.flyInitPosTen = kf.getPositionInNode(this.flyInitNodeTen,this.shrink);
        }.bind(this),500);
        var pos = kf.getPositionInNode(this.flyToNode,this.node);
        this.flyToPos = cc.v2(pos.x,pos.y - 38.44);
        this.progressAni1 = this.progressNode1.getComponent("progressAni");
        this.progressAni2 = this.progressNode2.getComponent("progressAni");
        this.progressAni3 = this.progressNode3.getComponent("progressAni");
    },

    registerEvent: function () {
        this.registerClientEvent("refreshActData", this.initDrawCard.bind(this));
        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.initDrawBtn.bind(this)],
        ];
        this.registerDataEvent(registerHandler);

    },

    open () {
        // this.isOpen = true;
        this.actEnd = false;
        this.lastScore = undefined;
        this.autoOpenIdx = undefined;
        this.breakNode.active = false;
        this.initDrawCard();
    },

    isEnd (){
        return this.actEnd;
    },

    initDrawCard () {
        this.drawCardData = this.activityLogic.getDrawCardData();

        this.initScore();

        this.initUpMonster();

        this.initDrawBtn();

        this.setActLeftTime();
    },

    openDrawCard(){
        uiManager.closeUI(uiManager.UIID.ACT_DRAWCARD);
        setTimeout(function () {
            uiManager.openUI(uiManager.UIID.DRAW_CARD,true);
        },50)
    },

    //初始化积分
    initScore: function () {
        var scoreList = this.drawCardData.serverData.Score;
        var scoreIconList = this.drawCardData.serverData.ScoreIcon;
        var scoreRewardState = this.drawCardData.userData.scoreRewardState;
        // var maxScore = scoreList[scoreList.length - 1];
        var curScore = this.drawCardData.userData.drawScore;
        var nextScroeIdx = -1;
        // curScore = 0;
        for (var i = 0; i < this.scoreBox.length; i++) {
            var obj = this.scoreBox[i];
            obj.active = !!this.drawCardData.serverData.Rewards[i];
            if(!obj.active) continue;
            if(scoreRewardState[i] === constant.RecState.CAN){
                this.autoOpenIdx = i;
            }
            var scoreLabel = cc.find("bgChestData/number", obj).getComponent(cc.Label);
            var boxIcon = cc.find("lock", obj);
            var light = cc.find("glow", obj);
            var scoreNode = cc.find("bgChestData", obj);
            var recNode = cc.find("getMark", obj);
            var openB = cc.find("openB", obj);
            var openT = cc.find("openT", obj);
            var btn = cc.find("btn", obj);
            boxIcon.active = scoreRewardState[i] !== constant.RecState.DONE;
            openB.active =this.autoOpenIdx !== i && scoreRewardState[i] === constant.RecState.DONE;
            openT.active = this.autoOpenIdx !== i && scoreRewardState[i] === constant.RecState.DONE;

            scoreLabel.string = scoreList[i];
            uiResMgr.loadLockTreasureBox(scoreIconList[i],boxIcon);
            uiResMgr.loadOpenBBox(scoreIconList[i],openB);
            uiResMgr.loadOpenTBox(scoreIconList[i],openT);
            light.active = scoreRewardState[i] === constant.RecState.DONE;
            scoreNode.active = scoreRewardState[i] !== constant.RecState.DONE;
            recNode.active = scoreRewardState[i] === constant.RecState.DONE;
            btn.getComponent(cc.Button).interactable = scoreRewardState[i] !== constant.RecState.DONE;
            if( this.autoOpenIdx !== i){
                boxIcon.getComponent(cc.Button).interactable = scoreRewardState[i] === constant.RecState.CAN;
            }else{
                boxIcon.getComponent(cc.Button).interactable = false;
            }
            if(this.lastScore === undefined){
                if(i === 0){
                    var progress = curScore / scoreList[i] > 1?1:curScore / scoreList[i];
                    this.progressAni1.setProgress(progress);
                }else{
                    var progress = (curScore - scoreList[i - 1]) / (scoreList[i] - scoreList[i - 1]) > 1?1:(curScore - scoreList[i - 1]) / (scoreList[i] - scoreList[i - 1]);
                    this["progressAni" + (i+1)].setProgress(progress);
                }
            }
            if (curScore >= scoreList[i]) continue;
            nextScroeIdx = nextScroeIdx === -1 ? i : nextScroeIdx;
            // if(scoreRewardState[i] === constant.RecState.CAN)
            //     obj.getComponent(cc.Animation).play();
            // else
            //     obj.getComponent(cc.Animation).stop();
        }

        if(this.lastScore === undefined){//打开界面，不需要飘积分动画
            this.lastScore = curScore;
            this.toScore = curScore;
            this.scoreNum.string = curScore;
            this.scoreNum.node.active = curScore < scoreList[2];
            this.maxLabel.active = !this.scoreNum.node.active;
            // this.widget("actDrawCardPanel/shrink/btnLeft/cost").active = curScore < scoreList[2];
            // this.widget("actDrawCardPanel/shrink/btnRight/cost").active = curScore < scoreList[2];
            if(this.autoOpenIdx !== undefined){
                this.clickDrawScoreBox("",this.autoOpenIdx);
            }
        }else{
            this.toScore = curScore;
        }
        this.widget("actDrawCardPanel/shrink/btnLeft/cost").active = this.lastScore < scoreList[2];
        this.widget("actDrawCardPanel/shrink/btnRight/cost").active = this.lastScore < scoreList[2];
        // this.widget("actDrawCardPanel/plateCover/layout3").active = nextScroeIdx !== -1;
        if (this.widget("actDrawCardPanel/plateCover/layout3").active) {
            this.nextGiftLabel1.string = scoreList[nextScroeIdx] - curScore;
            this.nextGiftLabel2.string = uiLang.getMessage(this.node.name, 'nextLevelGift' + (nextScroeIdx + 1));
            this.nextGiftLabel2.node.color = uiColor.drawCard['gift' + (nextScroeIdx + 1)];
        }
    },

    //初始化up的怪物
    initUpMonster: function () {
        var upMonsterTid = this.drawCardData.serverData.FamilyID;
        for (var i = 0; i < this.islands.length; i++) {
            var obj = this.islands[i];
            obj.active = !!upMonsterTid[i];
            if(obj.active) {
                obj.position = this["islandsPos" + upMonsterTid.length][i] || obj.position;
                obj.scale = this["islandsScale" + upMonsterTid.length][i] || obj.scale;
                cc.find("namePlate", obj).active = upMonsterTid.length !== this.islands.length ? true : cc.find("namePlate", obj).active;
                obj.color = upMonsterTid.length === this.islands.length ? obj.color : uiColor.white;
                let spine = cc.find("spine", obj);
                spine.color = upMonsterTid.length === this.islands.length ? spine.color : uiColor.white;
            }
        }
        for (let i = 0; i < upMonsterTid.length; i++) {
            let obj = upMonsterTid[i];
            let familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj);
            let tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][4];
            let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
            this.islands[i].tid = obj;
            cc.find("namePlate/label", this.islands[i]).getComponent(cc.Label).string = uiLang.getConfigTxt(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
            uiResMgr.loadMonTypeIcon(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type],cc.find("namePlate/jobIcon", this.islands[i]),"monTypeEx");
            this.upMonSpine[i].node.scale = spineConfig[jsonTables.CONFIG_MONSTER.Scaling] / 100 * 1.3;
            let callback = function (spineData) {
                this.upMonSpine[i].skeletonData  = spineData;
                this.upMonSpine[i].setAnimation(0,'std',true);
            }.bind(this);
            uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callback);
        }
        this.clientEvent.dispatchEvent("setDrawCardCanTouch", upMonsterTid.length === this.islands.length);
        this.leftBtn.active = upMonsterTid.length === this.islands.length;
        this.rightBtn.active = upMonsterTid.length === this.islands.length;
        this.rateNode[0].active = upMonsterTid.length === this.islands.length ? this.rateNode[0].active : true;
        this.rateNode[1].active = upMonsterTid.length === this.islands.length ? this.rateNode[1].active : false;
        this.rateNode[0].active && (this.rateNode[0].scale = this.rateNodeScale[upMonsterTid.length - 1]);
        this.rateNode[1].active && (this.rateNode[1].scale = this.rateNodeScale[upMonsterTid.length - 1]);
        if(upMonsterTid.length === this.islands.length)
            this.clientEvent.dispatchEvent("resetActName",upMonsterTid[0]);
    },

    //初始化抽卡按钮
    initDrawBtn: function () {
        if(!this.drawCardData) return;
        var curDiamond = this.userLogic.getBaseData(this.userLogic.Type.Diamond);
        var oneDrawPrice = this.drawCardData.serverData.One.Num;

        var ticketId = this.getTicketData();
        var ticket = this.userLogic.getItemByID(ticketId);
        this.singleDrawPrice.string = ticket && ticket.num > 0 ? "1" : oneDrawPrice;

        uiResMgr.loadCurrencyIcon(constant.ItemType.ITEM, this.singleDrawIcon, ticketId);
        uiResMgr.loadCurrencyIcon(constant.ItemType.ITEM, this.tenDrawIcon, ticketId);

        if(ticket) {
            this.singleDrawPrice.node.color = ticket.num > 0?uiColor.green:uiColor.red;
            this.tenDrawPrice.node.color = ticket.num >= 10?uiColor.green:uiColor.red;
        }
        else {
            this.singleDrawPrice.node.color = uiColor.red;//curDiamond >= oneDrawPrice ? uiColor.green :
            this.tenDrawPrice.node.color = uiColor.red;
        }

        var tenDrawPrice = this.drawCardData.serverData.Ten.Num;
        this.tenDrawPrice.string = tenDrawPrice;
        //this.tenDrawPrice.node.color = curDiamond >= tenDrawPrice ? uiColor.green : uiColor.red;

        //var freeDraw = this.drawCardData.userData.freeDraw;

        this.singleDrawNode.active = true;
        //this.freeNode.active = !this.singleDrawNode.active;
        //this.freeLeftTime.node.active = this.singleDrawNode.active;

        var endTime = this.drawCardData.serverData.EndTime.toNumber();
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;

        this.btnOne.interactable = leftTime > 0;
        this.btnTen.interactable = leftTime > 0;

        let tid = this.drawCardData.serverData.FamilyID[0];
        // let familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,tid);
        // for (var i = 0; i < this.upMonQuality.length; i++) {
        //     var obj = this.upMonQuality[i];
        //     obj.string = uiManager.get("family" + familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality] + "Desc")
        // }

        //this.diamondNum.string = curDiamond;
        this.itemNum.string = ticket ? ticket.num : 0;
        this.singleDrawTimesLabel.string = uiLang.getMessage(this.node.name, "getMonsTime").formatArray([this.drawCardData.userData.limitDrawMustBe]);
        //this.setFreeLeftTime();
    },

    //获取ticketData
    getTicketData: function () {
        var itemIDList = this.drawCardData.serverData.ItemID;
        var itemID = 1;
        if(itemIDList.length === 0) {
            cc.error("活动关联物品没有配置");
        }
        else {
            itemID = itemIDList[0];
        }
        return itemID;
    },

    //设置活动剩余时间
    setActLeftTime: function () {
        var endTime = this.drawCardData.serverData.EndTime.toNumber();
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;
        this.needUpdateLeft = leftTime < 3600 * 24;
        var timeList = "";
        if(leftTime>0) {
            if(this.needUpdateLeft) {
                timeList = this.timeLogic.getCommonCoolTime(endTime - nowTime);
            }
            else {
                timeList = this.timeLogic.getCommonShortTime(endTime - nowTime);
                timeList = timeList.join("");
            }
        }
        else {
            timeList = uiLang.getMessage("mainSceneUI","out");
            this.needUpdateLeft = false;
            this.actEnd = true;
            this.btnOne.interactable = false;
            this.btnTen.interactable = false;
        }
        this.actLeftTime.string = timeList;
    },


    //设置免费倒计时 废弃
    //setFreeLeftTime: function () {
    //    if(!this.freeLeftTime.node.active) return;
    //    var endTime = this.drawCardData.userData.freeNext.toNumber();
    //    var timeString = "00:00:00";
    //    if(endTime > 0) {
    //        var nowTime = this.timeLogic.now();
    //        timeString = this.timeLogic.getCommonCoolTime(endTime - nowTime);
    //    }
    //    timeString = uiLang.getMessage(this.node.name, "leftTimeFree").formatArray([timeString]);
    //    this.freeLeftTime.string = timeString;
    //},

    //抽卡动画
    showDrawCardAnim: function (reward, extraReward) {
        this.flyNode.position =reward.length === 1? this.flyInitPosOne:this.flyInitPosTen;
        this.userLogic.setCanPlayUpLvAni(true);//不允许弹升级动画
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.SUMMON);
        var anim = this.node.getComponent(cc.Animation);
        var state = anim.play(anim.getClips()[2].name);
        var callback = function () {
            var scoreList = this.drawCardData.serverData.Score;//积分数组
            if(this.lastScore >= scoreList[2])  return;
            this.breakNode.active = true;

            this.flyNode.getChildByName("Particle").getComponent(cc.ParticleSystem).resetSystem();
            this.flyNode.active = true;
            var ani = this.flyNode.getComponent(cc.Animation);
            ani.once(constant.AnimationState.FINISHED, function () {
                var move = cc.moveTo(0.5,this.flyToPos);
                var callfunc = cc.callFunc(function(){
                    this.runProgress();
                    this.flyNode.active = false;
                    this.widget("actDrawCardPanel/shrink/progressBar/progressStart/dam1").getComponent(cc.Animation).play();
                }, this);
                var seq = cc.sequence(move.easing(cc.easeSineIn()),callfunc);
                this.flyNode.runAction(seq);
            }, this);
            ani.play();
        }.bind(this);
        var callback1 = function () {
            let state1 = anim.play(anim.getClips()[1].name);
            state1.once(constant.AnimationState.FINISHED, function () {
                if(reward.length === 1){
                    var cb = function () {
                        uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_REWARD,constant.DrawCardSrcEnum.ActDrawCard,reward,extraReward,callback,tb.MONSTER_A);
                    }.bind(this);
                    var info = {
                        FamilyID:reward[0].BaseID,
                        Exp:0
                    }
                    uiManager.openUI(uiManager.UIID.FAMILY_EFFECTEX,info,cb);
                }else{
                    uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_REWARD,constant.DrawCardSrcEnum.ActDrawCard,reward,extraReward,callback,tb.MONSTER_A);
                }

            }, this);
        };
        state.once(constant.AnimationState.FINISHED, callback1, this);
    },
    //积分开始涨
    runProgress:function () {
        this.setCannotDraw(true);
        var scoreList = this.drawCardData.serverData.Score;//积分数组
        this.runIdx = undefined;//需要滚动的进度条的下标
        for (var i = 0 , len = scoreList.length; i < len; i++) {
            var obj = scoreList[i];
            if(this.lastScore < obj){
                this.runIdx = i;
                break;
            }
        }
        if(this.runIdx === undefined){//都已经MAX了，不滚了
            this.breakNode.active = false;
            return;
        }
        for (var i = 0 , len = this.progressAniArr.length; i < len; i++) {
            var obj = this.progressAniArr[i];
            obj.active = i === this.runIdx;
        }
        this.scoreBase = scoreList[this.runIdx - 1]?scoreList[this.runIdx - 1]:0;//进度条的底分
        this.runScore = scoreList[this.runIdx] - this.scoreBase;
        var progressAni = this["progressAni" + (this.runIdx + 1)];
        var data = {};
        data.callBack = this.progressCb.bind(this);
        data.progressCb = this.updateExpLabel.bind(this);
        data.curProgress = (this.lastScore - this.scoreBase) / this.runScore;
        data.interval = this.interval;
        if(this.toScore > scoreList[this.runIdx]){//升级
            this.nextRun = this.runIdx < scoreList.length-1;
            data.costTime = this.proRunTime * (scoreList[this.runIdx] - this.lastScore) / 100;//花费总时间
            data.allProgress = 1;
        }else{//没有升级了
            data.costTime = this.proRunTime * (this.toScore - this.lastScore) / 100;//花费总时间
            data.allProgress = (this.toScore - this.scoreBase) / this.runScore;
        }
        this.setProgressAniPos(this.runIdx,data.curProgress);
        progressAni.setData(data);
    },

    setProgressAniPos:function (idx,progree) {
        this.progressAniArr[idx].y = this.aniLength[idx] * (progree - 0.5);
    },

    updateExpLabel:function(progress){
        this.setProgressAniPos(this.runIdx,progress);
        this.lastScore = this.scoreBase + Math.floor(this.runScore * progress);
        this.scoreNum.string = this.lastScore;
    },
    progressCb:function(){
        var scoreList = this.drawCardData.serverData.Score;//积分数组
        this.setCannotDraw(false);
        if(this.nextRun){
            this.nextRun = false;
            // this.glowArr[this.runIdx].active = true;
            this.scoreBox[this.runIdx].getChildByName("glow").active = true;
            this.scoreBox[this.runIdx].getChildByName("lock").getComponent(cc.Button).interactable = true;
            this.progressAniArr[this.runIdx].active = false;
            this.runIdx ++;
            this.progressAniArr[this.runIdx].active = true;
            this.scoreBase = scoreList[this.runIdx - 1]?scoreList[this.runIdx - 1]:0;//进度条的底分
            this.runScore = scoreList[this.runIdx] - this.scoreBase;
            var progressAni = this["progressAni" + (this.runIdx + 1)];
            var data = {};
            data.callBack = this.progressCb.bind(this);
            data.progressCb = this.updateExpLabel.bind(this);
            data.curProgress = (this.lastScore - this.scoreBase) / this.runScore;
            data.interval = this.interval;
            data.costTime = this.proRunTime * (this.toScore - this.lastScore) / 100;//花费总时间
            data.allProgress = (this.toScore - this.scoreBase) / this.runScore;
            this.setProgressAniPos(this.runIdx,data.curProgress);
            progressAni.setData(data);
        }else{
            this.lastScore = this.toScore;
            if(this.lastScore >= scoreList[this.runIdx]){
                this.scoreBox[this.runIdx].getChildByName("glow").active = true;
                this.scoreBox[this.runIdx].getChildByName("lock").getComponent(cc.Button).interactable = true;
            }
            this.scoreNum.string = this.lastScore;
            this.scoreNum.node.active = this.lastScore < scoreList[2];
            this.maxLabel.active = !this.scoreNum.node.active;
            this.breakNode.active = false;
            if(this.autoOpenIdx !== undefined){
                this.clickDrawScoreBox("",this.autoOpenIdx);
            }
            this.widget("actDrawCardPanel/shrink/btnLeft/cost").active = this.lastScore < scoreList[2];
            this.widget("actDrawCardPanel/shrink/btnRight/cost").active = this.lastScore < scoreList[2];
            this.progressAniArr[this.runIdx].active = false;
        }
    },

    //设置抽卡按钮是否可点
    setCannotDraw: function (cannotDraw) {
        this.cannotDraw = cannotDraw;
    },

    //点击怪物转变动作
    touchMonster: function (event) {
        var name = event.target.name;
        var idx = parseInt(name[name.length-1]);
        this.upMonSpine[idx-1].setAnimation(0,'atk',false);
        this.upMonSpine[idx-1].addAnimation(0,'std',true);
    },


    tipDiamondLess: function () {
        var message = {
            "message":  uiLang.getMessage(this.node.name, "diamondLess"),
            "button1":{
                "name": uiLang.getMessage("b", "MBCANCEL"),
                "callback": function(){}
            },
            "button3":{
                "name": uiLang.getMessage("b", "gotoShop"),
                "callback":function () {
                    if(this.activityLogic.checkDiamonOpen()){
                        uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
                    }else{
                        uiManager.openUI(uiManager.UIID.SHOPPANEL,constant.ShopType.DIAMOND);
                    }
                }.bind(this)
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    },

    //单抽
    clickOneDraw: function () {
        if(this.cannotDraw) return;
        // var freeDraw = this.drawCardData.userData.freeDraw;
        // if(freeDraw === 0) {
        //     var ticket = this.getTicketData();
        //     if(!ticket || ticket.num === 0) {
        //         var curDiamond = this.userLogic.getBaseData(this.userLogic.Type.Diamond);
        //         var oneDrawPrice = this.drawCardData.serverData.One.Num;
        //         if(curDiamond < oneDrawPrice) {
        //             this.tipDiamondLess();
        //             return;
        //         }
        //     }
        // }

        var ticketId = this.getTicketData();
        var ticket = this.userLogic.getItemByID(ticketId);
        if(!ticket || ticket.num <= 0) {
            uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_SHOP,true);
            return;
        }
        this.activityLogic.req_Draw(1);
        // this.btnOne.interactable = false;
        this.setCannotDraw(true);
    },

    //十连
    clickTenDraw: function () {
        if(this.cannotDraw) return;

        var ticketId = this.getTicketData();
        var ticket = this.userLogic.getItemByID(ticketId);
        if(!ticket || ticket.num < 10) {
            uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_SHOP,true);
            return;
        }
        // var curDiamond = this.userLogic.getBaseData(this.userLogic.Type.Diamond);
        // var tenDrawPrice = this.drawCardData.serverData.Ten.Num;
        // if(curDiamond < tenDrawPrice) {
        //     this.tipDiamondLess();
        //     return;
        // }
        this.activityLogic.req_Draw(10);
        // this.btnTen.interactable = false;
        this.setCannotDraw(true);
    },

    //领取积分宝箱或打开积分宝箱说明界面
    clickDrawScoreBox: function (event, cusData) {
        var boxIdx = parseInt(cusData);
        var scoreList = this.drawCardData.serverData.Score;
        var scoreNum = scoreList[boxIdx];
        var curScore = this.drawCardData.userData.drawScore;

        if(scoreNum > curScore) {
            uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_SCORE, boxIdx);
            return;
        }
        this.setCannotDraw(true);
        this.activityLogic.req_Rec_Draw(scoreNum);
    },

    getDrawScoreBox:function (Rewards) {
        var scoreIconList = this.drawCardData.serverData.ScoreIcon;
        var boxID = scoreIconList[this.autoOpenIdx];
        this.scoreBox[this.autoOpenIdx].getChildByName("lock").active = false;
        this.scoreBox[this.autoOpenIdx].getChildByName("openB").active = false;
        this.scoreBox[this.autoOpenIdx].getChildByName("openT").active = false;
        var cb = function () {
            this.setCannotDraw(false);
            this.scoreBox[this.autoOpenIdx].getChildByName("openB").active = true;
            this.scoreBox[this.autoOpenIdx].getChildByName("openT").active = true;
            this.autoOpenIdx = undefined;
        }.bind(this);
        var copyNode = this.scoreBox[this.autoOpenIdx].getChildByName("lock");
        uiManager.openUI(uiManager.UIID.OPENBOXANI,Rewards,boxID,cb,copyNode);
    },

    openShop:function () {
        if(this.isEnd())   {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("actLimitGift","endTip"));
            return;
        }
        if(this.cannotDraw) return;
        uiManager.openUI(uiManager.UIID.SHOPPANEL);
    },

    closeEvent:function () {
        if(this.cannotDraw) return;
        this.close();
    },
    //规则界面
    openRule: function () {
        uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_RULE);
    },

    //卡券商店
    openActShop: function() {
        if(this.isEnd())   {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("actLimitGift","endTip"));
            return;
        }
        if(this.cannotDraw) return;

        uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_SHOP,true);
    },

    update:function (dt) {
        this.updateTime+=dt;
        if(this.updateTime<1) return;
        this.updateTime = 0;
        //this.setFreeLeftTime();
        if(this.needUpdateLeft)
            this.setActLeftTime();
    }
});
