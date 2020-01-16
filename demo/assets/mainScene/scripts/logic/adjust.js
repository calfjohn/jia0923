/**
 * @Author: lich
 * @Date:   2018-07-20T10:22:50+08:00
 * @Last modified by:   lich
 * @Last modified time: 2018-07-20T10:23:39+08:00
 */

window["logic"]["adjust"] = function() {
    var module = {};
    var network = null;
    var loginLogic = null;
    var userLogic = null;
    module.init = function(){
        window.adjustUtil = this;
        network = kf.require("util.network");
        loginLogic = kf.require("logic.login");
        userLogic = kf.require("logic.user");
        this.reset();//数据重置
    };

    module.reset = function(){

    };
    /**
     * 记录事件
     * @param  {int} type     adjstReward枚举类型
     * @param  {int} ext      额外参数
     * @param  {int} extParam 关卡子id
     */
    module.recored = function (type,ext,extParam) {
        if(type === undefined)  return;
        var configObj = null;
        var configs = jsonTables.getJsonTable(jsonTables.TABLE.ADJUSTRECORD);
        switch (type) {
            case tb.ADJUST_RECORED_UI:
            case tb.ADJUST_RECORED_ALL_CHAPTER:
            case tb.ADJUST_RECORED_LV_UP:
            case tb.ADJUST_RECORED_EQUIP_GET:
            case tb.ADJUST_RECORED_NEWFAMILY_GET:
            case tb.ADJUST_RECORED_FAIL:
            case tb.ADJUST_RECORED_PLAY_ANI:
            case tb.ADJUST_RECORED_EQUIP_OPEN:
            case tb.ADJUST_RECORED_SAND_TABLE:
            case tb.ADJUST_RECORED_BOX:
            case tb.ADJUST_RECORED_START_CHAPTER:
                for (var i = 0 , len = configs.length; i <  len; i++) {
                    var obj = configs[i];
                    if (obj[jsonTables.CONFIG_ADJUSTRECORD.Type] === type
                        && ext === obj[jsonTables.CONFIG_ADJUSTRECORD.Param]
                    ) {
                        configObj = obj;
                        break;
                    }
                }
                break;
            case tb.ADJUST_RECORED_ONE_CHAPTER:
            case tb.ADJUST_RECORED_REEL_USE:
            case tb.ADJUST_RECORED_DUNGEON_ENTRANCE:
            case tb.ADJUST_RECORED_PREVIEW:
            case tb.ADJUST_RECORED_FIRST_TABLE:
                for (var i = 0 , len = configs.length; i <  len; i++) {
                    var obj = configs[i];
                    if (obj[jsonTables.CONFIG_ADJUSTRECORD.Type] === type
                        && ext === obj[jsonTables.CONFIG_ADJUSTRECORD.Param]
                        && extParam === obj[jsonTables.CONFIG_ADJUSTRECORD.ParamExt]
                    ) {
                        configObj = obj;
                        break;
                    }
                }
                break;

            default:
                for (var i = 0 , len = configs.length; i <  len; i++) {
                    var obj = configs[i];
                    if (obj[jsonTables.CONFIG_ADJUSTRECORD.Type] === type) {
                        configObj = obj;
                        break;
                    }
                }
        }
        if (!configObj) {
            return ;
        }
        var extMsg = 0;
        if (tb.ADJUST_RECORED_CHARGE === type) {
            extMsg = ext;
        }
        var data = {
            "Req_Client_Dot": {
                'Key':configObj.Type,
                'Arg1':configObj.Param,
                'Arg2':configObj.ParamExt,
            }
        };
        network.send(data,true);

        if(window.tg){
            var uid = window["clientConfig"]["loginRespone"].uid;
            var channel = window["clientConfig"]["loginRespone"].channel;
            var level = userLogic.getBaseData(userLogic.Type.Lv);
            var userID = Number(userLogic.getBaseData(userLogic.Type.UserID)) + "";
            var data = {
                type:configObj.Type,
                param:configObj.Param,
                paramExt:configObj.ParamExt,
                uid:uid,
                channel:channel,
                role_id:userID,
                level:level
            };
            tg.track("recored",{type:configObj.Type,param:configObj.Param,paramExt:configObj.ParamExt});
        }
        // loginLogic.tgaTrack("recored",[configObj.Type,configObj.Param,configObj.ParamExt]);

    };

    //根据Type获取需要打点的数据
    module.getRecordByType = function (type) {
        var list = [];
        var configs = jsonTables.getJsonTable(jsonTables.TABLE.ADJUSTRECORD);
        for (var i = 0; i < configs.length; i++) {
            var obj = configs[i];
            if(obj[jsonTables.CONFIG_ADJUSTRECORD.Type] !== type) continue;
            list.push(obj);
        }

        return list;
    };

    return module;
};
