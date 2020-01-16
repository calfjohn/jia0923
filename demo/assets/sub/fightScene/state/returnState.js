///////////////////////////////////////////////////////////////////////////
//NOTE 回到初始位置啊
let returnStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.RETURN);
    },

    execute:function(dt){
        this.ccObj.doReturnAction();
    },
});

window["fight"][constant.StateEnum.RETURN] = returnStateClass;
