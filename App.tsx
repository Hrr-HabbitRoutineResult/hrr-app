import { StatusBar, AppState, DeviceEventEmitter, Platform, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import BootSplash from 'react-native-bootsplash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './src/navigation/RootNavigator';
import { LOGOUT_EVENT } from './src/libs/auth/session';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import appsFlyer from 'react-native-appsflyer';
import Config from 'react-native-config';
import { navigate, setAuthReady } from './src/navigation/navigationRef';

// URL에서 query parameter 추출
function getQueryParam(url: string, param: string): string | null {
  const match = url.match(new RegExp(`[?&]${param}=([^&]*)`));
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function App() {
  useEffect(() => {
    let lastHandledChallenge: { id: number; handledAt: number } | null = null;

    const openChallenge = (rawChallengeId: string | number | undefined) => {
      const challengeId = Number(rawChallengeId);
      if (!Number.isSafeInteger(challengeId) || challengeId <= 0) return;

      // Android에서는 같은 링크가 Linking과 AppsFlyer 양쪽으로 전달될 수 있다.
      const now = Date.now();
      if (
        lastHandledChallenge?.id === challengeId &&
        now - lastHandledChallenge.handledAt < 1500
      ) {
        return;
      }

      lastHandledChallenge = { id: challengeId, handledAt: now };
      navigate('ChallengeProfile', { challengeId });
    };

    const handleIncomingUrl = (url: string) => {
      const deepLinkValue = getQueryParam(url, 'deep_link_value');
      const queryChallengeId = getQueryParam(url, 'deep_link_sub1');

      if (deepLinkValue === 'challenge' && queryChallengeId) {
        openChallenge(queryChallengeId);
        return;
      }

      // AppsFlyer의 af_dp 또는 직접 실행된 커스텀 스킴도 처리한다.
      const customSchemeMatch = url.match(
        /^(?:hrr|hrrapp):\/\/challenge\/(\d+)(?:[/?#]|$)/i,
      );
      if (customSchemeMatch) openChallenge(customSchemeMatch[1]);
    };

    // AppsFlyer UDL 리스너는 SDK 초기화 전에 등록해야 iOS/Android에서
    // cold start와 deferred deep link 이벤트를 모두 받을 수 있다.
    const removeAppsFlyerDeepLinkListener = appsFlyer.onDeepLink((res: any) => {
      if (__DEV__) console.log('AppsFlyer 딥링크 데이터 수신:', JSON.stringify(res));
      const value = res?.data?.deep_link_value;
      const challengeId = res?.data?.deep_link_sub1;

      if (value === 'challenge') openChallenge(challengeId);
    });

    // 앱 초기화 작업
    const init = async () => {
      try {
        // 앱이 종료된 상태에서 딥링크로 실행된 경우 처리
        const initialURL = await Linking.getInitialURL();
        if (initialURL) handleIncomingUrl(initialURL);

        // AppsFlyer SDK 초기화
        appsFlyer.initSdk(
          {
            devKey: Config.APPSFLYER_DEV_KEY,
            isDebug: __DEV__,
            appId: Config.APPSFLYER_APP_ID,
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
          },
          (result: unknown) => {
            if (__DEV__) console.log('AppsFlyer 초기화 성공:', result);
          },
          (error: unknown) => {
            if (__DEV__) console.error('AppsFlyer 초기화 실패:', error);
          }
        );

        // 기존 초기화 대기 로직
        await new Promise((resolve) => setTimeout(() => resolve(undefined), 2500));

      } catch (error) {
        console.error("초기화 프로세스 중 에러:", error);
      }
    };

    init().finally(() => {
      BootSplash.hide({ fade: true });
    });

    // 앱 실행 중 URI scheme/App Link 수신 처리 (iOS/Android 공통)
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      if (__DEV__) console.log('Linking url 수신:', url);
      handleIncomingUrl(url);
    });

    return () => {
      removeAppsFlyerDeepLinkListener();
      linkingSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={{ flex: 1 }}
          edges={Platform.OS === 'android' ? ['bottom'] : []}
        >
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <AppContent />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // 회원가입 직후 추천 온보딩을 보여줄지 여부
  const [showRecommendation, setShowRecommendation] = useState(false);
  // 온보딩 슬라이드를 이미 본 적 있는지 여부 (앱 삭제 후 재설치 시에만 초기화)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const appState = useRef(AppState.currentState);

  // 인증 상태 확인 함수
  const checkAuthStatus = async () => {
    try {
      const [[, accessToken], [, seenOnboarding]] = await AsyncStorage.multiGet([
        'accessToken',
        'hasSeenOnboarding',
      ]);
      setIsOnboardingComplete(!!accessToken);
      setHasSeenOnboarding(seenOnboarding === 'true');
    } catch {
      setIsOnboardingComplete(false);
      setHasSeenOnboarding(false);
    } finally {
      setIsCheckingAuth(false);
      setAuthReady();
    }
  };

  useEffect(() => {
    // 초기 인증 상태 확인
    checkAuthStatus();

    // 로그아웃 이벤트 리스너 (로그아웃 시 즉시 상태 업데이트)
    const logoutSubscription = DeviceEventEmitter.addListener(LOGOUT_EVENT, () => {
      setIsOnboardingComplete(false);
      setIsCheckingAuth(false);
    });

    // 앱 상태 변경 이벤트 리스너 (앱 실행 중일 때 인증 상태 확인)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkAuthStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      logoutSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  const handleOnboardingComplete = (showOnboarding = false) => {
    // 신규 유저인 경우 추천 온보딩 플래그 설정
    setShowRecommendation(showOnboarding);
    setIsOnboardingComplete(true);
  };

  // 인증 상태 확인 중에는 아무것도 렌더링하지 않고 스플래시 화면 유지
  if (isCheckingAuth) {
    return null;
  }

  return (
    <RootNavigator
      showRecommendation={showRecommendation}
      isAuthenticated={isOnboardingComplete}
      hasSeenOnboarding={hasSeenOnboarding}
    />
  );
}

export default App;
