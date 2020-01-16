var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        content:cc.Node,
        itemPrefab:cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
    },

    onFinished:function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.closeEnable = true;
    },

    open:function (rewardList,oldScore) {
        oldScore = oldScore?oldScore:0;
        var danInfo = this.areanLogic.getDivInfo(oldScore);
        var name = uiLang.getConfigTxt(danInfo.DivName);
        var str = uiLang.getMessage(this.node.name,"label");
        this.widget("areanMail/mask/content/word1").getComponent(cc.Label).string = str.formatArray([name]);
        uiResMgr.loadAreanIcon(danInfo.DicIcon,this.widget("areanMail/mask/content/arenaIcon"));
        for (var i = 1 , len = 4; i < len; i++) {
            var node = this.widget("areanMail/mask/content/arenaIcon/starBright" + i);
            node.active = i <= danInfo.StarNum;
        }
        this.ani.play();
        this.closeEnable = false;
        var goldNum = 0;
        var diamondNum = 0;
        for (var i = rewardList.length - 1; i >= 0; i--) {
            var obj = rewardList[i];
            if(obj.Type === constant.ItemType.GOLD){
                goldNum = obj.Num;
                rewardList.splice(i,1);
            }else if(obj.Type === constant.ItemType.DIAMOND){
                diamondNum = obj.Num;
                rewardList.splice(i,1);
            }
        }
        this.widget("areanMail/mask/content/content/gold").active = goldNum > 0;
        this.widget("areanMail/mask/content/content/gold/number").getComponent(cc.Label).string = NP.dealNum(goldNum,constant.NumType.TEN);
        this.widget("areanMail/mask/content/content/diamond").active = diamondNum > 0;
        this.widget("areanMail/mask/content/content/diamond/number").getComponent(cc.Label).string = NP.dealNum(diamondNum,constant.NumType.TEN);
        var refreshData = {
            content:this.content,
            list:rewardList,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    closeEvent:function () {
        if(!this.closeEnable)   return;
        this.close();
    },

    // update (dt) {},
});
