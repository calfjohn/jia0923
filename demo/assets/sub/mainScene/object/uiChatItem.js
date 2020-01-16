var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        timeNode:cc.Node,
        nameNode:cc.Node,
        contentNode:cc.Node,
        labelNode:cc.Node,
    },
    onLoad:function(){
        this.registerEvent();
        this.nameNode.zIndex = 2;
        this.nameHeight = this.nameNode.height;
        this.ID = -1;
        // var enmoticonFrame = this.contentNode.getComponent(cc.RichText).imageAtlas._spriteFrames;
        // this.enmoticonKeys = Object.keys(enmoticonFrame);
    },

    init:function (idx,data){
        if(data.ID ===this.ID)  return;
        this.ID = data.ID;
        this.funData = [];
        // this.contentNode.getComponent(cc.RichText).string = data.Content;
        this.contentNode.active = false;
        var info ={
            type :constant.RTextFuncType.NAME,
            data:data
        }
        this.funData.push(info);
        var isMe = this.userLogic.isMe(data.Uid);
        if(isMe){
            data.Name = this.userLogic.getBaseData(this.userLogic.Type.Name)
        }
        // isMe = false;
        // this.nameNode.anchorX = isMe?1:0;
        // this.timeNode.anchorX = isMe?1:0;
        // this.timeNode.zIndex = isMe?3:1;
        // this.labelNode.anchorX = isMe?1:0;
        // this.labelNode.x = isMe?this.node.width:0;
        // this.contentNode.getComponent(cc.RichText).horizontalAlign = isMe && this.contentNode.height === this.nameNode.height? cc.Label.HorizontalAlign.RIGHT : cc.Label.HorizontalAlign.LEFT;
        // this.addRTextFunc(constant.RTextFuncType.NAME,data.Uid,cb.bind(this));
        var str = "";
        var nameStr = "";
        if(data.Type === constant.ChatInfoType.PRIVATE){
            str = isMe?rText.setColor("to_" + data.Name + ":",uiColor.Str.player) + "["+ this.timeLogic.getChatTime(data.Time) +"]":"["+ this.timeLogic.getChatTime(data.Time) +"]" +rText.setColor("from_" + data.Name + ":",uiColor.Str.player);
            nameStr = isMe?str: rText.addFuncStr(str,"rTextFunc" + (this.funData.length - 1));
        }else if(data.Type === constant.ChatInfoType.SYS){
            nameStr = "["+ this.timeLogic.getChatTime(data.Time) +"]" + rText.setColor(data.Name + ":",uiColor.Str.sys);
        }else{
            var color = isMe?uiColor.Str.player:uiColor.Str.other;
            str ="<u>" + rText.setColor(data.Name,color)  + "</u>" + "：" ;
            nameStr = isMe? str: rText.addFuncStr(str,"rTextFunc" + (this.funData.length - 1));
            this.timeNode.getComponent(cc.RichText).string = "<b>[世界]</b>";
        }
        this.nameNode.getComponent(cc.RichText).string = "<b>" +  nameStr + data.Content + "</b>";
        this.nameNode.getComponent("richTextUtil").reigeisterFunc(this.funData.length - 1);

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

    clickItem:function(event){
        event.stopPropagation();
        var idx = event.getUserData();
        this.clickLabel(idx);
    },




    // update (dt) {},
});
