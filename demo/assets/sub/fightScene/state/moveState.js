///////////////////////////////////////////////////////////////////////////
//NOTE 移动类
let moveStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.MOVE);
    },
    exit : function(){
        this.ccObj.stepForwardCancle();
        this._super();
    },
    execute:function(dt){
        var ccTarget = this.machine.getStateData(constant.StateMachine.FIND);
        if (!ccTarget || !ccTarget.getIsLife()) {
            this.machine.setStateData(constant.StateMachine.FIND,null);
            this.machine.changeState(constant.StateEnum.FIND);
            return;
        }
        var nextTarget = this.ccObj.findModule();
        if (nextTarget){
           if (this.ccObj.isMineCreator()) {
               if (nextTarget.node.x < ccTarget.node.x && Math.abs(nextTarget.node.x - ccTarget.node.x) > 50) {
                   this.machine.setStateData(constant.StateMachine.FIND, nextTarget);
                   ccTarget = nextTarget;
               }
           } else {
               if (nextTarget.node.x > ccTarget.node.x && Math.abs(ccTarget.node.x - nextTarget.node.x) > 50) {
                   this.machine.setStateData(constant.StateMachine.FIND, nextTarget);
                   ccTarget = nextTarget;
               }
           }
        }
        var time = this.ccObj.getMoveDuration();
        this.ccObj.stepForward(ccTarget,time);
    },
});

window["fight"][constant.StateEnum.MOVE] = moveStateClass;
