//
//  CBiOSStoreManager.m
//  durak
//
//  Created by Aliens on 2017/6/9.
//
//
#import "ToolManager.h"
//引入头文件
#include "cocos/scripting/js-bindings/manual/ScriptingCore.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"


@implementation ToolManager

+ (BOOL)copyBoard:(NSString *)input{
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = input;
    return true;
};

@end
