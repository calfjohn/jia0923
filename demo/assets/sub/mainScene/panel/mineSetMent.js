var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        rewardPrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    initWin:function(gold,exp,badge,rewards){
        this.widget('mineSetMent/shrink/victory/laber1').active = gold !== undefined;
        if (this.widget('mineSetMent/shrink/victory/laber1').active) {
            this.widget('mineSetMent/shrink/victory/laber1/layout/content1/goldLabel/numberLabel').getComponent(cc.Label).string = "+"+gold;
            this.widget('mineSetMent/shrink/victory/laber1/layout/content1/badgelabel/numberLabel').getComponent(cc.Label).string = "+"+badge;
            this.widget('mineSetMent/shrink/victory/laber1/layout/content1/experienceLabel/numberLabel').getComponent(cc.Label).string = "+"+exp;
            this.widget('mineSetMent/shrink/victory/laber1/layout/equipContent').active = rewards.length > 0;
            if(rewards.length > 0){
                var rewardNode = this.widget('mineSetMent/shrink/victory/laber1/layout/equipContent').getInstance(this.rewardPrefab,true);
                rewardNode.getComponent("rewardItem").init(0,rewards[0]);
            }
        }
        this.widget("mineSetMent/shrink/victory/monster").active = !this.widget('mineSetMent/shrink/victory/laber1').active;
        if (this.widget("mineSetMent/shrink/victory/monster").active) {
            var keeps = this.fightLogic.getKeepList(9999999);
            var list = [];
            for (var i = 0 , len = keeps.length; i < len; i++) {
                var obj = keeps[i];
                list.push({id:obj.getTid(),num:1});
            }
            var midPos = list.length > 0 ? Math.ceil((list.length-1)/2) : 0;
            list.splice(midPos,0,{id:1,num:1});
            var refreshData = {
                content:this.widget('mineSetMent/shrink/victory/monster'),
                list:list,
                prefab:this.itemPrefab,
                ext:midPos
            }
            uiManager.refreshView(refreshData);
        }

    },
    initFail:function(){

    },
    //TODO 这里先只要处理pve
    open:function (gameResult,gold,exp,badge,rewards) {
        this.isWin = gameResult !== false;
        this.widget('mineSetMent/shrink/victory').active = this.isWin;
        this.widget('mineSetMent/shrink/fail').active = !this.isWin;

        if (this.widget('mineSetMent/shrink/victory').active) {
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.VICTORY);
            this.initWin(gold,exp,badge,rewards);
        }
        if (this.widget('mineSetMent/shrink/fail').active) {
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.DEFEAT);
            this.initFail();
            this.activityLogic.checkFailActOpen();
        }
    },

    backMainScene:function(){
        var ev = new cc.Event.EventCustom('loadScene', true);
        ev.setUserData({sceneID:constant.SceneID.MAIN,loadCallBack:function(){
            uiManager.openUI(uiManager.UIID.MINE_UI);
        }});
        this.node.dispatchEvent(ev);
    },
    openUi:function(_,param){
        uiManager.openUI(Number(param));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
