var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        monItem:cc.Prefab,
        arenBg2X: {
            default: -798,
            tooltip: "arenBg2 在动画机第一帧 x位置"
        },
        arenBg3X: {
            default: 939,
            tooltip: "arenBg3 在动画机第一帧 x位置"
        },
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initNodes();
        uiManager.loadAsyncPrefab(uiManager.UIID.AREAN_WAITE,function(){});
    },


    initNodes:function(){
        this.redName = this.widget('areanLoading/shrink/battleFrame/numberLabel');
        this.redRank = this.widget('areanLoading/shrink/battleFrame/layout/integralLabel');
        this.blueName = this.widget('areanLoading/shrink/battleFrame1/numberLabel');
        this.blueRank = this.widget('areanLoading/shrink/battleFrame1/layout/integralLabel');
        this.selectNode = this.widget('areanLoading/select');
    },

    open:function(param){

        var enmeyData = this.userLogic.isMe(param.PlayerBlud.Uid) ?  param.PlayerBlud : param.PlayerRed;
        var mineData = this.userLogic.isMe(param.PlayerBlud.Uid) ?  param.PlayerRed : param.PlayerBlud;
        this.redName.getComponent(cc.Label).string = mineData.Name;
        this.redRank.getComponent(cc.Label).string = mineData.Score;
        uiResMgr.loadPlayerHead(mineData.IconID,mineData.IconUrl,this.widget("areanLoading/shrink/battleFrame/headItem/mask/headIcon"));

        this.blueName.getComponent(cc.Label).string = enmeyData.Name;
        this.blueRank.getComponent(cc.Label).string = enmeyData.Score;
        uiResMgr.loadPlayerHead(enmeyData.IconID,enmeyData.IconUrl,this.widget("areanLoading/shrink/battleFrame1/headItem/mask/headIcon"));

        var parent = this.widget("areanLoading/backGround/areanBg2");
        parent.x = this.arenBg2X;
        this._resetSpine(parent,enmeyData,1);
        var parent = this.widget("areanLoading/backGround/areanBg3");
        parent.x = this.arenBg3X;
        this._resetSpine(parent,mineData,3);
        var ani = this.node.getComponent(cc.Animation);
        setTimeout(function () {

            ani.playAdditive(ani.defaultClip.name).once(constant.AnimationState.FINISHED, function () {
                this.scheduleOnce(function () {
                    this.areanLogic.req_Arena_Start();
                },1);
            }, this);
        }.bind(this), 1000);
    },

    _resetSpine:function(parent,serverData,idx){//param.PlayerBlud
        var lines = this.fightLogic.getBaseFamilyIDs();
        var lineIdx = 0;
        for (var i = 0 , len = 4; i <  len; i++) {
            var node = parent.children[i];
            var spine = node.getInstance(this.monItem,true);
            var roleInfo = null;
            var monTid = 0;
            if (i === 0) {
                monTid = jsonTables.profession2Monster(serverData.Role.Occupation,serverData.Role.Sex);
                roleInfo = serverData.Role;
            }else {
                var familyID = 0;
                var quality = 1;
                if (this.userLogic.isMe(serverData.Uid)) {
                    familyID = lines[lineIdx];
                    quality = this.cardLogic.getHeroMaxQuality(familyID);
                    lineIdx++;
                }else {
                    familyID = serverData.Formation[i - 1].FamilyID;
                }
                var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
                var monsters = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters];
                var monTid = monsters[quality-1];
            }
            var data = {tid:monTid,pos:cc.v2(0,0),roleInfo:roleInfo};
            spine.getComponent(this.monItem.name).init(idx,data,true);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
