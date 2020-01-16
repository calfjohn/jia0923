var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rankSprites:[cc.SpriteFrame],
        formation:[cc.Node],
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data,cb){
        this.userID = data.UserID;
        this.idx = idx;
        this.widget("areanRankItem/rankingIcon").active = idx <= 2;
        if(this.widget("areanRankItem/rankingIcon").active){
            this.widget("areanRankItem/rankingIcon").getComponent(cc.Sprite).spriteFrame = this.rankSprites[idx];
        }
        this.widget("areanRankItem/numberLabel").getComponent(cc.Label).string = idx +1;
        var nameIdx = data.Name.indexOf("\n")
        if(nameIdx !== -1); {
            data.Name = data.Name.replace("\n", "")
        }
        this.widget("areanRankItem/nameLabel").getComponent(cc.Label).string = data.Name;
        this.widget("areanRankItem/powerLabel").getComponent(cc.Label).string = data.Score;

        // this.widget("areanRankItem/iconCountry").active = data.type === constant.RankType.LEVEL || data.type === constant.RankType.AREAN;

        if(this.widget("areanRankItem/iconCountry").active){
            data.Country = data.Country||101;
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.COUNTRY,data.Country);
            uiResMgr.loadCountryIcon(config[jsonTables.CONFIG_COUNTRY.CountryIcon],this.widget("areanRankItem/iconCountry"));
        }
        this.widget("areanRankItem/selected").active = false;

        this.initFormation(data.formation);

        var danInfo = this.areanLogic.getDivInfo(data.Score,false);
        if (danInfo) {
            uiResMgr.loadAreanIcon(danInfo.DicIcon,this.widget("areanRankItem/areanRank"));
            for (var i = 1 , len = 4; i < len; i++) {
                var node = this.widget("areanRankItem/areanRank/starBright" + i);
                node.active = i <= danInfo.StarNum;
            }
        }
        if(cb(idx)){
            this.clickItem("",true);
        }
    },

    initFormation: function (formation) {
        var formtionCopy = kf.clone(formation);
        if(this.userID.toNumber() === this.userLogic.getBaseData(this.userLogic.Type.UserID).toNumber()) {
            formtionCopy = this.cardLogic.getLineUpInfo();
        }
        for (var i = 0; i < formtionCopy.length; i++) {
            var obj = formtionCopy[i];
            if(!this.formation[i]) continue;
            var family = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj);
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,family.Monsters[0]);
            var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
            uiResMgr.loadHeadIcon(iconRes,this.formation[i]);
        }
    },

    //isAuto:这是我刷新页面时候调用的，外部不用关闭背景
    clickItem:function(event,isAuto){
        this.widget("areanRankItem/selected").active = true;
        var ev = new cc.Event.EventCustom('clickItem', true);
        var data = {
            node:this.node,
            idx:this.idx,
            isAuto:isAuto
        }
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
