var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        btnDown:cc.Node,
        btnUp:cc.Node
    },

    onLoad(){
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.btnDown.active = false;
        this.btnUp.active = false;
    },

    registerEvent () {
        var registerHandler = [
            ["refreshRedBag", this.refreshRedBag.bind(this)],
            ["updateRedBag", this.updateRedBag.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    clickGet () {
        this.activityLogic.req_Receive_RedPacket();
        this.btnDown.active = false;
        this.btnUp.active = false;
        this.unscheduleAllCallbacks();
    },

    refreshRedBag(state){
        this.btnDown.active = false;
        this.btnUp.active = false;
        if(state === constant.RedBagState.HAVE){
            this.updateSchedule();
            var sceneID = uiManager.getCurSceneID();
            this.btnDown.active = sceneID === constant.SceneID.MAIN;
            this.btnUp.active = sceneID === constant.SceneID.FIGHT;
        }else if(state === constant.RedBagState.NONE){
            this.updateSchedule();
        }else{
            this.unscheduleAllCallbacks();
            this.node.removeFromParent();
            this.node.destroy();
        }
    },

    updateRedBag(){
        var state = this.activityLogic.getRedBagState();
        if(state !== constant.RedBagState.HAVE){
            this.btnDown.active = false;
            this.btnUp.active = false;
            return;
        }
        var sceneID = uiManager.getCurSceneID();
        this.btnDown.active = sceneID === constant.SceneID.MAIN;
        this.btnUp.active = sceneID === constant.SceneID.FIGHT;
    },

    updateSchedule(){
        this.unscheduleAllCallbacks();
        var time = jsonTables.randomNum(10,20);
        this.scheduleOnce(function () {
            this.activityLogic.req_Get_RedPacket();
        }.bind(this),time)
    },
    // update (dt) {},
});
