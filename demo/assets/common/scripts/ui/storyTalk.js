var comTalk = require('comTalk');
var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        playerNode:[cc.Node],
        nameLabel:cc.Label,
        aniNode:cc.Node,
        bgNode:cc.Node,
        comTalkComp:comTalk,
    },
    onLoad:function () {
    },
    /*
    list 指向 一系列的stroycell id
     */
    open:function(list,callBack){
        this.callBack = callBack || function(){};
        this.list = kf.clone(list);
        this.showNext();
    },

    showNext:function(){
        if (this.list.length === 0) {
            this.close();
            var cb = this.callBack;
            this.callBack = null;
            cb();
            return;
        }

        var curID = this.list.shift();
        var data = jsonTables.getJsonTableObj(jsonTables.TABLE.STORYCELL,curID);
        this.aniNode.active = data[jsonTables.CONFIG_STORYCELL.Type] === tb.ANI;
        this.bgNode.active = data[jsonTables.CONFIG_STORYCELL.Type] === tb.DIALOY;
        this.bgNode.parent.active = data[jsonTables.CONFIG_STORYCELL.Type] === tb.DIALOY;
        switch (data[jsonTables.CONFIG_STORYCELL.Type]) {
            case tb.DIALOY:
                this.showTalk(data);
                this.preloadAniPrefab(this.list[0]);
                break;
            case tb.ANI:
                this.showAni(data);
                break;
        }
    },

    showTalk:function(data){
        var node = data[jsonTables.CONFIG_STORYCELL.IsLeft] ? this.playerNode[0]:this.playerNode[1];
        for (var i = 0 , len = this.playerNode.length; i < len; i++) {
            var obj = this.playerNode[i];
            obj.active = obj === node;
        }
        this.bgNode.active = data[jsonTables.CONFIG_STORYCELL.BackgroundRes] !== "-";
        if (data[jsonTables.CONFIG_STORYCELL.BackgroundRes] !== "-") {
            uiResMgr.loadStoryBg(data[jsonTables.CONFIG_STORYCELL.BackgroundRes],this.bgNode);
        }
        node.scaleX = data[jsonTables.CONFIG_STORYCELL.IsMirror] ? -1 :1;
        uiResMgr.loadStoryIcon(data[jsonTables.CONFIG_STORYCELL.DialogRes],node);
        this.nameLabel.string = data[jsonTables.CONFIG_STORYCELL.DialogName] === 0 ? this.userLogic.getBaseData(this.userLogic.Type.Name) : uiLang.getConfigTxt(data[jsonTables.CONFIG_STORYCELL.DialogName]);
        this.talkList = kf.clone(data[jsonTables.CONFIG_STORYCELL.DialogContent]);
        this._showTalk();
    },

    _showTalk:function(){
        if (this.talkList.length === 0) {
            this.showNext();
            return;
        }
        var curID = this.talkList.shift();
        var str = uiLang.getConfigTxt(curID);
        str = str || ("文字没找到啊:"+curID)
        this.comTalkComp.show(str,this._showTalk.bind(this),false);
    },

    showAni:function(data){
        uiResMgr.loadStoryPrefab(data[jsonTables.CONFIG_STORYCELL.PrefabName],function(prefab){
            var node = this.aniNode.getInstance(prefab,true);
            node.active = true;
            node.getComponent(cc.Animation).play(data[jsonTables.CONFIG_STORYCELL.AniName]).once(constant.AnimationState.FINISHED, this._showAni.bind(this));
            this.preloadAniPrefab(this.list[0]);
        }.bind(this));
    },

    _showAni:function(){
        this.aniNode.removeAllChildren();
        this.showNext();
    },

    touchEnd:function(){
        this.comTalkComp.nextStep();
    },

    preloadAniPrefab:function(id){
        if (!id) return;
        var data = jsonTables.getJsonTableObj(jsonTables.TABLE.STORYCELL,id);
        if (!data || data[jsonTables.CONFIG_STORYCELL.Type] !== tb.ANI) return;
        uiResMgr.loadStoryPrefab(data[jsonTables.CONFIG_STORYCELL.PrefabName],function(){});
    },

    jumpBtn:function(){
        var callback = function () {
            this.list = [];
            this.showNext();
        };
        uiManager.msgDefault(uiLang.getMessage(this.node.name,"jump"),callback.bind(this));
    },

    // update (dt) {},
});
