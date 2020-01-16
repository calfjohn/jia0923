var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        item:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.actionList = [];
        this.isPlay = false;
        this.diamonList = [];
        this.resetList(jsonTables.CONFIG_GAMEBASE.DiamondIcon,this.diamonList);

        this.goldList = [];
        this.resetList(jsonTables.CONFIG_GAMEBASE.GoldIcons,this.goldList);

        this.expList = [];
        this.resetList(jsonTables.CONFIG_GAMEBASE.ExpIcon,this.expList);
    },

    resetList:function(jsonKey,list){
        var config = jsonTables.getGameBaseValue(jsonKey);
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i];
            var strs = obj.split("#");
            list.push({max:Number(strs[0]),count:Number(strs[1])});
        }
    },

    getCount:function(type,curCount){
        switch (type) {
            case constant.ItemType.GOLD:
                return this._getCount(this.goldList,curCount);
            case constant.ItemType.DIAMOND:
                return this._getCount(this.diamonList,curCount);
            case constant.ItemType.EXP:
                return this._getCount(this.expList,curCount);
            default:
                return 1;
        }
    },

    _getCount:function(list,curCount){
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            if (curCount < obj.max) {
                if (list[i-1]) {
                    if (i === 0) {
                        return list[0].count
                    }
                    return list[i-1].count
                }else {
                    return 1;
                }
            }
        }
        return list[list.length -1].count;
    },

    open:function(rewardInfo,toggle,initPos,flyNow){
        this.actionList.push({rewardInfo:rewardInfo,toggle:toggle,initPos:initPos});
        if(flyNow){//马上飞
            this.popData();
            return;
        }
        if (!this.isPlay) {
            this.isPlay = true;
            this.scheduleOnce(function(){
                this.popData();
            },0);
        }
    },

    popData:function(){
        if (this.actionList.length === 0) {
            this.node.removeAllChildren();
            this.isPlay = false;
            return;
        }
        var popDataInfo = this.actionList.shift();
        var rewardInfo = popDataInfo.rewardInfo;
        var toggle = popDataInfo.toggle;
        var endNode = uiManager.getFlyNode(rewardInfo.Type);
        if (!endNode){
            this.popData();
            // if(toggle){
                // toggle.active = false;
            // }
            return cc.error("节点都不存在  飞个锤子",rewardInfo);
         }
        var initPos =toggle? toggle.convertToWorldSpaceAR(cc.v2(0,0)):popDataInfo.initPos; //kf.getPositionInNode(toggle,this.node);
        var posEnd = endNode.convertToWorldSpaceAR(cc.v2(0,0));//kf.getPositionInNode(endNode,this.node);
        // if(toggle){
            // toggle.active = false;
        // }
        var len = this.getCount(rewardInfo.Type,rewardInfo.Num);
        var count = 0;
        this.scheduleOnce(function(){
            this.clientEvent.dispatchEvent("showFlyEffectAni",rewardInfo.Type);
        },0.6);
        var doneCb = function () {
            if(count === 0){
                this.userLogic.setLockStatus(false);//解锁界面刷新
                this.clientEvent.dispatchEvent("setLockExp",false);
            }
            count++;
            if (count === len) {
                this.scheduleOnce(function(){
                    this.popData();
                },0);
            }
        };
        var list = [];//spriteFrame 图片纹理;  initPos 初始位置;  posAround 移动到最近的范围; posEnd 结束位置;  cb 回调函数;
        for (var i = 0 ; i <  len; i++) {
            var limit = jsonTables.randomNum(60,150);
            var randX = jsonTables.randomNum(-limit,limit);
            var randY = jsonTables.randomNum(-limit,limit);
            var posAround = cc.v2(initPos.x + randX , initPos.y + randY);
            var data = {type:rewardInfo.Type,baseID:rewardInfo.BaseID,initPos:initPos,posAround:posAround,posEnd:posEnd,cb:doneCb.bind(this)}
            list.push(data);
        }
        var msgItem;
        for(var i = 0; i < list.length; i++) {
            msgItem =cc.instantiate(this.item);
            msgItem.parent = this.node;
            var script = msgItem.getComponent("flyEffectItem");
            if (script) {
                script.init(i, list[i]);
            }
        }
        // var refreshData = {
        //     content:this.node,
        //     list:list,
        //     prefab:this.item
        // }
        // uiManager.refreshView(refreshData);
        this.isPlay = true;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
