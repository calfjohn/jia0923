/**
 * Created by john on 16/10/7.
 * 适配creator，做了简化
*/

window.kf = window.kf || {};

kf._loadedItem = {};
kf.ignoreInitArr = [];
kf.addIgnoreInitDir = function(dirStr) {
    kf.ignoreInitArr.push(dirStr);
};

kf.clearAllLoaded = function () {
    kf._loadedItem = {};
};

kf.require = function(requireName, noInit) {

    if (!kf._loadedItem[requireName]) {

        var splitNameSpace = requireName.split(".");
        var item = window;
        var i;
        for (i = 0; i < splitNameSpace.length; i++) {
            item = item[splitNameSpace[i]];
        }
        if (item) {
            kf._loadedItem[requireName] = item();
            if (!noInit) {
                for (i = 0; i < kf.ignoreInitArr.length; i++) {
                    var key = kf.ignoreInitArr[i];
                    if (requireName.indexOf(key) === 0) {
                        break;
                    }
                }

                if (i >= kf.ignoreInitArr.length) {
                    kf._loadedItem[requireName].init && kf._loadedItem[requireName].init();
                }
            }

        }
    }

    return kf._loadedItem[requireName];
};

kf.clone = function(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(this.clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = this.clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
};


kf.cloneEx = function(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(this.cloneEx(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    if (obj.hasOwnProperty(j)) {
                        o[j] = this.cloneEx(obj[j]);
                    }
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
};

kf.cloneArray = function (list) {
    var desList = [];
    for (var i = 0 , len = list.length; i <  len; i++) {
        var obj = list[i];
        desList.push(obj);
    }
    return desList;
}

kf.cmp = function(src,des){
    return JSON.stringify(src) === JSON.stringify(des);
}

/**
 * utf8 byte to unicode string
 * @param utf8Bytes
 * @returns {string}
 */
kf.utf8ByteToUnicodeStr = function (utf8Bytes){
    var unicodeStr ="";
    for (var pos = 0; pos < utf8Bytes.length;){
        var flag= utf8Bytes[pos];
        var unicode = 0 ;
        if ((flag >>>7) === 0 ) {
            unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
            pos += 1;

        } else if ((flag &0xFC) === 0xFC ){
            unicode = (utf8Bytes[pos] & 0x3) << 30;
            unicode |= (utf8Bytes[pos+1] & 0x3F) << 24;
            unicode |= (utf8Bytes[pos+2] & 0x3F) << 18;
            unicode |= (utf8Bytes[pos+3] & 0x3F) << 12;
            unicode |= (utf8Bytes[pos+4] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos+5] & 0x3F);
            unicodeStr+= String.fromCharCode(unicode) ;
            pos += 6;

        }else if ((flag &0xF8) === 0xF8 ){
            unicode = (utf8Bytes[pos] & 0x7) << 24;
            unicode |= (utf8Bytes[pos+1] & 0x3F) << 18;
            unicode |= (utf8Bytes[pos+2] & 0x3F) << 12;
            unicode |= (utf8Bytes[pos+3] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos+4] & 0x3F);
            unicodeStr+= String.fromCharCode(unicode) ;
            pos += 5;

        } else if ((flag &0xF0) === 0xF0 ){
            unicode = (utf8Bytes[pos] & 0xF) << 18;
            unicode |= (utf8Bytes[pos+1] & 0x3F) << 12;
            unicode |= (utf8Bytes[pos+2] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos+3] & 0x3F);
            unicodeStr+= String.fromCharCode(unicode) ;
            pos += 4;

        } else if ((flag &0xE0) === 0xE0 ){
            unicode = (utf8Bytes[pos] & 0x1F) << 12;;
            unicode |= (utf8Bytes[pos+1] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos+2] & 0x3F);
            unicodeStr+= String.fromCharCode(unicode) ;
            pos += 3;

        } else if ((flag &0xC0) === 0xC0 ){ //110
            unicode = (utf8Bytes[pos] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos+1] & 0x3F);
            unicodeStr+= String.fromCharCode(unicode) ;
            pos += 2;

        } else{
            unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
            pos += 1;
        }
    }
    return unicodeStr;
};


// 将字符串格式化为UTF8编码的字节
kf.writeUTF = function (str, isGetBytes) {
    var back = [];
    var byteSize = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (0x00 <= code && code <= 0x7f) {
            byteSize += 1;
            back.push(code);
        } else if (0x80 <= code && code <= 0x7ff) {
            byteSize += 2;
            back.push((192 | (31 & (code >> 6))));
            back.push((128 | (63 & code)))
        } else if ((0x800 <= code && code <= 0xd7ff)
            || (0xe000 <= code && code <= 0xffff)) {
            byteSize += 3;
            back.push((224 | (15 & (code >> 12))));
            back.push((128 | (63 & (code >> 6))));
            back.push((128 | (63 & code)))
        }
    }
    for (i = 0; i < back.length; i++) {
        back[i] &= 0xff;
    }
    if (isGetBytes) {
        return back
    }
    if (byteSize <= 0xff) {
        return [0, byteSize].concat(back);
    } else {
        return [byteSize >> 8, byteSize & 0xff].concat(back);
    }
}

// 读取UTF8编码的字节，并专为Unicode的字符串
kf.readUTF = function (arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var UTF = '', _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2)
            }
            UTF += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1
        } else {
            UTF += String.fromCharCode(_arr[i])
        }
    }
    return UTF
}

// Changes XML to JSON
kf.xmlToJson = function(xml) {
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                if(attribute.nodeName === "size"
                    || attribute.nodeName === "define"
                    || attribute.nodeName === "mandatory")
                    continue;

                obj[attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3 && xml.nodeName !== "#text"){
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (nodeName === "#text") continue;

            if (typeof(obj[nodeName]) == "undefined" || nodeName === "#text") {
                obj[nodeName] = this.xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].length) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(this.xmlToJson(item));
            }
        }
    }
    return obj;
};

kf.loadXMLStr = function(xmlString){
    var xmlDoc=null;
    //判断浏览器的类型//支持IE浏览器
    if(!window.DOMParser && window.ActiveXObject){   //window.DOMParser 判断是否是非ie浏览器
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
        for(var i=0;i<xmlDomVersions.length;i++){
            try{
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
                break;
            }catch(e){
            }
        }
    }
    //支持Mozilla浏览器
    else if(window.DOMParser && document.implementation && document.implementation.createDocument){
        try{
            /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
             * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
             * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
             * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
             */
            var domParser = new  DOMParser();
            xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
        }catch(e){
        }
    }
    else{
        return null;
    }

    return xmlDoc;
};

//计算p2在p1的什么弧度，[-PI, PI]
kf.calculateAngleTwoPoint = function (p1, p2)
{
    var length = kf.pDistance(p1, p2);
    var angle = Math.acos((p2.x - p1.x) / length);
    return p2.y < p1.y ? -angle : angle;
};

//计算p2在p1的什么弧度，[0, 2*PI]
kf.calculateAngleTwoPointEx = function (p1, p2)
{
    var length = kf.pDistance(p1, p2);
    var angle = Math.acos((p2.x - p1.x) / length);
    angle = p2.y < p1.y ? -angle : angle;
    if(angle < 0)
        angle = 2*Math.PI + angle;
    return angle;
};

//计算p2在p1的什么角度，[-PI, PI].结果是与X轴正半轴的夹角
kf.calculateAngleTwoPointRotation = function (p1, p2)
{
    var angle = Math.atan2((p1.y-p2.y), (p2.x-p1.x))
    return angle * 180 / Math.PI;
};

kf.touchInNode = function (node, touch) {
    var pos = node.convertTouchToNodeSpace(touch);
    var temp = node.getContentSize();
    var myRect = new cc.Rect(0, 0, temp.width, temp.height);
    return kf.rectContainsPoint(myRect, pos);
};

kf.inArray = function(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
};

kf.getArrayIdx = function(arr, obj){
    return arr.indexOf(obj);
};


kf.getPositionInNode =  function (item, node, position) { // get item position in node space
    position = position || item.getPosition();
    if (!item.parent) return position;
    let worldPos = item.parent.convertToWorldSpaceAR(position);
    let nodePos = node.convertToNodeSpaceAR(worldPos);
    return nodePos;
};

kf.convertData = function(src,des){
    for (var key in src) {
        if (src.hasOwnProperty && !src.hasOwnProperty(key)) continue;
        des[key] = src[key];
    }
};

kf.pDistance = function(p1,p2){
    return p1.sub(p2).mag();
};

kf.pAdd = function(p1,p2){
    return p1.add(p2);
};

kf.rectContainsPoint = function(rect,rect2){
    return rect.contains(rect2);
};
//数字转化为罗马数字
kf.numToRome = function(num) {
    var ans = "";
    var k = Math.floor(num / 1000);
    var h = Math.floor((num % 1000) / 100);
    var t = Math.floor((num % 100) / 10);
    var o = num % 10;
    var one = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    var ten = ['X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
    var hundred = ['C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM']
    var thousand = 'M';
    for (var i = 0; i < k; i++) {
        ans += thousand;
    }
    if (h)
        ans += hundred[h - 1];
    if (t)
        ans += ten[t - 1];
    if (o)
        ans += one[o - 1];
    return ans;
}
