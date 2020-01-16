var panel = require("panel");
var toggleHelper = require('toggleHelper');

cc.Class({
    extends: panel,

    properties: {
        headItem:cc.Prefab,
        pageListPrefab:cc.Prefab,
        editBox:cc.EditBox,
        sexHelper:toggleHelper,
        headContryHelper:toggleHelper,
        contryPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.sex = constant.PlayerSex.BOY;
        this.pageList = this.widget("rename/frame").getInstance(this.pageListPrefab,true);
        this.pageList.position = this.widget("rename/frame/frame").position;
        this.initModule();
        this.registerEvent();
    },
    initModule:function(){
        this.nameLabel = this.widget("rename/frame/editBox").getComponent(cc.EditBox);
    },
    registerEvent: function () {
        var registerHandler = [
            ["resetSpine", this.resetSpine.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickPageItem", this.clickPageItem.bind(this)],
            ["clickContry", this.clickContry.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    resetSpine:function(){
        if(!this.node.active)   return;
        this.close();
    },

    open:function(){
        this.headID = 0;
        jsonTables.setEditBoxString(this.editBox,this.userLogic.getBaseData(this.userLogic.Type.Name));
        this.sex = this.userLogic.getBaseData(this.userLogic.Type.Sex);
        this.sex = this.sex  || 1;
        this.sexHelper.setIdxToggleCheck(this.sex-1);
        this.headContryTag = 0;
        this.headContryHelper.setIdxToggleCheck(this.headContryTag);
        this.contryID = this.userLogic.getBaseData(this.userLogic.Type.Country);
        if (!this.contryID) {
            this.contryID = jsonTables.getCoutryByLang(uiLang.language);
        }
        this.headContryEvent(null,this.headContryTag);
    },
    refreshHead:function(){
        var config = jsonTables.getJsonTable(jsonTables.TABLE.HEAD);
        var data = kf.clone(config);

        var url = this.loginLogic.getPlatformHeadUrl();
        if (url) {
            data.unshift({Tid:-1,url:url});
        }else {
            var userIcon = this.userLogic.getBaseData(this.userLogic.Type.Icon);
            for (var i = 0 , len = data.length; i <  len; i++) {
                var obj = data[i];
                if (obj[jsonTables.CONFIG_HEAD.Tid] === userIcon) {
                    var removeList = data.splice(i,1);
                    data.unshift(removeList[0]);
                    break;
                }
            }
        }
        var refreshData = {
            prefab:this.headItem,
            list:data,
            miniScale:0.4,
            cellSpacing:10,
            viewSize:cc.size(400,132)
        };
        this.headID = data[0][jsonTables.CONFIG_HEAD.Tid];
        this.url = "";
        this.pageList.getComponent("pageList").init(refreshData);
    },

    refreshContry:function(){
        var list = [];
        var config = jsonTables.getJsonTable(jsonTables.TABLE.COUNTRY);
        var idx = -1;
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i];
            if (i % 2 === 0) {
                idx++;
            }
            list[idx] = list[idx] || [];
            list[idx].push(obj);
        }
        var refreshData = {
            content:this.widget("rename/frame/scrollView/view/content"),
            list:list,
            prefab:this.contryPrefab,
            ext:this.contryID
        }
        uiManager.refreshView(refreshData);
    },

    sexEvent:function(event,param){
        this.sex = parseInt(param);
    },
    headContryEvent:function(event,tag){
        this.headContryTag = parseInt(tag);
        this.widget("rename/frame/scrollView").active = this.headContryTag == 1;
        this.pageList.active = this.headContryTag === 0;
        if (this.headContryTag === 0) {
            this.refreshHead();
        }else {
            this.refreshContry();
        }
    },
    confireEvent:function(event){
        if(this.nameLabel.string === ""){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"emptyName"));
            return;
        }
        var len = jsonTables.getStrLen(this.nameLabel.string);
        if(len > 20){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("rename","longName"));
            return;
        }
        var cancleCb = function () {
            // this.close();
        }.bind(this);
        var confirmCb = function () {
            this.userLogic.req_Set_Name(this.nameLabel.string,this.sex,this.headID,this.url);
            var contry = this.userLogic.getBaseData(this.userLogic.Type.Country);
            if (contry !== this.contryID) {
                this.userLogic.req_Set_Country(this.contryID);
            }
        }.bind(this);
        var name = this.userLogic.getBaseData(this.userLogic.Type.Name);
        var costDiamon = this.userLogic.getBaseData(this.userLogic.Type.ChangeNameCost);
        if (name !== this.nameLabel.string && costDiamon > 0) {
            uiManager.openUI(uiManager.UIID.BUY_CHECK,cancleCb,confirmCb);
        }else {
            confirmCb();
        }
    },

    randomName:function(){
        // this.widget('rename/frame/dice').getComponent(cc.Animation).play();
        jsonTables.setEditBoxString(this.editBox,this.loginLogic.getRandomName());
    },

    clickPageItem:function(event) {
        event.stopPropagation();
        var data = event.getUserData();
        this.headID = data[jsonTables.CONFIG_HEAD.Tid];
        var url = this.loginLogic.getPlatformHeadUrl();
        url = url || "";
        this.url = this.headID === -1 ? url : "";
    },

    clickContry:function(event){
        event.stopPropagation();
        var id = event.getUserData();
        this.contryID = id;
        this.refreshContry();
    },

    editBegin:function (event) {
        if(cc.sys.os !== cc.sys.OS_WINDOWS){
            uiManager.openUI(uiManager.UIID.EDIT_PANEL,this.editBox);
        }
    },

    // update (dt) {},
});
