var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        isInstall:Boolean(false),
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.iconNode = this.node.getChildByName("icon");
        this.iconFrameNode = this.node.getChildByName("qualityFrame1");
        this.iconBaseFrameNode = this.node.getChildByName("iconFrame");
        this.starItem = this.node.getChildByName("starItem");
        this.starContent = this.node.getChildByName("starContent");
        this.onNode = this.node.getChildByName("on");
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["downEquip", this.downEquip.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function(idx,data,specialCb) {
        // this.widget("equipItem/number").getComponent(cc.Label).string ="x" + data.Num;
        if(!this.iconNode)  return;
        this.idx = idx;
        this.isSpecial = data.isSpecial;
        this.specialCb = specialCb;//装备熔炼一侧特殊处理
        this.data = data;//装备信息
        // this.onNode.active = false;
        this.iconNode.active = data.ID !== undefined ;
        this.iconFrameNode.active = false;
        this.iconBaseFrameNode.active = data.ID !== undefined;
        if(this.widget("equipItem/equipmentMask")){
            this.widget("equipItem/equipmentMask").active = false;
        }
        if(this.widget("equipItem/new")){
            this.widget("equipItem/new").active = false;
        }
        if(this.widget("equipItem/lock")){
            this.widget("equipItem/lock").active = false;
        }
        this.widget("equipItem/on").active = false;//
        if(data.ID !== undefined){
            if(this.widget("equipItem/new")){
                this.widget("equipItem/new").active = data.New;
            }
            if(this.widget("equipItem/lock")){
                this.widget("equipItem/lock").active = data.Lock;
            }
            var baseData = data.BaseData;//装备配置表基本数据
            this.type = baseData[jsonTables.CONFIG_EQUIP.Type];
            uiResMgr.loadEquipIcon( baseData[jsonTables.CONFIG_EQUIP.Icon],this.iconNode);
            var quality = baseData[jsonTables.CONFIG_EQUIP.Quality];
            // uiResMgr.loadEquipBaseIcon(quality,this.iconFrameNode);
            uiResMgr.loadEquipBaseIcon(quality,this.iconBaseFrameNode);
            this.starContent.active = true;
            this.refreshStar(data.AttrInfos);
            if(this.specialCb){
                var re = this.specialCb(data.ID);
                if(re === 1){
                    // this.widget("equipItem/on").active = true;
                }else if(re === 2 && this.widget("equipItem/equipmentMask")){
                    this.widget("equipItem/equipmentMask").active = true;
                }
            }
        }else {
            this.starContent.active = false;
            if (this.isInstall) {
                // this.iconFrameNode.active = true;
                // this.iconBaseFrameNode.active = true;
                // uiResMgr.loadQualityIcon(5,this.iconFrameNode);
                // uiResMgr.loadBaseQualityIcon(5,this.iconBaseFrameNode);
            }
        }
    },
    //刷新装备星星数量
    refreshStar:function (list) {
        var starNum = 0;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(obj.Color){
                starNum ++;
            }
        }
        var content = this.starContent;
        var msgItem;
        for (var i = 0 , len = starNum; i < len; i++) {
            var obj = list[i];
            if(content.children[i]){
                msgItem = content.children[i];
            }else{
                msgItem = cc.instantiate(this.starItem);
                msgItem.parent = content;
            }
            msgItem.active = true;
        }
        if(content.children.length > starNum) {
            for(var j = starNum; j < content.children.length; ) {
                var node = content.children[j];
                node.removeFromParent();
                node.destroy();
            }
        }
    },
    downEquip:function(id){
        if(!this.isSpecial || id !== this.data.ID || !this.widget("equipItem/equipmentMask"))  return;
        this.widget("equipItem/equipmentMask").active = false;
    },
    clickItem:function(event){
        if(this.widget("equipItem/new") && this.widget("equipItem/new").active){
            this.widget("equipItem/new").active = false;
            this.equipLogic.req_Click_Equip(this.data.ID);
        }
        var data = {
            node:this.node,
            data:this.data,
            type:this.type,
            isInstall:this.isInstall,
            isSpecial:this.isSpecial,
            idx:this.idx
        }
        var ev = new cc.Event.EventCustom('clickItem', true);
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },

    // update (dt) {},
});
