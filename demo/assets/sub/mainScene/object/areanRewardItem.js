cc.Class({
    extends: cc.Component,

    properties: {
        icon:cc.Sprite,
        rewardFrame:[cc.SpriteFrame],
        numLabel:cc.Label,

    },

    onLoad:function(){

    },

    init:function (idx,data) {
        switch (data.Type) {
            case constant.ItemType.GOLD:
                this.icon.spriteFrame = this.rewardFrame[0];
                break;
            case constant.ItemType.DIAMOND:
                this.icon.spriteFrame = this.rewardFrame[1];
                break;
            case constant.ItemType.REEL:
                this.icon.spriteFrame = this.rewardFrame[3];
                break;
            case constant.ItemType.HERO:
                this.icon.spriteFrame = this.rewardFrame[2];
                break;
            case constant.ItemType.EQUIP:
                uiResMgr.loadEquipQuesIcon(data.Qua,this.icon.node);
                break;
        }
        this.numLabel.string = data.Num;
    },
    // update (dt) {},
});
