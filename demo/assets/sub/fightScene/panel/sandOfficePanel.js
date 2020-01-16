var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initNodes();
    },

    initNodes:function(){
        this.typeName = this.widget('sandOfficePanel/shrink/nameLabel');
        this.typeDesc = this.widget('sandOfficePanel/shrink/label');
        this.officeDesc = this.widget('sandOfficePanel/shrink/label2');
        // this.qualityIcon = this.widget('sandOfficePanel/shrink/content/iconForm');
        this.qualityDesc = this.widget('sandOfficePanel/shrink/content/label4');
        this.monsterName = this.widget('sandOfficePanel/shrink/monsterLabel');
        this.midIconNode = this.widget('sandOfficePanel/shrink/icon');

        this.gridContent = this.widget('sandOfficePanel/shrink/boxFrame2');
    },

    /** tid ---> 沙盘怪物的id */
    open:function(tid,scaleSize,hpCount,count){
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.SANDBOXMONSTER,tid);
        this.spine.node.scale = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Scale]/100 * scaleSize;
        this.spine.skeletonData = null;
        var callBack = function(spineData){
            this.spine.skeletonData  = spineData
            this.spine.setAnimation(0,'std',true);
        }.bind(this);
        uiResMgr.loadSpine(this.config[jsonTables.CONFIG_SANDBOXMONSTER.Resource],callBack);
        this.monsterName.getComponent(cc.Label).string = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_SANDBOXMONSTER.NameID]);
        this.typeName.getComponent(cc.Label).string = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_SANDBOXMONSTER.Title]);
        this.typeDesc.getComponent(cc.Label).string = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_SANDBOXMONSTER.TitleDes]);
        this.officeDesc.getComponent(cc.Label).string = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_SANDBOXMONSTER.TriggerDes]).formatArray([count]);
        var str = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_SANDBOXMONSTER.RemoveDes]);
        // this.qualityIcon.active = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] !== 0 && this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] !== tb.MONSTER_NO;
        // if (this.qualityIcon.active) {
        //     uiResMgr.loadQualityMiniIcon(this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form],this.qualityIcon);
        // }
        if (this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] !== 0) {
            var formDesc = uiLang.get("form"+this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form]+"Desc");
            str = str.formatArray([formDesc]);
        }else {
            str = str.formatArray([hpCount]);
        }
        this.qualityDesc.getComponent(cc.Label).string = str;

        uiResMgr.loadsandOfficeIcon(this.config[jsonTables.CONFIG_SANDBOXMONSTER.CenterIcon],this.midIconNode);

        var list = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint] || [];
        var refreshData = {
            content:this.gridContent,
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
