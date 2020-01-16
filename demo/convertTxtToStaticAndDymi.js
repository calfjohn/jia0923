window = {}
window["word"] = {}

const keyCode = "key";

var xlsx = require('node-xlsx');
var fs = require('fs');
//读取文件内容  第一行表头 强制第一行表头

var head_key2Idx = {};
var head_idx2Key = {};
var loadHeadFlag = false;

var infoList = [];

var initHead = function (list) {
    var findKey = false;
    for (var i = 0 , len = list.length; i <  len; i++) {
        var key = list[i];
        head_key2Idx[key] = i;
        head_idx2Key[i] = key;
        if (key === keyCode) {
            findKey = true;
        }
    }
    loadHeadFlag = true;
    return findKey;
}

var checkHead = function (list) {
    var keys = Object.keys(head_key2Idx);
    return list.length === keys.length;
}

var parseData = function (excelObj) {
    for (var i = 0 , len = excelObj.length; i <  len; i++) {
        var obj = excelObj[i];
        if (!obj) continue;
        infoList.push(obj);
    }
};

var parseSheet = function (obj) {
    for (var i = 0 , len = obj.length; i <  len; i++) {
        var obj = obj[i];
        var excelObj=obj.data;
        let head = excelObj.splice(0,1);
        if (!loadHeadFlag) {
            if (!initHead(head[0])) {
                console.error("必须有一列表头字段为key")
                return false;
            }
        }else {
            if (!checkHead(head[0])) {
                console.error("不同sheet页表头不一致");
                return false;
            }
        }
        parseData(excelObj);
    }
    return true;
};

var loadFileByName = function (name) {
    var re = {};
    try {
        var dymiTxt = require(__dirname+'/assets/common/scripts/word/'+name+'.js');
        re.dymiTxt = window["word"][name]();
        var staticTxt = require(__dirname+'/assets/common/scripts/word/static/static_'+name+'.js');
        re.staticTxt = window.langCache[name];
    } catch (e) {
        console.error("名为",name,"表格未找到 跳过替换");
        re = null;
    } finally {

    }

    return re;
}

var txtJsContent = {}
var loadTargetFile = function (fileObj) {
    for (var key in fileObj) {
        if (!fileObj.hasOwnProperty(key) || key === keyCode) continue;
        var re = loadFileByName(key);
        if (re) {
            re.dymiTxt = objKeySort(re.dymiTxt);
            re.staticTxt = objKeySort(re.staticTxt);
            txtJsContent[key] = re;
        }
    }
}


var needReWriteFlag = [];
var setRewarite = function (flag) {
    if (needReWriteFlag.indexOf(flag) === -1) {
        needReWriteFlag.push(flag);
    }
}

var replaceLine = function (keyValue) {
    if (keyValue.indexOf("\\n") !== -1 ) {
        var list = keyValue.split("\\n");
        keyValue = list.join("\n");
    }
    return keyValue;
}

var _matchValue = function (obj,keyValue,replaceValue) {
    var isReplace = false;
    keyValue = replaceLine(keyValue);

    for (var moduleKey in obj) {
        if (!obj.hasOwnProperty(moduleKey)) continue;
        var contentObj = obj[moduleKey];
        for (var path in contentObj) {
            if (!contentObj.hasOwnProperty(path)) continue;
            if (contentObj[path] === keyValue) {
                contentObj[path] = replaceLine(replaceValue);
                isReplace = true;
            }
        }

    }
    return isReplace;
}

var replaceTxt = function (name,keyValue,replaceValue) {//进行本地内容替换
    if (!txtJsContent[name]) return;
    var content = txtJsContent[name];
    for (var txtType in content) {
        if (!content.hasOwnProperty(txtType)) continue;
        var obj = content[txtType];
        if (_matchValue(obj,keyValue,replaceValue)) {
            setRewarite(name);
        }
    }

}

var writeData = function () {
    var keyIdx = head_key2Idx[keyCode];
    for (var i = 0 , len = infoList.length; i <  len; i++) {
        var list = infoList[i];
        var keyValue = list[keyIdx];//关键字 作为查找索引
        for (var j = 0 , jlen = list.length; j <  jlen; j++) {
            var replaceValue = list[j];
            var name = head_idx2Key[j];
            if (name !== keyCode) {
                replaceTxt(name,keyValue,replaceValue);
            }
        }
    }
};

var write2File = function (txtType,jsonData,name) {
    switch (txtType) {
        case "dymiTxt":
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
            break;
        case "staticTxt":
            var str = JSON.stringify(jsonData,null,'\t');
            str = "window.langCache = window.langCache || {};\nwindow.langCache[\""+name+"\"] = "+ str;
            fs.writeFile(__dirname+'/assets/common/scripts/word/static/static_'+name+'.js', str, {flag: 'w'}, function (err) {
                if(err) {
                console.error(err);
                }
            });
            break;

    }
}

var writeFile = function () {
    for (var i = 0 , len = needReWriteFlag.length; i <  len; i++) {
        var name = needReWriteFlag[i];
        var content = txtJsContent[name];
        for (var txtType in content) {
            var jsonObj = content[txtType];
            write2File(txtType,jsonObj,name);
        }
    }
};

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

    var path = '\\tools\\txt.xls';
    var obj = xlsx.parse(__dirname+path);
    if (!parseSheet(obj)) {//解析excel
        return
    }

    loadTargetFile(head_key2Idx);//加载目标js
    writeData();//写入缓存对象
    writeFile();//写会文件
    var re = "";
    for (var i = 0 , len = needReWriteFlag.length; i <  len; i++) {
        var obj = needReWriteFlag[i];
        re += (obj +",");
    }
    console.log("已修改语种->",re);
}
//////////////行数入口
main();

// console.log(infoList);
