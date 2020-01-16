var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        starSprites:[cc.SpriteFrame],
        itemPrefab:cc.Prefab//
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        uiManager.fitScreen(this.node,true);
        this.registerEvent();
        this.widget("areanFight/shrink/ipx/emojiBox").active = false;
        var list = jsonTables.getJsonTable(jsonTables.TABLE.EXPRESSION);
        var refreshData = {
            content:this.widget('areanFight/shrink/ipx/emojiBox'),
            list:list,
            prefab:this.itemPrefab,
        }
        uiManager.refreshView(refreshData);
    },

    registerEvent: function () {

        var registerHandler = [
            ["areanScroceChange", this.refreshAreanStar.bind(this)],
            ["showAreanEmoj", this.setAreanEmoj.bind(this)]
        ]
        this.registerClientEvent(registerHandler);

        var registerHandler = [
            ["clickEmj", this.clickEmj.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },

    clickEmj:function(event){
        event.stopPropagation();
        var id = event.getUserData();
        this.fightLogic.showEmoj(id,true);
        this.areanLogic.req_Battle_Chat_Send(id + "");
    },

    setStepVisibl:function(active){
        this.widget("areanFight/shrink/opponent").active = active;
    },

    refreshAreanStar:function(){
        this.setStepVisibl(true);
        var info = this.areanLogic.getScroce();
        var _setStart = function (node,count) {
            count = 3 - count;
            for (var i = 0 , len = node.children.length; i <  len; i++) {
                var obj = node.children[i];
                var idx = count >= (i+1) ? 0:1;
                obj.getComponent(cc.Sprite).spriteFrame = this.starSprites[idx];
            }
        }.bind(this);
        var node = this.widget('areanFight/shrink/star/left');
        _setStart(node,info.enmey);
        var node = this.widget('areanFight/shrink/star/right');
        _setStart(node,info.mine);

        var otherStep = this.areanLogic.getOhterStep();
        this.widget("areanFight/shrink/opponent/stepBox").active = otherStep !== 0;
        this.widget("areanFight/shrink/opponent/label").active = otherStep === 0;
        if (otherStep !== 0) {
            this.widget("areanFight/shrink/opponent/stepBox/numberLabel").getComponent(cc.Label).string = otherStep + "/" + this.areanLogic.getStep();
        }
        this.refreshBase(this.widget("areanFight/shrink/leftInfo/country"),this.widget("areanFight/shrink/leftInfo/name"),this.areanLogic.getMineData());
        this.refreshBase(this.widget("areanFight/shrink/rightInfo/country"),this.widget("areanFight/shrink/rightInfo/name"),this.areanLogic.getEnmeyData());
    },

    refreshBase:function (countryNode,nameLabel,data) {
        nameLabel.getComponent(cc.Label).string = data.Name;
        var country = !data.Country ? jsonTables.getCoutryByLang(uiLang.language):data.Country;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.COUNTRY,country);
        if(config){
            uiResMgr.loadCountryIcon(config[jsonTables.CONFIG_COUNTRY.CountryIcon],countryNode);
        }
    },

    showEmj:function(){
        this.widget("areanFight/shrink/ipx/emojiBox").active = !this.widget("areanFight/shrink/ipx/emojiBox").active;
    },

    updateRetainLabel:function(){
        this.widget("areanFight/shrink/retain1/saveLabel").getComponent(cc.Label).string = this.fightLogic.getMonsterNum(true);
        this.widget("areanFight/shrink/retain2/saveLabel").getComponent(cc.Label).string = this.fightLogic.getMonsterNum(false);
    },

    //设置竞技场表情
    setAreanEmoj:function(prefab,data,isMine){
        if(isMine) {
            if (this.leftEmojScript) {
                this.leftEmojScript.init(false);
            }

            var node = this.widget("areanFight/shrink/leftInfo/emotionNode").getInstance(prefab,true);
            var script = node.getComponent("areanEmoj");
            this.leftEmojScript = script;
            if (this.leftEmojScript) {
                this.leftEmojScript.init(true,data,this);
            }
        }
        else {
            if (this.rightEmojScript) {
                this.rightEmojScript.init(false);
            }

            var node = this.widget("areanFight/shrink/rightInfo/emotionNode").getInstance(prefab,true);
            var script = node.getComponent("areanEmoj");
            this.rightEmojScript = script;
            if (this.rightEmojScript) {
                this.rightEmojScript.init(true,data,this);
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
