///////////////////////////////////////////////////////////////////////////
//NOTE 攻击类
let atkStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.ATK);
        this.msgKey = null;
    },
    enter:function(ccObj){//重写父类方法 要调用_super使父类生效
        this._super(ccObj);

    },
    exit : function(){
        if (this.msgKey) {
            kf.require("logic.msgHander").removeMsgByMapKey(this.msgKey);
            this.msgKey = null;
        }
        this._super();
    },
    reset:function(){
        if (this.msgKey) {
            kf.require("logic.msgHander").removeMsgByMapKey(this.msgKey);
            this.msgKey = null;
        }
    },
    execute:function(dt){
        var ccTarget = this.machine.getStateData(constant.StateMachine.FIND);//先检查一下目标死活
        if (!ccTarget || !ccTarget.getIsLife()) {
            this.machine.setStateData(constant.StateMachine.FIND,null);
            this.machine.changeState(constant.StateEnum.FIND);
            return;
        }
        var nextTarget = this.ccObj.findModule();
        if (!nextTarget) {
            return;
        }
        var isChange = false;
        if (this.ccObj.isMineCreator()) {
            if (nextTarget.node.x < ccTarget.node.x && Math.abs(nextTarget.node.x - ccTarget.node.x) > 50) {
                this.machine.setStateData(constant.StateMachine.FIND,nextTarget);
                ccTarget = nextTarget;
                isChange = true;
            }
        }else {
            if (nextTarget.node.x > ccTarget.node.x && Math.abs(ccTarget.node.x - nextTarget.node.x) > 50) {
                this.machine.setStateData(constant.StateMachine.FIND,nextTarget);
                ccTarget = nextTarget;
                isChange = true;
            }
        }
        if (!this.ccObj.isCanAtk(ccTarget)) {
            this.machine.changeState(constant.StateEnum.MOVE);
            return;//
        }
        this.ccObj.playEnterAction(this.state);
        var nextAtkDelay = this.ccObj.getAtkDuration();
        if (!this.ccObj.isNormalAtk()) {
            this.machine.newMsg(this.ccObj.getID(),this.ccObj.getID(),nextAtkDelay/3,constant.MsgHanderType.ATK_CREATE,ccTarget);//创建攻击行为
        }

        var atkInterval = this.ccObj.getAtkInterval();
        this.msgKey = this.machine.newMsg(this.ccObj.getID(),this.ccObj.getID(),(nextAtkDelay + atkInterval),constant.MsgHanderType.ATK_AGAIN);//等待下次 调用攻击state
    },
});

window["fight"][constant.StateEnum.ATK] = atkStateClass;
