//
//  CBiOSStoreManager.h
//  durak
//
//  Created by Aliens on 2017/6/9.
//
//

#import <UIKit/UIKit.h>
#import <StoreKit/StoreKit.h>
#import "cocos2d.h"

@interface CBiOSStoreManager : NSObject<SKProductsRequestDelegate,SKPaymentTransactionObserver>
{
    int buyType;
    NSString* _buyProductIDTag;
    NSString* orderId;
    NSString* amount;
    int quantity;
}

+ (CBiOSStoreManager*) sharedInstance;

- (void) buy:(NSString*)buyProductIDTag quantity:(int)quilty orderid:(NSString *)orderId amount:(NSString *)amt;

- (bool) CanMakePay;
- (void) initialStore;
- (void) releaseStore;
- (void) requestProductData:(NSString*)buyProductIDTag;
- (void) provideContent:(NSString *)product;
- (void) recordTransaction:(NSString *)product;

- (void) requestProUpgradeProductData:(NSString*)buyProductIDTag;
- (void) paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions;
- (void) purchasedTransaction: (SKPaymentTransaction *)transaction;
- (void) completeTransaction: (SKPaymentTransaction *)transaction;
- (void) failedTransaction: (SKPaymentTransaction *)transaction;
- (void) paymentQueueRestoreCompletedTransactionsFinished: (SKPaymentTransaction *)transaction;
- (void) paymentQueue:(SKPaymentQueue *) paymentQueue restoreCompletedTransactionsFailedWithError:(NSError *)error;
- (void) restoreTransaction: (SKPaymentTransaction *)transaction;
+ (void) payInIap:(NSString *)paycode andOrderID:(NSString *)orderID;
-(void)payEndCallJsSucess:(NSString *)reciptStr;
-(void)payEndCallJsCancle;
-(void)payEndCallJsFail;
//- (void) netWaiting;
//- (void) removeWaiting;
@end
