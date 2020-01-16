var panel = require("panel");
cc.Class({
    extends: panel,

    properties: {
        interval:0.3,//每隔0.3秒飞一张
        flyTime:0.5,//飞行时间为0.5秒
        showNumLabel:cc.Label,
        showNode:cc.Node,
    },

    onLoad:function(){
        jsonTables.parsePrefab(this);
        this.showIdx = 1;
        this.playList = [];//播放列表。一次性获得多个家族者需要一个一个的播放
        this.ani = this.node.getComponent(cc.Animation);
        this.ani.on(constant.AnimationState.FINISHED, this.onFinished, this);
        this.spineZOrder = [5,3,4,2,1];//按照spine层级排序，idx表示spine的后缀
    },

    onFinished: function (event,param) {
        if (event !== constant.AnimationState.FINISHED) return;
        if(param.name === "familyAnimation"){
            this.playFly();
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.MONSTERCHIP);
        }else if(param.name === "familyAnimation1"){
            this.ani.play("familyAnimation2");
            this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.MONSTERGET);
            this.scheduleOnce(function(){
                this.touchEnable = true;
            }.bind(this),0.5);
        }
    },

    open:function(info,callback){
        if(!info)   return;
        callback = callback ? callback:function(){};
        if(!this.initPos){
            var worldPos = this.widget("familyEffect/down/lineUp").parent.convertToWorldSpaceAR(this.widget("familyEffect/down/lineUp").position);
            this.initPos = this.widget("familyEffect/content").convertToNodeSpaceAR(worldPos);
        }
        var data = {
            familyID:info.FamilyID,
            exp:info.Exp,
            callback:callback,
        }
        this.playList.push(data);
        if(this.playList.length === 1 ){
            this.popData();
        }
    },
    popData:function(){
        if(this.playList.length === 0){
            this.close();
            return;
        }
        this.touchEnable = false;
        this.widget("familyEffect/getFamily/bgExp").active = this.playList[0].exp > 0;
        this.widget("familyEffect/getFamily/bgExp/number").getComponent(cc.Label).string = "+" + this.playList[0].exp;
        var familyID = this.playList[0].familyID;
        var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,familyID);//家族配置表基本数据
        var quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
        this.monsterData = this.cardLogic.getHeroesById(familyID);//服务端给过来来的数据
        this.widget("familyEffect/content").active = false;
        for (var i = 1 , len = 6; i < len; i++) {//5张卡牌，一张一张加载图片
            var path = "familyEffect/content/rewardItem" + i;
            this.widget(path).position = this.initPos;
            this.widget(path).scale = 0.5;
            this.widget(path).active = true;
            uiResMgr.loadRewardIcon(this.widget(path+"/icon"),constant.ItemType.HERO,familyID,this.widget(path+"/iconFrame"));
        }
        uiResMgr.loadRewardIcon(this.widget("familyEffect/rewardItem/icon"),constant.ItemType.CARD,familyID,this.widget("familyEffect/rewardItem/iconFrame"),this.widget("familyEffect/rewardItem/qualityFrame1"));
        this.widget("familyEffect/rewardItem").active = false;
        this.widget("familyEffect/rewardItem").scale = 1;
        uiResMgr.loadQualityLvIcon(quality,this.widget("familyEffect/getFamily/black/letterForm3"));
        jsonTables.loadConfigTxt(this.widget("familyEffect/getFamily/black/label"),baseData[jsonTables.CONFIG_MONSTERFAMILY.NameID]);
        for(var i = 0; i < baseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters].length ;i ++){
            var tid = baseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][i];
            let spineConfig = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid);
            let path = 'familyEffect/getFamily/spine/spine'+i;
            this.widget(path).setLocalZOrderEx(this.spineZOrder[i]);
            this.widget(path).active = false;
            let callBack = function(spineData){
                this.widget(path).getComponent(sp.Skeleton).skeletonData  = spineData;
                this.widget(path).getComponent(sp.Skeleton).setAnimation(0,'std',true);
                this.widget(path).active = true;
            }.bind(this);
            uiResMgr.loadSpine(spineConfig[jsonTables.CONFIG_MONSTER.Resource],callBack);
            this.widget(path).x = spineConfig[jsonTables.CONFIG_MONSTER.XOffset];
            this.widget(path).y = spineConfig[jsonTables.CONFIG_MONSTER.YOffset];
            this.widget(path).scale = spineConfig[jsonTables.CONFIG_MONSTER.DateScale] / 100;
            if(i >= this.showIdx){
                var color = this.monsterData.Quality > i?uiColor.white:uiColor.black;
                this.widget(path).color = color;
            }
        }
        this.needDebris = jsonTables.getGameBaseValue(jsonTables.CONFIG_GAMEBASE.WholeNeedNum)[quality - 1];//解锁需要的碎片数
        this.addNum = Math.floor(this.needDebris / 5);
        this.showNumLabel.string =0;
        this.ani.play("familyAnimation");
        this.ani.setCurrentTime(0);
        this.clientEvent.dispatchEvent("playAudioEffect",constant.AudioID.MONSTERGATHER);
    },
    playFly:function(){
        this.widget("familyEffect/content").active = true;
        var endNum = 0;
        for (var i = 1 , len = 6; i < len; i++) {
            var time = this.interval * (i - 1);
            let num = i;
            this.scheduleOnce(function(){
                var flyNode = this.widget("familyEffect/content/rewardItem" + num);
                var toPos = cc.v2(0,0);
                var spawn = cc.spawn(cc.moveTo(this.flyTime,toPos), cc.scaleTo(this.flyTime,1));//移向目标，边移动边拉伸
                var func=function(){
                    endNum ++;
                    flyNode.active = false;
                    this.showNode.scale = 1 + 0.1 * endNum;
                    if(endNum === 1){
                        this.showNode.active = true;
                        this.showNumLabel.string = this.addNum * num;
                    }else if(endNum === 5){
                        this.showNumLabel.string = this.needDebris;
                        setTimeout(function(){
                            this.showNode.active = false;
                            this.ani.play("familyAnimation1");
                            this.widget("familyEffect/content").active = false;
                        }.bind(this),100)
                    }else{
                        this.showNumLabel.string = this.addNum * num;
                    }
                }.bind(this);
                var funcAction=cc.callFunc(func);
                flyNode.runAction(cc.sequence(spawn,funcAction));
            }.bind(this),time);
        }
    },
    clickNext:function(){
        if(!this.touchEnable)   return;
        var data = this.playList.shift();
        if(data.callback){
            data.callback();
        }
        this.popData();
    },
    close:function () {
        //是否需要弹出等级提升界面
        if(this.userLogic.canPlayUpLvAni) {
            this.userLogic.playUpLvAni();
        }
    }
    // update (dt) {},
});
