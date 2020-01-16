///////////////////////////////////////////////////////////////////////////
//NOTE 寻找类
let findStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.FIND);
    },
    execute:function(dt){
        var ccTarget = this.ccObj.findModule();
        if (ccTarget && ccTarget.getIsLife()) {
            this.machine.setStateData(constant.StateMachine.FIND,ccTarget);
            this.machine.changeState(constant.StateEnum.MOVE);
        }else {//找不到对应的目标说明 游戏应该结束了
            this.machine.changeState(constant.StateEnum.WAITE);
        }
    },
});


window["fight"][constant.StateEnum.FIND] = findStateClass;
