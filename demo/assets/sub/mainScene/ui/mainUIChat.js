var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        chatItem:cc.Prefab,
        scrollView:cc.Node,
        emoticon:cc.SpriteAtlas,
        testNode:cc.Node,
        labelHeight:20,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initModule();
        this.registerEvent();
        this.testNode.active = false;
        this.id = 0;
        this.enmoticonKeys = Object.keys(this.emoticon._spriteFrames);
        uiResMgr.createPrefabPool(this.chatItem,3);
    },
    start:function(){
        this.init();
    },

    openChat:function () {
        uiManager.openUI(uiManager.UIID.CHATPANEL,constant.ChatInfoType.WORLD);
    },
    initModule:function(){
        this.scrollCom = this.scrollView.getComponent(cc.ScrollView);
        this.testRichText = this.testNode.getComponent(cc.RichText);
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshChat", this.refreshChat.bind(this)],
            ["pushChat",this.pushChat.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function(){
        this.refreshChat();
    },
    refreshChat:function(){
        var data = this.chatLogic.getAllChat();
        var list = [];
        for (var i = 0 , len = data.length; i < len; i++) {
            var obj = data[i];
            this.id ++;
            obj.ID = this.id;
            if(!obj.Name){
                obj.Name = this.userLogic.getBaseData(this.userLogic.Type.Name)
            }
            obj.Content = rText.formatEmoticon(obj.Content,this.enmoticonKeys);
            var info = {
                height:this.getItemHeight(obj.Content,obj.Name),
                data:obj,
            }
            list.push(info);
        }
        var viewData = {
            totalCount:list.length,
            spacing:4
        };
        this.scrollCom.enabled = true;
        this.scrollView.getComponent("chatView").init(this.chatItem,constant.ChatPrefabName.MINI,viewData,list);
        this.scrollCom.enabled = false;
    },
    pushChat:function(data){
        data[0].Content = rText.formatEmoticon(data[0].Content,this.enmoticonKeys);
        this.id ++;
        data[0].ID = this.id;
        if(!data[0].Name){
            data[0].Name = this.userLogic.getBaseData(this.userLogic.Type.Name)
        }
        var info = {
            height:this.getItemHeight(data[0].Content,data[0].Name),
            data:data[0],
        }
        this.scrollCom.enabled = true;
        this.scrollView.getComponent("chatView").updateItemData([info],true);
        this.scrollCom.enabled = false;
    },
    getItemHeight:function(str){//TODO 获取行数
        str = name + "：" + str;
        this.testRichText.string  = str;
        return  this.testNode.height;
        // str = name + "：" + str;
        // var realLength = 0, len = str.length, charCode = -1;
        // for (var i = 0; i < len; i++) {
        //     charCode = str.charCodeAt(i);
        //     if (charCode >= 0 && charCode <= 128) {//非汉字
        //         realLength += 1;
        //     }else{
        //         realLength += 2;
        //     }
        // }
        //
        // var rowNum = Math.ceil(realLength/40);
        // var addSpace = rowNum > 1 ? 4 : 0;
        // return rowNum * 20 + addSpace;
    },

    // update:function(dt) {
    //     this.chatLogic.update(dt);
    // },
});
