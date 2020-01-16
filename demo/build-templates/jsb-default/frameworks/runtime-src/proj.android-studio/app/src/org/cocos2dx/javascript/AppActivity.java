/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import com.adjust.sdk.AdjustEvent;
import com.adjust.sdk.LogLevel;
import com.android.trivialdrivesample.util.IabHelper;
import com.android.trivialdrivesample.util.IabResult;
import com.android.trivialdrivesample.util.Inventory;
import com.android.trivialdrivesample.util.Purchase;
import com.android.trivialdrivesample.util.SkuDetails;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.api.GoogleApiClient;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.SharedPreferences;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.telephony.TelephonyManager;

import org.cocos2dx.javascript.SDKWrapper;
import org.cocos2dx.javascript.FBLogin;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.util.Log;
import android.view.WindowManager;

import com.adjust.sdk.Adjust;
import com.adjust.sdk.AdjustConfig;

public class AppActivity extends Cocos2dxActivity {
    public static AppActivity mContext = null;
    private IabHelper mHelper;
    String base64EncodedPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoiYy4PE7TtwiYZ1d+PWVbUJVRPRzDI3OC6jm3bmTHSs3JASWZQ7V9vPxd7Fst187Kqdy09te5qVo3EhSyOzUlnPX80kBxqMD7ghxgeTQXPeKsscjTS2h7IlFsrMJMqRQUqxsxdMDSLiEfqqKmisQsxeliX8VqWsfu2K47Fme4J+8D7DStI2XMQvv8cdP1U9Bg9jT96S3zclxztS/AWnBubexqmSbMEU0cTwUM2unBJ++u/UzyZ7y3uT3VZNLrzQPefImY7/V+a/u/+ixOdsO0RbtXVceYC70MX4o2GC5InHM9jWmCLaL2La0QtECRMDt0lG4BFoCRjjYjOttlJfZfwIDAQAB";
    /**
     * Google是否初始化成功：
     */
    boolean iap_is_ok = false;
    /**
     * Google支付需要的
     * 购买产品的id
     */
    static String purchaseId = "product1";
    // (arbitrary) request code for the purchase flow
    //购买请求回调requestcode
    static final int RC_REQUEST = 1001;

    GoogleApiClient mGoogleApiClient;

    private static final int RC_SIGN_IN = 9001;

    boolean googleserviceFlag = true;

    private boolean bindGoogleFlag = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            // Android launched another instance of the root activity into an existing task
            //  so just quietly finish and go away, dropping the user back into the activity
            //  at the top of the stack (ie: the last state of this task)
            // Don't need to finish it again since it's finished in super.onCreate .
            return;
        }
        // DO OTHER INITIALIZATION BELOW
        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = googleApiAvailability.isGooglePlayServicesAvailable(this);
        if(resultCode != ConnectionResult.SUCCESS) {
            if(googleApiAvailability.isUserResolvableError(resultCode)) {
                googleApiAvailability.getErrorDialog(this, resultCode, 2404).show();//2404
            }
            googleserviceFlag = false;
        }
        if(googleserviceFlag == false){
            return;
            //说明不支持google服务
        }else{
            // Configure sign-in to request the user's ID, email address, and basic profile. ID and
            // basic profile are included in DEFAULT_SIGN_IN.
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestEmail()
                    .build();

            // Build a GoogleApiClient with access to GoogleSignIn.API and the options above.
            mGoogleApiClient = new GoogleApiClient.Builder(this)
                    //.enableAutoManage(this, this)
                    .addApi(Auth.GOOGLE_SIGN_IN_API, gso)
                    .build();


            // Create the helper, passing it our context and the public key to verify signatures with
            Log.d("google-sdk", "Creating IAB helper.");
            mHelper = new com.android.trivialdrivesample.util.IabHelper(this, base64EncodedPublicKey);
            mHelper = new IabHelper(this, base64EncodedPublicKey);
            // enable debug logging (for a production application, you should set this to false).
            mHelper.enableDebugLogging(false);
            mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
                public void onIabSetupFinished(IabResult result) {
                    if (!result.isSuccess()) {
                        // Oh noes, there was a problem.
                        Log.d("google-sdk", "Problem setting up in-app billing:初始化失败 " + result);
                        return;
                    }
                    if (mHelper == null) return;
                    iap_is_ok = true;
                    // IAB is fully set up. Now, let's getan inventory of stuff we own.
                    mHelper.queryInventoryAsync(mGotInventoryListener);
                }
            });
        }
        //init ajust
        String appToken = "enf8qfpbzd34";
        String environment = AdjustConfig.ENVIRONMENT_PRODUCTION; //AdjustConfig.ENVIRONMENT_PRODUCTION; AdjustConfig.ENVIRONMENT_SANDBOX;
        AdjustConfig config = new AdjustConfig(this, appToken, environment);
        config.setAppSecret(1, 5353331, 953367510, 1723494830, 170907018);
        config.setLogLevel(LogLevel.SUPRESS);// TODO: 2018/12/12 正式发布修改为log等级 https://github.com/adjust/android_sdk/blob/master/doc/chinese/README.md
        Adjust.onCreate(config);

        this.mContext = this;

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        SDKWrapper.getInstance().init(this);
        FBLogin.getInstance().init(this);
    }

    // Listener that's called when we finish querying the items and subscriptions we own  查询所有的产品
    IabHelper.QueryInventoryFinishedListener mGotInventoryListener = new IabHelper.QueryInventoryFinishedListener() {
        public void onQueryInventoryFinished(IabResult result, Inventory inventory) {

            // Have we been disposed of in the meantime? If so, quit.
            if (mHelper == null) return;

            // Is it a failure?
            if (result.isFailure()) {
                Log.d("google-sdk", "查询库存失败: " + result);
                return;
            }
            // 因为SKU_GAS是可重复购买的产品，查询我们的已购买的产品，
            // 如果当中有SKU_GAS，我们应该立即消耗它，以方便下次可以重复购买。
            SkuDetails skuDetails = inventory.getSkuDetails(purchaseId);//是否购买的非消耗品
            if (skuDetails != null) {
                System.out.println("skuDetails my:" + skuDetails);
            }
            Purchase gasPurchase = inventory.getPurchase(purchaseId);
            if (gasPurchase != null && verifyDeveloperPayload(gasPurchase)) {
                Log.d("google-sdk", "属于SKU_GAS");
                System.out.println("属于SKU_GAS");
                mHelper.consumeAsync(gasPurchase, new IabHelper.OnConsumeFinishedListener() {
                    @Override
                    public void onConsumeFinished(Purchase purchase, IabResult result) {
                    }
                });
                return;
            }
        }

    };

    /*
    谷歌支付  lua调用
     */
    public static void buyGoogleGood(final String produceID, final String orderID) {
        purchaseId = produceID;
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mContext.toBuyGooglepay(orderID);
            }
        });

    }

    /**
     * 去购买Google产品
     * purchaseId  Google产品id
     */
    private void toBuyGooglepay(String orderID) {
        // launch the gas purchase UI flow.
        // We will be notified of completion via mPurchaseFinishedListener

        String payload = orderID;
        try {
            mHelper.launchPurchaseFlow(this, purchaseId, RC_REQUEST, mPurchaseFinishedListener, payload);
        } catch (Exception e) {
            final String re = purchaseId;
            mContext.callJsFunc("googleBuyFail",re);
        }
    }

    // Callback for when a purchase is finished购买完成的回调
    IabHelper.OnIabPurchaseFinishedListener mPurchaseFinishedListener = new IabHelper.OnIabPurchaseFinishedListener() {
        public void onIabPurchaseFinished(final IabResult result, Purchase purchase) {
            Log.d("google-sdk", "Purchase finished: " + result + ", purchase: " + purchase);
            // if we were disposed of in the meantime, quit.
            if (mHelper == null) return;

            int response = result.getResponse();
            System.out.println("You  response : " + response);
            if (result.isFailure()) {
                Log.d("google-sdk", "Error purchasing: " + result);
                return;
            }
            if (!verifyDeveloperPayload(purchase)) {
                Log.d("google-sdk", "Error purchasing. Authenticity verification failed.");
                return;
            }

            //购买完成时候就能获取到订单的详细信息：purchase.getOriginalJson(),要是想要什么就去purchase中get
            //根据获取到产品的Id去判断是哪一项产品
            if (purchase.getSku().equals(purchaseId)) {

                Log.d("google-sdk", "购买的是" + purchase.getSku());

                //购买完成之后去消耗产品
                mHelper.consumeAsync(purchase, new IabHelper.OnConsumeFinishedListener() {
                    @Override
                    public void onConsumeFinished(Purchase purchase, IabResult result) {
                    }
                });
            }
        }
    };

    /**
     * Verifies the developer payload of a purchase.
     */
    boolean verifyDeveloperPayload(Purchase p) {
        String payload = p.getDeveloperPayload();

        return true;
    }

    //google login
    public static void googleLogin(final String str) {
        if (mContext.googleserviceFlag){
            mContext.bindGoogleFlag = false;
            mContext.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mContext.googleLogin();
                }
            });
        }else{
            mContext.callJsFunc("loadGoogleResultFail","");
        }
    }

    //google bingGoogle
    public static void bingGoogle(final String str) {
        if (mContext.googleserviceFlag){
            mContext.bindGoogleFlag = true;
            mContext.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mContext.googleLogin();
                }
            });
        }else{
            mContext.callJsFunc("loadGoogleResultFail","");
        }
    }

    //guide login
    public static void guideLogin(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                final String ip = getDeviceId(mContext);
                mContext.callJsFunc("loadGuideSucess",ip);
            }
        });
    }

    //获取mac地址
    public static String macaddress(Context ctx) {
        WifiManager wifi = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
        if(wifi == null) return "00:00:00:00:00:00";
        WifiInfo info = wifi.getConnectionInfo();
        if(info == null) return "00:00:00:00:00:00";
        return info.getMacAddress();
    }

    /**
	* deviceID的组成为：渠道标志+识别符来源标志+hash后的终端识别符
	*
	* 渠道标志为：
	* 1，andriod（a）
	*
	* 识别符来源标志：
	* 1， wifi mac地址（wifi）；
	* 2， IMEI（imei）；
	* 3， 序列号（sn）；
	* 4， id：随机码。若前面的都取不到时，则随机生成一个随机码，需要缓存。
	*
	* @param context
	* @return
	*/
	public static String getDeviceId(Context context)
	{
		StringBuilder deviceId = new StringBuilder();
		// 渠道标志
		//deviceId.append("a");

		try {
			//wifi mac地址

			/*WifiManager wifi = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
			WifiInfo info = wifi.getConnectionInfo();
			String wifiMac = info.getMacAddress();
			if(wifiMac != null && wifiMac.length() > 0)
			{
				deviceId.append("wifi");
				deviceId.append(wifiMac);
				Log.e("getDeviceId : ", deviceId.toString());
				return deviceId.toString();
			}*/

			String macAdd = getMacAddress(context);
			if(macAdd != "00:00:00:00:00:00")
			{
				//deviceId.append("wifi");
				deviceId.append(macAdd);
				Log.e("getDeviceId : ", deviceId.toString());
				return deviceId.toString();
			}

			//IMEI（imei）
			TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
			String imei = tm.getDeviceId();
			if(imei != null && imei.length() > 0)
			{
				deviceId.append("imei");
				deviceId.append(imei);
				Log.e("getDeviceId : ", deviceId.toString());
				return deviceId.toString();
			}

			//序列号（sn）
			String sn = tm.getSimSerialNumber();
			if(sn != null && sn.length() > 0)
			{
				deviceId.append("sn");
				deviceId.append(sn);
				Log.e("getDeviceId : ", deviceId.toString());
				return deviceId.toString();
			}

			//如果上面都没有， 则生成一个id：随机码
			String uuid = getUUID(context);
			if(uuid != null && uuid.length() > 0)
			{
				deviceId.append("id");
				deviceId.append(uuid);
				Log.e("getDeviceId : ", deviceId.toString());
				return deviceId.toString();
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
			deviceId.append("id").append(getUUID(context));
		}

		Log.e("getDeviceId : ", deviceId.toString());

		return deviceId.toString();
	}

    /**
	 * @brief 获取Mac地址
	 */
	public static String getMacAddress(Context ctx)
	{
		if (ctx == null) return "00:00:00:00:00:00";
		//final WifiManager wm = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
		//if( wm == null )return "00:00:00:00:00:00";
		//WifiInfo info= wm.getConnectionInfo();
		//if(info == null) return "00:00:00:00:00:00";
		//String macAddress =info.getMacAddress();
		//if( macAddress == null )
		//{
		//	if( wm.isWifiEnabled() == false )
		//	{
		//		java.lang.System.out.println( "wifi enable false");
		//
		//		/*wm.setWifiEnabled(true);
		//		for(int i=0;i<10;i++)
		//		{
		//			java.lang.System.out.println( "Try Times:" + i );
		//			WifiInfo _info = wm.getConnectionInfo();
		//			macAddress = _info.getMacAddress();
		//			if(macAddress!=null) break;
		//			try {
		//				Thread.sleep(500);
		//			} catch (InterruptedException e) {
		//				e.printStackTrace();
		//			}
		//        }*/
		//	}
		//}


		 try {
		        String interfaceName = "wlan0";
		        List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
		        for (NetworkInterface intf : interfaces) {
		            if (!intf.getName().equalsIgnoreCase(interfaceName)){
		                continue;
		            }

		            byte[] mac = intf.getHardwareAddress();
		            if (mac==null){
		                return "00:00:00:00:00:00";
		            }

		            StringBuilder buf = new StringBuilder();
		            for (byte aMac : mac) {
		                buf.append(String.format("%02X:", aMac));
		            }
		            if (buf.length()>0) {
		                buf.deleteCharAt(buf.length() - 1);
		            }

		            String macAddress = buf.toString();
		            java.lang.System.out.println( "****mac:***********" );
		    		if( macAddress != null )
		    		{
		    			java.lang.System.out.println( macAddress );
		    		    return	determineMAC(macAddress, ctx);
		    		}

		            return macAddress;
		        }
		    } catch (Exception ex) { } // for now eat exceptions
		java.lang.System.out.println( "mac: null" );
		return "00:00:00:00:00:00";
	}

    public static String determineMAC(String macAddress, Context ctx)
	{
		if (macAddress.equals("00:DA:36:16:DE:EB") || macAddress.equals("00:90:4C:C5:12:38") ||
			macAddress.equals("00:90:4C:C5:00:34") || macAddress.equals("00:11:22:33:44:55") ||
			macAddress.equals("00:00:00:00:00:00") || macAddress.equals("08:00:28:12:34:56") ||
			macAddress.equals("88:f4:88:00:00:01") || macAddress.equals("DE:FA:CE:DE:FA:CE") ||
			macAddress.equals("08:00:28:12:03:58") || macAddress.equals("00:08:22:ba:b3:fb") ||
			macAddress.equals("38:16:d1:85:d0:a0") || macAddress.equals("38:AA:3C:08:EA:55") ||
			macAddress.equals("10:A5:F1:83:C0:A0"))
		{
			java.lang.System.out.println( "**********MAC Repeat********!!" );

			String imeistring = null;
			TelephonyManager telephonyManager;
			telephonyManager = (TelephonyManager) ctx.getSystemService(Context.TELEPHONY_SERVICE);
			imeistring = telephonyManager.getSimSerialNumber();
			if (imeistring != null)
			{
				java.lang.System.out.println( "Use IMEI!!" );
				return imeistring;
			}
			else
			{
				return macAddress;
			}
		}
		else
		{
			return macAddress;
		}
	}

    /**
    * 寰楀埌鍏ㄥ眬鍞竴UUID
    */
    @SuppressLint("CommitPrefEdits")
    public static String getUUID(Context context)
    {
        String uuid = "";
        SharedPreferences mShare = context.getSharedPreferences("sysCacheMap", 0);
        if(mShare != null)
        {
            uuid = mShare.getString("uuid", "");
        }

        if(uuid == null || uuid.length() <= 0)
        {
            uuid = UUID.randomUUID().toString();
            SharedPreferences.Editor editor = mShare.edit();
            editor.putString("uuid", uuid);
        }

        Log.e("getUUID", "getUUID : " + uuid);
        return uuid;
    }

    private void googleLogin() {
        Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(mGoogleApiClient);
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    //fbLogin login
    public static void fbLogin(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mContext.loginFb();
            }
        });
    }

    private void loginFb(){
        FBLogin.getInstance().login();
    }
    //fbLogin bindFaceBook
    public static void bindFaceBook(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mContext.bindFaceBook();
            }
        });
    }

    private void bindFaceBook(){
        FBLogin.getInstance().bindFaceBook();
    }


    //fbLogin login
    public static void fbLogout(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mContext.logoutFb();
            }
        });
    }
    private void logoutFb(){
        FBLogin.getInstance().logout();
    }

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView);

        return glSurfaceView;
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.getInstance().onResume();
        Adjust.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.getInstance().onPause();
        Adjust.onPause();
    }

    @Override
    protected void onDestroy() {
        FBLogin.getInstance().destroyItem();
        super.onDestroy();
        SDKWrapper.getInstance().onDestroy();
        if (mHelper != null) {
            try {
                mHelper.dispose();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        mHelper = null;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        FBLogin.getInstance().getCallbackManager().onActivityResult(requestCode, resultCode, data);
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.getInstance().onActivityResult(requestCode, resultCode, data);

        // Result returned from launching the Intent from
        //   GoogleSignInApi.getSignInIntent(...);
        if (requestCode == RC_SIGN_IN) {
            super.onActivityResult(requestCode, resultCode, data);
            GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(data);
            if (result.isSuccess()) {

                GoogleSignInAccount acct = result.getSignInAccount();
                // Get account information
                String mFullName = acct.getDisplayName();
                String mEmail = acct.getEmail();
                String id = acct.getId();
                Uri url = acct.getPhotoUrl();
                String urlStr = "";
                if (url != null)
                    urlStr = url.toString();

                if (mContext.bindGoogleFlag){
                    final String userID = id;
                    mContext.callJsFunc("bindGoogleAccountSecuess",userID);
                }else{
                    final String re = id + '|' + urlStr + '|' + mFullName;
                    mContext.callJsFunc("loadGoogleResultSucess",re);
                }
            } else {
                mContext.callJsFunc("loadGoogleResultFail","");
            }
        }

        if (mHelper == null) return;
        // Pass on the activity result to the helper for handling

        try {
            if (!mHelper.handleActivityResult(requestCode, resultCode, data)) {
                // not handled, so handle it ourselves (here's where you'd
                // perform any handling of activity results not related to in-app
                // billing...
                super.onActivityResult(requestCode, resultCode, data);
            } else {
                Log.d("google-sdk", "onActivityResult handled by IABUtil.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (requestCode == RC_REQUEST ) {
            if (null == data) {
                final String re = purchaseId;
                mContext.callJsFunc("googleBuyFail",re);
                return;
            }

            int responseCode = data.getIntExtra("RESPONSE_CODE", 0);
            //订单信息
            String purchaseData = data.getStringExtra("INAPP_PURCHASE_DATA");
            String dataSignature = data.getStringExtra("INAPP_DATA_SIGNATURE");

            if (resultCode == RESULT_OK) {

                try {
                    JSONObject jo = new JSONObject(purchaseData);
                    //订单Id
                    String sku = jo.getString("productId");

                    final String re = sku;
                    if (responseCode == IabHelper.BILLING_RESPONSE_RESULT_OK) {
                        final String re2 = sku + "*" + purchaseData + "*" + dataSignature;
                        mContext.callJsFunc("googleBuySucess",re2);
                    } else if (responseCode == IabHelper.BILLING_RESPONSE_RESULT_USER_CANCELED) {
                        mContext.callJsFunc("googleBuyCancle",re);
                    } else {
                        mContext.callJsFunc("googleBuyFail",re);
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                }
            } else {
                if (responseCode == IabHelper.BILLING_RESPONSE_RESULT_USER_CANCELED) {
                    mContext.callJsFunc("googleBuyCancle","");
                } else {
                    mContext.callJsFunc("googleBuyFail","");
                }
            }
        }
    }

    private void callJsFunc(final String funcName,final String re){
        mContext.runOnGLThread(new Runnable() {
            public void run() {
                final String info = "window.androidLogic && window.androidLogic."+funcName+"(\'"+re+"\');";
                Log.d("google-sdk", info);
                Cocos2dxJavascriptJavaBridge.evalString(info);
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.getInstance().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.getInstance().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.getInstance().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.getInstance().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.getInstance().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.getInstance().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.getInstance().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.getInstance().onStart();
        super.onStart();
    }

    //fbLogin login
    public static boolean copyBoard(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                //获取剪贴板管理器：
                ClipboardManager cm = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
                // 创建普通字符型ClipData
                ClipData mClipData = ClipData.newPlainText("Label", str);
                // 将ClipData内容放到系统剪贴板里。
                cm.setPrimaryClip(mClipData);
            }
        });
        return true;
    }

    //recored adjust
    public static void recoredForAdjust(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AdjustEvent event = new AdjustEvent(str);
                Adjust.trackEvent(event);
            }
        });
    }
	
	  //recored adjust
    public static void recoredForAdjustForMoney(final String str,final float money) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AdjustEvent event = new AdjustEvent(str);
                double moneyStr=Double.valueOf(String.valueOf(money));
                event.setRevenue(moneyStr, "USD");
                Adjust.trackEvent(event);
            }
        });
    }

    //recored shareAction
    public static void shareAction(final String str,final String content) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                FBLogin.getInstance().Share(str,content);
            }
        });
    }

    // showReward
    public static void showReward(final String str) {
        mContext.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                FBLogin.getInstance().showReward();
            }
        });
    }
}
