var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        frame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data,cb){
        this.userID = data.UserID;
        this.idx = idx;
        this.widget("rankItem/rankingIcon").active = idx <= 2;
        if(this.widget("rankItem/rankingIcon").active){
            this.widget("rankItem/rankingIcon").getComponent(cc.Sprite).spriteFrame = this.frame[idx];
        }
        this.widget("rankItem/numberLabel").getComponent(cc.Label).string = idx +1;
        var nameIdx = data.Name.indexOf("\n")
        if(nameIdx !== -1); {
            data.Name = data.Name.replace("\n", "")
        }
        this.widget("rankItem/nameLabel").getComponent(cc.Label).string = data.Name;
        if(data.type === constant.RankType.LEVEL) {
            this.widget("rankItem/powerLabel").getComponent(cc.Label).string = Math.floor(data.Score/1000);
        }
        // this.widget("rankItem/iconCountry").active = data.type === constant.RankType.LEVEL || data.type === constant.RankType.AREAN;

        this.widget("rankItem/towerLabel").getComponent(cc.Label).string = data.Score % 1000;
        if(this.widget("rankItem/iconCountry").active){
            data.Country = data.Country||101;
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.COUNTRY,data.Country);
            uiResMgr.loadCountryIcon(config[jsonTables.CONFIG_COUNTRY.CountryIcon],this.widget("rankItem/iconCountry"));
        }
        this.widget("rankItem/selected").active = false;
        if(cb(idx)){
            this.clickItem("",true);
        }
    },
    //isAuto:这是我刷新页面时候调用的，外部不用关闭背景
    clickItem:function(event,isAuto){
        this.widget("rankItem/selected").active = true;
        var ev = new cc.Event.EventCustom('clickItem', true);
        var data = {
            node:this.node,
            idx:this.idx,
            isAuto:isAuto
        }
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    // update (dt) {},
});
