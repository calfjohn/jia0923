
window["basic"] =  window["basic"] || {};
window["basic"]["overWrite"] = window["basic"]["overWrite"] || {}

var module = window["basic"]["overWrite"];
module.hackButton = function(callBack){
    cc.Button.prototype._onTouchEnded = function(event){
        if (!this.interactable || !this.enabledInHierarchy) return;
        if (this._pressed) {
            cc.Component.EventHandler.emitEvents(this.clickEvents, event);
            this.node.emit('click', this);
        }
        this._pressed = false;
        this._updateState();
        event.stopPropagation();
        callBack();
    };

    cc.Button.prototype.onDisable = function(){
        this._hovered = false;
        this._pressed = false;

        if (!CC_EDITOR) {
            this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

            this.node.off(cc.Node.EventType.MOUSE_ENTER, this._onMouseMoveIn, this);
            this.node.off(cc.Node.EventType.MOUSE_LEAVE, this._onMouseMoveOut, this);
        } else {
            this.node.off('spriteframe-changed');
        }
        if (!this._transitionFinished) {
            this._transitionFinished = true;
            if(!this.target)    return;
            this.target.scale = this._originalScale;
        }
    };
};
/**
 * 重定向方法
 * @param  {Object} obj      指定对象
 * @param  {String} funcName 方法名
 * @param  {function} callBack 执行回调
 */
module.reBindFuc = function(obj,funcName,callBack){
    var oldFunc = !obj[funcName] ? function(){}:obj[funcName].bind(obj);
    obj[funcName] = function(){
        oldFunc();
        callBack();
    }.bind(obj);
};

module.init = function(){
    //添加一个方法
    cc.Node.prototype.getInstance = function(prefab,active){
        if (!(prefab instanceof cc.Prefab)) return cc.error("arguments[0] must be prefab");
        var node = this.getChildByName(prefab.name);
        if (!node && active) {
            if (uiResMgr.isPool(prefab.name)) {
                node = uiResMgr.getPrefabEx(prefab.name);
            }else {
                node = cc.instantiate(prefab);
            }
            node.name = prefab.name;
            node.parent = this;
        }
        if (node) {
            node.active = active;
        }
        return node;
    };
    if (!CC_EDITOR) {
        var oldPreload = cc.Label.prototype.__preload;
        cc.Label.prototype.__preload = function(){
            if(this.font && this.font.name !== "gamefont_number" && this.font.name !== "numberMain" && this.font.name !== "termNumber" && this.font.name !== "numberTerm"){
                var fontName = this.font.name;
                var flag = window.uiLang ? window.uiLang.language : "zh";
                var newFontName = "gamefont_all_" + flag + fontName.slice(fontName.length - 1);
                if(newFontName !== fontName){
                    jsonTables.reSetSize(this);
                    this.replaceFont = newFontName;
                    this.font = null;

                    if (cc.sys.isNative) {// && !CC_DEBUG
                        this.lastColor = this.node.color;
                        this.node.color = cc.color("#797ca0");
                    }

                    this.string = "";//
                }
            }
            // oldPreload.call(this,arguments);
        };
    }
    //添加一个事件方法
    cc.Node.prototype.dispatchDiyEvent = function(eventName,data){
        if (typeof eventName !== "string") return false;
        var ev = new cc.Event.EventCustom(eventName, true);//通知上层来个坟头把
        ev.setUserData(data);
        this.dispatchEvent(ev)
        return true;
    };

    cc.Node.prototype.setLocalZOrderEx = function(idx){
        this.zIndex = idx;
    };
    /** 区别于concat  是concat会返回 一个新数组  本方法便于引用传递 */
    Array.prototype.concatSelf = function(list) {
        for (var i = 0 , len = list.length; i <  len; i++) {
            var obj = list[i];
            this.push(obj);
        }
        return this;
    };
    /** 区别于concat  是concat会返回 一个新数组  本方法便于引用传递 插值在头部*/
    Array.prototype.concatSelfShift = function(list) {
        for (var i = list.length - 1 ; i >= 0; i--) {
            var obj = list[i];
            this.unshift(obj);
        }
        return this;
    };

};

module.getParameterByName = function(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

module.showMemory = function () {
    let afterVisit = function () {
      let count = 0;
      let totalBytes = 0;
      let locTexrues = cc.textureCache._textures;

      for (let key in locTexrues) {
          let selTexture = locTexrues[key];
          count++;
          totalBytes += selTexture.getPixelWidth() * selTexture.getPixelHeight() * 4;
      }

      let locTextureColorsCache = cc.textureCache._textureColorsCache;

      for (let key in locTextureColorsCache) {
          let selCanvasColorsArr = locTextureColorsCache[key];
          for (let selCanvasKey in selCanvasColorsArr) {
              let selCanvas = selCanvasColorsArr[selCanvasKey];
              count++;
              totalBytes += selCanvas.width * selCanvas.height * 4;
          }
      }
         cc.log("  Memory  " + (totalBytes / (1024.0 * 1024.0)).toFixed(2) + " M")
      }

    cc.director.on(cc.Director.EVENT_AFTER_VISIT, afterVisit);
};

module.init();
