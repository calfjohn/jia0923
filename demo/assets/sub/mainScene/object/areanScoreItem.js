var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        areanRewardItem:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.idx = -1;
    },

    init:function(idx,data,nowIdx,ext){
        this.widget("areanScoreItem/self").active = idx === ext;
        this.widget("areanScoreItem/rankCircle1/bgBonus").active = idx === nowIdx;
        if(this.idx === idx)    return;
        this.idx = idx;
        // var nextData = this.areanLogic.getDivInfo(data.Score,true);
        var str = data.Score + "+";
        // if (nextData) {
        //     str = data.Score+"-"+nextData.Score;
        // }else {
        //     str = ">"+data.Score
        // }
        this.widget("areanScoreItem/score/number").getComponent(cc.Label).string = str;
        this.widget("areanScoreItem/bgRankTitle/title").getComponent(cc.Label).string = uiLang.getConfigTxt(data.DivName);
        uiResMgr.loadAreanIcon(data.DicIcon,this.widget("areanScoreItem/rankCircle1/rankIcon2"));
        for (var i = 1 , len = 4; i < len; i++) {
            var node = this.widget("areanScoreItem/rankCircle1/rankIcon2/starBright" + i);
            node.active = i <= data.StarNum;
        }
        var rewards = data.Rewards[0];
        var boxInfo = jsonTables.getJsonTableObj(jsonTables.TABLE.BOXINFO,rewards.BaseID);
        var rewardList = [];

        if(boxInfo.Diamond[0] === boxInfo.Diamond[1] && boxInfo.Diamond[0] === 0){//没有送钻石

        }else{
            var num = 0;
            if(boxInfo.Diamond[0] === boxInfo.Diamond[1]){
                num = NP.dealNum(boxInfo.Diamond[0],constant.NumType.TEN);
            }else{
                num = NP.dealNum(boxInfo.Diamond[0],constant.NumType.TEN) + "-" + NP.dealNum(boxInfo.Diamond[1],constant.NumType.TEN);
            }
            rewardList.push({Type:constant.ItemType.DIAMOND,Num:num})
        }
        if(boxInfo.Gold[0] === boxInfo.Gold[1] && boxInfo.Gold[0] === 0){//没有送金币

        }else{
            var num = 0;
            if(boxInfo.Gold[0] === boxInfo.Gold[1]){
                num = NP.dealNum(boxInfo.Gold[0],constant.NumType.TEN);
            }else{
                num = NP.dealNum(boxInfo.Gold[0],constant.NumType.TEN) + "-" + NP.dealNum(boxInfo.Gold[1],constant.NumType.TEN);
            }
            rewardList.push({Type:constant.ItemType.GOLD,Num:num})
        }
        if(boxInfo[jsonTables.CONFIG_BOXINFO.Debris]){
            rewardList.push({Type:constant.ItemType.HERO,Num:boxInfo[jsonTables.CONFIG_BOXINFO.Debris]})
        }
        if(boxInfo[jsonTables.CONFIG_BOXINFO.Reel]){
            rewardList.push({Type:constant.ItemType.REEL,Num:boxInfo[jsonTables.CONFIG_BOXINFO.Reel]})
        }
        if(boxInfo[jsonTables.CONFIG_BOXINFO.EquipSum]){
            rewardList.push({Type:constant.ItemType.EQUIP,Num:boxInfo[jsonTables.CONFIG_BOXINFO.EquipSum],Qua:boxInfo[jsonTables.CONFIG_BOXINFO.EquipQuality]})
        }
        var refreshData = {
            content:this.widget("areanScoreItem/reward"),
            list:rewardList,
            prefab:this.areanRewardItem
        }
        uiManager.refreshView(refreshData);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
