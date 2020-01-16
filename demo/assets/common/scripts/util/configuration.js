/**
 * Created by leo on 16/4/5.
 */


window["util"]["configuration"] = function() {
    var configuration = {};

    var KEY_CONFIG = "ssGameConfig";
    configuration.init = function() {
        this.jsonData = {
            "account": "",
            "password": "",
            "lastLoginMode":constant.LastLoginMode.None
        };

        this.path = this.getConfigPath();

        var content;
        if (cc.sys.isNative) {
            var valueObject = jsb.fileUtils.getValueMapFromFile(this.path);

            content = valueObject[KEY_CONFIG];
        } else {
            content = cc.sys.localStorage.getItem(KEY_CONFIG);
        }

        // if (g_xxtea) {
        //     content = g_xxtea.xxtea_decrypt(content);
        // }

        if (content && content.length) {
            //初始化操作
            this.jsonData = JSON.parse(content);
            this.parseConfig();
        }
    };

    configuration.parseConfig = function () {
        jsonTables.showTip = this.getConfigData("finger") === constant.SettingStatus.OPEN;
        if (this.getConfigData("finger") === undefined) {
            jsonTables.showTip = true;
        }
        if(this.getConfigData("compound") === undefined){
            this.setConfigData("compound",constant.SettingStatus.OPEN);
        }
        jsonTables.showMergeAni = this.getConfigData("compound") === constant.SettingStatus.OPEN;
        var speed = this.getConfigData("actionSpeed");
        if (speed && (typeof speed === "number")) {
            jsonTables.displaySpeed_CurSpeed = speed;
        }else {
            jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_Noraml;
        }
    };

    configuration.newUserResetConfig = function () {
        var account = this.jsonData.account;
        var language = this.jsonData.language;
        this.jsonData = {};
        if (account) {
            this.jsonData.account = account;
        }
        if(language){
            this.jsonData.language = language;
        }
        this.save();
        this.parseConfig();
    };

    configuration.getLastLoginMode = function(){
        return this.jsonData["lastLoginMode"];
    };

    configuration.setLastLoginMode = function(mode){
        if (typeof mode === 'number') {
            this.jsonData["lastLoginMode"] = mode;
            this.save();
        } else {
            cc.error("mode必须是数字,",mode);
        }
    };
    /** 设置参与战斗的用户 */
    configuration.setShareFightID = function (key) {
        var list = this.getShareFightID();
        if (list.indexOf(key) !== -1) {
            cc.error("为什么这个人就存在了呢")
        }else {
            list.push(key);
            this.jsonData["shareFight"] = list;
            this.save();
        }
    };
    /** 获取参与战斗的用户 */
    configuration.getShareFightID = function () {
        var list = this.jsonData["shareFight"];
        list = list || [];
        return list;
    };

    configuration.setConfigData = function(key, value) {
        this.jsonData[key] = value;
    };

    configuration.getConfigData = function(key) {
        return this.jsonData[key];
    };

    configuration.setAccountInfo = function(account, pwd) {
        this.jsonData["account"] = account;
        this.jsonData["password"] = pwd;
    };

    configuration.setThirdInfo = function(thirdId) {
        this.jsonData["thirdId"] = thirdId;
    };

    configuration.setLanguage = function(language) {
        this.jsonData["language"] = language;
        this.save();
    };

    configuration.getLanguage = function() {
        var flag = this.jsonData["language"];
        if (!flag) {
            flag = jsonTables.getLanguage();
            if (!jsonTables.langFlagInConfigName(flag)) {//不存在该语种
                flag = jsonTables.defaultLangFlag;// NOTE: 如果没有语种的就默认取繁体中文标识
            }
            this.jsonData["language"] = flag;
            this.save();
        }
        return "zh";
    };

    configuration.getAccount = function() {
        return this.jsonData["account"] || "";
    };

    configuration.getPassword = function() {
        return this.jsonData["password"] || "";
    };

    configuration.save = function() {
        // 写入文件
        var str = JSON.stringify(this.jsonData);

        // 加密代码
        // if (g_xxtea) {
        //     str = g_xxtea.xxteaEncrypt(str);
        // }

        if (!cc.sys.isNative) {
            var ls = cc.sys.localStorage;
            ls.setItem(KEY_CONFIG, str);
            return;
        }

        var valueObj = {};
        valueObj[KEY_CONFIG] = str;
        jsb.fileUtils.writeToFile(valueObj, configuration.path);
    };

    configuration.getGuestAccount = function() {

        if (this.jsonData["guest_account"]) {
            return this.jsonData["guest_account"];
        }

        this.jsonData["guest_account"] = "" + parseInt(math.random() * 1000, 10);

        return this.jsonData["guest_account"];
    };

    configuration.setGuestAccount = function(acc) {
        this.jsonData["guest_account"] = acc;
    };

    configuration.getConfigPath = function() {

        var platform = cc.sys;

        var path = "";

        if (platform === cc.sys.OS_WINDOWS) {
            path = "src/conf";
        } else if (platform === cc.sys.OS_LINUX) {
            path = "./conf";
        } else {
            if (cc.sys.isNative) {
                path = jsb.fileUtils.getWritablePath();
                path = path + "conf";
            } else {
                path = "src/conf";
            }
        }

        return path;
    };

    return configuration;
};
