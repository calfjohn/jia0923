var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
    },

    getMoveSpeed:function(){
        return 0;
    },

    damageBuff:function(){

    },

    getPosition:function(){
        return this.node.position;
    },

    desrHp:function(){

    },

    getIsLife:function(){
        return true;
    },

    getBulletFixPos:function(){
        return 0;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
