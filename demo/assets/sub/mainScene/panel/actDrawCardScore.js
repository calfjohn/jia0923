var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        // curScoreLabel: cc.Label,
        // nextScoreLabel: cc.Label,
        content:cc.Node,
        rewardItem: cc.Prefab,
        maxContentWidth:0
    },

    onLoad () {
        jsonTables.parsePrefab(this);
    },

    open (idx,rewardArr) {
        if(!rewardArr){
            var drawCardData = this.activityLogic.getDrawCardData();
            var curScore = drawCardData.userData.drawScore;
            var scoreList = drawCardData.serverData.Score;
            var aimScore = scoreList[idx];
            var rewardList = drawCardData.serverData.Rewards;
            var reward = rewardList[idx].Rewards;
        }else{
            var reward = rewardArr;
        }
        // this.curScoreLabel.string = curScore;
        // this.nextScoreLabel.string = (aimScore - curScore) + "";

        this.content.getComponent(cc.Layout).type = reward.length > 4 ? cc.Layout.Type.GRID : cc.Layout.Type.HORIZONTAL;
        if(this.content.getComponent(cc.Layout).type === cc.Layout.Type.GRID) {
            this.content.width = this.maxContentWidth;
        }
        this.content.removeAllChildren(true);
        var listData = {
            content: this.content,
            list: reward,
            prefab: this.rewardItem
        }
        uiManager.refreshView(listData);
    },
});
