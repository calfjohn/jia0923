var panel = require("panel");
var rewardItem = require("rewardItem");

cc.Class({
    extends: panel,

    properties: {
        levelName: cc.Label,
        receiveBtn: cc.Button,
        receiveLabel: cc.Label,
        reward1: rewardItem,
        reward2: rewardItem,
        reward3Box: cc.Node,
        boxNameLabel: cc.Label,
        receivedNode: cc.Node,
    },

    onLoad () {
        jsonTables.parsePrefab(this);
    },

    init (idx, data) {
        this.data = data;

        this.levelName.string = uiLang.getMessage(this.node.name, "levelGift").formatArray([this.data.Value]);
        var curLv = this.userLogic.getBaseData(this.userLogic.Type.Lv);

        this.receiveBtn.node.active = !data.isReceive;
        this.receivedNode.active = data.isReceive;
        if(this.receiveBtn.node.active)
            this.receiveBtn.interactable = curLv >= this.data.Value;
        this.receiveLabel.string = curLv < this.data.Value ? uiLang.getMessage(this.node.name, "condition") : uiLang.getMessage("actDailyEnergy", "receive");
        this.reward1.initEx(null, this.data.Rewards[0],true);
        this.reward2.initEx(null, this.data.Rewards[1],true);
        var iconID = Math.floor(this.data.Rewards[2].BaseID / 100000);
        var tid = this.data.Rewards[2].BaseID % 100000;//对箱子进行特殊处理
        var boxName = uiLang.getMessage(this.node.name, "levelBox").formatArray([tid % 1000])
        uiResMgr.loadLockTreasureBox(iconID, this.reward3Box);
        this.boxNameLabel.string = boxName;
    },
    
    clickReceive: function () {
        this.node.dispatchDiyEvent("clickReceive",this.data);
    }
});
