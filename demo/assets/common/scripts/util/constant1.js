/**
 * Created by jiang on 2017/11/22.
 */
window.constant = window.constant || {};

constant.LanguageType = {
    ZH:"zh",//简体
    CN:"cn",//繁体
    EN:"en",//英文
};

constant.AttrInfoType = {
    FLOOD:1,
    DAMAGE:2,
    PHYATK:3,
    MAGATK:4,
    PHYDEF:5,
    MAGDEF:6,
};

constant.PlayerSex = {
    BOY:1,
    GIRL:2,
};

constant.EquipType = {
    WEAPON:1,
    HELM:2,
    CLOTHES:3,
    PANTS:4,
    SHOE:5,
    CUFF:6,
    MODEL_WEAPON:7,
    MODEL:8,
    HEAD:9
};

constant.ShopType = {
    GOLD:1,
    DIAMOND:2,
    EQUIP:4,
    BOX:6,
    VIT:7,
    MONCARD:15,
    ACTIVITY:17,
    NEWBOX:19,
    EQUIPBOX:23,//装备抽取
    SCORE:99
};
/**
 * [topHead 的样式枚举]
 */
constant.TopHeadStatus = {
    CLOSE: 0,
    SCENE:1,
    PANEL:2,
    CHAPTER:3,
    NOVIT:4,
    NOEXP:5,
    UNCLOSE:6,
    NOVITEXP:7,
    DEBRIS:8
};

constant.TalentIconType = {
    TREE:1,//天赋树，所有职业
    DETAIL:2,//某个职业天赋树
};

constant.NumType = {
    MILLION:1000000,//百万
    TEN:10000,//万
};

constant.CareerStatus = {
    UNLOCK:1,//已解锁
    LVLOCK:2,//等级未达到
    PROLOCK:3,//先二转
};

constant.FriendTag = {
    FRIEND:0,
    FIND:1,
    ADDLIST:2,
};

constant.RTextFuncType = {
    NAME:1
};

constant.ChatInfoType = {
    SYS:0,
    WORLD:1,
    PRIVATE:2,
};

constant.ChatPrefabName = {
    DEFAULT:"chatItem",
    MINI:"uiChatItem",
};

constant.SignStatus = {
    RECEICED:1,//已领取
    GETREWARD:2,//可领取
    UNGET:3,//不可领取
};

constant.ToggleType = {
    ALL:0,//全部
    SOLDIER:1,//战士
    TANK:2,//坦克
    SHOT:3,//射手
};

constant.SettingStatus = {
    CLOSE:0,
    OPEN:1,
};
constant.RankType = {
    GROW:0,     //成长值
    LEVEL:1,     //等级
    AREAN:2,    //竞技场
    MINI:3     //小游戏
};
constant.MainEffect = {
    BOSS:0,
    ARENA:1,
    MINE:2
};
