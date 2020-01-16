var panel = require("panel");
var toggleHelper = require('toggleHelper');

cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        editBox:cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function(){
        this.toggleHelperJs.setIdxToggleCheck(0);
        this.sex = 1;
        this.switchTag(null,1);
        jsonTables.setEditBoxString(this.editBox,this.userLogic.getBaseData(this.userLogic.Type.Name));
    },

    switchTag:function(event,tag){
        this.sex = Number(tag);
        var spine = this.sex === 1 ? this.widget("selectCharacter/shrink/701a") : this.widget("selectCharacter/shrink/701b");
        this.widget("selectCharacter/shrink/701a").active = this.sex === 1;
        this.widget("selectCharacter/shrink/701b").active = this.sex === 2;
        spine.getComponent(sp.Skeleton).setAnimation(0,'std',true);
    },

    confirm:function(){
        var str = this.editBox.string;
        if(str === ""){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("rename","emptyName"));
            return;
        }
        var len = jsonTables.getStrLen(str);
        if(len > 16){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("rename","longName"));
            return;
        }
        window.adjustUtil.recored(tb.ADJUST_RECORED_NAME);
        // var head = this.userLogic.getBaseData(this.userLogic.Type.Icon);
        var url = this.userLogic.getBaseData(this.userLogic.Type.IconUrl);
        url = url || "";
        this.userLogic.req_Set_Name(this.editBox.string,this.sex,this.sex,url);
    },

    randobmName:function(){
        this.widget('selectCharacter/shrink/dice').getComponent(cc.Animation).play();
        jsonTables.setEditBoxString(this.editBox,this.loginLogic.getRandomName());
    },

    clickRole:function(){
        var node = this.sex === 1 ? this.widget("selectCharacter/shrink/701a"):this.widget("selectCharacter/shrink/701b")
        var spine = node.getComponent(sp.Skeleton);
        var list = [];
        for (var name in spine.skeletonData.skeletonJson.animations) {
            if (!spine.skeletonData.skeletonJson.animations.hasOwnProperty(name)) continue;
            if (name !== spine.animation && name !== "die" && name !== "std") {
                list.push(name);
            }
        }
        var name = jsonTables.random(list);
        if (name) {
            spine.setAnimation(0,name,true);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
