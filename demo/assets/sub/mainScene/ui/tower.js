var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        towerBase:cc.Node,
        towerTop:cc.Node,
        towerItem:cc.Prefab,
        earth:cc.Node,
        towerOffset: {
            default: -100,
            tooltip: "塔高度与中心的偏移量"
        },
        earthDisHeight: {
            default: 2000,
            tooltip: "当高度为这个值时，地球正好看不见"
        },
        downTime: {
            default: 0.5,
            tooltip: "惯性时间"
        },
        speedTimes: {
            default: 4,
            tooltip: "惯性速度下降倍速"
        },
        checkY:{
            default: 10,
            tooltip: "位移小于多少判定为点击塔"
        },
        sensitivity:{
            default: 20,
            tooltip: "增加移动塔的灵敏度，百分比"
        },
        backTime:{
            default: 0.5,
            tooltip: "自动回滚回塔的系数"
        },
        addHeight:{
            default: 500,
            tooltip: "最大高度比当前塔高多少"
        },
    },
    onLoad:function () {
        this.earthDis = -0.46;//地球消失时的offsetY值，不可修改，这个值需要在编辑器中调试确定
        this.earthDistortion = this.earth.getComponent("spriteDistrotion");
        this.basePos = this.towerBase.position;//塔基的初始坐标
        this.towerTopHeight = this.towerTop.height;//塔顶的高度
        this.towerBaseHeight = this.towerBase.height;//塔底座的高度
        // this.towerBaseJS = this.towerBase.getComponent("towerItem");
        this.towerTop.setLocalZOrderEx(0);//设置塔顶的层级最低
        this.towerBase.setLocalZOrderEx(10000);//塔基得层级最高
        var prefab = uiResMgr.getResource(uiResMgr.RTYPE.MAIN_PREFAB,"towerItem");
        if (!prefab) {
            prefab = this.towerItem;
        }
        this.towerHeight = prefab.data.height;//一截塔的高度
        for (var i = 0; i < 5; i++) {//初始化设置五截塔用于循环使用
            this["tower" + i] = cc.instantiate(prefab);
            // this["tower" + i] = uiResMgr.getResource(uiResMgr.RTYPE.MAIN_PREFAB,"towerItem");
            if(!this.towerHeight){
                this.towerHeight = this["tower" + i].height;//一截塔的高度
            }
            this["tower" + i].parent = this.node;
            this["towerJS"+i] = this["tower" + i].getComponent("towerItem");
        }
        this.towerPosY = (this.towerHeight / 2) + this.towerBaseHeight - (750 / 2);
        this.registerEvent();
        this.downEnable = false;//惯性控制
        this.moveSpeedDown = 0;//惯性每秒速度下降多少
    },
    start:function () {
        this.maxChapter = this.chapterLogic.getMaxChapter();//最大章节
        this.earthDisHeight = this.maxChapter * 320;
        this.earthTimes = this.earthDis/this.earthDisHeight;//高度每上升1，offsety应该修改的值
        // this.maxChapter = 4;
        this.maxHeight = this.towerHeight * (this.maxChapter - 1 + 0.5) + this.towerBaseHeight - 375;//屏幕显示高度为750，最高高度就是指最高的一层位置移动到Y = 0的位置
        this.offset = 0;//当前偏移量
        this.height = 0;//当前高度，最初始高度为0
        this.init();
    },
    init:function(){
        this.nowChapter = this.chapterLogic.getCurMaxChapterID();//当前章节
        this.nowChapter = this.nowChapter > this.maxChapter ? this.maxChapter : this.nowChapter;
        // this.nowChapter = 5
        // this.maxChapter = 5
        this.refreshUI();
    },
    registerEvent: function () {
        var registerHandler = [
            ["showMainScene", this.init.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickChapter", this.clickChapter.bind(this)],
            ["touchstart", this.touchstart.bind(this)],
            ["touchmove", this.touchmove.bind(this)],
            ["touchend", this.touchend.bind(this)],
            ["touchcancel", this.touchcancel.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
    },
    refreshUI:function(){
        this.nowHeight = this.nowChapter <= 1 ? 0:((this.towerHeight / 2) + this.towerBaseHeight - (750 / 2)) + (this.nowChapter - 1) * this.towerHeight + this.towerOffset;//如果在第一关，当前高度为0
        var towerOffset = this.nowChapter <= 1 ? 0:this.towerOffset;
        this.height  = this.nowHeight;
        this.nowMaxHeight = this.nowHeight + this.addHeight > this.maxHeight?this.maxHeight:this.nowHeight + this.addHeight;
        this.earthDistortion.offset = cc.v2(0,-this.height * this.earthTimes)
        // this.earth.active = false;
        // this.earth.active = this.height <= this.earthDisHeight;
        this.towerBase.y = -this.height + this.basePos.y;
        this.towerTop.active = false;
        // this.towerBaseJS.init(1,this.nowChapter);

        var playSpecial = this.chapterLogic.getIsPlaySpecial();//是否播放通关动画
        if(this.userLogic.isFiveStarOpen() && playSpecial && this.nowChapter === jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.FiveStarPage) + 1){//说明是第一次通关第四关，需要五星好评提示
            uiManager.openUI(uiManager.UIID.FIVE_STAR);
        }
        if(this.nowChapter <= 1){
            this.offset = this.towerPosY;
            this.baseData = [];
            var baseChapter = -1;
            for (var i = 0; i < 5; i++) {
                this["tower"+i].active = true;
                let data = {};
                if(i === 0){
                    this["tower"+i].y =this.towerPosY - this.towerHeight * 2  - towerOffset;
                    data.chapter = baseChapter;
                    this["towerJS" + i].init(data.chapter,this.nowChapter,playSpecial);
                    data.node = this["tower"+i];
                    data.script = this["towerJS" + i];
                }else{
                    this["tower"+i].y =this.baseData[i - 1].node.y + this.towerHeight;
                    data.chapter = this.baseData[i - 1].chapter + 1;
                    this["towerJS" + i].init(data.chapter,this.nowChapter,playSpecial);
                    data.node = this["tower"+i];
                    data.script = this["towerJS" + i];
                }
                data.node.active = data.chapter >= 1 && data.chapter <= this.maxChapter;
                this.baseData.push(data);
                this["tower"+i].setLocalZOrderEx(1000-this["tower"+i].y);
            }
        }else{
            this.offset = 0;
            this.baseData = [];
            var baseChapter = this.nowChapter - 2;
            for (var i = 0; i < 5; i++) {
                let data = {};
                if(i === 0){
                    this["tower"+i].y =-this.towerHeight * 2 - towerOffset;
                    data.chapter = baseChapter;
                    this["towerJS" + i].init(data.chapter,this.nowChapter,playSpecial);
                    data.node = this["tower"+i];
                    data.script = this["towerJS" + i];
                }else{
                    this["tower"+i].y =this.baseData[i - 1].node.y + this.towerHeight;
                    data.chapter = this.baseData[i - 1].chapter + 1;
                    this["towerJS" + i].init(data.chapter,this.nowChapter,playSpecial);
                    data.node = this["tower"+i];
                    data.script = this["towerJS" + i];
                }
                data.node.active = data.chapter >= 1 && data.chapter <= this.maxChapter;
                this.baseData.push(data);
                if(data.chapter === this.maxChapter + 1 && !this.towerTop.active){
                    this.towerTop.active = true;
                    this.towerTop.y = data.node.y + (this.towerTopHeight - this.towerHeight) / 2;
                }
                this["tower"+i].setLocalZOrderEx(1000-this["tower"+i].y);
            }
        }
        if(this.maxChapter === this.nowChapter){
            this.move(0);//如果时最高层得话需要修正位置
        };
        // if(this.height <= this.towerBaseHeight){//看得到塔基
        //     this.baseData[0].node.active = false;
        // }else{//看不到
        //
        // }
    },
    touchstart:function(event){
        event.stopPropagation();
        this.startPos = event.getLocation();
        for (var i = 0 , len = this.baseData.length; i < len; i++) {
            var obj = this.baseData[i];
            obj.script.clickPosStart(this.startPos);
        }
        // this.towerBase.getComponent("towerItem").clickPosStart(this.startPos);
    },
    touchmove:function(event){
        event.stopPropagation();
        this.downEnable = false;
        // console.log(event.touch);
        // console.log(new Date().getTime());
        var nowTime = new Date().getTime()/1000;
        var offsetTime  = 0.016;
        if(this.lastTime){
            offsetTime = nowTime - this.lastTime;
            this.lastTime = nowTime;
        }
        var pos = event.getLocation();
        var prePos = event.getPreviousLocation();
        var offsetY = (pos.y - prePos.y) * (this.sensitivity + 100) / 100;
        // console.log("offsetTime      :"+offsetTime);
        this.moveSpeed =offsetY/offsetTime/this.speedTimes;
        this.symbol = this.moveSpeed > 0?1:-1;//速度符号位
        this.moveSpeedDown =Math.abs(this.moveSpeed/this.downTime);//惯性每秒速度下降多少
        // console.log("speed      :"+this.moveSpeed);
        // console.log("moveSpeedDown      :"+this.moveSpeedDown);
        this.move(offsetY);
    },
    touchend:function(event){
        event.stopPropagation();
        this.downEnable = true;
        var pos = event.getLocation();
        var checkClick = (this.startPos.y - pos.y) > -this.checkY && (this.startPos.y - pos.y) < this.checkY;
        for (var i = 0 , len = this.baseData.length; i < len; i++) {
            var obj = this.baseData[i];
            if(checkClick){
                obj.script.clickPosEnd(pos);
            }else{
                obj.script.clickcancel();
            }
        }
        this.backToNow();
        // if(checkClick){
        //     this.towerBase.getComponent("towerItem").clickPosEnd(pos);
        // }else{
        //     this.towerBase.getComponent("towerItem").clickcancel();
        // }
    },
    touchcancel:function(event){
        event.stopPropagation();
        this.downEnable = true;
        for (var i = 0 , len = this.baseData.length; i < len; i++) {
            var obj = this.baseData[i];
            obj.script.clickcancel();
        }
        this.backToNow();
        // this.towerBase.getComponent("towerItem").clickcancel();
    },
    towerDown:function(){
        var data = this.baseData.pop();
        data.node.y = this.baseData[0].node.y - this.towerHeight;
        data.chapter = this.baseData[0].chapter - 1;
        data.script.init(data.chapter,this.nowChapter);
        data.node.active = data.chapter >= 1 && data.chapter <= this.maxChapter;
        this.baseData.splice(0,0,data);
    },
    towerUp:function(){
        var data = this.baseData.shift();
        data.node.y = this.baseData[this.baseData.length - 1].node.y + this.towerHeight;
        data.chapter = this.baseData[this.baseData.length - 1].chapter + 1;
        data.script.init(data.chapter,this.nowChapter);
        data.node.active = data.chapter >= 1 && data.chapter <= this.maxChapter;
        this.baseData.push(data);
        if(data.chapter === this.maxChapter + 1 && !this.towerTop.active){
            this.towerTop.active = true;
            this.towerTop.y = data.node.y + (this.towerTopHeight - this.towerHeight) / 2;
        }
    },
    move:function(offsetY){
        if(this.guideLogic.isInGuideFlag())    return;
        if(Math.abs(offsetY) > 100) return;//保护一下
        if(this.height - offsetY < 0){
            offsetY = this.height;
            this.height = 0;
        }else if(this.height - offsetY > this.nowMaxHeight){
            offsetY = this.height - this.nowMaxHeight;
            this.height = this.nowMaxHeight;
        }else{
            this.height -= offsetY;
        }
        this.earthDistortion.offset = cc.v2(0, -this.height * this.earthTimes);
        // this.earth.active = false;
        // this.earth.active = this.height <= this.earthDisHeight;
        // console.log("len:"+ offsetY);
        // console.log("this.height:"+this.height+"offsetY:"+offsetY + "|||off:"+this.earthDistortion.offset);
        this.moveAll(offsetY);
        this.offset += offsetY;
        if(this.offset > this.towerHeight * 0.5){
            this.towerDown();//最上面的塔移动到下面
            this.offset -= this.towerHeight;
        }else if(this.offset < -this.towerHeight * 0.5){
            this.towerUp();//最下面的塔移动到上面
            this.offset += this.towerHeight;
        }
    },
    moveAll:function(offset){
        this.towerBase.y += offset;
        this.towerTop.y += offset;
        for (var i = 0 , len = this.baseData.length; i < len; i++) {
            var obj = this.baseData[i];
            obj.node.y += offset;
            obj.node.setLocalZOrderEx(1000-obj.node.y);
        }
    },



    clickChapter:function(event){
        event.stopPropagation();
        var chapter = event.getUserData();
        if(chapter > this.chapterLogic.getMaxChapter()){
            var errorcode = uiLang.getMessage(this.node.name,"errorcode");
            uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
            return;
        }
        if(!this.chapterLogic.isUnLockTower(chapter)){
            var errorcode = uiLang.getMessage(this.node.name,"errorcode2");
            uiManager.openUI(uiManager.UIID.TIPMSG, errorcode);
            return;
        }
        if (!jsonTables.isLineUpVaild()) return;

        var maxID = this.chapterLogic.getCurMaxChapterID();
        if (chapter !== maxID && maxID !== 0) {
            var list = this.chapterLogic.getCurChapterId();
            var extID = 0;
            for (var i = 0 , len = list.length; i < len; i++) {
                var obj = list[i];
                if (obj !== maxID) {
                    extID = obj;
                    break;
                }
            }
            if (extID !== 0 && chapter !== extID) {
                var msg = uiLang.getMessage(this.node.name,"reset");
                var callback = function(){
                    this.chapterLogic.req_ChapterBattleReset(extID);
                    uiManager.openChapter(chapter);
                    window.adjustUtil.recored(tb.ADJUST_RECORED_START_CHAPTER, chapter);
                };
                uiManager.msgDefault(msg.formatArray([extID]),callback.bind(this));
                return;
            }
        }
        if (this.treasureLogic.isBoxMax()) {
            var msg = uiLang.getMessage(this.node.name,"fullBox");
            var callback = function(){
                uiManager.openChapter(chapter);
                window.adjustUtil.recored(tb.ADJUST_RECORED_START_CHAPTER, chapter);
            };
            uiManager.msgDefault(msg,callback.bind(this));
            return;
        }
        uiManager.openChapter(chapter);
        window.adjustUtil.recored(tb.ADJUST_RECORED_START_CHAPTER, chapter);
    },


    openUi:function(_,param){
        uiManager.openUI(Number(param));
    },
    //自动回滚回当前高度
    backToNow:function(){
        if(this.height <= this.nowHeight)   return;
        var len = this.height - this.nowHeight;
        this.moveSpeed = len / this.backTime;
        this.symbol = this.moveSpeed > 0?1:-1;//速度符号位
        var downTime = len / this.addHeight * this.downTime;
        this.moveSpeedDown = Math.abs(this.moveSpeed/downTime);//惯性每秒速度下降多少
        this.downEnable = true;
    },
    update :function(dt) {
        if (!this.downEnable)   return;
        if(!this.moveSpeed) return;
        if(Math.abs(this.moveSpeed) <= this.moveSpeedDown * dt){
            var downLen = -Math.abs(this.moveSpeed*this.moveSpeed)/(2 * this.moveSpeedDown);//x= vt^2-v0^2/2a
            this.moveSpeed = 0;
            this.downEnable = false;
        }else{
            var downLen = Math.abs(this.moveSpeed) * dt + 0.5 * this.moveSpeedDown * dt * dt;//x= v0 *t+0.5*a*t^2
            this.moveSpeed =this.symbol * (Math.abs(this.moveSpeed) - this.moveSpeedDown * dt);
        }

        if(this.symbol && this.height > this.nowHeight && (this.height - downLen) <= this.nowHeight){//向下滚
            downLen = this.nowHeight - this.nowHeight;
            this.moveSpeed = 0;
            this.downEnable = false;
            this.backToNow();
        }else if(!this.symbol && this.height < this.nowHeight && (this.height + downLen) >= this.nowHeight){//向上滚
            downLen = this.nowHeight - this.height;
            this.moveSpeed = 0;
            this.downEnable = false;
        }
        this.move(this.symbol*downLen);
    },
});
