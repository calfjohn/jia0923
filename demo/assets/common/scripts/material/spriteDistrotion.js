const RainMaterial = require('distrotionMetariel');
//外部可直接设置this.offset，或者this.tiling两个值刷新图片
cc.Class({
    extends: cc.Component,

    properties: {
        offsetInit:cc.Vec2,
        tilingInit:cc.Vec2
    },
    ctor: function () {
        Object.defineProperty(this,"offset",{
          set:function(newValue){
              this._offset = newValue;
              this.refresh();
          },
          get:function(){return this.getOffset();}
        })
        Object.defineProperty(this,"tiling",{
          set:function(newValue){
              this._tiling = newValue;
              this.refresh();
          },
          get:function(){return this.getTiling();}
        })
	},

    // LIFE-CYCLE CALLBACKS:

    onLoad : function () {
        this.target = this.node.getComponent("cc.Sprite");
        cc.dynamicAtlasManager.enabled = false;
        this._material = new RainMaterial();
    },

    start :function () {
        if (this.target) {
            let texture = this.target.spriteFrame.getTexture();
            this._material.setTexture(texture);
            this.refresh();
        }
    },
    getOffset:function() {
        if(!this._offset){
            this._offset = this.offsetInit;
        }
        return  this._offset;
    },
    getTiling:function(){
        if(!this._tiling){
            this._tiling = this.tilingInit;
        }
        return  this._tiling;
    },
    refresh:function(){
        this._material.setValue(this.offset,this.tiling);
        this._material.updateHash();
        this.target._material = this._material;
        this.target._renderData._material = this._material;
    },
});
