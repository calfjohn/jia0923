var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.initNodes();
    },
    initNodes:function(){
        this.specialNode = this.widget('monsterContent/moveContentItem');
        this.content = this.widget('monsterContent/content');
        this.endPos = this.widget('monsterContent/endPos');
    },

    init:function(list,size,isSelf){
        this.node.setContentSize(size);
        this.specialNode.active = true;
        if (this.specialNode.active) {
            this.specialNode.skeletonData  = null;
            if (isSelf) {
                this.equipLogic.setBaseSpine(this.specialNode);
            }else {
                var roleInfo = this.mineLogic.getEnmeyBase();
                roleInfo.EquipBaseID = roleInfo.EquipBaseID || [];
                this.equipLogic.setBaseSpineForOther(roleInfo.Sex,roleInfo.Occupation,roleInfo.EquipBaseID,this.specialNode);
            }
        }
        var tmpList = list;
        tmpList = jsonTables.randonByRand(tmpList);
        this.itemCells = [];
        var refreshData = {
            content:this.content,
            list:tmpList,
            prefab:this.itemPrefab,
            ext:this
        }
        uiManager.refreshView(refreshData);

        this.setItemsPos();
        this.startRun();
    },

    add:function(script){
        this.itemCells.push(script);
    },

    setItemsPos:function(){
        if (!this.itemCells.length) return;
        var peice = Math.floor(this.node.width / this.itemCells.length);
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var obj = this.itemCells[i];
            obj.node.x = peice * i + (-this.node.parent.width/2);
        }
    },
    startRun:function(){
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var obj = this.itemCells[i];
            var speed = jsonTables.randomNum(100,150);
            this.doOneMove(obj.node,speed);
        }
    },

    doOneMove:function(node,speed){
        node.stopAllActions();
        var costTime = Math.abs(this.node.width/2 - node.x)/speed;
        node.scaleX = 1;
        var move = cc.moveTo(costTime,cc.v2(this.endPos.x,0));
        var callfunc = cc.callFunc(function(){
            this.script.doOneMove(this.node,speed);
        }.bind({node:node,script:this}));
        var callfunc2 = cc.callFunc(function(){
            this.node.scaleX = -1;
        }.bind({node:node,script:this}));
        costTime = Math.abs((-this.node.parent.width/2 - 100))/speed;
        var move2 = cc.moveTo(costTime,cc.v2( -this.node.parent.width/2-100,0));
        var seq = cc.sequence(move,callfunc2,move2,callfunc);
        node.runAction(seq);
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
