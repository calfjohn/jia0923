var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        timeNode:cc.Node,
        nameNode:cc.Node,
        contentNode:cc.Node,
        labelNode:cc.Node,
        headNode:cc.Node,
        channelNode:cc.Node,
        bottomNode:cc.Node,
        bottomBg:cc.Node,
        testContentNode:cc.Node,
        headSpriteNode:cc.Node
    },
    onLoad:function(){
        this.registerEvent();
        this.ID = -1;

        this.initContentHeight = 30;
        // var enmoticonFrame = this.contentNode.getComponent(cc.RichText).imageAtlas._spriteFrames;
        // this.enmoticonKeys = Object.keys(enmoticonFrame);
    },

    init:function (idx,data){
        if(data.ID ===this.ID)  return;
        this.ID = data.ID;
        this.funData = [];
        // this.contentNode.active = false;
        var info ={
            type :constant.RTextFuncType.NAME,
            data:data
        }
        this.funData.push(info);
        var isMe = this.userLogic.isMe(data.Uid);
        if(isMe){
            data.Name = this.userLogic.getBaseData(this.userLogic.Type.Name);
        }
        this.nameNode.anchorX = isMe?1:0;
        this.contentNode.anchorX = isMe?1:0;
        this.channelNode.zIndex = isMe?3:2;
        this.labelNode.anchorX = isMe?1:0;
        this.headNode.zIndex = isMe?5:0;
        this.nameNode.zIndex = isMe?2:3;
        this.contentNode.x = isMe?this.node.width - 115: 115;
        this.bottomNode.x = isMe?this.node.width - 100: 100;
        this.bottomNode.scaleX = isMe? -1:1;
        this.labelNode.x = isMe?this.node.width: 0;
        var headIcon = data.Icon ? data.Icon : 1;
        // this.addRTextFunc(constant.RTextFuncType.NAME,data.Uid,cb.bind(this));
        uiResMgr.loadPlayerHead(headIcon,"",this.headSpriteNode);
        var str = "";
        var nameStr = "";
        if(data.Type === constant.ChatInfoType.PRIVATE){
            str = isMe?rText.setColor("to_" + data.Name + ":",uiColor.Str.player) + "["+ this.timeLogic.getChatTime(data.Time) +"]":"["+ this.timeLogic.getChatTime(data.Time) +"]" +rText.setColor("from_" + data.Name + ":",uiColor.Str.player);
            nameStr = isMe?str: rText.addFuncStr(str,"rTextFunc" + (this.funData.length - 1));
        }else if(data.Type === constant.ChatInfoType.SYS){
            nameStr = "["+ this.timeLogic.getChatTime(data.Time) +"]" + rText.setColor(data.Name + ":",uiColor.Str.sys);
        }else{
            var color = isMe?uiColor.Str.player:uiColor.Str.other;
            str = rText.setColor(data.Name,color);
            // str = isMe? ":" + str : str + ":";
            nameStr = isMe? str: rText.addFuncStr(str,"rTextFunc" + (this.funData.length - 1));
            this.timeNode.getComponent(cc.RichText).string = "<b>世界</b>";
        }
        this.nameNode.getComponent(cc.RichText).string = "<b>" +  nameStr + "</b>";
        this.contentNode.getComponent(cc.RichText).string =data.Content;
        this.nameNode.getComponent("richTextUtil").reigeisterFunc(this.funData.length - 1);
        this.bottomBg.height = this.contentNode.height + 2 * 5;
        if(this.contentNode.height === this.initContentHeight){
            this.testContentNode.getComponent(cc.RichText).string =data.Content;
            this.bottomBg.width = this.testContentNode.width + 2 * 10;
        }else{
            this.bottomBg.width = this.contentNode.width + 2 * 10;
        }
        this.contentNode.getComponent(cc.RichText).horizontalAlign = isMe && this.contentNode.height === this.initContentHeight? cc.Label.HorizontalAlign.RIGHT : cc.Label.HorizontalAlign.LEFT;
        this.infoData = data;
    },
    registerEvent: function () {
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    clickLabel:function(i){
        var data = this.funData[i];
        if(data.data.Uid === 0)  return;//系统公告
        switch (data.type) {
            case constant.RTextFuncType.NAME://点击姓名
                var ev = new cc.Event.EventCustom('clickName', true);
                ev.setUserData(data.data);
                this.node.dispatchEvent(ev);
                break;
            default:
        }
    },

    clickHead:function () {
        if(this.userLogic.isMe(this.infoData.Uid))   return;
        uiManager.openUI(uiManager.UIID.INFO_UI,this.infoData);
    },

    clickItem:function(event){
        event.stopPropagation();
        var idx = event.getUserData();
        this.clickLabel(idx);
    },




    // update (dt) {},
});
