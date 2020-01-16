var panel = require("panel");

cc.Class({
    extends: panel,
    properties: {
        linePrefab:cc.Prefab,
        iconPrefab:cc.Prefab,
        bgPrefab:cc.Prefab,
        labelPrefab:cc.Prefab,
        btnUpSp:[cc.SpriteFrame],
        togSp:[cc.SpriteFrame],
        leftAni:cc.Animation,
        leftSpine:sp.Skeleton,
        rightAni:cc.Animation,
        rightSpine:sp.Skeleton,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function(){
        jsonTables.parsePrefab(this);
        this.registerEvent();
        this.firstProfession = 1;
        this.leftAni.on(constant.AnimationState.FINISHED, this.onLeftFinished, this);
        this.rightAni.on(constant.AnimationState.FINISHED, this.onRightFinished, this);
    },

    onLeftFinished:function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        uiManager.setRootBlockActive(false);
        if(param.name === "toBig"){
            this.leftSpine.paused = false;
            this.leftSpine.setAnimation(0,'atk',false);
            this.leftSpine.addAnimation(0,'std',true);
        }
    },
    onRightFinished:function (event,param) {
        if (event !== constant.AnimationState.FINISHED && param.name !== "listItemOpen") return;
        uiManager.setRootBlockActive(false);
        if(param.name === "toBig"){
            this.rightSpine.paused = false;
            this.rightSpine.setAnimation(0,'atk',false);
            this.rightSpine.addAnimation(0,'std',true);
        }
    },
    open:function(){
        if(this.professionStatus === undefined){
            this.professionStatus = 0;
        }
        this.refreshTalent();
    },

    registerEvent: function () {
        var registerHandler = [
            ["refreshTalent", this.refreshTalent.bind(this)],
            ["talentUpSuccess", this.talentUpSuccess.bind(this)],
            ["playerLvUp", this.playerLvUp.bind(this)],
            ["updateBtn", this.updateBtn.bind(this)],
        ]
        this.registerClientEvent(registerHandler);
        var registerHandler = [
            ["clickItem", this.clickItem.bind(this)],
        ]
        this.registerNodeEvent(registerHandler);
},
    refreshTalent:function(){
        this.myProfession = this.userLogic.getBaseData(this.userLogic.Type.Career);
        this.myConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,this.myProfession);
        this.myProLv = this.myConfig[jsonTables.CONFIG_PROFESSION.ProLv];
        this.refreshToggle();
        this.refreshTalentNum();
        if(this.professionStatus !== undefined){
            this.widget("talentPanel/shrink/toggleContainer/toggle" + this.professionStatus + "/background").getComponent(cc.Sprite).spriteFrame = this.togSp[1];
        }
        this.widget("talentPanel/shrink/toggleContainer/toggle" + this.myProLv + "/background").getComponent(cc.Sprite).spriteFrame = this.togSp[0];
        this.professionStatus = this.myProLv;
        this.refreshCareer(this.myProfession);
    },
    playerLvUp:function(){
        this.refreshToggle();
        this.refreshTalentNum();
    },
    //天赋升级成功
    talentUpSuccess:function(param){
        var config =  jsonTables.getJsonTableObj(jsonTables.TABLE.TALENT,param.ID);
        if(this.lastNode){
            this.lastNode.getComponent("talentItem").updateLv(param.Lv);
        }
        this.refreshIntro(config, param.Lv, this.status);
        this.refreshTalentNum();
    },
    //刷新我的天赋点数
    refreshTalentNum:function(){
        this.myPoint = this.userLogic.getBaseData(this.userLogic.Type.TalentPoint);
        this.allPoint = (this.userLogic.getBaseData(this.userLogic.Type.Lv) - 1) * jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.TalentPoint);
        var idx = this.myPoint !== this.allPoint || this.myProfession !== this.firstProfession?0:1;
        this.widget("talentPanel/shrink/talentNumber/btn").getComponent(cc.Button).interactable = !idx;
        // this.widget("talentPanel/shrink/talentNumber/btn").getComponent(cc.Sprite).spriteFrame = this.btnResetSp[idx];
        this.widget("talentPanel/shrink/talentNumber/allLabel").getComponent(cc.Label).string = this.myPoint + "/" + this.allPoint;
    },
    //刷新所有职业天赋树
    // refreshTree:function(){
    //     this.lastChooseID = undefined;
    //     this.status = constant.TalentIconType.TREE;
    //     this.widget("talentPanel/shrink/talentTree").active = true;
    //     if(!this.treeData){
    //         this.treeData = jsonTables.getJsonTable(jsonTables.TABLE.TALENT);
    //     }
    //     this.refreshIconLine(this.treeData,constant.TalentIconType.TREE);
    //     this.widget("talentPanel/shrink/talentTree/taFrame2").active = false;
    //     this.widget("talentPanel/shrink/talentTree/taFclose").active = false;
    // },

    refreshIconLine:function(list,type){
        var lineData = [];
        var iconData =[];
        var posType = type === constant.TalentIconType.TREE?jsonTables.CONFIG_TALENT.MainPos:jsonTables.CONFIG_TALENT.MiniPos;
        var bgContent = type === constant.TalentIconType.TREE?this.widget("talentPanel/shrink/talentTree/bgContent"):this.widget("talentPanel/shrink/talent/bgContent");
        var iconContent = type === constant.TalentIconType.TREE?this.widget("talentPanel/shrink/talentTree/iconContent"):this.widget("talentPanel/shrink/talent/iconContent");
        var lineContent = type === constant.TalentIconType.TREE?this.widget("talentPanel/shrink/talentTree/lineContent"):this.widget("talentPanel/shrink/talent/lineContent");
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            var iconInfo = {
                type:type,
                data:obj
            }
            iconData.push(iconInfo);
            if(!obj[jsonTables.CONFIG_TALENT.Pre][0])   continue;
            for (var j = 0; j < obj[jsonTables.CONFIG_TALENT.Pre].length; j++) {
                var str = obj[jsonTables.CONFIG_TALENT.Pre][j];
                var arr = str.split("#");
                var preConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENT,parseInt(arr[0]));
                if(this.status === constant.TalentIconType.DETAIL && preConfig[jsonTables.CONFIG_TALENT.Profession] !== obj[jsonTables.CONFIG_TALENT.Profession])   continue;
                var lineInfo ={
                    startPos:cc.v2(obj[posType][0],obj[posType][1]),
                    endPos:cc.v2(preConfig[posType][0],preConfig[posType][1]),
                    talentID:obj[jsonTables.CONFIG_TALENT.Tid],
                    targetID:parseInt(arr[0])
                }
                lineData.push(lineInfo);
            }
        }
        //刷新天赋点
        var refreshData = {
            content:iconContent,
            list:iconData,
            prefab:this.iconPrefab
        }
        uiManager.refreshView(refreshData);
        //刷新天赋点背景
        refreshData = {
            content:bgContent,
            list:iconData,
            prefab:this.bgPrefab
        }
        uiManager.refreshView(refreshData);
        //刷新天赋线
        refreshData = {
            content:lineContent,
            list:lineData,
            prefab:this.linePrefab
        }
        uiManager.refreshView(refreshData);
    },
    //刷新左边按钮
    refreshToggle:function(){
        this.toggleStatus = [];
        var firstConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,this.firstProfession);
        this.widget("talentPanel/shrink/toggleContainer/toggle0/label").getComponent(cc.Label).string = uiLang.getConfigTxt(firstConfig[jsonTables.CONFIG_PROFESSION.NameId]);
        var lv = this.userLogic.getBaseData(this.userLogic.Type.Lv);
        this.toggleStatus.push(constant.CareerStatus.UNLOCK);
        var secondConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,firstConfig[jsonTables.CONFIG_PROFESSION.ChangeDirection][0]);//随便一个一转职业，只是需要里面的等级信息
        var secondNeedLv = secondConfig[jsonTables.CONFIG_PROFESSION.Lv];
        //设置第二个按钮
        // this.widget("talentPanel/bg/toggleContainer/toggle1").getComponent(cc.Toggle).interactable = lv >= secondNeedLv;
        var secondStatus = lv >= secondNeedLv? constant.CareerStatus.UNLOCK:constant.CareerStatus.LVLOCK;
        this.toggleStatus.push(secondStatus);
        if(secondStatus === constant.CareerStatus.LVLOCK){
            this.widget("talentPanel/shrink/choice/errorLabel").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"lock").formatArray([secondNeedLv]);
        }
        var str = "";
        if( this.myConfig[jsonTables.CONFIG_PROFESSION.ProLv] === 0){
            str = uiLang.getMessage(this.node.name,"second");
        }else if(this.myConfig[jsonTables.CONFIG_PROFESSION.ProLv] === 1){
            str = uiLang.getConfigTxt(this.myConfig[jsonTables.CONFIG_PROFESSION.NameId]);
        }else{//现在是第三级了。需要取前置
            var lastConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,this.myConfig[jsonTables.CONFIG_PROFESSION.Pre]);
            str = uiLang.getConfigTxt(lastConfig[jsonTables.CONFIG_PROFESSION.NameId]);
        }
        this.widget("talentPanel/shrink/toggleContainer/toggle1/label").getComponent(cc.Label).string = str;
        //设置第三个按钮
        var thirdNeedLv = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,secondConfig[jsonTables.CONFIG_PROFESSION.ChangeDirection][0])[jsonTables.CONFIG_PROFESSION.Lv];
        // this.widget("talentPanel/shrink/toggleContainer/toggle2").getComponent(cc.Toggle).interactable = lv >= thirdNeedLv && this.myProfession !== this.firstProfession;
        var thirdStatus = constant.CareerStatus.UNLOCK;
        if(this.myProfession === this.firstProfession){
            thirdStatus = constant.CareerStatus.PROLOCK;
        }else if(lv < thirdNeedLv){
            thirdStatus = constant.CareerStatus.LVLOCK;
            this.widget("talentPanel/shrink/choice/errorLabel").getComponent(cc.Label).string = uiLang.getMessage(this.node.name,"lock").formatArray([thirdNeedLv]);
        }
        this.widget("talentPanel/shrink/toggleContainer/toggle2/background").getComponent(cc.Sprite).spriteFrame = thirdStatus === constant.CareerStatus.PROLOCK ? this.togSp[2] : this.togSp[1];
        // this.widget("talentPanel/shrink/toggleContainer/toggle2/gray").active = thirdStatus !== constant.CareerStatus.UNLOCK;
        this.toggleStatus.push(thirdStatus);
        this.widget("talentPanel/shrink/toggleContainer/toggle2/label").getComponent(cc.Label).string = this.myConfig[jsonTables.CONFIG_PROFESSION.ProLv] > this.firstProfession ?
            uiLang.getConfigTxt(this.myConfig[jsonTables.CONFIG_PROFESSION.NameId]) : uiLang.getMessage(this.node.name,"third");
    },

    clickToggle:function(event,param){
        var num = parseInt(param);
        if(num === this.professionStatus)   return;
        if(this.toggleStatus[num] === constant.CareerStatus.PROLOCK){
            uiManager.openUI(uiManager.UIID.TIPMSG,uiLang.getMessage(this.node.name,"proLock"));
            return;
        }
        //接下来的都是已经解锁的
        this.widget("talentPanel/shrink/toggleContainer/toggle" + this.professionStatus + "/background").getComponent(cc.Sprite).spriteFrame = this.togSp[1];
        this.professionStatus = num;
        this.widget("talentPanel/shrink/toggleContainer/toggle" + this.professionStatus + "/background").getComponent(cc.Sprite).spriteFrame = this.togSp[0];
        if(num === 0){//第一个冒险者，直接刷
            this.refreshCareer(this.firstProfession);
        }else if(this.myConfig[jsonTables.CONFIG_PROFESSION.ProLv] < num){//点击的职业等级大于自己目前的职业等级，说明可以转职
            var isLock = this.toggleStatus[num] === constant.CareerStatus.LVLOCK;
            this.refreshUp(isLock);
        }else if(this.myConfig[jsonTables.CONFIG_PROFESSION.ProLv] === 2 && num === 1){//特殊情况，我三级职业了，他点击我二级职业
            this.refreshCareer(this.myConfig[jsonTables.CONFIG_PROFESSION.Pre]);
        }else{//剩下的都是刷新本职业
            this.refreshCareer(this.myProfession);
        }
    },

    refreshUp:function(isLock){
        this.widget("talentPanel/shrink/talentNumber").active = false;
        this.widget("talentPanel/shrink/talentUpgrade").active = false;
        this.widget("talentPanel/shrink/choice").active= true;
        this.widget("talentPanel/shrink/talent").active = false;
        this.widget("talentPanel/shrink/taFrame2").active = false;
        var leftPro = this.myConfig[jsonTables.CONFIG_PROFESSION.ChangeDirection][0];
        var leftConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,leftPro);
        var rightPro = this.myConfig[jsonTables.CONFIG_PROFESSION.ChangeDirection][1];
        var rightConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,rightPro);
        this.widget("talentPanel/shrink/choice/chose0/name").getComponent(cc.Label).string =  uiLang.getConfigTxt(leftConfig[jsonTables.CONFIG_PROFESSION.NameId]);
        this.widget("talentPanel/shrink/choice/chose0/label").getComponent(cc.Label).string =  uiLang.getConfigTxt(leftConfig[jsonTables.CONFIG_PROFESSION.Des]);
        this.widget("talentPanel/shrink/choice/chose1/name").getComponent(cc.Label).string =  uiLang.getConfigTxt(rightConfig[jsonTables.CONFIG_PROFESSION.NameId]);
        this.widget("talentPanel/shrink/choice/chose1/label").getComponent(cc.Label).string =  uiLang.getConfigTxt(rightConfig[jsonTables.CONFIG_PROFESSION.Des]);
        uiResMgr.loadProfessionIcon(leftConfig[jsonTables.CONFIG_PROFESSION.IconResource],this.widget("talentPanel/shrink/choice/chose0/replace"));
        uiResMgr.loadProfessionIcon(rightConfig[jsonTables.CONFIG_PROFESSION.IconResource],this.widget("talentPanel/shrink/choice/chose1/replace"));
        var sex = this.userLogic.getBaseData(this.userLogic.Type.Sex);
        var callBack0 = function(spineData){
            // this.leftSpine.skeletonData  = spineData;
            this.leftSpine.paused = false;
            this.leftSpine.setAnimation(0,'atk',false);
            this.leftSpine.addAnimation(0,'std',true);
        }.bind(this);
        this.equipLogic.setBaseSpineForOther(sex,leftConfig[jsonTables.CONFIG_PROFESSION.Tid],[],this.leftSpine,callBack0);
        var callBack1 = function(spineData){
            // this.rightSpine.skeletonData  = spineData;
            this.rightSpine.setAnimation(0,'std',true);
            this.rightSpine.setToSetupPose();
            this.scheduleOnce(function(){
                this.rightSpine.paused = true;
            }.bind(this),0.1);
        }.bind(this);
        this.equipLogic.setBaseSpineForOther(sex,rightConfig[jsonTables.CONFIG_PROFESSION.Tid],[],this.rightSpine,callBack1);
        // uiResMgr.loadProfessionRes(leftConfig[jsonTables.CONFIG_PROFESSION.Resource][idx],this.widget("talentPanel/shrink/choice/role0"));
        // uiResMgr.loadProfessionRes(rightConfig[jsonTables.CONFIG_PROFESSION.Resource][idx],this.widget("talentPanel/shrink/choice/role1"));
        this.widget("talentPanel/shrink/choice/selectionLabel").active = !isLock;
        this.widget("talentPanel/shrink/choice/errorLabel").active = isLock;
        this.widget("talentPanel/shrink/choice/btn1").getComponent(cc.Sprite).spriteFrame = isLock?this.btnUpSp[1]:this.btnUpSp[0];
        this.widget("talentPanel/shrink/choice/btn1").getComponent(cc.Button).interactable = !isLock;
        this.chooseCareer = undefined;
        this.leftAni.node.scale = 1.5;
        this.leftSpine.node.color = uiColor.talentPanel.spineUnlock;
        this.rightAni.node.scale = 0.5;
        this.rightSpine.node.color = uiColor.talentPanel.spineLock;
        this.lockChoose = isLock;
        this.choosePro("",0,true);
    },

    choosePro:function(event,param,unAni){
        var num = parseInt(param);
        var career = this.myConfig[jsonTables.CONFIG_PROFESSION.ChangeDirection][num];
        if(career === this.chooseCareer)    return;
        this.chooseCareer = career;
        var nextNum = num === 0?1:0;
        // this.widget("talentPanel/shrink/choice/role" + num).color =this.lockChoose?uiColor.black:uiColor.white;
        this.widget("talentPanel/shrink/choice/parent" + num).zIndex = 2;
        // this.widget("talentPanel/shrink/choice/role" + nextNum).color = uiColor.black;
        this.widget("talentPanel/shrink/choice/parent" + nextNum).zIndex = 1;
        this.widget("talentPanel/shrink/choice/chose" + num +"/choice").active = true;
        this.widget("talentPanel/shrink/choice/chose" + nextNum +"/choice").active = false;
        this.widget("talentPanel/shrink/choice/selectionLabel/label").getComponent(cc.Label).string = this.widget("talentPanel/shrink/choice/chose"+ num +"/name").getComponent(cc.Label).string;
        if(!unAni){//播放动画
            uiManager.setRootBlockActive(true);
            this.widget("talentPanel/shrink/choice/parent" + num).getComponent(cc.Animation).play("toBig");
            this.widget("talentPanel/shrink/choice/parent" + nextNum).getComponent(cc.Animation).play("toSmall");
            var spine = this.widget("talentPanel/shrink/choice/parent" + nextNum + "/spine").getComponent(sp.Skeleton);
            spine.setAnimation(0,'std',true);
            spine.setToSetupPose();
            setTimeout(function(){
                spine.paused = true;
            }.bind(this),50);
        }
    },

    clickChange:function(event,param){
        if(this.lockChoose) return;
        var config  = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,this.chooseCareer);
        var callback =  function(){
            this.talentLogic.req_Change_Career(this.chooseCareer);
        };
        uiManager.msgDefault(uiLang.getMessage(this.node.name,"change") + uiLang.getConfigTxt(config[jsonTables.CONFIG_PROFESSION.NameId]),callback.bind(this));
    },

    //刷新某个职业天赋树
    refreshCareer:function(profession){
        this.lastClickID = undefined;
        this.status = constant.TalentIconType.DETAIL;
        this.widget("talentPanel/shrink/talentNumber").active = true;
        // this.widget("talentPanel/shrink/talentTree").active = false;
        this.widget("talentPanel/shrink/talent").active = true;
        this.widget("talentPanel/shrink/choice").active= false;
        this.widget("talentPanel/shrink/taFrame2").active = true;
        this.widget("talentPanel/shrink/taFrame2/name").active = false;
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PROFESSION,profession);
        var configData = this.talentLogic.getConfigByPro(profession);
        this.refreshIconLine(configData,constant.TalentIconType.DETAIL);
    },


    refreshIntro:function(data,lv){
        this.introData = data;
        this.widget("talentPanel/shrink/talentUpgrade").active = true;
        this.widget("talentPanel/shrink/talentUpgrade/nameLabel").getComponent(cc.Label).string = uiLang.getConfigTxt(data[jsonTables.CONFIG_TALENT.NameID]);
        uiResMgr.loadRoleTalentIcon(data[jsonTables.CONFIG_TALENT.Icon],this.widget("talentPanel/shrink/talentUpgrade/mask/icon"));
        this.widget("talentPanel/shrink/talentUpgrade/levelLabel").getComponent(cc.Label).string = lv + "/" + data[jsonTables.CONFIG_TALENT.MaxLv];;
        // var descStr = this.status === constant.TalentIconType.TREE ? uiLang.getConfigTxt(data[jsonTables.CONFIG_TALENT.DesID]) :this.getDes(data,lv);
        // this.widget("talentPanel/shrink/talentUpgrade/label").getComponent(cc.RichText).string = this.getDes(data,lv);
        this.widget("talentPanel/shrink/talentUpgrade/maxLabel").active = lv === data[jsonTables.CONFIG_TALENT.MaxLv];
        this.widget("talentPanel/shrink/talentUpgrade/upNode").active = lv !== data[jsonTables.CONFIG_TALENT.MaxLv];
        if(lv !== data[jsonTables.CONFIG_TALENT.MaxLv]){
            this.needGold =  data[jsonTables.CONFIG_TALENT.Gold][lv];
            this.needPoint = data[jsonTables.CONFIG_TALENT.TalentPoint][lv];
            this.widget("talentPanel/shrink/talentUpgrade/upNode/gold/numberLabel").getComponent(cc.Label).string = NP.dealNum(this.needGold, constant.NumType.TEN);
            this.widget("talentPanel/shrink/talentUpgrade/upNode/number/numberLabel").getComponent(cc.Label).string = this.needPoint;
            var btnStr = lv === 0?uiLang.getMessage(this.node.name,"learn"):uiLang.getMessage(this.node.name,"up");
            this.widget("talentPanel/shrink/talentUpgrade/upNode/btn/label").getComponent(cc.Label).string = btnStr;
            this.updateBtn();
        }

        //天赋描述
        this.widget("talentPanel/shrink/talentUpgrade/layout/label").getComponent(cc.Label).string = uiLang.getConfigTxt(data[jsonTables.CONFIG_TALENT.DesID]);
        //当前等级
        this.widget("talentPanel/shrink/talentUpgrade/layout/present").active = lv !== 0;
        if(this.widget("talentPanel/shrink/talentUpgrade/layout/present").active){
            this.widget("talentPanel/shrink/talentUpgrade/layout/present/numberLabel").getComponent(cc.Label).string = this.getDes(data,lv);
        }
        //下一等级
        this.widget("talentPanel/shrink/talentUpgrade/layout/level/numberLabel").active = lv !== data[jsonTables.CONFIG_TALENT.MaxLv];
        if(this.widget("talentPanel/shrink/talentUpgrade/layout/level/numberLabel").active){
            this.widget("talentPanel/shrink/talentUpgrade/layout/level/numberLabel").getComponent(cc.Label).string = this.getDes(data,lv + 1);
        }
        //解锁条件
        this.widget("talentPanel/shrink/talentUpgrade/layout/upgrade").active = lv === 0;
        if(this.widget("talentPanel/shrink/talentUpgrade/layout/upgrade").active){
            var arr = this.getUpMsh(data);
            var refreshData = {
                content:this.widget("talentPanel/shrink/talentUpgrade/layout/upgrade/layout"),
                list:arr,
                prefab:this.labelPrefab
            }
            uiManager.refreshView(refreshData);
            // this.widget("talentPanel/shrink/talentUpgrade/layout/upgrade/numberLabel").getComponent(cc.RichText).string = this.getUpMsh(data);
        }
    },
    updateBtn:function(){
        var gold = this.userLogic.getBaseData(this.userLogic.Type.Gold);
        var canUp = this.needGold <= gold && this.needPoint <= this.myPoint;
        this.widget("talentPanel/shrink/talentUpgrade/upNode/btn").getComponent(cc.Button).interactable = canUp;
        this.widget("talentPanel/shrink/talentUpgrade/upNode/btn").getComponent(cc.Sprite).spriteFrame = canUp?this.btnUpSp[0]:this.btnUpSp[1];
    },

    // closeAllIntro:function(){
    //     this.widget("talentPanel/shrink/talentTree/taFrame2").active = false;
    //     this.widget("talentPanel/shrink/talentTree/taFclose").active = false;
    //     this.lastChooseNode.getChildByName("light").active = false;
    //     this.lastChooseID = undefined;
    //     this.lastChooseNode = undefined;
    // },
    //
    // refreshAllIntro:function(data,pos){
    //     this.widget("talentPanel/shrink/talentTree/taFrame2").active = true;
    //     this.widget("talentPanel/shrink/talentTree/taFclose").active = true;
    //     var addX = pos.x > 0? -40 - 250 :40;
    //     this.widget("talentPanel/shrink/talentTree/taFrame2").position = cc.v2(pos.x + addX,pos.y + 10);
    //     this.widget("talentPanel/shrink/talentTree/taFrame2/nameLabel").getComponent(cc.Label).string = uiLang.getConfigTxt(data[jsonTables.CONFIG_TALENT.NameID]);
    //     this.widget("talentPanel/shrink/talentTree/taFrame2/label").getComponent(cc.Label).string = uiLang.getConfigTxt(data[jsonTables.CONFIG_TALENT.DesID]);
    //     uiResMgr.loadRoleTalentIcon(data[jsonTables.CONFIG_TALENT.Icon],this.widget("talentPanel/shrink/talentTree/taFrame2/icon"));
    // },
    //获取天赋描述
    getDes:function(data,lv){
        var skill = data[jsonTables.CONFIG_TALENT.TalentSkill];
        var sand = data[jsonTables.CONFIG_TALENT.TalentSand];
        var des = "";
        if(skill){
            var skillConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENTSKILL,skill);
            if(skillConfig[jsonTables.CONFIG_TALENTSKILL.Type] === tb.TALENT_PASSIVESKILL){//特殊，增加被动技能
                des+=this.getPassive(skillConfig,lv);
            }else{
                des+=this.getNumDes(skillConfig,lv);
            }
        }
        if(sand){
            var sandConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENTSAND,sand);
            des+=this.getSandDes(sandConfig,lv);
        }
        return des;
    },
    //获取被动天赋描述
    getPassive:function(skillConfig,lv){
        var passiveConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILL,skillConfig[jsonTables.CONFIG_TALENTSKILL.PassiveSkill]);
        var msgStr =uiLang.getConfigTxt(passiveConfig[jsonTables.CONFIG_PASSIVESKILL.Des]);
        var lv1 = skillConfig[jsonTables.CONFIG_TALENTSKILL.Lv][lv - 1] ? skillConfig[jsonTables.CONFIG_TALENTSKILL.Lv][lv - 1]:0;//被动等级
        var config = jsonTables.getJsonTableObj(jsonTables.TABLE.PASSIVESKILLLV,skillConfig[jsonTables.CONFIG_TALENTSKILL.PassiveSkill],lv1);
        var str1Num = config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionParam]:"";
        var str2Num = config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionExtParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.ConditionExtParam]:"";
        var str3Num = config[jsonTables.CONFIG_PASSIVESKILLLV.SkillParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.SkillParam]:"";
        var str4Num = config[jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam]?config[jsonTables.CONFIG_PASSIVESKILLLV.SkillExtParam]:"";
        var str5Num = config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterTime]?config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterTime]/1000:"";
        var str6Num = config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterNum]?config[jsonTables.CONFIG_PASSIVESKILLLV.BuffParameterNum]:"";
        return  msgStr.formatArray([str1Num,str2Num,str3Num,str4Num,str5Num,str6Num]);
    },
    //获取增加数值天赋描述
    getNumDes:function(skillConfig,lv){
        var des = "";
        var isSp = skillConfig[jsonTables.CONFIG_TALENTSKILL.IfDivide];
        var num1 = skillConfig[jsonTables.CONFIG_TALENTSKILL.Lv][lv - 1] !== undefined ? skillConfig[jsonTables.CONFIG_TALENTSKILL.Lv][lv - 1]:"";
        var num2 = skillConfig[jsonTables.CONFIG_TALENTSKILL.LvParam][lv - 1] !== undefined ? skillConfig[jsonTables.CONFIG_TALENTSKILL.LvParam][lv - 1]:"";
        if(num1 && isSp){
            num1 = num1 / 10;
        }
        if(num2 && isSp){
            num2 = num2 / 10;
        }
        des += uiLang.getConfigTxt(skillConfig[jsonTables.CONFIG_TALENTSKILL.Des]).formatArray([num1,num2]);
        return des;
    },
    //获取沙盘效果描述
    getSandDes:function(sandConfig,lv){
        var des = uiLang.getConfigTxt(sandConfig[jsonTables.CONFIG_TALENTSAND.Des]);
        var str =[];
        str.push(this.dealNum(sandConfig[jsonTables.CONFIG_TALENTSAND.Probability][lv - 1]));
        str.push(this.dealNum(sandConfig[jsonTables.CONFIG_TALENTSAND.Lv][lv - 1]));
        str.push(this.dealNum(sandConfig[jsonTables.CONFIG_TALENTSAND.Step][lv - 1]));
        str.push(this.dealNum(sandConfig[jsonTables.CONFIG_TALENTSAND.Num][lv - 1]));
        return  des.formatArray(str);
    },
    dealNum:function (num) {
        return  num?num:"";
    },
    getMsg:function(config,key,lv){
        var num = config[key][lv - 1] ? config[key][lv - 1]:0;
        var num1 = config[key][lv];
        var str = "";
        if(num !== num1 && num1 !== undefined){
            str = num + "<color=#00ff00>+" + num1 + "</c>";
        }else if(num !== 0 &&(num1 === undefined || num1 === num)){
            str = num;
        }
        return str;
    },
    //点击天赋图标
    clickItem:function(event){
        event.stopPropagation();
        var data = event.getUserData();
        if(data.type === constant.TalentIconType.DETAIL){//职业界面
            if(this.lastClickID === data.data[jsonTables.CONFIG_TALENT.Tid])    return;
            this.lastClickID = data.data[jsonTables.CONFIG_TALENT.Tid];
            if(this.lastNode && cc.isValid(this.lastNode) && this.lastNode.uuid !== data.node.uuid){
                this.lastNode.getChildByName("light").active = false;
            }
            this.lastNode = data.node;
            this.refreshIntro(data.data, data.lv);
        }else{//天赋总览界面
            // if(this.lastChooseID === data.data[jsonTables.CONFIG_TALENT.Tid])    return;
            // this.lastChooseID = data.data[jsonTables.CONFIG_TALENT.Tid];
            // if(this.lastChooseNode && cc.isValid(this.lastChooseNode) && this.lastChooseNode.uuid !== data.node.uuid){
            //     this.lastChooseNode.getChildByName("light").active = false;
            // }
            // this.lastChooseNode = data.node;
            // this.refreshAllIntro(data.data,data.node.position);
        }
    },


    //天赋升级
    upEvent:function(){
        var lastConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENT,this.lastClickID);
        var pre = lastConfig[jsonTables.CONFIG_TALENT.Pre];
        if(pre[0] !== "" && pre.length > 0){
            var canUp = true;
            for (var i = 0 , len = pre.length; i < len; i++) {
                var str = pre[i];
                var arr = str.split("#");
                var preLv = this.talentLogic.getTalentLv(parseInt(arr[0]));
                if(preLv < parseInt(arr[1])){
                    canUp = false;
                    var preConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENT,parseInt(arr[0]));
                    var errStr =  uiLang.getConfigTxt(preConfig[jsonTables.CONFIG_TALENT.NameID]) + uiLang.getMessage(this.node.name,"canot") + " "  + uiLang.getMessage(this.node.name,"lv").formatArray([arr[1]]);;
                    break;
                }
            }
            if(!canUp){//不能升级
                uiManager.openUI(uiManager.UIID.TIPMSG,errStr);
                return;
            }
        }
        this.talentLogic.req_Talent_LvUp(this.lastClickID);
    },

    getUpMsh:function(config){
        var pre = config[jsonTables.CONFIG_TALENT.Pre];
        var str = [{color:uiColor.talentPanel.green,str:uiLang.getMessage(this.node.name,"noNeed")}];
        if(pre[0] !== "" && pre.length > 0){
            str = [];
            for (var i = 0 , len = pre.length; i < len; i++) {
                var obj = pre[i];
                var arr = obj.split("#");
                var preConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.TALENT,parseInt(arr[0]));
                var preLv = this.talentLogic.getTalentLv(parseInt(arr[0]));
                var colorStr = preLv >= arr[1]?uiColor.talentPanel.green:uiColor.talentPanel.red;
                var info = {
                    color:colorStr,
                    str:uiLang.getConfigTxt(preConfig[jsonTables.CONFIG_TALENT.NameID]) + " " + uiLang.getMessage(this.node.name,"lv").formatArray([arr[1]])
                }
                // str += rText.setColor(uiLang.getConfigTxt(preConfig[jsonTables.CONFIG_TALENT.NameID]) + arr[1] + uiLang.getMessage(this.node.name,"lv"),colorStr);
                // if(i !== len - 1){
                //     str += "\n";
                // }
                str.push(info);
            }
            if(config[jsonTables.CONFIG_TALENT.PrePoint]){
                var colorStr = (this.allPoint - this.myPoint) >= config[jsonTables.CONFIG_TALENT.PrePoint]?uiColor.talentPanel.green:uiColor.talentPanel.red;
                // str += "\n" +rText.setColor( uiLang.getMessage(this.node.name,"lastNeed").formatArray([config[jsonTables.CONFIG_TALENT.PrePoint]]),colorStr);
                var info = {
                    color:colorStr,
                    str:uiLang.getMessage(this.node.name,"lastNeed").formatArray([config[jsonTables.CONFIG_TALENT.PrePoint]])
                }
                str.push(info);
            }
        }
        return  str;
    },
    switch:function(event){
        if(this.status === constant.TalentIconType.TREE){
            this.refreshTalent();
        }else{
            this.refreshTree();
        }
    },
    resetEvent:function(){
        var useStr = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.TalentReset);
        var arr = useStr.split("#");
        var callback = function(){
            this.talentLogic.req_Talent_Reset();
        };
        var vitCount = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.EnergyAmount);
        var str = uiLang.getMessage(this.node.name,"reset") + arr[2] + rText.getMsgCurrency(parseInt(arr[0])) + uiLang.getMessage(this.node.name,"resetSure");
        uiManager.msgDefault(str,callback.bind(this));
    },

    // openBag:function(){
    //     uiManager.openUI(uiManager.UIID.EQUIPMENT);
    //     this.scheduleOnce(function () {
    //         this.close();
    //     }.bind(this),0.1);
    // },

    // closeTree:function(){
    //     this.widget("talentPanel/shrink/talentTree").active = false;
    //     this.status = constant.TalentIconType.DETAIL;
    // },
    // update (dt) {},
});
