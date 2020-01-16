/**
 * @Author: lich
 * @Date:   2018-08-08T10:53:05+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-08-08T10:53:59+08:00
 */

window["logic"]["sandTable"] = function() {

    var clientEvent = null;
    var fightLogic = null;
    var formulaLogic = null;
    var areanLogic = null;
    var cardLogic = null;
    var chapterLogic = null;
    var mineLogic = null;
    var userLogic = null;
    var talentSkillLogic = null;
    var fightTalkLogic = null;
    var miniGameLogic = null;
    var guideLogic = null;
    var configuration = null;
    var achievementLogic = null;

    var DIRRECTION = cc.Enum({
        TOP: 1,
        LEFT:3,
        BOTTOM:5,
        RIGHT:7,
        LEFT_TOP: 2,
        LEFT_BOTTOM:4,
        RIGHT_TOP:6,
        RIGHT_BOTTOM:8
    });
    var module = {};
    module.init = function(){
        this.initModue();
        this.reset();
        this.isTip = false;
    };

    module.log = function (str) {
        if (CC_DEBUG) {
            // cc.log(str)
        }
    }

    module.initModue = function(){
        clientEvent = kf.require("basic.clientEvent");
        fightLogic = kf.require("logic.fight");
        formulaLogic  = kf.require("logic.formula");
        areanLogic = kf.require("logic.arean");
        cardLogic = kf.require("logic.card");
        chapterLogic = kf.require("logic.chapter");
        mineLogic = kf.require("logic.mine");
        userLogic = kf.require("logic.user");
        talentSkillLogic = kf.require("logic.talentSkill");
        fightTalkLogic = kf.require("logic.fightTalk");
        miniGameLogic = kf.require("logic.miniGame");
        guideLogic = kf.require("logic.guide");
        configuration = kf.require("util.configuration");
        achievementLogic = kf.require("logic.achievement");
    };

    module.reset = function(){
        this.vaildSandCount = 0;
        this.itemCells = [];
        this.randomList = [];//// NOTE: 这是所有随机列表
        this.petrifactionList = [];//石化列表
        this.bornedMap = cc.js.createMap(); //记录本次合成产生的怪物
    };

    module.initTable = function (script) {
        this.reset();
        this.nextForm = 0;//生成的绿色个数
        this.sandBoxCtl = script;
        this.itemCells = [];
        this.randomList = [];//// NOTE: 这是所有随机列表
        this.inCreatingCount = 0;//这个计数用于保证所有怪物都运动完了
        this.msgPip = [];//事件管道 用于存储所有对象
        this._widthCount = script._widthCount;
        this._heightCount = script._heightCount;
        this.touchEnable = true;
        this.bornedMap = cc.js.createMap();//记录本次合成产生的怪物
    };
    //增加一个合成家族的某个品质的数量，用于增加熟练度
    module.addBornMap = function (tid) {
        if (!tid || !this.isCanAddProtical()) return;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
        if (!config) return;
        // if (tb.MONSTER_EXCELLENT === config[jsonTables.CONFIG_MONSTER.Form] && guideLogic.isFirstExcellentForrm()) {
        //     guideLogic.showFirstGuideAction(true);
        // }
        var form = config[jsonTables.CONFIG_MONSTER.Form]
        if (form <= tb.MONSTER_ORDINARY) return;
        var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
        if (!familyConfig) return;
        if (!this.bornedMap[familyID]) {
            this.bornedMap[familyID] = {FamilyID:familyID,ComposeNum:[0,0,0,0]};
        }
        this.bornedMap[familyID].ComposeNum[form - 2]++;
    };
    //是否处在可以增加熟练度模式
    module.isCanAddProtical = function () {
        if (fightLogic.isGameType(constant.FightType.PVP_AREAN)
            || fightLogic.isGameType(constant.FightType.MINI_GAME)
            || fightLogic.isGameType(constant.FightType.MINE_READY)
            || fightLogic.isGameType(constant.FightType.WORLD_BOSS)
        ){
            return false;
        }
        return true;
    };
    /** 告诉服务器 本次生成了多少怪物 */
    module.callServerQuality = function () {
        if (!this.bornedMap) return;
        var keys = Object.keys(this.bornedMap);
        if (keys.length === 0) return;
        var list = [];
        for (var i = 0 , len = keys.length; i <  len; i++) {
            var key = keys[i];
            var data = this.bornedMap[key];
            list.push(data);
        }
        cardLogic.req_HeroQuality_Update(list); //记录下生成的品质
        this.bornedMap = cc.js.createMap();//记录本次合成产生的怪物
    };
    //增加一个石化格子
    module.addPetrifaction = function (ccObj) {
        var idx = this.isInPetrifaction(ccObj);
        if (idx === -1) {
            this.petrifactionList.push({script:ccObj,round:2});
            ccObj.setPetrifaction(true);
        }else {
            this.petrifactionList[idx].round = 2;
        }
    };
    /** 是否处于石化列表 */
    module.isInPetrifaction = function (ccObj) {
        var isIn = -1;
        for (var i = 0 , len = this.petrifactionList.length; i <  len; i++) {
            var obj = this.petrifactionList[i];
            if (obj.script.isTheSameScript(ccObj)) {
                isIn = i;
                break;
            }
        }
        return isIn
    };
    //移除一个石化格子
    module.removePetrifaction = function () {
        if (this.petrifactionList.length <= 0) return [];
        var list = [];
        for(var i = this.petrifactionList.length-1;i > -1;i--){
            var obj = this.petrifactionList[i];
            obj.round--;
            if (obj.round <= 0) {
                obj.script.setPetrifaction(false);
                this.petrifactionList.splice(i,1);
                list.push(obj.script);
            }
        }
        return list;
    };

    /** 增加扩充形态 */
    module.addNextForm = function (add) {
        this.nextForm += add;
    };

    module.isTouchEnable = function () {
        return this.touchEnable;
    };

    module.setTouchEnable = function (enble) {
        this.touchEnable = enble;
    };

    module.desrInCreatingCount = function () {
        this.inCreatingCount--;
        this.checkDisplay();
    };

    module.addCell = function (row,col,obj) {
        this.itemCells[row] = this.itemCells[row] || [];
        this.itemCells[row][col] = obj;
    };

    module.getItemCell = function () {
        return this.itemCells;
    };

    module.setVaildSandCount = function (count) {
        this.vaildSandCount = count;
    };

    /** 重置沙盘容器 这个池子里面放着待出现的怪物个数 */
    module.resetSandPool = function(){
        if (this.itemCells.length === 0) {
            return;
        }
        var m = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.CostSearchStarMana);
        var counMap = cc.js.createMap();
        if (guideLogic.isInGuideFlag()) {
            var lines = guideLogic.getGuideLineIDs();
        }else{
            var lines = fightLogic.getBaseFamilyIDs();
        }
        for (var i = 0 , len = lines.length; i < len; i++) {
            var obj = lines[i];
            counMap[obj] = 0;
        }
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (!obj.isMonster()) continue;
                var tid = obj.getConfigTid();
                if (!tid){
                    debugger;
                    continue;
                }
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
                var familyID = config[jsonTables.CONFIG_MONSTER.FamilyID];
                if (counMap[familyID] === undefined) {
                    debugger;
                }
                counMap[familyID]++;
            }
        }
        var keys = Object.keys(counMap);
        var aCount = keys[0] ? counMap[keys[0]] : 0;
        var bCount = keys[1] ? counMap[keys[1]] : 0;
        var cCount = keys[2] ? counMap[keys[2]] : 0;
        var re = formulaLogic.calculateGrouop(this.vaildSandCount,m,aCount,bCount,cCount);
        this.randomList = [];//// NOTE: 这是所有随机列表
        for (var i = 0 , len = re.length; i < len; i++) {
            var obj = re[i];
            var key = keys[i];
            if (!key) continue;
            for (var j = 0 , jLen = obj; j < jLen; j++) {
                this.randomList.push(key);
            }
        }
        if (this.randomList.length === 0) {
            debugger;
        }
    };

    /**
     * 交换俩个脚本 在itemCells中位置和相关数据
     * @param  {js} src [来源脚本]
     * @param  {js} des [目标脚本]
     * @param  {boolean} isNeedResetPos [是否需要对相应节点进行重置]
     * @param  {Object} jumpAniObj [是否让des进行跳跃动画 {isJump:,cb}]
     */
    module.swichPoint = function(src,des,isNeedResetPos,jumpAniObj){
        var desRow = des.getRow();
        var desCol = des.getCol();
        var srcRow = src.getRow();
        var srcCol = src.getCol();
        var srcInitPos = src.getInitPos();
        var srcItemCell = this.itemCells[srcRow][srcCol];
        var srcRect = this.itemCells[srcRow][srcCol].rect;
        var desRect = this.itemCells[desRow][desCol].rect;
        var relativeBg = src.getRelativeBg();
        var lockScript = src.getLockScript();

        src.setRow(des.getRow());
        src.setCol(des.getCol());
        src.setInitPos(des.getInitPos());
        src.setRelativeBg(des.getRelativeBg());
        src.setLockScript(des.getLockScript());

        des.setRow(srcRow);
        des.setCol(srcCol);
        des.setInitPos(srcInitPos);
        des.setRelativeBg(relativeBg);
        des.setLockScript(lockScript);
        this.itemCells[srcRow][srcCol] = this.itemCells[desRow][desCol];
        this.itemCells[desRow][desCol] = srcItemCell;
        this.itemCells[desRow][desCol].rect = desRect
        this.itemCells[srcRow][srcCol].rect = srcRect;

        if (isNeedResetPos) {
            src.resetToInitPos();
            if (jumpAniObj && jumpAniObj.isJump) {
                des.jumpToInit(jumpAniObj.cb);
            }else {
                des.resetToInitPos();
            }
            src.setBgColor();
            des.setBgColor();
        }
    };

    /**
     * 检测俩个脚本的相交性
     * @param  {js} src [来源脚本]
     * @param  {boolean} isAllInAlist [结果是否放着一个列表中]
     * @return {Array[[],[]]}     [相交所有脚本集合]数组包含数组的结构
     */
    module.checkDisjointness = function(src,isAllInAlist){//NOTE return值不一定是个数组包数组形式
        var srcRow = src.getRow();
        var srcCol = src.getCol();
        var result = [];
        //NOTE 开始递归
        var resultTop = [];
        this.checkDir(DIRRECTION.TOP,srcRow,srcCol,src.checkToggle.bind(src),resultTop);
        var resultBottom= [];
        this.checkDir(DIRRECTION.BOTTOM,srcRow,srcCol,src.checkToggle.bind(src),resultBottom);
        var rowResult = resultTop.concat(resultBottom);
        if (rowResult.length >= 2) {
            if (isAllInAlist) {
                result = result.concat(rowResult);
            }else {
                result.push(rowResult);
            }
        }

        var resultLeft= [];
        this.checkDir(DIRRECTION.LEFT,srcRow,srcCol,src.checkToggle.bind(src),resultLeft);
        var resultRight= [];
        this.checkDir(DIRRECTION.RIGHT,srcRow,srcCol,src.checkToggle.bind(src),resultRight);
        var colResult = resultRight.concat(resultLeft);
        if (colResult.length >= 2) {
            if (isAllInAlist) {
                result = result.concat(colResult);
            }else {
                result.push(colResult);
            }
        }

        var resultBiasLeft= [];
        this.checkDir(DIRRECTION.LEFT_BOTTOM,srcRow,srcCol,src.checkToggle.bind(src),resultBiasLeft);
        var resultBiasRight= [];
        this.checkDir(DIRRECTION.RIGHT_TOP,srcRow,srcCol,src.checkToggle.bind(src),resultBiasRight);
        var rowBiasResult = resultBiasLeft.concat(resultBiasRight);
        if (rowBiasResult.length >= 2) {
            if (isAllInAlist) {
                result = result.concat(rowBiasResult);
            }else {
                result.push(rowBiasResult);
            }
        }

        var resultBiasLeft= [];
        this.checkDir(DIRRECTION.LEFT_TOP,srcRow,srcCol,src.checkToggle.bind(src),resultBiasLeft);
        var resultBiasRight= [];
        this.checkDir(DIRRECTION.RIGHT_BOTTOM,srcRow,srcCol,src.checkToggle.bind(src),resultBiasRight);
        var colBiasResult = resultBiasLeft.concat(resultBiasRight);
        if (colBiasResult.length >= 2) {
            if (isAllInAlist) {
                result = result.concat(colBiasResult);
            }else {
                result.push(colBiasResult);
            }
        }
        return result;
    };
    module.checkDir = function(dir,row,col,checkFunc,result){
        switch (dir) {
            case DIRRECTION.TOP:
                row += 1;
                break;
            case DIRRECTION.BOTTOM:
                row -= 1;
                break;
            case DIRRECTION.LEFT_BOTTOM:
                row -= 1;
                col -= 1;
                break;
            case DIRRECTION.RIGHT_BOTTOM:
                row -= 1;
                col += 1;
                break;
            case DIRRECTION.LEFT_TOP:
                row += 1;
                col -= 1;
                break;
            case DIRRECTION.RIGHT_TOP:
                row += 1;
                col += 1;
                break;
            case DIRRECTION.LEFT:
                col -= 1;
                break;
            case DIRRECTION.RIGHT:
                col += 1;
                break;
        }
        if (!this.itemCells[row] || !this.itemCells[row][col]) return;
        var nextCell = this.itemCells[row][col]
        if (checkFunc(nextCell.bindJs)) {
            result.push(nextCell.bindJs);
            this.checkDir(dir,row,col,checkFunc,result);
        }
    };

    /** 获取升级的等级加成 */
    module._getUpgradeLv = function(list){
        if (fightLogic.isGameType(constant.FightType.MINE_FIGHT) || fightLogic.isGameType(constant.FightType.MINE_READY)) {
            return 0;
        }
        var lv = 0;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            lv += obj.getLv();
        }
        lv -= 2;
        return lv;
    };

    /** 遍历列表 将锁减一 */
    module._removeLockList = function(list){
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i].getLockScript();
            if (!obj) continue;
            obj.desrLock();
        }
    };

    /** 单独检测 点击触发 */
    module._checkOneCell = function(card){
        var firstList = this.checkDisjointness(card,true);
        if (firstList.length > 0) {
            if (fightLogic.isGameType(constant.FightType.MINI_GAME)) {//资源副本合成规则不一致
                firstList.push(card);
                this.doCreater(firstList);
                this._removeLockList(firstList);
            }else {
                this.summonList(firstList,card);//检测这次合成了几个
            }
        }
        return firstList;
    };

    /** 获取基础家族数据 */
    module.getNextLineUp = function(){
        if (!this.randomList || this.randomList.length === 0) return cc.error("数组随机长度不够")
        var obj = jsonTables.random(this.randomList);
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,obj);
        if (this.nextForm > 0) {
            this.nextForm--;
            this.addBornMap(config[jsonTables.CONFIG_MONSTERFAMILY.Monsters][1]);
            return kf.clone(config[jsonTables.CONFIG_MONSTERFAMILY.Monsters][1]);
        }
        return kf.clone(config[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0]);
    };

    module.doCreater = function (list) {
        this.inCreatingCount += list.length;
        this.sandBoxCtl._dispatchEvent(list);
    };

    module.doSpecailCreater = function (list) {
        this.inCreatingCount += list.length;
        this.sandBoxCtl._dispatchEventFromSpecail(list);
    };

    module.doCreaterSure = function (data) {
        this.inCreatingCount ++;
        this.sandBoxCtl.node.dispatchDiyEvent("newCreatorForSure",data);
    };

    /** 检查合成列表周围的怪物 */
    module.checkStone = function(list,toggleList){
        var togglist = [];
        var actionList = [];
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var srcRow = obj.getRow();
            var srcCol = obj.getCol();
            this._checkStoneCell(srcRow,srcCol,togglist,actionList);
        }
        if (togglist.length > 0) {
            toggleList = toggleList.concat(togglist);
        }
        if (actionList.length > 0) {
            list = list.concat(actionList);
        }
        return {list:list,toggleList:toggleList};
    };

    module._checkStoneCell = function(srcRow,srcCol,togglist,actionList){
        this._checkStoneDir(DIRRECTION.TOP,srcRow,srcCol,togglist,actionList);
        this._checkStoneDir(DIRRECTION.BOTTOM,srcRow,srcCol,togglist,actionList);
        this._checkStoneDir(DIRRECTION.LEFT,srcRow,srcCol,togglist,actionList);
        this._checkStoneDir(DIRRECTION.RIGHT,srcRow,srcCol,togglist,actionList);
    };

    module._checkStoneDir = function(dir,row,col,togglist,actionList){
            switch (dir) {
                case DIRRECTION.TOP:
                    row += 1;
                    break;
                case DIRRECTION.BOTTOM:
                    row -= 1;
                    break;
                case DIRRECTION.LEFT:
                    col -= 1;
                    break;
                case DIRRECTION.RIGHT:
                    col += 1;
                    break;
            }
            if (!this.itemCells[row] || !this.itemCells[row][col]) return;
            var nextCell = this.itemCells[row][col]

            if (nextCell.bindJs.checkStone()) {
                nextCell.bindJs.dearStoneCount()
                if (nextCell.bindJs.isStoneDone()) {
                    var re = nextCell.bindJs.waiteToBroken();
                    if (!re) {//没有生成对象时 要加衰减列表多生成一个填充
                        togglist.push(nextCell.bindJs)
                    }
                    actionList.push(nextCell.bindJs)
                }
            }
    };

    /** 判断是否存在选中表中 */
    module.isInList = function(script,list){
        for (var i = 0; i < list.length; i++) {
            if (list[i].isTheSameScript(script)) {
                return true;
            }
        }
        return false;
    };
    //对poslist进行计算
    module.getNextRow = function (row,col,list,posList) {
        for (var j = 0 , jLen = posList.length; j < jLen; j++) {
            var obj = posList[j];
            if (obj === -1) {
                posList[j] = row;
                posList[row] = -1;
                list.push(row);
                return j;
            }
        }
        posList[row] = row;
        return row;
    };

    /** 队列进行重置数据位置，设置移动时长 */
    module.resetColData = function(col,list){
        var selectList = [];//需要移动的格子包含消除物品
        var unSelectList = [];//需要移动的格子不包含消除物品
        var posList = [];//用于保存这一列 所有交换后的下标对应， idx为咧索引0-this_height obj为应该放在这位置上的旧索引
        var disPassList = [];//用于存那些被消掉的位置  需要向下移动的格子
        for (var j = 0; j < this._widthCount; j++) {// j--->row 按照列开始遍历  去判断 这一个格子需要移动的距离
            var cell = this.itemCells[j][col];
            if (cell.bindJs.isCanDestory()) {
                if (this.isInList(cell.bindJs,list)) {//检查是否属于消除列表
                    selectList.push(cell.bindJs);
                    posList[j] = -1;
                }else {
                    unSelectList.push(cell.bindJs);
                    this.getNextRow(j,col,disPassList,posList);
                }
            }else if (cell.bindJs.isNeedMoveMore()) {
                posList[j] = j;
            }// TODO: 这里还要考虑别的情况 给pslist赋值
        }
        if (selectList.length === 0) return [];
        var actionList = [];//运动节点
        // var posCou = 0;//NOTE 多余变量？
        // for (var i = 0 , len = posList.length; i < len; i++) {
        //     var obj = posList[i];
        //     if (obj === -1) {
        //         posList[i] = disPassList.shift();
        //     }
        // }
        for (var i = 0; i < unSelectList.length; i++) {//为发生消除 只需移动

            var curRow =  this.getPos(posList,unSelectList[i].getRow());
            if(unSelectList[i].row === curRow)  continue;//NOTE  不动的item不需要增加到actionlist中

            var dsc = this.itemCells[curRow][col].bindJs;
            this.swichPoint(unSelectList[i],dsc,false,null);//NOTE 这里所有有的itemcell的数据已变更  item内部还未刷新
            if (unSelectList[i].waiteToIn(null,unSelectList[i].getPosition())) {
                actionList.push(unSelectList[i]);
            }
        }
        for (var i = 0; i < selectList.length; i++) {//发生消除了 在面多生成一些砖块
            var row = selectList[i].getRow() + selectList.length;
            var pos = cc.v2(selectList[i].getInitPos().x,selectList[i].getPosYByRow(row))
            if (selectList[i].waiteToIn(this.getNextLineUp(),pos)) {
                actionList.push(selectList[i]);
            }
        }

        return actionList;
    };
    module.getPos = function (posList,row) {//去pos中现有索引 找到变更后的位置
        for (var i = 0 , len = posList.length; i < len; i++) {
            var obj = posList[i];
            if (obj === row) {
                return i;
            }
        }
        // debugger
    };
    /** 获取当前位置在目标位置的上下左右*/
    module.getDirectionByTarget = function (curCcObj, targetCcObj) {
        var curRow = curCcObj.getRow();
        var curCol = curCcObj.getCol();

        var targetRow = targetCcObj.getRow();
        var targetCol = targetCcObj.getCol();

        var deltaRow = targetRow - curRow;
        var deltaCol = targetCol - curCol;

        if(deltaRow < 0)
            return constant.SandBoxDirecton.UP;
        if(deltaCol > 0)
            return constant.SandBoxDirecton.LEFT;
        if(deltaRow > 0)
            return constant.SandBoxDirecton.DOWN;
        if(deltaCol < 0)
            return constant.SandBoxDirecton.RIGHT;
        return constant.SandBoxDirecton.NONE;
    };

    /** 获取配置下的位置 合理怪物*/
    module.getSandCellByGaugePoint = function (row,col,grid,isCheckLock) {
        var list = [];
        if (!grid || grid.length === 0) return list;
        for (var i = 0 , len = grid.length; i <  len; i++) {
            var obj = grid[i];
            var target = this.getItemOneCell(row+obj[1],col+obj[0]);
            if (!target || !target.bindJs.isMonster()) continue;
            if (isCheckLock && target.bindJs.isLockScriptEnbale()) {
                continue;
            }
            list.push(target.bindJs);
        }
        return list;
    };

    /** 获取一个任意白色品质的怪物 */
    module.getItemCellByNomarlForm = function () {
        var reList = [];
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = this.itemCells[i][j];
                if (!obj.bindJs.isMonster()) continue;
                if (obj.bindJs.getForm() === tb.MONSTER_ORDINARY) {
                    reList.push(obj.bindJs);
                }
            }
        }
        if (reList.length > 0) {
            return jsonTables.random(reList);
        }
        return this.itemCells[0][0].bindJs;
    };

    module.getItemCellByTid = function (tid) {
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = this.itemCells[i][j];
                if (!obj.bindJs.isMonster()) continue;
                if (obj.bindJs.getConfigTid() === tid) {
                    return obj.bindJs;
                }
            }
        }
        return null;
    };


    /** 获取某个格子效果 */
    module.getItemOneCell = function(row,col){
        if (!this.itemCells[row]) {
            return null;
        }
        return this.itemCells[row][col];
    };
    /** 天使效果生效 */
    module.doAngleEffect = function(list){
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            obj.lvUp(1);// NOTE: 可以设置加成等级
        }
    };

    /** 大天使效果生效 */
    module.doAngleBigEffect = function(list,resName,clipName){
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            obj.doAngelBigEffect(resName,clipName);
        }
    };

    /** 哮天犬效果生效 */
    module.doDogEffect = function (row,col,tid,resName,clipName) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.SANDBOXMONSTER,tid);
        var grid = config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
        if (!grid) return;
        var list = this.getSandCellByGaugePoint(row,col,grid,false);
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            obj.doDogEffect(resName,clipName);
        }
    };

    /** 获取恶魔可以飞到的位置 */
    module.getDemondPos = function(row,col){
        var lists = [];
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                if (i === row && j === col) continue;
                var obj = list[j].bindJs;
                if (obj.isMonster()) {//这里可以让吸血鬼飞到锁下面
                    lists.push(obj);
                }
            }
        }
        lists.sort(function(){return Math.random() - 0.5});
        return lists[0];
    };
    /** 获取所有石块位置 */
    module.getCatapultStone = function () {
        var lists = [];
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (obj.type !== constant.Id_Type.STONE) continue;
                lists.push(obj);
            }
        }
        lists.sort(function(){return Math.random() - 0.5});
        return lists;
    };

    /** 磁铁效果 */
    module.doMagentEffect = function (list,script) {
        this.doCreater(list);
        var removeList = list.concat(script)
        this._startAllLoop(removeList,false,[],false,false);
    };

    /** 气球效果 */
    module.doBalloonEffect = function () {
        var itemCells = this.getItemCell();
        var srcList = [];
        var desList = [];
        for (var i = 0 , len = itemCells.length; i < len; i++) {
            var list = itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (!obj.isMonster()) continue;
                if (srcList.length <= desList.length) {
                    srcList.push(obj);
                }else {
                    desList.push(obj);
                }
            }
        }
        desList = jsonTables.randonByRand(desList);
        var reList = [];
        for (var i = 0 , len = desList.length; i <  len; i++) {
            var des = desList[i];
            var src = srcList[i];
            if (!src || !des) continue;
            this.swichPoint(src,des,true,null);
            reList.push(src);
            reList.push(des);
        }
        return reList;
    };

    /** 号令勋章 */
    module.doOrderEffect = function (dragItem) {
        var reList = [];
        if (!dragItem) return reList;
        var itemCells = this.getItemCell();
        for (var i = 0 , len = itemCells.length; i < len; i++) {
            var list = itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (!obj.isMonster() || dragItem.isTheSameScript(obj)) continue;
                if (obj.getConfigTid() !== dragItem.getConfigTid()) continue;
                reList.push(obj);
            }
        }
        return reList;
    };

    /** 炮台效果 */
    module.doGunTowerEffect = function (list,damgeParam,startPos,bulletID) {
        var player = fightLogic.getPlayerCCobj(true);
        if (!player) return cc.error("人都死了 还打什么打")
        var damage = player.getDamageReal() * damgeParam;
        var callBack = function(){
            for (var i = 0 , len = list.length; i <  len; i++) {
                var obj = list[i];
                obj.desrHpFromSand(damage);
            }
        }
        var endPos = list[0].getPosition();
        endPos = cc.v2(endPos.x,endPos.y);
        endPos.y += list[0].getBulletFixPos();
        fightLogic.callSceneRoot("showBullet",[startPos,endPos,callBack,bulletID]);
    };

    /** 轰轰火炮效果 */
    module.doArtilleryEffect = function (list,damgeParam,startPos,bulletID, endPos, resName, clipName) {
        var callBack = function () {
            endPos.y -= 300
            this.doArtilleryEffectEx(list,damgeParam,endPos,bulletID, resName, clipName);
        }.bind(this);
        fightLogic.callSceneRoot("showBullet",[startPos,endPos,callBack,bulletID, true]);
    };

    module.doArtilleryEffectEx = function (list,damgeParam,startPos,bulletID, resName, clipName) {
        var player = fightLogic.getPlayerCCobj(true);
        if (!player) return cc.error("人都死了 还打什么打");
        var damage = player.getDamageReal() * damgeParam;
        var endPos = list[list.length - 1].getPosition();
        endPos.y -= list[0].getBulletFixPos();
        endPos = cc.v2(endPos.x,endPos.y);
        var callBack = function(bullet){
            for (var i = 0 , len = list.length; i <  len; i++) {
                var obj = list[i];
                obj.desrHpFromSand(damage);
            }
            var node = uiResMgr.getPrefabEx(resName);
            node.parent = bullet.node.parent;
            node.setPosition(endPos);
            node.getComponent(resName).init(clipName);
            node.setLocalZOrderEx(101);
        }

        var winSize = cc.director.getWinSize();
        startPos = kf.pAdd(startPos, cc.v2(winSize.width/2, winSize.height/2));
        fightLogic.callSceneRoot("showBullet",[startPos,endPos,callBack,bulletID]);
    };

    ///////////////////////////////////手机移动///////////////////////////////////
    /** 获得一个移动位置与构造位置 */
    module.getTogglePos = function(node){
        var itemCells = this.getItemCell();
        if (guideLogic.isInGuideFlag() && guideLogic.isTipLine) {
            for (var i = 0 , len = itemCells.length; i < len; i++) {
                var list = itemCells[i];
                for (var j = 0 , jLen = list.length; j < jLen; j++) {
                    var obj = list[j].bindJs;
                    if (!obj.isCanTouch()) continue;
                     var re = this._checkTogglePos(i,j,obj);
                    if (!re) continue;
                    var targetScript = this._getSameMerge(re.posRe.pos1,re.posRe.pos2);
                    if (!targetScript) continue;
                    if (re.posRe.pos1.x === re.posRe.pos2.x || re.posRe.pos1.y === re.posRe.pos2.y) {
                        continue;
                    }
                    guideLogic.sencondFingerFlag = true;
                    guideLogic.isTipLine = false;

                    var posList = [{row:re.posRe.pos1.x,col:re.posRe.pos1.y},{row:re.posRe.pos2.x,col:re.posRe.pos2.y}];
                    if ((obj.row === re.posRe.pos1.x && obj.col === re.posRe.pos1.y) || (obj.row === re.posRe.pos2.x && obj.col === re.posRe.pos2.y)) {
                        posList.push({row:re.cell.row,col:re.cell.col});
                    }else {
                        posList.push({row:obj.row,col:obj.col});
                    }
                    return {beginPos:kf.getPositionInNode(targetScript.node,node),endPos:kf.getPositionInNode(re.cell.node,node),posList:posList}
                }
            }
        }

        for (var i = 0 , len = itemCells.length; i < len; i++) {
            var list = itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (!obj.isCanTouch()) continue;
                var re = this._checkTogglePos(i,j,obj);
                if (!re) continue;
                var targetScript = this._getSameMerge(re.posRe.pos1,re.posRe.pos2);
                if (!targetScript) continue;
                return {beginPos:kf.getPositionInNode(targetScript.node,node),endPos:kf.getPositionInNode(re.cell.node,node)}
            }
        }
        return null;
    };
    /** 检测某个位置的四个方向 */
    module._checkTogglePos =function(row,col,cell){
        var re = this._checkNearSame((row-1),col,(row+1),col);
        if (re) return {posRe:re,cell:cell};
        var re = this._checkNearSame((row),(col-1),(row),(col+1));
        if (re) return {posRe:re,cell:cell};
        var re = this._checkNearSame((row-1),(col+1),(row+1),(col-1));
        if (re) return {posRe:re,cell:cell};
        var re = this._checkNearSame((row-1),(col-1),(row+1),(col+1));
        if (re) return {posRe:re,cell:cell};
        var re = this._checkNearSame(row,col,(row+1),col);
        var targetCell = this.isCellExist((row + 2) , (col));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row - 1) , (col));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row-1),col);
        var targetCell = this.isCellExist((row -2) , (col));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row + 1) , (col));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row),(col + 1));
        var targetCell = this.isCellExist((row) , (col + 2));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row ) , (col - 1));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row),(col - 1));
        var targetCell = this.isCellExist((row) , (col - 2));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row ) , (col + 1));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row+1),(col + 1));
        var targetCell = this.isCellExist((row + 2) , (col + 2));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row - 1) , (col - 1));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row-1),(col - 1));
        var targetCell = this.isCellExist((row - 2) , (col - 2));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row + 1) , (col + 1));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row - 1),(col + 1));
        var targetCell = this.isCellExist((row - 2) , (col + 2));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row + 1) , (col - 1));
        if (re && targetCell) return {posRe:re,cell:targetCell};

        var re = this._checkNearSame(row,col,(row + 1),(col - 1));
        var targetCell = this.isCellExist((row + 2) , (col - 2));
        if (re && targetCell) return {posRe:re,cell:targetCell};
        var targetCell = this.isCellExist((row - 1) , (col + 1));
        if (re && targetCell) return {posRe:re,cell:targetCell};


        return null;
    };

    module.isCellExist = function (row,col) {
        if (this.itemCells[row] && this.itemCells[row][col] && this.itemCells[row][col].bindJs.isCanTouch() ) {
            return this.itemCells[row][col].bindJs;
        }
        return null;
    };

    /** 获取俩个位置是否可合成 */
    module._checkNearSame = function(row1,col1,row2,col2){
        if (this.itemCells[row1] && this.itemCells[row1][col1] && this.itemCells[row2] &&  this.itemCells[row2][col2]) {
            if (this.itemCells[row1][col1].bindJs.checkToggle(this.itemCells[row2][col2].bindJs)) {
                return {pos1:cc.v2(row1,col1),pos2:cc.v2(row2,col2)}
            }
        }
        return null;
    };
    /** 检测对角线是否可合成 */
    module._getSameMerge = function(pos1,pos2){
        var cellScript = this.itemCells[pos1.x][pos1.y].bindJs
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                if ((i === pos1.x && j === pos1.y ) || (i === pos2.x && j === pos2.y) ) continue;
                if (cellScript.checkToggle(this.itemCells[i][j].bindJs) && this.itemCells[i][j].bindJs.isCanTouch()) {
                    return this.itemCells[i][j].bindJs;
                }
            }
        }
        return null;
    };
    /** 获取任意一个可以点击的位置 */
    module.getAnyCanMoveMonster = function(){
        var lists = [];
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (obj.isCanTouch()) {
                    lists.push(obj);
                }
            }
        }
        lists.sort(function(a,b){
            return b.getForm() - a.getForm();
        });
        return lists[0];
    };

    //////////////////////////////////////////////////////////////////////////
    /** 检测可以合成过程 */
    module.doCheckTouchMove = function (startScript,endScript) {
        if (endScript.getConfigTid() !== startScript.getConfigTid()) {
            var checkList = [];
            var jumpObjAni = {};
            jumpObjAni.isJump = true;
            this.touchEnable = false;
            jumpObjAni.cb = function () {
                this.touchEnable = true;
                var firstList = this._checkOneCell(startScript);
                if (firstList.length > 0 && !startScript.isMaxForm() && !fightLogic.isGameType(constant.FightType.MINI_GAME)){//最高级形态不加入检查列表
                    checkList.push(startScript);
                }

                var endList = this._checkOneCell(endScript);
                if (endList.length > 0  && !endScript.isMaxForm() && !fightLogic.isGameType(constant.FightType.MINI_GAME)){//最高级形态不加入检查列表
                    checkList.push(endScript);
                }
                firstList = firstList.concat(endList);
                if (firstList.length > 0) {
                    this.sandBoxCtl._dispatchAudioEvent(false);
                }
                //没有消除 提示一下玩家
                if (firstList.length === 0 && !this.isTip) {
                    uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("sandBoxContrl","invalidMove"));
                    this.isTip = true;
                }
                this._startAllLoop(firstList,true,checkList,true,true);
            }.bind(this);
            this.swichPoint(startScript,endScript,true,jumpObjAni);
            return true;
        }else{
            return false;
        }
    };

    /** 检测可以特殊怪物吞噬 */
    module.doCheckTouchSpecail = function (startScript,endScript) {
        if (endScript.isSwallowForm(startScript)) {
            this.touchEnable = false;
            startScript.setLv(1);
            var removeList = [startScript];
            var toggleList = [];
            var re = endScript.doSwallow(startScript,removeList,toggleList);
            var result = endScript.checkSpecialItem();
            if (re === false && result === false) {
                this.touchEnable = true;
                return;
            }
            setTimeout(function () {
                this.touchEnable = true;
                this._startAllLoop(removeList,false,toggleList,false,false);
            }.bind(this), re.delay*1000);
        }else {
            if(endScript.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] === tb.MONSTER_NO)
                uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage("sandBoxContrl","addFormNo"));
            else {
                var formStr = uiLang.getMessage("fightFamily","raity"+endScript.config[jsonTables.CONFIG_MONSTER.Form]);
                var msgStr = uiLang.getMessage("sandBoxContrl","poorForm").formatArray([formStr]);
                uiManager.openUI(uiManager.UIID.TIPMSG,msgStr);
            }
        }
    };

    /** 用户手动拖出 */
    module.doCheckTouchOut = function (startScript) {
        startScript.setLv(1);
        var isNeedDesr = false;
        if ( startScript.getForm() < tb.MONSTER_EPIC || fightLogic.isGameType(constant.FightType.PVP_AREAN) ) {
            isNeedDesr = true;
            if (startScript.getForm() === tb.MONSTER_EXCELLENT) {
                guideLogic.closeFirstGuideAction(false);
            }
        }
        this.doCreater([startScript]);
        this._startAllLoop([startScript],isNeedDesr,[],false,true);//NOTE 上阵

    };

    /** 全自动 */
    module.autoToggle = function (checkFunc) {
        this.checkFunc = checkFunc;
        var toggelList = this.getRandToggle();
        if (toggelList.length === 0) {
            var target = this.getAnyCanMoveMonster();
            this.doCheckTouchOut(target);
        }else {
            var cell = jsonTables.random(toggelList);
            toggelList.sort(function(a,b){
                return b.from.getForm() - a.from.getForm();
            })
            var cell = toggelList[0]
            this.doCheckTouchMove(cell.from,cell.to);
        }
    };

    module.getRandToggle = function () {
        var itemCells = this.getItemCell();
        var toggelList = [];
        for (var i = 0 , len = itemCells.length; i < len; i++) {
            var list = itemCells[i];
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                if (!obj.isCanTouch()) continue;
                var re = this._checkTogglePos(i,j,obj);
                if (!re) continue;
                var targetScript = this._getSameMerge(re.posRe.pos1,re.posRe.pos2);
                if (!targetScript) continue;
                toggelList.push({from:targetScript,to:re.cell});
            }
        }
        return toggelList;
    };

    module.callNextPop = function () {
        this.log("callNextPop------>",this.msgPip.length)
        if (this.msgPip.length === 0) {
        }else {
            var func = this.msgPip.shift();
            func();
        }
    };
    //开始行为
    module.loopStart = function () {
        this.log("start------>sandLoop")
        this.touchEnable = false;
        if (this.isNeedDesr) {
            this.sandBoxCtl.showNextSTep();
        }
        this.callNextPop();
    };

    module.loopInvaldState = function () {
        var list = this.removePetrifaction();
        if (list.length > 0) {
            var removeList = [];
            var checkList = [];
            for (var i = 0 , len = list.length; i <  len; i++) {
                var obj = list[i];
                var tmpList = this._checkOneCell(obj);
                if (tmpList.length > 0) {
                    removeList.concatSelf(tmpList);
                    if (!obj.isMaxForm()) {//最高级形态不加入检查列表
                        checkList.push(obj);
                    }
                }
            }
            if (removeList.length > 0) {
                this._loopSelf(removeList,checkList);//向管道插入
            }
        }
        this.callNextPop();
    };

    //结束行为
    module.loopEnd = function () {
        this.msgPip = [];
        if (this.isNeedDesr) {
            fightLogic.desrStep();
        }
        if (fightLogic.isGameType(constant.FightType.PVP_AREAN)) {//每次回合变化 去告诉服务器 衰减了
            var list = fightLogic.getKeepsListForServer(9999999);
            areanLogic.req_Arena_GenMonster(list);
            // var table = {
            //     Grid:this.getTableNow(),
            // };
            // configuration.setConfigData("areanTable",JSON.stringify(table));
            // configuration.save();
        }
        this.checkDisplay();
        this.log("end------>endLoop")

    };
    //检测表演
    module.checkDisplay = function () {
        if (this.msgPip.length === 0 && this.inCreatingCount === 0) {
            if (!fightLogic.isGameType(constant.FightType.MINI_GAME)){
                fightTalkLogic.checkSandTalk();
            }
            this.touchEnable = true;
            if (fightLogic.getCurStep() <= 0) {
                fightLogic.sandBoxEnd();
            }
        }
    };

    /** 增加步数 */
    module.addStep = function (num) {
        fightLogic.addStepNum(num);
    };

    /** 开始所有行为  list内存放着所有要被消除格子的脚本   isNeedDesr是否在结束时减少步骤  checkList 已检测列表  isFade 是否先进行闪光动画  checkSpecail 是否进行特殊怪物处理  */
    module._startAllLoop = function (list,isNeedDesr,checkList,isFade,checkSpecail) {
        // NOTE: 开始合并行为
        this.isNeedDesr = isNeedDesr;
        this.msgPip = [];
        this.msgPip.push(this.loopStart.bind(this));
        this.pipDestoryList = list;//记录下需要被消除的
        this.pipToggleList = checkList;//这里是那些触发点
        this.log("_startAllLoop------>")

        if (isFade) {
            var func = this._runFadeAction();
            this.msgPip.push(func);
        }
        var func = this._destoryAndCreator();
        this.msgPip.push(func);
        if (checkSpecail) {
            var func = this._specialState(1);
            this.msgPip.push(func);
            // var func = this._specialState(2);
            // this.msgPip.push(func);
        }
        this.msgPip.push(this.loopInvaldState.bind(this));
        this.msgPip.push(this.loopEnd.bind(this));
        this.callNextPop();
    };

    /** toggleList  触发列表 ,moveDoneCell被操作列表 */
    module._runFadeAction = function () {
        var runCb = function () {
            var toggleList = this.pipDestoryList;
            var moveDoneCell = this.pipToggleList;

            for(var i = toggleList.length-1;i > -1;i--){
                var obj = toggleList[i];
                if (this.isInList(obj,moveDoneCell)) {
                     toggleList.splice(i,1);
                }
            }
            var actionList = toggleList.concat(moveDoneCell);

            if (actionList.length > 0) {
                var re = this.checkStone(actionList,toggleList);
                actionList = re.list;
                toggleList = re.toggleList;
            }
            var cb = function(){
                this.pipDestoryList = toggleList;// NOTE: 修正参数
                this.callNextPop();
            }.bind(this);
            jsonTables.doCountAction(actionList,"runFadeAction",[],cb);

        }.bind(this);
        return runCb;
    };

    module._destoryAndCreator = function () {
        var runCb = function () {
            if (this.itemCells.length === 0) return;// NOTE: 存在断网后 回调问题
            var list = this.pipDestoryList;
            var actionList = [];
            for (var i = 0; i < this._heightCount; i++) {//i --->col
                var colList = this.resetColData(i,list);
                actionList = actionList.concatSelf(colList);
            }
            var cb = function(){
                if (this.pipToggleList.length > 0) {//进行重复检查时  把之前的触发点也放进去检查
                    for (var j = 0; j < this.pipToggleList.length; j++) {
                        if (!this.isInList(this.pipToggleList[j],actionList)) {//向检测点列表尾部添加即将参与运动却未检测的点
                            actionList.push(this.pipToggleList[j]);
                        }
                    }
                }
                this.pipDestoryList = actionList;
                this.moveDoneCallBack();
                this.callNextPop();
            }.bind(this);
            jsonTables.doCountAction(actionList,"runAction",[],cb);

        }.bind(this);
        return runCb;
    };
    /** 检测移动后列表  如果还有合成就插入到队列头部 */
    module._loopSelf = function (list,checkList) {
        this.pipDestoryList = list;//刷新列表
        this.pipToggleList = checkList;

        var func = this._destoryAndCreator();  //TODO 这个函数要比下面早插入  好处于第二位
        this.msgPip.unshift(func);
        var func = this._runFadeAction();
        this.msgPip.unshift(func);
    };

    //所有节点移动完后在检测一下
    module.moveDoneCallBack = function(){
        var actionList = this.pipDestoryList;
        var toggleList = [];//触发对象不存在自己
        var upgradeAgain = [];
        var countList = [];//保存计算唯一值
        var bmutilte = false;
        for (var i = 0; i < actionList.length; i++) {
            var firstList = this.checkDisjointness(actionList[i],false);
            if (firstList.length === 0) continue;//没有触发 就不管了
            var len = firstList.length;//数组长度代表是否多组合成
            for (var z = 0; z < len; z++) {
                var allCol = actionList[i].getCol();
                var allRow = actionList[i].getRow();

                var list = firstList[z];
                for (var j = 0; j < list.length; j++) {
                    if (!this.isInList(list[j],actionList)) {//向检测点列表尾部添加即将参与运动却未检测的点
                        actionList.push(list[j]);
                    }
                    allRow += list[j].getRow();
                    allCol += list[j].getCol();
                }

                var jDx = -1;
                for (var j = 0; j < countList.length; j++) {
                    if (countList[j].row === allRow && countList[j].col === allCol && (countList[j].toggleRow !== actionList[i].getRow() || countList[j].toggleCol !== actionList[i].getCol())) {//NOTE 修复1月24号BUG ：交叉型消除BUG
                        jDx = j;
                        break;
                    }
                }
                if (len > 1) {//代表这货是多组合成
                    bmutilte = true;
                    if (jDx !== -1) {//表示之前已经有重合部分 把之前那个移除掉
                        countList.splice(jDx,1);
                        upgradeAgain.splice(jDx,1);
                        toggleList.splice(jDx,1);
                        jDx = -1;
                    }
                }
                if (jDx !== -1) continue;//不允许添加就跳过
                countList.push({row:allRow,col:allCol,toggleRow:actionList[i].getRow(),toggleCol:actionList[i].getCol()});//NOTE 修复1月24号BUG ：交叉型消除BUG.保存触发节点，相同触发节点的不抵消
                upgradeAgain.push(actionList[i])
                toggleList.push(list);
            }
        }
        if (bmutilte) {//存在多组组合
            var uniqueResult = jsonTables.uniqueList(upgradeAgain);
            if (uniqueResult.idxList.length > 0) {//说明此时存在重复key
                var removeIds = [];
                for (var i = 0; i < uniqueResult.idxList.length; i++) {
                    var idxs = uniqueResult.idxList[i];
                    for (var j = 1; j < idxs.length; j++) {//从一开始保留唯一值
                        var list = toggleList[idxs[j]];
                        removeIds.push(idxs[j]);//标记删除的索引统一删除
                        toggleList[idxs[0]] = toggleList[idxs[0]].concat(list);//将重复合成的链接在一起
                    }
                }
                removeIds.sort(function(a,b){ return b - a});
                for (var i = 0; i < removeIds.length; i++) {
                    upgradeAgain.splice(removeIds[i],1);
                    toggleList.splice(removeIds[i],1);
                }
            }
        }
        this.pipDestoryList = [];
        this.pipToggleList = [];
        if (upgradeAgain.length > 0) {
            var nextMoveDone = [];
            var resultList = [];
            for (var i = 0; i < toggleList.length; i++) {
                resultList = resultList.concat(toggleList[i]);
            }
            if (!fightLogic.isGameType(constant.FightType.MINI_GAME)){
                for (var i = 0; i < upgradeAgain.length; i++) {
                    this.summonList(toggleList[i],upgradeAgain[i]);//检测这次合成了几个
                }
                nextMoveDone.concatSelf(upgradeAgain);//toggleList[i].length 标识该触发点 是几个触发
            }else {
                resultList = resultList.concat(upgradeAgain);
                this.doCreater(resultList);
                this._removeLockList(resultList);
            }

            var addFunc = function () {
                this._loopSelf(resultList,nextMoveDone);//向管道插入
                this.callNextPop();
            }.bind(this);
            this.msgPip.unshift(addFunc);
            this.sandBoxCtl._dispatchAudioEvent(true);
        }
        this.resetSandPool();
    };
    /** 进行特殊沙盘怪物阶段检测 */
    module._specialState = function (type) {
        var runCb = function(){

            var actionList = fightLogic.getSpecialList(type);
            var removeList = [];//沙盘需要被消除的列表
            var addList = [];//产生怪物的列表
            var toggleList = [];//需要被检测的列表
            var fadeActionCount = 0;
            var actionListLen = actionList.length;
            var callFunc = function(type,script){
                fadeActionCount++;
                if ((type === tb.SAND_MONSTER_ONEEYE || type === tb.SAND_MONSTER_CATAPULT) && addList.length > 0) {
                    if (addList.length > 0) {
                        this.doSpecailCreater(addList);
                    }
                    for (var i = 0 , len = addList.length; i < len; i++) {
                        var node = addList[i];
                        var obj = node.script;
                        obj.setLv(1);
                    }
                    addList = [];
                }
                if (script && script.checkRoundMonDone) {
                    script.checkRoundMonDone();
                }
                if (fadeActionCount === actionListLen) {
                    if (toggleList.length > 0) {
                        var nextCall = function () {
                            var firstList = [];
                            var checkList = [];
                            for (var i = 0 , len = toggleList.length; i < len; i++) {
                                var obj = toggleList[i];
                                var endList = this._checkOneCell(obj);
                                if (!fightLogic.isGameType(constant.FightType.MINI_GAME) && endList.length > 0 && !obj.isMaxForm()) {//最高级形态不加入检查列表
                                    checkList.push(obj);
                                }
                                firstList = firstList.concat(endList);
                            }
                            if (firstList.length > 0) {
                                this.sandBoxCtl._dispatchAudioEvent(false);
                                this._loopSelf(firstList,checkList);//向管道插入
                            }
                            this.callNextPop();
                        }.bind(this);
                        this.msgPip.unshift(nextCall);//增加触发列表
                    }
                    if (removeList.length > 0) {// NOTE: 先去 把沙盘补齐  然后去触发后者
                        this.pipDestoryList = removeList;
                        var func = this._destoryAndCreator();
                        this.msgPip.unshift(func);//增加触发列表
                    }
                    this.callNextPop();
                }
            }.bind(this)
            if (actionList.length > 0) {
                for (var i = 0 , len = actionList.length; i < len; i++) {
                    var obj = actionList[i];
                    obj.doSpecailEffect(callFunc,removeList,addList,toggleList);
                    if (obj.doActionDone()) {//将那些回合性的东西消除掉
                        removeList.push(obj);
                    }
                }
            }else {
                fadeActionCount--;
                callFunc();
            }
        }.bind(this);
        return runCb;
    };
    //触发合成列表  每次合成都会进来  list 触发合成列表（排除了自己）   toggleItem 触发点
    //触发合成列表  每次合成都会进来  list 触发合成列表（排除了自己）   toggleItem 触发点
    module.summonList = function (list,toggleItem) {
        var talentList = talentSkillLogic.getDestory2Tablent(list);
        if (talentList && talentList.length > 0) {
            if (fightLogic.isGameType(constant.FightType.PVE)) {//多余三个以上说明这一次多个
                achievementLogic.recordAchi(constant.AchievementType.MUTL_SUMMONE,1,true);
            }
            for (var j = 0 , jLen = talentList.length; j <  jLen; j++) {
                var obj = talentList[j];
                talentSkillLogic.checkSandTime(obj,toggleItem);
            }
        }

        var newCreators = [toggleItem];// NOTE 我自己的等级加了吗？？？
        var lv = this._getUpgradeLv(list);
        for (var j = 0 , len = list.length; j < len; j++) {
            var bTooggleItem = list[j];
            bTooggleItem.waiteToIn(null,null,null,null,toggleItem);//保存触发时的指定目标
            if (j >= 2) {
                newCreators.push(toggleItem);
            }
        }
        var nextTid = toggleItem.getNextLevelTid();
        if ( nextTid === 0) {//橙色额外召唤三个
            for (var i = 0; i < 3; i++) {
                newCreators.push(toggleItem);
            }
            list.push(toggleItem);//加入destory列表
        }else {
            toggleItem.waiteToIn(null,null,nextTid,lv,toggleItem);
        }
        this.doCreater(newCreators);
        this.addBornMap(toggleItem.getNextLevelConfigTid());
        var checkList = kf.cloneArray(list);
        checkList.push(toggleItem);
        this._removeLockList(checkList);
    };


    //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////network save data///////////////////////////////////////////////
    module.saveAreanInfo = function (heros) {
         var tables = {};
        tables.Grid = [];
        for (var i = 0 , len = this.itemCells.length; i < len; i++) {
            var list = this.itemCells[i];
            tables.Grid[i] = tables.Grid[i] || {};
            for (var j = 0 , jLen = list.length; j < jLen; j++) {
                var obj = list[j].bindJs;
                tables.Grid[i].Data = tables.Grid[i].Data || [];
                tables.Grid[i].Lv = tables.Grid[i].Lv || [];
                tables.Grid[i].Data[j] = obj.getData();
                tables.Grid[i].Lv[j] = obj.getLv();
            }
        }
        tables.Borken = [];
        tables.SpeData = [];
        var power = fightLogic.getMineFihgtPower();
        areanLogic.req_Arena_Round(tables,heros,power);
    };
    //获取当前的沙盘
    module.getTableNow = function () {
        var tables = {};
       tables.Grid = [];
       for (var i = 0 , len = this.itemCells.length; i < len; i++) {
           var list = this.itemCells[i];
           tables.Grid[i] = tables.Grid[i] || {};
           for (var j = 0 , jLen = list.length; j < jLen; j++) {
               var obj = list[j].bindJs;
               tables.Grid[i].Data = tables.Grid[i].Data || [];
               tables.Grid[i].Lv = tables.Grid[i].Lv || [];
               tables.Grid[i].Data[j] = obj.getData();
               tables.Grid[i].Lv[j] = obj.getLv();
           }
       }
        return  tables;
    };

    module.saveSandBox = function () {
        if (fightLogic.isGameType(constant.FightType.PVE)) {
            var info = fightLogic.getPveInfo();
            var tables = chapterLogic.getChapterTableInfo(info.id);
            var broken = chapterLogic.getBorkenInfoEx(info.id);
            tables.Borken = broken;
            var nodeIDs = chapterLogic.getClearance(info.id);//通关的小关卡id
            if (nodeIDs.length === 0) {//没有保存过 从静态数据拷贝一份
                var list = chapterLogic.getChapterInfoNodeInfo(info.id);
                for (var i = 0 , len = list.length; i < len; i++) {
                    var obj = list[i];
                    var data = {NodeID:obj.Idx,Passed:false,Rewards:obj.Rewards,PickRewards:obj.PickRewards,PickRecord:[],AdventureID:obj.AdventureID};
                    nodeIDs.push(data);
                }
            }
            for (var i = 0 , len = nodeIDs.length; i < len; i++) {
                var obj = nodeIDs[i];
                if (obj.NodeID === info.chapterIdx) {
                    obj.Passed = true;
                    break;
                }
            }
            var speDataList = [];
            for (var i = 0 , len = this.itemCells.length; i < len; i++) {
                var list = this.itemCells[i];
                for (var j = 0 , jLen = list.length; j < jLen; j++) {
                    var obj = list[j].bindJs;
                    var speData = obj.getSpeData();
                    if (speData) {
                        speDataList.push(speData);
                    }
                    tables.Grid[i].Data[j] = obj.getData();
                    tables.Grid[i].Lv[j] = obj.getLv();
                }
            }
            tables.SpeData = speDataList;
            var saveCount = userLogic.getBaseData(userLogic.Type.HeroKeep) + userLogic.getBaseData(userLogic.Type.HeroKeepEx);
            var list = fightLogic.getKeepsListForServer(saveCount);
            var userReel = fightLogic.getRoot().getUsedReelList();
            cardLogic.clearCopyReel();
            chapterLogic.saveDataList(info.id,tables,nodeIDs,list);
            chapterLogic.addChapterKeyNum(info.id,info.chapterIdx);
            chapterLogic.req_ChapterBattleSet(info.id,info.chapterIdx);
            chapterLogic.req_ChapterNodeState(info.id,info.chapterIdx,chapterLogic.STATE_NODE.PASS,userReel);//关卡状态 一定要在章节数据同步之后
            if (!chapterLogic.isPassChapter(info.id)) {
                chapterLogic.req_ChapterState(info.id,chapterLogic.STATE_ENUM.PLAYING);
            }
            this.callServerQuality();
        }else if (fightLogic.isGameType(constant.FightType.MINE_READY)) {//上报阵容
            var list = fightLogic.getKeepsListForServer(100);
            mineLogic.req_Save_MineHeroes(list);
        }
    };

    return module;
};
