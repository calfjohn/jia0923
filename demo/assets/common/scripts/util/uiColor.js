/**
 * @Author: lich
 * @Date:   2018-05-08T17:45:11+08:00
 * @Last modified by:
 * @Last modified time: 2018-11-27T14:46:20+08:00
 */

window.uiColor = window.uiColor || {};
// 通用字色
uiColor.white = cc.color("#ffffff"); // 白色
uiColor.blueGray = cc.color("#797ca0"); // 蓝灰色
uiColor.lightBlueGray = cc.color("#8f9ae6"); // 浅蓝灰
uiColor.lightGray = cc.color("#d1dcfc"); // 浅灰
uiColor.lightYellow = cc.color("#cab276"); // 浅黄色
uiColor.yellow = cc.color("#c59735"); // 黄色
uiColor.orange = cc.color("#dd7017"); // 橙色
uiColor.red = cc.color("#fd1d01"); // 红色
uiColor.darkRed = cc.color("#c01700"); // 暗红色
uiColor.green = cc.color("#3ed700"); // 绿色
uiColor.black = cc.color("#000000"); // 黑色
uiColor.gray = cc.color("#727272");

uiColor.grayChapter = cc.color("#696969");
uiColor.guideGrayChapter = cc.color("#4B4B4B");

uiColor.equipColor = {};
uiColor.equipColor.common = cc.color("#544118"); // 普通属性颜色
uiColor.equipColor.special = cc.color("#A422FF"); // 特殊属性颜色

uiColor.equipTitleColor = {};//装备名字颜色
uiColor.equipTitleColor.quality1 = cc.color("#ffffff");
uiColor.equipTitleColor.quality2 = cc.color("#72e398");
uiColor.equipTitleColor.quality3 = cc.color("#75c1f5");
uiColor.equipTitleColor.quality4 = cc.color("#a477ff");
uiColor.equipTitleColor.quality5 = cc.color("#ffd090");
uiColor.equipTitleColor.quality6 = cc.color("#ff5262");

uiColor.monInfo = {};
uiColor.monInfo.white = cc.color("#ffffff"); // 白色
uiColor.monInfo.gray = cc.color("#5E5E5E"); // 灰色
uiColor.monInfo.red = cc.color("#FF0F0F"); // 紅色
uiColor.miniItem = {};
uiColor.miniItem.gray = cc.color("#757575"); // 灰色
uiColor.miniItem.progressNormal = cc.color("#EDF6FF");
uiColor.miniItem.progressFull = cc.color("#EDFFEB");

uiColor.chapterItemClick = cc.color("#A8FFA0");//点击浮空岛颜色变化

uiColor.fightColor = {};
uiColor.fightColor.atkEnemy = cc.color("#84a9ff");//我方打敌方
uiColor.fightColor.beAtk = cc.color("#ff2522");//敌方打我方
uiColor.fightColor.violentAtk = cc.color("#FC6500");//暴击
uiColor.fightColor.healColor = cc.color("#3ed700");//回血

uiColor.fightColor.sandBoxColor = {};//沙盘状况颜色
uiColor.fightColor.sandBoxColor.lv1Color = cc.color("#ffffff");//1级别
uiColor.fightColor.sandBoxColor.lv2Color = cc.color("#BBFF8E");//2级别
uiColor.fightColor.sandBoxColor.lv3Color = cc.color("#8CD1FF");//3级别
uiColor.fightColor.sandBoxColor.lv4Color = cc.color("#DA89F8");//4级别
uiColor.fightColor.sandBoxColor.lv5Color = cc.color("#FFB56D");//5级别
uiColor.fightColor.sandBoxColor.numColorNormal = cc.color("#56B4F8");//正常数值
uiColor.fightColor.sandBoxColor.numColorlimit = cc.color("#f05446");//小于数值

uiColor.previewFrame = {};//形态颜色
uiColor.previewFrame.form1Color = cc.color("#ffffff");
uiColor.previewFrame.form2Color = cc.color("#7ed484");
uiColor.previewFrame.form3Color = cc.color("#6cc2f3");
uiColor.previewFrame.form4Color = cc.color("#d195ff");
uiColor.previewFrame.form5Color = cc.color("#f4bf6b");

uiColor.shareGmmeWordColor = {};//小游戏飘字颜色
uiColor.shareGmmeWordColor.lv1Color = cc.color("#ffffff");//一级
uiColor.shareGmmeWordColor.lv2Color = cc.color("#7ed484");//二级
uiColor.shareGmmeWordColor.lv3Color = cc.color("#6cc2f3");//三级
uiColor.shareGmmeWordColor.lv4Color = cc.color("#d195ff");//四级
uiColor.shareGmmeWordColor.lv5Color = cc.color("#f4bf6b");//五级

uiColor.areanPanel = {};
uiColor.areanPanel.gray =cc.color("#ebdfcb");

uiColor.talentPanel = {};
uiColor.talentPanel.gray =cc.color("#797ca0");
uiColor.talentPanel.green =cc.color("#1f9817");
uiColor.talentPanel.red = cc.color("#dc2727");
uiColor.talentPanel.spineUnlock = cc.color("#ffffff");
uiColor.talentPanel.spineLock = cc.color("#3D3D3D");

uiColor.mailItem = {};
uiColor.mailItem.title =cc.color("#785C30");

uiColor.fightReel = {};
uiColor.fightReel.normalGreen =cc.color("#0aff00"); //卷轴充足绿色
uiColor.fightReel.lessGray = cc.color("#b1b1b1"); //卷轴不足灰色


//签到状态颜色
uiColor.actSignSevent = {};
uiColor.actSignSevent.canRecTimeColor =cc.color("#574515"); //可签到天数颜色
uiColor.actSignSevent.canRecStateColor =cc.color("#574515"); //可签到状态颜色
uiColor.actSignSevent.canotRecColor =cc.color("#574515"); //不可签到天数和状态颜色

// rechargeSignItem
uiColor.actRechargeSignItem = {};
uiColor.actRechargeSignItem.timeoutColor = cc.color('#ababab');
uiColor.actRechargeSignItem.unDone = cc.color('#ec1411');
uiColor.actRechargeSignItem.canReceive = cc.color('#b5eb3f');
uiColor.actRechargeSignItem.received = cc.color('#2c882c');

uiColor.actRechargeSignItem.timeNomar = cc.color('#93271d');
uiColor.actRechargeSignItem.timeGray = cc.color('#838383');


//RichText专用字段颜色

uiColor.Str = {};//保存通用颜色字段，用于richText

uiColor.Str.yellow = "#FFD600";
uiColor.Str.lightGreen = "#70C78F";
uiColor.Str.sys = "#ed7e70";
uiColor.Str.player = "#7e613e";
uiColor.Str.other = "#7e613e"
//奇遇颜色
uiColor.adventure = {};
uiColor.adventure.addStr = "#3ed700";//增加色码
uiColor.adventure.desrStr = "#fd1d01";//减少色码

//限时召唤灰色
uiColor.drawCard = {};
uiColor.drawCard.gray = cc.color("#494949");
uiColor.drawCard.gift1 = cc.color("#FFDC26");
uiColor.drawCard.gift2 = cc.color("#FFA911");
uiColor.drawCard.gift3 = cc.color("#BA57FF");
