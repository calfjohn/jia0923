/**
* @Author: lich
* @Date:   2018-06-12T15:04:24+08:00
* @Last modified by:
* @Last modified time: 2018-08-16T11:11:11+08:00
*/

window["logic"]["chapter"] = function() {
    var module = {};
    var network = null;
    var clientEvent = null;
    var cardLogic = null;
    var userLogic = null;
    var mineLogic = null;
    var treasureLogic = null;
    var guideLogic = null;
    var mineLogic = null;

    var _EVENT_TYPE = [
        "refreshChapter",
        "refreshMystic",
        "refreshAdventure",
        "clickOneChapter"
    ];

    module.STATE_ENUM = {//章节状态枚举
        UNPLAY:-1,
        PLAYING:0,
        DONE:1
    };

    module.STATE_NODE = {//关卡节点状态
        READY:0,
        PASS:1
    };

    module.init = function(){
        this.initModule();
        clientEvent.addEventType(_EVENT_TYPE);
        this.reset();//数据重置
        this.registerMsg();
    };

    module.reset = function(){
        this.dairyCow = cc.js.createMap();//奶牛关
        this.chapterList = {};//key 为章节id  存储静态数据
        this.chapterStateList = cc.js.createMap();//关卡状态   动态数据
        this.chapterDataList = cc.js.createMap();//关卡数据 包含沙盘 通关 自己的上阵怪物 动态数据
        this.isPlaySpecial = false;//播放塔解锁动画标识
        this.mysticShop = [];
        this.maxMiniChapter = 0;//最大小關卡
        this.privilegesStep = 0;//特权步数
    };

    module.initModule = function(){
        network = kf.require("util.network");
        clientEvent = kf.require("basic.clientEvent");
        cardLogic = kf.require("logic.card");
        userLogic = kf.require("logic.user");
        mineLogic = kf.require("logic.mine");
        treasureLogic = kf.require("logic.treasure");
        guideLogic = kf.require("logic.guide");
        mineLogic = kf.require("logic.mine");
    };

    module.registerMsg = function() {
        network.registerEvent("Resp_PlayerData_Battle", this.onResp_PlayerData_Battle.bind(this));//接受初始化人物数据
        network.registerEvent("Resp_ChapterBattleSet", this.onResp_ChapterBattleSet.bind(this));//相应设置章节数据
        network.registerEvent("Resp_ChapterState", this.onResp_ChapterState.bind(this));//响应章节通关
        network.registerEvent("Resp_ChapterNodeState", this.onResp_ChapterNodeState.bind(this));//响应关卡状态
        network.registerEvent("Resp_ChapterBattleReset", this.onResp_ChapterBattleReset.bind(this));//响应章节数据关卡重置
        network.registerEvent("Push_Table_Update", this.onPush_Table_Update.bind(this));//沙盘数据更新（替换阵容后的push）
        network.registerEvent("Resp_ChapterNode_PickUp", this.onResp_ChapterNode_PickUp.bind(this));//响应关卡奖励拾取
        network.registerEvent("Resp_Adventure_Choose", this.onResp_Adventure_Choose.bind(this));//奇遇响应
        network.registerEvent("Resp_MysticStore", this.onResp_MysticStore.bind(this));//神秘商店
        network.registerEvent("Resp_Buy_MysticStore", this.onResp_Buy_MysticStore.bind(this));//购买神秘商品物品
    };
    /** 神秘商店 */
    module.req_MysticStore = function(adventureID,chapterID,nodeID){
        this.removeAdventure(adventureID,chapterID,nodeID);
        var data = {
            "Req_MysticStore": {
                "ID":chapterID,
                "NodeID":nodeID
            }
        };
        network.send(data);
    };
    module.onResp_MysticStore = function(param){//奇遇响应
        for (var i = 0 , len = param.GoodsID.length; i <  len; i++) {
            var goodID = param.GoodsID[i];
            this.mysticShop.push({goodID:goodID,good:param.Goods[i],price:param.Price[i],isBuyFlag:false});
        }
        clientEvent.dispatchEvent("refreshMystic",true);
    };

    /** 购买神秘商店物品 */
    module.req_Buy_MysticStore = function(goodsID){
        var data = {
            "Req_Buy_MysticStore": {
                "GoodsID":goodsID
            }
        };
        network.send(data);
    };
    module.onResp_Buy_MysticStore = function(param,sentData){//奇遇响应
        for (var i = 0 , len = this.mysticShop.length; i <  len; i++) {
            var obj = this.mysticShop[i];
            if (obj.goodID === sentData.GoodsID) {
                obj.isBuyFlag = true;
                break;
            }
        }
        uiManager.openUI(uiManager.UIID.REWARDMSG,param.Goods);
        // TODO: 购买表现?
        clientEvent.dispatchEvent("refreshMystic");
    };

    /** 离开神秘商店 */
    module.req_Leave_MysticStore = function(){
        var data = {
            "Req_Leave_MysticStore": {}
        };
        this.mysticShop.length = 0;
        network.send(data,true);
    };

    module.getMysticShop = function () {
        return this.mysticShop;
    };
    //移除指定的奇遇id
    module.removeAdventure = function (adventureID,chapterID,nodeID) {
        var dataList = this.getChapterServerInfo(chapterID,nodeID);
        if (dataList && dataList.AdventureID) {
            for (var i = 0 , len = dataList.AdventureID.length; i <  len; i++) {
                var obj = dataList.AdventureID[i];
                if (obj === adventureID) {
                    dataList.AdventureID[i] = 0;
                    break;
                }
            }
            clientEvent.dispatchEvent("refreshAdventure");
        }
    };

    //////////////////////////////////////////////////////////////////////////

    /** 奇遇选择 */
    module.req_Adventure_Choose = function(id,chapterID,idx,chooseIdx){
        var data = {
            "Req_Adventure_Choose": {
                "ID": id,
                "NodeID": chapterID,
                "AdventureID": idx,
                "ChooseIdx":chooseIdx
            }
        };
        network.send(data);
    };
    module.onResp_Adventure_Choose = function(param,sentData){//奇遇响应
        this.removeAdventure(sentData.AdventureID,sentData.ID,sentData.NodeID);
        clientEvent.dispatchEvent("refreshChapter",sentData.ChooseIdx,param.Rewards);
    };

    /** 关卡奖励拾取 */
    module.req_ChapterNode_PickUp = function(id,chapterID,idx,node){
        if (this.isPickRewardTook(id,chapterID,idx)) return cc.error("手贱么  慢点")
        this.clickRewardNode = node;

        var data = {
            "Req_ChapterNode_PickUp": {
                "ID": id,
                "NodeID": chapterID,
                "PickRewardIdx": idx
            }
        };
        network.send(data);
    };
    module.onResp_ChapterNode_PickUp =function(param,sentData){//响应关卡奖励拾取
        if (!this.chapterDataList[param.ID]) return;
        var list = this.chapterDataList[param.ID].NodeInfos;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (obj.NodeID !== param.NodeID) continue;
            list[i].PickRecord.push(sentData.PickRewardIdx);
            break;
        }
        clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.CHAPTERREWARD);
        userLogic.setLockStatus(true);//锁定界面刷新
        if (this.clickRewardNode) {
            uiManager.openUI(uiManager.UIID.FLY_EFFECT,param.Reward,this.clickRewardNode);
            this.clickRewardNode.getChildByName("rewardItemEx").getComponent("rewardItemEx").playFly();
            this.clickRewardNode = null;
        }

        //获得装备打点
        if(param.Reward && param.Reward.Type === constant.ItemType.EQUIP) {
            var recordData = window.adjustUtil.getRecordByType(tb.ADJUST_RECORED_EQUIP_GET);
            if(sentData.ID < recordData[0][jsonTables.CONFIG_ADJUSTRECORD.Param] || sentData.ID > recordData[recordData.length-1][jsonTables.CONFIG_ADJUSTRECORD.Param]) return; //NOTE 只有5-10章打点,其他不打
            window.adjustUtil.recored(tb.ADJUST_RECORED_EQUIP_GET,sentData.ID,sentData.NodeID);
            this.getEquipChapterID = sentData.ID;
            setTimeout(()=>{
                this.getEquipChapterID = null;
            }, 30000);
        }
    };

    module.onPush_Table_Update = function(param){ //沙盘数据更新（替换阵容后的push）
        var list = param.ChapterInfo;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (this.chapterDataList[obj.ID]) {
                this.chapterDataList[obj.ID].TableInfo.Grid = obj.TableInfo.Grid;
            }
        }
        if (param.MineTableInfo) {
            mineLogic.setTableInfo(param.MineTableInfo);
        }
    };

    module.onResp_PlayerData_Battle = function(param){ //接受初始化人物数据
        var maxID = -1;
        for (var i = 0 , len = param.ChapterInfo.length; i < len; i++) {//关卡状态
            var obj = param.ChapterInfo[i];
            this.chapterStateList[obj.ID] = obj;
            maxID = maxID < obj.ID ? obj.ID : maxID;
        }
        if (maxID !== -1) {
            if (maxID < param.ChapterMaxID && this.chapterStateList[maxID].State === this.STATE_ENUM.DONE) {
                this.chapterStateList[maxID+1] = {ID:(maxID+1),State:this.STATE_ENUM.UNPLAY,MopUpVit:0};
                maxID ++;
            }
        }
        this.maxMiniChapter = 0;
        for (var i = 0 , len = param.ChapterBattleInfo.length; i < len; i++) {//详细关卡数据
            var obj = param.ChapterBattleInfo[i];
            this.chapterDataList[obj.ID] = obj;
            if(obj.ID >= maxID){//最大關卡
                for (var j = 0 , length = obj.NodeInfos.length; j < length; j++) {
                    var objEx = obj.NodeInfos[j];
                    if(objEx.Passed && objEx.NodeID > this.maxMiniChapter){
                        this.maxMiniChapter = objEx.NodeID;
                    }
                }
            }
        }
        if(!this.maxMiniChapter){
            this.maxMiniChapter = maxID * 100;
        }
        this.maxChapterID = param.ChapterMaxID;//// NOTE: 最大的章节数
        this.privilegesStep = param.PrivilegesStep;
    };

    module.setPrivilegesStep = function (num) {
        this.privilegesStep = num;
    };

    module.getPrivilegesStep = function (num) {
        return this.privilegesStep;
    };

    module.getChapterState = function (chapterID) {
        if(!this.chapterStateList[chapterID])   return  -1;
        return this.chapterStateList[chapterID].MopUpVit;
    };

    /** 请求章节关卡重置 */
    module.req_ChapterBattleReset = function(id){
        var data = {
            "Req_ChapterBattleReset": {
                "ID": id
            }
        };
        network.send(data,true);
        this.dairyCow[id] = {};
        delete this.chapterDataList[id];
        delete this.chapterList[id];
    };
    module.onResp_ChapterBattleReset =function(param){//响应章节数据关卡重置
        //TODO  重置本地指定章节数据缓存
    };

    /** 设置关卡状态 */
    module.req_ChapterNodeState = function(id,nodeID,state,reels){
        var data = {
            "Req_ChapterNodeState": {
                "ID": id,
                "NodeID":nodeID,
                "State": state,
                "Reels":reels//// TODO: 卷轴消耗了解一下
            }
        };
        network.send(data,true);
        if (state === this.STATE_NODE.PASS) {
            if(nodeID > this.maxMiniChapter){
                this.maxMiniChapter = nodeID;
            }
            window.adjustUtil.recored(tb.ADJUST_RECORED_ONE_CHAPTER,id,nodeID);
            if(reels.length !== 0) {
                window.adjustUtil.recored(tb.ADJUST_RECORED_REEL_USE,id,nodeID);
            }
        }
    };
    module.onResp_ChapterNodeState =function(param){//响应关卡状态
    };

    /** 请求设置章节数据 */
    module.req_ChapterState = function(id,state){
        var data = {
            "Req_ChapterState": {
                "ID": id,
                "State": state
            }
        };
        network.send(data,true);
    };
    //这次刷新塔是否需要播放解锁动画
    module.getIsPlaySpecial = function () {
        if(this.isPlaySpecial){//只播放一次
            this.isPlaySpecial = false;
            return  true;
        }
    };

    module.onResp_ChapterState =function(param){
        this.chapterStateList[param.ID].MopUpVit = param.MopUpVit;//设置这里体力 给扫荡用
        this.chapterStateList[param.ID].State = param.State;
        if (param.State === this.STATE_ENUM.DONE) {
            if(param.ID < this.maxChapterID){
                if (this.getCurMaxChapterID() === param.ID) {
                    this.chapterStateList[param.ID+1] = {ID:(param.ID+1),State:this.STATE_ENUM.UNPLAY,MopUpVit:0};
                    this.isPlaySpecial = true;
                    clientEvent.dispatchEvent("refreshMainBtnActive");
                    window.adjustUtil.recored(tb.ADJUST_RECORED_ALL_CHAPTER,param.ID);
                    this.maxMiniChapter = (param.ID+1) * 100;
                }
            }
            treasureLogic.setShowData(param.ChestInfo);
            uiManager.closeAllUI();
        }
    };

    /** 请求设置章节数据 */
    module.req_ChapterBattleSet = function(id,nodeID){
        var info= this.chapterDataList[id];
        var data = {
            "Req_ChapterBattleSet": {
                "ID": info.ID,
                "TableInfo": info.TableInfo,
                "NodeInfos": info.NodeInfos,
                "HeroInfos": info.HeroInfos,
                "NodeID":nodeID
            }
        };
        network.send(data,true);
    };
    module.onResp_ChapterBattleSet = function(param,sentData){
        if (param.ExtraID) {
            this.dairyCow[sentData.ID] = this.dairyCow[sentData.ID] || {};
            this.dairyCow[sentData.ID][sentData.NodeID] = param.ExtraID;
            clientEvent.dispatchEvent("refreshChapter");
        }
    };

    //获取章节数据 这里暂时请求一个 便于逻辑处理
    module.req_ChapterInfo = function(id,callBack){
        if (this.chapterList[id]) {
            return callBack(true);
        }
        var data = {
            "Req_ChapterInfo": {
                "ID": [id]
            }
        };
        this.chapterList[id] = {};
        network.send(data,true);
        //获取章节数据
        network.registerEvent("Resp_ChapterInfo", function(param,sentData){

            for (var i = 0 , len = param.ChapterInfo.length; i < len; i++) {
                var obj = param.ChapterInfo[i];
                jsonTables.initSandBoxTable(obj);
                kf.convertData(obj,this.chapterList[id]);
            }
            callBack(true);
        }.bind(this));
    };

    module.getMaxMiniChapter = function () {
        return  this.maxMiniChapter;
    };

    /**
    * 是否存在奶牛关
    * @param  {int} id         [大章节id]
    * @param  {int} chapterIdx [小章节id]
    */
    module.getDairyCowID = function(id,chapterIdx){
        if (!this.dairyCow[id] || !this.dairyCow[id][chapterIdx]) return 0;
        return this.dairyCow[id][chapterIdx];
    };

    module.removeDairyCowID = function (id,chapterIdx) {
        if (this.dairyCow[id] && this.dairyCow[id][chapterIdx]) {
            this.dairyCow[id][chapterIdx] = 0;
        }
    };

    module.getMaxChapter = function(){
        return  this.maxChapterID;
    };

    module.getNowChapter = function(){
        var nowChapter = 1;
        var keys = Object.keys(this.chapterStateList);
        for (var i = 0 , len = keys.length; i < len; i++) {
            var obj = this.chapterStateList[keys[i]];
            if(obj.State === this.STATE_ENUM.DONE && parseInt(keys[i]) >= (nowChapter - 1)){
                nowChapter = parseInt(keys[i]) + 1;
            }
        }
        return nowChapter;
    };
    /**
    * 获取某个大章节的小关卡服务端数据
    * @param  {int} id         [大章节id]
    * @param  {int} chapterIdx [小章节id]
    */
    module.getChapterInfo = function(id,chapterIdx){
        if (!this.chapterList[id]) return cc.error("该章节数据不存在 玩蛇",id);
        var info = this.chapterList[id].NodeInfo;
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            if (obj.Idx === chapterIdx) {
                return obj;
            }
        }
        cc.error("该章节数据找不到 玩蛇",chapterIdx);
        return null;
    };

    //获取缓存在服务器的数据
    module.getChapterServerInfo = function (id,chapterIdx) {
        var list = this.getClearance(id);
        if (list.length === 0) {
            return this.getChapterInfo(id,chapterIdx)
        }
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            if (obj.NodeID === chapterIdx) {
                return obj;
            }
        }
        cc.error("该章节动态数据找不到 玩蛇",chapterIdx);
        return null;
    };

    /** 获取静态节点数据 */
    module.getChapterInfoNodeInfo = function(id){
        if (!this.chapterList[id]) return cc.error("该章节数据不存在 玩蛇",id);
        var info = this.chapterList[id].NodeInfo;
        return info;
    };
    //静态数据是否存在
    module.isChapterStatic = function (id) {
        return !!this.chapterList[id];
    };

    /** 体力是否充足 */
    module.isFullVit = function(id,chapterIdx){
        var info = this.getChapterInfo(id,chapterIdx);
        if (!info) return false;
        return info.Vit <= userLogic.getBaseData(userLogic.Type.Vit)
    };

    /**
    * 获取某个章节的沙盘服务端数据
    * @param  {int} id         [大章节id]
    */
    module.getChapterTableInfo = function(id){
        if (this.chapterDataList[id]) {//优先选取
            return this.chapterDataList[id].TableInfo;
        }
        if (!this.chapterList[id]) return ;
        return this.chapterList[id].TableInfo;
    };
    /** 获取自己队伍的怪物 */
    module.getChapterMineMonsterInfo = function(id){
        if (this.chapterDataList[id]) {//优先选取
            return this.chapterDataList[id].HeroInfos;
        }
        return [];
    };
    /** 获取关卡钥匙数量*/
    module.getChapterKeyNum = function(id){
        if (this.chapterDataList[id]) {//优先选取
            return this.chapterDataList[id].Key;
        }
        return 0;
    };
    /** 获取关卡钥匙*/
    module.addChapterKeyNum = function(id,chapterIdx){
        var add = this.getChapterKeyGet(id,chapterIdx);
        this.chapterDataList[id] = this.chapterDataList[id] || {};
        this.chapterDataList[id].Key = this.chapterDataList[id].Key || 0
        this.chapterDataList[id].Key += (add);// TODO: 刷新界面钥匙数量
    };
    //打通后获取数量
    module.getChapterKeyGet = function (id,chapterIdx) {
        var info = this.getChapterInfoNodeInfo(id);
        if(!info && info.length)   return 0;
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            if (obj.Idx !== chapterIdx) continue;
            return obj.KeyGet;
        }
        return 0;
    };
    //获取消耗数量
    module.getChapterKeyCost = function (id,chapterIdx) {
        var info = this.getChapterInfoNodeInfo(id);
        if (!info) return 0;
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            if (obj.Idx !== chapterIdx) continue;
            return obj.KeyCost;
        }
        return 0;
    };
    /** 是否boss关卡 */
    module.isBossChapter = function (id,chapterIdx) {
        var info = this.getChapterInfoNodeInfo(id);
        if (!info) return false;
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            if (obj.Idx !== chapterIdx) continue;
            return i === (len-1);
        }
        return false;
    };
    /** 是否是第一关 */
    module.isFirstChapter = function (id,chapterIdx) {
        var info = this.getChapterInfoNodeInfo(id);
        if (!info) return false;
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            if (obj.Idx !== chapterIdx) continue;
            return i === 0;
        }
        return false;
    };

    /** 获取所有钥匙数量 */
    module.getAllCount = function(id){

        var info = this.getChapterInfoNodeInfo(id);
        if (!info) return 0;
        return info[info.length - 1].KeyCost;
    };


    /**
    * 获取破碎列表
    * @param  {int} id        [大章节id]
    */
    module.getBorkenInfoEx = function(id){
        var info = this.getChapterTableInfo(id);
        return info.Borken;
    };
    /**
    * 获取某个破碎后生成对象
    * @param  {int} id        [大章节id]
    * @param  {int} brokenIdx [破碎索引]
    */
    module.getBorkenInfo = function(id,brokenIdx){
        var info = this.getChapterTableInfo(id);
        for (var i = 0 , len = info.Borken.length; i < len; i++) {
            var obj = info.Borken[i];
            if (obj.Idx === brokenIdx) {
                if (obj.Data.length > 0) {
                    return jsonTables.random(obj.Data);
                }
                break;
            }
        }
        return null;
    };
    /**
    * 获取某个大章节通关的小章节
    * @param  {int} id        [大章节id]
    */
    module.getClearance = function(id){
        var info = this.chapterDataList[id];
        if (info && info.NodeInfos) {//ä¼˜å…ˆé€‰å–
            return info.NodeInfos;
        }
        return [];
    };
    /**
    * 获取对应关卡指定位置锁的剩余次数
    * @param  {[type]} id  [description]
    * @param  {[type]} idx [description]
    */
    module.getLockNum = function(id,idx){
        var info = this.getChapterTableInfo(id);
        if (!info) return 0;
        for (var i = 0 , len = info.SpeData.length; i < len; i++) {
            var obj = info.SpeData[i];
            if (obj.Type !== constant.TableSpecialInfo.LOCK || obj.Idx !== idx) continue;
            return obj.Num;
        }
        return 0;
    };
    /**
    * 减少某个章节的锁的次数
    * @param  {int} id  大章节id
    * @param  {int} idx 索引位置
    */
    module.desrLock = function(id,idx){
        var info = this.getChapterTableInfo(id);
        for (var i = 0 , len = info.SpeData.length; i < len; i++) {
            var obj = info.SpeData[i];
            if (obj.Type !== constant.TableSpecialInfo.LOCK || obj.Idx !== idx) continue;
            obj.Num--;
            if (obj.Num === 0) {
                info.SpeData.splice(i,1);
            }
            return;
        }
        cc.error("没找到啊");
    };
    /** 设置动态缓存数据 */
    module.saveDataList = function(id,table,nodeIds,heroInfos){
        this.chapterDataList[id] = this.chapterDataList[id] || {};
        this.chapterDataList[id].ID = id;
        if (table) {
            this.chapterDataList[id].TableInfo = table;
        }
        if (nodeIds) {
            this.chapterDataList[id].NodeInfos = nodeIds;
        }
        if (heroInfos) {
            this.chapterDataList[id].HeroInfos = heroInfos;
        }
    };

    /**
    * 获取某个关卡的当前关卡
    * @param  {int} id         [大章节id]
    */
    module.getCurUnFightChapterIdx = function(id){

        var info = this.getClearance(id);
        if (!info) return null;
        if (this.isPassChapter(id)) {
            return info[info.length-1].NodeID;
        }
        if (info.length === 0){
            var list = this.getChapterInfoNodeInfo(id);
            if (!list) return null;
            return list[0].Idx;
        }
        for (var i = 0 , len = info.length; i <  len; i++) {
            var obj = info[i];
            if (obj.Passed) continue;
            return obj.NodeID;
        }
        return info[info.length-1].NodeID;
    };

    /**
    * 获取某个关卡是否解锁
    * @param  {int} id         [大章节id]
    * @param  {int} chapterIdx [小章节id]
    */
    module.isUnlockChapter = function(id,chapterIdx){
        if (this.isPassChapter(id)) {
            return true;
        }
        var info = this.getChapterInfoNodeInfo(id);
        if (!info) return false;
        var curKeyNum = this.getChapterKeyNum(id);
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            if (obj.Idx !== chapterIdx) continue;
            return obj.KeyCost <= curKeyNum
        }
        cc.error("没找到关卡静态数据");
        return false;
    };
    /** 获取当前已通关最大关卡id */
    module.getCurMaxChapterID = function () {
        var max = 0;
        for (var id in this.chapterStateList) {
            max = max < Number(id) ? Number(id) : max;
        }
        return max;
    };
    /** 手动奖励是否已领取 */
    module.isPickRewardTook = function (id,chapterID,idx) {
        if (!this.chapterDataList[id]) return false;
        var list = this.chapterDataList[id].NodeInfos;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (obj.NodeID !== chapterID) continue;
            return kf.inArray(list[i].PickRecord,idx);
        }
        return true;
    };

    /** 是否奖励都领完了 */
    module.isAllPickRewardDone = function (id) {
        if (!this.chapterDataList[id]) return true;
        var list = this.chapterDataList[id].NodeInfos;
        var info = this.chapterList[id].NodeInfo;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (!obj.Passed) {
                continue;
            }
            for (var j = 0 , jLen = obj.AdventureID.length; j <  jLen; j++) {
                var adve = obj.AdventureID[j];
                if (adve !== 0) {
                    return false;
                }
            }
            if ((obj.PickRewards.length) !== (obj.PickRecord.length)) {
                return false;
            }
        }
        return true;
    };

    /** 大章节是否解锁 */
    module.isUnLockTower = function(id){
        // var maxID = this.getCurMaxChapterID();
        // if (id < maxID) return true;
        var next = id - 1;
        if (next === 0) return true;
        return this.chapterStateList[next] && this.chapterStateList[next].State === this.STATE_ENUM.DONE
    }

    /** 某个章节的某个小关卡是否通关 */
    module.isPassChapterOneIdx = function(id,chapterIdx){
        var list = this.getClearance(id);
        if (list.length === 0) return this.isPassChapter(id);
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            if (obj.NodeID !== chapterIdx) continue;
            return obj.Passed;
        }
        return false;
    };

    /** 某个章节是否通关 */
    module.isPassChapter = function(id){
        var list = this.getClearance(id);
        if (list.length === 0) return false;
        var curNum = this.getChapterKeyNum(id);
        var maxNum = this.getAllCount(id);
        var lastCell = list[list.length - 1];
        return curNum >= maxNum && lastCell.Passed;
    };
    /** 某个章节正在玩 */
    module.isChapterPlaying = function (id) {
        var list = this.getCurChapterId();
        return kf.inArray(list,id)
    }

    /** 获取当前章节 */
    module.getCurChapterId = function(){
        var list = [];
        for (var id in this.chapterDataList) {
            list.push(Number(id));
        }
        return list;
    };
    /** 获取章节列表对象 */
    module.getChapterStateList = function () {
        return kf.clone(this.chapterStateList);
    };
    /**
    * 获取指定怪物的技能列表
    * @param  {int} id        [章节id]
    * @param  {int} chapterID [关卡id]
    * @param  {int} tid       [怪物id]
    * @return {Array}           技能数组 其中对象{skillID:obj,skillLv:1}
    */
    module.getSkillList = function (id,chapterID,tid,curWave) {
        var info = this.getChapterInfo(id,chapterID);
        if (!info) return [];//没有技能
        var monsterBatchs = info.MonsterBatch;
        var monsterBatch = monsterBatchs[curWave];
        if (!monsterBatch) {
            cc.error("没找到对应波次？")
            return [];
        }
        var monsters = monsterBatch.Monsters;
        var lvs = [];
        for (var i = 0 , len = monsters.length; i <  len; i++) {
            var obj = monsters[i];
            if (obj.ID !== tid) continue;
            lvs = obj.SkillLv;
            break;
        }
        if (lvs.length === 0) return lvs;
        var list = [];
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);//家族配置表基本数据
        var info = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Skill];
        var skillMaxLvs = familyConfig[jsonTables.CONFIG_MONSTERFAMILY.SkillMaxLv];
        for (var i = 0 , len = info.length; i < len; i++) {
            var obj = info[i];
            var lv = lvs[i] || 0;
            list.push({skillID:obj,skillLv:lv,maxLv:skillMaxLvs[i]});
        }
        return list;
    };
    ///////////////////////////////////////////////////////////////////////


    module.resetSandBoxInfo = function(oldFamilys,newFamilys){
        if (oldFamilys.length !== newFamilys.length) return null;
        var curIdxs = this.getCurChapterId();
        if (curIdxs.length === 0) return null;//不存在进行中的章节不需要替换
        for (var i = 0 , len = curIdxs.length; i < len; i++) {
            var curIdx = curIdxs[i];
            var table = this.getChapterTableInfo(curIdx);
            if (!table) continue;//不存在
            this.resetTableInfo(oldFamilys,newFamilys,table);
        }
    };
    //重置静态数据内部的沙盘信息
    module.resetStaticSandBoxInfo = function (oldFamilys,newFamilys) {
        if (oldFamilys.length !== newFamilys.length) return null;
        for (var id in this.chapterList) {
            if (!this.chapterList.hasOwnProperty(id)) continue;
            var data = this.chapterList[id];
            if (!data.TableInfo) continue;
            this.resetTableInfo(oldFamilys,newFamilys,data.TableInfo);
        }
    };

    /** 重置table内的数据 */
    module.resetTableInfo = function(oldFamilys,newFamilys,table){
        var re = [];
        for (var i = 0 , len = oldFamilys.length; i < len; i++) {
            var result = this._resetSandBoxInfo(oldFamilys[i],newFamilys[i],table);
            if (result) {
                re.push(result);
            }
        }
        for (var i = 0 , len = re.length; i < len; i++) {
            var list = re[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j];
                table.Grid[obj.row].Data[obj.col] = obj.data;
            }
        }
    };
    /**
    * 替换沙盘中的家族数据
    * @param  {int} oldfamily [旧的家族id]
    * @param  {int} newfamily [新的家族id]
    */
    module._resetSandBoxInfo = function(oldfamily,newfamily,table){
        if (oldfamily === newfamily || oldfamily === 0 || newfamily === 0) return null;
        var oldConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,oldfamily);
        var newConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,newfamily);
        var re = [];
        for (var i = 0 , len = table.Grid.length; i < len; i++) {
            var list = table.Grid[i];
            for (var j = 0 , jLen = list.Data.length; j < jLen; j++) {
                var obj = list.Data[j];
                if (obj <= 0) continue;//不存在这行东西
                if (obj < jsonTables.MONID_BASE || obj >= (jsonTables.MONID_BASE + jsonTables.TYPE_BASE_COUNT)) continue;
                var id = obj - jsonTables.MONID_BASE;
                var idx = kf.getArrayIdx(oldConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters],id);

                if (idx !== -1) {
                    re.push({row:i,col:j,data:jsonTables.MONID_BASE + newConfig[jsonTables.CONFIG_MONSTERFAMILY.Monsters][idx]});
                }
            }
        }
        return re;
    };

    return module;
};
