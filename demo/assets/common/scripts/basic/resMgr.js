window["manager"] = window["manager"] || {};
window["manager"]["resource"] = function() {
    var manager = {};
    var clientEvent = kf.require("basic.clientEvent");
    manager.RTYPE = {
        PREFAB:0,
        HEAD:1,
        SPINE:2,
        SCENE:3,
        CHAPTER_PREFAB:4,//关卡预制体
        CHAPTER_BG:5,//关卡背景
        CHAPTER_LANDSP:6,//关卡样式贴图
        SKILL_PREFAB:7,
        SKILL_ICON:8,
        AUDIO:9,
        LAND:10,
        MONSTER:11,
        TREASURE_BOX_LOCK:12,
        TREASURE_BOX_OPEN:13,
        EQUIP:14,
        COMMON:15,//通用的，比如金币和钻石ICON
        QUALITY:16,
        MONTYPE:17,
        AREAN_SEGMENT:18,
        LANGBLOCK:19,//障碍物
        LANGWORLD:20,//大地图岛屿
        PLAYER_HEAD:21,
        REEL_QUALITY:22,
        STORYICON:23,
        STORYANI:24,
        FIGHT_AUDIO:25,//怪物打击音效
        SHOP:26,
        STORY_BG:27,
        ROLETALENT:28,
        FRAGMENT_ICON:29,//家族碎片
        TASK:30,//任务icon
        QULAITY_MINI:31,//小品质icon
        SANDBOX_OFFICE:32,//沙盘机关内部
        PROFESSIONRES:33,//职业形象
        ADVENTURE:34,//奇遇贴图
        FIGHT_BG:35,//战斗参加背景
        QUALITY_QUALITY:36,
        CHAPTER_CLOUD:37,//关卡的云
        BUFFT_EFFECT:38,//buff特效
        FIGHT_BULLET:39,//战斗子弹类型
        FRAGMENT_QUALITY:40,//碎片品质底
        QUALITY_LV:41,
        CHAPTER_BG_ANI:42,//章节动画
        MAIN_PREFAB:43,//主场景的缓存资源
        PROFESSIONICON:44,//职业图标
        COUNTRYICON:44,//国家图标
        AREAN_EMOJ:45,//竞技场表情
        AREAN_EMOJ_ICON:46,//表情icon
        CHAPTER_ADVENTURE_TIP:47,//奇遇提示预制体
        SKILL_DISPLAY_PREFAB:48,//技能背景光
        EQUIP_QUES:49,//随机装备底色
        EQUIP_BASE:50,//装备底色
        FIGHT_BULLETBG:51,//戰鬥子彈底板
        QULAITY_BG: 52,  //品质的大背景
    };

    manager.init = function() {
        //需要缓存的游戏对象容器
        this.container = {};
        this.subpackage = {};
        this.reset();
        for (var key in this.RTYPE) {
            if (!this.RTYPE.hasOwnProperty(key)) continue;
            var data = this.RTYPE[key];
            this.container[data] = {};
            this.containerCache[data] = cc.js.createMap();
        }
        this.poolCount = {//限制池子对象个数  释放不需要的占用
            'floatKill':5,
            'monsterItem':5,
            "fightDizzy":3,
            "fightTomb":3,
            "chatItem":3,
            "monsterSkillIcon":2,
            "uiChatItem":3,
            "rewardItem":6,
        };

        this.loadingRes = {"prefab":false,"sprite":false,"pool":false,"fontRes":false};
        this.fightPoolFlag = false;
        this.poolNames = [];
        this.pools = cc.js.createMap();
        window.uiResMgr = this;
    };

    manager.reset = function () {
        this.containerCache = cc.js.createMap();
    };

    manager.limitPoolCount = function () {
        for (var i = 0 , len = this.poolNames.length; i <  len; i++) {
            var poolName = this.poolNames[i];
            if(!this.isPool(poolName)) continue;
            var pool = this[poolName+'Pool'];
            var poolLimit = this.poolCount[poolName] || 1;
            if (pool.size() > poolLimit) {
                var removeCount = pool.size() - poolLimit;
                for (var i = 0 , len = removeCount; i <  len; i++) {
                    var node = pool.get();
                    node.destroy();
                }
            }
        }
    }
    /** 加载指定的预制体群体 并创建初级池子 */
    manager._loadPoolPrefab = function (prefabs) {
        for (var i = 0 , len = prefabs.length; i <  len; i++) {
            this.poolNames.push(prefabs[i].name)
            var count = this.poolCount[prefabs[i].name] || 1;
            this.createPrefabPool(prefabs[i],count);
        }
    };

    manager.isLoadingResDone = function () {
        return this.loadingRes["sprite"] && this.loadingRes["prefab"] && this.loadingRes["pool"] && this.loadingRes["fontRes"];
    };

    manager.startLoadingRes = function () {
        if (this.isLoadingResDone()) return;
        cc.loader.loadResDir("loadingRes/poolPrefab",cc.Prefab, function (err, prefabs) {
            if (err) return cc.error(err);
            this._loadPoolPrefab(prefabs);
            this.loadingRes["pool"] = true;
        }.bind(this));
        cc.loader.loadResDir("loadingRes/sprite/", cc.SpriteFrame, function (err, sprites) {
            if (err) return cc.error(err);
            this.loadingRes["sprite"] = true;
        }.bind(this));
        cc.loader.loadResDir("loadingRes/prefab/",cc.Prefab,function (err, prefabs) {
            if (err) return cc.error(err);
            for (var i = 0; i<prefabs.length; i++) {
                this.container[this.RTYPE.PREFAB][prefabs[i]._name] = prefabs[i];
            }
            this.loadingRes["prefab"] = true;
        }.bind(this));
    };
    /** 加载战斗用的对象池子 */
    manager.loadFightPool = function (cb) {
        if (this.fightPoolFlag) return cb();
        cc.loader.loadResDir("prefab/poolFight/",cc.Prefab,function (err, prefabs) {
            if (err) return cc.error(err);
            this._loadPoolPrefab(prefabs);
            this.fightPoolFlag = true;
            cb();
        }.bind(this));
    };
    /** 红包 */
    manager.loadRedBag = function (cb) {
        var fun = function (prefab) {
            this._loadPoolPrefab([prefab]);
        };
        this.loadPrefab(this.RTYPE.PREFAB,"prefab/redBag/","redBag",cb,fun.bind(this));
    };
    /** 战斗子弹 */
    manager.loadFightBulletPool = function (name,cb) {
        var fun = function (prefab) {
            this._loadPoolPrefab([prefab]);
        };
        this.loadPrefab(this.RTYPE.FIGHT_BULLET,"prefab/bullet/",name,cb,fun.bind(this));
    };
    /** 战斗子弹底板 */
    manager.loadFightBulletBgPool = function (name,cb) {
        var fun = function (prefab) {
            this._loadPoolPrefab([prefab]);
        };
        this.loadPrefab(this.RTYPE.FIGHT_BULLETBG,"prefab/bulletBg/",name,cb,fun.bind(this));
    };
    /** 加载进入主场景的资源 */
    manager.loadMainScenePrefab = function (cb) {
        var map = this.container[this.RTYPE.MAIN_PREFAB];
        if (Object.keys(map) > 0) {
            cb();
            return;
        }
        cc.loader.loadResDir("loadingRes/mainScene/",cc.Prefab,function (err, prefabs) {//
            if (err) return cc.error(err);
            for (var i = 0 , len = prefabs.length; i <  len; i++) {
                var obj = prefabs[i];
                this.container[this.RTYPE.MAIN_PREFAB][obj._name] = obj;
            }
            cb();
        }.bind(this));
    };

    /** 放在登陆场景加载出来了 采取初始化对应的效果 */
    manager.startLoadPreload = function () {
        // this.loadPrefab();
    };
    /** 正在加载 */
    manager.loadCacheing = function (type,name,callBack,args) {
        this.containerCache[type][name] = this.containerCache[type][name] || [];
        this.containerCache[type][name].push({callBack:callBack,args:args});
        return this.containerCache[type][name].length > 1;
    };
    /** 加载类型回调  进行同类型批量替换 */
    manager.loadCacheBack = function (type,name) {
        var list = this.containerCache[type][name];
        if (!list) return;
        for (var i = 0 , len = list.length; i < len; i++) {
            var obj = list[i];
            obj.callBack.apply(this,obj.args);
        }
        this.containerCache[type][name] = [];
    };

    /** 加载、国家图标 */
    manager.loadCountryIcon = function(name,node){//
        this.loadSpirteFrame(this.RTYPE.COUNTRYICON,"icon/country/",name,node);
    };

    /** 加载 场景背景图 */
    manager.loadSceneBg = function(name,node,cb){
        this.loadSpirteFrame(this.RTYPE.FIGHT_BG,"sceneBg/",name,node,cb);
    };

    /** 加载奇遇icon */
    manager.loadAdventureIcon = function(name,node){
        this.loadSpirteFrame(this.RTYPE.ADVENTURE,"icon/adventure/",name,node);
    };

    manager.loadCommonIcon = function(name,node){
        this.loadSpirteFrame(this.RTYPE.COMMON,"icon/common/",name,node);
    };

    /** 加载沙盘底部特效 */
    manager.loadItemPrefab = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.CHAPTER_ADVENTURE_TIP,"prefab/itemPrefab/",skillName,callBack);
    };

    /** 加载竞技场表情预制体 */
    manager.loadChapterAdventurePrefab = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.CHAPTER_ADVENTURE_TIP,"prefab/adventure/",skillName,callBack);
    };

    /** 加载竞技场表情预制体 */
    manager.loadAreanEmojPrefab = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.AREAN_EMOJ,"prefab/expression/",skillName,callBack);
    };

    /** 加载关卡云朵预制体 */
    manager.loadChapterCloudPrefab = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.CHAPTER_CLOUD,"chapter/cloud/",skillName,callBack);
    };

    /** 加载关卡预制体 */
    manager.loadChapterPrefab = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.CHAPTER_PREFAB,"chapter/prefab/",skillName,callBack);
    };

    /** 加载关卡动画预制体 */
    manager.loadChapterBgAni = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.CHAPTER_BG_ANI,"chapter/panelAniPrefab/",skillName,callBack);

    };
    //加载技能背景光
    manager.loadSkillDisplayPrefab = function (skillName,callBack) {
        if (skillName === "-") {
            if (callBack) {
                callBack(null);
            }
            return;
        }
        this.loadPrefab(this.RTYPE.SKILL_DISPLAY_PREFAB,"skill/skillDisplay/",skillName,callBack);
    };
    //加载技能特效
    manager.loadSkillPrefab = function (skillName,callBack) {
        if (skillName === "-") {
            if (callBack) {
                callBack(null);
            }
            return;
        }
        this.loadPrefab(this.RTYPE.SKILL_PREFAB,"skill/prefab/",skillName,callBack);
    };
    /** 加载指定预制体 */
    manager.loadBuffEffectPrefab = function (skillName,callBack) {
        this.loadPrefab(this.RTYPE.BUFFT_EFFECT,"skill/buffPrefab/",skillName,callBack);
    };

    //加载故事预制体
    manager.loadStoryPrefab = function (name,callBack) {
        this.loadPrefab(this.RTYPE.STORYANI,"prefab/story/",name,callBack);
    };


    /** 加载竞技场表情贴图贴图 */
    manager.loadAreanEmojIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.AREAN_EMOJ_ICON,"icon/expressionicon/",name,node);
    };

    /** 加载关卡预制体贴图 */
    manager.loadChapterLandStyle = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.CHAPTER_LANDSP,"chapter/prefabSp/",name,node);
    };
    /** 加载关卡背景贴图 */
    manager.loadChapterBG = function (name,node,cb) {
        this.loadSpirteFrame(this.RTYPE.CHAPTER_BG,"chapter/bgSprite/",name,node,cb);
    };

    manager.loadLockTreasureBox = function (boxName,node,cb) {
        var name = "close"+boxName;
        this.loadSpirteFrame(this.RTYPE.TREASURE_BOX_LOCK,"box/lock/",name,node,cb);
    };

    manager.loadShopIcon = function (boxName,node) {
        var name = "shop"+boxName;
        this.loadSpirteFrame(this.RTYPE.SHOP,"icon/shop/",name,node);
    };
    manager.loadOpenTBox = function (boxName,node,cb) {
        var name = "openT"+boxName;
        this.loadSpirteFrame(this.RTYPE.TREASURE_BOX_OPEN,"box/lock/",name,node,cb);
    };
    manager.loadOpenBBox = function (boxName,node,cb) {
        var name = "openB"+boxName;
        this.loadSpirteFrame(this.RTYPE.TREASURE_BOX_OPEN,"box/lock/",name,node,cb);
    };

    manager.loadSkillIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.SKILL_ICON,"icon/skill/",name,node);
    };
    //加载故事头像
    manager.loadStoryIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.STORYICON,"icon/storyTalk/role/",name,node);
    };

    //加载背景头像
    manager.loadStoryBg = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.STORY_BG,"icon/storyTalk/bg/",name,node);
    };

    //职业形象
    manager.loadProfessionRes = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.PROFESSIONRES,"icon/professionRes/",name,node);
    };
    //职业Icon
    manager.loadProfessionIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.PROFESSIONICON,"icon/profession/",name,node);
    };
    //英雄怪物头像
    manager.loadHeadIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.HEAD,"icon/head/",name,node);
    };
    //碎片家族
    manager.loadFragmentIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.FRAGMENT_ICON,"icon/fragment/",name,node);
    };
    //加载第三方头像
    manager._loadHeadIconByUrl = function (url,node) {
        if (!url) return;
        var head = this.getResource(this.RTYPE.PLAYER_HEAD,url);
        if (head) return node.getComponent(cc.Sprite).spriteFrame = head;

        if (cc.sys.isNative) {//如果原生 直接去下载图片
            var mod = require("ImageLoader");
            mod.loadImage(url,function (texture) {
                 var spriteFrame = new cc.SpriteFrame();
                 spriteFrame.setTexture(texture);
                 this.container[this.RTYPE.PLAYER_HEAD][url] = spriteFrame;
                 node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }.bind(this))
        }else {
            var playerImage = new Image();
            playerImage.crossOrigin = 'anonymous';
            playerImage.src = url;
            playerImage.onload = function(){
               var texture = new cc.Texture2D();
               texture.initWithElement(playerImage);
               texture.handleLoadedTexture();
               var newframe = new cc.SpriteFrame(texture);
               this.container[this.RTYPE.PLAYER_HEAD][url] = newframe;
               node.getComponent(cc.Sprite).spriteFrame = newframe;
           }.bind(this)
        }
    };

    //角色头像 游戏内头像
    manager._loadPlayerHeadIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.PLAYER_HEAD,"icon/head2/",name,node);
    };
    //加载头像统一入口
    manager.loadPlayerHead = function (iconID,url,node) {//
        if (iconID === -1) {//标识加载第三方头像
            if (!url) {
                return this.loadPlayerHead(1,"",node);
            }else {
                this._loadHeadIconByUrl(url,node);
            }
        }else {
            iconID = !!iconID ? iconID : 1;
            var config = jsonTables.getJsonTableObj(jsonTables.TABLE.HEAD,iconID);
            if (!config) return;
            this._loadPlayerHeadIcon(config[jsonTables.CONFIG_HEAD.Resource],node);
        }
    };

    //获取怪物类型贴图
    manager.loadMonTypeIcon = function (type,node,resName) {
        var name = resName ? resName + type : "raceEffect" + type;
        this.loadSpirteFrame(this.RTYPE.MONTYPE,"icon/monType/",name,node);
    };
    //装备ICON
    manager.loadEquipIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.EQUIP,"icon/equip/",name,node);
    };
    //品质ICON  quality 品质等级
    manager.loadEquipBaseIcon = function (quality,node) {
        var name = "quality" + quality;
        this.loadSpirteFrame(this.RTYPE.EQUIP_BASE,"icon/equipQuality/",name,node);
    };
    //品质ICON  quality 品质等级
    manager.loadQualityIcon = function (quality,node) {
        var name = "qualityFrame" + quality;
        this.loadSpirteFrame(this.RTYPE.QUALITY_QUALITY,"icon/qualityFrame/",name,node);
    };
    //品质ICON  quality 碎片品质等级底
    manager.loadFragmentFrameIcon = function (quality,node) {
        var name = "fragmentFrame" + quality;
        this.loadSpirteFrame(this.RTYPE.FRAGMENT_QUALITY,"icon/fragmentFrame/",name,node);
    };
    //怪物品质等级Icon CBA
    manager.loadQualityLvIcon = function (quality,node) {
        var name = "letterForm" + quality;
        this.loadSpirteFrame(this.RTYPE.QUALITY_LV,"icon/letter/",name,node);
    };
    //品质ICON  quality 品质等级
    manager.loadQualityMiniIcon = function (quality,node) {
        var name = "monsterform_icon_100" + quality;
        this.loadSpirteFrame(this.RTYPE.QULAITY_MINI,"icon/monsterform/",name,node);
    };

    //品质背景  quality 品质等级
    manager.loadQualityBg = function (quality,node) {
        var name = "upFrame" + quality;
        this.loadSpirteFrame(this.RTYPE.QULAITY_BG,"icon/monsterFrame/",name,node);
    };

    //沙盘机关内部图
    manager.loadsandOfficeIcon = function (name,node) {
        this.loadSpirteFrame(this.RTYPE.SANDBOX_OFFICE,"icon/sandmachine/",name,node);
    };

    //品质底色ICON  quality 品质等级
    manager.loadBaseQualityIcon = function (quality,node) {
        var name = "quality" + quality;
        this.loadSpirteFrame(this.RTYPE.QUALITY,"icon/quality/",name,node);
    };

    //随机装备底色ICON  quality 品质等级
    manager.loadEquipQuesIcon = function (quality,node) {
        var name = "ques" + quality;
        this.loadSpirteFrame(this.RTYPE.EQUIP_QUES,"icon/equipQues/",name,node);
    };

    //卷轴品质ICON  quality 品质等级
    manager.loadReelQualityIcon = function (quality,node) {
        var name = "reel" + quality;
        this.loadSpirteFrame(this.RTYPE.REEL_QUALITY,"icon/reel/",name,node);
    };

    //卷轴品质底色ICON  quality 品质等级
    manager.loadReelBaseQualityIcon = function (quality,node) {
        var name = "reelFrame" + quality;
        this.loadSpirteFrame(this.RTYPE.REEL_QUALITY,"icon/reelFrame/",name,node);
    };

    //英雄天赋icon
    manager.loadRoleTalentIcon = function (icon,node) {
        this.loadSpirteFrame(this.RTYPE.ROLETALENT,"icon/talent/",icon,node);
    };

    //英雄天赋icon
    manager.loaTaskIcon = function (icon,node) {
        this.loadSpirteFrame(this.RTYPE.TASK,"icon/task/",icon,node);
    };

    //竞技场等阶头像
    manager.loadAreanIcon = function (icon,node) {
        this.loadSpirteFrame(this.RTYPE.AREAN_SEGMENT,"icon/segment/",icon,node);
    };

    //////////////////////////////////////通用纹理加载///////////////////////////////////////

    /**
     * 通用纹理加载入口
     * @param  {int} type    uiResMgr枚举类型
     * @param  {string} resPath 纹理所在动态加载的路径前缀
     * @param  {string} name    资源唯一标识与respath凭借获取资源唯一路径
     * @param  {ccObj} node    节点精灵所在节点
     */
    manager.loadSpirteFrame = function (type,resPath,name,node,cb) {
        var head = this.getResource(type,name);
        if (head) {
            if(node) node.getComponent(cc.Sprite).spriteFrame = head;
            if (cb) cb();
            return;
        }
        if (this.loadCacheing(type,name,this.loadSpirteFrame,Array.prototype.slice.apply(arguments))) return;
        cc.loader.loadRes(resPath+name,cc.SpriteFrame,function (err, loadSprteFrame) {
            if (err) return cc.error(err);
            this.container[type][name] = loadSprteFrame;
            this.loadCacheBack(type,name);
        }.bind(this));
    };

    /////////////////////////////////////通用纹理加载////////////////////////////////////////
    /**
     * 通用预制体加载入口
     * @param  {int} type    uiResMgr枚举类型
     * @param  {string} resPath 预制体所在动态加载的路径前缀
     * @param  {string} name    资源唯一标识与respath凭借获取资源唯一路径
     * @param  {ccObj} callBack    预制体加载成功后执行的回调
     * @param  {ccObj} cb    预制体加载成功后利用改预制体执行的特殊动作
     */
    manager.loadPrefab = function (type,resPath,name,callBack,cb) {
        var prefab = this.getResource(type,name);
        if (prefab) {
            if(callBack){
                 callBack(prefab);
            }
            return;
        }
        if (this.loadCacheing(type,name,this.loadPrefab,Array.prototype.slice.apply(arguments))) return;
        cc.loader.loadRes(resPath+name,cc.Prefab,function (err, prefabs) {
            if (err) return cc.error(err);
            if(cb){
                cb(prefabs);
            }
            this.container[type][name] = prefabs;
            this.loadCacheBack(type,name);
        }.bind(this));
    };

    manager.loadFont = function(fontPath){
        cc.loader.loadResDir("font/" + fontPath, cc.Font, function (err, prefabs) {
            if (err) {
                cc.error(err);
                return;
            }
            var count = 0;
            var max = prefabs.length;
            var cb = function () {
                count++;
                if (count === max) {
                    setTimeout(function () {
                        jsonTables.initFont(prefabs);
                        this.loadingRes.fontRes = true;
                    }.bind(this), 50);
                }
            }.bind(this);
            for (var i = 0 , len = prefabs.length; i <  len; i++) {
                var obj = prefabs[i];
                if (obj.spriteFrame.textureLoaded()) {
                    cb();
                }
                else {
                    obj.spriteFrame.once('load', cb, this);
                    obj.spriteFrame.ensureLoadTexture();
                }
            }

        }.bind(this));
    };

    manager.getPreLoadPrefab = function(name){
        if(this.container[this.RTYPE.PREFAB][name]){
            return  this.container[this.RTYPE.PREFAB][name];
        }else{
            return  null;
        }
    };
    //提前预加载某个预制体
    manager.newPrefabInstance = function(name,callBack){
        var path = this.replaceName(name);
        this.loadPrefab(this.RTYPE.PREFAB,path,name,callBack);
    };

    manager.loadScenePrefab = function (sceneName,callBack) {
        var scene = this.getResource(this.RTYPE.SCENE,sceneName);
        if (scene) {
            return callBack(scene);
        }
        cc.loader.loadRes("scene/"+sceneName,cc.Prefab,function(curCount,allCount,item){
            clientEvent.dispatchEvent('loadSceneProgress',curCount,allCount);
        }, function (err, prefab) {
            if (err) return cc.error(err);
            this.container[this.RTYPE.SCENE][sceneName] = prefab;
            callBack(prefab);
        }.bind(this));

    };
    /**
     * [更换spine的部件]
     * @param {node} spineNode [需要刷新spinenode]
     * @param  {[array]}  switchData [需要更换皮肤的部位数据 {"spineName":[{desSlot:"",skinName:"",srcSlot:"",srcName:""},{desSlot:"",srcSlot:"",skinName:"",srcName:""}]}
     * @param  {Function} callback  [回调]
     */
    manager.loadSwitchSpine = function (spineNode,switchData,callback){
        var skeleton = spineNode.getComponent(sp.Skeleton);
        var spines = {};
        var topoSpineNames = Object.keys(switchData);
        var loadNum = 0;
        var loadAllCb = function(){//所有spine加载完回调
            var needCollect = false;
            for (var j = 0 , length = topoSpineNames.length; j < length; j++) {
                var data = switchData[topoSpineNames[j]];
                var topoData = spines[topoSpineNames[j]];
                if(cc.sys.isNative){
                    var map = {};
                    for (var i = 0 , len = topoData.textureNames.length; i <  len; i++) {
                        var obj = topoData.textures[i];
                        var name = topoData.textureNames[i];
                        map[name] = obj._nativeAsset;
                    }
                    skeleton._sgNode.setAttachmentForJson(map,topoData.atlasText,topoData.nativeUrl,data.skinName,data.srcSlot,data.srcName,data.desSlot);
                    if (!needCollect) {
                        needCollect = true;
                    }
                }else{
                    var skleData = topoData.getRuntimeData();
                    var slot = skeleton.findSlot(data.desSlot);//获取自己身上需要替换的插槽
                    if(!slot){
                        cc.error(topoData.name + "不存在" + data.desSlot + "插槽");
                        continue;
                    }
                    var skin = skleData.findSkin(data.skinName);//获取目标皮肤
                    var slotIdx = skleData.findSlotIndex(data.srcSlot);//获取目标插槽idx
                    var attachments = skin.getAttachment(slotIdx,data.srcName);//获取目标贴图
                    slot.setAttachment(attachments);//设置贴图
                }
            }
            if (needCollect) {
                cc.sys.garbageCollect();
            }
            if(callback){
                callback();
            }
        };
        var cb = function(spineData,name){
            spines[name] = spineData;
            loadNum ++;
            if(loadNum === topoSpineNames.length){//全部加载完了
                loadAllCb();
            }
        };
        for (var i = 0 , len = topoSpineNames.length; i < len; i++) {
            var obj = topoSpineNames[i];
            this.loadSpine(obj,cb);
        }
        if(topoSpineNames.length === 0 && callback){
            callback();
        }
    };
    /**
     * [更换spine的的基础spine和部件]
     * @param {object} data [需要刷新spinenode数据]
     * @param  {node}  spineNode [需要更换皮肤的节点 ]
     * @param  {Function} callback  [回调]
     */
    manager.getSpineByData = function(data,spineNode,callback){
        var cb = function(spineData){
            spineNode.getComponent(sp.Skeleton).skeletonData = spineData;
            spineNode.getComponent(sp.Skeleton).setAnimation(0,'std',true);
            var swichData = {};
            var dataKeys = Object.keys(data);
            for (var i = 0 , len = dataKeys.length; i < len; i++) {
                var obj = dataKeys[i];
                if(obj === "base" || !data[obj])  continue;//除了base其他都是数组形式的数据
                for (var j = 0 , jLen = obj.length; j < jLen; j++) {
                    if(data[obj][j]){
                        var weaponSpineName = Object.keys(data[obj][j])[0];
                        swichData[weaponSpineName] = data[obj][j][weaponSpineName];
                    }
                }
            }
            this.loadSwitchSpine(spineNode,swichData,callback);
        };
        this.loadSpine(data.base,cb.bind(this));
    };
    /**
     * 加载spine
     * @param  {string} spineName [spine名字]
     * @param  {Function} callBack  [加载完之后的回调]
     *  @param  {Node} spineNode  [强制在赋值spineData前取消暂停，赋值后设置回原状态]
     */
    manager.loadSpine = function (spineName,callBack,spineNode) {
        var spine = this.getResource(this.RTYPE.SPINE,spineName);
        if (spine) {
            if(spineNode && cc.isValid(spineNode)){
                var spineComp = spineNode.getComponent(sp.Skeleton);
                if (spineComp && spineComp.pasued) {
                    spineComp.pasued = false;
                }
            }

            if(spineNode && !cc.isValid(spineNode)) return;//如果节点存在且不合法 说明已被销毁了
            callBack(spine,spineName);
            return;
        }
        if (this.loadCacheing(this.RTYPE.SPINE,spineName,this.loadSpine,Array.prototype.slice.apply(arguments))) return;
        cc.loader.loadRes("spine/"+spineName,sp.SkeletonData, function (err, spineData) {
            if (err) return cc.error(err);
            this.container[this.RTYPE.SPINE][spineData._name] = spineData;
            this.loadCacheBack(this.RTYPE.SPINE,spineName);
        }.bind(this));

    };

    manager.getTypeResource = function(type){
        return this.container[type];
    };

    manager.getResource = function(type, name) {
        if(this.container[type][name]) {
            return this.container[type][name];
        }
        else {
            return null;
        }
    };

    manager.addLandRes = function(type,idx,sp){
        this.container[type][idx] = sp;
    };

    manager.replaceName = function(name){
        var paths = [];
        var pathName = "";
        if (cc.loader._resources.getAllPaths) {
            // creator 1.6.2的写法
            paths = cc.loader._resources.getAllPaths();
        } else {
            paths = Object.keys(cc.loader._resources._pathToUuid);
        }
        for (var i = 0; i < paths.length; i++) {
            var aliasPath = paths[i];
            var aliasArr = aliasPath.split("/");
            if (aliasArr[0] === "prefab" && aliasArr[aliasArr.length - 1] === name) {//NOTE 界面预制体都在prefab目录下，防止资源重名
                aliasArr.pop();
                pathName = aliasArr.join("/") + "/";
                break;
            }
        }
        return pathName;
    };
    /** 加载音乐或音效 */
    manager.loadAudio = function (audioID,callBack) {
        var config =  jsonTables.getJsonTableObj(jsonTables.TABLE.SOUND,audioID);
        if(!config) return  console.error("音效ID" + audioID + "在配置表中不存在");
        var name = config[jsonTables.CONFIG_SOUND.Resource];
        var type = config[jsonTables.CONFIG_SOUND.IsBattle] ? this.RTYPE.FIGHT_AUDIO:this.RTYPE.AUDIO;
        callBack = callBack || function(){};
        this._loadAudio(type,name,callBack);
    };

    manager._loadAudio = function (type,name,callBack) {
        var audio = this.getResource(type,name);
        if (audio) {
            return callBack(audio);
        }
        if (this.loadCacheing(type,name,this._loadAudio,Array.prototype.slice.apply(arguments))) return;
        cc.loader.loadRes("audio/"+name,cc.AudioClip, function (err, audio) {
            if (err) return cc.error(err);
            this.container[type][name] = audio;
            this.loadCacheBack(type,name);
        }.bind(this));
    };
    //加载货币icon
    manager.loadCurrencyIcon = function (type,iconNode, id) {
        switch (type) {
            case constant.ItemType.GOLD://金币
                uiResMgr.loadCommonIcon(constant.Common.GOLD,iconNode);
                break;
            case constant.ItemType.DIAMOND://钻石
                uiResMgr.loadCommonIcon(constant.Common.DIAMOND,iconNode);
                break;
            case constant.ItemType.VIT://体力
                uiResMgr.loadCommonIcon(constant.Common.VIT,iconNode);
                break;
            case constant.ItemType.EXP://金币
                uiResMgr.loadCommonIcon(constant.Common.EXP,iconNode);
                break;
            case constant.ItemType.ITEM://活动商品
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.ITEM,id);
                uiResMgr.loadCommonIcon("activity" + baseData[jsonTables.CONFIG_ITEM.ItemType], iconNode);
                break;
            case constant.ItemType.PUBLICPRO://通用怪物熟练度
                uiResMgr.loadCommonIcon(constant.Common.PUBLICPRO,iconNode);
                break;
            case constant.ItemType.DAILY_ACTIVITY://每日活跃度
                uiResMgr.loadCommonIcon(constant.Common.DAILY_ACTIVITY,iconNode);
                break;
            case constant.ItemType.PUBLICLIP://每日活跃度
                uiResMgr.loadCommonIcon(constant.Common.PUBLICLIP,iconNode);
                break;
        }
    };

    /**
     * 加载指定icon
     * @param  {[type]} type         [description]
     * @param  {[type]} id           [description]
     * @param  {[type]} iconNode     [物品icon节点]
     * @param  {[type]} qualityBase  [物品品质底色]
     * @param  {[type]} qualityFrame [物品品质前框]
     * @return {[type]}              [description]
     */
    manager.loadRewardIcon = function (iconNode,type,id,qualityBase,qualityFrame,noRefresh) {
        var quality = 0;//默认品质为1
        var refreshFrame = !noRefresh;//需要统一刷品质背景
        iconNode.scale = 1;
        switch (type) {
            case constant.ItemType.DAILY_ACTIVITY://每日活跃度
            case constant.ItemType.GOLD://金币
            case constant.ItemType.DIAMOND://钻石
            case constant.ItemType.VIT://体力
            case constant.ItemType.PUBLICPRO://通用怪物熟练度
            case constant.ItemType.PUBLICLIP://通用SSS碎片
            case constant.ItemType.EXP://金币
                uiResMgr.loadCurrencyIcon(type,iconNode);
                break;
            case constant.ItemType.HERO://英雄碎片
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,id);//家族配置表基本数据
                if(!baseData)   return;
                var iconRes = baseData[jsonTables.CONFIG_MONSTERFAMILY.FragmentIcon];
                uiResMgr.loadFragmentIcon(iconRes,iconNode);
                quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
                if(qualityFrame){
                    qualityFrame.active = false;
                }
                if(qualityBase){
                    qualityBase.active = true;
                    uiResMgr.loadFragmentFrameIcon(quality,qualityBase);
                }
                refreshFrame = false;
                break;
            case constant.ItemType.EQUIP://装备
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.EQUIP,id);//装备配置表基本数据
                if(!baseData)   return;
                uiResMgr.loadEquipIcon( baseData[jsonTables.CONFIG_EQUIP.Icon],iconNode);
                quality = baseData[jsonTables.CONFIG_EQUIP.Quality];
                if(qualityFrame){
                    qualityFrame.active = false;
                }
                if(qualityBase){
                    qualityBase.active = true;
                    uiResMgr.loadEquipBaseIcon(quality,qualityBase);
                }
                refreshFrame = false;
                break;
            case constant.ItemType.REEL://卷轴
                var reelData = jsonTables.getJsonTableObj(jsonTables.TABLE.REEL,id);//装备配置表基本数据
                if(!reelData)   return;
                var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,id)[jsonTables.CONFIG_MONSTER.Icon];
                uiResMgr.loadHeadIcon( iconRes,iconNode);
                var config = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,reelData[jsonTables.CONFIG_REEL.MonsterID]);
                var quality = config[jsonTables.CONFIG_MONSTER.Form];
                if(qualityFrame){
                    qualityFrame.active = true;
                    uiResMgr.loadReelQualityIcon(quality,qualityFrame);
                }
                if(qualityBase){
                    uiResMgr.loadReelBaseQualityIcon(quality,qualityBase);
                }
                refreshFrame = false;
                break;
            case constant.ItemType.CARD://英雄碎片
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTERFAMILY,id);//家族配置表基本数据
                if(!baseData)   return;
                var tid = baseData[jsonTables.CONFIG_MONSTERFAMILY.Monsters][0];
                var iconRes = jsonTables.getJsonTableObj(jsonTables.TABLE.MONSTER,tid)[jsonTables.CONFIG_MONSTER.Icon];
                uiResMgr.loadHeadIcon(iconRes,iconNode);
                quality = baseData[jsonTables.CONFIG_MONSTERFAMILY.Quality];
                break;
            case constant.ItemType.BOX://宝箱
                uiResMgr.loadLockTreasureBox(id,iconNode);
                break;
            case constant.ItemType.RANDOM_HERO://随机碎片
            case constant.ItemType.RANDOM_HERO_MAX://随机碎片
                uiResMgr.loadHeadIcon( "random" + id,iconNode);
                if(qualityFrame){
                    qualityFrame.active = false;
                }
                if(qualityBase){
                    qualityBase.active = false;
                }
                refreshFrame = false;
                break;
            case constant.ItemType.RANDOM_REEL://随机卷轴碎片
            case constant.ItemType.RANDOM_REEL_MAX://随机卷轴碎片
                if(id >= 10){
                    id = id % 10;
                    iconNode.scale = 1.3;
                }
                uiResMgr.loadFragmentIcon("random"+id,iconNode);
                if(qualityFrame){
                    qualityFrame.active = false;
                }
                if(qualityBase) {
                    qualityBase.active = false;
                }
                refreshFrame = false;
                break;
            case constant.ItemType.ITEM:
                var baseData = jsonTables.getJsonTableObj(jsonTables.TABLE.ITEM,id);
                uiResMgr.loadCommonIcon("activity" + baseData[jsonTables.CONFIG_ITEM.ItemType], iconNode);
                break;
            case constant.ItemType.RANDOM_EQUIP:
                var randomIcon = Math.floor(id / 1000);
                uiResMgr.loadEquipIcon("random"+randomIcon,iconNode);
                if(qualityFrame){
                    qualityFrame.active = false;
                }
                if(qualityBase){
                    qualityBase.active = false;
                }
                refreshFrame = false;
                break;
        }
        if(refreshFrame){
            if(qualityFrame){
                qualityFrame.active = true;
                uiResMgr.loadQualityIcon(quality,qualityFrame);
            }
            if(qualityBase){
                uiResMgr.loadBaseQualityIcon(quality,qualityBase);
            }
        }
    };

    manager.createPrefabPool = function (prefab,size) {

        if(!this.isPool(prefab.name)){
            this[prefab.name + 'Pool'] = new cc.NodePool();
            this[prefab.name + 'Prefab'] = prefab;
            this.pools[prefab.name + 'Pool'] = this[prefab.name + 'Pool'];
        }

        size = size === undefined? 1:size;
        for (var k = 0; k < size; k++) {
            this[prefab.name + 'Pool'].put(cc.instantiate(prefab));
        }
    };

    manager.getPrefab = function (name, data) {
        var prefab = undefined;
        if(this.isPool(name)){
            var pool = this[name+'Pool'];
            if (pool.size() > 0) {
                prefab = pool.get();
            } else {
                prefab = cc.instantiate(this[name+'Prefab']);
            }
        }
        prefab.getComponent(name).init(data);
        return prefab;
    };

    manager.getPrefabEx = function (name) {
        var prefab = undefined;
        if(this.isPool(name)){
            var pool = this[name+'Pool'];
            if (pool.size() > 0) {
                prefab = pool.get();
            } else {
                prefab = cc.instantiate(this[name+'Prefab']);
            }
        }

        return prefab;
    };

    manager.getPrefabSelf = function (name) {
        return this[name+'Prefab'];
    };

    manager.putInPool = function (name, prefab) {
        var pool = this[name+'Pool'];
        if(pool){
            pool.put(prefab);
        }
    };

    manager.createPrefabPoolEx = function (prefab, count) {
        count = count === undefined? 1:count;
        var pool = this[prefab.name+'Pool'];
        if(pool){
            count -= pool.size();
        }
        this.createPrefabPool(prefab, count);
    };

    manager.putChildInPool = function (node) {
        if(!cc.isValid(node) || node.children.length === 0) return;

        var count = node.children.length;
        for(var i = count -1; i >= 0 ; i--){
            var child = node.children[i];
            if(!this.isPool(child.name)) continue;
            this.putChildInPool(child);
            this.putInPool(child.name, child);
        }
    };

    manager.isPool = function (name) {
        return this[name + "Pool"] && this[name + "Prefab"];
    };

    manager.releasePool = function () {
        for (var poolName in this.pools) {
            this.pools[poolName].clear();
            delete this.pools[poolName];
        }
    };

    manager.releaseTypeRes = function (type,name) {
        this.containerCache[type] = cc.js.createMap();//// NOTE: 将等待管道置空
        var container = this.container[type];
        switch (type) {
            case this.RTYPE.FIGHT_AUDIO:
                this._releaseFightAudio(container);
                break;
            case this.RTYPE.PREFAB:
                this._releasePrefab(name);
                break;
            default:

        }
        this.container[type] = {};
    };

    manager._releasePrefab = function (name) {
        var scene = this.getResource(this.RTYPE.PREFAB,name);
        if (!scene) return;
        var deps = cc.loader.getDependsRecursively(scene);
        cc.loader.release(deps);
        delete this.container[this.RTYPE.PREFAB][name];
    };

    manager._releaseFightAudio = function (container) {
        for (var key in container) {
            if (!container.hasOwnProperty(key)) continue;
            var audioObj = container[key];
            cc.audioEngine.uncache(audioObj);
        }
    };

    manager.releaseScene = function (sceneName) {
        var scene = this.getResource(this.RTYPE.SCENE,sceneName);
        if (!scene) return;
        var deps = cc.loader.getDependsRecursively(scene);
        for (var i = 0 , len = deps.length; i <  len; i++) {
            var obj = deps[i];
            if (cc.path.extname(obj) === ".png") {//暂时只释放贴图
                cc.loader.release(obj);
            }
        }
        delete this.container[this.RTYPE.SCENE][sceneName];
    };
    manager.getCurrencyName = function(id){
        switch (id) {
            case constant.Currency.GOLD:
                return  constant.Common.GOLD;
                break;
            case constant.Currency.DIAMOND:
                return  constant.Common.DIAMOND;
                break;
            case constant.Currency.RMB:
                return  constant.Common.RMB;
                break;
            default:

        }
    };
    /** 获取游戏内部 指定资源的base64字符串 */
    manager.getBase64Image = function (url,cb) {
        var pemUrl = cc.url.raw(url);
        if (cc.loader.md5Pipe) {//// NOTE:  只有勾选md5才有这个api  神一样的设定
            pemUrl = cc.loader.md5Pipe.transformURL(pemUrl);
        }
        var img = pemUrl;//imgurl 就是你的图片路径
        if (!document) return cb(null);
        function getBase64Image(img) {
             var canvas = document.createElement("canvas");
             canvas.width = img.width;
             canvas.height = img.height;
             var ctx = canvas.getContext("2d");
             ctx.drawImage(img, 0, 0, img.width, img.height);
             var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
             var dataURL = canvas.toDataURL("image/"+ext);
             return dataURL;
        }

        var image = new Image();
        image.src = img;
        image.setAttribute("crossOrigin",'Anonymous')
        image.onload = function(){
          var base64 = getBase64Image(image);
          cb(base64);
        }
    };
    manager.loadSubpackage  = function (name, callback) {

        if (!window.wx) {
            if (callback) {
                callback();
            }
            return;
        }
        if (this.subpackage[name]) {
            if (callback) {
                callback();
            }
            return;
        }
        cc.loader.downloader.loadSubpackage(name, function(err) {
            if (err) {
                // 加载子包失败，重启应用--
                if (window.wx) {
                    wx.showToast({
                        title: '网络错误，请重新进入游戏',
                        icon: 'none',
                        duration: 1500
                    });
                    wx.exitMiniProgram();
                }
                return console.error(err);
            }

            this.subpackage[name] = true;
            if (callback) {
                callback();
            }
        }.bind(this));
    };
    return manager;
};
