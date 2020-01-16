var panel = require("panel");
const lzString = require('lz-string');

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    start:function(){
        this.data = {};
        var size = this.widget("Canvas/maxMoveSize");
        this.data.width = size.width;
        this.data.height = size.height;
        this.data.bg = this.widget("Canvas/bg").getComponent(cc.Sprite).spriteFrame.name;
        this.data.config = {};
        this.data.miniScale = 1;
        this.data.sliderScale = 1;
        this.data.isNew = true;
        this.loadFgNode();
        this.loadLand();
        this.loadFront();
        console.log(this.data);
    },

    outPut:function(){
        this.data.miniScale = this.widget("Canvas/showScroll").getComponent(cc.Label).string;
        this.data.sliderScale = this.widget("Canvas/minScroll").getComponent(cc.Label).string;
        var data = this.data;
        uiManager.openUI(uiManager.UIID.TIPMSG,"已导出 使用 ctrol + v 粘贴")
        var str = JSON.stringify(data);
        cc.log(str)
        var result = lzString.compressToBase64(str);
        kf.require("util.captureTool").copyBoard(result);
        cc.log("导出结果-->",result)
    },

    loadFront:function(){
        var node = this.widget("Canvas/maxMoveSize/decorateFront");
        this.data.config.front = {};
        for (var i = 0 , len = node.children.length; i <  len; i++) {
            var obj = node.children[i];
            this.printNode(obj,this.data.config.front,(i+1),true);
        }
    },

    loadLand:function(){
        var node = this.widget("Canvas/maxMoveSize/landNode");
        this.data.config.land = {};
        for (var i = 0 , len = node.children.length; i <  len; i++) {
            var obj = node.children[i];
            this.printNode(obj,this.data.config.land,false);
        }
    },
    loadFgNode:function(){
        var node = this.widget("Canvas/maxMoveSize/decorateFg");
        this.data.config.fg = {};

        for (var i = 0 , len = node.children.length; i <  len; i++) {
            var obj = node.children[i];
            this.printNode(obj,this.data.config.fg,(i+1),true);
        }
    },

    printNode:function(node,object,idx){

        if (idx) {
            monsterID = idx;
            var splis = [];
            splis[0] = node.name;
        }else {
            var splis = node.name.split("#");
            if (splis.length < 2) {
                return uiManager.openUI(uiManager.UIID.TIPMSG,"岛屿节点名字有误  必须是prefabName_xxxx 的形式")
            }
            var monsterID = Number(splis[1]);
        }
        if (object[monsterID]) {
            cc.error("岛屿monsterID 重复"+monsterID)
            return uiManager.openUI(uiManager.UIID.TIPMSG,"岛屿monsterID 重复"+monsterID);
        }
        object[monsterID] = {};
        object[monsterID].prefab = splis[0];
        object[monsterID].nodeInfo = this.recordInfo(node,false);
        object[monsterID].children = {};
        for (var i = 0 , len = node.children.length; i <  len; i++) {
            var obj = node.children[i];
            var name = obj.name;
            object[monsterID].children[name] = this.recordInfo(obj,true);
        }

    },

    recordInfo:function(node,recordZindex){
        var baseInfo = {};
        baseInfo.pos = node.position;
        baseInfo.rota = node.rotation;
        baseInfo.scaleX = node.scaleX;
        baseInfo.scaleY = node.scaleY;
        if (recordZindex) {
            var idx = 0;
            for (var i = 0 , len = node.parent.children.length; i <  len; i++) {
                var obj = node.parent.children[i];
                if (obj.name === node.name) {
                    idx = i;
                    break;
                }
            }
            baseInfo.zIndex = idx;
        }
        if (node.opacity !== 255) {
            baseInfo.opacity = node.opacity;
        }
        var comp = node._components[0];
        if (comp) {
            if (comp instanceof cc.PolygonCollider) {
                baseInfo.points = comp.points;
                baseInfo.offset = comp.offset;
            }else if (comp instanceof sp.Skeleton) {
                if (comp.skeletonData) {
                    baseInfo.spineName = comp.skeletonData.name;
                }
            }else if (comp instanceof cc.Sprite) {
                if (comp.spriteFrame) {
                    baseInfo.spriteFrame = comp.spriteFrame.name;
                }
            }
        }
        return baseInfo;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
