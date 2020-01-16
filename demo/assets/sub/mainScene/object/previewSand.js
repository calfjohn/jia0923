var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        bg:cc.Node,
        bgSps:[cc.SpriteFrame],
        size:cc.Size
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },

    init:function(idx,data,ext){
        var scaleSize = ext.scaleSize;
        var width = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.SandGridPixel);
        this.scaleSize = scaleSize * this.size.width / width;
        var ID_TYPE = constant.Id_Type;
        this.data = data;
        this.type = Math.floor(data /jsonTables.TYPE_BASE_COUNT);
        this.ref = data - (this.type*jsonTables.TYPE_BASE_COUNT);

        var size = cc.size(ext.width,ext.width);
        this.node.setContentSize(size);
        this.widget('previewSand/stone').setContentSize(size);
        this.widget('previewSand/stone').active = this.type === ID_TYPE.STONE;
        this.bg.active = !this.widget('previewSand/stone').active;
        this.spine.node.active = this.bg.active;
        this.bg.setContentSize(size);
        this.spine.node.y = -size.height/2;
        switch (this.type) {
            case ID_TYPE.NONE:
                this.bg.active = false;
                this.widget('previewSand/stone').active = false;
                this.spine.node.active = this.bg.active;
                break;
            case ID_TYPE.STONE:
                break;
            case ID_TYPE.MONSTER:
                this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,this.ref);
                this.spine.node.scale = this.config[jsonTables.CONFIG_MONSTER.Scaling]/100 * this.scaleSize;
                jsonTables.loadSpineCommonAction(this.spine,this.config[jsonTables.CONFIG_MONSTER.Resource]);
                this.bg.getComponent(cc.Sprite).spriteFrame = this.bgSps[this.config[jsonTables.CONFIG_MONSTER.Form] - 1];
                break;
            case ID_TYPE.SPECIAL_COUNT:
            case ID_TYPE.SPECIAL_LAST_COUNT:
            case ID_TYPE.SPECIAL_ROUND:
            case ID_TYPE.SPECIAL_LAST_ROUND:
            case ID_TYPE.SPECIAL_STONE_ROUND:
            case ID_TYPE.CLICK_EFFECT:
                var relaCount = this.ref.toString();
                this.ref = Number(relaCount.slice(0,relaCount.length-2));
                this.bg.getComponent(cc.Sprite).spriteFrame = this.bgSps[0];
                this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.SANDBOXMONSTER,this.ref);
                this.spine.node.scale = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Scale]/100 * this.scaleSize;
                jsonTables.loadSpineCommonAction(this.spine,this.config[jsonTables.CONFIG_SANDBOXMONSTER.Resource]);
                break;
        }
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
