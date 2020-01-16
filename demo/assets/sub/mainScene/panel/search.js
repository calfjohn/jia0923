var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        friendContent:cc.Prefab,
    },
    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.rowNum = 2;
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshFind", this.refreshFind.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    open:function(){
        this.widget("search/frame/editBox").getComponent(cc.EditBox).string = "";
        this.widget("search/frame1/editBox").getComponent(cc.EditBox).string = "";
        this.widget("search/scrollView/view/content").removeAllChildren();
    },
    findByUid:function(event){
        var str = this.widget("search/frame1/editBox").getComponent(cc.EditBox).string;
        if(str === ""){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"eidtUid"));
            return;
        }
        this.friendLogic.req_Friend_Find("",parseInt(str));
    },
    findByName:function(event){
        var str = this.widget("search/frame/editBox").getComponent(cc.EditBox).string;
        if(str === ""){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"eidtName"));
            return;
        }
        this.friendLogic.req_Friend_Find(str,0);
    },
    //排序并处理成2个一个的数组
    sortAndDeal:function(arr,type,content){
        var num = 0;
        var data = [];
        var dataChild = [];
        for (var i = 0 , len = arr.length; i < len; i++) {
            var obj = arr[i];
            var info = {
                info:obj,
                Type:type
            }
            dataChild.push(info);
            num ++;
            if(num === this.rowNum || i === len - 1){
                num = 0;
                data.push(dataChild);
                dataChild = [];
            }
        }
        var viewData = {
            totalCount:data.length,
            spacing:10
        };
        content.getComponent("listView").init(this.friendContent,viewData,data);
    },
    refreshFind:function(list){
        this.sortAndDeal(list,constant.FriendTag.FIND,this.widget("search/scrollView"));
    },
});
