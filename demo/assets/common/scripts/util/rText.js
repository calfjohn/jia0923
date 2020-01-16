/**
 * Created by junwei on 2018/8/30
 */
window.rText = window.rText || {};
//根据货币类型，获取货币图片
rText.getMsgCurrency = function(type) {
    var str = "<img src='";
    switch (type) {
        case constant.Currency.DIAMOND:
            str += "diamond";
            break;
        case constant.Currency.GOLD:
            str += "gold";
            break;
        case constant.Currency.RMB:
            str += "rmb";
            break;
        case constant.Currency.VIT:
            str += "vit";
            break;
        case constant.Currency.PUBLICLIP:
            str += "debris";
            break;
        default:
    }
    str += "' />";
    return str;
};
//给一段文字两端增加按钮点击事件标签
rText.addFuncStr = function(str,funcName){
    var newStr = "<on click='" + funcName + "'>" + str + "</on>";
    return newStr;
};

rText.setColor = function (str,color) {
    var newStr = "<color=" + color + ">" + str + "</c>";
    return newStr;
};

rText.formatEmoticon = function(str,keys){
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i].slice(8);
        var str1 = "<"+key+">";
        var reg= new RegExp (str1,"g");
        str = str.replace(reg, rText.getImage(keys[i]));
    }
    return  str;
};
rText.getImage = function(name){
    return  "<img src='" + name +"' />";
};
