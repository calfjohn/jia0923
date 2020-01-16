var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        equipContent:cc.Prefab,
        labelPrefab:cc.Node,
        detail:cc.Node,
        detailSprite:cc.Sprite,
        detailFrame:[cc.SpriteFrame],
        starFrame:[cc.SpriteFrame],
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.initModule();
        this.registerEvent();
        this.aniArr = ["std","atk","walk"];
        this.maxEquipNum = 10;
        this.rowNum = 4;
        this.resetSpine();
        this.labelPrefab.active = false;
        // this.refreshMainBtnActive();
    },
    registerEvent: function () {
        var registerHandler = [
            // ["refreshMainBtnActive", this.refreshMainBtnActive.bind(this),true],
            ["refreshEquip", this.refreshEquip.bind(this),true],
            ["resetSpine", this.resetSpine.bind(this),true],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
        var registerHandler = [
            [this.dataManager.DATA.ROLE_INFO, this.refreshLeft.bind(this)],
        ]
        this.registerDataEvent(registerHandler);
    },
    initModule:function(){
        this.roleSpineNode = this.widget("equipment/shrink/left/treasure/role/maleWarrior");
    },
    // refreshMainBtnActive:function(){
        // var nodePath = "equipment/shrink/toggleContainer/toggle1";
        // var tid = constant.FunctionTid.TALENT;
        // if (this.widget(nodePath).active) {//如果显示标识未被后台控制
        //     this.widget(nodePath).active = jsonTables.isFunVisible(tid);
        //     if (this.widget(nodePath).active) {
        //         this.widget(nodePath).active = jsonTables.funOpenCheck(tid);
        //     }
        // }
    // },
    open:function(){
        // this.widget("equipment/shrink/desc/btnContent").active = false;
        this.widget("equipment/shrink/desNode").active = false;
        this.detail.active = false;
        this.detailSprite.spriteFrame = this.detailFrame[0];
        this.maxEquipNum = this.equipLogic.getBagMax();
        // this.widget("equipment/shrink/heroInfo/text2").active = false;
        this.refreshEquip();
        this.checkAdJust();
    },

    openTalent:function(){
        uiManager.openUI(uiManager.UIID.TALENTPANEL);
        // this.scheduleOnce(function () {
        //     this.close();
        // }.bind(this),0.1);
    },

    refreshLeft:function(param){
        // this.widget("equipment/shrink/left/treasure/title/levelLabel").getComponent(cc.Label).string ="Lv" + param[this.userLogic.Type.Lv];
        this.widget("equipment/shrink/left/treasure/title/nameLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Name];
        // this.dealLabel("sword",param[this.userLogic.Type.Damage],param[this.userLogic.Type.DamageEx]);
        this.dealLabel("blood",param[this.userLogic.Type.Hp],param[this.userLogic.Type.HpEx]);
        this.dealLabel("phyDamage",param[this.userLogic.Type.PhyAtk],param[this.userLogic.Type.PhyAtkEx]);
        this.dealLabel("magDamage",param[this.userLogic.Type.MagAtk],param[this.userLogic.Type.MagAtkEx]);
        this.dealLabel("damage",param[this.userLogic.Type.Damage],param[this.userLogic.Type.DamageEx]);
        this.dealLabel("phyDefense",param[this.userLogic.Type.PhyDef],param[this.userLogic.Type.PhyDefEx]);
        this.dealLabel("magDefense",param[this.userLogic.Type.MagDef],param[this.userLogic.Type.MagDefEx]);
        // this.dealLabel("monster",param[this.userLogic.Type.HeroKeep],param[this.userLogic.Type.HeroKeepEx]);
        this.widget("equipment/shrink/left/data/bgLabel1/sword/numberLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Atk];
        this.widget("equipment/shrink/left/data/bgLabel2/shield/numberLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Def];

        this.widget("equipment/shrink/left/data/bgLabel3/leadership/content/numberLabel").getComponent(cc.Label).string = param[this.userLogic.Type.Leader];
        this.widget("equipment/shrink/left/data/bgLabel3/leadership/content/addLabel").active = param[this.userLogic.Type.LeaderExt] > 0;
        this.widget("equipment/shrink/left/data/bgLabel3/leadership/content/addLabel").getComponent(cc.Label).string = "+" + param[this.userLogic.Type.LeaderExt];

        this.widget("equipment/shrink/left/data/bgLabel4/monster/content/numberLabel").getComponent(cc.Label).string = param[this.userLogic.Type.HeroKeep];
        this.widget("equipment/shrink/left/data/bgLabel4/monster/content/addLabel").active = param[this.userLogic.Type.HeroKeepEx] > 0;
        this.widget("equipment/shrink/left/data/bgLabel4/monster/content/addLabel").getComponent(cc.Label).string = "+" + param[this.userLogic.Type.HeroKeepEx];
    },

    dealLabel:function(path,num,numEx){
        this.widget("equipment/shrink/left/data/enterHeroInfo/heroInfo/content/" + path + "/content/numberLabel").getComponent(cc.Label).string = num;
        this.widget("equipment/shrink/left/data/enterHeroInfo/heroInfo/content/" + path + "/content/addLabel").active = numEx > 0;
        this.widget("equipment/shrink/left/data/enterHeroInfo/heroInfo/content/" + path + "/content/addLabel").getComponent(cc.Label).string = "+" + numEx;
    },
    resetSpine:function(){
        this.equipLogic.setBaseSpine(this.roleSpineNode);
        this.aniIdx = 0;
    },

    showDetail:function () {
        this.detail.active = !this.detail.active;
        this.detailSprite.spriteFrame = this.detail.active?this.detailFrame[1]:this.detailFrame[0];
    },

    refreshEquip:function(refreshNow,notRefrshUI){
        this.sortArr = this.equipLogic.getSortArr();
        if(notRefrshUI){//不需要刷新UI只需要刷新数据
            var arr = this.equipLogic.getBagData();
            for (var i = 0; i < this.maxEquipNum; i++) {
                arr[i] = arr[i]?arr[i]:{};
                if( arr[i].BaseID){
                    arr[i].SortIdx = this.sortArr.indexOf(arr[i].ID);
                    arr[i].BaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,arr[i].BaseID);//装备配置表基本数据
                }
            }
            arr.sort(function(a,b){
                if(a.SortIdx === undefined)  return 1;
                if(b.SortIdx === undefined)  return -1;
                return  a.SortIdx - b.SortIdx;
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
            this.widget("equipment/shrink/right/scrollView").getComponent("listView").updateItemData(data,true);
        }else{
            this.lastID = undefined;
            this.lastData = undefined;
            this.lastNode = undefined;
            this.widget("equipment/shrink/desNode").active = false;
            this.refreshBag();
            var curEquips = this.equipLogic.getCurEquips();
            var haveEquips = [];//存放我已经装备的部位
            for (var i = 0 , len = curEquips.length; i < len; i++) {
                var obj = curEquips[i];
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,obj.BaseID);//装备配置表基本数据
                obj.BaseData = baseData;
                var type = baseData[jsonTables.CONFIG_EQUIP.Type];//部位
                haveEquips.push(type);
                this.widget("equipment/shrink/left/treasure/equip/equip" + type).getComponent("equipItem").init(0,obj);
                this.widget("equipment/shrink/left/treasure/equip/equip" + type + "/tipReddot").active = false;
            }
            for (var i = 1; i < 9; i++) {
                if(haveEquips.indexOf(i) !== -1)    continue;
                this.widget("equipment/shrink/left/treasure/equip/equip" + i).getComponent("equipItem").init(0,{});
                this.widget("equipment/shrink/left/treasure/equip/equip" + i + "/tipReddot").active = this.equipLogic.checkHaveEquip(i);
            }
        }

        // this.widget("equipment/shrink/heroInfo/text2/scrollView/view/label").getComponent(cc.Label).string = this.equipLogic.getCurAttr();
    },
    // switchTag:function(event){
    //     this.widget("equipment/shrink/labelBg/label").getComponent(cc.Label).string = uiLang.getMessage("equip","tag" + this.UIState);
    //     this.UIState = this.UIState?0:1;
    //     this.widget("equipment/shrink/heroInfo").active = this.UIState !== 0;
    //     this.widget("equipment/shrink/right").active = this.UIState === 0;
    //     this.widget("equipment/shrink/title/label").getComponent(cc.Label).string = uiLang.getMessage("equip","tag" + this.UIState);
    // },
    clickMore:function(){
        // this.widget("equipment/shrink/heroInfo/text2").active = !this.widget("equipment/shrink/heroInfo/text2").active;
    },
    refreshBag:function(){
         var bagData = this.equipLogic.getBagData();
         for (var i = 0; i < this.maxEquipNum; i++) {
             bagData[i] = bagData[i]?bagData[i]:{};
             if( bagData[i].BaseID){
                 bagData[i].SortIdx = this.sortArr.indexOf(bagData[i].ID);
                 bagData[i].BaseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,bagData[i].BaseID);//装备配置表基本数据
             }
         }
         this.sortAndDeal(bagData);
    },
    //排序并处理成3个一个的数组
    sortAndDeal:function(arr){
        arr.sort(function(a,b){
            if(a.SortIdx === undefined)  return 1;
            if(b.SortIdx === undefined)  return -1;
            return  a.SortIdx - b.SortIdx;
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
        var viewData = {
            totalCount:data.length,
            spacing:0,
            rollNow:false,
        };
        this.widget("equipment/shrink/right/scrollView").getComponent("listView").init(this.equipContent,viewData,data,0,this.checkChoose.bind(this));
    },
    returnBtn:function(){
        uiManager.closeUI(uiManager.UIID.EQUIPMENT);
    },
    clickItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        // data.node.getChildByName("on").active = true;
        // if(this.lastNode){
        //     this.lastNode.getChildByName("on").active = false;
        // }
        this.lastNode = data.node;
        if(data.data.ID && this.lastID === data.data.ID){//双击同一件装备
            if(data.isInstall){//穿着的要脱下来
                this.equipLogic.req_Equip_UnWear(data.data.ID);
            }else{//没穿着的要穿上
                this.equipLogic.req_Equip_Wear(data.data.ID);
            }
            this.lastNode = undefined;
            this.lastID = undefined;
            this.lastData = undefined;
        }
        this.lastData = data.data.ID === this.lastID?undefined:data.data;
        this.lastID = data.data.ID === this.lastID?undefined:data.data.ID;
        this.widget("equipment/shrink/desNode").active = this.lastID !== undefined;
        this.widget("equipment/shrink/desNode/window/desc").active = this.lastID !== undefined;
        this.widget("equipment/shrink/desNode/window/desc/btnContent").active = this.lastID !== undefined;
        this.widget("equipment/shrink/desNode/window/desc/btnContent/installBtn").active = !data.isInstall;
        this.widget("equipment/shrink/desNode/window/desc/btnContent/sellBtn").active = !data.isInstall;
        this.widget("equipment/shrink/desNode/window/desc/btnContent/btnUninstall").active = data.isInstall;
        this.widget("equipment/shrink/desNode/window/desc/btnContent/upBtn").active = data.type < tb.EQUIP_DSWEAPON;
        if(this.lastID){
            this.refreshdesc(data.data,this.widget("equipment/shrink/desNode/window/desc"),true);
            this.widget("equipment/shrink/desNode/window/desc0").active = !data.isInstall;
            if(!data.isInstall){
                var posData = this.equipLogic.equipGetPosData(data.data.BaseData[jsonTables.CONFIG_EQUIP.Type]);
                this.widget("equipment/shrink/desNode/window/desc0").active = !!posData;
                if(posData){
                    this.refreshdesc(posData,this.widget("equipment/shrink/desNode/window/desc0"),false);
                }
            }
        }else{
            this.widget("equipment/shrink/desNode/window/desc0").active = false;
        }
    },

    closeDesr:function(){
        this.widget("equipment/shrink/desNode").active = false;
        this.lastNode = undefined;
        this.lastID = undefined;
        this.lastData = undefined;
    },

    refreshdesc:function(data,node,isRight){
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,data.BaseID);//装备配置表基本数据
        node.getChildByName("title").getComponent(cc.Label).string = uiLang.getConfigTxt(baseData[jsonTables.CONFIG_EQUIP.DesId]);
        node.getChildByName("title").color = uiColor.equipTitleColor["quality" + baseData[jsonTables.CONFIG_EQUIP.Quality]];
        uiResMgr.loadEquipIcon(baseData[jsonTables.CONFIG_EQUIP.Icon],node.getChildByName("item").getChildByName("sword"));
        // uiResMgr.loadQualityIcon(baseData[jsonTables.CONFIG_EQUIP.Quality],this.widget("equipment/shrink/desc/item/qualityFrame1"));
        uiResMgr.loadEquipBaseIcon(baseData[jsonTables.CONFIG_EQUIP.Quality],node.getChildByName("item"));

        var equipLvConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP_LV,baseData[jsonTables.CONFIG_EQUIP.Quality],data.Lv);
        // this.widget("equipment/shrink/desc/strengthenlabel/first/quality").getComponent(cc.Label).string =  "【" + uiLang.getConfigTxt(baseData[jsonTables.CONFIG_EQUIP.DesId]) + "】";;
        node.getChildByName("level").getChildByName("lvLabel").getComponent(cc.Label).string = data.Lv;
        node.getChildByName("exp").getChildByName("proLabel").getComponent(cc.Label).string = data.Exp +"/"+ equipLvConfig[jsonTables.CONFIG_EQUIP_LV.ExpNeed];

        this.refreshLabel(data.AttrInfos,node.getChildByName("data").getChildByName("view").getChildByName("content"));//刷新属性
        if(isRight){
            this.widget("equipment/shrink/desNode/window/desc/lock/unlock").active = !data.Lock;
        }
    },

    refreshLabel:function (list,content) {
        list.sort(function (a,b) {
            return  b.Color - a.Color
        });
        // var content = this.widget('equipment/shrink/desc/data/view/content');
        var msgItem;
        content.removeAllChildren(true);
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
        }
        if(content.children.length > list.length) {
            for(var j = list.length; j < content.children.length; ) {
                var node = content.children[j];
                node.removeFromParent();
                node.destroy();
            }
        }
    },
    //整理背包
    resetEquip:function () {
        this.equipLogic.req_Equip_Sort();
    },
    //点击上锁
    clickLock:function () {
        if(!this.lastID)    return;
        this.equipLogic.req_Equip_Lock(this.lastID,!this.lastData.Lock);
        this.widget("equipment/shrink/desNode/window/desc/lock/unlock").active = this.lastData.Lock;
        this.lastData.Lock = !this.lastData.Lock;
        this.lastNode.getChildByName("lock").active = this.lastData.Lock;
    },

    checkChoose:function(id){
        if(id === this.lastID)  return 1;
        return 0;
    },

    installEvent:function(event){
        if(!this.lastID)    return;
        this.equipLogic.req_Equip_Wear(this.lastID);
    },
    unInstallEvent:function(event){
        if(!this.lastID)    return;
        this.equipLogic.req_Equip_UnWear(this.lastID);
    },
    switchSpineAni:function(event){
        this.aniIdx ++;
        if(this.aniIdx >= this.aniArr.length){
            this.aniIdx = 0;
        }
        this.roleSpineNode.getComponent(sp.Skeleton).setAnimation(0,this.aniArr[this.aniIdx],true);
    },
    upEvent:function(event){
        if(!this.lastID)    return;
        uiManager.openUI(uiManager.UIID.EQUIPUP,this.lastID);
    },
    shopEvent:function() {
        uiManager.openUI(uiManager.UIID.SHOPPANEL);
    },
    sellEvent:function(){
        if(!this.lastID)    return;
        var callback = function () {
            this.equipLogic.req_Equip_Sell(this.lastID);
        };
        var sellArr = this.lastData.BaseData[jsonTables.CONFIG_EQUIP.SePrice].split("#");
        var price = this.formulaLogic.calculateEquipSell(sellArr[2],this.lastData.Lv);
        var str = uiLang.getMessage("equip","sell") + price + " " + rText.getMsgCurrency(parseInt(sellArr[0]));
        uiManager.msgDefault(str,callback.bind(this));
    },

    //特殊打点需求
    checkAdJust: function () {
        if(!this.chapterLogic.getEquipChapterID) return;
        window.adjustUtil.recored(tb.ADJUST_RECORED_EQUIP_OPEN,this.chapterLogic.getEquipChapterID);
        this.chapterLogic.getEquipChapterID = null;
    }
    // update (dt) {},
});
