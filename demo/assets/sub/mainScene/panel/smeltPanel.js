var panel = require("panel");
var toggleHelper = require('toggleHelper');

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        smeltContentItem:cc.Prefab,
        smeltBtnComp:cc.Button,
        midQualityFrames:[cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.rowCount = 4;//一行5个
        this.limitRow = 6;//最少的行数//
        this.registerEvent();
        this.smeltList = [];
        this.levelCountList = [4,6];//顶部数据
        this.costGold = this.widget('smeltPanel/shrink/in/floor2/cost/numberLabel');//
        this.initNodes()
    },

    initNodes(){
        this.midCount = this.widget('smeltPanel/shrink/in/floor2/frequency/floor4/numberLabel').getComponent(cc.Label);//
    },

    registerEvent: function () {

        var registerHandler = [
            ["refreshSmeltList", this.refreshSmeltList.bind(this)],
            ["refreshSmeltCount", this.refreshSmeltCount.bind(this)],
            ["refreshNewReel", this.refreshNewReel.bind(this)],
            ["refreshHeros", this.refreshNewReel.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickSmeltItem", this.clickSmeltItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    refreshNewReel:function(){
        this.cardList = this.cardLogic.getCardClips();
        this.refreshList();//刷新界面
    },

    refreshLeftCount:function(){
        var max = this.dayliyMax  || 1;
        // this.widget('smeltPanel/shrink/in/frequency/label2').getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.RefineNum)+"/"+max;
    },

    clickSmeltItem:function(event){
        event.stopPropagation();
        var familyID = event.getUserData();
        var idx = kf.getArrayIdx(this.list,familyID);
        if (this.list.length > 0) {
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.list[0]);
            var familyIDConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
            if (config[jsonTables.CONFIG_MONSTERFAMILY.Quality] !== familyIDConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality]) {
                uiManager.msgConfirm(uiLang.getMessage(this.node.name,"sameQulaity"),function () {});
                return;
            }
        }
        if (idx !== -1) {
            this.list.splice(idx,1);
        }else {
            this.list.push(familyID);
        }
        this.refreshList();
        this.clickMaxBtn();
    },

    resetMidQuality:function(){
        var qualityIdx = 0;
        if (this.list.length > 0) {
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.list[0]);
            qualityIdx = config[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        }
        qualityIdx = qualityIdx >= this.midQualityFrames.length ? this.midQualityFrames.length -1 :qualityIdx;
        this.widget("smeltPanel/shrink/in/floor2/frequency/floor4").getComponent(cc.Sprite).spriteFrame = this.midQualityFrames[qualityIdx];
    },

    /** 刷新右侧列表 */
    refreshSmeltList:function(reward){

        var cb = function () {
            // uiManager.openUI(uiManager.UIID.REWARDMSG,reward);
        }.bind(this);
        if (reward.length > 0) {
            uiManager.openUI(uiManager.UIID.SMELT_REWARD,reward);
        }
        var list = [];
        this.cardList = this.cardLogic.getCardClips();
        for (var i = 0 , len = this.cardList.length; i <  len; i++) {
            var obj = this.cardList[i];
            if (kf.inArray(this.list,obj.FamilyID)) {
                list.push(obj.FamilyID);
            }
        }
        this.list = list;
        this.refreshList();
        this.clickMaxBtn();
        this.refreshLeftCount();
    },
    //接收规则数据
    refreshSmeltCount:function(list,serverData){
        this.dayliyMax = serverData.DailyMax;
        this.smeltList = list;
        this.levelCountList = serverData.toggleCount || this.levelCountList;
        this.refreshUI();
        this.refreshLeftCount();
    },
    /** 计算花费的钱 */
    caculateGold:function(){
        var smeltRule = this.cardLogic.getSmeltRule();
        if (this.list.length === 0) return 0;
        if (!smeltRule) return 0;
        var levelData = smeltRule[this.levelCount];
        if (!levelData) return 0;
        var idx = this.genFamilyID === -1 ? 0 :1;
        var costBase = levelData.costGold[idx];
        if (!costBase) return 0;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.list[0]);
        return costBase / 100 * smeltRule.CostBase[config[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];
    },
    //计算 金币
    setGoldLabel:function(){
        this.costGold.getComponent(cc.Label).string = this.caculateGold() * this.smeltCount;
    },

    swichQuality:function(_,tag){
        this.qualityCount = Number(tag);
        this.refreshRow = true;
        this.refreshList();
    },

    open:function(lastUIID){
        this.genFamilyID = -1;
        this.refreshRow = true;
        this.lastUIID = lastUIID;
        this.list = [];
        this.cardList = this.cardLogic.getCardClips();
        this.levelCount = 6;//合成卡牌数
        this.smeltCount = 0;//熔炼次数
        this.qualityCount = 6;//筛选卡牌数 6默认最高品质
        this.refreshList();

        this.midCount.string = "";
        this.setGoldLabel();
        this.cardLogic.req_Refine_Rule(this.refreshUI.bind(this));
    },

    refreshUI:function(){
    },

    refreshList:function(){
        this.resetMidQuality();
        var list = [];
        if (this.qualityCount === 6) {
            list = this.cardList;
            for (var i = 0 , len = list.length; i < len; i++) {
                var obj = list[i];
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj.FamilyID);
                obj.BaseData = config;
            }
        }else {
            for (var i = 0 , len = this.cardList.length; i < len; i++) {
                var obj = this.cardList[i];
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj.FamilyID);
                if (config[jsonTables.CONFIG_MONSTERFAMILY.Quality] === this.qualityCount) {
                    obj.BaseData = config;
                    list.push(obj);
                }
            }
        }

        this.dealArr(list);

    },
    dealArr:function(listOld){
        listOld.sort(function(a,b){
            if(a.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] !== b.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality]){
                return  a.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] - b.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
            }
            return  a.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Tid] - b.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Tid];

            // if(a.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] > b.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return -1;
            // if(a.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] < b.BaseData[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return 1;
        });
        var list = [];
        for (var i = 0 , len = listOld.length; i < len; i++) {
            var obj = listOld[i];
            if(obj.BaseData.Quality > jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.RefineQualityUp))  continue;
            list.push(obj);
        }
        var rowCount = Math.ceil(list.length / this.rowCount);//需要创建几行
        var allNum = rowCount >= this.limitRow ? rowCount * this.rowCount:this.limitRow * this.rowCount;//计算总共需要创建几个Item
        var newList = [];
        var info = [];//一行
        for (var i = 0 , len = allNum; i < len; i++) {
            var item = list[i] ? list[i]:{};
            info.push(item);
            if(info.length >= this.rowCount){
                newList.push(info);
                info = [];
            }
        }
        var viewData = {
            totalCount:newList.length,
            spacing:8,
            rollNow:this.refreshRow
        };
        this.refreshRow = false;

        this.widget('smeltPanel/shrink/in/floor1/scrollView').getComponent("listView").init(this.smeltContentItem,viewData,newList,0,this);
    },

    isInList:function(familyID){
        return kf.inArray(this.list,familyID);
    },

    /** 对次数进行加减 */
    fixSmeltCount:function(_,param){
        param = Number(param);
        this.smeltCount += param;
        if (this.smeltCount < 0) {
            this.smeltCount = 0;
        }
        var max = this.getSmeltCountMax();
        if (this.smeltCount > max) {
            this.smeltCount = max;
        }
        this.setMidCount();
        this.setGoldLabel();
    },

    setMidCount:function(){
        if (this.smeltCount === 0) {
            this.midCount.string = "";
        }else {
            this.midCount.string = "x"+this.smeltCount;
        }
    },

    isCurSmelMax:function(){
        if (this.levelCount === 6 && this.list.length > 0) {
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,this.list[0]);
            if (config[jsonTables.CONFIG_MONSTERFAMILY.Quality] >= jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.RefineQualityUp)) {
                return true;
            }
        }
        return false;
    },

    smeltBtn:function(){
        if (this.isCurSmelMax()) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"smelltMax"));
        }
        var count = this.getSmeltCountMax();
        if (count < this.smeltCount) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"smelltFail"));
        var costGold = this.caculateGold();
        if (costGold > this.userLogic.getBaseData(this.userLogic.Type.Gold)) return uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"smelltGoldFail"));

        var list = [];
        for (var i = 0 , len = this.list.length; i < len; i++) {
            var obj = this.list[i];
            if (!obj) continue;
            list.push(obj);
        }
        var deepLv = this.levelCount === 4 ? 0 : 1;
        if (this.smeltCount===0) {
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"smelltCountFail"));
        }
        if (list.length === 0 || this.smeltCount===0) return;
        this.genFamilyID = this.genFamilyID || -1;
        this.cardLogic.req_Frag_Refine(list,deepLv,this.smeltCount,this.genFamilyID);
    },

    clickMaxBtn:function(){
        this.smeltCount = this.getSmeltCountMax();
        this.setMidCount();
        this.setGoldLabel();
    },

    /** 计算最大 */
    getSmeltCountMax:function(){
        if(!this.cardList) return 0 ;
        var count = 0;
        for (var i = 0 , len = this.cardList.length; i < len; i++) {
            var obj = this.cardList[i];
            if (kf.inArray(this.list,obj.FamilyID)) {
                count += obj.Num;
            }
        }
        return Math.floor(count / this.levelCount);
    },

    close:function () {
        if(this.lastUIID){
            uiManager.openUI(this.lastUIID);
            this.lastUIID = undefined;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
