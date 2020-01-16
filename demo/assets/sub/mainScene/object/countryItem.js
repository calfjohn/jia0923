var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },
    init:function(idx,data,ext){
        this.data = data;
        this.widget("countryItem/select").active = data[jsonTables.CONFIG_COUNTRY.Tid] === ext;
        uiResMgr.loadCountryIcon(data[jsonTables.CONFIG_COUNTRY.CountryIcon],this.node);
    },

    clickEvent:function(){
        if (!this.widget("countryItem/select").active) {
            this.node.dispatchDiyEvent("clickContry",this.data[jsonTables.CONFIG_COUNTRY.Tid]);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
