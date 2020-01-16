var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        todayNode:cc.Node,
        timeLabel:cc.Label,
        icon:cc.Node,
        numLabel:cc.Label,
        getedNode:cc.Node,
        grayNode:cc.Node,

        reelNode:cc.Node,
        reelFrame:cc.Node,
        reelIcon:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init (idx,data) {
        this.node.position = data.pos;
        this.data = data;
        var state = data.state;
        this.timeLabel.string = data.Desc || "";
        this.getedNode.active = state === constant.SignState.GETED;
        this.grayNode.active = this.getedNode.active || this.activityLogic.getSpringSignTimeOut(idx);
        this.todayNode.active = !this.grayNode.active && this.activityLogic.isSpringToday(idx);
        this.numLabel.string = "x" + NP.dealNum(data.Rewards[0].Num,constant.NumType.TEN);
        var iconNode = this.icon;
        this.reelNode.active = data.Rewards[0].Type === constant.ItemType.REEL;
        this.icon.active = data.Rewards[0].Type !== constant.ItemType.REEL;
        var id = data.Rewards[0].BaseID;
        var type = data.Rewards[0].Type;
        switch (type) {
            case constant.ItemType.DAILY_ACTIVITY://每日活跃度
            case constant.ItemType.GOLD://金币
            case constant.ItemType.DIAMOND://钻石
            case constant.ItemType.VIT://体力
            case constant.ItemType.PUBLICPRO://通用怪物熟练度
            case constant.ItemType.PUBLICLIP://通用SSS碎片
            case constant.ItemType.EXP://金币
                uiResMgr.loadCurrencyIcon(type,iconNode);
                break;
            case constant.ItemType.HERO://英雄碎片
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,id);//家族配置表基本数据
                if(!baseData)   return;
                var iconRes = baseData[jsonTables.CONFIG_MONSTERFAMILY.FragmentIcon];
                uiResMgr.loadFragmentIcon(iconRes,iconNode);
                break;
            case constant.ItemType.EQUIP://装备
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,id);//装备配置表基本数据
                if(!baseData)   return;
                uiResMgr.loadEquipIcon( baseData[jsonTables.CONFIG_EQUIP.Icon],iconNode);
                break;
            case constant.ItemType.REEL://卷轴
                var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,id);//装备配置表基本数据
                if(!reelData)   return;
                var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,id)[jsonTables.CONFIG_MONSTER.Icon];
                uiResMgr.loadHeadIcon( iconRes,this.reelIcon);
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
                var quality = config[jsonTables.CONFIG_MONSTER.Form];
                uiResMgr.loadReelBaseQualityIcon(quality,this.reelFrame);
                break;
            case constant.ItemType.CARD://英雄碎片
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,id);//家族配置表基本数据
                if(!baseData)   return;
                var tid = baseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
                var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid)[jsonTables.CONFIG_MONSTER.Icon];
                uiResMgr.loadHeadIcon(iconRes,iconNode);
                break;
            case constant.ItemType.BOX://宝箱
                uiResMgr.loadLockTreasureBox(id,iconNode);
                break;
            case constant.ItemType.RANDOM_HERO://随机碎片
            case constant.ItemType.RANDOM_HERO_MAX://随机碎片
                uiResMgr.loadHeadIcon( "random" + id,iconNode);
                break;
            case constant.ItemType.RANDOM_REEL://随机卷轴碎片
            case constant.ItemType.RANDOM_REEL_MAX://随机卷轴碎片
                if(id >= 10){
                    id = id % 10;
                    iconNode.scale = 1.3;
                }
                uiResMgr.loadFragmentIcon("random"+id,iconNode);
                break;
            case constant.ItemType.ITEM:
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.ITEM,id);
                uiResMgr.loadCommonIcon("activity" + baseData[jsonTables.CONFIG_ITEM.ItemType], iconNode);
                break;
            case constant.ItemType.RANDOM_EQUIP:
                var randomIcon = Math.floor(id / 1000);
                uiResMgr.loadEquipIcon("random"+randomIcon,iconNode);
                break;
        }
    },

    clickSign(){
        if(this.data.state !== constant.SignState.CANGET)   return;
        this.activityLogic.reqActivityRewardRec(this.activityLogic.getSpringSignID(), this.data.Value);
    },



    // update (dt) {},
});
