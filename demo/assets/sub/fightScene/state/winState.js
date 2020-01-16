///////////////////////////////////////////////////////////////////////////
//NOTE 胜利类
let wintateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.WIN);
    },
    execute:function(dt){

    },
});

window["fight"][constant.StateEnum.WIN] = wintateClass;
