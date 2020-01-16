var panel = require("panel");
var fightBgNodeComp = require('fightBgNode');
cc.Class({
    extends: panel,

    properties: {
        fightBgNodeComp:fightBgNodeComp,
        sandBoxPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.registerEvent();
        this.initNodes();
    },

    initNodes(){
        this.sandNode = this.widget('miniScene/sandNode');
    },

    registerEvent: function () {

        var registerHandler = [
            ["resetPveFight", this.resetPveFight.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["newCreator", this.newCreator.bind(this)],
            ["newCreatorFromSpecail", this.newCreatorFromSpecail.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);

    },

    resetPveFight:function(){
        this.enterScene();
    },

    /** 来一打我发怪物 */
    newCreator:function(event){
        event.stopPropagation();
        var card = event.getUserData()
        var scrore = 0;
        if (Object.prototype.toString.call(card)==='[object Array]') {
            for (var i = 0; i < card.length; i++) {
                scrore += this._newAmonster(card[i]);
            }
        }else {
            scrore += this._newAmonster(card);
        }
        var sandBox = this.sandNode.getInstance(this.sandBoxPrefab,true);
        var sandBoxJs = sandBox.getComponent(this.sandBoxPrefab.name);
        sandBoxJs.showFloatKill(scrore);
    },
    _newAmonster:function(card){
        var config =  jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,card.getConfigTid());
        var scrore = this.miniGameLogic.getCreateScore(config[jsonTables.CONFIG_MONSTER.FamilyID]);
        if (this.miniGameLogic.isInGoldHightActive()){
            scrore = scrore *2;
        }
        this.miniGameLogic.addScrore(scrore);
        var sandBox = this.sandNode.getInstance(this.sandBoxPrefab,true);
        var sandBoxJs = sandBox.getComponent(this.sandBoxPrefab.name);
        var startPos = card.node.convertToWorldSpaceAR(cc.v2(0,0));
        sandBoxJs.showGoldFly(config[jsonTables.CONFIG_MONSTER.FamilyID],startPos,scrore);
        this.sandTableLogic.desrInCreatingCount();
        return scrore;
    },
    newCreatorFromSpecail:function(event){
        event.stopPropagation();
        var list = event.getUserData();
        cc.log(list)
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            this.sandTableLogic.desrInCreatingCount();
        }
    },

    /** 开打了 */
    displayNow:function(){
    },

    closeSandBox:function(){
        this.sandTableLogic.setTouchEnable(false);
        this.miniGameLogic.sandClose();
        cc.log("游戏结束")
    },

    callSandInit:function(){
        this.sandNode.active = true;
        var sandBox = this.sandNode.getInstance(this.sandBoxPrefab,true);
        var sandBoxJs = sandBox.getComponent(this.sandBoxPrefab.name);
        sandBoxJs.init();
    },

    enterScene:function(){
        this.fightLogic.sceneRoot = this;
        this.fightLogic.initFight();
        this.callSandInit();
        this.fightBgNodeComp.resetList();
    },

    ctrlExit:function(){
        var callback = function(){
            var ev = new cc.Event.EventCustom('loadScene', true);
            ev.setUserData({sceneID:constant.SceneID.MAIN,param:[],loadCallBack:function(){
                this.miniGameLogic.checkCallBack();
            }.bind(this),isReleaseLastOne:true});
            this.node.dispatchEvent(ev);
            this.miniGameLogic.sandClose();
        };
        uiManager.msgDefault(uiLang.getMessage(this.node.name,"ctrlExit"),callback.bind(this));

    },

    updateRetainLabel:function(){

    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
