var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        numLabelArr:[cc.Label],
        upNodeArr:[cc.Node]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
    },
    open:function(param,oldData,callback){
        this.callback = callback ? callback:function(){};
        this.unscheduleAllCallbacks();
        this.oldData = oldData;
        this.equipLogic.setBaseSpine(this.widget("upgrade/date/role/spine"));
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.ROLELVUP);
        this.param = param;
        this.addNumArr = [];//增值
        this.oldNumArr = [];//旧值
        //等级
        this.deelValue(this.userLogic.Type.Lv,param.Lv);
        //攻击
        this.deelValue(this.userLogic.Type.Atk,param.Atk);
        //防御
        this.deelValue(this.userLogic.Type.Def,param.Def);
        //体力上限
        this.deelValue(this.userLogic.Type.MaxVit,param.MaxVit);
        //保留
        this.deelValue(this.userLogic.Type.HeroKeep,param.HeroKeep);
        //步数
        this.deelValue(this.userLogic.Type.Step,param.Step);
        //领导力
        this.deelValue(this.userLogic.Type.Leader,param.Leader);
        for (var i = 0 , len = this.addNumArr.length; i < len; i++) {
            this.numLabelArr[i].string = this.oldNumArr[i];
            this.upNodeArr[i].getChildByName("numLabel").getComponent(cc.Label).string = this.addNumArr[i];
            this.upNodeArr[i].active = false;
        }
        this.widget("upgrade/date/role/glow1").getComponent(cc.Animation).play();
        this.clickEnable = true;
        this.runIdx = 0;
        this.runShow();
    },
    deelValue:function(type,newNum){
        var oldNum = this.oldData[type];
        // this.userLogic.setBaseData(type,newNum);
        this.oldNumArr.push(oldNum);
        this.addNumArr.push(newNum - oldNum);
    },
    runShow:function(){
        if(this.oldNumArr[this.runIdx] === undefined){
            // this.closeEvent();
            return;
        }
        if(this.addNumArr[this.runIdx]){
            this.scheduleOnce(function(){
                this.showNext();
            }.bind(this),1)
        }else{
            this.runIdx ++;
            this.runShow();
        }

    },
    showNext:function(unAuto){
        if(this.upNodeArr[this.runIdx]){
            this.upNodeArr[this.runIdx].active = true;
            this.numLabelArr[this.runIdx].getComponent("scaleAni").init(this.oldNumArr[this.runIdx] + this.addNumArr[this.runIdx]);
        }
        if(!unAuto){
            this.runIdx ++;
            this.runShow();
        }
    },
    closeEvent:function(){
        this.clickEnable = false;
        this.callback();
        // this.userLogic.refreshUIData();
        this.close();
    },
    btnEvent:function(){
        if(!this.clickEnable)   return;
        if(!this.upNodeArr[this.runIdx]){
            this.closeEvent();
        }else{
            this.showAll();
        }
    },

    showAll:function(){
        this.unscheduleAllCallbacks();
        for (var i = this.runIdx , len = this.oldNumArr.length; i < len; i++) {
            this.showNext();
            this.runIdx ++;
        }
    },

    close:function(){
        this.clientEvent.dispatchEvent("refreshMainBtnActive");
    },
    // update (dt) {},
});
