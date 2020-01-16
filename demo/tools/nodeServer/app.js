var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var php = require("node-php");
var fs = require('fs');
var wx = require('./wx');

var router = express.Router();
var OAuth = require("wechat-oauth");

var app = module.exports = express();
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use('/', router);

app.use(function(req, res, next) {
    console.log('404');
    var err = new Error('Not Found');
    err.status = 404;
    php.cgires(path.join(__dirname, "../"), req, res, next);
});

process.on('uncaughtException', function(err) {
    console.log(err);
});

router.route('/loginoauth')
    .get(function(req, res, next) {
        var userData = req.query;
        var param = [];
        for (var i in userData) {
            param.push(i + "=" + userData[i]);
        }
        var url = "?" + param.join("&");
        var request = require('request');
	    var urlencode = encodeURI(url);
	    request(clientConfig["loginoauthUrl"] + urlencode, function (error, response, body) {
            res.send(body);
        });
    });
 router.route("/requestTexture")
     .get(function (req, res, next) {
         var userData = req.query;
         var request = require('request');
         var url = Object.keys(userData)[0];
         res.header("Access-Control-Allow-Origin", "*");
         res.header("Access-Control-Allow-Headers", "X-Requested-With");
         res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
         res.header("X-Powered-By",' 3.2.1');
         res.header("Content-Type", "application/json;charset=utf-8");
         request.get(url).pipe(res);
     });
var wxClient = null;
router.route('/wxGetUserInfo')
    .get(function(req, res) {
        wxClient.getAccessToken(req.query.code, function(err, result) {
console.log("wxget0:"+err);
console.log(JSON.stringify(result));
            var openid = result.data.openid;

            wxClient.getUser(openid, function(err, result) {
                console.log("wxget:" + err);
                res.cookie(clientConfig["cookieName"], JSON.stringify(result));
                res.redirect(clientConfig["shareUrl"]);
            });
        });
    });

router.route('/wxLoginUrl')
    .get(function(req, res) {
        if (!wxClient) {
            wxClient = new OAuth(clientConfig["weixin"]["appId"], clientConfig["weixin"]["appSecret"]);
        }

        var url = wxClient.getAuthorizeURL(clientConfig["weixin"]["authorizeURL"] + "/wxGetUserInfo", "unuse", "snsapi_userinfo");
        res.redirect(url);
    });

router.route('/')
    .get(function(req, res, next) {
        php.cgires(path.join(__dirname, "../"), req, res, next);
    });

router.route('/sms')
    .get(function(req, res, next) {
        var phone = req.param("phone");
        var request = require('request');
        request("http://game.qa4.quwangame.com:18084/registercode?msisdn="+ phone +"&source="+ clientConfig["source"] + "&channel=" + clientConfig["channel"], function (error, response, body) {
            res.send(body);
        });
    });

router.post('/jssdkSign', function (req, res, next) {
    var url = req.param("url");
    var ret = wx.sign(url);
    res.send(ret);
});

router.post('/wechatInfo', function (req, res, next) {
    var openid = req.param('openid');
    var ret = wx.wechatInfo(openid);
    res.send(ret);
});

//设置跨域访问
app.all('*', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
res.header("X-Powered-By",' 3.2.1');
res.header("Content-Type", "application/json;charset=utf-8");
next();
});
