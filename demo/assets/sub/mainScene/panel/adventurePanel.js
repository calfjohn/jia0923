var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        rewardPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initNodes();
        this.registerEvent();
    },
    initNodes:function(){
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshChapter", this.refreshChapter.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    refreshChapter:function(chooseIdx,rewards){
        if (chooseIdx === undefined) return;
        for (var i = 0 , len = 4; i <  len; i++) {
            this.widget('adventurePanel/shrink/btnContent/button'+(i+1)).active = (i+1) === 4;
        }
        var data = this.config["Res"+(chooseIdx+1)+"ult"];
        var str = uiLang.getConfigTxt(data);
        var attrStr = "";
        for (var i = 0 , len = rewards.length; i <  len; i++) {
            var obj = rewards[i];
            if (obj.Type === constant.ItemType.ROLE_ATT) {
                var equipStr = uiLang.getMessage("adventurePanel","attr"+obj.BaseID);
                if (equipStr) {
                    var role = uiLang.getMessage("equip","player");
                    var num = obj.Num;
                    if (obj.BaseID >= 11 && obj.BaseID <= 16) {
                        num = num/10;
                    }
                    if (num > 0) {
                        num = "+"+num;
                        if (obj.BaseID >= 1 && obj.BaseID <= 6) {
                            num = rText.setColor(num,uiColor.adventure.addStr);
                        }
                    }else{
                        if (obj.BaseID >= 1 && obj.BaseID <= 6) {
                            num = rText.setColor(num,uiColor.adventure.desrStr);
                        }
                    }
                    equipStr = equipStr.formatArray([role,num]) + " ";
                    attrStr += equipStr;
                }else {
                    cc.error("没找到对应属性描述",obj.BaseID);
                }
            }
        }
        this.widget("adventurePanel/shrink/layout").active = !!attrStr;
        if (this.widget("adventurePanel/shrink/layout").active) {
            this.widget("adventurePanel/shrink/layout/bg/grow").getComponent(cc.RichText).string = attrStr;
        }

        this.widget('adventurePanel/shrink/showNode/label').getComponent(cc.RichText).string = str;
        this.resetReward(rewards);
        this.widget("adventurePanel/shrink/latticeFrame/comLatticeFrame2/text1").active = true;
    },

    resetReward:function(list){
        var info = [];
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            if (obj.Type !== constant.ItemType.ROLE_ATT) {
                info.push(obj);
            }
        }

        this.widget("adventurePanel/shrink/btnContent/rewardContent").active = info.length !== 0;
        if(!this.widget("adventurePanel/shrink/btnContent/rewardContent").active) return;
        var refreshData = {
            content:this.widget("adventurePanel/shrink/btnContent/rewardContent"),
            list:info,
            prefab:this.rewardPrefab
        };
        uiManager.refreshView(refreshData);
    },

    open:function(tid,id,chapterID){
        this.id = id;
        this.chapterID = chapterID;
        this.tid = tid;
        this.widget("adventurePanel/shrink/layout").active = false;
        this.widget("adventurePanel/shrink/latticeFrame/comLatticeFrame2/text1").active = false;
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.ADVENTURE,tid);
        this.widget('adventurePanel/shrink/btnContent/button4').active = false;
        this.widget("adventurePanel/shrink/btnContent/rewardContent").active = false;
        this.widget('adventurePanel/shrink/latticeFrame/titleFrame/titleLabel').getComponent(cc.Label).string = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_ADVENTURE.Title]);
        this.widget('adventurePanel/shrink/showNode/label').getComponent(cc.RichText).string = uiLang.getConfigTxt(this.config[jsonTables.CONFIG_ADVENTURE.Question]);
        uiResMgr.loadAdventureIcon(this.config[jsonTables.CONFIG_ADVENTURE.InsideIcon],this.widget('adventurePanel/shrink/node'));
        for (var i = 0 , len = 3; i <  len; i++) {
            var data = this.config["Ans"+(i+1)+"wer"];
            this.widget('adventurePanel/shrink/btnContent/button'+(i+1)).active = !!data;
            if (this.widget('adventurePanel/shrink/btnContent/button'+(i+1)).active) {
                this.widget('adventurePanel/shrink/btnContent/button'+(i+1)).getChildByName("label").getComponent(cc.Label).string = uiLang.getConfigTxt(data);
            }
        }
        this.resetReward([]);
    },

    clickBtn:function(_,param){
        var idx = Number(param);
        this.chapterLogic.req_Adventure_Choose(this.id,this.chapterID,this.tid,idx);
    },

});
