var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardPrefab:cc.Prefab,
        newYearNode:cc.Node,
        initBoxPos:cc.Vec2,
    },
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.ani = this.widget("openBoxAni/box").getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED,this.onFinished,this);
        this.newYearAni = this.newYearNode.getComponent(cc.Animation);
        this.newYearAni.on(constant.AnimationState.FINISHED,this.onNewYearFinished,this);
        this.rowMax = 5;//每行最多5种奖励
        this.rewardHeight = this.rewardPrefab.data.height;
        this.intervar = 20;//每行之间得间隔
        this.initModule();
        this.contentHeight = this.rewardContent.height;
        this.contentWidth = this.rewardContent.width;
        this.initBoxPos = this.widget("openBoxAni/box").position;
    },
    initModule:function(){
        this.rewardContent = this.widget("openBoxAni/box/reward");
    },
    open:function(rewards,boxID,cb,copyNode) {
        this.newYearNode.active = false;
        this.widget("openBoxAni/closeNode").active = false;
        cb = cb || function () {};
        this.cb = cb;
        this.boxID = boxID?boxID:1001;
        this.widget("openBoxAni/box/box001").opacity = 255;
        this.widget("openBoxAni/box/box001").active = false;
        this.widget("openBoxAni/box/box000").active = false;
        this.widget("openBoxAni/box/box002").active = false;
        var cb1 = function () {
            this.widget("openBoxAni/box/box001").active = true;
        }.bind(this);
        var cb2 = function () {
            this.widget("openBoxAni/box/box000").active = true;
        }.bind(this);
        var cb3 = function () {
            this.widget("openBoxAni/box/box002").active = true;
        }.bind(this);
        uiResMgr.loadOpenTBox(this.boxID,this.widget("openBoxAni/box/box001"),cb1);
        uiResMgr.loadOpenBBox(this.boxID,this.widget("openBoxAni/box/box000"),cb2);
        uiResMgr.loadLockTreasureBox(this.boxID,this.widget("openBoxAni/box/box002"),cb3);
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.OPENBOX);
        this.clickEnable = false;
        var refreshData = {
            content:this.rewardContent,
            list:rewards,
            prefab:this.rewardPrefab
        }
        uiManager.refreshView(refreshData);
        for (var i = 0 , len = this.rewardContent.children.length; i < len; i++) {
            var obj = this.rewardContent.children[i];
            obj.scale = 0;
            obj.position = cc.v2(0,0);
        }
        var allNum = this.rewardContent.children.length;
        var lastX = allNum % this.rowMax;//求余
        this.allRow =lastX? Math.floor(allNum / this.rowMax) + 1:Math.floor(allNum / this.rowMax);//总得多少行
        this.lastCol = lastX?lastX:5;//最后一行得个数
        this.ani.stop();
        if(copyNode){//需要播前置动画
            this.widget("openBoxAni/box").position = kf.getPositionInNode(copyNode,this.node.parent);
            this.widget("openBoxAni/box").scale = copyNode.scale;
            var spawn = cc.spawn(cc.moveTo(0.5,this.initBoxPos),cc.scaleTo(0.5,1));
            var callfunc = cc.callFunc(function(){
                this.ani.play("box");
            }, this);
            var seq = cc.sequence(spawn,callfunc);
            this.widget("openBoxAni/box").runAction(seq);
        }else{
            this.widget("openBoxAni/box").position = this.initBoxPos;
            this.ani.play("box");
        }
    },
    onNewYearFinished:function (event) {
        if (event !== constant.AnimationState.FINISHED) return;
        this.widget("openBoxAni/closeNode").active = true;
    },
    onFinished:function(event,param){
        if (event !== constant.AnimationState.FINISHED) return;
        if(param.name === "box"){
            this.ani.play("box1");
            this.playIdx = 0;//当前飞的孩子节点的下标
            this.playFly();
            this.clickEnable = true;
        }else if(param.name === "boxDis"){
            uiManager.closeUI(uiManager.UIID.OPENBOXANI);
        }
    },

    closeClick:function(){
        this.newYearNode.active = false;
        this.ani.play("boxDis");
        this.widget("openBoxAni/closeNode").active = false;
    },

    playFly:function(){
        if(!this.rewardContent.children[this.playIdx]){//没有奖励了，动画播完了
            // this.newYearNode.active = true;
            // this.newYearAni.play();
            this.clickEnable = false;
            if(this.boxID === "999" || this.boxID === 999){
                this.newYearNode.active = true;
                this.newYearAni.play();
            }else{
                // this.clickEnable = false;
                this.widget("openBoxAni/closeNode").active = true;
            }
            return;
        }
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.REWARDFLY);
        this.flyNode = this.rewardContent.children[this.playIdx];
        this.toPos = this.getPosByIdx(this.playIdx + 1);
        var spawn = cc.spawn(cc.moveTo(0.3,this.toPos), cc.scaleTo(0.3,1));//移向目标，边移动边拉伸
        var func=function(){
            this.playIdx ++;
            this.flyNode.stopAllActions();
            this.flyNode.getComponent(cc.Animation).play("rewardBoom");
            this.playFly();
        }.bind(this);
        var funcAction=cc.callFunc(func);
        this.flyNode.runAction(cc.sequence(spawn,funcAction));
    },
    //获取自己需要飞向得位置
    getPosByIdx:function(idx){
        var lastX = idx % this.rowMax;//求余
        var idxRow = lastX? Math.floor(idx / this.rowMax) + 1:Math.floor(idx / this.rowMax);//我在第几行
        var idxCol = lastX?lastX:5;//我在最后一行的哪一列
        var pos = cc.v2(0,0);
        pos.y = this.contentHeight * 0.4 - (this.intervar + this.rewardHeight) * (idxRow);
        var colNum = idxRow === this.allRow?this.lastCol:this.rowMax;
        pos.x = -this.contentWidth * 0.5 + (this.contentWidth / (colNum + 1)) * idxCol;
        return pos;
    },
    clickEvent:function(event){
        if(!this.clickEnable)  return;
        this.flyNode.stopAllActions();
        this.flyNode.position = this.toPos;
        this.flyNode.scale = 1;
        this.flyNode.getComponent(cc.Animation).play("rewardBoom");
        this.playIdx ++;
        this.playFly();
    },
    close:function(){
        this.node.active = false;
        var cb = this.cb;
        this.cb = null;
        this.cardLogic.playFamily(cb);
    },
    // update (dt) {},
});
