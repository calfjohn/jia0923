cc.Class({
    extends: cc.Component,
    editor: {
        menu:"util/chatView",
        requireComponent:cc.ScrollView,
        disallowMultiple:true,
    },
    properties: {
        maxNum:10,
        updateInterval:0.2,
    },

    onLoad: function () {
        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;
        this.totalCount = 0;
        this.spawnCount = 6;
        this.spacing = 2;
        this.updateTimer = 0;
        this.items = [];
        this.initY = this.content.y;
        this.lastContentPosY = 0;
    },

    init: function (prefab,prefabName, viewData, itemData ,ext) {
        this.ext = ext;
        this.totalCount = viewData.totalCount ? viewData.totalCount : itemData.length;
        this.spacing = viewData.spacing ? viewData.spacing : this.spacing;
        this.viewData = viewData;
        this.prefabName = prefabName;
        this.prefab = prefab;
        this.addList =[];
        this.needRoll = false;
        this.spawnCount =  Math.ceil(this.node.height / this.prefab.data.height) + 2;
        this.scriptName = this.prefabName;
        this.itemData = itemData;
        this.initItem();
        // var percent = (this.totalCount - oldCount - 1) / (this.totalCount - 1);
    },
    //初始化构建Item
    initItem:function() {
        var spawnCount = this.totalCount > this.spawnCount ? this.spawnCount : this.totalCount;
        var high = this.totalCount *this.spacing + this.spacing + this.getContentHeight(this.itemData);
        this.content.height = high > this.node.height?high:this.node.height;
        this.content.y = this.initY;
        var itemIdx = 0;
        if(itemIdx > this.totalCount - (spawnCount - 2)) {
            itemIdx = this.totalCount - (spawnCount - 2);
        }
        if(itemIdx < 2) {
            itemIdx = 2;
        }
        this.items = [];
        for (var i = 0; i < spawnCount; i++) {
            let item;
            if(this.content.children[i]) {
                item = this.content.children[i];
            }
            else {
                item = uiResMgr.getPrefabEx(this.prefabName);
                if(!item){
                    item = cc.instantiate(this.prefab);
                }
                item.parent = this.content;
            }
            var dataIdx = (itemIdx - 2) + i;
            item.getComponent(this.scriptName).init(dataIdx, this.itemData[dataIdx].data,this.ext);
            item.getComponent(this.scriptName)._itemID = dataIdx;
            item.y = this.itemData[dataIdx].height * 0.5 + this.getContentHeight(this.itemData.slice(0,dataIdx)) + this.spacing * (dataIdx+1);
            this.items.push(item);
        }
        if(spawnCount < this.content.children.length){
            for (var j = spawnCount; j < this.content.children.length;) {
                uiResMgr.putInPool(this.prefabName,this.content.children[j]);
            }
        }
    },
    //外部调用，增加新的信息
    updateItemData:function(itemDataList,rollNow){
        var offset = this.scrollView.getMaxScrollOffset().y - this.scrollView.getScrollOffset().y;
        if((offset < 20 && offset >= 0) || rollNow){//处在底部才滚动
            this.needRoll = true;
            this.scrollView.enabled = false;
        }else {
            this.addList = itemDataList.concat(this.addList);
            if(this.addList.length > this.maxNum){
                this.addList.splice(0,this.addList.length - this.maxNum);
            }
            return;
        }
        this.itemData = itemDataList.concat(this.itemData);
        this.totalCount = this.itemData.length;
        var addHigh = this.getContentHeight(itemDataList) + itemDataList.length*this.spacing;

        if(this.content.height <= this.node.height){//如果高度等于view高度
            var high = this.totalCount *this.spacing + this.spacing + this.getContentHeight(this.itemData);
            this.content.height = high > this.node.height?high:this.node.height;
        }else{
            this.content.height += addHigh;
        }
        // this.content.y -= addHigh;
        if(!this.needRoll){//如果不需要滚动的话，要移动contentY左边
            this.content.y -= addHigh;
        }
        for (var i = 0 , len = this.items.length; i < len; i++) {
            var obj = this.items[i];
            var dataIdx =  obj.getComponent(this.scriptName)._itemID + itemDataList.length;
            obj.getComponent(this.scriptName)._itemID = dataIdx;
            if(!this.needRoll){//不需要滚动的话，与content设置坐标抵消
                obj.y += addHigh;
            }
        }
        if(this.items.length < this.spawnCount){
            var addNum = this.totalCount < this.spawnCount?this.totalCount - this.items.length:this.spawnCount - this.items.length;
            for (var i = 0 , len = addNum ; i < len; i++){
                var idx;
                if(this.items.length === 0){
                    idx = i;
                }
                this.addHeadItem(itemDataList[i],idx);
            }
        }
        if(this.needRoll){
            if(this.totalCount >= this.spawnCount){
                var item = this.items.pop();
                this.items.unshift(item);
            }
            this.endNum = 0;
            var moveHigh = this.itemData[0].height + this.spacing;
            for (var i = 0 , len = this.items.length; i < len; i++) {
                var obj = this.items[i];
                var dataIdx = i;
                obj.stopAllActions();
                obj.getComponent(this.scriptName)._itemID = dataIdx;
                var objHight = this.itemData[dataIdx].height * 0.5 + this.getContentHeight(this.itemData.slice(0,dataIdx)) + this.spacing * (dataIdx+1);
                obj.y = objHight - moveHigh;
                obj.getComponent(this.scriptName).init(dataIdx,this.itemData[dataIdx].data,this.ext);
                var action = cc.moveTo(0.3,cc.v2(obj.x,objHight));
                var sequence = cc.sequence(action,cc.callFunc(this.rollCb.bind(this)));
                obj.runAction(sequence);
            }
        }

    },
    rollCb:function(){//自动滚到底部的回调
        this.endNum ++;
        if(this.endNum !== this.items.length)    return;
        if(this.prefabName !== constant.ChatPrefabName.MINI){
            this.scrollView.enabled = true;
        }
        if(this.items.length > this.spawnCount){
            for(var i = 0; i < this.items.length - this.spawnCount ;i ++){
                var obj = this.items.pop();
                uiResMgr.putInPool(this.prefabName,obj);
            }
        }
        this.needRoll = false;
        if(this.totalCount <= this.maxNum)  return;
        var list = this.itemData.splice(this.maxNum,this.totalCount - this.maxNum);
        var high = (this.totalCount - this.maxNum) * this.spacing + this.getContentHeight(list);
        this.content.height -= high;
        this.totalCount = this.itemData.length;
        var len = this.items.length;
    },
    //预构建item不够，增加Item
    addHeadItem:function(itemData,idx){
        var item = uiResMgr.getPrefabEx(this.prefabName);
        if(!item){
            item = cc.instantiate(this.prefab);
        }
        item.parent = this.content;
        var dataIdx =this.items[0]? this.items[0].getComponent(this.scriptName)._itemID - 1 : idx;
        item.getComponent(this.scriptName).init(dataIdx, itemData.data,this.ext);
        item.getComponent(this.scriptName)._itemID = dataIdx;
        if(this.items[0]){
            item.y = this.items[0].y - 0.5*(this.items[0].height + itemData.height) - this.spacing;
        }else{
            item.y = -this.itemData[0].height * 0.5+ this.spacing;
        }
        this.items.unshift(item);
        return item;
    },
    //获取子节点与View的相对位置，判断是否可见
    getPositionInView: function (item) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    scrollRoll:function(event,eventType){
        if(eventType === cc.ScrollView.EventType.SCROLL_ENDED){
            var offset = this.scrollView.getMaxScrollOffset().y - this.scrollView.getScrollOffset().y;
            if(offset < 20 && offset >= 0 && this.addList.length > 0){//处在底部才滚动
                this.updateItemData(this.addList);
                this.addList = [];
            }
        }
    },
    update:function(dt){
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;
        let items = this.items;
        let isDown = this.content.y < this.lastContentPosY;
        if(isDown){
            for(var i = 0; i < items.length ; i ++){
                // var i = items.length - 1;//判断第一个
                if(!items[i])   continue;
                let viewPos = this.getPositionInView(items[i]);
                if (viewPos.y < -0.5 * (this.node.height + items[i].height) && items[items.length - 1].getComponent(this.scriptName)._itemID !== this.itemData.length - 1) {
                    var item = items[i].getComponent(this.scriptName);
                    var itemId = item._itemID + items.length;
                    if (this.itemData[itemId]) {
                        item.init(itemId, this.itemData[itemId].data,this.ext);
                    }
                    items[i].y = this.itemData[itemId].height * 0.5 + this.getContentHeight(this.itemData.slice(0,itemId)) + this.spacing * (itemId+1);
                    item._itemID = itemId;
                    var itemEx = this.items.shift();//前面的排后面去
                    this.items.push(itemEx);
                    i --;
                }else{
                    break;
                }
            }
        }else{
            for (var i = items.length - 1; i >= 0; i--) {
            // var i = 0;//判断第一个
                if(!items[i])   continue;
                let viewPos = this.getPositionInView(items[i]);
                if (viewPos.y > 0.5 * (this.node.height + items[i].height) && items[0].getComponent(this.scriptName)._itemID !== 0) {
                    var item = items[i].getComponent(this.scriptName);
                    var itemId = item._itemID - items.length;
                    if (this.itemData[itemId]) {
                        item.init(itemId, this.itemData[itemId].data,this.ext);
                    }
                    items[i].y = this.itemData[itemId].height * 0.5 + this.getContentHeight(this.itemData.slice(0,itemId)) + this.spacing * (itemId +1);
                    item._itemID = itemId;
                    var itemEx = this.items.pop();//后面的排前面去
                    this.items.unshift(itemEx);
                    i ++;
                }else{
                    break;
                }
            }
        }
        this.lastContentPosY = this.content.y;
    },
    getContentHeight:function(list){
        var high = 0;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            high += obj.height;
        }
        return  high;
    },

});
