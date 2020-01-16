var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        sexSprite:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["changeLanguage", this.changeLanguage.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    contryChange:function(){
        var contryID = this.userLogic.getBaseData(this.userLogic.Type.Country);
        if (!contryID) {
            contryID = jsonTables.getCoutryByLang(uiLang.language);
        }
        var data = jsonTables.getJsonTableObj(jsonTables.TABLE.COUNTRY,contryID);
        uiResMgr.loadCountryIcon(data[jsonTables.CONFIG_COUNTRY.CountryIcon],this.widget("information/frame/country"));
    },

    changeLanguage:function(){
        var id = this.userLogic.getBaseData(this.userLogic.Type.UserID).toNumber();
        this.widget('information/frame/idLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"id") + id;
        this.widget('information/frame/nameLabel').getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.Name);
        // var invite = id.toString(16);//16转10
        // cc.log(parseInt(invite,16))
        this.widget('information/frame/inviteLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"invite") + id.toString(16);
    },

    open:function(infoData){
        this.infoData = infoData;
        this.widget('information/frame/invite').active = !infoData;
        this.widget('information/frame/btn').active = !infoData;
        this.widget('information/frame/man').active = !infoData;
        if(!infoData){
            this.refresh();
            this.contryChange();
        }else{
            var url = infoData.IconUrl;
            url = !url ? "":url;
            var iconID = infoData.Icon ? infoData.Icon : 1;
            uiResMgr.loadPlayerHead(iconID,url,this.widget('information/frame/headItem/mask/headIcon'));
            var id = infoData.Uid.toNumber();
            this.widget('information/frame/idLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"id") + id;
            this.widget('information/frame/nameLabel').getComponent(cc.Label).string = infoData.Name;
            this.widget('information/frame/inviteLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"invite") + id.toString(16);
        }

    },

    refresh:function(){
        var sex = this.userLogic.getBaseData(this.userLogic.Type.Sex);
        var idx = sex === 0 ? 0: sex-1;
        this.widget('information/frame/man').getComponent(cc.Sprite).spriteFrame = this.sexSprite[idx];
        this.changeLanguage();
        var url = this.userLogic.getBaseData(this.userLogic.Type.IconUrl);
        url = !url ? "":url;
        var iconID = this.userLogic.getBaseData(this.userLogic.Type.Icon);
        uiResMgr.loadPlayerHead(iconID,url,this.widget('information/frame/headItem/mask/headIcon'));
    },



    copyEvent:function(){
        var id = this.infoData ? this.infoData.Uid.toNumber() : this.userLogic.getBaseData(this.userLogic.Type.UserID).toNumber();
        if (kf.require("util.captureTool").copyBoard(id.toString())) {
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("setting","copy"));
        }
    },

    openUi:function(_,param){
        // if () return;
        if(Number(param) === uiManager.UIID.MINE_UI && !jsonTables.isLineUpVaild())     return;
        uiManager.openUI(Number(param));
    },

    fixInfo:function(){
        this.close();
        uiManager.openUI(uiManager.UIID.RENAME);
    },


    // update (dt) {},
});
