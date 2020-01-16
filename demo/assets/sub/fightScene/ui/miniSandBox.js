var panel = require("panel");
var sandBoxContrl = require("miniSandBoxContrl");

cc.Class({
    extends: panel,

    properties: {
        sandBoxContrl:sandBoxContrl,
        boxSprite:cc.Sprite,
        boxSpriteframes:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    showFloatKill:function(scrore){
        var kill = uiResMgr.getPrefabEx("floatKill")
        kill.parent = this.widget('miniSandBox/display');
        var pos = cc.v2(this.widget('miniSandBox/content/count').x + 37, this.widget('miniSandBox/content/count').y);
        kill.getComponent("floatKill").initForBoss("+"+scrore,pos);
    },

    showGoldFly:function(familyID,startPos){
        var nodePos = this.node.convertToNodeSpaceAR(startPos);
        var endPos = this.boxSprite.node.position;
        var parent = this.widget('miniSandBox/display');
        var count = this.miniGameLogic.getFlyCount(familyID);
        for (var i = 0 , len = count; i <  len; i++) {
            var node = uiResMgr.getPrefabEx("goldFly");
            node.parent = parent;
            node.getComponent("goldFly").init(familyID,nodePos,endPos);

            if (this.miniGameLogic.isInGoldHightActive()){
                var node = uiResMgr.getPrefabEx("goldFly");
                node.parent = parent;
                node.getComponent("goldFly").init(familyID,this.widget('miniSandBox/content/count').position,endPos);
            }
        }

        var idx = this.miniGameLogic.getGoldSpIdx();
        this.boxSprite.spriteFrame = this.boxSpriteframes[idx];
        this.widget('miniSandBox/content/count/countLabel').getComponent(cc.Label).string = this.miniGameLogic.getScrore();

        if (!this.miniGameLogic.isInGoldHightActive()){
            this.widget('miniSandBox/content/progressBar').getComponent(cc.ProgressBar).progress = this.miniGameLogic.getPerHigh();
        }
    },

    preLoadSetmentUi:function(){
        uiManager.loadAsyncPrefab(uiManager.UIID.SETTLE_GOLD,function(){});
    },

    init:function(){
        this.boxSprite.spriteFrame = this.boxSpriteframes[0];
        this.widget('miniSandBox/content/count/countLabel').getComponent(cc.Label).string = 0;
        this.widget('miniSandBox/content/progressBar').getComponent(cc.ProgressBar).progress = 0;
        this.node.active = true;

        this.scheduleOnce(function(){
            this.preLoadSetmentUi();
        },1);

        var list = [];
        var table = this.miniGameLogic.getTable();
        this._getList(table,list,0);
        this.sandBoxContrl.init(list);
    },

    _getTableForMine:function(){
        var list = [];
        var data = this.mineLogic.getMineData();
        this._getList(kf.clone(data.TableInfo),list,1);
        return list;
    },

    _getList:function(tables,list,chapterId){
        var idx = 0;
        for (var i = 0 , len = tables.Grid.length; i < len; i++) {
            var obj = tables.Grid[i];
            list[i] = [];
            for (var j = 0 , jLen = obj.Data.length; j < jLen; j++) {
                var jObj = obj.Data[j];
                var data = {id:jObj,lv:obj.Lv[j],idx:idx,chapterId:chapterId};
                list[i].push(data);
                idx++;
            }
        }
    },

    reShowBox:function(){
        this.node.active = true;
        this.sandBoxContrl.reShowBox();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.miniGameLogic.isInGoldHightActive()) return;
        var per = this.miniGameLogic.getOffEnd();
        this.widget('miniSandBox/content/progressBar').getComponent(cc.ProgressBar).progress = per;
        if (per === 0) {
            this.miniGameLogic.endGold();
        }
    }
});
