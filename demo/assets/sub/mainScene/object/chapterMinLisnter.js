
 let listerComp = cc.Class({
    extends: cc.ScrollView,

    properties: {
        moveScale: {
            default: 0.025,
            tooltip: "每次双指触摸缩放量"
        },
        touchMoveAdd: {
            default: 1.5,
            tooltip: "滑动增量"
        },
        boundMaxPos: {
            default: cc.v2(100,100),
            tooltip: "滑动边界最大值"
        },

        chapterTipPrefab:cc.Prefab,
        tipParent:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.minScroll = 1;
        this.maxScroll = 1;
        this.content.getContentSize = function () {// NOTE: 重写content size 用于scroview计算时正确数值
            return cc.size(this.width * this.scaleX,this.height * this.scaleY)
        }.bind(this.content);
        this.chapterLogic = kf.require("logic.chapter");
        this.guideLogic = kf.require("logic.guide");
    },

    setOrigenSize:function(size){
    },

    setMinScroll:function(scrol,scale){
        scrol = scrol || 1;
        scale = scale || 1;
        this.minScroll = Number(scrol);
        this.node.getChildByName("content").scale = Number(scale);
    },

    init:function(ctrl){
        this.ctrl = ctrl;
        this.itemCells = this.ctrl.itemCells;
        // setTimeout(function () {
        //     this.refreshChapterTip()
        // }.bind(this), 50);
    },
    //重写scroview方法------------------------------------------
    _handleMoveLogic: function(touch) {
        var deltaMove = touch.getDelta();
        deltaMove.x = deltaMove.x * this.touchMoveAdd;
        deltaMove.y = deltaMove.y * this.touchMoveAdd;
        this._processDeltaMove(deltaMove);
    },

    _scrollChildren: function(deltaMove) {
        deltaMove = this._clampDelta(deltaMove);

        var realMove = deltaMove;
        var outOfBoundary;
        if (this.elastic) {
            outOfBoundary = this._getHowMuchOutOfBoundary();
            realMove.x *= (outOfBoundary.x === 0 ? 1 : 0.5);
            realMove.y *= (outOfBoundary.y === 0 ? 1 : 0.5);
            if (Math.abs(outOfBoundary.x) > this.boundMaxPos.x) {
                realMove.x = 0;
            }
            if (Math.abs(outOfBoundary.y) > this.boundMaxPos.y) {
                realMove.y = 0;
            }
        }

        if (!this.elastic) {
            outOfBoundary = this._getHowMuchOutOfBoundary(realMove);
            realMove = kf.pAdd(realMove, outOfBoundary);
        }

        var scrollEventType = -1;

        if (realMove.y > 0) { //up
            var icBottomPos = this.content.y - this.content.anchorY * this.content.height;

            if (icBottomPos + realMove.y > this._bottomBoundary) {
                scrollEventType = 'scroll-to-bottom';
            }
        }
        else if (realMove.y < 0) { //down
            var icTopPos = this.content.y - this.content.anchorY * this.content.height + this.content.height;

            if(icTopPos + realMove.y <= this._topBoundary) {
                scrollEventType = 'scroll-to-top';
            }
        }
        else if (realMove.x < 0) { //left
            var icRightPos = this.content.x - this.content.anchorX * this.content.width + this.content.width;
            if (icRightPos + realMove.x <= this._rightBoundary) {
                scrollEventType = 'scroll-to-right';
            }
        }
        else if (realMove.x > 0) { //right
            var icLeftPos = this.content.x - this.content.anchorX * this.content.width;
            if (icLeftPos + realMove.x >= this._leftBoundary) {
                scrollEventType = 'scroll-to-left';
            }
        }

        this._moveContent(realMove, false);

        if(realMove.x !== 0 || realMove.y !== 0)
        {
            if (!this._scrolling) {
                this._scrolling = true;
                this._dispatchEvent('scroll-began');
            }
            this._dispatchEvent('scrolling');
        }

        if (scrollEventType !== -1) {
            this._dispatchEvent(scrollEventType);
        }

    },

    _moveContent: function(deltaMove, canStartBounceBack) {
        var adjustedMove = this._flattenVectorByDirection(deltaMove);
        var offSize = cc.v2(-adjustedMove.x,-adjustedMove.y)
        this.node.dispatchDiyEvent("chpaterMove",offSize);//
        var newPosition = kf.pAdd(this.getContentPosition(), adjustedMove);

        this.setContentPosition(newPosition);

        var outOfBoundary = this._getHowMuchOutOfBoundary();
        this._updateScrollBar(outOfBoundary);

        if (this.elastic && canStartBounceBack) {
            this._startBounceBackIfNeeded();
        }
        this.refreshChapterTip();
    },
    _onTouchMoved:function(event,captureListeners){
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        var touch = event.touch;
        var touches = event.getTouches();
        if (touches.length === 2) {
            this.dealTouches(touches,event,false);
            this.refreshChapterTip();
        }else if (touches.length === 1) {
            if (this.content) {
                this._handleMoveLogic(touch);
            }
            // Do not prevent touch events in inner nodes
            if (!this.cancelInnerEvents) {
                return;
            }

            var deltaMove = touch.getLocation().sub(touch.getStartLocation());
            //FIXME: touch move delta should be calculated by DPI.
            if (deltaMove.mag() > 7) {
                if (!this._touchMoved && event.target !== this.node) {
                    // Simulate touch cancel for target node
                    var cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                    cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                    cancelEvent.touch = event.touch;
                    cancelEvent.simulate = true;
                    event.target.dispatchEvent(cancelEvent);
                    this._touchMoved = true;
                }
            }
            this._stopPropagationIfTargetIsMe(event);
        }
    },

    _onTouchEnded: function(event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        this._dispatchEvent('touch-up');
        this.touchend(event);
        var touch = event.touch;
        if (this.content) {
            this._handleReleaseLogic(touch);
        }
        if (this._touchMoved) {
            event.stopPropagation();
        } else {
            this._stopPropagationIfTargetIsMe(event);
        }
    },

    //重写scroview方法------------------------------------------

    refreshChapterTip:function(){
        var guideList = [];
        if (this.chapterLogic.isChapterStatic(this.ctrl.id)) {
            var startRect = new cc.rect(0,0,this.tipParent.width,this.tipParent.height);
            this.itemCells = this.ctrl.itemCells;
            if (!this.itemCells) {
                return;
            }
            for (var i = 0 , len = this.itemCells.length; i <  len; i++) {
                var obj = this.itemCells[i];
                if (this.chapterLogic.isPassChapterOneIdx(this.ctrl.id,obj.getMonsterID())
                    || !this.chapterLogic.isUnlockChapter(this.ctrl.id,obj.getMonsterID())) {
                    continue;
                }
                var worldPos = obj.node.convertToWorldSpaceAR(cc.v2(0,0));
                var endRect = new cc.rect(worldPos.x - obj.node.width/2,worldPos.y - obj.node.height/2,obj.node.width,obj.node.height);
                if (cc.Intersection.rectRect(startRect,endRect)) {

                }else {
                    guideList.push(worldPos);
                }
            }
        }
        var refreshData = {
            content:this.tipParent,
            list:guideList,
            prefab:this.chapterTipPrefab
        }
        uiManager.refreshView(refreshData);
    },

    //外部调用设置目标
    setPropePos:function(script,offPos){
        var pos = script.getPosition();
        if(offPos){
            pos = cc.v2(pos.x + offPos.x,pos.y + offPos.y);
        }
        var sizeX = this.content.scaleX;
        var sizeY = this.content.scaleY;
        this.content.setPosition(cc.v2(-pos.x * sizeX,-pos.y * sizeY));
        this._moveContent(cc.v2(0.01,0.01), true);//
        // this.scrollTo(cc.v2(0.5-x,0.5-y ),0,false);
    },

    //处理触摸事件
    dealTouches:function(touches,event,isFirst){
        var point1 = touches[0].getLocation();
        var point1Start = touches[0].getStartLocation();

        var point2 = touches[1].getLocation();
        var point2Start = touches[1].getStartLocation();
        if (kf.pDistance(point1, point1Start) < 20 || kf.pDistance(point2Start, point2) < 20) {
            return;
        }
        var dis = kf.pDistance(point1, point2);
        if (!this.touchesDis) {
            this.touchesDis = dis;
        }else {
            if (this.touchesDis !== dis) {
                var scroll = this.touchesDis > dis ? -1:1;
                // cc.log("dis",dis,this.touchesDis,scroll)
                this.touchesDis = dis;
                this.sceneZoom(scroll)
            }
        }
    },
    /** 处理双指缩放 */
    sceneZoom:function(scroll,touch1,touch2){

      var off = scroll > 0 ? this.moveScale:-this.moveScale;
      var scale = this.node.getChildByName("content").getScale();
      var endScroll = scale + off;
      endScroll = endScroll < this.minScroll ? this.minScroll :endScroll;
      endScroll = endScroll >= this.maxScroll ? this.maxScroll :endScroll;
      this.node.getChildByName("content").setScale(endScroll);
    },
    /** 处理点击行为 */
    touchend:function(event){
        var pos = event.getLocation();
        var starPos = event.getStartLocation();
        if (kf.pDistance(starPos,pos) > 10) return;
        var touches = event.getTouches();
        var touchOne = this.isInLand(event);
        if (touchOne && touches.length === 1) {
            touchOne.clickNode();
            var id = touchOne.getMonsterID();
            var isOnePass = this.chapterLogic.isPassChapterOneIdx(this.ctrl.id,id);
            if (!isOnePass) {
                this.node.dispatchDiyEvent("clickMonster",touchOne);
            }
            else if(touchOne.isTouchReward(event)){
                cc.log("点到奖励了");
            }
            else if (touchOne.isTouchBossSpine(event)) {

                var callback = function(){
                    this.chapterLogic.req_ChapterState(this.ctrl.id,this.chapterLogic.STATE_ENUM.DONE);
                    this.chapterLogic.req_ChapterBattleReset(this.ctrl.id);
                }.bind(this);
                if (!this.chapterLogic.isAllPickRewardDone(this.ctrl.id)) {
                    uiManager.msgDefault(uiLang.getMessage("chapterPanelEx","rewardUnTook"),callback);
                }else {
                    callback();
                }
            }

        }
    },

    isInLand:function(event){
        var pos = event.getLocation();
        this.itemCells = this.ctrl.itemCells;
        for (var i = 0 , len = this.itemCells.length; i <  len; i++) {
            var obj = this.itemCells[i];
            if (obj.isTouchYou(pos)) {
                return obj;
            }
        }
        return null
    },
});
module.exports = listerComp;
