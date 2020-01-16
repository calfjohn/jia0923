

window.jsonTables = window.jsonTables || {};

jsonTables.displaySpeed_Noraml = 1;
jsonTables.displaySpeed_Max = 2;
jsonTables.displaySpeed_CurSpeed = jsonTables.displaySpeed_Noraml;
jsonTables.displaySpeed_Stop = false;
jsonTables.isEditor = false;
jsonTables.displaySkill = false;
jsonTables.displayingSkill = false;

jsonTables.extFlag = "ext";
jsonTables.enum = 0;

jsonTables.MONID_BASE = 200000;//怪物基础数值
jsonTables.TYPE_BASE_COUNT = 100000;//类型基础数值
jsonTables.showTip = true;//是否显示提示

jsonTables.showMergeAni = true;//合成动画标识

jsonTables.spineCouneLimit = [30,20,10,10,10];

jsonTables.defaultLangFlag = "zh";//默认语种

jsonTables.showFightLog = CC_DEBUG;

window.tb = {};

jsonTables.staticCache = cc.js.createMap(); //静态缓存 --》界面上的静态语言
jsonTables.dynamicsCache = cc.js.createMap();//动态缓存 --》动态缓存 lang的内容  // TODO: 尚未兼容 动态拼接
jsonTables.configCache = cc.js.createMap();//配置表缓存 --》jsontbale txt内容 // TODO: 尚未兼容 动态拼接
jsonTables.font = cc.js.createMap(); //存放多语音bmpfont字体的缓存内容

Math.seed = new Date().getTime();//重写随机方法 使他支持随机种子
Math.random = function(max, min) {//https://blog.csdn.net/u013152587/article/details/68086729
    max = max || 1;
    min = min || 0;
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280.0;
    return min + rnd * (max - min);
};

jsonTables.setRandomSeed = function (seed) {
    Math.seed = seed;
};

jsonTables.resetMathSeed = function () {
    Math.seed = new Date().getTime();
};

jsonTables.data2Str = {
    "row":"r",
    "col":"c",
    "idx":"i",
    "resName":"r2",
    "touchEnble":"t",
    "monsterSp":"m1",
    "monsterID":"m2"
}

jsonTables.enumCount = function(startNum){
    if (startNum !== undefined) {
        jsonTables.enum = startNum;
    }else {
        jsonTables.enum++;
    }
    return jsonTables.enum;
};
//获取一段字符串的字符长度，中文当2
jsonTables.getStrLen = function(str){
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {//非汉字
            realLength += 1;
        }else{
            realLength += 2;
        }
    }
    return  realLength;
};
jsonTables.getUnixNow = function(){
    return new Date().getTime();//毫秒级别
};

jsonTables.initFont = function(fontList){
    for (var i = 0 , len = fontList.length; i < len; i++) {
        var obj = fontList[i];
        this.font[obj.name] = obj;
    }
    this.resetLang();
};

jsonTables.fixTable = function(){
    const lzString = require('lz-string');
    for (var i = 0 , len = jsonTables[jsonTables.TABLE.CHAPTERSTYLE].length; i < len; i++) {
        var obj = jsonTables[jsonTables.TABLE.CHAPTERSTYLE][i];
        var list = obj[jsonTables.CONFIG_CHAPTERSTYLE.Data];
        var result2 = lzString.decompressFromBase64(list);
        if (result2 === null) {
            obj[jsonTables.CONFIG_CHAPTERSTYLE.Data] = JSON.parse(list);
            continue;
        }
        obj[jsonTables.CONFIG_CHAPTERSTYLE.Data] = JSON.parse(result2);
    }
};
/** 根据tid 执行map存储 */
jsonTables._initTable = function (value) {
    var specailTbl = [jsonTables.TABLE.EQUIP_LV,jsonTables.TABLE.PASSIVESKILLLV];
    if (value.indexOf("text") !== -1) {
        var table = jsonTables[value];
        for (var i = 0 , len = table.length; i <  len; i++) {
            var obj = table[i];
            var content = obj[jsonTables.CONFIG_TEXT_ZH.Content];
            if (content) {
                if (content.indexOf("\\n") !== -1 ) {
                    var list = content.split("\\n");
                    content = list.join("\n");
                }
                obj[jsonTables.CONFIG_TEXT_ZH.Content] = content;
            }
        }
    }
    for (var i = 0 , len = jsonTables[value].length; i < len; i++) {
        var obj = jsonTables[value][i];
        if (obj.Tid) {
            jsonTables[value+jsonTables.extFlag] = jsonTables[value+jsonTables.extFlag] || {};
            if (kf.inArray(specailTbl,value)) { //这个表比较特殊 为tid为索引的子map格式
                jsonTables[value+jsonTables.extFlag][obj.Tid] = jsonTables[value+jsonTables.extFlag][obj.Tid] || {};
                jsonTables[value+jsonTables.extFlag][obj.Tid][obj.Lv] = obj;
            }else{//其他都是tid 一一对应
                jsonTables[value+jsonTables.extFlag][obj.Tid] = obj
            }
        }
    }
};

//获取游戏基础数值信息
jsonTables.getGameBaseValue = function (key) {
    return jsonTables[jsonTables.TABLE.GAMEBASE][key];
};

jsonTables.getJsonTable = function (tableName) {
    return jsonTables[tableName];
};

/**
* 获取表内元素
* @param  {string} tableName 表名
* @param  {int} tableId   tid
* @param  {int} ext   扩展索引 根据不同表用的数值不同
*/
jsonTables.getJsonTableObj = function (tableName, tableId, ext) {
    var obj = null;
    if (!jsonTables[tableName + jsonTables.extFlag]) {
        this._initTable(tableName);//第一次进行数据重组
    }
    if (jsonTables[tableName+jsonTables.extFlag] && jsonTables[tableName+jsonTables.extFlag][tableId]) {
        if (ext !== undefined && ext !== null && jsonTables[tableName+jsonTables.extFlag][tableId][ext]) {
            obj = jsonTables[tableName+jsonTables.extFlag][tableId][ext];
        }else {
            obj = jsonTables[tableName+jsonTables.extFlag][tableId];
        }
    }
    if (!obj) {
        var table = this.getJsonTable(tableName);
        if(table){
            for(var i = 0; i < table.length; i++) {
                if(table[i].Tid !== tableId) continue;
                obj = table[i];
                break;
            }
        }
    }
    if (!obj && tableName !== jsonTables.TABLE.HEAD &&  tableName !== jsonTables.TABLE.STORY) {
        var str = "配置表数据未找到！！"+"表名->"+tableName+",Tid->"+tableId;
        str = ext !== undefined && ext !== null ? str +",Lv->"+ext : str;
        cc.error(str);
    }
    return obj;
};

jsonTables.getRow = function (tableName, fieldName, value) {
    var rowData = [];
    var tempTable = jsonTables.getJsonTable(tableName);
    if (!tempTable) return null;

    for (var i in tempTable) {
        if (value + "" === tempTable[i][fieldName] + "") {
            rowData.push(tempTable[i]);
        }
    }

    if (rowData.length <= 1)
    return rowData[0];
    else
    return rowData;
};

jsonTables.getRowByConditions = function (tableName, conditions, array) {
    var rowData = [];
    var tempTable = jsonTables.getJsonTable(tableName);
    if (!tempTable) return null;
    for (var i in tempTable) {
        var match = true;
        for (var key in conditions) {
            var p1 = tempTable[i][key];
            var p2 = conditions[key];
            //数组元素需要查看是否包含
            if (p1 instanceof Array) {
                p2 += "";
                if (p1.indexOf(p2) === -1) {
                    match = false;
                    break;
                }
            } else if (p2 + "" !== p1 + "") {
                match = false;
                break;
            }
        }
        if (match) {
            rowData.push(tempTable[i]);
        }
    }
    if (array) {
        return rowData;
    } else {
        if (rowData.length <= 1)
        return rowData[0];
        else
        return rowData;
    }

};

/**
* 随机一个minNum - maxNum 之间的整数
* @param  {int} minNum 最小值
* @param  {int} maxNum 最大值
* @return {int}        minNum - maxNum 之间的整数
*/
jsonTables.randomNum = function(minNum,maxNum){
    switch(arguments.length){
        case 1:
        return parseInt(Math.random()*minNum+1,10);
        case 2:
        return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
        default:
        return 0;
    }
};

/**
* 随机概率  控制100以内
*/
jsonTables.random100Num = function(num){
    return jsonTables.randomNum(0,100) < num;
};

jsonTables.strToObject = function (value) {
    var obj = value;
    if(typeof value === "string")
    obj = JSON.parse(value.replace(/""/g, "\""))
    if(value.x && typeof value.x === "string")
    obj.x = JSON.parse(value.x.replace(/""/g, "\""))
    if(value.y && typeof value.y === "string")
    obj.y = JSON.parse(value.y.replace(/""/g, "\""))
    return obj;
};


jsonTables.random = function(arr) {
    if (arr instanceof Array) {
        return arr[Math.floor(Math.random()*arr.length)];
    }
    return arr;
};
/** 是一个数据随机排序 */
jsonTables.randonByRand = function (arr) {
    if (arr instanceof Array) {
        return arr.sort(function () {
            return Math.random() - 0.5;
        });
    }
    return arr;
};

jsonTables.randomWithPop = function(arr) {
    if (arr instanceof Array) {
        if (arr.length === 0) {
            return null;
        }
        var idx = Math.floor(Math.random()*arr.length);
        return arr.splice(idx,1)[0];
    }
    return arr;
};
//获取重合部分的索引
jsonTables.uniqueList = function(arr){
    var strary = []; //  存放相同元素
    var indexList = []; //存放所有的索引，与strary表一一对应
    for (var i = 0; i < arr.length; i++) {
        var hasRead = false;
        for ( var k = 0; k < strary.length; k++) {
            if (strary[k] == arr[i]){
                hasRead = true;
            }
        }
        if(!hasRead){
            indexList[strary.length] = indexList[strary.length] || [];
            indexList[strary.length].push(i);
            var _index = i, haveSame = false;
            for (var j = i + 1; j < arr.length; j++) {
                if(j == parseInt(i) + parseInt(1)){
                    _index++;
                }
                if (arr[i] ==arr[j]) {
                    indexList[strary.length].push(j);
                    _index += "," + (parseInt(j)+1);
                    haveSame = true;
                }
            }
            if (haveSame) {
                strary.push(arr[i]);
            }else {
                indexList.splice(strary.length,1);
            }
        }
    }
    return {values:strary,idxList:indexList}
};

jsonTables.unique = function(arr){
    var len = arr.length;
    var result = []
    for(var i=0;i<len;i++){
        var flag = true;
        for(var j = i;j<arr.length-1;j++){
            if(arr[i]==arr[j+1]){
                flag = false;
                cc.log("????????????")
                break;
            }
        }
        if(flag){
            result.push(arr[i])
        }
    }
    return result;
};

//删除数组中的成员  splice 会导致内存移位 必须倒叙删除
jsonTables.removeByValue = function(arr, val) {
    var ret = false;
    for(var i = arr.length-1;i > -1;i--){
        if(arr[i] === val) {
            ret = true;
            arr.splice(i, 1);
        }
    }
    return ret;
};

//双数组 删除 srcList被删除的数据   desList对比数据  checkFunc侦测方法
jsonTables.removeByKey = function(srcList, desList,checkFunc) {
    for(var i = srcList.length-1;i > -1;i--){
        var item = srcList[i];
        for (var j = 0 , jLen = desList.length; j < jLen; j++) {
            var obj = desList[j];
            if (checkFunc(item,obj)) {
                srcList.splice(i, 1);
                break;
            }
        }
    }
};

//双数组 更新对象或者新增  srcList被修改的数据   desList对比数据  checkFunc侦测方法 isCanAdd是否允许增加
jsonTables.addEleOrUpdate = function(srcList, desList,checkFunc,isCanAdd) {
    for (var j = 0 , jLen = desList.length; j < jLen; j++) {
        var obj = desList[j];
        var isAdd = true;
        for(var i = srcList.length-1;i > -1;i--){
            var item = srcList[i];
            if (!checkFunc(item,obj))  continue;
            isAdd = false;
            srcList[i] = obj;
            break;
        }
        if (isAdd && isCanAdd) {
            srcList.push(obj);
        }
    }
};

jsonTables.getLabelOrRx = function(node){
    if (!node) return;
    var label = node.getComponent(cc.Label);
    if (label) return label;
    var richText = node.getComponent(cc.RichText);
    if (richText) return richText;
};

/** 预制体处理 */
jsonTables.parsePrefab = function(script){
    // this._parseHint(script);
    this._parseLabel(script);
};

jsonTables.getNodeInLoop = function (node,path) {
    var targerNode = node;
    if (path.indexOf("/") === -1) {
        targerNode = this._getFirstChildByName(node,path);
    }else {
        var paths = path.split("/");
        for (var i = 1 , len = paths.length; i <  len; i++) {//排除根节点
            var obj = paths[i];
            targerNode = targerNode.getChildByName(obj);
            if (!targerNode) break;
        }
    }
    return targerNode;
};

jsonTables._getFirstChildByName = function (node,name) {
    var childs = node.children;
    if (childs.length === 0) return null;
    for (var i = 0 , len = childs.length; i <  len; i++) {
        var obj = childs[i];
        if (obj.name === name) {
            return obj;
        }
        var childNode = this._getFirstChildByName(obj,name);
        if (childNode) {
            return childNode;
        }
    }
};

/** 预制体静态文本替换 */
jsonTables._parseLabel = function(script){
    var node = script.node;
    jsonTables.staticCache[node.uuid] = script;//脚本内语言静态缓存存入
    var cache = window.langCache[uiLang.language];//得到当前设置的语言静态缓存
    var category = cache[node.name];//当前脚本在缓存内数据
    var newFontName = "gamefont_all_" + uiLang.language + 1;
    if (!category || !this.font[newFontName]) return;
    for (var key in category) {
        if (!category.hasOwnProperty(key)) continue;
        var targetNode = this.getNodeInLoop(script.node,key);
        if (!targetNode) continue;
        var comp = this.getLabelOrRx(targetNode);
        if (comp === undefined) {
            cc.warn("key:"+key,"不存在")
            continue;
        }
        if(comp.font && comp.font.name !== "gamefont_number" && comp.font.name !== "numberMain"  && comp.font.name !== "termNumber" && comp.font.name !== "numberTerm"){
            var fontName = comp.font.name;
            newFontName = "gamefont_all_" + uiLang.language + fontName.slice(fontName.length - 1);
            if(newFontName !== fontName){
                comp.string = "";
                comp.font = this.font[newFontName];
            }
        }else if (comp.replaceFont) {
            comp.string = "";
            comp.font = this.font[comp.replaceFont];
            comp.replaceFont = "";
            if (cc.sys.isNative && comp.lastColor) {// && !CC_DEBUG
                comp.node.color = comp.lastColor;
            }
        }
        if (category[key]) {
            jsonTables.reSetSize(comp);
            if (comp.string !== category[key] ) {
                comp.string = category[key];
            }
        }
    }
};

jsonTables.reSetSize = function (comp) {
    if(!comp.lastFontSize){
        comp.lastFontSize = comp.fontSize;
    }else{//需重新设置一次fontSize，这样在SHIRINK模式下actualFontSize才会发生改变
        // if (comp.fontSize !== comp.lastFontSize) {
        // }
        comp.fontSize = comp.lastFontSize;
    }
};

/** hintTip路径注入 */
jsonTables._parseHint = function(script){
    var node = script.node;
    var cache = window.hintCache[uiLang.language];
    var category = cache[node.name];
    if (!category) return;
    for (var key in category) {
        if (!category.hasOwnProperty(key)) continue;
        if(!script.widget(key)){
            cc.warn(key + "节点不存在");
            continue;
        }
        var comp = script.widget(key).getComponent("hintTipControl");
        if (category[key] === key) {
            cc.warn("hint:"+key,"未配置");
        }
        comp.setPath(node.name,key);
    }
};

/** 设置配置表语言 */
jsonTables.loadConfigTxt = function(node,textID){
    jsonTables.configCache[node.uuid] = {node:node,textID:textID};
    var comp = jsonTables.getLabelOrRx(node);
    var tableName = "text_" + uiLang.language;
    var obj = jsonTables.getJsonTableObj(tableName,textID);
    comp.string = obj && obj[jsonTables.CONFIG_TEXT_ZH.Content] ?obj[jsonTables.CONFIG_TEXT_ZH.Content]:"";
};
/** 设置lang语言 */
jsonTables.loadLangTxt = function(node,category, messageKey){
    jsonTables.dynamicsCache[node.uuid] = {node:node,category:category,messageKey:messageKey};
    var comp = jsonTables.getLabelOrRx(node);
    comp.string = uiLang.getMessage(category, messageKey);
};
/** 重置语言 */
jsonTables.resetLang = function(){
    //// TODO:在界面资源释放时需要释放缓存数据
    for (var k in jsonTables.staticCache) {
        var obj = jsonTables.staticCache[k];
        if(cc.isValid(obj) && cc.isValid(obj)){
            this.parsePrefab(jsonTables.staticCache[k]);
        }else{
            delete  jsonTables.staticCache[k];
        }
    }
    for (var k in jsonTables.dynamicsCache) {
        var obj = jsonTables.dynamicsCache[k];
        if(cc.isValid(obj) && cc.isValid(obj.node)){
            this.loadLangTxt(obj.node,obj.category,obj.messageKey);
        }else{
            delete  jsonTables.dynamicsCache[k];
        }
    }
    for (var k in jsonTables.configCache) {
        var obj = jsonTables.configCache[k];
        if(cc.isValid(obj) && cc.isValid(obj.node)){
            this.loadConfigTxt(obj.node,obj.textID);
        }else{
            delete  jsonTables.configCache[k];
        }
    }
    kf.require("basic.clientEvent").dispatchEvent("changeLanguage");//静态界面文字都替换完了再通知更新
    kf.require("logic.user").refreshUIData();
    //// jsonTables.staticCache = {}; //静态缓存 --》界面上的静态语言
    //// jsonTables.dynamicsCache = {};//动态缓存 --》动态缓存 lang的内容
    //// jsonTables.configCache = {};//配置表缓存 --》jsontbale txt内容

};

jsonTables.initSandBoxTable = function(obj) {
    var list = jsonTables.getGameBaseValue('sandbox'+ obj.TableInfo.Grid.length +'Table');
    if (!list) {
        cc.error("对应结构的沙盘未配置,",obj.TableInfo.Grid.length)
    }//

    for (var j = 0 , jLen = obj.TableInfo.Grid.length; j < jLen; j++) {
        for (var z = 0 , zLen = obj.TableInfo.Grid[j].Data.length; z < zLen; z++) {
            var data = obj.TableInfo.Grid[j].Data[z];
            if (data === 1) {//说明这是初始化沙盘 初始化一下啦
                obj.TableInfo.Grid[j].Data[z] = jsonTables.MONID_BASE + list[j][z];
                obj.TableInfo.Grid[j].Lv[z] = 1;
            }
        }
    }
};

/** 检查默认阵容 */
jsonTables.isLineUpVaild = function(){
    if (!kf.require("logic.card").isLineUpVaild()) {
        var errorcode = uiLang.getMessage("tower","errorcode3");
        uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
        return false;
    }
    return true;
};

jsonTables.isSpineContainEvent = function (spineData,eventName) {
    if (!spineData || !spineData.skeletonJson || !spineData.skeletonJson.events || !spineData.skeletonJson.events[eventName]) return false;
    return true;
};
/**
* 切换骨骼动画  如果已尽在播放就不要打断
* @param  {[type]}  spineComp [description]
* @param  {[type]}  aniName   [description]
* @param  {Boolean} isLoop    [description]
*/
jsonTables.isSpinePlay = function (spineComp,aniName) {
    if (spineComp.animation === aniName) return true;
    return false;
};//

/** 获取指定职业到怪物表 */
jsonTables.profession2Monster = function (profession,sex) {
    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,profession);
    if (!config) return 1;
    if (sex === 0) {
        return config[jsonTables.CONFIG_PROFESSION.Carrer][0] || 1;
    }
    return config[jsonTables.CONFIG_PROFESSION.Carrer][sex - 1] || 1;
};
/**
* 回调计数方法
* @param  {array}   list     遍历数组
* @param  {string}   funcName 方法名
* @param  {array}   args     参数数组
* @param  {function} cb       全部执行完的回调
*/
jsonTables.doCountAction = function (list,funcName,args,cb) {
    let len = list.length;
    if (len === 0) return cb();
    var count = 0;
    var callBack = function(){
        count++;
        if (count === len) {
            cb();
        }
    }.bind(this);
    args.push(callBack);
    for (var i = 0 ; i <  len; i++) {
        var obj = list[i];
        if (obj[funcName]) {
            obj[funcName].apply(obj, args);
        }
    }
};
/** 获取指定品质的tid */
jsonTables.getTidByForm = function (form) {
    var tables = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
    var list = [];
    for (var i = 0 , len = tables.length; i <  len; i++) {
        var obj = tables[i];
        if (obj[jsonTables.CONFIG_MONSTERFAMILY.Display]) {
            list.push(obj);
        }
    }
    var randTable= jsonTables.random(list);
    if (!randTable || !randTable[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form - 1]) return null;
    return randTable[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form - 1];
};

/**
* 获取随机同品质怪物tid
* @param  {int} form [指定怪物形态]
* @param  {int} quality [指定怪物品质]
* @return {[type]}           [description]
*/
jsonTables.getTidByFormAndQuality = function (form,quality) {
    var table = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
    var sameQuailityList = [];
    for (var i = 0 , len = table.length; i <  len; i++) {
        var obj = table[i];
        if (obj[jsonTables.CONFIG_MONSTERFAMILY.Display] && obj[jsonTables.CONFIG_MONSTERFAMILY.Quality] === quality) {
                sameQuailityList.push(obj);
        }
    }
    if (sameQuailityList.length === 0) return cc.error("同品质家族为0");
    var familyTargetConfig = jsonTables.random(sameQuailityList);
    return familyTargetConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form - 1];
};

/** 获取指定家族指定形态*/
jsonTables.getTidByFamilyAndForm = function (form, familyTid) {
    var tables = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
    var family = null;
    for (var i = 0 , len = tables.length; i <  len; i++) {
        var obj = tables[i];
        if (obj[jsonTables.CONFIG_MONSTERFAMILY.Tid] === familyTid) {
            family = obj;
            break;
        }
    }
    if(!family || !family[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form - 1]) return null;
    return family[jsonTables.CONFIG_MONSTERFAMILY.Monsters][form - 1];
};



/**
* 获取随机同品质怪物tid
* @param  {int} configTid [指定怪物id]
* @return {[type]}           [description]
*/
jsonTables.getEqulQualityTid = function (configTid) {
    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,configTid);
    var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
    var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);

    var table = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
    var sameQuailityList = [];
    for (var i = 0 , len = table.length; i <  len; i++) {
        var obj = table[i];
        if (obj[jsonTables.CONFIG_MONSTERFAMILY.Quality] === familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality]
            && obj[jsonTables.CONFIG_MONSTERFAMILY.Tid] !== configTid) {
                sameQuailityList.push(obj);
            }
        }
        if (sameQuailityList.length === 0) return cc.error("同品质家族为0");

        var monsterIdx = kf.getArrayIdx(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters],configTid);
        var familyTargetConfig = jsonTables.random(sameQuailityList);
        return familyTargetConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][monsterIdx];
    };
    /**
    * 获取比当前品质低一级的怪物
    * @param  {int} tid 指定id
    * @return {int}     如果没有就返回null
    */
    jsonTables.getLowFormTid = function (tid) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,config[jsonTables.CONFIG_MONSTER.FamilyID]);
        if (!familyConfig) return null;
        var monsterIdx = kf.getArrayIdx(familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters],tid);
        if (monsterIdx === 0 || monsterIdx === -1) return null;
        return familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][monsterIdx -1];
    };
    /**
    * 获取指定的怪物
    * @param  {int} tid 指定id
    * @return {int}     如果没有就返回null
    */
    jsonTables.getMarkFormTid = function (tid,mark) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,config[jsonTables.CONFIG_MONSTER.FamilyID]);
        if (!familyConfig || !familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][mark]) return null;
        return familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][mark];
    };
    /**
    * 加载一下spine 并 赋予待机动作
    * @param  {[sp]} spine [组件]
    * @param  {String} name  资源名称
    */
    jsonTables.loadSpineCommonAction = function (spine,name) {
        spine.skeletonData = null;
        var callBack = function(spineData){
            spine.node.active = true;
            spine.skeletonData  = spineData
            spine.setAnimation(0,'std',true);
        }.bind(this);
        uiResMgr.loadSpine(name,callBack);
    };
    /** 根据资源获取配置的影子大小，这个方法有点鸡肋 */
    jsonTables.getShadowSizeByRes = function (resName) {
        var tables = jsonTables.getJsonTable(jsonTables.TABLE.MONSTER);
        for (var i = 0 , len = tables.length; i <  len; i++) {
            var obj = tables[i];
            if (obj[jsonTables.CONFIG_MONSTER.Resource] !== resName) continue;
            return obj[jsonTables.CONFIG_MONSTER.Shadow];
        }
        return 100;
    };
    /** 获取平台编码 */
    jsonTables.getPlatform = function () {
        var platform = 0;//默认h5
        if (cc.sys.isNative) {// && !CC_DEBUG
            platform = cc.sys.os === cc.sys.OS_ANDROID ? 1:2;
        }else if (window && window.FBInstant) {
            platform = 3;//facebookH5
        }else if(window && window.sdw){
            platform = 3;//闪电玩
        }else if(window && window.wx){
            platform = 4;//微信
        }
        return platform;
    };
    /** 获取渠道 */
    jsonTables.getChannel = function () {
        var channel = 0;//默认无渠道	// 渠道 1：google 2:ios 3:facebook
        var configuration = kf.require("util.configuration");
        var loginMode = configuration.getLastLoginMode();
        switch (loginMode) {
            case constant.LastLoginMode.Andoid_Google:
            channel = 1;
            break;
            case constant.LastLoginMode.Andoid_Guide:
            channel = 0;
            break;
            case constant.LastLoginMode.Ios_GameCenter:
            channel = 2;
            break;
            case constant.LastLoginMode.Ios_Guide:
            channel = 0;
            break;
            case constant.LastLoginMode.FaceBook_Android:
            case constant.LastLoginMode.FaceBook_Ios:
            case constant.LastLoginMode.FaceBook_H5:
            channel = 3;
            case constant.LastLoginMode.SDW:
            channel = 6;
            break;
        }
        return channel;
    };

    //[monsterLv]
    jsonTables.CONFIG_MONSTERLV = {
        Tid:"Tid", //家族ID
        Lv:"Lv", //等级
        Exp:"Exp", //升级所需碎片数
        DamageBase:"DamageBase", //伤害
        HpBase:"HpBase", //血量
        PsBase:"PsBase", //物理强度
        MsBase:"MsBase", //魔法强度
        PdBase:"PdBase", //物理防御
        MdBase:"MdBase", //魔法防御
        UpgradeCost:"UpgradeCost", //升级要的金币
        ExpGet:"ExpGet", //升级获得主角经验值
    };
    /**
     * 设置组件接口 保护一下最大长度避免出错
     * @param  {[type]} editComp [description]
     * @param  {[type]} str      [description]
     * @return {[type]}          [description]
     */
    jsonTables.setEditBoxString = function (editComp,str) {
        if (editComp.maxLength) {
            var len = str.length;
            var newStr = str;
            if (len > editComp.maxLength) {
                newStr = str.slice(0,editComp.maxLength - 3);
                newStr = newStr + "...";
            }
            editComp.string = newStr;
        }else {
            cc.error("不是输入组件")
        }
    };
    /** 获取语种标识 */
    jsonTables.getLanguage = function () {
        switch (cc.sys.language) {
            case cc.sys.LANGUAGE_ARABIC://"ar" 阿拉伯
                return cc.sys.LANGUAGE_ARABIC;
            case cc.sys.LANGUAGE_BULGARIAN://"bg" 保加利亚
                return cc.sys.LANGUAGE_BULGARIAN;
            case cc.sys.LANGUAGE_CHINESE://"zh" 中文
                return "zh";//// NOTE: 暂时中文用繁体
            case cc.sys.LANGUAGE_DUTCH://"du" 荷兰人
                return cc.sys.LANGUAGE_DUTCH;
            case cc.sys.LANGUAGE_ENGLISH://"en" 英语
                return cc.sys.LANGUAGE_ENGLISH;
            case cc.sys.LANGUAGE_FRENCH://"fr" 法语
                return cc.sys.LANGUAGE_FRENCH;
            case cc.sys.LANGUAGE_GERMAN://"de" 德语
                return cc.sys.LANGUAGE_GERMAN;
            case cc.sys.LANGUAGE_HUNGARIAN://"hu" 匈牙利语
                return cc.sys.LANGUAGE_HUNGARIAN;
            case cc.sys.LANGUAGE_ITALIAN://"it" 意大利语
                return cc.sys.LANGUAGE_ITALIAN;
            case cc.sys.LANGUAGE_JAPANESE://"ja" 日语
                return cc.sys.LANGUAGE_JAPANESE;
            case cc.sys.LANGUAGE_KOREAN://"ko" 韩语
                return cc.sys.LANGUAGE_KOREAN;
            case cc.sys.LANGUAGE_NORWEGIAN://"no" 挪威语
                return cc.sys.LANGUAGE_NORWEGIAN;
            case cc.sys.LANGUAGE_POLISH://"pl"
                return cc.sys.LANGUAGE_POLISH;
            case cc.sys.LANGUAGE_PORTUGUESE://"pt"    葡萄牙语
                return cc.sys.LANGUAGE_PORTUGUESE;
            case cc.sys.LANGUAGE_ROMANIAN://"ro"    罗马尼亚语
                return cc.sys.LANGUAGE_ROMANIAN;
            case cc.sys.LANGUAGE_RUSSIAN://"ru"    俄罗斯
                return cc.sys.LANGUAGE_RUSSIAN;
            case cc.sys.LANGUAGE_SPANISH://"es"    西班牙语
                return cc.sys.LANGUAGE_SPANISH
            case cc.sys.LANGUAGE_TURKISH://"tr"    土耳其语
                return cc.sys.LANGUAGE_TURKISH
            case cc.sys.LANGUAGE_UKRAINIAN://"uk"    乌克兰语
                return cc.sys.LANGUAGE_UKRAINIAN
            case cc.sys.LANGUAGE_UNKNOWN://""unknown""    未知
                return cc.sys.LANGUAGE_ENGLISH;
        }
        return jsonTables.defaultLangFlag;
    };
    //判断名字表是否支持flag语种
    jsonTables.langFlagInConfigName = function (flag) {
        for (var variable in jsonTables.CONFIG_NAME) {
            if (!jsonTables.CONFIG_NAME.hasOwnProperty(variable)) continue;
            var value = jsonTables.CONFIG_NAME[variable];
            if (value === flag) {
                return true;
            }
        }
        return false;
    };
    //判断指定对象是否超过最大限制
    jsonTables.isSpineOverLimit = function (node) {
        if (!node || !node.children) return false;
        return node.children.length >= 5;// NOTE: 设置最大限制
    };
    /** 检查功能是否开发 */
    jsonTables.funOpenCheck = function (funTid) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.FUNCTION,funTid);
        if (!config) return true;
        if (config[jsonTables.CONFIG_FUNCTION.IsOpen] === 0) {
            return false;
        }
        switch (config[jsonTables.CONFIG_FUNCTION.Type]) {
            case tb.Funtion_Chapter:
                var chapterLogic = kf.require("logic.chapter");
                return config[jsonTables.CONFIG_FUNCTION.TypeParam] <= chapterLogic.getCurMaxChapterID();
                break;
            case tb.Funtion_Lv:
                var userLogic = kf.require("logic.user");
                return config[jsonTables.CONFIG_FUNCTION.TypeParam] <= userLogic.getBaseData(userLogic.Type.Lv);
        }
        return true;
    };

    jsonTables.isFunVisible = function (funTid) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.FUNCTION,funTid);
        if (!config) return true;
        return config[jsonTables.CONFIG_FUNCTION.IsOpen] === 1;
    };

    jsonTables.tipUnOpenFuntionMsg = function (tid) {
        var str = this.getUnOpenFuntionMsg(tid);
        uiManager.openUI(uiManager.UIID.TIPMSG,str);
    };
    //获取文字
    jsonTables.getUnOpenFuntionMsg = function (tid) {
        var str = "";
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.FUNCTION,tid);
        switch (config[jsonTables.CONFIG_FUNCTION.Type]) {
            case tb.Funtion_Chapter:
                str = "chapterFun";
                break;
            case tb.Funtion_Lv:
                str = "lvFun";
                break;
        }
        str = uiLang.get(str).formatArray([config[jsonTables.CONFIG_FUNCTION.TypeParam]]);
        return str;
    };
    //计算时间
    jsonTables.accDuration = function (time) {
        if (jsonTables.displaySpeed_CurSpeed === jsonTables.displaySpeed_Noraml) {
            return time;
        }
        return time;
    };
    //计算速度
    jsonTables.accSpeed = function (speed) {
        if (jsonTables.displaySpeed_CurSpeed === jsonTables.displaySpeed_Noraml) {
            return speed;
        }
        return speed;
    };

    /**
     * 计算被动技能对家族的剑盾值加成
     * @param {[]}skillList 被动技能列表
     * @param {int}familyForm 家族形态
     * @param {int}familyLv 家族等级
     * @param {int}familyQuality 家族品质
     * @return {{addSword:0,addShield:0}} 返回增加的剑值和盾值
     */
    jsonTables.countSkillAdd = function (skillList,familyForm,familyLv,familyQuality) {
        var formulaLogic = kf.require("logic.formula");
        var res = {
            addSword:0,
            addShield:0
        };
        var formNum = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.PassiveSkillForm) / 100;//被动技能剑盾数值形态加成（百分比)
        var lvNum = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.PassiveSkillLv) / 100;//被动技能剑盾数值等级加成（百分比)
        var qualityNum = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.PassiveSkillQuality)[familyQuality - 1] / 100;//被动技能剑盾数值等级加成（百分比)
        for (var i = 0 , len = skillList.length; i < len; i++) {
            var obj = skillList[i];
            if(obj.skillLv === 0)   continue;
            var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,obj.skillID);
            if(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddType] === 1){//加剑
                res.addSword += formulaLogic.calculateSkillAdd(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddBaseNum][0],familyLv,familyForm,qualityNum,formNum,lvNum,obj.skillLv);
            }else if(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddType] === 2){//加盾
                res.addShield += formulaLogic.calculateSkillAdd(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddBaseNum][0],familyLv,familyForm,qualityNum,formNum,lvNum,obj.skillLv);
            }else if(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddType] === 3){//加剑盾
                if(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddBaseNum].length !== 2){
                    cc.error("被动技能：" + obj.skillID + "配的类型加剑盾，但数值错误");
                    continue;
                }
                res.addSword += formulaLogic.calculateSkillAdd(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddBaseNum][0],familyLv,familyForm,qualityNum,formNum,lvNum,obj.skillLv);
                res.addShield += formulaLogic.calculateSkillAdd(skillConfig[jsonTables.CONFIG_PASSIVESKILL.AddBaseNum][1],familyLv,familyForm,qualityNum,formNum,lvNum,obj.skillLv);
            }
        }
        return res;
    };
    jsonTables.getCoutryByLang = function (langFlag) {
        return 101;
        var config = jsonTables.getJsonTable(jsonTables.TABLE.COUNTRY);
        if (!config || config.length === 0) return 101;
        var mineZore = new Date().getTimezoneOffset()/60;
        mineZore = -mineZore;
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i];
            var list = obj[jsonTables.CONFIG_COUNTRY.CountryTime];
            if (kf.inArray(list,mineZore)) {
                return obj[jsonTables.CONFIG_COUNTRY.Tid];
            }
        }
        return config[0][jsonTables.CONFIG_COUNTRY.Tid];
    };

    jsonTables.replaceSpellLv = function (list,idList,lvList,maxList) {
        for (var i = 0 , len = idList.length; i < len; i++) {
            var obj = idList[i];
            var lv = lvList[i] || 0;
            if (lv === 0) {
                continue;
            }
            list.push({skillID:obj,skillLv:lv,maxLv:maxList[i]});
        }
    };

    jsonTables.getResolutionPer = function () {
        var per = cc.view.getFrameSize().width / cc.view.getFrameSize().height;
        if (!cc.sys.isNative) {
            if(document.body.scrollWidth>document.body.scrollHeight){//通过 标识 旋转过来了  不然 特么手机锁屏了
                per = window.screen.height /  window.screen.width;
            }
        }
        return per;
    };

    jsonTables.isProfiledScreen = function () {
        var per = this.getResolutionPer();
        if (cc.sys.OS_IOS === cc.sys.os) {
            if (per === Number((2436 / 1125).toFixed(8))
                || per === Number((2688 / 1242).toFixed(8))
                || per === Number((2436 / 1124).toFixed(8))
            ) {//x xs  xsmax 微信环境 存在 计算精度问题
                return true;
            }
        }
        return false;
    };
    /**
     * 获取自坐标  被适配后的位置 ，该节点父节点必须为设计分辨率1206 * 750
     * @param  {[type]} pos [description]
     * @return {[type]}     [description]
     */
    jsonTables.getPosInWorld = function (pos) {
        var rePos = cc.v2(cc.winSize.width/1206 * pos.x , cc.winSize.height / 750 * pos.y);
        if (jsonTables.isProfiledScreen()) {
            rePos.x += (cc.view.getFrameSize().width * (44/812))
        }
        return rePos;
    };
    //根据分辨路重置 icon缩放比
    jsonTables.fixResolutionIcon = function (iconNode) {//
        var per = this.getResolutionPer();
        var configs = this.getJsonTable(jsonTables.TABLE.RESOLUTION);
        var scale = -1;
        for (var i = 0 , len = configs.length; i <  len; i++) {
            var obj = configs[i];
            var configPer = obj[jsonTables.CONFIG_RESOLUTION.ResolutionRatioHeight] / obj[jsonTables.CONFIG_RESOLUTION.ResolutionRatioWitdh];
            if (configPer === configs) {
                scale = obj[jsonTables.CONFIG_RESOLUTION.IconScalingRatio];
                break;
            }
        }
        if (scale === -1) {
            return;
        }
        iconNode.scale = scale;
    };

    jsonTables.trim = function(s){
      return this.rtrim(this.ltrim(s));
    };

    jsonTables.ltrim = function(s){
      return s.replace( /^\s*/, "");
    };
    //去右空格;
    jsonTables.rtrim = function(s){
      return s.replace( /\s*$/, "");
    };
