window = {}
window["word"] = {}

const keyCode = "zh";

var fs = require('fs');
//读取文件内容  第一行表头 强制第一行表头

var targets = ["cn","en"];
var infoDict = {};
var modeDict = {};
var loadFileByName = function (name) {
    var re = {};
    try {
        var dymiTxt = require(__dirname+'/assets/common/scripts/word/'+name+'.js');
        re = window["word"][name]();
    } catch (e) {
        console.error("名为",name,"表格未找到 跳过替换");
        re = null;
    } finally {

    }
    return re;
}

var write2File = function (jsonData,name) {
    var str ='window["word"]["'+name+'"] = function() {\n\tvar lanStr = {};\n';
    var lanStr = {};
    for (var variable in jsonData) {
        if (!jsonData.hasOwnProperty(variable)) continue;
        str = str + '\tlanStr["'+variable+'"] = ' + JSON.stringify(jsonData[variable],null,'\t\t') + ";\n";
    }
    str = str + '\treturn lanStr;\n};'
    fs.writeFile(__dirname+'/assets/common/scripts/word/'+name+'.js', str , {flag: 'w'}, function (err) {
        if(err) {
            console.error(err);
        }
    });
}

var replaceData = function (src,des) {
    for (var prefabName in src) {
        if (!src.hasOwnProperty(prefabName)) continue;
        if (!des[prefabName]) {
            des[prefabName] = src[prefabName];
        }else {
            var keys = Object.keys(des[prefabName]);
            for (var path in src[prefabName]) {
                if (!src[prefabName].hasOwnProperty(path)) continue;
                des[prefabName][path] = src[prefabName][path];
                var idx = keys.indexOf(path);
                if (idx !== -1) {
                    keys.splice(idx,1)
                }
            }
            for (var i = 0 , len = keys.length; i <  len; i++) {
                var obj = keys[i];
                delete des[prefabName][obj];
            }
        }
    }
}
var objKeySort = function(arys) {
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newkey = Object.keys(arys).sort();　　
    //console.log('newkey='+newkey);
    var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
    for(var i = 0; i < newkey.length; i++) {
        //遍历newkey数组
        newObj[newkey[i]] = arys[newkey[i]];
        //向新创建的对象中按照排好的顺序依次增加键值对

    }
    return newObj; //返回排好序的新对象
}

var main = function () {
    modeDict = loadFileByName(keyCode);
    if (!modeDict) {
        return console.error("找不到基础表格")
    }
    modeDict = objKeySort(modeDict);
    write2File(modeDict,keyCode);

    for (var i = 0 , len = targets.length; i <  len; i++) {
        var obj = targets[i];
        var re = loadFileByName(obj);
        if (!re) continue;
        replaceData(modeDict,re);
        re = objKeySort(re);
        write2File(re,obj);
    }
}
//////////////行数入口
main();

// console.log(infoList);
