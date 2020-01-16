//NOTE do not creat this logic  Unless you know what you're doing
//NOTE 状态类基类
let machineClass = function() {
    this.curState = null;
    this.preState = null;
    this.container = {};//保存所有的状态
    this.stateData = {};//状态数据存储，用于不同状态切换后数据同步
    this.ccObj = null;//拥有这个状态的家伙
    this.msgHanderLogic = kf.require("logic.msgHander");
    this.init = function(ccObj,forceStateID){
        //NOTE 默认进入待机状态等待
        this.ccObj = ccObj;
        forceStateID = forceStateID === undefined ? constant.StateEnum.WAITE : forceStateID;
        this.changeState(forceStateID);
    };

    this.destroySelf = function () {
        for (var key in this.container) {
            if (!this.container.hasOwnProperty(key)) continue;
            var state = this.container[key];
            state.destroySelf();
        }
        this.curState = null;
        this.preState = null;
        this.container = {};
        this.stateData = {};
        this.ccObj = null;
        this.msgHanderLogic = null;
    };

    this.reset = function(){
        if (this.curState) {
            this.curState.reset();
        }
        this.clearDestoryState(constant.StateEnum.FIND);
        this.clearDestoryState(constant.StateEnum.ATK);
        this.changeState(constant.StateEnum.WAITE);
    };

    this.clearDestoryState = function (key) {
        if (this.container[key]) {
            delete this.container[key];
        }
        if (this.stateData[key]) {
            delete this.stateData[key];
        }
    };

    this.setStateData = function(key,value){
        this.stateData[key] = value;
    };

    this.getStateData = function(key){
        return this.stateData[key];
    };

    this.getState = function(stateID){
        if (!this.container[stateID]) {
            var state = this.newState(stateID);
            state.setMachine(this);
            this.container[stateID] = state;
        }
        return this.container[stateID];
    };

    this.newState = function(stateID){
        if (!window["fight"][stateID]) {
            cc.error("stateID",stateID,'不存在这个');
            return null;
        }
        return new window["fight"][stateID]();
    };

    this.changeState = function(stateID){
        if (this.curState) {
            this.preState = this.curState;
            this.curState.exit(this.ccObj);
        }
        this.curState = this.getState(stateID);
        this.curState.enter(this.ccObj);
        this.update();
    };

    this.getCurStateID = function(){
        if (!this.curState) return constant.StateEnum.NONE;
        return this.curState.getState();
    };

    this.isCurStateID = function(stateID){
        if (!this.curState) return false;
        return this.curState.isState(stateID);
    };

    this.isPreStateID = function(stateID){
        if (!this.preState) return false;
        return this.preState.isState(stateID);
    };

    this.backPreState = function () {
        if (this.preState) {
            this.changeState(this.preState.state);
        }
    };

    this.update = function(dt){
        if (!this.ccObj || !this.curState || !this.curState.execute) return;
        this.curState.execute(dt);
    };

    this.newMsg = function(msg){
        return this.msgHanderLogic.newMsg.apply(this.msgHanderLogic,arguments);
    };
};
window["fight"].machineClass = machineClass;
