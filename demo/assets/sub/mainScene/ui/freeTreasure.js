var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        openNumNode:cc.Node,
        openNumLabel:cc.Label,
        countDown:cc.Node,
        freeNode:cc.Node,
        aniNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        this.countDownLabel = this.countDown.getChildByName("levelLabel1").getComponent(cc.Label);
        this.refreshFreeChest();
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshFreeChest", this.refreshFreeChest.bind(this),true],
            ["changeLanguage", this.refreshFreeChest.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);

    },
    refreshFreeChest:function(){
        this.node.getComponent(cc.Button).interactable = true;
        this.freeNum = this.treasureLogic.getFreeNum();
        this.freeTime = this.treasureLogic.getFreeTime();
        this.countDown.active = this.freeTime.toNumber() !== 0;
        // this.freeNode.active = this.freeTime.toNumber() === 0;
        this.updateFlag = this.countDown.active;
        if(this.updateFlag){
            this.duration = 1;
        }
        this.openNumNode.active = this.freeNum !== 0;
        this.openNumLabel.string = this.freeNum;
        if(this.freeNum){
            this.aniNode.getComponent(cc.Animation).play();
        }else{
            this.aniNode.getComponent(cc.Animation).stop();
            this.aniNode.rotation = 0;
        }
    },
    touchend:function(event){
        if(this.freeNum <= 0)   return;
        this.treasureLogic.req_Chest_Free();
        this.node.getComponent(cc.Button).interactable = false;//防止连点
        setTimeout(function(){
            this.node.getComponent(cc.Button).interactable = true;
        }.bind(this),200);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.updateFlag) return;
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        var offTime = this.freeTime.toNumber() - this.timeLogic.now();
        this.countDown.active = offTime > 0;
        if (this.countDown.active) {
            this.countDownLabel.string = this.timeLogic.getCommonCoolTime(offTime);
        }
    }
});
