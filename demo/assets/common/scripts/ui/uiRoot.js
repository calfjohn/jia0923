cc.Class({
    extends: cc.Component,
    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function(){
        this.clientEvent = kf.require("basic.clientEvent");
        this.chatLogic = kf.require("logic.chat");
        this.registerMsg();
        this.statusArr = window.newStruct.newMap();
    },
    start:function(){
        // var cb = function(prefab){
        //     this.topHead = this.node.getInstance(prefab,true);
        //     this.topHeadJS = this.topHead.getComponent("topHead");
        //     this.checkNext();
        // };
        // uiManager.loadAsyncPrefab(uiManager.UIID.TOPHEAD,cb.bind(this));
    },
    registerMsg: function () {
      this.registerHandler = [
          ["openPanel",this.openPanel.bind(this),true],
          ["closePanel",this.closePanel.bind(this),true],
          // ["showMainScene",this.resetTopHead.bind(this),true],
      ];
      for(var i = 0; i < this.registerHandler.length; i++){
          var handler = this.registerHandler[i];
          this.clientEvent.registerEvent(handler[0], handler[1]);
      }
    },
    unregisterEvent: function () {
      for(var i = 0; i < this.registerHandler.length; i++){
          var handler = this.registerHandler[i];
          this.clientEvent.unregisterEvent(handler[0], handler[1]);
      }
    },
    onDestroy: function () {
      this.unregisterEvent();
    },

    //每次回到主场景的时候初始化一下
    resetTopHead:function(){
        if (!this.topHeadJS) return;
        this.statusArr = window.newStruct.newMap();
        // var status = uiManager.getCurSceneID() === constant.SceneID.MAIN?constant.TopHeadStatus.SCENE:constant.TopHeadStatus.CLOSE;
        var data = {
            Status:constant.TopHeadStatus.CLOSE,
            Order:1
        }
        this.topHeadJS.setStatus(data);
    },
    openPanel:function(UIID){
        var uiData = uiManager.getUI_RES_MAPPING(UIID);
        if((!this.topHead || !cc.isValid(this.topHead)) && uiData[2] !== constant.TopHeadStatus.CLOSE){
            var prefab = uiResMgr.getResource(uiResMgr.RTYPE.MAIN_PREFAB,"topHead");
            this.topHead = this.node.getInstance(prefab,true);
            this.topHead.active = false;
            this.topHeadJS = this.topHead.getComponent("topHead");
        }
        if(!uiData || !uiData[1])  return;//非全屏

        var data = {
            UIID:UIID,
            Status:uiData[2],
            Order:uiManager.getUI_ORDER(UIID) * 2 + 1
        }
        this.statusArr.addElement(UIID,data);
        if(!this.topHeadJS) return;
        this.checkNext();
    },
    closePanel:function(UIID){
        if(UIID === -1){
            this.resetTopHead();
            return;
        }
        var uiData = uiManager.getUI_RES_MAPPING(UIID);
        if(!uiData || !uiData[1])  return;//非全屏
        this.statusArr.desrElement(UIID);
        if(!this.topHeadJS) return;
        this.checkNext();
    },
    checkNext:function(){
        if(this.statusArr.isEmpty()){
            this.resetTopHead();
        }else{
            this.topHeadJS.setStatus(this.statusArr.getEnd());
        }
    },
    update:function(dt) {
        this.chatLogic.update(dt);
    },
});
