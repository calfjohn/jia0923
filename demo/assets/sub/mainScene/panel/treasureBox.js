var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.duration = 0;
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshTreasure", this.refresh.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },

    refresh:function(){
        if (!this.data.Idx) return cc.error("客户端错误");
        if (!this.data){
            this.widget('treasureBox/frame/open').active = false;
            this.close();
            return ;
        }

        uiResMgr.loadLockTreasureBox(this.data.Icon, this.widget('treasureBox/frame/box'));
        var node = this.widget('treasureBox/frame/nameLabel');
        jsonTables.loadConfigTxt(node,this.data.Name);
        this.widget('treasureBox/frame/btnUnlock').active = this.data.Time.toNumber() === -1;
        this.widget('treasureBox/frame/open').active = this.data.Time.toNumber() !== -1;
        if (this.widget('treasureBox/frame/btnUnlock').active) {
            var count = this.treasureLogic.getCurOpening();
            this.widget('treasureBox/frame/btnUnlock').active = count === 0;
            this.widget("treasureBox/frame/btnOpen").active = !this.widget('treasureBox/frame/btnUnlock').active;
        }else {
            this.widget("treasureBox/frame/btnOpen").active = false;
        }
        if (this.widget("treasureBox/frame/btnOpen").active) {
            var re = this.formulaLogic.calculateTreasureDiamond(this.data.MaxTime);
            this.widget('treasureBox/frame/btnOpen/layout/numLabel').getComponent(cc.Label).string = re;

        }
        if (this.widget('treasureBox/frame/btnUnlock').active) {
            this.widget('treasureBox/frame/btnUnlock/numLabel').getComponent(cc.Label).string = this.timeLogic.getCommonAllTime(this.data.MaxTime);
        }

        var maxCount = this.userLogic.getBaseData(this.userLogic.Type.ChestUnlockNum) || 0;
        this.widget('treasureBox/frame/layout/numLabel').getComponent(cc.Label).string = (maxCount - this.treasureLogic.getCurOpening() )+ "/" + maxCount;
        var times = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ShareReduceTime);
        this.widget('treasureBox/frame/open/label4').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"jump").formatArray([this.timeLogic.getCommonAllTime(times)]);
        var max = this.userLogic.getBaseData(this.userLogic.Type.ChestHelpMax);
        var cur = this.userLogic.getBaseData(this.userLogic.Type.ChestHelpTimes);
        this.widget('treasureBox/frame/open/btnShare/label').getComponent(cc.Label).string = cur + "/" + max;
        this.widget('treasureBox/frame/open/btnShare').getComponent(cc.Button).interactable = this.shareLogic.isCanShare() && this.data.Time.toNumber() !== -1 && cur > 0;

        this.widget('treasureBox/frame/numLabel').getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"chapter").formatArray([this.data.Level]);
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BOXINFO,this.data.ChestID);
        var list = [];
        for (var key in config) {
            if (key === jsonTables.CONFIG_BOXINFO.Tid || key === jsonTables.CONFIG_BOXINFO.Equip || key === jsonTables.CONFIG_BOXINFO.Diamond || key === jsonTables.CONFIG_BOXINFO.EquipSum || key === jsonTables.CONFIG_BOXINFO.EquipQuality) continue;
            list.push({type:key,info:config[key]})
        }
        //障碍列表
        var refreshData = {
            content:this.widget('treasureBox/frame/reward/frame2/content'),
            list:list,
            prefab:this.itemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    openExclamatory:function(){
        if (this.userLogic.getBaseData(this.userLogic.Type.ChestUnlockNum) > this.treasureLogic.getMaxExclamCount()) {
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"max"));
            return;
        }
        uiManager.openUI(uiManager.UIID.EXCLAMTORY);
    },

    open:function(data){//打开这个界面只会是 正在进行中
        this.duration = 1;
        this.data = data;
        this.refresh();
    },

    openBoxNow:function(){
        this.close();
        var type = this.treasureLogic.OPTYPE_ENUM.OPEN_NOW;
        this.treasureLogic.req_Chest_Op(this.data.Idx,type);
    },

    btnShare:function(){
        this.close();
        if (window && window.FBInstant && !cc.sys.isNative) {//如果是fbh5 环境 没有分享回掉
            this.treasureLogic.req_Chest_Help(this.data.Idx);
        }else {
            this.shareLogic.share(tb.SHARELINK_BOX,1,function (isSucess) {
                if (isSucess) {
                    this.treasureLogic.req_Chest_Help(this.data.Idx);
                }
            }.bind(this));
        }
    },

    openLock:function(){
        this.close();
        var type = this.treasureLogic.OPTYPE_ENUM.UNLOCK;
        this.treasureLogic.req_Chest_Op(this.data.Idx,type);
    },

    openFree:function(){
        this.close();
        var type = this.treasureLogic.OPTYPE_ENUM.TOOKEN;
        this.treasureLogic.req_Chest_Op(this.data.Idx,type);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;

        if (this.widget('treasureBox/frame/open').active){
            var offTime = this.data.Time.toNumber() - this.timeLogic.now();
            if (offTime <= 0){
                return this.close();//说明时间到了
            }
            this.widget('treasureBox/frame/open/time/numLabel').getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
            var re = this.formulaLogic.calculateTreasureDiamond(offTime);
            this.widget('treasureBox/frame/open/btnOpen/layout/numLabel').getComponent(cc.Label).string = re;
        }
    }
});
