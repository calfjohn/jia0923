const panel = require('panel');

cc.Class({
    extends: panel,

    properties: {
        cardDesc: [cc.RichText],
        leftLine:[cc.Node],
        rightLine:[cc.Node],
    },

    onLoad () {},

    open (data) {
        var cardInfo = data.serverData.ActRewards;
        for (var i = 0; i < 2; i++) {
            this.cardDesc[i].string = cardInfo[i].Desc || '';
        }
        var leftLineNum = Math.floor(this.cardDesc[0].node.height / 25)
        var rightLineNum = Math.floor(this.cardDesc[1].node.height / 25)
        for(let n=0;n < 7;n++){
                this.leftLine[n].active = (n < leftLineNum)
                this.rightLine[n].active = (n < rightLineNum)
        }
    },
});
