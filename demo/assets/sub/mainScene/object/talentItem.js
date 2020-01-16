var panel = require("panel");
cc.Class({
    extends: panel,
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function(){
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshLine", this.refreshLine.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function(idx,data){
        this.data = data.data;
        this.type = data.type;
        this.preArr = [];
        for (var i = 0 , len = this.data[jsonTables.CONFIG_TALENT.Pre].length; i < len; i++) {
            var obj = this.data[jsonTables.CONFIG_TALENT.Pre][i];
            var arr = obj.split("#");
            this.preArr.push(parseInt(arr[0]));
        }
        this.lv = 0;//等级默认是0
        this.widget("talentItem/light").active = false;
        var posType = this.type === constant.TalentIconType.TREE?jsonTables.CONFIG_TALENT.MainPos:jsonTables.CONFIG_TALENT.MiniPos;
        var scaleType = this.type === constant.TalentIconType.TREE?jsonTables.CONFIG_TALENT.MainScale:jsonTables.CONFIG_TALENT.MiniScale;
        this.node.scale = this.data[scaleType];
        this.node.position =cc.v2(this.data[posType][0],this.data[posType][1]);
        this.widget("talentItem/lvLabel").active = this.type === constant.TalentIconType.DETAIL;
        this.checkLock();
        if(idx === 0 && this.type !== constant.TalentIconType.TREE){
            this.lv = this.talentLogic.getTalentLv(this.data[jsonTables.CONFIG_TALENT.Tid]);
            this.clieckItem();
        }
        uiResMgr.loadRoleTalentIcon(this.data[jsonTables.CONFIG_TALENT.Icon],this.widget("talentItem/circularBottom/mask/icon"));
        this.updateLv(this.talentLogic.getTalentLv(this.data[jsonTables.CONFIG_TALENT.Tid]));
    },
    refreshLine:function(id){
        if(this.preArr.indexOf(id) !== -1){
            this.checkLock();
        }
    },
    checkLock:function(){
        var isLock = false;
        for (var i = 0 , len = this.preArr.length; i < len; i++) {
            var obj = this.preArr[i];
            if(obj&&this.talentLogic.getTalentLv(obj) === 0){
                isLock = true;
                break;
            }
        }
        this.widget("talentItem/lock").active =isLock && !this.data[jsonTables.CONFIG_TALENT.PrePoint];
    },
    updateLv:function(lv){
        this.lv = lv;
        var color = lv > 0?uiColor.white:uiColor.blueGray;
        this.widget("talentItem/circularBottom/mask/icon").color = color;
        if(this.type === constant.TalentIconType.TREE)  return;
        this.widget("talentItem/lvLabel").getComponent(cc.Label).string =this.lv  + "/" +this.data[jsonTables.CONFIG_TALENT.MaxLv];
    },
    clieckItem:function(event){
        if(this.widget("talentItem/lock").active && !this.data[jsonTables.CONFIG_TALENT.IsDisplay])   return;
        var ev = new cc.Event.EventCustom('clickItem', true);
        this.widget("talentItem/light").active = true;
        var data = {
            type:this.type,
            data:this.data,
            lv:this.lv,
            node:this.node
        }
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    // update (dt) {},
});
