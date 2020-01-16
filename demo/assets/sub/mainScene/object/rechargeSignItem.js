var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        content:cc.Node,
        rewardPrefab:cc.Prefab,
        bgSprite:cc.Sprite,
        bgFrame:[cc.SpriteFrame],
        getNode:cc.Node,
        getedNode: cc.Node,
        label:cc.Label,
        state:cc.Label,

        todayNode:cc.Node,
    },

    init (idx,data,midIdx,isNewRecharge) {
        var refreshData = {
            content:this.content,
            list:data.Rewards,
            prefab:this.rewardPrefab
        }
        uiManager.refreshView(refreshData);
        var state = isNewRecharge ?this.activityLogic.getNewRechargeSignState(idx) : this.activityLogic.getRechargeSignState(idx);
        const isTimeout = isNewRecharge ?this.activityLogic.getNewRechargeSignTimeOut(idx) :this.activityLogic.getRechargeSignTimeOut(idx);
        this.getNode.active = state === constant.SignState.GETED || isTimeout;
        this.getedNode.active = state === constant.SignState.GETED;
        this.todayNode.active =isNewRecharge ?this.activityLogic.isNewRechargeToday(idx) && !this.getedNode.active : this.activityLogic.isRechargeToday(idx) && !this.getedNode.active;
        this.bgSprite.spriteFrame = state === constant.SignState.CANGET ?this.bgFrame[1] : this.bgFrame[0];
        this.label.string = uiLang.getMessage("shopMonCardItem","day" + idx);
        this.label.node.color = uiColor.actRechargeSignItem.timeNomar;
        let str =  uiLang.getMessage("actRechargeSign","unDone");
        let color = uiColor.actRechargeSignItem.unDone;
        this.bgSprite.setState(cc.Sprite.State.NORMAL);
        if (state === constant.SignState.CANGET) {
            str = uiLang.getMessage("actRechargeSign","canReceive");
            color = uiColor.actRechargeSignItem.canReceive;
        } else if (state === constant.SignState.NONE && isTimeout) {
            this.bgSprite.setState(cc.Sprite.State.GRAY);
            str = uiLang.getMessage("actRechargeSign","timeout");
            color = uiColor.actRechargeSignItem.timeoutColor;
            this.label.node.color = uiColor.actRechargeSignItem.timeGray;
        } else if(state === constant.SignState.GETED){
            str = uiLang.getMessage("actRechargeSign","received");
            color = uiColor.actRechargeSignItem.received;

        }
        this.state.string = str;
        this.state.node.color = color;
    },



    // update (dt) {},
});
