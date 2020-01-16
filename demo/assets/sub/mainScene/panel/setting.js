var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        btnFrame:[cc.SpriteFrame],
        btnGrayFrame:[cc.SpriteFrame],
        opinion:cc.EditBox
    },
    onLoad:function(){
        jsonTables.parsePrefab(this);
        this.configuration = kf.require("util.configuration")
        this.language = uiLang.language;//记录全局索引
        var config = this.configuration.getConfigData("bgVolume");
        this.musicStatus = config !== undefined?config:constant.SettingStatus.OPEN;
        config = this.configuration.getConfigData("effectVolume");
        this.soundStatus = config !== undefined?config:constant.SettingStatus.OPEN;
        config = this.configuration.getConfigData("finger");
        this.fingerStatus = config !== undefined?config:constant.SettingStatus.OPEN;
        config = this.configuration.getConfigData("compound");
        this.compoundStatus = config !== undefined?config:constant.SettingStatus.OPEN;
        this.widget('setting/in/content/fbConent').active = !(cc.sys.isBrowser && window.FBInstant);
        // this.widget("setting/in/content/fbConent/settingButton9").active = cc.sys.os !== cc.sys.OS_IOS;// ios隐藏谷歌成就
        // this.widget("setting/in/content/fbConent/settingButton5").active = cc.sys.os !== cc.sys.OS_IOS;// ios隐藏礼包码
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["changeLanguage", this.changeLanguage.bind(this)],
            ["bindScucess", this.bindScucess.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    bindScucess:function(){
       this.refreshBindBtn();
    },

    changeLanguage:function(){
        this.widget("setting/in/uid/uid").getComponent(cc.Label).string = window.zCodeVersion.version;
    },

    //点击输入框，如果不是浏览器平台，则打开横屏输入框
    editBegin:function (event) {
        if(cc.sys.os !== cc.sys.OS_WINDOWS){
            uiManager.openUI(uiManager.UIID.EDIT_PANEL,this.opinion);
        }
    },

    open:function(){
        this.widget("setting/in/musicBtn").getComponent(cc.Toggle).isChecked = this.musicStatus === constant.SettingStatus.OPEN;
        this.widget("setting/in/musicBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/musicBtn").getComponent(cc.Toggle).isChecked;
        this.widget("setting/in/soundBtn").getComponent(cc.Toggle).isChecked = this.soundStatus === constant.SettingStatus.OPEN;
        this.widget("setting/in/soundBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/soundBtn").getComponent(cc.Toggle).isChecked;
        this.widget("setting/in/fingerBtn").getComponent(cc.Toggle).isChecked = this.fingerStatus === constant.SettingStatus.OPEN;
        this.widget("setting/in/fingerBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/fingerBtn").getComponent(cc.Toggle).isChecked;
        this.widget("setting/in/compoundBtn").getComponent(cc.Toggle).isChecked = this.compoundStatus === constant.SettingStatus.OPEN;
        this.widget("setting/in/compoundBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/compoundBtn").getComponent(cc.Toggle).isChecked;
        this.widget("setting/in/feedback").active = constant.SettingStatus.CLOSE;
        // this.widget("setting/in/language/toggle1").getComponent(cc.Toggle).isChecked = this.language === constant.LanguageType.ZH;
        this.widget("setting/in/language/toggle2").getComponent(cc.Toggle).isChecked = this.language === constant.LanguageType.ZH;
        this.widget("setting/in/language/toggle3").getComponent(cc.Toggle).isChecked = this.language === constant.LanguageType.EN;
        this.changeLanguage();

        // this.widget("setting/in/content/fbConent/settingButton7").active = this.loginLogic.isGuide();

        // var idx = cc.sys.isNative ? 0 : 1;
        // this.widget("setting/in/content/fbConent/settingButton6").getComponent(cc.Sprite).spriteFrame = this.btnGrayFrame[idx];
        // this.widget("setting/in/content/fbConent/settingButton8").getComponent(cc.Sprite).spriteFrame = this.btnGrayFrame[idx];

       this.refreshBindBtn();
    },

    refreshBindBtn:function(){
         var channel = jsonTables.getChannel();
         var idx = 1;
         var bindUser = this.userLogic.getBaseData(this.userLogic.Type.BindAccount);
         // if (cc.sys.isNative && channel === 0 && !bindUser) {
         //     idx = 0;
         // }
         // this.widget("settingButton7").getComponent(cc.Sprite).spriteFrame = this.btnGrayFrame[idx];
         // if (cc.sys.isNative) {
         //     this.widget("settingButton7label1").getComponent(cc.Label).string = idx === 0 ? uiLang.getMessage(this.node.name, "acount") : uiLang.getMessage(this.node.name, "acounted");
         // }
    },

    clickMusic:function(){
        this.musicStatus = this.widget("setting/in/musicBtn").getComponent(cc.Toggle).isChecked?constant.SettingStatus.OPEN:constant.SettingStatus.CLOSE;
        this.clientEvent.dispatchEvent("updateVolume",this.musicStatus);
        this.widget("setting/in/musicBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/musicBtn").getComponent(cc.Toggle).isChecked;
        // this.widget("setting/in/musicBtn/label2").active = !this.widget("setting/in/musicBtn").getComponent(cc.Toggle).isChecked;
    },
    clickSound:function(){
        this.soundStatus = this.widget("setting/in/soundBtn").getComponent(cc.Toggle).isChecked?constant.SettingStatus.OPEN:constant.SettingStatus.CLOSE;
        this.clientEvent.dispatchEvent("updateVolume",undefined,this.soundStatus);
        this.widget("setting/in/soundBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/soundBtn").getComponent(cc.Toggle).isChecked;
        // this.widget("setting/in/soundBtn/label2").active = !this.widget("setting/in/soundBtn").getComponent(cc.Toggle).isChecked;
    },
    clickFinger:function(){
        this.fingerStatus = this.widget("setting/in/fingerBtn").getComponent(cc.Toggle).isChecked?constant.SettingStatus.OPEN:constant.SettingStatus.CLOSE;
        this.configuration.setConfigData("finger",this.fingerStatus);
        this.configuration.save();
        jsonTables.showTip = this.fingerStatus === constant.SettingStatus.OPEN;
        this.widget("setting/in/fingerBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/fingerBtn").getComponent(cc.Toggle).isChecked;
        // this.widget("setting/in/fingerBtn/label2").active = !this.widget("setting/in/fingerBtn").getComponent(cc.Toggle).isChecked;
    },
    clickCompound:function(){
        this.compoundStatus = this.widget("setting/in/compoundBtn").getComponent(cc.Toggle).isChecked?constant.SettingStatus.OPEN:constant.SettingStatus.CLOSE;
        this.configuration.setConfigData("compound",this.compoundStatus);
        this.configuration.save();
        jsonTables.showMergeAni = this.compoundStatus === constant.SettingStatus.OPEN;
        this.widget("setting/in/compoundBtn").getComponent(cc.Sprite).enabled = !this.widget("setting/in/compoundBtn").getComponent(cc.Toggle).isChecked;
        // this.widget("setting/in/compoundBtn/label2").active = !this.widget("setting/in/compoundBtn").getComponent(cc.Toggle).isChecked;
    },
    clickLanguage:function(event,param){
        this.language = param;
        console.log(this.language);
        this.configuration.setLanguage(this.language);
        uiLang.changeLanguage();
        // this.userLogic.input.refresh();
    },
    clickOut:function(){
        var cb = function(){
            this.loginLogic.logoutEx();
        }.bind(this);
        uiManager.msgDefault(uiLang.getMessage(this.node.name,"exit"),cb);
    },
    unOpen:function(){
        uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"unopen"));
    },

    opeanFeedback:function(){
        // this.opinion.placeholder = uiLang.getMessage(this.node.name,"placeholder");
        this.widget("setting/in/feedback").active = true;
    },

    sendFeedBacke:function(){
        var str = this.opinion.string;
        this.userLogic.feedBackServer(str,2);
        this.closeFeedback();
    },

    closeFeedback:function(){
        this.opinion.string = "";
        this.widget("setting/in/feedback").active = false;
    },


    openUrl:function(_,url){
        if (!cc.sys.isNative) {
            return this.unOpen();
        }
        var clientUrl = window["clientConfig"][url];//ruleUrl
        cc.sys.openURL(clientUrl);
        // uiManager.openUI(uiManager.UIID.WEB_UI, clientUrl);
    },

    showBind:function(){
        return this.unOpen();
        var bindUser = this.userLogic.getBaseData(this.userLogic.Type.BindAccount);
         var channel = jsonTables.getChannel();
         if (!(cc.sys.isNative && channel === 0 && !bindUser)) {
             return;
         }
         uiManager.openUI(uiManager.UIID.BIND_ACCOUNT);
    },

    openUrlInview:function(_,url){
        var clientUrl = window["clientConfig"][url];//ruleUrl
        cc.sys.openURL(clientUrl);
    },

    showNotice:function(){
        var info = this.loginLogic.getNoticeInfo();
        if (!info || !info.Notice) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"noNotice"));
            return;
        }
        var notice = uiLang.language === "en"?info.Notice_en:info.Notice;
        if(notice){
            uiManager.openUI(uiManager.UIID.NOTICE,notice);
        }
    },

    exchangeBtn:function () {
        uiManager.openUI(uiManager.UIID.EXCHANGE);
    },

    InviteBtn:function() {//邀请码
        uiManager.openUI(uiManager.UIID.INVITE);
    },

    googleAchBtn:function() {//google成就
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this.androidSdkLogic.showGoogleAchievement();
        }else if(cc.sys.os === cc.sys.OS_IOS) {
        }
    },

    userInfoBtn:function() {//用户中心
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this.androidSdkLogic.showUserInfo();
        }else if(cc.sys.os === cc.sys.OS_IOS) {
            this.iosSdkLogic.showUserInfo();
        }
    },

    copyUUID:function(){
        if (kf.require("util.captureTool").copyBoard(this.widget('setting/in/uid/uid').getComponent(cc.Label).string)) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"copy"));
        }
    },
});
