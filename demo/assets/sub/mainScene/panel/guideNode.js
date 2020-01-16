var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        aniPrefab:[cc.Prefab],
        fingerWorld:cc.Prefab,
        itemLight:cc.Prefab,
        tipsNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        uiManager.fitScreen(this.node);
        this.registerEvent();
        this.audio = {};
    },
    registerEvent: function () {
        var registerHandler = [
            ["guideAction", this.guideAction.bind(this),true],
            ["showFinger", this.setNextTips.bind(this)]
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["playAudioEffect", this.playAudioEffect.bind(this)],
            ["stopAudioEffect", this.stopAudioEffect.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    guideAction:function(type,ext){
        if (type === "btnVisible" && ext) {
            this.close()
        }
    },
    playAudioEffect:function (event) {
        event.stopPropagation();
        var audioID = event.getUserData();
        uiResMgr.loadAudio(audioID,function(clip){
            this.audio[audioID] = cc.audioEngine.play(clip, false, 1);
            cc.audioEngine.setFinishCallback(this.audio[audioID], function () {
                delete this.audio[audioID];
            }.bind(this));
        }.bind(this));
    },

    stopAudioEffect:function (event) {
        event.stopPropagation();
        var audioID = event.getUserData();
        if(this.audio[audioID]){
             cc.audioEngine.stop(this.audio[audioID]);
        }
    },

    getItemLight:function(){
        return this.itemLight;
    },

    open:function(type){
        if(this.lastType === "victory" && type === "guideFinger")   return;
        this.widget("guideNode/fightTask").active = type === "fightTask";
        this.widget("guideNode/aniNode").active = type === "aniNode";
        this.widget("guideNode/btnSkip").active = type === "aniNode";
        this.widget("guideNode/partner").active = type === "partner";
        this.widget("guideNode/victory").active = type === "victory";
        this.widget("guideNode/shrink").active = type === "rule";
        this.widget("guideNode/clickFightReel").active = type === "clickFightReel";
        this.widget("guideNode/guideFinger").active = type === "guideFinger" && this.guideLogic.getBaseChapterPos();
        this.lastType = type;
        if (this.widget("guideNode/aniNode").active) {
            // window.adjustUtil.recored(tb.ADJUST_RECORED_PLAY_ANI);
            if(window.FBInstant)    //fb版本打点
                window.fbAnalytics.recored(tb.FACEBOOK_RECORED_PLAY_ANI);
            // setTimeout(function () {
            //     this.fightLogic.setGameType(constant.FightType.GUIDE_FIGHT);
            //     this.clientEvent.dispatchEvent("loadScene",constant.SceneID.FIGHT,[],function(){
            //         // NOTE: 直接开打了
            //     }.bind(this));
            // }.bind(this), 500);
            this.clientEvent.dispatchEvent("parseMusic");//停止背景音乐
            this.prefabIdx = 0;
            this.lastNode = null;
            this.showAniAction();
            this.scheduleOnce(function () {
                this.clientEvent.dispatchEvent('setSceneVisible',false);
            },1);
        }
        if (this.widget("guideNode/partner").active) {
            var ani = this.widget("guideNode/partner").getComponent(cc.Animation);
            ani.playAdditive(ani.defaultClip.name).once(constant.AnimationState.FINISHED, function () {
                var delay = this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.SkyAnimTime);
                setTimeout(function () {
                    this.close();
                    this.guideLogic.callSandBox();
                }.bind(this), delay);
            }, this);
        }

        if (this.widget("guideNode/victory").active) {
            var ani = this.widget("guideNode/victory").getComponent(cc.Animation);
            ani.playAdditive(ani.defaultClip.name).once(constant.AnimationState.FINISHED, function () {
                //this.lastType = undefined;
                //this.open("guideFinger");
                window.adjustUtil.recored(tb.ADJUST_RECORED_COMPLITY_GUIDE);
            }, this);
        }

        if (this.widget("guideNode/clickFightReel").active) {
            var node = this.widget("guideNode/clickFightReel/reel").getInstance(this.fingerWorld,true);
            node.getComponent(this.fingerWorld.name).init(this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.UseReel));
            this.widget("guideNode/clickFightReel/reel").x =  -302 + this.guideLogic.reelIdx * 130;
        }

        if(this.widget("guideNode/guideFinger").active){
            var worldPos = this.guideLogic.getBaseChapterPos();
            var nodePos = this.widget("guideNode/guideFinger").convertToNodeSpaceAR(worldPos);
            nodePos.y -= 20;
            this.widget("guideNode/guideFinger/finger").position = nodePos;
        }

        if(this.widget("guideNode/fightTask").active){
            this.registerClientEvent("fightTaskOver",function () {
                this.widget("guideNode/fightTask/node2/label2/received").active = true;
            }.bind(this));
            var isGet = this.userLogic.getFlagInfo(this.userLogic.Flag.FightTask)[0];
            this.widget("guideNode/fightTask/node2/label2/received").active = !!isGet;
            var idsArr = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ClientRewardIds);
            var rewardArr = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ClientRewardsStr);
            var idx = idsArr.indexOf(this.userLogic.Flag.FightTask);
            var str = rewardArr[idx][0];
            var arr = str.split("#");
            this.widget("guideNode/fightTask/node2/label2/label").getComponent(cc.Label).string = arr[2];
        }
        if (this.widget("guideNode/shrink").active) {
            this.openTipsMsg('guideMsg1');
        } else {
            this.closeTipsMsg();
        }
    },
    //調過开头动画
    skipEvent:function () {
        this.unscheduleAllCallbacks();
        uiManager.openUI(uiManager.UIID.SELECT_CHARECTER);
        uiManager.closeUI(uiManager.UIID.WAITINGUI);
        this.close();
        window.adjustUtil.recored(tb.ADJUST_RECORED_END_ANI);
        if(window.FBInstant)    //fb版本打点
            window.fbAnalytics.recored(tb.FACEBOOK_RECORED_END_ANI);
        this.widget("guideNode/aniNode").active = false;
        this.widget("guideNode/btnSkip").active = false;
    },

    clickReelIcon:function(){
        this.close();
        this.guideLogic.nextReelGuide();
    },

    showAniAction:function(){
        if (!this.aniPrefab[this.prefabIdx]) {
            this.close();
            window.adjustUtil.recored(tb.ADJUST_RECORED_END_ANI);
            if(window.FBInstant)    //fb版本打点
                window.fbAnalytics.recored(tb.FACEBOOK_RECORED_END_ANI);
            this.widget("guideNode/aniNode").active = false;
            return;
        }
        var prefab = this.aniPrefab[this.prefabIdx];
        var node  = this.widget("aniNode").getInstance(prefab,true);
        var ani = node.getComponent(cc.Animation);
        window.adjustUtil.recored(tb.ADJUST_RECORED_PLAY_ANI,this.prefabIdx);
        this.prefabIdx++;
        if (this.prefabIdx == this.aniPrefab.length - 1) {
            this.scheduleOnce(function () {
                uiManager.openUI(uiManager.UIID.SELECT_CHARECTER);
                uiManager.closeUI(uiManager.UIID.WAITINGUI);
            },2);
        }
        this.scheduleOnce(function () {
            if (this.aniPrefab[this.prefabIdx]) {
                var node = this.widget("aniNode").getInstance(this.aniPrefab[this.prefabIdx],true);
                node.active = false;
            }
        },1);
        if (!ani) {
            cc.error("为什么根节点没有动画机")
        }else {
            // this.scheduleOnce(function () {
                if (this.lastNode) {
                    this.lastNode.active = false;
                }
                this.lastNode = node;
                ani.playAdditive(ani.getClips()[0].name).once(constant.AnimationState.FINISHED, this.showAniAction, this);
                ani.setCurrentTime(0);
            // },0.25);
        }

    },

    setNextTips () {
        if (this.isShowGuideMsg) return;
        this.isShowGuideMsg = true;
        this.openTipsMsg('guideMsg2');
        this.scheduleOnce(this.closeTipsMsg, 10);
    },

    openTipsMsg (tipsKey) {
        this.tipsNode.active = true;
        const label = cc.find('tipsLabel', this.tipsNode).getComponent(cc.Label);
        label.string = uiLang.getMessage(this.node.name, tipsKey);
    },

    closeTipsMsg () {
        this.tipsNode.active = false;
    },

    close:function(){
    },
});
