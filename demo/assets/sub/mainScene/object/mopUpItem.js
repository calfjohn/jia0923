var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data){
        this.data = data;
        this.widget('mopUpItem/icon/numberLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"getBox").formatArray([data.ID]);
        this.widget('mopUpItem/schedule').active = data.MopUpVit !== 0;//获取章节是否可以扫荡
        this.widget('mopUpItem/unlockNode').active = !this.widget('mopUpItem/schedule').active;
        this.widget('mopUpItem/button4').active = this.widget('mopUpItem/schedule').active;
        this.widget('mopUpItem/button5').active = !this.widget('mopUpItem/schedule').active;
        this.widget('mopUpItem/unlockNode/label/numberLabel1').getComponent(cc.Label).string = data.ID;
        this.widget('mopUpItem/button4/label2').getComponent(cc.Label).string = data.MopUpVit;
        if (this.widget('mopUpItem/schedule').active) {
            this.widget('mopUpItem/schedule/progressBar/numberLabel').getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.Vit)+ "/" + data.MopUpVit;
            this.widget('mopUpItem/schedule/progressBar').getComponent(cc.ProgressBar).progress = this.userLogic.getBaseData(this.userLogic.Type.Vit) / data.MopUpVit || 0;
        }
    },

    clickBtn:function(){
        this.node.dispatchDiyEvent("clickMopUp",this.data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
