var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        signItem: [cc.Node],
        rewardFrame: [cc.SpriteFrame],
        bgFrame: [cc.SpriteFrame],
        starFrame: [cc.SpriteFrame],
        allDay:cc.Node,
        timeLabel:cc.Node,
    },

    onLoad () {
    },

    init (data) {
        this.signSevenData = data;
        // this.signSevenData.userData.newSign = [1,2,1,2,1,2,1,1];
        this.signSevenData.userData.newSign = this.resetUserData(this.signSevenData.userData.newSign);
        this.initSignItem();
        this.setActLeftTime();
    },

    getRegisterDay(){
        var now = this.timeLogic.now()-((this.timeLogic.now()+ 8*60*60)%(60*60*24));
        var registerTime = this.userLogic.getBaseData(this.userLogic.Type.Register) - 0;
        var registerTime1 = registerTime-((registerTime + 8*60*60)%(60*60*24));
        var deffeventTime = now - registerTime1;
        return Math.ceil(deffeventTime/(3600*24))
    },

    resetUserData:function(newSignList){
        var signIndex = this.getRegisterDay();
        for(let i = 0;i < signIndex;i++){
            if(newSignList[i] === 1 ){
                newSignList[i] = 3
            }
        }
        return newSignList
    },

    initSignItem: function () {
        this.rewardPrefab = uiResMgr.getPrefabSelf("rewardItem");
        var signData = this.signSevenData.serverData.ActRewards;
        var userData = this.signSevenData.userData.newSign;
        signData.sort(function (a,b) {
            return a.Value - b.Value;
        })
        for (var i = 0; i < this.signItem.length; i++) {
            var obj = this.signItem[i];
            var dailyData = signData[i];
            if(i === 1) {
                this.setMonItemData(obj, dailyData, userData[i]);
            }
            else if(i !== this.signItem.length - 1)
                this.setSignItemData(obj, dailyData, userData[i]);
            else {
                this.setEquipItemData(obj, dailyData, userData[i]);
            }
                // this.setSignItemData(obj, dailyData, userData[i]);
        }
        this.setAllDayItemData(this.allDay,signData[signData.length - 1], userData[userData.length - 1]);
    },

    setAllDayItemData: function (node, data, isSign) {
        cc.find("today", node).getComponent(cc.Sprite).spriteFrame = isSign === constant.RecState.CAN ? this.bgFrame[1] : this.bgFrame[0];
        cc.find("maskDay", node).active = isSign === constant.RecState.DONE;
        var stateNode = cc.find("label", node);
        var userData = this.signSevenData.userData.newSign;
        var signTimes = 0;
        for(let i = 0;i<userData.length-1;i++){
           if(userData[i] === 2) {
               signTimes++
           }
        }
        stateNode.getComponent(cc.Label).string = "已签："+signTimes+"/"+"7"
    },

    setSignItemData: function (node, data, isSign) {
        var timeNode = cc.find("time", node);
        timeNode.getComponent(cc.Label).string = uiLang.getMessage("shopMonCardItem","day"+(data.Value - 1));
        timeNode.color = isSign === constant.RecState.CAN ? uiColor.actSignSevent.canRecTimeColor : uiColor.actSignSevent.canotRecColor;
        var rewardItem = cc.find("rewardItem", node).getComponent("rewardItem");
        rewardItem.initEx(null, data.Rewards[0], true);
        cc.find("today", node).getComponent(cc.Sprite).spriteFrame = isSign === constant.RecState.CAN ? this.bgFrame[1] : this.bgFrame[0];
        cc.find("maskDay", node).active = isSign === constant.RecState.DONE;
        var stateNode = cc.find("label", node);
        stateNode.getComponent(cc.Label).string = isSign === constant.RecState.DONE ?
            uiLang.getMessage(this.node.name,"doneSign") : (isSign === constant.RecState.CAN ?
            uiLang.getMessage(this.node.name,"canSign") : uiLang.getMessage(this.node.name,"canotSign"));
        if(isSign ===3){
            stateNode.getComponent(cc.Label).string = "补签"
        }
        stateNode.color = isSign === constant.RecState.CAN ? uiColor.actSignSevent.canRecStateColor : uiColor.actSignSevent.canotRecColor;
    },

    //第二天是单独的整卡
    setMonItemData: function (node, data, isSign) {
        var timeNode = cc.find("time", node);
        timeNode.getComponent(cc.Label).string = uiLang.getMessage("shopMonCardItem","day"+(data.Value - 1));
        timeNode.color = isSign === constant.RecState.CAN ? uiColor.actSignSevent.canRecTimeColor : uiColor.actSignSevent.canotRecColor;
        cc.find("today", node).getComponent(cc.Sprite).spriteFrame = isSign === constant.RecState.CAN ? this.bgFrame[1] : this.bgFrame[0];
        cc.find("maskDay", node).active = isSign === constant.RecState.DONE;
        cc.find("sGlow", node).active = isSign !== constant.RecState.DONE;
        var stateNode = cc.find("label", node);
        stateNode.getComponent(cc.Label).string = isSign === constant.RecState.DONE ?
            uiLang.getMessage(this.node.name,"doneSign") : (isSign === constant.RecState.CAN ?
            uiLang.getMessage(this.node.name,"canSign") : uiLang.getMessage(this.node.name,"canotSign"));
        if(isSign ===3){
            stateNode.getComponent(cc.Label).string = "补签"
        }
        stateNode.color = isSign === constant.RecState.CAN ? uiColor.actSignSevent.canRecStateColor : uiColor.actSignSevent.canotRecColor;

        var monSpine = cc.find("rewardItem/monSpine", node).getComponent(sp.Skeleton);
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,data.Rewards[0].BaseID);
        var tid = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
        var spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);

        var callback = function (spineData) {
            monSpine.skeletonData  = spineData;
            monSpine.setAnimation(0,'std',true);
        }.bind(this);
        uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callback);
    },

    //第七天是特殊装备
    setEquipItemData: function (node, data, isSign) {
        var timeNode = cc.find("time", node);
        timeNode.getComponent(cc.Label).string = uiLang.getMessage("shopMonCardItem","day"+(data.Value - 1));
        timeNode.color = isSign === constant.RecState.CAN ? uiColor.actSignSevent.canRecTimeColor : uiColor.actSignSevent.canotRecColor;
        cc.find("today", node).getComponent(cc.Sprite).spriteFrame = isSign === constant.RecState.CAN ? this.bgFrame[1] : this.bgFrame[0];
        cc.find("maskDay", node).active = isSign === constant.RecState.DONE;
        cc.find("lGlow", node).active = isSign !== constant.RecState.DONE;
        var stateNode = cc.find("label", node);
        stateNode.getComponent(cc.Label).string = isSign === constant.RecState.DONE ?
            uiLang.getMessage(this.node.name,"doneSign") : (isSign === constant.RecState.CAN ?
            uiLang.getMessage(this.node.name,"canSign") : uiLang.getMessage(this.node.name,"canotSign"));
        stateNode.color = isSign === constant.RecState.CAN ? uiColor.actSignSevent.canRecStateColor : uiColor.actSignSevent.canotRecColor;

        var iconNode = cc.find("rewardItem/equipItem/icon", node);
        var iconFrame = cc.find("rewardItem/equipItem/iconFrame", node);
        var starItem = cc.find("rewardItem/equipItem/starItem", node);
        var starContent = cc.find("rewardItem/equipItem/starContent", node);
        var labelItem = cc.find("rewardItem/label", node);
        var content = cc.find("rewardItem/layout", node);
        var equipData = data.Rewards[0].Equip;
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,equipData.BaseID);
        uiResMgr.loadEquipIcon( baseData[jsonTables.CONFIG_EQUIP.Icon],iconNode);
        var quality = baseData[jsonTables.CONFIG_EQUIP.Quality];
        uiResMgr.loadEquipBaseIcon(quality,iconFrame);
        this.refreshStar(equipData.AttrInfos, starContent, starItem);
        
        this.refreshLabel(equipData.AttrInfos,content, labelItem);
    },

    //刷新装备星星数量
    refreshStar:function (list, starContent, starItem) {
        var starNum = 0;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(obj.Color){
                starNum ++;
            }
        }
        var content = starContent;
        var msgItem;
        for (var i = 0 , len = starNum; i < len; i++) {
            if(content.children[i]){
                msgItem = content.children[i];
            }else{
                msgItem = cc.instantiate(starItem);
                msgItem.parent = content;
            }
            msgItem.active = true;
        }
        if(content.children.length > starNum) {
            for(var j = starNum; j < content.children.length; ) {
                var node = content.children[j];
                node.removeFromParent();
                node.destroy();
            }
        }
    },

    //显示装备属性
    refreshLabel:function (list,content,labelItem) {
        list.sort(function (a,b) {
            return  b.Color - a.Color
        });
        content.removeAllChildren(true);
        var msgItem;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(content.children[i]){
                msgItem = content.children[i];
            }else{
                msgItem = cc.instantiate(labelItem);
                msgItem.parent = content;
            }
            msgItem.active = true;
            var valueStr = this.equipLogic.getDataStr(obj);
            msgItem.getChildByName("square").getComponent(cc.Sprite).spriteFrame = obj.Color?this.starFrame[1]:this.starFrame[0];
            var labelNode = msgItem.getChildByName("data");
            labelNode.getComponent(cc.Label).string = valueStr;
            labelNode.color = obj.Color?uiColor.equipColor.special:uiColor.equipColor.common;
        }
        if(content.children.length > list.length) {
            for(var j = list.length; j < content.children.length; ) {
                var node = content.children[j];
                node.removeFromParent();
                node.destroy();
            }
        }
    },
    
    clickReceive: function (event,cusData) {
        var data = parseInt(cusData);
        var userData = this.signSevenData.userData.newSign;
        var signState = userData[data];
        switch (signState) {
            case constant.RecState.CAN:
                this.activityLogic.reqActivityRewardRec(this.signSevenData.serverData.ID, data + 1);
                break;
            case constant.RecState.DONE:
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name, "tipDoneSign"));
                break;
            case constant.RecState.CANT:
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name, "tipCannotSign"));
                break;
            case constant.RecState.TIME_OUT:
                var cb = function(){
                    this.activityLogic.reqActivityRewardRec(this.signSevenData.serverData.ID, data + 1);
                };
                var diamond = this.activityLogic.SupplySignCost;
                var str = "是否花费"+diamond+"<img src='diamond' />进行补签?";
                uiManager.msgDefault(str, cb.bind(this));
                break;
        }
    },

    setActLeftTime: function () {
        var offTime = this.signSevenData.serverData.EndTime.toNumber() - this.timeLogic.now();
        var offDay = Math.floor(offTime/(24*60*60));
        this.needUpdateLeft = offTime < 3600 * 24;
        var timeList = "";
        if(offTime>0) {
            if(this.needUpdateLeft) {
                timeList = "剩余时间："+this.timeLogic.getCommonCoolTime(offTime);
            }
            else {
                timeList = "剩余时间："+ offDay + "天";
            }
        }
        this.timeLabel.getComponent(cc.Label).string  = timeList;
    },

    update: function (dt) {
        this.duration += dt;
        if (this.duration < 1) return;
        this.duration -= 1;
        if(this.needUpdateLeft){
            this.setActLeftTime()
        }
    }
});
