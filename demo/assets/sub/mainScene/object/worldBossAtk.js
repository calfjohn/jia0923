var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.duration = 0;
        this.list = [];
        this.showedList = [];
    },

    onEnable:function(){
        var list = this.list.concat(this.showedList);
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            obj.stopAllActions();
            obj.removeFromParent();
            obj.destroy();
        }
        this.list = [];
        this.showedList = [];
        this.unscheduleAllCallbacks();
    },

    doAtkShowDamge:function(damage){
        var node = this.list.shift();
        this.showedList.push(node);
        node.getComponent(sp.Skeleton).setAnimation(0,'atk',false);
        var atkDuration = node.getComponent(sp.Skeleton).findAnimation("atk").duration;
        node.getComponent(sp.Skeleton).setAnimation(0,'atk',false);
        this.scheduleOnce(function(){
            var kill = uiResMgr.getPrefabEx("floatKill")
            kill.parent = this.node;
            kill.getComponent("floatKill").initForBoss(damage.toNumber(),node.position);
        },atkDuration/2);
        this.scheduleOnce(function(){
            this.showedList.shift();
            if (node) {
                node.removeFromParent();
                node.destroy();
            }
        },atkDuration);
    },

    doAtk:function(){
        var data = this.worldBossLogic.popDamageData();
        if (!data || !data.HeroID) return;
        var node = cc.instantiate(this.itemPrefab);
        node.parent = this.node;
        node.getComponent(this.itemPrefab.name).init(0, data.HeroID);
        node.position = cc.v2(-this.node.parent.width/2,0);

        var costTime = (this.node.parent.width/2)/100;
        var move = cc.moveTo(costTime,cc.v2(0,0));
        var callFunc = cc.callFunc(function(ccObj,damage){
            this.doAtkShowDamge(damage);
        },this,data.Damage);
        var seq = cc.sequence(move,callFunc);
        node.runAction(seq);
        this.list.push(node);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.duration += dt;
        if (this.duration <= 1) return;
        this.duration -= 1;
        this.doAtk();
    }
});
