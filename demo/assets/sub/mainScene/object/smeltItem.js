var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        numLabel:cc.Node,
        iconNode:cc.Node,
        frameBaseSprite:cc.Sprite,
        chooseNode:cc.Node,
        qulaityFrame:[cc.SpriteFrame],
        defaultQulaity:cc.SpriteFrame,
        raceEffect:cc.Node,
        spine:sp.Skeleton,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(index,data,panelJs){
        this.isEmpty = !data.FamilyID;//空格子
        this.iconNode.active = !this.isEmpty;
        this.numLabel.active = !this.isEmpty;
        this.chooseNode.active = false;
        this.raceEffect.active = !this.isEmpty;
        this.frameBaseSprite.spriteFrame = this.defaultQulaity;
        if(this.isEmpty)    return;
        this.familyID = data.FamilyID;
        this.numLabel.active = data.Num !== undefined;
        this.data = data;
        if (this.numLabel.active) {
            this.numLabel.getComponent(cc.Label).string = NP.dealNum(data.Num,constant.NumType.TEN);
        }
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.FamilyID);//家族配置表基本数据
        var monsterID = baseData[jsonTables.CONFIG_MONSTERFAMILY.Show];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,monsterID);


        var spineRes = config[jsonTables.CONFIG_MONSTER.Resource];
        this.spine.node.scale = config[jsonTables.CONFIG_MONSTER.ShowScale] / 100;
        var callBack = function(spineData){
            if (this.spine.skeletonData !== spineData) {
                this.spine.paused = false;
                this.spine.skeletonData  = spineData;
                this.spine.setAnimation(0,'std',true);
                this.spine.setToSetupPose();
                this.scheduleOnce(function(){
                    this.spine.paused = true;
                }.bind(this),0.1);
            }
        }.bind(this);
        uiResMgr.loadSpine(spineRes,callBack,this.spine.node);


        var quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        this.frameBaseSprite.spriteFrame = this.qulaityFrame[quality-1];

        uiResMgr.loadMonTypeIcon(baseData[jsonTables.CONFIG_MONSTERFAMILY.Type],this.raceEffect);

        this.chooseNode.active = panelJs !== undefined;
        if (this.chooseNode.active) {
            this.chooseNode.active = panelJs.isInList(data.FamilyID);
        }
    },

    click:function(){
        if(this.isEmpty)    return;
        this.node.dispatchDiyEvent("clickSmeltItem",this.familyID);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
