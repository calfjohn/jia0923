var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        special:Boolean(false),
        familySp:[cc.SpriteFrame],
        progressBarSp:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        jsonTables.parsePrefab(this);
        this.initModule();
    },
    registerEvent: function () {
        var registerHandler = [
            ["updateMonster", this.updateMonster.bind(this)],
            // ["monLineUp", this.monLineUp.bind(this),true],
            ["updateBtn", this.updateUpBtn.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    initModule:function() {
        this.ani = this.node.getComponent(cc.Animation);
        this.spine = this.widget('miniItem/sp').getComponent(sp.Skeleton);
    },
    init:function(idx,data,extData,unClick){
        if(!this.spine) {
            this.initModule();
        }
        this.unscheduleAllCallbacks();
        this.data = data;
        this.isBottom = extData.isBottom;
        this.needCheckBottom = extData.bottom > 0;
        this.unClick = unClick;//上阵界面固定的一个Item,无法点击
        // this.spine.paused = false;
        this.familyID = data[jsonTables.CONFIG_MONSTERFAMILY.Tid];
        this.monsterData = this.cardLogic.getHeroesById(this.familyID);//服务端给过来来的数据
        this.tid = data[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
        this.level = data.Lv;
        this.debris = data.Debris;
        this.widget("miniItem/intoFrame4").active = data.isUp;
        this.widget('miniItem/floor2/buttonLineUp').active = !data.isUp;
        // var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,this.familyID + 1)[jsonTables.CONFIG_MONSTER.Icon];
        // uiResMgr.loadHeadIcon(iconRes,this.widget("miniItem/monsterEffect"));
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.familyID);
        this.quality = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        var tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Show];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var spineRes = config[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadHeadIcon("monster_head_" + this.data.Tid,this.widget('miniItem/monSprite'));
        // this.widget('miniItem/sp').scale = config[jsonTables.CONFIG_MONSTER.ShowScale] / 100;
        // var callBack = function(spineData){
        //     this.spine.skeletonData  = spineData;
        //     this.spine.setAnimation(0,'std',true);
        //     this.spine.setToSetupPose();
        //     this.scheduleOnce(function(){
        //         this.spine.paused = true;
        //         this.timeout = undefined;
        //     }.bind(this),0.1);
        // }.bind(this);
        // uiResMgr.loadSpine(spineRes,callBack,this.widget('miniItem/sp'));
        this.widget("miniItem/label/nameLabel").getComponent(cc.Label).string = uiLang.getConfigTxt(data[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        this.widget("miniItem/leaderLabel").getComponent(cc.Label).string = data[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        this.widget("miniItem/bg").getComponent(cc.Sprite).spriteFrame = this.familySp[data[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];
        uiResMgr.loadMonTypeIcon(data[jsonTables.CONFIG_MONSTERFAMILY.Type],this.widget("miniItem/intoIcon1"));
        this.widget("miniItem/damage").active =this.special;
        this.widget("miniItem/defence").active = this.special;
        this.widget("miniItem/floor2").active = false;
        this.widget("miniItem/intoFrame3").active = !this.special;
        this.widget("miniItem/label").active = this.special;
        var isme = extData.cb(this.familyID);
        if(isme){
            this.clickItem("",true);
        }
        this.reset();
    },

    reset:function(){
        this.widget("miniItem/level").getComponent(cc.Label).string ="LV" + this.level;
        if(!this.monsterData){
            this.monsterData =this.cardLogic.getHeroesById(this.familyID);//服务端给过来来的数据
        }
        if(this.level){
            this.needDebris = this.monsterData.Clip;//升级所需要的碎片数量
        }else{
            this.needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[this.quality - 1];
        }
        this.needGold = this.monsterData? this.monsterData.Gold:0;
        this.widget("miniItem/floor2/buttonLvUp/money/infoLabel").getComponent(cc.Label).string = this.needGold;
        this.widget("miniItem/intoFrame3/numberLabel1").getComponent(cc.Label).string = this.debris +"/" + this.needDebris;
        this.widget('miniItem/intoFrame3/progressBar').getComponent(cc.ProgressBar).progress = this.debris / this.needDebris;
        var idx = ((this.debris / this.needDebris) >= 1) ? 1 : 0;
        this.widget("miniItem/intoFrame3/progressBar/bar1").getComponent(cc.Sprite).spriteFrame = this.progressBarSp[idx];
        this.widget("miniItem/intoFrame3/numberLabel1").color =  idx === 0 ? uiColor.miniItem.progressNormal:uiColor.miniItem.progressFull;
        this.widget('miniItem/intoFrame3/arrow').active = this.debris >= this.needDebris;
        // this.widget('miniItem/sp').color = this.level ? uiColor.white:uiColor.black;
        this.widget('miniItem/monSprite').color = this.level ? uiColor.white:uiColor.black;
        if(this.level > 0){
            this.widget('miniItem/sp').color =uiColor.white;
        }else if(this.debris > 0){
            this.widget('miniItem/sp').color =uiColor.miniItem.gray;
        }else{
            this.widget('miniItem/sp').color =uiColor.black;
        }
        if(!this.level) return;
        var showData = this.cardLogic.getShowNum(this.tid);
        this.widget("miniItem/label/swordLabel").getComponent(cc.Label).string = showData.sword;
        this.widget("miniItem/label/shieldLabel").getComponent(cc.Label).string = showData.shield;
        this.updateUpBtn();
    },

    updateUpBtn:function(){
        var gold = this.userLogic.getBaseData(this.userLogic.Type.Gold);
        this.widget('miniItem/floor2/buttonLvUp').active = this.debris >= this.needDebris && gold >= this.needGold;
        this.widget('miniItem/floor2/buttonInfo').active = !this.widget('miniItem/floor2/buttonLvUp').active;
    },

    playShow:function(){
        var animState = this.ani.play("drop");
        animState.wrapMode = cc.WrapMode.Normal;
        this.widget("miniItem/damage").active = true;
        this.widget("miniItem/defence").active = true;
        this.widget("miniItem/intoFrame3").active = false;
        this.widget("miniItem/label").active = true;
        // this.spine.paused = false;
        // this.spine.setAnimation(0,'atk',false);
        // this.spine.addAnimation(0,'std',true);
        if(this.needCheckBottom){
            var str = this.isBottom?"downShow":"downHide";
            this.node.dispatchDiyEvent(str,0);
        }
    },

    playHide:function(needHide){
        var animState = this.ani.play("drop");
        animState.wrapMode = cc.WrapMode.Reverse;
        this.widget("miniItem/damage").active = false;
        this.widget("miniItem/defence").active = false;
        this.widget("miniItem/intoFrame3").active = true;
        this.widget("miniItem/label").active = false;
        // this.spine.setAnimation(0,'std',true);
        // this.spine.setToSetupPose();
        // setTimeout(function(){
        //     this.spine.paused = true;
        // }.bind(this),50);
        if(this.needCheckBottom && this.isBottom && needHide){
            this.node.dispatchDiyEvent("downHide",0);
        }
    },

    setHind:function(){
        this.widget('miniItem/floor2').active = false;
        this.widget("miniItem/damage").active = false;
        this.widget("miniItem/defence").active = false;
        this.widget("miniItem/intoFrame3").active = true;
        this.widget("miniItem/label").active = false;
        // this.spine.setAnimation(0,'std',true);
        // this.spine.setToSetupPose();
        // setTimeout(function(){
        //     this.spine.paused = true;
        // }.bind(this),50);
    },

    updateMonster:function(info,isSkillUp){
        if(info.FamilyID !== this.familyID || isSkillUp) return;
        this.level = info.Lv;
        this.debris = info.Num;
        this.monsterData = info;
        this.reset();
    },

    clickItem:function(event,auto){
        if(this.debris >= this.needDebris && !this.level){
            this.cardLogic.reqHeroCreate(this.familyID);
            return;
        }else if(!this.level){
            // uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage("browse","noCard"));
            return;
        }
        if(this.widget("miniItem/damage").active)  return;
        if(this.unClick)    return;
        this.playShow();
        var data = {
            target:this,
            familyID:this.familyID,
            data:this.data,
            auto:auto
        }
        var ev = new cc.Event.EventCustom('clickMiniItem', true);
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },
    // monLineUp:function(familyID){
    //     if(this.familyID !== familyID)  return;
    //     console.log(this.data.test);
    //     this.clicklineUp();
    // },
    clickLvUp:function(){
        uiManager.openUI(uiManager.UIID.MONINFO,this.familyID,0);
    },
    clickInfo:function(){
        uiManager.openUI(uiManager.UIID.MONINFO,this.familyID);
    },
    clicklineUp:function(){
        if(this.widget("miniItem/intoFrame3").active){
            this.playShow();
        }
        var ev = new cc.Event.EventCustom('clickChange', true);
        var data = {
            target:this,
            familyID:this.familyID,
            data:this.data
        }
        ev.setUserData(data);
        this.node.dispatchEvent(ev);
    },

    //设置反向位移位置
    setInitPos: function (pos) {
        this.initPos = pos;
    },

    //帧事件 反向位移
    moveToInitPos: function () {
        var moveTo = cc.jumpTo(3 / 30, this.initPos, 50, 1);
        this.clientEvent.dispatchEvent("leaderWeek",true);
        this.node.parent.runAction(moveTo);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
