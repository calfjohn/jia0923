var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    onLoad () {
        this.rewardNum = this.widget("actRewardItem/number");
        // if(this.rewardNum) this.rewardNum.setLocalZOrderEx(5);//设置右下角数字显示层级
    },

    init(idx,data,noRefresh){
        var reelList = [
            constant.ItemType.REEL,
            constant.ItemType.RANDOM_REEL,
            constant.ItemType.RANDOM_REEL_MAX,
        ]
        //判断当前显示的是哪种奖励,三种界面互斥
        this.widget("actRewardItem/reelItem").active = kf.inArray(reelList,data.Type);//设置金币框生成并控制预制体
        this.widget("actRewardItem/rewardItem").active = !this.widget("actRewardItem/reelItem").active;
        this.widget("actRewardItem/boxItem").active = idx === 2 && this.widget("actRewardItem/rewardItem").active && this.widget("actRewardItem/reelItem").active;//判断这次是否是箱子生成
        this.widget("actRewardItem/rewardItem/raceEffect1").active = data.Type === constant.ItemType.HERO;
        if(this.widget("actRewardItem/rewardItem/raceEffect1").active){
            var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.BaseID);//家族配置表基本数据
            uiResMgr.loadMonTypeIcon(baseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("actRewardItem/rewardItem/raceEffect1"));//设置怪物显示
        }
        var itemType = this.widget("actRewardItem/reelItem").active?"actRewardItem/reelItem/":"actRewardItem/rewardItem/";
        var addStr = data.Type === constant.ItemType.EQUIP?"LV":"x";
        var iconStr = this.widget("actRewardItem/reelItem").active?"mask/icon":"icon";
        this.widget(itemType + "iconFrame").active = true;//设置显示icon节点
        if(this.rewardNum){
            this.rewardNum.getComponent(cc.Label).string = addStr + NP.dealNum(data.Num,constant.NumType.TEN);
            this.rewardNum.active = data.Num != 0;
        }
        if(this.widget("actRewardItem/boxItem").active){
            var iconID = Math.floor(data.BaseID / 100000);//对箱子进行特殊处理
            uiResMgr.loadLockTreasureBox(iconID, this.widget("actRewardItem/boxItem/icon"));
        }else{
            uiResMgr.loadRewardIcon(this.widget(itemType + iconStr),data.Type,data.BaseID,this.widget(itemType + "iconFrame"),this.widget(itemType + "qualityFrame1"),noRefresh);
        }
        
        // var isHideBg = data.isHideBg;
        // if(isHideBg){
        //     this.widget(itemType + "iconFrame").active = !isHideBg;
        //     if(this.widget(itemType + "qualityFrame1").active){
        //         this.widget(itemType + "qualityFrame1").active = !isHideBg;
        //     }
        // }
    },

    start () {

    },

    // update (dt) {},
});
