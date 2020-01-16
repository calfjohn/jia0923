//NOTE do not creat this logic  Unless you know what you're doing
//NOTE 状态类基类

let stateClass = cc.Class({
    extends: null,
    properties: {
        state:constant.StateEnum.NONE,
        machine:null,
    },
    isState : function (state) {
        return this.state === state;
    },

    destroySelf:function(){
        this.ccObj = null;
        this.machine = null;
    },
    setState : function (state) {
        this.state = state;
    },
    enter : function(ccObj){
        this.ccObj = ccObj;
        if (this.ccObj.playEnterAction) {
            this.ccObj.playEnterAction(this.state);
        }
    },

    reset:function(){

    },

    exit : function(){
        this.ccObj = undefined;
    },
    setMachine : function(machine){
        this.machine = machine;
    },
});
window["fight"].state = stateClass;
