var panel = require("panel");
var toggleHelper = require('toggleHelper');
cc.Class({
    extends: panel,

    properties: {
        toggleHelperJs:toggleHelper,
        chatItem:cc.Prefab,
        inputBox:cc.EditBox,
        emoticon:cc.SpriteAtlas,
        emoticonPrefab:cc.Prefab,
        testNode:cc.Node,
        sendBtn:cc.Button,
        sendBtnLabel:cc.Label,
        labelHeight:40,
        panelAni:cc.Animation,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.testNode.active = false;
        this.registerEvent();
        this.id = 0;
        this.enmoticonKeys = Object.keys(this.emoticon._spriteFrames);
        this.testRichText = this.testNode.getComponent(cc.RichText);
        uiResMgr.createPrefabPool(this.chatItem,5);
        this.initEmotion();
        this.needMsg = true;
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshChat", this.refreshChat.bind(this)],
            ["pushChat",this.pushChat.bind(this)],
            ["refreshSendTime",this.refreshSendTime.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickEmotion", this.clickEmotion.bind(this)],
            ["clickName", this.clickName.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    switchTag:function(param,idx){
        this.UIState = idx;
        if(this.UIState !== constant.ChatInfoType.PRIVATE){
            this.sendUID = 0;
            this.sendName = "";
            this.sendLen = 0;
            this.lastString = "";
            this.inputBox.string = "";
        }
        this.refresh();
    },

    open:function(uiState,data){
        this.panelAni.play("chatShow");
        this.UIState = uiState === undefined?constant.ChatInfoType.WORLD:uiState;
        this.sendUID = this.UIState === constant.ChatInfoType.PRIVATE?data.UserID:0;
        this.sendName = this.UIState === constant.ChatInfoType.PRIVATE?data.Name:"";
        this.inputBox.string = this.UIState === constant.ChatInfoType.PRIVATE?"to_" + data.Name + ":":"";
        this.lastString =this.inputBox.string;
        this.sendLen = this.inputBox.string.length;
        this.inputBox.placeholder = uiLang.get("placeholder");
        this.toggleHelperJs.setIdxToggleCheck(this.UIState);
        this.refresh();
        this.refreshSendTime();
    },

    refresh:function(){
        this.refreshChat();
        this.widget("chatPanel/frame/boxFrame1").active = false;
        this.widget("chatPanel/frame/shade").active = false;
    },

    refreshSendTime:function () {
        this.nextChatTime = Number(this.chatLogic.nextChatTime);
        var offset = this.nextChatTime - this.timeLogic.now();
        if(offset < 0){
            this.sendBtn.interactable = true;
            this.sendBtnLabel.string = uiLang.getMessage(this.node.name,"sendBtn");
            this.nextChatTime = 0;
            return;
        }else{
            this.time = 0;
            this.sendBtnLabel.string = Math.ceil(offset) + "s";
            this.sendBtn.interactable = false;
        }
    },
    initEmotion:function(){
        var list = [];
        for (var obj in this.emoticon._spriteFrames) {
            if (this.emoticon._spriteFrames.hasOwnProperty(obj)) {
                list.push(this.emoticon._spriteFrames[obj]);
            }
        }
        var refreshData = {
            content:this.widget("chatPanel/frame/boxFrame1/scrollView/view/content"),
            list:list,
            prefab:this.emoticonPrefab
        }
        uiManager.refreshView(refreshData);
    },

    close:function () {
        this.panelAni.play("chatHide");
        if(this.node.active){
            setTimeout(function () {
                this.node.active = false;
            }.bind(this),200);
        }
    },

    closeForBind:function(){
        this.panelAni.play("chatHide");
        if(this.node.active){
            setTimeout(function () {
                this.node.active = false;
            }.bind(this),200);
        }

    },
    refreshChat:function(){
        var data = this.chatLogic.getChatData(this.UIState);
        var list = [];
        for (var i = 0 , len = data.length; i < len; i++) {
            var obj = data[i];
            obj.Content = rText.formatEmoticon(obj.Content,this.enmoticonKeys);
            this.id ++;
            obj.ID = this.id;
            if(!obj.Name){
                obj.Name = this.userLogic.getBaseData(this.userLogic.Type.Name)
            }
            var info = {
                height:this.getItemHeight(obj.Content,obj.Name),
                data:obj,
            }
            list.push(info);
        }
        var viewData = {
            totalCount:list.length,
            spacing:10
        };
        this.widget("chatPanel/frame/scrollView").getComponent("chatView").init(this.chatItem,constant.ChatPrefabName.DEFAULT,viewData,list);
    },
    pushChat:function(list){
        var newList =[];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(obj.Type !== this.UIState)   continue;
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
            newList.push(info);
        }
        if(newList.length <= 0) return;
        this.widget("chatPanel/frame/scrollView").getComponent("chatView").updateItemData(newList);
    },

    getItemHeight:function(str,name){//TODO 获取准确的行数
        // str = name + "：" + str;
        this.testRichText.string  = str;
        return  this.testNode.height + 60;
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
        // var rowNum = Math.ceil(realLength/42);
        // var addSpace = rowNum > 1 ? 0 : 0;
        // return rowNum * 34 + addSpace;
    },
    sendMessage:function(event){
        if(this.nextChatTime)  return;
        if(this.UIState === constant.ChatInfoType.PRIVATE&&this.sendLen === 0){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"noSendUid"));
            return;
        }
        if(this.inputBox.string === "" || (this.UIState === constant.ChatInfoType.PRIVATE && this.inputBox.string.length <= this.sendLen)){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"noEmpty"));
            setTimeout(function(){
                this.inputBox.string = this.inputBox.string.slice(0,this.sendLen);
            }.bind(this),50);
            return;
        }
        if(this.UIState === constant.ChatInfoType.SYS){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"noSYS"));
            return;
        }

        if(this.userLogic.getBaseData(this.userLogic.Type.ChangeNameCost) === 0){//未改名
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"noChangeName"));
            return;
        }
        var cost  = this.chatLogic.cost;
        var myDia = this.userLogic.getBaseData(this.userLogic.Type.Diamond)
        if(cost && cost.Num > myDia){
            uiManager.tipDiamondLess();
            return;
        }

        var callback = function () {
            var str = this.inputBox.string;
            var newStr = "";
            newStr = str.slice(0,this.sendLen);
            str = str.slice(this.sendLen);
            this.chatLogic.req_Chat_Send(this.sendUID,str,this.sendName);
            // var data = {
            //     Type:this.UIState,
            //     Time:this.timeLogic.now(),
            //     Uid:this.userLogic.getBaseData(this.userLogic.Type.UserID),
            //     Name:this.sendName,
            //     Content:str
            // }
            // this.chatLogic.onResp_Chat_Send({"ChatInfos":[data]},"",true);
            setTimeout(function(){
                this.inputBox.string = newStr;
            }.bind(this),50);
        }.bind(this);
        if(this.needMsg){
            this.needMsg = false;
            var str = uiLang.getMessage(this.node.name,"send") + cost.Num + rText.getMsgCurrency(cost.Type) + uiLang.getMessage(this.node.name,"sendSure");
            uiManager.msgDefault(str,callback);
        }else{
            callback();
        }

    },

    openEmotion:function(){
        this.widget("chatPanel/frame/boxFrame1").active = !this.widget("chatPanel/frame/boxFrame1").active;
        this.widget("chatPanel/frame/shade").active = this.widget("chatPanel/frame/boxFrame1").active;
    },

    clickEmotion:function(event){
        event.stopPropagation();
        var idx = event.getUserData();
        if(this.inputBox.string.length <= this.inputBox.maxLength - 6){
            this.inputBox.string += "<"+ idx +">";
        }
        this.openEmotion();
    },
    //点击玩家姓名，跳转到私聊界面
    clickName:function(event){
        event.stopPropagation();
        return;//屏蔽私聊
        var data = event.getUserData();
        this.sendUID = data.Uid;
        this.sendName = data.Name;
        this.inputBox.string ="to_" + data.Name + ":";
        this.lastString = this.inputBox.string;
        this.sendLen = this.inputBox.string.length;
        if(this.UIState !== constant.ChatInfoType.PRIVATE){
            this.UIState = constant.ChatInfoType.PRIVATE;
            this.toggleHelperJs.setIdxToggleCheck(this.UIState);
            this.refresh();
        }
    },
    //点击输入框，如果不是浏览器平台，则打开横屏输入框
    editBegin:function (event) {
        if(cc.sys.os !== cc.sys.OS_WINDOWS){
            uiManager.openUI(uiManager.UIID.EDIT_PANEL,this.inputBox);
        }
    },

    editChange:function(event){
        if(this.inputBox.string.length < this.sendLen){
            this.inputBox.string = this.lastString;
            return;
        }
        this.lastString = this.inputBox.string;
    },

    update:function(dt) {
        if(!this.nextChatTime)  return;
        this.time += dt;
        if(this.time >= 1){
            this.time -= 1;
            var offset = this.nextChatTime - this.timeLogic.now();
            if(offset > 0){
                this.sendBtnLabel.string = Math.ceil(offset) + "s";
                this.sendBtn.interactable = false;
            }else{
                this.nextChatTime = 0;
                this.sendBtnLabel.string = uiLang.getMessage(this.node.name,"sendBtn");
                this.sendBtn.interactable = true;
            }
        }
    },
});
