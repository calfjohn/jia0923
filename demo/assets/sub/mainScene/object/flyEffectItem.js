var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },
    /**
     * data内部包含参数
     * @param  {int} idx  索引
     * @param  {object} data  spriteFrame 图片纹理;  initPos 初始位置;  posAround 移动到最近的范围; posEnd 结束位置;  cb 回调函数;
     */
    init:function(idx,data){
        this.node.stopAllActions();

        this.widget("flyEffectItem/reelItem").active = data.type ===constant.ItemType.REEL;
        this.widget("flyEffectItem/rewardItem").active = data.type !==constant.ItemType.REEL;
        var itemType = data.type ===constant.ItemType.REEL?"flyEffectItem/reelItem/":"flyEffectItem/rewardItem/";
        var isHideBg = data.type ===constant.ItemType.GOLD || data.type ===constant.ItemType.DIAMOND|| data.type ===constant.ItemType.EXP || data.type ===constant.ItemType.VIT;
        var iconStr = data.type ===constant.ItemType.REEL?"mask/icon":"icon";
        uiResMgr.loadRewardIcon(this.widget(itemType + iconStr),data.type,data.baseID,this.widget(itemType + "iconFrame"),this.widget(itemType + "qualityFrame1"));
        this.widget(itemType + "iconFrame").active = !isHideBg;
        this.widget(itemType + "qualityFrame1").active = !isHideBg;
        this.node.position = data.initPos;
        this.node.active = true;
        var move1 = cc.moveTo(0.1,data.posAround);
        var delay = cc.delayTime(0.1);
        var delay2 = cc.delayTime(0.1);
        var move2 = cc.moveTo(0.5,data.posEnd);
        var callfunc = cc.callFunc(function(){
            this.node.active = false;
            data.cb();
            this.node.removeFromParent();
            this.node.destroy();
        }, this);
        // var seq = cc.sequence(move1,delay,move2.easing(cc.easeSineIn()),delay2,callfunc);
        var seq = cc.sequence(move1,delay,move2.easing(cc.easeSineIn()),callfunc);
        this.node.runAction(seq);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
