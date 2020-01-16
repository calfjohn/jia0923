var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
    },

    onLoad:function(){
        jsonTables.parsePrefab(this);
        this.showIdx = 1;
        this.playList = [];//播放列表。一次性获得多个家族者需要一个一个的播放
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if(param.name === "familyAnimation3"){
            this.widget("familyEffectEx/spine/spine0").getComponent(sp.Skeleton).setAnimation(0,'atk',false);
            this.widget("familyEffectEx/spine/spine0").getComponent(sp.Skeleton).addAnimation(0,'std',true);
            this.scheduleOnce(function(){
                this.touchEnable = true;
            }.bind(this),0.5);
        }
    },

    open:function(info,callback){
        if(!info)   return;
        callback = callback ? callback:function(){};
        var data = {
            familyID:info.FamilyID,
            exp:info.Exp,
            callback:callback,
        }
        this.playList.push(data);
        if(this.playList.length === 1 ){
            this.popData();
        }
    },
    popData:function(){
        if(this.playList.length === 0){
            this.close();
            return;
        }
        this.touchEnable = false;

        var familyID = this.playList[0].familyID;
        var newInfo = this.cardLogic.getNewFamilyList(familyID);//如果是新建家族，就有信息
        if(newInfo){
            cc.log("new" + familyID)
            this.widget("familyEffectEx/leaf/label").getComponent(cc.Label).string = "+" +newInfo.Exp;
        }
        this.widget("familyEffectEx/leaf").active = !!newInfo;
        this.widget("familyEffectEx/lable2").active = !!newInfo;
        this.widget("familyEffectEx/lable1").active = !newInfo;
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);//家族配置表基本数据
        var quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];

        uiResMgr.loadQualityLvIcon(quality,this.widget("familyEffectEx/letterForm3"));
        jsonTables.loadConfigTxt(this.widget("familyEffectEx/letterForm3/label"),baseData[jsonTables.CONFIG_MONSTERFAMILY.NameID]);

        var tid = baseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][4];

        let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        // this.widget("familyEffectEx/spine/spine0").setLocalZOrderEx(this.spineZOrder[i]);
        this.widget("familyEffectEx/spine/spine0").active = false;
        let callBack = function(spineData){
            this.widget("familyEffectEx/spine/spine0").getComponent(sp.Skeleton).skeletonData  = spineData;
            this.widget("familyEffectEx/spine/spine0").getComponent(sp.Skeleton).setAnimation(0,'std',true);
            this.widget("familyEffectEx/spine/spine0").active = true;
        }.bind(this);
        uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callBack);
        // this.widget("familyEffectEx/spine/spine0").x = spineConfig[jsonTables.CONFIG_MONSTER.XOffset];
        // this.widget("familyEffectEx/spine/spine0").y = spineConfig[jsonTables.CONFIG_MONSTER.YOffset];
        // this.widget("familyEffectEx/spine/spine0").scale = spineConfig[jsonTables.CONFIG_MONSTER.DateScale] / 100;

        // this.showNumLabel.string =0;
        this.ani.play("familyAnimation3");
        this.ani.setCurrentTime(0);
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.MONSTERGATHER);
    },
    clickNext:function(){
        if(!this.touchEnable)   return;
        var data = this.playList.shift();
        data.callback();
        this.popData();
    },
    // update (dt) {},
});
