var panel = require("panel");
const lzString = require('lz-string');

cc.Class({
    extends: panel,

    properties: {
        itemPrefab:cc.Prefab,
        labelItemPrefab:cc.Prefab,
        sclaeSlider:cc.Slider,
    },

    // use this for initialization
    onLoad: function () {
        var _EVENT_TYPE = [
            "loadChapter",//加载 foredit
        ];
        this.clientEvent.addEventType(_EVENT_TYPE);

        jsonTables.isEditor = true;
        this.registerEvent();
        this.data = {};
        this.data.config = cc.js.createMap();
        this.data.bg = "sky";
        this.data.width = 0;
        this.data.height = 0;
        this.data.sliderScale = 1;
        this.data.miniScale = 1;
        this.widget('Canvas/ui/row').getComponent(cc.EditBox).string = 0;
        this.widget('Canvas/ui/col').getComponent(cc.EditBox).string = 0;
        this.initNodes();
        this.touchNodeMap = {};
        this.isTouchEnble = true;
        this.monsterID = 0;
        uiResMgr.startLoadingRes();
        this.init();
        this.widget('Canvas/ui/idNode').active = false;
    },

    initNodes:function(){
        this.chapterLayerNode = this.widget('Canvas/bg/chapterLayer');
        this.maskNode = this.widget('Canvas/topNode');
        this.landParent = this.widget('Canvas/topNode/land');
    },

    registerEvent: function () {

        var registerHandler = [
            ["clickLabel", this.clickLabel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    getPath:function(){
        var spli = this.curPath.split("_");
        if (spli.length > 0) {
            return spli[0];
        }
        return this.curPath;
    },


    clickLabel:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        switch (data.type) {
            case "bg":
                this.data.bg = data.name;
                this.switchbg(this.data.bg);
                break;
            case "land":
                this.curPath = data.name;
                this.setCurChoise(0);
                this.widget('Canvas/ui/landId').getComponent(cc.EditBox).string = 0;
                var paths = Object.keys(cc.loader._resources._pathToUuid);
                for (var i = 0; i < paths.length; i++) {
                    var aliasPath = paths[i];
                    var aliasArr = aliasPath.split("chapter/prefabSp/"+this.getPath()+"/");
                    if (aliasArr.length > 1) {
                        this.curLandStyle =aliasArr[1];
                        break;
                    }
                }
                if (this.curPath) {
                    var callBack = function(prefab){
                        this.widget('Canvas/ui/tipLabel/curTip').removeAllChildren();
                        var node = this.widget('Canvas/ui/tipLabel/curTip').getInstance(prefab,true)
                        node.scale = (0.2)
                    }
                    uiResMgr.loadChapterPrefab(this.curPath,callBack.bind(this));
                }
                this.setLandStyle();
                break;
            case "monster":
                this.curMonsterIdx = data.name;
                var callBack = function(spineData){
                    this.widget('Canvas/ui/monsterLabel/monsterTip').getComponent(sp.Skeleton).skeletonData  = spineData;
                    this.widget('Canvas/ui/monsterLabel/monsterTip').getComponent(sp.Skeleton).setAnimation(0,'std',true);
                }.bind(this);
                uiResMgr.loadSpine(this.curMonsterIdx,callBack);
                if (!this.data.config[this.monsterID]) {
                    return uiManager.openUI(uiManager.UIID.TIPMSG,"不存在"+this.monsterID,"的关卡")
                }
                this.data.config[this.monsterID].resName = data.name;
                this.data.config[this.monsterID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.monsterID]);
                break;
            case "landBlock":
                this.curLandStyle = data.name;
                var path = this.getPath() + "/"+this.curLandStyle;
                uiResMgr.loadChapterLandStyle(path,this.widget('Canvas/ui/tipBlockLabel/curTip'));
                if (this.landWorldID && this.data.config[this.landWorldID]) {
                    this.data.config[this.landWorldID].style = path;
                    this.data.config[this.landWorldID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.landWorldID]);
                }
                break;
            case "initList"://已生成列表
                if (this.lockID  !== undefined && this.data.config[this.lockID]&& this.data.config[this.lockID].node) {
                    this.data.config[this.lockID].node.children[0].getChildByName("bg").color = uiColor.white;
                }
                if (this.lockID !== data.name) {
                    this.lockID = data.name;
                    if (this.data.config[this.lockID]&& this.data.config[this.lockID].node) {
                        this.data.config[this.lockID].node.children[0].getChildByName("bg").color = uiColor.blueGray;
                    }
                }else {
                    this.lockID = undefined;
                }

                this.setAllTouchEnble();
                break;
        }
    },

    //展示所有id
    showALLID:function(){
        this.widget('Canvas/ui/idNode').active = !this.widget('Canvas/ui/idNode').active;
        if (this.widget('Canvas/ui/idNode').active) {
            var list = [];
            for (var id in this.touchNodeMap) {
                if (!this.touchNodeMap.hasOwnProperty(id)) continue;
                var node = this.touchNodeMap[id].node;
                var pos = kf.getPositionInNode(node,this.widget('Canvas/ui/idNode'));
                list.push({name:"tipNode",pos:pos,keyName:id})
            }
            var refreshData = {
                content:this.widget('Canvas/ui/idNode'),
                list:list,
                prefab:this.labelItemPrefab
            }
            uiManager.refreshView(refreshData);
        }
    },
    //锁定按钮
    lockBtn:function(){
        this.isTouchEnble = !this.isTouchEnble;
        this.widget('Canvas/ui/lockButton/Label').getComponent(cc.Label).string = this.isTouchEnble ? "锁定":"解锁";
        this.setAllTouchEnble();
    },

    setAllTouchEnble:function(){
        if (!this.isTouchEnble) {
            for (var key in this.touchNodeMap) {
                if (!this.touchNodeMap.hasOwnProperty(key)) continue;
                var script = this.touchNodeMap[key];
                script.touchEnble(key === this.lockID);
            }
        }else {
            for (var key in this.touchNodeMap) {
                if (!this.touchNodeMap.hasOwnProperty(key)) continue;
                var script = this.touchNodeMap[key];
                script.touchEnble(true);
            }
        }
    },

    //删除按钮
    removeBtn:function(){
        if (this.lockID === undefined) return uiManager.openUI(uiManager.UIID.TIPMSG,"都没选中删除个鸡儿");
        this.removeLand(this.lockID);
        this.lockID = undefined;
    },

    removeLand:function(id){
        var node = this.data.config[id].node;
        node.removeFromParent();
        node.destroy();
        delete this.data.config[id];
        delete this.touchNodeMap[id];
        this.setInitedLands();
    },

    switchbg:function (name) {
        uiResMgr.loadChapterBG(name,this.widget('Canvas/bg'));
    },

    changeMonsterId:function(){
        if (this.widget('Canvas/ui/monsterId').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/monsterId').getComponent(cc.EditBox).string);
            this.monsterID = num;
            this.widget('Canvas/ui/monsterId/New Label').getComponent(cc.Label).string = "当前关卡id:"+this.monsterID;
        }
    },

    changeMiniScale:function(){
        if (this.widget('Canvas/ui/miniScale').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/miniScale').getComponent(cc.EditBox).string);
            this.data.miniScale = num;
            this.widget('Canvas/ui/miniScale/New Label').getComponent(cc.Label).string = "最小缩放尺寸:"+this.data.miniScale;
        }
    },

    changeLandId:function(){
        if (this.widget('Canvas/ui/landId').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/landId').getComponent(cc.EditBox).string);
            if (this.data.config[num]) {
                this.setCurChoise(num);
                return
            }
            if (!this.curPath) {
                return uiManager.openUI(uiManager.UIID.TIPMSG,"必须指定关卡预制体")
            }
            if (!this.curLandStyle) {
                return uiManager.openUI(uiManager.UIID.TIPMSG,"必须指定关卡预制体的样式")
            }
            this.data.config[num] = {prefab:this.curPath,style:this.getPath() + "/"+this.curLandStyle}
            this.data.config[num].node = this.initOnePrefab(this.data.config[num],num)
            this.setCurChoise(num);
            this.setInitedLands(num);
        }
    },

    setCurChoise:function(num){
        this.landWorldID = num;
        this.widget('Canvas/ui/landId/New Label').getComponent(cc.Label).string = "当前\n岛屿id:"+this.landWorldID;
    },

    initOnePrefab:function(data,id){
        var node = cc.instantiate(this.itemPrefab);
        node.parent = this.widget('Canvas/contentNode/content');
        node.getComponent(this.itemPrefab.name).init(0,data);
        node.addComponent("editorMove");
        var script = node.getComponent("editorMove");
        this.touchNodeMap[id] = script;
        if (!this.isTouchEnble) {
            script.touchEnble(false);
        }
        node.getComponent("editorMove").setBindComp(node.getComponent(this.itemPrefab.name));
        return node;
    },

    changeMiniMapWidth:function(){
        if (this.widget('Canvas/ui/row').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/row').getComponent(cc.EditBox).string);
            this.data.width = num;
            this._resetMoveSize();
        }
    },

    changMiniMapHeight:function(){
        if (this.widget('Canvas/ui/col').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/col').getComponent(cc.EditBox).string);
            this.data.height = num;
            this._resetMoveSize();
        }
    },

    _resetMoveSize:function(){
        this.widget('Canvas/contentNode').setContentSize(cc.size(this.data.width,this.data.height));
        this.widget('Canvas/contentNode/moveNode').setContentSize(cc.size(this.data.width,this.data.height));
    },


    _reload:function(){
        this._resetMoveSize();
        for (var monsterID in this.data.config) {
            if (this.data.config.hasOwnProperty(monsterID)) {
                this.data.config[monsterID].node = this.initOnePrefab(this.data.config[monsterID],monsterID)
                this.data.config[monsterID].node.position = jsonTables.strToObject(this.data.config[monsterID].pos);
                delete this.data.config[monsterID].pos;
            }
        }

        this.setInitedLands();
    },

    setInitedLands:function(id){
        //-------------------------------
        //岛屿列表-------------------------------
        var list = Object.keys(this.data.config);
        var info = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var key = list[i];
            var obj = {name:key,type:"initList"}
            if (key == id) {
                info.unshift(obj)
            }else {
                info.push(obj)
            }
        }
        //障碍列表
        var refreshData = {
            content:this.widget('Canvas/ui/tipWorldInitScrollView/view/content'),
            list:info,
            prefab:this.labelItemPrefab,
            ext:this
        }
        uiManager.refreshView(refreshData);
        //-------------------------------
    },

    setLandStyle:function(){
        if (!this.curPath) return;
        var info = [];
        var paths = Object.keys(cc.loader._resources._pathToUuid);
        for (var i = 0; i < paths.length; i++) {
            var aliasPath = paths[i];
            var aliasArr = aliasPath.split("chapter/prefabSp/"+this.getPath()+"/");
            if (aliasArr.length > 1) {
                var obj = {name:aliasArr[1],type:"landBlock"}
                info.push(obj)
            }
        }
        var refreshData = {
            content:this.widget('Canvas/ui/tipBlockScrollView/view/content'),
            list:info,
            prefab:this.labelItemPrefab,
            ext:this
        }
        uiManager.refreshView(refreshData);
    },

    init:function(){
        var paths = Object.keys(cc.loader._resources._pathToUuid);
        var filesName = "";
        var list = [];
        for (var i = 0; i < paths.length; i++) {
            var aliasPath = paths[i];
            var aliasArr = aliasPath.split("chapter/bgSprite/");
            if (aliasArr.length > 1) {
                var obj = {name:aliasArr[1],type:"bg"}
                list.push(obj)
            }
        }
        this.switchbg(this.data.bg);
        var refreshData = {
            content:this.widget('Canvas/ui/bgScrollView/view/content'),
            list:list,
            prefab:this.labelItemPrefab
        }
        uiManager.refreshView(refreshData);

        this.curPath = "";//岛屿预制体名字
        var paths = Object.keys(cc.loader._resources._pathToUuid);
        var filesName = "";
        var list = [];
        for (var i = 0; i < paths.length; i++) {
            var aliasPath = paths[i];
            var aliasArr = aliasPath.split("chapter/prefab/");
            if (aliasArr.length > 1) {
                var obj = {name:aliasArr[1],type:"land"}
                list.push(obj)
            }
        }
        var refreshData = {
            content:this.widget('Canvas/ui/tipScrollView/view/content'),
            list:list,
            prefab:this.labelItemPrefab
        }
        uiManager.refreshView(refreshData);


        var paths = Object.keys(cc.loader._resources._pathToUuid);
        var filesName = "";
        var list = [];
        for (var i = 0; i < paths.length; i++) {
            var aliasPath = paths[i];
            var aliasArr = aliasPath.split("spine/");
            if (aliasArr.length > 1) {
                var obj = {name:aliasArr[1],type:"monster"}
                list.push(obj)
            }
        }

        this.curMonsterIdx = list[0].name;
        var callBack = function(spineData){
            this.widget('Canvas/ui/monsterLabel/monsterTip').getComponent(sp.Skeleton).skeletonData  = spineData;
            this.widget('Canvas/ui/monsterLabel/monsterTip').getComponent(sp.Skeleton).setAnimation(0,'std',true);
        }.bind(this);
        uiResMgr.loadSpine(this.curMonsterIdx,callBack);

        //怪物列表
        var refreshData = {
            content:this.widget('Canvas/ui/monsterScrollView/view/content'),
            list:list,
            prefab:this.labelItemPrefab
        }
        uiManager.refreshView(refreshData);
    },

    export:function(){
        var data = (this.data);
        var copyMap = cc.js.createMap();
        for (var monsterID in this.data.config) {
            copyMap[monsterID] = this.data.config[monsterID].node;
             delete this.data.config[monsterID].node;
             this.data.config[monsterID].pos = cc.v2(copyMap[monsterID].x.toFixed(2),copyMap[monsterID].y.toFixed(2));
        }
        uiManager.openUI(uiManager.UIID.TIPMSG,"已导出 使用 ctrol + v 粘贴")
        var str = JSON.stringify(data);
        cc.log(str)
        var result = lzString.compressToBase64(str);
        kf.require("util.captureTool").copyBoard(result);
        cc.log("导出结果-->",result)
        for (var monsterID in this.data.config) {
             this.data.config[monsterID].node = copyMap[monsterID];
             delete this.data.config[monsterID].pos;
        }
    },

    input:function(){
        this.widget('Canvas/ui/inputEditBox').active = true;
    },

    inputEditBox:function(){
        if (this.widget('Canvas/ui/inputEditBox').getComponent(cc.EditBox).string) {
            this.widget('Canvas/contentNode/content').removeAllChildren();
            try {
                var result = lzString.decompressFromBase64(this.widget('Canvas/ui/inputEditBox').getComponent(cc.EditBox).string);
                var data = JSON.parse(result);
                this.data = data;

            } catch (e) {
                uiManager.openUI(uiManager.UIID.TIPMSG,"输入格式有误 ！！！！")
            }
            this._reload();
            this.data.sliderScale = this.data.sliderScale || 1;
            this.data.sliderScale = Number(this.data.sliderScale);
            this.sclaeSlider.progress = this.data.sliderScale;
            this.sliderEvent();
            this.widget('Canvas/ui/inputEditBox').getComponent(cc.EditBox).string = "";
        }
        this.widget('Canvas/ui/inputEditBox').active = false;
    },

    clearTouchBegan:function(event){
        event.string = "";
    },

    sliderEvent:function(event){
        this.widget('Canvas/ui/scaleSlider/New Label').getComponent(cc.Label).string = "整体节点缩放比例:"+Number(this.sclaeSlider.progress).toFixed(2)
        this.widget('Canvas/contentNode').scale = this.sclaeSlider.progress;
        this.data.sliderScale = this.sclaeSlider.progress.toFixed(2);
    },
    monSliderEvent:function(event){
        if (this.monsterID === 0 || !this.data.config[this.monsterID]) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,"没找到指定关卡");
        }
        if (!this.widget('Canvas/ui/monsterScaleSlider/New EditBox').getComponent(cc.EditBox).string) return;
        var num = this.widget('Canvas/ui/monsterScaleSlider/New EditBox').getComponent(cc.EditBox).string;

        var line = Number(num).toFixed(2);
        this.widget('Canvas/ui/monsterScaleSlider/New Label').getComponent(cc.Label).string = "叶子缩放:"+ line;

        this.data.config[this.monsterID].scale = Number(line);
        this.data.config[this.monsterID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.monsterID]);

    },

    changeRotation:function(){
        if (this.monsterID === 0 || !this.data.config[this.monsterID]) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,"没找到指定关卡");
        }
        var num = this.widget('Canvas/ui/rotationScaleSlider').getComponent(cc.Slider).progress.toFixed(2);
        this.data.config[this.monsterID].rotate = num * 360;
        this.data.config[this.monsterID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.monsterID]);
    },

    spineScale:function(event){
        if (this.monsterID === 0 || !this.data.config[this.monsterID]) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,"没找到指定关卡");
        }
        this.widget('Canvas/ui/spinemonsterScaleSlider/New Label').getComponent(cc.Label).string = "spine缩放:"+Number(this.widget('Canvas/ui/spinemonsterScaleSlider').getComponent(cc.Slider).progress).toFixed(2)
        var line = this.widget('Canvas/ui/spinemonsterScaleSlider').getComponent(cc.Slider).progress.toFixed(2);
        this.data.config[this.monsterID].spineScale = Number(line);
        this.data.config[this.monsterID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.monsterID]);

    },

    spineRotate:function(){
        if (this.monsterID === 0 || !this.data.config[this.monsterID]) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,"没找到指定关卡");
        }
        var num = this.widget('Canvas/ui/spinerotationScaleSlider').getComponent(cc.Slider).progress.toFixed(2);
        this.data.config[this.monsterID].spineRotate = num * 360;
        this.data.config[this.monsterID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.monsterID]);
    },

    bgFlip:function(){
        if (this.monsterID === 0 || !this.data.config[this.monsterID]) {
            return uiManager.openUI(uiManager.UIID.TIPMSG,"没找到指定关卡");
        }
        var boolValue = this.data.config[this.monsterID].flip === undefined ? true : !this.data.config[this.monsterID].flip;
        this.data.config[this.monsterID].flip = boolValue;
        this.data.config[this.monsterID].node.getComponent(this.itemPrefab.name).init(0,this.data.config[this.monsterID]);
    },

    scaleX:function(){
        if (this.widget('Canvas/ui/scaleX').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/scaleX').getComponent(cc.EditBox).string);
            jsonTables.scaleX = num || 0;
            for (var i = 0 , len = jsonTables.bossList.length; i <  len; i++) {
                var obj = jsonTables.bossList[i];
                if (cc.isValid(obj)) {
                    obj.setBossScale();
                }
            }
        }
    },
    scaleY:function(){
        if (this.widget('Canvas/ui/scaleY').getComponent(cc.EditBox).string) {
            var num = Number(this.widget('Canvas/ui/scaleY').getComponent(cc.EditBox).string);
            jsonTables.scaleY = num || 0;
            for (var i = 0 , len = jsonTables.bossList.length; i <  len; i++) {
                var obj = jsonTables.bossList[i];
                if (cc.isValid(obj)) {
                    obj.setBossScale();
                }
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
