var panel = require("panel");
var toggleHelper = require('toggleHelper');
cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        rankPrefab:cc.Prefab,
        pageNum:6
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initModule();
        this.registerEvent();
        this.aniArr = ["std","atk","walk"];
        this.clickIdx = -1;
        this.widget("rankPanel/shrink/toggleContainer/toggle2").active = window && window.FBInstant;
        this.widget("rankPanel/shrink/toggleContainer1/toggle1").active = window && window.FBInstant;
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshRank", this.refreshRank.bind(this)],
            ["refreshLeftByData", this.refreshLeftByData.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    initModule:function(){
        this.listViewJS = this.widget("rankPanel/shrink/scrollView").getComponent("listView");
        this.roleSpineNode = this.widget("rankPanel/shrink/spine");
    },
    open:function(){
        this.clickIdx = 0;
        this.aniIdx = 0;
        this.rankType = constant.RankType.LEVEL;
        this.toggleHelperJs.setIdxToggleCheck(this.rankType);
        // this.areanRankInit();
        this.rankLogic.req_UserRank(0,this.pageNum,this.rankType);
    },

    refreshRank:function(page,rankData){
        for (var i = 0 , len = rankData.length; i < len; i++) {
            var obj = rankData[i];
            obj.type = this.rankType;
        }
        if(page === 0){
            this.clickIdx = 0;
            var rank = this.rankLogic.getMyRank();
            var str = rank === -1 ? "-":rank;
            this.widget("rankPanel/shrink/item/numberLabel2").getComponent(cc.Label).string = str;//
            this.widget("rankPanel/shrink/item/nameLabel").getComponent(cc.Label).string = this.userLogic.getBaseData(this.userLogic.Type.Name);

            if(this.rankType === constant.RankType.LEVEL) {
                var myScore = this.rankLogic.getMyScore();
                this.widget("rankPanel/shrink/item/scoreLabel").getComponent(cc.Label).string = Math.floor(myScore/1000);
                this.widget("rankPanel/shrink/item/towerLabel").getComponent(cc.Label).string = myScore % 1000;
            }
            // this.widget("rankPanel/shrink/item/iconCountry").active = this.rankType === constant.RankType.LEVEL;
            if(this.widget("rankPanel/shrink/item/iconCountry").active){
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.COUNTRY,this.userLogic.getBaseData(this.userLogic.Type.Country));
                uiResMgr.loadCountryIcon(config[jsonTables.CONFIG_COUNTRY.CountryIcon],this.widget("rankPanel/shrink/item/iconCountry"));
            }
            var viewData = {
                totalCount:rankData.length,
                spacing:0,
                extNum:2,
                showAni:true
            };
            this.listViewJS.init(this.rankPrefab,viewData,rankData,0,this.getChickIdx.bind(this));
            var str = uiLang.getMessage(this.node.name,"type" + this.rankType);
            this.widget("rankPanel/shrink/powerLabel").getComponent(cc.Label).string = str;
            this.widget("rankPanel/shrink/lab/powerLabel").getComponent(cc.Label).string = str;
        }else{
            this.listViewJS.updateItemData(rankData);
        }
    },

    switchToggle:function(event,idx){
        if(idx === this.rankType)    return;
        this.rankType = idx;
        if(this.rankType === constant.RankType.GROW){
            this.rankLogic.req_UserRank(0,this.pageNum,this.rankType);
        }else if(this.rankType === constant.RankType.AREAN){
            // this.areanRankInit();
        }else{//小游戏排行榜

        }
    },

    switchSpineAni:function(event){
        this.aniIdx ++;
        if(this.aniIdx >= this.aniArr.length){
            this.aniIdx = 0;
        }
        this.roleSpineNode.getComponent(sp.Skeleton).setAnimation(0,this.aniArr[this.aniIdx],true);
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
        // this.widget("rankPanel/shrink/btn").active = this.rankUserID.notEquals(this.userLogic.getBaseData(this.userLogic.Type.UserID)) && !this.friendLogic.isMyFriend(this.rankUserID);
        this.widget("rankPanel/shrink/nameLabel").getComponent(cc.Label).string = data.Name;
        // this.widget("rankPanel/shrink/gradeLabel2").getComponent(cc.Label).string = data.Lv;
        if(data.type === constant.RankType.LEVEL) {
            this.widget("rankPanel/shrink/numberLabel1").getComponent(cc.Label).string = Math.floor(data.Score/1000);
        }
        this.equipLogic.setBaseSpineForOther(data.Sex,data.Job,data.EquipBaseID,this.roleSpineNode);
    },

    addFriend:function(){
        this.friendLogic.req_Friend_Apply(this.rankUserID);
    },

    openFriend:function () {
        uiManager.openUI(uiManager.UIID.FRIENDPANEL);
        this.close();
    },
    // update (dt) {},
});
