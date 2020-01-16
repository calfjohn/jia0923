
window.newStruct = window.newStruct || {};

const map = function(){
    this.list = cc.js.createMap();
    this.keys = [];

    this.getAllValue = function () {
        var list = [];
        for (var key in this.list) {
            list.push(this.list[key]);
        }
        return list;
    };

    this.addElement = function(key,obj){
        this.list[key] = obj;
        this.keys.push(key);
    };
    this.desrElement = function(key){
        if (this.list[key]) {
            delete this.list[key];
            var idx = this.keys.indexOf(key)
            this.keys.splice(idx,1);
        }
    };
    this.getLen = function(){
        return this.keys.length;
    };
    this.isEmpty = function() {
        return this.keys.length === 0;
    };
    this.forEach = function(eleFunc){
        for (var keys in this.list) {
            if (eleFunc(this.list[keys],keys)) {
                break;
            }
        }
    };
    this.random = function(){
        if (this.keys.length === 0) return null;
        var key = jsonTables.random(this.keys)
        return this.list[key];
    };
    this.getEnd = function(){
        return  this.list[this.keys[this.getLen() - 1]];
    };
    this.getKeys = function(){
        return  this.keys;
    };
    this.setValue = function(key,value){
        if(this.list[key] === undefined) return;
        this.list[key] = value;
    };
    this.getValue = function(key){
        if(this.list[key] === undefined) return {};
        return  this.list[key];
    };
};

//存储对象 便于查找
window.newStruct.newMap = function(){
    return new map();
};
///////////////////////////////////////////////
const disMap = function(){
    this.map = cc.js.createMap();
    this.keys = cc.js.createMap();
    this.len = 0;
    this.isMine = true;
    this.lastSortTime = new Date().getTime();
    this.addElement = function (id,obj,type){
        this.map[id] = obj;
        type =  constant.MonsterType.TANK//constant.MonsterType.WARRIOR === type ? constant.MonsterType.TANK : type;
        this.keys[type] = this.keys[type] || [];
        this.keys[type].push(id);
        this.len++;
    };

    this.getMapObj = function (id) {
        return this.map[id];
    };

    this.desrElement = function (id,type) {
        if (this.map[id]) {
            this.len--;
            delete this.map[id];
            type =  constant.MonsterType.TANK//constant.MonsterType.WARRIOR === type ? constant.MonsterType.TANK : type;
            var idx = this.keys[type].indexOf(id);
            this.keys[type].splice(idx,1);
        }
    };

    this.sort = function () {
        for (var key in this.keys) {
            var keyValue = this.keys[key];
            if (keyValue.length <= 1) continue;
            keyValue.sort(function(a,b){
                if (this.map[a].node && this.map[b].node) {
                    if (this.isMine) {
                        return this.map[b].node.x - this.map[a].node.x;
                    }else {
                        return this.map[a].node.x - this.map[b].node.x;
                    }
                }
                return 0;
            }.bind(this))
        }
    };

    this.getCount = function (count,playerPos,playChange) {
        if (count > this.len) {
            count = this.len;
        }
        var now = new Date().getTime();
        if ((now - this.lastSortTime) > 1000) {
            this.sort();
            this.lastSortTime = now;
        }
        var list = [];
        count = this.getOffCount(list,constant.MonsterType.TANK,count);
        if (!playChange) {
            if (playerPos === constant.MonsterType.WARRIOR || playerPos === constant.MonsterType.TANK) {
                count = this.getOffCount(list,constant.MonsterType.PLAYER,count);
            }
        }
        count = this.getOffCount(list,constant.MonsterType.SHOOTER,count);
        if (playerPos === constant.MonsterType.SHOOTER || playChange) {
            count = this.getOffCount(list,constant.MonsterType.PLAYER,count);
        }
        return list;
    };

    this.getOffCount = function (reList,key,count) {
        if (count <= 0) return 0;
        var keyList = this.keys[key];
        if (!keyList || keyList.length === 0) return count;
        var off = keyList.length - count;
        var len = 0;
        var isCanRandom = false;
        if (off > 0) {
            isCanRandom = true;
            len = count;
            count = 0;
        }else{
            count = count - keyList.length;
            len = keyList.length;
        }
        if (len > 0) {
            if (isCanRandom && len === 1) {
                var tmpList = [];
                for (var i = 0 , len = keyList.length; i <  len; i++) {
                    var obj = keyList[i];
                    if (i === 0 || Math.abs((this.map[obj].node.x - this.map[keyList[0]].node.x)) <= 100){
                        tmpList.push(obj);
                    }else{
                        break;
                    }
                }
                var key = jsonTables.random(tmpList);
                reList.push(this.map[key]);
            }else {
                for (var i = 0; i <  len; i++) {
                    var obj = keyList[i];
                    reList.push(this.map[obj]);
                }
            }

        }
        return count
    }
};

//存储对象 便于查找
window.newStruct.newDisMap = function(isMine){
    var obj = new disMap();
    obj.isMine = isMine;
    obj.len = 0;
    return obj;
};

///////////////////////////////////////////////
const mapLong = function(){
    this.list = cc.js.createMap();
    this.keys = [];
    this.reset = function(){
        this.list = cc.js.createMap();
        this.keys.length = 0;
    };
    this.addElement = function(key,obj){
        if(typeof key === "object"){
            key = key.toNumber();
        }
        this.list[key] = obj;
        this.keys.push(key);
    };
    this.desrElement = function(key){
        if(typeof key === "object"){
            key = key.toNumber();
        }
        if (this.list[key]) {
            delete this.list[key];
            var idx = this.keys.indexOf(key)
            this.keys.splice(idx,1);
        }
    };
    this.getLen = function(){
        return this.keys.length;
    };
    this.isEmpty = function() {
        return this.keys.length === 0;
    };
    this.forEach = function(eleFunc){
        for (var keys in this.list) {
            if (eleFunc(this.list[keys],keys)) {
                break;
            }
        }
    };
    this.random = function(){
        if (this.keys.length === 0) return null;
        var key = jsonTables.random(this.keys)
        return this.list[key];
    };
    this.getEnd = function(){
        return  this.list[this.keys[this.getLen() - 1]];
    };
    this.getKeys = function(){
        var list = [];
        for (var i = 0 , len = this.keys.length; i < len; i++) {
            var obj = this.keys[i];
            list.push(new dcodeIO.Long(obj,0,false));
        }
        return  list;
    };
    this.setValue = function(key,value){
        if(typeof key === "object"){
            key = key.toNumber();
        }
        if(this.list[key] === undefined) return false;
        for (var obj in value) {
            if (value.hasOwnProperty(obj)) {
                this.list[key][obj] = value[obj];
            }
        }
        return true;
    };
    this.getValue = function(key){
        if(typeof key === "object"){
            key = key.toNumber();
        }
        if(this.list[key] === undefined) return {};
        return  this.list[key];
    };
    //全量更新,applies专用
    this.updateList = function(arr){
        //先删除
        for (var i = 0 , len = arr.length; i < len; i++) {
            arr[i] = arr[i].toNumber();
        }
        for (var i = this.keys.length - 1; i >= 0; i--) {
            var obj = this.keys[i];
            var j = arr.indexOf(obj);
            if(j === -1){
                delete this.list[obj];
                this.keys.splice(i,1);
            }else{
                arr.splice(j,1);
            }
        }
        for (var i = 0 , len = arr.length; i < len; i++) {
            this.addElement(arr[i],{});
        }
    };
    //全量更新,friend专用
    this.updateListSpecial = function(arr,data){
        //先删除
        for (var i = 0 , len = arr.length; i < len; i++) {
            arr[i] = arr[i].toNumber();
        }
        for (var i = this.keys.length - 1; i >= 0; i--) {
            var obj = this.keys[i];
            var j = arr.indexOf(obj);
            if(j === -1){
                delete this.list[obj];
                this.keys.splice(i,1);
            }else{
                this.list[obj].GiftSend = data[j].GiftSend;
                this.list[obj].GiftState = data[j].GiftState;
                arr.splice(j,1);
                data.splice(j,1);
            }
        }
        for (var i = 0 , len = data.length; i < len; i++) {
            var obj = data[i];
            this.addElement(obj.Uid,{GiftSend:obj.GiftSend,GiftState:obj.GiftState});
        }
    };
};

//存储对象 便于查找
window.newStruct.newLongMap = function(){
    return new mapLong();
};
///////////////////////////////////////////////
const buffMap = function(){
    this.map = cc.js.createMap();

    this.addElement = function(key,obj){
        obj.ext = [];
        this.map[key] = (obj);
        return this.map[key];
    };

    this.getElement = function (key) {
        return this.map[key];
    };

    this.desrElement = function(key){
        if (this.map[key]) {
            var re = this.map[key];
            delete this.map[key];
            return re;
        }
        return null;
    };

    this.forEach = function (eleFunc) {
        for (var type in this.map) {
            var obj = this.map[type];
            eleFunc(obj,Number(type));
        }
    };

    this.clear = function () {
        this.map = cc.js.createMap();
    };

    this.isKindBuff = function (key) {
        return !!this.map[key];
    };
};


//存储对象 便于查找
window.newStruct.newBuffMap = function(){
    return new buffMap();
};
///////////////////////////////////////////////

const skillMap = function(){
    this.map = cc.js.createMap();
    this.removeMap = cc.js.createMap();
    this.addElement = function(type,skillID,obj){
        this.map[type] = this.map[type] || cc.js.createMap();
        this.removeMap[type] = this.removeMap[type] || cc.js.createMap();
        this.map[type][skillID] = obj;
        return obj;
    };

    this.reAddRemoveMap = function () {
        for (var type in this.removeMap) {
            for (var skillID in this.removeMap[type]) {
                this.map[type][skillID] =  this.removeMap[type][skillID];
                delete this.removeMap[type][skillID];
                break;
            }
        }
    };

    this.desrElement = function(type,skillID){
        if (this.map[type] && this.map[type][skillID]) {
            this.removeMap[type][skillID] = this.map[type][skillID];
            delete this.map[type][skillID];
        }
        return null;
    };
    /** 删除指定技能 */
    this.desrElementByID = function (ID) {
        for (var type in this.map) {
            for (var skillID in this.map[type]) {
                if (skillID === (ID + "")) {
                    delete this.map[type][skillID];
                    if (JSON.stringify(this.map[type]) === "{}") {
                        delete this.map[type];
                    }
                    return true;
                }
            }
        }
        return false;
    };
    /** 是否存在指定技能 */
    this.isKindIDEixt = function (ID) {
        for (var type in this.map) {
            for (var skillID in this.map[type]) {
                if (skillID === (ID + "")) {
                    return true;
                }
            }
        }
        return false;
    };

    this.getEleByType = function (type) {
        return this.map[type];
    };

    this.forEach = function(type,eleFunc){
        var map = this.map[type];
        if (!map) return;
        for (var skillID in map) {
            var obj = map[skillID];
            eleFunc(obj,skillID);
        }
    };
};


//存储对象 便于查找
window.newStruct.newSkillMap = function(){
    return new skillMap();
};
///////////////////////////////////////////////

const chapterCell = function(){//用于地图优化的结构体

    this.init = function (index,data,extObj,size) {
        this.node = null;
        this.earthNode = null;
        var contetntScript = extObj.script;
        this.row = data.row;
        this.col = data.col;
        this.data = data;
        this.index = index;
        this.extObj = extObj;

        var fixWidth = 23;//// NOTE: 半个三角形的高度
        var fixHeight= 0;//NOTE 厚度修正

        var addWidth = 0;
        if (this.col % 2 !== 0) {
            addWidth = size.width - fixWidth;
        }

        var  addHeight = 0;
        var  fixY = 0;
        if (this.col !== 0) {
            addHeight = -fixHeight * (this.col -1)/2;
        }
        this.x = (this.row  )* size.width + (size.width-fixWidth*2)*(this.row  ) + addWidth + fixHeight + size.width/2 ;
        this.y = (this.col - 1) * size.height/2 +addHeight + fixY + size.height;
        this.position = cc.v2(this.x,this.y);
        this.points = [];
        this.points.push(cc.v2(size.width/2,fixHeight));
        this.points.push(cc.v2(size.width/2 - fixWidth,-size.height/2 + fixHeight));
        this.points.push(cc.v2(-size.width/2 + fixWidth,-size.height/2 + fixHeight));
        this.points.push(cc.v2(-size.width/2,fixHeight));
        this.points.push(cc.v2(-size.width/2 + fixWidth,size.height/2 + fixHeight));
        this.points.push(cc.v2(size.width/2 - fixWidth,size.height/2 + fixHeight));
        this.areaPoints = kf.clone(this.points);
        this.mapY = this.col - Math.floor(this.row/2);
        if (this.row % 2 === 0) {
            this.mapX = Math.floor(this.row/2) + this.col;
        }else {
            this.mapX = this.row - Math.floor(this.row/2) + this.col;
        }
        contetntScript.add(this.mapX,this.mapY,this,index);
    };

    this.fixPoints = function (spineHeight) {
        this.points[this.points.length - 1].y = spineHeight;
        this.points[this.points.length - 2].y = spineHeight;
    };

    this.fixWidth = function (spineWidth) {
        var fixWidth = 23;//// NOTE: 半个三角形的高度
        var fixHeight= 0;//NOTE 厚度修正

        this.points[0].x = spineWidth/2;
        this.points[1].x = spineWidth/2 - fixWidth;
        this.points[2].x = -spineWidth/2 + fixWidth
        this.points[3].x = -spineWidth/2;
        this.points[4].x = -spineWidth/2 + fixWidth;
        this.points[5].x = spineWidth/2 - fixWidth;
    };

    this.isNodeValiad = function () {
        return this.node !== null && this.earthNode !== null;
    };

    this.getNode = function () {
        return this.node;
    };

    this.getData = function () {
        return this.data;
    };

    this.removeNode = function () {
        var node = this.node;
        this.node = null;
        var earthNode = this.earthNode;
        this.earthNode = null
        return {node:node,earthNode:earthNode};
    };

    this.putInPool = function () {
        uiResMgr.putInPool(this.node.name,this.node);
        uiResMgr.putInPool(this.earthNode.name,this.earthNode);
        this.earthNode = null
        this.node = null;
    };

    this.setNode = function (node,earthNode) {
        this.node = node;
        this.earthNode = earthNode;
        this.refreshNode();
    };

    this.refreshNode = function () {
        this.node.getComponent(this.node.name).init(this.index,this.data,this.extObj,this);
        this.earthNode.getComponent(this.earthNode.name).init(this.data,this.node.position);
    };

    this.getPosition = function () {
        return this.position;
    };

    this.hitTest = function(pos,isUserArea){
        if (!this.node) return false;
        var posInNode = this.node.convertToNodeSpaceAR(pos);
        var point = isUserArea ? this.areaPoints:this.points;
        return cc.Intersection.pointInPolygon(posInNode,point);
    };

    this.callNodeFunc = function (func) {
        if (this.node) {
            return this.node.getComponent(this.node.name)[func]();
        }
    };
};


window.newStruct.newChapterCell = function(){
    return new chapterCell();
};
