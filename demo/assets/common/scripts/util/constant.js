/**
 * Created by jiang on 2017/11/22.
 */
window.constant = window.constant || {};

//cocos 动画机
constant.AnimationState = {
    PLAY:"play",
    STOP:"stop",
    PAUSE:"pause",
    RESUME:"resume",
    LASTFRAME:"lastframe",
    FINISHED:"finished",
};

constant.AudioID = {
    MAIN_BG:1,
    BTNCLICK:2,
    ACHIGET:5,
    OPENBOX:3,
    ROLELVUP:4,
    REWARDFLY:6,
    HINT:8,
    COMMONREWARD:10,
    CHAPTERREWARD:11,
    BOXGET:12,
    EXPGET:13,
    EQUIPWEAR:14,
    EQUIPUP:15,
    SMELTCUT:16,
    SMELTGET:17,
    SHOPOPEN:18,
    BUY:19,
    MAILDELETE:20,
    MONSTERGATHER:21,
    MONSTERCHIP:22,
    MONSTERGET:23,
    PORTAL:24,
    VICTORY:25,
    DEFEAT:26,
    SELECTED:27,//沙盘选中音效
    MINE_UP:32,
    ARENA_VICTORY:33,
    ARENA_DEFEAT:34,
    SUMMON:35,
    COMPOSE_DEFAULT:50,
    BATTLE_BG:56,
    SAND_SAME_TIP:57
};

constant.SceneID = {
    NONE:0,
    LOGIN:1,
    MAIN:2,
    FIGHT:3,
    MINI_GAME:4,
};

constant.SceneName = {};
constant.SceneName[constant.SceneID.LOGIN] = "loginScene";
constant.SceneName[constant.SceneID.MAIN] = "mainScene";
constant.SceneName[constant.SceneID.FIGHT] = "fightScene";
constant.SceneName[constant.SceneID.MINI_GAME] = "miniScene";

constant.FightState = {
    NONE:0,
    SANDBOX:1,
    DISPLAY:2,
    GAMEOVER:3,
};

constant.FightType = {
    PVE:1,
    PVP_AREAN:2,
    MINE_READY:3,
    MINE_FIGHT:4,
    MINI_GAME:5,
    WORLD_BOSS:6,
    GUIDE_FIGHT:7,
    SHARE_FIGHT:8,
};

constant.FightMonsterFrom = {
    CREATER:0,//玩家手动创造 默认类型
    BUFF:1,//由buff产生的怪物
    REEL:2,//卷轴产生的怪物
    PASSIVESKILL:4,//由被动技能产生
};

constant.MINE_FIGHT_TYPE = {
    DIRECT:1,
    SANDBOX:2
};

constant.StateMachine = {
    FIND:0,
};

constant.MonsterType = {
    PLAYER:0,
    WARRIOR:1,
    TANK:2,
    SHOOTER:3,
    ALL:4,//所有家族
};

constant.DamageType = {
    NONE:0,//无类型
    FAR:1,//远程
    NEAR:2,//近战
    SKILL:3,//技能
    ALL:4,//任意来源
    NORMAL_ATK:5,//普通攻击
    BUFF:6//buff
};

constant.MsgHanderType = {
    NEW_DAMAGE:1,//占位
    START_DISPLAY:2,//开始你的表演
    DISPLAY_SPEED:3,//加快表演速度
    ATK_CREATE:4,//构造攻击消息
    ATK_AGAIN:5,//重复攻击
    DISPLAY_STOP_RESUME:6,//游戏暂停与继续
    WAITE_WAVE:7,//等待下一轮
    SKILL_START:8,//技能释放
    SKILL_END:9,//技能释放结束
    SKILL_DAMAGE:10,//技能伤害
    BUFF_ADD:11,//添加一个buff
    BUFF_REMOVE:12,//移除一个buff
    SKILL_HEAL:13,//产生治疗
    SKILL_HITBACK:14,//击退技能
    CLEAN_MSGLIST:15,//清空消息管道
    BUFF_DOT:16,//buffdot回调
    REMOVE_BULLET:17,//移除指定子弹
    GUIDE_ACTION:18//引导行为
};

constant.AdvType = {
    GAME:1,
    DAILY:2
};

constant.ItemType = {
    CARD:-1,
    GOLD:1,
    DIAMOND:2,
    HERO:3,
    EQUIP:4,
    REEL:5,
    BOX:6,
    VIT:7,
    ROLE_ATT:8,//主角属性
    RANDOM_HERO:9,//随机碎片
    ITEM: 10, //道具,包括活动道具之类的
    RANDOM_REEL:11,//随机卷轴
    RANDOM_REEL_MAX:12,//随机卷轴,根据最高品质
    RANDOM_HERO_MAX:13,//随机碎片
    EXP:14,//主角经验
    ADVENTURE:16,//用于关卡中奖励区分奇遇事件
    ACT_ITEM:17, //活动商品
    RANDOM_EQUIP:18, //随机装备
    NEWBOX:19, //新抽卡
    DAILY_ACTIVITY:20,//每日活跃度
    PUBLICPRO:21,//通用怪物熟练度
    PUBLICLIP:22,//通用SSS碎片
    EQUIPBOX:23//装备抽取
};

constant.Common = {
    GOLD:"gold",
    DIAMOND:"diamond",
    RMB:"rmb",
    VIT:"vit",
    EXP:"exp",
    PUBLICPRO:"publicPro",
    DAILY_ACTIVITY:"dailyActivity",
    PUBLICLIP:"debris"
};

constant.Currency = {
    GOLD:1,
    DIAMOND:2,
    RMB:3,
    VIT:4,
    PUBLICLIP:5
};

constant.StateEnum = {
    NONE:0,
    MOVE:1,
    WAITE:2,
    ATK:3,
    DEAD:4,
    FIND:5,
    DIZZY:6,
    SKILL:7,
    RETURN:8,
    WIN:9
};

/**  [SpeData 中的类型枚举] */
constant.TableSpecialInfo = {
    LOCK:1
};

 constant.AddBaseData = {
     PdBase:0,
     MdBase:1,
     PsBase:2,
     MsBase:3,
     Range:4,
     Hp:5,
     Ctit:6,
     HpPer:7,//血量百分比
     DamagePer:8,//伤害百分比
 };

 constant.MiniGameFromSource = {
     None:0,
     Copy:1,
     DairyCow:2,
 };
//被动技能衍生技能
constant.PassiveSkill2Born = {
     Overlying_damge:-1070,//累计伤害衍射技能
     Speech_damge:-1023,//嗜血衍生技能
     Chasing_damge:-1026,//追击衍生技能
};
/**基础数值键值 */
constant.FormmulaBaseKey = {
    Hp:1,
    Damage:2,
    PbBase:3,
    MbBase:4,
    PdBase:5,
    MdBase:6,
};


//血量异常状态
constant.MonState = {
    Normal: 1,//正常
    Dead_Immuno: 2,//血量异常 处于免疫状态
    Heal_Immuno: 3,//免疫且吸血
    Role_Immuno: 4,//主角免疫
    CritAtk_Immuno: 5, //暴击免疫
};
//红点枚举
constant.RedDotEnum = {
    SiginIn:1,
    Mail:2,
    DailyTask:3,
    Achi:4,
    Vip:5,
    Week:6
};

//登陆上次登陆枚举
constant.LastLoginMode = {
    None:0,//没有
    Andoid_Google:1,//安卓谷歌登陆
    Andoid_Guide:2,//安卓游客登陆
    FaceBook_H5:3,//非死不可
    Ios_GameCenter:4,//Ios_GameCenter登陆
    Ios_Guide:5,//ios游客登陆
    FaceBook_Android:6,//Android fb登陆
    FaceBook_Ios:7,//Ios fb登陆
    HIHO_Android:8,//Android hihoSDK登陸
    HIHO_Ios:9,//Ios hihoSDK登陸
    WX:10,
    SDW:11
};


constant.Id_Type = cc.Enum({
    NONE:0,
    STONE: 1,//石头
    MONSTER: 2,//怪物
    SPECIAL_LAST_COUNT: 4,//次数耗尽触发  消除条件 次数耗尽
    CLICK_EFFECT: 5,//点击触发  消除条件 点击
    SPECIAL_COUNT: 6,//每次触发，消除条件 次数耗尽
    SPECIAL_ROUND: 7,//每次触发，消除条件 回合耗尽
    SPECIAL_LAST_ROUND: 8,//最后一回合，消除条件 回合耗尽
    SPECIAL_STONE_ROUND: 9,//次数耗尽，消除条件 次数耗尽
});


constant.LoginState = {
    Choise:1,
    Hide:2
};
//引导界面模式
constant.Guide_Mode = {
    Mask:1,
    Finger:2,
    FingerAndMask:3,
    NeterRule:4
};
//功能映射id
constant.FunctionTid = {
    RANK:1,//排行榜
    MAIL:2,//邮箱
    LINEUP:3,//战队
    REEL:4,//卷轴
    TREASURE_MAP:5,//藏宝图
    MINE:6,//夺矿
    SUMMON:7,//我是消除王
    WORLD_BOSS:8,//世界BOSS
    TREASURE_LAND:9,//宝藏岛
    HETE_CRRACK:10,//异次元裂缝
    FUN_PUZZLE:11,//趣味解谜
    MOP_UP:12,//章节扫荡
    BRAVE_REWARD:13,//勇者悬赏令
    ENDLESS_EXPED:14,//无尽的远征
    MARKET_PLACE:15,//交易市场
    TALENT:16,//转职
    AREAN:17,//竞技场
    MON_TALENT:18,//觉醒界面是
};

constant.AchievementType = {
    OUT_B_MON:38,//绿色3个
    OUT_A_MON:39,//蓝色3个
    OUT_S_MON:40,//紫色1个
    OUT_SS_MON:41,//橙色1个
    FIGHT_POWER:44,//战斗达到某个值
    USE_SKILL:46,//使用技能
    MUTL_SUMMONE:47,//3以上的多消
};

constant.weekState = {
    CANT:0,//不可领
    CAN:1,//可领
    DONE:2,//已领
    TIME_OUT:3//已过期
};

//奖励领取状态
constant.RecState = {
    CANT:0,//不可领
    CAN:1,//可领
    DONE:2,//已领
    TIME_OUT:3//已过期--补签
};

// 0h5 支付 1 谷歌 2 ios内购 3 fb
constant.Pay_Platform = {
    H5:0,
    GOOGLE:1,
    IAP:2,
    FB:3,
    SDW:6,
};

constant.ItemPrefabName = {
    SAND_BOX_BG_EFFECT:"sandBoxItemBgEffect",
};

constant.LinkFromServer = {
    FACEBOOK:0,
    LINE:1,
};

constant.SandBoxDirecton = {
    NONE: 0,
    UP:1,
    LEFT:2,
    DOWN:3,
    RIGHT:4
};
//战报使用
constant.MineInfoType = {
    WIN : 0,//守卫成功
    FAIL : 1,//守卫失败
};

//战报使用
constant.MineInfoStatus = {
    UN_RECEIVE : 1,//守卫成功未领取
    RECEIVED : 2,//守卫成功已领取
    UN_ATTACK : 3,//守卫失败未反击
    WIN_ATTACK : 4,//守卫失败反击成功
    FAIL_ATTACK : 5//守卫失败反击失败
};

constant.MineInfoType = {
    WIN : 0,
    FAIL : 1
};

//请求跳转URL
constant.UrlType = {
    FB_GROUP_URL : 1,
    LINE_URL : 2
};

//品质string转换
constant.QualityEnum = {
    1: "B",
    2: "A",
    3: "S",
    4: "SS",
    5: "SSS",
    6: "SSSR"
};

//抽卡来源
constant.DrawCardSrcEnum = {
    ActDrawCard: 0,
    ShopDrawCard: 1,
    ShopDrawEquip: 2
};

//抽卡来源
constant.FirsType = {
    First: 0,
    Sprint:1,
    Luxuy:2
};

//签到状态
constant.SignState = {
    NONE:0,
    CANGET:1,
    GETED:2
};

//红包状态
constant.RedBagState = {
    HAVE:0,//有
    NONE:1,//没
    NONUM:2,//没次数
    OUTTIME:3//非活动时间
};
