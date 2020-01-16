/**
 * @Author: lich
 * @Date:   2018-07-12T14:16:39+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-07-12T14:17:05+08:00
 */

window["logic"]["worldBoss"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var cardLogic = null;
    var chapterLogic = null;

    var _EVENT_TYPE = [
        "refreshBossPanel",
        "refreshBossRank",
        "refreshBossReward",
        "refreshBossTimes",
        "updateBossHp"
    ];

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.isCanAtk = true;
        this.bossInfo = null;
        this.fightTid = 0;
        this.damageInfo = [];
        this.rewardInfo = null;
        this.hitBossTimes = 0;
        this.shareTimes = 0;
        this.fightThisHp = 0;
        this.hitBossDuration = 0;
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        cardLogic = kf.require("logic.card");
        chapterLogic = kf.require("logic.chapter");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Boss_Info", this.onResp_Boss_Info.bind(this));//// 响应 boss信息
        network.registerEvent("Resp_Hit_Boss", this.onResp_Hit_Boss.bind(this));//// 响应 攻击boss
        network.registerEvent("Resp_Get_BossRank", this.onResp_Get_BossRank.bind(this));//// 响应 获取世界boss排名
        network.registerEvent("Resp_BossInfo_Update", this.onResp_BossInfo_Update.bind(this));//// 响应 获取世界boss排名更新
        network.registerEvent("Resp_Boss_RewardInfo", this.onResp_Boss_RewardInfo.bind(this));//// 响应 boss奖励信息
        network.registerEvent("Resp_Boss_PlayerInfo", this.onResp_Boss_PlayerInfo.bind(this));//// 响应 boss奖励信息
        network.registerEvent("Resp_Add_HitTimes", this.onResp_Add_HitTimes.bind(this));//// 响应 钻石购买次数
    };

    //钻石购买次数
    module.req_Add_HitTimes = function(){
        var data = {
            "Req_Add_HitTimes": {}
        };
        network.send(data);
    };
    //钻石购买次数
    module.onResp_Add_HitTimes = function (param) {
        this.hitBossTimes = param.HitTimes;
        this.bossInfo.PlayerInfo.HitTimes = param.HitTimes;
        this.bossInfo.AddTimesPrice = param.AddTimesPrice;
        this.setRecordHp();
        kf.require("logic.fight").setGameType(constant.FightType.WORLD_BOSS);
        clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){}.bind(this));
    };

    module.onResp_Boss_PlayerInfo = function (param) {
        this.hitBossTimes = param.PlayerInfo.HitTimes;
        this.bossInfo.PlayerInfo.HitTimes = param.PlayerInfo.HitTimes;
        this.shareTimes = param.PlayerInfo.ShareTimes;
        clientEvent.dispatchEvent("refreshBossTimes");
    };

    module.onResp_BossInfo_Update = function (param) {
        if (!this.bossInfo) return;
        if (param.DamageInfo && param.DamageInfo.length > 0) {
            this.bossInfo.DamageInfo = this.bossInfo.DamageInfo.concat(param.DamageInfo);
        }
        this.bossInfo.Bosses.CurHp = param.CurHp.toNumber();
        clientEvent.dispatchEvent("refreshBossPanel");
    };

    //boss奖励信息
    module.req_Boss_RewardInfo = function(){
        if (this.rewardInfo) {
            return this.onResp_Boss_RewardInfo(this.rewardInfo);
        }
        var data = {
            "Req_Boss_RewardInfo": {}
        };
        network.send(data,true);
    };
    //boss奖励信息
    module.onResp_Boss_RewardInfo = function (param) {
        this.rewardInfo = param;
        clientEvent.dispatchEvent("refreshBossReward",param);
    };


    //boss信息
    module.req_Boss_Info = function(reqNow){
        if(!reqNow && this.bossInfo){
            this.onResp_Boss_Info(this.bossInfo);
            return;
        }
        var data = {
            "Req_Boss_Info": {}
        };
        network.send(data,true);
    };
    //boss信息
    module.onResp_Boss_Info = function (param) {
        jsonTables.initSandBoxTable(param);
        this.isCanAtk = param.CanHit;
        if(param.Bosses.Hp.toNumber){
            param.Bosses.Hp = param.Bosses.Hp.toNumber();
        }
        if(param.Bosses.CurHp.toNumber){
            param.Bosses.CurHp = param.Bosses.CurHp.toNumber();
        }
        this.hitBossTimes = param.PlayerInfo.HitTimes;
        this.shareTimes = param.PlayerInfo.ShareTimes;
        this.bossInfo = param;
        this.hitBossDuration = param.HitBossDuration;
        clientEvent.dispatchEvent("refreshBossPanel");
    };

    //攻击boss
    module.req_Hit_Boss = function(count,tableInfo){
        this.bossInfo.TableInfo.Grid = tableInfo.Grid;
        count = count < 0 ? 0 : count;
        var damge = {
            Damage:dcodeIO.Long.fromNumber(count),//init64
            HeroID:this.fightTid
        }
        if (this.fightTid === 0) {
            var lines = cardLogic.getLineUpInfo();
            var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY, lines[0]);
            this.fightTid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
            damge.HeroID = this.fightTid;
        }
        var data = {
            "Req_Hit_Boss":{
                "UserID":0,
                "Damage":damge,
                "TableInfo":this.bossInfo.TableInfo
            }
        };
        network.send(data);
        this.fightTid = 0;
        this.fightThisHp = 0;
    };
    //攻击boss
    module.onResp_Hit_Boss = function (param) {
        this.hitBossTimes = param.PlayerInfo.HitTimes;
        // this.bossInfo.PlayerInfo.HitTimes = param.PlayerInfo.HitTimes;
        this.shareTimes = param.PlayerInfo.ShareTimes;
        this.bossInfo.PlayerInfo = param.PlayerInfo;
        if(param.BossCurHp.toNumber){
            this.bossInfo.Bosses.CurHp = param.BossCurHp.toNumber();
        }
        var reward = param.Rewards.concat(param.SpeRewards);
        clientEvent.dispatchEvent("loadScene",constant.SceneID.MAIN,[],function(){
            uiManager.openUI(uiManager.UIID.WORLDBOSS);
            uiManager.openUI(uiManager.UIID.REWARDMSG,reward);
        }.bind(this));
        // optional int64 UserID = 1;
    	// optional int64 TotalDamage = 2;	// 总伤害
    	// optional int64 CurDamage = 3;	// 这次的伤害
    	// optional int32 MyRank = 4;	// 当前排名
    	// repeated Reward_Info_ Rewards = 5;	//
    };

    module.getAddTimesPrice = function () {
        return this.bossInfo.AddTimesPrice;
    };

    //获取世界boss排名
    module.req_Get_BossRank = function(){
        var data = {
            "Req_Get_BossRank": {}
        };
        network.send(data);
    };
    //获取世界boss排名
    module.onResp_Get_BossRank = function (param) {

        clientEvent.dispatchEvent("refreshBossRank",param);
    };


    //////////////////////////////////////////////////////////////////////////
    module.getBossInfo = function () {
        return this.bossInfo;
    };
    /** boss技能 */
    module.getBossSkill = function () {
        var list = [];
        for (var i = 0 , len = this.bossInfo.Bosses.SkillID.length; i <  len; i++) {
            var skillID = this.bossInfo.Bosses.SkillID[i];
            var skillLv = this.bossInfo.Bosses.SkillLv[i];
            list.push({skillID:skillID,skillLv:skillLv});
        }
        return list;
    };

    module.isCanAtkBoss = function () {
        return this.isCanAtk;
    };

    module.getBossSceneBgID = function () {
        return this.bossInfo.SceneID;
    };

    module.setRecordHp = function(){
        this.fightThisHp = this.bossInfo.Bosses.CurHp;
    };

    module.getHpOffCurHp = function () {
        return this.fightThisHp;
    };

    module.getCurStep = function () {
        return this.bossInfo.Step;
    };

    module.setFightTid = function (tid) {
        this.fightTid = tid;
    };

    module.getTableInfo = function () {
        var table = kf.clone(this.bossInfo.TableInfo);
        return table;
    };

    module.getEnmeyBase = function () {
        return this.bossInfo.Bosses;
    };

    module.getMonsterID = function () {
        return this.bossInfo.Bosses.ID;
    };
    module.getShareTimes = function () {
        return this.shareTimes;
    };
    module.getHitBossTimes = function () {
        return this.hitBossTimes;
    };
    module.getHasBoss = function () {
        var info = this.getBossInfo();
        var offTime = info.OpenTime.toNumber() - kf.require("logic.time").now();
        return offTime <= 0;
    };

    module.getBossLv = function () {
        return  this.bossInfo.Bosses.DescIDs[0];
    };

    module.popDamageData = function () {
        if (!this.bossInfo) return null;
        return this.bossInfo.DamageInfo.pop();
    };

    module.getBossDuration = function() {
        return this.hitBossDuration;
    };

    return module;
};
