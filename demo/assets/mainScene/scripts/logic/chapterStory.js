/**
 * @Author: lich
 * @Date:   2018-07-31T13:51:08+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-07-31T13:51:46+08:00
 */

window["logic"]["chapterStory"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var chapterLogic = null;
    var userLogic = null;

    module.TOGGLE_ENUM = {
        ENTER:1,//进入章节
        CLICK:2,//点击章节 人物
        FIGHT_END:3,//战斗结束后
        SHOWS_SANDBOX:4,//展示沙盘
    };

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
        chapterLogic = kf.require("logic.chapter");
        userLogic = kf.require("logic.user");
    };

    module.registerMsg = function() {
    };
    /** 检查是否触发了 */
    module.checkToggle = function (type,chapterID,ext,callBack) {
        if (callBack) callBack();//在20191212删除故事表格，弃用
        return;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.STORY,chapterID);
        if (this.isShowed(type,chapterID,ext) || !config){
            if (callBack) callBack();
            return;
        }
        var list = [];
        switch (type) {
            case this.TOGGLE_ENUM.ENTER:
                list = config[jsonTables.CONFIG_STORY.EnterToggle] ;
                break;
            case this.TOGGLE_ENUM.CLICK:
                if (config["monster"+ ext +"ID"]) {
                    list = config["monster"+ ext +"ID"];
                }
                break;
            case this.TOGGLE_ENUM.FIGHT_END:
                if ( chapterLogic.isPassChapterOneIdx(chapterID,ext) && config["monster"+ ext + "Winner"]) {
                    list = config["monster"+ ext + "Winner"];
                }
                break;
            case this.TOGGLE_ENUM.SHOWS_SANDBOX:
                if (config["monster"+ ext + "Sand"]) {
                    list = config["monster"+ ext + "Sand"];
                }
                break;
        }
        if (list && list.length > 0 && list[0] !== 0) {
            this.addShowFlag(type,chapterID,ext);
            uiManager.openUI(uiManager.UIID.STORY_TALK,list,function(){
                // TODO: 表演完了
                if (callBack) callBack();
                cc.log("story,done")
            })
        }else {
            if (callBack) callBack();
        }
    };
    /** 是否展示过 */
    module.isShowed = function (type,chapterID,ext) {
        var maxList = userLogic.getFlagInfo(userLogic.Flag.ChapterMaxStroy);
        if (maxList.length > 0) {
            var maxChapterID = maxList[0];
            if (chapterID <= maxChapterID) return true;//如果比他小说明一定已经展示过了
        }
        var showList = userLogic.getFlagInfo(userLogic.Flag.ChapterStory);
        switch (type) {
            case this.TOGGLE_ENUM.ENTER:
                return kf.inArray(showList,-1);
            case this.TOGGLE_ENUM.CLICK:
                return kf.inArray(showList,ext);
            case this.TOGGLE_ENUM.FIGHT_END:
                return kf.inArray(showList,-1 * ext);
            case this.TOGGLE_ENUM.SHOWS_SANDBOX:
                return kf.inArray(showList,50000 + ext);
        }
        return true;
    };

    module.addShowFlag = function (type,chapterID,ext) {
        var key = [userLogic.Flag.ChapterStory];
        switch (type) {
            case this.TOGGLE_ENUM.ENTER:
                userLogic.pushFlagInfo(userLogic.Flag.ChapterStory,-1);
                break;
            case this.TOGGLE_ENUM.CLICK:
                userLogic.pushFlagInfo(userLogic.Flag.ChapterStory,ext);
                break;
            case this.TOGGLE_ENUM.SHOWS_SANDBOX:
                userLogic.pushFlagInfo(userLogic.Flag.ChapterStory,50000 + ext);
                break;
            case this.TOGGLE_ENUM.FIGHT_END:
                if (chapterLogic.isPassChapter(chapterID)) {
                    userLogic.setFlagInfo(userLogic.Flag.ChapterMaxStroy,[chapterID]);
                    userLogic.setFlagInfo(userLogic.Flag.ChapterStory,[]);
                    key.push(userLogic.Flag.ChapterMaxStroy);
                }else{
                    userLogic.pushFlagInfo(userLogic.Flag.ChapterStory,ext*-1);
                }
                break;
        }
        userLogic.saveFlagInfo2Server(key);
    };

    return module;
};
