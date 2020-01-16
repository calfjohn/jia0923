/**
 * 取整工具
 * Created by xiaoyj on 2017/11/1.
 * transfer by yifan.jiang on 2018/2/7
 */

window.NP = window.NP || {};

NP.defaultPrecision = 12;

NP.strip = function (num) {
    if(num === undefined) return;
    return +parseFloat(num.toPrecision(NP.defaultPrecision));
};

NP.digitLength = function (num) {
    const eSplit = num.toString().split(/[eE]/);
    const len = (eSplit[0].split('.')[1] || '').length - (+(eSplit[1] || 0));
    return len > 0 ? len : 0;
};

NP.float2Fixed = function (num){
    if (num.toString().indexOf('e') === -1) {
        return Number(num.toString().replace('.', ''));
    }
    const dLen = NP.digitLength(num);
    return dLen > 0 ? num * Math.pow(10, dLen) : num;
};

NP.times = function (num1, num2) {
    const num1Changed = NP.float2Fixed(num1);
    const num2Changed = NP.float2Fixed(num2);
    const baseNum = NP.digitLength(num1) + NP.digitLength(num2);
    const leftValue = num1Changed * num2Changed;

    // if (leftValue > Number.MAX_SAFE_INTEGER || leftValue < Number.MIN_SAFE_INTEGER) {
    //     console.log(leftValue + " is beyond boundary when transfer to integer, the results may not be accurate");
    // }

    return leftValue / Math.pow(10, baseNum);
};

NP.plus = function (num1, num2) {
    const baseNum = Math.pow(10, Math.max(NP.digitLength(num1), NP.digitLength(num2)));
    return (NP.times(num1, baseNum) + NP.times(num2, baseNum)) / baseNum;
};

NP.minus = function(num1, num2) {
    const baseNum = Math.pow(10, Math.max(NP.digitLength(num1), NP.digitLength(num2)));
    return (NP.times(num1, baseNum) - NP.times(num2, baseNum)) / baseNum;
};

NP.divide = function (num1, num2) {
    const num1Changed = NP.float2Fixed(num1);
    const num2Changed = NP.float2Fixed(num2);
    return NP.times((num1Changed / num2Changed), Math.pow(10, NP.digitLength(num2) - NP.digitLength(num1)));
};

NP.round = function (num, ratio) {
    const base = Math.pow(10, ratio);
    return NP.divide(Math.round(NP.times(num, base)), base);
};

NP.formatCurrency = function (num) {
    if(num) {
        //将num中的$,去掉，将num变成一个纯粹的数据格式字符串
        num = this.strip(num);
        num = num.toString().replace(/\$|\,/g,'');
        //如果num不是数字，则将num置0，并返回
        if(''==num || isNaN(num)){return 'Not a Number ! ';}
        //如果num是负数，则获取她的符号
        var sign = num.indexOf("-")> 0 ? '-' : '';
        //如果存在小数点，则获取数字的小数部分
        var cents = num.indexOf(".")> 0 ? num.substr(num.indexOf(".")) : '';
        cents = cents.length>1 ? cents : '' ;//注意：这里如果是使用change方法不断的调用，小数是输入不了的
        //获取数字的整数数部分
        num = num.indexOf(".")>0 ? num.substring(0,(num.indexOf("."))) : num ;
        //如果没有小数点，整数部分不能以0开头
        if('' == cents){ if(num.length>1 && '0' == num.substr(0,1)){return 'Not a Number ! ';}}
        //如果有小数点，且整数的部分的长度大于1，则整数部分不能以0开头
        else{if(num.length>1 && '0' == num.substr(0,1)){return 'Not a Number ! ';}}
        //针对整数部分进行格式化处理，这是此方法的核心，也是稍难理解的一个地方，逆向的来思考或者采用简单的事例来实现就容易多了
        /*
         也可以这样想象，现在有一串数字字符串在你面前，如果让你给他加千分位的逗号的话，你是怎么来思考和操作的?
         字符串长度为0/1/2/3时都不用添加
         字符串长度大于3的时候，从右往左数，有三位字符就加一个逗号，然后继续往前数，直到不到往前数少于三位字符为止
         */
        for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++) {
            num = num.substring(0,num.length-(4*i+3))+','+num.substring(num.length-(4*i+3));
        }
        //将数据（符号、整数部分、小数部分）整体组合返回
        return (sign + num);
    }
    return num.toString();
};
//处理数字，超过某个值的以K为单位
 NP.dealNum = function (num,type) {
     if(num >= type){
         num = NP.numRec(Math.floor(num / 1000)) + "K";
     }
     return num;
 };

  NP.numRec = function(num){
      if(num >= 1000){
          var str = num % 1000 ? num % 1000: "000";
          var y = num % 1000;
          if(!y){//0
              str = "000";
          }else if(y < 10){
              str = "00" + y;
          }else if(y < 100){
              str = "0" + y;
          }else{
              str = y;
          }
          return NP.numRec(Math.floor(num / 1000)) + "," + str;
      }
      return num;
  };

NP.toThousands = function (num) {
    var num = (num || 0).toString(), result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) { result = num + result; }
    return result;
};
