/**
 * @Author: lich
 * @Date:   2018-07-31T13:51:08+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-07-31T13:51:46+08:00
 */

window["logic"]["fightTalk"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var fightLogic = null;
    var guideLogic = null;

    module.init = function(){
        this.bubbleCombatConfig = [];
        var config = jsonTables.getJsonTable(jsonTables.TABLE.BUBBLECOMBAT);
        var curCount = 0;
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i][jsonTables.CONFIG_BUBBLECOMBAT.Probability];
            curCount += obj;
            this.bubbleCombatConfig.push(curCount);
        }
        this.timeDuration = 0;

        this.timeInterval = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BubbleCombatTime)/1000;
        this.waitTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BubbleCombatCDTime);
        this.sandStep = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BubbleSandStep);

        this.initModule();
        this.reset();//数据重置
    };

    module.reset = function(){
        this.sandToggelRound = 999;
        this.isInShow = false;//是否在对话中
        this.sandContainr = [];//用于存储生成品质
    };

    module.addSandContainr = function (quality) {
        if (fightLogic.getCurStep() <= 1) return;
        this.sandContainr.push(quality);
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        fightLogic = kf.require("logic.fight");
        guideLogic = kf.require("logic.guide");
    };

    module._getBubbleID = function (ids,weight) {
        if (ids.length === 0) {
            return cc.error("```bubbleID``````");
        }else if (ids.length === 1) {
            return ids[0];
        }else {
            var all = 0;
            for (var i = 0 , len = weight.length; i <  len; i++) {
                var obj = weight[i];
                all += obj;
            }
            var randomNum = jsonTables.randomNum(0,all);
            var curCount = 0;
            for (var i = 0 , len = weight.length; i <  len; i++) {
                var obj = weight[i];
                curCount += obj;
                if (randomNum <= curCount) {
                    return ids[i];
                }
            }
            return ids[ids.length-1];
        }
    };

    ////////////////////////////////////////////////////////////////////////////
    module.checkSandTalk = function(){
        if (!fightLogic.isSandBox() || this.isInShow) return;
        if (guideLogic.isInGuideFlag()) return;
        var curStep = fightLogic.getCurStep();
        if (curStep > this.sandToggelRound) return;
        var config = jsonTables.getJsonTable(jsonTables.TABLE.BUBBLESAND);
        var list = [];
        for (var i = 0 , len = config.length; i <  len; i++) {
            var obj = config[i];
            var type = obj[jsonTables.CONFIG_BUBBLESAND.Type];
            var triggers = obj[jsonTables.CONFIG_BUBBLESAND.Trigger];
            var bubbleID = obj[jsonTables.CONFIG_BUBBLESAND.BubbleID];
            var weight = obj[jsonTables.CONFIG_BUBBLESAND.Weight];
            switch (type) {
                case tb.BUBBLESAND_QUALITY:
                    if (kf.inArray(this.sandContainr,triggers[0])) {
                        list.push(this._getBubbleID(bubbleID,weight));
                    }
                    break;
                case tb.BUBBLESAND_MORE:
                    if (curStep === triggers[0] && fightLogic.minePerEnmey(true,triggers[1],triggers[2])) {
                        list.push(this._getBubbleID(bubbleID,weight));
                    }
                    break;
                case tb.BUBBLESAND_LESS:
                    if (curStep === triggers[0] && fightLogic.minePerEnmey(false,triggers[1],triggers[2])) {
                        list.push(this._getBubbleID(bubbleID,weight));
                    }
                    break;
            }
        }

        this.sandContainr = [];//用于存储生成品质
        if (list.length === 0) return ;//cc.warn("未触发对话")
        var bubbleID = jsonTables.random(list);
        this.sandToggelRound = curStep - this.sandStep;// TODO: 设置读取
        this.startTalk(bubbleID,false);
    };
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    module.checkFightTalk = function(){
        if (!fightLogic.isDisplaying() || this.isInShow) return;
        if (guideLogic.isInGuideFlag()) return;

        var randomNum = jsonTables.randomNum(0,this.bubbleCombatConfig[this.bubbleCombatConfig.length - 1]);
        var toggleIdx = -1;
        for (var i = 0 , len = this.bubbleCombatConfig.length; i <  len; i++) {
            var obj = this.bubbleCombatConfig[i];
            if (randomNum < obj) {
                toggleIdx = i;
                break;
            }
        }
        if (toggleIdx === -1) return cc.error("``???什么鬼")

        var config = jsonTables.getJsonTable(jsonTables.TABLE.BUBBLECOMBAT);
        var obj = config[toggleIdx];
        var type = obj[jsonTables.CONFIG_BUBBLECOMBAT.Type];
        var triggers = obj[jsonTables.CONFIG_BUBBLECOMBAT.Trigger];
        var bubbleID = obj[jsonTables.CONFIG_BUBBLECOMBAT.BubbleID];
        var weight = obj[jsonTables.CONFIG_BUBBLECOMBAT.Weight];
        var toggleID = 0;
        switch (type) {
            case tb.BUBBLECOMBAT_NOT:
                break;
            case tb.BUBBLECOMBAT_MORE:
                if (fightLogic.minePerEnmey(true,triggers[0],triggers[1])) {
                    toggleID = this._getBubbleID(bubbleID,weight);
                }
                break;
            case tb.BUBBLECOMBAT_LESS:
                if (fightLogic.minePerEnmey(false,triggers[0],triggers[1])) {
                    toggleID = this._getBubbleID(bubbleID,weight);
                }
                break;
        }
        if (toggleID === 0) return ;//未触发
        this.startTalk(toggleID,true);
    };
    ////////////////////////////////////////////////////////////////////////////

    module.kfUpdate = function (dt) {
        if (guideLogic.isInGuideFlag()) return;

        if (!jsonTables.displaySpeed_Stop && !jsonTables.displaySkill) {
            this.timeDuration += dt;
        }
        if (this.timeDuration < this.timeInterval) return;
        this.timeDuration -= this.timeInterval;
        this.checkFightTalk();
    };

    ///////////////////------/////////////////////////////////////////////////
    module.startTalk = function (bubbleCellID,isDisplay) {
        if (this.isInShow) {
            cc.error("?????????????????")
            return;
        }
        this.isInShow = true;
        this.isDisplay = isDisplay;
        this.showTalk(bubbleCellID,true);
    };

    module.showTalk = function (bubbleCellID,isFirst) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BUBBLECELL,bubbleCellID);
        var familyID = config[jsonTables.CONFIG_BUBBLECELL.FamilyID];
        var isSelf =  config[jsonTables.CONFIG_BUBBLECELL.Object];
        var target = fightLogic.getFamilyOne(isSelf,familyID);
        if (target === null) {
            cc.warn("no target  talk end")
            if (isFirst) {
                this.isDisplay = false;
            }
            this.showDone();
        }else {
            var node = uiResMgr.getPrefabEx("fightTalkItem");
            var parent = fightLogic.callSceneRoot("getUiNode");
            node.parent = parent;
            node.getComponent("fightTalkItem").show(target,bubbleCellID);
        }
    };

    module.showDone = function () {
        if (guideLogic.isInGuideFlag()) return;
        if (this.isDisplay) {
            this.isDisplay = false;
            setTimeout(function () {
                this.isInShow = false;
            }.bind(this), this.waitTime);
        }else {
            this.isInShow = false;
        }
    };

    module.forceDone = function () {
        this.isInShow = false;
    };

    return module;
};
