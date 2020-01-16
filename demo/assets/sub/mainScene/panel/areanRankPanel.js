var panel = require("panel");
var toggleHelper = require('toggleHelper');

cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        formation:[cc.Node],
        rankPrefab:cc.Prefab,
        pageNum:6
    },

    onLoad () {
        jsonTables.parsePrefab(this);
        this.initModule();
        this.registerEvent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["getAreanInfo", this.getAreanInfo.bind(this)],
            ["areanRankRefresh", this.areanRankRefresh.bind(this)],
            ["refreshLeftByData", this.refreshLeftByData.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    initModule:function(){
        this.listViewJS = this.widget("areanRankPanel/shrink/scrollView").getComponent("listView");
        this.roleSpineNode = this.widget("areanRankPanel/shrink/spine");
    },
    open () {
        this.clickIdx = 0;
        this.aniIdx = 0;
        this.rankType = constant.RankType.AREAN;
        this.areanRankInit();

    },

    areanRankRefresh:function () {
        var list = this.areanLogic.getRankByType(1);
        var rankData = this.areanListToRank(list);
        this.listViewJS.updateItemData(rankData);
    },

    areanRankInit:function () {
        var list = this.areanLogic.getRankByType(this.areanLogic.RANK_TYPE.WORLD);
        var rankData = this.areanListToRank(list);
        var viewData = {
            totalCount:rankData.length,
            spacing:0,
            extNum:2,
            showAni:true
        };
        this.listViewJS.init(this.rankPrefab,viewData,rankData,0,this.getChickIdx.bind(this));

        var str = uiLang.getMessage(this.node.name,"type" + this.rankType);
        this.widget("areanRankPanel/shrink/powerLabel").getComponent(cc.Label).string = str;
        this.widget("areanRankPanel/shrink/lab/powerLabel").getComponent(cc.Label).string = str;
        this.widget("areanRankPanel/shrink/item/nameLabel").getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.Name);
        var isMyAreanOpen = jsonTables.isFunVisible(constant.FunctionTid.AREAN);
        if(isMyAreanOpen){//已开启
            this.areanLogic.req_Arena_Info();
        }else{//未开启
            this.widget("areanRankPanel/shrink/item/numberLabel2").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"unRank");
            this.widget("areanRankPanel/shrink/item/scoreLabel").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"unScore");
        }
    },

    getAreanInfo:function (data) {
        var str = data.Rank === -1 ? "-":data.Rank;
        this.widget("areanRankPanel/shrink/item/numberLabel2").getComponent(cc.Label).string = str;//
        this.widget("areanRankPanel/shrink/item/scoreLabel").getComponent(cc.Label).string = data.ArenaScore;
        var formation = this.cardLogic.getLineUpInfo();
        for (var i = 0; i < formation.length; i++) {
            var obj = formation[i];
            if(!this.formation[i]) continue;
            var family = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj);
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,family.Monsters[0]);
            var iconRes = config[jsonTables.CONFIG_MONSTER.Icon];
            uiResMgr.loadHeadIcon(iconRes,this.formation[i])
        }
    },

    areanListToRank:function (list) {
        var rankData = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var info = {};
            info.Name = obj.Name;
            info.Score = obj.Score;
            info.Country = obj.Country;
            info.UserID = obj.UserID;
            info.type = this.rankType;
            info.maxChapter = obj.MaxChapter;
            info.formation = obj.Formation;
            rankData[obj.RankNo - 1] = info;
        }
        return  rankData;
    },

    getChickIdx:function(idx){
        if(this.rankType === constant.RankType.AREAN){
            var list = this.areanLogic.getRankByType(1);
            var toggleIdx = list.length - 10;
            toggleIdx = toggleIdx < 0 ? 0 : toggleIdx;
            if (idx === toggleIdx) {
                this.areanLogic.req_Arena_Rank(list.length,1);
            }
        }else{
            var nowPage = this.rankLogic.getPageNow();
            if(nowPage*this.pageNum === idx){
                this.rankLogic.req_UserRank(nowPage+1,this.pageNum);
            }
        }
        return  this.clickIdx === idx;
    },

    clickItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if(data.isAuto){
            this.lastNode = data.node;
            this.clickRank(this.clickIdx);
        }
        if(this.clickIdx === data.idx)    return;
        this.clickIdx = data.idx;
        if(this.lastNode && this.lastNode.children){
            this.lastNode.getChildByName("selected").active = false;
        }
        this.lastNode = data.node;
        this.clickRank(this.clickIdx);
    },

    clickRank:function(idx) {
        var data;
        if(this.rankType === constant.RankType.AREAN){
            data = this.areanLogic.getRankData(1,idx);
            if(!data)   return;
        }else{
            data = this.rankLogic.getRankByIdx(idx);
        }
        this.refreshLeftByData(data);
    },

    refreshLeftByData:function (data) {
        this.rankUserID = data.UserID;
        // this.widget("areanRankPanel/in/btn").active = this.rankUserID.notEquals(this.userLogic.getBaseData(this.userLogic.Type.UserID)) && !this.friendLogic.isMyFriend(this.rankUserID);
        this.widget("areanRankPanel/shrink/nameLabel").getComponent(cc.Label).string = data.Name;
        // this.widget("areanRankPanel/in/gradeLabel2").getComponent(cc.Label).string = data.Lv;
        this.widget("areanRankPanel/shrink/numberLabel1").getComponent(cc.Label).string = data.Score;

        this.equipLogic.setBaseSpineForOther(data.Sex,data.Job,data.EquipBaseID,this.roleSpineNode);
    },
});
