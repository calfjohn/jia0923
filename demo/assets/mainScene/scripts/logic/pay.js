/**
 * @Author: lich
 * @Date:   2018-06-12T15:04:24+08:00
 * @Last modified by:
 * @Last modified time: 2018-09-14T16:03:52+08:00
 */

window["logic"]["pay"] = function() {
    var module = {};

    module.PayState = {
        Success:0,
        Fail:1,
        Cancle:2
    };

    var _EVENT_TYPE = [
    ];
    var network = null;
    var clientEvent = null;
    var shopLogic = null;

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
        // FBInstant.payments.onReady(function () {
        //   console.log('Payments Ready!')
        // });
    };

    module.reset = function(){

    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        shopLogic = kf.require("logic.shop");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_PayOrder_Check", this.onResp_PayOrder_Check.bind(this));
    };

    /**
     * 订单校验
     * @param  {string} orderID  订单编号
     * @param  {string} token    第三方平台数据
     * @param  {string} sign     第三方平台数据
     * @param  {int} PayState 支付状态
     */
    module.req_PayOrder_Check = function(orderID,token,sign,payState){
        var platform = jsonTables.getPlatform();
        var data = {
            "Req_PayOrder_Check": {
                "UserID":0,
                "Platform":platform,
                "OrderID":orderID,
                "PayData":token,
                "Sign":sign,
                "PayState":payState
            }
        };
        network.send(data,true);
    };
    module.onResp_PayOrder_Check = function(param){//订单校验
        cc.log(param.Result,"   PayRet")
        var price = shopLogic.getPriceByShopID(param.ShopID);
        if (!price) {
            cc.error("为什么没找到")
            price = 0.99;
        }//
        window.adjustUtil.recored(tb.ADJUST_RECORED_CHARGE,price);//
    };

    module.getFbPayList = function (cb) {
        FBInstant.payments.getCatalogAsync().then(function (catalog) {
          cb(catalog)
      },function(error){
          cc.error(error);
      });
    };

    module.buyFbProduct = function (productID) {
        FBInstant.payments.purchaseAsync({
          productID: productID+"",
          developerPayload: 'foobar',
        }).then(function (purchase) {
          console.log("购买成功",purchase);
          this.consumeProduct(purchase.productID);
          // {productID: '12345', purchaseToken: '54321', developerPayload: 'foobar', ...}
      },function(error){
          cc.log("购买失败",error)
      });
    };
    /** 获取已经买到的东西 */
    module.getBoughtList = function () {
        // FBInstant.payments.getPurchasesAsync().then(function (purchases) {
        //   console.log("买了好多东西啊",purchase);
        //   // [{productID: '12345', ...}, ...]
        // });
    };
    /** 消费商品 */
    module.consumeProduct = function (productID) {
        FBInstant.payments.consumePurchaseAsync(productID+"").then(function (aa) {
            cc.log("使用成功",aa)
          // Purchase successfully consumed!
          // Game should now provision the product to the player
        });
    };

    module.pay = function (goodID,goodName,uid,serverId,orderID,price) {
        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                this._payAndroid(goodID,goodName,uid,serverId,orderID);
            }else if (cc.sys.os === cc.sys.OS_IOS) {
                this._payIos(goodID,goodName,uid,serverId,orderID);
            }
        }else{
            if (window && window.FBInstant) {
                this._payFaceBooK(orderID,goodID);
            }else if(window && window.sdw){
                this._paySdw(goodID,goodName,uid,serverId,orderID,price);
            }
        }
    };

    module._paySdw = function (shopId,goodName,uid,serverId,orderId,price) {
        // var config = this.getShopItem(shopId);
        // if (!config) return;//cc.error(shopId,"找不到商品配置");

        var data = {};
        data.appId = window["clientConfig"]["loginRespone"].appid;
        data.accountId = window["clientConfig"]["loginRespone"].uid;
        data.amount =  price;//单位为分
        // data.amount = 1;
        data.wxopenid = "";
        data.cpOrderId = orderId;
        var url = "http://www.shandw.com/mi/game/2072737999.html";
        url = window["clientConfig"]["loginRespone"].sdw_test === true ?  url+"?sdw_test=true":url;
        data.call_back_url = url;
        data.merchant_url = url;
        data.subject = goodName;
        data.channel = window["clientConfig"]["loginRespone"].channel;
        data.timestamp = Math.floor(new Date().getTime() / 1000);
        if(window["clientConfig"]["loginRespone"].openid){
            data.wxopenid = window["clientConfig"]["loginRespone"].openid;
        }

        var signList = [];
        for (var key in data) {
            if (!data.hasOwnProperty(key)) continue;
            if (!data[key]) continue;
            signList.push(key)
        }

        var sortFunc = function(a,b){
            return a + ''> b + ''? 1 : -1
        }
        signList.sort(sortFunc);

        var signStr = "";
        for (var i = 0; i < signList.length; i++) {
            var key = signList[i];
            var mid = ""
            if (signStr !== "") {
                mid = "&";
            }
            signStr = signStr + mid + (key+"") + "=" + data[key];
        }
        signStr = signStr + "aa7eb9e2f6fc4171a69c162187ae09";//闪电玩应用密钥  写在config有点尴尬
        data.sign = window.md5(signStr).toLowerCase();
        data.memo = uid + "-" + window["clientConfig"]["loginRespone"].channel;
        data.gameName = "天天打怪物";
        data.paychannel = "";
        data.complete = function(){
            sdw.closeSDWPay();
        }
        this.chooseSDWPay(data);
    };

    module.talkingDataPrePay = function () {

    };

    //闪电玩支付接口
    module.chooseSDWPay = function (obj) {
        sdw.chooseSDWPay(obj);
    };

    module.closeSDWPay = function () {
        sdw.closeSDWPay();
    };

    module._payAndroid = function (orderID,goodID) {

    };

    module._payIos = function (goodID,goodName,uid,serverId,orderID) {
        setTimeout(function () {
            window.iosSdkLogic && window.iosSdkLogic.callIosBuy(goodID,goodName,uid,serverId,orderID);
        }, 50);
    };

    module._payFaceBooK = function (orderID,goodID) {

    };


    return module;
};
