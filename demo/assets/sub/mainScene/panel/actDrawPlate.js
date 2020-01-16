var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
       allIsLands:[cc.Node],
       nameLabel:cc.Label,
       iconNode:cc.Node,
       node150:cc.Node,
       node300:cc.Node,
    },


    onLoad () {
        this.registerEvent();
        this.alllandPos = [];
        this.allAction = [];
        this.offset = 0;
        this.starPosX = 0;
        this.inAuto = false;
        this.firstTid = 0;
        //得到四个台子的固定位置
        for(let i = 0; i < this.allIsLands.length; i++){
            //在一开始修改几个台子的渲染层级
            // this.allIsLands[i].zIndex = i === 2? 0:5 - i;
            var landPos = this.allIsLands[i].getPosition();
            this.alllandPos.push(landPos);
        }
        this.resetNode();
        // cc.log(this.alllandPos);
        this.maxOffset = 250;
        this.inTouch = false;
        this.canTouch = false;
    },

    registerEvent:function(){
        this.registerClientEvent("resetActName", this.resetNode.bind(this));
        this.registerClientEvent("setDrawCardCanTouch", this.setCanTouch.bind(this));
        var registerHandler = [
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchend.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    setCanTouch: function (canTouch) {
        this.canTouch = canTouch;
    },

    touchstart:function(event){
        if(!this.canTouch) return;
        if(this.inAuto) return;//正在自动滚动
        this.starPosX = event.getLocationX();
        this.inTouch = false;
    },

    touchmove:function(event){
        if(!this.canTouch) return;
        if(this.inAuto) return;
        this.offset = event.getLocationX() - this.starPosX;
        if(this.offset < -this.maxOffset){
            this.offset = -this.maxOffset;
        }else if(this.offset > this.maxOffset){
            this.offset = this.maxOffset;
        }
        this.moveOne();
        this.moveTwo();
        this.moveTree();
        this.moveFour();
        // cc.log("offset" + this.offset);
    },

    touchend:function(event){
        if(!this.canTouch) return;
        if(this.inAuto) return;
        this.inTouch = false;
        if(Math.abs(this.offset) < this.maxOffset / 2){//返回原位
            var time = Math.abs(this.offset) / this.maxOffset * 0.3;
            this.backEvent(time);
        }else if(this.offset > 0){//向右移动
            var time = (this.maxOffset - this.offset) / this.maxOffset * 0.3;
            this.clickRight("",time);
        }else{//向左移动
            var time = (this.maxOffset + this.offset) / this.maxOffset * 0.3;
            this.clickLeft("",time);
        }
        this.starPos = 0;
        this.offset = 0;
    },

    clickLeft:function(event,time){
        if(!this.canTouch) return;
        if(this.inTouch)    return;
        if(time === 0){
            this.changeLeftNode();
            this.resetNode();
            return;
        }
        time = time?time:0.3;
        this.inAuto = true;
        var cb = cc.callFunc(function(){
            this.resetNode();
            this.inAuto = false;
        },this);
        this.allIsLands[1].zIndex --;
        this.allIsLands[3].zIndex ++;
        this.doAction(this.allIsLands[0],time,this.alllandPos[1],0.6,cb);//1向左
        this.doAction(this.allIsLands[1],time,this.alllandPos[2],0.4);//2向左
        this.doAction(this.allIsLands[2],time,this.alllandPos[3],0.6);//3向左
        this.doAction(this.allIsLands[3],time,this.alllandPos[0],1);//4向左
        this.changeLeftNode();
    },

    clickRight:function(event,time){
        if(!this.canTouch) return;
        if(this.inTouch)    return;
        if(time === 0){
            this.changeRightNode();
            this.resetNode();
            return;
        }
        time = time?time:0.3;
        this.inAuto = true;
        var cb = cc.callFunc(function(){
            this.resetNode();
            this.inAuto = false;
        },this);
        this.allIsLands[1].zIndex ++;
        this.allIsLands[3].zIndex --;
        this.doAction(this.allIsLands[0],time,this.alllandPos[3],0.6,cb);//1向右
        this.doAction(this.allIsLands[1],time,this.alllandPos[0],1);//2向右
        this.doAction(this.allIsLands[2],time,this.alllandPos[1],0.6);//3向右
        this.doAction(this.allIsLands[3],time,this.alllandPos[2],0.4);//4向右
        this.changeRightNode();
    },

    backEvent:function (time) {
        if(!this.canTouch) return;
        if(time === 0){
            this.resetNode();
            return;
        }
        time = time?time:0.3;
        this.inAuto = true;
        var cb = cc.callFunc(function(){
            this.resetNode();
            this.inAuto = false;
        },this);
        this.doAction(this.allIsLands[0],time,this.alllandPos[0],1,cb);//1回原位
        this.doAction(this.allIsLands[1],time,this.alllandPos[1],0.6);//2回原位
        this.doAction(this.allIsLands[2],time,this.alllandPos[2],0.4);//3回原位
        this.doAction(this.allIsLands[3],time,this.alllandPos[3],0.6);//4回原位
    },

    doAction:function (node,time,toPos,toScale,cb) {
        var oneLeftMove = cc.moveTo(time,toPos);
        var oneLeftScale = cc.scaleTo(time,toScale);
        var oneLeftFinsh = cb?cb:cc.callFunc(function(){},this);
        var oneLeftAction = cc.spawn(oneLeftMove,oneLeftScale);
        node.runAction(cc.sequence(oneLeftAction,oneLeftFinsh));
    },

    openRule:function(){
        if(!this.allIsLands[0].tid) return;
        uiManager.openUI(uiManager.UIID.ACT_DRAWCARD_RULE,this.allIsLands[0].tid);
    },

    changeLeftNode:function(){
       var temp = this.allIsLands[0];
       this.allIsLands[0] = this.allIsLands[3];
       this.allIsLands[3] = this.allIsLands[2];
       this.allIsLands[2] = this.allIsLands[1];
       this.allIsLands[1] = temp;
       // this.resetNode();
    },

    changeRightNode:function(){
        var temp = this.allIsLands[3];
        this.allIsLands[3] = this.allIsLands[0];
        this.allIsLands[0] = this.allIsLands[1];
        this.allIsLands[1] = this.allIsLands[2];
        this.allIsLands[2] = temp;
        // this.resetNode();
    },

    resetNode:function (firstTid) {
        if(firstTid){
            this.firstTid = firstTid;
        }
        for (var i = 0 , len = this.allIsLands.length; i < len; i++) {
            var obj = this.allIsLands[i];
            obj.color = i === 0?uiColor.white:uiColor.gray;
            obj.getChildByName("spine").color = i === 0?uiColor.white:uiColor.gray;
            cc.find("namePlate", obj).active = i === 0;
            obj.position = this.alllandPos[i];
            obj.zIndex = 1000 - obj.y;
            if(i === 0){
                obj.scale = 1;
            }else if(i === 2){
                obj.scale = 0.4;
            }else{
                obj.scale = 0.6;
            }
        }
        var tid = this.allIsLands[0].tid;
        if(!tid)    return;
        this.node150.active = tid !== this.firstTid;
        this.node300.active = tid === this.firstTid;
        let firstFamilyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,tid);
        cc.find("namePlate/label", this.allIsLands[0]).getComponent(cc.Label).string = uiLang.getConfigTxt(firstFamilyConfig[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        uiResMgr.loadMonTypeIcon(firstFamilyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type],cc.find("namePlate/jobIcon", this.allIsLands[0]),"monTypeEx");
    },

    moveOne:function(){
        this.allIsLands[0].position = cc.v2(this.offset,-90 + Math.abs(this.offset) * 90 / 250);
        this.allIsLands[0].scale = 1 - 0.4 * Math.abs(this.offset) / 250;
        this.allIsLands[0].zIndex = 1000 - this.allIsLands[0].y;
    },

    moveTwo:function(){
        var y = this.offset>=0?-90:40;
        this.allIsLands[1].position = cc.v2(-250 + Math.abs(this.offset),Math.abs(this.offset) * y / 250);
        var z = this.offset>=0?0.4:0.2;
        this.allIsLands[1].scale = 0.6 + z * this.offset / 250;
        this.allIsLands[1].zIndex = 1000 - this.allIsLands[1].y;
    },

    moveTree:function(){
        this.allIsLands[2].position = cc.v2(-this.offset,40 - Math.abs(this.offset) * 40 / 250);
        this.allIsLands[2].scale = 0.4 + 0.2 * Math.abs(this.offset) / 250;
        this.allIsLands[2].zIndex = 1000 - this.allIsLands[2].y;
    },

    moveFour:function(){
        var y = this.offset>=0?40:-90;
        this.allIsLands[3].position = cc.v2(250 - Math.abs(this.offset),Math.abs(this.offset) * y / 250);
        var z = this.offset>=0?0.2:0.4;
        this.allIsLands[3].scale = 0.6 - z * this.offset / 250;
        this.allIsLands[3].zIndex = this.offset>=0?2:3;
        this.allIsLands[3].zIndex = 1000 -  this.allIsLands[3].y;
    },
    // update (dt) {

    // },
});
