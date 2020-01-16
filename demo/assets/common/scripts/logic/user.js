/**
 * @Author: lich
 * @Date:   2018-06-07T14:01:19+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-17T15:50:59+08:00
 */

window["logic"]["user"] = function() {

    var user = {};
    var network = null;
    var treasureLogic = null;
    var clientEvent = null;
    var dataManager = null;
    var timeLogic = null;
    var equipLogic = null;
    var configuration = null;
    var cardLogic = null;
    var loginLogic = null;
    var Long = dcodeIO.Long;
    var _EVENT_TYPE = [
        "playerLvUp",
        "updateBtn",
        "setLockExp",
        "showFlyEffectAni",
        "resetVoide",
        "lockAniEnd",
        "bindScucess",
        "vitUpdate",
    ];
    user.Type = {
        UserID:"UserID",
        Login:"Login",
        Logout:"Logout",
        Country:"Country",
        Atk:"Atk",//主角剑值
        Def:"Def",//主角盾值
        Register:"Register",
        Name:"Name",
        Sex:"Sex",
        Icon:"Icon",
        IconUrl:"IconUrl",
        Lv:"Lv",
        MaxLvl:"MaxLvl",
        Exp:"Exp",
        MaxExp:"MaxExp",
        Gold:"Gold",
        Diamond:"Diamond",
        Vit:"Vit",
        MaxVit:"MaxVit",
        VitTime:"VitTime",
        Leader:"Leader",
        LeaderExt:"LeaderExt",
        MaxFriend:"MaxFriend",
        Guide:"Guide",
        Sign:"Sign",
        LastLogin:"LastLogin",
        HeroKeep:"HeroKeep",
        HeroKeepEx:"HeroKeepEx",
        SrvTime:"SrvTime",
        Hp:"Hp",
        Damage:"Damage",
        DamageEx:"DamageEx",
        PhyAtk:"PhyAtk",
        MagAtk:"MagAtk",
        PhyDef:"PhyDef",
        MagDef:"MagDef",
        AtkRang:"AtkRang",
        AtkFeq:"AtkFeq",
        TimeDiamondInfo:"TimeDiamondInfo",
        Speed:"Speed",
        Badge:"Badge",
        Step:"Step",
        Career:"Career",//职业
        GrowthValue:"GrowthValue",//成长值
        HpEx:"HpEx",
        PhyAtkEx:"PhyAtkEx",
        MagAtkEx:"MagAtkEx",
        PhyDefEx:"PhyDefEx",
        MagDefEx:"MagDefEx",
        TalentPoint:"TalentPoint",
        CritAtk:"CritAtk",
        FlagKey:"FlagKey",
        FlagValue:"FlagValue",
        ChestHelpTimes:"ChestHelpTimes",//宝箱助力次数
        ChestUnlockNum:"ChestUnlockNum",//开锁匠个数
        ChestHelpMax:"ChestHelpMax",// 宝箱分享最大次数
        VitBuyTimes:"VitBuyTimes",
        VitBuyTimesLimit:"VitBuyTimesLimit",
        RefineNum:"RefineNum",
        VitShareMax:"VitShareMax",// 体力分享上限次数
        VitShareTimes:"VitShareTimes",	// 体力分享次数
        ChapterShareMax:"ChapterShareMax",// 关卡分享上限次数
        ChapterShareTimes:"ChapterShareTimes",    // 关卡分享次数
        ChangeNameCost:"ChangeNameCost",//改么消耗
        ShareGetVit:"ShareGetVit",//分享获得
        BuyGetVit:"BuyGetVit",//购买获得
        VitCD:"VitCD",//体力回复总时长
        BindAccount: "BindAccount",//已绑定的账号 如果有不为空
        Link:"Link",//额外的链接
        AtkSpeed:"AtkSpeed", // 攻速千分比
        CritAtkEx:"CritAtkEx", // 暴击率【额外】
        Item:"Item",  //活动道具
        ChargeDiamond:"ChargeDiamond",//累计充值
        SpendDiamond:"SpendDiamond"//累计消费钻石
    }

    user.Flag = {
        ChapterStory:0,//用于存在单个章节内的索引
        ChapterMaxStroy:1,//用于存放最大章节
        Guide:2,//用于存放新手引导的索引
        FirstExcellentForrm:3,//第一次出现蓝色品质
        PveFail:4,//第一次失败家族等级
        ReelGuide:5,//卷轴引导,
        SandPrompt:6,//沙盘继承引导
        ElfGuideTimes:7,//小精灵引导次数
        ElfGuideIdx:8,//小精灵当前引导索引
        GuideWeaker:9,//低战斗力引导
        GuideFirstChapter: 10,//第一章第一个怪引导
        FightTask:11,
    };

    user.init = function() {
        this.initModule();
        this.reset();
        clientEvent.addEventType(_EVENT_TYPE);
        this.registerMsg();
    };

    user.reset = function () {
        this.userBaseData = {};
        this.userBaseData[this.Type.UserID] = new Long(0,0,false);
        this.userBaseData[this.Type.Login] = new Long(0,0,false);
        this.userBaseData[this.Type.Logout] = new Long(0,0,false);
        this.userBaseData[this.Type.Country] = 101;
        this.userBaseData[this.Type.Register] = new Long(0,0,false);
        this.userBaseData[this.Type.Name] = "";
        this.userBaseData[this.Type.Sex] = 0;
        this.userBaseData[this.Type.Icon] = 0;
        this.userBaseData[this.Type.Atk] = 0;
        this.userBaseData[this.Type.Def] = 0;
        this.userBaseData[this.Type.IconUrl] = "";
        this.userBaseData[this.Type.Lv] = 0;
        this.userBaseData[this.Type.MaxLvl] = 0;
        this.userBaseData[this.Type.Exp] = 0;
        this.userBaseData[this.Type.MaxExp] = 0;
        this.userBaseData[this.Type.Gold] = 0;
        this.userBaseData[this.Type.Diamond] = 0;
        this.userBaseData[this.Type.Vit] = 0;
        this.userBaseData[this.Type.MaxVit] = 0;
        this.userBaseData[this.Type.VitTime] = new Long(0,0,false);
        this.userBaseData[this.Type.Leader] = 0;
        this.userBaseData[this.Type.LeaderExt] = 0;
        this.userBaseData[this.Type.MaxFriend] = 0;
        this.userBaseData[this.Type.Guide] = 0;
        this.userBaseData[this.Type.Sign] = 0;
        this.userBaseData[this.Type.LastLogin] = 0;
        this.userBaseData[this.Type.HeroKeep] = 0;
        this.userBaseData[this.Type.SrvTime] = new Long(0,0,false);
        this.userBaseData[this.Type.Hp] = 0;
        this.userBaseData[this.Type.Damage] = 0;
        this.userBaseData[this.Type.DamageEx] = 0;
        this.userBaseData[this.Type.PhyAtk] = 0;
        this.userBaseData[this.Type.MagAtk] = 0;
        this.userBaseData[this.Type.PhyDef] = 0;
        this.userBaseData[this.Type.MagDef] = 0;
        this.userBaseData[this.Type.AtkRang] = 0;
        this.userBaseData[this.Type.AtkFeq] = 0;
        this.userBaseData[this.Type.Speed] = 0;
        this.userBaseData[this.Type.HeroKeep] = 0;
        this.userBaseData[this.Type.TimeDiamondInfo] = [];
        this.userBaseData[this.Type.Badge] = 0;
        this.userBaseData[this.Type.Step] = 0;
        this.userBaseData[this.Type.Career] = 1;
        this.userBaseData[this.Type.GrowthValue] = 1;
        this.userBaseData[this.Type.HpEx] = 0;
        this.userBaseData[this.Type.PhyAtkEx] = 0;
        this.userBaseData[this.Type.MagAtkEx] = 0;
        this.userBaseData[this.Type.PhyDefEx] = 0;
        this.userBaseData[this.Type.MagDefEx] = 0;
        this.userBaseData[this.Type.TalentPoint] = 0;
        this.userBaseData[this.Type.CritAtk] = 0;
        this.userBaseData[this.Type.FlagKey] = [];
        this.userBaseData[this.Type.FlagValue] = [];
        this.userBaseData[this.Type.ChestHelpMax] = 0;
        this.userBaseData[this.Type.VitBuyTimes] = 0;//体力购买次数
        this.userBaseData[this.Type.VitBuyTimesLimit] = 2;//体力最大次数
        this.userBaseData[this.Type.RefineNum] = 0;
        this.userBaseData[this.Type.HeroKeepEx] = 0;
        this.userBaseData[this.Type.VitShareMax] = 0;
        this.userBaseData[this.Type.VitShareTimes] = 0;
        this.userBaseData[this.Type.ChapterShareMax] = 0;
        this.userBaseData[this.Type.ChapterShareTimes] = 0;
        this.userBaseData[this.Type.ChangeNameCost] = 0;
        this.userBaseData[this.Type.ShareGetVit] = 0;
        this.userBaseData[this.Type.BuyGetVit] = 0;
        this.userBaseData[this.Type.VitCD] = 0;
        this.userBaseData[this.Type.BindAccount] = "";
        this.userBaseData[this.Type.Link] = [];
        this.userBaseData[this.Type.AtkSpeed] = 0;
        this.userBaseData[this.Type.CritAtkEx] = 0;
        this.userBaseData[this.Type.Item] = [];

        this.flagInfo = cc.js.createMap();
        this.input = dataManager.resetData(dataManager.DATA.ROLE_INFO, this.userBaseData);

        this.ctrData = {};
    };

    user.setLockStatus = function(status){
        this.input.setLock(status);
    };

    user.initModule = function(){
        configuration = kf.require("util.configuration");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        dataManager = kf.require("manager.data");
        treasureLogic = kf.require("logic.treasure");
        timeLogic = kf.require("logic.time");
        equipLogic = kf.require("logic.equip");
        cardLogic = kf.require("logic.card");
        loginLogic = kf.require("logic.login");
    };

    user.registerMsg = function() {
        network.registerEvent("Resp_PlayerData_Base", this.onResp_PlayerData_Base.bind(this));
        network.registerEvent("Resp_PlayerUpdate_Base", this.onResp_PlayerUpdate_Base.bind(this));
        network.registerEvent("Resp_Set_Name", this.onResp_Set_Name.bind(this));
        network.registerEvent("Resp_Player_LvUp", this.onResp_Player_LvUp.bind(this));
        network.registerEvent("Resp_Set_Country", this.onResp_Set_Country.bind(this));
        network.registerEvent("Resp_Data_Push", this.onResp_Data_Push.bind(this));
        network.registerEvent("Resp_Account_Binding", this.onResp_Account_Binding.bind(this));
        network.registerEvent("Resp_PlayerData_Item", this.onResp_PlayerData_Item.bind(this));
        network.registerEvent("Resp_PlayerUpdate_Item", this.onResp_PlayerUpdate_Item.bind(this));
    };

     //绑定账号
    user.req_Account_Binding = function (account, channel) {
         var data = {
             "Req_Account_Binding": {
                 Account: account,
                 Channel: channel // 渠道 1：google 2:ios 3:facebook
             }
         };
         network.send(data);
    };

    user.onResp_Account_Binding = function (param) {
        this.userBaseData[this.Type.BindAccount] = param.BindAccount;
        uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.get( "bindSucess"));
        clientEvent.dispatchEvent("bindScucess");
    };

    user.onResp_Data_Push = function (param) {
        if (param.Data) {
            this.ctrData = JSON.parse(param.Data);
        }
    };

    //当前道具情况
    user.onResp_PlayerData_Item = function (param) {
        for (var i = 0; i < param.Type.length; i++) {
            var data = {
                type: param.Type[i],
                id: param.ID[i],
                num: param.Num[i],
            }
            this.userBaseData[this.Type.Item].push(data);
        }
    };

    //道具更新
    user.onResp_PlayerUpdate_Item = function (param) {
        for (var i = 0; i < param.ID.length; i++) {
            var isFatch = false;
            for (var j = 0; j < this.userBaseData[this.Type.Item].length; j++) {
                var obj = this.userBaseData[this.Type.Item][j];
                if(param.ID[i] !== obj.id) continue;
                obj.num = param.Num[i];
                isFatch = true;
                break;
            }
            if(isFatch) continue;
            var data = {
                type: param.Type[i],
                id: param.ID[i],
                num: param.Num[i],
            }
            this.userBaseData[this.Type.Item].push(data);
        }
    };

    user.isMonTalentOpen = function () {
        return !!this.ctrData.monTalentOpen;
    };

    user.isScoreShopOpen = function () {
        return this.ctrData.scoreShopOpen;
    };

    user.isFiveStarOpen = function () {
        return false;
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            return this.ctrData.andFiveStar;
        }else if(cc.sys.os === cc.sys.OS_IOS) {
            return this.ctrData.iosFiveStar;
        }
        return true;
    };
    user.isSingularUid = function () {
        var uid = this.userBaseData[this.Type.UserID].toNumber();
        return  uid % 2;
    };

    user.getMyLeader = function () {
        return this.userBaseData[this.Type.Leader] + this.userBaseData[this.Type.LeaderExt];
    };
    /** 数据刷新 */
    user.onResp_PlayerUpdate_Base = function(param){
        var needUpdate = false;
        var needUpdateBtn = false;//监听金币变化，刷新界面上的按钮状态，金币是否不足
        for (var key in param) {
            if (!param.hasOwnProperty(key) || param[key] === null || param[key] === undefined ) continue;
            if (this.userBaseData[key] === param[key]) continue;
            this.userBaseData[key] = param[key];
            needUpdate = true;
            if(key === this.Type.Gold){
                needUpdateBtn = true;
            }
        }
        if(needUpdateBtn){
            clientEvent.dispatchEvent("vitUpdate");
        }
        clientEvent.dispatchEvent("updateBtn");
        if (needUpdate) {
            this.input.refresh();
        }
        cardLogic.checkLineUpRedDot();
    },
    /** 获取基础 */
    user.onResp_PlayerData_Base = function (param) {//服务端回复用户基本数据
        for (var key in param) {
            if (!param.hasOwnProperty(key)) continue;
            if (param[key]) {
                this.userBaseData[key] = param[key];
            }
        }
        if(window.sdw){
            var data = window["clientConfig"]["loginRespone"];
            var name = param.Name ? param.Name : "nick";
            var isNew = param.Name ? 0 : 1;
            window.sdw.postGameInfo({
                appid:data.appid,
                channel:data.channel,
                uid:data.uid,
                id:param.UserID,
                sid:"0",
                nick:name,
                level:param.Lv,
                type:"角色扮演",
                vip:0,
                power:param.Lv,
                new:isNew
            });
            if(window.ta){
                var time = timeLogic.now();
                if(isNew){
                    loginLogic.tgaTrack("createRoleAction");

                }
                loginLogic.tgaTrack("pageViewAction");
                loginLogic.tgaTrack("loginAction");
            }
        }
        treasureLogic.setChestInfo(param.ChestInfos,param.ChestFreeNum,param.ChestFreeTime);//// NOTE: 设置宝箱数据
        this.input.refresh();
        timeLogic.setDeltaTime(param.SrvTime);
        if (!this.userBaseData[this.Type.Logout].equals(Long.ZERO)) {//不是第一次登陆  做一下头像检查
            var platformUrl = loginLogic.getPlatformHeadUrl();
            var mineUrl = this.userBaseData[this.Type.IconUrl];
            var mineIcon = this.userBaseData[this.Type.Icon];
            if (platformUrl !== mineUrl) {
                var icon = !!platformUrl ? -1 : 1;
                if (icon === 1 && mineIcon > 0) {
                    icon = mineIcon;
                }
                this.req_Reset_IconUrl(icon,platformUrl);
            }
        }
        equipLogic.resetInitSpineData();
        this.checkNameError();
    };

    //设置国家
    user.req_Set_Country = function(country){
        var data = {
            "Req_Set_Country": {
                Country:country
            }
        };
        network.send(data,true);
    };
    user.onResp_Set_Country = function(param){
        this.userBaseData[this.Type.Country] = param.Country;
    };

    //设置名称
    user.req_Set_Name = function(name,sex,headID,iconUrl){
        var idx = name.indexOf("\n")
        if(idx !== -1) {
            name = name.replace("\n", "")
        }
        var data = {
            "Req_Set_Name": {
                Name:name.toString(),
                Sex:sex,
                IconID:headID,
                IconUrl:iconUrl
            }
        };
        network.send(data,true);
    };
    user.onResp_Set_Name = function(param){
        this.userBaseData[this.Type.Name] = param.Name;
        this.userBaseData[this.Type.Sex] = param.Sex;
        this.userBaseData[this.Type.Icon] = param.IconID;
        this.userBaseData[this.Type.IconUrl] = param.IconUrl;
        this.input.refresh();
        equipLogic.resetInitSpineData();
        // if(uiManager.getUIActive(uiManager.UIID.SELECT_CHARECTER)){//开着说明处于新手引导状态
        //     kf.require("logic.fight").setGameType(constant.FightType.GUIDE_FIGHT);
        //     clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){
        //         // NOTE: 直接开打了
        //     }.bind(this));
        // }
    };
    //设置体力购买
    user.req_Vit_Buy = function(){
        var data = {
            "Req_Vit_Buy":0
        };
        network.send(data,true);
    };
    user.onResp_Vit_Buy = function(param){

    };

    user.buyVit = function(){
        // var count = this.getBaseData(this.Type.VitBuyTimes);//剩余购买次数
        // if(count <= 0){
        //     uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("topHead","buyVitMax"));
        //     return;
        // }
        uiManager.openUI(uiManager.UIID.VIT_INFO);
    };

    user.setNewUserInfo = function () {
        if (this.userBaseData[this.Type.Logout].equals(Long.ZERO)) {
            var url = kf.require("logic.login").getPlatformHeadUrl();
            var name = kf.require("logic.login").getUserName();
            var headID = !url ? 1 : -1;//如果没有头像 则使用默认1头像  如果有头像直接使用-1作为特殊标识
            this.req_Set_Name(name,1,headID,url);
            var contryTid = jsonTables.getCoutryByLang(uiLang.language);
            this.req_Set_Country(contryTid);//设置国家
            configuration.newUserResetConfig();// NOTE: 新用户 清空本地配置
            clientEvent.dispatchEvent("resetVoide");
            window.adjustUtil.recored(tb.ADJUST_RECORED_RGEISTER);
            if(window.FBInstant)    //fb版本打点
                window.fbAnalytics.recored(tb.FACEBOOK_RECORED_RGEISTER);
            return true;
        }
        return false;
    };

    /**
     * 更新红点标识 这条消息包只处理服务器 处理不了的界面请求
     * @param  {int} constantNum 枚举类型
     * @param  {int} desrCount   需要减去的数量
     */
    user.req_Update_Flag = function (constantNum,desrCount) {
        var data = {
            "Req_Update_Flag": {
                "FlagKey":flagKeys,
                "FlagValue":flagValues
            }
        };
        network.send(data,true);
    };
    /** 红点减少 */
    user.desrRedDotCount = function (constantNum,desrCount) {
        var flagKeys = this.userBaseData[this.Type.FlagKey];
        var idx = kf.getArrayIdx(flagKeys,constantNum);
        if (idx === -1) return;//不存在不需要修改红点
        var flagValues = this.userBaseData[this.Type.FlagValue];
        flagValues[idx] -= desrCount;
        flagValues[idx] = flagValues[idx] < 0 ? 0 : flagValues[idx];
        if (flagValues[idx] === 0) {
            flagKeys.splice(idx,1);
            flagValues.splice(idx,1);
            this.input.refresh();
        }
    };
    //重置头像
    user.req_Reset_IconUrl = function (iconID,iconUrl) {
        var data = {
            "Req_Reset_IconUrl": {
                "IconID":iconID,
                "IconUrl":iconUrl,
            }
        };
        network.send(data,true);
        this.userBaseData[this.Type.IconUrl] = iconUrl;
        this.userBaseData[this.Type.Icon] = iconID;
    };

    user.requestChestBuy = function () {
        var data = {
            "Req_Chest_Buy": {
            }
        };
        network.send(data,true);
    };

    user.onResp_Player_LvUp = function(param){
        this.oldData = kf.clone(this.userBaseData);
        this.upLvData = param;
        for (var i = 0 , len = param.Lv - this.oldData.Lv; i < len; i++) {
            loginLogic.tgaTrack("levelupAction",[this.oldData.Lv + i + 1])
        }
        for (var key in param) {
            if (!param.hasOwnProperty(key) || param[key] === null || param[key] === undefined ) continue;
            if (this.userBaseData[key] === param[key]) continue;
            this.userBaseData[key] = param[key];
        }
        this.input.refresh();
        clientEvent.dispatchEvent("playerLvUp");
        if(!uiManager.getUIActive(uiManager.UIID.TOPHEAD) && !this.canPlayUpLvAni){//如果tophead没有显示，直接播升级动画
            this.playUpLvAni();
        }
        var lv = this.getBaseData(this.Type.Lv);
        window.adjustUtil.recored(tb.ADJUST_RECORED_LV_UP,lv);
    };
    user.playUpLvAni = function(callback){
        this.setCanPlayUpLvAni(false);
        if(!this.upLvData){
            if(callback){
                callback();
            }
            return;
        }
        uiManager.openUI(uiManager.UIID.UPGRADE,kf.clone(this.upLvData),this.oldData,callback);//把当前旧数据发出去
        this.upLvData = undefined;
        this.oldData = undefined;
    };

    /* 设置等级提升是否可以立即显示*/
    user.setCanPlayUpLvAni = function (canPlayUpLvAni) {
        this.canPlayUpLvAni = canPlayUpLvAni;
    };

    /* 获取当前是否能升级*/
    user.getCanUpLv = function (addExp) {
        return this.userBaseData[this.Type.Exp] + addExp >= this.userBaseData[this.Type.MaxExp];
    };

    /** 获取红点数值 */
    user.getRedValue = function (constantNum) {
        var flagKeys = this.getBaseData(this.Type.FlagKey);
        var idx = kf.getArrayIdx(flagKeys,constantNum);
        if (idx === -1) return 0;//不存在不需要修改红点
        var flagValues = this.getBaseData(this.Type.FlagValue);
        return flagValues[idx]
    };

    user.getBaseData = function(type,isClone){
        if (!this.userBaseData[type]) return 0;
        return kf.clone(this.userBaseData[type]);
    };

    user.setBaseData = function(type,value){
        this.userBaseData[type] = value;
    };

    user.getDefaultHead = function(){
        return "";
    };

    user.initFlagInfo = function (key,value) {
        key = key || [];
        for (var i = 0 , len = key.length; i < len; i++) {
            var obj = key[i];
            this.flagInfo[obj] = value[i].Tag;
        }
        var contry = this.getBaseData(this.Type.Country);
        try {
            if (typeof (Number(contry)) !== "number") {
                var contryTid = jsonTables.getCoutryByLang(uiLang.language);
                this.req_Set_Country(contryTid+"");//设置国家
            }
        } catch (e) {

        }
    };

    user.pushFlagInfo = function (key,value) {
        this.flagInfo[key] = this.flagInfo[key] || [];
        this.flagInfo[key].push(value);
    };

    user.setFlagInfo = function (key,value) {
        this.flagInfo[key] = value;
    };

    user.getFlagInfo = function (key) {
        return this.flagInfo[key] || [];
    };

    user.getFlagInfoOneFlag = function (key) {
        if (this.flagInfo[key] && this.flagInfo[key].length > 0) {
            return this.flagInfo[key][0];
        }
        return 0;
    };

    user.saveFlagInfo2Server = function (keys) {
        var key = keys;
        var value = [];
        for (var i = 0 , len = keys.length; i < len; i++) {
            var obj = keys[i];
            value[i] = {};
            value[i].Tag = this.getFlagInfo(obj);
        }
        this.req_Update_PanelTag(key,value);
    };

    user.req_Cli_Reward_Receive = function (flag) {
        var data = {
            "Req_Cli_Reward_Receive": {
                "FlagKey":flag
            }
        };
        network.send(data,true);
    };

    user.req_Update_PanelTag = function (keys,values) {//values ->PanelTag_
        var data = {
            "Req_Update_PanelTag": {
                "Key":keys,
                "Value":values
            }
        };
        network.send(data,true);
    };

    user.refreshUIData = function(){
        if(!this.input) return;
        this.input.refresh();
    };
    //渠道登陆时调用此接口设置默认性别，1：男，2：女。不是这两个的默认都设置为男
    user.setMySex = function(sex){
        sex = sex === 2?2:1;
        this.userBaseData[this.Type.Sex] = sex;
    };

    user.isMe = function(uid){
        return  this.userBaseData[this.Type.UserID].equals(uid);
    };
    /** 反馈和 错误报告 */
    user.feedBackServer = function (msg,type) {
        if (network.isConnecting()) return;
        if(network.isConnected()) {
            var data = {
                "Req_Client_Feedback": {
                    "ErrMsg":msg,
                    "Type":type// 反馈类型 1：客户端反馈 2：用户反馈
                }
            };
            network.send(data,true);
        }
    };
    //获取来自服务器的链接  枚举索引参考 constant.LinkFromServer
    user.getLinkFromServer = function (idx) {
        if (!this.userBaseData[this.Type.Link]) {
            return "";
        }
        return this.userBaseData[this.Type.Link][idx] || "";
    };

    //根据id获取道具
    user.getItemByID = function (id) {
        var data;
        for (var i = 0; i < this.userBaseData[this.Type.Item].length; i++) {
            var obj = this.userBaseData[this.Type.Item][i];
            if(obj.id !== id) continue;
            data = obj;
            break;
        }
        return data;
    };

    //根据id获取道具数量
    user.getItemNumByID = function (id) {
        var data = {};
        data.num = 0;
        for (var i = 0; i < this.userBaseData[this.Type.Item].length; i++) {
            var obj = this.userBaseData[this.Type.Item][i];
            if(obj.id !== id) continue;
            data = obj;
            break;
        }
        return data.num;
    };

    //检查名字是否非法,目前\n属于非法
    user.checkNameError = function () {
        var name = this.userBaseData[this.Type.Name]
        var idx = name.indexOf("\n");
        if(idx !== -1) {
            this.userBaseData[this.Type.Name] = name.replace("\n", "")
        }
    };
    return user;
};
