//
//  CBiOSStoreManager.m
//  durak
//
//  Created by Aliens on 2017/6/9.
//
//
#import <UIKit/UIKit.h>
#import <StoreKit/StoreKit.h>

#import "CBiOSStoreManager.h"
#import "AppController.h"
//引入头文件
#include "cocos/scripting/js-bindings/manual/ScriptingCore.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"


@implementation CBiOSStoreManager

static CBiOSStoreManager* _sharedInstance = nil;

+(CBiOSStoreManager*)sharedInstance
{
    @synchronized([CBiOSStoreManager class])
    {
        if (!_sharedInstance)
            [[self alloc] init];
        
        return _sharedInstance;
    }
    return nil;
}

+(id)alloc
{
    @synchronized([CBiOSStoreManager class])
    {
        NSAssert(_sharedInstance == nil, @"Attempted to allocate a second instance of a singleton.\n");
        _sharedInstance = [super alloc];
        return _sharedInstance;
    }
    return nil;
}

-(id)init {
    self = [super init];
    if (self != nil) {
        // initialize stuff here
    }
    return self;
}

-(void)initialStore
{
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
}
-(void)releaseStore
{
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

-(void)buy:(NSString*)buyProductIDTag
  quantity:(int) quilty
   orderid:(NSString *)order
    amount:(NSString *)amt
{
    
    [self requestProductData:buyProductIDTag];
    quantity = quilty ;
    orderId = [order retain];
    amount = [amt retain];
}

-(bool)CanMakePay
{
    return [SKPaymentQueue canMakePayments];
}

-(void)requestProductData:(NSString*)buyProductIDTag
{
    NSLog(@"---------Request product information------------\n");
    _buyProductIDTag = [buyProductIDTag retain];
    NSArray *product = [[NSArray alloc] initWithObjects:buyProductIDTag,nil];
    NSSet *nsset = [NSSet setWithArray:product];
    SKProductsRequest *request=[[SKProductsRequest alloc] initWithProductIdentifiers: nsset];
    request.delegate=self;
    [request start];
    [product release];
}

- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response{
    NSLog(@"-----------Getting product information--------------\n");
    NSArray *myProduct = response.products;
    NSLog(@"Product ID:%@\n",response.invalidProductIdentifiers);
    NSLog(@"Product count: %lu\n", (unsigned long)[myProduct count]);

    // populate UI
    for(SKProduct *product in myProduct){
        NSLog(@"Detail product info\n");
        NSLog(@"SKProduct description: %@\n", [product description]);
        NSLog(@"Product localized title: %@\n" , product.localizedTitle);
        NSLog(@"Product localized descitption: %@\n" , product.localizedDescription);
        NSLog(@"Product price: %@\n" , product.price);
        NSLog(@"Product identifier: %@\n" , product.productIdentifier);
    }
    SKPayment *payment = nil;
    //payment  = [SKPayment paymentWithProductIdentifier:_buyItemIDTag];
    //[_buyItemIDTag autorelease]
    //    switch (buyType) {
    //        case IAP0p99:
    //            payment  = [SKPayment paymentWithProductIdentifier:ProductID_IAP0p99];    //支付$0.99
    //            break;
    //        case IAP1p99:
    //            payment  = [SKPayment paymentWithProductIdentifier:ProductID_IAP1p99];    //支付$1.99
    //            break;
    //        case IAP4p99:
    //            payment  = [SKPayment paymentWithProductIdentifier:ProductID_IAP4p99];    //支付$9.99
    //            break;
    //        case IAP9p99:
    //            payment  = [SKPayment paymentWithProductIdentifier:ProductID_IAP9p99];    //支付$19.99
    //            break;
    //        case IAP24p99:
    //            payment  = [SKPayment paymentWithProductIdentifier:ProductID_IAP24p99];    //支付$29.99
    //            break;
    //        default:
    //            break;
    //    }
    if([myProduct count] == 0){
        return ;
    }
    payment = [SKPayment paymentWithProduct:[response.products objectAtIndex:0]];
    //   payment.quantity = quantity;
    NSLog(@"---------Request payment------------\n");
    [[SKPaymentQueue defaultQueue] addPayment:payment];
//    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
//    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
    // [request autorelease];
    
}
- (void)requestProUpgradeProductData:(NSString*)buyProductIDTag
{
    NSLog(@"------Request to upgrade product data---------\n");
    NSSet *productIdentifiers = [NSSet setWithObject:buyProductIDTag];
    SKProductsRequest* productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:productIdentifiers];
    productsRequest.delegate = self;
    [productsRequest start];
    
}

- (void)request:(SKRequest *)request didFailWithError:(NSError *)error
{
    NSLog(@"-------Show fail message----------\n");
    UIAlertView *alerView =  [[UIAlertView alloc] initWithTitle:NSLocalizedString(@"错误",NULL) message:[error localizedDescription]
                                                       delegate:nil cancelButtonTitle:NSLocalizedString(@"确定",nil) otherButtonTitles:nil];
    [alerView show];
    [alerView release];

}

-(void) requestDidFinish:(SKRequest *)request
{
    NSLog(@"----------Request finished--------------\n");
    
}

-(void) purchasedTransaction: (SKPaymentTransaction *)transaction
{
    NSLog(@"-----Purchased Transaction----\n");
    NSArray *transactions =[[NSArray alloc] initWithObjects:transaction, nil];
    [self paymentQueue:[SKPaymentQueue defaultQueue] updatedTransactions:transactions];
    [transactions release];
}

- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions
{
    NSLog(@"-----Payment result--------\n");
    for (SKPaymentTransaction *transaction in transactions)
    {
        if (transaction.transactionState == SKPaymentTransactionStatePurchased) {
            [self completeTransaction:transaction];
            NSLog(@"-----Transaction purchased--------\n");
            /*      UIAlertView *alerView =  [[UIAlertView alloc] initWithTitle:@"Congratulation"
             message:@"Transaction suceed!"
             delegate:nil cancelButt0onTitle:NSLocalizedString(@"Close",nil) otherButtonTitles:nil];
             
             [alerView show];
             [alerView release];
             */
            //NSData *data = transaction.transactionReceipt;
            //NSString *para = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            
            //                AppController* pController = (AppController*)[UIApplication sharedApplication].delegate;
            //                [pController payOK];
        }else if(transaction.transactionState == SKPaymentTransactionStateFailed){
            [self failedTransaction:transaction];
            NSLog(@"-----Transaction Failed--------\n");
            UIAlertView *alerView2 =  [[UIAlertView alloc] initWithTitle:@"提示"
                                                                 message:@"交易已取消"
                                                                delegate:nil cancelButtonTitle:NSLocalizedString(@"确定",nil) otherButtonTitles:nil];
            
            [alerView2 show];
            [alerView2 release];
        }
        else if(transaction.transactionState == SKPaymentTransactionStateRestored){
            [self restoreTransaction:transaction];
            [self payEndCallJsFail];
            NSLog(@"----- Already buy this product--------\n");
        }
        else if(transaction.transactionState == SKPaymentTransactionStateFailed){
            [self payEndCallJsFail];
            NSLog(@"----- Already buy this product--------\n");
        }else{
            
        }
    }
}

- (void) completeTransaction: (SKPaymentTransaction *)transaction
{
    NSLog(@"-----completeTransaction--------\n");
    // Your application should implement these two methods.
    NSString *product = transaction.payment.productIdentifier;
    // 购买验证
    NSURL *receiptUrl=[[NSBundle mainBundle] appStoreReceiptURL];
    NSData *transactionReceipt=[NSData dataWithContentsOfURL:receiptUrl];
//    BOOL re = transactionReceipt.environment;
    //将数据进行base64编码,这个方法是从别地方粘贴过来的
    NSDictionary *requestContents = @{
                                      @"receipt-data": [self encode:(uint8_t *)transactionReceipt.bytes length:transactionReceipt.length]};
    //将数据转换为json格式
    NSData *requestData = [NSJSONSerialization dataWithJSONObject:requestContents options:0 error:nil];
    //再转换为字符串,来发送请求
    NSString *dataString = [[NSString alloc] initWithData:requestData encoding:NSUTF8StringEncoding];
    NSLog(@"-----transactionReceipt--------》  = %@",transaction);
    
    if ([product length] > 0) {
        
        NSArray *tt = [product componentsSeparatedByString:@"."];
        NSString *bookid = [tt lastObject];
        if ([bookid length] > 0) {
            NSLog(@"bookid = %@",bookid);
            [self payEndCallJsSucess:dataString];
            [self recordTransaction:bookid];
            [self provideContent:bookid];
        }
    }
    
    // Remove the transaction from the payment queue.
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
    
}

//Base64编码
- (NSString *)encode:(const uint8_t *)input length:(NSInteger)length {
    static char table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    
    NSMutableData *data = [NSMutableData dataWithLength:((length + 2) / 3) * 4];
    uint8_t *output = (uint8_t *)data.mutableBytes;
    
    for (NSInteger i = 0; i < length; i += 3) {
        NSInteger value = 0;
        for (NSInteger j = i; j < (i + 3); j++) {
            value <<= 8;
            
            if (j < length) {
                value |= (0xFF & input[j]);
            }
        }
        
        NSInteger index = (i / 3) * 4;
        output[index + 0] =                    table[(value >> 18) & 0x3F];
        output[index + 1] =                    table[(value >> 12) & 0x3F];
        output[index + 2] = (i + 1) < length ? table[(value >> 6)  & 0x3F] : '=';
        output[index + 3] = (i + 2) < length ? table[(value >> 0)  & 0x3F] : '=';
    }
    
    return [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
}

-(void)recordTransaction:(NSString *)product
{
    NSLog(@"-----Record transcation--------\n");
    // Todo: Maybe you want to save transaction result into plist.
}

-(void)provideContent:(NSString *)product
{
    NSLog(@"-----Download product content--------\n");
}

- (void) failedTransaction: (SKPaymentTransaction *)transaction
{
    NSLog(@"Failed\n");
    if (transaction.error.code != SKErrorPaymentCancelled)
    {
        [self payEndCallJsFail];
    }else{
        [self payEndCallJsCancle];
    }
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}
-(void) paymentQueueRestoreCompletedTransactionsFinished: (SKPaymentTransaction *)transaction
{
    
}

- (void) restoreTransaction: (SKPaymentTransaction *)transaction
{
    NSLog(@"-----Restore transaction--------\n");
}

-(void) paymentQueue:(SKPaymentQueue *) paymentQueue restoreCompletedTransactionsFailedWithError:(NSError *)error
{
    NSLog(@"-------Payment Queue----\n");
}

#pragma mark connection delegate
- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    NSLog(@"%@\n",  [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease]);
}
- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    switch([(NSHTTPURLResponse *)response statusCode]) {
        case 200:
        case 206:
            break;
        case 304:
            break;
        case 400:
            break;
        case 404:
            break;
        case 416:
            break;
        case 403:
            break;
        case 401:
        case 500:
            break;
        default:
            break;
    }
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    NSLog(@"test\n");
}

-(void)dealloc
{
    [super dealloc];
}


+(void) payInIap:(NSString *)paycode andOrderID:(NSString *)orderID{
    NSLog(@" ---------call iap start");
    // buyHandlerID = (int)[[dict objectForKey:@"callBack"] integerValue];  // lua传输过来的回调lua的方法名  取inergerValue
    // NSString *paycode = [dict objectForKey:@"payid"];
    
    NSLog(@" paycode   %@", paycode);
    
    // NSString * orderID =[dict objectForKey:@"orderID"];
    NSLog(@"orderID   %@", orderID);
    
    
    if ([SKPaymentQueue canMakePayments]){
        [[CBiOSStoreManager sharedInstance] buy:paycode
                                       quantity:1
                                        orderid:orderID
                                         amount:@"1"
         ];
    }
    
    NSLog(@"call iap end");
}



-(void)payEndCallJsSucess:(NSString *)reciptStr{
     NSLog(@"jsCallStr = %s", [reciptStr UTF8String]);
    const char* re = [reciptStr UTF8String];
    std::string jsCallStr = cocos2d::StringUtils::format("window.iosSdkLogic.iosBuySucess(\'%s\');", re);
    NSLog(@"jsCallStr = %s", jsCallStr.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
    // if (buyHandlerID != 0){
    //     const char* re = [_buyProductIDTag UTF8String];
    //
    //     cocos2d::LuaBridge::pushLuaFunctionById(buyHandlerID); //压入需要调用的方法id
    //     cocos2d::LuaStack *stack = cocos2d::LuaBridge::getStack();  //获取lua栈
    //     stack->pushString("sucess");  //将需要传递给lua层的参数通过栈传递
    //     stack->pushString(re);  //将需要传递给lua层的参数通过栈传递
    //     stack->executeFunction(2);  //共有1个参数 (“oc传递给lua的参数”)，这里传参数 1
    //     cocos2d::LuaBridge::releaseLuaFunctionById(buyHandlerID); //最后记得释放
    //     buyHandlerID = 0;
    // }else {
    //     NSLog(@"you had used buyHandlerID do not try use again!!!");
    // }
}

-(void)payEndCallJsCancle{
    std::string jsCallStr ="window.iosSdkLogic&&window.iosSdkLogic.iosBuyFail();";
    NSLog(@"jsCallStr = %s", jsCallStr.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
}

-(void)payEndCallJsFail{
    std::string jsCallStr ="window.iosSdkLogic&&window.iosSdkLogic.iosBuyCancle();";
    NSLog(@"jsCallStr = %s", jsCallStr.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
}

@end
