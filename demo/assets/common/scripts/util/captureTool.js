window["util"] = window["util"] || {};
window["util"]["captureTool"] = function () {
    var module = {};

    module.init = function(){
        window.captureTool = this;
        this.nativeCapNode = null;
        this.renderTag = 10086;
        // cc.Director.EVENT_PROJECTION_CHANGED cc.Director 投影变化的事件。
        // cc.Director.EVENT_BEFORE_SCENE_LOADING 加载新场景之前所触发的事件。
        // cc.Director.EVENT_AFTER_SCENE_LAUNCH 运行新场景之后所触发的事件。
        // cc.Director.EVENT_BEFORE_UPDATE 每个帧的开始时所触发的事件。
        // cc.Director.EVENT_AFTER_UPDATE 将在引擎和组件 “update” 逻辑之后所触发的事件。
        // cc.Director.EVENT_BEFORE_VISIT 访问渲染场景树之前所触发的事件。
        // cc.Director.EVENT_AFTER_VISIT 访问渲染场景图之后所触发的事件，渲染队列已准备就绪，但在这一时刻还没有呈现在画布上。
        // cc.Director.EVENT_AFTER_DRAW 渲染过程之后所触发的事件。
    };

    module.setNativeNode = function(nativeCapNode){
        this.nativeCapNode = nativeCapNode;
    };

    module.captureForNative = function(callBack){
        if (!this.nativeCapNode) {
            return null;
        }
        var visitNode = this.nativeCapNode;
        var renderTexture = cc.RenderTexture.create(this.nativeCapNode.width,this.nativeCapNode.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);
        //把 renderTexture 添加到场景中去，否则截屏的时候，场景中的元素会移动
        visitNode._sgNode.addChild(renderTexture);
        //把 renderTexture 设置为不可见，可以避免截图成功后，移除 renderTexture 造成的闪烁
        renderTexture.setVisible(false);
        //实际截屏的代码
        renderTexture.begin();
        //this.node 是我们要截图的节点,当前是全屏截图
        visitNode._sgNode.visit();
        renderTexture.end();
        var texture = renderTexture.getSprite().getSpriteFrame().getTexture();
        var spriteFrame = new cc.SpriteFrame(texture);
        callBack(spriteFrame);//NOTE 纹理数据是反过来的
        renderTexture.removeFromParent();

    };

    module.captureForWeb = function(callBack){
        //web截图功能
        var canvas = document.getElementById("GameCanvas");
        var base64 = canvas.toDataURL("image/jpeg");
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = base64;
        img.onload = function () {
            var texture = new cc.Texture2D();
            texture.initWithElement(img);
            texture.handleLoadedTexture();
            var spriteFrame = new cc.SpriteFrame(texture);
            callBack(spriteFrame);
        }.bind(this);
    };

    module.capture = function(callBack){
        var captureCall = function(){
            if (cc.sys.isNative) {
                this.captureForNative(callBack);
                return;
            }
            this.captureForWeb(callBack);
        }.bind(this);
        // if (cc.sys.isNative) {
        //     callBack(null);
        //     return;
        // }
        var eventType = cc.sys.isNative ? cc.Director.EVENT_AFTER_DRAW :cc.Director.EVENT_AFTER_DRAW;
        cc.director.once(eventType, captureCall.bind(this));
    };

    module.copyBoard = function(inputValue){
        let input = new String(inputValue);
        if (cc.sys.isNative) {
            return this.copyBoardForNative(input);
        }
        return this.copyBoardForWeb(input);
    };
    //web copy必须是字符串 int不会拷贝
    module.copyBoardForWeb = function(input){
        if (!document) return false;
        const el = document.createElement('textarea');
        el.value = input;
        // Prevent keyboard from showing on mobile
        el.setAttribute('readonly', '');

        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS

        const selection = getSelection();
        let originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }

        document.body.appendChild(el);
        el.select();

        // Explicit selection workaround for iOS
        el.selectionStart = 0;
        el.selectionEnd = input.length;

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {}

        document.body.removeChild(el);

        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        return success;

    };
    /** 原生复制 */
    module.copyBoardForNative = function (input) {
        if (!cc.sys.isNative) return false;
        if (cc.sys.os === cc.sys.OS_ANDROID) {

        }else if(cc.sys.os === cc.sys.OS_IOS) {

        }
        return false;
    };

    return module;
};
