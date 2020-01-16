var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        cardItemSp:[cc.SpriteFrame],
        cardLight:cc.Prefab,
        lightFrame:[cc.SpriteFrame],
        reelFrame:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },
    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED || param.name !== "rewardFly") return;
        this.node.active = false;
        this.node.position = cc.v2(0,0);//重置状态，因为会播一个动画，会改变位置和透明度
        this.node.opacity = 255;
    },
    playFly:function(){
        this.ani.play("rewardFly");
    },
    init:function(idx,data) {
        var reelList = [
            constant.ItemType.REEL,
            constant.ItemType.RANDOM_REEL,
            constant.ItemType.RANDOM_REEL_MAX,
        ]
        this.widget("rewardItemEx/reelItem").active = kf.inArray(reelList,data.Type);
        this.widget("rewardItemEx/rewardItem").active = !this.widget("rewardItemEx/reelItem").active;
        var itemType = this.widget("rewardItemEx/reelItem").active?"rewardItemEx/reelItem/":"rewardItemEx/rewardItem/";
        var addStr = data.Type ===constant.ItemType.EQUIP?"LV":"x";
        this.widget("rewardItemEx/number").getComponent(cc.Label).string = addStr + NP.dealNum(data.Num,constant.NumType.TEN);
        this.widget("rewardItemEx/number").active = data.Num !== 0;
        this.widget("rewardItemEx/number").zIndex = 99;
        var iconStr = this.widget("rewardItem/reelItem").active?"mask/icon":"icon";
        this.widget(itemType + "iconFrame").active = true;
        var clipFrame = this.widget("rewardItemEx/rewardItem").active ? null : this.widget(itemType + "iconFrame");
        var clipBase = this.widget("rewardItemEx/rewardItem").active ? null :this.widget(itemType + "qualityFrame1");
        uiResMgr.loadRewardIcon(this.widget(itemType + iconStr),data.Type,data.BaseID,clipFrame,clipBase);
        if (this.widget("rewardItemEx/rewardItem").active) {
            this.widget("rewardItemEx/rewardItem/raceEffect1").active = data.Type === constant.ItemType.HERO;
            var quality = 1;
            switch (data.Type) {
                case constant.ItemType.HERO://英雄碎片
                    var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.BaseID);//家族配置表基本数据
                    if(!baseData)   return;
                    quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
                    uiResMgr.loadMonTypeIcon(baseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("rewardItemEx/rewardItem/raceEffect1"));
                    break;
                case constant.ItemType.EQUIP://装备
                    var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,data.BaseID);//装备配置表基本数据
                    if(!baseData)   return;
                    quality = baseData[jsonTables.CONFIG_EQUIP.Quality];
                    break;
            }
            this.widget(itemType + "iconFrame").getComponent(cc.Sprite).spriteFrame = this.cardItemSp[quality - 1];
        }
        var isHideBg = data.isHideBg;
        this.widget(itemType + "iconFrame").active = !isHideBg;
        if(this.widget(itemType + "qualityFrame1").active){
            this.widget(itemType + "qualityFrame1").active = !isHideBg;
        }

        // var statue = data.Type === constant.ItemType.GOLD || data.Type === constant.ItemType.DIAMOND;
        // var item = this.node.getInstance(this.cardLight,true);
        // if(item){
        //     item.setLocalZOrderEx(4);//比数量层级低
        //     var frame = null;
        //     if(data.Type === constant.ItemType.REEL){
        //         var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,data.BaseID);
        //         var quality = reelData[jsonTables.CONFIG_REEL.ReelQua];
        //         frame = this.reelFrame[quality];
        //     }else{
        //         frame = this.lightFrame[data.Type];
        //     }
        //     item.getComponent(cc.Sprite).spriteFrame = frame;
        // }
    },
    // update (dt) {},
});
