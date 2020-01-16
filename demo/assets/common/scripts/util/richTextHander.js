cc.Class({
    extends: cc.Component,

    properties: {
        richText:cc.RichText
    },

    // use this for initialization
    onLoad: function () {
    },

    dealMsg:function(str){
        var stringArr = str.split("}");
        if (stringArr.length === 1) return str;

        var realStringArr = [];
        var urls = [];
        for(var i = 0; i < stringArr.length; i++) {
            if (stringArr[i] === "") continue;
            var strArr = stringArr[i].split("{");
            if (strArr[1]) {
                var spliArr = strArr[1].split("#");
                if (spliArr.length > 1) {
                    urls[urls.length] = jsonTables.trim(spliArr[1]);
                    strArr[1] = rText.addFuncStr(spliArr[0],("openUrl"+(urls.length-1)));
                }else {
                    strArr[1] = "";
                    cc.error("公告格式不匹配")
                }
            }
            var addstr = strArr.join("");
            realStringArr.push(addstr);
        }
        var realString = realStringArr.join("");
        this.reigeisterFunc(urls);
        return realString;
    },

    setString:function(str){
        this.urls = [];
        str = str || "";
        str = this.dealMsg(str);
        this.richText.string = str;
    },

    openUrl:function(param){
        if (!this.urls[param]) return;
        cc.sys.openURL(this.urls[param])
    },

    reigeisterFunc:function(urls){
        this.urls = urls;
        var len = urls.length;
        var self = this;
        for (var i = 0; i < len; i++) {
            (function(i){
                self["openUrl" + i] = function(){
                    self.openUrl(i);
                }.bind(self);
            })(i);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
