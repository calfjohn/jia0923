var pageList = require("pageList");
var IN_VIEW_RE = cc.Enum({
    IN_VIEW:0,
    LEFT_VIEW:1,
    RIGHT_VIEW:2
});
cc.Class({
    extends: pageList,
    editor: {
        menu:"util/分页组件",
        disallowMultiple:true,
    },
    properties: {

    },

    /**
     * 初始化调用 显示区域手动调整 单个间隔手动设置   上层接收  clickPageItem 事件获取点击行为  单个节点大小选取预制体大小填充cellsize
     * @param  {obj} data prefab，list，miniScale缩放比例  cellSpacing检点间距    viewSize 试图大小
     */
    init:function(data){
        this.node.getChildByName("blockNode").active = false;
        this.moveOffX = 0;
        this.leftOff = this.moveOffX;
        this.moveActionFlag = false;

        this.viewSize = data.viewSize || this.viewSize;
        this.viewSize.width = (data.prefab.data.width * data.list.length) <  this.viewSize.width  ? (data.prefab.data.width * data.list.length) : this.viewSize.width ;
        this.node.setContentSize(this.viewSize);
        this.cellSpacing = data.cellSpacing === undefined ? this.cellSpacing : data.cellSpacing;
        this.prefab = data.prefab;
        this.miniScale = data.miniScale || 0.5;//最小缩放比例
        this.ext = data.ext?data.ext:0;
        this.cellSize = this.prefab.data._contentSize;
        this.list = data.list;
        this.contentNode.y = 0;
        this.contentNode.height = this.cellSize.height;

        var showNum = Math.floor(this.viewSize.width / (this.cellSize.width + this.cellSpacing));
        this._touchEnble = showNum <= this.list.length && !data.unTouchEnable;
        if (showNum > this.list.length) {
            showNum = this.list.length;
        }else {
            showNum = showNum % 2 === 0 ? (showNum+1) : showNum;
            showNum += 2;
        }

        this.contentNode.removeAllChildren();
        this.itemCells = [];
        var midIdx = data.midIdx ? data.midIdx:0;//初始化中间显示谁
        if(midIdx < 0){
            midIdx = 0;
        }
        if(midIdx >= this.list.length){
            midIdx = this.list.length - 1;
        }
        this.contentNode.x = -midIdx * (this.cellSize.width + this.cellSpacing);
        if(data.minX !== undefined){
            this.minX = data.minX;
        }else{
            this.minX = - (this.list.length - 1) * (this.cellSize.width + this.cellSpacing) - 20;
        }
        if(data.maxX !== undefined){
            this.maxX = data.maxX;
        }else{
            this.maxX = 20;
        }
        var idx = midIdx - Math.floor(showNum/2) >= 0?midIdx - Math.floor(showNum/2):0;
        if( midIdx + Math.floor(showNum/2) >= this.list.length){
            idx = this.list.length - showNum;
            idx = idx < 0?0:idx;
        }
        for (var i = idx; i < idx + showNum; i++) {
            var msgItem = cc.instantiate(this.prefab);
            msgItem.parent = this.contentNode;
            var script = msgItem.getComponent(this.prefab.name);
            this.itemCells.push(script);
            script.node.x = (i) * (this.cellSize.width + this.cellSpacing);
            script.node.pageX = script.node.x;//节点的pageX用于记录该节点理论位置 x为实际位置（可能经过便宜运算）
            script._listIdx = this._getListIdxByIdx(i)//通过索引确认引用数据索引
        }
        // for(var i = 0; i < showNum; i++) {
        //
        // }
        this.updateView()
    },
    _getMidIdx:function(){
        var minX = 1000;
        var idx = -1;
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var item = this.itemCells[i].node;
            var viewPos = kf.getPositionInNode(item,this.node);
            if (Math.abs(viewPos.x) < minX) {
                minX = Math.abs(viewPos.x);
                idx = i;
            }
        }
        return idx;
    },

    _getListIdxByIdx:function(idx){
        if (idx > this.list.length-1) {
            idx = idx - (this.list.length);
        }else if (idx < 0) {
            idx = idx + this.list.length;
        }
        return idx
    },

    doLeftAction:function () {
        var curIdx = this._getMidIdx();
       if (curIdx === -1) return cc.error("为什么这时候没有当前索引");
       this.doClickAction(curIdx - 1);
    },

    doRightAction:function () {
        var curIdx = this._getMidIdx();
       if (curIdx === -1) return cc.error("为什么这时候没有当前索引");
        this.doClickAction(curIdx + 1);
    },

    /** 移动容器节点 更新索引 */
    moveView:function(offSize){
        if(this.contentNode.x + offSize >= this.maxX || this.contentNode.x + offSize <= this.minX){
            return;
        }
        this.contentNode.x += (offSize);

        if (offSize > 0) {//向右
            var pusList = [];
            for(var i =  this.itemCells.length-1;i > -1;i--){
                var item =  this.itemCells[i].node;
                var re = this.isInView(item);
                if (re === IN_VIEW_RE.IN_VIEW) {
                    break;
                }else if (re === IN_VIEW_RE.RIGHT_VIEW) {
                    pusList.push(this.itemCells.pop());
                }
            }
            for (var i = 0; i < pusList.length; i++) {
                if(this.itemCells[0]._listIdx === 0){
                    break;
                }else{
                    var obj = pusList.splice(i,1)[0];
                    i --;
                    obj._listIdx = this._getListIdxByIdx(this.itemCells[0]._listIdx - 1);
                    var x = this.itemCells[0].node.pageX;
                    obj.node.x = obj._listIdx * (this.cellSize.width + this.cellSpacing);
                    obj.node.pageX = obj.node.x;
                    this.itemCells.unshift(obj);
                }
            }
            for (var i = pusList.length - 1; i >= 0; i --) {
                var obj = pusList[i];
                this.itemCells.push(obj);
            }
        }else {
            var pusList = [];
            for (var i = 0 , len = this.itemCells.length; i < len; i++) {
                var item =  this.itemCells[i].node;
                var re = this.isInView(item);
                if (re === IN_VIEW_RE.IN_VIEW) {
                    break;
                }else if (re === IN_VIEW_RE.LEFT_VIEW) {
                    pusList.push(this.itemCells.shift());
                    i--;
                }
            }
            for (var i = 0; i < pusList.length; i++) {
                if(this.itemCells[this.itemCells.length-1]._listIdx === this.list.length - 1){
                    break;
                }else{
                    var obj = pusList.splice(i,1)[0];
                    obj._listIdx = this._getListIdxByIdx(this.itemCells[this.itemCells.length-1]._listIdx + 1);
                    var x = this.itemCells[this.itemCells.length-1].node.pageX;
                    obj.node.x = obj._listIdx * (this.cellSize.width + this.cellSpacing);
                    obj.node.pageX = obj.node.x;
                    this.itemCells.push(obj);
                }
            }
            for (var i = pusList.length - 1; i >= 0; i --) {
                var obj = pusList[i];
                this.itemCells.unshift(obj);
            }
        }
        this.updateView()
    },
});
