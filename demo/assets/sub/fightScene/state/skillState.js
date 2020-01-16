///////////////////////////////////////////////////////////////////////////
//NOTE 技能类
let skillStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.SKILL);
    },
    enter:function(ccObj){//重写父类方法 要调用_super使父类生效
        this._super(ccObj);
        kf.require("logic.fight").addSkillMonNum();
    },
    exit : function(){
        this._super();
        kf.require("logic.fight").exitSkillMonNum();
    },
    execute:function(dt){
    },
});

window["fight"][constant.StateEnum.SKILL] = skillStateClass;
