var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.rewardNum = this.widget("rewardItem/number");
        if(this.rewardNum) this.rewardNum.setLocalZOrderEx(5);
    },
    init:function(idx,data,noRefresh) {
        var reelList = [
            constant.ItemType.REEL,
            constant.ItemType.RANDOM_REEL,
            constant.ItemType.RANDOM_REEL_MAX,
        ]
        this.widget("rewardItem/reelItem").active = kf.inArray(reelList,data.Type);
        this.widget("rewardItem/rewardItem").active = !this.widget("rewardItem/reelItem").active;
        this.widget("raceEffect1").active = data.Type === constant.ItemType.HERO;
        if (this.widget("raceEffect1").active) {
            var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.BaseID);//家族配置表基本数据
            var quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
            uiResMgr.loadMonTypeIcon(baseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("raceEffect1"));
        }
        var itemType = this.widget("rewardItem/reelItem").active?"rewardItem/reelItem/":"rewardItem/rewardItem/";
        var addStr = data.Type ===constant.ItemType.EQUIP?"LV":"x";
        if(this.rewardNum) {
            this.rewardNum.getComponent(cc.Label).string = addStr + NP.dealNum(data.Num,constant.NumType.TEN);
            this.rewardNum.active = data.Num !== 0;
        }
        var iconStr = this.widget("rewardItem/reelItem").active?"mask/icon":"icon";
        this.widget(itemType + "iconFrame").active = true;
        uiResMgr.loadRewardIcon(this.widget(itemType + iconStr),data.Type,data.BaseID,this.widget(itemType + "iconFrame"),this.widget(itemType + "qualityFrame1"),noRefresh);
        var isHideBg = data.isHideBg;
        if(isHideBg) {
            this.widget(itemType + "iconFrame").active = !isHideBg;
            if(this.widget(itemType + "qualityFrame1").active){
                this.widget(itemType + "qualityFrame1").active = !isHideBg;
            }
        }
    },

    //特殊奖励不需要前景
    initEx:function(idx,data,noRefresh) {
        var reelList = [
            constant.ItemType.REEL,
            constant.ItemType.RANDOM_REEL,
            constant.ItemType.RANDOM_REEL_MAX,
        ]
        this.widget("rewardItem/reelItem").active = kf.inArray(reelList, data.Type);
        this.widget("rewardItem/rewardItem").active = !this.widget("rewardItem/reelItem").active;
        this.widget("raceEffect1").active = data.Type === constant.ItemType.HERO;
        if (this.widget("raceEffect1").active) {
            var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY, data.BaseID);//家族配置表基本数据
            var quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
            uiResMgr.loadMonTypeIcon(baseData[jsonTables.CONFIG_MONSTERFAMILY.Type], this.widget("raceEffect1"));
        }
        var itemType = this.widget("rewardItem/reelItem").active ? "rewardItem/reelItem/" : "rewardItem/rewardItem/";
        var addStr = data.Type === constant.ItemType.EQUIP ? "LV" : "x";
        if (this.rewardNum) {
            this.rewardNum.getComponent(cc.Label).string = addStr + NP.dealNum(data.Num, constant.NumType.TEN);
            this.rewardNum.active = data.Num !== 0;
        }
        var iconStr = this.widget("rewardItem/reelItem").active ? "mask/icon" : "icon";
        this.widget(itemType + "iconFrame").active = true;
        this.widget(itemType + "qualityFrame1").active = false;
        uiResMgr.loadRewardIcon(this.widget(itemType + iconStr), data.Type, data.BaseID, this.widget(itemType + "iconFrame"), this.widget(itemType + "qualityFrame1"), noRefresh);
    }

    // update (dt) {},
});
