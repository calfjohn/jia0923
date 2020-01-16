var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },
    onLoad:function() {
        jsonTables.parsePrefab(this);
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshGift", this.getGift.bind(this),true]
        ]
        this.registerClientEvent(registerHandler);
    },

    init:function(idx,data) {
        this.uid = data.uid;
        this.widget("inviteItem/label1").getComponent(cc.Label).string = uiLang.getMessage("monInfo","lv") + data.lv;
        this.widget("inviteItem/name").getComponent(cc.Label).string = data.name;
        var receiveLabel = this.widget("inviteItem/btnYellow/label1").getComponent(cc.Label);
        var receiveButton = this.widget("inviteItem/btnYellow").getComponent(cc.Button);
        var receivedTip = this.widget("inviteItem/received");
        // var rewardList = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.InviteReward);
        
        var content = this.widget("inviteItem/layout");
        var rewardPrefab = uiResMgr.getPrefabSelf("rewardItem");

        var curRec = this.friendLogic.getInviteRewardRecNum();
        var recMax = this.friendLogic.getRecMax();

        var listData = {
            content: content,
            list: data.rewards,
            prefab: rewardPrefab
        }
        uiManager.refreshView(listData);
        
        switch (data.state) {
            case constant.RecState.CANT:
                receiveButton.node.active = true;
                receivedTip.active = false;
                receiveButton.interactable = false;
                receiveLabel.string = uiLang.getMessage("actDailyEnergy", "receive")
                break;
            case constant.RecState.DONE:
                receiveButton.node.active = false;
                receivedTip.active = true;
                receiveButton.interactable = false;
                receiveLabel.string = uiLang.getMessage("actDailyEnergy", "received");
                break;
            case constant.RecState.CAN:
                receiveButton.node.active = true;
                receivedTip.active = false;
                receiveButton.interactable = curRec < recMax;
                receiveLabel.string = uiLang.getMessage("actDailyEnergy", "receive");
                break;
        }
    },

    getGift:function(){
        this.friendLogic.req_Recv_Invite(this.uid);
    }
})

