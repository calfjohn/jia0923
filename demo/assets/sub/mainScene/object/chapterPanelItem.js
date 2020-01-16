var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        lockKeyPrefab:cc.Prefab,
        rewardItem:cc.Prefab,
        bossLight:cc.Prefab,
        finger:cc.Node,
        fingerWorld:cc.Prefab,
        guideGlow: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        jsonTables.parsePrefab(this);
        this.preItemName = "";
        this.finger.zIndex = 100;
    },

    _parseNode:function(node,data){
        node.position = data.pos;
        node.rotation = data.rota;
        if (node.name === "lock") {
            node.scaleX = this.node.scaleX > 0 ? data.scaleX : -data.scaleX;
        }else {
            node.scaleX = data.scaleX;
        }
        node.scaleY = data.scaleY;
        if (data.zIndex || data.zIndex === 0) {
            node.zIndex = (data.zIndex + 1) * 10;
        }
        node.opacity = data.opacity !== undefined ? data.opacity : 255;
        if (data.spineName) {
        }else if (data.spriteFrame) {
            if (node.name.indexOf("bg") !== -1) {
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CHAPTERSTYLE,this.id);
                var path = "chapter"+config[jsonTables.CONFIG_CHAPTERSTYLE.Scene];
                uiResMgr.loadChapterLandStyle((path +"/" + data.spriteFrame),node);
                node.scaleX = node.scaleX * 2;
                node.scaleY = node.scaleY * 2;
            }
        }
    },

    init:function(idx,data,script,isOpen){
        this.finger.active = false;
        this.data = data;
        this.isOpen = script.isOpen;
        if (script) {
            this.id = script.id;
        }
        this.guideGlow.active = false;
        this._parseNode(this.node,this.data.nodeInfo);

        this.isDecorate = data.isDecorate;

        this.scaleNode = Math.abs(this.node.scale);
        var name = this.isDecorate ? "decorate" : "chapterBase";
        if (this.preItemName !== name) {
            if (this.preItemName) {
                var node = this.node.getChildByName(this.preItemName);
                node.removeFromParent();
                node.destroy();
            }
        }
        this.preItemName = name;

        if (this.data.monsterID) {
            this.chapterID = Number(this.data.monsterID) || 0;
        }

        this.chapterrPanelExJs = script;
        this.rewardList = [];
        this.bossFlag = false;
        this.dairyCowFlag = false;
        var callBack = function(prefab){
            var node = this.node.getInstance(prefab,true);
            this.loadNodeCallBack(node);
            if (this.isDecorate) return;
            // if (script) {
            //     script.done();
            // }
        }
        this.scheduleOnce(function(){
            uiResMgr.loadChapterPrefab(this.preItemName,callBack.bind(this));
        },0)
        if (this.isDecorate) return;
        if (script) {
            script.add(this);
        }
        if(this.node.getChildByName("findWeaker")){
            this.node.getChildByName("findWeaker").active = false;
        }
    },

    loadNodeCallBack:function(node){
        var configData = this.data.children;
        var maxBgNum = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.ChapterBgNum);
        for (var i = 0 , len = maxBgNum; i <  len; i++) {
            var idx = 1 + i;
            var bgNode = node.getChildByName("bg"+idx);
            if (bgNode) {
                bgNode.active = false;
            }
        }
        if(!configData["bg"] && node.getChildByName("bg")){
            node.getChildByName("bg").active = false;
        }
        this.dairyCowFlag = false;
        node.setContentSize(this.node.getContentSize());
        for (var nodeName in configData) {
            if (!configData.hasOwnProperty(nodeName)) continue;
            var data = configData[nodeName];
            var nodeChild = node.getChildByName(nodeName);
            if (nodeChild) {
                nodeChild.active = true;
                this._parseNode(nodeChild,data);
            }else {
                if (nodeName.indexOf("bg") !== -1) {
                    var bgNode = node.getChildByName("bg");
                    if(!bgNode){//加个保护
                        bgNode = node.getChildByName("bg1");
                    }
                    var copyBgNode = cc.instantiate(bgNode);
                    copyBgNode.active = true;
                    copyBgNode.name = nodeName;
                    copyBgNode.parent = bgNode.parent;
                    this._parseNode(copyBgNode,data);
                    continue;
                }else if (nodeName.indexOf("box") !== -1) {
                    var bgNode = node.getChildByName("box1001");
                    if (bgNode) {
                        var copyBgNode = cc.instantiate(bgNode);
                        copyBgNode.name = nodeName;
                        copyBgNode.parent = bgNode.parent;
                        this._parseNode(copyBgNode,data);
                    }
                    continue;
                }
                if (!this.isDecorate) {
                    cc.error("为什么节点不存在",nodeName)
                }
            }
        }
        var spineNode = node.getChildByName("spineNode");
        var bossSpine = node.getChildByName("bossSpine");
        var lockNode = node.getChildByName("lock");
        var shadow = node.getChildByName("fightShadow");
        if (spineNode) {
            spineNode.active = !this.isDecorate && !this.chapterLogic.isPassChapterOneIdx(this.id,this.chapterID);
            if (!spineNode.active) {
                var dairyCow = this.chapterLogic.getDairyCowID(this.id,this.chapterID);
                if (dairyCow) {
                    spineNode.active = true;
                    this.dairyCowFlag = true;
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.GOLDCHANCE,dairyCow);
                    this.loadSpine(spineNode,config[jsonTables.CONFIG_GOLDCHANCE.Resource]);
                }
            }else {
                var spineName = configData["spineNode"].spineName;
                this.loadSpine(spineNode,spineName,function () {
                    this._loadChapterSpine(spineNode);
                }.bind(this));
                if (!this.guideLogic.checkFirstChapterGuide()) {
                    this.guideLogic.passFirstChapter();
                    if (this.chapterID !== 101) return;
                    this.guideGlow.active = true;
                    this.guideGlow.scaleX = -1;
                    this.guideGlow.position = spineNode.position;
                    this.guideGlow.zIndex = spineNode.zIndex + 1;
                }
            }
            if (shadow) shadow.active = spineNode.active;
            if (spineNode.active) {
                if (!shadow) {
                    shadow = uiResMgr.getPrefabEx("fightShadow");
                    shadow.parent = node;
                }
                shadow.zIndex = spineNode.zIndex - 1;
                shadow.position = spineNode.position;
                var shadownScript = shadow.getComponent("fightShadow");
                var shadowSize = jsonTables.getShadowSizeByRes(configData["spineNode"].spineName);
                shadownScript.setScale(shadowSize/this.scaleNode);
            }
        }else {
            if (shadow) shadow.active = false;
        }
        this.bossFlag = false;
        if (bossSpine) {
            bossSpine.active = !this.isDecorate && (this.chapterLogic.isBossChapter(this.id,this.chapterID));
            if (bossSpine.active) {
                this.bossSpineNode = bossSpine;
                bossSpine.getComponent(sp.Skeleton).setEventListener(this.eventListener.bind(this));
                this.bossFlag = true;
                this._loadBossSpine(bossSpine,configData["bossSpine"].spineName);
            }
        }
        var isUnLock = !this.isDecorate && this.chapterLogic.isUnlockChapter(this.id,this.chapterID);
        if (lockNode) {
            lockNode.active = !this.isDecorate && !isUnLock;
            if (lockNode.active) {
                lockNode.scaleX = this.node.scaleX > 0 ? Math.abs(lockNode.scaleX) : -Math.abs(lockNode.scaleX);
                lockNode.getChildByName("numLabel").getComponent(cc.Label).string = "x"+this.chapterLogic.getChapterKeyCost(this.id,this.chapterID);
                this.guideGlow.active = false;
            }
        }
        if (this.isDecorate) return;
        if (isUnLock) {
            this.loadPickReward(node);
        }
        this.setUnOpenState(node,isUnLock);
    },

    /** 加载关卡 */
    _loadChapterSpine:function(spineNode){
        var lockNode = spineNode.getChildByName("lock");
        spineNode.zIndex = 1000;//spine层级保持最高
        var spineHeight = spineNode.getComponent(sp.Skeleton).skeletonData.skeletonJson.skeleton.height * Math.abs(spineNode.scale);// NOTE: spine动画的高度
        if (!lockNode) return;
        var num = !jsonTables.isEditor ? this.chapterLogic.getChapterKeyGet(this.id,this.chapterID) :0;
        lockNode.active = (!jsonTables.isEditor && num !== 0);
        if (!lockNode.active) return;
        var list = [];
        list.length = num;
        var refreshData = {
            content:lockNode,
            list:list,
            prefab:this.lockKeyPrefab
        }
        uiManager.refreshView(refreshData);
        lockNode.y = spineHeight + 30;
        lockNode.scaleX = 1/(Math.abs(spineNode.scaleX) * Math.abs(this.node.scaleX));
        lockNode.scaleY = 1/(Math.abs(spineNode.scaleY) * Math.abs(this.node.scaleY));
    },
    /*加载boss*/
    _loadBossSpine:function(node,res){
        var spine = node.getComponent(sp.Skeleton);
        this.finger.active = false;
        var callBack = function(spineData){
            var oldAniName = spine.animation;

            this.scheduleOnce(function(){
                var isPass = this.chapterLogic.isPassChapterOneIdx(this.id,this.chapterID);
                if (!isPass){
                     spine.skeletonData = spineData;
                     node.getInstance(this.bossLight,false);
                     spine.setAnimation(0,'std',true);
                }else {
                    if(this.chapterLogic.getCurMaxChapterID() === 1){
                        this.finger.active = true;
                    }
                    if (oldAniName === "atk") return;
                    if (this.isOpen && this.chapterrPanelExJs.isKeep !== undefined) {
                        spine.skeletonData = spineData;
                        spine.setAnimation(0,'atk',false);
                        spine.addAnimation(0,'std2',true);
                    }else {
                        if (oldAniName === "std2")return;
                        spine.skeletonData = spineData;
                        spine.setAnimation(0,'std2',true);
                        var nodeLight = node.getInstance(this.bossLight,true);
                        nodeLight.getComponent(this.bossLight.name).init(true);
                        this.setNodePosBySpineScale(nodeLight,spine);
                    }
                }
            }.bind(this),0);
        }.bind(this);//
        uiResMgr.loadSpine(res,callBack);
    },

    /** 设置章节显隐 */
    setUnOpenState:function(node,isUnLock){//
        for (var i = 0 , len = node.children.length; i <  len; i++) {
            var obj = node.children[i];
            if (!isUnLock) {
                if (obj.name.indexOf("bg") === -1 && obj.name !== "lock") {
                    obj.active = false;
                }
            }
            if (obj.name.indexOf("bg") !== -1) {
                obj.color = isUnLock ? uiColor.white : uiColor.grayChapter;
            }
        }

    },
    /** 重设特效位置 */
    setNodePosBySpineScale:function(node,spine){
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.CHAPTERSTYLE,this.id);
        node.y = spine.skeletonData.skeletonJson.skeleton.height * this.scaleNode * config[jsonTables.CONFIG_CHAPTERSTYLE.YOffset];
        node.x = spine.skeletonData.skeletonJson.skeleton.width * this.scaleNode * config[jsonTables.CONFIG_CHAPTERSTYLE.XOffset];
    },

    eventListener:function(trackEntry,event){
        if (event.data.name === "attack") {
            if (cc.isValid(this.bossSpineNode)) {
                var node = this.bossSpineNode.getInstance(this.bossLight,true);
                node.getComponent(this.bossLight.name).init(false);
                this.setNodePosBySpineScale(node,this.bossSpineNode.getComponent(sp.Skeleton));
            }
        }
    },

    loadSpine:function(node,res,cb){
        if (!node) return;
        var spine = node.getComponent(sp.Skeleton);
        var callBack = function(spineData){
            spine.skeletonData = spineData;
            this.scheduleOnce(function(){
                spine.setAnimation(0,'std',true);
            },0);
            if (cb) {
                cb();
            }
        }.bind(this);//
        uiResMgr.loadSpine(res,callBack);
    },

    getBossFlag:function(){
        return this.bossFlag;
    },

    loadPickReward:function(node){
        var chapterID = this.getMonsterID();
        var dataList = this.chapterLogic.getChapterServerInfo(this.id,chapterID);
        var list = [];
        var addIdx = 0;
        if (dataList) {
            list = kf.clone(dataList.PickRewards);
            if (dataList.AdventureID && dataList.AdventureID.length > 0) {
                for (var i = 0 , len = dataList.AdventureID.length; i <  len; i++) {
                    var obj = dataList.AdventureID[i];
                    list.unshift({adventure:obj})
                }
                addIdx = -dataList.AdventureID.length;
            }
        }
        var removeIdxs = [];
        for (var i = 0; i <  10; i++) {
            var rewardNode = node.getChildByName("box"+((i+1)  + 1000));
            var data = list[i];
            if (rewardNode) {
                rewardNode.active = !!data;
                if (rewardNode.active) {
                    rewardNode.scaleX = this.node.scaleX > 0 ? 1 : -1;
                    var adventurePrefab = rewardNode.getChildByName("tipAdventure");
                    for (var j = 0 , len = rewardNode.children.length; j <  len; j++) {
                        var rewardChild = rewardNode.children[j];
                        if (rewardChild.name === this.rewardItem.name) {
                            continue;
                        }
                        rewardChild.active = false;
                    }
                    if (data.adventure || data.adventure === 0) {
                        rewardNode.getInstance(this.rewardItem,false);
                        rewardNode.getChildByName("sprite").active = !!data.adventure;
                        if (data.adventure) {
                            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.ADVENTURE,data.adventure);
                            uiResMgr.loadAdventureIcon(config[jsonTables.CONFIG_ADVENTURE.Icon],rewardNode.getChildByName("sprite"));
                            this.rewardList.push({reward:data.adventure,node:rewardNode,bouding:rewardNode.getBoundingBox(),isAdventure:true});
                            if (config[jsonTables.CONFIG_ADVENTURE.Type] === tb.ADVENTURE_ADVENTURE) {
                                let prefabParent = rewardNode;
                                let configEx = config;
                                uiResMgr.loadChapterAdventurePrefab(config[jsonTables.CONFIG_ADVENTURE.Animation],function (prefab) {
                                    if (!prefabParent.active) return;
                                    var adventrureNode = prefabParent.getInstance(prefab,true);
                                    var pos =  configEx[jsonTables.CONFIG_ADVENTURE.Position]
                                    adventrureNode.x = pos[0] || 0;
                                    adventrureNode.y = pos[1] || 0;
                                }.bind(this));
                            }
                        }
                    }else {
                        rewardNode.active = !this.chapterLogic.isPickRewardTook(this.id,this.chapterID,i + addIdx);
                        if (rewardNode.active) {
                            rewardNode.getChildByName("sprite").active = false;
                            var prefabNode = rewardNode.getInstance(this.rewardItem,true);
                            var rewardData = kf.clone(data);
                            rewardData.isHideBg = rewardData.Type === constant.ItemType.GOLD || rewardData.Type === constant.ItemType.DIAMOND;//
                            prefabNode.position = cc.v2(0,0);//重置状态，因为会播一个动画，会改变位置和透明度
                            prefabNode.opacity = 255;
                            var isPass = this.chapterLogic.isPassChapterOneIdx(this.id,this.chapterID);
                            prefabNode.getComponent(this.rewardItem.name).init(-1,rewardData,isPass);
                            var ret = rewardNode.getBoundingBox();
                            ret.width = prefabNode.width;
                            ret.height = prefabNode.height;
                            this.rewardList.push({rewardData:rewardData,node:rewardNode,node:rewardNode,reward:(i + addIdx),bouding:ret,isAdventure:false});
                        }
                    }
                }
            }else {
                if (data || data === 0) {
                    removeIdxs.push(i + addIdx);
                }
            }
        }
        for(var i = removeIdxs.length-1;i > -1;i--){
            var idx = removeIdxs[i];
            dataList.PickRewards.splice(idx,1);
        }
    },

    getMonsterID:function(){
        return this.chapterID;
    },

    isTouchYou:function(pos){
        var points = this.getPoints();
        if (!points) return false;
        pos = this.node.convertToNodeSpaceAR(pos);
        if (this.guideLogic.isInGuideFlag()) {
            var node = this.node.getChildByName(this.preItemName);
            if (node && node.getChildByName("lock").active) return false;
        }

        return cc.Intersection.pointInPolygon(pos,points);
    },

    getPoints:function(){
        var node = this.node.getChildByName(this.preItemName);
        if (!node) return null;
        if (this.isDecorate) {
            return null;
        }
        var points = this.data.nodeInfo.points;
        if (!points) {
            cc.error("为什么可以点的没points")
            return null;
        }
        var offset = this.data.nodeInfo.offset || cc.v2(0,0);

        var list = [];
        for (var i = 0 , len = points.length; i <  len; i++) {
            var obj = points[i];
            list.push((cc.v2(obj.x + offset.x , obj.y + offset.y)));
        }
        return list;
    },

    clickNode:function(isClick){
        // this.node.color = isClick ? uiColor.lightYellow:uiColor.white;
    },

    clearFingerList:function(){
        if (!this.fingerList) return;
        for (var i = 0 , len = this.fingerList.length; i <  len; i++) {
            var obj = this.fingerList[i];
            obj.active = false;
        }
        this.fingerList = [];
    },

    isTouchBossSpine:function(event){
        if (this.getBossFlag() && this.chapterLogic.isPassChapter(this.id)) {
            var pos = event.getLocation();
            var node = this.node.getChildByName(this.preItemName);
            var bossSpine = node.getChildByName("bossSpine");
            var bossBouding = bossSpine.getBoundingBoxToWorld();
            bossBouding.width = bossSpine.getComponent(sp.Skeleton).skeletonData.skeletonJson.skeleton.width * this.scaleNode * 0.8;
            bossBouding.height = bossSpine.getComponent(sp.Skeleton).skeletonData.skeletonJson.skeleton.height * this.scaleNode * 0.8;
            // bossBouding.x -= bossBouding.width/2;
            if (kf.rectContainsPoint(bossBouding,pos)) {
                return true;
            }
        }
        return false;
    },

    isTouchReward:function(event){
        if (this.dairyCowFlag) {
            var node = this.node.getChildByName(this.preItemName);
            var bossSpine = node.getChildByName("spineNode");
            var bossBouding = bossSpine.getBoundingBoxToWorld();
            bossBouding.width = bossSpine.getComponent(sp.Skeleton).skeletonData.skeletonJson.skeleton.width / this.scaleNode * bossSpine.scale;
            bossBouding.height = bossSpine.getComponent(sp.Skeleton).skeletonData.skeletonJson.skeleton.height /this.scaleNode * bossSpine.scale;
            bossBouding.x -= bossBouding.width/2;
            var pos = event.getLocation();
            if (kf.rectContainsPoint(bossBouding,pos)) {
                var dairyCow = this.chapterLogic.getDairyCowID(this.id,this.chapterID);
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.GOLDCHANCE,dairyCow);
                var resType = config[jsonTables.CONFIG_GOLDCHANCE.ResCopy];
                var id = this.id;
                var cb = function(){
                    uiManager.openChapter(id);
                }
                this.chapterLogic.removeDairyCowID(this.id,this.chapterID);
                this.miniGameLogic.setEndCallBack(cb);
                this.miniGameLogic.setFromSource(constant.MiniGameFromSource.DairyCow);
                this.miniGameLogic.req_MiniGame_Enter(resType);
                return true;
            }
            return false;
        }

        var pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        for (var i = 0 , len = this.rewardList.length; i <  len; i++) {
            var obj = this.rewardList[i];
            if (!obj.node.active) continue;
            if (kf.rectContainsPoint(obj.bouding,pos)) {
                if (obj.isAdventure) {
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.ADVENTURE,obj.reward);
                    switch (config[jsonTables.CONFIG_ADVENTURE.Type]) {
                        case tb.ADVENTURE_ADVENTURE:
                            uiManager.openUI(uiManager.UIID.ADVENTURE_UI,obj.reward,this.id,this.chapterID);
                            break;
                        case tb.ADVENTURE_MYSTERYSHOP:
                            uiManager.openUI(uiManager.UIID.MYSTIC_SHOP,obj.reward,this.id,this.chapterID);
                            break;
                    }
                }else {
                    var rewardNode = obj.node.getChildByName(this.rewardItem.name);
                    if (!rewardNode || !rewardNode.active) continue;
                    this.chapterLogic.req_ChapterNode_PickUp(this.id,this.chapterID,obj.reward,obj.node);
                    // if (obj.rewardData && obj.rewardData.Type === constant.ItemType.REEL) {
                    //     this.guideLogic.checkReelGuide();
                    // }
                }
                return true;
            }
        }
        return false;
    },

    setBossScale:function(){
        var node = this.node.getChildByName(this.preItemName);
        var bossSpine = node.getChildByName("bossSpine")
        if (bossSpine) {
            var nodeLight = bossSpine.getInstance(this.bossLight,true);
            nodeLight.getComponent(this.bossLight.name).init(true);
            var spine = bossSpine.getComponent(sp.Skeleton);
            var scaleX = 1;
            if (jsonTables.scaleX !== undefined) {
                scaleX = jsonTables.scaleX;
            }
            var scaleY =  1;
            if (jsonTables.scaleY !== undefined) {
                scaleY = jsonTables.scaleY;
            }
            nodeLight.y = spine.skeletonData.skeletonJson.skeleton.height * this.scaleNode * scaleY;
            nodeLight.x = spine.skeletonData.skeletonJson.skeleton.width * this.scaleNode * scaleX;
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
