import RNBootSplash
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit
import KakaoSDKCommon
import KakaoSDKAuth

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
  
  // Deep link 처리 (앱이 실행 중일 때)
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // 카카오 SDK가 URL을 처리할 수 있도록 먼저 시도
    if AuthApi.isKakaoTalkLoginUrl(url) {
      if AuthController.handleOpenUrl(url: url) {
        return true
      }
    }
    
    // React Native Linking 모듈이 처리하도록 함
    return true
  }
  
  // Universal Link 처리
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
       let url = userActivity.webpageURL {
      // React Native Linking 모듈이 자동으로 처리
      return true
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
