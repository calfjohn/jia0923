/**
 * 字符串转化工具
 * Created by guozs on 2017/9/20.
 * transfer by yifan.jiang on 2018/2/7
 */
window["util"]["format"] = function() {
    var format = {
        showRules: {
            bit: 4, //有效位
            rules: [
                {unit: "",  pow: 1},
                {unit: "k", pow: 3},
                {unit: "M", pow: 6},
                {unit: "B", pow: 9},
                {unit: "T", pow: 12}
            ]
        }
    };

    format.init = function () {
        //string新增接口:接收Array参数格式化
        String.prototype.formatArray = function(args) {
            if (args.length>0) {
                var result = this;
                if (args.length == undefined && typeof (args) == "object") {
                    for (var key in args) {
                        var reg=new RegExp ("({"+key+"})","g");
                        result = result.replace(reg, args[key]);
                    }
                }
                else {
                    for (var i = 0; i < args.length; i++) {
                        if(args[i]==undefined)
                        {
                            return "";
                        }
                        else
                        {
                            var reg=new RegExp ("({["+i+"]})","g");
                            result = result.replace(reg, args[i]);
                        }
                    }
                }
                return result;
            }
            else {
                return this;
            }
        };

        //string新增接口:接收可变参数格式化
        String.prototype.format = function(args) {
            if (arguments.length>0) {
                var result = this;
                if (arguments.length == undefined && typeof (arguments) == "object") {
                    for (var key in arguments) {
                        var reg=new RegExp ("({"+key+"})","g");
                        result = result.replace(reg, arguments[key]);
                    }
                }
                else {
                    for (var i = 0; i < arguments.length; i++) {
                        if(arguments[i]==undefined)
                        {
                            return "";
                        }
                        else
                        {
                            var reg=new RegExp ("({["+i+"]})","g");
                            result = result.replace(reg, arguments[i]);
                        }
                    }
                }
                return result;
            }
            else {
                return this;
            }
        };
    };

    /**
     * 有个坑：1999/10 = 199.9，若是19.99*10 = 199.8999999
     * 返回带单位的字符串,不四舍五入,每个区间特定实数位显示
     * @param num
     * @returns {*} 字符串，为了避免JSB转换时，在原生环境下把返回值识别为Number类型，出现浮点显示错误
     */
    format.convertNumber = function (num) {
        if(num === 0) return "0";
        if(!num) return "";
        var numLen = Math.floor(num).toString().length; //es6 可通过Math.ceil(Math.log10(num))得出位数
        var unitIndex = Math.max(0, Math.ceil((numLen - 4) / 3));
        if (numLen <= 1) {
            return (Math.floor(NP.strip(NP.strip(num) * 100)) / 100).toString();
        }else {
            var temp = Math.pow(10, numLen - 4);
            var temp2 = 4;
            if (unitIndex === 0) {
                temp2 = 3;
            }
            var fixDec = Math.pow(10, temp2 - numLen + this.showRules.rules[unitIndex].pow)
            temp = (num / temp) / fixDec;
            temp = NP.strip(temp);
            return Math.floor(NP.strip(temp * fixDec)) / fixDec + this.showRules.rules[unitIndex].unit;
        }
    };

    /**
     * fmt为可变参数,例子:aaaa{0}bbbbb{1}
     * args为可变参数列表
     * 使用例子:formatString("你来自{0}省{1}市", "福建", "厦门");
     * @param fmt
     * @param args
     */
    format.formatString = function (fmt, args) {
        var tmpArgs = Array.prototype.slice.call(arguments);
        return fmt.formatArray(tmpArgs.slice(1));
    };

    /**
     * 返回特定小数位数的四舍五入
     * @param  {int} num     需要被处理的数字
     * @param  {int} decimal 制定小数后几位
     * @return {int}         返回四舍五入数
     */
    format.round = function(num,decimal){
        var tenNum = Math.pow(10,decimal);
        return (Math.round(num*tenNum)/tenNum).toFixed(decimal);
    };

    return format;
};
