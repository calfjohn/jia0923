var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init(idx,data){
        this.rewardPrefab = uiResMgr.getPrefabSelf("rewardItem");
        this.node.getComponent(cc.Sprite).enabled = idx !== -1;
        this.data = data;
        // this.scheduleOnce(function () {
            this.widget('dailyItem/achievementItemLabel').getComponent(cc.Label).string = uiLang.getConfigTxt(data.NameID);
            this.widget('dailyItem/schedule/progressBar').getComponent(cc.ProgressBar).progress = data.Value/data.MaxValue;
            this.widget('dailyItem/schedule/numberLabel1').getComponent(cc.Label).string = data.Value + "/" +data.MaxValue;
            uiResMgr.loaTaskIcon(data.Icon,this.widget('dailyItem/icon'));
            this.widget('dailyItem/activeLabel').getComponent(cc.Label).string = "活跃度"+this.data.Rewards[0].Num;
            // for (var i = 0 , len = this.content.children.length; i < len; i++) {
            //     var obj = this.content.children[i];
            //     obj.active = !!data.Rewards[i];
            //     if (obj.active) {
            //         var reward = obj.getInstance(this.rewardPrefab,true);
            //         var info = kf.clone(data.Rewards[i]);
            //         info.Num = 0;
            //         reward.getComponent(this.rewardPrefab.name).init(0,info);
            //
            //         var addStr = data.Rewards[i].Type ===constant.ItemType.EQUIP?"LV":"x";
            //         obj.getChildByName("numberLabel").getComponent(cc.Label).string = addStr + data.Rewards[i].Num ;
            //         obj.getChildByName("numberLabel").zIndex = 10;
            //     }
            // }
            this.widget('dailyItem/button6').active = data.Status === this.taskLogic.STATE_ENUM.CAN_REWARD;
            this.widget('dailyItem/button5').active = data.Status === this.taskLogic.STATE_ENUM.GOT_REWARD;
            this.widget('dailyItem/label').active = data.Status === this.taskLogic.STATE_ENUM.ING && this.data.Jump === 0;
            this.widget('dailyItem/button7').active = data.Status === this.taskLogic.STATE_ENUM.ING && this.data.Jump !== 0 && this.data.Jump !== 999;
            this.widget('dailyItem/button8').active = data.Status === this.taskLogic.STATE_ENUM.ING && this.data.Jump !== 0 && this.data.Jump === 999;
        // },(idx) * 0.01);
    },

    clickBtn:function(){
        if(this.data.Status === this.taskLogic.STATE_ENUM.ING && this.data.Jump === 999){//观看广告特殊处理
            this.adHelperLogic.req_Watch_Adv(constant.AdvType.DAILY);
            return;
        }
        this.node.dispatchDiyEvent("clickDaily",this.data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
