
cc.Class({
    extends: cc.EditBox,
    editor: {
        menu:"util/输入组件多语言扩张",
        disallowMultiple:true,
    },
    properties: {
        labelNode:cc.Node,//默认显示文本
        string: {
            tooltip: CC_DEV && 'i18n:COMPONENT.editbox.string',
            override: true,
            get: function () {
                return this._string;
            },
            set: function(value) {
                if (this.maxLength >= 0 && value.length >= this.maxLength) {
                    value = value.slice(0, this.maxLength);
                }

                this._string = value;
                if (this._impl) {
                    this._updateString(value);
                }
                this._showTipVisibe();
            }
        },
    },

    __preload:function(){
        this._super();
        this._showTipVisibe();
    },

    editBoxEditingDidBegan: function() {
        this._super();
        if (this.labelNode && this.labelNode.active) {
            this.labelNode.active = false;
        }
    },

    editBoxEditingDidEnded: function() {
        this._super();
        this._showTipVisibe();
    },

    editBoxEditingReturn: function() {
        this._super();
        this._showTipVisibe();
    },

    _showTipVisibe:function(){
        if (this.labelNode) {
            this.labelNode.active = this.string.length === 0;
        }
    },
});
