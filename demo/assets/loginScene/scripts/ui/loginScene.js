var panel = require("panel");
cc.Class({
    extends: panel,
    properties: {
        account:cc.EditBox,
    },
    onLoad:function () {
        this.configuration = kf.require("util.configuration");
        this.widget('loginScene/content/faceBookBtn').active = false;
        this.widget('loginScene/content/nativeNode').active = false;
        this.widget('loginScene/content/devNode').active = false;
        this.widget('loginScene/content/tipMsg').active = false;
        this.widget('loginScene/content/wxNode').active = false;
        this.widget('loginScene/content/sdwNode').active = false;
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.widget("loginScene/versionLabel").getComponent(cc.Label).string = uiLang.get("version") + zCodeVersion.getVersion();
    },

    registerEvent: function () {
        var registerHandler = [
            ["showLoginState", this.showLoginState.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["dim2distDone", this.dim2distDone.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    dim2distDone:function(event){
        event.stopPropagation();
    },

    showLoginState:function(param){
        switch (param) {
            case constant.LoginState.Choise:
                this.showLoginChoice();
                break;
            case constant.LoginState.Hide:
                this.hideLoginChoice();
                break;
            default:

        }
    },

    start:function(){
        this.node.dispatchDiyEvent("closeMiniBg",{});
        //开始请求公告 然后设置服务器ip  此时间内 不允许操作
        uiManager.openUI(uiManager.UIID.WAITINGUI);
        var loginLogic = kf.require("logic.login");
        window["clientConfig"].loadConfig(function(){
            loginLogic.sendNotice(function(){
                uiManager.closeUI(uiManager.UIID.WAITINGUI)
                loginLogic.initServer();
                if(window.wx){
                    this.hideLoginChoice();
                    loginLogic.auToLogin()
                }else {
                    this.showLoginChoice();
                    if (!loginLogic.showNotice()) {
                        loginLogic.auToLogin()
                    }
                }
            }.bind(this));
        }.bind(this))

        setTimeout(function () {
            uiResMgr.startLoadPreload();
        }.bind(this), 1000);
    },

    showLoginChoice:function(){
        this.widget('loginScene/content/wxNode').active = window && window.wx;
        this.widget('loginScene/content/sdwNode').active = window && window.sdw && !this.loginLogic.firstLoad;
        this.loginLogic.firstLoad = false;
        this.widget('loginScene/content/faceBookBtn').active = window && window.FBInstant;
        this.widget('loginScene/content/nativeNode').active = cc.sys.isNative && !CC_DEV;
        this.widget('loginScene/content/devNode').active = (!cc.sys.isNative && !this.widget('loginScene/content/faceBookBtn').active && !window.sdw && !this.widget('loginScene/content/wxNode').active) || CC_DEV;
        if (this.widget('loginScene/content/nativeNode').active) {
            this.widget('loginScene/content/nativeNode/googleBtn').active = cc.sys.os === cc.sys.OS_ANDROID;
            this.widget('loginScene/content/nativeNode/gameCenterBtn').active = cc.sys.os !== cc.sys.OS_ANDROID;
        }

        if (this.widget('loginScene/content/devNode').active) {
            try {
                jsonTables.setEditBoxString(this.account,this.configuration.getAccount());
            } catch (e) {
                console.error(e);
            }
        }
        this.widget('loginScene/content/tipMsg').active = false;
    },

    hideLoginChoice:function(){
        this.widget('loginScene/content/faceBookBtn').active = false;
        this.widget('loginScene/content/nativeNode').active = false;
        this.widget('loginScene/content/devNode').active = false;
        this.widget('loginScene/content/tipMsg').active = true;
        this.widget('loginScene/content/wxNode').active = false;
        this.widget('loginScene/content/sdwNode').active = false;
        this.widget('loginScene/content/tipMsg/tipMsg').getComponent(cc.Label).string = uiLang.get("tryLogin");
    },

    loginBtn:function () {
        var str = this.account.string;
        if(str === "")  return;
        this.loginLogic.login(str);
    },

    wxLogin:function () {

    },

    sdwLogin:function () {
        if(!window["clientConfig"]["loginRespone"]) return;
        this.configuration.setLastLoginMode(constant.LastLoginMode.SDW);
        this.loginLogic.login(window["clientConfig"]["loginRespone"].uid);
    },

    loginNative:function () {

    },

    bindAccount:function () {

    },

    sureLogin:function () {

    },

    loginGoogle:function(){

    },

    loginGuide:function(){

    },

    loginGuideCheck:function(){
        var message = {
            "message":  uiLang.get("guestTip"),
            "button1":{
                "name": uiLang.get("useOther"),
                "callback": function(){}
            },
            "button3":{
                "name": uiLang.get("useGuest"),
                "callback":function(){
                    this.loginGuide();
                }.bind(this),
            },
        };
        uiManager.openUI(uiManager.UIID.MSG, message);
    },

    loginFaceBook:function(){

    },

    loginGameCenter:function(){

    },

    loginFaceBooKForNative:function(){//
        if (cc.sys.os === cc.sys.OS_ANDROID) {

        }else if(cc.sys.os === cc.sys.OS_IOS) {

        }
    },

    /** 场景被释放前会调用这个函数 释放关联资源 */
    release:function(){
        cc.log("startRealse")
    },
    // update (dt) {},
});
