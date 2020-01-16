var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        proRunTime:2,
        interval:0.05,
        equipContent:cc.Prefab,
        equipPrefab:cc.Prefab,
        addNum:5,
        blueFrame:[cc.SpriteFrame],
        labelPrefab:cc.Node,
        starFrame:[cc.SpriteFrame],
        arrowPos:[cc.Vec2],
        desEx:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.labelPrefab.active = false;
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.maxEquipNum = 10;
        this.rowNum = 4;
        this.ani = this.widget("equipUp/shrink/effect").getComponent(cc.Animation);
        this.aniItem = this.widget("equipUp/shrink/glow").getComponent(cc.Animation);
        this.ani.node.active = false;
        this.aniItem.node.active = false;
        this.ani.on(constant.AnimationState.FINISHED,this.onFinished.bind(this));
        // this.widget("equipUp/shrink/right/btnContent/addBtn").active = false;
        this.progressjS = this.widget("equipUp/shrink/left/bottom/progressBar1").getComponent("progressAni");
    },
    registerEvent: function () {
        var registerHandler = [
            ["refreshEquip", this.refreshEquip.bind(this),true],
            ["refreshNextArrt", this.refreshNextArrt.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["light", this.light.bind(this)],
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    light:function (event) {
        event.stopPropagation();
        this.equipLogic.req_Equip_LvUp(this.curID,this.useID);
        this.widget("equipUp/shrink/left/bottom/progressBar1/bar1").getComponent(cc.Sprite).spriteFrame = this.blueFrame[1];
    },
    onFinished:function(event,param){
        if (event !== constant.AnimationState.FINISHED || param.name !== "lightAnimation") return;
        this.useID = [];
        this.ani.node.active = false;
        this.preloadLogic.changeListenReturn(true);
    },
    open:function(ID){
        this.curID = ID;
        this.curData = this.equipLogic.getDataByID(this.curID);
        this.maxEquipNum = this.equipLogic.getBagMax();
        var config = this.equipLogic.getDataByID(this.curID);
        this.curConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,config.BaseID);//装备配置表基本数据
        this.refreshEquip(true);
        this.widget("equipUp/block").active = false;
        this.widget("equipUp/shrink/effect").active = false;
        this.widget("equipUp/shrink/left/bottom/progressBar1/bar1").getComponent(cc.Sprite).spriteFrame = this.blueFrame[0];
        this.touchEnble = true;
    },

    refreshAddExp:function(){
        this.allAdd = 0;
        for (var i = 0 , len = this.useIntenData.length; i < len; i++) {
            var obj = this.useIntenData[i];
            var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,obj.BaseID);//装备配置表基本数据
            var equipLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP_LV,baseData[jsonTables.CONFIG_EQUIP.Quality],obj.Lv);
            this.allAdd +=equipLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpProvide];
        }
        this.widget("equipUp/shrink/left/bottom/experienceLabel/numberLabel").getComponent(cc.Label).string = (this.curData.Exp + this.allAdd) + "/" + this.curLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
        var progress = (this.curData.Exp + this.allAdd) / this.curLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
        this.widget("equipUp/shrink/left/bottom/progressBar").getComponent(cc.ProgressBar).progress =  progress;
        if(progress >= 1){
            this.equipLogic.req_Equip_LvAttr(this.curData.ID,this.allAdd);
        }else{
            this.refreshDesc(this.curData)
        }
    },

    refreshEquip:function(refreshNow,notRefrshUI){
        this.closeDescEx();
        if(notRefrshUI){
            this.bagData = this.equipLogic.getBagData();
            this.refreshData =[];
            for (var i = 0 , len = this.bagData.length; i < len; i++) {
                var obj = this.bagData[i];
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,obj.BaseID);//装备配置表基本数据
                obj.BaseData = config;
                if(obj.ID === this.curID || config[jsonTables.CONFIG_EQUIP.Type] >= tb.EQUIP_DSWEAPON)  continue;//时装或者是被强化装备忽略
                this.refreshData.push(obj);
            }
            this.refreshBag(this.refreshData,true);
        }else{
            this.lastID = undefined;
            this.lastNode = undefined;
            this.useIntenData = [];
            this.bagData = this.equipLogic.getBagData();
            this.refreshData =[];
            for (var i = 0 , len = this.bagData.length; i < len; i++) {
                var obj = this.bagData[i];
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,obj.BaseID);//装备配置表基本数据
                obj.BaseData = config;
                if(obj.ID === this.curID || config[jsonTables.CONFIG_EQUIP.Type] >= tb.EQUIP_DSWEAPON || obj.Lock)  continue;//时装或者是被强化装备忽略
                this.refreshData.push(obj);
            }
            this.refreshBag(this.refreshData);
            this.refreshUseInter(this.useIntenData,this.widget("equipUp/shrink/left/content"),this.addNum);
            this.curData = this.equipLogic.getDataByID(this.curID);
            this.curLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP_LV,this.curConfig[jsonTables.CONFIG_EQUIP.Quality],this.curData.Lv);
            // this.widget("equipUp/shrink/left/islands/equipItem/gradeLabel").getComponent(cc.Label).string ="LV" + this.curData.Lv;
            // this.widget("equipUp/shrink/left/bottom/progressBar1").getComponent(cc.ProgressBar).progress =  this.curData.Exp / this.curLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
            this.curData.BaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,this.curData.BaseID);//装备配置表基本数据
            this.widget("equipUp/shrink/left/islands/equipItem").getComponent("equipItem").init(0,this.curData);
            this.clickUpItem();
            if(refreshNow){//立即刷新
                this._initFlag = false;
                this.curLv = this.curData.Lv;
                this.curExp = this.curData.Exp;
                this.curExpMax = this.curLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
                this.toLv = this.curData.Lv;
                this.toExp = this.curData.Exp;
                this.toExpMax = this.curLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
                this.widget("equipUp/shrink/left/bottom/progressBar1").getComponent(cc.ProgressBar).progress = this.curExp / this.curExpMax;
                this.widget("equipUp/shrink/left/islands/equipItem/gradeLabel").getComponent(cc.Label).string ="LV" + this.curLv;
                this.refreshAddExp();
                return;
            }
            this.toLv = this.curData.Lv;
            this.toExp = this.curData.Exp;
            this.toExpMax = this.curLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
            this.playExpProgress();
        }

    },
    playExpProgress:function(){
        var data = {};
        data.callBack = this.progressCb.bind(this);
        data.progressCb = this.updateExpLabel.bind(this);
        data.curProgress = this.curExp / this.curExpMax;
        data.interval = this.interval;
        if(this.curLv === this.toLv){//没有升级
            data.costTime = this.proRunTime * (this.toExp - this.curExp) / this.curExpMax;//花费总时间
            data.allProgress = this.toExp / this.curExpMax;
        }else{//升级了
            data.costTime = this.proRunTime * (this.curExpMax - this.curExp) / this.curExpMax;//花费总时间
            data.allProgress = 1;
        }
        this.progressjS.setData(data);
    },

    updateExpLabel:function(progress,addProgress){
        var addExp = Math.floor(this.curExpMax * addProgress);
        this.allAdd = this.allAdd - addExp > 0?this.allAdd - addExp:0;
        this.widget("equipUp/shrink/left/bottom/experienceLabel/numberLabel").getComponent(cc.Label).string = this.allAdd;
    },
    progressCb:function(){
        if(this.curLv === this.toLv){//进度结束
            this.curExp = this.toExp;
            this.allAdd = 0;
            this.widget("equipUp/shrink/left/bottom/experienceLabel/numberLabel").getComponent(cc.Label).string = this.toExp + "/" + this.toExpMax;
            this.touchEnble = true;
            this.widget("equipUp/block").active = false;
            this.widget("equipUp/shrink/left/bottom/progressBar1/bar1").getComponent(cc.Sprite).spriteFrame = this.blueFrame[0];
        }else{//上一级跑满了
            this.curLv = this.toLv;
            this.widget("equipUp/shrink/left/islands/equipItem/gradeLabel").getComponent(cc.Label).string ="LV" + this.curLv;
            this.aniItem.node.active = true;
            this.aniItem.play();
            this.curExpMax = this.toExpMax;
            this.curExp = 0;
            this.widget("equipUp/shrink/left/bottom/progressBar").getComponent(cc.ProgressBar).progress =  this.toExp / this.toExpMax;
            if(this.toExp === 0){//刚刚好，结束了
                this.allAdd = 0;
                this.widget("equipUp/shrink/left/bottom/experienceLabel/numberLabel").getComponent(cc.Label).string =  this.toExp + "/" + this.toExpMax;
                this.widget("equipUp/shrink/left/bottom/progressBar1").getComponent(cc.ProgressBar).progress = 0;
                this.touchEnble = true;
                this.widget("equipUp/block").active = false;
                this.widget("equipUp/shrink/left/bottom/progressBar1/bar1").getComponent(cc.Sprite).spriteFrame = this.blueFrame[0];
                return;
            }
            var data = {};
            data.callBack = this.progressCb.bind(this);
            data.progressCb = this.updateExpLabel.bind(this);
            data.curProgress = this.curExp / this.curExpMax;
            data.costTime = this.proRunTime * (this.toExp - this.curExp) / this.curExpMax;//花费总时间
            data.allProgress = this.toExp / this.curExpMax;
            this.progressjS.setData(data);
        }

    },
    refreshUseInter:function(bagData,content,max){
        var list = [];
         for (var i = 0; i < max; i++) {
             list[i] = bagData[i]?bagData[i]:{};
             list[i].isSpecial = false;
         }
         var refreshData = {
             content:content,
             list:list,
             prefab:this.equipPrefab
         }
         uiManager.refreshView(refreshData);
    },
    refreshBag:function(bagData,norefreshUI){
        var list = [];
        for (var i = 0; i < this.maxEquipNum; i++) {
            list[i] = bagData[i]?bagData[i]:{};
            if(list[i].BaseID){
                list[i].BaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,list[i].BaseID);//装备配置表基本数据
                list[i].isSpecial = true;
            }
        }
        this.sortAndDeal(list,norefreshUI);
    },
    //排序并处理成5个一个的数组
    sortAndDeal:function(arr,norefreshUI){
        arr.sort(function(a,b){
            if(!a.BaseID)   return 1;
            if(!b.BaseID)   return -1;
            if(a.BaseData[jsonTables.CONFIG_EQUIP.Quality] !== b.BaseData[jsonTables.CONFIG_EQUIP.Quality]){
                return  a.BaseData[jsonTables.CONFIG_EQUIP.Quality] - b.BaseData[jsonTables.CONFIG_EQUIP.Quality]
            }
            if(a.BaseData[jsonTables.CONFIG_EQUIP.Type] !== b.BaseData[jsonTables.CONFIG_EQUIP.Type]){
                return  a.BaseData[jsonTables.CONFIG_EQUIP.Type] - b.BaseData[jsonTables.CONFIG_EQUIP.Type]
            }
            return 0;
        })
        var num = 0;
        var data = [];
        var dataChild = [];
        for (var i = 0 , len = arr.length; i < len; i++) {
            var obj = arr[i];
            dataChild.push(obj);
            num ++;
            if(num === this.rowNum || i === len - 1){
                num = 0;
                data.push(dataChild);
                dataChild = [];
            }
        }
        if(norefreshUI){//点击新装备，去除标记
            this.widget("equipUp/shrink/right/scrollView").getComponent("listView").updateItemData(data,true);
        }else{
            var viewData = {
                totalCount:data.length,
                spacing:0
            };
            this.widget("equipUp/shrink/right/scrollView").getComponent("listView").init(this.equipContent,viewData,data,0,this.checkInter.bind(this));
        }

    },

    checkInter:function(id){
        for (var i = 0 , len = this.useIntenData.length; i < len; i++) {
            var obj = this.useIntenData[i];
            if(id !== obj.ID)   continue;
            return 2;
        }
        if(this.lastID === id)  return 1;
        return 0;
    },

    returnBtn:function(){
        uiManager.closeUI(uiManager.UIID.equipUp);
    },
    clickItem:function(event){
        if(!this.touchEnble)    return;
        event.stopPropagation();
        var data = event.getUserData();
        if(data.data.ID === this.curData.ID || data.data.ID === undefined){
            this.closeDescEx();
            return;
        }else{
            if(data.isSpecial){
                this.clickSpecial(data);//点击背包里的物品
                this.closeDescEx();
            }else{
                this._clickItem(data);
            }
        }
    },
    clickSpecial:function(data){
        this.lastID = data.data.ID;
        if(!data.node.getChildByName("equipmentMask"))  return;
        if(this.lastNode){
            this.lastNode.getChildByName("on").active = false;
        }
        if(data.node.getChildByName("equipmentMask").active){
            this.downEvent("",true);
            data.node.getChildByName("equipmentMask").active = false;
            data.node.getChildByName("on").active = true;
            // this.refreshDescEx(data.data,data.idx);
            this.lastNode = data.node;
        }else{
            if(this.useIntenData.length >= 5){
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"fullUseInten"));
                this.lastID = undefined;
                return;
            }
            data.node.getChildByName("equipmentMask").active = true;
            // this.widget("equipUp/shrink/right/btnContent/addBtn").active = this.lastID !== this.curID && !data.isInstall;
            this.addEvent("",true);
            this.lastID = undefined;
            this.lastNode = undefined;
        }
        // this.widget("equipUp/shrink/right/btnContent/downBtn").active = false;
        // this.widget("equipUp/shrink/right/btnContent/upBtn").active = true;
        // this.refreshDescEx(data.data,data.idx);
    },
    _clickItem:function(data,special){
        if(data.data.ID && this.lastID === data.data.ID && data.data.ID !== this.curID && !data.isInstall){//双击同一件装备
            if(this.useIntenData.length >= 5){
                uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"fullUseInten"));
                return;
            }
        }
        if(this.lastNode){
            this.lastNode.getChildByName("on").active = false;
        }
        data.node.getChildByName("on").active = true;
        this.lastNode = data.node;
        var lastId = this.lastID;
        this.lastID = data.data.ID;//
        // this.widget("equipUp/shrink/right/btnContent/addBtn").active = this.lastID !== this.curID && !data.isInstall;
        // this.widget("equipUp/shrink/right/btnContent/downBtn").active = this.lastID !== this.curID && data.isInstall;
        // this.widget("equipUp/shrink/right/btnContent/upBtn").active = this.lastID === this.curID;
        if(this.lastID){
            this.refreshDescEx(data.data,data.idx);
        }
        if(data.data.ID && lastId === data.data.ID && data.data.ID !== this.curID){//双击同一件装备
            if(data.isInstall){//已经在上面的要卸下
                this.downEvent();
            }else{
                this.addEvent();
            }
            this.closeDescEx();
            // this.lastNode = undefined;
        }

    },

    refreshDescEx:function (data,idx) {
        this.desEx.active = true;
        this.widget("equipUp/shrink/left/bgEquipData/equipDataArrow").position = this.arrowPos[idx];
        this.refreshLabel(data.AttrInfos,this.widget('equipUp/shrink/left/bgEquipData/data/view/content'));//刷新属性
    },

    closeDescEx:function () {
        this.desEx.active = false;
        if(this.lastNode){
            this.lastNode.getChildByName("on").active = false;
        }
        this.lastID = undefined;
        this.lastNode = undefined;
        this.lastData = undefined;
    },
    refreshNextArrt:function (nextData) {
        if(this.curData.ID !== nextData.ID || nextData.exp !== this.allAdd) return;
        this.refreshDesc(this.curData,nextData);
    },
    refreshDesc:function(data,nextData){
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,data.BaseID);//装备配置表基本数据
        var equipLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP_LV,baseData[jsonTables.CONFIG_EQUIP.Quality],data.Lv);
        this.widget("equipUp/shrink/left/frame2/mask/desc/title").getComponent(cc.Label).string =  "【" + uiLang.getConfigTxt(baseData[jsonTables.CONFIG_EQUIP.DesId]) + "】";;
        this.widget("equipUp/shrink/left/frame2/mask/desc/title").color = uiColor.equipTitleColor["quality" + baseData[jsonTables.CONFIG_EQUIP.Quality]];
        this.widget("equipUp/shrink/left/frame2/mask/desc/level/lvLabel").getComponent(cc.Label).string = data.Lv;
        this.widget("equipUp/shrink/left/frame2/mask/desc/level/arrow").active = !!nextData;
        if(!!nextData){
            this.widget("equipUp/shrink/left/frame2/mask/desc/level/arrow/lvLabelNext").getComponent(cc.Label).string = nextData.Lv;
        }
        this.widget("equipUp/shrink/left/frame2/mask/desc/exp/proLabel").getComponent(cc.Label).string = data.Exp +"/"+ equipLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];
        uiResMgr.loadEquipIcon( baseData[jsonTables.CONFIG_EQUIP.Icon],this.widget("equipUp/shrink/left/frame2/mask/desc/item/sword"));
        var quality = baseData[jsonTables.CONFIG_EQUIP.Quality];
        // uiResMgr.loadQualityIcon(quality,this.widget("equipUp/shrink/left/frame2/mask/desc/item/qualityFrame1"));
        uiResMgr.loadEquipBaseIcon(quality,this.widget("equipUp/shrink/left/frame2/mask/desc/item"));
        this.refreshLabel(data.AttrInfos,this.widget('equipUp/shrink/left/frame2/mask/desc/data/view/content'),nextData);//刷新属性 TODO 属性
        // this.widget("eqopUp/shrink/right/desc/strengthenlabel/second/jyLabel").getComponent(cc.Label).string = equipLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpProvide];
    },

    refreshLabel:function (list,content,nextData) {
        list.sort(function (a,b) {
            return  b.Color - a.Color
        });
        var nextAttr;
        if(nextData){
            nextAttr = {};
            for (var i = 0 , len = nextData.AttrInfos.length; i < len; i++) {
                var obj = nextData.AttrInfos[i];
                nextAttr[obj.Type] = obj;
            }
        }
        // var content = this.widget('equipUp/shrink/left/frame2/mask/desc/data/view/content');
        content.removeAllChildren(true);
        var msgItem;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if(content.children[i]){
                msgItem = content.children[i];
            }else{
                msgItem = cc.instantiate(this.labelPrefab);
                msgItem.parent = content;
            }
            msgItem.active = true;
            var valueStr = this.equipLogic.getDataStr(obj);
            msgItem.getChildByName("square").getComponent(cc.Sprite).spriteFrame = obj.Color?this.starFrame[1]:this.starFrame[0];
            var labelNode = msgItem.getChildByName("data");
            labelNode.getComponent(cc.Label).string = valueStr;
            labelNode.color = obj.Color?uiColor.equipColor.special:uiColor.equipColor.common;
            var arrowNode = msgItem.getChildByName("arrow");
            arrowNode.active = false;
            if(nextAttr && nextAttr[obj.Type] && nextAttr[obj.Type].Value !== obj.Value){
                arrowNode.active = true;
                var valueStrEx = this.equipLogic.getDataStrEx(nextAttr[obj.Type]);
                arrowNode.getChildByName("next").getComponent(cc.Label).string = valueStrEx;
            }
        }
        if(content.children.length > list.length) {
            for(var j = list.length; j < content.children.length; ) {
                var node = content.children[j];
                node.removeFromParent();
                node.destroy();
            }
        }
    },

    addEvent:function(event,isSpecial){
        if(!this.lastID)    return;
        if(this.useIntenData.length >= 5){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"fullUseInten"));
            return;
        }
        for (var i = 0 , len = this.refreshData.length; i < len; i++) {
            var obj = this.refreshData[i];
            if(obj.ID !== this.lastID)  continue;
            this.useIntenData.push(kf.clone(this.refreshData[i]));
            break;
        }
        // this.(this.refreshData);
        this.refreshUseInter(this.useIntenData,this.widget("equipUp/shrink/left/content"),this.addNum);
        this.refreshAddExp();
        // if(!isSpecial){
        //     this.clickUpItem();
        // }
    },
    clickUpItem:function(){
        // var data = {
        //     data:this.curData,
        //     isInstall:false,
        //     node:this.widget("equipUp/in/left/islands/equipItem")
        // }
        this.refreshDesc(this.curData);
        // this._clickItem(data);
        this.widget("equipUp/shrink/left/islands/equipItem").getChildByName("on").active = true;
    },
    downEvent:function(event,isSpecial){
        if(!this.lastID)    return;
        for (var i = 0 , len = this.useIntenData.length; i < len; i++) {
            var obj = this.useIntenData[i];
            if(obj.ID !== this.lastID)  continue;
            this.useIntenData.splice(i,1);
            break;
        }
        this.clientEvent.dispatchEvent("downEquip",this.lastID);
        // this.refreshBag(this.refreshData);
        this.refreshUseInter(this.useIntenData,this.widget("equipUp/shrink/left/content"),this.addNum);
        this.refreshAddExp();
        // if(!isSpecial){
        //     this.clickUpItem();
        // }
    },
    upEvent:function(event){
        this.closeDescEx();
        if(this.useIntenData.length === 0){
            uiManager.openUI(uiManager.UIID.TIPMSG, uiLang.getMessage(this.node.name,"noUseInten"));
            return;
        };
        this.useID = [];
        for (var i = 0 , len = 5; i < len; i++) {
            var obj = this.useIntenData[i];
            if(obj){
                this.useID.push(obj.ID);
            }
            this.widget("equipUp/shrink/effect/light" + (i + 1)).active = !!obj;
        }
        this.ani.node.active = true;
        this.ani.play();
        this.preloadLogic.changeListenReturn(false);
        this.widget("equipUp/block").active = true;
        this.touchEnble = false;
    }
    // update (dt) {},
});
