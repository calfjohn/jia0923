var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        redDot:[cc.Node],//与constant得RedDot下标对应
        firstFrame:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        uiManager.fitScreen(this.node,true);
        this.refreshMainBtnActive();
        this.cardLogic.checkLineUpRedDot();
        // this.widget("mainSceneUI/shrink/buttonMonthCardNode/buttonMonthCard").active = false;
        this.freshVit = false;
        this.freshDraw = false;
        this.timeCount = 0;
        this.firsLogin = !this.guideLogic.isInGuideFlag();
        this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label2").active = this.freshVit;
        this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge").active  = false;
        this.registerEvent();
    },
    start:function(){
        jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/topHeadl/avatar"));
        jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/topHeadl/topFrame"));
        jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/buttonActivityNode"));
        jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/middle"));
        // jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/middle/achi"));
        // jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/middle/mail"));
        jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/down/lineUp"));
        jsonTables.fixResolutionIcon(this.widget("mainSceneUI/shrink/ipx"));
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshMainBtnActive", this.refreshMainBtnActive.bind(this),true],
            ["guideAction", this.guideAction.bind(this),true],
            // ["vipDayRefresh", this.vipDayRefresh.bind(this),true],
            ["checkLineUpRedDot", this.checkLineUpRedDot.bind(this),true],
            ["showMainScene", this.showMainScene.bind(this),true],
            ["refreshGetNew", this.showMainScene.bind(this),true],
            ["refreshActData", this.refreshActData.bind(this),true],
            ["refreshFirstChargePoint", this.refreshFirstChargePoint.bind(this),true],
            ["loadScene", this.loadScene.bind(this),true],
            ["changeLanguage", this.refreshLimitTime.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.refreshHead.bind(this)],
        ]
        this.registerDataEvent(registerHandler);
    },
    loadScene:function (SceneID) {
        if(SceneID === constant.SceneID.LOGIN){
            this.guideAction("btnVisible",true);
        }
    },
    showMainScene:function () {
        this.refreshLimitTime();

        this.widget("mainSceneUI/shrink/down/lineUp/talk").active = this.cardLogic.getIsPlaySpecial();
        this.widget("mainSceneUI/shrink/down/lineUp/iconApart/flashOfLight").active = this.widget("mainSceneUI/shrink/down/lineUp/talk").active;
    },
    //refresh 活动相关按钮和红点
    refreshActData:function () {
        this.widget("mainSceneUI/shrink/buttonActivityNode/buttonSpring").active = this.activityLogic.checkSpringActive();
        if(this.widget("mainSceneUI/shrink/buttonActivityNode/buttonSpring").active){
            this.widget("mainSceneUI/shrink/buttonActivityNode/buttonSpring/redPoint").active = this.activityLogic.checkSpringRedPoint();
        }
        this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge").active = this.activityLogic.checkFirstChargeActive();
        if(this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge").active) {
            this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge/redPoint").active = this.activityLogic.getFirstChargeRedPoint();
            var firstData = this.activityLogic.getFirstChargeData();
            var idx = firstData.serverData.Priority - 1;
            this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge/rick").getComponent(cc.Sprite).spriteFrame = this.firstFrame[idx];
        }
        //累计充值按钮
        this.widget("mainSceneUI/shrink/enterTop/buttonCumulative").active = this.activityLogic.checkCumulativeActive();
        if(this.widget("mainSceneUI/shrink/enterTop/buttonCumulative").active) {
            this.widget("mainSceneUI/shrink/enterTop/buttonCumulative/redPoint").active = this.activityLogic.checkCumulativeRedDot();
        }
        this.refreshLimitGift();
        this.widget("mainSceneUI/shrink/buttonActivityNode/buttonActivity/redPoint").active = this.activityLogic.getRechargeActRedPoint();
        this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDailyActivity/redPoint").active = this.activityLogic.getDailyActRedPoint();
        var drawData = this.activityLogic.getDrawCardData();
        // this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDrawCard").active = !!drawData;
        this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDrawCard").active = false;
        var endTime = drawData ? drawData.serverData.EndTime.toNumber() : 0;
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;
        this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDrawCard/redPoint").active = drawData && drawData.userData.freeDraw && leftTime > 0;
        if(drawData && drawData.serverData){
            this.drawTime = drawData.serverData.EndTime.toNumber();
            this.refreshDraw();
        }else{
            this.drawTime = 0;
        }
    },
    //首充的红点
    refreshFirstChargePoint () {
        var firstChargeData = this.activityLogic.getFirstChargeData();
        this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge/iconCard2/redPoint").active = firstChargeData.userData.firstChargeTag === constant.RecState.CAN;
    },
    refreshHead:function(param){
        var refreshNow = !this.node.parent.active;
        this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label4").getComponent("scaleAni").init( param[this.userLogic.Type.Gold],refreshNow);
        this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label3").getComponent("scaleAni").init( param[this.userLogic.Type.Diamond],refreshNow);
        this.widget("mainSceneUI/shrink/topHeadl/avatar/growthValue1/growLabel").getComponent(cc.Label).string = param[this.userLogic.Type.GrowthValue];
        this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label1").getComponent(cc.Label).string = param[this.userLogic.Type.Vit] + "/" + param[this.userLogic.Type.MaxVit];
        this.widget("mainSceneUI/shrink/topHeadl/avatar/progressBar").getComponent(cc.ProgressBar).progress = param[this.userLogic.Type.Exp] / param[this.userLogic.Type.MaxExp];
        this.widget("mainSceneUI/shrink/topHeadl/avatar/lab/expLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Exp] + "/" + param[this.userLogic.Type.MaxExp];
        this.widget("mainSceneUI/shrink/topHeadl/avatar/lab/nameLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Name];
        this.widget("mainSceneUI/shrink/topHeadl/avatar/lab/lvLabel").getComponent(cc.Label).string ="LV." + param[this.userLogic.Type.Lv];
        // this.widget("mainSceneUI/shrink/topHeadl/avatar/number1/numberLabel1").getComponent(cc.Label).string = param[this.userLogic.Type.VipLv] ? kf.numToRome(param[this.userLogic.Type.VipLv]):"--";
        uiResMgr.loadPlayerHead(param[this.userLogic.Type.Icon],param[this.userLogic.Type.IconUrl],this.widget("mainSceneUI/shrink/topHeadl/avatar/mask/avatar"));

        // this.redDot[constant.RedDotEnum.SiginIn].active = this.userLogic.getRedValue(constant.RedDotEnum.SiginIn) > 0;
        this.redDot[constant.RedDotEnum.Mail].active = this.userLogic.getRedValue(constant.RedDotEnum.Mail) > 0;
        this.redDot[constant.RedDotEnum.DailyTask].active = this.userLogic.getRedValue(constant.RedDotEnum.DailyTask) > 0 || this.userLogic.getRedValue(constant.RedDotEnum.Achi) > 0;
        this.redDot[constant.RedDotEnum.Week].active = this.userLogic.getRedValue(constant.RedDotEnum.Week) > 0;

        var nextTime = this.userLogic.getBaseData(this.userLogic.Type.VitTime);
        this.freshVit = !(nextTime.equals(dcodeIO.Long.ZERO));
        this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label2").active = this.freshVit;
        if (this.freshVit) {
          this.timeCount = 1;
        }
    },

    refreshLimitGift:function(){
        this.widget("mainSceneUI/shrink/enterTop/buttonActLimitPack").active = this.activityLogic.checkLimitGiftActive();
        if(this.guideLogic.isInGuideFlag()) return;
        if(this.firsLogin){
            this.firsLogin = false;
            var openSign = () => {
                var signCb = function () {
                    this.activityLogic.checkLoginActOpen();
                }.bind(this)
                if (this.activityLogic.checkNeedSignSeven()) {
                    uiManager.openUI(uiManager.UIID.DAILYACTIVITY,signCb);
                }
            }
            var hasCanBuy = this.activityLogic.checkHasLimitCanBuy();
            if(hasCanBuy){
                var cb = function () {
                    var drawData = this.activityLogic.getDrawCardData();
                    if(drawData){
                        uiManager.openUI(uiManager.UIID.ACT_START_MSG, openSign);
                    } else {
                        openSign();
                    }
                }.bind(this);
                uiManager.openUI(uiManager.UIID.ACT_LIMIT_PACK,true,cb);
                return;
            }
            var drawData = this.activityLogic.getDrawCardData();//是否弹出限时抽卡界面
            if(drawData){
                uiManager.openUI(uiManager.UIID.ACT_START_MSG, openSign);
                return;
            }
            openSign();
        }
        this.refreshLimitTime();
    },

    refreshLimitTime: function () {
        var limitPackData = this.activityLogic.getLimitPackData();
        //直接通过按钮即可判断是否需要这个
        if(!this.widget("mainSceneUI/shrink/enterTop/buttonActLimitPack").active) return;//判断节点是否显现来判定活动是否开启
        if(!limitPackData || !limitPackData.serverData) return;//再次判断是否有服务端发来的数据，以及需要使用的数据是否存在
        var endTime = limitPackData.serverData.EndTime.toNumber();
        var nowTime = this.timeLogic.now();
        var leftTime = endTime - nowTime;
        this.limitUpdateLeft = leftTime < 3600 * 24;
        // var timeList = "";
        // if(leftTime>0) {
        //     if(this.limitUpdateLeft) {
        //         timeList = this.timeLogic.getCommonCoolTime(endTime - nowTime);
        //     }
        //     else {
        //         // timeList = this.timeLogic.getCommonShortTime(endTime - nowTime);
        //         // timeList = timeList.join("");
        //         timeList = uiLang.getMessage("actLimitGift","actSlogan");
        //     }
        // }
        // else {
        //     timeList = uiLang.getMessage("mainSceneUI","out");
        // }
        // this.widget("mainSceneUI/shrink/enterTop/buttonActLimitPack/label").getComponent(cc.Label).string = timeList;
    },


    guideAction:function(type,ext){
        if (type === "btnVisible") {
            this.widget("mainSceneUI/shrink/middle").active = ext;
            this.widget("mainSceneUI/shrink/down").active = ext;
            this.widget("mainSceneUI/shrink/activity").active = ext;
            this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge").active = ext && this.activityLogic.checkFirstChargeActive();
            this.widget("mainSceneUI/shrink/ipx").active = ext;
            this.widget("mainSceneUI/shrink/topHeadl/avatar/mask").getComponent(cc.Button).interactable = ext;
            this.widget("mainSceneUI/shrink/buttonActivityNode").active = ext;
            this.widget("mainSceneUI/shrink/enterTop/buttonActLimitPack").active = ext && this.activityLogic.checkLimitGiftActive();
        }
    },

    refreshMainBtnActive:function(){
        var info = this.loginLogic.getNoticeInfo();
        var rightList = info && info.MainBtnHidden && info.MainBtnHidden.RightLabel ? info.MainBtnHidden.RightLabel : [];
        var rightContent = this.widget('mainSceneUI/shrink/middle');
        this._setChildVisible(rightContent,rightList);
        // var leftList =  info && info.MainBtnHidden && info.MainBtnHidden.LeftHeadLabel ? info.MainBtnHidden.LeftHeadLabel : [];
        // var leftContent = this.widget('mainSceneUI/shrink/activity');
        // this._setChildVisible(leftContent,leftList);

        var downList =  info && info.MainBtnHidden && info.MainBtnHidden.DownHeadLabel ? info.MainBtnHidden.DownHeadLabel : [];
        var downContent = this.widget('mainSceneUI/shrink/down');
        this._setChildVisible(downContent,downList);

        // this.setFunVisible("mainSceneUI/shrink/rightHead/ranking",constant.FunctionTid.RANK);
        this.setFunVisible("mainSceneUI/shrink/middle/mail",constant.FunctionTid.MAIL);
        this.setFunVisible("mainSceneUI/shrink/down/lineUp",constant.FunctionTid.LINEUP);
        // this.setFunVisible("mainSceneUI/shrink/down/reel",constant.FunctionTid.REEL);
        // this.setFunVisible("mainSceneUI/shrink/middle/task",constant.FunctionTid.MINE);

    },

    setFunVisible:function(nodePath,tid){
        if (this.widget(nodePath).active) {//如果显示标识未被后台控制
            this.widget(nodePath).active = jsonTables.isFunVisible(tid);
            if (this.widget(nodePath).active) {
                this.widget(nodePath).active = jsonTables.funOpenCheck(tid);
            }
        }
    },

    checkLineUpRedDot:function (state) {
        this.widget("mainSceneUI/shrink/down/lineUp/numFrame2").active = state;
    },

    _setChildVisible:function(node,list){
        if (Object.prototype.toString.call(list)!=='[object Array]') {
            list = [];
        }
        for (var i = 0 , len = node.children.length; i < len; i++) {
            var obj = node.children[i];
            obj.active = !kf.inArray(list,(i+1));
        }
    },
    openUi:function(_,param){
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },
    openShop:function(_,param){
        if(Number(param) === constant.ShopType.DIAMOND && this.activityLogic.checkDiamonOpen()){
            uiManager.openUI(uiManager.UIID.FIRSTPACKPANEL);
        }else{
            uiManager.openUI(uiManager.UIID.SHOPPANEL,Number(param));
        }
    },
    //体力购买
    buyVit:function(){
        this.userLogic.buyVit();
    },//mainSceneUI/shrink/topHeadl/topFrame/lab/label2

    // vipDayRefresh:function () {
        // this.widget("mainSceneUI/shrink/enterTop/buttonFirstCharge").active = this.shopLogic.getCanBuy();
    // },
    // called every frame, uncomment this function to activate update callback
    refreshDraw:function () {
        return;
        var offTime = this.drawTime - this.timeLogic.now();
        var needUpdateLeft = offTime > 3600 * 24;
        var str = "";
        if(needUpdateLeft){
            str = uiLang.getMessage(this.node.name,"drawName");
        }else if(offTime > 0){
            str = this.timeLogic.getCommonCoolTime(offTime);
        }else{
            str = uiLang.getMessage(this.node.name,"out");
            this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDrawCard").active = false;
        }
        this.widget("mainSceneUI/shrink/buttonActivityNode/buttonDrawCard/label").getComponent(cc.Label).string = str;
    },
    update :function(dt) {
        // if (!this.freshVit)   return;
        this.timeCount += dt;
        if (this.timeCount < 1) return;
        this.timeCount -= 1;
        if(this.freshVit){
            var nextTime = this.userLogic.getBaseData(this.userLogic.Type.VitTime);
            var offTime = nextTime.toNumber() - this.timeLogic.now();
            this.freshVit = offTime > 0;
            this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label2").active = this.freshVit;
            if (!this.freshVit) {
              return;
            }
            this.widget("mainSceneUI/shrink/topHeadl/topFrame/lab/label2").getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
        }

        // if(this.drawTime){
        //     this.refreshDraw();
        // }
        if(this.limitUpdateLeft){
            this.refreshLimitTime();
        }
    },


    openUrl:function (_,idx) {
        idx = Number(idx);
        var url = this.userLogic.getLinkFromServer(idx);
        if (!url) {
            return cc.error("链接都没有 开个啥")
        }
        cc.sys.openURL(url);
    },

});
