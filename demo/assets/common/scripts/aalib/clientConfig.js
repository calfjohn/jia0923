window["clientConfig"] =  window["clientConfig"] || {};
//只存在放必要的属性
var obj = {

    "SecretKey" : ""
};

for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
     window["clientConfig"][key] = obj[key];
}

window["clientConfig"].loadConfig = function(callBack){
    cc.loader.loadRes("config", function (err, data) {
        if (err) return cc.error(err);
        kf.convertData(data.json,window["clientConfig"]);
        callBack();
    }.bind(this));
};
