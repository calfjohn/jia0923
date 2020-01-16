var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        monsterContentPrefab:cc.Prefab,
        upgradeAni:cc.Animation,//升级特效组件
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initNodes();
        this.registerEvent();
        this.duration = 1;
        this.monsterContent = this.monsterNode.getInstance(this.monsterContentPrefab,true);
        this.cloudAni.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.cardLogic.checkLineUpRedDot();
    },
    initNodes:function(){
        this.selfNode = this.widget('minePanel/shrink/in/self');
        this.otherNode = this.widget('minePanel/shrink/in/other');
        this.gradeLabelNode = this.widget('minePanel/shrink/in/intelligence/bgContent/numberLabel');
        this.yieldLabelNode = this.widget('minePanel/shrink/in/intelligence/bgContent2/yieldlabel/numberLabel');
        this.badgeNode = this.widget('minePanel/shrink/in/intelligence/bgContent1/label');//
        this.powerNode = this.widget('minePanel/shrink/brand/center/numberLabel');//
        this.nameNode = this.widget('minePanel/shrink/brand/label2');
        // this.atkCount = this.widget('minePanel/shrink/in/self/button2/sword/label');
        this.unCollectTipNode = this.widget("minePanel/shrink/in/self/mining");
        this.collectTipNode = this.widget("minePanel/shrink/in/self/collect1");
        this.collectBtnNode = this.widget("minePanel/shrink/in/self/button3");
        this.collectingBtnNode = this.widget("minePanel/shrink/in/self/button4");
        this.upgradeBtnNode = this.widget("minePanel/shrink/in/intelligence/button1");
        this.redDot = this.widget("minePanel/shrink/in/intelligence/button1/redPoint");
        this.collectCDNode = this.widget("minePanel/shrink/in/self/cdlabel");
        this.collectResultNode = this.widget("minePanel/shrink/in/label1");
        this.fightReportNode = this.widget("minePanel/shrink/in/self/button23");
        this.mineSelfNode = this.widget("minePanel/shrink/in/intelligence/bgContent1");

        this.plunderNode = this.widget("minePanel/shrink/in/self/button2/redPoint/label");

        // this.powerTipNode = this.widget("minePanel/shrink/brand/numberLabel");

        this.refreshCostDiaNode = this.widget("minePanel/shrink/in/other/diamonds/label");

        this.monsterNode = this.widget('minePanel/content/monsterMoveContent');
        this.rightInfo = this.widget("minePanel/shrink/in/intelligence");
        this.cloudNode = this.widget("minePanel/yun");
        this.cloudAni = this.cloudNode.getComponent(cc.Animation);
    },
    registerEvent: function () {
        var registerHandler = [
            ["refrehMinePanel", this.refrehMinePanel.bind(this)],
            ["checkLineUpRedDot", this.checkLineUpRedDot.bind(this),true],
            ["refreshGetNew", this.refreshGetNew.bind(this),true],
            ["refreshMineInfo",this.refreshMineInfoView.bind(this)],//刷新战报
            ["refreshEnemyPanel",this.refreshEnemyPanel.bind(this)]//刷新敌方阵容
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.refreshHead.bind(this)],
        ];
        this.registerDataEvent(registerHandler);
    },
    refreshGetNew:function () {
        this.widget("minePanel/shrink/lineUp/talk").active = this.cardLogic.getIsPlaySpecial();
        this.widget("minePanel/shrink/lineUp/flashOfLight").active = this.widget("minePanel/shrink/lineUp/talk").active;
    },
    checkLineUpRedDot:function (state) {
        this.widget("minePanel/shrink/lineUp/redPoint").active = state;
    },
    onFinished:function (event,param) {
        if (event !== constant.AnimationState.FINISHED || param.name !== "yunAnimation") return;
        this.cloudNode.active = false;
    },
    refreshHead:function(param){
        var mineData = this.mineLogic.getMineData();
        var nextUpgrade = 0;
        if (mineData) {
            nextUpgrade = mineData.UpgradeBadge;
        }
        if (!nextUpgrade) {
            nextUpgrade = "";
        }else {
            nextUpgrade = "/"+nextUpgrade;
        }
        this.redDot.active = this.userLogic.getBaseData(this.userLogic.Type.Badge) >= mineData.UpgradeBadge;
        this.badgeNode.getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.Badge) + nextUpgrade;
    },

    _getCombatPower:function(list,isMine){
        var count = 0;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var skillList = undefined;
            if (!isMine) {
                skillList = this.mineLogic.getSkillList(obj.ID)
            }
            var fightpower = this.cardLogic.getShowNum(obj.ID,obj.Lvl,skillList);//把敌对战斗里加进去
            fightpower = fightpower.sword + fightpower.shield;
            count +=fightpower;
        }
        return count;
    },

    refrehMinePanel:function(data,isUpgrade){
        if (isUpgrade) {
            this.upgradeAni.play();
        }
        this.data = data;
        this.refreshHead();
        this.selfNode.active = true;
        this.otherNode.active = false;
        // this.fightReportNode.active = true;
        this.mineSelfNode.active = true;
        this.upgradeBtnNode.active = true;
        this.rightInfo.active = true;
        this.unCollectTipNode.active = data.EndTime.toNumber() === 0;
        this.collectBtnNode.active = this.unCollectTipNode.active;
        this.collectCDNode.active = this.collectBtnNode.active;
        this.collectTipNode.active = !this.unCollectTipNode.active;
        this.collectingBtnNode.active = this.collectTipNode.active;
        this.collectResultNode.active = true;

        this.gradeLabelNode.getComponent(cc.Label).string = data.CurLv;
        this.yieldLabelNode.getComponent(cc.Label).string = data.CurOutput;
        this.powerNode.getComponent(cc.Label).string = this._getCombatPower(data.Heroes,true);
        // this.powerTipNode.getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"minePower");
        this.refreshCount();
        this.plunderNode.getComponent(cc.Label).string = this.data.PlunderNum;

        this.refreshCostDiaNode.getComponent(cc.Label).string = data.RefreshPaice;

        this.duration = 1;
        this.reSetName();
        this.setMonsterContent(data.Heroes,true);
        this.refreshMineInfoView();
    },

    refreshEnemyPanel:function(data,type){
        this.cloudAni.play("yunAnimation");
        this.enmey = data;
        this.selfNode.active = false;
        this.otherNode.active = true;
        // this.fightReportNode.active = false;
        this.mineSelfNode.active = false;
        this.upgradeBtnNode.active = false;
        this.rightInfo.active = false;
        this.collectResultNode.active = false;
        this.duration = 1;
        this.reSetName();
        this.powerNode.getComponent(cc.Label).string = this._getCombatPower(data.Heroes,false);
        this.gradeLabelNode.getComponent(cc.Label).string = data.MineLv;
        this.yieldLabelNode.getComponent(cc.Label).string = data.Output;
        this.refreshCount();
        this.setMonsterContent(data.Heroes,false);
        // this.powerTipNode.getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"enemyPower");


        this.widget("minePanel/shrink/in/other/layout/label2").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"canGot") + data.GetGold;//
        this.widget("minePanel/shrink/in/other/collect/numberLabel").getComponent(cc.Label).string = data.GetGold;
        this.widget("minePanel/shrink/in/other/collect/numberLabel1").getComponent(cc.Label).string = data.GetExp;
        this.widget("minePanel/shrink/in/other/button3").getComponent(cc.Button).interactable = this.data.Heroes.length > 0;
    },

    reSetName:function(){
        if (this.selfNode.active) {
            this.nameNode.getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.Name);
        }else {
            this.nameNode.getComponent(cc.Label).string = this.enmey.Name ?this.enmey.Name :"" ;
        }
    },

    refreshCount:function(){
        var mineData = this.mineLogic.getMineData();
        // this.atkCount.getComponent(cc.Label).string = mineData.PlunderNum;
        // this.widget('minePanel/in/other/button4/sword1/label').getComponent(cc.Label).string = mineData.PlunderNum;
    },

    setMonsterContent:function(heros,isSelf){
        var script = this.monsterContent.getComponent(this.monsterContent.name);
        var size = cc.size(this.node.width/2,this.node.height);
        var list = [];
        for (var i = 0 , len = heros.length; i < len; i++) {
            var obj = heros[i];
            list.push(obj.ID);
        }
        script.init(list,size,isSelf);
    },

    closeOtherInfo:function(){
        this.selfNode.active = true;
        this.otherNode.active = false;
        this.reSetName();
        this.refrehMinePanel(this.data,false);
    },

    closeEvent:function(){
        if (this.otherNode.active) {
            this.cloudNode.active = true;
            this.cloudAni.play("yunAnimation1");
            this.scheduleOnce(function () {
                this.cloudAni.play("yunAnimation");
                this.closeOtherInfo();
            }.bind(this),1.6)
        }else {
            this.close();
        }
    },

    open:function(){
        this.refreshGetNew();
        this.mineLogic.req_Get_MineInfo();
        this.cloudNode.active = false;
        this.widget("minePanel/shrink/in").active = true;
        // this.refreshMineInfoView();
    },

    openUi:function(_,param){
        uiManager.openUI(Number(param));
    },
    /** 上阵容 */
    saveMineHeros:function(){
        var mineData = this.mineLogic.getMineData();
        var now = this.timeLogic.now();
        var offTime = mineData.MiningCDTime.toNumber() - now;
        if (offTime > 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"mineingCD"));
            return
        }

        this.mineLogic.req_Mining();
        this.fightLogic.setGameType(constant.FightType.MINE_READY);
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.FIGHT,param:["haha "]});
        this.node.dispatchEvent(ev);
    },
    /** 收集 */
    collectGold:function(){
        var data = this.mineLogic.getMineData();

        if (!data.CollectTime.lessThan(this.timeLogic.now64())) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"unCollect"));
            return;
        }
        this.mineLogic.req_Mine_Collect(this.widget("minePanel/shrink/in/self/collect1/golds/gold1"));//TODO 金币呀刷新掉？
    },
    /** 争夺 */
    atkMine:function(){
        if (!this.data) {
            return;
        }
        if (this.data.PlunderNum <= 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"countPool"));
            return
        }
        this.reqRefreshMine(0);
    },

    /**反攻 */
    counterAttackMine : function(data){
        if (!this.data) {
            return;
        }
        if (this.data.PlunderNum <= 0) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"countPool"));
            return
        }
        this.cloudNode.active = true;
        this.cloudAni.play("yunAnimation1");
        this.scheduleOnce(function () {
            this.mineLogic.req_MineInfo_Op(data);
        }.bind(this),1.6);
    },

    reqRefreshMine:function (type) {
        this.cloudNode.active = true;
        this.cloudAni.play("yunAnimation1");
        this.scheduleOnce(function () {
            this.mineLogic.req_Refresh_MineEnemy(type,this.refreshEnemyPanel.bind(this));
        }.bind(this),1.6);
    },
    /** 这里是干别人 */
    atkFight:function(event,param){
        window.adjustUtil.recored(tb.ADJUST_RECORED_MINE_ROB);
        this.fightLogic.setGameType(constant.FightType.MINE_FIGHT);
        var data = {};
        if (param === "new") {
            data.type = constant.MINE_FIGHT_TYPE.SANDBOX;
        }else {
            data.type = constant.MINE_FIGHT_TYPE.DIRECT;
        }
        this.fightLogic.setMineInfo(data);
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.FIGHT,param:["haha "]});
        this.node.dispatchEvent(ev);
    },

    //打开夺矿战报
    openMineInfoUI : function(){
        uiManager.openUI(uiManager.UIID.MINE_INFO);
    },

    refreshEnemy:function(){
        if(this.userLogic.getBaseData(this.userLogic.Type.Diamond) - this.data.RefreshPaice > 0){
            this.reqRefreshMine(1);
        }else{
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("errorcode","errorcode3"));//提示钻石不足
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.data) return;
        this.duration += dt;
        if (this.duration <= 1) return;
        this.duration -= 1;
        var mineData = this.mineLogic.getMineData();

        if (this.collectTipNode.active) {
            var now = this.timeLogic.now();
            var begin = this.data.BeginTime.toNumber();
            var end = this.data.EndTime.toNumber();
            var baseNum = this.data.CurOutput;
            this.widget("minePanel/shrink/in/self/collect1/golds/numberLabel").getComponent(cc.Label).string = this.formulaLogic.calculateMineProduct(now,begin,end,baseNum) - this.mineLogic.getBeRod();
            var endTimeAtmp = mineData.CollectTime.toNumber();
            var offTime = end - now;
            this.widget("minePanel/shrink/in/intelligence/collect2/numberLabel1").getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
            if (this.collectingBtnNode.active) {
                this.widget("minePanel/shrink/in/self/button4/label").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"mineing");

            }
            this.collectingBtnNode.getComponent(cc.Button).interactable =  mineData.CollectTime.toNumber() < now ;
        }
        this.widget("minePanel/shrink/in/self/countDown").active = mineData.PlunderNum < mineData.MaxPlunderNum;
        if (this.widget("minePanel/shrink/in/self/countDown").active) {
            var now = this.timeLogic.now();
            var offTime = mineData.NextPlunderTime.toNumber() - now;
            this.widget("minePanel/shrink/in/self/countDown/numberLabel1").getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
        }
        var now = this.timeLogic.now();
        var offTime = mineData.MiningCDTime.toNumber() - now;
        this.collectCDNode.active = offTime > 0;
        if (this.collectCDNode.active) {
            this.collectCDNode.getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
        }
        this.collectBtnNode.getComponent(cc.Button).interactable = !this.collectCDNode.active;
    },

    //刷新战报提示红点
    refreshMineInfoView : function () {
        this.widget("minePanel/shrink/in/self/button23/redPoint").active = this.mineLogic.isHaveUnProcessedMineInfo();//是否显示红点
    }


});
