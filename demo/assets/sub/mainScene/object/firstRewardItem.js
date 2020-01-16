// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        goldNode:cc.Node,
        purpleNode:cc.Node,
        blueNode:cc.Node,
        sprite:cc.Sprite,
        numLabel:cc.Label,
        reelNode:cc.Node,
        reelFrame:cc.Sprite,
        reelSprite:cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    init (idx,data) {
        var reelList = [
            constant.ItemType.REEL
        ]
        this.reelNode.active = kf.inArray(reelList, data.Type);
        this.sprite.node.active = !this.reelNode.active;
        this.numLabel.string = "X" + NP.dealNum(data.Num,constant.NumType.TEN);
        var iconNode = this.sprite;
        var quality = 3;//默认品质为1
        switch (data.Type) {
            case constant.ItemType.GOLD://金币
            case constant.ItemType.DIAMOND://钻石
            case constant.ItemType.VIT://体力
            case constant.ItemType.EXP://金币
                uiResMgr.loadCurrencyIcon(data.Type,this.sprite);
                break;
            case constant.ItemType.HERO://英雄碎片
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.BaseID);//家族配置表基本数据
                if(!baseData)   return;
                var iconRes = baseData[jsonTables.CONFIG_MONSTERFAMILY.FragmentIcon];
                uiResMgr.loadFragmentIcon(iconRes,iconNode);
                quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] + 1;
                break;
            case constant.ItemType.EQUIP://装备
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,data.BaseID);//装备配置表基本数据
                if(!baseData)   return;
                uiResMgr.loadEquipIcon( baseData[jsonTables.CONFIG_EQUIP.Icon],iconNode);
                quality = baseData[jsonTables.CONFIG_EQUIP.Quality];
                break;
            case constant.ItemType.REEL://卷轴
                var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,data.BaseID);//装备配置表基本数据
                if(!reelData)   return;
                var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,data.BaseID)[jsonTables.CONFIG_MONSTER.Icon];
                uiResMgr.loadHeadIcon( iconRes,this.reelSprite);
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
                var quality = config[jsonTables.CONFIG_MONSTER.Form];
                uiResMgr.loadReelBaseQualityIcon(quality,this.reelFrame);
                break;
            case constant.ItemType.CARD://英雄碎片
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.BaseID);//家族配置表基本数据
                if(!baseData)   return;
                var tid = baseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
                var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid)[jsonTables.CONFIG_MONSTER.Icon];
                uiResMgr.loadHeadIcon(iconRes,iconNode);
                quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality] + 1;
                break;
            case constant.ItemType.BOX://英雄碎片
                uiResMgr.loadLockTreasureBox(data.BaseID,iconNode);
                break;
            case constant.ItemType.RANDOM_HERO://随机碎片
            case constant.ItemType.RANDOM_HERO_MAX://随机碎片
                uiResMgr.loadHeadIcon( "random" + data.BaseID,this.reelSprite);
                quality = data.BaseID;
                break;
            case constant.ItemType.RANDOM_REEL://随机卷轴碎片
            case constant.ItemType.RANDOM_REEL_MAX://随机卷轴碎片
                uiResMgr.loadFragmentIcon("random"+data.BaseID,iconNode);
                quality = data.BaseID;
                break;
            case constant.ItemType.ITEM:
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.ITEM,data.BaseID);
                uiResMgr.loadCommonIcon("activity" + baseData[jsonTables.CONFIG_ITEM.ItemType], iconNode);
                break;
            case constant.ItemType.RANDOM_EQUIP:
                var randomIcon = Math.floor(data.BaseID / 1000);
                uiResMgr.loadEquipIcon("random"+randomIcon,iconNode);
                quality = randomIcon;
                break;
        }

        this.goldNode.active = quality === 5;
        this.purpleNode.active = quality === 4;
        this.blueNode.active = !this.goldNode.active && !this.purpleNode.active;

    },

    // update (dt) {},
});
