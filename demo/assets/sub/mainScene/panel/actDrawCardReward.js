var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        content10: cc.Node,
        content10Ex: cc.Node,
        content1: cc.Node,
        rewardItem: cc.Prefab,
        openAnim: cc.Animation,
        content10Pos: [cc.Vec2]
    },

    onLoad () {
        jsonTables.parsePrefab(this);
    },

    open (src,rewardList,extraRewardList,cb,monQuality) {
        this.monQuality = monQuality;
        cb = cb || function () {};
        this.cb = cb;
        this.rewardList = rewardList;
        this.extraRewardList = extraRewardList;

        this.src = src;
        this.content10.active = rewardList.length !== 1;
        this.content10Ex.active = this.content10.active && src === constant.DrawCardSrcEnum.ActDrawCard;
        this.content1.active = rewardList.length === 1;

        this.content10.removeAllChildren();
        this.content10Ex.removeAllChildren();
        this.content1.removeAllChildren();

        this.isPlaying = true;
        this.needPause = rewardList.length > 1;
        var state = this.openAnim.play();
        state.once(constant.AnimationState.FINISHED, this.checkSrc, this);
        this.cardLogic.releaseFamilyList();//清空合成家族动画
    },

    checkSrc () {
        if(this.src === constant.DrawCardSrcEnum.ActDrawCard) {
            this.playRewards();
        }
        else{
            this.playRewardsEx();
        }
    },

    playRewards: function () {
        this.openAnim.play(this.openAnim.getClips()[1].name);
        var content = this.rewardList.length === 1 ? this.content1 : this.content10;

        if(this.extraRewardList.length !== 0) {
            for (var i = 0; i < this.extraRewardList.length; i++) {
                var obj = this.extraRewardList[i];
                obj.isExtra = true;
            }
            if(this.needPause) {
                var listData = {
                    content: this.content10Ex,
                    list: this.extraRewardList,
                    prefab: this.rewardItem
                }
                uiManager.refreshView(listData);
            }
            else {
                this.rewardList.concatSelf(this.extraRewardList);
            }
        }

        var listData = {
            content: content,
            list: this.rewardList,
            prefab: this.rewardItem
        }
        uiManager.refreshView(listData);

        var actionList = [];
        for (var i = 0; i < content.children.length; i++) {
            let obj = content.children[i];
            let js = obj.getComponent(obj.name);
            let duration = js.getDelayTime();
            let callback = cc.callFunc(function () {
                if(this.needPause && js.data.Type === constant.ItemType.HERO){
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,js.data.BaseID);
                    var needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[config[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];//解锁需要的碎片数
                    if(config[jsonTables.CONFIG_MONSTERFAMILY.Quality] >= tb.MONSTER_S && needDebris <= js.data.Num){
                        var info = {
                            FamilyID:js.data.BaseID,
                            Exp:0
                        }
                        var cb = function () {
                            this.resumeAction();
                        }.bind(this);
                        uiManager.openUI(uiManager.UIID.FAMILY_EFFECTEX,info,cb);
                        this.playJs = js;
                        cc.director.getActionManager().pauseTarget(this.node);
                        return;
                    }
                }
                js.playFamilyAnim();
            }, this);
            let delayTime = cc.delayTime(duration);
            actionList.push(callback);
            actionList.push(delayTime);
        }

        if(this.needPause) {
            for (var i = 0; i < this.content10Ex.children.length; i++) {
                let obj = this.content10Ex.children[i];
                let js = obj.getComponent(obj.name);
                let duration = js.getDelayTime();
                let callback = cc.callFunc(function () {
                    js.playFamilyAnim();
                }, this);
                let delayTime = cc.delayTime(duration);
                actionList.push(callback);
                actionList.push(delayTime);
            }
        }
        var endCb = cc.callFunc(function () {

            if(this.mailLogic.isOpenBoxFlag()) {
                this.mailLogic.setIsInOpenBossBox(false);
                var cb = function () {
                    this.isPlaying = false;
                }.bind(this);
                // this.cardLogic.playFamily(cb);
                if(this.userLogic.canPlayUpLvAni) {
                    this.userLogic.playUpLvAni(cb);
                }
                return;
            }
            this.isPlaying = false;
        }, this);

        actionList.push(endCb);
        this.node.runAction(cc.sequence(actionList));
    },

    playRewardsEx: function () {
        this.openAnim.play(this.openAnim.getClips()[1].name);

        var content = this.rewardList.length === 1 ? this.content1 : this.content10;
        var listData = {
            content: content,
            list: this.rewardList,
            prefab: this.rewardItem
        }
        uiManager.refreshView(listData);

        var actionList = [];
        for (var i = 0; i < content.children.length; i++) {
            let obj = content.children[i];
            let js = obj.getComponent(obj.name);
            let duration = js.getDelayTime();
            let callback = cc.callFunc(function () {
                if(this.needPause && js.data.Type === constant.ItemType.HERO){
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,js.data.BaseID);
                    var needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[config[jsonTables.CONFIG_MONSTERFAMILY.Quality] - 1];//解锁需要的碎片数
                    if(config[jsonTables.CONFIG_MONSTERFAMILY.Quality] >= this.monQuality && needDebris <= js.data.Num){
                        var info = {
                            FamilyID:js.data.BaseID,
                            Exp:0
                        }
                        var cb = function () {
                            this.resumeAction();
                        }.bind(this);
                        uiManager.openUI(uiManager.UIID.FAMILY_EFFECTEX,info,cb);
                        this.playJs = js;
                        cc.director.getActionManager().pauseTarget(this.node);
                        return;
                    }
                }
                js.playFamilyAnim();
            }, this);
            let delayTime = cc.delayTime(duration);
            actionList.push(callback);
            actionList.push(delayTime);
        }

        if(this.needPause) {
            for (var i = 0; i < this.content10Ex.children.length; i++) {
                let obj = this.content10Ex.children[i];
                let js = obj.getComponent(obj.name);
                let duration = js.getDelayTime();
                let callback = cc.callFunc(function () {
                    js.playFamilyAnim();
                }, this);
                let delayTime = cc.delayTime(duration);
                actionList.push(callback);
                actionList.push(delayTime);
            }
        }

        var endCb = cc.callFunc(function () {
            if(this.mailLogic.isOpenBoxFlag()) {
                this.mailLogic.setIsInOpenBossBox(false);
                var cb = function () {
                    this.isPlaying = false;
                }.bind(this);
                if(this.userLogic.canPlayUpLvAni) {
                    this.userLogic.playUpLvAni(cb);
                }
                return;
            }
            this.isPlaying = false;
        }, this);

        actionList.push(endCb);
        this.node.runAction(cc.sequence(actionList));
    },

    resumeAction:function () {
        if(!this.needPause) return;
        cc.director.getActionManager().resumeTarget(this.node);
        if(this.playJs){
            this.playJs.playFamilyAnim();
            this.playJs = undefined;
        }
    },

    clickClose: function () {
        if(this.isPlaying) return;
        if(this.src === constant.DrawCardSrcEnum.ActDrawCard){
            uiManager.callUiFunc(uiManager.UIID.ACT_DRAWCARD, "setCannotDraw", [false]);
        }else if(this.src === constant.DrawCardSrcEnum.ShopDrawCard){
            uiManager.callUiFunc(uiManager.UIID.DRAW_CARD, "setCannotDraw", [false]);
        }else {
            uiManager.callUiFunc(uiManager.UIID.DRAW_EQUIP, "setCannotDraw", [false]);
        }
        this.openAnim.play();
        this.openAnim.setCurrentTime(0);
        var cb = this.cb;
        this.cb = null;
        cb();
        this.close();
        this.cardLogic.releasenewFamilyList();
    }
});
