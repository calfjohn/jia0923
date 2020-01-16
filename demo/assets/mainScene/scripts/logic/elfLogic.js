/**
 * @Author: jyf
 * @Date:   2019-2-20T17:26:50+08:00
 * @Last modified by:
 * @Last modified time: 2019-2-20T17:26:50+08:00
 */

window["logic"]["elf"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var userLogic = null;
    var timeLogic = null;
    var worldBossLogic = null;
    var mineLogic = null;
    var areanLogic = null;
    var _EVENT_TYPE = [
        "elfGuideFunc",
        "reInitEfl"
    ];

    module.init = function(){
        this.initModule();
        this.updateTime = 0;
        this.curGuideTime = 0;
        clientEvent.addEventType(_EVENT_TYPE);
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        userLogic =kf.require("logic.user");
        timeLogic = kf.require("logic.time");
        worldBossLogic = kf.require("logic.worldBoss");
        mineLogic = kf.require("logic.mine");
        areanLogic = kf.require("logic.arean");
    };

    //设置当前引导次数
    module.setCurGuideTimes = function (times) {
        userLogic.setFlagInfo(userLogic.Flag.ElfGuideTimes,[times]);//修改本地缓存
        var key = [userLogic.Flag.ElfGuideTimes];
        userLogic.saveFlagInfo2Server(key);//修改远端
    };

    //获取当前引导次数
    module.getCurGuideTimes = function () {
        return userLogic.getFlagInfoOneFlag(userLogic.Flag.ElfGuideTimes);
    };

    //设置当前引导索引
    module.setCurGuideIdx = function (idx) {
        userLogic.setFlagInfo(userLogic.Flag.ElfGuideIdx,[idx]);//修改本地缓存
        var key = [userLogic.Flag.ElfGuideIdx];
        userLogic.saveFlagInfo2Server(key);//修改远端
    };

    //获取当前引导索引
    module.getCurGuideIdx = function () {
        var idx = userLogic.getFlagInfoOneFlag(userLogic.Flag.ElfGuideIdx);
        return idx;
    };

    //重置引导间隔
    module.resetGuideTime = function () {
        this.curGuideTime = 0;
    };

    //获取当前间隔
    module.getCurInterverTime = function () {
        this.elfGuideTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ElfGuideTime);
        var curGuideTimes = this.getCurGuideTimes();
        var interval = 0;
        this.elfGuideNum = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ElfGuideNum);
        for (var i = 0; i < this.elfGuideNum.length; i++) {
            var obj = this.elfGuideNum[i];
            if(curGuideTimes<obj) continue;
            interval = this.elfGuideTime[i];
            break;
        }
        return interval;
    };

    //获取当前应引导的功能索引
    module.getCurGuideFuncIdx = function () {
        var table = jsonTables[jsonTables.TABLE.ELFGUIDE];

        var curGuideIdx = 0;
        for (var i = 0; i < table.length; i++) {
            var canGuideIdx = this.getCanGuideFuncIdx(table, i);
            if(canGuideIdx === -1) continue;
            curGuideIdx = canGuideIdx;
            break;
        }
        return curGuideIdx;
    };

    //获取当前可引导的功能索引
    module.getCanGuideFuncIdx = function (table, curGuideIdx) {
        var nextGuideIdx = curGuideIdx + 1;
        if(nextGuideIdx > table.length)
            nextGuideIdx = 1;
        var funcType = table[nextGuideIdx - 1][jsonTables.CONFIG_ELFGUIDE.Type];

        var canGuide = false;
        switch (funcType) {
            case tb.ELF_GUIDE_NO:
                break;
            case tb.ELF_GUIDE_ARENA:
                if(!jsonTables.funOpenCheck(constant.FunctionTid.AREAN)) break;
                var areanInfo = areanLogic.getAreanTimeInfo();
                var areanInOpen = areanInfo.OpenTime.toNumber() === -1 || (areanInfo.OpenTime.toNumber() <= timeLogic.now() && areanInfo.CloseTime.toNumber() > timeLogic.now());
                if(!areanInOpen) break;
                canGuide = true;
                break;
            case tb.ELF_GUIDE_BOSS:
                if(!jsonTables.funOpenCheck(constant.FunctionTid.WORLD_BOSS)) break;
                if(worldBossLogic.getHitBossTimes() === 0) break;
                if(!worldBossLogic.getHasBoss()) break;
                if(worldBossLogic.getBossInfo().Bosses.CurHp === 0) break;
                canGuide = true;
                break;
            case tb.ELF_GUIDE_MINE:
                if(!jsonTables.funOpenCheck(constant.FunctionTid.MINE)) break;
                if(mineLogic.getHasPlunderNum() === 0) break;
                canGuide = true;
                break;
        }

        if(!canGuide) return -1;
        return nextGuideIdx;
    };

    //检查是否触发guide
    module.checkGuideTime = function () {
        // var interval = this.getCurInterverTime();
        // if(this.curGuideTime<interval) return;
        // this.curGuideTime = 0;
        // var curGuideIdx = this.getCurGuideFuncIdx();
        // if(curGuideIdx === 0) return;
        // this.setCurGuideIdx(curGuideIdx);
        // clientEvent.dispatchEvent("elfGuideFunc");
    };

    module.update = function (dt) {
        // this.updateTime += dt;
        // this.curGuideTime += dt;
        // if(this.updateTime <= 1) return;
        // this.updateTime = 0;
        // this.checkGuideTime();
    };

    return module;
};
