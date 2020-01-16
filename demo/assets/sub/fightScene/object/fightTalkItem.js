var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        bgSps:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        this.id = -9999;
    },

    show:function(bindTarget,tid,cb){
        this.cb = cb;
        this.msgHanderLogic.register(this.id,this);//向内部注册该对象
        this.isActive = true;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BUBBLECELL,tid);
        this.config = kf.clone(config);
        this.bindTarget = bindTarget;
        var idx = this.config[jsonTables.CONFIG_BUBBLECELL.Object] ? 0 : 1;
        this.node.getComponent(cc.Sprite).spriteFrame = this.bgSps[idx];
        this.setPosition(this.bindTarget,this.bindTarget.getSpineHeight());
        if (this.config[jsonTables.CONFIG_BUBBLECELL.Random] === 1) {
            var list = this.config[jsonTables.CONFIG_BUBBLECELL.DesID];
            var randomOne = jsonTables.random(list);
            this.config[jsonTables.CONFIG_BUBBLECELL.DesID] = [randomOne];
        }
        this.showContent();
        this.bindTarget.setBindComp(this);
    },

    setPosition(target,height){
        this.node.position = kf.getPositionInNode(target.node,this.node.parent,target.node.getPosition());
        this.node.y += height;
        var idx = this.config[jsonTables.CONFIG_BUBBLECELL.Object] ? 1 : -1;
        this.node.x += (idx * this.node.width/2);
    },

    showContent:function(){
        if (!this.isActive) return;
        var txtID = this.config[jsonTables.CONFIG_BUBBLECELL.DesID].shift();
        if (!txtID) {
            this.putInPool();
            return;
        }
        this.node.getChildByName("label").getComponent(cc.Label).string = uiLang.getConfigTxt(txtID);
        setTimeout(function () {
            this.showContent();
        }.bind(this), this.config[jsonTables.CONFIG_BUBBLECELL.Time]);
    },

    putInPool:function(){
        this.focecPutInPool();
        var nextID = this.config[jsonTables.CONFIG_BUBBLECELL.Next];
        if (nextID) {
            this.fightTalkLogic.showTalk(nextID,false);
        }else {
            this.fightTalkLogic.showDone();
        }
        var cb = this.cb;
        this.cb = null;
        if (cb) {
            cb();
        }
    },

    focecPutInPool:function(){
        this.isActive = false;
        this.bindTarget.removeBindComp();
        this.msgHanderLogic.release(this.id,this);//向内部注册该对象
        uiResMgr.putInPool(this.node.name,this.node);
    },

    onMessage:function(msg,sender){
        if (msg.msgType === constant.MsgHanderType.WAITE_WAVE) {
            this.forceDone();
        }
    },

    forceDone:function(){
        this.focecPutInPool();
        this.fightTalkLogic.forceDone();
    },

    addPostion:function(addX){
        this.node.x += addX;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
