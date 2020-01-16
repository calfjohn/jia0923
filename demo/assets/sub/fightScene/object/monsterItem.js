var panel = require("panel");
var FROM_ENUM = cc.Enum({
    CREATER:0,
    REEL:1
});

var MONSTER_TAG = cc.Enum({
    PASSIVE_BACK:100,
    DORETURN:101
});
cc.Class({
    extends: panel,

    properties: {
        spine:sp.Skeleton,
        bornMoveTime: {
            default: 0.5,
            tooltip: "出生时候的移动间隔"
        },
    },

    onLoad:function() {
        this.spine.setCompleteListener(this.complete.bind(this));//
        this.spine.setEventListener(this.eventListener.bind(this));
        var registerHandler = [
            ["callNextWave", this.callNextWave.bind(this)],
            ["waveFightOver", this.waveFightOver.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        Object.defineProperty(this,"curHp",{
          set:function(newValue){
              this._curHp = newValue;
              // if (this._shadowHp && this._shadowHp !== this._curHp) {
              //     this.fightLogic.cheatGame();
              // }
          },
          get:function(){return this._curHp;}
        })
    },

    waveFightOver:function(){
        if (!this.isLife) return;
        if (this.machine) {
            this.setCompVisible(true);
            this.setPosition(this.node.position);
            this.node.stopAllActions();
            this.machine.changeState(constant.StateEnum.WAITE);
        }
    },

    callNextWave:function(){
        if (!this.isPlayer || this.isLife) return;
        if (!this._tickTimeID) return;
        this.clearPlayDeadAni();
    },

    clearPlayDeadAni:function(){
        this.node.stopAllActions();
        this.clearTimeOut();
        uiManager.setRootBlockActive(false);
        this._putInPool();//// NOTE: 主角死亡回收
    },

    clearTimeOut:function(){
        if (this._tickTimeID !== null) {
            clearTimeout(this._tickTimeID);
            this._tickTimeID = null;
        }
    },

    onDisable :function(){
        this.setSpineState(false);
    },

    getOwner:function(){
        return this.ownerID;
    },
    getID:function(){
        return this.id;
    },
    getTid:function(){
        return this.tid;
    },
    getUseSkillCount:function(){
        return this.useSkillCount;
    },
    getMoveSpeed:function(){
        return this.moveSpeed;
    },

    getBulletFixPos:function(){
        var per = this.config[jsonTables.CONFIG_MONSTER.HitScale] || 0;
        if (this.spineHeight) {
            return per / 100 * this.spineHeight;
        }
        return 0;
    },

    getAtkMaxRange:function(){
        return this.config[jsonTables.CONFIG_MONSTER.RangeMax];
    },

    getAtkRange:function(){
        return this.atkRange;
    },
    getIsLife:function(){
        return this.isLife;
    },

    getLv:function(){
        return this.lv;
    },
    getLvForServer:function(){
        return (this.lv);
    },

    getResource:function(){
        return this.config[jsonTables.CONFIG_MONSTER.Resource];
    },

    getFightPower:function(){
        if (this.maxFightPower) {
            return this.maxFightPower;
        }
        return this.fightPower;
    },

    getMoveDuration:function(){
        return this.getDuration(this.moveDuration);
    },
    /** 获取本次攻击时长 */
    getAtkDuration:function(){
        if (!this.atkDuration) {
            if (this.spine.findAnimation("atk")) {
                this.atkDuration = this.spine.findAnimation("atk").duration;
            }else {
                this.atkDuration = 0.5;
            }
        }
        return this.getDuration(this.atkDuration);
    },

    /** 获取攻击间隔 */
    getAtkInterval:function(){
        return this.getDuration(this.atkInterval);
    },
    /** 获取攻速  即spine速度 */
    getActionSpeed:function(){
        if (!this._addAtkSpeed) {
            return this.actionSpeed;
        }
        return ((this._addAtkSpeed/1000 + 1) * this.actionSpeed);
    },
    /** 增加攻速 */
    addActionSpeed:function(add){
        if (!add) return;
        this._addAtkSpeed += add;
    },

    getDuration:function(time){
        return time/jsonTables.displaySpeed_Noraml;
    },
    /** 获取他归属的家族 */
    getFamilyID:function(){
        if (this.isPlayer) return 0;
        return this.config[jsonTables.CONFIG_MONSTER.FamilyID];
    },
    /** 获取类型 战士 射手  坦克 */
    getType:function(){
        return this.type;
    },
    /** 获取真实伤害 */
    getDamageReal:function(){
        var damage = this.damageBase
        return damage;
    },

    getNumConfig:function(key){
        if (this.isPlayer) return 0;
        return this.numericalConfig[key];
    },

    getHpOffCurHp:function(){
        return this.maxHp - this.curHp;
    },

    getMaxHp:function(){
        return this.maxHp;
    },

    getCurHp:function(){
        return this.curHp;
    },
    //记录影子内存
    setShadowHp:function(hp){
        this._shadowHp = hp;
    },

    getSpineHeight:function(){
        return this.spineHeight || 0;
    },

    getSpineWidth:function(){
        return this.spineWidth || 0;
    },

    isPlayerFlag:function(){
        return this.isPlayer;
    },

    isCanAtk:function(ccObj){
        if ((this.fightLogic.getMineID() === this.ownerID && this.node.x - ccObj.node.x > 0)
            || (this.fightLogic.getMineID() !== this.ownerID && this.node.x - ccObj.node.x < 0)) {
            return true;
        }
        return Math.abs(this.node.x - ccObj.node.x) < this.atkRange;
    },
    setBornMoveAction:function(startPos,endPos,callBack){
        this.node.setPosition(startPos);
        this.setCompVisible(false);
        this.node.stopAllActions();

        var call = cc.callFunc(function(){
            this.setCompVisible(true);
            this.setPosition(this.node.position);
            callBack();
        },this)
        this.endPos = endPos;
        var time = this.getDuration(this.bornMoveTime);
        var move = cc.moveTo(time,endPos);
        var sequence = cc.sequence(move,call);
        this.node.runAction(sequence);
    },
    /** 卷轴怪物使用 */
    setReelction:function(endPos,callBack){
        this.setPosition(endPos);
        this.setCompVisible(false);
        this.node.stopAllActions();
        var node = uiResMgr.getPrefabEx("fightArray");
        var time = 0.5;
        node.parent = this.node.parent;
        node.zIndex = this.node.zIndex-1;
        node.position = this.node.position;
        var script = node.getComponent("fightArray");
        script.init();
        this.setBindComp(script);
        var call = cc.callFunc(function(){
            node.getComponent("fightArray").forcePut();
            this.setCompVisible(true);
            this.node.scale = 1;
            this.removeBindComp(true);
            callBack();
        },this)
        this.endPos = endPos;
        this.node.scale = 0;
        var scale = cc.scaleTo(time,1);
        var sequence = cc.sequence(scale,call);
        this.node.runAction(sequence);
    },

    //带上移动动画
    setBornMoveSpineAction:function(startPos,endPos,callBack){
        this.spine.setAnimation(0,'walk',true);
        var call2 = function(){
            this.spine.setAnimation(0,'std',true);
            callBack(this);
        }.bind(this)
        this.setBornMoveAction(startPos,endPos,call2);
    },

    /** 直接构建出来的对象 */
    setBornPos:function(endPos){
        this.endPos = endPos;
    },
    /** 设置初始的被动技能用于删选 自身上的被动 */
    removeSkill:function(fromSkillID){
        this.passiveSkillLogic.releaseSkill(this,fromSkillID);
    },

    startReelActio:function(x){
        this.onMessage({msgType:constant.MsgHanderType.START_DISPLAY});
    },
    /** 找个一个目标 然后走向他 */
    stepForward:function(ccObj,nextTime){
        this.target = ccObj;
        this.moveFlag = true;
        this.needTime = nextTime;//移动时长
        this.moveTime = nextTime;//当前剩余时间
        if (!this.isNormalMove()) {//兼容一下不是我们的spine
            this.spineMoveFlag = true;
        }
    },
    /** 取消目标  */
    stepForwardCancle:function(){
        this.target = null;
        this.moveFlag = false;
        this.spineMoveFlag = false;
    },
    /** 基础数值加成 */
    addDamgeBase:function(add){
        this.damageBase += add;
    },
    /** 设置百分比的基础伤害 */
    setPerDamageBase:function(per){
        if (per === 1) return;
        this.damageBase = Math.floor(this.damageBase * per);
        this.initPower();// NOTE: 重新计算战斗 里
    },

    /** 初始化基础加成 */
    initBaseData:function(){
        this._psBase = this.isPlayer ? this.playerBaseInfo.psBase :this.numericalConfig[jsonTables.CONFIG_MONSTERLV.PsBase];
        this._msBase = this.isPlayer ? this.playerBaseInfo.msBase :this.numericalConfig[jsonTables.CONFIG_MONSTERLV.MsBase];
        this._pdBase = this.isPlayer ? this.playerBaseInfo.pdBase :this.numericalConfig[jsonTables.CONFIG_MONSTERLV.PdBase];
        this._mdBase = this.isPlayer ? this.playerBaseInfo.mdBase :this.numericalConfig[jsonTables.CONFIG_MONSTERLV.MdBase];
        this._critAtk = this.isPlayer ?this.playerBaseInfo.critAtk + (this.playerBaseInfo.critAtkEx || 0):this.config[jsonTables.CONFIG_MONSTER.CritAtk];
        this._addAtkSpeed = this.isPlayer ? this.playerBaseInfo.atkSpeed || 0 : 0;//额外的攻击千分比加成
        this._tempShield = 0;//护盾数值
    },

    addTempShiled:function(count){
        this._tempShield += count;
    },

    removeTempShiled:function(count){
        cc.log("减少护盾",count)
        this._tempShield -= count;
        if (this._tempShield < 0) {
            this._tempShield = 0;
        }
    },

    addCrit:function(add){//暴击率
        this._critAtk += add;
    },
    getCrit:function(){//暴击率
        // if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN) && this.areanLogic.isMoreAtk(this.ownerID) && !this.areanLogic.isplayRobot()) {//不加暴击率，有个免疫暴击技能
        //     return this._critAtk + 500;
        // }
        return this._critAtk;
    },

    addPsBase:function(add){//物理强度
        this._psBase += add;
    },

    getPsBase:function(){//物理强度
        if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN) && this.areanLogic.isMoreAtk(this.ownerID) && !this.areanLogic.isplayRobot()) {
            return this._psBase * 1.5;
        }
        return this._psBase;
    },
    addMsBase:function(add){//魔法强度
        this._msBase += add;
    },
    getMsBase:function(){//魔法强度
        return this._msBase;
    },
    addPdBase:function(add){//物理防御
        this._pdBase += add;
    },
    getPdBase:function(){//物理防御
        return this._pdBase;
    },
    addMdBase:function(add){//魔法防御
        this._mdBase += add;
    },
    getMdBase:function(){//魔法防御
        return this._mdBase;
    },
    addRange:function(add){
        this.atkRange += add;
    },
    /** 给被动技能用 */
    addPerHpForPassive:function(per){
        var hp = this.maxHp * per;
        this.addHpForPassive(hp);
    },
    /** 给被动技能用 */
    addHpForPassive:function(heal,noRefreshUI){
        this.maxHp += heal;
        this.setShadowHp(this.maxHp);
        this.curHp = this.maxHp;
        this.updateHp(!noRefreshUI);
    },

    getDamageBase:function(){
        return this.damageBase;
    },

    getDir:function(){
        return this.spine.node.scaleX > 0 ? 1 : -1;
    },

    getScaleX:function(){
        return this.spine.node.scaleX;
    },
    /** 设置怪物来源 */
    setMonsterFrom:function(from){
        this.from = from;
    },

    getMonsterFrom:function(){
        return this.from;
    },

    /** 设置怪物异常状态 */
    setMonAbnoramlState:function(from){
        this.abnormal = from;
    },

    getMonAbnoramlState:function(){
        return this.abnormal;
    },
    //是否处于免疫状态
    isImmunoState:function(){
        return this.abnormal === constant.MonState.Role_Immuno || this.abnormal === constant.MonState.Dead_Immuno || this.abnormal === constant.MonState.Heal_Immuno;
    },

    //获取怪物形态
    getForm:function(){
        return  this.config[jsonTables.CONFIG_MONSTER.Form];
    },
    //获取怪物卡片等级
    getQuality:function(){
        return  this.familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Quality];
    },
    /** 设置是否启动第二种攻击模式 */
    setUseSencondAtk:function(active){
        this.isUseSencondAtk = active;
    },

    getUseSencondAtk:function(){
        return this.isUseSencondAtk;
    },

    //获取被动技能战斗力加成值
    getSkillAdd:function(){
        if(this.isPlayer)    return  0;
        var addRes = jsonTables.countSkillAdd(this.skillList,this.getForm(),this.getLv(),this.getQuality());
        return  addRes.addSword + addRes.addShield;
    },
    //初始化怪物战斗力
    initPower:function(){
        this.skillAddNum =this.isPlayer && !this.isBoss() ? 0 : this.getSkillAdd();
        this.swordNum =this.isPlayer && !this.isBoss() ? 0 : this.formulaLogic.calculateSword(this.getPsBase(),this.getMsBase(),this.getDamageBase(),this.getCrit(),this.familyConfig[jsonTables.CONFIG_MONSTERFAMILY.SwordForm][this.getForm() - 1]);
        this.shieldNum =this.isPlayer && !this.isBoss() ? 0 : this.formulaLogic.calculateShield(this.getPdBase(),this.getMdBase(),this.getCurHp(),this.familyConfig[jsonTables.CONFIG_MONSTERFAMILY.ShieldForm][this.getForm() - 1]);
        this.fightPower =this.skillAddNum + this.swordNum + this.shieldNum;
        this.maxFightPower = this.fightPower;
    },
    /** 是否为世界boss */
    isWorldBoss:function(){
        return this.isPlayer && this.fightLogic.isGameType(constant.FightType.WORLD_BOSS) && this.ownerID === this.fightLogic.getEnemyID();
    },
    /** 是否boss   包含 世界boss 裂缝boss之类的 */
    isBoss:function(){
        return this.isWorldBoss();
    },

    isMineCreator:function(){
        return this.fightLogic.getMineID() === this.ownerID;
    },

    /**
     * 初始化一个怪物
     * @param  {int}  ownerID       来源者id
     * @param  {object}  info          tid配置表id lv基础等级
     * @param  {ccobj}  shadowScript  阴影脚本
     * @param  {ccobj}  hpScript      血条脚本
     * @param  {int}  useSkillCount 使用技能次数
     * @param  {int}  addLv         额外加成等级
     * @param  {Boolean} isPlayer      是否为主角
     */
    init:function(ownerID,info,shadowScript,hpScript,useSkillCount,addLv,isPlayer){
        this.isPlayer = isPlayer || false;
        this.setMonsterFrom(constant.FightMonsterFrom.CREATER);
        this.setMonAbnoramlState(constant.MonState.Normal);
        this.useSkillCount = useSkillCount || 0;
        this.shadowScript = shadowScript;
        this.hpScript = hpScript;
        this.node.opacity = 255;
        this.tid = info.id;
        this.atkDuration = 0;
        this.addLv = addLv || 0;//加成等级  默认为1 级 ---》 2级加成了1级
        this.lv = info.lv + this.addLv;//基础等级
        this.id = jsonTables.enumCount();
        this.ownerID = ownerID;
        this.setSpineState(true);
        this.spine.setToSetupPose();
        this.isUseSencondAtk = false;//是否使用第二种攻击标识
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,this.tid);
        this.shadowScript.setScale(this.config[jsonTables.CONFIG_MONSTER.Shadow]);
        this.node.stopAllActions();
        this.spine.node.scale = this.config[jsonTables.CONFIG_MONSTER.CombatScale]/100;
        this.spine.node.scaleX = ownerID === this.fightLogic.getEnemyID() ? -Math.abs(this.spine.node.scale):Math.abs(this.spine.node.scale);
        this.spine.node.color = uiColor.white;
        var familyID = this.config[jsonTables.CONFIG_MONSTER.FamilyID];
        if (familyID && familyID !== 1) {
            this.familyConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);
        }
        this._shadowHp = 0;

        if (this.isPlayer) {
            this.type = constant.MonsterType.PLAYER;//// TODO: 根据职业修改  暂时化身洛丁
            this.playerBaseInfo = cc.js.createMap();
            // this.fightLogic.addCreator(this.ownerID,this,this.id,constant.MonsterType.PLAYER);
            var data = this.fightLogic.getGamerBaseInfo(this.ownerID);
            if (data === null) return cc.error("没有目标用户数据");
            kf.convertData(data.playerBaseInfo,this.playerBaseInfo);
            this.setShadowHp(data.ccObjInfo.curHp);
            kf.convertData(data.ccObjInfo,this);
            if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {// NOTE: 强制转换为远程
                if(!this.config[jsonTables.CONFIG_MONSTER.Bullet]){
                    this.setUseSencondAtk(true);
                }
                this.addRange(1000);
            }
        }else {
            this.numericalConfig = cc.js.createMap();
            this.numericalConfig[jsonTables.CONFIG_MONSTERLV.HpBase] = this.formulaLogic.calcuateBaseCount(this.tid,constant.FormmulaBaseKey.Hp,this.lv);
            this.numericalConfig[jsonTables.CONFIG_MONSTERLV.DamageBase] = this.formulaLogic.calcuateBaseCount(this.tid,constant.FormmulaBaseKey.Damage,this.lv);
            this.numericalConfig[jsonTables.CONFIG_MONSTERLV.PdBase] = this.formulaLogic.calcuateBaseCount(this.tid,constant.FormmulaBaseKey.PdBase,this.lv);
            this.numericalConfig[jsonTables.CONFIG_MONSTERLV.MdBase] = this.formulaLogic.calcuateBaseCount(this.tid,constant.FormmulaBaseKey.MdBase,this.lv);
            this.numericalConfig[jsonTables.CONFIG_MONSTERLV.PsBase] = this.formulaLogic.calcuateBaseCount(this.tid,constant.FormmulaBaseKey.PbBase,this.lv);
            this.numericalConfig[jsonTables.CONFIG_MONSTERLV.MsBase] = this.formulaLogic.calcuateBaseCount(this.tid,constant.FormmulaBaseKey.MbBase,this.lv);

            this.type = this.familyConfig[jsonTables.CONFIG_MONSTERFAMILY.Type];
            this.maxHp = this.numericalConfig[jsonTables.CONFIG_MONSTERLV.HpBase] ;
            this.damageBase = this.numericalConfig[jsonTables.CONFIG_MONSTERLV.DamageBase];
            this.atkRange = jsonTables.randomNum(this.config[jsonTables.CONFIG_MONSTER.Rangmin],this.config[jsonTables.CONFIG_MONSTER.RangeMax]);
            this.atkInterval = jsonTables.randomNum(this.config[jsonTables.CONFIG_MONSTER.AttackInterval][0],this.config[jsonTables.CONFIG_MONSTER.AttackInterval][1]);
            this.moveSpeed = this.config[jsonTables.CONFIG_MONSTER.Speed];
            this.setShadowHp(this.maxHp);
            this.curHp = this.maxHp;
        }
        this.firstWaite = this.config[jsonTables.CONFIG_MONSTER.AttackBeginTime] || 0;
        this.initBaseData();

        this.atkInterval = this.atkInterval/1000;
        this.moveSpeed = this.getDir() * this.moveSpeed;
        this.moveDuration = 1;//一个配置表的唯一需要消耗的时长
        this.resetSpeed();

        this.updateHp(true);
        var re = this.fightLogic.getMonsMapPos(this.tid,this.ownerID === this.fightLogic.getMineID(),this.isPlayer);
        if (this.isPlayer) {
            this.node.zIndex = (re.zIndex)
        }else {
            this.node.zIndex = (100-re.playY)
        }
        this.node.y = re.playY;
        this.msgHanderLogic.register(this.id,this);//向内部注册该对象
        this.spineHeight = 0;
        this.spineWidth = 0;
        this.isLife = true;
        this.moveFlag = false;
        this.target = null;
        // this.setAreanEmoj(null);
        this.clearTimeOut();
        if (!this.machine) {
            this.machine = this.fightLogic.newStateMachine(this);//声明一个状态机放置在该对象身上
        }else {
            this.machine.reset();
        }
        this.fightLogic.addCreator(this.ownerID,this,this.id,this.type);

        var isShowSkill = this.ownerID === this.fightLogic.getMineID() && this.config[jsonTables.CONFIG_MONSTER.Skill] && this.useSkillCount && this.useSkillCount > 0
        this.removeSkillIcon();
        if (this.isPlayer) {
            isShowSkill = false;
        }
        if (isShowSkill) {
            this.skillIconScript = this.fightLogic.callSceneRoot("newSkillIcon");
            this.skillIconScript.init(this.config[jsonTables.CONFIG_MONSTER.Skill],this);
        }
        this.useSkillCount = isShowSkill ? this.useSkillCount : 0;
        var bulletID = this.config[jsonTables.CONFIG_MONSTER.Bullet];
        if (bulletID) {
            var prefabLoadCb = function () {}.bind(this);
            this.scheduleOnce(function(){
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletID);
                uiResMgr.loadFightBulletPool(config[jsonTables.CONFIG_BULLET.Resource],prefabLoadCb);//预加载子弹预制体
                if(config[jsonTables.CONFIG_BULLET.ResourceBg]){
                    uiResMgr.loadFightBulletBgPool(config[jsonTables.CONFIG_BULLET.ResourceBg],prefabLoadCb);//预加载子弹预制体
                }
            }.bind(this),0);//延后取加载子弹
        }
        this.swichSpine();
        if (this.config[jsonTables.CONFIG_MONSTER.AttackSound]) {//// NOTE:  预加载一下音乐啦
            uiResMgr.loadAudio(this.config[jsonTables.CONFIG_MONSTER.AttackSound]);
        }
        this.skillList = this.passiveSkillLogic.initBaseSkill(this);
        this.talentSkillLogic.checkTalentEffect(this);
        this.talentSkillLogic.checkEquipEffect(this);//装备加成
        this.initPower();
        this.node.dispatchDiyEvent("fightPowerChange",{owner:this.ownerID,power:this.fightPower,isAdd:true});
        var list = kf.cloneArray(this.node.children);
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            if (obj.name.indexOf("buffEffect233") !== -1) {
                obj.removeFromParent();
                obj.destroy();
            }
        }
    },
    _bindCall:function(){
        if (!this.getIsLife()) {
            return;
        }
        var spineData = this.spine.skeletonData;
        if (!jsonTables.isSpineContainEvent(spineData,'effect')) {
            if (this.skillIconScript) {
                this.skillIconScript.setVisible(false);
            }
        }
        this.spine.timeScale = this.getActionSpeed();
        this.spineHeight = spineData.skeletonJson.skeleton.height * Math.abs(this.spine.node.scaleX);// NOTE: spine动画的高度
        this.spineWidth = spineData.skeletonJson.skeleton.width * Math.abs(this.spine.node.scaleX);
        if (this.type === constant.MonsterType.TANK || this.type === constant.MonsterType.WARRIOR) {// NOTE: 进行攻击距离补齐
            this.atkRange += (this.spineWidth/2);
        }
        var hpSpIdx =  this.ownerID === this.fightLogic.getEnemyID() ? 1:0;
        this.hpScript.initHp(spineData.skeletonJson.skeleton.width,hpSpIdx,this.isWorldBoss());
        this.setPosition(this.node.position);
    },
    /** 切换怪物spine */
    swichSpine:function(){
        //init ui
        if (this.isPlayer ) {
            this.spine.skeletonData = null;
            if (this.ownerID === this.fightLogic.getMineID()) {
                if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
                    var roleInfo = this.areanLogic.getMineBase();
                    this.equipLogic.setBaseSpineForOther(roleInfo.Sex,roleInfo.Occupation,roleInfo.EquipBaseID,this.spine.node,this._bindCall.bind(this));
                }else{
                    this.equipLogic.setBaseSpine(this.spine.node,this._bindCall.bind(this));
                }

            }else {// NOTE:现在只有竞技场  以后有要添加一下
                if (this.fightLogic.isShowEnmeyPlayer()) {
                    var roleInfo = null;
                    if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
                        roleInfo = this.areanLogic.getEnmeyBase();
                    }else if (this.fightLogic.isGameType(constant.FightType.MINE_FIGHT)) {
                        roleInfo = this.mineLogic.getEnmeyBase();
                    }else if (this.fightLogic.isGameType(constant.FightType.WORLD_BOSS)) {
                        return this._loadConfigSpine();
                    }
                    roleInfo.EquipBaseID = roleInfo.EquipBaseID || [];
                    this.equipLogic.setBaseSpineForOther(roleInfo.Sex,roleInfo.Occupation,roleInfo.EquipBaseID,this.spine.node,this._bindCall.bind(this));
                }else {
                    debugger;
                }
            }
        }else {
            this._loadConfigSpine();
        }
    },

    _loadConfigSpine : function () {
        var callBack = function(spineData){
            this.spine.skeletonData  = spineData;
            this.spine.setAnimation(0,'std',true);
            this._bindCall();
        }.bind(this);
        var spineName = this.config[jsonTables.CONFIG_MONSTER.Resource];
        uiResMgr.loadSpine(spineName,callBack);
    },

    setPosition:function(pos){
        this.node.setPosition(pos);
        this.shadowScript.setPosition(this);
        this.hpScript.setPosition(this,this.spineHeight,this.config[jsonTables.CONFIG_MONSTER.MonsterYScale],this.config[jsonTables.CONFIG_MONSTER.MonsterYOffset]);
        if (this.skillIconScript) {
            this.skillIconScript.setPosition(this,this.spineHeight,this.config[jsonTables.CONFIG_MONSTER.MonsterYScale],this.config[jsonTables.CONFIG_MONSTER.MonsterYOffset]);
        }
    },

    resetSpeed:function(){
        switch (jsonTables.displaySpeed_CurSpeed) {
            case jsonTables.displaySpeed_Noraml:
                this.actionSpeed = jsonTables.displaySpeed_Noraml;//行为执行的速度；
                break;
            case jsonTables.displaySpeed_Max:
                this.actionSpeed = jsonTables.displaySpeed_Max;//行为执行的速度；
                break;
        }
    },
    /** src消息传递者id，extMsg 额外信息 msgType  sender发送消息的对象 */
    onMessage:function(msg,sender){
        switch (msg.msgType) {
            case constant.MsgHanderType.WAITE_WAVE:
                this._onMessageWaite_Wave();
                break;
            case constant.MsgHanderType.NEW_DAMAGE:

                break;
            case constant.MsgHanderType.DISPLAY_STOP_RESUME:
                this._onMessageDisplay_Stop_Resume(msg);
                break;
            case constant.MsgHanderType.START_DISPLAY:
                this._onMessageStart_Display(msg);
                break;
            case constant.MsgHanderType.DISPLAY_SPEED:
                this._onMessageDisplay_Speed(msg);
                break;
            case constant.MsgHanderType.ATK_CREATE://msg.extMsg：target
                this._onMessageAtk_Create(msg);
                break;
            case constant.MsgHanderType.ATK_AGAIN:
                this._onMessageAtk_Again(msg);
                break;
            case constant.MsgHanderType.SKILL_START:
                this._onMessageSkill_Start(msg);
                break;
            case constant.MsgHanderType.SKILL_END:
                this._onMessageSkill_End();
                break;
            case constant.MsgHanderType.SKILL_DAMAGE://msg.extMsg = {target,addNum}
                this._onMessageSkill_Damage(msg);
                break;
            case constant.MsgHanderType.BUFF_ADD://msg.extMsg = {buffId，lv}
                this._onMessageBuff_Add(msg);
                break;
            case constant.MsgHanderType.BUFF_REMOVE: //msg.extMsg = {buffId，lv}
                this._onMessageBuff_Remove(msg);
                break;
            case constant.MsgHanderType.SKILL_HEAL: //msg.extMsg = addNum//配置表加成值
                this._onMessageSkill_Heal(msg);
                break;
            case constant.MsgHanderType.SKILL_HITBACK: //{target:,buffID}
                this._onMessageSkill_Hitback(msg);
                break;
            case constant.MsgHanderType.BUFF_DOT: //buffdot回调
                this._onMessageSkill_BuffDot(msg);
                break;
            case constant.MsgHanderType.REMOVE_BULLET: //移除指定子弹
                this._onMessageRemove_bullet(msg);
                break;
            case constant.MsgHanderType.GUIDE_ACTION: //移动行为
                this._onMessageGuide_action(msg);
                break;

        }
    },
    //等待下一波
    _onMessageWaite_Wave:function(){//WAITE_WAVE
        if (this.isUseSencondAtk && !this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {
            this.addRange(-1000);//// TODO: 暂时写死增加1000距离
            this.setUseSencondAtk(false);
            this.setMonAbnoramlState(constant.MonState.Normal);
        }
        if (!this.isCanPassWave()) {//不是正常召唤出来的怪物 都要去死  处于异常状态也要死
            this.putInPool();
        }else{
            this.moveFlag = false;
            if (this.fightLogic.isGameType(constant.FightType.PVP_AREAN)) {//// NOTE: 暂时特殊处理下
                if (this.endPos) {
                    this.setPosition(this.endPos);
                }
                this.machine.changeState(constant.StateEnum.WAITE);
            }else {
                if (this.endPos) {
                    this.machine.changeState(constant.StateEnum.RETURN);
                }else {
                    this.machine.changeState(constant.StateEnum.WAITE);
                }
            }
            this.clearAllBuff();
            this.passiveSkillLogic.reAddRemoveMap(this);
            this.addHp(this.maxHp,false);
        }

    },
    //暂停与继续
    _onMessageDisplay_Stop_Resume:function(msg){//DISPLAY_STOP_RESUME
        jsonTables.displaySpeed_Stop = msg.extMsg;
        this.setSpineState(!msg.extMsg);
    },
    //开始表演
    _onMessageStart_Display:function(msg){//DISPLAY_STOP_RESUME
        if (!this.machine) {
            this.putInPool();
            cc.error("为啥没了")
            return;
        }
        if (this.firstWaite) {
            this.scheduleOnce(function () {
                this.machine.changeState(constant.StateEnum.FIND);
            },this.firstWaite/1000);
        }else{
            this.machine.changeState(constant.StateEnum.FIND);
        }

        var ext = this.passiveSkillLogic.newExtObject(0,constant.DamageType.NONE,this,this,tb.PASSIVE_BATTLE_BEGIN,false);
        this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_BATTLE_BEGIN,ext);
    },
    //切换速度
    _onMessageDisplay_Speed:function(msg){
        this.resetSpeed();
        this.speedDirty = true;
    },
    //普通攻击
    _onMessageAtk_Create:function(msg){
        if (!this.machine.isCurStateID(constant.StateEnum.ATK)) return;
        if (!this.fightLogic.isDisplaying()) return;
        var target = msg.extMsg;
        if (!target.getIsLife())  return;
        this.playAudio();
        var bulletID = this.getBulletID();
        var damgeType = !!bulletID ? constant.DamageType.FAR:constant.DamageType.NEAR;
        if (bulletID) {//TODO 生成不一样的预制体
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletID);

            var prefabLoadCb = function () {
                if (!target.getIsLife() || !this.getIsLife()) return;
                //
                var damageInfo = {
                    damageBase:this.damageBase,
                    psBase:this.getPsBase(),
                    msBase:this.getMsBase(),
                    pdBase:target.getPdBase(),
                    mdBase:target.getMdBase(),
                    mineForm:this.getForm(),
                    target:target.getForm()
                }
                this.newBullet(bulletID,damageInfo,target);
                var ext = this.passiveSkillLogic.newExtObject(0,constant.DamageType.NEAR,target,this,tb.PASSIVE_BEATTACK_READY,false);
                this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_BEATTACK_READY,ext);
            }.bind(this);
            uiResMgr.loadFightBulletPool(config[jsonTables.CONFIG_BULLET.Resource],prefabLoadCb);
            if(config[jsonTables.CONFIG_BULLET.ResourceBg]){
                uiResMgr.loadFightBulletBgPool(config[jsonTables.CONFIG_BULLET.ResourceBg],prefabLoadCb);//预加载子弹预制体
            }
        }else {
            var ext = this.passiveSkillLogic.newExtObject(0,constant.DamageType.NEAR,target,this,tb.PASSIVE_ATTACK_PRE,false);
            this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_ATTACK_PRE,ext);
            var damage = this.formulaLogic.calculateDamage(ext.damageInfo.damageBase,ext.damageInfo.psBase,ext.damageInfo.msBase,ext.damageInfo.pdBase,ext.damageInfo.mdBase,this.getForm(),target.getForm());
            damage = this.damageBuffAdd(damage,constant.DamageType.NEAR,target);
            damage = target.damageBuffDesr(damage,constant.DamageType.NEAR,this);
            var isCritAtk = false;
            if (this.isCritAtk(ext.critAtk)) {
                damage = damage * 2;//暴击了
                isCritAtk = true;
            }
            if(damage >= 100000){ //单次攻击最大伤害
                damage = 2;
            }
            if (!ext.isDamageContinue) return;//伤害被打断了
            if (jsonTables.showFightLog) {
                try {
                    var str = "普通攻击发起者{0}对{1}造成了："+damage;
                    this.fightLogic.showLog(this.id,target.getID(),str);
                } catch (e) {
                    console.error(e);
                }
            }

            target.desrHp(damage,this,true,constant.DamageType.NEAR,isCritAtk);
            var ext = this.passiveSkillLogic.newExtObject(damage,constant.DamageType.NEAR,target,this,tb.PASSIVE_ATTACK_BEHIND,isCritAtk);
            this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_ATTACK_BEHIND,ext);
        }
    },
    //再次调用普通攻击
    _onMessageAtk_Again:function(msg){
        if (!this.machine.isCurStateID(constant.StateEnum.ATK)) return;
        this.machine.update();//更新攻击状态  下一次可能因为速度切换得出最新的结果
    },

    //技能开始
    _onMessageSkill_Start:function(msg){
        if (msg.extMsg && !msg.extMsg.getIsLife() || !this.fightLogic.getSkillMonNum()) {
            jsonTables.displayingSkill = false;
            return;// NOTE: 人都死了 有啥好放技能的
        }
        this.setSpineState(false);
        if (this.machine.isCurStateID(constant.StateEnum.SKILL)) {//其他人停下来
            this.node.opacity = 0;
            this.setCompVisible(false);
            // this.scheduleOnce(function () {
                this.node.dispatchDiyEvent("showSkill",{tid:this.tid,pos:this.node.position,actionSpeed:this.getActionSpeed(),owner:this.ownerID,fromer:this});
            // },0);
        }
    },
    //技能结束
    _onMessageSkill_End:function(msg){
        if (!this.machine.isCurStateID(constant.StateEnum.SKILL)) {
            this.setSpineState(true);
        }
    },

    resumeFromSkill:function(){
        this.machine.backPreState();
        this.node.opacity = 255;
        this.setCompVisible(true);
        this.setSpineState(true);
    },

    //技能伤害
    _onMessageSkill_Damage:function(msg){
        if (jsonTables.showFightLog) {
            try {
                var str = "技能伤害发起者{0}对{1}造成了："+msg.extMsg.damageNum;
                this.fightLogic.showLog(msg.src,this.id,str);
            } catch (e) {
                console.error(e);
            }
        }
        var damage = msg.extMsg.damageNum;
        this.desrHp(damage,msg.extMsg.damgeFromer,false,constant.DamageType.SKILL,false);
    },
    //添加buff
    _onMessageBuff_Add:function(msg){
        if (this.getMonAbnoramlState() === constant.MonState.Role_Immuno) {//如果是主角处于无敌不要上buff
            return;
        }
        if (jsonTables.showFightLog) {
            try {
                var str = "buff发起者{0}对{1}增加了一个buff,buffID："+msg.extMsg.buffId+",buffNum:"+msg.extMsg.buffNum;
                this.fightLogic.showLog(msg.src,this.id,str);
            } catch (e) {
                console.error(e);
            }
        }
        this.buffLogic.addBuff(this,msg.extMsg.buffId,msg.extMsg.buffNum,msg.extMsg.msgKey,msg.extMsg.buffFromer,msg.extMsg.buffExt);
    },
    //移除buff
    _onMessageBuff_Remove:function(msg){
        this.buffLogic.desrBuff(this,msg.extMsg.buffId,msg.extMsg.buffNum);
    },
    //buffdot回调
    _onMessageSkill_BuffDot:function(msg){
        this.buffLogic.doBuffEffect(msg.extMsg.ccObj,msg.extMsg.buffID,msg.extMsg.buffNum);
    },

    //技能治疗
    _onMessageSkill_Heal:function(msg){
        if (jsonTables.showFightLog) {
            try {
                var str = "技能治疗发起者{0}对{1}造成了："+msg.extMsg;
                this.fightLogic.showLog(msg.src,this.id,str);
            } catch (e) {
                console.error(e);
            }
        }
        this.addHp(msg.extMsg,true);
    },
    //击退效果
    _onMessageSkill_Hitback:function(msg){
        this.doHitBack(msg.extMsg);
    },

    _onMessageRemove_bullet:function(msg){
        if (!this.machine || !this.machine.isCurStateID(constant.StateEnum.ATK)) return;
        var ccTarget = this.machine.getStateData(constant.StateMachine.FIND);//先检查一下目标死活
        if (ccTarget && ccTarget.getIsLife() && ccTarget.getID() === msg.extMsg.target.getID()) {
            this.machine.setStateData(constant.StateMachine.FIND,null);
            this.machine.changeState(constant.StateEnum.FIND);
        }
    },

    _onMessageGuide_action:function(msg){
        switch (msg.extMsg) {
            case "fade":
                var fadeOutTime = this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.FadeOutTime)/1000;
                var fadeInTime = this.guideLogic.getConfigValue(jsonTables.CONFIG_GUIDE.FadeInTime)/1000;
                this.node.stopAllActions();
                this.setCompVisible(false);
                var fadeOut = cc.fadeTo(fadeOutTime,0);
                var callFunc = cc.callFunc(function () {
                    if (this.endPos) {
                        this.setPosition(this.endPos);
                    }
                },this);
                var fadeIn = cc.fadeTo(fadeInTime,255);
                var callFunc2 = cc.callFunc(function () {
                    this.isLife = true;
                    this.addHp(this.maxHp,false);
                    this.setCompVisible(true);
                },this);
                var seq = cc.sequence(fadeOut,callFunc,fadeIn,callFunc2);
                seq.setTag(MONSTER_TAG.PASSIVE_BACK)
                this.node.runAction(seq);
                break;
            case "talk":
                this.changeMachineState(constant.StateEnum.WAITE);
                break;
        }
    },

//////////////////////////////////onMessageEnd/////////////////////////////////////////
    //初始化一个子弹
    newBullet:function (bulletID,damageInfo,target) {
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletID);
        var fixPosList = this.config[jsonTables.CONFIG_MONSTER.BulletDrift];
        var name = this.config[jsonTables.CONFIG_MONSTER.Resource];
        var isMine = this.ownerID === this.fightLogic.getMineID();
        // var re = this.fightLogic.getMonsMapPos(this.tid,isMine,this.isPlayer);
        var zore = target.node.parent.zIndex > this.node.parent.zIndex ? target.node.parent.zIndex : this.node.parent.zIndex;
        var bulletParent = this.fightLogic.getRoot().getMonsterExParent(name+"bullet",(zore+1),isMine);
        var node = uiResMgr.getPrefabEx(config[jsonTables.CONFIG_BULLET.Resource]);
        node.parent = bulletParent;
        node.getComponent("fighttBullet").init(bulletID,this,target,damageInfo,fixPosList);
        if(config[jsonTables.CONFIG_BULLET.Type] === tb.BULLET_TARGET && config[jsonTables.CONFIG_BULLET.ResourceBg]){//直接作用效果
            var bulletBgParent = this.fightLogic.getRoot().getBuletBgParent();
            var nodeBg = uiResMgr.getPrefabEx(config[jsonTables.CONFIG_BULLET.ResourceBg]);
            nodeBg.parent = bulletBgParent;
            nodeBg.getComponent("fighttBulletBg").init(target);
        }
    },
    //获取子弹配置id
    getBulletID:function () {
        var key = this.isUseSencondAtk ? jsonTables.CONFIG_MONSTER.DeathBullet : jsonTables.CONFIG_MONSTER.Bullet;
        var bulletID = this.config[key];
        return bulletID;
    },

    /** 是否可以进入下一波 */
    isCanPassWave:function(){
        if (this.abnormal !== constant.MonState.Normal && this.abnormal !== constant.MonState.CritAtk_Immuno) {
            return false;
        }
        return this.from === constant.FightMonsterFrom.CREATER;
    },
    /** 是否可以保留 */
    isCanKeep:function(){
        return this.from === constant.FightMonsterFrom.CREATER;
    },

    playAudio:function(){// TODO: 来个参数区分一下
        if (this.config[jsonTables.CONFIG_MONSTER.AttackSound]) {//// // TODO: 来一个死亡的？
            this.clientEvent.dispatchEvent("playAudioEffect",this.config[jsonTables.CONFIG_MONSTER.AttackSound]);
        }
    },



    doHitBack:function(param){
        var pos = this.node.position;
        var offX = this.onwer === this.fightLogic.getMineID() ? - 100:100;
        pos.x += offX;
        if (Math.abs(pos.x) > this.node.parent.parent.width/2) {
            pos.x = this.onwer === this.fightLogic.getMineID() ? -this.node.parent.parent.width/2:this.node.parent.parent.width/2;
        }
        this.setCompVisible(false);
        var jump = cc.jumpTo(0.5,pos,100,1);
        this.machine.changeState(constant.StateEnum.WAITE);
        var callfunc = function(){
            this.setPosition(this.node.position);
            this.setCompVisible(true);
            if (param.buffs && param.buffs.length > 0) {
                this.skillLogic.doBuff(param.target,param.buffs,param.fromer,param.buffTimes,param.buffNums);
            }else {
                this.machine.changeState(constant.StateEnum.FIND);
            }
        }.bind(this);
        var callBack = cc.callFunc(callfunc);
        if (this.buffLogic.isCanHitBack(this)) {
            var seq = cc.sequence(jump,callBack);
            this.node.runAction(seq);
        }else {
            callfunc();
        }
    },

    doHitBackForGuide:function(param){
        var pos = this.node.position;
        var offX = - 100;
        pos.x += offX;

        this.setCompVisible(false);
        var jump = cc.jumpTo(0.5,pos,100,1);
        this.machine.changeState(constant.StateEnum.WAITE);
        var callfunc = function(){
            this.setPosition(this.node.position);
            this.setCompVisible(true);
            this.guideLogic.checkGameResult(false);
        }.bind(this);
        var callBack = cc.callFunc(callfunc);
        var seq = cc.sequence(jump,callBack);
        this.node.runAction(seq);
    },

    setAllVisible:function(value){
        this.node.active = value;
        this.spine.node.active = value;
        this.spine.paused = !value;
        this.setCompVisible(value);
    },

    setCompVisible:function(value){
        if (this.hpScript) {
            this.hpScript.setVisible(value);
            this.shadowScript.setVisible(value);
        }
        if (this.skillIconScript) {
            this.skillIconScript.setVisible(value);
        }
    },

    /** 将伤害经过buff加成 */
    damageBuffAdd:function(damage,type,damgeTo){
        damage = this.buffLogic.addBuffCount(this,damage);
        var ext = this.passiveSkillLogic.newExtObject(damage,type,damgeTo,this,tb.PASSIVE_ATTACK_MID,false);
        this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_ATTACK_MID,ext);
        damage = ext.damageNum;
        if (this.buffLogic.isCritEnable(this)) {
            ext.critAtk = 1000;
        }
        return damage;
    },

    /** 将伤害经过buff减免 */
    damageBuffDesr:function(damage,type,damgeFrom){
        damage = this.buffLogic.desrBuffCount(this,damage,type);

        var ext = this.passiveSkillLogic.newExtObject(damage,type,this,damgeFrom,tb.PASSIVE_BEATTACK_MID,false);
        this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_BEATTACK_MID,ext);
        damage = ext.damageNum;
        return damage;
    },

    /** 做一下归为动作  forceDir 强制转变方向 */
    doReturnAction:function(time,forceDir,cb){
        this.setCompVisible(false);
        this.node.stopAllActions();
        var isNeedFlip = false;
        if (this.guideLogic.isInGuideFlag() || forceDir) {
            this.spine.node.scaleX = -this.spine.node.scaleX;
            isNeedFlip = true;
        }else if (!forceDir) {
            this.spine.node.scaleX = Math.abs(this.spine.node.scaleX);
        }
        var call = cc.callFunc(function(){
            this.setCompVisible(true);
            this.setPosition(this.node.position);
            this.machine.changeState(constant.StateEnum.WAITE);
            if (isNeedFlip) {
                this.spine.node.scaleX = -this.spine.node.scaleX;
            }
            if (cb) {
                cb();
            }
        },this)
        if (!time) {
            time = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.BackGroundSpeed);
            time = jsonTables.accDuration(time);
        }
        var move = cc.moveTo(time,this.endPos);
        var sequence = cc.sequence(move,call);
        sequence.setTag(MONSTER_TAG.DORETURN)
        this.node.runAction(sequence);
    },

    clearAllBuff:function(){
        this.buffLogic.clearAllBuff(this);
    },

    /** 动画播放的回调  此时才去修改播放速度，避免之前delay的动作和动画对不上 */
    complete:function(){
        if (!this.speedDirty) return;
        this.speedDirty = false;
        this.spine.timeScale = this.getActionSpeed();
    },

    eventListener:function(trackEntry,event){
        if (event.data.name === "attack") {
            var ccTarget = this.machine.getStateData(constant.StateMachine.FIND);//先检查一下目标死活
            var msg = {extMsg:ccTarget};
            this._onMessageAtk_Create(msg);
        }else if (event.data.name === "start") {
            this.spineMoveFlag = true;
        }else if (event.data.name === "stop") {
            this.spineMoveFlag = false;
        }else {
            var spineName = this.config[jsonTables.CONFIG_MONSTER.Resource];
            cc.log(event.data.name,spineName)
        }
    },

    isNormalAtk:function(){
        return jsonTables.isSpineContainEvent(this.spine.skeletonData,'attack');
    },

    isNormalMove:function(){
        return jsonTables.isSpineContainEvent(this.spine.skeletonData,'start');
    },

    playEnterAction:function(state){
        if (!this.spine) return;
        switch (state) {
            case constant.StateEnum.WAITE:
                this.spine.setAnimation(0,'std',true);
                break;
            case constant.StateEnum.MOVE:
                this.spine.setAnimation(0,'walk',true);
                break;
            case constant.StateEnum.ATK:
                var atkStr =this.isUseSencondAtk ? "atkSecond":"atk";
                this.spine.setAnimation(0,atkStr,false);
                this.spine.addAnimation(0,'std',true)
                break;
            case constant.StateEnum.DEAD:
                if (this.spine.findAnimation('die')) {
                    this.spine.setAnimation(0,'die',false);
                    this.node.stopAllActions();
                    this._tickTimeID = null;
                    uiManager.setRootBlockActive(true);
                    var callFunc = function(){
                        this.clearPlayDeadAni();
                        this.fightLogic.checkGameResult(this.ownerID);
                    }.bind(this)
                    var call = cc.callFunc(callFunc,this)
                    var time = this.getDuration(0.5);
                    var delay = this.spine.findAnimation('die').duration;
                    var move = cc.fadeTo(time,0);
                    var sequence = cc.sequence(cc.delayTime(delay),move,call);
                    this._tickTimeID = setTimeout(function () {
                        this._tickTimeID = null;
                        callFunc();
                    }.bind(this), (delay+time) * 1000);
                    this.node.runAction(sequence);
                }else {
                    cc.warn("不存在die动画 什么鬼")
                    this._putInPool();
                    this.fightLogic.checkGameResult(this.ownerID);
                }
                break;
            case constant.StateEnum.SKILL:
                break;
            case constant.StateEnum.RETURN:
                this.spine.setAnimation(0,'walk',true);
                break;
            case constant.StateEnum.DIZZY:
                this.spine.setAnimation(0,'std',false);
                this.spine.setToSetupPose();
                this.scheduleOnce(function(){
                    if (!this.machine.isCurStateID(constant.StateEnum.DIZZY)) return;
                    this.setSpineState(false)
                },0);//延迟一帧 让上面的骨骼动画生效

                break;
            case constant.StateEnum.WIN:
                this.node.stopAllActions();
                var action = this.spine.findAnimation('win');
                var checkID = this.ownerID === this.fightLogic.getEnemyID() ? this.fightLogic.getMineID() :this.fightLogic.getEnemyID();
                if (action) {
                    this.spine.setAnimation(0,'win',false);
                    this.spine.addAnimation(0,'std',true)
                    var duration = action.duration || 0;
                    duration = this.getDuration(duration);
                    setTimeout(function () {
                        this.fightLogic.checkGameResult(checkID);
                    }.bind(this), duration*1000);
                }else {
                    this.fightLogic.checkGameResult(checkID);
                }
                break;
        }
    },
    //变更状态机
    changeMachineState:function(state,isForce){
        if (!this.machine) return false;
        this.machine.changeState(state);
        return true;
    },

    isMachineState:function(state){
        if (!this.machine) return false;
        return this.machine.isCurStateID(state);

    },


    //**设置动画是否暂停
    setSpineState:function(isRun){
        this.spine.paused = !isRun;
        if (this.spine.paused) {
            this.node.pauseAllActions();
        }else {
            this.node.resumeAllActions();
        }
    },

    desrHpFromSand:function(damageNum){
        if(!this.isLife) return;   //死了就不用扣血了
        this.fightLogic.newFloatNum(damageNum,this.node,this.ownerID,false,false);
        this.curHp -= damageNum;
        this._fixHp(false);
        this.updateHp();
        if (this.curHp === 0) {
            this.machine.changeState(constant.StateEnum.DEAD);
            this.node.dispatchDiyEvent("showTomb",{isPlayer:this.isPlayer,pos:this.node.position,owner:this.ownerID,tid:this.tid});// NOTE: 要在节点树上发送 不然就不会发出去了
            this.putInPool();//放回水中
            this.fightLogic.checkGameResult(this.ownerID);
            // cc.log("死了e")
        }
    },

    /**
     * 造成伤害
     * @param  {int}  damageNum    伤害数值
     * @param  {ccoBj}  fromer      来源者
     * @param  {Boolean} isCanReturn 是否可以反弹
     * @param  {int}  damgeType   伤害类型
     * @param  {Boolean}  isCritAtk   是否暴击
     */
    desrHp:function(damageNum,fromer,isCanReturn,damgeType,isCritAtk){
        if (this.isImmunoState()) {//免疫buff作用中，  为什么这么判断 存在插帧行为
            if (this.getMonAbnoramlState() === constant.MonState.Heal_Immuno) {//这特么还能吸血
                this.addHp(damageNum,true);
            }
            return;//处于无敌状态 自身死亡由buff控制
        }

        var curDamage = damageNum;
        if(this.getMonAbnoramlState() === constant.MonState.CritAtk_Immuno && isCritAtk) { //免疫暴击  暴击时伤害为1点
            curDamage = 1;
        }
        this.fightLogic.newFloatNum(curDamage,this.node,this.ownerID,isCritAtk,false);
        if (this._tempShield > 0) {//存在护盾优先减少护盾
            this._tempShield -= curDamage;
            curDamage = this._tempShield > 0 ? 0 :-this._tempShield;
        }
        var nextHp = this.curHp - curDamage;
        this.setShadowHp(nextHp);
        this.curHp = nextHp;
        this._fixHp(false);
        if (this.curHp === 0) {
            if (this.isPlayer && this.ownerID === this.fightLogic.getMineID()) {
                var profession = this.userLogic.getBaseData(this.userLogic.Type.Career);
                var professionConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,profession);
                var professionPassiveSkill = professionConfig[jsonTables.CONFIG_PROFESSION.ProfessionPassiveSkill];
                if (professionPassiveSkill) {
                    if (this.passiveSkillLogic.isSkillIDExit(this,professionPassiveSkill)) {
                        this.setShadowHp(1);
                        this.curHp = 1;
                        // console.log("保证被动必定触发");
                    }
                }
            }
        }
        this.updateHp();
        if (this.curHp === 0) {
            var ext = this.passiveSkillLogic.newExtObject(curDamage,damgeType,this,fromer,tb.PASSIVE_DEAD,isCritAtk);
            this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_DEAD,ext);
            this.setShadowHp(ext.curHp);
            this.curHp = ext.curHp;
            this._fixHp(true);
            if (this.getMonAbnoramlState() === constant.MonState.Normal || this.getMonAbnoramlState() === constant.MonState.CritAtk_Immuno) {//
                if (this.curHp === 0) {
                    var ext = this.passiveSkillLogic.newExtObject(curDamage,damgeType,this,fromer,tb.PASSIVE_ENEMY_DEAD,isCritAtk);
                    this.passiveSkillLogic.checkSkillToggle(fromer,tb.PASSIVE_ENEMY_DEAD,ext);
                    var isCheck = true;
                    if (!this.isPlayer || this.isBoss()) {
                        this.machine.changeState(constant.StateEnum.WAITE);
                        this.node.dispatchDiyEvent("showTomb",{isPlayer:this.isPlayer,pos:this.node.position,owner:this.ownerID,tid:this.tid});// NOTE: 要在节点树上发送 不然就不会发出去了
                    }else {
                        if (!this.guideLogic.isInGuideFlag()) {
                            this.machine.changeState(constant.StateEnum.DEAD);
                            // isCheck = false;
                        }
                    }
                    if (this.guideLogic.isInGuideFlag() && this.isPlayer && this.guideLogic.isInStage(this.guideLogic.STATE_ENUM.NONE)) {
                        this.isLife = false;
                        this.doHitBackForGuide();// TODO: ????
                    }else {
                        this.putInPool(this.isPlayer);//放回水中
                    }
                    if (isCheck) {
                        if (this.fightLogic.isCanShowWinAction() && this.fightLogic.isNoneCountByOwner(this.ownerID)) {
                            this.fightLogic.doWinAction(this.ownerID);
                        }else {
                            this.fightLogic.checkGameResult(this.ownerID);
                        }
                    }
                    // cc.log("死了e")
                }else {//走到这里 被技能给就回来了
                    this.updateHp();
                }
            }//// TODO: 非正常状态要更新什么么？

        }else {
            var ext = this.passiveSkillLogic.newExtObject(damageNum,damgeType,this,fromer,tb.PASSIVE_HP,isCritAtk);
            if (isCanReturn && fromer && fromer.getIsLife()) {
                this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_BEATTACK_BEHIND,ext);
            }
            this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_HP,ext);
        }
    },
    /** 当前hp是否低于最大值的百分比 */
    isCurHpLowPerNum:function(per){
        per = per || 0;
        per = per / 100;
        return this.curHp/this.maxHp < per;
    },
    /** 设置百分比血量 */
    setPerHp:function(per){
        var re = Math.floor(per * this.maxHp);
        this.setShadowHp(re);
        this.curHp = re;
        if (per > 1) {
            this.maxHp = this.curHp;
        }
        this.updateHp();
    },

    /** 是否触发暴击 */
    isCritAtk:function(critAtk){
        var rand = jsonTables.randomNum(0,1000);
        return  rand <= critAtk;
    },
    addPerHp:function(per,isShowFloat){
        var hp = Math.floor(this.maxHp * per);
        this.addHp(hp,isShowFloat);
    },
    /** heal治疗数值  isShowFloat  飘字 */
    addHp:function(heal,isShowFloat){
        if (!this.isLife) return;
        var nextHp = this.curHp + heal;
        this.setShadowHp(nextHp);
        this.curHp = nextHp;
        this._fixHp(true);
        var ext = this.passiveSkillLogic.newExtObject(0,constant.DamageType.NONE,this,this,tb.PASSIVE_HP,false);
        this.passiveSkillLogic.checkSkillToggle(this,tb.PASSIVE_HP,ext);//增加时也要检查下
        this.setShadowHp(ext.curHp);
        this.curHp = ext.curHp;
        this._fixHp(true);
        if (isShowFloat) {
            this.fightLogic.newFloatNum(heal,this.node,this.ownerID,false,true);
        }
        this.updateHp();
    },
    /**
     * 修正当前血量保证血量不高于最大值或不低于最小值
     * @param  {Boolean} isAdd 是否发送增加行为
     */
    _fixHp:function(isAdd){
        var hp = 0;
        if (isAdd) {
            hp = this.curHp > this.maxHp?this.maxHp:this.curHp;
        }else {
            hp = this.curHp < 0?0:this.curHp;
        }
        this.setShadowHp(hp);
        this.curHp = hp;
    },

    addMaxHp:function(heal){
        this.maxHp += heal;
        this.setShadowHp(this.maxHp);
        this.curHp = this.maxHp;
        this.updateHp(true);
    },

    updateHp:function(noRefreshUI){
        this.hpScript.updateHp(this.curHp,this.maxHp);
        if(!noRefreshUI){
            this.shieldNum =this.isPlayer && !this.isBoss() ? 0 : this.formulaLogic.calculateShield(this.getPdBase(),this.getMdBase(),this.getCurHp(),this.familyConfig[jsonTables.CONFIG_MONSTERFAMILY.ShieldForm][this.getForm() - 1]);
            this.skillAddNum = this.skillAddNum || 0;
            this.swordNum = this.swordNum || 0;
            var newFightPower = this.shieldNum ?  this.skillAddNum + this.swordNum + this.shieldNum : 0;
            var downNum = this.fightPower - newFightPower;
            this.fightPower = newFightPower;
            this.node.dispatchDiyEvent("fightPowerChange",{owner:this.ownerID,power:downNum,isAdd:false});
            if(this.isWorldBoss()){//世界BOSS需要更新血量
                this.clientEvent.dispatchEvent("updateBossHp",this.curHp);
            }
        }
        if (this.skillIconScript) {
            this.skillIconScript.setColor(this.curHp/this.maxHp);
        }
    },
    findModule:function(){
        return this.fightLogic.findTarget(this);
    },
    /** 秒杀调用 */
    spikeDead:function(){
        this.node.dispatchDiyEvent("showTomb",{isPlayer:this.isPlayer,pos:this.node.position,owner:this.ownerID,tid:this.tid});// NOTE: 要在节点树上发送 不然就不会发出去了
        this.putInPool();
        this.fightLogic.checkGameResult(this.ownerID);
    },
    /** 移除技能icon节点 */
    removeSkillIcon:function(){
        if (this.skillIconScript) {
            var item = this.skillIconScript;
            this.skillIconScript = null;
            item.putInPool();
        }
    },

    /** isDelayPutInPool 是否等待放入对象池 *///  NOTE:外部调用一定要保证 检查游戏结果
    putInPool:function(isDelayPutInPool){
        this.maxFightPower = 0;
        this.isLife = false;
        this.isUseSencondAtk = false;//是否使用第二种攻击标识
        this.removeSkillIcon();
        if (this.fightPower > 0) {
            this.node.dispatchDiyEvent("fightPowerChange",{owner:this.ownerID,power:this.fightPower,isAdd:false});
            this.fightPower = 0;
        }
        this.clearAllBuff();
        this.endPos = null;
        this.fightLogic.release(this.ownerID,this.id,this.type);//放回水中
        // if (this.isPlayer) {
        //     this.fightLogic.release(this.ownerID,this.id,constant.MonsterType.PLAYER);
        // }
        this.msgHanderLogic.release(this.id);//向内部注销该对象
        // this.setAreanEmoj(null);
        if (!isDelayPutInPool) {
            this._putInPool();
        }
        if (this.shadowScript) {
            this.shadowScript.putInPool();
            this.shadowScript = null;
        }
        if (this.hpScript) {
            this.hpScript.putInPool();
            this.hpScript = null;
        }
        this.releasePassiveSkill();
        this.removeBindComp(true);
    },
    //释放被动技能
    releasePassiveSkill:function () {
        this.passiveSkillLogic.releaseBaseSkill(this);
    },

    _putInPool:function(){
        if (this.machine) {
            this.machine.destroySelf();
            this.machine = null;//释放状态机对象
        }
        uiResMgr.putInPool(this.node.name,this.node);
    },

    setShadow:function(){
        this.spine.node.color = uiColor.monInfo.gray;
    },

    /** 外部调用触发技能 */
    clickSkill:function(){
        if (!this.fightLogic.isDisplaying()) return false;

        if (this.useSkillCount <= 0 || jsonTables.displaySkill || jsonTables.displayingSkill) {
            return;
        }
        if (!jsonTables.isEditor) {
            jsonTables.displayingSkill = true;
        }
        this.useSkillCount--;
        this.machine.changeState(constant.StateEnum.SKILL);
        this.msgHanderLogic.newAllMsg(null,0.1,constant.MsgHanderType.SKILL_START,this);

        if (this.fightLogic.isGameType(constant.FightType.PVE)) {
            this.achievementLogic.recordAchi(constant.AchievementType.USE_SKILL,1,true);
        }

        return true;
    },

    moveDt:function(dt){
        this.moveTime -= dt;
        var addX = this.moveSpeed*(dt/this.needTime);
        this.node.x += addX;
        if (this.machine.isCurStateID(constant.StateEnum.MOVE) && !jsonTables.isSpinePlay(this.spine,"walk")) {
            this.spine.setAnimation(0,'walk',true);//
        }
        if (this.bindComp) {
            this.bindComp.addPostion(addX);
        }
        this.shadowScript.addPostion(addX);
        this.hpScript.addPostion(addX);
        if (this.skillIconScript) {
            this.skillIconScript.addPostion(addX);
        }
    },
    /** 绑定对象 */
    setBindComp:function(comp){
        if (this.bindComp) {
            this.bindComp.forceDone();
        }
        this.bindComp = comp;
    },

    removeBindComp:function(isForce){
        if (isForce && this.bindComp) {
            this.bindComp.forceDone();
        }
        this.bindComp = null;
    },
    //设置竞技场表情
    // setAreanEmoj:function(scipt,data){
    //     if (this.emojScript) {
    //         this.emojScript.init(false);
    //     }
    //     this.emojScript = scipt;
    //     if (this.emojScript) {
    //         this.emojScript.init(true,data,this);
    //     }
    // },

    update:function(dt){
        if (!this.moveFlag || !this.getIsLife()) return;
        if (!this.spineMoveFlag) return;
        if (jsonTables.displaySpeed_Stop || jsonTables.displaySkill) return;
        if (this.moveTime === 0 || !this.target || !this.target.getIsLife()) {
            this.moveFlag = false;
            this.machine.update();//如果处于行动模式 然而那货又挂掉了，那么去更新一下状态 依赖状态内部变更
        }else if (this.isCanAtk(this.target)) {//如果进入可攻击方位 开始攻击
            this.moveFlag = false;
            this.machine.changeState(constant.StateEnum.ATK);
            return;
        }

        if (this.moveTime < dt) {
            this.moveDt(this.moveTime);
        }else {
            this.moveDt(dt);
        }
    },

});
