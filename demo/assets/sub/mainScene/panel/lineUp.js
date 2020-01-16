var panel = require("panel");
var toggleHelper = require('toggleHelper');
cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        lineUpItem:cc.Prefab,
        contentPrefab:cc.Prefab,
        miniNode:cc.Node,
        initPos:cc.Vec2,
        movePos:[cc.Vec2],
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.rowNum = 4;//5个一行
        this.registerEvent();
        this.initModule();
        this.flyInitPos = this.miniNode.parent.position;
        this.scheduleOnce(function(){
            uiResMgr.newPrefabInstance("monInfo",function(){});
        },0.5);
    },
    registerEvent: function () {
        var registerHandler = [
            ["lineUpSuccess", this.refreshUI.bind(this)],
            ["refreshHeros", this.refreshUI.bind(this)],
            ["setLineUpActive", this.setLineUpActive.bind(this),true],
            ["playerLvUp", this.refreshLeader.bind(this),true],
            ["monLineUp", this.monLineUp.bind(this),true],
            ["leaderWeek", this.leaderWeek.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clicklineUpItem", this.clicklineUpItem.bind(this)],
            ["clickMiniItem", this.clickMiniItem.bind(this)],
            ["clickChange",this.clickChange.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    initModule:function(){
        this.miniJs = this.miniNode.getComponent("miniItem");
        this.initPos = this.widget("lineUp/shrink/right").position;
        this.unClick = this.widget("lineUp/shrink/unClick");
    },
    open:function(){
        this.cardLogic.setPlaySpecial(false);
        this.unClick.active = false;
        this.tag = constant.ToggleType.ALL;
        this.toggleHelperJs.setIdxToggleCheck(this.tag);
        this.refreshUI();
    },
    setLineUpActive:function(active){
        this.node.active = active;
        if(active){
            this.refreshUI();
        }
    },
    refreshLineUp:function(){
        var list = this.cardLogic.getLineUpInfo();
        var refreshData = {
            content:this.widget("lineUp/shrink/layout"),
            list:list,
            prefab:this.lineUpItem
        }
        uiManager.refreshView(refreshData);
    },
    refreshUI:function(){
        this.refreshLineUp();
        this.refreshBrowse();
    },
    //
    monLineUp:function(familyID){
        var content = this.widget("lineUp/shrink/right/scrollView/view/content");
        for (var i = 0 , len = content.children.length; i < len; i++) {//首先查看是否lineup界面已经有这个家族的子节点
            var child =  content.children[i];
            for (var j = 0 , lens = child.children.length; j < lens; j++) {
                var objJS = child.children[j].getComponent("miniItem");
                if(objJS.familyID === familyID){
                    objJS.clicklineUp();
                    return;
                }
            }
        }
        //走到这里说明该家族的item并没有生成，随便在某个位置播放上阵
        this.lastData= this.getBaseDataByID(familyID);
        var data = this.cardLogic.getHeroesById(familyID);
        this.lastData.Debris = data?data.Num:0;
        this.lastData.ProNum = data?data.ProNum:0;
        this.lastData.Lv = data?data.Lv:0;
        this.lastData.isUp =false;
        this.lastFamilyID = familyID;
        if(this.target){
            this.target.playHide();
            this.target = undefined;
        }
        this.flyInit(this.flyInitPos,this.lastData);
    },
    getBaseDataByID:function (familyID) {
        for (var i = 0 , len = this.baseData.length; i < len; i++) {
            var obj = this.baseData[i];
            if(obj[jsonTables.CONFIG_MONSTERFAMILY.Tid] === familyID){
                return  obj;
            }
        }
    },
    refreshBrowse:function(){
        this.target = undefined;
        this.lastFamilyID = undefined;
        this.lastData = undefined;
        this.baseData = jsonTables.getJsonTable(jsonTables.TABLE.MONSTERFAMILY);
        this.monsterData = [];
        var overCount = 0;
        var allCount = 0;
        var showHave = 0;//列表中显示的已拥有怪物个数
        for (var i = 0 , len = this.baseData.length; i < len; i++) {
            var obj = this.baseData[i];
            if(!obj[jsonTables.CONFIG_MONSTERFAMILY.Display])   continue;
            allCount ++;
            var data = this.cardLogic.getHeroesById(obj[jsonTables.CONFIG_MONSTERFAMILY.Tid]);
            obj.Lv = data?data.Lv:0;
            if (obj.Lv > 0) {
                overCount++;
            }
            if(this.tag !== constant.ToggleType.ALL && obj[jsonTables.CONFIG_MONSTERFAMILY.Type] !== this.tag)  continue;
            if (obj.Lv > 0) {
                showHave++;
            }
            obj.Debris = data?data.Num:0;
            obj.ProNum = data?data.ProNum:0;
            obj.isUp = this.cardLogic.checkUp(obj[jsonTables.CONFIG_MONSTERFAMILY.Tid]);
            this.monsterData.push(obj);
        }
        this.sortAndDeal(this.monsterData,showHave);
        this.widget("lineUp/shrink/right/numberLabel1").getComponent(cc.Label).string = overCount + "/" + allCount;
        this.refreshLeader();
    },

    refreshLeader:function(){
        this.widget("lineUp/shrink/left/intoCrown1/label").getComponent(cc.Label).string = this.cardLogic.getCurFormationLeader() + "/" + this.userLogic.getMyLeader();
    },
    //排序并处理成4个一个的数组
    sortAndDeal:function(arr,showHave){
        arr.sort(function(a,b){
            if (a.Lv && !b.Lv) return -1;
            if (!a.Lv && b.Lv) return 1;
            // if(a[jsonTables.CONFIG_MONSTERFAMILY.Quality] < b[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return 1;
            // if(a[jsonTables.CONFIG_MONSTERFAMILY.Quality] > b[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return -1;
            return  b[jsonTables.CONFIG_MONSTERFAMILY.Leader] - a[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        });

        var lvArr = [];//已解锁数组
        var unLvArr = [];
        for (var i = 0 , len = arr.length; i < len; i++) {
            var obj = arr[i];
            if(arr[i].Lv){
                lvArr.push(obj);
            }else{
                unLvArr.push(obj);
            }
        }
        lvArr.sort(function(a,b){
            if (a.isUp && !b.isUp) return -1;
            if (!a.isUp && b.isUp) return 1;
            if(a[jsonTables.CONFIG_MONSTERFAMILY.Quality] < b[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return 1;
            if(a[jsonTables.CONFIG_MONSTERFAMILY.Quality] > b[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return -1;
            return  b[jsonTables.CONFIG_MONSTERFAMILY.Leader] - a[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        });
        unLvArr.sort(function(a,b){
            if(a[jsonTables.CONFIG_MONSTERFAMILY.Quality] < b[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return -1;
            if(a[jsonTables.CONFIG_MONSTERFAMILY.Quality] > b[jsonTables.CONFIG_MONSTERFAMILY.Quality])  return 1;
            return  b[jsonTables.CONFIG_MONSTERFAMILY.Leader] - a[jsonTables.CONFIG_MONSTERFAMILY.Leader];
        });
        var list = lvArr.concat(unLvArr);
        if(this.tag === 0){//全部界面
            var upList = this.cardLogic.getLineUpInfo();//按上阵家族排序
            for (var i = 0 , len = upList.length; i < len; i++) {
                var obj = upList[i];
                for (var j = i , len = list.length; j < len; j++) {
                    if(list[j].Tid === obj){
                        if(i !== j){
                            var info = list[j];
                            list[j] = list[i];
                            list[i] = info;
                        }
                    }
                }
            }
            this.cardLogic.setSortList(list);
        }
        var num = 0;
        var data = [];
        var dataChild = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            dataChild.push(obj);
            obj.test = i;
            num ++;
            if(num === this.rowNum || i === len - 1 ||(i !== len - 1 && !arr[i + 1].Lv && arr[i].Lv)){
                num = 0;
                data.push(dataChild);
                dataChild = [];
            }
        }
        var bottom = showHave > (data.length - 1) * this.rowNum?120:0;
        var viewData = {
            totalCount:data.length,
            spacing:0,
            bottom:bottom
        };
        var cb = function(familyID) {
            return  this.lastFamilyID === familyID;
        };
        this.widget("lineUp/shrink/right/scrollView").getComponent("listView").init(this.contentPrefab,viewData,data,0,cb.bind(this));
    },
    //点击小卡片
    clickMiniItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if(!data.auto && this.target && cc.isValid(this.target) && this.target.ani){
            this.target.playHide();
        }
        this.target = data.target;
        this.lastFamilyID = data.familyID;
        this.lastData = data.data;
    },
    //for guide
    emptyChoise:function(){
        if(this.target && cc.isValid(this.target) && this.target.ani){
            this.target.setHind();
        }
        this.target = undefined;
        this.lastFamilyID = undefined;
        this.lastData = undefined;
    },

    unChoose:function(){
        if(this.target){
            this.target.playHide(true);
            this.target = undefined;
            this.target =undefined;
            this.lastFamilyID = undefined;
            this.lastData = undefined;
        }
    },
    //切换类别
    swichTag:function(event,idx){
        if(idx === this.tag)    return;
        this.tag = idx;
        this.refreshBrowse();
    },

    leaderWeek:function (isOpen) {
        this.widget("lineUp/shrink/blackBox1").active = isOpen;
        if(isOpen){
            this.widget("lineUp/shrink").getComponent(cc.Animation).play();
        }else{
            this.widget("lineUp/shrink").getComponent(cc.Animation).stop();
            this.widget("lineUp/shrink/left/intoCrown1").scale = 1;
            this.widget("lineUp/shrink/left/intoCrown1/label").color = uiColor.white;
            this.widget("lineUp/shrink/miniItem/miniItem/leaderLabel").color = uiColor.white;
            this.widget("lineUp/shrink/miniItem/miniItem/leaderLabel").scale = 1;
        }
    },

    clicklineUpItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if(this.inChange){
            this.flyTo(data);
            return;
        }
        uiManager.openUI(uiManager.UIID.MONINFO,data.familyID);
    },

    clickChange:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if(data.familyID !== this.lastFamilyID){
            if(this.target){
                this.target.playHide();
            }
            this.target = data.target;
            this.lastFamilyID = data.familyID;
            this.lastData = data.data;
        }
        var pos = kf.getPositionInNode(this.target.node,this.widget("lineUp/shrink"));
        this.flyInit(pos,this.lastData);
    },
    flyInit:function(pos,data){
        this.clientEvent.dispatchEvent("showReplace",data.Leader);
        this.miniNode.parent.stopAllActions();
        this.miniNode.parent.active = true;
        this.widget("lineUp/shrink/black").active = true;
        this.widget("lineUp/shrink/right/scrollView").active = false;
        var extData = {
            cb:function(){return  false;}
        }
        this.miniJs.init(0,data,extData,true);
        this.miniNode.parent.position = pos;
        this.miniJs.setInitPos(this.initPos);
        this.inChange = true;
        var moveTo = cc.moveTo(0.5,this.initPos);
        this.unClick.active = true;//动画播放时屏蔽操作
        var cb =cc.callFunc(function(){
            this.unClick.active = false;
        }.bind(this));
        var seq = cc.sequence(moveTo,cb);
        this.miniNode.parent.runAction(seq);
    },

    flyTo:function(data){
        this.lineUpData = data;
        var pos = kf.getPositionInNode(data.node,this.widget("lineUp/shrink"));
        var time = 0.5;
        if(data.canNotReplace) {
            pos = this.getColliderPos(pos, data.node);
            time = 10 / 30;
        }
        else
            this.clientEvent.dispatchEvent("showReplace");
        var moveTo = cc.moveTo(time,pos);
        var callback = function(){
            this.unClick.active = false;
            this.inChange = false;
            this.cardLogic.reqHeroFormation(null,this.lineUpData.idx,this.lastFamilyID);// TODO: 传递ui上的当前阵容索引
        }.bind(this);
        this.unClick.active = true;//动画播放时屏蔽操作
        var cb =cc.callFunc(function(self,callback){
            if(data.canNotReplace) {
                this.playFlyBackAnim();
                return;
            }
            this.widget("lineUp/shrink/black").active = false;
            this.clientEvent.dispatchEvent("leaderWeek",false);
            this.widget("lineUp/shrink/right/scrollView").active = true;
            this.miniNode.parent.active = false;
            this.lineUpData.js.playLineUp(callback);
        }.bind(this),this,callback);
        var seq = cc.sequence(moveTo,cb);
        this.miniNode.parent.runAction(seq);
    },

    getColliderPos: function (pos, node) {
        var deltaX = pos.x - this.initPos.x;
        var deltaWidth = node.width / 2 + this.miniNode.width / 2;
        var floatVar = deltaWidth / deltaX;
        var addPos = pos.sub(this.initPos);
        var multPos = addPos.mul(floatVar);
        var colliderPos = kf.pAdd(pos, multPos);
        return colliderPos;
    },

    //播放不能替换动画
    playFlyBackAnim: function () {
        var anim = this.miniNode.getComponent(cc.Animation);
        var state = anim.play(anim.getClips()[1].name);
        state.once(constant.AnimationState.FINISHED, function () {
            this.unClick.active = false;
        }, this);
    },

    //取消替换操作
    clickBlack:function(){
        this.clientEvent.dispatchEvent("showReplace");
        this.miniNode.parent.active = false;
        this.widget("lineUp/shrink/right/scrollView").active = true;
        this.widget("lineUp/shrink/black").active = false;
        this.clientEvent.dispatchEvent("leaderWeek",false);
        this.inChange = false;
    },

    openReel:function () {
        uiManager.openUI(uiManager.UIID.REELPANEL);
        this.scheduleOnce(function () {
            this.close();
        }.bind(this),0.1);
    },

    openSmelt:function () {
        uiManager.openUI(uiManager.UIID.SMELTPANEL,uiManager.UIID.LINEUP);
        this.scheduleOnce(function () {
            this.close();
        }.bind(this),0.1);
    },
    // called every frame, uncomment this function to activate update callback

});
