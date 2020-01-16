var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        edit:cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {

    },

    open:function (srcEdit) {
        this.node.getComponent(cc.Animation).play();
        this.srcEdit = srcEdit;
        // this.srcEdit.setFocus(false);
        this.edit.setFocus(true);
        this.edit.string = this.srcEdit.string;
        this.edit.maxLength = this.srcEdit.maxLength;
    },

    editChange:function (event) {
        this.srcEdit.string = this.edit.string;
    },

    editEnd:function (event) {
        // this.srcEdit.string = this.edit.string;
        this.close();
    },

    editReturn:function (event) {
        // this.srcEdit.string = this.edit.string;
        this.close();
    },

});
