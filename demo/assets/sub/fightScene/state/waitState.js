///////////////////////////////////////////////////////////////////////////
//NOTE 待机类 这个取名有点尴尬 或许应该叫开场等待？
let waitStateClass = cc.Class({
    extends: window["fight"].state,
    ctor: function () {
        this.setState(constant.StateEnum.WAITE);
    },
});

window["fight"][constant.StateEnum.WAITE] = waitStateClass;
