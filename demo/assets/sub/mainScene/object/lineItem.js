var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        sprite:[cc.SpriteFrame]
    },
    onLoad:function () {
        jsonTables.parsePrefab(this);
        this.registerEvent();
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshLine", this.refreshLine.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
    },
    init:function(idx,data) {
        this.targetID = data.targetID;//目标ID
        this.talentID = data.talentID;
        this.node.position = data.startPos;
        this.node.width = kf.pDistance(data.startPos,data.endPos);
        this.node.rotation  = kf.calculateAngleTwoPointRotation(data.startPos,data.endPos);
        this.setLine();
    },
    refreshLine:function(id){
        if(id === this.talentID || id === this.targetID){
            this.setLine();
        }
    },
    setLine:function(){
        var lv = this.talentLogic.getTalentLv(this.talentID);
        var prelv = this.talentLogic.getTalentLv(this.targetID);
        var idx = lv > 0 && prelv > 0 ?0:1;
        this.node.getComponent(cc.Sprite).spriteFrame = this.sprite[idx];
    },
    // update (dt) {},
});
