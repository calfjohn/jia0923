var panel = require("panel");
var moveDt = require("moveDt");

cc.Class({
    extends: panel,

    properties: {
        maskNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
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
        this.startPos = event.getLocation();
        event.stopPropagation();
    },
    touchmove:function(event){
        event.stopPropagation();
        if (!this.startPos) return;

        var pos = event.getLocation();
        var prePos = event.getPreviousLocation();
        var movePos = cc.v2((pos.x - prePos.x),(pos.y - prePos.y));
        var nextPos = cc.v2(this.node.parent.x + movePos.x,this.node.parent.y + movePos.y);


        if (nextPos.x <= this.maxX && nextPos.x >= this.minX) {
            this.node.parent.x = nextPos.x;
        }

        if (nextPos.y <= this.maxY && nextPos.y >=  this.minY ) {
            this.node.parent.y = nextPos.y;
        }
        this.node.dispatchDiyEvent("touchMoveNow");
    },
    touchend:function(event){
        event.stopPropagation();
        var pos = event.getLocation();
        if (!this.startPos) return;
        var target = this.hitTest(pos);
        if (!target) return;
        if (kf.pDistance(this.startPos,pos) < 10){
            if (!target.callNodeFunc('getTouchEnble')) return;// NOTE: 这里不能点啊
            var cb = null;
            if (target.callNodeFunc('getCheckPointFlag')) {
                var cb = function(){
                    target.callNodeFunc('callServerStateDone');
                }.bind(this);
            } else if (target.callNodeFunc('isMonsterMap')) {
                var cb = function(){
                    var ev = new cc.Event.EventCustom('clickMonster', true);
                    ev.setUserData(target);
                    this.node.dispatchEvent(ev);
                }.bind(this);
            }
            var ev = new cc.Event.EventCustom('clickChapterItem', true);
            ev.setUserData({target:target,cb:cb});
            this.node.dispatchEvent(ev);
        }
        this.startPos = null;
        this.node.dispatchDiyEvent("fixPos");
    },
    touchcancel:function(event){
        event.stopPropagation();
        this.startPos = null;
        this.node.dispatchDiyEvent("fixPos");
    },

    resetLandPos:function(node,nextPos){
      if (nextPos.x <= this.maxX && nextPos.x >= this.minX) {
          node.x = nextPos.x;
      }else {
          node.x = nextPos.x < this.maxX? this.minX:this.maxX;
      }

      if (nextPos.y <= this.maxY && nextPos.y >=  this.minY ) {
          node.y = nextPos.y;
      }else {
          node.y = nextPos.y < this.maxY? this.minY:this.maxY;
      }
  },

    hitTest:function(pos,isNative){
        //pos = this.cameraComp.getCameraToWorldPoint(pos)
        if (!this.itemCells) return false;
        for (var row in this.itemCells) {
            for (var col in this.itemCells[row]) {
                var script = this.itemCells[row][col];
                if (script.hitTest(pos,isNative)) {
                    if (!isNative) {
                        script.callNodeFunc('touchNow');
                    }
                    return script;
                }
            }
        }
        return null;
    },

    moveCamera:function(movePos){
        var pos = cc.v2(0,0);

        var nextPos = cc.v2(this.node.parent.x + movePos.x,this.node.parent.y + movePos.y);

        if (nextPos.x <= this.maxX && nextPos.x >= this.minX) {
            pos.x = movePos.x;
        }

        if (nextPos.y <= this.maxY && nextPos.y >=  this.minY ) {
            pos.y = movePos.y;
        }
        this.node.parent.getComponent("moveDt").moveNow(pos,null,0.1);
    },

    init:function(prefab,viewSize,map){
        this.maxX = -this.node.parent.parent.width/2;
        this.minX = (this.maxX -(this.node.width * this.node.parent.scaleX  -this.node.parent.parent.width));
        this.minX -= (-20);//23是短边宽
        this.maxX += (-20);
        this.maxY = -this.node.parent.parent.height/2;

        this.minY = (this.maxY -(this.node.height * this.node.parent.scaleY  -this.node.parent.parent.height));
        this.minY += 20;//高度
        this.maxY -= 20;

        this.itemCells = map;
        // this.node.parent.getChildByName("New Sprite(Splash)").setContentSize(this.node.getContentSize())
    },

});
