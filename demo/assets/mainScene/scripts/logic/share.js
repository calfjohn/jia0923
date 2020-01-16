/**
 * @Author: lich
 * @Date:   2018-07-07T14:40:58+08:00
 * @Last modified by:
 * @Last modified time: 2018-08-18T16:34:03+08:00
 */

window["logic"]["share"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var Long = dcodeIO.Long;
    var userLogic = null;
    var configuration = null;
    var fightLogic = null;

    var _EVENT_TYPE = [
        "refreshCount",
    ];
    module.init = function(){
        this.template = {
            success:this.shareSucessSdw.bind(this),
            cancel:this.shareCancleSdw.bind(this),
            fail:this.shareFailSdw.bind(this)
        };
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.gotScore = 0;
        this.shareFightInfo = {};
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic = kf.require("logic.user");
        configuration = kf.require("util.configuration")
        fightLogic = kf.require("logic.fight");
    };
    /** 体力分享次数足够么 */
    module.isVitShareCount = function () {
        var max = userLogic.getBaseData(userLogic.Type.VitShareMax);
        var cur = userLogic.getBaseData(userLogic.Type.VitShareTimes);
        return cur < max;
    };
    /** 步数分享次数足够么 */
    module.isStepShareCount = function () {
        var max = userLogic.getBaseData(userLogic.Type.ChapterShareMax);
        var cur = userLogic.getBaseData(userLogic.Type.ChapterShareTimes);
        return cur < max;
    };

    //是否进入小游戏
    module.isEnterGameScene = function () {
        if (!window.FBInstant) return false;//
        var entryPointData = FBInstant.getEntryPointData();
        if (!entryPointData) return false;
        if (entryPointData.type === tb.SHARELINK_ENERGY || entryPointData.type === tb.SHARELINK_MINIGAME) {
            var key = entryPointData.timeAtmp;
            var list = configuration.getShareFightID();
            if (!kf.inArray(list,key)) {
                configuration.setShareFightID(key);
                return true;
            }else {
                return false;
            }
        }
        return false;
    };

    module.loginFromShare = function () {
        var loginLogic = kf.require("logic.login");
        window["clientConfig"].loadConfig(function(){
            loginLogic.initServer();
            loginLogic.connect(function () {
                this.req_Share_GameInfo();
            }.bind(this))
        }.bind(this))
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Share", this.onResp_Share.bind(this));
        network.registerEvent("Resp_Share_GameInfo", this.onResp_Share_GameInfo.bind(this));
    };

    /** 请求 分享小游戏数据 */
    module.req_Share_GameInfo = function(){//1 步数 2 体力
        var data = {
            "Req_Share_GameInfo":{}
        };
        network.send(data);
    };
    //分享小游戏数据
    module.onResp_Share_GameInfo = function (param) {
        this.shareFightInfo.step = param.Step;
        this.shareFightInfo.score = param.Score;
        this.shareFightInfo.table = param.TableInfo;
        this.shareFightInfo.familyIDs = param.FamilyIDs;
        this.gotScore = 0;
        clientEvent.dispatchEvent("refreshCount");
        fightLogic.setGameType(constant.FightType.SHARE_FIGHT);
        clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){
        }.bind(this));
    };

    module.getStep = function () {
        return this.shareFightInfo.step || 1;
    };

    module.getTable = function () {
        return this.shareFightInfo.table || {};
    };

    module.getLineUp = function () {
        return this.shareFightInfo.familyIDs || [];
    };

    module.getScore = function () {
        return this.shareFightInfo.score || [];
    };
    /** 填充分数 */
    module.addScroe = function (form) {
        var list = this.shareFightInfo.score;
        list = list || [];
        var scroe = list[form - 1] || 0;
        this.gotScore += scroe;
        clientEvent.dispatchEvent("refreshCount",scroe,form);
    };

    /** 请求 分享 */
    module.req_Share = function(type){//1 步数 2 体力 .3 世界Boss分享
        var data = {
            "Req_Share": {
                "Type":type
            }
        };
        network.send(data,true);
    };

    module.onResp_Share = function (param) {
        // optional int32 Type = 1;
        // optional int64 Timestemp = 2; // 链接时间戳
        // repeated Reward_Info_ Rewards = 3;// 分享奖励
    };

    /** 分享战斗行为 */
    module.shareForShareFight = function (type) {

    };

    /** 是否可分享 */
    module.isCanShare = function () {
        if (window && window.FBInstant) {
            return true;
        }else if (cc.sys.isNative) {
            return true;
        }else if(window && window.sdw){
            return true;
        }
        return false;
    };
    /** 这个接口暂时只用于宝箱分享 */
    module.share = function (type,timeAtmp,cb) {
        if (!this.isCanShare()){
            if (cb) {
                cb(false);
            }
            return;
        }
        if (window && window.FBInstant) {
            this.shareForFaceBook(type,timeAtmp,cb);
        }else if (cc.sys.isNative) {
            this.shareForNative(type,timeAtmp,cb);
        }else if (window && window.sdw) {
            this.setSdwShareInfo(cb);
        }else {
            if (cb) {
                cb(false);
            }
        }
    };

    module.setSdwShareInfo = function(cb){
        this.sdwdShareCb = cb;
        var tiltle = "测试";
        var content = "content";
        var info = kf.clone(this.template);
        var tmp = kf.clone(window["clientConfig"]["sdwShareInfo"]);
        kf.convertData(tmp,info);
        cc.log(info);
        this.shareForSdw(info);//设置分享信息
        uiManager.openUI(uiManager.UIID.SHARE_LEAD);
    },

    module.shareForSdw = function(shareObj){
        if (!window.sdw) return false;

        sdw.onSetShareOperate(shareObj);
    };

    module.clearSdwCb = function () {
        if(!this.sdwdShareCb)   return;
        this.sdwdShareCb = null;
    };
    module.shareSucessSdw = function () {
        if(!this.sdwdShareCb)   return;
        uiManager.closeUI(uiManager.UIID.SHARE_LEAD);
        this.sdwdShareCb(true);
        this.sdwdShareCb = null;
    };

    module.shareCancleSdw = function () {
        if(!this.sdwdShareCb)   return;
        uiManager.closeUI(uiManager.UIID.SHARE_LEAD);
        this.sdwdShareCb(false);
        this.sdwdShareCb = null;
    };

    module.shareFailSdw = function () {
        if(!this.sdwdShareCb)   return;
        uiManager.closeUI(uiManager.UIID.SHARE_LEAD);
        this.sdwdShareCb(false);
        this.sdwdShareCb = null;
    };


    module.shareForNative = function (type,ext,cb) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {

        }else if(cc.sys.os === cc.sys.OS_IOS) {

        }else {
            cb(true);
        }
    };

    module.shareForFaceBook = function (type,timeAtmp,cb) {
        var config = jsonTables.getJsonTable(jsonTables.TABLE.SHARELINK);
        var list = [];
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i];
            if (obj[jsonTables.CONFIG_SHARELINK.Type] === type) {
                list.push(obj);
            }
        }
        var obj = jsonTables.random(list);
        if (!obj)  {
            cc.error("不存在分享配置");
            if (cb) {
                cb(false);
            }
            return
        }
        var url = 'resources/shareRes/'+obj[jsonTables.CONFIG_SHARELINK.ShareRes]+'.png';
        var txt = uiLang.getConfigTxt(obj[jsonTables.CONFIG_SHARELINK.ShareContent]);
        if (type === tb.SHARELINK_MINIGAME) {//炫耀行为时 需要进行文字拼接
            txt = txt.formatArray([timeAtmp]);//此时这个值使用次数推入
        }

        var extData = {};
        var userIDLong = userLogic.getBaseData(userLogic.Type.UserID);
        extData.userID = userIDLong.toNumber();
        extData.type = type;
        if (extData.type === tb.SHARELINK_ENERGY || extData.type === tb.SHARELINK_MINIGAME) {
            extData.timeAtmp = extData.userID + "" + (new Date().getTime() + "");
        }else {
            extData.timeAtmp = timeAtmp;
        }
        var intent = 'REQUEST';
        switch (type) {
            case tb.SHARELINK_BOX :
            case tb.SHARELINK_STEP :
                intent = 'SHARE';
                break;
            case tb.SHARELINK_ENERGY :
            case tb.SHARELINK_MINIGAME :
                intent = 'CHALLENGE';
                break;
        }
        uiManager.setRootBlockActive(true);
        uiResMgr.getBase64Image(url,function(base){
            if (!base) {
                uiManager.setRootBlockActive(false);
                return cc.error("加载base64图片失败")
            }
            uiManager.openUI(uiManager.UIID.WAITINGUI)
            FBInstant.shareAsync({
              intent: intent,//("INVITE" | "REQUEST" | "CHALLENGE" | "SHARE")
              image: base,
              text: txt,
              data: extData
          }).then(function() {//但不论用户是否真的分享了内容，都会返回 promise 的 resolve。https://www.cnblogs.com/yunfeifei/p/4453690.html
              uiManager.closeUI(uiManager.UIID.WAITINGUI)
              uiManager.setRootBlockActive(false);
              if (cb) {
                  cb(true);
              }
            });
        }.bind(this));
    };
    /** 告知服务器有来自分享的玩家进来了 */
    module.tellServerSharerIn = function () {
        if (!window.FBInstant) return cc.error("不存在fbsdk");
        var entryPointData = FBInstant.getEntryPointData();
        if (!entryPointData) return cc.warn("不存在入口数据  说明是个新用户");
        if (entryPointData.type !== tb.SHARELINK_BOX) return;//只有分享宝箱采取通知服务器
        var url = window["clientConfig"]["fbShareBackUrl"];
        if (!url) return cc.error("读取不到fb汇报服务器接口");

        var timestamp = entryPointData.timeAtmp || 0;
        var uid = entryPointData.userID || 0;
        var clickUid = FBInstant.player.getID() || 0;
        var serverUrl = url + "?timestamp="+timestamp+"&uid="+uid+"&clickUid="+clickUid+"&platform=3";
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        xhr.open("GET",serverUrl, true);
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.send();
        cc.log("sendInfoToServerDone")
    };


    return module;
};
