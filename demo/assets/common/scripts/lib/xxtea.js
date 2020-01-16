window.Xxtea = window.Xxtea || Xxtea;
window.Base64 = window.Base64 || Base64;

/**
 * Created by leo on 15/10/27.
 */
function Xxtea(privateKey) {
    this._keyString = privateKey;
}

//将长整形转换为string,private
Xxtea.prototype._long2str = function (v, w) {
    var vl = v.length;
    var n = (vl - 1) << 2;
    if (w) {
        var m = v[vl - 1];
        if ((m < n - 3) || (m > n)) return null;
        n = m;
    }
    for (var i = 0; i < vl; i++) {
        v[i] = String.fromCharCode(v[i] & 0xff,
            v[i] >>> 8 & 0xff,
            v[i] >>> 16 & 0xff,
            v[i] >>> 24 & 0xff);
    }
    if (w) {
        return v.join('').substring(0, n);
    }
    else {
        return v.join('');
    }
}

//将string转换为long,private
Xxtea.prototype._str2long = function (s, w) {
    var len = s.length;
    var v = [];
    for (var i = 0; i < len; i += 4) {
        v[i >> 2] = s.charCodeAt(i)
            | s.charCodeAt(i + 1) << 8
            | s.charCodeAt(i + 2) << 16
            | s.charCodeAt(i + 3) << 24;
    }
    if (w) {
        v[v.length] = len;
    }
    return v;
}


//function: decrypt str with private key by xxtea
Xxtea.prototype.Decrypt = function (str) {
    if (!str) {
        return "";
    }
    var v = this._str2long(str, false);
    var k = this._str2long(this._keyString, false);
    if (k.length < 4) {
        k.length = 4;
    }
    var n = v.length - 1;

    var z = v[n - 1], y = v[0], delta = 0x9E3779B9;
    var mx, e, p, q = Math.floor(6 + 52 / (n + 1)), sum = q * delta & 0xffffffff;
    while (sum != 0) {
        e = sum >>> 2 & 3;
        for (p = n; p > 0; p--) {
            z = v[p - 1];
            mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
            y = v[p] = v[p] - mx & 0xffffffff;
        }
        z = v[n];
        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
        y = v[0] = v[0] - mx & 0xffffffff;
        sum = sum - delta & 0xffffffff;
    }

    return this._long2str(v, true);
}

//function: encrypt str with private key by xxtea
Xxtea.prototype.Encrypt = function (str) {
    if (str == "") {
        return "";
    }
    var v = this._str2long(str, true);
    var k = this._str2long(this._keyString, false);
    if (k.length < 4) {
        k.length = 4;
    }
    var n = v.length - 1;

    var z = v[n], y = v[0], delta = 0x9E3779B9;
    var mx, e, p, q = Math.floor(6 + 52 / (n + 1)), sum = 0;
    while (0 < q--) {
        sum = sum + delta & 0xffffffff;
        e = sum >>> 2 & 3;
        for (p = 0; p < n; p++) {
            y = v[p + 1];
            mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
            z = v[p] = v[p] + mx & 0xffffffff;
        }
        y = v[0];
        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
        z = v[n] = v[n] + mx & 0xffffffff;
    }

    return this._long2str(v, false);
}


//function: encrypt str with private key by xxtea
Xxtea.prototype.xxteaEncrypt = function (str) {
    if (str == "") {
        return "";
    }
    str = Base64.encode64(UtfParser.utf16to8(str));
    var v = this._str2long(str, true);
    var k = this._str2long(this._keyString, false);
    if (k.length < 4) {
        k.length = 4;
    }
    var n = v.length - 1;

    var z = v[n], y = v[0], delta = 0x9E3779B9;
    var mx, e, p, q = Math.floor(6 + 52 / (n + 1)), sum = 0;
    while (0 < q--) {
        sum = sum + delta & 0xffffffff;
        e = sum >>> 2 & 3;
        for (p = 0; p < n; p++) {
            y = v[p + 1];
            mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
            z = v[p] = v[p] + mx & 0xffffffff;
        }
        y = v[0];
        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
        z = v[n] = v[n] + mx & 0xffffffff;
    }

    return Base64.encode64(this._long2str(v, false));
}

//function: decrypt str with private key by xxtea
Xxtea.prototype.xxtea_decrypt = function (str) {
    if (!str) {
        return "";
    }
    newStr = Base64.decode64(str);
    if (newStr == "" || newStr == str) {
        return "";
    }
    str = newStr;
    var v = this._str2long(str, false);
    var k = this._str2long(this._keyString, false);
    if (k.length < 4) {
        k.length = 4;
    }
    var n = v.length - 1;

    var z = v[n - 1], y = v[0], delta = 0x9E3779B9;
    var mx, e, p, q = Math.floor(6 + 52 / (n + 1)), sum = q * delta & 0xffffffff;
    while (sum != 0) {
        e = sum >>> 2 & 3;
        for (p = n; p > 0; p--) {
            z = v[p - 1];
            mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
            y = v[p] = v[p] - mx & 0xffffffff;
        }
        z = v[n];
        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
        y = v[0] = v[0] - mx & 0xffffffff;
        sum = sum - delta & 0xffffffff;
    }

    return UtfParser.utf8to16(Base64.decode64(this._long2str(v, true)));
}

//Class:utf16 to utf8, utf8 ot utf16
//Author:Tecky
//Date:2008-06-03
function UtfParser() {
    //all method is static
}

//function:change utf16 to utf8
//parms(str):string that you want to change
UtfParser.utf16to8 = function (str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        }
        else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
        else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

//function:change utf8 to utf16
//parms(str):string that you want to change
UtfParser.utf8to16 = function (str) {
    str = str.toString();

    var out, i, len, c;
    var char2, char3;

    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += str.charAt(i - 1);
            break;
            case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = str.charCodeAt(i++);
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

// Class:base64 encode & decode
// Autor:Tecky
// Date:2008-06-03
function Base64() {
    //all method is static
}

var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  Base64.encode64 = function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = Base64.utf8Encode(input);
      while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }
          output = output +
              _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
              _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
      }
      return output;
  };

  Base64.decode64 = function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
          enc1 = _keyStr.indexOf(input.charAt(i++));
          enc2 = _keyStr.indexOf(input.charAt(i++));
          enc3 = _keyStr.indexOf(input.charAt(i++));
          enc4 = _keyStr.indexOf(input.charAt(i++));
          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;
          output = output + String.fromCharCode(chr1);
          if (enc3 !== 64) {
              output = output + String.fromCharCode(chr2);
          }
          if (enc4 !== 64) {
              output = output + String.fromCharCode(chr3);
          }
      }
      output = Base64.utf8Decode(output);
      return output;
  };

  Base64.utf8Encode = function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utfText = "";
      for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
              utfText += String.fromCharCode(c);
          } else if((c > 127) && (c < 2048)) {
              utfText += String.fromCharCode((c >> 6) | 192);
              utfText += String.fromCharCode((c & 63) | 128);
          } else {
              utfText += String.fromCharCode((c >> 12) | 224);
              utfText += String.fromCharCode(((c >> 6) & 63) | 128);
              utfText += String.fromCharCode((c & 63) | 128);
          }
      }
      return utfText;
  };

  Base64.utf8Decode = function (utfText) {
      var string = "";
      var i = 0;
      var c = 0;
      var c1 = 0;
      var c2 = 0;
      while ( i < utfText.length ) {
          c = utfText.charCodeAt(i);
          if (c < 128) {
              string += String.fromCharCode(c);
              i++;
          } else if((c > 191) && (c < 224)) {
              c1 = utfText.charCodeAt(i+1);
              string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
              i += 2;
          } else {
              c1 = utfText.charCodeAt(i+1);
              c2 = utfText.charCodeAt(i+2);
              string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
              i += 3;
          }
      }
      return string;
  }

// module.exports = Xxtea;
