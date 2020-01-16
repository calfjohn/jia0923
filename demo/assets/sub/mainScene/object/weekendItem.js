var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content:cc.Node,
        dailyScorelabel:[cc.Label],
        weekIcon:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init(idx,data){
            this.rewardPrefab = uiResMgr.getPrefabSelf("rewardItem");
            this.node.getComponent(cc.Sprite).enabled = idx !== -1;
            this.data = data;
            var boxId = [];``
            this.setActLeftTime();
            this.widget('weekendItem/dailyLabel').getComponent(cc.Label).string = data.PlayerDailyScore;
            // var offTime = this.taskLogic.getRefreshWeekendTime() - this.timeLogic.now();
            // var offDay = Math.floor(offTime/(24*60*60));
            // this.widget('weekendItem/barbottom2/weekendTimeLabel').active = !!offDay;
            // this.widget('weekendItem/barbottom2/weekendTimeLabel').getComponent(cc.Label).string = "刷新时间："+ offDay + "天";
            this.setprogressModel(data.PlayerDailyScore,data.ScoreRewards[2].MaxValue);
            this.widget('weekendItem/barbottom2/button6').getComponent(cc.Button).interactable = this.data.WeekStatus === 1;
            this.weekIcon.getComponent(cc.Button).interactable = !(this.data.WeekStatus === 2);
            this.widget('weekendItem/barbottom2/weekendlabel').getComponent(cc.Label).string = data.PlayerWeekScore + "/" +data.WeekScoreMax;

            // uiResMgr.loaTaskIcon("task_icon_1004",this.widget('weekendItem/icon'));
            for (var i = 0 , len = this.content.children.length; i < len; i++) {
                var obj = this.content.children[i];
                obj.active = !!data.ScoreRewards[i];
                obj.getComponent(cc.Button).interactable = !(data.ScoreRewards[i].Status ===2);
                if (obj.active) {
                    var info = kf.clone(data.ScoreRewards[i].Rewards[0]);
                    boxId.push(Math.floor(info.BaseID%100000));
                    info.BaseID = Math.floor(info.BaseID/100000);
                    switch (data.ScoreRewards[i].Status){
                        case 0:
                        default:
                            break;
                        case 1:
                            info.BaseID = info.BaseID+"A";
                            break;
                        case 2:
                            info.BaseID = info.BaseID+"B";
                            break;
                    }
                    uiResMgr.loadLockTreasureBox(info.BaseID,obj);
                }
            }

            for(let n = 0;n<this.dailyScorelabel.length;n++){
                var obj = this.dailyScorelabel[n];
                obj.string = data.ScoreRewards[n].Score;
            }
            this.widget('weekendItem/barbottom2/button6').active = true;
        boxId.push(Math.floor(this.data.WeekScoreReward[0].BaseID%100000));
        this.taskLogic.req_ChestData(boxId);
        var weekenBaseId = Math.floor(this.data.WeekScoreReward[0].BaseID/100000);
        switch (this.data.WeekStatus){
            case 0:
            default:
                break;
            case 1:
                weekenBaseId =  weekenBaseId+"A";
                break;
            case 2:
                weekenBaseId =   weekenBaseId+"B";
                break;
        }
        uiResMgr.loadLockTreasureBox(weekenBaseId,this.weekIcon);
        // },(idx) * 0.01);
    },
    // 默认1<2<3
    setprogressModel(weekValue,MaxValue1){
        var progress1 = this.widget('weekendItem/schedule/progressBar1').getComponent(cc.ProgressBar);
        progress1.progress = weekValue/MaxValue1;
    },

    clickDailyReward(_,param){
        switch(Number(param)){
            case 0:
                // this.data.
                if(this.data.ScoreRewards[0].Status === 2)return;
                this.data.ScoreRewards[0].tag = 0;
                this.data.ScoreRewards[0].ChestRewards = this.taskLogic.chastData[0].ChestRewards;
                this.node.dispatchDiyEvent("clickDailyReward",this.data.ScoreRewards[0]);
                break;
            case 1:
                if(this.data.ScoreRewards[1].Status === 2)return;
                this.data.ScoreRewards[1].tag = 1;
                this.data.ScoreRewards[1].ChestRewards = this.taskLogic.chastData[1].ChestRewards;
                this.node.dispatchDiyEvent("clickDailyReward",this.data.ScoreRewards[1]);
                break;
            case 2:
                if(this.data.ScoreRewards[2].Status === 2)return;
                this.data.ScoreRewards[2].tag = 2;
                this.data.ScoreRewards[2].ChestRewards = this.taskLogic.chastData[2].ChestRewards;
                this.node.dispatchDiyEvent("clickDailyReward",this.data.ScoreRewards[2]);
                break;
        }
    },

    clickWeekReward(){
        this.node.dispatchDiyEvent("clickWeekReward",this.data.WeekStatus);
    },

    clickBtn:function(){
        if(this.data.Status === this.taskLogic.STATE_ENUM.ING && this.data.Jump === 999){//观看广告特殊处理
            this.adHelperLogic.req_Watch_Adv(constant.AdvType.DAILY);
            return;
        }
        this.node.dispatchDiyEvent("clickDaily",this.data);
    },

    clickWeekIcon(){
        if(this.data.WeekStatus ===2)return
        uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_SCORE, null,this.taskLogic.chastData[3].ChestRewards);
    },

    //设置周活跃剩余时间
    setActLeftTime: function () {
        var offTime = this.taskLogic.getRefreshWeekendTime() - this.timeLogic.now();
        var offDay = Math.floor(offTime/(24*60*60));
        this.needUpdateLeft = offTime < 3600 * 24;
        var timeList = "";
        if(offTime>0) {
            if(this.needUpdateLeft) {
                timeList = "刷新时间："+this.timeLogic.getCommonCoolTime(offTime);
            }
            else {
                timeList = "刷新时间："+ offDay + "天";
            }
        }
        this.widget('weekendItem/barbottom2/weekendTimeLabel').getComponent(cc.Label).string  = timeList;
    },

    update: function (dt) {
        if (!this.widget('weekendItem/barbottom2/weekendTimeLabel').active) return;
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        if(this.needUpdateLeft){
            this.setActLeftTime()
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
