
window["logic"]["login"] = function() {

    var login = {};
    var lang = null;
    var network = null;
    var clientEvent = null;
    var configuration = null;
    var userLogic = null;
    var timeLogic = null;
    var guideLogic = null;
    var heartbeat = null;
    var worldBossLogic = null;
    var fight = null;

    login.init = function() {
        lang = kf.require("util.lang");
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        configuration = kf.require("util.configuration");
        userLogic = kf.require("logic.user");
        timeLogic = kf.require("logic.time");
        guideLogic = kf.require("logic.guide");
        heartbeat = kf.require("basic.heartbeat");
        worldBossLogic = kf.require("logic.worldBoss");
        fight = kf.require("logic.fight");

        this.isAutoLogin = true;
        this.firstLoad = true;
        this.reset();
        this.isHttps = false;
        this.noticeInfo = null;
        this.registerMsg();
        this.checkSdwLogin();
        //TGA登陆
        if(window.DhStatistics){
            window.ta = new DhStatistics("1a5861b360b642d78d99f66278e45c2b");
        }
    };

    login.reset = function () {
        //登录信息
        this.loginInfo = {
            uid: 0,                 //用户id
            auto: false,
            login: false,//表示登录是否成功
            isShowNoticeFlag:false,//是否本次展示过公告
            callback:null  //连接成功后的回调函数
        };
    };

    login.isHttpsEnable = function () {
        return this.isHttps;
    };

    login.initServer = function () {
        var server = null;
        if (this.noticeInfo) {
            server = jsonTables.random(this.noticeInfo.ServerList);
        }else {
            server = window["clientConfig"]["LOGIN_LIST"][ window["clientConfig"]["serverIdx"]];
        }
        this.setServer(server["ip"], server["port"]);
        this.isHttps = server["isHttps"];
        this.initLoginMode();
    };

    login.setServer = function (ip, port) {
        this.ip = ip;
        this.port = port;
        // reconnect.setServer(this.ip,this.port);
    };

    login.initLoginMode = function () {
        this.loginInfo.mode = window["clientConfig"]["loginMode"];//1表示账号密码登录, 2表示微信登录,
        if(window.sdw){
            configuration.setLastLoginMode(constant.LastLoginMode.SDW);
            this.auToLogin();
        }
    };

    login.registerMsg = function() {
        network.registerEvent("Push_Issue_Code", this.onPush_Issue_Code.bind(this));
        network.registerEvent("Resp_Client_Login", this.onResp_Client_Login.bind(this));
        network.registerEvent("Resp_PlayerData_Flag", this.onResp_PlayerData_Flag.bind(this));
    };
    login.onPush_Issue_Code = function (param) {   //所有业务失败返回结果(推送)
        var code = param.Code;
        var errorcode = lang.getMessage("errorcode", "errorcode" + code);
        for (var i = 0 , len = param.Sequence.length; i < len; i++) {
            var obj = param.Sequence[i];
            network.popSessionData(obj + network.c2gsOffG2cs);
        }
        switch (code) {
            case 18:
            case 107:
            // case 111:
                clientEvent.dispatchEvent("loadScene",constant.SceneID.MAIN,[],function(){}.bind(this));
                fight.setGameState(constant.FightState.GAMEOVER);
                worldBossLogic.req_Boss_Info(true);
                uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
                return;
            case 205:
                this.logout(errorcode);
                break;
            case 67:
                var callback = function(){
                    uiManager.closeAllUI();
                    uiManager.openUI(uiManager.UIID.LINEUP);
                };
                var str = uiLang.getMessage("talentPanel","unReset");
                uiManager.msgDefault(str,callback.bind(this));
                break;
            default:
            uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
        }
    };
    login.onResp_Client_Login = function (param) {
        if (param.Result === 0) { //结果    0：成功 1：失败 2：封号 3：更新版本
            this.loginInfo.login = true;
            if(param.SevTime){
                timeLogic.setDeltaTime(param.SevTime.toNumber());
            }
        }else {
            uiManager.setRootBlockActive(false);//屏蔽用户
            if(param.Result === 1) {
                var username = configuration.getAccount(username);
                this.login(username);
                // var message = {
                //     "message": uiLang.get("accountRepeart"),
                //     "button2":{
                //         "name": uiLang.getMessage("b", "MBOK"),
                //         "callback": function(){
                //             this.setLoginStateShow();
                //         }.bind(this),
                //     }
                // };
                // uiManager.openUI(uiManager.UIID.MSG, message);
            }else if(param.Result === 2) {
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.get("accountLock"));
                this.setLoginStateShow();
            }else if (param.Result === 3) {
                var message = {
                    "message": uiLang.get("hotUpdate"),
                    "button2":{
                        "name": uiLang.getMessage("b", "MBOK"),
                        "callback": function(){
                            kf.clearAllLoaded();
                            cc.audioEngine.stopAll();
                            cc.game.restart();//版本更新了
                        }
                    }
                };
                uiManager.openUI(uiManager.UIID.MSG, message);
            }else if (param.Result === 4) {
                if (this.noticeInfo) {
                    var maintain = uiLang.language === "en"?this.noticeInfo.MaintainNotice_en:this.noticeInfo.MaintainNotice;
                    if(maintain){
                        uiManager.openUI(uiManager.UIID.NOTICE,maintain, function () {
                           this.setLoginStateShow();
                        }.bind(this));
                    }
                }else{
                     var message = {
                         "message": uiLang.get("serverFixing"),
                         "button2": {
                             "name": uiLang.getMessage("b", "MBOK"),
                             "callback": function () {
                                 this.setLoginStateShow();
                             }.bind(this)
                         }
                     };
                     uiManager.openUI(uiManager.UIID.MSG, message);
                }
            }
        }
    };
    login.onResp_PlayerData_Flag = function (param) {   //玩家数据接受完毕
        uiManager.setRootBlockActive(false);//屏蔽用户
        if (param.Flag === 1) {
            userLogic.initFlagInfo(param.Key,param.Value);
            userLogic.setNewUserInfo();//设置用户名字性别
            if (!guideLogic.isInGuideFlag() && guideLogic.checkCanGuide()) {
                guideLogic.setGuideBaseInfo();
                guideLogic.startGuide();
                clientEvent.dispatchEvent("guideAction","btnVisible",false);
                return;
            }
            clientEvent.dispatchEvent("loadScene",constant.SceneID.MAIN,[],function(){
                if(param.PayShopId){
                    login.req_PayShop_Show();
                }
            }.bind(this),true);
            heartbeat.start();
        }else {
            cc.error('登陆失败',param.ErrMsg);
        }
    };

    login.req_PayShop_Show = function () {
        var data = {
            "Req_PayShop_Show": {
            }
        };
        network.send(data);
    };
    login.allocGameServer = function(data) {
        // configuration.setAccountInfo(this.tempUserName, this.tempPwd);
        // configuration.save();

        // reconnect.setInGame(true);
        // heartbeat.start()

        // this.loginInfo.uid = data.uid;
        // this.loginInfo.token = data.token;
        // this.loginInfo.gameServer = data.gameServer;

        this.loginServerEx();
    };

    login.exitGameConfirm = function(msg){
        var callback = function () {
            clientEvent.dispatchEvent("loadScene",constant.SceneID.LOGIN);
        };

        var message = {
            "message": msg,
            "button2":{
                "name": lang.getMessage("b", "MBOK"),
                "callback": callback.bind(this)
            }
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    };
    login.exitGame = function () {
        if (!this.loginInfo.login) return;
        if (window.logic) {//// NOTE: 退出游戏就重置所有logic类内缓存数据
            for (var key in window.logic) {
                if (!window.logic.hasOwnProperty(key)) continue;
                if (kf.require("logic."+key) && kf.require("logic."+key).reset) {
                    kf.require("logic."+key).reset();
                }
            }
        }
        uiManager.destroyRoot();
        // reconnect.setInGame(false);
        heartbeat.stop();
        this.loginInfo.login = false;
        network.disconnect(true);
    };

    login.logout = function(msg){
        if (!this.loginInfo.login) return;
        this.exitGame();
        this.exitGameConfirm(msg);//这里存在  特么点击回调场景 没网络 加载不到 就很尴尬了 TODO 待讨论
    };

    login.logoutEx = function(){
        this.exitGame();
        clientEvent.dispatchEvent("loadScene",constant.SceneID.LOGIN);
    };

    login.register = function(username, passwd, passwdsubmit) {
        this.connect(function() {
            var data = {
                "loginRegister": {
                    "username": username,
                    "password": passwd,
                }
            };
            network.send(data);
        });
    };

    login.connect = function (callback) {
        if (!this.ip) return cc.error("不存在ip")
        network.connect(this.ip, this.port, callback);
    };

    //用户名密码登录账号服务器
    login.login = function(username, passwd) {
        configuration.setAccountInfo(username);
        configuration.save();
        uiManager.setRootBlockActive(true);//屏蔽用户
        clientEvent.dispatchEvent("showLoginState",constant.LoginState.Hide);
        this.connect(function(result) {
            if (result) {//连接上了
                var platform = jsonTables.getPlatform();
                var version = "";
                // if (cc.sys.isNative  && !CC_PREVIEW) {// && !CC_DEBUG
                    version = window.zCodeVersion && window.zCodeVersion.getVersion ? window.zCodeVersion.getVersion() :"";
                // }
                var channel = 0;
                if(window.wx){
                    channel = 5;
                    platform = 3;
                }else{
                    channel = jsonTables.getChannel();
                    if(channel === 6 && window["clientConfig"]["loginRespone"].channel === "12512"){//小度渠道
                        channel = 7;
                    }
                }

                var data = {
                    "Req_Client_Login": {
                        "Account": username,
                        "Platform":platform,// 平台 0：h5 1:android 2:ios 3:wx
                        "Version":version,
                        "Channel":channel,
                        "Language":uiLang.language,
                        "Token":""
                    }
                };
                network.send(data);
            }else{
                this.setLoginStateShow();
            }
        }.bind(this));
    };

    login.setLoginStateShow = function () {
        clientEvent.dispatchEvent("showLoginState",constant.LoginState.Choise);
        uiManager.setRootBlockActive(false);
    };


    login.getUid = function(){
        return this.loginInfo.uid;
    };

    login.getNoticeInfo = function () {
        return this.noticeInfo;
    };

    //获取公告请求
    login.sendNotice = function (cb) {
        if (!window["clientConfig"]["showNotice"]) return cb();
        var noticeUrl = window["clientConfig"]["noticeUrl"];
        var xhr = cc.loader.getXMLHttpRequest();
        this.responseNotice(xhr,cb);
        xhr.timeout = 5000;
        xhr.open("GET",noticeUrl, true);
        // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.send();
    };

    //获取公告请求响应
    login.responseNotice = function( xhr, cb ) {
        ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function (eventname) {
            xhr["on" + eventname] = function () {
                if (eventname === 'error') {
                    cb();
                }
                // cc.log("Event : " + eventname);
            };
        }.bind(this));

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                try {
                    var jsonInfo = JSON.parse(xhr.responseText);
                    this.noticeInfo = jsonInfo;
                } catch (e) {
                    console.error(e);
                } finally {
                    cb();
                }
            }
        }.bind(this);
    };

    login.loadNoticeByDocument = function (url,cb) {
        var head = document.head || document.getElementByTagName('head')[0];
          var script = document.createElement('script');
          script.src = url;

          script.onload = script.onreadystatechange = function(){
            if(!this.readyState || this.readyState==='loaded' || this.readyState==='complete'){
                var isLoad = !!window.noticeInfo;
              cb(isLoad);
              script.onload = script.onreadystatechange = null;
              head.removeChild(script)
            }
          };

          head.appendChild(script);
    };

    login.showNotice = function () {
        if (this.noticeInfo && this.noticeInfo.IsMaintain !== 0) {//IsMaintain  不为0标识可以玩耍  不然就要维护了
            clientEvent.dispatchEvent("refreshMainBtnActive");
            var maintain = uiLang.language === "en"?this.noticeInfo.MaintainNotice_en:this.noticeInfo.MaintainNotice;
            if(maintain){
                uiManager.openUI(uiManager.UIID.NOTICE,maintain,function(){
                    cc.audioEngine.stopAll();
                    if (cc.sys.isNative) {
                        cc.director.pause();
                        cc.director.end();
                    }else {
                        cc.game.end();
                    }
                });
            }
            return true;
        }
        return false;
    };
    /** 在游戏内展示公告 */
    login.showNoticeInGame = function () {
        if (this.noticeInfo && !this.loginInfo.isShowNoticeFlag) {
            this.loginInfo.isShowNoticeFlag = true;
            var notice = uiLang.language === "en"?this.noticeInfo.Notice_en:this.noticeInfo.Notice;
            if(notice){
                uiManager.openUI(uiManager.UIID.NOTICE,notice);
            }
        }
    };

    /** 处理自动登陆逻辑 */
    login.auToLogin = function () {
        if((!window["clientConfig"]["loginRespone"] || !this.ip) && window.sdw) return;
        if (!this.isAutoLogin) return;
        if(window.wx){
            this.getWxCode();
        }else{
            this.isAutoLogin = false;//确保用于一次游戏只会一次自动登陆
            var mode = configuration.getLastLoginMode();
            switch (mode) {
                case constant.LastLoginMode.None:
                    break;
                case constant.LastLoginMode.Andoid_Google:
                    break;
                case constant.LastLoginMode.Andoid_Guide:
                    break;
                case constant.LastLoginMode.FaceBook_H5:
                    break;
                case constant.LastLoginMode.Ios_GameCenter:
                    break;
                case constant.LastLoginMode.Ios_Guide:
                    break;
                case constant.LastLoginMode.SDW:
                    if(window.sdw){
                        this.login(window["clientConfig"]["loginRespone"].uid);
                    }
                    break;
                default:
            }
        }

    };

    //获取微信token，这是登陆的最后一步，前面必须
    login.getWxCode = function () {
        var _this3 = this;

        window.wx.login({
            success: function success(reslogin) {
                console.log('wx login success:' + JSON.stringify(reslogin));
                uiResMgr.loadSubpackage('sub', function() {
                    kf.require("logic.guide").initConfig();
                    _this3.login(reslogin.code);
                }.bind(this));
            },
            fail: function fail(failRes) {
                console.log('wx login fail:' + JSON.stringify(failRes));
                // platform.userInfoBtn.show();
            }
        });
    };



    /** 获取第三方头像 */
    login.getPlatformHeadUrl = function () {
        return "";
    };

    login.getUserName = function () {
        var name = "";
        if (!name) {
            name = this.getRandomName();
        }
        return name;
    };

    login.getRandomName = function () {
        var name = "";
        var table = jsonTables.getJsonTable(jsonTables.TABLE.NAME);
        var config = jsonTables.random(table);
        var config2 = jsonTables.random(table);
        name = this._getFixName(config,config2,uiLang.language);
        if (!name) {
            name = this._getFixName(config,config2,jsonTables.defaultLangFlag);
        }
        return name;
    };

    login._getFixName = function (config,config2,flag) {
        var keyFlag = config[flag];
        if (!keyFlag) return "";
        var keyFlag = config2[flag];
        if (!keyFlag) return "";
        var nonStr = "";
        for (var i = 1; i < config[flag]; i++) {
            nonStr += " ";
        }
        return config[flag+"Pre"] + nonStr + config2[flag+"Name"];
    };

    login.checkSdwLogin = function () {
        var that = this;
        var xhr = cc.loader.getXMLHttpRequest();
        var url = location.search;
        if (url.indexOf("?") === -1) return;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var jsonRespond = JSON.parse(xhr.responseText);
                var data = login.searchData(url);
                if(jsonRespond.Code === 0){
                    window["clientConfig"]["loginRespone"] = data;
                    // window["clientConfig"]["loginRespone"].sdw_test = true;//测试支付
                    configuration.setLastLoginMode(constant.LastLoginMode.SDW);
                    that.auToLogin();

                }else{
                    if(data.reurl){
                         window.open(data.reurl);
                    }
                }
            }
        }
        xhr.timeout = 5000;
        xhr.open("GET", "https://qa.game.aliensidea.com/zcode-login/sdw/login" + url, true);
        xhr.send();
    };

    login.searchData = function (search) {
        var pairs = search.slice(1).split('&');

        var result = {};
        pairs.forEach(function(pair) {
            if (pair && pair.indexOf('=') !== -1) {
                pair = pair.split('=');
                //兼容写法
                result[pair[0]] = pair[1] || "";
            }
        });
        return result;
    };
    //TGA打点
    login.tgaTrack = function (event,data = []) {
        if(!window.ta)  return;
        var uid = window["clientConfig"]["loginRespone"].uid;
        var channel = window["clientConfig"]["loginRespone"].channel;
        var level = userLogic.getBaseData(userLogic.Type.Lv);
        var userID = Number(userLogic.getBaseData(userLogic.Type.UserID)) + "";
        // console.log("打点" + event + "param:" + JSON.stringify(data));
        ta[event](uid,channel,userID,level,"0",data[0],data[1],data[2],data[3],data[4]);
    };

    return login;
};
