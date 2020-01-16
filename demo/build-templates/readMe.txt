热更新相关
main.js 热更新路径更新文件
jsb-default\frameworks\cocos2d-x\cocos\platform\android\java\src\org\cocos2dx\lib\Cocos2dxDownloader.java 安卓https下载支持

图片加密相关
jsb-default\frameworks\cocos2d-x\cocos\audio\android\mp3reader.cpp
jsb-default\frameworks\cocos2d-x\cocos\platform\CCImage.cpp
jsb-default\frameworks\cocos2d-x\cocos\platform\CCImage.h

spine动画原生换装
jsb-default\frameworks\cocos2d-x\cocos\editor-support\spine\Skeleton.c   换装实现文件
jsb-default\frameworks\cocos2d-x\cocos\editor-support\spine\Skeleton.h      换装实现文件
jsb-default\frameworks\cocos2d-x\cocos\editor-support\spine\SkeletonRenderer.cpp    换装实现文件
jsb-default\frameworks\cocos2d-x\cocos\editor-support\spine\SkeletonRenderer.h      换装实现文件

jsb-default\frameworks\cocos2d-x\cocos\scripting\js-bindings\auto\jsb_cocos2dx_spine_auto.cpp  c++与原生侨联文件
jsb-default\frameworks\cocos2d-x\cocos\scripting\js-bindings\auto\jsb_cocos2dx_spine_auto.hpp  c++与原生侨联文件
jsb-default\frameworks\cocos2d-x\cocos\scripting\js-bindings\auto\api\jsb_cocos2dx_spine_auto_api.js  api提示文件


安卓平台
jsb-default\frameworks\runtime-src\proj.android-studio\app\libs\*  这下面存放facebooksdk  通过build.gradle引用
jsb-default\frameworks\runtime-src\proj.android-studio\app\src\org\cocos2dx\javascript\FBLogin.java  facebook登陆实现
jsb-default\frameworks\runtime-src\proj.android-studio\app\src\org\cocos2dx\javascript\AppActivity.java  js层调用通用入口

jsb-default\frameworks\runtime-src\proj.android-studio\app\google-services.json  谷歌登陆json文件
jsb-default\frameworks\runtime-src\proj.android-studio\app\src\main\aidl\com\android\vending\billing\IInAppBillingService.aidl 谷歌支付组件
jsb-default\frameworks\runtime-src\proj.android-studio\app\src\com\android\trivialdrivesample\util\* 谷歌支付组件
jsb-default\frameworks\runtime-src\proj.android-studio\build.gradle  定制谷歌服务


ios平台
jsb-default\frameworks\runtime-src\proj.ios_mac\Bolts.framework		FBSDK库
jsb-default\frameworks\runtime-src\proj.ios_mac\FBSDKCoreKit.framework	FBSDK库
jsb-default\frameworks\runtime-src\proj.ios_mac\FBSDKLoginKit.framework	FBSDK库
jsb-default\frameworks\runtime-src\proj.ios_mac\zCode.xcodeproj		ios包项目构建配置
jsb-default\frameworks\runtime-src\proj.ios_mac\CBiOSStoreManager.h	ios内购支持
jsb-default\frameworks\runtime-src\proj.ios_mac\CBiOSStoreManager.mm	ios内购支持
jsb-default\frameworks\runtime-src\proj.ios_mac\GameKitHelper.h		ios GameCentent、游客以及FB登陆
jsb-default\frameworks\runtime-src\proj.ios_mac\GameKitHelper.metal	ios GameCentent、游客以及FB登陆
jsb-default\frameworks\runtime-src\proj.ios_mac\GameKitHelper.mm	ios GameCentent、游客以及FB登陆
jsb-default\frameworks\runtime-src\proj.ios_mac\ToolManager.h		ios 原生工具类 （复制）
jsb-default\frameworks\runtime-src\proj.ios_mac\ToolManager.mm		ios 原生工具类 （复制）
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\Images.xcassets	管理App中用到的图片资源
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\AppController.h	APP加载控制器
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\AppController.mm	APP加载控制器
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\Info.plist		元信息管理 新增FBSDK元信息
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\RootViewController.h	App视窗控制器
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\RootViewController.mm	App视窗控制器
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\SUCache.h		FB自动登陆，无需再次请求权限
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\SUCache.m		FB自动登陆，无需再次请求权限
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\SUCacheItem.h	FB自动登陆，无需再次请求权限
jsb-default\frameworks\runtime-src\proj.ios_mac\ios\SUCacheItem.mm	FB自动登陆，无需再次请求权限