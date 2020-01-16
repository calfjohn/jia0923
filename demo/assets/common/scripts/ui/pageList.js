var panel = require("panel");
var IN_VIEW_RE = cc.Enum({
    IN_VIEW:0,
    LEFT_VIEW:1,
    RIGHT_VIEW:2
});
cc.Class({
    extends: panel,
    editor: {
        menu:"util/分页组件",
        disallowMultiple:true,
    },
    properties: {
        cellSpacing: {
            default: 10,
            tooltip: "节点大小间距"
        },

        viewSize: {
            default: cc.size(200,50),
            tooltip: "容器大小"
        },
        clickSpeed:{
            default: 1500,
            tooltip: "点击时的移动速度"
        },
        contentNode:cc.Node,
        _touchEnble:true
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        this.ext = 0;
    },

    registerEvent: function () {

        var registerHandler = [
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchcancel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    touchstart:function(event){
        event.stopPropagation();
        if (!this._touchEnble) return;
        this.touchPos = event.getLocation();
    },
    touchmove:function(event){
        event.stopPropagation();
        if (!this._touchEnble) return;
        var pos = event.getLocation();
        var prePos = event.getPreviousLocation();
        this.moveView(pos.x - prePos.x);
    },

    touchend:function(event){
        event.stopPropagation();
        if (!this._touchEnble) return;
        var clickIdx = -1;
        var pos = event.getLocation();
        if (kf.pDistance(pos,this.touchPos) < 5) {
            clickIdx = this._hitTestClick(pos);
            this.doClickAction(clickIdx,true);
        }else {
            clickIdx = this._getMidIdx();
            this._dispatchTouch(clickIdx);
        }
    },
    touchcancel:function(event){
        event.stopPropagation();
        if (!this._touchEnble) return;
        var midIdx = this._getMidIdx();
        this._dispatchTouch(midIdx);
    },

    _dispatchTouch:function(midIdx){
        if (midIdx !== undefined) {
            var data = this.list[this.itemCells[midIdx]._listIdx];
            data.clickIdx = this.itemCells[midIdx]._listIdx;
            var ev = new cc.Event.EventCustom('clickPageItem', true);
            ev.setUserData(data);
            this.node.dispatchEvent(ev);
        }
        if (midIdx !== -1) {
            this.updateMidCell(midIdx);
        }
    },

    _hitTestClick:function(pos){
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var obj = this.itemCells[i];
            if (kf.rectContainsPoint(obj.node.getBoundingBoxToWorld(),pos)) {
                return i;
            }
        }

        return null;
    },

    doClickAction:function(idx,isTouch){
        if (idx === null) return;
        var curIdx = this._getMidIdx();
        if (curIdx === -1) return cc.error("为什么这时候没有当前索引");
        var data = this.list[this.itemCells[idx]._listIdx];
        data.isTouch = isTouch;
        data.clickIdx = this.itemCells[idx]._listIdx;
        this.node.dispatchDiyEvent("clickPageItem",data);
        if(isTouch && !this.clickNoMove)    return;
        if (curIdx === idx) return;
        this.moveOffX = this.itemCells[curIdx].node.x -this.itemCells[idx].node.x;
        if (this.moveOffX === 0) return cc.error("为什么移动距离为0");
        this.leftOff = this.moveOffX;
        this.node.getChildByName("blockNode").active = true;
        this.moveActionFlag = true;
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
        this.clickNoMove = data.clickNoMove;
        this.viewSize = data.viewSize || this.viewSize;
        this.viewSize.width = (data.prefab.data.width * data.list.length) <  this.viewSize.width  ? (data.prefab.data.width * data.list.length) : this.viewSize.width ;
        this.node.setContentSize(this.viewSize);
        this.cellSpacing = data.cellSpacing || this.cellSpacing;
        this.prefab = data.prefab;
        this.miniScale = data.miniScale || 0.5;//最小缩放比例
        this.cellSize = this.prefab.data._contentSize;
        this.list = data.list;
        this.contentNode.y = 0;
        this.contentNode.x = 0;
        this.contentNode.height = this.cellSize.height;

        var showNum = Math.floor(this.viewSize.width / (this.cellSize.width + this.cellSpacing));
        this._touchEnble = showNum <= this.list.length;
        if (showNum > this.list.length) {
            showNum = this.list.length;
        }else {
            showNum = showNum % 2 === 0 ? (showNum+1) : showNum;
            showNum += 2;
        }

        this.contentNode.removeAllChildren();
        this.itemCells = [];
        var midIdx = showNum % 2 === 0 ? showNum/2 : (Math.floor(showNum/2 )+1);
        for(var i = 0; i < showNum; i++) {
            var msgItem = cc.instantiate(this.prefab);
            msgItem.parent = this.contentNode;
            var script = msgItem.getComponent(this.prefab.name);
            this.itemCells.push(script);
            script.node.x = (i-midIdx+1) * (this.cellSize.width + this.cellSpacing);
            script.node.pageX = script.node.x;//节点的pageX用于记录该节点理论位置 x为实际位置（可能经过便宜运算）
            script._listIdx = this._getListIdxByIdx(i-midIdx+1)//通过索引确认引用数据索引
        }
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
    //获取中间物品的IDX
    getMidItemIdx:function(){
        var minX = 1000;
        var idx = -1;
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var item = this.itemCells[i].node;
            var viewPos = kf.getPositionInNode(item,this.node);
            if (Math.abs(viewPos.x) < minX) {
                minX = Math.abs(viewPos.x);
                idx = this.itemCells[i]._listIdx;
            }
        }
        return idx;
    },
    /** 选取中间一个移动过去啦 */
    updateMidCell:function(midIdx){
        if (!this.itemCells[midIdx]) return;
        var item = this.itemCells[midIdx].node;
        var viewPos = kf.getPositionInNode(item,this.node);
        this.moveView(-viewPos.x);
    },

    _getListIdxByIdx:function(idx){
        if (idx > this.list.length-1) {
            idx = idx - (this.list.length);
        }else if (idx < 0) {
            idx = idx + this.list.length;
        }
        return idx
    },

    /** 是否在mask剪裁中 */
    isInView: function (item) { // get item position in scrollview's node space
        var worldPos = item.parent.convertToWorldSpaceAR(item.position);
        var viewPos = this.node.convertToNodeSpaceAR(worldPos);
        var maxX = viewPos.x - item.width;
        if (maxX > this.node.width/2) {
            return IN_VIEW_RE.RIGHT_VIEW;
        }
        var minX = viewPos.x + item.width;
        if (minX < -this.node.width/2) {
            return IN_VIEW_RE.LEFT_VIEW;
        }
        return IN_VIEW_RE.IN_VIEW;
    },
    /** 更新节点大小，根据不同脚本索引刷新数据 */
    updateView:function(){
        var midIdx = this.getMidItemIdx();
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var obj = this.itemCells[i];
            var item = obj.node;
            var viewPos = kf.getPositionInNode(item,this.node);
            var off = Math.abs(viewPos.x)/(this.node.width/2);
            off  = off > 1 ? 1:off;
            off = 1-off;
            item.scale = (this.miniScale + (1-this.miniScale) * off);
            obj.init(obj._listIdx,this.list[obj._listIdx],midIdx,this.ext);
        }
    },
    /** 移动容器节点 更新索引 */
    moveView:function(offSize){
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
            for (var i = 0 , len = pusList.length; i < len; i++) {
                var obj = pusList[i];
                obj._listIdx = this._getListIdxByIdx(this.itemCells[0]._listIdx - 1);
                var x = this.itemCells[0].node.pageX;
                obj.node.x = x - (this.cellSize.width + this.cellSpacing);
                obj.node.pageX = obj.node.x;
                this.itemCells.unshift(obj);
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
            for (var i = 0 , len = pusList.length; i < len; i++) {
                var obj = pusList[i];
                obj._listIdx = this._getListIdxByIdx(this.itemCells[this.itemCells.length-1]._listIdx + 1);
                var x = this.itemCells[this.itemCells.length-1].node.pageX;
                obj.node.x = x + (this.cellSize.width + this.cellSpacing);
                obj.node.pageX = obj.node.x;
                this.itemCells.push(obj);
            }
        }
        this.updateView()
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.moveActionFlag) return;
        var offX = this.moveOffX * (dt/(Math.abs(this.moveOffX)/this.clickSpeed));
        this.leftOff -= offX;
        this.moveView(offX);
        if ((this.moveOffX > 0 && this.leftOff <= 0) || (this.moveOffX < 0 && this.leftOff >= 0)  ) {
            this.node.getChildByName("blockNode").active = false;
            this.moveActionFlag = false;
            this.moveView(-this.leftOff);
            var clickIdx = this._getMidIdx();
            this.updateMidCell(clickIdx);

        }
    }
});
