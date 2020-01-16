
cc.Class({
    extends: cc.Component,

    properties: {
        iconNode:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init:function(skillID,script){
        this.setVisible(true);
        this.setPosition(script,0,1,1);
        this.bindScript = script;
        var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.SKILL,skillID);
        var effectID = skillConfig[jsonTables.CONFIG_SKILL.EffectID];
        var effectConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EFFECT,effectID);
        uiResMgr.loadSkillPrefab(effectConfig[jsonTables.CONFIG_EFFECT.Resource],function(){
            uiResMgr.loadSkillDisplayPrefab(skillConfig[jsonTables.CONFIG_SKILL.MaskLayerRes],function(){});
        });//预加载特效
        uiResMgr.loadSkillIcon(skillConfig[jsonTables.CONFIG_SKILL.Icon],this.iconNode);
        this.iconNode.color = uiColor.white;
    },

    setVisible(bShow){
        this.node.active = bShow;
    },

    isVisible:function(){
        return this.node.active;
    },

    setColor:function(per){

        var color = per * 255;
        this.iconNode.color = cc.color(255,color,color,255);
    },

    setPosition(target,height,yScale,yOff){
        this.node.position = kf.getPositionInNode(target.node,this.node.parent,target.node.getPosition());
        this.node.y += (height* ( yScale /100) + yOff+ this.node.height/2 + 10);
        var worldPos = this.node.convertToWorldSpaceAR(cc.v2(0,0));
        var maxHeight = cc.winSize.height;
        var offY = worldPos.y - maxHeight;
        if (offY > 0) {
            this.node.y -= (offY + this.node.height/2);
        }
    },

    addPostion(x){
        this.node.x += x;
    },

    putInPool(){
        if (this.bindScript) {
            var item = this.bindScript;
            this.bindScript = null;
            item.removeSkillIcon();
        }
        uiResMgr.putInPool(this.node.name,this.node);
    },

    forcePut:function(){
        this.putInPool();
    },

    clickItem:function(){
        if (this.bindScript ) {
            if (this.bindScript.clickSkill()) {
                this.putInPool();
            }
        }else {
            cc.error("未绑定对象")
        }
    },

    // update (dt) {},
});
