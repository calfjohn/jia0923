cc.Class({
    extends: cc.Component,

    editor: {
        menu:"util/模糊图转清晰图",
        requireComponent:cc.Sprite,
        disallowMultiple:true,
    },

    properties: {
        // label:cc.Label,
        dimSprite: {     //隐藏
           type: cc.SpriteFrame,
           default:null,
           tooltip: "模糊图"
        },
        distinctSprite: {
            type: cc.SpriteFrame,
            default:null,
            tooltip: "清晰图"
        },
    },
    // use this for initialization
    onLoad: function () {
        this.sizeMode = this.node.getComponent(cc.Sprite).sizeMode;
        this.node.getComponent(cc.Sprite).sizeMode = cc.Sprite.Type.CUSTOM;
        if(this.sizeMode === cc.Sprite.Type.TRINNED){
            this.node.setContentSize(this.distinctSprite.getRect());
        }else if(this.sizeMode === cc.Sprite.Type.RAW){
            this.node.setContentSize(this.distinctSprite.setOriginalSize());
        }
        this.node.getComponent(cc.Sprite).spriteFrame = this.dimSprite;
        if (this.distinctSprite.textureLoaded()) {
            this._loadTexture();
        }
        else {
            this.distinctSprite.once('load', this._loadTexture, this);
            this.distinctSprite.ensureLoadTexture();
        }
    },
    _loadTexture:function () {
        if(this.sizeMode !== this.node.getComponent(cc.Sprite).sizeMode){
            this.node.getComponent(cc.Sprite).sizeMode = this.sizeMode;
        }
        this.node.getComponent(cc.Sprite).spriteFrame = this.distinctSprite;
        this.node.dispatchDiyEvent("dim2distDone");
    },
});
