///////////////////////////////////////////////////////////////////////////
//NOTE 死亡类
let deadStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.DEAD);
    },
    execute:function(dt){

    },
});

window["fight"][constant.StateEnum.DEAD] = deadStateClass;
