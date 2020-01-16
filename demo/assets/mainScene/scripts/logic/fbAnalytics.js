/**
 * @Author: jyf
 * @Date:   2019-01-30T10:10:19+08:00
 * @Last modified by:   jyf
 * @Last modified time: 2019-01-30T10:10:19+08:00
 */

window["logic"]["fbAnalytics"] = function() {
    var module = {};

    module.init = function(){
        window.fbAnalytics = this;
        this.reset();//数据重置
    };

    module.reset = function(){

    };
    /**
     * 记录事件
     * @param  {int} type     ACEBOOKANALYTICS枚举类型
     * @param  {int} ext      额外参数
     * @param  {int} extParam 关卡子id
     */
    module.recored = function (type,ext,extParam) {
        var configObj = null;
        var configs = jsonTables.getJsonTable(jsonTables.TABLE.FACEBOOKANALYTICS);
        switch (type) {
            case tb.FACEBOOK_RECORED_PLAY_ANI:
            case tb.FACEBOOK_RECORED_END_ANI:
            case tb.FACEBOOK_RECORED_COMPLITY_GUIDE:
            case tb.FACEBOOK_RECORED_RGEISTER:
            case tb.FACEBOOK_RECORED_CHAPTER_JUMP:
                for (var i = 0 , len = configs.length; i <  len; i++) {
                    var obj = configs[i];
                    if (obj[jsonTables.CONFIG_ADJUSTRECORD.Type] === type) {
                        configObj = obj;
                        break;
                    }
                }
                break;
            default:
                for (var i = 0 , len = configs.length; i <  len; i++) {
                    var obj = configs[i];
                    if (obj[jsonTables.CONFIG_FACEBOOKANALYTICS.Type] === type) {
                        configObj = obj;
                        break;
                    }
                }
        }

        if (!configObj) {
            return ;
        }
        cc.log(configObj[jsonTables.CONFIG_FACEBOOKANALYTICS.EventID]);
    };

    //根据Type获取需要打点的数据
    module.getRecordByType = function (type) {
        var list = [];
        var configs = jsonTables.getJsonTable(jsonTables.TABLE.FACEBOOKANALYTICS);
        for (var i = 0; i < configs.length; i++) {
            var obj = configs[i];
            if(obj[jsonTables.CONFIG_FACEBOOKANALYTICS.Type] !== type) continue;
            list.push(obj);
        }

        return list;
    };

    return module;
};
