/**
 * Created by zhangwei on 2015/9/22.
 */

window["logic"]["time"] = function() {

    var SECONDS_PER_DAY = 24 * 3600;


    var Long = dcodeIO.Long;

    /* 目前服务器返回的就是东8区的时间，本地取的时间也是东8区，应该不需要加偏移量
     * - 服务器的当前时间是在login时通过SyncTime设置进来的
     * - login从服务器得到的时间是东8区的时间
     */
    var TIME_ZONE_OFFSET = 0;// 3600 * 8;

    var time = {};

    time.init = function() {
        // 这个 time 是秒数
        // this.currentTime = new Date().getTime();
        this.deltaTime = 0;
        this.timeZoneOffset = TIME_ZONE_OFFSET;
        this.hideTime = 0;
        this.showTime = 0;
        cc.game.on(cc.game.EVENT_HIDE, function(event){
            //某些平台多次调用前后台切换，导致出错，此时直接返回
            if(this.hideTime !== 0) return;

            //保护回调只计算一次时间
            this.hideTime = new Date().getTime();
        }.bind(this));
        cc.game.on(cc.game.EVENT_SHOW, function(event){
            //某些平台不支持前后台切换，导致出错，此时直接返回
            if(this.hideTime === 0) return;

            this.showTime = new Date().getTime();
            cc.log("后台:" + this.hideTime + " 前台:" + this.showTime);
            var delta = this.getOffLineTime();
            cc.log("delta:" + delta);
            //原生环境下切后台回来会打开音乐
            var config = kf.require("util.configuration").getConfigData("bgVolume");
            var musicStatus = config !== undefined?config:constant.SettingStatus.OPEN;
            kf.require("basic.clientEvent").dispatchEvent("updateVolume",musicStatus);
        }.bind(this));
    };

    //返回服务器上的utc时间; 单位秒
    time.now = function() {
        var currentTime = new Date().getTime() / 1000 - this.deltaTime;
        return currentTime;
    };

    time.now64 = function() {
        var currentTime = new Date().getTime() / 1000 - this.deltaTime;
        var value = new Long(currentTime, 0, false);
        return value;
    };

    //设置本地与服务器的时间差
    time.setDeltaTime = function (serverTime) {
        this.deltaTime = new Date().getTime() / 1000 - (serverTime - 0);
    };

    time.syncTime = function(timeZone) {
        // this.currentTime = new Date().getTime() / 1000 - this.deltaTime;

        if (timeZone) {
            this.timeZoneOffset = timeZone * 3600;
        } else {
            this.timeZoneOffset = TIME_ZONE_OFFSET;
        }
    };

    time.getDurationToNextDay = function() {
        var currentTime = this.now();

        var utc8 = new Date(currentTime + TIME_ZONE_OFFSET);
        var startTime = utc8.getHours() * 3600 + utc8.getMinutes() * 60 + utc8.getSeconds();

        return SECONDS_PER_DAY - startTime;
    };

    time.getDurationToFixedTime = function(fixedTime) {
        var currentTime = this.now();
        return fixedTime - currentTime;
    };

    time.getDaysBySeconds = function(seconds) {
        return Math.floor(seconds / SECONDS_PER_DAY);
    };

    //把天数转化成秒
    time.getSecondsFromDays = function(days) {
        return days * SECONDS_PER_DAY;
    };

    time.getDateInfo = function(time) {
        return new Date(time);
    };

    /**
     * 获取当天0点时间
     * @param time
     * @returns {number}
     */
    time.getCurDayZero = function (time) {
        const zeroDate = new Date(new Date(time * 1000).toLocaleDateString()).getTime();
        const zeroTime = zeroDate / 1000;
        return zeroTime;
    };

    // time.kfUpdate = function(elapsedTime) {
    //     this.currentTime = this.currentTime + elapsedTime;
    // };

    time.parsetZeroStr = function(value) {
        var result = "";
        if (value < 10) {
            result = "0";
        }

        return result + value;
    };

    time.getOffLineTime = function () {
        //某些平台不支持前后台切换，导致offlineTime出错，此时直接返回0
        var delta = (this.showTime - this.hideTime)/1000;
        if(delta < 0){
            delta = 0;
        }
        this.showTime = 0;
        this.hideTime = 0;

        return delta;
    };

    /** 获取通用的倒计时时间 */
    time.getCommonCoolTime = function(value)   {
        var deadLine = value * 1000;
        if(deadLine < 0) return "00:00:00";
        var day = Math.floor(deadLine/86400000);
        var hour = Math.floor((deadLine - day*86400000)/3600000);
        var min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        var sencond = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);

        var hourStr = this.parsetZeroStr(day * 24 + hour);
        min = this.parsetZeroStr(min);
        sencond = this.parsetZeroStr(sencond);
        return hourStr + ":" + min + ":" + sencond;
    };

    /** 获取通用的倒计时时间 只显示分钟和秒 00：00 */
    time.getCommon1CoolTime = function(value)   {
        var deadLine = value * 1000;
        if(deadLine < 0) return "00:00:00";
        var day = Math.floor(deadLine/86400000);
        var hour = Math.floor((deadLine - day*86400000)/3600000);
        var min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        var sencond = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);

        // var hourStr = this.parsetZeroStr(day * 24 + hour);
        min = this.parsetZeroStr((day * 24 + hour) * 60 + min);
        sencond = this.parsetZeroStr(sencond);
        return min + ":" + sencond;
    };

    /** 获取通用的倒计时时间 只显示时和分 00：00 */
    time.getCommon2CoolTime = function(value)   {
        var deadLine = value * 1000;
        if(deadLine < 0) return "00:00";
        var day = Math.floor(deadLine/86400000);
        var hour = Math.floor((deadLine - day*86400000)/3600000);
        var min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        var sencond = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);

        var hourStr = this.parsetZeroStr(hour);
        min = this.parsetZeroStr(min);
        // sencond = this.parsetZeroStr(sencond);
        return hourStr + ":" + min;
    };
    /** 获取通用的时间 2020年01月02日 */
    time.getNowFormatDate = function(value) {
        var date = new Date(value * 1000);
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + uiLang.get("year") + month + uiLang.get("month") + strDate + uiLang.get("days");
        return currentdate;
    }

    /** 获取通用邮件总时长样式 */
    time.getMailAllTime = function(deadLine){
        if(deadLine <= 0) return  uiLang.get("low") + 1 + uiLang.get("day");
        var day = Math.floor(deadLine/86400);
        var re = "";
        if (day >= 1) {
            re =day + uiLang.get("day");
        }else{
            re =uiLang.get("low") + 1 + uiLang.get("day");
        }
        return re;
    };

    /** 获取通用总时长样式 */
    time.getCommonAllTime = function(value){
        var deadLine = value * 1000;

        if(deadLine <= 0) return  "0" + uiLang.get("second");
        var day = Math.floor(deadLine/86400000);
        var hour = Math.floor((deadLine - day*86400000)/3600000);
        var min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        var sencond = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);

        var re = "";
        if (day > 0) {
            re = re + day + uiLang.get("day");
        }
        if (hour > 0) {
            re = re + hour + uiLang.get("hour");
        }
        if (min > 0) {
            re = re + min + uiLang.get("minute");
        }
        if (sencond > 0) {
            re = re + sencond + uiLang.get("second");
        }
        return re;
    };

    //通用数字形式
    time.getCommonStyle = function (value) {
        var deadLine = value * 1000;

        if(deadLine <= 0) return  "0";
        var day = Math.floor(deadLine/86400000);
        var hour = Math.floor((deadLine - day*86400000)/3600000);
        var min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        var sencond = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);

        var re = "";
        if (day > 0) {
            return day;
        }
        if (hour > 0) {
            return hour;
        }
        if (min > 0) {
            return min;
        }
        return "0";
    };
    //通用数字形式单位
    time.getCommonStyleUnit = function (value) {
        var deadLine = value * 1000;
        if(deadLine <= 0) return uiLang.get("second");
        var day = Math.floor(deadLine/86400000);
        var hour = Math.floor((deadLine - day*86400000)/3600000);
        var min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        var sencond = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);
        if (day > 0) {
            return uiLang.get("day");
        }
        if (hour > 0) {
            return uiLang.get("hour");
        }
        if (min > 0) {
            return uiLang.get("minute");
        }
        return uiLang.get("day");
    };

    time.isSingularDay = function () {
        var day = new Date(this.now() * 1000).getDate();
        return  day % 2;
    };


    time.getChatTime = function(value){
        var str = "";
        var deadLine = value * 1000;
        if (new Date(deadLine).toDateString() !== new Date(this.now() * 1000).toDateString()) {//不是今天
            str+= new Date(deadLine).toLocaleDateString() +" ";
        }
        var date = new Date(deadLine);
        var hour =  date.getHours();
        var min = date.getMinutes();
        var sencond =date.getSeconds();
        str += hour < 10?"0" + hour:hour;
        str += min < 10?":" + "0" + min:":" + min;
        str += sencond < 10?":" + "0" + sencond:":" + sencond;
        return str;
    };

    time.isToday = function(value){
        var deadLine = value * 1000;
        return  new Date(deadLine).toDateString() === new Date(this.now() * 1000).toDateString();
    };
    //获取几天，向上取整
    time.getDayTime = function (value) {
        var nowDate = new Date(this.now() * 1000);
        var time = new Date(nowDate.setHours(0, 0, 0, 0)) / 1000;//获取我登陆时凌晨的世界戳
        var count = value - time;
        var day = Math.floor(count/86400) - 1;
        return day;
    };

    // 获取通用的短时间样式， 剩余几天，剩余几小时，剩余几分钟，剩余几秒中的一种
    time.getCommonShortTime = function (value) {
        let deadLine = value * 1000;

        if(deadLine < 1000) return ['0', uiLang.get('second')];
        let day = Math.floor(deadLine/86400000);
        let hour = Math.floor((deadLine - day*86400000)/3600000);
        let min = Math.floor((deadLine - day*86400000 - hour*3600000)/60000);
        let second = Math.floor((deadLine - day*86400000 - hour*3600000 - min*60000)/1000);

        let re = [];
        if (day > 0) {
            re.push(day);
            re.push(uiLang.get("day"));
        } else if (hour > 0) {
            re.push(hour);
            re.push(uiLang.get("hour"));
        } else if (min > 0) {
            re.push(min);
            re.push(uiLang.get("minute"));
        } else{
            re.push(second);
            re.push(uiLang.get("second"));
        }
        return re;
    };

	// 获取通用的短时间样式， 剩余几天
    time.getCommonShortDay = function (value) {
        let deadLine = value * 1000;

        if(deadLine < 1000) return ['0', uiLang.get('second')];
        let day = Math.ceil(deadLine/86400000);
        let re = [];
        if (day > 0) {
            re.push(day);
            re.push(uiLang.get("day"));
        }
        return re;
    };

    return time;
};
