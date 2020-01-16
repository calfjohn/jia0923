var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        boxItem:cc.Prefab,
        btnFrame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.duration = 0;
        this.limitList = [80,60,40,20,0];
        this.widget('worldBossPanel/shrink/bossAtk').active = false;
        // this.worldBossLogic.req_Hit_Boss(9000000);
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshBossPanel", this.refreshBossPanel.bind(this)],
            ["refreshBossReward", this.refreshBossReward.bind(this)],
            ["refreshBossTimes", this.refreshBossTimes.bind(this)],
            ["refreshGetNew", this.refreshGetNew.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
    },

    refreshGetNew:function () {
        this.widget("worldBossPanel/shrink/btn/btnTeam/talk").active = this.cardLogic.getIsPlaySpecial();
        this.widget("worldBossPanel/shrink/btn/btnTeam/flashOfLight").active = this.widget("worldBossPanel/shrink/btn/btnTeam/talk").active;
    },

    refreshBossReward:function(serverData){
        // //伤害列表
        var list = [];
        for (var i = 0 , len = serverData.RankRewards.length; i <  len; i++) {
            var obj = serverData.RankRewards[i];
            var data = kf.clone(obj);
            data.nextRange = serverData.RankRewards[i+1] ? serverData.RankRewards[i+1].RankRange-1 : null;
            list.push(data);
        }
        var refreshData = {
            content:this.widget('worldBossPanel/shrink/right/content'),
            list:list,
            prefab:this.boxItem
        }
        uiManager.refreshView(refreshData);
    },

    refreshBossPanel:function(){
        var info = this.worldBossLogic.getBossInfo();
        if (!info) return;
        var hp = info.Bosses.Hp;
        var curHp = info.Bosses.CurHp;
        this.widget('worldBossPanel/shrink/progressBar').getComponent(cc.ProgressBar).progress = (curHp) / hp;
        this.widget('worldBossPanel/shrink/progressBar/label').getComponent(cc.Label).string = parseInt(((curHp) / hp).toFixed(2) * 100) + "%";
        this.widget('worldBossPanel/shrink/ipx/hHurtLabel/numberLabel').getComponent(cc.Label).string = info.PlayerInfo.Damage.toNumber();
        this.widget('worldBossPanel/shrink/ipx/rankingLabel/numberLabel').getComponent(cc.Label).string = info.PlayerInfo.MyRank;
        this.widget('worldBossPanel/shrink/ipx/left/label1').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"thanReward").formatArray([info.Bosses.DescIDs[0]]) ;

        this.widget("worldBossPanel/shrink/ipx/left/maxLabel").active = !!!info.Bosses.DescIDs[2];
        this.widget('worldBossPanel/shrink/ipx/left/label3').active = !this.widget("worldBossPanel/shrink/ipx/left/maxLabel").active;
        this.widget('worldBossPanel/shrink/ipx/left/label2').active = !this.widget("worldBossPanel/shrink/ipx/left/maxLabel").active;

        this.widget('worldBossPanel/shrink/ipx/left/label').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"rewardRate") + info.Bosses.DescIDs[1] + " %";
        if (!this.widget("worldBossPanel/shrink/ipx/left/maxLabel").active) {
            this.widget('worldBossPanel/shrink/ipx/left/label3').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"passChapter").formatArray([info.Bosses.DescIDs[2]]);
            this.widget('worldBossPanel/shrink/ipx/left/label2').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"upTo") + info.Bosses.DescIDs[3] + " %";
        }

        this.widget("worldBossPanel/shrink/bossAtk/btnFight").getComponent(cc.Button).interactable = this.worldBossLogic.isCanAtkBoss();
        this.widget("worldBossPanel/shrink/bossAtk/hintLabel").color = this.worldBossLogic.isCanAtkBoss() ? uiColor.green : uiColor.red;
        this.refreshMonster();
        this.refreshBossTimes();
    },

    refreshBossTimes:function () {
        var addTimesPrice = this.worldBossLogic.getAddTimesPrice();
        var hitTimes = this.worldBossLogic.getHitBossTimes();
        this.widget("worldBossPanel/shrink/bossAtk/cdLabel/numberLabel").getComponent(cc.Label).string = hitTimes;
        this.widget("worldBossPanel/shrink/bossAtk/cdLabel").active = hitTimes > 0;
        // this.widget("worldBossPanel/shrink/bossAtk/btnFight/label").active = hitTimes > 0 && addTimesPrice !== -1;
        this.widget("worldBossPanel/shrink/bossAtk/btnFight/label1").active = hitTimes <= 0 && addTimesPrice !== -1;
        if(hitTimes <= 0 && addTimesPrice !== -1){
            this.widget("worldBossPanel/shrink/bossAtk/btnFight/label1/layout/num").getComponent(cc.Label).string = addTimesPrice;
        }
        this.widget("worldBossPanel/shrink/bossAtk/unNumLabel").active = hitTimes <= 0 && addTimesPrice === -1;
        this.widget("worldBossPanel/shrink/bossAtk/btnFight").getComponent(cc.Button).interactable =this.worldBossLogic.isCanAtkBoss() &&( hitTimes > 0 || addTimesPrice !== -1 );
        // this.widget('worldBossPanel/shrink/bossAtk/btnFight').getComponent(cc.Button).interactable = hitTimes > 0;
        // this.widget('worldBossPanel/shrink/bossAtk/btnFight').getComponent(cc.Sprite).spriteFrame = hitTimes === 0?this.btnFrame[0]:this.btnFrame[1];
        // this.widget("worldBossPanel/shrink/bossAtk/cdLabel1").active = this.worldBossLogic.getShareTimes() > 0;
    },

    shareEvent:function () {
        this.shareLogic.share(tb.SHARELINK_BOSS,0,function (isSucess) {
            if (isSucess) {
                this.shareLogic.req_Share(3);// NOTE: 通知服务器分享了
            }
        }.bind(this));
    },

    refreshMonster:function(){
        var info = this.worldBossLogic.getBossInfo();
        if (!info) return;
        var oldActive = this.widget('worldBossPanel/shrink/monster').active;
        var curHp = info.Bosses.CurHp;
        this.widget('worldBossPanel/shrink/boss').active = curHp === 0;
        var inOpen = info.OpenTime.toNumber() <= this.timeLogic.now() && info.EndTime.toNumber() > this.timeLogic.now();
        this.widget('worldBossPanel/shrink/progressBar').active = inOpen && curHp !== 0;
        this.widget('worldBossPanel/shrink/monster').active = inOpen && curHp !== 0;
        this.widget('worldBossPanel/shrink/countdDown/label1').active = inOpen && curHp === 0;
        this.widget('worldBossPanel/shrink/countdDown/label').active = !this.widget('worldBossPanel/shrink/countdDown/label1').active;
        this.widget('worldBossPanel/shrink/countdDown/numberLabel').active = !this.widget('worldBossPanel/shrink/countdDown/label1').active;
        if (inOpen) {
            if (!oldActive) {
                var callBack = function(spineData){
                    this.widget('worldBossPanel/shrink/monster').getComponent(sp.Skeleton).skeletonData  = spineData;
                    this.widget('worldBossPanel/shrink/monster').getComponent(sp.Skeleton).setAnimation(0,'std',true);
                }.bind(this);
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,info.Bosses.ID);
                var spineName = config[jsonTables.CONFIG_MONSTER.Resource];
                uiResMgr.loadSpine(spineName,callBack);
            }
            var offTime = info.EndTime.toNumber() - this.timeLogic.now();
            if(curHp > 0){
                this.widget('worldBossPanel/shrink/countdDown/numberLabel/numberLabel').getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
                this.widget('worldBossPanel/shrink/countdDown/label').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"monster");
            }
        }else{
            var offTime = info.OpenTime.toNumber() - this.timeLogic.now();
            this.widget('worldBossPanel/shrink/countdDown/numberLabel/numberLabel').getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
            this.widget('worldBossPanel/shrink/countdDown/label').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"boss");
        }
        if(offTime <= 0){
            this.worldBossLogic.req_Boss_Info(true);
        }
        this.widget('worldBossPanel/shrink/bossAtk').active = inOpen && this.widget('worldBossPanel/shrink/monster').active;
    },
    open:function(){
        this.refreshGetNew();
        this.worldBossLogic.req_Boss_Info();
        this.worldBossLogic.req_Boss_RewardInfo();
    },

    startFight:function(){
        var info = this.worldBossLogic.getBossInfo();
        if (!info) return;
        if (info.Bosses.CurHp <= 0) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("errorcode","errorcode107"));
        var hitTimes = this.worldBossLogic.getHitBossTimes();
        if(hitTimes <= 0){//次数不够了，需要购买
            var callBack = function () {
                this.worldBossLogic.req_Add_HitTimes();
            }.bind(this);
            var addTimesPrice = this.worldBossLogic.getAddTimesPrice() + rText.getMsgCurrency(parseInt(2));
            var str = uiLang.getMessage(this.node.name,"buyTimes").formatArray([addTimesPrice]);
            uiManager.msgDefault(str,callBack.bind(this));
        }else{
            this.worldBossLogic.setRecordHp();
            this.fightLogic.setGameType(constant.FightType.WORLD_BOSS);
            var ev = new cc.Event.EventCustom('loadScene', true);
            ev.setUserData({sceneID:constant.SceneID.FIGHT,loadCallBack:function(){}});
            this.node.dispatchEvent(ev);
        }
    },

    openUi:function(_,param){
        // if () return;
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        this.refreshMonster();
    }
});
