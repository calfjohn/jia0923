///////////////////////////////////////////////////////////////////////////
//NOTE  眩晕类
let dizzyStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.DIZZY);
    },
    enter : function(ccObj){
        this._super(ccObj);
    },
    exit : function(){
        this.ccObj.setSpineState(true);
        this._super();
    },
    destroySelf:function(){
        if (this.ccObj) {
        }
        this._super();
    },
    execute:function(dt){

    },
});


window["fight"][constant.StateEnum.DIZZY] = dizzyStateClass;
