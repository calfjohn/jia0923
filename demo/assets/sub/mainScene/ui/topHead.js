var panel = require("panel");
cc.Class({
    extends: panel,
    properties: {
        redDot:[cc.Node],//与constant得RedDot下标对应
        proRunTime:2,
        interval:0.05,
        flyBindNode:[cc.Node],
        _initFlag:true,
    },
    onLoad:function () {
        if (this.initFlag) return;
        this.initModule();
        this.initFlag = true;
        this.expInitPos = this.widget("topHead/shrink/experience").position;
        jsonTables.parsePrefab(this);
        uiManager.regisFlyNode(this.flyBindNode);
        this.registerEvent();
        uiManager.fitScreen(this.node);
    },
    initModule:function(){
        this.lvLabel = this.widget("topHead/shrink/experience/levelLabel").getComponent(cc.Label);
        this.expLabel = this.widget("topHead/shrink/experience/label0").getComponent(cc.Label);
        this.progressCom = this.widget("topHead/shrink/experience").getComponent(cc.ProgressBar);
        this.progressjS = this.widget("topHead/shrink/experience").getComponent("progressAni");
    },
    registerEvent: function () {
        var registerHandler = [
            ["setLockExp", this.setLockExp.bind(this)],
            ["leaderWeek", this.leaderWeek.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.refreshHead.bind(this)],
        ]
        this.registerDataEvent(registerHandler);
    },
    refreshHead:function(param){
        if (!this.initFlag) {//
            this.onLoad();
        }
        this.redDot[constant.RedDotEnum.Week].active = this.userLogic.getRedValue(constant.RedDotEnum.Week) > 0;
        var refreshNow = !this.node.active;
        this.widget("topHead/shrink/gold/label2").getComponent("scaleAni").init( param[this.userLogic.Type.Gold],refreshNow);
        this.widget("topHead/shrink/diamond/label3").getComponent("scaleAni").init( param[this.userLogic.Type.Diamond],refreshNow);
        this.widget("topHead/shrink/physicalStrength/label1").getComponent(cc.Label).string = param[this.userLogic.Type.Vit] + "/" + param[this.userLogic.Type.MaxVit];
        this.widget("topHead/shrink/debris/label0").getComponent(cc.Label).string = this.cardLogic.getPubHeroClip();
        // this.widget("topHead/shrink/lab/label0").getComponent(cc.Label).string = param[this.userLogic.Type.Exp] + "/" + param[this.userLogic.Type.MaxExp];
        // this.widget("topHead/shrink/experience").getComponent(cc.ProgressBar).progress = param[this.userLogic.Type.Exp] / param[this.userLogic.Type.MaxExp];
        // this.widget("topHead/shrink/lab/levelLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Lv];
        if(this.curExp === param[this.userLogic.Type.Exp] && this.lvLabel.string === param[this.userLogic.Type.Lv] )  return;//fix 切换语言BUG
        if(this._initFlag || refreshNow || !this.widget("topHead/shrink/experience").active){//立即刷新
            this._initFlag = false;
            this.curLv = param[this.userLogic.Type.Lv];
            this.curExp = param[this.userLogic.Type.Exp];
            this.curExpMax = param[this.userLogic.Type.MaxExp];
            this.toLv = param[this.userLogic.Type.Lv];
            this.toExp = param[this.userLogic.Type.Exp];
            this.toExpMax = param[this.userLogic.Type.MaxExp];
            this.expLabel.string = this.curExp + "/" + this.curExpMax;
            this.progressCom.progress = this.curExp / this.curExpMax;
            this.lvLabel.string = this.curLv;
            return;
        }
        this.toLv = param[this.userLogic.Type.Lv];
        this.toExp = param[this.userLogic.Type.Exp];
        this.toExpMax = param[this.userLogic.Type.MaxExp];
        if(this.lockExp)    return;
        this.playExpProgress();
    },

    playExpProgress:function(){
        var data = {};
        data.callBack = this.progressCb.bind(this);
        data.progressCb = this.updateExpLabel.bind(this);
        data.curProgress = this.curExp / this.curExpMax;
        data.interval = this.interval;
        if(this.curLv === this.toLv){//没有升级
            data.costTime = this.proRunTime * (this.toExp - this.curExp) / this.curExpMax;//花费总时间
            data.allProgress = this.toExp / this.curExpMax;
        }else{//升级了
            data.costTime = this.proRunTime * (this.curExpMax - this.curExp) / this.curExpMax;//花费总时间
            data.allProgress = 1;
        }
        this.progressjS.setData(data);
    },

    updateExpLabel:function(progress){
        this.curExp = Math.floor(this.curExpMax * progress);
        this.expLabel.string = this.curExp + "/" + this.curExpMax;
    },
    progressCb:function(){
        if(this.curLv === this.toLv){//进度结束
            this.curExp = this.toExp;
            this.expLabel.string = this.curExp + "/" + this.curExpMax;
        }else{//上一级跑满了
            this.curLv = this.toLv;
            this.lvLabel.string  = this.curLv;
            this.curExpMax = this.toExpMax;
            this.curExp = 0;
            this.userLogic.playUpLvAni();
            if(this.toExp === 0){//刚刚好，结束了
                this.expLabel.string = this.curExp + "/" + this.curExpMax;
                this.progressCom.progress = 0;
                return;
            }
            var data = {};
            data.callBack = this.progressCb.bind(this);
            data.progressCb = this.updateExpLabel.bind(this);
            data.curProgress = this.curExp / this.curExpMax;
            data.costTime = this.proRunTime * (this.toExp - this.curExp) / this.curExpMax;//花费总时间
            data.allProgress = this.toExp / this.curExpMax;
            this.progressjS.setData(data);
        }

    },
    setStatus:function(data){
        if (!data) return;
        if(data.Status !== constant.TopHeadStatus.UNCLOSE){
            this.node.setLocalZOrderEx(data.Order);
        }
        if(this.status === data.Status)  return;
        this.status = data.Status;
        this.node.active = data.Status !== constant.TopHeadStatus.CLOSE;
        if(data.Status === constant.TopHeadStatus.UNCLOSE){
            return;
        }
        this.lockExp = false;//锁定经验值进度条动画
        this.widget("topHead/shrink/experience").active = (data.Status !== constant.TopHeadStatus.NOEXP && data.Status !== constant.TopHeadStatus.NOVITEXP) || data.Status === constant.TopHeadStatus.DEBRIS;
        this.widget("topHead/shrink/physicalStrength").active = data.Status !== constant.TopHeadStatus.NOVIT && data.Status !== constant.TopHeadStatus.NOVITEXP && data.Status !== constant.TopHeadStatus.DEBRIS;
        this.widget("topHead/shrink/debris").active = data.Status === constant.TopHeadStatus.DEBRIS;
        var strenthNode = this.widget("topHead/shrink/physicalStrength");
        var pos = cc.v2(strenthNode.x - strenthNode.width / 2, strenthNode.y);
        this.widget("topHead/shrink/experience").position = data.Status === constant.TopHeadStatus.NOVIT || data.Status === constant.TopHeadStatus.DEBRIS?pos:this.expInitPos;
    },

    setLockExp:function(status){
        if(this.lockExp === status) return;
        this.lockExp = status;
        if(!this.lockExp){
            this.playExpProgress();
        }
    },

    leaderWeek:function (isOpen) {
        if(isOpen){
            this.widget("topHead/shrink/experience").getComponent(cc.Animation).play();
        }else{
            this.widget("topHead/shrink/experience").getComponent(cc.Animation).stop();
            this.widget("topHead/shrink/experience").scale = 1;
        }
    },

    openUi:function(_,param){
        // if () return;
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },
    openShop:function(_,param){
        // if () return;
        this.clientEvent.dispatchEvent("clickTopHeadShop");
        if(Number(param) === constant.ShopType.DIAMOND && this.activityLogic.checkDiamonOpen()){
            uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
        }else{
            uiManager.openUI(uiManager.UIID.SHOPPANEL,Number(param));
        }
    },
    //体力购买
    buyVit:function(){
        this.userLogic.buyVit();
    },
    // update (dt) {},
});
