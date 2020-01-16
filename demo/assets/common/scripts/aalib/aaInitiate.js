/**
 * Created by calf on 16/10/17.
 * 1 initiate module and wechat callback
 * 2 check if login through wechat or not
 */
 window.lichTool = window.lichTool || {};

lichTool.getCookie = function(name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

    if(arr=document.cookie.match(reg))
        return decodeURIComponent(arr[2]);
    else
        return null;
}

//分享回调函数
lichTool.onMenuShareTimeline = function () {
    wx.onMenuShareTimeline({
        title: window["clientConfig"]["shareTitle"],
        link: window["clientConfig"]["shareUrl"],
        imgUrl: window["clientConfig"]["shareIcon"],
        trigger: function (res) {
            //alert('用户点击分享到朋友圈' + JSON.stringify(res));
        },
        success: function (res) {
            //alert('已分享' + JSON.stringify(res));
            notifyShareSuccess();
        },
        cancel: function (res) {

        },
        fail: function (res) {
            //alert(JSON.stringify(res));
        }
    });
}

//分享成功回调函数
lichTool.notifyShareSuccess = function () {
    var loginInfo = getCookie("loginFishInfo");
    if(!loginInfo) return;
    loginInfo = JSON.parse(loginInfo);
    var roleid = userInfo["id"];
    if(!roleid) return;

    $.ajax({
        type: "post",
        url: window["clientConfig"]["shareCallbackUrl"],
        data: {action: "share", roleid: roleid},
        dataType: "json"
    });
}

lichTool.isWeixinBrowser = function (){
    return cc.sys.isBrowser && (/MicroMessenger/i).test(window.navigator.userAgent);
}

lichTool.isAndroidBrowser = function () {
    return cc.sys.isBrowser && (/Android/i).test(window.navigator.userAgent);
}

//处理微信登录
lichTool.checkIfWxLogin = function (data) {
    if (window.g_xxtea) {
        data = window.g_xxtea.xxtea_decrypt(data);
        data = JSON.parse(data);
    }

    if(!isWeixinBrowser()) return;
    var userInfo = getCookie(window["clientConfig"]["cookieName"]);
    if(userInfo === null) {
        //没有cookie，说明还没有微信登录或者登录失效，所以先去登录微信
        // window.location.href = "../wxLoginUrl";
    }

    //注册微信分享监听函数
    $.ajax({
        type: "post",
        url: "/jssdkSign",
        data: {"url": window.location.href.split('#')[0]},
        dataType: "json",
        success: function(data){
            if(data){
                var config = {
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: [
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage'
                    ]
                };
                wx.config(config);
                wx.ready(function () {
                    //添加分享朋友圈监听
                    onMenuShareTimeline();
                });
                wx.error(function(res) {
                    console.log('JSSDK初始化失败：' + res);
                });

            } else{
                console.log('获取JSSDK签名失败');
            }
        }
    });
}

window.g_xxtea = null;
if (true) {
    // window.g_xxtea = new Xxtea("ProtoBuf");//打开加密,关闭不加密
}

window["game"] = window["game"] || {};
window["basic"] = window["basic"] || {};
window["word"] = window["word"] || {};
window["util"] = window["util"] || {};
window["logic"] = window["logic"] || {};
window["ui"] = window["ui"] || {};
window["manager"] = window["manager"] || {};
window["clientConfig"] = window["clientConfig"] || {};
window["fight"] = window["fight"] || {};

// if(cc.sys.isBrowser){//// NOTE: 这里为了wx登陆保留
//     cc.loader.load("res/raw-assets/resources/config.json", function (err, data) {
//         for (var key in data) {
//             if (!data.hasOwnProperty(key)) continue;
//              window["clientConfig"][key] = data[key];
//         }
//         lichTool.checkIfWxLogin(data);
//     });
// }
