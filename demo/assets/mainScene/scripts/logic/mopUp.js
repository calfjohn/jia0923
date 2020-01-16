/**
 * @Author: lich
 * @Date:   2018-07-26T09:45:08+08:00
 * @Last modified by:
 * @Last modified time: 2018-09-18T14:14:03+08:00
 */

window["logic"]["mopUp"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var treasureLogic = null;
    var chapterLogic = null;
    var userLogic = null;

    module.init = function(){
        this.initModule();
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){

    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        treasureLogic = kf.require("logic.treasure");
        chapterLogic = kf.require("logic.chapter");
        userLogic = kf.require("logic.user");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_ChapterMopUp", this.onResp_ChapterMopUp.bind(this));//// 响应客户端副本扫荡
    };

    //客户端副本扫荡  id -->章节id
    module.req_ChapterMopUp = function(id){
        var data = {
            "Req_ChapterMopUp":{
                "ID":id
            }
        };
        network.send(data,true);
    };
    module.onResp_ChapterMopUp = function (param) {//// 响应客户端副本扫荡
        if (!param.ChestInfo) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("errorcode","errorcode105"));
        }
        treasureLogic.setShowData(param.ChestInfo);
        uiManager.openUI(uiManager.UIID.GETBOXANI);
        userLogic.setBaseData(userLogic.Type.Vit,param.Vit);
        clientEvent.dispatchEvent("refreshAchievementPanel",0);
        // uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("mopUp","getBox"));
    };
    /** 获取扫荡列表 */
    module.getMopUpList = function () {
        var chapterList = chapterLogic.getChapterStateList();
        var list = [];
        var keys = Object.keys(chapterList);
        keys = keys.sort(function(a,b){return Number(a)- Number(b)});
        for (var i = 0 , len = keys.length; i < len; i++) {
            var key = keys[i];
            var obj = chapterList[key];
            if (!obj.MopUpVit && obj.MopUpVit !== 0) continue;
            list.push(obj);
        }
        list.sort(function(a,b){
            if (a.MopUpVit && b.MopUpVit) {
                return  b.ID - a.ID;
            }else {
                if (a.MopUpVit) return -1;
                if (b.MopUpVit) return 1;
            }

        });
        return list;
    };


    return module;
};
