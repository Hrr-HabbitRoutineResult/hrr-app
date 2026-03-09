import AppsFlyerLib
import KakaoSDKAuth
import KakaoSDKCommon
import NaverThirdPartyLogin
import RNBootSplash
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // 카카오 SDK 초기화
    if let kakaoAppKey = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String {
      KakaoSDK.initSDK(appKey: kakaoAppKey)
      #if DEBUG
        print("[AppDelegate] 카카오 SDK 초기화 완료")
      #endif
    } else {
      #if DEBUG
        print("[AppDelegate] KAKAO_APP_KEY를 찾을 수 없습니다!")
      #endif
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "HrrApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // URI scheme 딥링크 처리
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // AppsFlyer URI scheme 딥링크 트래킹
    AppsFlyerLib.shared().handleOpen(url, options: options)

    // 카카오 로그인 리다이렉트 처리
    if AuthApi.isKakaoTalkLoginUrl(url) {
      if AuthController.handleOpenUrl(url: url) {
        return true
      }
    }

    // 네이버 로그인 핸들링 추가
    if url.scheme?.hasPrefix("com.umc.hrrapp") == true {
      NaverThirdPartyLoginConnection.getSharedInstance().receiveAccessToken(url)
      return true
    }

    // 그 외 딥링크는 React Native Linking 모듈이 처리하도록 함
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Link 처리
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    // AppsFlyer Universal Link 트래킹
    AppsFlyerLib.shared().continue(userActivity, restorationHandler: nil)  // restorationHandler는 nil로 전달 (Swift 타입 추론 ambiguous 에러 방지)

    if userActivity.activityType == NSUserActivityTypeBrowsingWeb {
      return RCTLinkingManager.application(
        application, continue: userActivity, restorationHandler: restorationHandler)
    }
    return false
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }

  override func customize(_ rootView: RCTRootView!) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }
}
