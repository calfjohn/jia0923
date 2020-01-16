/**
 * Created by jialin.he on 17/01/13.
 */


window["logic"]["preload"] = function() {
    var preload = {};
    var clientEvent = null;

    preload.init = function() {
        clientEvent = kf.require("basic.clientEvent");
        this.clientConfig = window["clientConfig"] ? true : false;
        this.preloadLogin = false;
        this.preloadOpenAnim = false;

        this.prefab = false;
        this.planet = false;
        this.loadPlanet = false;

        this.listenReturn = true;
        this.initModule();

        // if (!cc.sys.isNative) {
        //     cc.view.setResizeCallback(function() {
        //         if(document.body.scrollWidth>document.body.scrollHeight){
        //             cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
        //         }else{
        //             cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        //         }
        //     },this);
        // }

        // clientEvent.registerEvent("preloadFinish", function (param) {
        //
        //     // cc.log("----------preloadFinish--------------" + param)
        // }.bind(this));
    };

    preload.initModule = function(){
        kf.require("manager.resource");
        kf.require("ui.manager");
        kf.require("util.network");
        kf.require("util.format");
        kf.require("util.lang");
        if (window.logic) {//// NOTE: 退出游戏就重置所有logic类内缓存数据
            for (var key in window.logic) {
                if (!window.logic.hasOwnProperty(key)) continue;
                kf.require("logic."+key);//call all logic init
            }
        }
    };

    preload.changeListenReturn = function (state) {
        this.listenReturn = state;
    };

    preload.getListenReturn = function () {
        return this.listenReturn;
    };

    preload.fitScreen = function () {
        // if(!cc.sys.isNative) return;

        var winSize = cc.view.getFrameSize();
        var height = Math.min(winSize.height, winSize.width);
        var width = Math.max(winSize.height, winSize.width);
        cc.log("设备分辨率：" + height + " " + width);

        var resolution = cc.find("Canvas").getComponent(cc.Canvas).designResolution;
        var rate1 = resolution.height/resolution.width;
        var rate2 = height/width;
        cc.log("设计比率："+ rate1 + " 设备比率：" + rate2);

        // if(rate2 > rate1){
        //     cc.view.setDesignResolutionSize(resolution.width, resolution.height, cc.ResolutionPolicy.SHOW_ALL);
        //     cc.log("修改分辨率：" + resolution.width + " " + resolution.height);
        // }
    };

    return preload;
};
