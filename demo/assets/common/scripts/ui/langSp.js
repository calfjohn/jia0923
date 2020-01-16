
let _baseObj = cc.Class({
    name:"baseObj",
    properties: {
        en: {
            default: null,
            type:cc.SpriteFrame,
            tooltip: "英文纹理"
        },
        cn: {
            default: null,
            type:cc.SpriteFrame,
            tooltip: "繁體纹理"
        },
        zh: {
            default: null,
            type:cc.SpriteFrame,
            tooltip: "简体中文纹理"
        },
    },

});
var panel = require("panel");

cc.Class({
    extends: panel,
    editor: {
        menu:"util/多语言图片组件",
        requireComponent:cc.Sprite,
        disallowMultiple:true,
    },
    properties: {
        spriteFrames:_baseObj
    },

    onLoad:function(){
        this.sp = this.node.getComponent(cc.Sprite);
        this.registerEvent();
    },

    start:function(){
        this.changeLanguage();
    },

    registerEvent: function () {

        var registerHandler = [
            ["changeLanguage", this.changeLanguage.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
    },

    changeLanguage:function(){
        var tag = uiLang.language;
        this.sp.spriteFrame = null;
        if (this.spriteFrames[tag]) {
            this.sp.spriteFrame = this.spriteFrames[tag];
        }else{
            cc.error(this.node.name + "缺失多语言图片")
            // this.sp.spriteFrame = this.spriteFrames["zh"];
        }
    },

    // update (dt) {},
});
