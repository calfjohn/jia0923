
var fs = require('fs');
var fontSize = -14;//百分比
var lineHeight = 30;
var typeKey = "__type__";
var typeName = "cc.Label";
var fontKey = "_N$file";
var uuid = "__uuid__";
var actualFontSize = "_actualFontSize";
var fontSizeKey = "_fontSize";
var lineHeightKey = "_lineHeight";
var overflowKey = "_N$overflow";
var fontUUID1_zh = "757d2356-86c0-4f98-bf2a-f04195a9d372";
var fontUUID2_zh = "31383bbb-35df-4e48-9a04-e286087d33eb";
var fontUUID1_cn = "b957b09a-894c-456d-b8be-497f699abc13";
var fontUUID2_cn = "2e8274d1-48a3-493b-b8cc-c92162a1f5d3";
var filePath = __dirname + "\\assets";

fileRoots = [];
const fileEndWith = "prefab";
var readDirSync = function (path){
	var pa = fs.readdirSync(path);
	pa.forEach(function(ele,index){
		var info = fs.statSync(path+"/"+ele)
		if(info.isDirectory()){
			readDirSync(path+"/"+ele);
		}else{
            if (!ele.endsWith("prefab") && !ele.endsWith("scene")) {
                return;
            }
            fileRoots.push(path+"/"+ele);
		}
	}.bind(this))
}

var readFileSync = function () {
    if(fileRoots.length <= 0)  return  console.log("修改结束");
    var fileP = fileRoots.shift();
    var data = JSON.parse(fs.readFileSync(fileP, 'utf8'));
    for (var i = 0 , len = data.length; i < len; i++) {
        var obj = data[i];
        if(obj[typeKey] === typeName && obj[fontKey]&& obj[fontKey][uuid]){//是label组件,并且有字体
            if(obj[fontKey][uuid] === fontUUID1_zh){//是要找的两个字体
				data[i][fontSizeKey] = Math.floor(obj[fontSizeKey] + obj[fontSizeKey] * fontSize / 100);
                // data[i][lineHeightKey] = lineHeight;
				// if(obj[overflowKey] === 2){
				// 	data[i][fontSizeKey] = Math.floor(obj[fontSizeKey] + obj[fontSizeKey] * fontSize / 100);
				// 	data[i][actualFontSize] = data[i][fontSizeKey];
				// }
				// obj[fontKey][uuid] = fontUUID1_zh;
            }else if(obj[fontKey][uuid] === fontUUID2_zh){//是要找的两个字体
				data[i][fontSizeKey] = Math.floor(obj[fontSizeKey] + obj[fontSizeKey] * fontSize / 100);
                // data[i][lineHeightKey] = lineHeight;
				// if(obj[overflowKey] === 2){
				// 	data[i][fontSizeKey] = Math.floor(obj[fontSizeKey] + obj[fontSizeKey] * fontSize / 100);
				// 	data[i][actualFontSize] = data[i][fontSizeKey];
				// }
				// obj[fontKey][uuid] = fontUUID2_zh;
            }
        }
    }
    var str = JSON.stringify(data,null,4)
    fs.writeFile(fileP, str , {flag: 'w'}, function (err) {
            if(err) {
                console.error(fileP+"写入出错----------------------");
            }
            console.log(fileP+"处理完成+++++++++++++++++++++++++++++");
            readFileSync();
    });
}

var main = function () {
    readDirSync(filePath)
    console.log(fileRoots);
    readFileSync();
}
//////////////行数入口
main();

// console.log(infoList);
