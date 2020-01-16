var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardPrefab:cc.Prefab,
    },

    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.notCloseSelf = false;
    },
    open:function(rewards,cb,msg,notCloseSelf) {
        if (Object.prototype.toString.call(rewards)!=='[object Array]') {
            rewards = [rewards];
        }
        this.notCloseSelf = notCloseSelf;
        if(rewards.length === 6){
            this.rolNum = 3;
        }else if(rewards.length === 5){
            this.rolNum = 5;
        }else{
            this.rolNum = 4;
        }
        // this.rolNum = rewards.length === 6 ? 3 : 5;
        this.widget("rewardMsg/floor").width = rewards.length === 5 ? 560 : 476;
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.COMMONREWARD);
        this.widget("rewardMsg/floor/label").getComponent(cc.Label).string = msg?msg:uiLang.getMessage(this.node.name,"get");
        this.cb = cb;
        this.widget("rewardMsg/floor/content2").active = rewards.length > this.rolNum;
        if(rewards.length <= this.rolNum){
            var refreshData = {
                content:this.widget("rewardMsg/floor/content1"),
                list:rewards,
                prefab:this.rewardPrefab
            }
            uiManager.refreshView(refreshData);
        }else{
            var refreshData = {
                content:this.widget("rewardMsg/floor/content1"),
                list:rewards.slice(0,this.rolNum),
                prefab:this.rewardPrefab
            }
            uiManager.refreshView(refreshData);
            var refreshData = {
                content:this.widget("rewardMsg/floor/content2"),
                list:rewards.slice(this.rolNum),
                prefab:this.rewardPrefab
            }
            uiManager.refreshView(refreshData);
        }

    },
    closeEvent:function(evrnt){
        if(!this.notCloseSelf){
            this.close();
        }
        this.notCloseSelf = false;
        if(this.cb){
            var callback = this.cb;
            this.cb = undefined;
            callback();
        }
    },

    // update (dt) {},
});
