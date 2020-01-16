cc.Class({
    extends: cc.Component,
    editor: {
        menu:"util/listView",
        requireComponent:cc.ScrollView,
        disallowMultiple:true,
    },
    properties: {
        updateInterval:0.2,
        downSpeed:200,//高度减少的速度
    },

    onLoad: function () {
        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.totalCount = 0;
        this.spawnCount = 6;
        this.forceUpdate = false;
        this.spacing = 2;
        this.items = [];
        this.updateTimer = 0;
        this.lastContentPosY = 0;
        this.bufferZone = 500;
        this.extFunc = function(){};
        this.node.on("size-changed", this.onSizeChange, this);
        this.node.on("downHide", this.downHide, this);
        this.node.on("downShow", this.downShow, this);
        this.inAddBottom = false;//目前状态已经是额外加了高度的
    },

    onDestroy:function(){
        this.node.off("size-changed", this.onSizeChange, this);
        this.node.off("downHide", this.downHide, this);
        this.node.off("downShow", this.downShow, this);
    },

    downHide:function (event) {
        event.stopPropagation();
        if(!this.inAddBottom)   return;
        this.downHeight = this.bottom;
        this.inAddBottom = false;
    },

    downShow:function (event) {
        event.stopPropagation();
        if(this.inAddBottom)   return;
        this.content.height += this.bottom;
        this.scrollView.scrollToBottom(0.3);
        this.inAddBottom = true;
    },

    onSizeChange:function(){
        if (!this.prefabHeight) return;
        this.spawnCount = Math.ceil(this.node.height / this.prefabHeight) + 2;
        this.bufferZone = this.node.height - this.prefabHeight / 2;
        this.viewData.spawnCount = this.spawnCount;
        this.init(this.prefab,this.viewData,this.itemData);
    },
//extFunc 也可以是一个额外的参数 viewData.noOpen用于控制界面显示过程中数据刷新导致重复播放open动画
    init: function (prefab, viewData, itemData, is2Idx, extFunc) {
        this.content = this.scrollView.content;
        is2Idx = is2Idx === undefined? 0 : is2Idx;
        is2Idx = is2Idx >= viewData.totalCount ? viewData.totalCount - 1:is2Idx;
        var oldCount = is2Idx;
        if (is2Idx === -1) {
            oldCount = this.totalCount - this.spawnCount;
            oldCount = oldCount < 0? 0:oldCount;
        }
        this.totalCount = viewData.totalCount ? viewData.totalCount : itemData.length;
        this.spacing = viewData.spacing ? viewData.spacing : this.spacing;
        this.updateTimer = this.updateInterval+1;
        this.viewData = viewData;
        this.prefab = prefab;
        this.extFunc = extFunc || function(){};
        this.showAni = viewData.showAni || false;

        var rollNow = viewData.rollNow !==undefined?viewData.rollNow:true;
        this.prefabHeight = prefab.data.height;
        var extNum = viewData.extNum || 0;
        this.spawnCount =  Math.ceil(this.node.height / this.prefabHeight) + 2 + extNum;
        this.bufferZone = this.node.height- this.prefabHeight / 2;
        this.scriptName = prefab.name;
        this.itemData = itemData;
        var spawnCount = this.totalCount > this.spawnCount ? this.spawnCount : this.totalCount;
        this.bottom =this.viewData.bottom?this.viewData.bottom:0;
        this.content.height = this.totalCount * (this.prefabHeight + this.spacing) + this.spacing;
        this.inAddBottom = false;
        var itemIdx = oldCount;
        if(!rollNow){
            itemIdx = this.getNowIdx();
        }
        if(itemIdx < 2) {
            itemIdx = 2;
        }
        if(itemIdx > this.totalCount - (spawnCount - 2)) {
            itemIdx = this.totalCount - (spawnCount - 2);
        }
        this.items = [];
        for (var i = 0; i < spawnCount; i++) {
            let item;
            if(this.content.children[i]) {
                item = this.content.children[i];
            }
            else {
                item = cc.instantiate(prefab);
                item.parent = this.content;
            }
            var dataIdx = (itemIdx - 2) + i;
            var isBottom = dataIdx === this.itemData.length - 1;
            item.getComponent(this.scriptName).init(dataIdx, this.itemData[dataIdx],this.extFunc,isBottom,this.bottom);
            item.getComponent(this.scriptName)._itemID = dataIdx;
            item.setPosition(0, -item.height * (0.5 + dataIdx) - this.spacing * (dataIdx + 1));
            this.items.push(item);
            if(this.showAni && item.getComponent("listItemAni") && !viewData.noOpen){
                 item.getComponent("listItemAni").open();
            }
        }
        if(spawnCount < this.content.children.length) {
            for (var j = spawnCount; j < this.content.children.length; ) {
                this.content.children[j].destroy();
                this.content.children[j].removeFromParent();
            }
        }
        if(rollNow){
            var percent = (this.totalCount - oldCount - 1) / (this.totalCount - 1);
            this.scrollView.scrollToPercentVertical(percent, 0.01);
        }
    },

    getNowIdx:function () {
        var idx;//给个极大数
        for (var i = 0 , len = this.items.length; i < len; i++) {
            var obj = this.items[i].getComponent(this.scriptName);
            if(idx === undefined || obj._itemID < idx){
                idx = obj._itemID;
            }
        }
        idx = idx === undefined?0:idx;
        return  idx;
    },
    updateItemData:function(itemData,isForceUpdate){
        this.itemData = itemData;
        this.totalCount = itemData.length;
        this.content.height =  this.totalCount * (this.prefabHeight + this.spacing) + this.spacing + this.bottom;
        this.forceUpdate = isForceUpdate;
        if(this.items.length <this.spawnCount && this.totalCount > this.items.length){
            var spawnCount = this.spawnCount <= this.totalCount?this.spawnCount:this.totalCount;
            for (var i = this.items.length; i < spawnCount; i++) {
                var item = cc.instantiate(this.prefab);
                item.parent = this.content;
                var isBottom = i === this.itemData.length - 1;
                item.getComponent(this.scriptName).init(i, this.itemData[i],this.extFunc,isBottom,this.bottom);
                item.getComponent(this.scriptName)._itemID = i;
                item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
                this.items.push(item);
                if(this.showAni && item.getComponent("listItemAni")){
                     item.getComponent("listItemAni").open();
                }
            }
        }
        if(spawnCount < this.content.children.length) {
            for (var j = spawnCount; j < this.content.children.length; ) {
                this.content.children[j].destroy();
                this.content.children[j].removeFromParent();
            }
        }
    },

    getPositionInView: function (item) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    update: function (dt) {
        if(this.downHeight > 0){
            var down = this.downHeight - dt * this.downSpeed > 0?dt * this.downSpeed:this.downHeight;
            this.downHeight -= down;
            this.content.height -= down;
        }
        if(this.totalCount <= this.spawnCount && !this.forceUpdate) return;
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval && !this.forceUpdate) return;
        this.updateTimer = 0;
        let items = this.items;
        let buffer = this.bufferZone;
        let isDown = this.content.y < this.lastContentPosY;
        let offset = (this.prefabHeight + this.spacing) * items.length;
        var delay = items.length;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                if (viewPos.y < -buffer && items[i].y + offset < 0) {
                    items[i].y = items[i].y + offset ;
                    var item = items[i].getComponent(this.scriptName);
                    var itemId = item._itemID - items.length;
                    if (this.itemData[itemId]) {
                        var isBottom = itemId === this.itemData.length - 1;
                        item.init(itemId, this.itemData[itemId],this.extFunc,isBottom,this.bottom);
                    }
                    item._itemID = itemId;
                    if(this.showAni && items[i].getComponent("listItemAni")){
                         items[i].getComponent("listItemAni").show(delay);
                         delay --;
                    }
                }
            } else {
                var checkNum = this.inAddBottom ? this.content.height - this.bottom:this.content.height;
                if (viewPos.y > buffer && items[i].y - offset > -checkNum) {
                    items[i].y = items[i].y - offset;
                    var item = items[i].getComponent(this.scriptName);
                    var itemId = item._itemID + items.length;
                    if (this.itemData[itemId]) {
                        var isBottom = itemId === this.itemData.length - 1;
                        item.init(itemId, this.itemData[itemId],this.extFunc,isBottom,this.bottom);
                    }
                    item._itemID = itemId;

                    if(this.showAni && items[i].getComponent("listItemAni")){
                         items[i].getComponent("listItemAni").show(delay);
                         delay --;
                    }
                }
            }
            if (this.forceUpdate) {
                var item = items[i].getComponent(this.scriptName);
                var itemId = item._itemID;
                if (this.itemData[itemId]) {
                    var isBottom = itemId === this.itemData.length - 1;
                    item.init(itemId, this.itemData[itemId],this.extFunc,isBottom,this.bottom);
                }
            }
        }
        this.forceUpdate = false;
        this.lastContentPosY = this.content.y;
    },

});
