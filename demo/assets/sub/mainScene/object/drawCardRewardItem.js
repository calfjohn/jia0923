var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    onLoad () {
        this.rewardNum = this.widget("drawCardRewardItem/number");
    },

    init:function(idx,data) {
        this.data = data;
        var reelList = [
            constant.ItemType.REEL,
            constant.ItemType.RANDOM_REEL,
            constant.ItemType.RANDOM_REEL_MAX,
        ]
        this.widget("drawCardRewardItem/lightEffect").active = false;
        this.widget("drawCardRewardItem/positive").active = false;
        this.widget("drawCardRewardItem/reelItem").active = kf.inArray(reelList,data.Type);
        this.widget("drawCardRewardItem/rewardItem").active = !this.widget("drawCardRewardItem/reelItem").active;
        this.widget("drawCardRewardItem/rewardItem/bonus").active = !!data.isExtra;
        this.widget("raceEffect1").active = data.Type === constant.ItemType.HERO;
        if (data.Type === constant.ItemType.HERO || data.Type === constant.ItemType.EQUIP) {
            var baseData =  data.Type === constant.ItemType.HERO ? jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.BaseID) : jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,data.BaseID);//家族配置表基本数据
            var quality = baseData.Quality;
            if(data.Type === constant.ItemType.HERO){
                uiResMgr.loadMonTypeIcon(baseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("raceEffect1"));
                var needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[quality - 1];//解锁需要的碎片数
                this.widget("drawCardRewardItem/positive").active = quality >= tb.MONSTER_A && data.Num === needDebris;
            }else{
                this.widget("drawCardRewardItem/positive").active = false;
            }
            this.widget("drawCardRewardItem/lightEffect").active = quality >= tb.MONSTER_A;
        }
        var itemType = this.widget("drawCardRewardItem/reelItem").active?"drawCardRewardItem/reelItem/":"drawCardRewardItem/rewardItem/";
        var addStr = data.Type ===constant.ItemType.EQUIP?"LV":"x";
        if(this.rewardNum) {
            this.rewardNum.getComponent(cc.Label).string = addStr + NP.dealNum(data.Num,constant.NumType.TEN);
            this.rewardNum.active = data.Num !== 0;
        }
        var iconStr = this.widget("drawCardRewardItem/reelItem").active?"mask/icon":"icon";
        this.widget(itemType + "iconFrame").active = true;
        uiResMgr.loadRewardIcon(this.widget(itemType + iconStr),data.Type,data.BaseID,this.widget(itemType + "iconFrame"),this.widget(itemType + "qualityFrame1"));
    },

    playFamilyAnim: function () {
        var anim = this.node.getComponent(cc.Animation);
        var animName = anim.defaultClip.name;
        if(this.widget("drawCardRewardItem/positive").active) {
            var baseData =  this.data.Type === constant.ItemType.HERO ? jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.data.BaseID) : jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,this.data.BaseID);//家族配置表基本数据
            var quality = baseData.Quality;
            switch (quality) {
                case tb.MONSTER_A:
                    animName = anim.getClips()[1].name;
                    break;
                case tb.MONSTER_S:
                    animName = anim.getClips()[2].name;
                    break;
                case tb.MONSTER_SS:
                    animName = anim.getClips()[3].name;
                    break;
                default:
                    animName = anim.defaultClip.name;
                    break;

            }
        }
        anim.play(animName);
    },

    getDelayTime: function () {
        var anim = this.node.getComponent(cc.Animation);
        var animName = anim.defaultClip.name;
        if(this.widget("drawCardRewardItem/positive").active) {
            var baseData =  this.data.Type === constant.ItemType.HERO ? jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.data.BaseID) : jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,this.data.BaseID);//家族配置表基本数据
            var quality = baseData.Quality;
            switch (quality) {
                case tb.MONSTER_A:
                    animName = anim.getClips()[1].name;
                    break;
                case tb.MONSTER_S:
                    animName = anim.getClips()[2].name;
                    break;
                case tb.MONSTER_SS:
                    animName = anim.getClips()[3].name;
                    break;
                default:
                    animName = anim.defaultClip.name;
                    break;

            }
        }
        var state = anim.getAnimationState(animName);
        var duration = state.duration;
        return duration;
    }
});
