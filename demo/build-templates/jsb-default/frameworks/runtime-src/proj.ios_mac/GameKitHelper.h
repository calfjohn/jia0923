//
//  GameKitHelper.h
//  durak
//
//  Created by Aliens on 2017/6/6.
//
//

#ifndef GameKitHelper_h
#define GameKitHelper_h
#import "SUCacheItem.h"
#import "SUCache.h"
#import <GameKit/GameKit.h>
#import <AdSupport/ASIdentifierManager.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <FBSDKLoginKit/FBSDKLoginKit.h>
#import "cocos2d.h"
@interface GameKitHelper : NSObject
// 处理错误
@property (nonatomic, readonly) NSError* lastError;

// 初始化
+ (id) sharedGameKitHelper;

// Player authentication, info
+(void) authenticateLocalPlayer;

//call login
+ (void) loginGuide:(NSDictionary *)dict;
+ (void) loginIos:(NSDictionary *)dict;

+ (void)FBLogin:(NSDictionary *)dict;
+ (void)autoLoginWithToken:(FBSDKAccessToken *)token;
+ (void)newLogin;
//call getIDFV
+ (void) getIDFV:(NSDictionary *)dict;

@end
#endif /* GameKitHelper_h */
