var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardNodes:[cc.Node],
    },

    // use this for initialization
    onLoad: function () {
        this.isInitDone = false;
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["getAchiAction", this.getAchiAction.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    setData:function(data){
        this.rewardPrefab = uiResMgr.getPrefabSelf("rewardItem");
        var nameStr = uiLang.getConfigTxt(data.NameID);
        // this.widget('achievementItem/nameLabel').getComponent(cc.Label).string = nameStr;
        var descName =  uiLang.getConfigTxt(data.DecID);
        this.widget('achievementItem/content/descLabel').getComponent(cc.Label).string = descName.formatArray([data.Max]);
         //IconID
        var state = this.achievementLogic.getOneState(data.ID);
        this.widget('achievementItem/token').active = state === this.achievementLogic.STATE_ENUM.CAN_TOOK;
        this.widget('achievementItem/allDone').active = state === this.achievementLogic.STATE_ENUM.DONE_TOKEN || state === this.achievementLogic.STATE_ENUM.ALL_DONE;

        this.widget('achievementItem/content/progressBar').active = state === this.achievementLogic.STATE_ENUM.CANT_TOOK && (data.Cur/data.Max < 1)
        if (this.widget('achievementItem/content/progressBar').active) {
            this.widget('achievementItem/content/progressBar').getComponent(cc.ProgressBar).progress = data.Cur/data.Max;
            this.widget('achievementItem/content/progressBar/label').getComponent(cc.Label).string = data.Cur+"/"+data.Max;
        }
        this.widget("achievementItem/doing").active = state === this.achievementLogic.STATE_ENUM.CANT_TOOK;

        for (var i = 0 , len = this.rewardNodes.length; i < len; i++) {
            var obj = this.rewardNodes[i];
            obj.active = !!data.Rewards[i] && (state === this.achievementLogic.STATE_ENUM.CAN_TOOK || state === this.achievementLogic.STATE_ENUM.CANT_TOOK) ;
            if (obj.active) {
                let item = obj;
                let idx = i;
                var delay = 0.25 * (i+1);
                if (!this.isInitDone) {
                    this.isInitDone = true;
                }else {
                    delay = 0;
                }
                this.scheduleOnce(function(){
                    var reward = item.getInstance(this.rewardPrefab,true);
                    var info = kf.clone(data.Rewards[idx]);
                    info.Num = 0;
                    reward.getComponent(this.rewardPrefab.name).init(0,info);
                    item.getChildByName("number").getComponent(cc.Label).string =  "x" + NP.dealNum(data.Rewards[idx].Num,constant.NumType.TEN);
                    item.getChildByName("number").zIndex = 99;
                },delay);
            }
        }

    },

    getAchiAction:function(idx,getID){

    },


    init:function(idx,data,extScript){
        this.idx = idx;
        this.data = data;
        this.setData(data);
    },

    clickBtn:function(){
        this.node.dispatchDiyEvent("clickAchieve",this.data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
