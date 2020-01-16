var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        bg:cc.Node,
        bgSps:[cc.SpriteFrame],
        light:cc.Node,
        effect: cc.Node,
    },

    onLoad: function () {
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["guideAction", this.guideAction.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    guideAction:function(type,ext){
        if (type === "showSandLight" && ext.posList) {
            var prefab = uiResMgr.getPrefabSelf("latticeGlow");
            var inArry = false;
            for (var i = 0 , len = ext.posList.length; i <  len; i++) {
                var obj = ext.posList[i];
                if (obj.row === this.row && obj.col === this.col) {
                    inArry = true;
                    break;
                }
            }
            inArry = inArry && this.guideLogic.isInGuideFlag();
            var node = this.node.getInstance(prefab,inArry);
            if (node) {
                var ani = node.getComponent(cc.Animation);
                ani.stop();
                ani.setCurrentTime(0);
                ani.play();
                node.position = cc.v2(0,0);
            }
        }
    },

    init:function(data,row,col){
        this.row = row;
        this.col = col;
        this.node.setLocalZOrderEx(10 - this.row);//
        this.light.active = false;
        this.light.zIndex = 10;
        this.light.setContentSize(this.node.width,this.node.height);
        this.bg.setContentSize(this.node.width,this.node.height);
        this.effect.setContentSize(this.node.width,this.node.height);
        this.effect.active = false;
        this.node.setPosition(this.node.width*(col + 0.5),this.node.height*( row + 0.5));
        // if (cc.sys.isNative) {
        //     uiResMgr.loadItemPrefab(constant.ItemPrefabName.SAND_BOX_BG_EFFECT,function (prefab) {
        //         this.effectPrefab = prefab;
        //         this.node.getInstance(this.effectPrefab,false);
        //     }.bind(this))
        // }
        var node = this.node.getChildByName('latticeGlow');
        if (node) {
            node.active = false;
        }
    },

    setBgColor:function(form){
        this.bg.getComponent(cc.Sprite).spriteFrame = this.bgSps[form - 1] || this.bgSps[0];
        // if (this.effectPrefab) {
        //     var node = this.node.getInstance(this.effectPrefab,form >= tb.MONSTER_EPIC);
        //     if (node && node.active) {
        //         node.scaleX = this.node.width/node.width;
        //         node.scaleY = this.node.height/node.height;
        //         if (form === tb.MONSTER_EPIC) {
        //             node.getComponent(cc.Animation).play("sandIconAnimation2");
        //         }else if (form === tb.MONSTER_LEGEND) {
        //             node.getComponent(cc.Animation).play("sandIconAnimation1");
        //         }
        //     }
        // }
    },

    setVisible(bShow){
        this.node.active = bShow;
    },

    setLightActive:function(active){
        this.light.active = active;
        if (active) {
            this.light.setContentSize(this.node.width,this.node.height);
            this.scheduleOnce(function () {
                this.light.setContentSize(this.node.width,this.node.height);
            },0.05)
        }
    },

    setEffectActive: function() {
        this.effect.active = true;
        const anim = this.effect.getComponent(cc.Animation);
        const state = anim.play();
        state.once(constant.AnimationState.FINISHED, ()=>{
            this.effect.active = false;
        });
    },
    // update (dt) {},
});
