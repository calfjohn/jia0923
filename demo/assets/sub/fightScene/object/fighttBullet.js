var panel = require("panel");

cc.Class({
    extends: panel,

    properties: {
        ani:cc.Animation,
        speed:100,
        tail:cc.Node,//拖尾子彈的尾巴
        bezierData: [cc.Vec2]
    },

    // use this for initialization
    onLoad: function () {
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.aniList = this.ani.getClips();
        if (this.aniList.length < 3) {
            cc.error("动画节点不足",this.node.name)
        }
    },

    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if (!this.isActive) return;
        switch (param.name) {
            case this.aniList[2].name:
                this.doDamage();
                break;
            case this.aniList[0].name:
                this.ani.play(this.aniList[1].name);
                this.moveFlag = true;
                if(this.config[jsonTables.CONFIG_BULLET.Type] === tb.BULLET_TRAILING && this.tail){//长拖尾类型
                    this.tail.width = 0;
                    this.tail.opacity = 255;
                }
                break;
        }
    },

    init:function(bulletId,fromer,target,damageInfo,fixPosList){
        this.isActive = true;
        this.id = 9999 + jsonTables.enumCount();
        this.msgHanderLogic.register(this.id,this);//向内部注册该对象
        this.bulletId = bulletId;
        this.config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletId);
        this.speed = this.config[jsonTables.CONFIG_BULLET.Speed];// TODO: 替换资源
        this.moveFlag = false;
        this.target = target;
        this.targetID = this.target.getID();
        this.fromer = fromer;
        this.isMine = this.fromer.getOwner() === this.fightLogic.getMineID();
        this.damageInfo = damageInfo;
        this.node.setPosition(this.config[jsonTables.CONFIG_BULLET.Type] === tb.BULLET_TARGET ? target.getPosition() : fromer.getPosition());

        var x = fixPosList[0] || 0;
        var y = fixPosList[1] || 0;

        this.node.scale = this.config[jsonTables.CONFIG_BULLET.Scaling]/100;
        var scaleX = (this.fromer.node.x - this.target.node.x) > 0 ? -1 :1;
        this.node.scaleX = scaleX * Math.abs(this.node.scaleX);
        this.doRotation();
        this.speed = scaleX * Math.abs(this.speed);
        if(this.config[jsonTables.CONFIG_BULLET.Type] === tb.BULLET_TARGET){//直接作用于目標
            this.node.x += (x * scaleX);
            this.node.y += y;
            this.ani.play(this.aniList[2].name);
        }else{
            this.node.x += (x * scaleX);
            this.node.y += y;
            this.offY = (this.target.node.y + this.target.getBulletFixPos() - this.node.y);
            this.offX = (this.target.node.x - this.node.x);
            this.constOffx = Math.abs(this.fromer.node.x - this.target.node.x);
            this.count = 0;
            this.offYTime = this.constOffx /(Math.abs(this.target.getMoveSpeed()) +  Math.abs(this.speed));
            this.ani.play(this.aniList[0].name);
        }
    },

    setMoveAction:function(startPos,endPos,cb,bulletID, isBezier){//设置子弹移动
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.BULLET,bulletID);
        var speed = config[jsonTables.CONFIG_BULLET.Speed] || 1000;
        this.node.scale = config[jsonTables.CONFIG_BULLET.Scaling]/100;
        this.node.position = startPos;
        var acitonList = [];
        for (var i = 0 , len = this.aniList.length; i <  len; i++) {
            var obj = this.aniList[i];
            var playAni = cc.callFunc(function(scrip,idx){
                this.ani.play(this.aniList[idx].name);
            },this,i)
            acitonList.push(playAni);
            if (i === 1) {
                var time = kf.pDistance(startPos,endPos)/speed;
                var move;
                if(isBezier) {
                    var bezierData = kf.clone(this.bezierData);
                    for (var j = 0; j < bezierData.length; j++) {
                        var obj1 = bezierData[j];
                        obj1.x = this.node.x;
                    }
                    bezierData.push(endPos);
                    move = cc.bezierTo(time,bezierData);
                }
                else {
                    move = cc.moveTo(time,endPos);
                }
                acitonList.push(move);
            }else {
                var delay = cc.delayTime(this.aniList[i].duration);
                acitonList.push(delay);
            }
        }
        var call = cc.callFunc(function(){
            if (cb) cb(this);
            this.forcePut();
        },this)
        acitonList.push(call);
        var seq = cc.sequence(acitonList);
        this.node.runAction(seq);
        var angle = kf.calculateAngleTwoPointRotation(startPos,endPos);
        this.node.rotation = angle;
    },

    onMessage:function(msg,sender){
        if (msg.msgType === constant.MsgHanderType.WAITE_WAVE) {
            this.forcePut();
        }else if (msg.msgType === constant.MsgHanderType.REMOVE_BULLET) {
            if (msg.extMsg.target.getID() === this.targetID) {
                this.forcePut();
            }
        }
    },

    forcePut(){
        this.node.stopAllActions();
        this.msgHanderLogic.release(this.id,this);//向内部注册该对象
        this.ani.stop();
        this.moveFlag = false;
        this.isActive = false;
        uiResMgr.putInPool(this.node.name,this.node);
    },

    doDamage:function(){
        if (this.fightLogic.isDisplaying() && this.target && this.target.getIsLife() && this.fromer && this.fromer.getIsLife() && this.targetID === this.target.getID()) {
            var ext = this.passiveSkillLogic.newExtObject(0,constant.DamageType.FAR,this.target,this.fromer,tb.PASSIVE_ATTACK_PRE,false);
            ext.damageInfo.damageBase = this.damageInfo.damageBase;
            ext.damageInfo.psBase = this.damageInfo.psBase;
            ext.damageInfo.msBase = this.damageInfo.msBase;
            ext.damageInfo.pdBase = this.damageInfo.pdBase;
            ext.damageInfo.mdBase = this.damageInfo.mdBase;
            this.passiveSkillLogic.checkSkillToggle(this.fromer,tb.PASSIVE_ATTACK_PRE,ext);
            var damage = this.formulaLogic.calculateDamage(ext.damageInfo.damageBase,ext.damageInfo.psBase,ext.damageInfo.msBase,ext.damageInfo.pdBase,ext.damageInfo.mdBase,this.damageInfo.mineForm,this.damageInfo.target);
            damage = this.fromer.damageBuffAdd(damage,constant.DamageType.FAR,this.target);
            damage = this.target.damageBuffDesr(damage,constant.DamageType.FAR,this.fromer);
            if(damage >= 100000){ //单次攻击最大伤害
                damage = 2;
            }
            var isCritAtk = false;
            if (this.fromer.isCritAtk(ext.critAtk)) {
                damage = damage * 2;//暴击了
                isCritAtk = true;
            }
            if (!ext.isDamageContinue) return;//伤害被打断了
            if (jsonTables.showFightLog) {
                try {
                    var str = "普通攻击发起者{0}对{1}造成了："+damage;
                    this.fightLogic.showLog(this.fromer.getID(),this.target.getID(),str);
                } catch (e) {
                    console.error(e);
                }
            }

            this.target.desrHp(damage,this.fromer,true,constant.DamageType.FAR,isCritAtk);//TODO 以后这要根据类不同生成不一样的攻击对象
            var ext = this.passiveSkillLogic.newExtObject(damage,constant.DamageType.FAR,this.target,this.fromer,tb.PASSIVE_ATTACK_BEHIND,isCritAtk);
            this.passiveSkillLogic.checkSkillToggle(this.fromer,tb.PASSIVE_ATTACK_BEHIND,ext);
        }
        this.forcePut();
    },

    doDamageAni:function(){
        this.moveFlag = false;
        this.ani.play(this.aniList[2].name)
    },

    doRotation:function(){
        if (this.config[jsonTables.CONFIG_BULLET.Rotate]) {
            var angle = kf.calculateAngleTwoPointRotation(this.node.position,this.target.getPosition());
            if (this.node.scaleX < 0) {
                angle -= 180;
            }

            this.node.rotation = angle;
        }else {
            this.node.rotation = 0;
        }
    },

    getActionSpeed:function(){
        return jsonTables.displaySpeed_CurSpeed;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.moveFlag || jsonTables.displaySkill || jsonTables.displaySpeed_Stop) return;

        if (!this.fightLogic.isDisplaying() || this.targetID !== this.target.getID() || !this.target.getIsLife()) {
            this.forcePut();
            return;
        }
        if (this.isMine) {
            if (this.node.x >= this.target.node.x) {
                this.doDamageAni();
                return;
            }
        }else {
            if (this.node.x <= this.target.node.x) {
                this.doDamageAni();
                return;
            }
        }
        var offsetX = dt * this.speed * this.getActionSpeed();
        this.node.x +=offsetX;
        if(this.config[jsonTables.CONFIG_BULLET.Type] === tb.BULLET_TRAILING && this.tail){//长拖尾类型
            this.tail.width += Math.abs(offsetX * 1);
        }
        if (Math.abs(this.offY) > 2 || (this.offX * (this.target.node.x - this.node.x)  < 0)) {
            var offY = dt/this.offYTime  * this.offY;
            this.offY -= offY;
            this.node.y += offY;
        }

        if (this.node.x > 1000 || this.node.x < -1000) {
            this.forcePut();
        }

        // if (this.count === 3) {
        //     this.count = 0;
        //     this.doRotation();
        // }else {
        //     this.count ++;
        // }
    }
});
