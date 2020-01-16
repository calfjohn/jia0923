var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        arenaNode: cc.Node,
        worldBoss: cc.Node,
        mineNode: cc.Node,
        talkNode: cc.Node,
        personNode: cc.Node,
        spine:sp.Skeleton,
    },

    onLoad () {
        this.updateTime = 0;
        this.talkTime = 0;
        this.talkWaitTime = 0;
        this.registerEvent();
        this.bubblePresenceTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BubblePresenceTime) / 1000;
        this.bubbleIntervalTime = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BubbleIntervalTime) / 1000;
    },

    registerEvent: function () {

        var registerHandler = [
            ["elfGuideFunc", this.checkGuideFunc.bind(this)],
        ]
        this.registerClientEvent(registerHandler);

        // this.registerNodeEvent("touchend", this.touchEnd);
    },

    init: function () {
        if(this.initPos)
            this.node.position = this.initPos;
        else
            this.initPos = this.node.position;
        this.talkNode.active = false;
        this.curGuideIdx = null;
        this.isShowTalk = false;
        this.setTalkFlag(false);
        this.spine.setAnimation(0,'std',true);
        this.elfLogic.resetGuideTime();
    },

    //检测是否需要更换引导
    checkGuideFunc: function () {
        var index = this.elfLogic.getCurGuideFuncIdx();
        if(this.curGuideIdx !== index) {
            this.scheduleOnce(this.elfGuideFunc, 3);
        }
    },

    //点击出对话
    touchEnd: function () {
        this.switchTalk(true);
        this.isShowTalk = true;
        this.talkWaitTime = 0;
    },

    //去引导
    elfGuideFunc: function () {
        this.curGuideIdx = this.elfLogic.getCurGuideFuncIdx();
        if(this.curGuideIdx === 0) {
            this.backToInit();
            return;
        }
        var aimPos = this.getFuncPos(this.curGuideIdx);
        var moveTo = cc.moveTo(0.5, aimPos);
        var delta = aimPos.x - this.node.x;
        this.node.scaleX = delta > 0 ? 1 : -1
        var callback = cc.callFunc(function () {
            this.node.scaleX = 1;
            this.setTalkFlag(true);
            this.spine.setAnimation(0,'std',true);
            // this.elfLogic.resetGuideTime();
            // this.elfLogic.setCurGuideTimes(this.elfLogic.getCurGuideTimes() + 1);
            this.setTalkContent(this.curGuideIdx);
        }, this);
        this.spine.setAnimation(0,'walk',true);
        this.node.runAction(cc.sequence([moveTo,callback]));
        this.talkWaitTime = this.bubbleIntervalTime - 3;
    },

    //回到原位
    backToInit: function () {
        if(this.node.position === this.initPos) return;
        var moveTo = cc.moveTo(0.5, this.initPos);
        var delta = this.initPos.x - this.node.x;
        this.node.scaleX = delta > 0 ? 1 : -1
        var callback = cc.callFunc(function () {
            this.node.scaleX = 1;
            this.spine.setAnimation(0,'std',true);
        }, this);
        this.spine.setAnimation(0,'walk',true);
        this.node.runAction(cc.sequence([moveTo,callback]));
    },

    //显示对话
    switchTalk: function (active) {
        this.talkNode.active = active;
    },

    //设置对话内容
    setTalkContent: function (idx) {
        var table = jsonTables[jsonTables.TABLE.ELFGUIDE];
        var baseData = table[idx-1];
        if(!baseData) {
            this.widget("label").getComponent(cc.Label).string = "";
            return;
        }
        jsonTables.loadConfigTxt(this.widget("label"),baseData[jsonTables.CONFIG_ELFGUIDE.Dialogue]);
    },

    //设置对话Flag
    setTalkFlag: function (talkFlag) {
        this.talkFlag = talkFlag;
    },

    //获取各个功能的坐标
    getFuncPos: function (idx) {
        var table = jsonTables[jsonTables.TABLE.ELFGUIDE];

        var baseData = table[idx-1];

        if(!baseData) return;
        var pos = baseData[jsonTables.CONFIG_ELFGUIDE.Position];
        var isDelta = baseData[jsonTables.CONFIG_ELFGUIDE.DisDeltaPosition];
        if(isDelta) {
            switch (baseData[jsonTables.CONFIG_ELFGUIDE.Type]) {
                case tb.ELF_GUIDE_NO:
                    return;
                case tb.ELF_GUIDE_ARENA:
                    pos = kf.pAdd(this.arenaNode.position, cc.v2(pos[0], pos[1]));
                    break;
                case tb.ELF_GUIDE_BOSS:
                    pos = kf.pAdd(this.worldBoss.position, cc.v2(pos[0], pos[1]));
                    break;
                case tb.ELF_GUIDE_MINE:
                    pos = kf.pAdd(this.mineNode.position, cc.v2(pos[0], pos[1]));
                    break;
            }
        }

        return pos;
    },
    
    //对话框显示检测
    checkTalkShow: function (dt) {
        if(this.isShowTalk) {
            this.talkTime += dt;
            if(this.talkTime >= this.bubblePresenceTime) {
                this.switchTalk(false);
                this.isShowTalk = false;
                this.talkTime = 0;
            }
        }
        else {
            this.talkWaitTime += dt;
            if(this.talkWaitTime >= this.bubbleIntervalTime) {
                this.switchTalk(true);
                this.isShowTalk = true;
                this.talkWaitTime = 0;
            }
        }
    },

    update(dt) {
        this.elfLogic.update(dt);
        if(!this.talkFlag) return;
        this.updateTime+=dt;
        if(this.updateTime < 1) return;
        this.checkTalkShow(this.updateTime);
        this.updateTime = 0;
    }
});
