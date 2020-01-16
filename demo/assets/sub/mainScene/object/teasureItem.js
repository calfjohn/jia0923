var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        finger:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.configuration = kf.require("util.configuration");
        jsonTables.parsePrefab(this);
    },
    init:function(idx,data){
        this.top = -5;//第一个宝箱距离头像的距离
        this.widget('teasureItem/boxSketch').active = !data.Type;
        this.widget('teasureItem/haveBox').active = !!data.Type;
        this.node.position =cc.v2(0,this.node.height * 0.5 + this.top + - (this.node.height + 5) * data.Idx) ;
        this.widget("teasureItem/openFrame").active = false;
        if (!data.Type) return;
        var lockTime = data.Time.toNumber();
        this.data = data;
        var spNode = this.widget('teasureItem/haveBox/box');
        spNode.getComponent(cc.Animation).stop();
        uiResMgr.loadLockTreasureBox(data.Icon, spNode);
        spNode.scale = 1;
        spNode.position = cc.v2(0,0);
        this.widget('teasureItem/haveBox/notOpen').active = data.Name !== 0 && lockTime === -1;

        if (this.widget('teasureItem/haveBox/notOpen').active) {
            // var node = this.widget('teasureItem/haveBox/notOpen/nemLabel');
            // jsonTables.loadConfigTxt(node,data.Name);
            this.widget('teasureItem/haveBox/notOpen/timeLabel').getComponent(cc.Label).string = this.timeLogic.getCommonAllTime(data.MaxTime);
        }

        this.widget('teasureItem/haveBox/open').active = data.Name !== 0 && lockTime !== -1;
        this.widget('teasureItem/haveBox/openLabel').active = false;
        this.updateFlag = this.widget('teasureItem/haveBox/open').active;
        if (this.widget('teasureItem/haveBox/open').active) {
            this.duration = 1;
        }
        if(idx === 0 && !this.configuration.getConfigData("clickBox")){
            this.showFinger();
        }else{
            this.hideFiger();
        }
    },

    showFinger:function () {
        var node = this.node.getInstance(this.finger,true);
        node.scale = 0.75;
        node.position = cc.v2(0,0);
        node.zIndex = 100;
    },

    hideFiger:function () {
        if(this.node.getChildByName("finger")){
            this.node.getChildByName("finger").active = false;
        }
    },

    touchend:function(event){
        if (this.widget('teasureItem/boxSketch').active) return;
        if(this.node.getChildByName("finger") && this.node.getChildByName("finger").active){
            this.configuration.setConfigData("clickBox",1);
            this.configuration.save();
            this.hideFiger();
            this.clientEvent.dispatchEvent("showTowerFight");
        }
        this.widget("teasureItem/openFrame").active = true;
        var ev = new cc.Event.EventCustom('clickTreasure', true);
        ev.setUserData({data:this.data,node:this.node});
        this.node.dispatchEvent(ev);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.updateFlag) return;
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        var offTime = this.data.Time.toNumber() - this.timeLogic.now();
        this.widget('teasureItem/haveBox/open').active = offTime > 0;
        if(!this.widget('teasureItem/haveBox/openLabel').active && !this.widget('teasureItem/haveBox/open').active){
            this.widget('teasureItem/haveBox/box').getComponent(cc.Animation).play();
        }
        this.widget('teasureItem/haveBox/openLabel').active = !this.widget('teasureItem/haveBox/open').active ;
        if (this.widget('teasureItem/haveBox/open').active) {
            this.widget('teasureItem/haveBox/open/countDown/timeLabel').getComponent(cc.Label).string = this.timeLogic.getCommonCoolTime(offTime);
            var per = offTime / this.data.MaxTime;
            this.widget("teasureItem/haveBox/open/countDown").getComponent(cc.ProgressBar).progress = per;
            this.widget('teasureItem/haveBox/open/diamond').active = offTime > 0;
            if (this.widget('teasureItem/haveBox/open/diamond').active) {
                var re = this.formulaLogic.calculateTreasureDiamond(offTime);
                this.widget('teasureItem/haveBox/open/diamond/numLabel').getComponent(cc.Label).string = re;
            }
        }
    }
});
