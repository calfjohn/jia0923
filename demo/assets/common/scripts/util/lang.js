/**
 * Created by leo on 16/3/1.
 */

window["util"]["lang"] = function () {
    var lang = {};
    var configuration = null;
    lang.init = function () {
        configuration = kf.require("util.configuration")
        this.language = configuration.getLanguage();//记录全局索引
        uiResMgr.loadFont(this.language);
        Object.defineProperty(this,"lanData",{
          set:function(newValue){console.error("不允许手动修改lanData")},
          get:function(){return kf.require("word." + lang.language);}
        })
        window.uiLang = this;
    };

    lang.get = function(key){
        return lang.lanData["raw"][key] || "";
    };

    lang.changeLanguage = function(){
        lang["language"] = configuration.getLanguage();
        if(!jsonTables.font[ "gamefont_all_" + uiLang.language + "1"]){
            uiResMgr.loadFont(this.language);//加载完字体之后会resetLang
            return;
        }
        jsonTables.resetLang();
    };

    lang.getMessage = function(category, messageKey) {//得到脚本内对应变量名的字符串
        if (!lang.lanData[category]) {
            cc.error(category+"界面文字缺失")
            return "";
        }
        var lanStr = lang.lanData[category][messageKey];
        if (!lanStr) {
            return "";
        }
        return lanStr;
    };

    lang.getConfigTxt = function (textID) {
        var tableName = "text_" + uiLang.language;
        var obj = jsonTables.getJsonTableObj(tableName,textID);
        return obj && obj[jsonTables.CONFIG_TEXT_ZH.Content] ?obj[jsonTables.CONFIG_TEXT_ZH.Content]:"";
    };

    lang.getHintMsg = function (nodeName,path) {
        var cache = window.hintCache[uiLang.language];
        return  cache[nodeName][path];
    };

    lang.replaceString = function (str, replaceArr) {
        var arr = [];
        if(!(replaceArr instanceof Array)) {
            replaceArr = replaceArr.toString();
            arr.push(replaceArr);
        }
        else {
            arr = replaceArr;
        }
        var stringArr = str.split("}");
        var realStringArr = [];
        for(var i = 0; i < stringArr.length; i++) {
            var strArr = stringArr[i].split("{");
            strArr[1] = arr[i];
            var addstr = strArr.join("");
            realStringArr.push(addstr);
        }
        var realString = realStringArr.join("");
        return realString;
    };

    //获取当前地区的货币显示
    lang.getCurAreaPrice = function (priceData) {
        switch (priceData.CurrencyType) {
            case constant.Currency.RMB:
                break;
            default:
                return (priceData.Price / 100) + "";
        }
        var langCode = cc.sys.language;
        var priceString = "";
        switch (langCode) {
            case cc.sys.LANGUAGE_CHINESE:
                if(priceData.FirstPrice){
                    priceString = "# " + priceData.FirstPrice / 100;
                }else{
                    priceString = "# " + priceData.RMB / 100;
                }

                break;
            default:
                priceString = "$ " + priceData.Price / 100;
                break;
        }
        return priceString;
    };

    return lang;
};
