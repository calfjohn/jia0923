//var schedule = require("node-schedule");
var https = require('https');
var http = require('http');

var accessToken = null;
var jsApiTicket = null;

/**
 * 获取微信关注信息，通知游戏服务端
 * @param openId 微信关注者的用户id
 */
module.exports.wechatInfo = function (openId) {
  console.log("openid:" + openId);
  var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + accessToken + "&openid=" + openId + "&lang=zh_CN";
  https.get(url, function (res) {
    res.on('data', function (data) {
      var a = JSON.parse(data);
      if (!a) {
        return;
      }
      var result = a.subscribe;
      //已经关注
      if (result && result === 1) {
        subscribe(a.openid);
      }
    });
    res.on("end", function () {

    });
  }).on("error", function (err) {
    Logger.error(err.stack);
    callback.apply(null);
  });
};

/**
 * @synopsis 签名算法
 *
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
module.exports.sign = function (url) {
  var ret = {
    jsapi_ticket: jsApiTicket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };

  var string = raw(ret);
  jsSHA = require('jssha');
  shaObj = new jsSHA(string, 'TEXT');
  ret.signature = shaObj.getHash('SHA-1', 'HEX');
  ret.appId = clientConfig["weixin"]["appId"];
  return ret;
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

var subscribe = function (openid) {
  var data = {action: "subscribe", openid: openid};
  var queryStr = require('querystring').stringify(data);
  var opt = {
    host: clientConfig["subscribeUrl"],
    port:'80',
    method:'GET',
    path:'/BTFarmServer/service?' + queryStr,
    headers:{

    }
  };
  var req = http.request(opt, function(res) {
    res.on('data',function(d){
    }).on('end', function(){
    });
  }).on('error', function(e) {
  });
  req.end();
};

/**
 * 获取微信JSSDK AccessToken
 */
var updateAccessToken = function () {
  var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + clientConfig["weixin"]["appId"] + "&secret=" + clientConfig["weixin"]["appSecret"];
  https.get(url, function (res) {
    res.on('data', function (data) {
      accessToken = JSON.parse(data).access_token;
      console.log("accessToken:" + accessToken);
      updateJsApiTicket(accessToken);
    });
    res.on("end", function () {

    });
  }).on("error", function (err) {
    Logger.error(err.stack);
    callback.apply(null);
  });
};

var updateJsApiTicket = function (accessToken) {
  var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + accessToken;
  https.get(url, function (res) {
    res.on('data', function (data) {
      jsApiTicket = JSON.parse(data).ticket;
      console.log("jsApiTicket:" + jsApiTicket);
    });
    res.on("end", function () {
    });
  }).on("error", function (err) {
    Logger.error(err.stack);
    callback.apply(null);
  });
};

/**
 * 获取一个16位的随机字符串
 * @returns {string}
 */
var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

/**
 * 获取当前时间戳
 * @returns {string}
 */
var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

updateAccessToken();

//每隔一小时刷新一次TICKET
var hour = 60*60*1000; // one second = 1000 x 1 ms
setInterval(function() {
  updateAccessToken();
}, hour);

