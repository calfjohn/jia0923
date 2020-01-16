window["logic"]["adHelper"] = function () {

    var module = {};
    var network = null;

    module.init = function () {
        this.initModule();
        this.registerMsg();
        this.reset();
    };

    module.initModule = function(){
        network = kf.require("util.network");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_Watch_Adv", this.onResp_Watch_Adv.bind(this));
    };

    module.reset = function () {

    };

    module.showAd = function(cb){
        if (cb) {
            cb(true);
        }
    };

    module.isCanShowAd = function(){
        return true;
    };

    //绑定账号
   module.req_Watch_Adv = function (type) {
        var data = {
            "Req_Watch_Adv": {
                Type: type, // 类型 1：关卡沙盘
            }
        };
        network.send(data,true);
   };

   module.onResp_Watch_Adv = function (param) {

   };

    return module;
};
