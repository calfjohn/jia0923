var panel = require("panel");
var ID_TYPE = constant.Id_Type;

cc.Class({
    extends: panel,

    properties: {
        moveSpeed: {
            default: 100,
            tooltip: "砖块移动速度"
        },
        fadeCount: {
            default: 3,
            tooltip: "砖块闪光次数"
        },
        fadeTime: {
            default: 1,
            tooltip: "砖块闪光耗时"
        },
        suckTime: {
            default: 0.4,
            tooltip: "吸附或缩放总时长"
        },
        moveScale:{
            default: 1.5,
            tooltip: "拖动时的缩放大小"
        },
        isUseConfig:{
            default: true,
            tooltip: "是否使用配置表的缩放大小"
        },
        scaleMore:{
            default: 0.3,
            tooltip: "吸收放大时长"
        },
        scaleSuckSize:{
            default: 1.5,
            tooltip: "吸收放大倍率"
        },
        scaleSmall:{
            default: 0.15,
            tooltip: "吸收变小时长"
        },
    },

    // use this for initialization
    onLoad: function () {
        this.scaleSize = 1;
        this.moveScaleTimes = 1;
        this.specailTypeList = [ID_TYPE.SPECIAL_COUNT,
                                ID_TYPE.SPECIAL_ROUND,
                                ID_TYPE.SPECIAL_LAST_ROUND,
                                ID_TYPE.SPECIAL_STONE_ROUND,
                                ID_TYPE.SPECIAL_LAST_COUNT];
        this.specailCoutList = [ID_TYPE.SPECIAL_COUNT,
                                ID_TYPE.SPECIAL_LAST_COUNT];
    },

    initWidgetNode:function(){
        this.stoneNode = this.widget('sandBoxItem/stone');
        this.boomNode = this.widget('sandBoxItem/boom');
        this.numLabelNode = this.widget('sandBoxItem/numLabel');
        this.spineNode = this.widget('sandBoxItem/spineNode');
    },

    /**
     * 初始化
     * @param  {int} data       服务端该位置索引  Xnnnn
     * @param  {int} row        行
     * @param  {int} col        列
     * @param  {ccobj} relativeBg 关联背景脚本
     * @param  {int} lv         该位置加成等级
     * @param  {int} brokenIdx  列表索引
     * @param  {int} chapterId  大章节id
     * @param  {ccobj} lockScript  关联脚本节点
     * @param  {int} scaleSize  节点缩放比例
     * @param  {int} bornRound  出生回合
     * @param  {boolen} isFirst  是否首次
     */
    init:function(data,row,col,relativeBg,lv,brokenIdx,chapterId,lockScript,scaleSize,bornRound,isFirst){
        this.moveScaleTimes = 4 / this.fightLogic.getSandBoxLen();
        this.initWidgetNode();
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.lv = lv || 1;
        this.row = row;
        this.col = col;
        this.bornRound = bornRound || this.fightLogic.getCurStep();
        this.scaleSize = scaleSize || 1;
        this.chapterId = chapterId;
        this.brokenIdx = brokenIdx;// NOTE: 砖块不会被移动 所以这个索引就没必要交换了
        this.data = data;
        this.type = Math.floor(data /jsonTables.TYPE_BASE_COUNT);
        this.ref = data - (this.type*jsonTables.TYPE_BASE_COUNT);
        this.isPause = false; //NOTE  用来标记是否暂停使用该机关
        this.stoneNode.active = this.type === ID_TYPE.STONE;
        this.boomNode.active = false;
        this.numLabelNode.setPosition(this.node.width/2,-this.node.height/2 );
        this.numLabelNode.scale = this.scaleSize;
        this.spineNode.y = this.node.height/235 * 90 * -1;//这里进行缩放比高度计算 是否要参数化呢
        this.spine = this.spineNode.getComponent(sp.Skeleton);
        this.setPetrifaction(false);
        this.spineNode.active = this.type === ID_TYPE.MONSTER;
        if (this.type !== ID_TYPE.MONSTER) {
            this.spine.skeletonData = null;
        }
        this.relativeBg = relativeBg;
        this.hpCount = 0;
        switch (this.type) {
            case ID_TYPE.NONE:
                this.numLabelNode.active = false;
                break;
            case ID_TYPE.STONE:
                this.boomNode.scaleX = this.node.width/235;
                this.boomNode.scaleY = this.node.height/235;
                this.stoneNode.setContentSize(this.node.getContentSize());
                this.numLabelNode.active = true;
                this.setLabel("x"+this.ref);
                break;
            case ID_TYPE.MONSTER:
                this.setLv(lv);
                this.setConfigTid(this.ref);
                break;
            case ID_TYPE.SPECIAL_COUNT:
            case ID_TYPE.SPECIAL_LAST_COUNT:
            case ID_TYPE.SPECIAL_ROUND:
            case ID_TYPE.SPECIAL_LAST_ROUND:
            case ID_TYPE.SPECIAL_STONE_ROUND:
            case ID_TYPE.CLICK_EFFECT:
                var relaCount = this.ref.toString();
                if (this.type === ID_TYPE.SPECIAL_STONE_ROUND) {
                    this.hpCount = Number(relaCount.slice(relaCount.length-1,relaCount.length));//回合数  //需要消除的次数
                    this.count = Number(relaCount.slice(relaCount.length-2,relaCount.length-1));//回合数  //需要消除的次数
                }else {
                    this.count = Number(relaCount.slice(relaCount.length-2,relaCount.length));//回合数  //需要消除的次数
                }
                this.ref = Number(relaCount.slice(0,relaCount.length-2));
                this._loadSpecialSpin(this.ref);
                this.numLabelNode.active = this.count > 0;//0标识无穷大
                this.setLabel("x"+this.count);
                this.fightLogic.onSpecialMonster(this);
                break;
        }
        if (this.relativeBg) {
            this.relativeBg.init(data,row,col);
            this.setBgColor();
            this.relativeBg.setVisible(this.type !== ID_TYPE.NONE);
        }
        this.lockScript = lockScript;
        if (this.lockScript && isFirst) {
            this.lockScript.init(data,row,col,brokenIdx,chapterId);
        }
        this.setPosition(this.node.width*(col + 0.5),this.node.height*( row + 0.5));
        this.initPos = this.getPosition();
        this.resetToInitPos();

    },

    _reInit:function(tid,step){
        this.init(tid,this.getRow(),this.getCol(),this.relativeBg,this.lv,this.brokenIdx,this.chapterId,this.lockScript,this.scaleSize,step ? step : this.fightLogic.getCurStep(),false);//// TODO: 变更自己后要重新设置所有数据
    },

    setLabel:function (str) {
        if (!this.numLabelNode || !str) return;
        this.numLabelNode.getComponent(cc.Label).string = str;
    },

    /** 破碎设置结果 */
    waiteToBroken:function(){
        var data = this.getBrokenStoneTid();
        if (data === null) return false;
        this.nextTid = data;
        this.numLabelNode.active = false;
        return true;
    },

    /**
     * 设置下一步的数据
     * @param  {int} tid     [直接变身 指定形态]
     * @param  {Object} runActionStartPos     [进行移动时的初始位置]
     * @param  {int} nextTid [闪光之后变身]标识是否需要在闪光了变装
     * @param  {int} nextLv  [闪光后的加成等级]
     * @param  {CCObj} targetScript  [闪光后运动目标]
     */
    waiteToIn:function(tid,runActionStartPos,nextTid,nextLv,targetScript){
        var re = false;//返回值用于判定是否需要进行闪光动画回调计数
        if (tid) {//有数据传递进来说明要更新item内容
            this.setConfigTid(tid);
            this.setLv(1);
        }
        if (runActionStartPos) {
            // this.runActionStartPos = runActionStartPos;
            this.setPosition(runActionStartPos);
            this.needMove = kf.pDistance(runActionStartPos,this.initPos)/jsonTables.accSpeed(this.moveSpeed) ;
            re = true;
        }
        if (nextTid) {
            this.nextTid = nextTid;
        }
        if (nextLv) {
            this.nextLv = nextLv;
        }
        if (targetScript && jsonTables.showMergeAni) {
            if (this.isMonster()) {
                this.targetScript = targetScript;
            }else {
                cc.log("不是怪物不处理")
            }
        }
        return re;
    },

    runFadeAction:function(callBack){
        if (this.isMonster()) {
            var list = [];
            var count = this.fadeCount * 2;
            for (var i = 0; i < count; i++) {
                var fade = (i % 2 === 0) ? 50 :255;
                var fade1 = cc.fadeTo(jsonTables.accDuration(this.fadeTime/count),fade);
                list.push(fade1);
            }
            if (this.targetScript) {
                var time = jsonTables.accDuration(this.suckTime);
                if (this.targetScript.isTheSameScript(this)) {
                    var delay = cc.delayTime(time/2);
                    list.push(delay);
                    var scaleBigTime = jsonTables.accDuration(this.scaleMore);
                    var scale1 = cc.scaleTo(scaleBigTime,this.scaleSuckSize);//--
                    list.push(scale1);
                    var scaleSmall = jsonTables.accDuration(this.scaleSmall);
                    var scale2 = cc.scaleTo(scaleSmall,1);
                    list.push(scale2);
                }else {
                    var oldActive = this.numLabelNode.active;
                    this.numLabelNode.active = false;
                    var move = cc.moveTo(time/2,this.targetScript.getInitPos());
                    list.push(move);

                    var activeCall = cc.callFunc(function () {
                        this.setPosition(cc.v2(0,900));//暂时移除屏幕
                        if (oldActive) {
                            this.numLabelNode.active = true;
                        }
                    },this);
                    list.push(activeCall);
                }
                this.targetScript = null;
            }
            var call = cc.callFunc(function(){
                if (this.nextLv) {
                    this.lv += this.nextLv;
                    this.nextLv = null;
                    this.setLv(this.lv);
                }
                if (this.nextTid) {
                    this._reInit(this.nextTid);
                    this.nextTid = null;
                }
                callBack(this);
            },this)
            // list.push(cc.delayTime(0.01));
            list.push(call);
            var sequence = cc.sequence(list);//easeExponentialOut
            this.node.runAction(sequence);
        }else if (this.isStone()) {
            this.playStoneBreak(callBack);
        }else if (this.isSpecailMonster()) {
            cc.log("1111111111111")
        }
    },

    playStoneBreak: function (callBack) {
        switch (this.type) {
            case ID_TYPE.STONE:
                this.boomNode.active = true;
                this.stoneNode.active = false;
                this.node.dispatchDiyEvent("stoneBreak",this.node);
                this.boomNode.getComponent(cc.Animation).play();
                var playTime = this.boomNode.getComponent(cc.Animation).getClips()[0].duration;
                this.scheduleOnce(function(){
                    this.boomNode.active = false;
                    if (this.nextTid) {//存在破碎后的怪物直接生成在这里
                        this._reInit(this.nextTid);
                        this.nextTid = null;
                    }else{
                        this.type = ID_TYPE.MONSTER;
                        if (this.relativeBg) {
                            this.relativeBg.setBgColor(1);
                        }
                    }
                    callBack(this);
                },playTime);
                break;
            case ID_TYPE.SPECIAL_STONE_ROUND:// NOTE: 这里暂时直接变为普通的
                this.scheduleOnce(function(){
                    this.type = ID_TYPE.MONSTER;
                    if (this.relativeBg) {
                        this.relativeBg.setBgColor(1);
                    }
                    this._specialChange();
                    callBack(this);
                },0);
                break;
        }
    },

    runAction:function(callBack){
        if (this.needMove) {
            var move = cc.moveTo(this.needMove,this.initPos);
            var call = cc.callFunc(function(){
                this.setBgColor();
                callBack(this);
            },this)
            var sequence = cc.sequence(move,call);//easeExponentialOut
            this.node.runAction(sequence);
            this.needMove = null;
        }else {
            callBack(this);
        }
    },
    /** 获取石头破碎后可能的id */
    getBrokenStoneTid:function(){
        switch (this.type) {
            case ID_TYPE.STONE:
                if (this.fightLogic.isGameType(constant.FightType.PVE)) {
                    return this.chapterLogic.getBorkenInfo(this.chapterId,this.brokenIdx);
                }
                return null;
            case ID_TYPE.SPECIAL_STONE_ROUND:
                return null;
        }
    },
    /** 设置石化 */
    setPetrifaction:function(enble){
        this.spine.node.color = enble ? uiColor.monInfo.gray:uiColor.white
        this.spine.paused = enble;
    },

    getPosXByCol:function(col){
        return this.node.width*(col + 0.5);
    },

    getPosYByRow:function(row){
        return this.node.height*(row + 0.5);
    },
    /** 是否已经是终极形态 */
    isMaxForm:function(){
        return this.config[jsonTables.CONFIG_MONSTER.Advanced] === 0;
    },

    getNextLevelTid:function(){
        if (!this.config || this.config[jsonTables.CONFIG_MONSTER.Advanced] === 0) return 0;
        return (jsonTables.MONID_BASE + this.config[jsonTables.CONFIG_MONSTER.Advanced]);
    },

    /** 获取本家族最终形态 */
    getMaxLevelTid:function(param){
        var targetFamilyId = this.getFamilyID();
        var tid = jsonTables.getTidByFamilyAndForm(param, targetFamilyId);
        if (!tid) return 0;
        return (jsonTables.MONID_BASE + tid);
    },

    getNextLevelConfigTid:function(){
        if (!this.config || this.config[jsonTables.CONFIG_MONSTER.Advanced] === 0) return 0;
        return ( this.config[jsonTables.CONFIG_MONSTER.Advanced]);
    },

    getPreTid:function(){
        var tid = jsonTables.getLowFormTid(this.tid);
        if (!tid) return 0;
        return (jsonTables.MONID_BASE + tid);
    },

    getQuality:function () {
        var familyID = this.config[jsonTables.CONFIG_MONSTER.FamilyID];
        var familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
        return familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality];
    },

    _loadSpecialSpin:function(id){
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.SANDBOXMONSTER,id);
        this.spineNode.scale = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Scale]/100 * this.scaleSize;
        jsonTables.loadSpineCommonAction(this.spine,this.config[jsonTables.CONFIG_SANDBOXMONSTER.Resource]);
        if (this.relativeBg) {
            this.relativeBg.setBgColor(1);
        }
    },

    setConfigTid:function(tid){
        // if (this.tid === tid) return;
        this.tid = tid;
        this.data = jsonTables.MONID_BASE + tid;
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,this.tid);
        this.spineNode.scale = this.config[jsonTables.CONFIG_MONSTER.Scaling]/100 * this.scaleSize;
        jsonTables.loadSpineCommonAction(this.spine,this.config[jsonTables.CONFIG_MONSTER.Resource]);
        this.setBgColor();
    },

    setBgColor:function(){
        var color = tb.MONSTER_ORDINARY;
        if (this.type === ID_TYPE.MONSTER){
            color = this.config[jsonTables.CONFIG_MONSTER.Form];
        }
        if (this.relativeBg) {
            this.relativeBg.setBgColor(color);
        }
    },

    getForm:function(){
        return this.config[jsonTables.CONFIG_MONSTER.Form];
    },

    setVisible:function(show){
        this.node.active = show;
    },

    setSpineVisible:function(show){
        this.spineNode.active = show;
    },

    setLightActive:function(active){
        if (this.relativeBg) {
            this.relativeBg.setLightActive(active);
        }
    },

    getData(){
        switch (this.type) {
            case ID_TYPE.NONE:
                break;
            case ID_TYPE.STONE:
                this.data = this.type * jsonTables.TYPE_BASE_COUNT + this.ref;
                break;
            case ID_TYPE.MONSTER:
                break;
            case ID_TYPE.SPECIAL_COUNT:
            case ID_TYPE.SPECIAL_LAST_COUNT:
            case ID_TYPE.SPECIAL_ROUND:
            case ID_TYPE.SPECIAL_LAST_ROUND:
            case ID_TYPE.CLICK_EFFECT:
                this.data = this.type * jsonTables.TYPE_BASE_COUNT + this.ref * 100 + this.count;
                break;
            case ID_TYPE.SPECIAL_STONE_ROUND:
                this.data = this.type * jsonTables.TYPE_BASE_COUNT + this.ref * 100 + this.count * 10 + this.hpCount ;
                break;
        }
        return this.data;
    },
    getDataIdx:function(){
        return this.brokenIdx;
    },
    /** 加层等级 */
    lvUp:function(num){
        this.lv += num;
        this.setLv(this.lv);
        var oldScale = this.numLabelNode.scale;
        this.numLabelNode.runAction(cc.sequence([cc.scaleTo(0.2, oldScale * 1.5, oldScale * 1.5), cc.scaleTo(0.2, oldScale, oldScale)]));
    },

    getLv:function(){
        return this.lv;
    },
    setLv:function(lv){
        this.lv = lv;
        this.numLabelNode.active = lv > 1;
        this.setLabel("+"+(lv-1));
    },

    getFamilyID:function(){
        return this.config[jsonTables.CONFIG_MONSTER.FamilyID] || 0;
    },

    getConfigTid:function(){
        return this.tid;
    },
    setCol(col){
        this.col = col;
    },
    getSpeData:function(){//获取本为的特殊数据
        if (!this.lockScript) return null;// NOTE: 现在暂时只有锁 以后要兼容不同特殊物品
        return this.lockScript.getSpeData();
    },
    /** 沙盘上机关的id */
    getSpecialMonsterID:function(){
        return this.ref;
    },

    isLockScriptEnbale:function(){
        if (!this.lockScript) return false;
        return !this.lockScript.isCanTouch()
    },

    getLockScript(){
        return this.lockScript;
    },
    setLockScript(lockScript){
        this.lockScript = lockScript;
    },
    getRelativeBg(){
        return this.relativeBg;
    },
    setRelativeBg(relativeBg){
        this.relativeBg = relativeBg;
    },
    getCol(){
        return this.col;
    },
    setRow(row){
        this.row = row;
        this.setLocalZOrderEx(10 - this.row);
    },
    getRow(){
        return this.row;
    },

    setInitPos(pos){
        this.initPos = pos;
    },
    getInitPos(){
        return this.initPos;
    },
    /** 进行跳跃回init */
    jumpToInit:function(cb){
        var call = cc.callFunc(function () {
            if (cb) cb();
        },this);
        var jump = cc.jumpTo(0.1, this.initPos, 50, 1);
        var seq = cc.sequence(jump,call);
        this.node.runAction(seq)
    },

    resetToInitPos:function(){
        this.setPosition(this.initPos);
        this.node.scale = 1;
        if (this.relativeBg) {
            this.setLocalZOrderEx(10 - this.row);
        }
        this.setBgColor();
    },
    //获取移动时的scale大小
    getMoveScale:function () {
        return this.getClickScale() * this.scaleSize * this.moveScaleTimes;
    },
    moveCard:function(pos){
        this.setPosition(pos);
        this.node.scale = this.getMoveScale();
    },

    getClickScale:function(){
        if (!this.isUseConfig) {
            return this.moveScale;
        }
        return this.config[jsonTables.CONFIG_MONSTER.SandMoveScale]/100;
    },

    setLocalZOrderEx:function(zorder){
        this.node.setLocalZOrderEx(zorder)
    },
    isTheSameScript:function(script){
        return (this.row === script.getRow()) && (this.col === script.getCol());
    },
    /** 检测触发 触发合成 */
    checkToggle:function(script){
        if (!this.isCanMerget() || !script.isCanMerget()) return false;
        return script.getConfigTid() === this.tid;
    },
    /** 检测触发 石头数量减少 */
    checkStone:function(){
        return this.isStone();
    },
    /** 可以融合 */
    isCanMerget:function(){
        return this.isMonster() && -1 === this.sandTableLogic.isInPetrifaction(this);
    },

    isCanDestory:function(){
        return (this.isMonster() || (this.isSpecailMonster() && this.count === 0)) && !this.isNone() && -1 === this.sandTableLogic.isInPetrifaction(this);
    },

    isCanTouch:function(){
        return this.lockScript.isCanTouch() && this.isMonster() && -1 === this.sandTableLogic.isInPetrifaction(this);
    },

    isSpecailMonster:function(){
        return kf.inArray(this.specailTypeList,this.type);
    },

    isClickMonster:function(){
        return this.type === ID_TYPE.CLICK_EFFECT;
    },

    doClickEffect:function(){

    },

    /** 是否符合吞噬品质 */
    isSwallowForm:function(script){
        if (this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] !== 0) {
            if (this.config[jsonTables.CONFIG_SANDBOXMONSTER.TriggerLimit]) {
                return this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] === script.getForm();
            }else {
                return this.config[jsonTables.CONFIG_SANDBOXMONSTER.Form] <= script.getForm();
            }
        }
        return false;
    },
    /** 特殊怪变身 */
    _specialChange:function(){
        this.type = ID_TYPE.MONSTER;
        this.numLabelNode.active = this.lv > 1;;
        this.fightLogic.offSpecialMonster(this);
    },
    /** dragItem拖进来的那个 */
    doSwallow:function(dragItem,removeList,toggleList){
        if (!kf.inArray(this.specailCoutList,this.type)) return false;//只处理受次数影响的
        if (this.count !== 0) {
            this.count--;
            this.setLabel("x"+this.count);
            if (this.count === 0) {
                this.numLabelNode.active = false;
                var delayList = [];
                var isChange = false;
                if(this.type === ID_TYPE.SPECIAL_COUNT) {
                    isChange = this._doSpecailChange();
                }
                if(!isChange)
                    removeList.push(this);
                if (this.type === ID_TYPE.SPECIAL_LAST_COUNT) {
                    this._doSpecailEffect(function(){},removeList,[],toggleList,delayList,dragItem);
                }
                var delay = !!delayList[0] ?delayList[0]: 0;
                if (delay !== 0) {
                    delay += 0.1;
                }

                if(!isChange) {
                    this.scheduleOnce(function(){
                        this.playDisapear();
                    },delay);
                    delay += 0.3;
                    this._specialChange();
                    // this.scheduleOnce(function(){
                    // },delay);
                }
                return {delay:delay};
            }
        }
        return {delay:0};
    },

    //特殊机关拖入怪物特殊处理
    checkSpecialItem:function () {
        switch (this.config[jsonTables.CONFIG_SANDBOXMONSTER.Type]) {
            case tb.SAND_MONSTER_ARTILLERY: //轰轰火炮
                if(this.isPause) break;
                this.isPause = true;
                this.spine.setAnimation(0,'std1',true);
                return true;
        }
        return false;
    },

    //特殊机关的消失
    playDisapear: function () {
        var action = cc.scaleTo(0.3, 0, 1.1);
        var callback = cc.callFunc(function () {
            this.spineNode.scale = this.config[jsonTables.CONFIG_MONSTER.Scaling]/100 * this.scaleSize;
        }, this);
        this.spineNode.runAction(cc.sequence([action, callback]));
    },

    /**
     * 做一下怪物的特殊表现
     * @param  {function} callFunc   回调函数  必须执行  并且要延后执行要押后执行保证round消除怪物消失
     * @param  {Array} removeList [移除列表 如果添加进移除列表 就不需要添加进检测列表 toggleList]
     * @param  {Array} addList    [添加列表会去场上生成怪物]
     * @param  {Array} toggleList [检测列表]
     * @param  {CCobj} dragItem [被拖入的那个]
     */

    doSpecailEffect:function(callFunc,removeList,addList,toggleList,dragItem){
        if (this.fightLogic.getCurStep() === this.bornRound
        || (this.type === ID_TYPE.SPECIAL_LAST_ROUND && this.count !== 1)
        || this.type === ID_TYPE.CLICK_EFFECT
        || this.type === ID_TYPE.SPECIAL_LAST_COUNT
        ) {
            this.scheduleOnce(function(){//延后一帧数 保证 上层玄幻结束
                callFunc(0);//这里确保所有回调都回执行  所以上面如果触发可行就一定要callBack
            },0);
            return;
        }
        if (!this._doSpecailEffect(callFunc,removeList,addList,toggleList,[],dragItem)) {
            this.scheduleOnce(function(){//延后一帧数 保证 上层玄幻结束
                callFunc(0);//这里确保所有回调都回执行  所以上面如果触发可行就一定要callBack
            },0);
        }
    },
    _doSpecailEffect:function(callFunc,removeList,addList,toggleList,delayList,dragItem){
        var logicScript = this.sandTableLogic;
        var delay = 0;
        switch (this.config[jsonTables.CONFIG_SANDBOXMONSTER.Type]) {
            case tb.SAND_MONSTER_ONEEYE://独眼怪
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,false);
                for (var i = 0 , len = list.length; i <  len; i++) {
                    var obj = list[i];
                    addList.push({script:obj,type:tb.SAND_MONSTER_ONEEYE,startPos:obj.getPosition()});
                    removeList.push(obj);
                }
                if (list.length > 0) {
                    delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/2 : 0.5;
                    delayList.push(delay*2);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'std',true);
                    this.scheduleOnce(function(){
                        callFunc(tb.SAND_MONSTER_ONEEYE,this);
                    }.bind(this),delay);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_ANGLE: //天使
                this.spine.setAnimation(0,'atk',false);
                this.spine.addAnimation(0,'std',true);
                delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/3 : 0.5;
                delayList.push(delay+2);
                var targetPos = cc.v2(this.getRow(),this.getCol())
                var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];
                this.scheduleOnce(function(){
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.SANDBOXMONSTER, this.getSpecialMonsterID());
                    var grid = config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                    if (!grid) return;
                    var list = logicScript.getSandCellByGaugePoint(targetPos.x,targetPos.y,grid,false);
                    var callback = function() {
                        logicScript.doAngleEffect(list);
                    }
                    this.doAngelEffect(effectResName, aniName, callback.bind(this), list);
                }.bind(this),delay);
                this.scheduleOnce(function(){
                    callFunc(tb.SAND_MONSTER_ANGLE,this);
                }.bind(this),delay+2);
                return true;//触发可行就一定要callBack
            case tb.SAND_MONSTER_DEMOND:  //恶魔 又名风魔法师
                var targetScript = logicScript.getDemondPos(this.getRow(),this.getCol());
                if (targetScript) {
                    var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                    var node = this.node.parent.getChildByName(effectResName);
                    if (!node) {
                        node = uiResMgr.getPrefabEx(effectResName);
                        node.parent = this.node.parent;
                    }
                    node.setPosition(this.node.position);
                    var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];
                    node.getComponent(effectResName).init(aniName);
                    node.setLocalZOrderEx(101);
                    toggleList.push(targetScript);
                    var distance = kf.pDistance(this.node.position, targetScript.initPos);
                    delay = distance/512;
                    delayList.push(delay);
                    var x = this.node.x - targetScript.initPos.x;
                    this.node.scaleX = x > 0 ? 1 : - 1
                    this.spine.setAnimation(0,'walk',true);
                    this.numLabelNode.active = false;
                    // var oldPos = this.initPos;
                    // this.setPosition(oldPos);
                    this.setLocalZOrderEx(100);
                    var call = cc.callFunc(function(){
                        var node = targetScript.node.parent.getChildByName(effectResName);
                        if (!node) {
                            node = uiResMgr.getPrefabEx(effectResName);
                            node.parent = targetScript.node.parent;
                        }
                        logicScript.swichPoint(this,targetScript,true,null);
                        node.setPosition(this.initPos);
                        var duration = node.getComponent(effectResName).init(aniName);
                        node.setLocalZOrderEx(101);
                        this.spine.setAnimation(0,'std',true);
                        this.numLabelNode.active = true;
                        this.resetToInitPos();
                        setTimeout(() => {
                            callFunc(tb.SAND_MONSTER_DEMOND,this);
                        }, duration*1000);
                    },this);
                    var seq = cc.sequence(cc.delayTime(0.4), cc.moveTo(delay,targetScript.initPos),call);
                    this.node.runAction(seq);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_BLACKHOLE: //黑洞
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,false);
                removeList.concatSelf(list);
                var cb = function(){
                    this.scheduleOnce(function(){
                        callFunc(tb.SAND_MONSTER_BLACKHOLE,this);
                    },0);
                }.bind(this);
                delayList.push(0.1);
                jsonTables.doCountAction(list,"runSuckAction",[this],cb);
                return true;//触发可行就一定要callBack
            case tb.SAND_MONSTER_GNOME:
                var targetScript = logicScript.getDemondPos(this.getRow(),this.getCol());
                if (targetScript) {
                    toggleList.push(targetScript);
                    delay = 0.5;
                    delayList.push(delay*2);
                    this.spine.setAnimation(0,'walk',false);
                    this.spine.addAnimation(0,'std',true);
                    var oldPos = this.initPos;
                    logicScript.swichPoint(this,targetScript,true,null);
                    this.setPosition(oldPos);
                    this.numLabelNode.active = false;
                    this.setLocalZOrderEx(100);
                    var call = cc.callFunc(function(){
                        this.numLabelNode.active = true;
                        this.resetToInitPos();
                        callFunc(tb.SAND_MONSTER_GNOME,this);
                    },this);
                    var seq = cc.sequence(cc.moveTo(delay,this.initPos),call);
                    this.node.runAction(seq);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_GUNTOWER:  //炮塔
                var list = this.fightLogic.getEnemyAll();
                if (list.length > 0) {
                    delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/2 : 0.5;
                    delayList.push(delay*2);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'std',true);
                    var damgeParam = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
                    var startPos = this.spine.node.convertToWorldSpaceAR(cc.v2(0,0));
                    startPos.y += (this.spine.skeletonData.skeletonJson.skeleton.height * this.spine.node.scale);
                    var bulletID = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Bullet];
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET, bulletID);
                    if (!bulletID) {
                        callFunc(tb.SAND_MONSTER_GUNTOWER, this);
                        return cc.error("子弹配置不存在");
                    }
                    uiResMgr.loadFightBulletPool(config[jsonTables.CONFIG_BULLET.Resource],function () {
                         var call = cc.callFunc(function () {
                             this.sandTableLogic.doGunTowerEffect(list, damgeParam, startPos, bulletID);
                             callFunc(tb.SAND_MONSTER_GUNTOWER, this);
                         }, this);
                         var seq = cc.sequence(cc.delayTime(delay), call);
                         this.node.runAction(seq);
                    }.bind(this));
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_CATAPULT://投石车
                var param = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
                var stonelist = logicScript.getCatapultStone();
                if(stonelist.length <= 0) break;

                delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/2 : 0.5;

                this.spine.setAnimation(0,'atk',false);
                this.spine.addAnimation(0,'std',true);

                var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];

                var length = param > stonelist.length ? stonelist.length : param;
                var animDelay = 0;
                this.scheduleOnce(function () {
                    for (var i = 0; i < length; i++) {
                        var obj = stonelist[i];
                        var node = uiResMgr.getPrefabEx(effectResName);
                        node.parent = this.node.parent;
                        node.setPosition(obj.node.position);
                        animDelay = node.getComponent(effectResName).init(aniName[0], this.node);
                        node.setLocalZOrderEx(101);
                    }
                },32 / 46 * delay*2);

                this.scheduleOnce(function () {
                    var removeStoneList = [];
                    for (var i = 0; i < length; i++) {
                        var obj = stonelist[i];
                        if (obj.checkStone()) {
                            obj.dearStoneCount()
                            if (obj.isStoneDone()) {
                                var re = obj.waiteToBroken();
                                removeStoneList.push(obj);
                                if(!re) {
                                    removeList.push(obj);
                                }
                            }
                        }
                    }
                    var cb = function () {
                        callFunc(tb.SAND_MONSTER_CATAPULT,this);
                    }
                    jsonTables.doCountAction(removeStoneList,"playStoneBreak",[],cb);

                }, delay*2 + animDelay)

                delayList.push(delay*2 + animDelay);
                return true;//触发可行就一定要callBack
                break;
            case tb.SAND_MONSTER_PORTAL://传送门
                var list = this.fightLogic.getEnemyAll();
                if (list.length > 0) {
                    delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/2 : 0.5;
                    delayList.push(delay);
                    this.spine.setAnimation(0,'atk',false);
                    var param = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
                    var targetTid = jsonTables.getTidByFormAndQuality(param,dragItem.getQuality());
                    var pos = this.getPosition();
                    this.scheduleOnce(function(){
                        if (targetTid) {
                            var data = {tid:targetTid,card:this,pos:pos};
                            logicScript.doCreaterSure(data);
                        }
                        callFunc(tb.SAND_MONSTER_PORTAL,this);
                    },delay);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_BOMB://爆爆弹
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,false);
                if (list.length > 0) {
                    delay = this.getSpineAniDuration("atk");
                    delayList.push(delay);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'std',true);
                    var changeList = [];
                    for (var i = 0 , len = list.length; i <  len; i++) {
                        var obj = list[i];
                        var preTid = obj.getPreTid();
                        if (preTid === 0) {
                            removeList.push(obj);
                        }else {
                            changeList.push({script:obj,tid:preTid});
                            toggleList.push(obj);
                        }
                    }
                    this.scheduleOnce(function(){
                        for (var i = 0 , len = changeList.length; i <  len; i++) {
                            var obj = changeList[i];
                            obj.script._reInit(obj.tid);
                        }
                        callFunc(tb.SAND_MONSTER_BOMB,this);
                    },delay);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_DOG://哮天犬
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,false);
                if (list.length > 0) {
                    delay = this.getSpineAniDuration("atk");
                    delayList.push(delay);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'std',true);
                    var param = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
                    param = param || 0;

                    var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                    var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];

                    var node = uiResMgr.getPrefabEx(effectResName);
                    node.parent = this.node.parent;
                    node.setPosition(this.node.position);
                    node.getComponent(effectResName).init(aniName[0]);
                    node.setLocalZOrderEx(101);

                    var targetPos = cc.v2(this.getRow(),this.getCol());
                    this.scheduleOnce(function(){
                        logicScript.doDogEffect(targetPos.x,targetPos.y,this.getSpecialMonsterID(),effectResName,aniName[1]);
                    }.bind(this),delay);
                    this.scheduleOnce(function(){
                        callFunc(tb.SAND_MONSTER_DOG,this);
                    }.bind(this),delay*2);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_MEDUSA://美杜莎
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,true);
                if (list.length > 0) {
                    var target = jsonTables.random(list);
                    var delay1 = this.getSpineAniDuration("atk");
                    var delay2 = this.getSpineAniDuration("walk")/2;
                    delay = delay1 + delay2;
                    delayList.push(delay);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'walk',false);
                    logicScript.addPetrifaction(target);
                    this.scheduleOnce(function(){
                        var oldPos = this.initPos;
                        logicScript.swichPoint(this,target,true,null);
                        this.setPosition(oldPos);
                        this.numLabelNode.active = false;
                        this.setLocalZOrderEx(100);
                        var scaleX = Math.abs(this.spine.node.scaleX);
                        this.spine.node.scaleX = this.initPos.x - oldPos.x > 0 ?-scaleX:scaleX;
                        var call = cc.callFunc(function(){
                            this.spine.setAnimation(0,'std',true);
                            this.numLabelNode.active = true;
                            this.resetToInitPos();
                            this.spine.node.scaleX = scaleX;
                            callFunc(tb.SAND_MONSTER_MEDUSA,this);
                        },this);
                        var seq = cc.sequence(cc.moveTo(delay2,this.initPos),call);
                        this.node.runAction(seq);
                    },delay1);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_ANGLE_DICE://天使骰子
                var idx = jsonTables.randomNum(1,4);
                var aniName = "atk" + idx;
                if (!this.spine.findAnimation(aniName)) return false;//特么动作没找到
                delay = this.getSpineAniDuration(aniName);
                delayList.push(delay);
                this.spine.setAnimation(0,aniName,false);
                var pos = this.node.position;
                this.scheduleOnce(function(){
                    this.fightLogic.addStepNum(idx);
                    var node = uiResMgr.getPrefabEx("floatKill")
                    node.parent = this.node.parent;
                    var str = "+"+idx + uiLang.getMessage(this.node.name,'step');
                    node.getComponent("floatKill").initForBoss(str,pos);
                    callFunc(tb.SAND_MONSTER_ANGLE_DICE,this);
                },delay);
                return true;//触发可行就一定要callBack
                break;
            case tb.SAND_MONSTER_BALLOON://气球
                var aniName = "atk";
                if (!this.spine.findAnimation(aniName)) return false;//特么动作没找到
                delay = this.getSpineAniDuration(aniName);
                delayList.push(delay);
                this.spine.setAnimation(0,aniName,false);
                var list = this.sandTableLogic.doBalloonEffect();
                toggleList.concatSelf(list);
                this.scheduleOnce(function(){
                    callFunc(tb.SAND_MONSTER_BALLOON,this);
                },delay);
                return true;//触发可行就一定要callBack
                break;
            case tb.SAND_MONSTER_ORDER://号令勋章
                var aniName = "atk";
                if (!this.spine.findAnimation(aniName) || !dragItem) return false;//特么动作没找到
                delay = this.getSpineAniDuration(aniName) || 0.1;
                delayList.push(delay);
                this.spine.setAnimation(0,aniName,false);
                var list = this.sandTableLogic.doOrderEffect(dragItem);
                var reInitFlag = list.length > 0;
                if (reInitFlag) {
                    toggleList.concatSelf(list);
                    removeList.concatSelf(list);
                }
                var nextTid = dragItem.getNextLevelTid();
                var lv = this.sandTableLogic._getUpgradeLv(list);
                this.scheduleOnce(function(){
                    if (reInitFlag && nextTid) {
                        for (var i = 0 , len = removeList.length; i <  len; i++) {
                            var obj = removeList[i];
                            if (this.isTheSameScript(obj)) {
                                removeList.splice(i,1);
                                cc.log("生效了")
                                break;
                            }
                        }
                        this._reInit(nextTid);
                        this.setLv(lv);
                    }
                    callFunc(tb.SAND_MONSTER_ORDER,this);
                },delay);
                return true;//触发可行就一定要callBack
                break;
            case tb.SAND_MONSTER_ANGLE_BIG:  //大天使
                this.spine.setAnimation(0,'atk',false);
                this.spine.addAnimation(0,'std',true);
                var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];

                var node = uiResMgr.getPrefabEx(effectResName);
                node.parent = this.node.parent;
                node.setPosition(this.node.position);
                node.getComponent(effectResName).init(aniName[0]);
                node.setLocalZOrderEx(101);

                delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/2 : 0.5;
                delayList.push(delay*2);
                var targetPos = cc.v2(this.getRow(),this.getCol());

                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.SANDBOXMONSTER,this.getSpecialMonsterID());
                var grid = config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                if (!grid) return false;
                let list = logicScript.getSandCellByGaugePoint(targetPos.x,targetPos.y,grid,false);

                let checklist = this.checkTriggleList(list);

                toggleList.concatSelf(checklist);
                this.scheduleOnce(function(){
                    logicScript.doAngleBigEffect(list,effectResName,aniName[1]);
                }.bind(this),delay);
                this.scheduleOnce(function(){
                    callFunc(tb.SAND_MONSTER_ANGLE_BIG,this);
                }.bind(this),delay*2);
                return true;//触发可行就一定要callBack
            case tb.SAND_MONSTER_ARTILLERY: //轰轰火炮
                if(this.isPause) break;
                var list = this.fightLogic.getEnemyAll();
                if (list.length > 0) {
                    delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration/2 : 0.5;
                    delayList.push(delay*2+2);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'std',true);
                    var damgeParam = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
                    var startPos = this.spine.node.convertToWorldSpaceAR(cc.v2(0,0));
                    startPos.y += (this.spine.skeletonData.skeletonJson.skeleton.height * this.spine.node.scale);
                    var bulletID = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Bullet];
                    var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET, bulletID);
                    var endPos = cc.v2(430, 800);
                    if (!bulletID) {
                        callFunc(tb.SAND_MONSTER_GUNTOWER, this);
                        return cc.error("子弹配置不存在");
                    }

                    var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                    var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];

                    uiResMgr.loadFightBulletPool(config[jsonTables.CONFIG_BULLET.Resource],function () {
                        var call = cc.callFunc(function () {
                            this.sandTableLogic.doArtilleryEffect(list, damgeParam, startPos, bulletID, endPos, effectResName, aniName);
                            callFunc(tb.SAND_MONSTER_ARTILLERY, this);
                        }, this);
                        var seq = cc.sequence(cc.delayTime(delay), call);
                        this.node.runAction(seq);
                    }.bind(this));
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_PANDORE_EVIL:  //潘多拉恶
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,true);
                if (list.length > 0) {
                    var target = jsonTables.random(list);
                    var delay1 = this.getSpineAniDuration("atk");
                    var delay2 = this.getSpineAniDuration("walk")/2;
                    delay = delay1 + delay2;
                    delayList.push(delay);
                    this.spine.setAnimation(0,'atk',false);
                    this.spine.addAnimation(0,'std',true);
                    removeList.push(target);


                    var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                    var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];

                    var direction = logicScript.getDirectionByTarget(target, this);

                    this.scheduleOnce(function () {
                        var node = uiResMgr.getPrefabEx(effectResName);
                        node.parent = this.node.parent;
                        node.setPosition(this.node.position);
                        node.getComponent(effectResName).init(aniName[0], direction);
                        node.setLocalZOrderEx(101);
                    }, delay1 * 55 / 80);

                    this.scheduleOnce(function(){
                        callFunc(tb.SAND_MONSTER_PANDORE_EVIL,this);
                    },delay1 * 69 / 80);
                    return true;//触发可行就一定要callBack
                }
                break;
            case tb.SAND_MONSTER_PANDORE_GOOD:  //潘多拉善
                this.spine.setAnimation(0,'atk',false);
                this.spine.addAnimation(0,'std',true);

                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = logicScript.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,true);
                if (list.length > 0) {
                    var target = jsonTables.random(list);

                    delay = this.spine.findAnimation("atk") ? this.spine.findAnimation("atk").duration / 2 : 0.5;
                    delayList.push(delay * 2);

                    var effectResName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.EffectResource];
                    var aniName = this.config[jsonTables.CONFIG_SANDBOXMONSTER.ClipName];
                    var direction = logicScript.getDirectionByTarget(target, this);

                    this.scheduleOnce(function () {
                        var node = uiResMgr.getPrefabEx(effectResName);
                        node.parent = this.node.parent;
                        node.setPosition(this.node.position);
                        node.getComponent(effectResName).init(aniName[0], direction);
                        node.setLocalZOrderEx(101);
                    }, delay * 2 * 80 / 150);

                    this.scheduleOnce(function () {
                        this.doPandorGoodEffect(target);
                    },delay * 2 * 110 / 150);

                    this.scheduleOnce(function () {
                        callFunc(tb.SAND_MONSTER_PANDORE_GOOD, this);
                    }.bind(this), delay * 2);
                    return true;//触发可行就一定要callBack
                }
                break;
        }
        return false;
    },

    //播放天使升等级动画
    doAngelEffect: function (resName, clipName, callback, list) {
        var node = uiResMgr.getPrefabEx(resName);
        node.parent = this.node.parent;
        node.setPosition(this.node.position);
        var dirList = [];
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            var direction =this.sandTableLogic.getDirectionByTarget(obj, this);
            dirList.push(direction);
        }
        node.getComponent(resName).init(clipName, dirList);
        node.setLocalZOrderEx(101);

        var changeNextLevel = cc.callFunc(callback, this);
        var sequence = cc.sequence([cc.delayTime(1 + 5 / 20), changeNextLevel]);

        this.node.runAction(sequence);
    },

    //播放大天使升形态动画
    doAngelBigEffect: function (resName, clipName) {
        var node = uiResMgr.getPrefabEx(resName);
        node.parent = this.node.parent;
        node.setPosition(this.node.position);
        node.getComponent(resName).init(clipName);
        node.setLocalZOrderEx(101);

        var jump = cc.jumpBy(14/25, 0, 0, 10, 1);
        var scaleTo1 = cc.scaleTo(3/25,1,0.9);
        var scaleTo2 = cc.scaleTo(5/25,1,1.2);
        var scaleTo3 = cc.scaleTo(4/25,1,1);
        var scaleTo4 = cc.scaleTo(2/25,1,0.9);

        var changeNextLevel = cc.callFunc(() => {
            var nextTid = this.getNextLevelTid();
            if (nextTid) {
                this._reInit(nextTid);
            }
            var jump1 = cc.jumpBy(11/25, 0, 0, 10, 1);
            var scaleTo5 = cc.scaleTo(6/25,1,1.2);
            var scaleTo6 = cc.scaleTo(5/25,1,1);
            this.node.runAction(cc.spawn([jump1, cc.sequence([scaleTo5, scaleTo6])]));
        }, this);
        var sequence = cc.sequence([cc.spawn([jump, cc.sequence([scaleTo1, scaleTo2, scaleTo3, scaleTo4])]), changeNextLevel]);

        this.node.runAction(sequence);
    },

    //播放哮天犬升形态动画
    doDogEffect: function (resName, clipName) {
        var node = uiResMgr.getPrefabEx(resName);
        node.parent = this.node.parent;
        node.setPosition(this.node.position);
        node.getComponent(resName).init(clipName);
        node.setLocalZOrderEx(101);

        var jump = cc.jumpBy(14/25, 0, 0, 10, 1);
        var scaleTo1 = cc.scaleTo(3/25,1,0.9);
        var scaleTo2 = cc.scaleTo(5/25,1,1.2);
        var scaleTo3 = cc.scaleTo(4/25,1,1);
        var scaleTo4 = cc.scaleTo(2/25,1,0.9);
        var param = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
        param = param || 0;

        var changeNextLevel = cc.callFunc(() => {
            var nextTid = this.getNextLevelTid();
            if (nextTid) {
                this._reInit(nextTid);
                this.lvUp(param);
            }
            var jump1 = cc.jumpBy(11/25, 0, 0, 10, 1);
            var scaleTo5 = cc.scaleTo(6/25,1,1.2);
            var scaleTo6 = cc.scaleTo(5/25,1,1);
            this.node.runAction(cc.spawn([jump1, cc.sequence([scaleTo5, scaleTo6])]));
        }, this);
        var sequence = cc.sequence([cc.spawn([jump, cc.sequence([scaleTo1, scaleTo2, scaleTo3, scaleTo4])]), changeNextLevel]);

        this.node.runAction(sequence);
    },

    //播放潘多拉善升形态动画
    doPandorGoodEffect: function (target) {
        var jump = cc.jumpBy(14/25, 0, 0, 10, 1);
        var scaleTo1 = cc.scaleTo(3/25,1,0.9);
        var scaleTo2 = cc.scaleTo(5/25,1,1.2);
        var scaleTo3 = cc.scaleTo(4/25,1,1);
        var scaleTo4 = cc.scaleTo(2/25,1,0.9);
        var param = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
        param = param || 0;

        var changeNextLevel = cc.callFunc(() => {
            var targetTid = target.getMaxLevelTid(param);
            if (targetTid) {
                target._reInit(targetTid);
            }
            var jump1 = cc.jumpBy(11/25, 0, 0, 10, 1);
            var scaleTo5 = cc.scaleTo(6/25,1,1.2);
            var scaleTo6 = cc.scaleTo(5/25,1,1);
            target.node.runAction(cc.spawn([jump1, cc.sequence([scaleTo5, scaleTo6])]));
        }, this);
        var sequence = cc.sequence([cc.spawn([jump, cc.sequence([scaleTo1, scaleTo2, scaleTo3, scaleTo4])]), changeNextLevel]);

        target.node.runAction(sequence);
    },

    /**
     * 特殊机关需要在消除时搞点事
     * @private
     */
    _doSpecailChange: function () {
        switch (this.config[jsonTables.CONFIG_SANDBOXMONSTER.Type]) {
            case tb.SAND_MONSTER_PANDORE_EVIL:  //潘多拉恶
                this.fightLogic.offSpecialMonster(this);
                var tid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.Param];
                this.spine.setAnimation(0,'atk1',false);
                var delay = this.getSpineAniDuration("atk1");
                this.scheduleOnce(function () {
                    this._reInit(tid, this.fightLogic.getCurStep()+1);
                }, delay);
                return true; //变化了就返回true
        }
        return false;  //没变化就返回false
    },

    getSpineAniDuration:function(aniName){
        var duration = this.spine.findAnimation(aniName) ? this.spine.findAnimation(aniName).duration : 0.5;
        return duration;
    },

    doActionDone:function(){
        if (!this._checkRoundType()) return false;
        if (this.fightLogic.getCurStep() === this.bornRound) {
            return ;
        }
        if(this.isPause) return;
        this.count--;
        this.setLabel("x"+this.count);
        if (this.count === 0) {
            this.numLabelNode.active = false;
            return true;
        }
    },
    //回合消除 要等待自身效果实现后加减去
    checkRoundMonDone:function(){
        if (!this._checkRoundType()) return false;
        if (this.count <= 0) {
            this._specialChange();
        }
    },
    /** 是否处于回合类型影响 */
    _checkRoundType:function(){
        if (this.type !== ID_TYPE.SPECIAL_ROUND && this.type !== ID_TYPE.SPECIAL_LAST_ROUND  && this.type !== ID_TYPE.SPECIAL_STONE_ROUND) return false;
        return true;//只处理受回合影响的
    },

    isMonster:function(){
        return this.type === ID_TYPE.MONSTER;
    },
    /** 是否可以生成对象 */
    isCanAddCount:function(){
        if (this.isStone()) {
            cc.log(this.ref)
        }
        return this.isMonster() || (this.isStone() && this.isStoneDone());
    },
    /** 是否需要额外的移动距离 */
    isNeedMoveMore:function(){
        return this.isStone() || this.isNone() || this.isSpecailMonster() || -1 !== this.sandTableLogic.isInPetrifaction(this);
    },
    /** 是否为空位 */
    isNone:function(){
        return this.type === ID_TYPE.NONE;
    },

    isStone:function(){
        return this.type === ID_TYPE.STONE  || this.type === ID_TYPE.SPECIAL_STONE_ROUND;
    },

    isStoneDone:function(){
        return this.ref === 0 || (this.type === ID_TYPE.SPECIAL_STONE_ROUND && this.hpCount <= 0);
    },

    getCount:function(){
        return this.count || 0;
    },

    getHpCount:function(){
        return this.hpCount || 0;
    },

    dearStoneCount:function(){
        switch (this.type) {
            case ID_TYPE.STONE:
                this.ref--;
                this.setLabel("x"+this.ref);
                this.numLabelNode.active = this.ref > 0;
                if (this.numLabelNode.active) {
                    var node = this.node.getChildByName("boomSand");
                    if (!node) {
                        node = uiResMgr.getPrefabEx("boomSand");
                        node.parent = this.node;
                        node.getComponent("boomSand").init(this.scaleSize);
                    }
                }
                break;
            case ID_TYPE.SPECIAL_STONE_ROUND:
                this.hpCount--;
                break;
        }
    },

    runSuckAction:function(script,cb){
        var time = 0.5;
        var move = cc.moveTo(time,script.node.position);
        var scale = cc.scaleTo(time,0.1);
        var rotate = cc.rotateTo(time,360 * 3);
        var sawn = cc.spawn(move,scale,rotate);
        var call = cc.callFunc(function(){
            this.resetToInitPos();
            cb();
        },this);
        var seq = cc.sequence(sawn,call);
        this.node.runAction(seq);
    },

    doClickEffect:function(){
        switch (this.config[jsonTables.CONFIG_SANDBOXMONSTER.Type]) {
            case tb.SAND_MONSTER_MAGNET:
                this._specialChange();
                var grid = this.config[jsonTables.CONFIG_SANDBOXMONSTER.GaugePoint];
                var list = this.sandTableLogic.getSandCellByGaugePoint(this.getRow(),this.getCol(),grid,false);
                this.sandTableLogic.doMagentEffect(list,this);
                break;
        }
    },

    //大天使升形态会导致合成多出一个,需剔除
    checkTriggleList: function (list) {
        var oldTidList = [];
        let toggleList = [];
        for (var i = 0; i < list.length; i++) {
            let obj = list[i];
            toggleList.push(obj);
            let oldTid = obj.tid;
            oldTidList.push(oldTid);
            let nextTid = obj.getNextLevelTid();
            if(!nextTid) continue;
            obj.tid = nextTid - (obj.type*jsonTables.TYPE_BASE_COUNT);
        }
        for (var i = 0; i < toggleList.length; i++) {
            let obj1 = toggleList[i];
            let firstList = this.sandTableLogic.checkDisjointness(obj1, true);
            for (var j = 0; j < firstList.length; j++) {
                let obj2 = firstList[j];
                let idx = toggleList.indexOf(obj2);
                if(idx !== -1) {
                    toggleList.splice(idx, 1);
                    break;
                }
            }
        }
        for (var i = 0; i < toggleList.length; i++) {
            var obj = toggleList[i];
            obj.tid = oldTidList[i];
        }

        return toggleList;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // }
});
