//
//  GameKitHelper.m
//  durak
//
//  Created by Aliens on 2017/6/6.
//
//
#import "cocos2d.h"
#import "AppDelegate.h"
#import "platform/ios/CCEAGLView-ios.h"
#import "GameKitHelper.h"
#import "RootViewController.h"
#import <AdSupport/ASIdentifierManager.h>
#import "cocos-analytics/CAAgent.h"
//引入头文件
#include "cocos/scripting/js-bindings/manual/ScriptingCore.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
//使用

@interface GameKitHelper ()
<GKGameCenterControllerDelegate> {
    BOOL _gameCenterFeaturesEnabled;
}
@end

@implementation GameKitHelper
//使用
#pragma mark Singleton stuff

- (void)gameCenterViewControllerDidFinish:(GKGameCenterViewController *)gameCenterViewController{
    NSLog(@" gamecenterview controller call !!!!!!!!!!");
}

static UIViewController * currentGameCenterController = nil;
int handlerID = 0;
static GameKitHelper *s_sharedGameKitHelper = nullptr;
static bool isLoginGameCenter = false;

+(id) sharedGameKitHelper {
    if(s_sharedGameKitHelper != nullptr){
        return s_sharedGameKitHelper;
    }
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        s_sharedGameKitHelper =
        [[GameKitHelper alloc] init];
    });
    return s_sharedGameKitHelper;
}

+ (void)loginGuide:(NSDictionary *)dict{
    bool re = [[ASIdentifierManager sharedManager] isAdvertisingTrackingEnabled];
    NSString *idfv = nullptr;
    if (re == NO) {
        idfv = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    } else {
        idfv = [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString];
    }
    const char* userid = [idfv UTF8String];
    std::string jsCallStr = cocos2d::StringUtils::format("window.iosSdkLogic.loginGuideResultSucess(\"%s\");", userid);
    NSLog(@"jsCallStr = %s", jsCallStr.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());

}


+ (void)loginIos:(NSDictionary *)dict{
    NSLog(@"js call ocFounction succeed");
    if (isLoginGameCenter == true) {
        const char* userid = [[GKLocalPlayer localPlayer].playerID UTF8String];
        const char* name = [[GKLocalPlayer localPlayer].alias UTF8String];
        std::string jsCallStr = cocos2d::StringUtils::format("window.iosSdkLogic.loadCententResultSucess(\"%s\",\"%s\");", userid,name);
        NSLog(@"jsCallStr = %s", jsCallStr.c_str());
        se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
    } else {
        [[GameKitHelper sharedGameKitHelper] authenticateLocalPlayer];
    }
}
//弹出gamecenter登录界面
-(void) popGameCenterVC :(UIViewController *)viewController{
    currentGameCenterController = [[UIViewController alloc] init];
    UIWindow* window = [[UIApplication sharedApplication] keyWindow];
    [window addSubview:[currentGameCenterController view]];

    if ([[UIDevice currentDevice].systemVersion floatValue] < 6.0) {
        [currentGameCenterController presentModalViewController:viewController animated:YES];
    } else {
        [currentGameCenterController presentViewController:viewController animated: YES completion:nil];
    }
}
//关闭gamecenter登录界面
-(void) closeGameCenterVC{
    if( currentGameCenterController != nil){
        if ([[UIDevice currentDevice].systemVersion floatValue] < 6.0) {
            [currentGameCenterController dismissModalViewControllerAnimated:NO];
        } else {
            [currentGameCenterController dismissViewControllerAnimated:NO completion:nil];
        }

        [currentGameCenterController.view removeFromSuperview];
        [currentGameCenterController release];
        currentGameCenterController = nil;

    }
}

#pragma mark Player Authentication

-(void) authenticateLocalPlayer {

    GKLocalPlayer *localPlayer = [GKLocalPlayer localPlayer];
    localPlayer.authenticateHandler = ^(UIViewController *viewController, NSError *error){

        if (viewController != nil)
        {
             NSLog(@"444444444444444444444");
            //showAuthenticationDialogWhenReasonable: is an example method name. Create your own method that displays an authentication view when appropriate for your app.
            NSLog(@"成功   viewController");
             [s_sharedGameKitHelper presentViewController:viewController];
        }
        else if (localPlayer.isAuthenticated)
        {
            NSLog(@"start login gamecenter   成功");
            isLoginGameCenter = true;
            const char* userid = [[GKLocalPlayer localPlayer].playerID UTF8String];
            const char* name = [[GKLocalPlayer localPlayer].alias UTF8String];
            std::string jsCallStr = cocos2d::StringUtils::format("window.iosSdkLogic.loadCententResultSucess(\"%s\",\"%s\");", userid,name);
            NSLog(@"jsCallStr = %s", jsCallStr.c_str());
            se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());

        }
        else if (localPlayer.isUnderage){
            NSLog(@"you are isUnderage!!!");
             [s_sharedGameKitHelper loginGameCenterFail];
        }
        else
        {
            NSLog(@"you are isUnderage!!!");
             [s_sharedGameKitHelper loginGameCenterFail];
        }
    };

}

 -(void)loginGameCenterFail{
     NSLog(@"-------Show fail message----------\n");
     UIAlertView *alerView =  [[UIAlertView alloc] initWithTitle:NSLocalizedString(@"error",NULL) message:NSLocalizedString(@"GameCentent Unauthonrized",NULL)
                                                        delegate:nil cancelButtonTitle:NSLocalizedString(@"sure",nil) otherButtonTitles:nil];
     [alerView show];
     [alerView release];
     std::string jsCallStr ="window.iosSdkLogic&&window.iosSdkLogic.loadCententResultFail();";
     NSLog(@"jsCallStr = %s", jsCallStr.c_str());
     se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
 }

#pragma mark Property setters

-(void) setLastError:(NSError*)error {
    _lastError = [error copy];
    if (_lastError) {
        NSLog(@"GameCenter -- setLastError -- ERROR: %@", [[_lastError userInfo]
                                                           description]);
    }
}

#pragma mark UIViewController stuff

-(UIViewController*) getRootViewController {
    return [UIApplication
            sharedApplication].keyWindow.rootViewController;
}

-(void)presentViewController:(UIViewController*)vc {
    UIViewController* rootVC = [self getRootViewController];
    [rootVC presentViewController:vc animated:YES
                       completion:nil];
}

+ (void)FBLogin:(NSDictionary *)dict {
    NSInteger slot = 0;
    FBSDKAccessToken *token = [SUCache itemForSlot:slot].token;
//    [SUCache deleteItemInSlot:slot];
//    [FBSDKAccessToken setCurrentAccessToken:nil];
//    [FBSDKProfile setCurrentProfile:nil];
//    [self newLogin];
    if (token) {
        [self autoLoginWithToken:token];
    }
    else {
        [self newLogin];
    }

}
+ (void)autoLoginWithToken:(FBSDKAccessToken *)token {
    [FBSDKAccessToken setCurrentAccessToken:token];
    NSDictionary * params =@{@"fields":@"id,name,email,age_range,first_name,last_name,gender,picture"};
    FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]
                                  initWithGraphPath:@"me"
                                  parameters:params
                                  HTTPMethod:@"GET"];
    [request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection,
                                          id result,
                                          NSError *error) {
        //token过期，删除存储的token和profile
        if (error) {
            NSLog(@"The user token is no longer valid.");
            NSInteger slot = 0;
            [SUCache deleteItemInSlot:slot];
            [FBSDKAccessToken setCurrentAccessToken:nil];
            [FBSDKProfile setCurrentProfile:nil];
            [self newLogin];
        }
        //做登录完成的操作
        else {
            const char *name = [[result objectForKey:@"name"] UTF8String];
            const char *userid = [[result objectForKey:@"id"] UTF8String];
            const char *url = "";
            if([result objectForKey:@"picture"] && [[result objectForKey:@"picture"] objectForKey:@"data"] && [[[result objectForKey:@"picture"] objectForKey:@"data"] objectForKey:@"url"]){
                url = [[[[result objectForKey:@"picture"] objectForKey:@"data"] objectForKey:@"url"] UTF8String];
            }
            std::string jsCallStr = cocos2d::StringUtils::format("window.iosSdkLogic.loginFaceBookResultSucess(\'%s\',\'%s\',\'%s\');", userid,name,url);
            NSLog(@"jsCallStr = %s", jsCallStr.c_str());
            se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
        }
    }];
}

+ (void)newLogin {
    FBSDKLoginManager *login=[[FBSDKLoginManager alloc] init];
//    [login logOut];
//    UIViewController *viewControl = [UIApplication
//                                     sharedApplication].keyWindow.rootViewController;
    [login logInWithReadPermissions: @[@"public_profile"] fromViewController:nil handler:^(FBSDKLoginManagerLoginResult *result, NSError *error) {
        if (error) {
            NSLog(@"Unexpected login error: %@", error);
            std::string jsCallStr ="window.iosSdkLogic&&window.iosSdkLogic.loginFaceBookResultFail();";
            NSLog(@"jsCallStr = %s", jsCallStr.c_str());
            se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
        }else{
            if(result .isCancelled){
                NSLog(@"Unexpected login isCancelled");
                std::string jsCallStr ="window.iosSdkLogic&&window.iosSdkLogic.loginFaceBookResultFail();";
                NSLog(@"jsCallStr = %s", jsCallStr.c_str());
                se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
            }else{
                NSLog(@"Unexpected login success");
                NSDictionary * params =@{@"fields":@"id,name,email,age_range,first_name,last_name,gender,picture"};
                FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]
                                              initWithGraphPath:result.token.userID
                                              parameters:params
                                              HTTPMethod:@"GET"];
                [request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection,
                                                      id result,
                                                      NSError *error) {
                    const char *name = [[result objectForKey:@"name"] UTF8String];
                    const char *userid = [[result objectForKey:@"id"] UTF8String];
                    const char *url = "";
                    if([result objectForKey:@"picture"] && [[result objectForKey:@"picture"] objectForKey:@"data"] && [[[result objectForKey:@"picture"] objectForKey:@"data"] objectForKey:@"url"]){
                        url = [[[[result objectForKey:@"picture"] objectForKey:@"data"] objectForKey:@"url"] UTF8String];
                    }
                    auto glview = (__bridge CCEAGLView*)(cocos2d::Director::getInstance()->getOpenGLView()->getEAGLView());
                    auto currentView = [[[[UIApplication sharedApplication] keyWindow] subviews] lastObject];
                    if (glview == currentView) {
                        cocos2d::Application::getInstance()->applicationWillEnterForeground();
                    }
                    if (CAAgent.isInited) {
                        [CAAgent onResume];
                    }
                    std::string jsCallStr = cocos2d::StringUtils::format("window.iosSdkLogic.loginFaceBookResultSucess(\'%s\',\'%s\',\'%s\');", userid,name,url);
                    NSLog(@"jsCallStr = %s", jsCallStr.c_str());
                    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
                }];
            }

        }
//        UIViewController* rootVC = [UIApplication sharedApplication].keyWindow.rootViewController;
//        [rootVC didReceiveMemoryWarning];
    }];
}

@end
