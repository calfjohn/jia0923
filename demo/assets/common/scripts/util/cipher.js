/**
 * Created by hejialin on 2017/12/20.
 * 处理消息的加解密
 */
window["util"]["cipher"] = function () {
    var instance = {};

    // //加密算法使用xxtea
    //cipher = new Xxtea("thisiskey");//打开加密,关闭不加密

    instance.init = function () {
        //注释掉加解密
        if (typeof(clientConfig.SecretKey) === "string" && clientConfig.SecretKey !== "") {
            this.cipher = new window.Xxtea(clientConfig.SecretKey);
        }
    };

    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }


    // 字符串转为ArrayBuffer对象，参数为字符串
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length*2); // 每个字符占用2个字节
        var bufView = new Uint8Array(buf);
        for (var i=0, strLen=str.length; i<strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function stringToBytes ( str ) {
        var ch, st, re = [];
        for (var i = 0; i < str.length; i++ ) {
            ch = str.charCodeAt(i);  // get char
            st = [];                 // set up "stack"
            do {
                st.push( ch & 0xFF );  // push byte to stack
                ch = ch >> 8;          // shift value down by 1 byte
            }
            while ( ch );
            // add stack contents to result
            // done because chars have "wrong" endianness
            re = re.concat( st.reverse() );
        }
        // return an array of bytes
        return re;
    }

    //加密ArrayBuffer 返回加密后的新的ArrayBuffer
    instance.EncryptArrayBuffer = function(arrayBuffer){
        if (!instance.isCipher()) {
            return arrayBuffer;
        }
        //console.log("-------------------Encrypt---------------------")
        //转换成字符串
        var str = ab2str(arrayBuffer);

        var encryptStr = instance.EncryptString(str);
        //console.log(stringToBytes(encryptStr))
        //var base64Str = window.Base64.encode64(encryptStr);
        //console.log(base64Str)
        //return str2ab(encryptStr)
        //转换成hex
        var hex = stringToHex(encryptStr);
        //转换成ArrayBuffer
        var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
        }));
        return typedArray.buffer;
    };

    instance.isCipher = function(){
        return typeof(this.cipher)!=="undefined";
    };

    //加密字符串 返回加密后的字符串
    instance.EncryptString = function(content){
        if (!instance.isCipher()) {
            return content
        }
        return this.cipher.Encrypt(content);
    };


    //解密ArrayBuffer 返回解密后的新的ArrayBuffer
    instance.DecryptArrayBuffer = function(arrayBuffer){
        if (!instance.isCipher()) {
            return arrayBuffer
        }
        //console.log("-------------------Decrypt---------------------")
        //转换成字符串
        var str = ab2str(arrayBuffer);

        var decryptStr = instance.DecryptString(str);
        //console.log(stringToBytes(decryptStr))
        //var base64Str = window.Base64.encode64(decryptStr);
        //console.log(base64Str)

        //转换成hex
        var hex = stringToHex(decryptStr);
        //转换成ArrayBuffer
        var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
        }));
        return typedArray.buffer;
        //return str2ab(decryptStr)
    };

    instance.DecryptString = function(content) {
        if (!instance.isCipher()) {
            return content;
        }
        return this.cipher.Decrypt(content);
    };

    function stringToHex(str) {
        var val = "";
        var result = "";
        for (var i = 0; i < str.length; i++) {
            if (val === "") {
                result = str.charCodeAt(i).toString(16);
                if (result.length === 1) {
                    result = "0" + result;
                }
                val += result;
            } else {
                result = str.charCodeAt(i).toString(16)
                if (result.length === 1) {
                    result = "0" + result;
                }
                val += result;
            }

        }
        return val;
    }

    function hexToString(hex) {
        var arr = hex.split("");
        var out = "";
        for (var i = 0; i < arr.length / 2; i++) {
            var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1];
            var charValue = String.fromCharCode(tmp);
            out += charValue;
        }
        return out;
    }


    return instance;
};
