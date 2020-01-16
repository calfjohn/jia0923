/**
 * 存放版本信息
 */

window.zCodeVersion = window.zCodeVersion || {};

zCodeVersion.version = '1.19.10016'
zCodeVersion.getVersion = function () {
    return this.version;
};

zCodeVersion.remoteLargeLocal = function (remote) {
    var vA = remote.split('.');
    var vB = this.version.split('.');
    var re = false;
    try {
        var maxA = Number(vA[0]);
        var maxB = Number(vB[0]);
        if (maxA > maxB){
            re = true;
        }else {
            var minA = Number(vA[1]);
            var minB = Number(vB[1]);
            if (minA > minB){
                re = true;
            }
        }
    } catch (e) {
         re = false;
    }
    return re;
};
//远端大版本等于本地大版本
zCodeVersion.remoteEqualsLocal = function (remote) {
    var vA = remote.split('.');
    var vB = this.version.split('.');
    var re = false;
    try {
        var maxA = Number(vA[0]);
        var maxB = Number(vB[0]);
        var minA = Number(vA[1]);
        var minB = Number(vB[1]);
        if (maxA === maxB && minA === minB){
            re = true;
        }
    } catch (e) {
         re = false;
    }
    return re;
};
