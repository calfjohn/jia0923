var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        bottomPrefab:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initNodes();
        this.registerEvent();
        this.maxReelCount = 5;//最大卷轴数量
        this.showMaxRow = 5;
    },
    initNodes:function(){
        // this.reelParent = this.widget('reelPanel/shrink/floor2/reel');
        this.listViewComp = this.widget('reelPanel/shrink/scrollView').getComponent("listView");
    },
    registerEvent: function () {

        var registerHandler = [
            ["refreshNewReel", this.refreshNewReel.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickReelItem", this.clickReelItem.bind(this)],
            ["clickBottomReel", this.clickBottomReel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    refreshNewReel:function(){
        this.cardLogic.copyReelsLineUp();
        this.refresh();
    },

    clickBottomReel:function(event){
        event.stopPropagation();
        var id = event.getUserData();
        this._clickReelItem(id);
    },

    clickReelItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        this._clickReelItem(data.ID);
    },

    _clickReelItem:function(id){
        var list = this.cardLogic.getReelsLineUpCopys();
        if (kf.inArray(list,id)) {
            var idx = kf.getArrayIdx(list,id);
            list[idx] = 0;
        }else {
            var isReplace = false;
            for (var i = 0 , len = list.length; i < len; i++) {
                var obj = list[i];
                if (obj === 0) {
                    list[i] = id;
                    isReplace = true;
                    break;
                }
            }
            if (!isReplace) {
                if (list.length === this.maxReelCount) {
                    list[list.length - 1] = id;
                }else {
                    list.push(id);
                }
            }
        }
        this.cardLogic.setReelsLineUpCopys(list);
        this.refresh();
    },

    open:function(){
        this.cardLogic.copyReelsLineUp();
        this.refresh(0);
    },

    close:function(){
        this.cardLogic.checkCopyReel();
    },

    refresh:function(idx){
        this.initLineUp();
        this.initListView(idx);
    },

    initLineUp:function(){
        var list = this.cardLogic.getReelsLineUpCopys();

        var refreshData = {
            content:this.widget('reelPanel/shrink/left/view/content'),//
            list:list,
            prefab:this.bottomPrefab
        }
        uiManager.refreshView(refreshData);
    },

    initListView:function(idx){
        var resetDataFlag = idx === undefined;
        idx = idx === undefined ? this.idx :idx;
        this.idx = idx;
        var list = [];
        var baseList = this.cardLogic.getReelByForm(idx);
        var listCell = [];
        for (var i = 0 , len = baseList.length; i < len; i++) {
            var obj = baseList[i];
            listCell.push(obj);
            if (listCell.length === 2) {
                list.push(listCell);
                listCell = [];
            }
        }
        if (listCell.length > 0) {
            listCell.push({empty:true});
            list.push(listCell);
            listCell = [];
        }
        if (list.length < this.showMaxRow) {
            for (var i = 0 , len = this.showMaxRow - list.length; i <  len; i++) {
                list.push([{empty:true},{empty:true}]);
            }
        }else {
            for (var i = 0 , len = 2; i <  len; i++) {
                list.push([{empty:true},{empty:true}]);
            }
        }
        var viewData = {
            totalCount:list.length,
            spacing:0
        };
        if (resetDataFlag) {
            this.listViewComp.updateItemData(list,true);
        }else {
            this.listViewComp.init(this.itemPrefab,viewData,list);
        }
    },

    switchTag:function(param,idx){
        this.initListView(idx);
    },

    openLineUp:function () {
        uiManager.openUI(uiManager.UIID.LINEUP);
        this.scheduleOnce(function () {
            this.close();
        }.bind(this),0.1);
    },
    openSmelt:function () {
        uiManager.openUI(uiManager.UIID.SMELTPANEL,uiManager.UIID.REELPANEL);
        this.scheduleOnce(function () {
            this.close();
        }.bind(this),0.1);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
