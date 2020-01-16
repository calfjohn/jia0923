package org.cocos2dx.javascript;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.HttpMethod;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.share.Sharer;
import com.facebook.share.model.ShareHashtag;
import com.facebook.share.model.ShareLinkContent;
import com.facebook.share.widget.ShareDialog;

import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import com.facebook.ads.*;

public class FBLogin {
    private Activity activity;
    private CallbackManager callbackManager;
    private ShareDialog shareDialog;
    private AccessToken accessToken;
    private List<String> permissions = Collections.<String>emptyList();
    private LoginManager loginManager;
    protected String userInfo;

    private static FBLogin mInstace = null;
    private static boolean bindFlag = false;
    private final String TAG = "lich-reward";
    private RewardedVideoAd rewardedVideoAd;
    private static boolean isGotReward = false;

    public static FBLogin getInstance() {
        if (null == mInstace){
            mInstace = new FBLogin();
        }
        return mInstace;
    }

    public void init(Activity activity) {
        this.activity = activity;
        //初始化facebook登录服务
        callbackManager = CallbackManager.Factory.create();

        LoginManager.getInstance().registerCallback(callbackManager,
                new FacebookCallback<LoginResult>() {
                    @Override
                    public void onSuccess(LoginResult loginResult) {
                        accessToken = loginResult.getAccessToken();
                        getLoginInfo(accessToken);
                    }

                    @Override
                    public void onCancel() {
                        evalString("loginFaceBookResultFail","");
                    }

                    @Override
                    public void onError(FacebookException exception) {
                        System.out.print(exception.getMessage());
                        evalString("loginFaceBookResultFail","");
                    }
                });

//        permissions = Arrays.asList("email","public_profile","user_friends");
        permissions = Arrays.asList("email","public_profile");
        shareDialog = new ShareDialog(activity);
        // this part is optional
        shareDialog.registerCallback(callbackManager, new FacebookCallback<Sharer.Result>() {
            public void onSuccess(Sharer.Result result) {
                evalString("shareActionSucess","");
            }
            @Override
            public void onCancel() {
                evalString("shareActionFail","");
//                finish();
            }

            @Override
            public void onError(FacebookException error) {
                evalString("shareActionFail","");
//                finish();
            }
        });
        AudienceNetworkAds.initialize(activity);
        loadReward();
    }

    private void loadReward(){
        rewardedVideoAd = new RewardedVideoAd(activity, "294079314792887_294079914792827");
        rewardedVideoAd.setAdListener(new RewardedVideoAdListener() {
            @Override
            public void onError(Ad ad, AdError error) {
                // Rewarded video ad failed to load
                Log.e(TAG, "Rewarded video ad failed to load: " + error.getErrorMessage());
                evalString("showRewardVideoFail","");
            }

            @Override
            public void onAdLoaded(Ad ad) {
                // Rewarded video ad is loaded and ready to be displayed
                Log.d(TAG, "Rewarded video ad is loaded and ready to be displayed!");
            }

            @Override
            public void onAdClicked(Ad ad) {
                // Rewarded video ad clicked
                Log.d(TAG, "Rewarded video ad clicked!");
            }

            @Override
            public void onLoggingImpression(Ad ad) {
                // Rewarded Video ad impression - the event will fire when the
                // video starts playing
                Log.d(TAG, "Rewarded video ad impression logged!");
            }

            @Override
            public void onRewardedVideoCompleted() {
                // Rewarded Video View Complete - the video has been played to the end.
                // You can use this event to initialize your reward
                Log.d(TAG, "Rewarded video completed!");
                evalString("showRewardVideoSecuess","");
                isGotReward = true;
                // Call method to give reward
                // giveReward();
            }

            @Override
            public void onRewardedVideoClosed() {
                // The Rewarded Video ad was closed - this can occur during the video
                // by closing the app, or closing the end card.
                Log.d(TAG, "Rewarded video ad closed!");
                if (isGotReward){
                    mInstace.destroyItem();
                    mInstace.loadReward();
                    isGotReward = false;
                }
            }
        });
        rewardedVideoAd.loadAd();
    }

    /**
     * 登录
     */
    public void login() {
        boolean reLogin = true;
        bindFlag = false;
        if (this.isLoggedIn()){
            reLogin = false;
            AccessToken accessToken = AccessToken.getCurrentAccessToken();
            this.getLoginInfo(accessToken);
        }
        if (reLogin){
            getLoginManager().logInWithReadPermissions(activity, permissions);
        }
    }
    /**
     * 绑定
     */
    public void bindFaceBook() {
        boolean reLogin = true;
        bindFlag = true;
        if (this.isLoggedIn()){
            reLogin = false;
            AccessToken accessToken = AccessToken.getCurrentAccessToken();
            this.getLoginInfo(accessToken);
        }
        if (reLogin){
            getLoginManager().logInWithReadPermissions(activity, permissions);
        }
    }

    public void destroyItem(){
        if (rewardedVideoAd != null) {
            rewardedVideoAd.destroy();
            rewardedVideoAd = null;
        }
    }


    /**
     * 退出
     */
    public void logout() {
        getLoginManager().logOut();
    }

    /**
     * 获取登录信息
     *
     * @param accessToken
     */
    public void getLoginInfo(AccessToken accessToken) {
        GraphRequest request = GraphRequest.newMeRequest(accessToken, new GraphRequest.GraphJSONObjectCallback() {
            @Override
            public void onCompleted(final JSONObject object, GraphResponse response) {
                if (object != null) {
                    String id = object.optString("id");   //比如:521390978242842
                    String name = object.optString("name");  //比如：Fu Bao
                    String gender = object.optString("gender");  //性别：比如 male （男）  female （女）
                    String emali = object.optString("email");  //邮箱：比如：bt0951@gmail.com

                    //获取用户头像
                    JSONObject object_pic = object.optJSONObject("picture");
                    JSONObject object_data = object_pic.optJSONObject("data");
                    String photo = object_data.optString("url");

                    //获取地域信息
                    String locale = object.optString("locale");   //zh_CN 代表中文简体
//                    showToast("success!");

                    if (bindFlag){
                        evalString("bindFbAccountSecuess", id);
                    }else{
                        final String re = id + '|' + photo + '|' + name;
                        evalString("loginFaceBookResultSucess", re);
                    }

                }
            }
        });

        Bundle parameters = new Bundle();

        parameters.putString("fields", "id,name,link,gender,email,picture,first_name,last_name");
        request.setParameters(parameters);
        request.executeAsync();

//        this.getFriend();
    }

    public boolean isLoggedIn() {
        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        boolean isLoggedIn = accessToken != null && !accessToken.isExpired();
        return isLoggedIn;
    }

    /**
     * * 获取loginMananger
     * * @return
     */
    private LoginManager getLoginManager() {
        if (loginManager == null) {
            loginManager = LoginManager.getInstance();
        }
        return loginManager;
    }

    public CallbackManager getCallbackManager() {
        return callbackManager;
    }

    private void evalString(String evnName, String re) {
        final String info = "window.androidLogic && window.androidLogic."+evnName+"(\'"+re+"\');";
        System.out.print(info);
        Cocos2dxHelper.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString(info);
            }
        });
    }

    public void Share(final String url,final String content){
        if (ShareDialog.canShow(ShareLinkContent.class)) {
            ShareLinkContent linkContent = new ShareLinkContent.Builder()
                    .setContentUrl(Uri.parse(url))
                    .build();
            shareDialog.show(linkContent);
        }else{
            System.out.print("调用分享失败");
            evalString("shareActionFail","");
        }
    }

    public void getFriend(){
        if (bindFlag) return;//NOTE 如果是绑定的行为 就不要去问fb好友了
        new GraphRequest(AccessToken.getCurrentAccessToken(), "/me/friends?fields=id,name,picture{url}", null, HttpMethod.GET, new GraphRequest.Callback() {
            @Override
            public void onCompleted(GraphResponse response) {

                JSONObject json = response.getJSONObject();
                JSONArray dataList = json.optJSONArray("data");
                JSONArray mineList = new JSONArray();
                for (int i = 0; i < dataList.length(); i++) {
                    try {
                        JSONObject object = dataList.getJSONObject(i);
                        String id = object.optString("id");   //比如:521390978242842
                        String name = object.optString("name");  //比如：Fu Bao
                        //获取用户头像
                        JSONObject object_pic = object.optJSONObject("picture");
                        JSONObject object_data = object_pic.optJSONObject("data");
                        String photo = object_data.optString("url");
                        JSONObject jsonInfo = new JSONObject();
                        jsonInfo.put("id",id);
                        jsonInfo.put("name",name);
                        jsonInfo.put("picUrl",photo);
                        mineList.put(jsonInfo);
                    }catch (JSONException e){

                    }
                }
                String jsonStr = mineList.toString();
                String  base64Token = "";
                try {
                    byte[] byts ;
                    byts = jsonStr.getBytes("UTF-8");
                    base64Token = Base64.encodeToString(byts, Base64.NO_WRAP);
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
                evalString("getFbFriendInfos",base64Token);
            }
        }).executeAsync();
    }

    public void showReward(){
        // Check if rewardedVideoAd has been loaded successfully
        if(rewardedVideoAd == null || !rewardedVideoAd.isAdLoaded()) {
            if (!rewardedVideoAd.isAdLoaded()){
                Log.d(TAG, "not loaded");
            }
            evalString("showRewardVideoFail","");
            return;
        }
        // Check if ad is already expired or invalidated, and do not show ad if that is the case. You will not get paid to show an invalidated ad.
        if( rewardedVideoAd.isAdInvalidated()) {
            evalString("showRewardVideoFail","");
            return;
        }
        rewardedVideoAd.show();
    }

    public interface FacebookListener {

        void facebookLoginSuccess();

        void facebookLoginFail();

    }

    private void showToast(CharSequence text) {
//        Context context = getApplicationContext();
//        int duration = Toast.LENGTH_SHORT;
//        Toast toast = Toast.makeText(context, text, duration);
//        toast.show();
    }
}
